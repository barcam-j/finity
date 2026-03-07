from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = 'mongodb://localhost:27017'
    database_name: str = 'financeai'
    secret_key: str
    encryption_key: str
    access_token_expire_minutes: int = 60 * 24  # 24h

    model_config = {'env_file': '.env'}


settings = Settings()
