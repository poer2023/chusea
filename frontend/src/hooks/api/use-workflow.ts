// Workflow management hooks using TanStack Query

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { QUERY_KEYS, API_ENDPOINTS, API_CONFIG } from '../../lib/constants';
import type {
  WritingWorkflow,
  WorkflowTemplate,
  WorkflowStepData,
  CreateWorkflowData,
  UpdateWorkflowData,
  GetWorkflowsRequest,
  GetWorkflowsResponse,
  CreateWorkflowResponse,
  UpdateWorkflowResponse,
  WorkflowStatus,
  WorkflowStep,
  WorkflowAnalytics,
  WorkflowProgress
} from '../../types';
import { NodeStatus } from '../../lib/fastapi/types';

// ============================================================================
// WORKFLOW QUERIES
// ============================================================================

/**
 * Hook to get paginated list of workflows
 */
export function useWorkflows(filters: GetWorkflowsRequest = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKFLOWS_LIST(filters),
    queryFn: async (): Promise<GetWorkflowsResponse> => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const endpoint = params.toString() 
        ? `${API_ENDPOINTS.WORKFLOWS.LIST}?${params.toString()}`
        : API_ENDPOINTS.WORKFLOWS.LIST;
      
      return apiClient.get<GetWorkflowsResponse>(endpoint);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData
  });
}

/**
 * Hook for infinite scroll workflows
 */
export function useInfiniteWorkflows(filters: Omit<GetWorkflowsRequest, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.WORKFLOWS_LIST(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }): Promise<GetWorkflowsResponse> => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      params.append('pageSize', (filters.pageSize || API_CONFIG.DEFAULT_PAGE_SIZE).toString());
      
      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'pageSize') {
          params.append(key, value.toString());
        }
      });
      
      const endpoint = `${API_ENDPOINTS.WORKFLOWS.LIST}?${params.toString()}`;
      return apiClient.get<GetWorkflowsResponse>(endpoint);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to get a single workflow by ID
 */
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKFLOW(id),
    queryFn: async (): Promise<WritingWorkflow> => {
      return apiClient.get<WritingWorkflow>(API_ENDPOINTS.WORKFLOWS.GET(id));
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry if workflow not found
      if (error?.status === 404) return false;
      return failureCount < 2;
    }
  });
}

/**
 * Hook to get workflow steps
 */
export function useWorkflowSteps(workflowId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKFLOW_STEPS(workflowId),
    queryFn: async (): Promise<WorkflowStepData[]> => {
      return apiClient.get<WorkflowStepData[]>(API_ENDPOINTS.WORKFLOWS.STEPS(workflowId));
    },
    enabled: !!workflowId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true // Steps should be fresh for real-time updates
  });
}

/**
 * Hook to get workflow templates
 */
export function useWorkflowTemplates(filters: any = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW_TEMPLATES(), filters],
    queryFn: async (): Promise<WorkflowTemplate[]> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const endpoint = params.toString() 
        ? `${API_ENDPOINTS.WORKFLOWS.TEMPLATES}?${params.toString()}`
        : API_ENDPOINTS.WORKFLOWS.TEMPLATES;
      
      return apiClient.get<WorkflowTemplate[]>(endpoint);
    },
    staleTime: 10 * 60 * 1000 // 10 minutes - templates don't change often
  });
}

/**
 * Hook to get a specific workflow template
 */
export function useWorkflowTemplate(templateId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW_TEMPLATES(), templateId],
    queryFn: async (): Promise<WorkflowTemplate> => {
      return apiClient.get<WorkflowTemplate>(API_ENDPOINTS.WORKFLOWS.TEMPLATE(templateId));
    },
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000
  });
}

/**
 * Hook to get workflows for a specific document
 */
export function useDocumentWorkflows(documentId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOWS_LIST({ documentId })],
    queryFn: async (): Promise<GetWorkflowsResponse> => {
      return apiClient.get<GetWorkflowsResponse>(
        `${API_ENDPOINTS.WORKFLOWS.LIST}?documentId=${documentId}`
      );
    },
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to get workflow analytics
 */
