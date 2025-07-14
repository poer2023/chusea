# FastAPI 端点映射表

## 概述

本文档提供了ChUseA项目中FastAPI后端端点与前端方法的完整映射关系，包括请求参数、响应格式和使用示例。

## 端点分类

### 1. 系统端点

#### 1.1 根端点
| 端点 | 方法 | 前端调用 | 说明 |
|------|------|----------|------|
| `/` | GET | `fastAPIClient.getRoot()` | 获取API根信息 |
| `/health` | GET | `fastAPIClient.healthCheck()` | 健康检查 |

**响应示例**:
```json
// GET /
{
  "message": "AI Writing Assistant API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc",
  "endpoints": {
    "writing": "/api/writing",
    "literature": "/api/literature",
    "tools": "/api/tools",
    "documents": "/api/documents",
    "workflow": "/api/workflow"
  }
}

// GET /health
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00",
  "version": "1.0.0",
  "components": {
    "database": "connected",
    "agents": {
      "writing": "active",
      "literature": "active",
      "tools": "active"
    }
  }
}
```

### 2. 认证端点 (`/api/auth`)

#### 2.1 用户注册
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/auth/register` | POST | `fastAPIClient.register(userData)` | UserCreate |

**请求参数**:
```typescript
interface UserCreate {
  username: string;      // 3-50字符
  email: string;        // 有效邮箱格式
  password: string;     // 最少6字符
}
```

**响应格式**:
```typescript
interface UserResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}
```

#### 2.2 用户登录
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/auth/login` | POST | - | OAuth2PasswordRequestForm |
| `/api/auth/login-json` | POST | `fastAPIClient.login(credentials)` | LoginRequest |

**请求参数** (login-json):
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**响应格式**:
```typescript
interface Token {
  access_token: string;
  token_type: string;
  expires_in?: number;
}
```

#### 2.3 用户信息
| 端点 | 方法 | 前端调用 | 认证 |
|------|------|----------|------|
| `/api/auth/me` | GET | `fastAPIClient.getCurrentUser()` | 需要 |
| `/api/auth/verify` | GET | `fastAPIClient.verifyToken()` | 需要 |

#### 2.4 开发环境端点
| 端点 | 方法 | 前端调用 | 说明 |
|------|------|----------|------|
| `/api/auth/dev-login` | POST | `fastAPIClient.devLogin()` | 开发环境自动登录 |
| `/api/auth/dev-status` | GET | `fastAPIClient.getDevAuthStatus()` | 开发环境状态 |

### 3. 文档管理端点 (`/api/documents`)

#### 3.1 文档列表
| 端点 | 方法 | 前端调用 | 查询参数 |
|------|------|----------|----------|
| `/api/documents` | GET | `fastAPIClient.getDocuments(filters)` | 分页和过滤 |

**查询参数**:
```typescript
interface DocumentFilters {
  page?: number;           // 页码，默认1
  page_size?: number;      // 每页数量，默认10，最大100
  document_type?: DocumentType; // 文档类型过滤
  search?: string;         // 搜索关键词
}
```

**响应格式**:
```typescript
interface DocumentListResponse {
  documents: DocumentResponse[];
  total: number;
  page: number;
  page_size: number;
}
```

#### 3.2 单个文档操作
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/documents/{id}` | GET | `fastAPIClient.getDocument(id)` | 文档ID |
| `/api/documents/{id}` | PUT | `fastAPIClient.updateDocument(id, data)` | 文档ID + 更新数据 |
| `/api/documents/{id}` | DELETE | `fastAPIClient.deleteDocument(id)` | 文档ID |

#### 3.3 文档创建和操作
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/documents` | POST | `fastAPIClient.createDocument(data)` | DocumentCreate |
| `/api/documents/{id}/duplicate` | POST | `fastAPIClient.duplicateDocument(id)` | 文档ID |

**创建文档参数**:
```typescript
interface DocumentCreate {
  title: string;                    // 1-500字符
  content?: string;                 // 可选内容
  document_type: DocumentType;      // 文档类型
}

enum DocumentType {
  ACADEMIC = 'academic',
  BLOG = 'blog',
  SOCIAL = 'social'
}
```

