/**
 * 暗色主题配置
 * 
 * 定义暗色主题的完整token映射和CSS变量
 */

import {
  darkColorTokens,
  darkWorkflowColors,
  darkSurfaceColors,
  darkStateColors,
  darkBoxShadowTokens,
  darkTextShadowTokens,
  darkGradientTokens,
  typographyPresetTokens,
  fontFamilyTokens,
  spacingTokens,
  borderRadiusTokens,
  borderWidthTokens,
  zIndexTokens,
  sizeTokens,
  maxWidthTokens,
  containerTokens,
  blurTokens,
  backdropBlurTokens,
  animationTokens,
} from '../tokens';

import type { ThemeTokens } from '../tokens';

// 暗色主题token集合
export const darkTheme: ThemeTokens = {
  colors: darkColorTokens,
  workflowColors: darkWorkflowColors,
  surfaceColors: darkSurfaceColors,
  stateColors: darkStateColors,
  typography: typographyPresetTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  borderWidth: borderWidthTokens,
  zIndex: zIndexTokens,
  size: sizeTokens,
  maxWidth: maxWidthTokens,
  container: containerTokens,
  boxShadow: darkBoxShadowTokens,
  textShadow: darkTextShadowTokens,
  blur: blurTokens,
  backdropBlur: backdropBlurTokens,
  gradient: darkGradientTokens,
  animation: animationTokens,
};

