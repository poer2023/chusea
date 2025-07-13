from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import re

from core.database import get_db, Document, User
from core.models import DocumentResponse, DocumentCreate, DocumentUpdate

router = APIRouter()

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int

def count_words(content: str) -> int:
    """计算文档字数"""
    if not content:
        return 0
    # 移除HTML标签
    text = re.sub(r'<[^>]+>', '', content)
    # 分别计算中文字符和英文单词
    chinese_chars = len(re.findall(r'[\u4e00-\u9fa5]', text))
    english_words = len(re.findall(r'\b[a-zA-Z]+\b', text))
    return chinese_chars + english_words

@router.get("/", response_model=DocumentListResponse)
async def get_documents(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    document_type: Optional[str] = Query(None, description="文档类型"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """获取文档列表"""
    try:
        # 构建查询
        query = db.query(Document).filter(
            and_(
                Document.user_id == user_id,
                Document.is_deleted == False
            )
        )
        
        # 按类型过滤
        if document_type:
            query = query.filter(Document.document_type == document_type)
        
        # 搜索过滤
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                Document.title.ilike(search_pattern) |
                Document.content.ilike(search_pattern)
            )
        
        # 获取总数
        total = query.count()
        
        # 分页和排序
        documents = query.order_by(desc(Document.updated_at)).offset(
            (page - 1) * page_size
        ).limit(page_size).all()
        
        return DocumentListResponse(
            documents=[DocumentResponse.from_orm(doc) for doc in documents],
            total=total,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文档列表失败: {str(e)}")

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """获取单个文档"""
    try:
        document = db.query(Document).filter(
            and_(
                Document.id == document_id,
                Document.user_id == user_id,
                Document.is_deleted == False
            )
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="文档不存在")
        
        return DocumentResponse.from_orm(document)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文档失败: {str(e)}")

@router.post("/", response_model=DocumentResponse)
async def create_document(
    document: DocumentCreate,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """创建新文档"""
    try:
        # 计算字数
        word_count = count_words(document.content or "")
        
        db_document = Document(
            title=document.title,
            content=document.content or "",
            document_type=document.document_type,
            user_id=user_id,
            word_count=word_count
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return DocumentResponse.from_orm(db_document)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建文档失败: {str(e)}")

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """更新文档"""
    try:
        db_document = db.query(Document).filter(
            and_(
                Document.id == document_id,
                Document.user_id == user_id,
                Document.is_deleted == False
            )
        ).first()
        
        if not db_document:
            raise HTTPException(status_code=404, detail="文档不存在")
        
        # 更新字段
        update_data = document_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_document, field, value)
        
        # 重新计算字数
        if hasattr(document_update, 'content') and document_update.content is not None:
            db_document.word_count = count_words(document_update.content)
        
        db_document.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(db_document)
        
        return DocumentResponse.from_orm(db_document)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新文档失败: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """删除文档（软删除）"""
    try:
        db_document = db.query(Document).filter(
            and_(
                Document.id == document_id,
                Document.user_id == user_id,
                Document.is_deleted == False
            )
        ).first()
        
        if not db_document:
            raise HTTPException(status_code=404, detail="文档不存在")
        
        # 软删除
        db_document.is_deleted = True
        db_document.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return {"message": "文档删除成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除文档失败: {str(e)}")

@router.post("/{document_id}/duplicate", response_model=DocumentResponse)
async def duplicate_document(
    document_id: int,
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """复制文档"""
    try:
        original_doc = db.query(Document).filter(
            and_(
                Document.id == document_id,
                Document.user_id == user_id,
                Document.is_deleted == False
            )
        ).first()
        
        if not original_doc:
            raise HTTPException(status_code=404, detail="原文档不存在")
        
        # 创建副本
        duplicate_doc = Document(
            title=f"{original_doc.title} - 副本",
            content=original_doc.content,
            document_type=original_doc.document_type,
            user_id=user_id,
            word_count=original_doc.word_count
        )
        
        db.add(duplicate_doc)
        db.commit()
        db.refresh(duplicate_doc)
        
        return DocumentResponse.from_orm(duplicate_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"复制文档失败: {str(e)}")

@router.get("/stats/overview")
async def get_document_stats(
    user_id: int = 1,  # TODO: 从认证中获取
    db: Session = Depends(get_db)
):
    """获取文档统计信息"""
    try:
        # 总文档数
        total_docs = db.query(Document).filter(
            and_(Document.user_id == user_id, Document.is_deleted == False)
        ).count()
        
        # 按类型分组统计
        type_stats = {}
        for doc_type in ['academic', 'blog', 'social']:
            count = db.query(Document).filter(
                and_(
                    Document.user_id == user_id,
                    Document.document_type == doc_type,
                    Document.is_deleted == False
                )
            ).count()
            type_stats[doc_type] = count
        
        # 总字数
        total_words = db.query(
            Document.word_count
        ).filter(
            and_(Document.user_id == user_id, Document.is_deleted == False)
        ).all()
        total_word_count = sum([doc.word_count or 0 for doc in total_words])
        
        return {
            "total_documents": total_docs,
            "document_types": type_stats,
            "total_words": total_word_count,
            "average_words_per_document": total_word_count // total_docs if total_docs > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")