from beanie import Document, PydanticObjectId
from datetime import datetime, timezone
from pydantic import Field


class ImportLog(Document):
    user_id: PydanticObjectId
    source: str  # 'csv', 'pdf'
    count: int
    name: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'import_logs'
