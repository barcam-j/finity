import json
import re
from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel

from app.ai.adapter import get_ai_response
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix='/importers/csv', tags=['importers'])


class TransactionItem(BaseModel):
    date: str
    amount: float
    description: str = ''
    category: str | None = None


class ImportRequest(BaseModel):
    transactions: list[TransactionItem]


@router.post('/preview')
async def preview_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    text = content.decode('utf-8-sig')

    prompt = (
        'You are a financial data extractor. '
        'Below is the raw content of a CSV file where each row represents a bank transaction.\n\n'
        'Extract ALL transactions and return ONLY a valid JSON array. Each object must have:\n'
        '- "date": string in YYYY-MM-DD format (convert if needed)\n'
        '- "amount": number (negative for debits/expenses, positive for credits/income)\n'
        '- "description": string (transaction concept or narration, empty string if none)\n'
        '- "category": string or null\n\n'
        'Skip rows you cannot parse. Return ONLY the JSON array, no markdown, no explanation.\n\n'
        f'CSV content:\n{text}'
    )

    try:
        raw = await get_ai_response(current_user.id, prompt)
        match = re.search(r'\[.*\]', raw, re.DOTALL)
        if not match:
            raise ValueError('AI did not return a valid JSON array')
        transactions = json.loads(match.group())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    return {'transactions': transactions}


@router.post('/import', status_code=status.HTTP_201_CREATED)
async def import_csv(
    body: ImportRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.transactions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='No transactions to import',
        )

    transactions = []
    for t in body.transactions:
        try:
            parsed_date = date_type.fromisoformat(t.date)
        except ValueError:
            continue
        transactions.append(
            Transaction(
                user_id=current_user.id,
                date=parsed_date,
                amount=t.amount,
                description=t.description,
                category=t.category or None,
                source='csv',
            )
        )

    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='No valid transactions found',
        )

    await Transaction.insert_many(transactions)

    return {
        'imported': len(transactions),
        'transactions': [
            {
                'id': str(t.id),
                'date': str(t.date),
                'amount': t.amount,
                'description': t.description,
                'category': t.category,
            }
            for t in transactions
        ],
    }
