# 🔄 系统重构计划 - 从多功能助手到专业写作工具

## 📊 现状分析

### 当前系统架构
```
现有系统: 传统多功能AI助手
├── 前端: React 19.1.0 + Vite + Tailwind
├── 后端: FastAPI + SQLAlchemy + SQLite  
├── 功能: 写作Agent + 文献Agent + 工具Agent + 文档管理
└── 交互: 多页面分离式操作
```

### 目标系统架构  
```
新系统: 专业AI写作工作台
├── 前端: Next.js 14 + Zustand + XState + TipTap
├── 后端: FastAPI + PostgreSQL + Redis + 任务队列
├── 核心: 循环生成引擎 (Plan→Draft→Check→Quality)
└── 交互: 单页面持续工作流
```

---

## 🎯 重构目标

### 产品层面
- **从多功能工具 → 专业写作工具**: 聚焦长文创作场景
- **从手动操作 → 自动循环**: 最少人工干预完成高质量长文  
- **从分离功能 → 集成工作流**: 统一的写作→校验→优化循环

### 技术层面
- **从传统Web → PWA工作台**: 更好的桌面应用体验
- **从无状态 → 状态机驱动**: 复杂工作流的精确控制
- **从即时响应 → 持续处理**: 支持长时间后台任务

---

## 🚨 关键变化点

### 1. 核心业务逻辑重构 🔴
**影响**: 根本性重写
- **现在**: 用户手动选择Agent → 单次处理 → 返回结果
- **目标**: 自动循环引擎 → 持续优化 → 质量达标才停止

### 2. 用户界面完全重构 🔴  
**影响**: 前端全部重写
- **现在**: 多页面应用，功能分散
- **目标**: Holy Grail单页面布局，专注写作流程

### 3. 数据模型扩展 🟡
**影响**: 数据库schema变更
- **现在**: 简单文档表 + 用户表
- **目标**: 工作流节点 + 版本树 + 质量指标

### 4. 技术栈升级 🟡
**影响**: 部分重写
- **现在**: React CSR + 传统API
- **目标**: Next.js SSR + tRPC + PWA

---

## 📋 重构任务分解

### 阶段1: 基础架构重建 (2周)

#### 1.1 前端架构重构
```bash
# 新建Next.js项目
npx create-next-app@latest ai-writing-tool --typescript --tailwind --app
cd ai-writing-tool

# 安装核心依赖
npm install zustand xstate @xstate/react
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-*
npm install framer-motion
npm install @trpc/client @trpc/server @trpc/next @trpc/react-query
```

#### 1.2 后端架构扩展
```bash
# 在现有backend基础上扩展
pip install redis celery
pip install asyncpg  # PostgreSQL异步驱动
pip install sentence-transformers  # 本地可读性检测
```

#### 1.3 数据库Schema设计
```sql
-- 新增表结构
CREATE TABLE workflow_documents (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    status workflow_status_enum,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY, 
    document_id UUID REFERENCES workflow_documents(id),
    type node_type_enum,
    status node_status_enum,
    content TEXT,
    metrics JSONB,
    parent_id UUID REFERENCES workflow_nodes(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quality_metrics (
    id UUID PRIMARY KEY,
    node_id UUID REFERENCES workflow_nodes(id),
    readability_score FLOAT,
    grammar_errors INTEGER,
    citation_count INTEGER,
    word_count INTEGER,
    token_usage INTEGER,
    processing_time INTEGER
);

-- 枚举类型
CREATE TYPE workflow_status_enum AS ENUM (
    'idle', 'planning', 'drafting', 'citation_check', 
    'grammar_check', 'readability_check', 'done', 'failed'
);

CREATE TYPE node_type_enum AS ENUM (
    'Plan', 'Draft', 'Citation', 'Grammar', 'Readability', 'UserEdit', 'Plugin'
);

CREATE TYPE node_status_enum AS ENUM (
    'pending', 'running', 'pass', 'fail'
);
```

### 阶段2: 循环引擎开发 (3周)

