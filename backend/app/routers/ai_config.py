from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.core.encryption import encrypt, decrypt
from app.models.user import User
from app.models.ai_config import AiConfig

router = APIRouter(prefix='/ai-config', tags=['ai-config'])


class AiConfigRequest(BaseModel):
    provider: str
    api_key: str | None = None
    model: str
    params: dict = {}


class AiConfigResponse(BaseModel):
    provider: str
    model: str
    params: dict


@router.get('/', response_model=AiConfigResponse | None)
async def get_config(current_user: User = Depends(get_current_user)):
    config = await AiConfig.find_one(AiConfig.user_id == current_user.id)
    if not config:
        return None
    return AiConfigResponse(provider=config.provider, model=config.model, params=config.params)


@router.put('/')
async def save_config(body: AiConfigRequest, current_user: User = Depends(get_current_user)):
    config = await AiConfig.find_one(AiConfig.user_id == current_user.id)
    if config:
        config.provider = body.provider
        if body.api_key:
            config.api_key_encrypted = encrypt(body.api_key)
        config.model = body.model
        config.params = body.params
        await config.save()
    else:
        if not body.api_key:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='API key is required when creating a new configuration',
            )
        config = AiConfig(
            user_id=current_user.id,
            provider=body.provider,
            api_key_encrypted=encrypt(body.api_key),
            model=body.model,
            params=body.params,
        )
        await config.insert()
    return {'status': 'saved'}
