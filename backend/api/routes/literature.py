from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import json

from core.database import get_db, Literature
from core.models import (
    LiteratureSearchRequest, LiteratureSearchResponse, 
    LiteratureResponse, LiteratureCreate, LiteratureUpdate
)
from core.agent_manager import agent_manager, AgentRequest, AgentType
from agents.literature_agent import LiteratureAgent

router = APIRouter()

# 初始化文献Agent
literature_agent = LiteratureAgent()
agent_manager.register_agent(literature_agent)

class LiteratureCitationRequest(BaseModel):
    literature_data: Dict[str, Any]
    style: str = "APA"  # APA, MLA, Chicago
    user_id: int = 1

class LiteratureAnalysisRequest(BaseModel):
    literature_items: List[Dict[str, Any]]
    analysis_type: str = "relevance"  # relevance, quality, trend
    query: str
    user_id: int = 1

class LiteratureAgentResponse(BaseModel):
    content: str
    success: bool
    metadata: Dict[str, Any]
    tokens_used: int = 0
    error: Optional[str] = None

@router.post("/search", response_model=LiteratureSearchResponse)
async def search_literature(
    request: LiteratureSearchRequest,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """搜索文献"""
    try:
        # 模拟搜索结果 - 在实际实现中会调用真实的学术搜索API
        mock_results = [
            {
                "id": 1,
                "title": "人工智能在教育中的应用研究",
                "authors": "张三, 李四",
                "year": 2023,
                "doi": "10.1000/xyz123",
                "abstract": "本文探讨了人工智能技术在现代教育中的应用前景...",
                "source": "google_scholar",
                "url": "https://example.com/paper1",
                "file_path": None,
                "user_id": user_id,
                "is_favorite": False,
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": 2,
                "title": "机器学习算法优化研究",
                "authors": "王五, 赵六",
                "year": 2023,
                "doi": "10.1000/abc456",
                "abstract": "本研究提出了一种新的机器学习算法优化方法...",
                "source": "arxiv",
                "url": "https://example.com/paper2",
                "file_path": None,
                "user_id": user_id,
                "is_favorite": False,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
        
        # 过滤结果
        filtered_results = mock_results[:request.max_results]
        
        return LiteratureSearchResponse(
            results=[LiteratureResponse(**result) for result in filtered_results],
            total=len(mock_results),
            success=True
        )
        
    except Exception as e:
        return LiteratureSearchResponse(
            results=[],
            total=0,
            success=False,
            error=str(e)
        )

# 文献数据库管理端点
@router.get("/", response_model=List[LiteratureResponse])
async def get_user_literature(
    user_id: int = 1,  # TODO: 从认证中获取
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取用户保存的文献列表"""
    try:
        literature = db.query(Literature).filter(
            Literature.user_id == user_id
        ).order_by(desc(Literature.created_at)).offset(skip).limit(limit).all()
        
        return [LiteratureResponse.from_orm(lit) for lit in literature]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save", response_model=LiteratureResponse)
async def save_literature(
    literature: LiteratureCreate,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """保存文献到用户收藏"""
    try:
        db_literature = Literature(
            title=literature.title,
            authors=literature.authors,
            year=literature.year,
            doi=literature.doi,
            abstract=literature.abstract,
            source=literature.source,
            url=literature.url,
            user_id=user_id
        )
        
        db.add(db_literature)
        db.commit()
        db.refresh(db_literature)
        
        return LiteratureResponse.from_orm(db_literature)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{literature_id}", response_model=LiteratureResponse)
async def update_literature(
    literature_id: int,
    literature_update: LiteratureUpdate,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """更新文献信息"""
    try:
        db_literature = db.query(Literature).filter(
            and_(Literature.id == literature_id, Literature.user_id == user_id)
        ).first()
        
        if not db_literature:
            raise HTTPException(status_code=404, detail="文献不存在")
        
        update_data = literature_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_literature, field, value)
        
        db.commit()
        db.refresh(db_literature)
        
        return LiteratureResponse.from_orm(db_literature)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{literature_id}")
async def delete_literature(
    literature_id: int,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """删除文献"""
    try:
        db_literature = db.query(Literature).filter(
            and_(Literature.id == literature_id, Literature.user_id == user_id)
        ).first()
        
        if not db_literature:
            raise HTTPException(status_code=404, detail="文献不存在")
        
        db.delete(db_literature)
        db.commit()
        
        return {"message": "文献删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{literature_id}/citation")
async def get_literature_citation(
    literature_id: int,
    format: str = "apa",
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """生成文献引用格式"""
    try:
        db_literature = db.query(Literature).filter(
            and_(Literature.id == literature_id, Literature.user_id == user_id)
        ).first()
        
        if not db_literature:
            raise HTTPException(status_code=404, detail="文献不存在")
        
        # 简单的引用格式生成逻辑
        if format.lower() == "apa":
            citation = f"{db_literature.authors} ({db_literature.year}). {db_literature.title}."
            if db_literature.doi:
                citation += f" https://doi.org/{db_literature.doi}"
        elif format.lower() == "mla":
            citation = f"{db_literature.authors}. \"{db_literature.title}.\" {db_literature.year}."
        else:
            citation = f"{db_literature.authors}. {db_literature.title}. {db_literature.year}."
        
        return {"citation": citation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cite", response_model=LiteratureAgentResponse)
async def generate_citation(request: LiteratureCitationRequest):
    """生成引用"""
    try:
        agent_request = AgentRequest(
            user_id=request.user_id,
            prompt="生成引用",
            agent_type=AgentType.LITERATURE,
            context={
                "action": "cite",
                "literature_data": request.literature_data,
                "style": request.style
            }
        )
        
        response = await agent_manager.process_request(agent_request)
        
        return LiteratureResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=LiteratureResponse)
async def analyze_literature(request: LiteratureAnalysisRequest):
    """分析文献"""
    try:
        agent_request = AgentRequest(
            user_id=request.user_id,
            prompt=request.query,
            agent_type=AgentType.LITERATURE,
            context={
                "action": "analyze",
                "literature_items": request.literature_items,
                "analysis_type": request.analysis_type
            }
        )
        
        response = await agent_manager.process_request(agent_request)
        
        return LiteratureResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_literature(file: UploadFile = File(...), user_id: int = 1):
    """上传文献文件"""
    try:
        # 检查文件类型
        allowed_types = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="不支持的文件类型")
        
        # 保存文件
        import os
        import uuid
        
        # 创建上传目录
        upload_dir = "uploads/literature"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 这里可以添加文件内容解析逻辑
        # 例如使用PyPDF2解析PDF文件，提取标题、作者等信息
        
        return {
            "success": True,
            "message": "文件上传成功",
            "file_path": file_path,
            "filename": file.filename,
            "size": len(content)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def get_literature_sources():
    """获取支持的文献数据源"""
    return {
        "sources": [
            {
                "value": "semantic_scholar",
                "label": "Semantic Scholar",
                "description": "免费的学术搜索引擎",
                "features": ["高质量文献", "引用分析", "多学科覆盖"]
            },
            {
                "value": "arxiv",
                "label": "ArXiv",
                "description": "预印本文献库",
                "features": ["最新研究", "开放获取", "理工科重点"]
            }
        ]
    }

@router.get("/citation-styles")
async def get_citation_styles():
    """获取支持的引用格式"""
    return {
        "styles": [
            {"value": "APA", "label": "APA格式", "description": "美国心理学会格式"},
            {"value": "MLA", "label": "MLA格式", "description": "现代语言协会格式"},
            {"value": "Chicago", "label": "Chicago格式", "description": "芝加哥手册格式"}
        ]
    }