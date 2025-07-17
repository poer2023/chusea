/**
 * 工作流管理API路由
 * 
 * 提供工作流的创建、执行、监控等功能
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

/**
 * 工作流相关的输入验证schemas
 */
const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'end', 'task', 'decision', 'api', 'ai']),
  label: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

const workflowCreateInput = z.object({
  name: z.string().min(1, '工作流名称不能为空').max(100, '名称长度不能超过100个字符'),
  description: z.string().optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  trigger: z.object({
    type: z.enum(['manual', 'schedule', 'webhook', 'event']),
    config: z.record(z.unknown()).optional(),
  }).optional(),
});

const workflowUpdateInput = z.object({
  id: z.string(),
  name: z.string().min(1, '工作流名称不能为空').max(100, '名称长度不能超过100个字符').optional(),
  description: z.string().optional(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  trigger: z.object({
    type: z.enum(['manual', 'schedule', 'webhook', 'event']),
    config: z.record(z.unknown()).optional(),
  }).optional(),
});

const workflowExecuteInput = z.object({
  id: z.string(),
  input: z.record(z.unknown()).optional(),
  context: z.record(z.unknown()).optional(),
});

const executionQueryInput = z.object({
  workflowId: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(10),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

/**
 * 模拟数据
 */
const mockWorkflows = [
  {
    id: 'workflow-1',
    name: '文档审批流程',
    description: '自动化文档审批流程',
    ownerId: 'user-1',
    nodes: [
      {
        id: 'start',
        type: 'start' as const,
        label: '开始',
        position: { x: 100, y: 100 },
      },
      {
        id: 'review',
        type: 'task' as const,
        label: '文档审核',
        position: { x: 300, y: 100 },
        config: { assignee: 'reviewer' },
      },
      {
        id: 'approve',
        type: 'decision' as const,
        label: '审批决策',
        position: { x: 500, y: 100 },
      },
      {
        id: 'end',
        type: 'end' as const,
        label: '结束',
        position: { x: 700, y: 100 },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'review' },
      { id: 'e2', source: 'review', target: 'approve' },
      { id: 'e3', source: 'approve', target: 'end', condition: 'approved' },
    ],
    tags: ['审批', '文档'],
    isActive: true,
    trigger: {
      type: 'manual' as const,
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    executionCount: 25,
    successRate: 0.92,
  },
  {
    id: 'workflow-2',
    name: 'AI内容生成',
    description: 'AI自动生成内容的工作流',
    ownerId: 'user-1',
    nodes: [
      {
        id: 'start',
        type: 'start' as const,
        label: '开始',
        position: { x: 100, y: 100 },
      },
      {
        id: 'ai-generate',
        type: 'ai' as const,
        label: 'AI生成内容',
        position: { x: 300, y: 100 },
        config: { model: 'gpt-4', temperature: 0.7 },
      },
      {
        id: 'review',
        type: 'task' as const,
        label: '人工审核',
        position: { x: 500, y: 100 },
      },
      {
        id: 'end',
        type: 'end' as const,
        label: '结束',
        position: { x: 700, y: 100 },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'ai-generate' },
      { id: 'e2', source: 'ai-generate', target: 'review' },
      { id: 'e3', source: 'review', target: 'end' },
    ],
    tags: ['AI', '内容生成'],
    isActive: true,
    trigger: {
      type: 'schedule' as const,
      config: { cron: '0 9 * * *' },
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    executionCount: 42,
    successRate: 0.88,
  },
];

const mockExecutions = [
  {
    id: 'exec-1',
    workflowId: 'workflow-1',
    status: 'completed' as const,
    startedAt: new Date('2024-01-20T10:00:00Z'),
    completedAt: new Date('2024-01-20T10:15:00Z'),
    duration: 900, // 秒
    input: { documentId: 'doc-1' },
    output: { approved: true, comments: '审批通过' },
    steps: [
      {
        nodeId: 'start',
        status: 'completed' as const,
        startedAt: new Date('2024-01-20T10:00:00Z'),
        completedAt: new Date('2024-01-20T10:00:05Z'),
      },
      {
        nodeId: 'review',
        status: 'completed' as const,
        startedAt: new Date('2024-01-20T10:00:05Z'),
        completedAt: new Date('2024-01-20T10:10:00Z'),
      },
      {
        nodeId: 'approve',
        status: 'completed' as const,
        startedAt: new Date('2024-01-20T10:10:00Z'),
        completedAt: new Date('2024-01-20T10:15:00Z'),
      },
    ],
  },
  {
    id: 'exec-2',
    workflowId: 'workflow-2',
    status: 'running' as const,
    startedAt: new Date('2024-01-20T11:00:00Z'),
    completedAt: null,
    duration: null,
    input: { topic: '人工智能技术发展' },
    output: null,
    steps: [
      {
        nodeId: 'start',
        status: 'completed' as const,
        startedAt: new Date('2024-01-20T11:00:00Z'),
        completedAt: new Date('2024-01-20T11:00:05Z'),
      },
      {
        nodeId: 'ai-generate',
        status: 'running' as const,
        startedAt: new Date('2024-01-20T11:00:05Z'),
        completedAt: null,
      },
    ],
  },
];

/**
 * 工作流管理路由器
 */
export const workflowRouter = createTRPCRouter({
  /**
   * 获取工作流列表
   */
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).optional().default(1),
      limit: z.number().min(1).max(50).optional().default(10),
      search: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search, tags, isActive } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const filteredWorkflows = mockWorkflows.filter(workflow => {
          if (workflow.ownerId !== userId) return false;
          
          if (search && !workflow.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          
          if (tags && tags.length > 0 && !tags.some(tag => workflow.tags.includes(tag))) {
            return false;
          }
          
          if (isActive !== undefined && workflow.isActive !== isActive) {
            return false;
          }
          
          return true;
        });
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedWorkflows = filteredWorkflows.slice(startIndex, endIndex);
        
        return {
          workflows: paginatedWorkflows,
          pagination: {
            page,
            limit,
            total: filteredWorkflows.length,
            pages: Math.ceil(filteredWorkflows.length / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取工作流列表失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取单个工作流
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const workflow = mockWorkflows.find(w => w.id === id);
        
        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在',
          });
        }
        
        if (workflow.ownerId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权访问此工作流',
          });
        }
        
        return workflow;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取工作流失败',
          cause: error,
        });
      }
    }),

  /**
   * 创建工作流
   */
  create: protectedProcedure
    .input(workflowCreateInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库插入
        const newWorkflow = {
          id: `workflow-${Date.now()}`,
          ...input,
          ownerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          executionCount: 0,
          successRate: 0,
        };
        
        mockWorkflows.push(newWorkflow);
        
        return {
          success: true,
          workflow: newWorkflow,
          message: '工作流创建成功',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建工作流失败',
          cause: error,
        });
      }
    }),

  /**
   * 更新工作流
   */
  update: protectedProcedure
    .input(workflowUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库更新
        const workflowIndex = mockWorkflows.findIndex(w => w.id === id);
        
        if (workflowIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在',
          });
        }
        
        const workflow = mockWorkflows[workflowIndex];
        
        if (workflow.ownerId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权编辑此工作流',
          });
        }
        
        mockWorkflows[workflowIndex] = {
          ...workflow,
          ...updateData,
          updatedAt: new Date(),
        };
        
        return {
          success: true,
          workflow: mockWorkflows[workflowIndex],
          message: '工作流更新成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新工作流失败',
          cause: error,
        });
      }
    }),

  /**
   * 删除工作流
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库删除
        const workflowIndex = mockWorkflows.findIndex(w => w.id === id);
        
        if (workflowIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在',
          });
        }
        
        const workflow = mockWorkflows[workflowIndex];
        
        if (workflow.ownerId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权删除此工作流',
          });
        }
        
        mockWorkflows.splice(workflowIndex, 1);
        
        return {
          success: true,
          message: '工作流删除成功',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '删除工作流失败',
          cause: error,
        });
      }
    }),

  /**
   * 执行工作流
   */
  execute: protectedProcedure
    .input(workflowExecuteInput)
    .mutation(async ({ input, ctx }) => {
      const { id, input: workflowInput } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的工作流执行引擎
        // 1. 验证工作流是否存在且激活
        // 2. 创建执行记录
        // 3. 异步执行工作流
        
        const workflow = mockWorkflows.find(w => w.id === id);
        
        if (!workflow) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '工作流不存在',
          });
        }
        
        if (workflow.ownerId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权执行此工作流',
          });
        }
        
        const executionId = `exec-${Date.now()}`;
        
        // 模拟异步执行
        setTimeout(() => {
          // 在这里可以更新执行状态
        }, 5000);
        
        return {
          success: true,
          executionId,
          message: '工作流已开始执行',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '工作流执行失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取执行记录
   */
  executions: protectedProcedure
    .input(executionQueryInput)
    .query(async ({ input, ctx }) => {
      const { workflowId, status, page, limit, startDate, endDate } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的数据库查询
        const filteredExecutions = mockExecutions.filter(exec => {
          // 检查用户是否拥有对应的工作流
          const workflow = mockWorkflows.find(w => w.id === exec.workflowId);
          if (!workflow || workflow.ownerId !== userId) {
            return false;
          }
          
          if (workflowId && exec.workflowId !== workflowId) {
            return false;
          }
          
          if (status && exec.status !== status) {
            return false;
          }
          
          if (startDate && exec.startedAt < startDate) {
            return false;
          }
          
          if (endDate && exec.startedAt > endDate) {
            return false;
          }
          
          return true;
        });
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedExecutions = filteredExecutions.slice(startIndex, endIndex);
        
        return {
          executions: paginatedExecutions,
          pagination: {
            page,
            limit,
            total: filteredExecutions.length,
            pages: Math.ceil(filteredExecutions.length / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取执行记录失败',
          cause: error,
        });
      }
    }),

  /**
   * 获取工作流统计
   */
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的统计查询
        const userWorkflows = mockWorkflows.filter(w => w.ownerId === userId);
        const userExecutions = mockExecutions.filter(exec => {
          const workflow = mockWorkflows.find(w => w.id === exec.workflowId);
          return workflow && workflow.ownerId === userId;
        });
        
        const completedExecutions = userExecutions.filter(exec => exec.status === 'completed');
        const failedExecutions = userExecutions.filter(exec => exec.status === 'failed');
        
        return {
          totalWorkflows: userWorkflows.length,
          activeWorkflows: userWorkflows.filter(w => w.isActive).length,
          totalExecutions: userExecutions.length,
          successfulExecutions: completedExecutions.length,
          failedExecutions: failedExecutions.length,
          successRate: userExecutions.length > 0 
            ? completedExecutions.length / userExecutions.length 
            : 0,
          recentExecutions: userExecutions
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
            .slice(0, 5),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取统计信息失败',
          cause: error,
        });
      }
    }),

  /**
   * 停止执行
   */
  stopExecution: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { executionId } = input;
      const userId = ctx.session.user.id;
      
      try {
        // TODO: 实际的停止执行逻辑
        const executionIndex = mockExecutions.findIndex(exec => exec.id === executionId);
        
        if (executionIndex === -1) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '执行记录不存在',
          });
        }
        
        const execution = mockExecutions[executionIndex];
        const workflow = mockWorkflows.find(w => w.id === execution.workflowId);
        
        if (!workflow || workflow.ownerId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无权停止此执行',
          });
        }
        
        if (execution.status !== 'running') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '执行未在运行中',
          });
        }
        
        mockExecutions[executionIndex] = {
          ...execution,
          status: 'cancelled' as const,
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
        };
        
        return {
          success: true,
          message: '执行已停止',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '停止执行失败',
          cause: error,
        });
      }
    }),
});