# API客户端和认证系统

这是一个完整的API客户端和认证系统，为前端应用提供与后端API的交互功能。

## 文件结构

```
src/lib/
├── api-client.ts       # 主要的API客户端类
├── auth.ts            # 认证管理和工具函数
├── types/
│   └── api.ts         # API相关的TypeScript类型定义
├── api-examples.ts    # 使用示例代码
└── README.md          # 本文档
```

## 主要特性

### API客户端 (`api-client.ts`)

- **完整的API覆盖**: 支持所有后端API端点
- **自动认证**: 自动添加Bearer token到请求头
- **错误处理**: 统一的错误处理和类型化错误
- **请求重试**: 自动重试失败的请求
- **缓存支持**: 内存缓存提升性能
- **请求去重**: 避免重复的GET请求
- **文件上传**: 支持进度回调的文件上传
- **WebSocket**: 支持WebSocket连接
- **TypeScript**: 完整的类型安全

### 认证系统 (`auth.ts`)

- **Token管理**: 自动处理访问令牌和刷新令牌
- **自动刷新**: 在token过期前自动刷新
- **持久化**: 安全的本地存储管理
- **事件系统**: 认证状态变化事件
- **路由保护**: 基于权限的路由保护
- **React钩子**: 便于在React组件中使用

### 类型定义 (`types/api.ts`)

- **完整的类型覆盖**: 所有API请求和响应的类型定义
- **枚举类型**: 文档类型、写作模式等枚举
- **类型守卫**: 运行时类型检查函数
- **泛型支持**: 灵活的泛型类型定义

## 快速开始

### 1. 配置API客户端

```typescript
import { apiClient } from './lib/api-client';

// 默认配置指向 http://localhost:8002/api
// 可以通过环境变量 NEXT_PUBLIC_API_URL 覆盖
```

### 2. 设置认证

```typescript
import { authManager } from './lib/auth';

// 用户登录
await authManager.login({
  username: 'user@example.com',
  password: 'password123'
});

// 检查认证状态
if (authManager.isAuthenticated()) {
  const user = authManager.getCurrentUser();
  console.log('当前用户:', user);
}
```

### 3. 使用API客户端

```typescript
import { apiClient } from './lib/api-client';
import { DocumentType } from './lib/types/api';

// 创建文档
const document = await apiClient.createDocument({
  title: '我的新文档',
  content: '文档内容',
  type: DocumentType.ACADEMIC
});

// 获取文档列表
const documents = await apiClient.getDocuments({
  page: 1,
  pageSize: 10,
  type: DocumentType.ACADEMIC
});
```

## API端点覆盖

### 认证相关
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/me` - 获取当前用户信息
- `POST /auth/verify` - 验证token
- `POST /auth/refresh` - 刷新token
- `POST /auth/logout` - 用户登出

### 文档管理
- `GET /documents` - 获取文档列表
- `GET /documents/:id` - 获取单个文档
- `POST /documents` - 创建文档
- `PUT /documents/:id` - 更新文档
- `DELETE /documents/:id` - 删除文档
- `POST /documents/:id/duplicate` - 复制文档
- `GET /documents/stats` - 获取文档统计

### 写作功能
- `POST /writing/generate` - 生成写作内容
- `POST /writing/improve` - 改进写作内容
- `POST /writing/convert` - 转换写作模式
- `POST /writing/suggestions` - 获取写作建议
- `GET /writing/modes` - 获取写作模式信息

### 文献管理
- `POST /literature/search` - 搜索文献
- `GET /literature` - 获取保存的文献
- `POST /literature` - 保存文献
- `PUT /literature/:id` - 更新文献
- `DELETE /literature/:id` - 删除文献
- `POST /literature/citation` - 生成引用

### 工具功能
- `POST /tools/format/convert` - 格式转换
- `POST /tools/chart/generate` - 生成图表
- `POST /tools/data/analyze` - 数据分析

### 工作流
- `POST /workflow/start` - 启动工作流
- `POST /workflow/:id/stop` - 停止工作流
- `GET /workflow/:id/status` - 获取工作流状态
- `POST /workflow/:id/pause` - 暂停工作流
- `POST /workflow/:id/resume` - 恢复工作流
- `POST /workflow/:id/rollback/:nodeId` - 回滚工作流

### 文件管理
- `POST /files/upload` - 上传文件
- `GET /files/:id` - 获取文件信息
- `DELETE /files/:id` - 删除文件

## 在React中使用

### 认证钩子

```typescript
import { useAuth } from './lib/auth';

