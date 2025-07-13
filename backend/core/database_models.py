"""
数据库模型定义
合并原有模型和新的工作流模型
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, Enum, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

Base = declarative_base()

# 枚举定义
class DocumentType(enum.Enum):
    ACADEMIC = "academic"
    BLOG = "blog"
    SOCIAL = "social"

class AgentType(enum.Enum):
    WRITING = "writing"
    LITERATURE = "literature"
    TOOLS = "tools"

class LiteratureSource(enum.Enum):
    GOOGLE_SCHOLAR = "google_scholar"
    PUBMED = "pubmed"
    ARXIV = "arxiv"
    MANUAL = "manual"

class WorkflowStatus(enum.Enum):
    IDLE = "idle"
    PLANNING = "planning"
    DRAFTING = "drafting"
    CITATION_CHECK = "citation_check"
    GRAMMAR_CHECK = "grammar_check"
    READABILITY_CHECK = "readability_check"
    DONE = "done"
    FAILED = "failed"

class NodeType(enum.Enum):
    PLAN = "Plan"
    DRAFT = "Draft"
    CITATION = "Citation"
    GRAMMAR = "Grammar"
    READABILITY = "Readability"
    USER_EDIT = "UserEdit"
    PLUGIN = "Plugin"

class NodeStatus(enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASS = "pass"
    FAIL = "fail"

# 原有表结构
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    literature = relationship("Literature", back_populates="user", cascade="all, delete-orphan")
    writing_sessions = relationship("WritingSession", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    workflow_documents = relationship("WorkflowDocument", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    content = Column(Text)
    document_type = Column(Enum(DocumentType), default=DocumentType.ACADEMIC)
    word_count = Column(Integer, default=0)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="documents")

class Literature(Base):
    __tablename__ = "literature"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(1000), nullable=False)
    authors = Column(String(500))
    year = Column(Integer)
    doi = Column(String(100), index=True)
    abstract = Column(Text)
    url = Column(String(1000))
    file_path = Column(String(500))
    source = Column(Enum(LiteratureSource), default=LiteratureSource.MANUAL)
    is_favorite = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="literature")

class WritingSession(Base):
    __tablename__ = "writing_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    agent_type = Column(Enum(AgentType), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text)
    tokens_used = Column(Integer, default=0)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="writing_sessions")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    theme = Column(String(20), default="light")
    language = Column(String(10), default="zh-CN")
    auto_save = Column(Boolean, default=True)
    auto_save_interval = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="settings")

# 新的工作流表结构
class WorkflowDocument(Base):
    """工作流文档表"""
    __tablename__ = "workflow_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.IDLE)
    config = Column(JSON)  # 存储循环配置
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    nodes = relationship("WorkflowNode", back_populates="document", cascade="all, delete-orphan")
    user = relationship("User", back_populates="workflow_documents")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")

class WorkflowNode(Base):
    """工作流节点表"""
    __tablename__ = "workflow_nodes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("workflow_documents.id"), nullable=False)
    type = Column(Enum(NodeType), nullable=False)
    status = Column(Enum(NodeStatus), default=NodeStatus.PENDING)
    content = Column(Text)
    parent_id = Column(String, ForeignKey("workflow_nodes.id"))
    branch = Column(String)  # 分支标识
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    document = relationship("WorkflowDocument", back_populates="nodes")
    parent = relationship("WorkflowNode", remote_side="WorkflowNode.id")
    metrics = relationship("NodeMetrics", back_populates="node", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="node", cascade="all, delete-orphan")

class NodeMetrics(Base):
    """节点指标表"""
    __tablename__ = "node_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id = Column(String, ForeignKey("workflow_nodes.id"), nullable=False)
    readability_score = Column(Float)
    grammar_errors = Column(Integer)
    citation_count = Column(Integer)
    word_count = Column(Integer)
    token_usage = Column(Integer)
    processing_time = Column(Integer)  # 毫秒
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    node = relationship("WorkflowNode", back_populates="metrics")

class Citation(Base):
    """引用表"""
    __tablename__ = "citations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doi = Column(String, unique=True, index=True)
    pmid = Column(String, index=True)
    title = Column(String(1000), nullable=False)
    authors = Column(JSON)  # 作者列表
    year = Column(Integer)
    journal = Column(String(500))
    volume = Column(String(50))
    pages = Column(String(50))
    url = Column(String(1000))
    abstract = Column(Text)
    is_valid = Column(Boolean, default=True)
    validation_date = Column(DateTime, default=datetime.utcnow)
    extra_metadata = Column(JSON)  # 其他元数据
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    """聊天消息表"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("workflow_documents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message_type = Column(String, nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    node_id = Column(String, ForeignKey("workflow_nodes.id"))  # 关联的节点
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    document = relationship("WorkflowDocument", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")
    node = relationship("WorkflowNode", back_populates="chat_messages")

class QualityThreshold(Base):
    """质量阈值设置表"""
    __tablename__ = "quality_thresholds"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    document_id = Column(String, ForeignKey("workflow_documents.id"))  # 可选，文档特定设置
    readability_threshold = Column(Float, default=70.0)
    max_retries = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=60)
    auto_run = Column(Boolean, default=False)
    writing_mode = Column(String, default="academic")  # academic, blog, social
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = relationship("User")
    document = relationship("WorkflowDocument")