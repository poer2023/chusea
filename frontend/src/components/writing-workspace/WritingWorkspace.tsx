'use client';

import { useState, useEffect } from 'react';
import {
  HolyGrailLayout,
  TopBarArea,
  ProcessBarArea,
  MainEditorArea,
  ChatPanelArea,
  StatusBarArea,
  TopBar,
  ProcessBar,
  MainEditor,
  ChatPanel
} from '@/components/writing-workspace';
import { useLayoutStore } from '@/stores/layout-store';
import { 
  useWorkflow, 
  useWorkflowActions, 
  useWorkflowSteps, 
  useWorkflowQuality, 
  useWorkflowAI,
  useWorkflowPersistence
} from '@/stores/workflow-store';
import type { DocumentMetadata, WorkflowMetadata, WorkflowStep } from '@/types/layout';

interface WritingWorkspaceProps {
  documentId?: string;
  initialContent?: string;
  className?: string;
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({
  documentId,
  initialContent = '',
  className
}) => {
  const { state } = useLayoutStore();
  const [content, setContent] = useState(initialContent);
  const [selectedText, setSelectedText] = useState<{ from: number; to: number; text: string } | null>(null);
  
  // Workflow state
  const { 
    currentWorkflow, 
    isActive, 
    isLoading, 
    error, 
    currentStep, 
    stepProgress, 
    overallProgress, 
    workflowStatus 
  } = useWorkflow();
  
  const { 
    initializeWorkflow, 
    startWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    cancelWorkflow 
  } = useWorkflowActions();
  
  const {
    stepResults,
    stepErrors,
    nextStep,
    previousStep,
    goToStep,
    completeCurrentStep,
    skipCurrentStep,
    retryCurrentStep,
    canGoToNextStep,
    canGoToPreviousStep,
    canSkipStep,
    canRetry,
    retryCount,
    maxRetries
  } = useWorkflowSteps();
  
  const { 
    qualityMetrics, 
    checkStepQuality, 
    overrideQualityCheck 
  } = useWorkflowQuality();
  
  const { 
    isAIProcessing, 
    aiError, 
    generateWithAI, 
    regenerateCurrentStep 
  } = useWorkflowAI();
  
  const { 
    lastSavedAt, 
    autoSaveEnabled, 
    saveCheckpoint 
  } = useWorkflowPersistence();
  
  // Document metadata
  const [document] = useState<DocumentMetadata>({
    id: documentId || 'doc-1',
    title: 'AI Writing Assistant Demo',
    lastModified: new Date(),
    wordCount: content.split(' ').filter(word => word.length > 0).length,
    status: 'draft',
    isAutoSaving: false
  });

  // Workflow metadata
  const workflowMetadata: WorkflowMetadata = {
    id: currentWorkflow?.id || 'workflow-1',
    name: 'Academic Writing',
    currentStep: currentStep,
    progress: overallProgress,
    status: workflowStatus,
    canRun: !isActive,
    isRunning: isActive
  };

  // Initialize workflow on mount
  useEffect(() => {
    initializeWorkflow({
      autoAdvance: false,
      qualityLevel: 'standard',
      writingStyle: 'academic',
      targetLength: 'medium',
      includeCitations: true,
      enableAutoSave: true,
    });
  }, [initializeWorkflow]);

  // Update word count when content changes
  useEffect(() => {
    document.wordCount = content.split(' ').filter(word => word.length > 0).length;
  }, [content, document]);

  // Auto-save content
  useEffect(() => {
    if (autoSaveEnabled && isActive) {
      const autoSaveInterval = setInterval(() => {
        saveCheckpoint();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [autoSaveEnabled, isActive, saveCheckpoint]);

  const handleDocumentTitleChange = (title: string) => {
    document.title = title;
    console.log('Document title changed:', title);
  };

  const handleRunWorkflow = async () => {
    try {
      await startWorkflow(document.id, {
        writingStyle: 'academic',
        targetLength: 'medium',
        includeCitations: true,
        autoAdvance: false,
      });
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const handlePauseWorkflow = () => {
    if (isActive) {
      pauseWorkflow();
    } else {
      resumeWorkflow();
    }
  };

  const handleStopWorkflow = () => {
    cancelWorkflow();
  };

  const handleViewHistory = () => {
    console.log('Viewing document history...');
  };

  const handleExportDocument = () => {
    console.log('Exporting document...');
  };

  const handleOpenSettings = () => {
    console.log('Opening settings...');
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (isActive && !isAIProcessing) {
      goToStep(step);
    }
  };

  const handlePlayPause = () => {
    handlePauseWorkflow();
  };

  const handleSkipStep = () => {
    skipCurrentStep();
  };

  const handleRetryStep = () => {
    retryCurrentStep();
  };

  const handleStepSettings = (step: WorkflowStep) => {
    console.log('Opening step settings:', step);
  };

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    
    // If workflow is active, update step data
    if (isActive && currentStep !== 'idle') {
      // This would normally update the workflow step data
      // For now, we'll just log it
      console.log('Content updated during workflow:', currentStep);
    }
  };

  const handleTextInsert = (text: string) => {
    if (selectedText) {
      // Insert at cursor position
      const newContent = content.slice(0, selectedText.from) + text + content.slice(selectedText.from);
      setContent(newContent);
    } else {
      // Append to end
      setContent(prev => prev + text);
    }
  };

  const handleTextReplace = (oldText: string, newText: string) => {
    if (selectedText && selectedText.text === oldText) {
      const newContent = content.slice(0, selectedText.from) + newText + content.slice(selectedText.to);
      setContent(newContent);
      // Clear selection after replacement
      setSelectedText(null);
    }
  };

  const handleSelectionChange = (selection: { from: number; to: number; text: string }) => {
    setSelectedText(selection);
  };

  const handleMessageSend = (message: string) => {
    console.log('Message sent:', message);
  };

  const handleCommandExecute = async (command: string, args: string[]) => {
    console.log('Command executed:', command, args);
    
    if (selectedText && selectedText.text) {
      switch (command) {
        case 'rewrite':
          try {
            const prompt = `Rewrite this text to improve clarity and style: "${selectedText.text}"`;
            const response = await generateWithAI(prompt);
            handleTextReplace(selectedText.text, response);
          } catch (error) {
            console.error('Failed to rewrite text:', error);
          }
          break;
        case 'expand':
          try {
            const prompt = `Expand this text with more details and examples: "${selectedText.text}"`;
            const response = await generateWithAI(prompt);
            handleTextReplace(selectedText.text, response);
          } catch (error) {
            console.error('Failed to expand text:', error);
          }
          break;
        case 'cite':
          console.log('Adding citation for:', selectedText.text);
          break;
        case 'summarize':
          try {
            const prompt = `Summarize this text concisely: "${selectedText.text}"`;
            const response = await generateWithAI(prompt);
            handleTextReplace(selectedText.text, response);
          } catch (error) {
            console.error('Failed to summarize text:', error);
          }
          break;
        case 'translate':
          const language = args[0] || 'Spanish';
          try {
            const prompt = `Translate this text to ${language}: "${selectedText.text}"`;
            const response = await generateWithAI(prompt);
            handleTextReplace(selectedText.text, response);
          } catch (error) {
            console.error('Failed to translate text:', error);
          }
          break;
        default:
          console.log('Unknown command:', command);
      }
    }
  };

  // Handle workflow step completion
  const handleStepComplete = async (stepData?: any) => {
    try {
      await completeCurrentStep(stepData || { content });
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  // Handle quality override
  const handleQualityOverride = () => {
    overrideQualityCheck();
  };

  return (
    <HolyGrailLayout
      documentId={documentId}
      workflowId={workflowMetadata.id}
      className={className}
    >
      <TopBarArea>
        <TopBar
          document={document}
          workflow={workflowMetadata}
          onDocumentTitleChange={handleDocumentTitleChange}
          onRunWorkflow={handleRunWorkflow}
          onViewHistory={handleViewHistory}
          onExportDocument={handleExportDocument}
          onOpenSettings={handleOpenSettings}
        />
      </TopBarArea>

      <ProcessBarArea>
        <ProcessBar
          currentStep={currentStep}
          stepProgress={stepProgress}
          overallProgress={overallProgress}
          isProcessing={isAIProcessing}
          workflowStatus={workflowStatus}
          qualityMetrics={qualityMetrics}
          stepResults={stepResults}
          stepErrors={stepErrors}
          canSkipStep={canSkipStep}
          canRetry={canRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onStepClick={handleStepClick}
          onPlayPause={handlePlayPause}
          onSkipStep={handleSkipStep}
          onRetryStep={handleRetryStep}
          onStepSettings={handleStepSettings}
          showQualityMetrics={true}
          showDetailedProgress={true}
          showStepControls={true}
        />
      </ProcessBarArea>

      <MainEditorArea>
        <MainEditor
          content={content}
          onChange={handleEditorChange}
          onSelectionChange={handleSelectionChange}
          placeholder="Start writing your document here..."
        />
      </MainEditorArea>

      <ChatPanelArea>
        <ChatPanel
          onMessageSend={handleMessageSend}
          onCommandExecute={handleCommandExecute}
          onTextInsert={handleTextInsert}
          onTextReplace={handleTextReplace}
          selectedText={selectedText?.text}
          fullText={content}
          cursorPosition={selectedText?.from || 0}
          documentId={documentId}
          workflowId={workflowMetadata.id}
          // workflowStep={currentStep}
          // isWorkflowActive={isActive}
          // isAIProcessing={isAIProcessing}
        />
      </ChatPanelArea>

      <StatusBarArea>
        <div className="flex items-center gap-4">
          <span>Words: {document.wordCount}</span>
          <span>Status: {document.status}</span>
          <span>Last saved: {lastSavedAt ? lastSavedAt.toLocaleTimeString() : 'Not saved'}</span>
          {isActive && (
            <span className="text-blue-600">
              Workflow: {workflowStatus} ({currentStep})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Breakpoint: {state.currentBreakpoint}</span>
          {state.editorFocusMode && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Focus Mode
            </span>
          )}
          {autoSaveEnabled && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Auto-save
            </span>
          )}
          {error && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Error: {error}
            </span>
          )}
        </div>
      </StatusBarArea>
    </HolyGrailLayout>
  );
};