from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
import io
import base64
import json

from core.agent_manager import agent_manager, AgentRequest, AgentType
from agents.tools_agent import ToolsAgent

router = APIRouter()

# 初始化工具Agent
tools_agent = ToolsAgent()
agent_manager.register_agent(tools_agent)

class ChartRequest(BaseModel):
    chart_type: str  # bar, line, pie, scatter, heatmap
    data: List[Dict[str, Any]]
    title: str = ""
    x_axis: str = ""
    y_axis: str = ""
    options: Dict[str, Any] = {}

class DataGenerationRequest(BaseModel):
    data_type: str  # random, sequence, distribution
    parameters: Dict[str, Any]
    count: int = 100

class FormatRequest(BaseModel):
    content: str
    format_type: str  # markdown, latex, html
    options: Dict[str, Any] = {}

class ToolResponse(BaseModel):
    success: bool
    result: Any
    error: Optional[str] = None
    metadata: Dict[str, Any] = {}

@router.post("/chart/generate", response_model=ToolResponse)
async def generate_chart(request: ChartRequest):
    """生成图表"""
    try:
        # 创建DataFrame
        df = pd.DataFrame(request.data)
        
        if request.chart_type == "bar":
            fig = px.bar(df, x=request.x_axis, y=request.y_axis, title=request.title)
        elif request.chart_type == "line":
            fig = px.line(df, x=request.x_axis, y=request.y_axis, title=request.title)
        elif request.chart_type == "pie":
            fig = px.pie(df, names=request.x_axis, values=request.y_axis, title=request.title)
        elif request.chart_type == "scatter":
            fig = px.scatter(df, x=request.x_axis, y=request.y_axis, title=request.title)
        elif request.chart_type == "heatmap":
            # 创建数值矩阵
            pivot_df = df.pivot_table(
                index=request.x_axis, 
                columns=request.y_axis, 
                values=request.options.get("value_column", df.columns[-1])
            )
            fig = px.imshow(pivot_df, title=request.title)
        else:
            raise ValueError(f"不支持的图表类型: {request.chart_type}")
        
        # 转换为JSON格式
        chart_json = fig.to_json()
        
        return ToolResponse(
            success=True,
            result=chart_json,
            metadata={
                "chart_type": request.chart_type,
                "data_points": len(request.data)
            }
        )
        
    except Exception as e:
        return ToolResponse(
            success=False,
            result=None,
            error=str(e)
        )

@router.post("/data/generate", response_model=ToolResponse)
async def generate_data(request: DataGenerationRequest):
    """生成数据"""
    try:
        if request.data_type == "random":
            # 生成随机数据
            np.random.seed(request.parameters.get("seed", None))
            data = np.random.normal(
                loc=request.parameters.get("mean", 0),
                scale=request.parameters.get("std", 1),
                size=request.count
            ).tolist()
            
        elif request.data_type == "sequence":
            # 生成序列数据
            start = request.parameters.get("start", 0)
            step = request.parameters.get("step", 1)
            data = list(range(start, start + request.count * step, step))
            
        elif request.data_type == "distribution":
            # 生成特定分布数据
            dist_type = request.parameters.get("distribution", "normal")
            np.random.seed(request.parameters.get("seed", None))
            
            if dist_type == "normal":
                data = np.random.normal(
                    request.parameters.get("mean", 0),
                    request.parameters.get("std", 1),
                    request.count
                ).tolist()
            elif dist_type == "uniform":
                data = np.random.uniform(
                    request.parameters.get("low", 0),
                    request.parameters.get("high", 1),
                    request.count
                ).tolist()
            elif dist_type == "exponential":
                data = np.random.exponential(
                    request.parameters.get("scale", 1),
                    request.count
                ).tolist()
            else:
                raise ValueError(f"不支持的分布类型: {dist_type}")
        else:
            raise ValueError(f"不支持的数据类型: {request.data_type}")
        
        return ToolResponse(
            success=True,
            result=data,
            metadata={
                "data_type": request.data_type,
                "count": len(data),
                "parameters": request.parameters
            }
        )
        
    except Exception as e:
        return ToolResponse(
            success=False,
            result=None,
            error=str(e)
        )

@router.post("/format/convert", response_model=ToolResponse)
async def convert_format(request: FormatRequest):
    """格式转换"""
    try:
        if request.format_type == "markdown":
            # 转换为Markdown格式
            result = _convert_to_markdown(request.content, request.options)
            
        elif request.format_type == "latex":
            # 转换为LaTeX格式
            result = _convert_to_latex(request.content, request.options)
            
        elif request.format_type == "html":
            # 转换为HTML格式
            result = _convert_to_html(request.content, request.options)
            
        else:
            raise ValueError(f"不支持的格式类型: {request.format_type}")
        
        return ToolResponse(
            success=True,
            result=result,
            metadata={
                "format_type": request.format_type,
                "original_length": len(request.content),
                "converted_length": len(result)
            }
        )
        
    except Exception as e:
        return ToolResponse(
            success=False,
            result=None,
            error=str(e)
        )

