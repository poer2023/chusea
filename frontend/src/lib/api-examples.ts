/**
 * API客户端和认证系统使用示例
 * 展示如何使用新的API客户端和认证系统
 */

import { apiClient } from './api-client';
import { authManager, useAuth, createRouteGuard } from './auth';
import {
  DocumentType,
  WritingMode,
  WritingAction,
  ChartType,
  LiteratureSource,
} from './types/api';

// ===== 认证示例 =====

/**
 * 用户登录示例
 */
export async function loginExample() {
  try {
    const response = await authManager.login({
      username: 'user@example.com',
      password: 'password123',
    });
    
    console.log('登录成功:', response.user);
    console.log('Token:', response.accessToken);
  } catch (error) {
    console.error('登录失败:', error);
  }
}

/**
 * 用户注册示例
 */
export async function registerExample() {
  try {
    const user = await authManager.register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
    });
    
    console.log('注册成功:', user);
    // 注册后会自动登录
  } catch (error) {
    console.error('注册失败:', error);
  }
}

/**
 * 检查认证状态示例
 */
export function checkAuthExample() {
  const isAuthenticated = authManager.isAuthenticated();
  const currentUser = authManager.getCurrentUser();
  const token = authManager.getToken();
  
  console.log('认证状态:', isAuthenticated);
  console.log('当前用户:', currentUser);
  console.log('Token存在:', !!token);
}

// ===== 文档管理示例 =====

/**
 * 创建文档示例
 */
export async function createDocumentExample() {
  try {
    const document = await apiClient.createDocument({
      title: '我的新文档',
      content: '这是文档的初始内容',
      type: DocumentType.ACADEMIC,
      tags: ['学术', '研究'],
    });
    
    console.log('文档创建成功:', document);
    return document;
  } catch (error) {
    console.error('创建文档失败:', error);
  }
}

/**
 * 获取文档列表示例
 */
export async function getDocumentsExample() {
  try {
    const response = await apiClient.getDocuments({
      page: 1,
      pageSize: 10,
      type: DocumentType.ACADEMIC,
      search: '研究',
    });
    
    console.log('文档列表:', response.items);
    console.log('总数:', response.total);
    console.log('分页信息:', {
      page: response.page,
      totalPages: response.totalPages,
      hasNext: response.hasNext,
    });
  } catch (error) {
    console.error('获取文档列表失败:', error);
  }
}

/**
 * 更新文档示例
 */
export async function updateDocumentExample(documentId: string) {
  try {
    const updatedDocument = await apiClient.updateDocument(documentId, {
      title: '更新后的标题',
      content: '更新后的内容',
      tags: ['更新', '修改'],
    });
    
    console.log('文档更新成功:', updatedDocument);
  } catch (error) {
    console.error('更新文档失败:', error);
  }
}

// ===== 写作功能示例 =====

/**
 * 生成写作内容示例
 */
export async function generateWritingExample() {
  try {
    const response = await apiClient.generateWriting({
      prompt: '请写一篇关于人工智能的学术论文摘要',
      mode: WritingMode.ACADEMIC,
      action: WritingAction.GENERATE,
      context: {
        targetLength: 300,
        tone: 'formal',
        audience: 'academic',
      },
      options: {
        temperature: 0.7,
        maxTokens: 500,
        includeReferences: true,
      },
    });
    
    console.log('生成的内容:', response.content);
    console.log('使用的tokens:', response.metadata.tokensUsed);
    console.log('建议:', response.suggestions);
  } catch (error) {
    console.error('生成写作内容失败:', error);
  }
}

/**
 * 改进写作内容示例
 */
export async function improveWritingExample() {
  try {
    const response = await apiClient.improveWriting({
      prompt: '请改进这段文字的表达和语法',
      mode: WritingMode.ACADEMIC,
      action: WritingAction.IMPROVE,
      context: {
        content: '这是需要改进的原始文本',
      },
    });
    
    console.log('改进后的内容:', response.content);
  } catch (error) {
    console.error('改进写作内容失败:', error);
  }
}

/**
 * 获取写作建议示例
 */
export async function getWritingSuggestionsExample() {
  try {
    const suggestions = await apiClient.getWritingSuggestions(
      '这是需要建议的文本',
      WritingMode.ACADEMIC
    );
    
    console.log('写作建议:', suggestions);
  } catch (error) {
    console.error('获取写作建议失败:', error);
  }
}

// ===== 文献管理示例 =====

/**
 * 搜索文献示例
 */
