"""
Agent系统集成测试
测试WritingAgent、LiteratureAgent和ToolsAgent的集成功能
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from agents.writing_agent import WritingAgent, WritingMode
from agents.literature_agent import LiteratureAgent
from agents.tools_agent import ToolsAgent
from core.agent_manager import agent_manager, AgentRequest, AgentType


class TestAgentIntegration:
    """Agent集成测试"""

    @pytest.fixture(autouse=True)
    def setup_agents(self):
        """设置测试前的Agent"""
        # 清理现有Agent
        agent_manager.agents.clear()
        
        # 注册测试Agent
        self.writing_agent = WritingAgent()
        self.literature_agent = LiteratureAgent()
        self.tools_agent = ToolsAgent()
        
        agent_manager.register_agent(self.writing_agent)
        agent_manager.register_agent(self.literature_agent)
        agent_manager.register_agent(self.tools_agent)

    @pytest.mark.asyncio
    async def test_writing_agent_academic_mode(self):
        """测试学术写作模式"""
        request = AgentRequest(
            prompt="Write an introduction for a research paper about machine learning",
            context={
                "mode": WritingMode.ACADEMIC.value,
                "topic": "machine learning",
                "target_length": 200
            }
        )
        
        with patch.object(self.writing_agent.llm_client, 'generate_text') as mock_generate:
            mock_generate.return_value = """
            ## Introduction
            
            Machine learning represents a paradigm shift in computational approaches to problem-solving,
            enabling systems to automatically improve their performance through experience without
            explicit programming for each specific task.
            """
            
            response = await self.writing_agent.process_request(request)
            
            assert response.success is True
            assert "machine learning" in response.content.lower()
            assert response.metadata["mode"] == WritingMode.ACADEMIC.value
            mock_generate.assert_called_once()

    @pytest.mark.asyncio
    async def test_writing_agent_blog_mode(self):
        """测试博客写作模式"""
        request = AgentRequest(
            prompt="Write a blog post introduction about productivity tips",
            context={
                "mode": WritingMode.BLOG.value,
                "tone": "conversational",
                "target_audience": "professionals"
            }
        )
        
        with patch.object(self.writing_agent.llm_client, 'generate_text') as mock_generate:
            mock_generate.return_value = """
            # 5 Productivity Tips That Actually Work
            
            Hey there, busy professionals! Tired of feeling like you're spinning your wheels all day?
            Let's dive into some productivity strategies that can actually make a difference in your daily routine.
            """
            
            response = await self.writing_agent.process_request(request)
            
            assert response.success is True
            assert "productivity" in response.content.lower()
            assert response.metadata["mode"] == WritingMode.BLOG.value

    @pytest.mark.asyncio
    async def test_writing_agent_social_mode(self):
        """测试社交媒体写作模式"""
        request = AgentRequest(
            prompt="Create a social media post about sustainable living",
            context={
                "mode": WritingMode.SOCIAL.value,
                "platform": "twitter",
                "hashtags": ["#sustainability", "#ecofriendly"]
            }
        )
        
        with patch.object(self.writing_agent.llm_client, 'generate_text') as mock_generate:
            mock_generate.return_value = """
            🌱 Small changes, big impact! Start your sustainable journey today:
            ♻️ Use reusable bags
            💡 Switch to LED bulbs
            🚲 Bike to work once a week
            
            What's your favorite eco-friendly tip? Share below! 👇
            #sustainability #ecofriendly #climateaction
            """
            
            response = await self.writing_agent.process_request(request)
            
            assert response.success is True
            assert "#sustainability" in response.content
            assert response.metadata["mode"] == WritingMode.SOCIAL.value

    @pytest.mark.asyncio
    async def test_literature_agent_search(self):
        """测试文献搜索功能"""
        request = AgentRequest(
            prompt="Find research papers about neural networks and deep learning",
            context={
                "search_terms": ["neural networks", "deep learning"],
                "max_results": 5,
                "source": "google_scholar"
            }
        )
        
        # 模拟文献搜索结果
        mock_results = [
            {
                "title": "Deep Learning Networks for Image Recognition",
                "authors": ["Smith, J.", "Doe, A."],
                "year": 2023,
                "doi": "10.1000/example.doi",
                "abstract": "This paper presents novel approaches to image recognition using deep neural networks..."
            },
            {
                "title": "Advances in Neural Network Architectures",
                "authors": ["Johnson, B.", "Wilson, C."],
                "year": 2023,
                "doi": "10.1000/example.doi2",
                "abstract": "We explore new architectural patterns in neural networks for improved performance..."
            }
        ]
        
        with patch.object(self.literature_agent, '_search_literature') as mock_search:
            mock_search.return_value = mock_results
            
            response = await self.literature_agent.process_request(request)
            
            assert response.success is True
            assert len(response.metadata["results"]) == 2
            assert "neural networks" in response.content.lower()
            mock_search.assert_called_once()

    @pytest.mark.asyncio
    async def test_literature_agent_citation_formatting(self):
        """测试引用格式化功能"""
        request = AgentRequest(
            prompt="Format citations in APA style",
            context={
                "citations": [
                    {
                        "title": "Machine Learning Fundamentals",
                        "authors": ["Brown, K.", "Taylor, M."],
                        "year": 2023,
                        "journal": "AI Research Journal",
                        "volume": 15,
                        "pages": "123-145"
                    }
                ],
                "format": "apa"
            }
        )
        
        with patch.object(self.literature_agent, '_format_citations') as mock_format:
            mock_format.return_value = [
                "Brown, K., & Taylor, M. (2023). Machine Learning Fundamentals. AI Research Journal, 15, 123-145."
            ]
            
            response = await self.literature_agent.process_request(request)
            
            assert response.success is True
            assert "Brown, K." in response.content
            assert "2023" in response.content
            mock_format.assert_called_once()

    @pytest.mark.asyncio
    async def test_tools_agent_grammar_check(self):
        """测试语法检查工具"""
        request = AgentRequest(
            prompt="Check grammar and style",
            context={
                "text": "This are a test sentence with grammer errors.",
                "tool": "grammar_check",
                "language": "en"
            }
        )
        
        mock_corrections = {
            "original": "This are a test sentence with grammer errors.",
            "corrected": "This is a test sentence with grammar errors.",
            "errors": [
                {"type": "grammar", "original": "are", "corrected": "is", "position": 5},
                {"type": "spelling", "original": "grammer", "corrected": "grammar", "position": 35}
            ]
        }
        
        with patch.object(self.tools_agent, '_check_grammar') as mock_grammar:
            mock_grammar.return_value = mock_corrections
            
            response = await self.tools_agent.process_request(request)
            
            assert response.success is True
            assert "This is a test sentence" in response.content
            assert len(response.metadata["errors"]) == 2
            mock_grammar.assert_called_once()

    @pytest.mark.asyncio
    async def test_tools_agent_readability_analysis(self):
        """测试可读性分析工具"""
        request = AgentRequest(
            prompt="Analyze readability",
            context={
                "text": "The quick brown fox jumps over the lazy dog. This is a simple sentence for testing.",
                "tool": "readability_analysis"
            }
        )
        
        mock_analysis = {
            "flesch_score": 75.5,
            "flesch_grade": 8.2,
            "readability_level": "Good",
            "suggestions": [
                "Consider varying sentence length for better flow",
                "Use more transition words between ideas"
            ]
        }
        
        with patch.object(self.tools_agent, '_analyze_readability') as mock_readability:
            mock_readability.return_value = mock_analysis
            
            response = await self.tools_agent.process_request(request)
            
            assert response.success is True
            assert response.metadata["flesch_score"] == 75.5
            assert "Good" in response.content
            mock_readability.assert_called_once()

    @pytest.mark.asyncio
    async def test_tools_agent_word_count(self):
        """测试字数统计工具"""
        request = AgentRequest(
            prompt="Count words and characters",
            context={
                "text": "This is a test document with multiple sentences. It contains various words and punctuation marks.",
                "tool": "word_count"
            }
        )
        
        with patch.object(self.tools_agent, '_count_words') as mock_count:
            mock_count.return_value = {
                "words": 16,
                "characters": 95,
                "characters_no_spaces": 78,
                "sentences": 2,
                "paragraphs": 1
            }
            
            response = await self.tools_agent.process_request(request)
            
            assert response.success is True
            assert response.metadata["words"] == 16
            assert response.metadata["characters"] == 95
            mock_count.assert_called_once()

    @pytest.mark.asyncio
    async def test_agent_manager_request_routing(self):
        """测试Agent管理器的请求路由"""
        # 测试写作请求路由
        writing_request = AgentRequest(
            prompt="Write a paragraph about AI",
            context={"mode": "academic"}
        )
        
        with patch.object(self.writing_agent, 'process_request') as mock_writing:
            mock_writing.return_value = Mock(success=True, content="AI content")
            
            response = await agent_manager.process_request(AgentType.WRITING, writing_request)
            
            assert response.success is True
            mock_writing.assert_called_once_with(writing_request)
        
        # 测试文献请求路由
        literature_request = AgentRequest(
            prompt="Search for papers about machine learning",
            context={"search_terms": ["machine learning"]}
        )
        
        with patch.object(self.literature_agent, 'process_request') as mock_literature:
            mock_literature.return_value = Mock(success=True, content="Literature results")
            
            response = await agent_manager.process_request(AgentType.LITERATURE, literature_request)
            
            assert response.success is True
            mock_literature.assert_called_once_with(literature_request)

    @pytest.mark.asyncio
    async def test_agent_error_handling(self):
        """测试Agent错误处理"""
        request = AgentRequest(
            prompt="Test error handling",
            context={}
        )
        
        # 模拟LLM客户端错误
        with patch.object(self.writing_agent.llm_client, 'generate_text') as mock_generate:
            mock_generate.side_effect = Exception("API Error")
            
            response = await self.writing_agent.process_request(request)
            
            assert response.success is False
            assert "error" in response.metadata
            assert "API Error" in response.metadata["error"]

    @pytest.mark.asyncio
    async def test_agent_request_validation(self):
        """测试Agent请求验证"""
        # 测试空请求
        empty_request = AgentRequest(prompt="", context={})
        
        response = await self.writing_agent.process_request(empty_request)
        assert response.success is False
        
        # 测试无效上下文
        invalid_request = AgentRequest(
            prompt="Write something",
            context={"mode": "invalid_mode"}
        )
        
        response = await self.writing_agent.process_request(invalid_request)
        # 应该使用默认模式而不是失败
        assert response.success is True

    @pytest.mark.asyncio
    async def test_agent_concurrent_requests(self):
        """测试Agent并发请求处理"""
        import asyncio
        
        requests = [
            AgentRequest(prompt=f"Write content {i}", context={"mode": "academic"})
            for i in range(3)
        ]
        
        with patch.object(self.writing_agent.llm_client, 'generate_text') as mock_generate:
            mock_generate.side_effect = [f"Generated content {i}" for i in range(3)]
            
            # 并发处理请求
            tasks = [
                self.writing_agent.process_request(req) for req in requests
            ]
            responses = await asyncio.gather(*tasks)
            
            # 验证所有请求都成功处理
            for i, response in enumerate(responses):
                assert response.success is True
                assert f"content {i}" in response.content.lower()
            
            assert mock_generate.call_count == 3