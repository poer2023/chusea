import logging
import logging.handlers
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
import sys
from pathlib import Path

class JSONFormatter(logging.Formatter):
    """JSON格式的日志格式化器"""
    
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "process_id": record.process,
            "thread_id": record.thread
        }
        
        # 添加异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # 添加额外字段
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_data["request_id"] = record.request_id
        if hasattr(record, 'document_id'):
            log_data["document_id"] = record.document_id
        if hasattr(record, 'agent_type'):
            log_data["agent_type"] = record.agent_type
        
        return json.dumps(log_data, ensure_ascii=False)

class ContextFilter(logging.Filter):
    """上下文过滤器，添加请求相关信息"""
    
    def filter(self, record):
        # 可以在这里添加全局上下文信息
        # 例如从请求中获取用户ID、请求ID等
        return True

def setup_logging(
    log_level: str = None,
    log_dir: str = "logs",
    json_format: bool = False,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
):
    """
    设置日志配置
    
    Args:
        log_level: 日志级别
        log_dir: 日志目录
        json_format: 是否使用JSON格式
        max_bytes: 单个日志文件最大大小
        backup_count: 备份文件数量
    """
    # 创建日志目录
    log_dir_path = Path(log_dir)
    log_dir_path.mkdir(exist_ok=True)
    
    # 获取日志级别
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # 清除现有的处理器
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # 创建格式化器
    if json_format or os.getenv("LOG_FORMAT", "").lower() == "json":
        formatter = JSONFormatter()
        console_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
        )
        console_formatter = formatter
    
    handlers = []
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(logging.INFO)
    handlers.append(console_handler)
    
    # 应用日志文件处理器（轮转）
    app_log_file = log_dir_path / f"app_{datetime.now().strftime('%Y%m%d')}.log"
    app_handler = logging.handlers.RotatingFileHandler(
        app_log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    app_handler.setFormatter(formatter)
    app_handler.setLevel(getattr(logging, log_level))
    handlers.append(app_handler)
    
    # 错误日志文件处理器
    error_log_file = log_dir_path / f"error_{datetime.now().strftime('%Y%m%d')}.log"
    error_handler = logging.handlers.RotatingFileHandler(
        error_log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    handlers.append(error_handler)
    
    # Agent专用日志处理器
    agent_log_file = log_dir_path / f"agents_{datetime.now().strftime('%Y%m%d')}.log"
    agent_handler = logging.handlers.RotatingFileHandler(
        agent_log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    agent_handler.setFormatter(formatter)
    agent_handler.setLevel(logging.DEBUG)
    handlers.append(agent_handler)
    
    # 配置根日志器
    root_logger.setLevel(getattr(logging, log_level))
    
    # 添加上下文过滤器
    context_filter = ContextFilter()
    
    for handler in handlers:
        handler.addFilter(context_filter)
        root_logger.addHandler(handler)
    
    # 配置特定模块的日志级别
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
    
    # 为Agent模块设置专用处理器
    agent_logger = logging.getLogger("agents")
    agent_logger.addHandler(agent_handler)
    agent_logger.setLevel(logging.DEBUG)
    
    return logging.getLogger(__name__)

def get_logger(name: str) -> logging.Logger:
    """获取指定名称的日志器"""
    return logging.getLogger(name)

def log_function_call(func_name: str, args: tuple = None, kwargs: dict = None):
    """记录函数调用"""
    logger = get_logger("function_calls")
    args_str = f"args={args}" if args else ""
    kwargs_str = f"kwargs={kwargs}" if kwargs else ""
    logger.debug(f"Calling {func_name}({args_str}, {kwargs_str})")

def log_agent_activity(
    agent_type: str, 
    action: str, 
    details: Optional[Dict[str, Any]] = None,
    level: str = "INFO"
):
    """记录Agent活动"""
    logger = get_logger(f"agents.{agent_type}")
    log_level = getattr(logging, level.upper())
    
    message = f"{agent_type} - {action}"
    if details:
        message += f" - {details}"
    
    logger.log(log_level, message, extra={"agent_type": agent_type})

def log_api_request(
    method: str,
    path: str,
    status_code: int,
    response_time: float,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None
):
    """记录API请求"""
    logger = get_logger("api.requests")
    
    extra = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "response_time": response_time
    }
    
    if user_id:
        extra["user_id"] = user_id
    if request_id:
        extra["request_id"] = request_id
    
    logger.info(
        f"{method} {path} - {status_code} - {response_time:.3f}s",
        extra=extra
    )

def log_websocket_activity(
    event: str,
    connection_id: str,
    document_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """记录WebSocket活动"""
    logger = get_logger("websocket")
    
    message = f"WebSocket {event} - Connection: {connection_id}"
    if document_id:
        message += f" - Document: {document_id}"
    
    extra = {
        "event": event,
        "connection_id": connection_id
    }
    
    if document_id:
        extra["document_id"] = document_id
    
    if details:
        extra.update(details)
    
    logger.info(message, extra=extra)

def log_performance_metric(
    operation: str,
    duration: float,
    success: bool = True,
    details: Optional[Dict[str, Any]] = None
):
    """记录性能指标"""
    logger = get_logger("performance")
    
    status = "SUCCESS" if success else "FAILED"
    message = f"{operation} - {status} - {duration:.3f}s"
    
    extra = {
        "operation": operation,
        "duration": duration,
        "success": success
    }
    
    if details:
        extra.update(details)
    
    logger.info(message, extra=extra)

# 创建全局日志器
logger = setup_logging()

# 导出常用日志器
api_logger = get_logger("api")
agent_logger = get_logger("agents")
websocket_logger = get_logger("websocket")
performance_logger = get_logger("performance")