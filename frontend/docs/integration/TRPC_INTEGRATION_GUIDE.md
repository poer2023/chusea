# tRPC v11 集成指南

tRPC v11类型安全API通信层已成功集成到ChUseA项目中，提供端到端类型安全的API通信。

## 📋 配置概览

### ✅ 已完成的配置

1. **tRPC服务器配置**
   - ✅ 核心tRPC配置 (`src/server/trpc.ts`)
   - ✅ 上下文配置 (`src/server/context.ts`)
   - ✅ 根路由器 (`src/server/api/root.ts`)

2. **API路由器实现**
   - ✅ 认证路由器 (`src/server/api/routers/auth.ts`)
   - ✅ 文档管理路由器 (`src/server/api/routers/documents.ts`)
   - ✅ 工作流路由器 (`src/server/api/routers/workflow.ts`)
   - ✅ 用户管理路由器 (`src/server/api/routers/user.ts`)

3. **Next.js 15 App Router集成**
   - ✅ tRPC适配器 (`src/app/api/trpc/[trpc]/route.ts`)
   - ✅ 支持GET和POST请求
   - ✅ 错误处理和开发调试

4. **客户端配置**
   - ✅ tRPC客户端 (`src/lib/trpc/client.ts`)
   - ✅ 服务器端客户端 (`src/lib/trpc/server.ts`)
   - ✅ React Provider (`src/lib/trpc/provider.tsx`)
   - ✅ 类型定义 (`src/lib/trpc/types.ts`)

5. **集成现有系统**
   - ✅ 与TanStack Query v5集成
   - ✅ 与现有Provider体系集成
   - ✅ 类型安全的API调用

## 🚀 使用指南

### 1. 基础设置

确保在你的应用根组件中使用 `TRPCProvider`：

```tsx
// src/app/layout.tsx
import { ServerAppProviders } from '@/lib/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ServerAppProviders enableDevtools={process.env.NODE_ENV === 'development'}>
          {children}
        </ServerAppProviders>
      </body>
    </html>
  );
}
```

### 2. 客户端组件中使用tRPC

```tsx
// src/components/example-component.tsx
'use client';

import { trpc } from '@/lib/trpc';

export function ExampleComponent() {
  // 查询数据
  const { data: documents, isLoading, error } = trpc.documents.list.useQuery({
    page: 1,
    limit: 10,
  });

  // 变更数据
  const createDocument = trpc.documents.create.useMutation({
    onSuccess: (data) => {
      console.log('文档创建成功:', data);
    },
    onError: (error) => {
      console.error('创建失败:', error);
    },
  });

  const handleCreate = () => {
    createDocument.mutate({
      title: '新文档',
      content: '文档内容',
      type: 'markdown',
    });
  };

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h1>文档列表</h1>
      {documents?.documents.map((doc) => (
        <div key={doc.id}>{doc.title}</div>
      ))}
      <button onClick={handleCreate}>
        创建文档
      </button>
    </div>
  );
}
```

### 3. 服务器组件中使用tRPC

```tsx
// src/app/dashboard/page.tsx
import { serverClient } from '@/lib/trpc/server';

export default async function DashboardPage() {
  try {
    // 服务器端数据获取
    const documents = await serverClient.documents.list({
      page: 1,
      limit: 5,
    });

    const stats = await serverClient.documents.stats();

    return (
      <div>
        <h1>仪表板</h1>
        <p>总文档数: {stats.totalDocuments}</p>
        <div>
          {documents.documents.map((doc) => (
            <div key={doc.id}>{doc.title}</div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return <div>加载失败</div>;
  }
}
```

### 4. 认证相关使用

```tsx
// src/components/auth/login-form.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // 保存token
      localStorage.setItem('auth-token', data.token);
      // 刷新页面或导航到仪表板
      window.location.reload();
    },
    onError: (error) => {
      alert('登录失败: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password, rememberMe: false });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
        required
      />
      <button type="submit" disabled={login.isLoading}>
        {login.isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### 5. 工作流管理

```tsx
// src/components/workflow/workflow-list.tsx
'use client';

import { trpc } from '@/lib/trpc';

