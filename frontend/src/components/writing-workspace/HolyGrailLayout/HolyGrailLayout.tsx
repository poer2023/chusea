import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout-store';
import { useBreakpoint } from '@/lib/responsive/breakpoints';
import type { HolyGrailLayoutProps } from '@/types/layout';

export const HolyGrailLayout: React.FC<HolyGrailLayoutProps> = ({
  children,
  documentId,
  workflowId,
  className,
  theme = 'light'
}) => {
  const { state } = useLayoutStore();
  const breakpoint = useBreakpoint();
  
  const gridTemplateAreas = state.editorFocusMode 
    ? breakpoint === 'mobile' 
      ? '"topbar" "editor" "status"'
      : '"topbar topbar" "editor editor" "status status"'
    : breakpoint === 'mobile'
      ? '"topbar" "process" "editor" "status"'
      : '"topbar topbar topbar" "process process process" "editor editor chat" "status status status"';
  
  const gridTemplateColumns = state.editorFocusMode
    ? breakpoint === 'mobile' 
      ? '1fr'
      : '1fr 1fr'
    : breakpoint === 'mobile'
      ? '1fr'
      : `1fr 1fr ${state.chatPanelWidth}px`;
  
  const gridTemplateRows = state.editorFocusMode
    ? breakpoint === 'mobile'
      ? '56px 1fr 32px'
      : '56px 1fr 32px'
    : breakpoint === 'mobile'
      ? '56px 48px 1fr 32px'
      : '56px 48px 1fr 32px';

  return (
    <div
      className={cn(
        'holy-grail-layout',
        'h-screen w-screen overflow-hidden',
        'bg-background text-foreground',
        `theme-${theme}`,
        className
      )}
      style={{
        display: 'grid',
        gridTemplateAreas,
        gridTemplateColumns,
        gridTemplateRows,
        gap: 0,
      }}
      data-document-id={documentId}
      data-workflow-id={workflowId}
      data-breakpoint={breakpoint}
      data-focus-mode={state.editorFocusMode}
    >
      {children}
    </div>
  );
};

// Layout area components for easier usage
export const TopBarArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div 
    className={cn(
      'topbar-area',
      'bg-card border-b border-border',
      'flex items-center px-4 gap-4',
      'z-50',
      className
    )}
    style={{ gridArea: 'topbar' }}
  >
    {children}
  </div>
);

export const ProcessBarArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  const { state } = useLayoutStore();
  
  if (!state.isProcessBarVisible) return null;
  
  return (
    <div 
      className={cn(
        'process-bar-area',
        'bg-muted/30 border-b border-border',
        'flex items-center px-6 overflow-x-auto',
        'z-40',
        className
      )}
      style={{ gridArea: 'process' }}
    >
      {children}
    </div>
  );
};

export const MainEditorArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div 
    className={cn(
      'main-editor-area',
      'bg-card border-r border-border',
      'overflow-hidden relative',
      className
    )}
    style={{ gridArea: 'editor' }}
  >
    {children}
  </div>
);

export const ChatPanelArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  const { state } = useLayoutStore();
  const breakpoint = useBreakpoint();
  
  if (!state.isChatPanelExpanded && breakpoint !== 'mobile') return null;
  
  return (
    <div 
      className={cn(
        'chat-panel-area',
        'bg-muted/20',
        'overflow-hidden flex flex-col',
        // Mobile-specific styling
        breakpoint === 'mobile' && [
          'fixed bottom-20 right-4 w-80 h-96',
          'rounded-lg border border-border shadow-lg',
          'z-50',
          state.isChatPanelExpanded ? 'translate-y-0' : 'translate-y-full',
          'transition-transform duration-300 ease-out'
        ],
        className
      )}
      style={{ 
        gridArea: 'chat',
        width: breakpoint === 'mobile' ? undefined : state.chatPanelWidth
      }}
    >
      {children}
    </div>
  );
};

export const StatusBarArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div 
    className={cn(
      'status-bar-area',
      'bg-muted border-t border-border',
      'flex items-center justify-between px-4',
      'text-sm text-muted-foreground',
      'z-30',
      className
    )}
    style={{ gridArea: 'status' }}
  >
    {children}
  </div>
);