def _convert_to_markdown(content: str, options: Dict[str, Any]) -> str:
    """转换为Markdown格式"""
    # 简单的格式转换示例
    lines = content.split('\n')
    result = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            result.append('')
            continue
            
        # 检测标题
        if stripped.endswith(':') and len(stripped) < 50:
            result.append(f"## {stripped[:-1]}")
        # 检测列表项
        elif stripped.startswith('-') or stripped.startswith('*'):
            result.append(line)
        # 检测数字列表
        elif stripped.split('.')[0].isdigit():
            result.append(line)
        else:
            result.append(line)
    
    return '\n'.join(result)

def _convert_to_latex(content: str, options: Dict[str, Any]) -> str:
    """转换为LaTeX格式"""
    # 简单的LaTeX转换
    escaped_content = content.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$')
    
    document_class = options.get('document_class', 'article')
    
    result = f"""\\documentclass{{{document_class}}}
\\usepackage{{utf8}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}

\\begin{{document}}

{escaped_content}

\\end{{document}}"""
    
    return result

def _convert_to_html(content: str, options: Dict[str, Any]) -> str:
    """转换为HTML格式"""
    # 简单的HTML转换
    lines = content.split('\n')
    result = ['<html>', '<head><meta charset="utf-8"></head>', '<body>']
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            result.append('<br>')
            continue
            
        # 检测标题
        if stripped.endswith(':') and len(stripped) < 50:
            result.append(f"<h2>{stripped[:-1]}</h2>")
        else:
            result.append(f"<p>{stripped}</p>")
    
    result.extend(['</body>', '</html>'])
    return '\n'.join(result)

@router.get("/chart/types")
async def get_chart_types():
    """获取支持的图表类型"""
    return {
        "types": [
            {"value": "bar", "label": "柱状图", "description": "适用于分类数据比较"},
            {"value": "line", "label": "折线图", "description": "适用于时间序列数据"},
            {"value": "pie", "label": "饼图", "description": "适用于比例数据"},
            {"value": "scatter", "label": "散点图", "description": "适用于相关性分析"},
            {"value": "heatmap", "label": "热力图", "description": "适用于矩阵数据可视化"}
        ]
    }

@router.get("/data/types")
async def get_data_types():
    """获取支持的数据生成类型"""
    return {
        "types": [
            {"value": "random", "label": "随机数据", "description": "生成随机数值"},
            {"value": "sequence", "label": "序列数据", "description": "生成等差数列"},
            {"value": "distribution", "label": "分布数据", "description": "生成特定分布的数据"}
        ]
    }

@router.get("/format/types")
async def get_format_types():
    """获取支持的格式类型"""
    return {
        "types": [
            {"value": "markdown", "label": "Markdown", "description": "转换为Markdown格式"},
            {"value": "latex", "label": "LaTeX", "description": "转换为LaTeX格式"},
            {"value": "html", "label": "HTML", "description": "转换为HTML格式"}
        ]
    }

class AgentToolRequest(BaseModel):
    tool_type: str
    content: Optional[str] = None
    context: Dict[str, Any] = {}
    user_id: int = 1

class AgentToolResponse(BaseModel):
    content: str
    success: bool
    metadata: Dict[str, Any]
    tokens_used: int = 0
    error: Optional[str] = None

@router.post("/agent/process", response_model=AgentToolResponse)
async def process_with_agent(request: AgentToolRequest):
    """使用工具Agent处理请求"""
    try:
        agent_request = AgentRequest(
            user_id=request.user_id,
            document_id=None,
            prompt=request.content or "",
            agent_type=AgentType.TOOLS,
            context={
                "tool_type": request.tool_type,
                "content": request.content,
                **request.context
            }
        )
        
        response = await agent_manager.process_request(agent_request)
        
        return AgentToolResponse(
            content=response.content,
            success=response.success,
            metadata=response.metadata or {},
            tokens_used=response.tokens_used,
            error=response.error
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/capabilities")
async def get_agent_capabilities():
    """获取工具Agent的能力"""
    return {
        "capabilities": [
            {
                "tool_type": "format_conversion",
                "name": "格式转换",
                "description": "在不同文档格式之间转换",
                "supported_formats": ["markdown", "html", "pdf", "docx"]
            },
            {
                "tool_type": "chart_generation", 
                "name": "图表生成",
                "description": "根据数据生成各种图表",
                "supported_types": ["bar", "line", "pie", "scatter"]
            },
            {
                "tool_type": "data_analysis",
                "name": "数据分析", 
                "description": "分析数据并提供见解",
                "supported_types": ["basic", "trend", "advanced"]
            },
            {
                "tool_type": "file_processing",
                "name": "文件处理",
                "description": "处理各种文件格式",
                "supported_types": ["extract", "convert", "analyze"]
            }
        ]
    }