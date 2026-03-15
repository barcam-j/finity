from beanie import Document, PydanticObjectId
from datetime import date
from pydantic import Field


class Transaction(Document):
    user_id: PydanticObjectId
    date: date
    amount: float
    description: str
    categories: list[str] = Field(default_factory=list)
    source: str = 'manual'
    tags: list[str] = Field(default_factory=list)

    class Settings:
        name = 'transactions'
