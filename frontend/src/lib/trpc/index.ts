/**
 * tRPC配置索引
 * 
 * 统一导出所有tRPC相关的配置、类型和工具
 */

// 客户端相关
export { trpc, trpcClientConfig } from './client';
export type { TRPCClient } from './client';

// 服务器端相关
export { serverClient, createServerClient } from './server';
export type { ServerClient } from './server';

// Provider相关
export { TRPCProvider, SimpleTRPCProvider, useTRPC, useQueryClient } from './provider';
export type { TRPCProviderProps } from './provider';

// 类型相关
export type {
  RouterInputs,
  RouterOutputs,
  // 认证类型
  LoginInput,
  LoginOutput,
  RegisterInput,
  RegisterOutput,
  MeOutput,
  // 文档类型
  DocumentListInput,
  DocumentListOutput,
  DocumentGetInput,
  DocumentGetOutput,
  DocumentCreateInput,
  DocumentCreateOutput,
  DocumentUpdateInput,
  DocumentUpdateOutput,
  DocumentStatsOutput,
  // 工作流类型
  WorkflowListInput,
  WorkflowListOutput,
  WorkflowGetInput,
  WorkflowGetOutput,
  WorkflowCreateInput,
  WorkflowCreateOutput,
  WorkflowUpdateInput,
  WorkflowUpdateOutput,
  WorkflowExecuteInput,
  WorkflowExecuteOutput,
  WorkflowExecutionsInput,
  WorkflowExecutionsOutput,
  WorkflowStatsOutput,
  // 用户类型
  UserProfileOutput,
  UserUpdateProfileInput,
  UserUpdateProfileOutput,
  UserUpdatePreferencesInput,
  UserUpdatePreferencesOutput,
  UserStatsOutput,
  UserSearchInput,
  UserSearchOutput,
  // 工具类型
  TRPCError,
  QueryOptions,
  MutationOptions,
  APIStatus,
  PaginationMeta,
  SearchFilters,
  SortOptions,
} from './types';

// 工具函数
export {
  isTRPCError,
  getTRPCErrorMessage,
  isTRPCErrorCode,
  isAuthError,
  isNetworkError,
  isValidationError,
  getValidationErrors,
} from './types';

// 路由器类型
export type { AppRouter } from '@/server/api/root';