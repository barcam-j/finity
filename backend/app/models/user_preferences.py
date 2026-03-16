from beanie import Document, PydanticObjectId


class UserPreferences(Document):
    user_id: PydanticObjectId
    currency: str = 'EUR'
    language: str = 'en'

    class Settings:
        name = 'user_preferences'
