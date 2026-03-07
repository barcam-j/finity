from fastapi import APIRouter, Depends
from beanie import PydanticObjectId

from app.core.deps import get_current_user
from app.models.user import User
from app.models.alert import Alert

router = APIRouter(prefix='/alerts', tags=['alerts'])


@router.get('/')
async def list_alerts(current_user: User = Depends(get_current_user)):
    return await Alert.find(Alert.user_id == current_user.id).sort('-created_at').to_list()


@router.patch('/{alert_id}/seen')
async def mark_seen(alert_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    alert = await Alert.get(alert_id)
    if alert and alert.user_id == current_user.id:
        alert.seen = True
        await alert.save()
    return {'status': 'ok'}
