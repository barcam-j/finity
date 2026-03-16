import hashlib
from calendar import monthrange
from datetime import date
from beanie import PydanticObjectId

from app.models.transaction import Transaction
from app.models.analysis_cache import AnalysisCache
from app.ai.adapter import get_ai_response


def _transactions_hash(transactions: list) -> str:
    ids = sorted(str(t.id) for t in transactions)
    return hashlib.md5(''.join(ids).encode()).hexdigest()


async def get_available_months(user_id: PydanticObjectId) -> list[str]:
    transactions = await Transaction.find(Transaction.user_id == user_id).to_list()
    months = sorted({t.date.strftime('%Y-%m') for t in transactions}, reverse=True)
    return months


async def get_kpis(user_id: PydanticObjectId, period: str) -> dict:
    base_query = Transaction.find(Transaction.user_id == user_id)

    period_label: str | None = None

    if period == 'month':
        latest = await base_query.sort(-Transaction.date).first_or_none()
        if latest:
            d = latest.date
            _, last_day = monthrange(d.year, d.month)
            start = date(d.year, d.month, 1)
            end = date(d.year, d.month, last_day)
            query = base_query.find(Transaction.date >= start, Transaction.date <= end)
            period_label = start.strftime('%B %Y')
        else:
            query = base_query
    elif len(period) == 7 and period[4] == '-':
        year, month = int(period[:4]), int(period[5:])
        _, last_day = monthrange(year, month)
        start = date(year, month, 1)
        end = date(year, month, last_day)
        query = base_query.find(Transaction.date >= start, Transaction.date <= end)
        period_label = start.strftime('%B %Y')
    else:
        query = base_query

    transactions = await query.to_list()

    last_import_date: str | None = None
    if transactions:
        most_recent = max(transactions, key=lambda t: t.id.generation_time)
        last_import_date = most_recent.id.generation_time.date().isoformat()

    if not transactions:
        return {
            'total_income': 0.0,
            'total_expenses': 0.0,
            'total_investments': 0.0,
            'balance': 0.0,
            'balance_with_investments': 0.0,
            'investment_categories': [],
            'top_category': None,
            'transaction_count': 0,
            'categories': [],
            'period_label': period_label,
            'last_import_date': None,
        }

    _INVESTMENT_NAMES = {'inversión', 'inversion', 'inversiones', 'investment', 'investments'}

    def is_investment(t: Transaction) -> bool:
        return any(c.strip().lower() in _INVESTMENT_NAMES for c in t.categories)

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(t.amount for t in transactions if t.amount < 0 and not is_investment(t))
    total_investment = sum(abs(t.amount) for t in transactions if t.amount < 0 and is_investment(t))
    balance = total_income + total_expenses
    balance_with_investments = balance - total_investment

    investment_categories = sorted({
        c for t in transactions if is_investment(t) for c in t.categories
    })

    category_totals: dict[str, float] = {}
    for t in transactions:
        if t.amount < 0 and t.categories and not is_investment(t):
            for cat in t.categories:
                category_totals[cat] = category_totals.get(cat, 0) + abs(t.amount)

    total_spent = abs(total_expenses) or 1
    categories = sorted(
        [
            {
                'name': name,
                'total': round(total, 2),
                'percentage': round(total / total_spent * 100, 1),
            }
            for name, total in category_totals.items()
        ],
        key=lambda c: c['total'],
        reverse=True,
    )[:5]

    top_category = categories[0]['name'] if categories else None

    return {
        'total_income': round(total_income, 2),
        'total_expenses': round(abs(total_expenses), 2),
        'total_investments': round(total_investment, 2),
        'balance': round(balance, 2),
        'balance_with_investments': round(balance_with_investments, 2),
        'investment_categories': investment_categories,
        'top_category': top_category,
        'transaction_count': len(transactions),
        'categories': categories,
        'period_label': period_label,
        'last_import_date': last_import_date,
    }


LANGUAGE_NAMES = {'en': 'English', 'es': 'Spanish', 'it': 'Italian'}


async def get_ai_analysis(user_id: PydanticObjectId, month: str, language: str = 'en') -> str:
    year, mon = int(month[:4]), int(month[5:])
    _, last_day = monthrange(year, mon)
    start = date(year, mon, 1)
    end = date(year, mon, last_day)

    transactions = (
        await Transaction.find(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .sort(-Transaction.date)
        .to_list()
    )

    if not transactions:
        raise ValueError('No transactions available to analyze')

    current_hash = _transactions_hash(transactions) + f'_{language}'

    cached = await AnalysisCache.find_one(
        AnalysisCache.user_id == user_id,
        AnalysisCache.month == month,
    )
    if cached and cached.transactions_hash == current_hash:
        return cached.analysis

    lines = [
        f'{t.date} | {", ".join(t.categories) or "Uncategorized"} | {t.amount:+.2f}'
        for t in transactions
    ]
    summary = '\n'.join(lines)

    lang_name = LANGUAGE_NAMES.get(language, 'English')
    prompt = f"""You are a personal finance assistant. Analyze the following transactions and provide:
1. A brief overall assessment (2-3 sentences)
2. Top 3 key insights about spending patterns
3. 2-3 actionable recommendations

Transactions (date | category | amount):
{summary}

Respond in a clear, friendly tone. Be specific with numbers where relevant. Keep the total response under 300 words.
Respond in {lang_name}."""

    analysis = await get_ai_response(user_id, prompt)

    if cached:
        cached.analysis = analysis
        cached.transactions_hash = current_hash
        await cached.replace()
    else:
        await AnalysisCache(
            user_id=user_id,
            month=month,
            analysis=analysis,
            transactions_hash=current_hash,
        ).insert()

    return analysis
