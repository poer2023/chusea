/**
 * tRPC上下文配置
 * 
 * 这个文件定义了tRPC请求的上下文结构，包括：
 * - 用户会话信息
 * - 请求头信息
 * - 数据库连接（如果需要）
 * - 其他共享资源
 */

import { type NextRequest } from 'next/server';
// 暂时注释掉有问题的导入
// import { headers } from 'next/headers';

/**
 * 用户会话类型定义
 */
export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  };
  expires: string;
}

/**
 * tRPC上下文类型
 */
export interface Context {
  session: Session | null;
  headers: Record<string, string>;
  userAgent?: string;
  ip?: string;
}

/**
 * 创建tRPC上下文
 * 这个函数在每个tRPC请求时被调用
 */
export async function createTRPCContext(opts: {
  req: NextRequest;
}): Promise<Context> {
  const { req } = opts;
  
  // 获取请求头
  // 暂时禁用headers获取
  // const headersList = headers();
  const requestHeaders: Record<string, string> = {};
  
  // headersList.forEach((value, key) => {
  //   requestHeaders[key] = value;
  // });

  // 模拟获取用户会话
  // TODO: 在实际项目中，这里应该从认证系统获取用户信息
  const session = await getSession(req);
  
  return {
    session,
    headers: requestHeaders,
    userAgent: headersList.get('user-agent') || undefined,
    ip: getClientIP(req),
  };
}

/**
 * 获取用户会话信息
 * TODO: 集成实际的认证系统
 */
async function getSession(req: NextRequest): Promise<Session | null> {
  // 从Authorization header或cookie中获取token
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  try {
    // TODO: 验证token并获取用户信息
    // 这里应该调用认证服务或验证JWT
    
    // 模拟用户会话（开发阶段）
    if (token === 'dev-token') {
      return {
        user: {
          id: 'dev-user-1',
          email: 'dev@example.com',
          name: 'Developer User',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * 获取客户端IP地址
 */
function getClientIP(req: NextRequest): string | undefined {
  // 尝试从各种header中获取真实IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // 从NextRequest中获取IP（如果可用）
  return req.ip || undefined;
}

/**
 * 类型导出
 */
export type CreateTRPCContext = typeof createTRPCContext;