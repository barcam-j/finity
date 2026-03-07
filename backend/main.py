from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db import connect_db, close_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.ai_config import AiConfig
from app.models.alert import Alert
from app.routers import auth, transactions, ai_config, alerts

DOCUMENT_MODELS = [User, Transaction, AiConfig, Alert]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db(DOCUMENT_MODELS)
    yield
    await close_db()


app = FastAPI(title='FinanceAI API', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(ai_config.router)
app.include_router(alerts.router)


@app.get('/health')
async def health():
    return {'status': 'ok'}
