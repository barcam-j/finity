from beanie import Document, PydanticObjectId
from datetime import date
from typing import Optional
from pydantic import Field


class Transaction(Document):
    user_id: PydanticObjectId
    date: date
    amount: float
    description: str
    category: Optional[str] = None
    source: str = 'manual'
    tags: list[str] = Field(default_factory=list)

    class Settings:
        name = 'transactions'