#### 2.1 状态机定义
```typescript
// frontend/lib/workflow-machine.ts
import { createMachine, assign } from 'xstate';

export const workflowMachine = createMachine({
  id: 'writing-workflow',
  initial: 'idle',
  context: {
    documentId: null,
    currentContent: '',
    nodes: [],
    config: {
      readabilityThreshold: 70,
      maxRetries: 3,
      autoRun: false
    }
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'planning',
          actions: assign({
            documentId: (_, event) => event.documentId
          })
        }
      }
    },
    planning: {
      invoke: {
        src: 'planningService',
        onDone: {
          target: 'drafting',
          actions: assign({
            currentContent: (_, event) => event.data.outline
          })
        },
        onError: 'failed'
      }
    },
    drafting: {
      invoke: {
        src: 'draftingService', 
        onDone: {
          target: 'citationCheck',
          actions: assign({
            currentContent: (_, event) => event.data.content
          })
        },
        onError: 'failed'
      }
    },
    citationCheck: {
      invoke: {
        src: 'citationService',
        onDone: [
          {
            target: 'grammarCheck',
            cond: 'citationsPassed'
          },
          {
            target: 'drafting', // 回退重试
            actions: 'incrementRetryCount'
          }
        ],
        onError: 'failed'
      }
    },
    grammarCheck: {
      invoke: {
        src: 'grammarService',
        onDone: [
          {
            target: 'readabilityCheck', 
            cond: 'grammarPassed'
          },
          {
            target: 'drafting',
            actions: 'incrementRetryCount'
          }
        ],
        onError: 'failed'
      }
    },
    readabilityCheck: {
      invoke: {
        src: 'readabilityService',
        onDone: [
          {
            target: 'done',
            cond: 'readabilityPassed'
          },
          {
            target: 'drafting',
            actions: 'incrementRetryCount'
          }
        ],
        onError: 'failed'
      }
    },
    done: {
      type: 'final'
    },
    failed: {
      on: {
        RETRY: 'planning',
        RESET: 'idle'
      }
    }
  }
});
```

#### 2.2 后端循环引擎
```python
# backend/core/workflow_engine.py
from celery import Celery
from enum import Enum
import asyncio

class WorkflowEngine:
    def __init__(self, redis_url: str):
        self.celery = Celery('workflow', broker=redis_url)
        self.setup_tasks()
    
    def setup_tasks(self):
        @self.celery.task
        async def plan_document(document_id: str, user_prompt: str):
            """Plan阶段: 生成文档大纲"""
            try:
                # 调用Claude API生成大纲
                outline = await self.llm_client.generate_outline(user_prompt)
                
                # 保存节点
                node = await self.create_node(
                    document_id=document_id,
                    type="Plan", 
                    content=outline,
                    status="pass"
                )
                
                # 触发下一步
                draft_document.delay(document_id, outline)
                return {"success": True, "outline": outline}
                
            except Exception as e:
                await self.mark_node_failed(document_id, "Plan", str(e))
                return {"success": False, "error": str(e)}
        
        @self.celery.task  
        async def draft_document(document_id: str, outline: str):
            """Draft阶段: 基于大纲生成内容"""
            try:
                # 生成完整内容
                content = await self.llm_client.generate_content(outline)
                
                # 保存节点
                node = await self.create_node(
                    document_id=document_id,
                    type="Draft",
                    content=content, 
                    status="pass"
                )
                
                # 触发引用检查
                check_citations.delay(document_id, content)
                return {"success": True, "content": content}
                
            except Exception as e:
                await self.mark_node_failed(document_id, "Draft", str(e))
                return {"success": False, "error": str(e)}
        
        @self.celery.task
        async def check_citations(document_id: str, content: str):
            """Citation阶段: 验证和格式化引用"""
            try:
                # 提取引用
                citations = self.extract_citations(content)
                
                # 验证DOI
                validated_citations = []
                for citation in citations:
                    if citation.doi:
                        is_valid = await self.validate_doi(citation.doi)
                        if not is_valid:
                            # 引用验证失败, 回退到Draft
                            await self.rollback_to_draft(document_id, "Invalid citation")
                            return {"success": False, "error": "Citation validation failed"}
                        validated_citations.append(citation)
                
                # 格式化引用
                formatted_content = self.format_citations(content, validated_citations)
                
                # 保存节点
                node = await self.create_node(
                    document_id=document_id,
                    type="Citation",
                    content=formatted_content,
                    status="pass",
                    metrics={"citation_count": len(validated_citations)}
                )
                
                # 触发语法检查
                check_grammar.delay(document_id, formatted_content)
                return {"success": True, "content": formatted_content}
                
            except Exception as e:
                await self.mark_node_failed(document_id, "Citation", str(e))
                return {"success": False, "error": str(e)}
```

### 阶段3: UI组件重构 (3周)

#### 3.1 Layout组件
```typescript
// app/layout.tsx - Holy Grail布局
export default function WritingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* TopBar */}
      <TopBar />
      
      {/* ProcessBar */} 
      <ProcessBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <main className="flex-1 px-[min(8%,120px)] py-8 overflow-y-auto">
          {children}
        </main>
        
        {/* Chat Panel */}
        <ChatPanel className="w-[24%] max-w-[380px] min-w-[300px] border-l" />
      </div>
    </div>
  )
}
```

