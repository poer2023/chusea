"""
循环引擎核心模块
实现Plan→Draft→Citation→Grammar→Readability的自动循环
"""
import asyncio
import json
import time
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from celery import Celery
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from .workflow_models import (
    WorkflowDocument, WorkflowNode, NodeMetrics, Citation,
    WorkflowStatus, NodeType, NodeStatus
)
from .database import get_db
from .llm_client import LLMClient
from .logging_config import logger
from .citation_validator import citation_validator
from .readability_analyzer import readability_analyzer


class WorkflowEngine:
    """工作流引擎"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.celery = Celery('workflow', broker=redis_url, backend=redis_url)
        self.llm_client = LLMClient()
        self.setup_tasks()
        
    def setup_tasks(self):
        """设置Celery任务"""
        
        @self.celery.task(bind=True)
        async def plan_document(self, document_id: str, user_prompt: str):
            """Plan阶段: 生成文档大纲"""
            try:
                logger.info(f"Starting plan phase for document {document_id}")
                
                async with get_db() as db:
                    # 获取文档
                    result = await db.execute(
                        select(WorkflowDocument).where(WorkflowDocument.id == document_id)
                    )
                    document = result.scalar_one_or_none()
                    if not document:
                        raise ValueError(f"Document {document_id} not found")
                    
                    # 创建Plan节点
                    plan_node = WorkflowNode(
                        document_id=document_id,
                        type=NodeType.PLAN,
                        status=NodeStatus.RUNNING,
                        content=user_prompt
                    )
                    db.add(plan_node)
                    await db.commit()
                    await db.refresh(plan_node)
                    
                    start_time = time.time()
                    
                    try:
                        # 调用LLM生成大纲
                        outline = await self.llm_client.generate_outline(
                            user_prompt, 
                            document.config.get('writing_mode', 'academic')
                        )
                        
                        processing_time = int((time.time() - start_time) * 1000)
                        
                        # 更新节点状态
                        plan_node.status = NodeStatus.PASS
                        plan_node.content = outline
                        
                        # 添加指标
                        metrics = NodeMetrics(
                            node_id=plan_node.id,
                            word_count=len(outline.split()),
                            processing_time=processing_time
                        )
                        db.add(metrics)
                        
                        await db.commit()
                        
                        logger.info(f"Plan phase completed for document {document_id}")
                        
                        # 触发下一阶段
                        draft_document.delay(document_id, outline)
                        
                        return {"success": True, "outline": outline, "node_id": plan_node.id}
                        
                    except Exception as e:
                        # 标记节点失败
                        plan_node.status = NodeStatus.FAIL
                        await db.commit()
                        raise e
                        
            except Exception as e:
                logger.error(f"Plan phase failed for document {document_id}: {str(e)}")
                return {"success": False, "error": str(e)}
        
        @self.celery.task(bind=True)
        async def draft_document(self, document_id: str, outline: str):
            """Draft阶段: 基于大纲生成内容"""
            try:
                logger.info(f"Starting draft phase for document {document_id}")
                
                async with get_db() as db:
                    # 获取文档
                    result = await db.execute(
                        select(WorkflowDocument).where(WorkflowDocument.id == document_id)
                    )
                    document = result.scalar_one_or_none()
                    if not document:
                        raise ValueError(f"Document {document_id} not found")
                    
                    # 创建Draft节点
                    draft_node = WorkflowNode(
                        document_id=document_id,
                        type=NodeType.DRAFT,
                        status=NodeStatus.RUNNING,
                        content=outline
                    )
                    db.add(draft_node)
                    await db.commit()
                    await db.refresh(draft_node)
                    
                    start_time = time.time()
                    
                    try:
                        # 调用LLM生成内容
                        content = await self.llm_client.generate_content(
                            outline,
                            document.config.get('writing_mode', 'academic'),
                            document.config.get('target_word_count', 2000)
                        )
                        
                        processing_time = int((time.time() - start_time) * 1000)
                        
                        # 更新节点和文档
                        draft_node.status = NodeStatus.PASS
                        draft_node.content = content
                        document.content = content
                        document.status = WorkflowStatus.CITATION_CHECK
                        
                        # 添加指标
                        metrics = NodeMetrics(
                            node_id=draft_node.id,
                            word_count=len(content.split()),
                            processing_time=processing_time
                        )
                        db.add(metrics)
                        
                        await db.commit()
                        
                        logger.info(f"Draft phase completed for document {document_id}")
                        
                        # 触发引用检查
                        check_citations.delay(document_id, content)
                        
                        return {"success": True, "content": content, "node_id": draft_node.id}
                        
                    except Exception as e:
                        # 标记节点失败
                        draft_node.status = NodeStatus.FAIL
                        await db.commit()
                        raise e
                        
            except Exception as e:
                logger.error(f"Draft phase failed for document {document_id}: {str(e)}")
                return {"success": False, "error": str(e)}
        
        @self.celery.task(bind=True)
        async def check_citations(self, document_id: str, content: str):
            """Citation阶段: 验证和格式化引用"""
            try:
                logger.info(f"Starting citation check for document {document_id}")
                
                async with get_db() as db:
                    # 创建Citation节点
                    citation_node = WorkflowNode(
                        document_id=document_id,
                        type=NodeType.CITATION,
                        status=NodeStatus.RUNNING,
                        content=content
                    )
                    db.add(citation_node)
                    await db.commit()
                    await db.refresh(citation_node)
                    
                    start_time = time.time()
                    
                    try:
                        # 验证引用
                        validation_result = await citation_validator.validate_bibliography(content)
                        
                        # 检查验证率
                        validation_rate = validation_result.get('validation_rate', 0.0)
                        citation_count = validation_result.get('total_citations', 0)
                        
                        if validation_rate < 0.8 and citation_count > 0:
                            # 引用验证失败，需要回退
                            citation_node.status = NodeStatus.FAIL
                            await db.commit()
                            
                            # 增加重试计数
                            result = await db.execute(
                                select(WorkflowDocument).where(WorkflowDocument.id == document_id)
                            )
                            document = result.scalar_one_or_none()
                            max_retries = document.config.get('max_retries', 3)
                            
                            if citation_node.retry_count < max_retries:
                                citation_node.retry_count += 1
                                await db.commit()
                                # 回退到Draft重新生成
                                await self.rollback_to_draft(document_id, f"Citation validation failed: {validation_rate:.1%} success rate")
                                return {"success": False, "error": "Citation validation failed, retrying"}
                            else:
                                raise ValueError("Max retries exceeded for citation validation")
                        
                        # 引用验证通过，保持原内容
                        formatted_content = content
                        processing_time = int((time.time() - start_time) * 1000)
                        
                        # 更新节点
                        citation_node.status = NodeStatus.PASS
                        citation_node.content = formatted_content
                        
                        # 添加指标
                        metrics = NodeMetrics(
                            node_id=citation_node.id,
                            citation_count=citation_count,
                            processing_time=processing_time
                        )
                        db.add(metrics)
                        
                        await db.commit()
                        
                        logger.info(f"Citation check completed for document {document_id}")
                        
                        # 触发语法检查
                        check_grammar.delay(document_id, formatted_content)
                        
                        return {"success": True, "content": formatted_content, "node_id": citation_node.id}
                        
                    except Exception as e:
                        citation_node.status = NodeStatus.FAIL
                        await db.commit()
                        raise e
                        
            except Exception as e:
                logger.error(f"Citation check failed for document {document_id}: {str(e)}")
                return {"success": False, "error": str(e)}
        
        @self.celery.task(bind=True)
        async def check_grammar(self, document_id: str, content: str):
            """Grammar阶段: 语法检查和修正"""
            try:
                logger.info(f"Starting grammar check for document {document_id}")
                
                async with get_db() as db:
                    # 创建Grammar节点
                    grammar_node = WorkflowNode(
                        document_id=document_id,
                        type=NodeType.GRAMMAR,
                        status=NodeStatus.RUNNING,
                        content=content
                    )
                    db.add(grammar_node)
                    await db.commit()
                    await db.refresh(grammar_node)
                    
                    start_time = time.time()
                    
                    try:
                        # 语法检查
                        grammar_result = await self.llm_client.check_grammar(content)
                        grammar_errors = grammar_result.get('errors', 0)
                        corrected_content = grammar_result.get('corrected_content', content)
                        
                        processing_time = int((time.time() - start_time) * 1000)
                        
                        # 判断是否通过
                        if grammar_errors > 5:  # 错误太多，需要重写
                            grammar_node.status = NodeStatus.FAIL
                            grammar_node.retry_count += 1
                            await db.commit()
                            
                            # 检查重试次数
                            result = await db.execute(
                                select(WorkflowDocument).where(WorkflowDocument.id == document_id)
                            )
                            document = result.scalar_one_or_none()
                            max_retries = document.config.get('max_retries', 3)
                            
                            if grammar_node.retry_count < max_retries:
                                await self.rollback_to_draft(document_id, f"Too many grammar errors: {grammar_errors}")
                                return {"success": False, "error": "Grammar check failed, retrying"}
                            else:
                                raise ValueError("Max retries exceeded for grammar check")
                        
                        # 更新节点
                        grammar_node.status = NodeStatus.PASS
                        grammar_node.content = corrected_content
                        
                        # 添加指标
                        metrics = NodeMetrics(
                            node_id=grammar_node.id,
                            grammar_errors=grammar_errors,
                            processing_time=processing_time
                        )
                        db.add(metrics)
                        
                        await db.commit()
                        
                        logger.info(f"Grammar check completed for document {document_id}")
                        
                        # 触发可读性检查
                        check_readability.delay(document_id, corrected_content)
                        
                        return {"success": True, "content": corrected_content, "node_id": grammar_node.id}
                        
                    except Exception as e:
                        grammar_node.status = NodeStatus.FAIL
                        await db.commit()
                        raise e
                        
            except Exception as e:
                logger.error(f"Grammar check failed for document {document_id}: {str(e)}")
                return {"success": False, "error": str(e)}
        
        @self.celery.task(bind=True)
        async def check_readability(self, document_id: str, content: str):
            """Readability阶段: 可读性检测"""
            try:
                logger.info(f"Starting readability check for document {document_id}")
                
                async with get_db() as db:
                    # 获取文档配置
                    result = await db.execute(
                        select(WorkflowDocument).where(WorkflowDocument.id == document_id)
                    )
                    document = result.scalar_one_or_none()
                    if not document:
                        raise ValueError(f"Document {document_id} not found")
                    
                    readability_threshold = document.config.get('readability_threshold', 70.0)
                    
                    # 创建Readability节点
                    readability_node = WorkflowNode(
                        document_id=document_id,
                        type=NodeType.READABILITY,
                        status=NodeStatus.RUNNING,
                        content=content
                    )
                    db.add(readability_node)
                    await db.commit()
                    await db.refresh(readability_node)
                    
                    start_time = time.time()
                    
                    try:
                        # 可读性检测
                        readability_report = readability_analyzer.get_readability_report(content)
                        readability_score = readability_report.get("flesch_score", 0)
                        
                        processing_time = int((time.time() - start_time) * 1000)
                        
                        if readability_score < readability_threshold:
                            # 可读性不达标，需要重写
                            readability_node.status = NodeStatus.FAIL
                            readability_node.retry_count += 1
                            
                            # 添加指标（即使失败也要记录）
                            metrics = NodeMetrics(
                                node_id=readability_node.id,
                                readability_score=readability_score,
                                word_count=readability_report.get("statistics", {}).get("words", 0),
                                processing_time=processing_time
                            )
                            db.add(metrics)
                            await db.commit()
                            
                            # 检查重试次数
                            max_retries = document.config.get('max_retries', 3)
                            if readability_node.retry_count < max_retries:
                                await self.rollback_to_draft(document_id, 
                                    f"Readability score {readability_score} below threshold {readability_threshold}")
                                return {"success": False, "error": "Readability check failed, retrying"}
                            else:
                                raise ValueError("Max retries exceeded for readability check")
                        
                        # 可读性达标，工作流完成
                        readability_node.status = NodeStatus.PASS
                        document.status = WorkflowStatus.DONE
                        document.content = content
                        document.updated_at = datetime.utcnow()
                        
                        # 添加指标
                        metrics = NodeMetrics(
                            node_id=readability_node.id,
                            readability_score=readability_score,
                            word_count=readability_report.get("statistics", {}).get("words", 0),
                            processing_time=processing_time
                        )
                        db.add(metrics)
                        
                        await db.commit()
                        
                        logger.info(f"Workflow completed successfully for document {document_id}")
                        
                        return {
                            "success": True, 
                            "content": content, 
                            "readability_score": readability_score,
                            "node_id": readability_node.id
                        }
                        
                    except Exception as e:
                        readability_node.status = NodeStatus.FAIL
                        await db.commit()
                        raise e
                        
            except Exception as e:
                logger.error(f"Readability check failed for document {document_id}: {str(e)}")
                return {"success": False, "error": str(e)}
    
    async def start_workflow(self, document_id: str, user_prompt: str) -> Dict[str, Any]:
        """启动工作流"""
        try:
            async with get_db() as db:
                # 更新文档状态
                await db.execute(
                    update(WorkflowDocument)
                    .where(WorkflowDocument.id == document_id)
                    .values(status=WorkflowStatus.PLANNING, updated_at=datetime.utcnow())
                )
                await db.commit()
            
            # 启动Plan阶段
            result = self.celery.send_task('workflow.plan_document', args=[document_id, user_prompt])
            
            return {
                "success": True,
                "message": "Workflow started",
                "task_id": result.id
            }
            
        except Exception as e:
            logger.error(f"Failed to start workflow for document {document_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def stop_workflow(self, document_id: str) -> Dict[str, Any]:
        """停止工作流"""
        try:
            async with get_db() as db:
                await db.execute(
                    update(WorkflowDocument)
                    .where(WorkflowDocument.id == document_id)
                    .values(status=WorkflowStatus.IDLE, updated_at=datetime.utcnow())
                )
                await db.commit()
            
            return {"success": True, "message": "Workflow stopped"}
            
        except Exception as e:
            logger.error(f"Failed to stop workflow for document {document_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_workflow_status(self, document_id: str) -> Dict[str, Any]:
        """获取工作流状态"""
        try:
            async with get_db() as db:
                result = await db.execute(
                    select(WorkflowDocument)
                    .options(selectinload(WorkflowDocument.nodes))
                    .where(WorkflowDocument.id == document_id)
                )
                document = result.scalar_one_or_none()
                
                if not document:
                    return {"success": False, "error": "Document not found"}
                
                # 计算进度
                total_phases = 5  # Plan, Draft, Citation, Grammar, Readability
                completed_phases = len([node for node in document.nodes if node.status == NodeStatus.PASS])
                progress = (completed_phases / total_phases) * 100
                
                return {
                    "success": True,
                    "document_id": document_id,
                    "status": document.status.value,
                    "progress": progress,
                    "nodes": [
                        {
                            "id": node.id,
                            "type": node.type.value,
                            "status": node.status.value,
                            "created_at": node.created_at.isoformat(),
                            "retry_count": node.retry_count
                        }
                        for node in document.nodes
                    ]
                }
                
        except Exception as e:
            logger.error(f"Failed to get workflow status for document {document_id}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def rollback_to_draft(self, document_id: str, reason: str):
        """回退到Draft阶段重新生成"""
        try:
            async with get_db() as db:
                # 获取最新的Plan节点内容
                result = await db.execute(
                    select(WorkflowNode)
                    .where(
                        WorkflowNode.document_id == document_id,
                        WorkflowNode.type == NodeType.PLAN,
                        WorkflowNode.status == NodeStatus.PASS
                    )
                    .order_by(WorkflowNode.created_at.desc())
                    .limit(1)
                )
                plan_node = result.scalar_one_or_none()
                
                if plan_node:
                    # 重新触发Draft阶段
                    self.celery.send_task('workflow.draft_document', 
                                        args=[document_id, plan_node.content])
                    logger.info(f"Rolled back to draft for document {document_id}: {reason}")
                
        except Exception as e:
            logger.error(f"Failed to rollback to draft for document {document_id}: {str(e)}")
    
    # 引用和可读性检测现在使用专门的模块


# 全局工作流引擎实例
workflow_engine = WorkflowEngine()