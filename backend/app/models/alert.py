from beanie import Document, PydanticObjectId
from datetime import datetime, timezone
from typing import Optional
from pydantic import Field


class Alert(Document):
    user_id: PydanticObjectId
    type: str
    message: str
    severity: str  # low | medium | high
    transaction_id: Optional[PydanticObjectId] = None
    seen: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'alerts'