#### 3.4 文档统计
| 端点 | 方法 | 前端调用 | 说明 |
|------|------|----------|------|
| `/api/documents/stats/overview` | GET | `fastAPIClient.getDocumentStats()` | 获取文档统计信息 |

**统计响应**:
```typescript
interface DocumentStats {
  total_documents: number;
  document_types: Record<string, number>;
  total_words: number;
  average_words_per_document: number;
}
```

### 4. 写作功能端点 (`/api/writing`)

#### 4.1 核心写作功能
| 端点 | 方法 | 前端调用 | 说明 |
|------|------|----------|------|
| `/api/writing/generate` | POST | `fastAPIClient.generateWriting(request)` | 生成写作内容 |
| `/api/writing/improve` | POST | `fastAPIClient.improveWriting(request)` | 改进写作内容 |
| `/api/writing/convert` | POST | `fastAPIClient.convertWritingMode(request)` | 转换写作模式 |

**写作请求参数**:
```typescript
interface WritingRequest {
  prompt: string;                   // 写作提示词
  user_id?: number;                // 用户ID
  document_id?: number;            // 关联文档ID
  mode?: string;                   // 写作模式，默认'academic'
  context?: Record<string, any>;   // 上下文信息
}
```

**写作响应格式**:
```typescript
interface WritingResponse {
  content: string;                 // 生成的内容
  success: boolean;                // 操作是否成功
  metadata: Record<string, any>;   // 元数据
  tokens_used: number;             // 使用的token数量
  error?: string;                  // 错误信息
}
```

#### 4.2 写作辅助功能
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/writing/suggestions/{mode}` | GET | `fastAPIClient.getWritingSuggestions(mode)` | 写作模式 |
| `/api/writing/modes` | GET | `fastAPIClient.getWritingModes()` | 无 |

### 5. 文献管理端点 (`/api/literature`)

#### 5.1 文献搜索
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/literature/search` | POST | `fastAPIClient.searchLiterature(request)` | 搜索请求 |

**搜索请求参数**:
```typescript
interface LiteratureSearchRequest {
  query: string;                   // 搜索关键词
  max_results?: number;           // 最大结果数，1-50，默认10
  year_range?: [number, number];  // 年份范围
  include_abstract?: boolean;      // 是否包含摘要，默认true
}
```

**搜索响应格式**:
```typescript
interface LiteratureSearchResponse {
  results: LiteratureResponse[];
  total: number;
  success: boolean;
  error?: string;
}

interface LiteratureResponse {
  id: number;
  title: string;
  authors: string | null;
  year: number | null;
  source: LiteratureSource;
  doi: string | null;
  abstract: string | null;
  url: string | null;
  file_path: string | null;
  user_id: number;
  is_favorite: boolean;
  created_at: string;
}
```

### 6. 工作流端点 (`/api/workflow`)

#### 6.1 工作流文档管理
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/workflow/documents` | GET | `fastAPIClient.getWorkflowDocuments()` | 无 |
| `/api/workflow/documents` | POST | `fastAPIClient.createWorkflowDocument(title, config)` | 标题和配置 |

**工作流配置**:
```typescript
interface LoopConfig {
  readability_threshold?: number;  // 可读性阈值，0-100，默认70
  max_retries?: number;           // 最大重试次数，1-10，默认3
  auto_run?: boolean;             // 自动运行，默认false
  timeout?: number;               // 超时时间，10-300秒，默认60
  writing_mode?: string;          // 写作模式，默认'academic'
}
```

#### 6.2 工作流控制
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/workflow/start` | POST | `fastAPIClient.startWorkflow(request)` | 启动请求 |
| `/api/workflow/{document_id}/stop` | POST | `fastAPIClient.stopWorkflow(documentId)` | 文档ID |
| `/api/workflow/{document_id}/status` | GET | `fastAPIClient.getWorkflowStatus(documentId)` | 文档ID |

**启动工作流请求**:
```typescript
interface StartWorkflowRequest {
  document_id: string;
  prompt: string;
  config?: LoopConfig;
}
```

