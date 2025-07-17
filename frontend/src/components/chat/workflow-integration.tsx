'use client';

/**
 * Workflow Integration Component
 * Demonstrates integration between chat and workflow engine
 */

import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useChatActions } from '@/stores/chat-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface WorkflowIntegrationProps {
  workflowId?: string;
  className?: string;
}

export const WorkflowIntegration: React.FC<WorkflowIntegrationProps> = ({
  workflowId,
  className,
}) => {
  const workflowStore = useWorkflowStore();
  const { addMessage } = useChatActions() as any;
  const [isProcessing, setIsProcessing] = useState(false);

  const { currentWorkflow, isLoading, error } = workflowStore;

  // Mock workflow data for demo
  const mockWorkflow = {
    id: workflowId || 'demo-workflow-123',
    type: 'Document Analysis',
    status: 'running' as const,
    currentStep: 2,
    totalSteps: 5,
    progress: 0.4,
    steps: [
      { id: 1, name: 'Document Upload', status: 'completed', duration: 2000 },
      { id: 2, name: 'Text Analysis', status: 'running', duration: null },
      { id: 3, name: 'Content Extraction', status: 'pending', duration: null },
      { id: 4, name: 'Summary Generation', status: 'pending', duration: null },
      { id: 5, name: 'Final Report', status: 'pending', duration: null },
    ],
  };

  const workflow = currentWorkflow || mockWorkflow;

  const handleWorkflowAction = async (action: string, data?: any) => {
    setIsProcessing(true);
    
    try {
      // Simulate workflow action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add system message to chat
      addMessage({
        id: `workflow-${Date.now()}`,
        role: 'system',
        content: `Workflow ${action}: ${(workflow as any).type}`,
        timestamp: Date.now(),
        status: 'delivered',
        metadata: {
          type: 'workflow',
          workflowId: workflow.id,
          action,
        },
      });
      
      // Update workflow store (in real implementation)
      // workflowStore.updateWorkflow(workflow.id, { status: action });
      
    } catch (error) {
      console.error('Workflow action failed:', error);
      addMessage({
        id: `workflow-error-${Date.now()}`,
        role: 'system',
        content: `Workflow ${action} failed: ${error}`,
        timestamp: Date.now(),
        status: 'delivered',
        metadata: {
          type: 'error',
          workflowId: workflow.id,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!workflow) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <p>No active workflow</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleWorkflowAction('create')}
          >
            Start New Workflow
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn('w-3 h-3 rounded-full', getStatusColor((workflow as any).status))} />
          <div>
            <h3 className="font-medium text-sm">{(workflow as any).type}</h3>
            <p className="text-xs text-gray-500">ID: {workflow.id.slice(-8)}</p>
          </div>
        </div>
        
        <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
          {workflow.status}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round((workflow as any).progress * 100)}%</span>
        </div>
        <Progress value={(workflow as any).progress * 100} className="h-2" />
        <div className="text-xs text-gray-500">
          Step {(workflow as any).currentStep} of {(workflow as any).totalSteps}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Steps</h4>
        <div className="space-y-1">
          {(workflow as any).steps.map((step: any, index: number) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center space-x-3 p-2 rounded-lg transition-colors',
                step.status === 'running' ? 'bg-blue-50 border border-blue-200' :
                step.status === 'completed' ? 'bg-green-50' :
                'bg-gray-50'
              )}
            >
              {getStepIcon(step.status)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{step.name}</div>
                {step.duration && (
                  <div className="text-xs text-gray-500">
                    Completed in {(step.duration / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
              {index < (workflow as any).steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2 pt-2 border-t">
        {workflow.status === 'running' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleWorkflowAction('pause')}
            disabled={isProcessing}
            className="flex-1"
          >
            <Pause className="w-3 h-3 mr-1" />
            Pause
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleWorkflowAction('resume')}
            disabled={isProcessing}
            className="flex-1"
          >
            <Play className="w-3 h-3 mr-1" />
            Resume
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleWorkflowAction('stop')}
          disabled={isProcessing}
          className="flex-1"
        >
          <Square className="w-3 h-3 mr-1" />
          Stop
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleWorkflowAction('next-step')}
          disabled={isProcessing || workflow.status !== 'running'}
        >
          <SkipForward className="w-3 h-3" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWorkflowAction('export-results')}
            className="text-xs h-6"
          >
            Export Results
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWorkflowAction('view-logs')}
            className="text-xs h-6"
          >
            View Logs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWorkflowAction('duplicate')}
            className="text-xs h-6"
          >
            Duplicate
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkflowIntegration;