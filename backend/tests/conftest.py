"""
测试配置文件
"""
import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from core.database import get_db, Base
from core.config import Settings

# 测试数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def async_client():
    """异步HTTP客户端"""
    # 创建测试数据库表
    Base.metadata.create_all(bind=engine)
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    # 清理测试数据库
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    """同步HTTP客户端"""
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
    
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_document_data():
    """示例文档数据"""
    return {
        "title": "测试文档",
        "content": "这是一个测试文档的内容",
        "document_type": "academic",
        "metadata": {"author": "测试用户", "keywords": ["测试", "文档"]}
    }

@pytest.fixture
def sample_writing_request():
    """示例写作请求数据"""
    return {
        "content": "请帮我写一篇关于人工智能的论文",
        "writing_type": "academic",
        "style": "formal",
        "requirements": {
            "word_count": 1000,
            "include_citations": True,
            "sections": ["introduction", "methodology", "results", "conclusion"]
        }
    }

@pytest.fixture
def sample_literature_query():
    """示例文献查询数据"""
    return {
        "query": "artificial intelligence machine learning",
        "limit": 10,
        "filters": {
            "year_range": [2020, 2024],
            "publication_type": "journal"
        }
    }