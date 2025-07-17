// Advanced workflow management hooks for ChUseA
import React from 'react';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { call } from '../../lib/api/router';
import { QUERY_KEYS, API_CONFIG } from '../../lib/constants';
import { useAdvancedPermissions } from './use-auth-advanced';
import type {
  WritingWorkflow,
  WorkflowTemplate,
  WorkflowStep,
  WorkflowStepData,
  CreateWorkflowData,
  UpdateWorkflowData,
  WorkflowAutomation,
  WorkflowAnalytics
} from '../../types';

// ============================================================================
// TEMPLATE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for comprehensive workflow template management
 */
export function useWorkflowTemplateManager() {
  const queryClient = useQueryClient();
  const { checkPermission } = useAdvancedPermissions();
  
  const templates = useQuery({
    queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES(),
    queryFn: () => call('workflows.getTemplates'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const templateCategories = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW_TEMPLATES(), 'categories'],
    queryFn: () => call('workflows.getTemplateCategories'),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const featuredTemplates = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW_TEMPLATES(), 'featured'],
    queryFn: () => call('workflows.getFeaturedTemplates'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  
  const createTemplate = useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      steps,
      variables,
      triggers,
      isPublic = false,
      tags
    }: {
      name: string;
      description?: string;
      category: string;
      steps: WorkflowStep[];
      variables?: string[];
      triggers?: any[];
      isPublic?: boolean;
      tags?: string[];
    }) => {
      if (!checkPermission('workflows:create_template')) {
        throw new Error('Insufficient permissions to create workflow template');
      }
      
      return call('workflows.createTemplate', {
        name,
        description,
        category,
        steps,
        variables,
        triggers,
        isPublic,
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const updateTemplate = useMutation({
    mutationFn: async ({
      templateId,
      name,
      description,
      category,
      steps,
      variables,
      triggers,
      tags
    }: {
      templateId: string;
      name?: string;
      description?: string;
      category?: string;
      steps?: WorkflowStep[];
      variables?: string[];
      triggers?: any[];
      tags?: string[];
    }) => {
      if (!checkPermission('workflows:update_template')) {
        throw new Error('Insufficient permissions to update workflow template');
      }
      
      return call('workflows.updateTemplate', {
        templateId,
        name,
        description,
        category,
        steps,
        variables,
        triggers,
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      if (!checkPermission('workflows:delete_template')) {
        throw new Error('Insufficient permissions to delete workflow template');
      }
      
      return call('workflows.deleteTemplate', { templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const duplicateTemplate = useMutation({
    mutationFn: async ({
      templateId,
      name
    }: {
      templateId: string;
      name: string;
    }) => {
      return call('workflows.duplicateTemplate', { templateId, name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const publishTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      if (!checkPermission('workflows:publish_template')) {
        throw new Error('Insufficient permissions to publish workflow template');
      }
      
      return call('workflows.publishTemplate', { templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const importTemplate = useMutation({
    mutationFn: async ({
      templateData,
      sourceFormat = 'json'
    }: {
      templateData: any;
      sourceFormat?: 'json' | 'yaml' | 'xml';
    }) => {
      return call('workflows.importTemplate', { templateData, sourceFormat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
  
  const exportTemplate = useMutation({
    mutationFn: async ({
      templateId,
      format = 'json'
    }: {
      templateId: string;
      format?: 'json' | 'yaml' | 'xml';
    }) => {
      return call('workflows.exportTemplate', { templateId, format });
    }
  });
  
  return {
    templates: templates.data || [],
    templateCategories: templateCategories.data || [],
    featuredTemplates: featuredTemplates.data || [],
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    publishTemplate,
    importTemplate,
    exportTemplate,
    isLoading: templates.isLoading || templateCategories.isLoading,
  };
}

// ============================================================================
// WORKFLOW AUTOMATION HOOKS
// ============================================================================

/**
 * Hook for workflow automation and triggers
 */
export function useWorkflowAutomation(workflowId?: string) {
  const queryClient = useQueryClient();
  
  const automations = useQuery({
    queryKey: workflowId 
      ? [...QUERY_KEYS.WORKFLOW(workflowId), 'automations']
      : [...QUERY_KEYS.WORKFLOWS, 'automations'],
    queryFn: () => {
      if (workflowId) {
        return call('workflows.getAutomations', { workflowId });
      } else {
        return call('workflows.getAllAutomations');
      }
    },
    enabled: !!workflowId || workflowId === undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const availableTriggers = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOWS, 'triggers'],
    queryFn: () => call('workflows.getAvailableTriggers'),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const availableActions = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOWS, 'actions'],
    queryFn: () => call('workflows.getAvailableActions'),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const createAutomation = useMutation({
    mutationFn: async ({
      workflowId,
      name,
      description,
      trigger,
      conditions,
      actions,
      isActive = true
    }: {
      workflowId: string;
      name: string;
      description?: string;
      trigger: any;
      conditions?: any[];
      actions: any[];
      isActive?: boolean;
    }) => {
      return call('workflows.createAutomation', {
        workflowId,
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOWS, 'automations'],
        exact: false 
      });
    }
  });
  
  const updateAutomation = useMutation({
    mutationFn: async ({
      automationId,
      name,
      description,
      trigger,
      conditions,
      actions,
      isActive
    }: {
      automationId: string;
      name?: string;
      description?: string;
      trigger?: any;
      conditions?: any[];
      actions?: any[];
      isActive?: boolean;
    }) => {
      return call('workflows.updateAutomation', {
        automationId,
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOWS, 'automations'],
        exact: false 
      });
    }
  });
  
  const deleteAutomation = useMutation({
    mutationFn: async (automationId: string) => {
      return call('workflows.deleteAutomation', { automationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOWS, 'automations'],
        exact: false 
      });
    }
  });
  
  const testAutomation = useMutation({
    mutationFn: async ({
      automationId,
      testData
    }: {
      automationId: string;
      testData?: any;
    }) => {
      return call('workflows.testAutomation', { automationId, testData });
    }
  });
  
  const triggerAutomation = useMutation({
    mutationFn: async ({
      automationId,
      triggerData
    }: {
      automationId: string;
      triggerData?: any;
    }) => {
      return call('workflows.triggerAutomation', { automationId, triggerData });
    }
  });
  
  const getAutomationLogs = useQuery({
    queryKey: workflowId 
      ? [...QUERY_KEYS.WORKFLOW(workflowId), 'automation-logs']
      : [...QUERY_KEYS.WORKFLOWS, 'automation-logs'],
    queryFn: () => {
      if (workflowId) {
        return call('workflows.getAutomationLogs', { workflowId });
      } else {
        return call('workflows.getAllAutomationLogs');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  return {
    automations: automations.data || [],
    availableTriggers: availableTriggers.data || [],
    availableActions: availableActions.data || [],
    automationLogs: getAutomationLogs.data || [],
    createAutomation,
    updateAutomation,
    deleteAutomation,
    testAutomation,
    triggerAutomation,
    isLoading: automations.isLoading || 
               availableTriggers.isLoading || 
               availableActions.isLoading,
  };
}

// ============================================================================
// WORKFLOW COLLABORATION HOOKS
// ============================================================================

/**
 * Hook for workflow collaboration features
 */
export function useWorkflowCollaboration(workflowId: string) {
  const queryClient = useQueryClient();
  
  const collaborators = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'collaborators'],
    queryFn: () => call('workflows.getCollaborators', { workflowId }),
    enabled: !!workflowId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
  
  const assignments = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'assignments'],
    queryFn: () => call('workflows.getAssignments', { workflowId }),
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const addCollaborator = useMutation({
    mutationFn: async ({
      userId,
      role = 'collaborator',
      permissions = []
    }: {
      userId: string;
      role?: 'owner' | 'manager' | 'collaborator' | 'viewer';
      permissions?: string[];
    }) => {
      return call('workflows.addCollaborator', {
        workflowId,
        userId,
        role,
        permissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'collaborators'] 
      });
    }
  });
  
  const removeCollaborator = useMutation({
    mutationFn: async (userId: string) => {
      return call('workflows.removeCollaborator', { workflowId, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'collaborators'] 
      });
    }
  });
  
  const updateCollaboratorRole = useMutation({
    mutationFn: async ({
      userId,
      role,
      permissions
    }: {
      userId: string;
      role?: 'owner' | 'manager' | 'collaborator' | 'viewer';
      permissions?: string[];
    }) => {
      return call('workflows.updateCollaboratorRole', {
        workflowId,
        userId,
        role,
        permissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'collaborators'] 
      });
    }
  });
  
  const assignStep = useMutation({
    mutationFn: async ({
      stepId,
      assigneeId,
      dueDate,
      notes
    }: {
      stepId: string;
      assigneeId: string;
      dueDate?: string;
      notes?: string;
    }) => {
      return call('workflows.assignStep', {
        workflowId,
        stepId,
        assigneeId,
        dueDate,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'assignments'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.WORKFLOW_STEPS(workflowId) 
      });
    }
  });
  
  const unassignStep = useMutation({
    mutationFn: async (stepId: string) => {
      return call('workflows.unassignStep', { workflowId, stepId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'assignments'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.WORKFLOW_STEPS(workflowId) 
      });
    }
  });
  
  const addWorkflowComment = useMutation({
    mutationFn: async ({
      content,
      stepId,
      mentions
    }: {
      content: string;
      stepId?: string;
      mentions?: string[];
    }) => {
      return call('workflows.addComment', {
        workflowId,
        content,
        stepId,
        mentions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'comments'] 
      });
    }
  });
  
  const getWorkflowComments = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'comments'],
    queryFn: () => call('workflows.getComments', { workflowId }),
    enabled: !!workflowId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  return {
    collaborators: collaborators.data || [],
    assignments: assignments.data || [],
    comments: getWorkflowComments.data || [],
    addCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    assignStep,
    unassignStep,
    addWorkflowComment,
    isLoading: collaborators.isLoading || assignments.isLoading,
  };
}

// ============================================================================
// WORKFLOW ANALYTICS HOOKS
// ============================================================================

/**
 * Hook for workflow analytics and reporting
 */
export function useWorkflowAnalytics(workflowId?: string) {
  const analytics = useQuery({
    queryKey: workflowId 
      ? [...QUERY_KEYS.WORKFLOW(workflowId), 'analytics']
      : [...QUERY_KEYS.WORKFLOWS, 'analytics'],
    queryFn: () => {
      if (workflowId) {
        return call('workflows.getAnalytics', { workflowId });
      } else {
        return call('workflows.getOverallAnalytics');
      }
    },
    enabled: !!workflowId || workflowId === undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const performanceMetrics = useQuery({
    queryKey: workflowId 
      ? [...QUERY_KEYS.WORKFLOW(workflowId), 'performance']
      : [...QUERY_KEYS.WORKFLOWS, 'performance'],
    queryFn: () => {
      if (workflowId) {
        return call('workflows.getPerformanceMetrics', { workflowId });
      } else {
        return call('workflows.getOverallPerformanceMetrics');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const bottleneckAnalysis = useQuery({
    queryKey: workflowId 
      ? [...QUERY_KEYS.WORKFLOW(workflowId), 'bottlenecks']
      : [...QUERY_KEYS.WORKFLOWS, 'bottlenecks'],
    queryFn: () => {
      if (workflowId) {
        return call('workflows.getBottleneckAnalysis', { workflowId });
      } else {
        return call('workflows.getOverallBottleneckAnalysis');
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  
  const generateReport = useMutation({
    mutationFn: async ({
      workflowIds,
      reportType,
      dateRange,
      format = 'pdf'
    }: {
      workflowIds?: string[];
      reportType: 'performance' | 'completion' | 'efficiency' | 'detailed';
      dateRange: { from: string; to: string };
      format?: 'pdf' | 'excel' | 'csv';
    }) => {
      return call('workflows.generateReport', {
        workflowIds,
        reportType,
        dateRange,
        format,
      });
    }
  });
  
  const exportAnalytics = useMutation({
    mutationFn: async ({
      workflowId,
      format = 'json',
      includeRawData = false
    }: {
      workflowId?: string;
      format?: 'json' | 'csv' | 'excel';
      includeRawData?: boolean;
    }) => {
      return call('workflows.exportAnalytics', {
        workflowId,
        format,
        includeRawData,
      });
    }
  });
  
  return {
    analytics: analytics.data,
    performanceMetrics: performanceMetrics.data,
    bottleneckAnalysis: bottleneckAnalysis.data,
    generateReport,
    exportAnalytics,
    isLoading: analytics.isLoading || 
               performanceMetrics.isLoading || 
               bottleneckAnalysis.isLoading,
  };
}

// ============================================================================
// WORKFLOW VERSIONING HOOKS
// ============================================================================

/**
 * Hook for workflow version control
 */
export function useWorkflowVersions(workflowId: string) {
  const queryClient = useQueryClient();
  
  const versions = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'versions'],
    queryFn: () => call('workflows.getVersions', { workflowId }),
    enabled: !!workflowId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const createVersion = useMutation({
    mutationFn: async ({
      name,
      description,
      changes
    }: {
      name?: string;
      description?: string;
      changes?: string[];
    }) => {
      return call('workflows.createVersion', {
        workflowId,
        name,
        description,
        changes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'versions'] 
      });
    }
  });
  
  const restoreVersion = useMutation({
    mutationFn: async (versionId: string) => {
      return call('workflows.restoreVersion', { workflowId, versionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'versions'] 
      });
    }
  });
  
  const compareVersions = useMutation({
    mutationFn: async ({
      versionId1,
      versionId2
    }: {
      versionId1: string;
      versionId2: string;
    }) => {
      return call('workflows.compareVersions', {
        workflowId,
        versionId1,
        versionId2,
      });
    }
  });
  
  const deleteVersion = useMutation({
    mutationFn: async (versionId: string) => {
      return call('workflows.deleteVersion', { workflowId, versionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'versions'] 
      });
    }
  });
  
  return {
    versions: versions.data || [],
    createVersion,
    restoreVersion,
    compareVersions,
    deleteVersion,
    isLoading: versions.isLoading,
  };
}

// ============================================================================
// WORKFLOW SCHEDULING HOOKS
// ============================================================================

/**
 * Hook for workflow scheduling and recurring execution
 */
export function useWorkflowScheduling(workflowId: string) {
  const queryClient = useQueryClient();
  
  const schedules = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'schedules'],
    queryFn: () => call('workflows.getSchedules', { workflowId }),
    enabled: !!workflowId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const createSchedule = useMutation({
    mutationFn: async ({
      name,
      cronExpression,
      timezone,
      startDate,
      endDate,
      isActive = true,
      variables
    }: {
      name: string;
      cronExpression: string;
      timezone?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      variables?: Record<string, any>;
    }) => {
      return call('workflows.createSchedule', {
        workflowId,
        name,
        cronExpression,
        timezone,
        startDate,
        endDate,
        isActive,
        variables,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'schedules'] 
      });
    }
  });
  
  const updateSchedule = useMutation({
    mutationFn: async ({
      scheduleId,
      name,
      cronExpression,
      timezone,
      startDate,
      endDate,
      isActive,
      variables
    }: {
      scheduleId: string;
      name?: string;
      cronExpression?: string;
      timezone?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      variables?: Record<string, any>;
    }) => {
      return call('workflows.updateSchedule', {
        scheduleId,
        name,
        cronExpression,
        timezone,
        startDate,
        endDate,
        isActive,
        variables,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'schedules'] 
      });
    }
  });
  
  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      return call('workflows.deleteSchedule', { scheduleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'schedules'] 
      });
    }
  });
  
  const getScheduleHistory = useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'schedule-history'],
    queryFn: () => call('workflows.getScheduleHistory', { workflowId }),
    enabled: !!workflowId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  return {
    schedules: schedules.data || [],
    scheduleHistory: getScheduleHistory.data || [],
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isLoading: schedules.isLoading || getScheduleHistory.isLoading,
  };
}