export async function searchLiteratureExample() {
  try {
    const response = await apiClient.searchLiterature({
      query: 'machine learning',
      sources: [LiteratureSource.GOOGLE_SCHOLAR, LiteratureSource.ARXIV],
      maxResults: 20,
      yearRange: [2020, 2024],
      includeAbstract: true,
      filters: {
        keywords: ['artificial intelligence', 'deep learning'],
      },
    });
    
    console.log('搜索结果:', response.results);
    console.log('搜索元数据:', response.metadata);
  } catch (error) {
    console.error('搜索文献失败:', error);
  }
}

/**
 * 保存文献示例
 */
export async function saveLiteratureExample() {
  try {
    const literature = await apiClient.saveLiterature({
      title: 'Deep Learning: A Comprehensive Survey',
      authors: ['John Doe', 'Jane Smith'],
      year: 2023,
      source: LiteratureSource.MANUAL,
      doi: '10.1000/182',
      abstract: '这是一篇关于深度学习的综述论文...',
      url: 'https://example.com/paper.pdf',
      tags: ['深度学习', '综述'],
      metadata: {
        journal: 'AI Review',
        volume: '12',
        issue: '3',
        pages: '1-25',
        citationCount: 150,
      },
    });
    
    console.log('文献保存成功:', literature);
  } catch (error) {
    console.error('保存文献失败:', error);
  }
}

/**
 * 生成引用示例
 */
export async function generateCitationExample() {
  try {
    const response = await apiClient.generateCitation({
      literatureIds: ['lit1', 'lit2', 'lit3'],
      style: 'apa',
      format: 'text',
    });
    
    console.log('生成的引用:', response.citations);
    console.log('参考文献列表:', response.bibliography);
  } catch (error) {
    console.error('生成引用失败:', error);
  }
}

// ===== 工具功能示例 =====

/**
 * 格式转换示例
 */
export async function formatConversionExample() {
  try {
    const response = await apiClient.convertFormat({
      content: '# 标题\n\n这是一个**粗体**文本。',
      fromFormat: 'markdown',
      toFormat: 'html',
      options: {
        preserveFormatting: true,
        includeMetadata: true,
      },
    });
    
    console.log('转换结果:', response.result);
    console.log('转换元数据:', response.metadata);
  } catch (error) {
    console.error('格式转换失败:', error);
  }
}

/**
 * 生成图表示例
 */
export async function generateChartExample() {
  try {
    const response = await apiClient.generateChart({
      data: [
        { month: 'Jan', sales: 1000 },
        { month: 'Feb', sales: 1200 },
        { month: 'Mar', sales: 900 },
        { month: 'Apr', sales: 1500 },
      ],
      chartType: ChartType.BAR,
      config: {
        title: '月度销售数据',
        description: '2024年前4个月的销售情况',
        xAxis: 'month',
        yAxis: 'sales',
        colorScheme: 'blue',
        width: 800,
        height: 400,
      },
      options: {
        interactive: true,
        exportFormat: 'svg',
        theme: 'light',
      },
    });
    
    console.log('图表数据:', response.chartData);
    console.log('图表配置:', response.chartConfig);
  } catch (error) {
    console.error('生成图表失败:', error);
  }
}

/**
 * 数据分析示例
 */
export async function analyzeDataExample() {
  try {
    const response = await apiClient.analyzeData({
      data: [
        { age: 25, income: 50000, satisfaction: 8 },
        { age: 30, income: 60000, satisfaction: 7 },
        { age: 35, income: 70000, satisfaction: 9 },
      ],
      analysisType: 'correlation',
      options: {
        columns: ['age', 'income', 'satisfaction'],
      },
    });
    
    console.log('分析结果:', response.results);
    console.log('分析总结:', response.summary);
    console.log('建议:', response.recommendations);
  } catch (error) {
    console.error('数据分析失败:', error);
  }
}

// ===== 工作流示例 =====

/**
 * 启动工作流示例
 */
export async function startWorkflowExample(documentId: string) {
  try {
    const response = await apiClient.startWorkflow({
      documentId,
      prompt: '请对这个文档进行完整的写作优化流程',
      config: {
        readabilityThreshold: 80,
        maxRetries: 3,
        autoRun: true,
        writingMode: WritingMode.ACADEMIC,
        enabledSteps: ['plan', 'draft', 'grammar', 'readability'],
      },
    });
    
    console.log('工作流启动结果:', response);
  } catch (error) {
    console.error('启动工作流失败:', error);
  }
}