#### 3.2 ProcessBar组件
```typescript
// components/ProcessBar.tsx
import { motion } from 'framer-motion'
import { useWorkflow } from '@/hooks/useWorkflow'

export function ProcessBar() {
  const { nodes, currentNode, rollbackToNode } = useWorkflow()
  
  return (
    <div className="h-12 pl-4 flex items-center gap-2 bg-gray-50 border-b sticky top-14 z-30">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer",
            {
              "bg-blue-100 text-blue-800": node.status === "running",
              "bg-green-100 text-green-800": node.status === "pass", 
              "bg-red-100 text-red-800": node.status === "fail",
              "bg-gray-100 text-gray-600": node.status === "pending"
            }
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => rollbackToNode(node.id)}
        >
          <NodeIcon type={node.type} status={node.status} />
          <span className="text-sm font-medium">{node.type}</span>
          {node.status === "running" && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
```

#### 3.3 MainEditor组件
```typescript
// components/MainEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FloatingToolbar } from './FloatingToolbar'
import { PreviewOverlay } from './PreviewOverlay'

export function MainEditor() {
  const { content, previewContent, updateContent } = useWorkflow()
  const [selectedText, setSelectedText] = useState('')
  
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      updateContent(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to)
      setSelectedText(text)
    }
  })

  return (
    <div className="relative prose max-w-none">
      <EditorContent editor={editor} />
      
      {/* 浮动工具条 */}
      {selectedText && (
        <FloatingToolbar 
          selectedText={selectedText}
          onAction={(action) => handleToolbarAction(action, selectedText)}
        />
      )}
      
      {/* 预览覆盖层 */}
      {previewContent && (
        <PreviewOverlay 
          content={previewContent}
          onConfirm={() => acceptPreview(previewContent)}
          onReject={() => rejectPreview()}
        />
      )}
    </div>
  )
}
```

### 阶段4: 引用校验系统 (2周)

#### 4.1 Redis缓存层
```python
# backend/core/citation_cache.py
import redis
import json
from typing import Optional

class CitationCache:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url, decode_responses=True)
        
    async def get_citation(self, doi: str) -> Optional[dict]:
        """从缓存获取引用信息"""
        key = f"cite:{doi}"
        cached = self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None
    
    async def set_citation(self, doi: str, citation_data: dict):
        """缓存引用信息"""
        key = f"cite:{doi}"
        self.redis.setex(
            key, 
            7 * 24 * 3600,  # 7天过期
            json.dumps(citation_data)
        )
    
    async def get_cache_stats(self) -> dict:
        """获取缓存统计"""
        info = self.redis.info()
        return {
            "used_memory": info["used_memory_human"],
            "hit_rate": self.calculate_hit_rate(),
            "key_count": self.redis.dbsize()
        }
```

#### 4.2 DOI验证服务
```python
# backend/services/citation_service.py
import httpx
from typing import List, Dict

class CitationService:
    def __init__(self, cache: CitationCache):
        self.cache = cache
        self.crossref_api = "https://api.crossref.org/works/"
        
    async def validate_doi(self, doi: str) -> bool:
        """验证DOI有效性"""
        # 先检查缓存
        cached = await self.cache.get_citation(doi)
        if cached:
            return cached.get("valid", False)
        
        # 调用CrossRef API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.crossref_api}{doi}")
                is_valid = response.status_code == 200
                
                # 缓存结果
                citation_data = {
                    "valid": is_valid,
                    "metadata": response.json() if is_valid else None
                }
                await self.cache.set_citation(doi, citation_data)
                
                return is_valid
                
            except Exception:
                return False
    
    async def format_citation(self, doi: str, style: str = "APA") -> str:
        """格式化引用"""
        cached = await self.cache.get_citation(doi)
        if not cached or not cached["valid"]:
            return f"[Invalid Citation: {doi}]"
        
        metadata = cached["metadata"]["message"]
        
        if style == "APA":
            return self.format_apa(metadata)
        elif style == "GB/T":
            return self.format_gbt(metadata)
        else:
            return self.format_apa(metadata)
```

### 阶段5: 质量检测系统 (1.5周)

