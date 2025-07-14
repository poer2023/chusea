# FastAPI Integration Guide

## 概述

本文档详细介绍了ChUseA前端与FastAPI后端的完整集成方案。我们建立了一个强大的适配层，提供了类型安全的API调用、智能缓存、错误处理和实时通信功能。

## 架构概览

```
Frontend (Next.js + TypeScript)
├── FastAPI适配层
│   ├── 客户端封装 (client.ts)
│   ├── 类型定义 (types.ts)
│   ├── 端点映射 (endpoints.ts)
│   ├── 数据转换 (transformers.ts)
│   └── 认证管理 (auth.ts)
├── tRPC桥接层 (router.ts)
└── React Hooks集成
```

## 核心组件

### 1. FastAPI客户端 (`src/lib/fastapi/client.ts`)

#### 主要特性
- **类型安全**: 完整的TypeScript类型支持
- **智能缓存**: GET请求自动缓存，可配置TTL
- **请求去重**: 防止重复的并发请求
- **自动重试**: 指数退避重试机制
- **错误处理**: 统一的错误响应处理
- **文件上传**: 支持进度回调和大文件上传

#### 使用示例
```typescript
import { fastAPIClient } from '@/lib/fastapi';

// 基础使用
const documents = await fastAPIClient.getDocuments({
  page: 1,
  pageSize: 10,
  documentType: 'academic'
});

// 带配置的使用
const result = await fastAPIClient.createDocument({
  title: '新文档',
  content: '内容',
  document_type: 'academic'
});

// 文件上传
const uploadResult = await fastAPIClient.uploadFile(file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`);
  }
});
```

### 2. 类型定义 (`src/lib/fastapi/types.ts`)

#### 类型映射
所有FastAPI Pydantic模型都有对应的TypeScript接口：

```typescript
// 用户类型
interface FastAPIUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

