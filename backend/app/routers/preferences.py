from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.user_preferences import UserPreferences

router = APIRouter(prefix='/preferences', tags=['preferences'])

SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'MXN', 'BRL', 'ARS']
SUPPORTED_LANGUAGES = ['en', 'es', 'it']


class PreferencesRequest(BaseModel):
    currency: str
    language: str = 'en'
    allow_date_edit: bool = False


class PreferencesResponse(BaseModel):
    currency: str
    language: str
    allow_date_edit: bool = False


@router.get('/', response_model=PreferencesResponse)
async def get_preferences(current_user: User = Depends(get_current_user)):
    prefs = await UserPreferences.find_one(UserPreferences.user_id == current_user.id)
    return PreferencesResponse(
        currency=prefs.currency if prefs else 'EUR',
        language=prefs.language if prefs else 'en',
        allow_date_edit=prefs.allow_date_edit if prefs else False,
    )


@router.put('/', response_model=PreferencesResponse)
async def save_preferences(body: PreferencesRequest, current_user: User = Depends(get_current_user)):
    prefs = await UserPreferences.find_one(UserPreferences.user_id == current_user.id)
    if prefs:
        prefs.currency = body.currency
        prefs.language = body.language
        prefs.allow_date_edit = body.allow_date_edit
        await prefs.save()
    else:
        prefs = UserPreferences(
            user_id=current_user.id,
            currency=body.currency,
            language=body.language,
            allow_date_edit=body.allow_date_edit,
        )
        await prefs.insert()
    return PreferencesResponse(currency=prefs.currency, language=prefs.language, allow_date_edit=prefs.allow_date_edit)
