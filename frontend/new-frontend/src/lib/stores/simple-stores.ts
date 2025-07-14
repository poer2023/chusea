// Simplified stores without complex type issues
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Document, WritingWorkflow, WorkflowStep } from '../../types';

// Simple User Store
interface SimpleUserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useSimpleUserStore = create<SimpleUserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      login: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock login
          const mockUser: User = {
            id: '1',
            email,
            name: email.split('@')[0],
            preferences: {
              language: 'en',
              theme: 'system',
              defaultWritingStyle: 'professional',
              autoSave: true,
              notifications: { email: true, push: false, marketing: false },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch {
          set({ error: 'Login failed', isLoading: false });
        }
      },
      
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'chusea-user' }
  )
);

// Simple Document Store
interface SimpleDocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  createDocument: (title: string, content?: string) => Document;
  setCurrentDocument: (doc: Document | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
}

export const useSimpleDocumentStore = create<SimpleDocumentState>()(
  persist(
    (set) => ({
      documents: [],
      currentDocument: null,
      isLoading: false,
      error: null,
      
      createDocument: (title: string, content = '') => {
        const newDoc: Document = {
          id: `doc_${Date.now()}`,
          title,
          content,
          metadata: {
            wordCount: content.split(/\s+/).filter(Boolean).length,
            readingTime: Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
            language: 'en',
          },
          status: 'draft',
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'current-user',
        };
        
        set((state) => ({
          documents: [newDoc, ...state.documents],
          currentDocument: newDoc,
        }));
        
        return newDoc;
      },
      
      setCurrentDocument: (doc) => set({ currentDocument: doc }),
      
      updateDocument: (id: string, updates: Partial<Document>) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
          ),
          currentDocument:
            state.currentDocument?.id === id
              ? { ...state.currentDocument, ...updates, updatedAt: new Date().toISOString() }
              : state.currentDocument,
        }));
      },
      
      deleteDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        }));
      },
    }),
    { name: 'chusea-documents' }
  )
);

// Simple Workflow Store
interface SimpleWorkflowState {
  activeWorkflow: WritingWorkflow | null;
  isLoading: boolean;
  error: string | null;
  startWorkflow: (documentId: string) => Promise<void>;
  completeStep: (step: WorkflowStep) => void;
  cancelWorkflow: () => void;
}

export const useSimpleWorkflowStore = create<SimpleWorkflowState>((set) => ({
  activeWorkflow: null,
  isLoading: false,
  error: null,
  
  startWorkflow: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const newWorkflow: WritingWorkflow = {
        id: `workflow_${Date.now()}`,
        documentId,
        currentStep: 'planning',
        steps: [
          { step: 'planning', status: 'in_progress', data: {} },
          { step: 'research', status: 'pending', data: {} },
          { step: 'outlining', status: 'pending', data: {} },
          { step: 'writing', status: 'pending', data: {} },
          { step: 'editing', status: 'pending', data: {} },
          { step: 'review', status: 'pending', data: {} },
        ],
        progress: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({ activeWorkflow: newWorkflow, isLoading: false });
    } catch {
      set({ error: 'Failed to start workflow', isLoading: false });
    }
  },
  
  completeStep: (step: WorkflowStep) => {
    set((state) => {
      if (!state.activeWorkflow) return state;
      
      const stepIndex = state.activeWorkflow.steps.findIndex((s) => s.step === step);
      if (stepIndex === -1) return state;
      
      const updatedSteps = [...state.activeWorkflow.steps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'completed' };
      
      // Move to next step
      if (stepIndex + 1 < updatedSteps.length) {
        updatedSteps[stepIndex + 1] = { ...updatedSteps[stepIndex + 1], status: 'in_progress' };
      }
      
      const completedSteps = updatedSteps.filter((s) => s.status === 'completed').length;
      const progress = (completedSteps / updatedSteps.length) * 100;
      
      return {
        activeWorkflow: {
          ...state.activeWorkflow,
          steps: updatedSteps,
          currentStep: stepIndex + 1 < updatedSteps.length ? updatedSteps[stepIndex + 1].step : step,
          progress,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },
  
  cancelWorkflow: () => set({ activeWorkflow: null }),
}));

// Simple UI Store
interface SimpleUIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  toasts: Array<{ id: string; type: string; title: string; description?: string }>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  addToast: (toast: { type: string; title: string; description?: string }) => void;
  removeToast: (id: string) => void;
}

export const useSimpleUIStore = create<SimpleUIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      toasts: [],
      
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      addToast: (toast) => {
        const id = `toast_${Date.now()}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 5000);
      },
      
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    { name: 'chusea-ui' }
  )
);

// Convenience hooks
export const useSimpleToast = () => {
  const addToast = useSimpleUIStore((state) => state.addToast);
  
  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, ...(description && { description }) }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, ...(description && { description }) }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, ...(description && { description }) }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, ...(description && { description }) }),
  };
};