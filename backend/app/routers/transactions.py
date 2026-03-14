from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix='/transactions', tags=['transactions'])


@router.get('/')
async def list_transactions(current_user: User = Depends(get_current_user)):
    transactions = await Transaction.find(Transaction.user_id == current_user.id).to_list()
    return transactions


@router.delete('/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')
    await transaction.delete()
