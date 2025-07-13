from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# 枚举类型
class DocumentType(str, Enum):
    ACADEMIC = "academic"
    BLOG = "blog"
    SOCIAL = "social"

class AgentType(str, Enum):
    WRITING = "writing"
    LITERATURE = "literature"
    TOOLS = "tools"

class LiteratureSource(str, Enum):
    GOOGLE_SCHOLAR = "google_scholar"
    PUBMED = "pubmed"
    ARXIV = "arxiv"
    MANUAL = "manual"

# 基础模型
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# 文档模型
class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    document_type: DocumentType

class DocumentCreate(DocumentBase):
    content: Optional[str] = ""

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    document_type: Optional[DocumentType] = None

class DocumentResponse(DocumentBase):
    id: str
    content: str
    word_count: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 文献模型
class LiteratureBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=1000)
    authors: Optional[str] = None
    year: Optional[int] = Field(None, ge=1900, le=2030)
    source: LiteratureSource

class LiteratureCreate(LiteratureBase):
    doi: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None

class LiteratureUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=1000)
    authors: Optional[str] = None
    year: Optional[int] = Field(None, ge=1900, le=2030)
    doi: Optional[str] = None
    abstract: Optional[str] = None
    url: Optional[str] = None
    is_favorite: Optional[bool] = None

class LiteratureResponse(LiteratureBase):
    id: int
    doi: Optional[str]
    abstract: Optional[str]
    url: Optional[str]
    file_path: Optional[str]
    user_id: int
    is_favorite: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# 写作请求模型
class WritingRequestBase(BaseModel):
    prompt: str = Field(..., min_length=1)
    mode: DocumentType = DocumentType.ACADEMIC
    context: Dict[str, Any] = {}

class WritingRequest(WritingRequestBase):
    user_id: Optional[int] = None
    document_id: Optional[int] = None

class WritingResponse(BaseModel):
    content: str
    success: bool
    metadata: Dict[str, Any] = {}
    tokens_used: int = 0
    error: Optional[str] = None

# 文献搜索模型
class LiteratureSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    max_results: int = Field(10, ge=1, le=50)
    year_range: Optional[List[int]] = Field(None, min_items=2, max_items=2)
    include_abstract: bool = True

class LiteratureSearchResponse(BaseModel):
    results: List[LiteratureResponse]
    total: int
    success: bool
    error: Optional[str] = None

# 工具相关模型
class FormatConversionRequest(BaseModel):
    content: str = Field(..., min_length=1)
    from_format: str = Field(..., pattern=r'^(markdown|html|docx|pdf)$')
    to_format: str = Field(..., pattern=r'^(markdown|html|docx|pdf)$')
    
    @validator('to_format')
    def validate_different_formats(cls, v, values):
        if 'from_format' in values and v == values['from_format']:
            raise ValueError('目标格式必须与源格式不同')
        return v

class FormatConversionResponse(BaseModel):
    result: str
    success: bool
    original_format: str
    target_format: str
    error: Optional[str] = None

class ChartGenerationRequest(BaseModel):
    data: Dict[str, Any] = Field(..., description="图表数据")
    chart_type: str = Field(..., pattern=r'^(bar|line|pie|scatter)$')
    title: Optional[str] = None
    description: Optional[str] = None

class ChartGenerationResponse(BaseModel):
    chart_data: Dict[str, Any]
    success: bool
    chart_type: str
    error: Optional[str] = None

# Agent 相关模型
class AgentRequestBase(BaseModel):
    prompt: str = Field(..., min_length=1)
    agent_type: AgentType
    context: Dict[str, Any] = {}

class AgentRequest(AgentRequestBase):
    user_id: int
    document_id: Optional[int] = None

class AgentResponse(BaseModel):
    content: str
    success: bool
    agent_type: AgentType
    metadata: Optional[Dict[str, Any]] = None
    tokens_used: int = 0
    error: Optional[str] = None

# 写作会话模型
class WritingSessionCreate(BaseModel):
    document_id: Optional[int] = None
    agent_type: AgentType
    prompt: str = Field(..., min_length=1)
    response: Optional[str] = None
    tokens_used: int = 0
    success: bool = True
    error_message: Optional[str] = None

class WritingSessionResponse(BaseModel):
    id: int
    document_id: Optional[int]
    agent_type: AgentType
    prompt: str
    response: Optional[str]
    tokens_used: int
    user_id: int
    success: bool
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# 用户设置模型
class UserSettingsBase(BaseModel):
    theme: str = Field("light", pattern=r'^(light|dark|auto)$')
    language: str = Field("zh-CN", pattern=r'^(zh-CN|en-US)$')
    auto_save: bool = True
    auto_save_interval: int = Field(30, ge=10, le=300)

class UserSettingsUpdate(UserSettingsBase):
    theme: Optional[str] = Field(None, pattern=r'^(light|dark|auto)$')
    language: Optional[str] = Field(None, pattern=r'^(zh-CN|en-US)$')
    auto_save: Optional[bool] = None
    auto_save_interval: Optional[int] = Field(None, ge=10, le=300)

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 错误响应模型
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# 成功响应模型
class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)