// UI state and component types for ChUseA

import { ReactNode } from 'react';

// Global UI state
export interface UIState {
  theme: ThemeState;
  layout: LayoutState;
  navigation: NavigationState;
  notifications: NotificationState;
  modals: ModalState;
  loading: LoadingState;
  errors: ErrorState;
  forms: FormState;
  responsive: ResponsiveState;
  accessibility: AccessibilityState;
  preferences: UIPreferences;
}

// Theme configuration
export interface ThemeState {
  mode: ThemeMode;
  scheme: ColorScheme;
  customColors?: CustomColors;
  fontSize: FontSize;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  spacing: SpacingScale;
  shadows: ShadowScale;
  animations: AnimationSettings;
}

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

export interface ColorScheme {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SemanticColors {
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
}

export interface CustomColors {
  [key: string]: string | ColorPalette;
}

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'custom';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SpacingScale = 'compact' | 'comfortable' | 'spacious';
export type ShadowScale = 'none' | 'subtle' | 'moderate' | 'prominent';

export interface AnimationSettings {
  enabled: boolean;
  duration: 'fast' | 'normal' | 'slow';
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  reducedMotion: boolean;
}

// Layout state
export interface LayoutState {
  sidebar: SidebarState;
  header: HeaderState;
  footer: FooterState;
  main: MainContentState;
  panels: PanelState;
  workspace: WorkspaceState;
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  position: 'left' | 'right';
  variant: 'default' | 'mini' | 'floating' | 'overlay';
  pinned: boolean;
  autoHide: boolean;
}

export interface HeaderState {
  height: number;
  variant: 'default' | 'compact' | 'prominent';
  transparent: boolean;
  sticky: boolean;
  showLogo: boolean;
  showSearch: boolean;
  showUserMenu: boolean;
}

export interface FooterState {
  visible: boolean;
  height: number;
  variant: 'default' | 'minimal' | 'detailed';
  sticky: boolean;
}

export interface MainContentState {
  padding: SpacingScale;
  maxWidth: string;
  centered: boolean;
  fullHeight: boolean;
}

export interface PanelState {
  [panelId: string]: {
    isOpen: boolean;
    width?: number;
    height?: number;
    position: 'top' | 'right' | 'bottom' | 'left';
    resizable: boolean;
    collapsible: boolean;
    dismissible: boolean;
  };
}

export interface WorkspaceState {
  layout: 'single' | 'split' | 'grid' | 'tabbed';
  activeTab?: string;
  tabs: WorkspaceTab[];
  splitOrientation: 'horizontal' | 'vertical';
  gridColumns: number;
  gridRows: number;
}

export interface WorkspaceTab {
  id: string;
  title: string;
  icon?: string;
  closable: boolean;
  active: boolean;
  modified: boolean;
  url: string;
}

// Navigation state
export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  history: NavigationHistory;
  menu: MenuState;
  quickActions: QuickAction[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
  isClickable?: boolean;
}

export interface NavigationHistory {
  back: boolean;
  forward: boolean;
  entries: HistoryEntry[];
  currentIndex: number;
}

export interface HistoryEntry {
  path: string;
  title: string;
  timestamp: string;
}

export interface MenuState {
  activeItem?: string;
  expandedItems: string[];
  collapsedGroups: string[];
  searchQuery?: string;
  filteredItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string | number;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
  divider?: boolean;
  group?: string;
  keywords?: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category?: string;
  priority: number;
}

// Notification system
export interface NotificationState {
  notifications: Notification[];
  position: NotificationPosition;
  maxVisible: number;
  autoHideDelay: number;
  grouping: boolean;
  sound: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  avatar?: string;
  timestamp: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  progress?: number;
  category?: string;
  priority: NotificationPriority;
  read: boolean;
  dismissed: boolean;
  groupId?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'update'
  | 'mention'
  | 'system';

export type NotificationPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'default' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Modal system
export interface ModalState {
  modals: Modal[];
  backdrop: ModalBackdrop;
  animation: ModalAnimation;
  stacking: boolean;
  maxStack: number;
}

export interface Modal {
  id: string;
  title?: string;
  content: ReactNode | string;
  component?: string;
  props?: Record<string, any>;
  size: ModalSize;
  variant: ModalVariant;
  position: ModalPosition;
  backdrop: boolean;
  closable: boolean;
  keyboard: boolean;
  autoFocus: boolean;
  returnFocus: boolean;
  zIndex: number;
  onClose?: () => void;
  onOpen?: () => void;
  onEscape?: () => void;
  animation?: ModalAnimation;
  metadata?: Record<string, any>;
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
export type ModalVariant = 'default' | 'drawer' | 'bottomSheet' | 'fullscreen' | 'popup';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface ModalBackdrop {
  visible: boolean;
  blur: boolean;
  color: string;
  opacity: number;
}

export interface ModalAnimation {
  enter: string;
  exit: string;
  duration: number;
}

// Loading states
export interface LoadingState {
  global: boolean;
  components: ComponentLoadingState;
  requests: RequestLoadingState;
  overlay: LoadingOverlay;
}

export interface ComponentLoadingState {
  [componentId: string]: {
    loading: boolean;
    progress?: number;
    message?: string;
    type: LoadingType;
  };
}

export interface RequestLoadingState {
  [requestId: string]: {
    loading: boolean;
    progress?: number;
    cancelled?: boolean;
    retry?: number;
  };
}

export interface LoadingOverlay {
  visible: boolean;
  message?: string;
  progress?: number;
  cancellable: boolean;
  backdrop: boolean;
}

export type LoadingType = 
  | 'spinner'
  | 'progress'
  | 'skeleton'
  | 'pulse'
  | 'shimmer'
  | 'dots';

// Error handling
export interface ErrorState {
  errors: UIError[];
  boundaries: ErrorBoundaryState;
  fallbacks: ErrorFallbackState;
  reporting: ErrorReporting;
}

export interface UIError {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  code?: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  dismissed: boolean;
  reportable: boolean;
  context?: Record<string, any>;
  actions?: ErrorAction[];
}

export type ErrorType = 
  | 'validation'
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'client'
  | 'boundary'
  | 'chunk_load'
  | 'timeout';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorAction {
  label: string;
  action: () => void;
  style?: 'default' | 'primary' | 'secondary' | 'danger';
}

export interface ErrorBoundaryState {
  [boundaryId: string]: {
    hasError: boolean;
    error?: Error;
    errorInfo?: any;
    retryCount: number;
    fallbackComponent?: string;
  };
}

export interface ErrorFallbackState {
  [componentType: string]: {
    component: ReactNode;
    message?: string;
    retryable: boolean;
  };
}

export interface ErrorReporting {
  enabled: boolean;
  endpoint?: string;
  includeUserAgent: boolean;
  includeUrl: boolean;
  includeUserData: boolean;
  sampling: number;
}

// Form state management
export interface FormState {
  forms: FormInstance[];
  validation: ValidationState;
  autosave: AutosaveState;
}

export interface FormInstance {
  id: string;
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  valid: boolean;
  submitting: boolean;
  submitted: boolean;
  pristine: boolean;
  validating: boolean;
  metadata?: Record<string, any>;
}

export interface ValidationState {
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched';
  revalidateMode: 'onChange' | 'onBlur' | 'onSubmit';
  debounceMs: number;
  showErrorsOnTouched: boolean;
  clearErrorsOnChange: boolean;
}

export interface AutosaveState {
  enabled: boolean;
  interval: number;
  forms: Record<string, {
    lastSaved: string;
    saving: boolean;
    failed: boolean;
  }>;
}

// Responsive design state
export interface ResponsiveState {
  breakpoint: Breakpoint;
  viewport: ViewportSize;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  highDensity: boolean;
  reducedMotion: boolean;
  reducedData: boolean;
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ViewportSize {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
}

// Accessibility state
export interface AccessibilityState {
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  announcements: Announcement[];
  landmarks: Landmark[];
  skipLinks: SkipLink[];
}

export interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  announced: boolean;
  timestamp: string;
}

export interface Landmark {
  type: LandmarkType;
  label: string;
  element: HTMLElement;
}

export type LandmarkType = 
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'region'
  | 'search'
  | 'form';

export interface SkipLink {
  label: string;
  target: string;
  visible: boolean;
}

// User preferences for UI
export interface UIPreferences {
  theme: ThemeMode;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: string;
  currency: string;
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  sounds: boolean;
  notifications: UINotificationPreferences;
  accessibility: UIAccessibilityPreferences;
  editor: EditorPreferences;
  shortcuts: KeyboardShortcut[];
}

export interface UINotificationPreferences {
  enabled: boolean;
  position: NotificationPosition;
  sound: boolean;
  vibration: boolean;
  grouping: boolean;
  maxVisible: number;
  categories: Record<string, boolean>;
}

export interface UIAccessibilityPreferences {
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  announcements: boolean;
}

export interface EditorPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autocomplete: boolean;
  suggestions: boolean;
  formatting: boolean;
  vim: boolean;
  emacs: boolean;
}

export interface KeyboardShortcut {
  id: string;
  command: string;
  shortcut: string;
  context?: string;
  enabled: boolean;
  customizable: boolean;
}

// Component props and configurations
export interface ComponentTheme {
  colors: ComponentColors;
  typography: Typography;
  spacing: Spacing;
  borders: Borders;
  shadows: Shadows;
  transitions: Transitions;
}

export interface ComponentColors {
  background: string;
  foreground: string;
  border: string;
  accent: string;
  muted: string;
  destructive: string;
  warning: string;
  success: string;
  info: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Borders {
  width: Record<string, string>;
  radius: Record<string, string>;
  style: Record<string, string>;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Transitions {
  duration: Record<string, string>;
  timing: Record<string, string>;
  property: Record<string, string>;
}

// UI component state types
export interface ButtonState {
  variant: ButtonVariant;
  size: ButtonSize;
  state: ComponentState;
  loading: boolean;
  disabled: boolean;
  icon?: string;
  iconPosition: 'left' | 'right' | 'only';
}

export type ButtonVariant = 
  | 'default'
  | 'primary' 
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentState = 
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading'
  | 'error'
  | 'success';

export interface InputState {
  variant: InputVariant;
  size: InputSize;
  state: ComponentState;
  value: any;
  placeholder?: string;
  error?: string;
  hint?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  autoFocus: boolean;
}

export type InputVariant = 'default' | 'outline' | 'filled' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

// Toast notification system
export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  progress?: number;
  createdAt: string;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'default' | 'primary' | 'destructive';
}

// Context menu
export interface ContextMenu {
  id: string;
  items: ContextMenuItem[];
  position: { x: number; y: number };
  visible: boolean;
  target?: HTMLElement;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  hidden?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
  onClick?: () => void;
}

// Drag and drop state
export interface DragState {
  active: boolean;
  draggedItem?: any;
  draggedType?: string;
  dropTarget?: string;
  dropEffect?: 'copy' | 'move' | 'link' | 'none';
  dragImage?: HTMLElement;
  dragData: Record<string, any>;
}

// Search interface state
export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  filters: SearchFilter[];
  suggestions: string[];
  recent: string[];
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  relevance: number;
  highlights: string[];
  metadata?: Record<string, any>;
}

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'range' | 'date' | 'boolean';
  value: any;
  options?: string[];
  active: boolean;
}

// UI Actions
export interface UIActions {
  // Theme actions
  setTheme: (theme: Partial<ThemeState>) => void;
  toggleTheme: () => void;
  
  // Layout actions
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  openPanel: (panelId: string) => void;
  closePanel: (panelId: string) => void;
  
  // Navigation actions
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id' | 'zIndex'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setLoading: (component: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Error actions
  addError: (error: Omit<UIError, 'id' | 'timestamp'>) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  
  // Preferences actions
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
}