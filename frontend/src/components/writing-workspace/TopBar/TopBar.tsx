import { useState } from 'react';
import { Play, History, Download, Settings, Edit2, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/stores/layout-store';
import { cn } from '@/lib/utils';
import type { DocumentMetadata, WorkflowMetadata } from '@/types/layout';

interface TopBarProps {
  document?: DocumentMetadata;
  workflow?: WorkflowMetadata;
  onDocumentTitleChange?: (title: string) => void;
  onRunWorkflow?: () => void;
  onViewHistory?: () => void;
  onExportDocument?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  document,
  workflow,
  onDocumentTitleChange,
  onRunWorkflow,
  onViewHistory,
  onExportDocument,
  onOpenSettings,
  className
}) => {
  const { state, actions } = useLayoutStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(document?.title || '');

  const handleTitleSubmit = () => {
    if (onDocumentTitleChange && tempTitle.trim()) {
      onDocumentTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(document?.title || '');
      setIsEditingTitle(false);
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('topbar', 'h-full', className)}>
      {/* Left Section - Document Info */}
      <div className="flex items-center gap-4 flex-1">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Writing Workspace</span>
        </div>

        {/* Document Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="h-8 w-64 text-sm"
              placeholder="Enter document title..."
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {document?.title || 'Untitled Document'}
              </span>
            </button>
          )}
          
          {/* Document Status */}
          {document && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {document.wordCount} words
              </Badge>
              {document.isAutoSaving && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save className="w-3 h-3" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Workflow Controls */}
      <div className="flex items-center gap-3">
        {workflow && (
          <>
            <Button
              onClick={onRunWorkflow}
              disabled={!workflow.canRun || workflow.isRunning}
              size="sm"
              variant={workflow.isRunning ? "outline" : "default"}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {workflow.isRunning ? 'Running...' : 'Run'}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                getWorkflowStatusColor(workflow.status)
              )} />
              <span className="text-sm text-muted-foreground">
                {workflow.currentStep}
              </span>
              <Badge variant="secondary" className="text-xs">
                {Math.round(workflow.progress)}%
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onViewHistory}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
        
        <Button
          onClick={onExportDocument}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        
        <Button
          onClick={() => actions.setEditorFocusMode(!state.editorFocusMode)}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          {state.editorFocusMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {state.editorFocusMode ? 'Exit Focus' : 'Focus Mode'}
          </span>
        </Button>
        
        <Button
          onClick={onOpenSettings}
          size="sm"
          variant="ghost"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};