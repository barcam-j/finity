from beanie import Document, PydanticObjectId
from typing import Optional


class AiConfig(Document):
    user_id: PydanticObjectId
    provider: str
    api_key_encrypted: str
    model: str
    params: dict = {}

    class Settings:
        name = 'ai_configs'