// 文档类型
interface FastAPIDocument {
  id: string;
  title: string;
  content: string;
  documentType: DocumentType;
  wordCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 工作流类型
interface FastAPIWorkflowDocument {
  id: string;
  title: string;
  content: string;
  status: WorkflowStatus;
  config: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. 端点映射 (`src/lib/fastapi/endpoints.ts`)

#### 配置选项
```typescript
export const FASTAPI_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8002',
  DEFAULT_TIMEOUT: 30000,
  ENABLE_CACHING: true,
  CACHE_DURATION: 300000, // 5分钟
  ENABLE_LOGGING: true,
  // ... 更多配置
};
```

#### 端点定义
所有FastAPI路由都有对应的端点常量：

```typescript
export const FASTAPI_ENDPOINTS = {
  // 认证相关
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN_JSON: '/auth/login-json',
    ME: '/auth/me',
    VERIFY: '/auth/verify',
    DEV_LOGIN: '/auth/dev-login',
  },
  
  // 文档管理
  DOCUMENTS: {
    LIST: '/documents',
    GET: (id: string) => `/documents/${id}`,
    CREATE: '/documents',
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    DUPLICATE: (id: string) => `/documents/${id}/duplicate`,
    STATS: '/documents/stats/overview',
  },
  
  // 工作流管理
  WORKFLOW: {
    DOCUMENTS: '/workflow/documents',
    START: '/workflow/start',
    STOP: (documentId: string) => `/workflow/${documentId}/stop`,
    STATUS: (documentId: string) => `/workflow/${documentId}/status`,
    NODES: (documentId: string) => `/workflow/${documentId}/nodes`,
    WEBSOCKET: (documentId: string) => `/workflow/ws/${documentId}`,
  },
  
  // 其他端点...
};
```

### 4. 数据转换器 (`src/lib/fastapi/transformers.ts`)

#### 转换功能
- **日期时间转换**: ISO字符串 ↔ Date对象
- **命名规范转换**: snake_case ↔ camelCase  
- **数据结构适配**: 后端模型 ↔ 前端接口

```typescript
// 用户数据转换
static transformUserResponse(fastapiUser: any): FastAPIUser {
  return {
    id: fastapiUser.id,
    username: fastapiUser.username,
    email: fastapiUser.email,
    isActive: fastapiUser.is_active,
    createdAt: this.transformDateTime(fastapiUser.created_at),
  };
}

// 文档数据转换
static transformDocumentResponse(fastapiDoc: any): FastAPIDocument {
  return {
    id: fastapiDoc.id,
    title: fastapiDoc.title,
    content: fastapiDoc.content,
    documentType: fastapiDoc.document_type,
    wordCount: fastapiDoc.word_count,
    userId: fastapiDoc.user_id,
    createdAt: this.transformDateTime(fastapiDoc.created_at),
    updatedAt: this.transformDateTime(fastapiDoc.updated_at),
  };
}
```

### 5. 认证管理 (`src/lib/fastapi/auth.ts`)

#### 功能特性
- **JWT Token管理**: 自动存储、刷新和过期处理
- **状态同步**: 跨组件的认证状态同步
- **开发环境支持**: dev-login自动认证
- **安全存储**: localStorage与内存状态结合

```typescript
// 认证管理器使用
import { fastAPIAuthManager } from '@/lib/fastapi';

// 登录
await fastAPIAuthManager.login({
  username: 'admin',
  password: 'password'
});

// 开发环境自动登录
await fastAPIAuthManager.devLogin();

// 获取当前用户
const user = fastAPIAuthManager.getCurrentUser();

// 检查认证状态
const isAuth = fastAPIAuthManager.isAuthenticated();
```

## API端点映射表

### 认证端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /api/auth/register` | `fastAPIClient.register()` | 用户注册 |
| `POST /api/auth/login-json` | `fastAPIClient.login()` | 用户登录 |
| `GET /api/auth/me` | `fastAPIClient.getCurrentUser()` | 获取当前用户 |
| `GET /api/auth/verify` | `fastAPIClient.verifyToken()` | 验证Token |
| `POST /api/auth/dev-login` | `fastAPIClient.devLogin()` | 开发环境登录 |

### 文档管理端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `GET /api/documents` | `fastAPIClient.getDocuments()` | 获取文档列表 |
| `GET /api/documents/{id}` | `fastAPIClient.getDocument(id)` | 获取单个文档 |
| `POST /api/documents` | `fastAPIClient.createDocument()` | 创建文档 |
| `PUT /api/documents/{id}` | `fastAPIClient.updateDocument()` | 更新文档 |
| `DELETE /api/documents/{id}` | `fastAPIClient.deleteDocument()` | 删除文档 |
| `POST /api/documents/{id}/duplicate` | `fastAPIClient.duplicateDocument()` | 复制文档 |
| `GET /api/documents/stats/overview` | `fastAPIClient.getDocumentStats()` | 文档统计 |

### 写作功能端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /api/writing/generate` | `fastAPIClient.generateWriting()` | 生成写作内容 |
| `POST /api/writing/improve` | `fastAPIClient.improveWriting()` | 改进写作内容 |
| `POST /api/writing/convert` | `fastAPIClient.convertWritingMode()` | 转换写作模式 |
| `GET /api/writing/suggestions/{mode}` | `fastAPIClient.getWritingSuggestions()` | 获取写作建议 |
| `GET /api/writing/modes` | `fastAPIClient.getWritingModes()` | 获取写作模式 |

### 文献管理端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /api/literature/search` | `fastAPIClient.searchLiterature()` | 搜索文献 |

### 工作流端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /api/workflow/documents` | `fastAPIClient.createWorkflowDocument()` | 创建工作流文档 |
| `GET /api/workflow/documents` | `fastAPIClient.getWorkflowDocuments()` | 获取工作流文档列表 |
| `POST /api/workflow/start` | `fastAPIClient.startWorkflow()` | 启动工作流 |
| `POST /api/workflow/{id}/stop` | `fastAPIClient.stopWorkflow()` | 停止工作流 |
| `GET /api/workflow/{id}/status` | `fastAPIClient.getWorkflowStatus()` | 获取工作流状态 |
| `POST /api/workflow/{id}/rollback/{nodeId}` | `fastAPIClient.rollbackToNode()` | 回滚到节点 |
| `GET /api/workflow/{id}/nodes` | `fastAPIClient.getWorkflowNodes()` | 获取工作流节点 |
| `WS /api/workflow/ws/{id}` | `fastAPIClient.createWorkflowWebSocket()` | 工作流WebSocket |

### 工具端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /api/tools/format/convert` | `fastAPIClient.convertFormat()` | 格式转换 |
| `POST /api/tools/chart/generate` | `fastAPIClient.generateChart()` | 生成图表 |

### 文件操作端点
| FastAPI端点 | 前端方法 | 说明 |
|------------|---------|------|
| `POST /files/upload` | `fastAPIClient.uploadFile()` | 文件上传 |
| `GET /files/{id}/download` | `fastAPIClient.downloadFile()` | 文件下载 |

## tRPC桥接系统

### 智能路由
我们实现了一个智能路由系统，可以在tRPC和FastAPI之间自动选择最佳的调用方式：

```typescript
import { apiRouter } from '@/lib/api/router';

// 自动路由调用
const result = await apiRouter.call('documents.list', {
  page: 1,
  pageSize: 10
});

// 强制使用FastAPI
const result = await apiRouter.call('documents.create', data, {
  strategy: 'rest'
});

// 强制使用tRPC
const result = await apiRouter.call('auth.me', undefined, {
  strategy: 'trpc'
});
```

### 路由策略
- **自动策略**: 基于健康检查和性能指标自动选择
- **强制tRPC**: 实时订阅、复杂查询等
- **强制REST**: 文件操作、导出等
- **回退机制**: 主要策略失败时自动尝试备用策略

## 环境配置

### 环境变量
创建 `.env.local` 文件：

```bash
# FastAPI Backend Configuration
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8002
NEXT_PUBLIC_FASTAPI_WS_URL=ws://localhost:8002

# Development Environment Configuration
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_DEV_LOGIN=true

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_COUNT=3
NEXT_PUBLIC_API_RETRY_DELAY=1000

# Performance Configuration
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_CACHE_DURATION=300000

# Logging and Debug
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=info
```

## 使用指南

### 1. 基础API调用

```typescript
import { fastAPI } from '@/lib/fastapi';

// 使用便捷方法
const documents = await fastAPI.documents.list({
  page: 1,
  pageSize: 10
});

// 获取单个文档
const document = await fastAPI.documents.get('doc-id');

// 创建新文档
const newDoc = await fastAPI.documents.create({
  title: '新文档',
  content: '内容',
  document_type: 'academic'
});
```

### 2. 认证集成

```typescript
import { useFastAPIAuth } from '@/lib/fastapi';

function LoginComponent() {
  const { login, authState, isAuthenticated } = useFastAPIAuth();
  
  const handleLogin = async () => {
    try {
      await login({ username, password });
      // 登录成功
    } catch (error) {
      // 处理错误
    }
  };
  
  if (isAuthenticated()) {
    return <div>已登录: {authState.user?.username}</div>;
  }
  
  return <LoginForm onSubmit={handleLogin} />;
}
```

### 3. 工作流集成

```typescript
import { fastAPI } from '@/lib/fastapi';

// 创建工作流文档
const workflowDoc = await fastAPI.workflow.createDocument('新工作流', {
  readability_threshold: 70,
  max_retries: 3,
  auto_run: true
});

// 启动工作流
const result = await fastAPI.workflow.start({
  document_id: workflowDoc.id,
  prompt: '写一篇关于AI的文章',
  config: {
    writing_mode: 'academic'
  }
});

// 创建WebSocket连接监听进度
const ws = fastAPI.workflow.createWebSocket(workflowDoc.id);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('工作流更新:', update);
};
```

### 4. 文件上传

```typescript
import { fastAPI } from '@/lib/fastapi';

const handleFileUpload = async (file: File) => {
  try {
    const result = await fastAPI.files.upload(file, {
      onProgress: (progress) => {
        setUploadProgress(progress.percentage);
      },
      purpose: 'document_attachment',
      documentId: currentDocumentId
    });
    
    console.log('上传成功:', result);
  } catch (error) {
    console.error('上传失败:', error);
  }
};
```

## 性能优化

### 1. 缓存策略
- **GET请求自动缓存**: 减少重复请求
- **缓存失效机制**: 数据更新时自动清理相关缓存
- **预热缓存**: 应用启动时预加载常用数据

### 2. 请求优化
- **请求去重**: 防止并发的重复请求
- **批量操作**: 支持批量API调用
- **连接池**: 复用HTTP连接

### 3. 错误处理
- **统一错误格式**: 标准化的错误响应处理
- **自动重试**: 指数退避重试机制
- **优雅降级**: 主要服务不可用时的备用方案

## 调试和监控

### 1. 日志系统
```typescript
// 启用详细日志
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=debug

// 查看API调用日志
console.log('API调用:', {
  endpoint: '/api/documents',
  method: 'GET',
  cache: 'hit',
  duration: '120ms'
});
```

### 2. 性能监控
```typescript
// 获取API路由统计
const analytics = apiRouter.getAnalytics();
console.log('路由统计:', {
  totalRequests: analytics.totalRequests,
  averageLatency: analytics.averageLatency,
  errorRate: analytics.errorRate,
  strategies: analytics.strategies
});

// 获取缓存统计
const cacheStats = fastAPIClient.getCacheStats();
console.log('缓存统计:', cacheStats);
```

### 3. 健康检查
```typescript
// 检查FastAPI服务状态
const health = await fastAPI.healthCheck();
console.log('服务健康状态:', health);

// 检查各个组件状态
console.log('数据库状态:', health.components.database);
console.log('AI代理状态:', health.components.agents);
```

## 最佳实践

### 1. 类型安全
- 始终使用TypeScript类型定义
- 利用类型守卫函数验证数据
- 避免使用`any`类型

### 2. 错误处理
- 使用try-catch包装API调用
- 提供用户友好的错误信息
- 记录详细的错误日志

### 3. 性能优化
- 合理使用缓存机制
- 避免不必要的API调用
- 使用分页和过滤减少数据传输

### 4. 安全考虑
- 始终验证用户认证状态
- 敏感操作需要额外权限检查
- 定期刷新认证Token

## 故障排除

### 常见问题

1. **连接失败**
   - 检查FastAPI服务是否运行在正确端口
   - 验证环境变量配置
   - 检查网络连接和防火墙设置

2. **认证失败**
   - 检查用户名密码是否正确
   - 验证Token是否过期
   - 确认开发环境配置

3. **类型错误**
   - 更新类型定义文件
   - 检查数据转换器是否正确
   - 验证API响应格式

4. **性能问题**
   - 检查缓存配置
   - 优化查询参数
   - 减少并发请求数量

### 调试步骤

1. **启用详细日志**
   ```bash
   NEXT_PUBLIC_ENABLE_LOGGING=true
   NEXT_PUBLIC_LOG_LEVEL=debug
   ```

2. **检查服务状态**
   ```typescript
   const health = await fastAPI.healthCheck();
   ```

3. **验证配置**
   ```typescript
   console.log('FastAPI配置:', FASTAPI_CONFIG);
   ```

4. **测试单个端点**
   ```typescript
   const result = await fastAPIClient.getRoot();
   ```

## 未来扩展

### 计划功能
- **GraphQL支持**: 添加GraphQL查询支持
- **离线缓存**: 实现离线数据缓存
- **实时同步**: 多设备数据同步
- **性能分析**: 详细的性能分析工具

### 架构演进
- **微服务支持**: 支持多个FastAPI服务
- **负载均衡**: 智能负载均衡和路由
- **服务发现**: 自动服务发现机制
- **容错机制**: 更完善的容错和恢复机制

---

这个FastAPI集成方案提供了完整的类型安全、高性能的API调用能力，支持智能路由、缓存优化和实时通信，为ChUseA项目的前后端通信提供了坚实的基础。