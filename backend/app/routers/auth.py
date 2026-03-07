from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from fastapi import Depends

router = APIRouter(prefix='/auth', tags=['auth'])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


@router.post('/register', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')

    user = User(email=body.email, password_hash=hash_password(body.password))
    await user.insert()

    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post('/login', response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await User.find_one(User.email == body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')

    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.get('/me')
async def me(current_user: User = Depends(get_current_user)):
    return {'id': str(current_user.id), 'email': current_user.email}