#### 5.1 可读性检测
```python
# backend/services/readability_service.py
import textstat
from textstat import flesch_kincaid_grade

class ReadabilityService:
    
    def __init__(self, threshold: float = 70.0):
        self.threshold = threshold
    
    def calculate_score(self, text: str) -> dict:
        """计算可读性分数"""
        # Flesch-Kincaid Grade Level
        fk_grade = flesch_kincaid_grade(text)
        
        # 转换为0-100分数 (100-fk_grade*10, 最低0分)
        score = max(0, min(100, 100 - fk_grade * 10))
        
        # 其他指标
        avg_sentence_length = textstat.avg_sentence_length(text)
        difficult_words = textstat.difficult_words(text)
        word_count = textstat.lexicon_count(text)
        
        return {
            "score": score,
            "grade_level": fk_grade,
            "avg_sentence_length": avg_sentence_length,
            "difficult_words_ratio": difficult_words / word_count if word_count > 0 else 0,
            "word_count": word_count,
            "passed": score >= self.threshold
        }
    
    def get_improvement_suggestions(self, text: str, score_data: dict) -> List[str]:
        """生成改进建议"""
        suggestions = []
        
        if score_data["avg_sentence_length"] > 20:
            suggestions.append("尝试缩短句子长度，平均句长建议控制在15-20字")
            
        if score_data["difficult_words_ratio"] > 0.3:
            suggestions.append("减少复杂词汇使用，用更常见的词替换专业术语")
            
        if score_data["grade_level"] > 12:
            suggestions.append("降低文章复杂度，使用更简单的句式结构")
            
        return suggestions
```

### 阶段6: PWA离线功能 (1周)

#### 6.1 Service Worker配置
```typescript
// public/sw.js
const CACHE_NAME = 'ai-writing-tool-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，返回缓存
        if (response) {
          return response
        }
        
        // 网络请求
        return fetch(event.request).catch(() => {
          // 网络失败，返回离线页面
          if (event.request.destination === 'document') {
            return caches.match('/offline.html')
          }
        })
      })
  )
})
```

---

## 🗂️ 数据迁移策略

### 现有数据保留
```sql
-- 保留现有用户数据
INSERT INTO new_users SELECT * FROM users;

-- 迁移文档数据，创建对应的工作流
INSERT INTO workflow_documents (id, title, content, status, created_at)
SELECT 
    id,
    title, 
    content,
    'done'::workflow_status_enum,
    created_at
FROM documents;

-- 为每个现有文档创建一个UserEdit节点
INSERT INTO workflow_nodes (document_id, type, status, content)
SELECT 
    id,
    'UserEdit'::node_type_enum,
    'pass'::node_status_enum, 
    content
FROM workflow_documents;
```

### 渐进式迁移
1. **阶段1**: 新老系统并行运行，新功能在新系统开发
2. **阶段2**: 提供数据导入工具，用户主动迁移
3. **阶段3**: 逐步下线老系统功能模块
4. **阶段4**: 完全切换到新系统

---

## ⚠️ 风险控制

### 技术风险
- **复杂度暴增**: 引入状态机增加调试难度
  - *缓解*: 完善日志和可视化调试工具
- **性能瓶颈**: 循环处理可能长时间占用资源  
  - *缓解*: 任务队列+超时机制+资源监控
- **数据一致性**: 并发修改和回滚可能导致数据冲突
  - *缓解*: 乐观锁+事务+冲突检测

### 业务风险  
- **用户接受度**: 界面和交互方式完全改变
  - *缓解*: 渐进式发布+用户培训+快速反馈
- **API成本**: 循环调用可能大幅增加费用
  - *缓解*: 智能缓存+本地模型+用量监控

### 项目风险
- **开发周期**: 12周重构时间可能不够
  - *缓解*: MVP优先+并行开发+灵活调整
- **团队负荷**: 同时维护新老两套系统
  - *缓解*: 合理分工+技术债务管理

---

## 📈 成功标准

### 里程碑验收标准
- **M0**: 新技术栈基础环境搭建完成，基本API可用
- **M1**: 循环引擎核心流程跑通，能生成完整文档
- **M2**: 新UI界面完成，用户可正常操作
- **M3**: 引用校验系统集成，缓存命中率>95%
- **M4**: PWA功能完整，离线可用

### 最终验收标准
- [ ] 用户可通过一条指令生成2000字文章
- [ ] 可读性检测准确率>95%
- [ ] 系统响应时间<150ms  
- [ ] 引用验证准确率>99%
- [ ] PWA离线功能完整可用

---

**重构计划总结**: 这是一次产品形态的根本性转变，从多功能助手到专业写作工具。需要12周时间，分6个阶段逐步完成。关键是保证用户体验的连续性和数据的安全迁移。