// CSS变量映射 - 暗色主题
export const darkThemeCSSVariables = {
  // 语义化颜色变量
  '--color-primary': darkColorTokens.primary[500],
  '--color-primary-50': darkColorTokens.primary[50],
  '--color-primary-100': darkColorTokens.primary[100],
  '--color-primary-200': darkColorTokens.primary[200],
  '--color-primary-300': darkColorTokens.primary[300],
  '--color-primary-400': darkColorTokens.primary[400],
  '--color-primary-500': darkColorTokens.primary[500],
  '--color-primary-600': darkColorTokens.primary[600],
  '--color-primary-700': darkColorTokens.primary[700],
  '--color-primary-800': darkColorTokens.primary[800],
  '--color-primary-900': darkColorTokens.primary[900],
  '--color-primary-950': darkColorTokens.primary[950],

  '--color-secondary': darkColorTokens.secondary[500],
  '--color-secondary-50': darkColorTokens.secondary[50],
  '--color-secondary-100': darkColorTokens.secondary[100],
  '--color-secondary-200': darkColorTokens.secondary[200],
  '--color-secondary-300': darkColorTokens.secondary[300],
  '--color-secondary-400': darkColorTokens.secondary[400],
  '--color-secondary-500': darkColorTokens.secondary[500],
  '--color-secondary-600': darkColorTokens.secondary[600],
  '--color-secondary-700': darkColorTokens.secondary[700],
  '--color-secondary-800': darkColorTokens.secondary[800],
  '--color-secondary-900': darkColorTokens.secondary[900],
  '--color-secondary-950': darkColorTokens.secondary[950],

  '--color-accent': darkColorTokens.accent[500],
  '--color-accent-50': darkColorTokens.accent[50],
  '--color-accent-100': darkColorTokens.accent[100],
  '--color-accent-200': darkColorTokens.accent[200],
  '--color-accent-300': darkColorTokens.accent[300],
  '--color-accent-400': darkColorTokens.accent[400],
  '--color-accent-500': darkColorTokens.accent[500],
  '--color-accent-600': darkColorTokens.accent[600],
  '--color-accent-700': darkColorTokens.accent[700],
  '--color-accent-800': darkColorTokens.accent[800],
  '--color-accent-900': darkColorTokens.accent[900],
  '--color-accent-950': darkColorTokens.accent[950],

  '--color-neutral': darkColorTokens.neutral[500],
  '--color-neutral-50': darkColorTokens.neutral[50],
  '--color-neutral-100': darkColorTokens.neutral[100],
  '--color-neutral-200': darkColorTokens.neutral[200],
  '--color-neutral-300': darkColorTokens.neutral[300],
  '--color-neutral-400': darkColorTokens.neutral[400],
  '--color-neutral-500': darkColorTokens.neutral[500],
  '--color-neutral-600': darkColorTokens.neutral[600],
  '--color-neutral-700': darkColorTokens.neutral[700],
  '--color-neutral-800': darkColorTokens.neutral[800],
  '--color-neutral-900': darkColorTokens.neutral[900],
  '--color-neutral-950': darkColorTokens.neutral[950],

  // 功能性颜色变量
  '--color-success': darkColorTokens.success[500],
  '--color-success-50': darkColorTokens.success[50],
  '--color-success-100': darkColorTokens.success[100],
  '--color-success-200': darkColorTokens.success[200],
  '--color-success-300': darkColorTokens.success[300],
  '--color-success-400': darkColorTokens.success[400],
  '--color-success-500': darkColorTokens.success[500],
  '--color-success-600': darkColorTokens.success[600],
  '--color-success-700': darkColorTokens.success[700],
  '--color-success-800': darkColorTokens.success[800],
  '--color-success-900': darkColorTokens.success[900],
  '--color-success-950': darkColorTokens.success[950],

  '--color-warning': darkColorTokens.warning[500],
  '--color-warning-50': darkColorTokens.warning[50],
  '--color-warning-100': darkColorTokens.warning[100],
  '--color-warning-200': darkColorTokens.warning[200],
  '--color-warning-300': darkColorTokens.warning[300],
  '--color-warning-400': darkColorTokens.warning[400],
  '--color-warning-500': darkColorTokens.warning[500],
  '--color-warning-600': darkColorTokens.warning[600],
  '--color-warning-700': darkColorTokens.warning[700],
  '--color-warning-800': darkColorTokens.warning[800],
  '--color-warning-900': darkColorTokens.warning[900],
  '--color-warning-950': darkColorTokens.warning[950],

  '--color-error': darkColorTokens.error[500],
  '--color-error-50': darkColorTokens.error[50],
  '--color-error-100': darkColorTokens.error[100],
  '--color-error-200': darkColorTokens.error[200],
  '--color-error-300': darkColorTokens.error[300],
  '--color-error-400': darkColorTokens.error[400],
  '--color-error-500': darkColorTokens.error[500],
  '--color-error-600': darkColorTokens.error[600],
  '--color-error-700': darkColorTokens.error[700],
  '--color-error-800': darkColorTokens.error[800],
  '--color-error-900': darkColorTokens.error[900],
  '--color-error-950': darkColorTokens.error[950],

  '--color-info': darkColorTokens.info[500],
  '--color-info-50': darkColorTokens.info[50],
  '--color-info-100': darkColorTokens.info[100],
  '--color-info-200': darkColorTokens.info[200],
  '--color-info-300': darkColorTokens.info[300],
  '--color-info-400': darkColorTokens.info[400],
  '--color-info-500': darkColorTokens.info[500],
  '--color-info-600': darkColorTokens.info[600],
  '--color-info-700': darkColorTokens.info[700],
  '--color-info-800': darkColorTokens.info[800],
  '--color-info-900': darkColorTokens.info[900],
  '--color-info-950': darkColorTokens.info[950],

  // 表面颜色变量
  '--color-background-primary': darkSurfaceColors.background.primary,
  '--color-background-secondary': darkSurfaceColors.background.secondary,
  '--color-background-tertiary': darkSurfaceColors.background.tertiary,
  '--color-background-elevated': darkSurfaceColors.background.elevated,
  '--color-background-overlay': darkSurfaceColors.background.overlay,

  '--color-foreground-primary': darkSurfaceColors.foreground.primary,
  '--color-foreground-secondary': darkSurfaceColors.foreground.secondary,
  '--color-foreground-tertiary': darkSurfaceColors.foreground.tertiary,
  '--color-foreground-disabled': darkSurfaceColors.foreground.disabled,
  '--color-foreground-inverse': darkSurfaceColors.foreground.inverse,

  '--color-border-primary': darkSurfaceColors.border.primary,
  '--color-border-secondary': darkSurfaceColors.border.secondary,
  '--color-border-tertiary': darkSurfaceColors.border.tertiary,
  '--color-border-focus': darkSurfaceColors.border.focus,
  '--color-border-disabled': darkSurfaceColors.border.disabled,

  // 状态颜色变量
  '--color-hover-primary': darkStateColors.hover.primary,
  '--color-hover-secondary': darkStateColors.hover.secondary,
  '--color-hover-tertiary': darkStateColors.hover.tertiary,

  '--color-active-primary': darkStateColors.active.primary,
  '--color-active-secondary': darkStateColors.active.secondary,
  '--color-active-tertiary': darkStateColors.active.tertiary,

  '--color-focus-ring': darkStateColors.focus.ring,
  '--color-focus-outline': darkStateColors.focus.outline,

  '--color-disabled-background': darkStateColors.disabled.background,
  '--color-disabled-foreground': darkStateColors.disabled.foreground,
  '--color-disabled-border': darkStateColors.disabled.border,

  // 工作流颜色变量
  '--color-workflow-pending-bg': darkWorkflowColors.pending.bg,
  '--color-workflow-pending-border': darkWorkflowColors.pending.border,
  '--color-workflow-pending-text': darkWorkflowColors.pending.text,
  '--color-workflow-pending-icon': darkWorkflowColors.pending.icon,

  '--color-workflow-running-bg': darkWorkflowColors.running.bg,
  '--color-workflow-running-border': darkWorkflowColors.running.border,
  '--color-workflow-running-text': darkWorkflowColors.running.text,
  '--color-workflow-running-icon': darkWorkflowColors.running.icon,

  '--color-workflow-pass-bg': darkWorkflowColors.pass.bg,
  '--color-workflow-pass-border': darkWorkflowColors.pass.border,
  '--color-workflow-pass-text': darkWorkflowColors.pass.text,
  '--color-workflow-pass-icon': darkWorkflowColors.pass.icon,

  '--color-workflow-fail-bg': darkWorkflowColors.fail.bg,
  '--color-workflow-fail-border': darkWorkflowColors.fail.border,
  '--color-workflow-fail-text': darkWorkflowColors.fail.text,
  '--color-workflow-fail-icon': darkWorkflowColors.fail.icon,

  '--color-workflow-cancelled-bg': darkWorkflowColors.cancelled.bg,
  '--color-workflow-cancelled-border': darkWorkflowColors.cancelled.border,
  '--color-workflow-cancelled-text': darkWorkflowColors.cancelled.text,
  '--color-workflow-cancelled-icon': darkWorkflowColors.cancelled.icon,

  // 字体变量
  '--font-family-sans': fontFamilyTokens.sans.join(', '),
  '--font-family-serif': fontFamilyTokens.serif.join(', '),
  '--font-family-mono': fontFamilyTokens.mono.join(', '),
  '--font-family-display': fontFamilyTokens.display.join(', '),

  // 阴影变量
  '--shadow-sm': darkBoxShadowTokens.sm,
  '--shadow-base': darkBoxShadowTokens.base,
  '--shadow-md': darkBoxShadowTokens.md,
  '--shadow-lg': darkBoxShadowTokens.lg,
  '--shadow-xl': darkBoxShadowTokens.xl,
  '--shadow-2xl': darkBoxShadowTokens['2xl'],
  '--shadow-inner': darkBoxShadowTokens.inner,
  '--shadow-card': darkBoxShadowTokens.card,
  '--shadow-dropdown': darkBoxShadowTokens.dropdown,
  '--shadow-modal': darkBoxShadowTokens.modal,
  '--shadow-popover': darkBoxShadowTokens.popover,
  '--shadow-tooltip': darkBoxShadowTokens.tooltip,
  '--shadow-focus': darkBoxShadowTokens.focus,
  '--shadow-glow': darkBoxShadowTokens.glow,
  '--shadow-outline': darkBoxShadowTokens.outline,

  // 渐变变量
  '--gradient-primary': darkGradientTokens.linear.primary,
  '--gradient-secondary': darkGradientTokens.linear.secondary,
  '--gradient-accent': darkGradientTokens.linear.accent,
  '--gradient-success': darkGradientTokens.linear.success,
  '--gradient-warning': darkGradientTokens.linear.warning,
  '--gradient-error': darkGradientTokens.linear.error,
  '--gradient-neutral': darkGradientTokens.linear.neutral,
};

