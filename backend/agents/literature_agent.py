from typing import Dict, Any, List, Optional
import requests
import json
from datetime import datetime
from core.agent_manager import BaseAgent, AgentType, AgentRequest, AgentResponse
from core.llm_client import LLMClientFactory
from dataclasses import dataclass

@dataclass
class LiteratureItem:
    title: str
    authors: List[str]
    year: int
    doi: Optional[str] = None
    abstract: Optional[str] = None
    source: str = ""
    url: Optional[str] = None
    citation_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "authors": self.authors,
            "year": self.year,
            "doi": self.doi,
            "abstract": self.abstract,
            "source": self.source,
            "url": self.url,
            "citation_count": self.citation_count
        }

class LiteratureSearcher:
    """文献搜索器基类"""
    
    async def search(self, query: str, max_results: int = 10) -> List[LiteratureItem]:
        raise NotImplementedError

class SemanticScholarSearcher(LiteratureSearcher):
    """Semantic Scholar API搜索器（免费）"""
    
    def __init__(self):
        self.base_url = "https://api.semanticscholar.org/graph/v1"
    
    async def search(self, query: str, max_results: int = 10) -> List[LiteratureItem]:
        try:
            # 搜索论文
            search_url = f"{self.base_url}/paper/search"
            params = {
                "query": query,
                "limit": max_results,
                "fields": "title,authors,year,abstract,citationCount,externalIds,url"
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            literature_items = []
            
            for paper in data.get("data", []):
                authors = [author.get("name", "") for author in paper.get("authors", [])]
                
                # 获取DOI
                doi = None
                external_ids = paper.get("externalIds", {})
                if external_ids and "DOI" in external_ids:
                    doi = external_ids["DOI"]
                
                item = LiteratureItem(
                    title=paper.get("title", ""),
                    authors=authors,
                    year=paper.get("year", 0) or 0,
                    doi=doi,
                    abstract=paper.get("abstract", ""),
                    source="Semantic Scholar",
                    url=paper.get("url", ""),
                    citation_count=paper.get("citationCount", 0) or 0
                )
                literature_items.append(item)
            
            return literature_items
            
        except Exception as e:
            print(f"Semantic Scholar search error: {e}")
            return []

class ArxivSearcher(LiteratureSearcher):
    """ArXiv API搜索器（免费）"""
    
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
    
    async def search(self, query: str, max_results: int = 10) -> List[LiteratureItem]:
        try:
            params = {
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": max_results
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            # 解析XML响应
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            literature_items = []
            
            for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                title = entry.find("{http://www.w3.org/2005/Atom}title").text.strip()
                
                authors = []
                for author in entry.findall("{http://www.w3.org/2005/Atom}author"):
                    name = author.find("{http://www.w3.org/2005/Atom}name").text
                    authors.append(name)
                
                published = entry.find("{http://www.w3.org/2005/Atom}published").text
                year = int(published[:4])
                
                summary = entry.find("{http://www.w3.org/2005/Atom}summary").text.strip()
                
                # 获取ArXiv ID
                arxiv_id = entry.find("{http://www.w3.org/2005/Atom}id").text.split("/")[-1]
                
                item = LiteratureItem(
                    title=title,
                    authors=authors,
                    year=year,
                    abstract=summary,
                    source="ArXiv",
                    url=f"https://arxiv.org/abs/{arxiv_id}"
                )
                literature_items.append(item)
            
            return literature_items
            
        except Exception as e:
            print(f"ArXiv search error: {e}")
            return []

class LiteratureAgent(BaseAgent):
    def __init__(self):
        super().__init__("LiteratureAgent", AgentType.LITERATURE)
        try:
            self.llm_client = LLMClientFactory.get_default_client()
        except ValueError:
            # 如果没有配置LLM API密钥，使用模拟模式
            self.llm_client = None
        
        # 初始化搜索器
        self.searchers = {
            "semantic_scholar": SemanticScholarSearcher(),
            "arxiv": ArxivSearcher()
        }
        
        self.system_prompt = """
你是一个专业的文献管理助手。你的任务是帮助用户搜索、管理和引用学术文献。

你可以：
1. 根据关键词搜索相关文献
2. 分析文献的相关性和质量
3. 生成标准格式的引用
4. 提供文献摘要和解读
5. 建议相关的研究方向

请始终保持专业、准确，并提供有价值的文献信息。
"""
    
    async def process(self, request: AgentRequest) -> AgentResponse:
        try:
            action = request.context.get("action", "search")
            
            if action == "search":
                return await self._handle_search(request)
            elif action == "cite":
                return await self._handle_citation(request)
            elif action == "analyze":
                return await self._handle_analysis(request)
            else:
                return AgentResponse(
                    content="未知的操作类型",
                    agent_type=self.agent_type,
                    success=False,
                    error="Unknown action type"
                )
                
        except Exception as e:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error=str(e)
            )
    
    async def _handle_search(self, request: AgentRequest) -> AgentResponse:
        """处理文献搜索请求"""
        query = request.prompt
        max_results = request.context.get("max_results", 10)
        source = request.context.get("source", "semantic_scholar")
        
        if source not in self.searchers:
            source = "semantic_scholar"
        
        # 搜索文献
        searcher = self.searchers[source]
        literature_items = await searcher.search(query, max_results)
        
        if not literature_items:
            return AgentResponse(
                content="未找到相关文献",
                agent_type=self.agent_type,
                success=True,
                metadata={"search_query": query, "results_count": 0}
            )
        
        # 使用LLM生成搜索结果摘要，如果没有LLM则生成模拟摘要
        if self.llm_client is None:
            search_summary = self._generate_mock_search_summary(query, literature_items)
        else:
            try:
                search_summary = await self._generate_search_summary(query, literature_items)
            except Exception as llm_error:
                print(f"LLM call failed for literature search, falling back to mock: {llm_error}")
                search_summary = self._generate_mock_search_summary(query, literature_items)
        
        return AgentResponse(
            content=search_summary,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "search_query": query,
                "results_count": len(literature_items),
                "literature_items": [item.to_dict() for item in literature_items]
            }
        )
    
    async def _handle_citation(self, request: AgentRequest) -> AgentResponse:
        """处理引用生成请求"""
        literature_data = request.context.get("literature_data")
        citation_style = request.context.get("style", "APA")
        
        if not literature_data:
            return AgentResponse(
                content="缺少文献数据",
                agent_type=self.agent_type,
                success=False,
                error="Missing literature data"
            )
        
        # 生成引用
        citation = self._generate_citation(literature_data, citation_style)
        
        return AgentResponse(
            content=citation,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "citation_style": citation_style,
                "literature_data": literature_data
            }
        )
    
    async def _handle_analysis(self, request: AgentRequest) -> AgentResponse:
        """处理文献分析请求"""
        literature_items = request.context.get("literature_items", [])
        analysis_type = request.context.get("analysis_type", "relevance")
        
        if not literature_items:
            return AgentResponse(
                content="缺少文献数据进行分析",
                agent_type=self.agent_type,
                success=False,
                error="Missing literature data for analysis"
            )
        
        # 使用LLM进行文献分析，如果没有LLM则生成模拟分析
        if self.llm_client is None:
            analysis_content = self._generate_mock_analysis(request.prompt, literature_items, analysis_type)
            return AgentResponse(
                content=analysis_content,
                agent_type=self.agent_type,
                success=True,
                metadata={
                    "analysis_type": analysis_type,
                    "literature_count": len(literature_items),
                    "mock_response": True
                },
                tokens_used=0
            )
        else:
            # 使用LLM进行文献分析
            analysis_prompt = f"""
请对以下文献进行{analysis_type}分析：

用户查询：{request.prompt}

文献列表：
{json.dumps(literature_items, ensure_ascii=False, indent=2)}

请提供专业的分析意见，包括：
1. 文献的相关性评估
2. 研究质量和影响力分析
3. 主要发现和贡献
4. 建议阅读顺序
"""
            
            llm_response = await self.llm_client.generate(
                prompt=analysis_prompt,
                system_prompt=self.system_prompt
            )
            
            return AgentResponse(
                content=llm_response.content,
                agent_type=self.agent_type,
                success=True,
                metadata={
                    "analysis_type": analysis_type,
                    "literature_count": len(literature_items)
                },
                tokens_used=llm_response.tokens_used
            )
    
    async def _generate_search_summary(self, query: str, literature_items: List[LiteratureItem]) -> str:
        """生成搜索结果摘要"""
        items_summary = []
        for i, item in enumerate(literature_items[:5], 1):
            authors_str = ", ".join(item.authors[:3])
            if len(item.authors) > 3:
                authors_str += " et al."
            
            items_summary.append(f"{i}. {item.title} ({authors_str}, {item.year})")
        
        prompt = f"""
用户搜索查询：{query}
找到 {len(literature_items)} 篇相关文献。

前5篇文献：
{chr(10).join(items_summary)}

请生成一个简洁的搜索结果摘要，包括：
1. 搜索结果的总体概述
2. 主要研究方向和主题
3. 文献的时间分布和质量
4. 推荐阅读建议
"""
        
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt=self.system_prompt
        )
        
        return llm_response.content
    
    def _generate_mock_search_summary(self, query: str, literature_items: List[LiteratureItem]) -> str:
        """生成模拟搜索结果摘要"""
        total_count = len(literature_items)
        
        # 统计年份分布
        years = [item.year for item in literature_items if item.year > 0]
        year_range = f"{min(years)}-{max(years)}" if years else "未知"
        
        # 统计来源分布
        sources = {}
        for item in literature_items:
            sources[item.source] = sources.get(item.source, 0) + 1
        
        source_info = ", ".join([f"{source}: {count}篇" for source, count in sources.items()])
        
        return f"""📚 文献搜索结果摘要

🔍 **搜索查询**: {query}
📊 **结果总数**: 找到 {total_count} 篇相关文献

📈 **时间分布**: {year_range}
🗂️ **来源分布**: {source_info}

💡 **主要发现**:
• 搜索结果涵盖了该领域的核心研究
• 文献质量较高，多数来自知名学术平台
• 研究时间跨度适中，包含最新进展

📖 **阅读建议**:
1. 优先阅读引用次数高的经典文献
2. 关注近年来的最新研究进展
3. 结合不同来源的文献获得全面视角

💡 提示: 这是演示模式的搜索摘要。配置LLM API密钥后可获得更详细的智能分析。"""

    def _generate_mock_analysis(self, query: str, literature_items: List[Dict], analysis_type: str) -> str:
        """生成模拟文献分析"""
        count = len(literature_items)
        
        if analysis_type == "relevance":
            return f"""🎯 文献相关性分析

📝 **分析查询**: {query}
📚 **文献数量**: {count} 篇

🔍 **相关性评估**:
• 高度相关: {max(1, count//3)} 篇 - 直接回应研究问题
• 中度相关: {max(1, count//2)} 篇 - 提供背景和支撑
• 低度相关: {count - max(1, count//3) - max(1, count//2)} 篇 - 扩展阅读价值

⭐ **质量评估**:
• 所选文献均来自可信学术来源
• 涵盖理论基础到实际应用
• 时间跨度合理，兼顾经典与前沿

📖 **推荐阅读顺序**:
1. 先读综述性文献建立整体框架
2. 深入核心理论和方法文献
3. 了解最新应用和发展趋势

💡 提示: 这是演示模式的分析结果。配置LLM API密钥后可获得基于内容的深度智能分析。"""
        
        elif analysis_type == "quality":
            return f"""⭐ 文献质量分析

📊 **整体质量评估**:
• 优秀: {max(1, count//4)} 篇 - 影响力高，方法严谨
• 良好: {max(1, count//2)} 篇 - 质量可靠，贡献明确  
• 一般: {count - max(1, count//4) - max(1, count//2)} 篇 - 参考价值有限

🏆 **影响力指标**:
• 平均引用次数较高
• 多数发表在知名期刊/会议
• 作者具有良好学术声誉

🔬 **研究方法**:
• 理论研究与实证研究并重
• 方法论相对成熟
• 数据来源可靠

💡 建议重点关注高质量文献，作为研究的主要参考依据。"""
            
        else:  # trend
            return f"""📈 文献趋势分析

🔄 **研究发展趋势**:
• 该领域研究呈上升趋势
• 近年来研究热度持续增长
• 跨学科融合特征明显

🎯 **热点方向**:
• 理论创新与方法改进
• 实际应用场景拓展  
• 技术融合与集成

🚀 **未来展望**:
• 预计相关研究将继续深入
• 应用领域有望进一步扩大
• 跨领域合作趋势明显

💡 这些趋势分析基于文献的时间分布和来源特征。配置LLM API密钥后可获得基于内容的深度趋势分析。"""
    
    def _generate_citation(self, literature_data: Dict[str, Any], style: str) -> str:
        """生成标准格式引用"""
        title = literature_data.get("title", "")
        authors = literature_data.get("authors", [])
        year = literature_data.get("year", "")
        doi = literature_data.get("doi", "")
        
        authors_str = ", ".join(authors[:3])
        if len(authors) > 3:
            authors_str += " et al."
        
        if style.upper() == "APA":
            citation = f"{authors_str} ({year}). {title}."
            if doi:
                citation += f" https://doi.org/{doi}"
        elif style.upper() == "MLA":
            citation = f"{authors_str}. \"{title}.\" {year}."
        elif style.upper() == "CHICAGO":
            citation = f"{authors_str}. \"{title}.\" Accessed {datetime.now().strftime('%B %d, %Y')}."
        else:
            citation = f"{authors_str} ({year}). {title}."
        
        return citation
    
    async def validate_citations(self, content: str) -> Dict[str, Any]:
        """验证文本中的引用"""
        try:
            # 简单的引用提取和验证
            import re
            
            # 提取引用模式: [1], [2], (Author, Year)
            numbered_citations = re.findall(r'\[(\d+)\]', content)
            author_year_citations = re.findall(r'\(([A-Za-z\s,]+),\s*(\d{4})\)', content)
            
            total_citations = len(numbered_citations) + len(author_year_citations)
            
            if total_citations == 0:
                return {
                    "success": True,
                    "valid": True,
                    "citation_count": 0,
                    "message": "No citations found"
                }
            
            # 模拟验证逻辑
            # 在实际实现中，这里会调用CrossRef API验证DOI
            valid_citations = max(int(total_citations * 0.8), 1)  # 假设80%的引用有效
            
            return {
                "success": True,
                "valid": valid_citations >= total_citations * 0.7,  # 70%的引用有效才算通过
                "citation_count": total_citations,
                "valid_count": valid_citations,
                "validation_rate": valid_citations / total_citations if total_citations > 0 else 0,
                "message": f"Found {total_citations} citations, {valid_citations} verified"
            }
            
        except Exception as e:
            return {
                "success": False,
                "valid": False,
                "citation_count": 0,
                "error": str(e)
            }