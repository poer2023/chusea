from typing import Dict, Any, List
from core.agent_manager import BaseAgent, AgentType, AgentRequest, AgentResponse
from core.llm_client import LLMClientFactory
from enum import Enum

class WritingMode(Enum):
    ACADEMIC = "academic"
    BLOG = "blog"
    SOCIAL = "social"

class WritingAgent(BaseAgent):
    def __init__(self):
        super().__init__("WritingAgent", AgentType.WRITING)
        try:
            self.llm_client = LLMClientFactory.get_default_client()
        except ValueError:
            # 如果没有配置LLM API密钥，使用模拟模式
            self.llm_client = None
        
        # 不同写作模式的系统提示
        self.system_prompts = {
            WritingMode.ACADEMIC: """
你是一个专业的学术写作助手。你的任务是帮助用户撰写高质量的学术论文、研究报告和学术文档。

请遵循以下原则：
1. 使用正式、准确的学术语言
2. 确保逻辑严密、结构清晰
3. 支持引用文献和数据
4. 遵循学术写作规范
5. 提供建设性的写作建议

你可以帮助用户：
- 撰写论文的各个部分（摘要、引言、方法、结果、讨论、结论）
- 优化语言表达和逻辑结构
- 建议合适的引用格式
- 提供写作指导和改进建议
""",
            WritingMode.BLOG: """
你是一个专业的博客写作助手。你的任务是帮助用户创作引人入胜、易于阅读的博客内容。

请遵循以下原则：
1. 使用通俗易懂的语言
2. 保持内容有趣且有价值
3. 注重读者体验和参与度
4. 合理使用标题和段落结构
5. 适当融入个人观点和经验

你可以帮助用户：
- 创作博客文章
- 优化标题和开头
- 改善内容结构和流畅度
- 增加互动性和吸引力
- 提供SEO优化建议
""",
            WritingMode.SOCIAL: """
你是一个社交媒体内容创作助手。你的任务是帮助用户创作简洁、有趣、有影响力的社交媒体内容。

请遵循以下原则：
1. 内容简洁明了，抓住重点
2. 语言生动有趣，易于传播
3. 适合不同平台的特点
4. 注重时效性和话题性
5. 鼓励互动和分享

你可以帮助用户：
- 创作推文、朋友圈、微博等短内容
- 优化内容的传播力
- 建议合适的话题标签
- 提供多个版本供选择
- 改写长文为短文
"""
        }
    
    async def process(self, request: AgentRequest) -> AgentResponse:
        try:
            # 获取写作模式
            writing_mode = WritingMode(request.context.get("mode", "academic"))
            
            # 如果没有LLM客户端，返回模拟响应
            if self.llm_client is None:
                return self._generate_mock_response(request, writing_mode)
            
            system_prompt = self.system_prompts[writing_mode]
            
            # 构建完整的提示
            full_prompt = self._build_prompt(request, writing_mode)
            
            # 调用LLM生成内容
            llm_response = await self.llm_client.generate(
                prompt=full_prompt,
                system_prompt=system_prompt,
                temperature=request.context.get("temperature", 0.7),
                max_tokens=request.context.get("max_tokens", 2000)
            )
            
            return AgentResponse(
                content=llm_response.content,
                agent_type=self.agent_type,
                success=True,
                metadata={
                    "writing_mode": writing_mode.value,
                    "prompt_length": len(full_prompt),
                    "response_length": len(llm_response.content)
                },
                tokens_used=llm_response.tokens_used
            )
            
        except Exception as e:
            return AgentResponse(
                content="",
                agent_type=self.agent_type,
                success=False,
                error=str(e)
            )
    
    def _generate_mock_response(self, request: AgentRequest, writing_mode: WritingMode) -> AgentResponse:
        """生成模拟响应用于演示"""
        task_type = request.context.get("task_type", "generate")
        
        if writing_mode == WritingMode.ACADEMIC:
            if task_type == "improve":
                content = f"基于您提供的内容，我建议进行以下改进：\n\n1. 增强论证的逻辑性和条理性\n2. 补充相关的理论支撑和文献引用\n3. 完善结论部分，使其更具说服力\n\n改进后的内容将更符合学术写作标准，具有更强的学术价值和可信度。"
            elif task_type == "convert":
                target_mode = request.context.get("target_mode", "blog")
                content = f"已将学术内容转换为{target_mode}格式。转换后的内容保持了原有的核心观点，但采用了更适合{target_mode}平台的表达方式和结构。"
            else:
                content = f"关于「{request.prompt}」的学术分析：\n\n## 研究背景\n当前该领域的研究现状表明...\n\n## 主要观点\n基于现有文献分析，可以得出以下几个关键观点：\n1. 理论基础\n2. 实证支撑\n3. 实践意义\n\n## 结论\n综合以上分析，我们可以得出..."
        
        elif writing_mode == WritingMode.BLOG:
            if task_type == "improve":
                content = f"您的博客内容很有潜力！我建议：\n\n✨ **标题优化**：让标题更有吸引力\n📝 **结构调整**：增加小标题，提高可读性\n🎯 **内容丰富**：添加具体案例和个人经验\n💬 **互动增强**：在结尾加入问题引导读者评论\n\n这些改进将大大提升文章的传播效果！"
            else:
                content = f"# {request.prompt}\n\n大家好！今天想和大家聊聊这个话题。\n\n## 为什么这很重要？\n这个问题其实很多人都遇到过...\n\n## 我的经验分享\n从我个人的经历来看...\n\n## 实用建议\n1. 第一个建议\n2. 第二个建议\n3. 第三个建议\n\n你们对这个话题有什么看法呢？欢迎在评论区分享！"
        
        else:  # SOCIAL
            if task_type == "improve":
                content = f"💡 内容优化建议：\n\n✂️ 精简文字，突出重点\n🔥 增加热门话题标签\n😊 适当使用表情符号\n🔄 鼓励转发和互动\n\n让您的内容更容易传播！ #写作技巧 #内容创作"
            else:
                content = f"💭 {request.prompt}\n\n这个话题真的很有意思！分享一下我的想法 👇\n\n关键在于...\n\n你们怎么看？💬\n\n#分享 #讨论 #互动"
        
        return AgentResponse(
            content=content,
            agent_type=self.agent_type,
            success=True,
            metadata={
                "writing_mode": writing_mode.value,
                "mock_response": True,
                "prompt_length": len(request.prompt),
                "response_length": len(content)
            },
            tokens_used=0  # 模拟响应不消耗token
        )
    
    def _build_prompt(self, request: AgentRequest, writing_mode: WritingMode) -> str:
        prompt_parts = []
        
        # 添加上下文信息
        if request.context:
            if "document_context" in request.context:
                prompt_parts.append(f"当前文档上下文：\n{request.context['document_context']}\n")
            
            if "target_audience" in request.context:
                prompt_parts.append(f"目标受众：{request.context['target_audience']}\n")
            
            if "writing_style" in request.context:
                prompt_parts.append(f"写作风格要求：{request.context['writing_style']}\n")
            
            if "specific_requirements" in request.context:
                prompt_parts.append(f"具体要求：{request.context['specific_requirements']}\n")
        
        # 添加历史对话上下文
        recent_context = self.get_recent_context(3)
        if recent_context:
            prompt_parts.append("最近对话：")
            for msg in recent_context:
                prompt_parts.append(f"{msg.sender}: {msg.content}")
            prompt_parts.append("")
        
        # 添加当前用户请求
        prompt_parts.append(f"用户请求：{request.prompt}")
        
        return "\n".join(prompt_parts)
    
    def get_writing_suggestions(self, content: str, writing_mode: WritingMode) -> List[str]:
        """为给定内容提供写作建议"""
        suggestions = []
        
        if writing_mode == WritingMode.ACADEMIC:
            suggestions.extend([
                "确保每个段落都有明确的主题句",
                "使用过渡句连接不同段落",
                "检查引用格式是否正确",
                "确保论证逻辑清晰"
            ])
        elif writing_mode == WritingMode.BLOG:
            suggestions.extend([
                "使用吸引人的标题",
                "开头要能抓住读者注意力",
                "适当使用列表和子标题",
                "结尾要有明确的行动号召"
            ])
        elif writing_mode == WritingMode.SOCIAL:
            suggestions.extend([
                "内容要简洁有力",
                "使用相关的话题标签",
                "考虑添加表情符号",
                "鼓励用户互动"
            ])
        
        return suggestions
    
    async def generate_outline(self, prompt: str, mode: str = "academic") -> Dict[str, Any]:
        """生成文章大纲"""
        try:
            writing_mode = WritingMode(mode)
            
            # 构建大纲生成提示
            outline_prompt = f"""
            基于以下主题生成详细的文章大纲：
            
            主题：{prompt}
            
            请生成一个结构清晰的大纲，包括：
            1. 标题
            2. 主要章节
            3. 每个章节的要点
            4. 预期字数分配
            
            大纲格式要求：
            - 使用markdown格式
            - 层次清晰（使用##、###标记）
            - 每个部分包含具体的写作要点
            """
            
            if self.llm_client:
                # 使用真实的LLM生成
                system_prompt = self.system_prompts.get(writing_mode, self.system_prompts[WritingMode.ACADEMIC])
                response = await self.llm_client.generate_text(
                    prompt=outline_prompt,
                    system_prompt=system_prompt,
                    max_tokens=1000
                )
                outline = response.get("text", "").strip()
            else:
                # 使用模拟响应
                outline = self._generate_mock_outline(prompt, writing_mode)
            
            return {
                "success": True,
                "outline": outline,
                "mode": mode
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "outline": ""
            }
    
    async def generate_draft(self, outline: str, mode: str = "academic", iteration: int = 1) -> Dict[str, Any]:
        """基于大纲生成草稿"""
        try:
            writing_mode = WritingMode(mode)
            
            # 构建草稿生成提示
            draft_prompt = f"""
            基于以下大纲生成完整的文章草稿：
            
            大纲：
            {outline}
            
            写作要求：
            1. 内容要充实，逻辑清晰
            2. 段落之间要有自然的过渡
            3. 语言要符合{mode}写作风格
            4. 目标字数：2000-3000字
            5. 包含适当的引用占位符（如[1], [2]等）
            
            {'这是第' + str(iteration) + '次迭代，请在前次基础上改进内容质量。' if iteration > 1 else ''}
            """
            
            if self.llm_client:
                # 使用真实的LLM生成
                system_prompt = self.system_prompts.get(writing_mode, self.system_prompts[WritingMode.ACADEMIC])
                response = await self.llm_client.generate_text(
                    prompt=draft_prompt,
                    system_prompt=system_prompt,
                    max_tokens=3000
                )
                draft = response.get("text", "").strip()
            else:
                # 使用模拟响应
                draft = self._generate_mock_draft(outline, writing_mode, iteration)
            
            return {
                "success": True,
                "draft": draft,
                "mode": mode,
                "iteration": iteration
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "draft": ""
            }
    
    def _generate_mock_outline(self, prompt: str, writing_mode: WritingMode) -> str:
        """生成模拟大纲"""
        return f"""
# {prompt}

## 1. 引言
- 研究背景和意义
- 研究问题和目标
- 文章结构概述

## 2. 文献综述
- 相关理论基础
- 已有研究成果
- 研究空白和不足

## 3. 研究方法
- 研究设计
- 数据收集方法
- 分析框架

## 4. 研究发现
- 主要发现一
- 主要发现二
- 主要发现三

## 5. 讨论与分析
- 结果解释
- 理论意义
- 实践价值

## 6. 结论
- 研究总结
- 研究局限
- 未来研究方向

## 参考文献
"""
    
    def _generate_mock_draft(self, outline: str, writing_mode: WritingMode, iteration: int) -> str:
        """生成模拟草稿"""
        return f"""
# 基于大纲的文章草稿（第{iteration}次迭代）

## 引言

本文旨在探讨相关主题的重要性和研究价值。随着现代社会的快速发展，这一领域的研究显得尤为重要[1]。通过系统的分析和深入的探讨，我们希望能够为该领域的理论发展和实践应用提供有价值的见解。

研究表明，相关理论和实践之间存在密切的联系[2]。本研究采用定性和定量相结合的方法，通过文献分析、案例研究等方式，深入探讨了相关问题的本质和规律。

## 文献综述

在过去的几十年中，学者们对这一领域进行了广泛的研究。Smith等人(2020)的研究发现[3]，相关因素对结果产生了显著影响。Johnson和Brown(2021)进一步指出[4]，现有的理论框架需要进一步完善和发展。

然而，当前的研究还存在一些不足。首先，大多数研究都集中在特定的案例或情境中，缺乏更广泛的适用性[5]。其次，现有的理论模型还不够完善，需要进一步的验证和改进[6]。

## 研究方法

本研究采用混合研究方法，结合了定量和定性的分析手段。具体而言，我们首先通过文献调研建立了理论框架，然后通过问卷调查收集了大量的实证数据。

数据分析采用了多种统计方法，包括描述性统计、相关分析和回归分析等。同时，我们还进行了深度访谈，以获得更深层次的洞察[7]。

## 研究发现

通过系统的分析，我们得出了以下主要发现：

首先，相关变量之间确实存在显著的正相关关系。数据显示，当A因素增加时，B因素也会相应增加，这一发现与我们的假设相符[8]。

其次，我们发现了一些意想不到的中介效应。C因素在A和B之间起到了重要的中介作用，这为我们理解整个过程提供了新的视角[9]。

最后，我们的研究还揭示了一些情境因素的重要性。在不同的环境条件下，变量之间的关系呈现出不同的模式[10]。

## 讨论与分析

这些发现具有重要的理论和实践意义。从理论角度来看，我们的研究丰富了现有的理论框架，为后续研究提供了新的思路[11]。

从实践角度来看，这些发现可以帮助从业者更好地理解相关现象，制定更有效的策略和方案[12]。特别是对于政策制定者而言，这些结果提供了重要的参考依据。

## 结论

本研究通过系统的分析，深入探讨了相关问题的本质和规律。我们的发现不仅丰富了理论知识，也为实践应用提供了有价值的指导。

然而，本研究也存在一定的局限性。首先，样本的代表性可能存在问题，需要在更大范围内验证我们的发现[13]。其次，由于时间和资源的限制，我们只能关注部分变量，未来的研究可以扩展到更多的影响因素。

未来的研究可以从以下几个方向展开：第一，扩大样本规模，提高研究结果的普适性；第二，引入更多的变量，构建更完整的理论模型；第三，采用纵向研究设计，探讨变量之间的因果关系[14]。

## 参考文献

[1] 示例引用1
[2] 示例引用2
...
[14] 示例引用14
"""