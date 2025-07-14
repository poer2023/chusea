/**
 * tRPC工具类型和辅助函数
 * 
 * 提供类型安全的工具函数和类型守护
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

// 推断输入和输出类型
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// 认证相关类型
export type LoginInput = RouterInputs['auth']['login'];
export type LoginOutput = RouterOutputs['auth']['login'];
export type RegisterInput = RouterInputs['auth']['register'];
export type RegisterOutput = RouterOutputs['auth']['register'];
export type MeOutput = RouterOutputs['auth']['me'];

// 文档相关类型
export type DocumentListInput = RouterInputs['documents']['list'];
export type DocumentListOutput = RouterOutputs['documents']['list'];
export type DocumentGetInput = RouterInputs['documents']['get'];
export type DocumentGetOutput = RouterOutputs['documents']['get'];
export type DocumentCreateInput = RouterInputs['documents']['create'];
export type DocumentCreateOutput = RouterOutputs['documents']['create'];
export type DocumentUpdateInput = RouterInputs['documents']['update'];
export type DocumentUpdateOutput = RouterOutputs['documents']['update'];
export type DocumentStatsOutput = RouterOutputs['documents']['stats'];

// 工作流相关类型
export type WorkflowListInput = RouterInputs['workflow']['list'];
export type WorkflowListOutput = RouterOutputs['workflow']['list'];
export type WorkflowGetInput = RouterInputs['workflow']['get'];
export type WorkflowGetOutput = RouterOutputs['workflow']['get'];
export type WorkflowCreateInput = RouterInputs['workflow']['create'];
export type WorkflowCreateOutput = RouterOutputs['workflow']['create'];
export type WorkflowUpdateInput = RouterInputs['workflow']['update'];
export type WorkflowUpdateOutput = RouterOutputs['workflow']['update'];
export type WorkflowExecuteInput = RouterInputs['workflow']['execute'];
export type WorkflowExecuteOutput = RouterOutputs['workflow']['execute'];
export type WorkflowExecutionsInput = RouterInputs['workflow']['executions'];
export type WorkflowExecutionsOutput = RouterOutputs['workflow']['executions'];
export type WorkflowStatsOutput = RouterOutputs['workflow']['stats'];

// 用户相关类型
export type UserProfileOutput = RouterOutputs['user']['profile'];
export type UserUpdateProfileInput = RouterInputs['user']['updateProfile'];
export type UserUpdateProfileOutput = RouterOutputs['user']['updateProfile'];
export type UserUpdatePreferencesInput = RouterInputs['user']['updatePreferences'];
export type UserUpdatePreferencesOutput = RouterOutputs['user']['updatePreferences'];
export type UserStatsOutput = RouterOutputs['user']['stats'];
export type UserSearchInput = RouterInputs['user']['search'];
export type UserSearchOutput = RouterOutputs['user']['search'];

// 错误类型
export interface TRPCError {
  code: string;
  message: string;
  data?: {
    code?: string;
    httpStatus?: number;
    path?: string;
    zodError?: any;
  };
}

// 查询选项类型
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: any) => number);
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: (data: any, error: any) => void;
  select?: (data: any) => any;
  suspense?: boolean;
  useErrorBoundary?: boolean | ((error: any) => boolean);
}

// 变更选项类型
export interface MutationOptions {
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  onSettled?: (data: any, error: any, variables: any, context: any) => void;
  onMutate?: (variables: any) => Promise<any> | any;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: any) => number);
  useErrorBoundary?: boolean | ((error: any) => boolean);
}

// API状态类型
export type APIStatus = 'idle' | 'loading' | 'success' | 'error';

// 分页元数据类型
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 搜索过滤器类型
export interface SearchFilters {
  search?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: string;
  type?: string;
}

// 排序选项类型
export interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// 类型守护函数
export function isTRPCError(error: unknown): error is TRPCError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// 错误处理工具函数
export function getTRPCErrorMessage(error: unknown): string {
  if (isTRPCError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '发生了未知错误';
}

// 错误代码检查函数
export function isTRPCErrorCode(error: unknown, code: string): boolean {
  return isTRPCError(error) && error.code === code;
}

// 认证错误检查函数
export function isAuthError(error: unknown): boolean {
  return isTRPCErrorCode(error, 'UNAUTHORIZED') || isTRPCErrorCode(error, 'FORBIDDEN');
}

// 网络错误检查函数
export function isNetworkError(error: unknown): boolean {
  return isTRPCErrorCode(error, 'INTERNAL_SERVER_ERROR') || isTRPCErrorCode(error, 'TIMEOUT');
}

// 验证错误检查函数
export function isValidationError(error: unknown): boolean {
  return isTRPCErrorCode(error, 'BAD_REQUEST') && isTRPCError(error) && error.data?.zodError;
}

// 获取验证错误详情
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (isValidationError(error) && isTRPCError(error)) {
    return error.data?.zodError?.fieldErrors || null;
  }
  return null;
}