// 生成CSS变量字符串
export const darkThemeCSS = Object.entries(darkThemeCSSVariables)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n');

// 暗色主题类名
export const darkThemeClassName = 'theme-dark';

// 暗色主题媒体查询
export const darkThemeMediaQuery = '(prefers-color-scheme: dark)';

// 主题元数据
export const darkThemeMetadata = {
  name: 'Dark Theme',
  id: 'dark',
  description: '优雅舒适的暗色主题，适合夜间使用和减少眼部疲劳',
  version: '1.0.0',
  author: 'ChUseA Design System',
  created: new Date().toISOString(),
  tags: ['dark', 'night', 'accessible', 'comfort'],
  accessibility: {
    contrastRatio: 'AAA',
    colorBlindSafe: true,
    highContrast: false,
    reducedEyeStrain: true,
  },
  features: [
    'OKLCH色彩空间',
    '语义化颜色',
    '可访问性优化',
    '工作流状态颜色',
    '响应式设计',
    '护眼模式',
    '增强对比度',
  ],
};

// 导出暗色主题配置
export default {
  theme: darkTheme,
  cssVariables: darkThemeCSSVariables,
  css: darkThemeCSS,
  className: darkThemeClassName,
  mediaQuery: darkThemeMediaQuery,
  metadata: darkThemeMetadata,
};