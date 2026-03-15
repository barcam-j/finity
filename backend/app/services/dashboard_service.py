from calendar import monthrange
from datetime import date
from beanie import PydanticObjectId

from app.models.transaction import Transaction
from app.ai.adapter import get_ai_response


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
            'balance': 0.0,
            'top_category': None,
            'transaction_count': 0,
            'categories': [],
            'period_label': period_label,
            'last_import_date': None,
        }

    def is_investment(t: Transaction) -> bool:
        return (t.category or '').strip().lower() == 'inversión'

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(t.amount for t in transactions if t.amount < 0 and not is_investment(t))
    balance = total_income + total_expenses

    category_totals: dict[str, float] = {}
    for t in transactions:
        if t.amount < 0 and t.category and not is_investment(t):
            category_totals[t.category] = category_totals.get(t.category, 0) + abs(t.amount)

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
        'balance': round(balance, 2),
        'top_category': top_category,
        'transaction_count': len(transactions),
        'categories': categories,
        'period_label': period_label,
        'last_import_date': last_import_date,
    }


async def get_ai_analysis(user_id: PydanticObjectId) -> str:
    transactions = (
        await Transaction.find(Transaction.user_id == user_id)
        .sort(-Transaction.date)
        .limit(100)
        .to_list()
    )

    if not transactions:
        raise ValueError('No transactions available to analyze')

    lines = [
        f'{t.date} | {t.category or "Uncategorized"} | {t.amount:+.2f}'
        for t in transactions
    ]
    summary = '\n'.join(lines)

    prompt = f"""You are a personal finance assistant. Analyze the following transactions and provide:
1. A brief overall assessment (2-3 sentences)
2. Top 3 key insights about spending patterns
3. 2-3 actionable recommendations

Transactions (date | category | amount):
{summary}

Respond in a clear, friendly tone. Be specific with numbers where relevant. Keep the total response under 300 words."""

    return await get_ai_response(user_id, prompt)
