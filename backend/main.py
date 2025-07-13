from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os

from api.routes import writing, literature, tools, documents, auth, workflow, websocket
from core.database import init_db
from core.logging_config import logger
from core.error_handling import (
    APIError,
    api_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 启动 AI Writing Assistant API")
    logger.info("📊 初始化数据库...")
    await init_db()
    logger.info("✅ 数据库初始化完成")
    logger.info("🎉 应用启动成功")
    
    yield
    
    # Shutdown
    logger.info("🛑 关闭 AI Writing Assistant API")
    logger.info("👋 再见!")

app = FastAPI(
    title="AI Writing Assistant",
    description="智能写作助手API",
    version="1.0.0",
    lifespan=lifespan
)

# 添加异常处理器
app.add_exception_handler(APIError, api_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# 更安全的CORS配置
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(writing.router, prefix="/api/writing", tags=["写作"])
app.include_router(literature.router, prefix="/api/literature", tags=["文献"])
app.include_router(tools.router, prefix="/api/tools", tags=["工具"])
app.include_router(documents.router, prefix="/api/documents", tags=["文档管理"])
app.include_router(workflow.router, tags=["工作流"])
app.include_router(websocket.router, prefix="/api", tags=["实时通信"])

@app.get("/")
async def root():
    """API根端点"""
    return {
        "message": "AI Writing Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "writing": "/api/writing",
            "literature": "/api/literature", 
            "tools": "/api/tools",
            "documents": "/api/documents",
            "workflow": "/api/workflow"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "components": {
            "database": "connected",
            "agents": {
                "writing": "active",
                "literature": "active", 
                "tools": "active"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "localhost"),
        port=int(os.getenv("PORT", 8002)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )