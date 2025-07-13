from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from datetime import datetime, timezone
import os
from typing import AsyncGenerator

# 导入所有数据库模型
from .database_models import Base, User, Document, Literature, WritingSession, UserSettings
from .database_models import WorkflowDocument, WorkflowNode, NodeMetrics, Citation, ChatMessage, QualityThreshold

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./writing_assistant.db")
ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")

# 同步数据库
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 异步数据库
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    """初始化数据库表"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

def get_db():
    """获取同步数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_sync():
    """获取同步数据库会话（用于脚本）"""
    return SessionLocal()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """获取异步数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# 保持同步版本用于认证路由，异步版本用于工作流
# get_db = get_async_db  # 注释掉这行，使用原始的同步get_db