export function WorkflowList() {
  const { data: workflows, refetch } = trpc.workflow.list.useQuery({
    page: 1,
    limit: 10,
  });

  const executeWorkflow = trpc.workflow.execute.useMutation({
    onSuccess: () => {
      refetch(); // 重新获取列表
    },
  });

  const handleExecute = (workflowId: string) => {
    executeWorkflow.mutate({
      id: workflowId,
      input: { key: 'value' },
    });
  };

  return (
    <div>
      <h2>工作流列表</h2>
      {workflows?.workflows.map((workflow) => (
        <div key={workflow.id}>
          <h3>{workflow.name}</h3>
          <p>{workflow.description}</p>
          <button
            onClick={() => handleExecute(workflow.id)}
            disabled={!workflow.isActive}
          >
            执行工作流
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 高级用法

### 1. 错误处理

```tsx
import { isTRPCError, getTRPCErrorMessage, isAuthError } from '@/lib/trpc';

const myMutation = trpc.documents.create.useMutation({
  onError: (error) => {
    if (isAuthError(error)) {
      // 处理认证错误
      window.location.href = '/login';
    } else if (isTRPCError(error)) {
      // 处理tRPC特定错误
      alert(`错误: ${error.message}`);
    } else {
      // 处理其他错误
      alert('发生了未知错误');
    }
  },
});
```

### 2. 条件查询

```tsx
const { data: userProfile } = trpc.user.profile.useQuery(undefined, {
  enabled: !!userId, // 只有在有用户ID时才执行查询
  staleTime: 5 * 60 * 1000, // 5分钟缓存
  onError: (error) => {
    console.error('获取用户资料失败:', error);
  },
});
```

### 3. 乐观更新

```tsx
const utils = trpc.useUtils();

const updateDocument = trpc.documents.update.useMutation({
  onMutate: async (newData) => {
    // 取消相关查询
    await utils.documents.get.cancel({ id: newData.id });

    // 获取之前的数据
    const previousDocument = utils.documents.get.getData({ id: newData.id });

    // 乐观更新
    utils.documents.get.setData({ id: newData.id }, (old) => ({
      ...old!,
      ...newData,
    }));

    return { previousDocument };
  },
  onError: (err, newData, context) => {
    // 出错时回滚
    if (context?.previousDocument) {
      utils.documents.get.setData(
        { id: newData.id },
        context.previousDocument
      );
    }
  },
  onSettled: () => {
    // 无论成功失败都重新获取数据
    utils.documents.get.invalidate();
  },
});
```

## 📡 API路由概览

### 认证 (auth)
- `login` - 用户登录
- `register` - 用户注册
- `logout` - 用户登出
- `me` - 获取当前用户信息
- `changePassword` - 修改密码
- `resetPassword` - 重置密码
- `refreshToken` - 刷新token
- `verifyEmail` - 验证邮箱

### 文档 (documents)
- `list` - 获取文档列表
- `get` - 获取单个文档
- `create` - 创建文档
- `update` - 更新文档
- `delete` - 删除文档
- `folders` - 获取文件夹列表
- `createFolder` - 创建文件夹
- `share` - 分享文档
- `stats` - 获取文档统计

### 工作流 (workflow)
- `list` - 获取工作流列表
- `get` - 获取单个工作流
- `create` - 创建工作流
- `update` - 更新工作流
- `delete` - 删除工作流
- `execute` - 执行工作流
- `executions` - 获取执行记录
- `stats` - 获取工作流统计
- `stopExecution` - 停止执行

### 用户 (user)
- `profile` - 获取用户资料
- `updateProfile` - 更新用户资料
- `updatePreferences` - 更新偏好设置
- `uploadAvatar` - 上传头像
- `stats` - 获取用户统计
- `search` - 搜索用户（管理员）
- `updateRole` - 更新用户角色（管理员）
- `toggleStatus` - 切换用户状态（管理员）
- `deleteAccount` - 删除账户

## 🔒 认证和权限

系统支持三种访问级别：
- `publicProcedure` - 公开访问
- `protectedProcedure` - 需要登录
- `adminProcedure` - 需要管理员权限

认证通过Authorization header中的Bearer token实现：
```typescript
// 客户端自动处理
const token = localStorage.getItem('auth-token');
// tRPC客户端会自动在请求头中添加: Authorization: Bearer <token>
```

## 🚦 开发和调试

1. **开发工具**: React Query DevTools已集成，在开发环境下自动启用
2. **错误日志**: 开发环境下tRPC会在控制台输出详细错误信息
3. **类型安全**: 所有API调用都有完整的TypeScript类型支持

## 📦 包含的依赖

- `@trpc/client@^11.4.3` - tRPC客户端
- `@trpc/server@^11.4.3` - tRPC服务器
- `@trpc/next@^11.4.3` - Next.js集成
- `@trpc/react-query@^11.4.3` - React Query集成
- `superjson@^2.2.2` - 数据序列化
- `zod@^3.25.76` - 输入验证

## 🔄 下一步

1. **实际数据库集成**: 当前使用模拟数据，需要集成实际的数据库
2. **认证系统**: 集成JWT或其他认证解决方案
3. **文件上传**: 实现真实的文件上传功能
4. **实时功能**: 考虑添加WebSocket支持用于实时通信
5. **缓存策略**: 优化查询缓存策略
6. **性能监控**: 添加API性能监控

## 🐛 故障排除

### 常见问题

1. **类型错误**: 确保所有tRPC相关的导入都来自正确的路径
2. **Provider错误**: 确保TRPCProvider在组件树的正确位置
3. **认证问题**: 检查localStorage中的token是否存在且有效
4. **网络错误**: 检查API端点配置和网络连接

### 调试技巧

1. 使用React Query DevTools查看查询状态
2. 检查浏览器网络面板中的API请求
3. 查看控制台中的tRPC错误日志
4. 使用TypeScript类型检查确保API调用正确

tRPC v11集成已完成，提供了完整的类型安全API通信层，支持所有主要功能模块的前后端通信。