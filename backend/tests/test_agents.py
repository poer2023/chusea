"""
Agent系统单元测试
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
import asyncio

from agents.writing_agent import WritingAgent
from agents.literature_agent import LiteratureAgent  
from agents.tools_agent import ToolsAgent
from core.models import WritingRequest, LiteratureSearchRequest, ChartGenerationRequest
from core.agent_manager import AgentRequest, AgentType

class TestWritingAgent:
    """写作Agent测试"""
    
    @pytest.fixture
    def writing_agent(self):
        """创建写作Agent实例"""
        return WritingAgent()
    
    @pytest.mark.asyncio
    async def test_academic_writing(self, writing_agent):
        """测试学术写作功能"""
        request = AgentRequest(
            prompt="请写一篇关于机器学习的论文摘要",
            agent_type=AgentType.WRITING,
            user_id=1,
            context={"mode": "academic"}
        )
        
        result = await writing_agent.process(request)
        assert result.content is not None
        assert len(result.content) > 0
        assert result.success == True
    
    @pytest.mark.asyncio
    async def test_blog_writing(self, writing_agent):
        """测试博客写作功能"""
        request = AgentRequest(
            prompt="写一篇关于AI技术的博客文章",
            agent_type=AgentType.WRITING,
            user_id=1,
            context={"mode": "blog"}
        )
        
        result = await writing_agent.process(request)
        assert result.content is not None
        assert len(result.content) > 0
        assert result.success == True
    
    @pytest.mark.asyncio
    async def test_text_enhancement(self, writing_agent):
        """测试文本增强功能"""
        content = "这是一个需要改进的文本。"
        
        with patch.object(writing_agent, '_call_llm') as mock_llm:
            mock_llm.return_value = "这是一个经过改进和优化的高质量文本。"
            
            result = await writing_agent.enhance(content, "grammar")
            assert result.content != content
            assert len(result.content) > len(content)
    
    @pytest.mark.asyncio
    async def test_format_text(self, writing_agent):
        """测试文本格式化功能"""
        content = "标题\n内容"
        
        with patch.object(writing_agent, '_apply_formatting') as mock_format:
            mock_format.return_value = "# 标题\n\n内容"
            
            result = await writing_agent.format_text(content, "markdown")
            assert "# " in result.content
            mock_format.assert_called_once()

class TestLiteratureAgent:
    """文献Agent测试"""
    
    @pytest.fixture
    def literature_agent(self):
        """创建文献Agent实例"""
        return LiteratureAgent()
    
    @pytest.mark.asyncio
    async def test_search_papers(self, literature_agent):
        """测试论文搜索功能"""
        query = LiteratureSearchRequest(
            query="machine learning",
            max_results=10
        )
        
        mock_results = [
            {
                "title": "Machine Learning Fundamentals",
                "authors": ["Author A", "Author B"],
                "year": 2024,
                "abstract": "This paper discusses ML fundamentals..."
            }
        ]
        
        with patch.object(literature_agent, '_search_google_scholar') as mock_search:
            mock_search.return_value = mock_results
            
            result = await literature_agent.search(query)
            assert len(result.papers) > 0
            assert result.papers[0]["title"] == "Machine Learning Fundamentals"
    
    @pytest.mark.asyncio
    async def test_generate_citation(self, literature_agent):
        """测试引用生成功能"""
        paper_metadata = {
            "title": "Test Paper",
            "authors": ["John Doe", "Jane Smith"],
            "year": 2024,
            "journal": "Test Journal",
            "volume": "1",
            "pages": "1-10"
        }
        
        citation = await literature_agent.generate_citation(paper_metadata, "APA")
        assert "Doe, J." in citation
        assert "2024" in citation
        assert "Test Paper" in citation
    
    @pytest.mark.asyncio
    async def test_validate_citations(self, literature_agent):
        """测试引用验证功能"""
        citations = [
            "Doe, J. (2024). Test paper. Test Journal, 1(1), 1-10.",
            "Invalid citation format here"
        ]
        
        result = await literature_agent.validate_citations(citations, "APA")
        assert len(result.results) == 2
        assert result.results[0]["valid"] == True
        assert result.results[1]["valid"] == False
    
    @pytest.mark.asyncio
    async def test_extract_references(self, literature_agent):
        """测试参考文献提取功能"""
        text = """
        根据Smith (2024)的研究，机器学习技术正在快速发展。
        另外，Johnson et al. (2023)也指出了类似的观点。
        """
        
        with patch.object(literature_agent, '_extract_citation_patterns') as mock_extract:
            mock_extract.return_value = ["Smith (2024)", "Johnson et al. (2023)"]
            
            references = await literature_agent.extract_references(text)
            assert len(references) == 2
            assert "Smith" in references[0]

class TestToolsAgent:
    """工具Agent测试"""
    
    @pytest.fixture
    def tools_agent(self):
        """创建工具Agent实例"""
        return ToolsAgent()
    
    @pytest.mark.asyncio
    async def test_generate_chart(self, tools_agent):
        """测试图表生成功能"""
        request = ChartGenerationRequest(
            data={"x": [1, 2, 3], "y": [10, 20, 15]},
            chart_type="line",
            title="测试图表"
        )
        
        with patch('matplotlib.pyplot.savefig') as mock_savefig:
            mock_savefig.return_value = None
            
            result = await tools_agent.generate_chart(request)
            assert result.chart_url is not None
            assert result.chart_type == "line"
    
    @pytest.mark.asyncio
    async def test_analyze_data(self, tools_agent):
        """测试数据分析功能"""
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        
        result = await tools_agent.analyze_data(data, "descriptive")
        assert "mean" in result.statistics
        assert "std" in result.statistics
        assert result.statistics["mean"] == 5.5
    
    @pytest.mark.asyncio
    async def test_convert_format(self, tools_agent):
        """测试格式转换功能"""
        content = "# 标题\n\n这是内容"
        
        result = await tools_agent.convert_format(content, "markdown", "html")
        assert "<h1>" in result.content
        assert "<p>" in result.content
    
    @pytest.mark.asyncio
    async def test_generate_table(self, tools_agent):
        """测试表格生成功能"""
        data = [
            {"name": "张三", "age": 25, "city": "北京"},
            {"name": "李四", "age": 30, "city": "上海"}
        ]
        
        result = await tools_agent.generate_table(data, "markdown")
        assert "|" in result.content
        assert "张三" in result.content
        assert "李四" in result.content

class TestAgentIntegration:
    """Agent集成测试"""
    
    @pytest.mark.asyncio
    async def test_multi_agent_workflow(self):
        """测试多Agent协作工作流"""
        writing_agent = WritingAgent()
        literature_agent = LiteratureAgent()
        tools_agent = ToolsAgent()
        
        # 模拟完整的写作工作流
        with patch.object(literature_agent, 'search') as mock_search, \
             patch.object(writing_agent, 'assist') as mock_write, \
             patch.object(tools_agent, 'generate_chart') as mock_chart:
            
            # 模拟文献搜索结果
            mock_search.return_value = Mock(papers=[
                {"title": "AI Research", "authors": ["Expert A"], "year": 2024}
            ])
            
            # 模拟写作结果
            mock_write.return_value = Mock(content="根据最新研究，AI技术...")
            
            # 模拟图表生成
            mock_chart.return_value = Mock(chart_url="chart.png", chart_type="bar")
            
            # 执行工作流
            literature_result = await literature_agent.search(
                LiteratureSearchRequest(query="AI research", max_results=5)
            )
            writing_result = await writing_agent.assist(
                WritingRequest(prompt="写一篇AI综述")
            )
            chart_result = await tools_agent.generate_chart(
                ChartGenerationRequest(data={"x": [1, 2], "y": [3, 4]}, chart_type="bar")
            )
            
            # 验证结果
            assert literature_result.papers is not None
            assert writing_result.content is not None
            assert chart_result.chart_url is not None
    
    @pytest.mark.asyncio
    async def test_error_handling_in_agents(self):
        """测试Agent错误处理"""
        writing_agent = WritingAgent()
        
        with patch.object(writing_agent, '_call_llm') as mock_llm:
            mock_llm.side_effect = Exception("LLM服务不可用")
            
            with pytest.raises(Exception) as exc_info:
                await writing_agent.assist(WritingRequest(
                    prompt="测试内容"
                ))
            
            assert "LLM服务不可用" in str(exc_info.value)