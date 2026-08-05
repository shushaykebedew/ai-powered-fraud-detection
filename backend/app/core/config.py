from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Fraud Detection API"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    DATABASE_URL: str = "sqlite:///./fraud_detection.db"

    JWT_SECRET_KEY: str = "change-this-to-a-random-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    MODEL_DIR: str = "app/ml/models/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