function LoginComponent() {
  const auth = useAuth();

  const handleLogin = async () => {
    try {
      await auth.login({
        username: 'user@example.com',
        password: 'password'
      });
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  if (auth.isLoading) {
    return <div>加载中...</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <button onClick={handleLogin}>登录</button>
      </div>
    );
  }

  return (
    <div>
      <h2>欢迎, {auth.user?.username}</h2>
      <button onClick={() => auth.logout()}>登出</button>
    </div>
  );
}
```

### 路由保护

```typescript
import { createRouteGuard } from './lib/auth';

// 创建需要认证的路由守卫
const authGuard = createRouteGuard({
  requireAuth: true,
  redirectTo: '/auth/login'
});

// 创建管理员路由守卫
const adminGuard = createRouteGuard({
  requireAuth: true,
  requiredRoles: ['admin'],
  redirectTo: '/unauthorized'
});

// 使用路由守卫
async function checkRouteAccess() {
  const canAccess = await authGuard.canActivate();
  if (!canAccess) {
    window.location.href = authGuard.getRedirectUrl();
  }
}
```

## 错误处理

```typescript
import { ApiClientError } from './lib/api-client';

try {
  const document = await apiClient.getDocument('invalid-id');
} catch (error) {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        // 处理未认证错误
        break;
      case 'FORBIDDEN':
        // 处理权限不足错误
        break;
      case 'NOT_FOUND':
        // 处理资源不存在错误
        break;
      default:
        // 处理其他错误
        break;
    }
  }
}
```

## 缓存管理

```typescript
import { apiClient } from './lib/api-client';

// 清除所有缓存
apiClient.clearCache();

// 清除特定模式的缓存
apiClient.clearCacheByPattern('/documents');

// 预热缓存
await apiClient.warmupCache();
```

## WebSocket支持

```typescript
import { apiClient } from './lib/api-client';

// 创建工作流WebSocket连接
const ws = apiClient.createWorkflowWebSocket('document-id');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'workflow_update') {
    console.log('工作流更新:', message.data);
  }
};
```

## 文件上传

```typescript
import { apiClient } from './lib/api-client';

const handleFileUpload = async (file: File) => {
  try {
    const response = await apiClient.uploadFile(file, {
      purpose: 'document_attachment',
      documentId: 'doc-123',
      onProgress: (progress) => {
        console.log(`上传进度: ${progress.percentage}%`);
      }
    });
    
    console.log('文件上传成功:', response.url);
  } catch (error) {
    console.error('文件上传失败:', error);
  }
};
```

## 配置选项

### API客户端配置

```typescript
import { ApiClient } from './lib/api-client';

const customApiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 60000,
  retries: 5,
  retryDelay: 2000,
  enableCache: true,
  cacheDuration: 10 * 60 * 1000, // 10分钟
});
```

### 认证配置

认证系统会自动从localStorage恢复认证状态，并在token过期前自动刷新。

## 类型安全

所有API请求和响应都有完整的TypeScript类型定义：

```typescript
import { Document, CreateDocumentRequest, DocumentType } from './lib/types/api';

const createDoc = async (): Promise<Document> => {
  const request: CreateDocumentRequest = {
    title: '新文档',
    content: '内容',
    type: DocumentType.ACADEMIC
  };
  
  return await apiClient.createDocument(request);
};
```

## 最佳实践

1. **错误处理**: 始终使用try-catch包装API调用
2. **类型安全**: 使用TypeScript类型确保类型安全
3. **认证检查**: 在调用需要认证的API前检查认证状态
4. **缓存管理**: 适当使用缓存提升性能
5. **事件监听**: 监听认证状态变化事件
6. **资源清理**: 在组件卸载时清理事件监听器

## 故障排除

### 常见问题

1. **认证失败**: 检查token是否有效，是否需要刷新
2. **网络错误**: 检查网络连接和API服务器状态
3. **权限错误**: 确认用户有足够的权限访问资源
4. **类型错误**: 确保请求数据符合API类型定义

### 调试技巧

1. 启用控制台日志查看请求详情
2. 使用浏览器开发者工具检查网络请求
3. 检查localStorage中的认证信息
4. 使用类型守卫函数验证数据格式

## 更多示例

详细的使用示例请参考 `api-examples.ts` 文件，包含了所有功能的完整示例代码。