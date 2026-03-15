from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.models.user import User
from app.models.ai_config import AiConfig
from app.services import dashboard_service

router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@router.get('/kpis')
async def get_kpis(
    period: str = Query('month', pattern='^(month|all)$'),
    current_user: User = Depends(get_current_user),
):
    return await dashboard_service.get_kpis(current_user.id, period)


@router.get('/analysis')
async def get_analysis(current_user: User = Depends(get_current_user)):
    config = await AiConfig.find_one(AiConfig.user_id == current_user.id)

    if not config or not config.analysis_enabled:
        return {'analysis': None, 'enabled': False}

    try:
        analysis = await dashboard_service.get_ai_analysis(current_user.id)
        return {'analysis': analysis, 'enabled': True}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
