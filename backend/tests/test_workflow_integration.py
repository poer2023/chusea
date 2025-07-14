"""
工作流引擎集成测试
测试完整的写作循环：Plan → Draft → Citation → Grammar → Readability
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from core.workflow_engine import WorkflowEngine
from core.workflow_models import WorkflowDocument, WorkflowStatus, NodeType, NodeStatus
from core.database_models import User


@pytest.fixture
async def workflow_engine():
    """创建工作流引擎实例"""
    engine = WorkflowEngine()
    return engine


@pytest.fixture
async def test_user(async_session: AsyncSession):
    """创建测试用户"""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    return user


@pytest.fixture
async def test_document(async_session: AsyncSession, test_user: User):
    """创建测试文档"""
    document = WorkflowDocument(
        title="Test Document",
        content="This is a test document for the AI writing workflow.",
        user_id=test_user.id,
        status=WorkflowStatus.IDLE
    )
    async_session.add(document)
    await async_session.commit()
    await async_session.refresh(document)
    return document


class TestWorkflowIntegration:
    """工作流集成测试"""

    @pytest.mark.asyncio
    async def test_complete_workflow_cycle(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试完整的工作流循环"""
        document_id = str(test_document.id)
        
        # 模拟LLM响应
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            mock_generate.side_effect = [
                "# Outline\n1. Introduction\n2. Main Content\n3. Conclusion",  # Plan
                "## Introduction\nThis is the introduction...",  # Draft
                "Grammar corrected version...",  # Grammar
            ]
            
            # 模拟引用验证
            with patch('core.citation_validator.citation_validator.validate_citations') as mock_citations:
                mock_citations.return_value = {"valid_citations": [], "invalid_citations": []}
                
                # 模拟可读性分析
                with patch('core.readability_analyzer.readability_analyzer.analyze_text') as mock_readability:
                    mock_readability.return_value = {"score": 75.0, "level": "Good"}
                    
                    # 启动工作流
                    result = await workflow_engine.start_workflow(
                        document_id=document_id,
                        user_prompt="Write a comprehensive guide about AI"
                    )
                    
                    assert result["success"] is True
                    assert result["workflow_id"] is not None

    @pytest.mark.asyncio
    async def test_workflow_with_low_readability_retry(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试可读性过低时的重试机制"""
        document_id = str(test_document.id)
        
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            mock_generate.side_effect = [
                "# Outline\n1. Introduction\n2. Main Content\n3. Conclusion",  # Plan
                "Complex content with difficult vocabulary...",  # Draft 1
                "Simplified content that is easier to read...",  # Draft 2 (retry)
                "Grammar corrected version...",  # Grammar
            ]
            
            with patch('core.citation_validator.citation_validator.validate_citations') as mock_citations:
                mock_citations.return_value = {"valid_citations": [], "invalid_citations": []}
                
                # 第一次可读性分析返回低分，第二次返回高分
                with patch('core.readability_analyzer.readability_analyzer.analyze_text') as mock_readability:
                    mock_readability.side_effect = [
                        {"score": 45.0, "level": "Difficult"},  # 第一次低分
                        {"score": 78.0, "level": "Good"}        # 重试后高分
                    ]
                    
                    result = await workflow_engine.start_workflow(
                        document_id=document_id,
                        user_prompt="Write a technical guide"
                    )
                    
                    assert result["success"] is True
                    # 验证重试逻辑被调用
                    assert mock_readability.call_count >= 2

    @pytest.mark.asyncio
    async def test_workflow_error_handling(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试工作流错误处理"""
        document_id = str(test_document.id)
        
        # 模拟LLM错误
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            mock_generate.side_effect = Exception("LLM API Error")
            
            result = await workflow_engine.start_workflow(
                document_id=document_id,
                user_prompt="Test error handling"
            )
            
            assert result["success"] is False
            assert "error" in result

    @pytest.mark.asyncio
    async def test_workflow_cancellation(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试工作流取消功能"""
        document_id = str(test_document.id)
        
        # 启动工作流
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            # 模拟长时间运行的任务
            async def slow_generate(*args, **kwargs):
                await asyncio.sleep(1)
                return "Generated content"
            
            mock_generate.side_effect = slow_generate
            
            # 启动工作流（不等待完成）
            workflow_task = asyncio.create_task(
                workflow_engine.start_workflow(
                    document_id=document_id,
                    user_prompt="Test cancellation"
                )
            )
            
            # 等待一小段时间，然后取消
            await asyncio.sleep(0.1)
            result = await workflow_engine.cancel_workflow(document_id)
            
            assert result["success"] is True
            
            # 取消任务
            workflow_task.cancel()
            try:
                await workflow_task
            except asyncio.CancelledError:
                pass

    @pytest.mark.asyncio
    async def test_workflow_status_tracking(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试工作流状态跟踪"""
        document_id = str(test_document.id)
        
        # 获取初始状态
        initial_status = await workflow_engine.get_workflow_status(document_id)
        assert initial_status["status"] == WorkflowStatus.IDLE.value
        
        # 模拟工作流的各个阶段
        status_updates = []
        
        with patch.object(workflow_engine, '_update_workflow_status') as mock_update:
            async def track_status(doc_id, status, **kwargs):
                status_updates.append(status)
                return {"success": True}
            
            mock_update.side_effect = track_status
            
            with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
                mock_generate.return_value = "Generated content"
                
                with patch('core.citation_validator.citation_validator.validate_citations') as mock_citations:
                    mock_citations.return_value = {"valid_citations": [], "invalid_citations": []}
                    
                    with patch('core.readability_analyzer.readability_analyzer.analyze_text') as mock_readability:
                        mock_readability.return_value = {"score": 80.0, "level": "Good"}
                        
                        await workflow_engine.start_workflow(
                            document_id=document_id,
                            user_prompt="Test status tracking"
                        )
                        
                        # 验证状态更新序列
                        expected_statuses = [
                            WorkflowStatus.PLANNING,
                            WorkflowStatus.DRAFTING,
                            WorkflowStatus.CITATION_CHECK,
                            WorkflowStatus.GRAMMAR_CHECK,
                            WorkflowStatus.READABILITY_CHECK,
                            WorkflowStatus.DONE
                        ]
                        
                        # 检查是否包含期望的状态
                        for status in expected_statuses:
                            assert status in status_updates

    @pytest.mark.asyncio
    async def test_workflow_with_custom_config(self, workflow_engine: WorkflowEngine, test_document: WorkflowDocument):
        """测试自定义配置的工作流"""
        document_id = str(test_document.id)
        
        # 自定义配置
        custom_config = {
            "readability_threshold": 85.0,
            "max_retries": 2,
            "writing_mode": "academic"
        }
        
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            mock_generate.return_value = "Academic style content"
            
            with patch('core.citation_validator.citation_validator.validate_citations') as mock_citations:
                mock_citations.return_value = {"valid_citations": [], "invalid_citations": []}
                
                with patch('core.readability_analyzer.readability_analyzer.analyze_text') as mock_readability:
                    mock_readability.return_value = {"score": 86.0, "level": "Excellent"}
                    
                    result = await workflow_engine.start_workflow(
                        document_id=document_id,
                        user_prompt="Write academic content",
                        config=custom_config
                    )
                    
                    assert result["success"] is True

    @pytest.mark.asyncio
    async def test_concurrent_workflows(self, workflow_engine: WorkflowEngine, async_session: AsyncSession, test_user: User):
        """测试并发工作流处理"""
        # 创建多个测试文档
        documents = []
        for i in range(3):
            doc = WorkflowDocument(
                title=f"Test Document {i}",
                content=f"Content for document {i}",
                user_id=test_user.id,
                status=WorkflowStatus.IDLE
            )
            async_session.add(doc)
            documents.append(doc)
        
        await async_session.commit()
        
        # 同时启动多个工作流
        tasks = []
        with patch.object(workflow_engine.llm_client, 'generate_text') as mock_generate:
            mock_generate.return_value = "Generated content"
            
            with patch('core.citation_validator.citation_validator.validate_citations') as mock_citations:
                mock_citations.return_value = {"valid_citations": [], "invalid_citations": []}
                
                with patch('core.readability_analyzer.readability_analyzer.analyze_text') as mock_readability:
                    mock_readability.return_value = {"score": 80.0, "level": "Good"}
                    
                    for doc in documents:
                        task = asyncio.create_task(
                            workflow_engine.start_workflow(
                                document_id=str(doc.id),
                                user_prompt=f"Process document {doc.title}"
                            )
                        )
                        tasks.append(task)
                    
                    # 等待所有任务完成
                    results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # 验证所有工作流都成功完成
                    for result in results:
                        if isinstance(result, dict):
                            assert result["success"] is True
                        else:
                            pytest.fail(f"Workflow failed with exception: {result}")