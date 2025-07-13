from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Dict, Any, Optional
import traceback
from datetime import datetime
import uuid
from enum import Enum

logger = logging.getLogger(__name__)

class ErrorCode(str, Enum):
    """错误码枚举"""
    # 通用错误
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    
    # 业务错误
    AGENT_ERROR = "AGENT_ERROR"
    LLM_ERROR = "LLM_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    WEBSOCKET_ERROR = "WEBSOCKET_ERROR"
    
    # 资源错误
    DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND"
    DOCUMENT_ACCESS_DENIED = "DOCUMENT_ACCESS_DENIED"
    LITERATURE_SEARCH_FAILED = "LITERATURE_SEARCH_FAILED"
    CHART_GENERATION_FAILED = "CHART_GENERATION_FAILED"
    
    # 限制错误
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"

class APIError(Exception):
    """自定义API错误"""
    def __init__(
        self, 
        status_code: int, 
        detail: str, 
        error_code: Optional[ErrorCode] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code
        self.extra_data = extra_data or {}
        super().__init__(detail)

class AgentError(APIError):
    """Agent相关错误"""
    def __init__(self, detail: str, agent_type: str = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code=ErrorCode.AGENT_ERROR,
            extra_data={"agent_type": agent_type} if agent_type else None
        )

class LLMError(APIError):
    """LLM服务错误"""
    def __init__(self, detail: str, model_name: str = None):
        super().__init__(
            status_code=503,
            detail=detail,
            error_code=ErrorCode.LLM_ERROR,
            extra_data={"model_name": model_name} if model_name else None
        )

class DatabaseError(APIError):
    """数据库错误"""
    def __init__(self, detail: str, operation: str = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code=ErrorCode.DATABASE_ERROR,
            extra_data={"operation": operation} if operation else None
        )

class DocumentNotFoundError(APIError):
    """文档不存在错误"""
    def __init__(self, document_id: str):
        super().__init__(
            status_code=404,
            detail=f"文档 {document_id} 不存在",
            error_code=ErrorCode.DOCUMENT_NOT_FOUND,
            extra_data={"document_id": document_id}
        )

class RateLimitError(APIError):
    """限流错误"""
    def __init__(self, detail: str = "请求过于频繁，请稍后重试"):
        super().__init__(
            status_code=429,
            detail=detail,
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED
        )

async def api_exception_handler(request: Request, exc: APIError):
    """自定义API异常处理器"""
    error_id = str(uuid.uuid4())
    
    logger.error(
        f"API error [{error_id}]: {exc.error_code} - {exc.detail} - "
        f"Status: {exc.status_code} - Path: {request.url}"
    )
    
    error_data = {
        "status_code": exc.status_code,
        "detail": exc.detail,
        "error_code": exc.error_code,
        "error_id": error_id,
        "timestamp": datetime.now().isoformat(),
        "path": str(request.url)
    }
    
    # 添加额外数据
    if exc.extra_data:
        error_data.update(exc.extra_data)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_data}
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP异常处理器"""
    error_id = str(uuid.uuid4())
    
    logger.error(
        f"HTTP error [{error_id}]: {exc.status_code} - {exc.detail} - Path: {request.url}"
    )
    
    # 根据状态码确定错误类型
    error_code = None
    if exc.status_code == 404:
        error_code = ErrorCode.NOT_FOUND
    elif exc.status_code == 401:
        error_code = ErrorCode.UNAUTHORIZED
    elif exc.status_code == 403:
        error_code = ErrorCode.FORBIDDEN
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "status_code": exc.status_code,
                "detail": exc.detail,
                "error_code": error_code,
                "error_id": error_id,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """请求验证异常处理器"""
    error_id = str(uuid.uuid4())
    
    logger.error(
        f"Validation error [{error_id}]: {exc.errors()} - Path: {request.url}"
    )
    
    # 格式化验证错误
    formatted_errors = []
    for error in exc.errors():
        formatted_errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "status_code": 422,
                "detail": "请求参数验证失败",
                "error_code": ErrorCode.VALIDATION_ERROR,
                "error_id": error_id,
                "validation_errors": formatted_errors,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """通用异常处理器"""
    error_id = str(uuid.uuid4())
    
    logger.error(
        f"Unhandled exception [{error_id}]: {type(exc).__name__} - {str(exc)} - "
        f"Path: {request.url}\nTraceback: {traceback.format_exc()}"
    )
    
    # 在生产环境中隐藏详细错误信息
    import os
    is_debug = os.getenv("DEBUG", "False").lower() == "true"
    
    error_detail = str(exc) if is_debug else "服务器内部错误"
    error_data = {
        "status_code": 500,
        "detail": error_detail,
        "error_code": ErrorCode.INTERNAL_SERVER_ERROR,
        "error_id": error_id,
        "timestamp": datetime.now().isoformat(),
        "path": str(request.url)
    }
    
    # 在调试模式下添加堆栈跟踪
    if is_debug:
        error_data["traceback"] = traceback.format_exc()
        error_data["exception_type"] = type(exc).__name__
    
    return JSONResponse(
        status_code=500,
        content={"error": error_data}
    )

def create_error_response(
    status_code: int, 
    detail: str, 
    error_code: Optional[ErrorCode] = None,
    extra_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """创建统一的错误响应格式"""
    error_data = {
        "status_code": status_code,
        "detail": detail,
        "error_code": error_code,
        "error_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat()
    }
    
    if extra_data:
        error_data.update(extra_data)
    
    return {"error": error_data}

def create_success_response(
    data: Any = None,
    message: str = "操作成功",
    extra_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """创建统一的成功响应格式"""
    response_data = {
        "success": True,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    
    if data is not None:
        response_data["data"] = data
    
    if extra_data:
        response_data.update(extra_data)
    
    return response_data

# 异常装饰器
def handle_exceptions(func):
    """异常处理装饰器"""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except APIError:
            raise  # 重新抛出自定义API错误
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise APIError(
                status_code=500,
                detail="服务器内部错误",
                error_code=ErrorCode.INTERNAL_SERVER_ERROR
            )
    return wrapper