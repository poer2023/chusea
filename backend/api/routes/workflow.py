"""
工作流API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from core.database import get_db
from core.auth import get_current_user
from core.workflow_models import WorkflowDocument, WorkflowNode, NodeMetrics, WorkflowStatus, NodeType, NodeStatus
from core.workflow_engine import workflow_engine
from core.database_models import User
from core.logging_config import logger
from core.websocket_manager import websocket_handler

router = APIRouter(prefix="/api/workflow", tags=["workflow"])

# Pydantic模型
class LoopConfig(BaseModel):
    readability_threshold: float = Field(default=70.0, ge=0, le=100)
    max_retries: int = Field(default=3, ge=1, le=10)
    auto_run: bool = Field(default=False)
    timeout: int = Field(default=60, ge=10, le=300)
    writing_mode: str = Field(default="academic")

class StartWorkflowRequest(BaseModel):
    document_id: str
    prompt: str
    config: Optional[LoopConfig] = None

class WorkflowResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class NodeResponse(BaseModel):
    id: str
    type: str
    status: str
    content: Optional[str] = None
    created_at: str
    retry_count: int
    metrics: Optional[Dict[str, Any]] = None

class WorkflowStatusResponse(BaseModel):
    document_id: str
    status: str
    progress: float
    current_node: Optional[NodeResponse] = None
    nodes: List[NodeResponse]

@router.post("/start", response_model=WorkflowResponse)
async def start_workflow(
    request: StartWorkflowRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """启动工作流循环"""
    try:
        # 验证文档所有权
        result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.id == request.document_id,
                WorkflowDocument.user_id == current_user.id
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # 更新文档配置
        if request.config:
            document.config = request.config.model_dump()
            await db.commit()
        
        # 启动工作流
        result = await workflow_engine.start_workflow(
            document_id=request.document_id,
            user_prompt=request.prompt
        )
        
        return WorkflowResponse(
            success=result["success"],
            message=result.get("message", ""),
            data={"task_id": result.get("task_id")} if result["success"] else None
        )
        
    except Exception as e:
        logger.error(f"Failed to start workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{document_id}/stop", response_model=WorkflowResponse)
async def stop_workflow(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """停止工作流循环"""
    try:
        # 验证文档所有权
        result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.id == document_id,
                WorkflowDocument.user_id == current_user.id
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # 停止工作流
        result = await workflow_engine.stop_workflow(document_id)
        
        return WorkflowResponse(
            success=result["success"],
            message=result.get("message", "")
        )
        
    except Exception as e:
        logger.error(f"Failed to stop workflow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{document_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取工作流状态"""
    try:
        # 验证文档所有权
        result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.id == document_id,
                WorkflowDocument.user_id == current_user.id
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # 获取工作流状态
        status_result = await workflow_engine.get_workflow_status(document_id)
        
        if not status_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=status_result["error"]
            )
        
        return WorkflowStatusResponse(**status_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{document_id}/rollback/{node_id}", response_model=WorkflowResponse)
async def rollback_to_node(
    document_id: str,
    node_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """回滚到指定节点"""
    try:
        # 验证文档所有权
        result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.id == document_id,
                WorkflowDocument.user_id == current_user.id
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # 验证节点存在
        node_result = await db.execute(
            select(WorkflowNode).where(
                WorkflowNode.id == node_id,
                WorkflowNode.document_id == document_id
            )
        )
        node = node_result.scalar_one_or_none()
        
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Node not found"
            )
        
        # 删除该节点之后的所有节点
        await db.execute(
            select(WorkflowNode).where(
                WorkflowNode.document_id == document_id,
                WorkflowNode.created_at > node.created_at
            ).delete()
        )
        
        # 根据节点类型重启工作流
        if node.type == NodeType.PLAN:
            await workflow_engine.start_workflow(document_id, node.content)
        elif node.type == NodeType.DRAFT:
            await workflow_engine.rollback_to_draft(document_id, "User rollback")
        
        await db.commit()
        
        return WorkflowResponse(
            success=True,
            message=f"Rolled back to {node.type.value} node"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to rollback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{document_id}/nodes", response_model=List[NodeResponse])
async def get_workflow_nodes(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取工作流节点历史"""
    try:
        # 验证文档所有权
        doc_result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.id == document_id,
                WorkflowDocument.user_id == current_user.id
            )
        )
        document = doc_result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # 获取节点列表
        result = await db.execute(
            select(WorkflowNode)
            .options(selectinload(WorkflowNode.metrics))
            .where(WorkflowNode.document_id == document_id)
            .order_by(WorkflowNode.created_at)
        )
        nodes = result.scalars().all()
        
        return [
            NodeResponse(
                id=node.id,
                type=node.type.value,
                status=node.status.value,
                content=node.content,
                created_at=node.created_at.isoformat(),
                retry_count=node.retry_count,
                metrics={
                    "readability_score": node.metrics.readability_score,
                    "grammar_errors": node.metrics.grammar_errors,
                    "citation_count": node.metrics.citation_count,
                    "word_count": node.metrics.word_count,
                    "processing_time": node.metrics.processing_time,
                } if node.metrics else None
            )
            for node in nodes
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow nodes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/documents", response_model=Dict[str, Any])
async def create_workflow_document(
    title: str,
    config: Optional[LoopConfig] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建新的工作流文档"""
    try:
        document = WorkflowDocument(
            user_id=current_user.id,
            title=title,
            content="",
            config=config.model_dump() if config else {
                "readability_threshold": 70.0,
                "max_retries": 3,
                "auto_run": False,
                "timeout": 60,
                "writing_mode": "academic"
            }
        )
        
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        return {
            "id": document.id,
            "title": document.title,
            "status": document.status.value,
            "config": document.config,
            "created_at": document.created_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to create workflow document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/documents", response_model=List[Dict[str, Any]])
async def get_workflow_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取用户的工作流文档列表"""
    try:
        result = await db.execute(
            select(WorkflowDocument).where(
                WorkflowDocument.user_id == current_user.id
            ).order_by(WorkflowDocument.updated_at.desc())
        )
        documents = result.scalars().all()
        
        return [
            {
                "id": doc.id,
                "title": doc.title,
                "status": doc.status.value,
                "config": doc.config,
                "created_at": doc.created_at.isoformat(),
                "updated_at": doc.updated_at.isoformat(),
                "word_count": len(doc.content.split()) if doc.content else 0
            }
            for doc in documents
        ]
        
    except Exception as e:
        logger.error(f"Failed to get workflow documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.websocket("/ws/{document_id}")
async def workflow_websocket(websocket: WebSocket, document_id: str):
    """工作流WebSocket连接"""
    try:
        await websocket_handler.handle_connection(websocket, document_id)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for document {document_id}")
    except Exception as e:
        logger.error(f"WebSocket error for document {document_id}: {str(e)}")
        await websocket.close()