from beanie import Document, PydanticObjectId
from pymongo import IndexModel, ASCENDING


class CategoryRule(Document):
    user_id: PydanticObjectId
    category: str
    pattern: str  # _desc_key output — the merchant signature that triggers this rule

    class Settings:
        name = 'category_rules'
        indexes = [
            IndexModel(
                [('user_id', ASCENDING), ('category', ASCENDING), ('pattern', ASCENDING)],
                unique=True,
            )
        ]
