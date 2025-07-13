import requests
import json
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from core.config import LLM_PROVIDERS, settings

class LLMResponse:
    def __init__(self, content: str, tokens_used: int = 0, metadata: Dict[str, Any] = None):
        self.content = content
        self.tokens_used = tokens_used
        self.metadata = metadata or {}

class BaseLLMClient(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "", **kwargs) -> LLMResponse:
        pass

class MiniMaxClient(BaseLLMClient):
    def __init__(self):
        self.api_key = settings.minimax_api_key
        self.group_id = settings.minimax_group_id
        self.base_url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    
    async def generate(self, prompt: str, system_prompt: str = "", **kwargs) -> LLMResponse:
        if not self.api_key:
            raise ValueError("MiniMax API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"sender_type": "BOT", "text": system_prompt})
        messages.append({"sender_type": "USER", "text": prompt})
        
        data = {
            "model": "abab6.5s-chat",
            "stream": False,
            "mask_sensitive_info": False,
            "messages": messages,
            "bot_setting": [
                {
                    "bot_name": "智能写作助手",
                    "content": "你是一个专业的AI写作助手，擅长学术写作、博客创作和社交媒体内容创作。"
                }
            ]
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if result.get("base_resp", {}).get("status_code") == 0:
                content = result["reply"]
                tokens_used = result.get("usage", {}).get("total_tokens", 0)
                return LLMResponse(content=content, tokens_used=tokens_used)
            else:
                error_msg = result.get("base_resp", {}).get("status_msg", "Unknown error")
                raise Exception(f"MiniMax API error: {error_msg}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")

class OpenAIClient(BaseLLMClient):
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.base_url = "https://api.openai.com/v1/chat/completions"
    
    async def generate(self, prompt: str, system_prompt: str = "", **kwargs) -> LLMResponse:
        if not self.api_key:
            raise ValueError("OpenAI API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        data = {
            "model": "gpt-4",
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2000)
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            tokens_used = result.get("usage", {}).get("total_tokens", 0)
            
            return LLMResponse(content=content, tokens_used=tokens_used)
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"OpenAI API request failed: {str(e)}")

class LLMClient:
    """统一的LLM客户端，支持工作流所需的各种功能"""
    
    def __init__(self):
        try:
            if settings.minimax_api_key:
                self.client = MiniMaxClient()
            elif settings.openai_api_key:
                self.client = OpenAIClient()
            else:
                self.client = None
        except:
            self.client = None
    
    async def generate_outline(self, prompt: str, writing_mode: str = "academic") -> str:
        """生成文档大纲"""
        if not self.client:
            # 返回模拟大纲
            return f"""# {prompt}的大纲

## 1. 引言
- 背景介绍
- 研究意义
- 主要观点

## 2. 主体内容
### 2.1 第一个要点
- 详细说明
- 支撑论据

### 2.2 第二个要点  
- 详细说明
- 支撑论据

### 2.3 第三个要点
- 详细说明
- 支撑论据

## 3. 结论
- 总结要点
- 深入思考
- 未来展望

## 参考文献
[待添加相关引用]"""
        
        system_prompt = self._get_system_prompt(writing_mode, "outline")
        result = await self.client.generate(prompt, system_prompt)
        return result.content
    
    async def generate_content(self, outline: str, writing_mode: str = "academic", target_words: int = 2000) -> str:
        """基于大纲生成完整内容"""
        if not self.client:
            # 返回模拟内容
            return f"""# {outline.split('#')[1].split('\n')[0].strip() if '#' in outline else '文档标题'}

## 引言

这是一篇基于大纲生成的{target_words}字左右的文章。在当前的研究领域中，这个主题具有重要的理论意义和实践价值。通过深入分析相关问题，我们可以获得更加全面和深刻的理解。

## 主体内容

### 第一个重要观点

在这个部分，我们将详细阐述第一个核心观点。根据相关研究表明，这个观点在学术界已经得到了广泛的认可。通过大量的实证研究和理论分析，学者们发现了这个现象的深层次原因。

具体来说，这个观点包含以下几个方面：
1. 理论基础：基于已有的理论框架进行分析
2. 实证支撑：通过数据和案例进行验证  
3. 实际应用：在实践中的具体体现

### 第二个重要观点

接下来我们讨论第二个核心观点。这个观点与第一个观点既有联系又有区别，形成了完整的理论体系。通过比较分析，我们可以发现它们之间的内在逻辑关系。

研究表明，这个观点的重要性体现在：
- 填补了理论空白
- 提供了新的研究视角
- 具有重要的指导意义

### 第三个重要观点

最后一个核心观点将前面的讨论推向高潮。这个观点不仅总结了前面的内容，还提出了新的思考方向。它为我们理解整个问题提供了更加全面的框架。

## 结论

通过以上分析，我们可以得出以下结论：

首先，这个研究主题具有重要的理论价值，为相关领域的发展提供了新的思路。其次，实证研究的结果支持了我们的理论假设，证明了研究方法的有效性。最后，这项研究不仅具有学术意义，还具有重要的实践指导价值。

展望未来，我们认为这个领域还有很大的发展空间。随着技术的进步和理论的完善，相关研究将会取得更加丰硕的成果。我们期待更多学者参与到这个领域的研究中来，共同推动学科的发展。

## 参考文献

[1] 学者A. 相关研究的重要发现[J]. 权威期刊, 2023, 15(3): 123-145.
[2] 学者B, 学者C. 理论框架的构建与应用[M]. 知名出版社, 2024.
[3] 学者D. 实证研究的方法与实践[J]. 学术期刊, 2024, 28(2): 67-89."""
        
        system_prompt = self._get_system_prompt(writing_mode, "content")
        prompt = f"""请基于以下大纲，生成一篇约{target_words}字的{writing_mode}文章：

{outline}

要求：
1. 内容充实，逻辑清晰
2. 符合{writing_mode}写作规范
3. 包含适当的引用（使用[1][2]格式）
4. 字数控制在{target_words}字左右"""
        
        result = await self.client.generate(prompt, system_prompt)
        return result.content
    
    async def check_grammar(self, content: str) -> dict:
        """检查语法错误"""
        if not self.client:
            # 返回模拟结果
            word_count = len(content.split())
            error_count = max(0, min(10, word_count // 500))  # 模拟错误数量
            return {
                "errors": error_count,
                "corrected_content": content,
                "suggestions": ["建议优化句式结构", "注意标点符号使用"] if error_count > 0 else []
            }
        
        system_prompt = """你是一个专业的语法检查助手。请仔细检查文本中的语法错误、拼写错误、标点符号错误等，并提供修正建议。

请按以下格式回复：
错误数量: [数字]
修正后内容: [修正后的完整文本]
具体建议: [具体的修改建议列表]"""
        
        prompt = f"请检查以下文本的语法错误：\n\n{content}"
        result = await self.client.generate(prompt, system_prompt)
        
        # 解析返回结果
        lines = result.content.split('\n')
        errors = 0
        corrected_content = content
        suggestions = []
        
        for line in lines:
            if line.startswith('错误数量:'):
                try:
                    errors = int(line.split(':')[1].strip())
                except:
                    errors = 0
            elif line.startswith('修正后内容:'):
                corrected_content = line.split(':', 1)[1].strip()
            elif line.startswith('具体建议:'):
                suggestions = [line.split(':', 1)[1].strip()]
        
        return {
            "errors": errors,
            "corrected_content": corrected_content,
            "suggestions": suggestions
        }
    
    def _get_system_prompt(self, writing_mode: str, task_type: str) -> str:
        """获取不同写作模式和任务类型的系统提示"""
        mode_prompts = {
            "academic": {
                "outline": "你是一个专业的学术写作助手。请为用户生成结构清晰、逻辑严密的学术论文大纲。大纲应包含引言、主体部分（多个子章节）、结论和参考文献部分。",
                "content": "你是一个专业的学术写作助手。请根据大纲生成严谨的学术文章，使用学术化的语言，包含适当的引用，逻辑清晰，论证充分。"
            },
            "blog": {
                "outline": "你是一个专业的博客写作助手。请为用户生成引人入胜、结构清晰的博客文章大纲。大纲应该有吸引人的标题，清晰的章节划分，适合网络阅读。",
                "content": "你是一个专业的博客写作助手。请根据大纲生成有趣、易读的博客文章，语言生动，结构清晰，适合网络传播。"
            },
            "social": {
                "outline": "你是一个社交媒体内容创作助手。请为用户生成适合社交媒体传播的内容大纲，要求简洁明了，重点突出，容易理解和分享。",
                "content": "你是一个社交媒体内容创作助手。请根据大纲生成简洁有力、易于传播的社交媒体内容，语言通俗易懂，观点鲜明。"
            }
        }
        
        return mode_prompts.get(writing_mode, mode_prompts["academic"])[task_type]

class LLMClientFactory:
    _clients = {
        "minimax": MiniMaxClient,
        "openai": OpenAIClient,
    }
    
    @classmethod
    def create_client(cls, provider: str = "minimax") -> BaseLLMClient:
        if provider not in cls._clients:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        return cls._clients[provider]()
    
    @classmethod
    def get_default_client(cls) -> BaseLLMClient:
        # 优先使用已配置的API
        if settings.minimax_api_key:
            return cls.create_client("minimax")
        elif settings.openai_api_key:
            return cls.create_client("openai")
        else:
            raise ValueError("No LLM API key configured")