**工作流状态响应**:
```typescript
interface WorkflowStatusResponse {
  document_id: string;
  status: string;
  progress: number;              // 0-100进度百分比
  current_node: WorkflowNode | null;
  nodes: WorkflowNode[];
}

interface WorkflowNode {
  id: string;
  type: NodeType;               // 'plan' | 'draft' | 'review' | 'final'
  status: NodeStatus;           // 'pending' | 'running' | 'completed' | 'failed'
  content: string | null;
  created_at: string;
  retry_count: number;
  metrics: NodeMetrics | null;
}
```

#### 6.3 工作流高级操作
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/workflow/{document_id}/rollback/{node_id}` | POST | `fastAPIClient.rollbackToNode(documentId, nodeId)` | 文档ID + 节点ID |
| `/api/workflow/{document_id}/nodes` | GET | `fastAPIClient.getWorkflowNodes(documentId)` | 文档ID |

#### 6.4 工作流WebSocket
| 端点 | 协议 | 前端调用 | 说明 |
|------|------|----------|------|
| `/api/workflow/ws/{document_id}` | WebSocket | `fastAPIClient.createWorkflowWebSocket(documentId)` | 实时工作流更新 |

**WebSocket消息格式**:
```typescript
interface WorkflowUpdateMessage {
  type: string;                   // 消息类型
  workflow_id: string;
  document_id: string;
  status: WorkflowStatus;
  progress: number;
  current_node?: WorkflowNode;
  message?: string;
  timestamp: string;
}
```

### 7. 工具端点 (`/api/tools`)

#### 7.1 格式转换
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/tools/format/convert` | POST | `fastAPIClient.convertFormat(request)` | 转换请求 |

**格式转换请求**:
```typescript
interface FormatConversionRequest {
  content: string;                        // 要转换的内容
  from_format: 'markdown' | 'html' | 'docx' | 'pdf';
  to_format: 'markdown' | 'html' | 'docx' | 'pdf';
}
```

#### 7.2 图表生成
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/api/tools/chart/generate` | POST | `fastAPIClient.generateChart(request)` | 图表请求 |

**图表生成请求**:
```typescript
interface ChartGenerationRequest {
  data: Record<string, any>;              // 图表数据
  chart_type: 'bar' | 'line' | 'pie' | 'scatter';
  title?: string;                         // 图表标题
  description?: string;                   // 图表描述
}
```

### 8. 文件操作端点

#### 8.1 文件上传
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/files/upload` | POST | `fastAPIClient.uploadFile(file, options)` | 文件 + 选项 |

**上传选项**:
```typescript
interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  purpose?: string;                       // 上传目的
  documentId?: string;                    // 关联文档ID
}

interface UploadProgress {
  loaded: number;                         // 已上传字节数
  total: number;                          // 总字节数
  percentage: number;                     // 上传百分比
}
```

**上传响应**:
```typescript
interface UploadResponse {
  file_id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}
```

#### 8.2 文件下载
| 端点 | 方法 | 前端调用 | 参数 |
|------|------|----------|------|
| `/files/{id}/download` | GET | `fastAPIClient.downloadFile(fileId, options)` | 文件ID + 选项 |

## 错误响应格式

所有端点的错误响应都遵循统一格式：

```typescript
interface ErrorResponse {
  detail: string;                         // 错误详情
  code?: string;                          // 错误代码
  timestamp?: string;                     // 错误时间
}

// 验证错误格式
interface ValidationError {
  detail: Array<{
    loc: (string | number)[];             // 错误位置
    msg: string;                          // 错误消息
    type: string;                         // 错误类型
  }>;
}
```

## 常见错误代码

| 错误代码 | HTTP状态码 | 说明 |
|----------|------------|------|
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 422 | 请求参数验证失败 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部错误 |
| `TIMEOUT` | 408 | 请求超时 |
| `FILE_TOO_LARGE` | 413 | 文件过大 |
| `RATE_LIMITED` | 429 | 请求频率超限 |

## 使用示例

### 1. 完整的文档CRUD操作

