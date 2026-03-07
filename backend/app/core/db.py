from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings


_client: AsyncIOMotorClient | None = None


async def connect_db(document_models: list) -> None:
    global _client
    _client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=_client[settings.database_name],
        document_models=document_models,
    )


async def close_db() -> None:
    if _client:
        _client.close()
