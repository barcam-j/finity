from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.csv_parser import parse_csv

router = APIRouter(prefix='/transactions', tags=['transactions'])


@router.get('/')
async def list_transactions(current_user: User = Depends(get_current_user)):
    transactions = await Transaction.find(Transaction.user_id == current_user.id).to_list()
    return transactions


@router.post('/import', status_code=status.HTTP_201_CREATED)
async def import_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    transactions = parse_csv(content, user_id=current_user.id)
    await Transaction.insert_many(transactions)
    return {'imported': len(transactions)}


@router.delete('/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')
    await transaction.delete()
