import { createStore } from '@xstate/store';
import type { LayoutState } from '@/types/layout';

const initialState: LayoutState = {
  isChatPanelExpanded: true,
  isEditorSidebarOpen: false,
  isProcessBarVisible: true,
  currentBreakpoint: 'desktop',
  editorFocusMode: false,
  chatPanelWidth: 320,
  editorSidebarWidth: 280,
};

export const layoutStore = createStore(
  initialState,
  {
    toggleChatPanel: (context) => ({
      ...context,
      isChatPanelExpanded: !context.isChatPanelExpanded,
    }),
    
    toggleEditorSidebar: (context) => ({
      ...context,
      isEditorSidebarOpen: !context.isEditorSidebarOpen,
    }),
    
    toggleProcessBar: (context) => ({
      ...context,
      isProcessBarVisible: !context.isProcessBarVisible,
    }),
    
    setEditorFocusMode: (context, enabled: boolean) => ({
      ...context,
      editorFocusMode: enabled,
      isChatPanelExpanded: enabled ? false : context.isChatPanelExpanded,
      isEditorSidebarOpen: enabled ? false : context.isEditorSidebarOpen,
    }),
    
    setChatPanelWidth: (context, width: number) => ({
      ...context,
      chatPanelWidth: Math.max(280, Math.min(600, width)),
    }),
    
    setEditorSidebarWidth: (context, width: number) => ({
      ...context,
      editorSidebarWidth: Math.max(240, Math.min(400, width)),
    }),
    
    updateBreakpoint: (context, breakpoint: 'mobile' | 'tablet' | 'desktop') => ({
      ...context,
      currentBreakpoint: breakpoint,
      // Auto-adjust panels based on breakpoint
      isChatPanelExpanded: breakpoint === 'mobile' ? false : context.isChatPanelExpanded,
      isEditorSidebarOpen: breakpoint === 'mobile' ? false : context.isEditorSidebarOpen,
    }),
    
    updateLayout: (context, updates: Partial<LayoutState>) => ({
      ...context,
      ...updates,
    }),
    
    resetLayout: () => initialState,
  }
);

// Hook for React components
export const useLayoutStore = () => {
  const state = layoutStore.useSelector((state) => state);
  const send = layoutStore.send;
  
  return {
    state,
    actions: {
      toggleChatPanel: () => send({ type: 'toggleChatPanel' }),
      toggleEditorSidebar: () => send({ type: 'toggleEditorSidebar' }),
      toggleProcessBar: () => send({ type: 'toggleProcessBar' }),
      setEditorFocusMode: (enabled: boolean) => send({ type: 'setEditorFocusMode', enabled }),
      setChatPanelWidth: (width: number) => send({ type: 'setChatPanelWidth', width }),
      setEditorSidebarWidth: (width: number) => send({ type: 'setEditorSidebarWidth', width }),
      updateBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => 
        send({ type: 'updateBreakpoint', breakpoint }),
      updateLayout: (updates: Partial<LayoutState>) => send({ type: 'updateLayout', updates }),
      resetLayout: () => send({ type: 'resetLayout' }),
    }
  };
};