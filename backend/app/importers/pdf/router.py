import io
import json
import re
from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from pypdf import PdfReader

from app.ai.adapter import get_ai_response
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.categorization import apply_rules_to_imported

router = APIRouter(prefix='/importers/pdf', tags=['importers'])


class TransactionItem(BaseModel):
    date: str
    amount: float
    description: str = ''
    category: str | None = None


class ImportRequest(BaseModel):
    transactions: list[TransactionItem]


@router.post('/preview')
async def preview_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    reader = PdfReader(io.BytesIO(content))
    text = '\n'.join(page.extract_text() or '' for page in reader.pages).strip()

    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='Could not extract text from PDF. The file may be scanned or image-based.',
        )

    prompt = (
        'You are a financial data extractor. '
        'Below is the raw text extracted from a PDF bank statement.\n\n'
        'Extract ALL transactions and return ONLY a valid JSON array. Each object must have:\n'
        '- "date": string in YYYY-MM-DD format (convert if needed)\n'
        '- "amount": number (negative for debits/expenses, positive for credits/income)\n'
        '- "description": string (transaction concept or narration, empty string if none)\n'
        '- "category": string or null\n\n'
        'Skip rows you cannot parse. Return ONLY the JSON array, no markdown, no explanation.\n\n'
        f'PDF text:\n{text}'
    )

    try:
        raw = await get_ai_response(current_user.id, prompt)
        match = re.search(r'\[.*\]', raw, re.DOTALL)
        if not match:
            raise ValueError('AI did not return a valid JSON array')
        transactions = json.loads(match.group())
    except Exception as e:
        msg = str(e)
        if '429' in msg or 'RateLimitError' in msg or 'quota' in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail='AI provider rate limit reached. Wait a moment and try again, or add credits in your provider dashboard.',
            )
        if '401' in msg or 'AuthenticationError' in msg or 'invalid api key' in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid API key. Check your key in Settings.',
            )
        if 'NotFoundError' in msg or '404' in msg:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='AI model not found. Check the model name in Settings.',
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f'AI error: {msg}',
        )

    return {'transactions': transactions}


@router.post('/import', status_code=status.HTTP_201_CREATED)
async def import_pdf(
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
                source='pdf',
            )
        )

    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='No valid transactions found',
        )

    await Transaction.insert_many(transactions)
    await apply_rules_to_imported(current_user.id, transactions)

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
