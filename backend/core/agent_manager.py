from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass
from abc import ABC, abstractmethod
import asyncio
from datetime import datetime

class AgentType(Enum):
    WRITING = "writing"
    LITERATURE = "literature"
    TOOLS = "tools"
    ORCHESTRATOR = "orchestrator"

@dataclass
class AgentMessage:
    content: str
    sender: str
    timestamp: datetime
    metadata: Dict[str, Any] = None

@dataclass
class AgentRequest:
    user_id: int
    document_id: Optional[int]
    prompt: str
    agent_type: AgentType
    context: Dict[str, Any] = None

@dataclass
class AgentResponse:
    content: str
    agent_type: AgentType
    success: bool
    metadata: Dict[str, Any] = None
    error: Optional[str] = None
    tokens_used: int = 0

class BaseAgent(ABC):
    def __init__(self, name: str, agent_type: AgentType):
        self.name = name
        self.agent_type = agent_type
        self.conversation_history: List[AgentMessage] = []
    
    @abstractmethod
    async def process(self, request: AgentRequest) -> AgentResponse:
        pass
    
    def add_message(self, message: AgentMessage):
        self.conversation_history.append(message)
    
    def get_recent_context(self, limit: int = 5) -> List[AgentMessage]:
        return self.conversation_history[-limit:]

class AgentManager:
    def __init__(self):
        self.agents: Dict[AgentType, BaseAgent] = {}
        self.active_sessions: Dict[int, Dict[str, Any]] = {}
    
    def register_agent(self, agent: BaseAgent):
        self.agents[agent.agent_type] = agent
        print(f"Agent {agent.name} registered as {agent.agent_type.value}")
    
    async def process_request(self, request: AgentRequest) -> AgentResponse:
        if request.agent_type not in self.agents:
            return AgentResponse(
                content="",
                agent_type=request.agent_type,
                success=False,
                error=f"Agent {request.agent_type.value} not found"
            )
        
        agent = self.agents[request.agent_type]
        
        # 记录用户消息
        user_message = AgentMessage(
            content=request.prompt,
            sender="user",
            timestamp=datetime.now(),
            metadata=request.context
        )
        agent.add_message(user_message)
        
        try:
            response = await agent.process(request)
            
            # 记录Agent响应
            agent_message = AgentMessage(
                content=response.content,
                sender=agent.name,
                timestamp=datetime.now(),
                metadata=response.metadata
            )
            agent.add_message(agent_message)
            
            return response
            
        except Exception as e:
            return AgentResponse(
                content="",
                agent_type=request.agent_type,
                success=False,
                error=str(e)
            )
    
    def get_agent(self, agent_type: AgentType) -> Optional[BaseAgent]:
        return self.agents.get(agent_type)
    
    def get_session_context(self, user_id: int) -> Dict[str, Any]:
        return self.active_sessions.get(user_id, {})
    
    def update_session_context(self, user_id: int, context: Dict[str, Any]):
        if user_id not in self.active_sessions:
            self.active_sessions[user_id] = {}
        self.active_sessions[user_id].update(context)

# 全局Agent管理器实例
agent_manager = AgentManager()