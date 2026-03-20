from beanie import Document, PydanticObjectId
from datetime import date
from pydantic import Field


class Transaction(Document):
    user_id: PydanticObjectId
    date: date
    amount: float
    description: str
    categories: list[str] = Field(default_factory=list)
    note: str | None = None
    source: str = 'manual'
    tags: list[str] = Field(default_factory=list)
    import_log_id: PydanticObjectId | None = None

    class Settings:
        name = 'transactions'
