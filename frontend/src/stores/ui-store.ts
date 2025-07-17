/**
 * UI Store - User interface state management
 * Handles theme, layout, modals, notifications, and general UI state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './utils/persistence';
import { UIState, Toast, Modal, BreadcrumbItem } from '@/types';

// Extended UI state interface
export interface UIStoreState extends UIState {
  // Layout state
  sidebarCollapsed: boolean;
  headerHeight: number;
  footerHeight: number;
  contentPadding: number;
  
  // Navigation
  activeRoute: string;
  breadcrumbs: BreadcrumbItem[];
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Notifications
  notifications: Toast[];
  maxNotifications: number;
  
  // Modals and overlays
  activeModals: Modal[];
  maxModals: number;
  backdrop: boolean;
  
  // Responsive design
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // User preferences
  preferences: UIPreferences;
  
  // Actions
  // Theme management
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Layout management
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setContentPadding: (padding: number) => void;
  
  // Loading management
  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  clearAllLoading: () => void;
  
  // Toast notifications
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  
  // Modal management
  openModal: (modal: Omit<Modal, 'isOpen'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<Modal>) => void;
  
  // Navigation
  setActiveRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  
  // Screen size management
  setScreenSize: (size: ScreenSize) => void;
  updateScreenInfo: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
  resetPreferences: () => void;
  
  // Utils
  getLoadingState: (key: string) => boolean;
  hasActiveModals: () => boolean;
  getActiveModal: () => Modal | null;
}

export interface UIPreferences {
  animations: boolean;
  autoSave: boolean;
  showTooltips: boolean;
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
  keyboardShortcuts: boolean;
  autoHideSidebar: boolean;
  stickyHeader: boolean;
}

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Default preferences
const DEFAULT_PREFERENCES: UIPreferences = {
  animations: true,
  autoSave: true,
  showTooltips: true,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  soundEffects: false,
  keyboardShortcuts: true,
  autoHideSidebar: false,
  stickyHeader: true,
};

// Initial state
const initialState = {
  // Core UI state
  isLoading: false,
  theme: 'system' as const,
  sidebarOpen: true,
  toasts: [],
  modals: [],
  breadcrumb: [],
  
  // Extended state
  sidebarCollapsed: false,
  headerHeight: 64,
  footerHeight: 48,
  contentPadding: 24,
  activeRoute: '/',
  breadcrumbs: [],
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  maxNotifications: 5,
  activeModals: [],
  maxModals: 3,
  backdrop: false,
  screenSize: 'lg' as ScreenSize,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  preferences: DEFAULT_PREFERENCES,
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Screen size breakpoints (in pixels)
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Create the UI store
export const useUIStore = create<UIStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Theme management
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set({ theme });
          
          // Apply theme to document
          if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            
            if (theme === 'system') {
              const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              root.classList.toggle('dark', isDark);
            } else {
              root.classList.toggle('dark', theme === 'dark');
            }
          }
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
          get().setTheme(newTheme);
        },

        // Layout management
        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed });
        },

        setHeaderHeight: (height: number) => {
          set({ headerHeight: height });
        },

        setContentPadding: (padding: number) => {
          set({ contentPadding: padding });
        },

        // Loading management
        setGlobalLoading: (loading: boolean) => {
          set({ globalLoading: loading, isLoading: loading });
        },

        setLoading: (key: string, loading: boolean) => {
          set((state) => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading,
            },
          }));
        },

        clearAllLoading: () => {
          set({ loadingStates: {}, globalLoading: false, isLoading: false });
        },

        // Toast notifications
        addToast: (toastData: Omit<Toast, 'id'>) => {
          const id = generateId();
          const toast: Toast = {
            id,
            duration: 5000,
            ...toastData,
          };

          set((state) => {
            const newToasts = [toast, ...state.notifications];
            
            // Limit number of toasts
            if (newToasts.length > state.maxNotifications) {
              newToasts.splice(state.maxNotifications);
            }
            
            return {
              notifications: newToasts,
              toasts: newToasts, // Keep backward compatibility
            };
          });

          // Auto-remove toast after duration
          if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, toast.duration);
          }

          return id;
        },

        removeToast: (id: string) => {
          set((state) => ({
            notifications: state.notifications.filter((toast) => toast.id !== id),
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }));
        },

        clearAllToasts: () => {
          set({ notifications: [], toasts: [] });
        },

        updateToast: (id: string, updates: Partial<Toast>) => {
          set((state) => ({
            notifications: state.notifications.map((toast) =>
              toast.id === id ? { ...toast, ...updates } : toast
            ),
            toasts: state.toasts.map((toast) =>
              toast.id === id ? { ...toast, ...updates } : toast
            ),
          }));
        },

        // Modal management
        openModal: (modalData: Omit<Modal, 'isOpen'>) => {
          const id = modalData.id || generateId();
          const modal: Modal = {
            id,
            isOpen: true,
            closable: true,
            size: 'md',
            ...modalData,
          };

          set((state) => {
            const newModals = [...state.activeModals, modal];
            
            // Limit number of modals
            if (newModals.length > state.maxModals) {
              newModals.shift(); // Remove oldest modal
            }
            
            return {
              activeModals: newModals,
              modals: newModals, // Keep backward compatibility
              backdrop: newModals.length > 0,
            };
          });

          return id;
        },

        closeModal: (id: string) => {
          set((state) => {
            const newModals = state.activeModals.filter((modal) => modal.id !== id);
            return {
              activeModals: newModals,
              modals: newModals,
              backdrop: newModals.length > 0,
            };
          });
        },

        closeAllModals: () => {
          set((state) => ({
            activeModals: [],
            modals: {
              ...state.modals,
              modals: [],
              backdrop: false
            }
          }));
        },

        updateModal: (id: string, updates: Partial<Modal>) => {
          set((state) => ({
            activeModals: state.activeModals.map((modal) =>
              modal.id === id ? { ...modal, ...updates } : modal
            ),
            modals: {
              ...state.modals,
              modals: state.modals.modals.map((modal) =>
                modal.id === id ? { ...modal, ...updates } : modal
              )
            }
          }));
        },

        // Navigation
        setActiveRoute: (route: string) => {
          set({ activeRoute: route });
        },

        setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {
          set({ breadcrumbs });
        },

        addBreadcrumb: (breadcrumb: BreadcrumbItem) => {
          set((state) => {
            const newBreadcrumbs = [...state.breadcrumbs, breadcrumb];
            return { 
              breadcrumbs: newBreadcrumbs,
            };
          });
        },

        // Screen size management
        setScreenSize: (size: ScreenSize) => {
          const isMobile = ['xs', 'sm'].includes(size);
          const isTablet = size === 'md';
          const isDesktop = ['lg', 'xl', '2xl'].includes(size);

          set({
            screenSize: size,
            isMobile,
            isTablet,
            isDesktop,
          });

          // Auto-collapse sidebar on mobile
          if (isMobile && get().preferences.autoHideSidebar) {
            get().setSidebarCollapsed(true);
          }
        },

        updateScreenInfo: () => {
          if (typeof window === 'undefined') return;

          const width = window.innerWidth;
          let size: ScreenSize = 'xs';

          for (const [breakpoint, minWidth] of Object.entries(BREAKPOINTS)) {
            if (width >= minWidth) {
              size = breakpoint as ScreenSize;
            }
          }

          get().setScreenSize(size);
        },

        // Preferences
        updatePreferences: (preferenceUpdates: Partial<UIPreferences>) => {
          set((state) => ({
            preferences: { ...state.preferences, ...preferenceUpdates },
          }));

          // Apply preference-based changes
          if (preferenceUpdates.reducedMotion !== undefined) {
            if (typeof window !== 'undefined') {
              document.documentElement.style.setProperty(
                '--animation-duration',
                preferenceUpdates.reducedMotion ? '0s' : '0.2s'
              );
            }
          }
        },

        resetPreferences: () => {
          set({ preferences: DEFAULT_PREFERENCES });
        },

        // Utility functions
        getLoadingState: (key: string) => {
          return get().loadingStates[key] || false;
        },

        hasActiveModals: () => {
          return get().activeModals.length > 0;
        },

        getActiveModal: () => {
          const modals = get().activeModals;
          return modals.length > 0 ? modals[modals.length - 1] : null;
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed,
          headerHeight: state.headerHeight,
          contentPadding: state.contentPadding,
          preferences: state.preferences,
        }),
        onRehydrateStorage: (state) => {
          // Apply theme on rehydration
          if (state.setTheme) {
            state.setTheme(state.theme);
          }
          
          // Update screen info
          if (typeof window !== 'undefined' && state.updateScreenInfo) {
            state.updateScreenInfo();
            
            // Listen for screen size changes
            const handleResize = () => state.updateScreenInfo && state.updateScreenInfo();
            window.addEventListener('resize', handleResize);
            
            // Listen for theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleThemeChange = () => {
              if (state.theme === 'system' && state.setTheme) {
                state.setTheme('system');
              }
            };
            mediaQuery.addEventListener('change', handleThemeChange);
          }
        },
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors for common use cases
export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
}));

export const useLayout = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  sidebarCollapsed: state.sidebarCollapsed,
  headerHeight: state.headerHeight,
  contentPadding: state.contentPadding,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
}));

export const useLoading = () => useUIStore((state) => ({
  isLoading: state.isLoading,
  globalLoading: state.globalLoading,
  setGlobalLoading: state.setGlobalLoading,
  setLoading: state.setLoading,
  getLoadingState: state.getLoadingState,
  clearAllLoading: state.clearAllLoading,
}));

export const useToasts = () => useUIStore((state) => ({
  toasts: state.notifications,
  addToast: state.addToast,
  removeToast: state.removeToast,
  clearAllToasts: state.clearAllToasts,
  updateToast: state.updateToast,
}));

export const useModals = () => useUIStore((state) => ({
  modals: state.activeModals,
  backdrop: state.backdrop,
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  updateModal: state.updateModal,
  hasActiveModals: state.hasActiveModals(),
  getActiveModal: state.getActiveModal(),
}));

export const useNavigation = () => useUIStore((state) => ({
  activeRoute: state.activeRoute,
  breadcrumbs: state.breadcrumbs,
  setActiveRoute: state.setActiveRoute,
  setBreadcrumbs: state.setBreadcrumbs,
  addBreadcrumb: state.addBreadcrumb,
}));

export const useScreenInfo = () => useUIStore((state) => ({
  screenSize: state.screenSize,
  isMobile: state.isMobile,
  isTablet: state.isTablet,
  isDesktop: state.isDesktop,
  updateScreenInfo: state.updateScreenInfo,
}));

export const useUIPreferences = () => useUIStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences,
  resetPreferences: state.resetPreferences,
}));