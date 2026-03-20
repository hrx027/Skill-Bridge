from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Skill-Bridge Career Navigator API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 71
    frontend_origin: str = "http://localhost:3000"

    groq_api_key: Optional[str] = None
    groq_model: str = "openai/gpt-oss-120b"

    convex_deployment_url: Optional[str] = None
    convex_admin_key: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
