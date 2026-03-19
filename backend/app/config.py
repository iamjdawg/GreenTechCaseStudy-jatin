from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = "sqlite:///./inventory.db"
    openai_api_key: str = ""
    openai_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    openai_timeout: int = 10
    openai_vision_model: str = "gemini-3-flash-preview"
    openai_vision_timeout: int = 20
    openai_chat_model: str = "gemini-3-flash-preview"


settings = Settings()
