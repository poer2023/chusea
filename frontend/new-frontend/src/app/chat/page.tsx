'use client';

/**
 * Chat Demo Page - Showcase AI Chat Interface
 * Demonstrates the complete chat system with all features
 */

import React, { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { AIChatInterface } from '@/components/ai-chat-interface';
import { ChatLayout } from '@/components/chat/chat-layout';
import { WorkflowIntegration } from '@/components/chat/workflow-integration';
import { DocumentCollaboration } from '@/components/chat/document-collaboration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  MessageSquare,
  Workflow,
  FileText,
  Settings,
  HelpCircle,
  Smartphone,
  Monitor,
} from 'lucide-react';

const ChatDemoPage: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'general' | 'workflow' | 'document'>('general');
  const [layoutMode, setLayoutMode] = useState<'responsive' | 'classic'>('responsive');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getDemoConfig = () => {
    switch (demoMode) {
      case 'workflow':
        return {
          workflowId: 'demo-workflow-123',
          documentId: undefined,
          enableWorkflows: true,
          enableDocuments: false,
        };
      case 'document':
        return {
          workflowId: undefined,
          documentId: 'demo-document-456',
          enableWorkflows: false,
          enableDocuments: true,
        };
      default:
        return {
          workflowId: undefined,
          documentId: undefined,
          enableWorkflows: true,
          enableDocuments: true,
        };
    }
  };

  const config = getDemoConfig();

  return (
    <AppLayout showNavbar={true} showFooter={false}>
      {/* Demo Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                ChUseA AI 聊天界面
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                演示版
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Demo Mode Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">模式:</span>
                  <div className="flex space-x-1">
                    {[
                      { mode: 'general', label: '通用', icon: MessageSquare },
                      { mode: 'workflow', label: '工作流', icon: Workflow },
                      { mode: 'document', label: '文档', icon: FileText },
                    ].map(({ mode, label, icon: Icon }) => (
                      <Button
                        key={mode}
                        variant={demoMode === mode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setDemoMode(mode as any)}
                        className="h-8"
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Layout Mode Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">布局:</span>
                  <div className="flex space-x-1">
                    <Button
                      variant={layoutMode === 'responsive' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLayoutMode('responsive')}
                      className="h-8"
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      响应式
                    </Button>
                    <Button
                      variant={layoutMode === 'classic' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLayoutMode('classic')}
                      className="h-8"
                    >
                      <Monitor className="w-3 h-3 mr-1" />
                      经典
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">当前演示:</span>
                <span>
                  {demoMode === 'general' && '通用 AI 助手 - 完整功能集，支持命令和工作流'}
                  {demoMode === 'workflow' && '工作流助手 - 专注于工作流管理和执行'}
                  {demoMode === 'document' && '文档助手 - 专注于文档分析和协作'}
                </span>
                <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-600">
                  {layoutMode === 'responsive' ? '移动优化' : '桌面版'}
                </Badge>
              </div>
            </div>
            
            <div className="text-xs text-blue-600 dark:text-blue-300">
              输入 "/help" 查看可用命令
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
        <div className="h-full p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {layoutMode === 'responsive' ? (
                <AIChatInterface className="h-full shadow-lg" />
              ) : (
                <ChatLayout
                  {...config}
                  defaultSidebarOpen={sidebarOpen}
                  showHeader={true}
                  className="h-full rounded-lg shadow-sm border"
                  customHeader={
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          {demoMode === 'workflow' && <Workflow className="w-4 h-4" />}
                          {demoMode === 'document' && <FileText className="w-4 h-4" />}
                          {demoMode === 'general' && <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div>
                          <h2 className="font-semibold">
                            {demoMode === 'workflow' && '工作流助手'}
                            {demoMode === 'document' && '文档助手'}
                            {demoMode === 'general' && 'AI 助手'}
                          </h2>
                          <div className="text-sm opacity-90">
                            由 ChUseA AI 引擎驱动
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                          演示模式
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  }
                />
              )}
            </div>
            
            {/* Integration Panels */}
            <div className="lg:col-span-1 space-y-4 hidden lg:block">
              {/* Workflow Integration */}
              {(demoMode === 'workflow' || demoMode === 'general') && (
                <WorkflowIntegration
                  workflowId={config.workflowId}
                  className="bg-white dark:bg-slate-900"
                />
              )}
              
              {/* Document Collaboration */}
              {(demoMode === 'document' || demoMode === 'general') && (
                <DocumentCollaboration
                  documentId={config.documentId}
                  className="bg-white dark:bg-slate-900"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features Info */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-300">实时 WebSocket 消息</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-300">斜杠命令支持 (/help, /workflow, /clear)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-300">工作流集成和文档协作</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-300">
                {layoutMode === 'responsive' ? '移动优化响应式设计' : '经典桌面布局'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatDemoPage;