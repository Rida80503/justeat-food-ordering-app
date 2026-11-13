"""
Application configuration.

This file stores all application settings.
Values are loaded from the .env file.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Store all application settings."""

    # ------------------------------------------------------------------
    # Database Settings
    # ------------------------------------------------------------------
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/justeat_db"
    SQLALCHEMY_ECHO: bool = False

    # ------------------------------------------------------------------
    # FastAPI Settings
    # ------------------------------------------------------------------
    API_TITLE: str = "JustEat Food Ordering API"
    API_DESCRIPTION: str = "Complete Food Ordering Application"
    API_VERSION: str = "1.0.0"

    # ------------------------------------------------------------------
    # Application Settings
    # ------------------------------------------------------------------
    APP_ENV: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ------------------------------------------------------------------
    # JWT Settings
    # ------------------------------------------------------------------
    JWT_SECRET_KEY: str = (
        "your-super-secret-key-change-this-minimum-32-characters"
    )
    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_EXPIRATION_MINUTES: int = 30

    # ------------------------------------------------------------------
    # CORS Settings
    # ------------------------------------------------------------------
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # ------------------------------------------------------------------
    # Email Settings
    # ------------------------------------------------------------------
    EMAIL_FROM: str = "noreply@justeat.com"
    SEND_REAL_EMAIL: bool = False

    class Config:
        """Load values from the .env file."""

        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @property
    def ALLOWED_ORIGINS_LIST(self) -> list[str]:
        """Return CORS origins as a list, stripped of whitespace and trailing slashes."""

        configured_origins = [
            value.strip().rstrip("/")
            for value in self.ALLOWED_ORIGINS.split(",")
            if value and value.strip()
        ]

        default_local_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]

        seen = set()
        normalized = []
        for origin in configured_origins + default_local_origins:
            origin = origin.strip().rstrip("/")
            if origin and origin not in seen:
                seen.add(origin)
                normalized.append(origin)

        return normalized


@lru_cache()
def get_settings() -> Settings:
    """
    Return the application settings.

    The settings object is created only once and reused
    throughout the application.
    """

    return Settings()


settings = get_settings()