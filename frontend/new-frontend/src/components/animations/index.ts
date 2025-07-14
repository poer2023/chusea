// Basic animation components
export { FadeIn, type FadeInProps } from './fade-in';
export { SlideIn, type SlideInProps } from './slide-in';
export { ScaleIn, type ScaleInProps } from './scale-in';
export { BounceIn, type BounceInProps } from './bounce-in';

// Loading components
export { LoadingSpinner, type LoadingSpinnerProps } from './loading-spinner';
export { ProgressBar, type ProgressBarProps } from './progress-bar';

// Workflow-specific animations
export {
  WorkflowNode,
  ConnectionLine,
  WorkflowProgress,
  DataLoading,
  type WorkflowNodeProps,
  type ConnectionLineProps,
  type WorkflowProgressProps,
  type DataLoadingProps
} from './workflow-animations';

// Interactive animations
export {
  AnimatedButton,
  AnimatedCard,
  Modal,
  Toast,
  AnimatedInput,
  PageTransition,
  StaggerContainer,
  type AnimatedButtonProps,
  type AnimatedCardProps,
  type ModalProps,
  type ToastProps,
  type AnimatedInputProps,
  type PageTransitionProps,
  type StaggerContainerProps
} from './interaction-animations';

// Performance-optimized components
export {
  OptimizedAnimation,
  GPUAccelerated,
  LazyAnimation,
  AnimationManager,
  AnimationPerformanceMonitor,
  usePerformantAnimation
} from './performance-optimized';

// Enhanced animation components
export {
  FadeAnimation,
  ScaleAnimation,
  StaggerContainer as EnhancedStaggerContainer,
  MicroInteraction,
  LoadingAnimation
} from './enhanced-animations';

// Animation configuration and utilities
export { animationConfig, performanceUtils, generateAnimationClasses, workflowAnimations } from './animation-config';
export type { WorkflowStatus, AnimationDuration, AnimationEasing } from './animation-config';

// Animation utilities and hooks
export * from './hooks';