from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from core.agent_manager import agent_manager, AgentRequest, AgentType
from agents.writing_agent import WritingAgent
from core.auth import get_current_user

router = APIRouter()

# 初始化写作Agent
writing_agent = WritingAgent()
agent_manager.register_agent(writing_agent)

class WritingRequest(BaseModel):
    prompt: str
    document_id: Optional[int] = None
    mode: str = "academic"  # academic, blog, social
    context: Dict[str, Any] = {}

class WritingResponse(BaseModel):
    content: str
    success: bool
    metadata: Dict[str, Any]
    tokens_used: int
    error: Optional[str] = None

@router.post("/generate", response_model=WritingResponse)
async def generate_writing(
    request: WritingRequest,
    current_user = Depends(get_current_user)
):
    """生成写作内容"""
    try:
        # 准备Agent请求
        agent_request = AgentRequest(
            user_id=current_user.id,
            document_id=request.document_id,
            prompt=request.prompt,
            agent_type=AgentType.WRITING,
            context={
                "mode": request.mode,
                **request.context
            }
        )
        
        # 处理请求
        response = await agent_manager.process_request(agent_request)
        
        return WritingResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve")
async def improve_writing(
    request: WritingRequest,
    current_user = Depends(get_current_user)
):
    """改进写作内容"""
    try:
        # 为改进任务添加特定上下文
        improve_context = {
            "task_type": "improve",
            "mode": request.mode,
            **request.context
        }
        
        agent_request = AgentRequest(
            user_id=current_user.id,
            document_id=request.document_id,
            prompt=f"请改进以下内容：\n{request.prompt}",
            agent_type=AgentType.WRITING,
            context=improve_context
        )
        
        response = await agent_manager.process_request(agent_request)
        
        return WritingResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert")
async def convert_writing_mode(
    request: WritingRequest,
    current_user = Depends(get_current_user)
):
    """转换写作模式"""
    try:
        target_mode = request.context.get("target_mode", "blog")
        
        convert_context = {
            "task_type": "convert",
            "source_mode": request.mode,
            "target_mode": target_mode,
            **request.context
        }
        
        agent_request = AgentRequest(
            user_id=current_user.id,
            document_id=request.document_id,
            prompt=f"请将以下{request.mode}内容转换为{target_mode}格式：\n{request.prompt}",
            agent_type=AgentType.WRITING,
            context=convert_context
        )
        
        response = await agent_manager.process_request(agent_request)
        
        return WritingResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions/{mode}")
async def get_writing_suggestions(mode: str):
    """获取写作建议"""
    try:
        suggestions = writing_agent.get_writing_suggestions("", mode)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
async def get_writing_modes():
    """获取支持的写作模式"""
    return {
        "modes": [
            {"value": "academic", "label": "学术写作", "description": "适用于论文、研究报告等学术文档"},
            {"value": "blog", "label": "博客写作", "description": "适用于博客文章、技术分享等"},
            {"value": "social", "label": "社交媒体", "description": "适用于推文、朋友圈等社交媒体内容"}
        ]
    }