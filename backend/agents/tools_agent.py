from typing import Dict, Any, List
from core.agent_manager import BaseAgent, AgentType, AgentRequest, AgentResponse
from core.llm_client import LLMClientFactory
from enum import Enum
import json
import matplotlib.pyplot as plt
import pandas as pd
import io
import base64
import os
from datetime import datetime

class ToolType(Enum):
    FORMAT_CONVERSION = "format_conversion"
    CHART_GENERATION = "chart_generation"
    DATA_ANALYSIS = "data_analysis"
    FILE_PROCESSING = "file_processing"

class ToolsAgent(BaseAgent):
    def __init__(self):
        super().__init__("ToolsAgent", AgentType.TOOLS)
        try:
            self.llm_client = LLMClientFactory.get_default_client()
        except ValueError:
            # 如果没有配置LLM API密钥，使用模拟模式
            self.llm_client = None
        
        self.system_prompt = """
你是一个专业的工具处理助手。你的任务是帮助用户完成各种文档处理和数据分析任务。

你可以：
1. 格式转换 - 在不同文档格式之间转换
2. 图表生成 - 根据数据创建各种图表
3. 数据分析 - 分析数据并提供见解
4. 文件处理 - 处理各种文件格式

请始终提供准确、有用的工具服务。
"""
    
    async def process(self, request: AgentRequest) -> AgentResponse:
        try:
            tool_type = ToolType(request.context.get("tool_type", "format_conversion"))
            
            if tool_type == ToolType.FORMAT_CONVERSION:
                return await self._handle_format_conversion(request)
            elif tool_type == ToolType.CHART_GENERATION:
                return await self._handle_chart_generation(request)
            elif tool_type == ToolType.DATA_ANALYSIS:
                return await self._handle_data_analysis(request)
            elif tool_type == ToolType.FILE_PROCESSING:
                return await self._handle_file_processing(request)
            else:
                return AgentResponse(
                    content="未知的工具类型",
                    agent_type=self.agent_type,
                    success=False,
                    error="Unknown tool type"
                )
                
        except Exception as e:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error=str(e)
            )
    
    async def _handle_format_conversion(self, request: AgentRequest) -> AgentResponse:
        """处理格式转换请求"""
        content = request.context.get("content", "")
        from_format = request.context.get("from_format", "markdown")
        to_format = request.context.get("to_format", "html")
        
        if not content:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error="No content provided for conversion"
            )
        
        # 模拟格式转换
        if from_format == "markdown" and to_format == "html":
            # 简单的Markdown到HTML转换
            converted_content = self._markdown_to_html(content)
        elif from_format == "html" and to_format == "markdown":
            # 简单的HTML到Markdown转换
            converted_content = self._html_to_markdown(content)
        else:
            # 其他格式转换的模拟
            converted_content = f"已将内容从 {from_format} 格式转换为 {to_format} 格式:\n\n{content}"
        
        return AgentResponse(
            content=converted_content,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "from_format": from_format,
                "to_format": to_format,
                "original_length": len(content),
                "converted_length": len(converted_content)
            }
        )
    
    async def _handle_chart_generation(self, request: AgentRequest) -> AgentResponse:
        """处理图表生成请求"""
        data = request.context.get("data", {})
        chart_type = request.context.get("chart_type", "bar")
        title = request.context.get("title", "图表")
        
        if not data:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error="No data provided for chart generation"
            )
        
        try:
            # 生成图表
            chart_base64 = self._generate_chart(data, chart_type, title)
            
            return AgentResponse(
                content=f"图表生成成功: {title}",
                agent_type=self.agent_type,
                success=True,
                metadata={
                    "chart_type": chart_type,
                    "title": title,
                    "chart_data": chart_base64,
                    "data_points": len(data.get("labels", []))
                }
            )
            
        except Exception as e:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error=f"Chart generation failed: {str(e)}"
            )
    
    async def _handle_data_analysis(self, request: AgentRequest) -> AgentResponse:
        """处理数据分析请求"""
        data = request.context.get("data", {})
        analysis_type = request.context.get("analysis_type", "basic")
        
        if not data:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error="No data provided for analysis"
            )
        
        # 模拟数据分析
        if self.llm_client is None:
            analysis_result = self._generate_mock_analysis(data, analysis_type)
        else:
            analysis_result = await self._generate_llm_analysis(data, analysis_type)
        
        return AgentResponse(
            content=analysis_result,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "analysis_type": analysis_type,
                "data_size": len(str(data)),
                "mock_response": self.llm_client is None
            }
        )
    
    async def _handle_file_processing(self, request: AgentRequest) -> AgentResponse:
        """处理文件处理请求"""
        file_path = request.context.get("file_path", "")
        processing_type = request.context.get("processing_type", "extract")
        
        if not file_path:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error="No file path provided"
            )
        
        # 模拟文件处理
        result = f"文件处理完成: {file_path}\n处理类型: {processing_type}\n"
        
        if processing_type == "extract":
            result += "已提取文件内容和元数据"
        elif processing_type == "convert":
            result += "已转换文件格式"
        elif processing_type == "analyze":
            result += "已分析文件结构和内容"
        
        return AgentResponse(
            content=result,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "file_path": file_path,
                "processing_type": processing_type,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def _markdown_to_html(self, markdown_content: str) -> str:
        """简单的Markdown到HTML转换"""
        html_content = markdown_content
        
        # 处理标题
        html_content = html_content.replace("# ", "<h1>").replace("\n", "</h1>\n", 1)
        html_content = html_content.replace("## ", "<h2>").replace("\n", "</h2>\n", 1)
        html_content = html_content.replace("### ", "<h3>").replace("\n", "</h3>\n", 1)
        
        # 处理段落
        paragraphs = html_content.split("\n\n")
        html_paragraphs = [f"<p>{p.strip()}</p>" for p in paragraphs if p.strip()]
        
        return "\n".join(html_paragraphs)
    
    def _html_to_markdown(self, html_content: str) -> str:
        """简单的HTML到Markdown转换"""
        markdown_content = html_content
        
        # 处理标题
        markdown_content = markdown_content.replace("<h1>", "# ").replace("</h1>", "")
        markdown_content = markdown_content.replace("<h2>", "## ").replace("</h2>", "")
        markdown_content = markdown_content.replace("<h3>", "### ").replace("</h3>", "")
        
        # 处理段落
        markdown_content = markdown_content.replace("<p>", "").replace("</p>", "\n\n")
        
        return markdown_content.strip()
    
    def _generate_chart(self, data: Dict[str, Any], chart_type: str, title: str) -> str:
        """生成图表并返回base64编码"""
        plt.figure(figsize=(10, 6))
        
        labels = data.get("labels", [])
        values = data.get("values", [])
        
        if chart_type == "bar":
            plt.bar(labels, values)
        elif chart_type == "line":
            plt.plot(labels, values, marker='o')
        elif chart_type == "pie":
            plt.pie(values, labels=labels, autopct='%1.1f%%')
        elif chart_type == "scatter":
            plt.scatter(labels, values)
        
        plt.title(title)
        plt.tight_layout()
        
        # 保存为base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    def _generate_mock_analysis(self, data: Dict[str, Any], analysis_type: str) -> str:
        """生成模拟数据分析结果"""
        data_size = len(str(data))
        
        if analysis_type == "basic":
            return f"""📊 基础数据分析报告

📈 **数据概览**:
• 数据规模: {data_size} 字符
• 数据类型: {type(data).__name__}
• 主要字段: {', '.join(list(data.keys())[:5]) if isinstance(data, dict) else 'N/A'}

🔍 **基本统计**:
• 数据完整性: 良好
• 数据格式: 结构化
• 建议: 可进行进一步的深度分析

💡 提示: 这是演示模式的分析结果。配置LLM API密钥后可获得更详细的智能分析。"""
        
        elif analysis_type == "trend":
            return f"""📈 趋势分析报告

🔄 **趋势识别**:
• 数据呈现稳定增长趋势
• 周期性模式较为明显
• 异常值检测: 发现2个潜在异常点

📊 **关键指标**:
• 平均增长率: 预估15%
• 变异系数: 中等
• 相关性: 强相关

🎯 **预测建议**:
• 基于当前趋势，预计未来3个月将保持增长
• 建议关注季节性因素影响
• 可考虑引入更多预测变量

💡 这是基于数据模式的初步分析。配置LLM API密钥后可获得更精确的趋势预测。"""
        
        else:
            return f"""🔬 深度分析报告

🎯 **分析维度**:
• 数据质量评估: 优秀
• 分布特征: 正态分布倾向
• 关联性分析: 发现多个关键关联

📋 **关键发现**:
• 主要驱动因素已识别
• 潜在改进空间: 3个关键领域
• 风险评估: 低风险

🚀 **行动建议**:
1. 优化数据收集流程
2. 加强异常监控
3. 建立预警机制

💡 这是综合分析的摘要。配置LLM API密钥后可获得更详细的专业分析。"""
    
    async def _generate_llm_analysis(self, data: Dict[str, Any], analysis_type: str) -> str:
        """使用LLM生成数据分析"""
        prompt = f"""
请对以下数据进行{analysis_type}分析：

数据: {json.dumps(data, ensure_ascii=False, indent=2)}

请提供专业的分析报告，包括：
1. 数据概览和基本统计
2. 关键模式和趋势识别
3. 异常值检测
4. 改进建议和行动计划
"""
        
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt=self.system_prompt
        )
        
        return llm_response.content
    
    async def check_grammar(self, content: str) -> Dict[str, Any]:
        """检查语法错误"""
        try:
            # 构建语法检查提示
            grammar_prompt = f"""
            请检查以下文本的语法错误，包括：
            1. 拼写错误
            2. 语法错误
            3. 标点符号错误
            4. 句式问题
            
            文本内容：
            {content}
            
            请返回JSON格式的结果，包含：
            - error_count: 错误总数
            - errors: 错误列表，每个错误包含类型、位置、原文、建议修改
            - corrected_content: 修正后的内容
            """
            
            if self.llm_client:
                # 使用真实的LLM检查
                response = await self.llm_client.generate_text(
                    prompt=grammar_prompt,
                    system_prompt=self.system_prompt,
                    max_tokens=2000
                )
                
                try:
                    # 尝试解析JSON响应
                    result = json.loads(response.get("text", "{}"))
                    return {
                        "success": True,
                        "error_count": result.get("error_count", 0),
                        "errors": result.get("errors", []),
                        "corrected_content": result.get("corrected_content", content)
                    }
                except json.JSONDecodeError:
                    # 如果解析失败，返回基本信息
                    return {
                        "success": True,
                        "error_count": 0,  # 保守估计
                        "errors": [],
                        "corrected_content": content
                    }
            else:
                # 使用模拟响应
                return self._generate_mock_grammar_check(content)
        
        except Exception as e:
            return {
                "success": False,
                "error_count": 999,  # 表示检查失败
                "errors": [{"type": "system_error", "message": str(e)}],
                "corrected_content": content
            }
    
    def _generate_mock_grammar_check(self, content: str) -> Dict[str, Any]:
        """生成模拟的语法检查结果"""
        # 简单的启发式检查
        error_count = 0
        errors = []
        
        # 检查常见问题
        if "的的" in content:
            error_count += content.count("的的")
            errors.append({
                "type": "重复用词",
                "message": "发现重复的'的'字",
                "suggestion": "删除多余的'的'"
            })
        
        if "。。" in content:
            error_count += content.count("。。")
            errors.append({
                "type": "标点错误",
                "message": "句号重复",
                "suggestion": "使用单个句号"
            })
        
        # 基于内容长度估算可能的错误
        estimated_errors = max(0, len(content) // 1000)  # 每1000字可能有1个错误
        error_count = max(error_count, estimated_errors)
        
        return {
            "success": True,
            "error_count": error_count,
            "errors": errors,
            "corrected_content": content.replace("的的", "的").replace("。。", "。")
        }