export function useWorkflowAnalytics(workflowId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKFLOW(workflowId), 'analytics'],
    queryFn: async (): Promise<WorkflowAnalytics> => {
      return apiClient.get<WorkflowAnalytics>(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/analytics`
      );
    },
    enabled: !!workflowId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// ============================================================================
// WORKFLOW MUTATIONS
// ============================================================================

/**
 * Hook for creating a new workflow
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateWorkflowData): Promise<CreateWorkflowResponse> => {
      return apiClient.post<CreateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.CREATE, data);
    },
    onSuccess: (response) => {
      // Add new workflow to cache
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(response.workflow.id), response.workflow);
      
      // Invalidate workflow lists to include the new workflow
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.WORKFLOWS,
        exact: false 
      });
      
      // If workflow is for a specific document, invalidate that document's workflows
      if (response.workflow.documentId) {
        queryClient.invalidateQueries({ 
          queryKey: [...QUERY_KEYS.WORKFLOWS_LIST({ documentId: response.workflow.documentId })]
        });
      }
    }
  });
}

/**
 * Hook for updating a workflow
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkflowData }): Promise<UpdateWorkflowResponse> => {
      return apiClient.put<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.UPDATE(id), data);
    },
    onSuccess: (response, { id }) => {
      // Update workflow in cache
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
      
      // Update workflow in all lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.WORKFLOWS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.workflows) {
            return {
              ...oldData,
              workflows: oldData.workflows.map((workflow: WritingWorkflow) =>
                workflow.id === id ? response.workflow : workflow
              )
            };
          } else if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                workflows: page.workflows.map((workflow: WritingWorkflow) =>
                  workflow.id === id ? response.workflow : workflow
                )
              }))
            };
          }
          
          return oldData;
        }
      );
    },
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.WORKFLOW(id) });
      
      const previousWorkflow = queryClient.getQueryData(QUERY_KEYS.WORKFLOW(id));
      
      if (previousWorkflow) {
        queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), {
          ...(previousWorkflow as any),
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
      
      return { previousWorkflow };
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousWorkflow) {
        queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), context.previousWorkflow);
      }
    }
  });
}

/**
 * Hook for deleting a workflow
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return apiClient.delete<void>(API_ENDPOINTS.WORKFLOWS.DELETE(id));
    },
    onSuccess: (response, id) => {
      // Remove workflow from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.WORKFLOW(id) });
      
      // Remove workflow from all lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.WORKFLOWS, exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (oldData.workflows) {
            return {
              ...oldData,
              workflows: oldData.workflows.filter((workflow: WritingWorkflow) => workflow.id !== id),
              meta: {
                ...oldData.meta,
                total: oldData.meta.total - 1
              }
            };
          } else if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                workflows: page.workflows.filter((workflow: WritingWorkflow) => workflow.id !== id),
                meta: {
                  ...page.meta,
                  total: page.meta.total - 1
                }
              }))
            };
          }
          
          return oldData;
        }
      );
    }
  });
}

// ============================================================================
// WORKFLOW CONTROL MUTATIONS
// ============================================================================

/**
 * Hook for starting a workflow
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateWorkflowResponse> => {
      return apiClient.post<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.START(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_STEPS(id) });
    }
  });
}

/**
 * Hook for pausing a workflow
 */
export function usePauseWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateWorkflowResponse> => {
      return apiClient.post<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.PAUSE(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
    }
  });
}

/**
 * Hook for resuming a workflow
 */
export function useResumeWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateWorkflowResponse> => {
      return apiClient.post<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.RESUME(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
    }
  });
}

/**
 * Hook for completing a workflow
 */
export function useCompleteWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateWorkflowResponse> => {
      return apiClient.post<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.COMPLETE(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_STEPS(id) });
    }
  });
}

/**
 * Hook for cancelling a workflow
 */
export function useCancelWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<UpdateWorkflowResponse> => {
      return apiClient.post<UpdateWorkflowResponse>(API_ENDPOINTS.WORKFLOWS.CANCEL(id));
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(QUERY_KEYS.WORKFLOW(id), response.workflow);
    }
  });
}

// ============================================================================
// STEP MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Hook for updating a workflow step
 */
export function useUpdateWorkflowStep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      workflowId, 
      stepId, 
      data 
    }: { 
      workflowId: string; 
      stepId: string; 
      data: Partial<WorkflowStepData> 
    }): Promise<WorkflowStepData> => {
      return apiClient.put<WorkflowStepData>(
        API_ENDPOINTS.WORKFLOWS.STEP(workflowId, stepId),
        data
      );
    },
    onSuccess: (updatedStep, { workflowId, stepId }) => {
      // Update step in the steps list
      queryClient.setQueryData(
        QUERY_KEYS.WORKFLOW_STEPS(workflowId),
        (oldSteps: WorkflowStepData[] = []) => 
          oldSteps.map(step => step.step === updatedStep.step ? updatedStep : step)
      );
      
      // Invalidate workflow to update progress
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
    },
    // Optimistic update for step status changes
    onMutate: async ({ workflowId, stepId, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.WORKFLOW_STEPS(workflowId) });
      
      const previousSteps = queryClient.getQueryData(QUERY_KEYS.WORKFLOW_STEPS(workflowId));
      
      if (previousSteps) {
        queryClient.setQueryData(
          QUERY_KEYS.WORKFLOW_STEPS(workflowId),
          (oldSteps: WorkflowStepData[] = []) => 
            oldSteps.map(step => 
              step.step === data.step ? { ...step, ...data, updatedAt: new Date().toISOString() } : step
            )
        );
      }
      
      return { previousSteps };
    },
    onError: (error, { workflowId }, context) => {
      // Rollback optimistic update
      if (context?.previousSteps) {
        queryClient.setQueryData(QUERY_KEYS.WORKFLOW_STEPS(workflowId), context.previousSteps);
      }
    }
  });
}

/**
 * Hook for completing a workflow step
 */
export function useCompleteWorkflowStep() {
  const updateStep = useUpdateWorkflowStep();
  
  return useMutation({
    mutationFn: async ({ 
      workflowId, 
      stepId, 
      stepData 
    }: { 
      workflowId: string; 
      stepId: string; 
      stepData?: Record<string, any> 
    }) => {
      return updateStep.mutateAsync({
        workflowId,
        stepId,
        data: {
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      });
    }
  });
}

/**
 * Hook for skipping a workflow step
 */
export function useSkipWorkflowStep() {
  const updateStep = useUpdateWorkflowStep();
  
  return useMutation({
    mutationFn: async ({ 
      workflowId, 
      stepId, 
      reason 
    }: { 
      workflowId: string; 
      stepId: string; 
      reason?: string 
    }) => {
      return updateStep.mutateAsync({
        workflowId,
        stepId,
        data: {
          status: 'skipped',
          skippedAt: new Date().toISOString(),
          notes: reason ? [{
            id: `skip-${Date.now()}`,
            content: `Step skipped: ${reason}`,
            type: 'note' as const,
            visibility: 'private' as const,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            tags: ['skip']
          }] : []
        }
      });
    }
  });
}

// ============================================================================
// TEMPLATE MUTATIONS
// ============================================================================

/**
 * Hook for creating a workflow from template
 */
export function useCreateWorkflowFromTemplate() {
  const createWorkflow = useCreateWorkflow();
  
  return useMutation({
    mutationFn: async ({ 
      templateId, 
      documentId, 
      variables 
    }: { 
      templateId: string; 
      documentId: string; 
      variables?: Record<string, any> 
    }) => {
      return createWorkflow.mutateAsync({
        name: `Workflow for ${documentId}`,
        documentId,
        templateId,
        variables
      });
    }
  });
}

/**
 * Hook for saving a workflow as template
 */
export function useSaveWorkflowAsTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      workflowId, 
      templateData 
    }: { 
      workflowId: string; 
      templateData: Partial<WorkflowTemplate> 
    }): Promise<WorkflowTemplate> => {
      return apiClient.post<WorkflowTemplate>(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/save-as-template`,
        templateData
      );
    },
    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_TEMPLATES() });
    }
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for real-time workflow progress tracking
 */