/**
 * 获取工作流状态示例
 */
export async function getWorkflowStatusExample(documentId: string) {
  try {
    const status = await apiClient.getWorkflowStatus(documentId);
    
    console.log('工作流状态:', status.status);
    console.log('进度:', `${status.progress}%`);
    console.log('当前节点:', status.currentNode);
    console.log('所有节点:', status.nodes);
  } catch (error) {
    console.error('获取工作流状态失败:', error);
  }
}

// ===== 文件上传示例 =====

/**
 * 文件上传示例
 */
export async function uploadFileExample(file: File) {
  try {
    const response = await apiClient.uploadFile(file, {
      purpose: 'document_attachment',
      documentId: 'doc123',
      onProgress: (progress) => {
        console.log(`上传进度: ${progress.percentage}%`);
        console.log(`速度: ${progress.speed} bytes/s`);
        console.log(`预计剩余时间: ${progress.estimatedTimeRemaining}s`);
      },
    });
    
    console.log('文件上传成功:', response);
    console.log('文件URL:', response.url);
  } catch (error) {
    console.error('文件上传失败:', error);
  }
}

// ===== React组件使用示例 =====

/**
 * React组件中使用认证的示例
 */
export function AuthExampleComponent() {
  const auth = useAuth();

  const handleLogin = async () => {
    try {
      await auth.login({
        username: 'user@example.com',
        password: 'password',
      });
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  if (auth.isLoading) {
    return '<div>加载中...</div>';
  }

  if (!auth.isAuthenticated) {
    return `
      <div>
        <h2>请登录</h2>
        <button onclick="handleLogin()">登录</button>
      </div>
    `;
  }

  return `
    <div>
      <h2>欢迎, ${auth.user?.username}</h2>
      <button onclick="handleLogout()">登出</button>
    </div>
  `;
}

// ===== 路由保护示例 =====

/**
 * 路由保护示例
 */
export const protectedRouteGuard = createRouteGuard({
  requireAuth: true,
  requiredPermissions: ['read_documents'],
  redirectTo: '/auth/login',
});

/**
 * 管理员路由保护示例
 */
export const adminRouteGuard = createRouteGuard({
  requireAuth: true,
  requiredRoles: ['admin'],
  redirectTo: '/unauthorized',
});

// ===== WebSocket示例 =====

/**
 * WebSocket连接示例
 */
export function setupWorkflowWebSocket(documentId: string) {
  const ws = apiClient.createWorkflowWebSocket(documentId);

  ws.onopen = () => {
    console.log('WebSocket连接已建立');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('收到消息:', message);
    
    if (message.type === 'workflow_update') {
      console.log('工作流更新:', message.data);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket连接已关闭');
  };

  ws.onerror = (error) => {
    console.error('WebSocket错误:', error);
  };

  return ws;
}

// ===== 错误处理示例 =====

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  try {
    const document = await apiClient.getDocument('invalid-id');
  } catch (error) {
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      
      // 检查是否是API客户端错误
      if ('code' in error) {
        const apiError = error as any;
        console.error('错误代码:', apiError.code);
        console.error('HTTP状态:', apiError.status);
        console.error('错误详情:', apiError.details);
        
        // 根据错误类型处理
        switch (apiError.code) {
          case 'UNAUTHORIZED':
            console.log('用户未认证，跳转到登录页');
            break;
          case 'FORBIDDEN':
            console.log('权限不足');
            break;
          case 'NOT_FOUND':
            console.log('资源不存在');
            break;
          default:
            console.log('其他错误');
        }
      }
    }
  }
}

// ===== 缓存管理示例 =====

/**
 * 缓存管理示例
 */
export function cacheManagementExample() {
  // 清除所有缓存
  apiClient.clearCache();
  
  // 清除特定模式的缓存
  apiClient.clearCacheByPattern('/documents');
  
  // 预热缓存
  apiClient.warmupCache();
}

// ===== 认证事件监听示例 =====

/**
 * 认证事件监听示例
 */
export function setupAuthEventListeners() {
  const removeListener = authManager.addEventListener((event, data) => {
    switch (event) {
      case 'login':
        console.log('用户登录:', data);
        break;
      case 'logout':
        console.log('用户登出');
        // 清理应用状态
        break;
      case 'token_refresh':
        console.log('Token已刷新');
        break;
      case 'token_expired':
        console.log('Token已过期');
        // 显示重新登录提示
        break;
    }
  });

  // 在组件卸载时移除监听器
  return removeListener;
}