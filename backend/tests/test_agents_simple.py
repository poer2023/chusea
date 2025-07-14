"""
简化的Agent系统单元测试
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
import asyncio

from agents.writing_agent import WritingAgent
from agents.literature_agent import LiteratureAgent  
from agents.tools_agent import ToolsAgent
from core.agent_manager import AgentRequest, AgentType

class TestWritingAgentSimple:
    """写作Agent简化测试"""
    
    @pytest.fixture
    def writing_agent(self):
        """创建写作Agent实例"""
        return WritingAgent()
    
    @pytest.mark.asyncio
    async def test_academic_writing(self, writing_agent):
        """测试学术写作功能"""
        request = AgentRequest(
            user_id=1,
            document_id=None,
            prompt="请写一篇关于机器学习的论文摘要",
            agent_type=AgentType.WRITING,
            context={"mode": "academic"}
        )
        
        result = await writing_agent.process(request)
        assert result.content is not None
        assert len(result.content) > 0
        assert result.success == True
        assert result.agent_type == AgentType.WRITING
    
    @pytest.mark.asyncio
    async def test_blog_writing(self, writing_agent):
        """测试博客写作功能"""
        request = AgentRequest(
            user_id=1,
            document_id=None,
            prompt="写一篇关于AI技术的博客文章",
            agent_type=AgentType.WRITING,
            context={"mode": "blog"}
        )
        
        result = await writing_agent.process(request)
        assert result.content is not None
        assert len(result.content) > 0
        assert result.success == True
        assert "blog" in result.metadata["writing_mode"] or "博客" in result.content

class TestLiteratureAgentSimple:
    """文献Agent简化测试"""
    
    @pytest.fixture
    def literature_agent(self):
        """创建文献Agent实例"""
        return LiteratureAgent()
    
    @pytest.mark.asyncio
    async def test_literature_search(self, literature_agent):
        """测试文献搜索功能"""
        request = AgentRequest(
            user_id=1,
            document_id=None,
            prompt="machine learning",
            agent_type=AgentType.LITERATURE,
            context={"action": "search", "max_results": 5}
        )
        
        result = await literature_agent.process(request)
        assert result.content is not None
        assert result.success == True
        assert result.agent_type == AgentType.LITERATURE

class TestToolsAgentSimple:
    """工具Agent简化测试"""
    
    @pytest.fixture
    def tools_agent(self):
        """创建工具Agent实例"""
        return ToolsAgent()
    
    @pytest.mark.asyncio
    async def test_data_visualization(self, tools_agent):
        """测试数据可视化功能"""
        request = AgentRequest(
            user_id=1,
            document_id=None,
            prompt="生成一个柱状图",
            agent_type=AgentType.TOOLS,
            context={
                "tool_type": "chart_generation",
                "data": {"labels": ["A", "B", "C"], "values": [10, 20, 15]},
                "chart_type": "bar",
                "title": "测试图表"
            }
        )
        
        result = await tools_agent.process(request)
        assert result.content is not None
        assert result.success == True
        assert result.agent_type == AgentType.TOOLS

class TestAgentIntegrationSimple:
    """Agent集成简化测试"""
    
    @pytest.mark.asyncio
    async def test_all_agents_load(self):
        """测试所有Agent都能正常实例化"""
        writing_agent = WritingAgent()
        literature_agent = LiteratureAgent()
        tools_agent = ToolsAgent()
        
        assert writing_agent.agent_type == AgentType.WRITING
        assert literature_agent.agent_type == AgentType.LITERATURE
        assert tools_agent.agent_type == AgentType.TOOLS
    
    @pytest.mark.asyncio
    async def test_writing_agent_basic_functionality(self):
        """测试写作Agent基本功能"""
        writing_agent = WritingAgent()
        
        request = AgentRequest(
            user_id=1,
            document_id=None,
            prompt="测试写作功能",
            agent_type=AgentType.WRITING,
            context={}
        )
        
        result = await writing_agent.process(request)
        assert result is not None
        assert hasattr(result, 'success')
        assert hasattr(result, 'content')
        assert hasattr(result, 'agent_type')