import os
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import Optional, List
import secrets

class Settings(BaseSettings):
    # 应用基础配置
    app_name: str = "AI Writing Assistant"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, description="Debug mode")
    environment: str = Field(default="development", description="Environment: development/production/test")
    
    # 服务配置
    host: str = Field(default="localhost", description="Server host")
    port: int = Field(default=8002, description="Server port")
    reload: bool = Field(default=True, description="Auto reload in development")
    
    # 安全配置
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32), description="Secret key for JWT")
    access_token_expire_minutes: int = Field(default=30, description="Access token expiration time")
    refresh_token_expire_days: int = Field(default=7, description="Refresh token expiration time")
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    
    # 数据库配置
    database_url: str = Field(default="sqlite:///./writing_assistant.db", description="Database URL")
    async_database_url: str = Field(default="sqlite+aiosqlite:///./writing_assistant.db", description="Async Database URL")
    database_echo: bool = Field(default=False, description="Echo SQL queries")
    
    # Redis配置
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis URL")
    redis_expire_time: int = Field(default=3600, description="Default Redis expiration time")
    
    # Celery配置
    celery_broker_url: str = Field(default="redis://localhost:6379/1", description="Celery broker URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/1", description="Celery result backend")
    
    # LLM API配置
    minimax_api_key: Optional[str] = Field(default=None, description="MiniMax API key")
    minimax_group_id: Optional[str] = Field(default=None, description="MiniMax group ID")
    openai_api_key: Optional[str] = Field(default=None, description="OpenAI API key")
    claude_api_key: Optional[str] = Field(default=None, description="Claude API key")
    gemini_api_key: Optional[str] = Field(default=None, description="Gemini API key")
    
    # LLM配置
    default_llm_provider: str = Field(default="minimax", description="Default LLM provider")
    max_tokens_per_request: int = Field(default=4000, description="Max tokens per LLM request")
    llm_request_timeout: int = Field(default=60, description="LLM request timeout in seconds")
    llm_retry_attempts: int = Field(default=3, description="LLM retry attempts")
    
    # 文件存储配置
    upload_directory: str = Field(default="./uploads", description="Upload directory")
    max_file_size: int = Field(default=10 * 1024 * 1024, description="Max file size in bytes (10MB)")
    allowed_file_types: List[str] = Field(
        default=["pdf", "docx", "txt", "md"], 
        description="Allowed file types"
    )
    
    # 工作流配置
    default_readability_threshold: float = Field(default=70.0, description="Default readability threshold")
    max_workflow_retries: int = Field(default=3, description="Max workflow retries")
    workflow_timeout_minutes: int = Field(default=30, description="Workflow timeout in minutes")
    
    # 缓存配置
    cache_enabled: bool = Field(default=True, description="Enable caching")
    cache_default_ttl: int = Field(default=3600, description="Default cache TTL in seconds")
    
    # 日志配置
    log_level: str = Field(default="INFO", description="Log level")
    log_file_path: str = Field(default="./logs", description="Log file path")
    log_max_bytes: int = Field(default=10 * 1024 * 1024, description="Max log file size")
    log_backup_count: int = Field(default=5, description="Log backup count")
    
    # API限制配置
    api_rate_limit: int = Field(default=100, description="API rate limit per minute")
    api_burst_limit: int = Field(default=200, description="API burst limit")
    
    # CORS配置
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"], 
        description="CORS allowed origins"
    )
    cors_credentials: bool = Field(default=True, description="CORS allow credentials")
    cors_methods: List[str] = Field(default=["*"], description="CORS allowed methods")
    cors_headers: List[str] = Field(default=["*"], description="CORS allowed headers")
    
    # 外部服务配置
    crossref_api_url: str = Field(default="https://api.crossref.org", description="CrossRef API URL")
    pubmed_api_url: str = Field(default="https://eutils.ncbi.nlm.nih.gov/entrez/eutils", description="PubMed API URL")
    semantic_scholar_api_url: str = Field(default="https://api.semanticscholar.org/graph/v1", description="Semantic Scholar API URL")
    
    # 向量数据库配置
    chroma_persist_directory: str = Field(default="./chroma_db", description="ChromaDB persistence directory")
    
    @validator('environment')
    def validate_environment(cls, v):
        allowed_environments = ['development', 'production', 'test']
        if v not in allowed_environments:
            raise ValueError(f'Environment must be one of {allowed_environments}')
        return v
    
    @validator('default_llm_provider')
    def validate_llm_provider(cls, v):
        allowed_providers = ['minimax', 'openai', 'claude', 'gemini']
        if v not in allowed_providers:
            raise ValueError(f'LLM provider must be one of {allowed_providers}')
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        allowed_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in allowed_levels:
            raise ValueError(f'Log level must be one of {allowed_levels}')
        return v.upper()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# 创建全局设置实例