```typescript
import { fastAPIClient, DocumentType } from '@/lib/fastapi';

// 创建文档
const newDocument = await fastAPIClient.createDocument({
  title: '我的新文档',
  content: '这是文档内容',
  document_type: DocumentType.ACADEMIC
});

// 获取文档列表
const documents = await fastAPIClient.getDocuments({
  page: 1,
  page_size: 10,
  document_type: DocumentType.ACADEMIC,
  search: '关键词'
});

// 获取单个文档
const document = await fastAPIClient.getDocument(newDocument.id);

// 更新文档
const updatedDocument = await fastAPIClient.updateDocument(newDocument.id, {
  title: '更新后的标题',
  content: '更新后的内容'
});

// 复制文档
const duplicatedDocument = await fastAPIClient.duplicateDocument(newDocument.id);

// 删除文档
await fastAPIClient.deleteDocument(newDocument.id);
```

### 2. 工作流操作示例

```typescript
import { fastAPIClient } from '@/lib/fastapi';

// 创建工作流文档
const workflowDoc = await fastAPIClient.createWorkflowDocument('AI论文写作', {
  readability_threshold: 75,
  max_retries: 5,
  auto_run: true,
  timeout: 120,
  writing_mode: 'academic'
});

// 启动工作流
const startResult = await fastAPIClient.startWorkflow({
  document_id: workflowDoc.id,
  prompt: '写一篇关于机器学习的综述论文',
  config: {
    readability_threshold: 80,
    max_retries: 3
  }
});

// 监听工作流进度
const ws = fastAPIClient.createWorkflowWebSocket(workflowDoc.id);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`工作流进度: ${update.progress}%`);
  console.log(`当前状态: ${update.status}`);
};

// 获取工作流状态
const status = await fastAPIClient.getWorkflowStatus(workflowDoc.id);

// 获取工作流节点历史
const nodes = await fastAPIClient.getWorkflowNodes(workflowDoc.id);

// 回滚到特定节点
await fastAPIClient.rollbackToNode(workflowDoc.id, nodes[0].id);

// 停止工作流
await fastAPIClient.stopWorkflow(workflowDoc.id);
```

### 3. 认证流程示例

```typescript
import { fastAPIAuthManager } from '@/lib/fastapi';

// 检查开发环境状态
const devStatus = await fastAPIAuthManager.getDevAuthStatus();
if (devStatus?.auto_login_available) {
  // 开发环境自动登录
  await fastAPIAuthManager.devLogin();
} else {
  // 正常登录流程
  await fastAPIAuthManager.login({
    username: 'your_username',
    password: 'your_password'
  });
}

// 检查认证状态
if (fastAPIAuthManager.isAuthenticated()) {
  const user = fastAPIAuthManager.getCurrentUser();
  console.log('当前用户:', user);
}

// 验证token
const isValid = await fastAPIAuthManager.verifyToken();
if (!isValid) {
  // 重新登录
  fastAPIAuthManager.logout();
}
```

### 4. 文件上传示例

```typescript
import { fastAPIClient } from '@/lib/fastapi';

const handleFileUpload = async (file: File) => {
  try {
    const result = await fastAPIClient.uploadFile(file, {
      onProgress: (progress) => {
        console.log(`上传进度: ${progress.percentage}%`);
        setUploadProgress(progress.percentage);
      },
      purpose: 'document_attachment',
      documentId: currentDocumentId
    });
    
    console.log('文件上传成功:', {
      fileId: result.file_id,
      filename: result.filename,
      url: result.url,
      size: result.size
    });
    
    return result;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
};
```

## 注意事项

### 1. 认证要求
大部分端点需要Bearer Token认证，确保在请求头中包含有效的访问令牌：
```
Authorization: Bearer <access_token>
```

### 2. 数据格式
- 所有POST/PUT请求的Content-Type应为`application/json`
- 文件上传使用`multipart/form-data`
- 日期时间格式为ISO 8601字符串

### 3. 分页限制
- 页码从1开始
- 每页最大数量为100
- 超出限制会返回422错误

### 4. 文件上传限制
- 最大文件大小：100MB
- 支持的文件类型见配置文件
- 同时上传文件数量限制：10个

### 5. 速率限制
API调用有速率限制，过于频繁的请求会返回429错误。建议：
- 合理使用缓存
- 避免不必要的重复请求
- 使用批量操作接口

---

这个映射表提供了完整的API参考，帮助开发者快速定位和使用相应的端点。