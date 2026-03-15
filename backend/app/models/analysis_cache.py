from beanie import Document, PydanticObjectId


class AnalysisCache(Document):
    user_id: PydanticObjectId
    month: str  # YYYY-MM
    analysis: str
    transactions_hash: str

    class Settings:
        name = 'analysis_cache'
