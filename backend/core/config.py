import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # LLM API配置
    minimax_api_key: Optional[str] = None
    minimax_group_id: Optional[str] = None
    openai_api_key: Optional[str] = None
    claude_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # 数据库配置
    database_url: str = "sqlite:///./writing_assistant.db"
    chroma_persist_directory: str = "./chroma_db"
    
    # 服务配置
    host: str = "localhost"
    port: int = 8000
    debug: bool = True
    
    model_config = {"env_file": ".env"}

settings = Settings()

# LLM提供商配置
LLM_PROVIDERS = {
    "minimax": {
        "api_key": settings.minimax_api_key,
        "group_id": settings.minimax_group_id,
        "base_url": "https://api.minimax.chat/v1",
        "model": "abab6.5s-chat"
    },
    "openai": {
        "api_key": settings.openai_api_key,
        "base_url": "https://api.openai.com/v1",
        "model": "gpt-4"
    },
    "claude": {
        "api_key": settings.claude_api_key,
        "base_url": "https://api.anthropic.com",
        "model": "claude-3-sonnet-20240229"
    }
}