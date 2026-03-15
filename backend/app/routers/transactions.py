from datetime import date as DateType

from fastapi import APIRouter, Depends, HTTPException, Query, status
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix='/transactions', tags=['transactions'])


class TransactionUpdate(BaseModel):
    date: DateType | None = None
    description: str | None = None
    categories: list[str] | None = None
    amount: float | None = None


class BulkCategoryUpdate(BaseModel):
    ids: list[str]
    category: str | None = None


def _tx_out(t: Transaction) -> dict:
    return t.model_dump(mode='json', by_alias=False)


@router.get('/categories')
async def list_categories(current_user: User = Depends(get_current_user)):
    transactions = await Transaction.find(
        Transaction.user_id == current_user.id,
    ).to_list()
    all_cats: set[str] = set()
    for t in transactions:
        all_cats.update(t.categories)
    return sorted(all_cats)


@router.get('/')
async def list_transactions(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categories: list[str] = Query(default=[]),
    date_from: DateType | None = Query(None),
    date_to: DateType | None = Query(None),
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
):
    conditions = [Transaction.user_id == current_user.id]

    if search and search.strip():
        conditions.append({'description': {'$regex': search.strip(), '$options': 'i'}})

    if categories:
        conditions.append({'categories': {'$in': categories}})

    if date_from:
        conditions.append(Transaction.date >= date_from)

    if date_to:
        conditions.append(Transaction.date <= date_to)

    if amount_min is not None:
        conditions.append(Transaction.amount >= amount_min)

    if amount_max is not None:
        conditions.append(Transaction.amount <= amount_max)

    query = Transaction.find(*conditions)
    total = await query.count()
    items = await query.sort(-Transaction.date).skip((page - 1) * limit).limit(limit).to_list()
    return {
        'items': [_tx_out(t) for t in items],
        'total': total,
        'page': page,
        'pages': max(1, -(-total // limit)),
    }


@router.patch('/{transaction_id}')
async def update_transaction(
    transaction_id: PydanticObjectId,
    body: TransactionUpdate,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')
    if body.date is not None:
        transaction.date = body.date
    if body.description is not None:
        transaction.description = body.description
    if body.amount is not None:
        transaction.amount = body.amount
    if body.categories is not None:
        transaction.categories = body.categories
    await transaction.replace()
    return _tx_out(transaction)


@router.post('/bulk-category')
async def bulk_update_category(
    body: BulkCategoryUpdate,
    current_user: User = Depends(get_current_user),
):
    updated = 0
    for id_str in body.ids:
        try:
            transaction = await Transaction.get(PydanticObjectId(id_str))
            if transaction and transaction.user_id == current_user.id:
                if body.category and body.category not in transaction.categories:
                    transaction.categories = transaction.categories + [body.category]
                    await transaction.replace()
                updated += 1
        except Exception:
            continue
    return {'updated': updated}


@router.delete('/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')
    await transaction.delete()