export function useWorkflowProgress(workflowId: string) {
  const { data: workflow } = useWorkflow(workflowId);
  const { data: steps } = useWorkflowSteps(workflowId);
  
  const progress = React.useMemo((): WorkflowProgress | null => {
    if (!workflow || !steps) return null;
    
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    const currentStep = steps.find(step => step.status === 'in_progress');
    const nextStep = steps.find(step => step.status === 'pending');
    
    return {
      percentage: Math.round(percentage),
      completedSteps,
      totalSteps,
      currentPhase: currentStep?.name || nextStep?.name || 'Completed',
      milestones: [], // TODO: Calculate milestones
      timeline: workflow.progress?.timeline || null,
      blockers: [] // TODO: Identify blockers
    } as WorkflowProgress;
  }, [workflow, steps]);
  
  return progress;
}

/**
 * Hook for workflow automation triggers
 */
export function useWorkflowAutomation(workflowId: string) {
  const queryClient = useQueryClient();
  
  const triggerAutomation = React.useCallback(async (
    event: string, 
    data?: Record<string, any>
  ) => {
    try {
      await apiClient.post(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/automation/trigger`,
        { event, data }
      );
      
      // Refresh workflow data after automation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW_STEPS(workflowId) });
    } catch (error) {
      console.error('Automation trigger failed:', error);
      throw error;
    }
  }, [workflowId, queryClient]);
  
  return { triggerAutomation };
}

/**
 * Hook for workflow collaboration
 */
export function useWorkflowCollaboration(workflowId: string) {
  const queryClient = useQueryClient();
  
  const addParticipant = useMutation({
    mutationFn: async (participantData: any) => {
      return apiClient.post(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/participants`,
        participantData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
    }
  });
  
  const removeParticipant = useMutation({
    mutationFn: async (participantId: string) => {
      return apiClient.delete(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/participants/${participantId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
    }
  });
  
  const updateParticipant = useMutation({
    mutationFn: async ({ participantId, data }: { participantId: string; data: any }) => {
      return apiClient.put(
        `${API_ENDPOINTS.WORKFLOWS.GET(workflowId)}/participants/${participantId}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKFLOW(workflowId) });
    }
  });
  
  return {
    addParticipant,
    removeParticipant,
    updateParticipant
  };
}

/**
 * Hook for workflow search and filtering
 */
export function useSearchWorkflows(query: string, filters: any = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SEARCH, 'workflows', query, filters],
    queryFn: async () => {
      return apiClient.get(API_ENDPOINTS.SEARCH.WORKFLOWS, {
        body: JSON.stringify({ query, filters })
      });
    },
    enabled: query.length > 2,
    staleTime: 30 * 1000
  });
}

// React import for hooks
import React from 'react';