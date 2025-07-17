/**
 * tRPC使用示例组件
 * 
 * 展示如何在React组件中使用tRPC进行API调用
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * 认证示例
 */
export function AuthExample() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');

  // 获取当前用户信息
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    enabled: !!localStorage.getItem('auth-token'),
  });

  // 登录突变
  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('auth-token', data.token);
      window.location.reload();
    },
    onError: (error) => {
      alert('登录失败: ' + error.message);
    },
  });

  // 登出突变
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem('auth-token');
      window.location.reload();
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password, rememberMe: false });
  };

  const handleLogout = () => {
    logout.mutate();
  };

  if (userLoading) {
    return <div className="p-4">检查登录状态中...</div>;
  }

  if (user) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">已登录用户</h3>
        <div className="mb-4">
          <p><strong>姓名:</strong> {user.user.name}</p>
          <p><strong>邮箱:</strong> {user.user.email}</p>
          <p><strong>角色:</strong> {user.user.role}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {logout.isPending ? '登出中...' : '登出'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">用户登录</h3>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">邮箱:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {login.isPending ? '登录中...' : '登录'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-2">
        演示账号: demo@example.com / demo123
      </p>
    </div>
  );
}

/**
 * 文档管理示例
 */
export function DocumentsExample() {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 获取文档列表
  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery({
    page: 1,
    limit: 5,
    includePublic: true,
  });

  // 创建文档
  const createDocument = trpc.documents.create.useMutation({
    onSuccess: () => {
      setNewTitle('');
      setNewContent('');
      refetch();
    },
    onError: (error) => {
      alert('创建失败: ' + error.message);
    },
  });

  // 删除文档
  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert('删除失败: ' + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createDocument.mutate({
      title: newTitle,
      content: newContent,
      type: 'markdown',
      isPublic: true,
      tags: ['示例'],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个文档吗？')) {
      deleteDocument.mutate({ id });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">文档管理</h3>
      
      {/* 创建文档表单 */}
      <form onSubmit={handleCreate} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">文档标题:</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="输入文档标题"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">文档内容:</label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="输入文档内容"
          />
        </div>
        <button
          type="submit"
          disabled={createDocument.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {createDocument.isPending ? '创建中...' : '创建文档'}
        </button>
      </form>

      {/* 文档列表 */}
      <div>
        <h4 className="font-medium mb-2">文档列表</h4>
        {isLoading ? (
          <div>加载中...</div>
        ) : documents?.documents.length === 0 ? (
          <div className="text-gray-500">暂无文档</div>
        ) : (
          <div className="space-y-2">
            {documents?.documents.map((doc) => (
              <div key={doc.id} className="p-3 border rounded flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-medium">{doc.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{doc.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>类型: {doc.type}</span>
                    <span>浏览: {doc.views}</span>
                    <span>标签: {doc.tags.join(', ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleteDocument.isPending}
                  className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 工作流示例
 */
export function WorkflowExample() {
  // 获取工作流列表
  const { data: workflows, isLoading } = trpc.workflow.list.useQuery({
    page: 1,
    limit: 3,
  });

  // 获取工作流统计
  const { data: stats } = trpc.workflow.stats.useQuery();

  // 执行工作流
  const executeWorkflow = trpc.workflow.execute.useMutation({
    onSuccess: (data) => {
      alert(`工作流 ${data.executionId} 开始执行`);
    },
    onError: (error) => {
      alert('执行失败: ' + error.message);
    },
  });

  const handleExecute = (workflowId: string, workflowName: string) => {
    if (confirm(`确定要执行工作流 "${workflowName}" 吗？`)) {
      executeWorkflow.mutate({
        id: workflowId,
        input: { trigger: 'manual', timestamp: new Date().toISOString() },
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">工作流管理</h3>
      
      {/* 统计信息 */}
      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">统计信息</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>总工作流: {stats.totalWorkflows}</div>
            <div>活跃工作流: {stats.activeWorkflows}</div>
            <div>总执行次数: {stats.totalExecutions}</div>
            <div>成功率: {(stats.successRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}

      {/* 工作流列表 */}
      <div>
        <h4 className="font-medium mb-2">工作流列表</h4>
        {isLoading ? (
          <div>加载中...</div>
        ) : workflows?.workflows.length === 0 ? (
          <div className="text-gray-500">暂无工作流</div>
        ) : (
          <div className="space-y-2">
            {workflows?.workflows.map((workflow) => (
              <div key={workflow.id} className="p-3 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium">{workflow.name}</h5>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.isActive ? '活跃' : '停用'}
                    </span>
                    <button
                      onClick={() => handleExecute(workflow.id, workflow.name)}
                      disabled={!workflow.isActive || executeWorkflow.isPending}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      执行
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>节点: {workflow.nodes.length}</span>
                  <span>执行次数: {workflow.executionCount}</span>
                  <span>成功率: {(workflow.successRate * 100).toFixed(1)}%</span>
                  <span>标签: {workflow.tags.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 综合示例组件
 */
export function TRPCExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">tRPC API 示例</h1>
        <p className="text-gray-600">演示如何使用tRPC进行类型安全的API调用</p>
      </div>
      
      <AuthExample />
      <DocumentsExample />
      <WorkflowExample />
      
      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">提示</h3>
        <ul className="text-sm space-y-1 text-blue-800">
          <li>• 所有API调用都是类型安全的，享受完整的TypeScript支持</li>
          <li>• 使用React Query进行数据缓存和状态管理</li>
          <li>• 错误处理和加载状态自动管理</li>
          <li>• 支持乐观更新和实时数据同步</li>
        </ul>
      </div>
    </div>
  );
}