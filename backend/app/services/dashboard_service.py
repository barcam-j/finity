from datetime import date
from beanie import PydanticObjectId

from app.models.transaction import Transaction
from app.ai.adapter import get_ai_response


async def get_kpis(user_id: PydanticObjectId, period: str) -> dict:
    query = Transaction.find(Transaction.user_id == user_id)

    if period == 'month':
        today = date.today()
        start_of_month = date(today.year, today.month, 1)
        query = query.find(Transaction.date >= start_of_month)

    transactions = await query.to_list()

    if not transactions:
        return {
            'total_income': 0.0,
            'total_expenses': 0.0,
            'balance': 0.0,
            'top_category': None,
            'transaction_count': 0,
        }

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(t.amount for t in transactions if t.amount < 0)
    balance = total_income + total_expenses

    category_totals: dict[str, float] = {}
    for t in transactions:
        if t.amount < 0 and t.category:
            category_totals[t.category] = category_totals.get(t.category, 0) + abs(t.amount)

    top_category = max(category_totals, key=lambda k: category_totals[k]) if category_totals else None

    return {
        'total_income': round(total_income, 2),
        'total_expenses': round(abs(total_expenses), 2),
        'balance': round(balance, 2),
        'top_category': top_category,
        'transaction_count': len(transactions),
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