settings = Settings()

# LLM提供商配置
LLM_PROVIDERS = {
    "minimax": {
        "api_key": settings.minimax_api_key,
        "group_id": settings.minimax_group_id,
        "base_url": "https://api.minimax.chat/v1",
        "model": "abab6.5s-chat",
        "timeout": settings.llm_request_timeout,
        "max_tokens": settings.max_tokens_per_request,
        "retry_attempts": settings.llm_retry_attempts
    },
    "openai": {
        "api_key": settings.openai_api_key,
        "base_url": "https://api.openai.com/v1",
        "model": "gpt-4",
        "timeout": settings.llm_request_timeout,
        "max_tokens": settings.max_tokens_per_request,
        "retry_attempts": settings.llm_retry_attempts
    },
    "claude": {
        "api_key": settings.claude_api_key,
        "base_url": "https://api.anthropic.com",
        "model": "claude-3-sonnet-20240229",
        "timeout": settings.llm_request_timeout,
        "max_tokens": settings.max_tokens_per_request,
        "retry_attempts": settings.llm_retry_attempts
    },
    "gemini": {
        "api_key": settings.gemini_api_key,
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "model": "gemini-pro",
        "timeout": settings.llm_request_timeout,
        "max_tokens": settings.max_tokens_per_request,
        "retry_attempts": settings.llm_retry_attempts
    }
}

# 获取可用的LLM提供商
def get_available_providers() -> List[str]:
    """获取已配置的LLM提供商列表"""
    available = []
    for provider, config in LLM_PROVIDERS.items():
        if config.get("api_key"):
            available.append(provider)
    return available

# 获取默认提供商
def get_default_provider() -> Optional[str]:
    """获取默认LLM提供商"""
    if settings.default_llm_provider in get_available_providers():
        return settings.default_llm_provider
    
    # 如果默认提供商不可用，返回第一个可用的
    available = get_available_providers()
    return available[0] if available else None

# 验证配置
def validate_configuration():
    """验证配置的完整性"""
    errors = []
    
    # 检查必要的配置
    if not get_available_providers():
        errors.append("No LLM provider API key configured")
    
    # 检查数据库URL
    if not settings.database_url:
        errors.append("Database URL not configured")
    
    # 检查密钥
    if len(settings.secret_key) < 32:
        errors.append("Secret key should be at least 32 characters long")
    
    # 检查目录
    import os
    directories = [settings.upload_directory, settings.log_file_path, settings.chroma_persist_directory]
    for directory in directories:
        if not os.path.exists(directory):
            try:
                os.makedirs(directory, exist_ok=True)
            except Exception as e:
                errors.append(f"Cannot create directory {directory}: {e}")
    
    return errors

# 启动时验证配置
configuration_errors = validate_configuration()
if configuration_errors:
    import warnings
    for error in configuration_errors:
        warnings.warn(f"Configuration warning: {error}")

# 导出常用配置
__all__ = [
    'settings',
    'LLM_PROVIDERS', 
    'get_available_providers',
    'get_default_provider',
    'validate_configuration'
]