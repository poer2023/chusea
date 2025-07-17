'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Circle,
  Settings
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  startTime?: string;
  endTime?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'stopped' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: string;
  lastRun?: string;
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: '文档智能分析流程',
    description: '对上传的文档进行智能分析，包括内容提取、关键词识别、情感分析等',
    status: 'stopped',
    createdAt: '2024-01-15T08:00:00Z',
    lastRun: '2024-01-15T14:30:00Z',
    steps: [
      {
        id: '1-1',
        name: '文档上传',
        description: '用户上传需要分析的文档',
        status: 'completed',
        duration: 2,
        startTime: '2024-01-15T14:30:00Z',
        endTime: '2024-01-15T14:30:02Z'
      },
      {
        id: '1-2',
        name: '文档解析',
        description: '解析文档内容，提取文本信息',
        status: 'completed',
        duration: 5,
        startTime: '2024-01-15T14:30:02Z',
        endTime: '2024-01-15T14:30:07Z'
      },
      {
        id: '1-3',
        name: '关键词提取',
        description: '使用AI算法提取文档关键词',
        status: 'completed',
        duration: 8,
        startTime: '2024-01-15T14:30:07Z',
        endTime: '2024-01-15T14:30:15Z'
      },
      {
        id: '1-4',
        name: '情感分析',
        description: '分析文档的情感倾向',
        status: 'completed',
        duration: 6,
        startTime: '2024-01-15T14:30:15Z',
        endTime: '2024-01-15T14:30:21Z'
      },
      {
        id: '1-5',
        name: '生成报告',
        description: '生成分析报告并保存',
        status: 'completed',
        duration: 3,
        startTime: '2024-01-15T14:30:21Z',
        endTime: '2024-01-15T14:30:24Z'
      }
    ]
  },
  {
    id: '2',
    name: '文献自动整理',
    description: '自动整理和分类文献资料，生成引用格式',
    status: 'stopped',
    createdAt: '2024-01-14T10:00:00Z',
    steps: [
      {
        id: '2-1',
        name: '文献收集',
        description: '从各种来源收集文献资料',
        status: 'pending'
      },
      {
        id: '2-2',
        name: '重复检测',
        description: '检测并去除重复的文献',
        status: 'pending'
      },
      {
        id: '2-3',
        name: '自动分类',
        description: '根据内容自动分类文献',
        status: 'pending'
      },
      {
        id: '2-4',
        name: '引用格式化',
        description: '生成标准的引用格式',
        status: 'pending'
      },
      {
        id: '2-5',
        name: '生成目录',
        description: '生成文献目录和索引',
        status: 'pending'
      }
    ]
  },
  {
    id: '3',
    name: '内容自动生成',
    description: '基于关键词和模板自动生成内容',
    status: 'running',
    createdAt: '2024-01-16T09:00:00Z',
    lastRun: '2024-01-16T15:00:00Z',
    steps: [
      {
        id: '3-1',
        name: '关键词分析',
        description: '分析输入的关键词',
        status: 'completed',
        duration: 3,
        startTime: '2024-01-16T15:00:00Z',
        endTime: '2024-01-16T15:00:03Z'
      },
      {
        id: '3-2',
        name: '模板匹配',
        description: '匹配合适的内容模板',
        status: 'completed',
        duration: 4,
        startTime: '2024-01-16T15:00:03Z',
        endTime: '2024-01-16T15:00:07Z'
      },
      {
        id: '3-3',
        name: '内容生成',
        description: '使用AI生成文本内容',
        status: 'running',
        startTime: '2024-01-16T15:00:07Z'
      },
      {
        id: '3-4',
        name: '质量检查',
        description: '检查生成内容的质量',
        status: 'pending'
      },
      {
        id: '3-5',
        name: '内容优化',
        description: '优化和完善生成的内容',
        status: 'pending'
      }
    ]
  }
];

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.status === 'running') {
          const runningStepIndex = workflow.steps.findIndex(step => step.status === 'running');
          if (runningStepIndex !== -1) {
            const newSteps = [...workflow.steps];
            // 模拟步骤完成
            if (Math.random() > 0.7) {
              newSteps[runningStepIndex] = {
                ...newSteps[runningStepIndex],
                status: 'completed',
                endTime: new Date().toISOString(),
                duration: Math.floor(Math.random() * 10) + 1
              };
              
              // 启动下一步
              if (runningStepIndex + 1 < newSteps.length) {
                newSteps[runningStepIndex + 1] = {
                  ...newSteps[runningStepIndex + 1],
                  status: 'running',
                  startTime: new Date().toISOString()
                };
              } else {
                // 所有步骤完成
                return {
                  ...workflow,
                  status: 'completed',
                  steps: newSteps
                };
              }
            }
            
            return {
              ...workflow,
              steps: newSteps
            };
          }
        }
        return workflow;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleWorkflowStart = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const newSteps = workflow.steps.map((step, index) => ({
          ...step,
          status: index === 0 ? 'running' as const : 'pending' as const,
          startTime: index === 0 ? new Date().toISOString() : undefined,
          endTime: undefined,
          duration: undefined
        }));
        
        return {
          ...workflow,
          status: 'running' as const,
          lastRun: new Date().toISOString(),
          steps: newSteps
        };
      }
      return workflow;
    }));
  };

  const handleWorkflowStop = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const newSteps = workflow.steps.map(step => ({
          ...step,
          status: step.status === 'running' ? 'pending' : step.status
        }));
        
        return {
          ...workflow,
          status: 'stopped',
          steps: newSteps
        };
      }
      return workflow;
    }));
  };

  const handleWorkflowReset = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const newSteps = workflow.steps.map(step => ({
          ...step,
          status: 'pending' as const,
          startTime: undefined,
          endTime: undefined,
          duration: undefined
        }));
        
        return {
          ...workflow,
          status: 'stopped' as const,
          steps: newSteps
        };
      }
      return workflow;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            工作流管理
          </h1>
          <p className="text-gray-600">
            管理和监控自动化工作流程，提高工作效率
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 工作流列表 */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">工作流列表</h2>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div 
                    key={workflow.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedWorkflow?.id === workflow.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">步骤进度:</span>
                          <span className="text-sm font-medium">
                            {workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length}
                          </span>
                        </div>
                        {workflow.lastRun && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">上次运行:</span>
                            <span className="text-sm">
                              {new Date(workflow.lastRun).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {workflow.status === 'running' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWorkflowStop(workflow.id);
                            }}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            停止
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWorkflowStart(workflow.id);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            启动
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWorkflowReset(workflow.id);
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          重置
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 工作流详情 */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">工作流详情</h2>
              {selectedWorkflow ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{selectedWorkflow.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedWorkflow.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">状态:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedWorkflow.status)}`}>
                        {selectedWorkflow.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">执行步骤</h4>
                    <div className="space-y-3">
                      {selectedWorkflow.steps.map((step) => (
                        <div key={step.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-900">{step.name}</h5>
                              {step.duration && (
                                <span className="text-xs text-gray-500">{step.duration}s</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                            {step.status === 'running' && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">选择一个工作流查看详情</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}