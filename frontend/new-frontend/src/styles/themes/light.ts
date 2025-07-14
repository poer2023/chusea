/**
 * 亮色主题配置
 * 
 * 定义亮色主题的完整token映射和CSS变量
 */

import {
  lightColorTokens,
  lightWorkflowColors,
  lightSurfaceColors,
  lightStateColors,
  lightBoxShadowTokens,
  lightTextShadowTokens,
  lightGradientTokens,
  typographyPresetTokens,
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
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

// 亮色主题token集合
export const lightTheme: ThemeTokens = {
  colors: lightColorTokens,
  workflowColors: lightWorkflowColors,
  surfaceColors: lightSurfaceColors,
  stateColors: lightStateColors,
  typography: typographyPresetTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  borderWidth: borderWidthTokens,
  zIndex: zIndexTokens,
  size: sizeTokens,
  maxWidth: maxWidthTokens,
  container: containerTokens,
  boxShadow: lightBoxShadowTokens,
  textShadow: lightTextShadowTokens,
  blur: blurTokens,
  backdropBlur: backdropBlurTokens,
  gradient: lightGradientTokens,
  animation: animationTokens,
};

// CSS变量映射 - 亮色主题
export const lightThemeCSSVariables = {
  // 语义化颜色变量
  '--color-primary': lightColorTokens.primary[500],
  '--color-primary-50': lightColorTokens.primary[50],
  '--color-primary-100': lightColorTokens.primary[100],
  '--color-primary-200': lightColorTokens.primary[200],
  '--color-primary-300': lightColorTokens.primary[300],
  '--color-primary-400': lightColorTokens.primary[400],
  '--color-primary-500': lightColorTokens.primary[500],
  '--color-primary-600': lightColorTokens.primary[600],
  '--color-primary-700': lightColorTokens.primary[700],
  '--color-primary-800': lightColorTokens.primary[800],
  '--color-primary-900': lightColorTokens.primary[900],
  '--color-primary-950': lightColorTokens.primary[950],

  '--color-secondary': lightColorTokens.secondary[500],
  '--color-secondary-50': lightColorTokens.secondary[50],
  '--color-secondary-100': lightColorTokens.secondary[100],
  '--color-secondary-200': lightColorTokens.secondary[200],
  '--color-secondary-300': lightColorTokens.secondary[300],
  '--color-secondary-400': lightColorTokens.secondary[400],
  '--color-secondary-500': lightColorTokens.secondary[500],
  '--color-secondary-600': lightColorTokens.secondary[600],
  '--color-secondary-700': lightColorTokens.secondary[700],
  '--color-secondary-800': lightColorTokens.secondary[800],
  '--color-secondary-900': lightColorTokens.secondary[900],
  '--color-secondary-950': lightColorTokens.secondary[950],

  '--color-accent': lightColorTokens.accent[500],
  '--color-accent-50': lightColorTokens.accent[50],
  '--color-accent-100': lightColorTokens.accent[100],
  '--color-accent-200': lightColorTokens.accent[200],
  '--color-accent-300': lightColorTokens.accent[300],
  '--color-accent-400': lightColorTokens.accent[400],
  '--color-accent-500': lightColorTokens.accent[500],
  '--color-accent-600': lightColorTokens.accent[600],
  '--color-accent-700': lightColorTokens.accent[700],
  '--color-accent-800': lightColorTokens.accent[800],
  '--color-accent-900': lightColorTokens.accent[900],
  '--color-accent-950': lightColorTokens.accent[950],

  '--color-neutral': lightColorTokens.neutral[500],
  '--color-neutral-50': lightColorTokens.neutral[50],
  '--color-neutral-100': lightColorTokens.neutral[100],
  '--color-neutral-200': lightColorTokens.neutral[200],
  '--color-neutral-300': lightColorTokens.neutral[300],
  '--color-neutral-400': lightColorTokens.neutral[400],
  '--color-neutral-500': lightColorTokens.neutral[500],
  '--color-neutral-600': lightColorTokens.neutral[600],
  '--color-neutral-700': lightColorTokens.neutral[700],
  '--color-neutral-800': lightColorTokens.neutral[800],
  '--color-neutral-900': lightColorTokens.neutral[900],
  '--color-neutral-950': lightColorTokens.neutral[950],

  // 功能性颜色变量
  '--color-success': lightColorTokens.success[500],
  '--color-success-50': lightColorTokens.success[50],
  '--color-success-100': lightColorTokens.success[100],
  '--color-success-200': lightColorTokens.success[200],
  '--color-success-300': lightColorTokens.success[300],
  '--color-success-400': lightColorTokens.success[400],
  '--color-success-500': lightColorTokens.success[500],
  '--color-success-600': lightColorTokens.success[600],
  '--color-success-700': lightColorTokens.success[700],
  '--color-success-800': lightColorTokens.success[800],
  '--color-success-900': lightColorTokens.success[900],
  '--color-success-950': lightColorTokens.success[950],

  '--color-warning': lightColorTokens.warning[500],
  '--color-warning-50': lightColorTokens.warning[50],
  '--color-warning-100': lightColorTokens.warning[100],
  '--color-warning-200': lightColorTokens.warning[200],
  '--color-warning-300': lightColorTokens.warning[300],
  '--color-warning-400': lightColorTokens.warning[400],
  '--color-warning-500': lightColorTokens.warning[500],
  '--color-warning-600': lightColorTokens.warning[600],
  '--color-warning-700': lightColorTokens.warning[700],
  '--color-warning-800': lightColorTokens.warning[800],
  '--color-warning-900': lightColorTokens.warning[900],
  '--color-warning-950': lightColorTokens.warning[950],

  '--color-error': lightColorTokens.error[500],
  '--color-error-50': lightColorTokens.error[50],
  '--color-error-100': lightColorTokens.error[100],
  '--color-error-200': lightColorTokens.error[200],
  '--color-error-300': lightColorTokens.error[300],
  '--color-error-400': lightColorTokens.error[400],
  '--color-error-500': lightColorTokens.error[500],
  '--color-error-600': lightColorTokens.error[600],
  '--color-error-700': lightColorTokens.error[700],
  '--color-error-800': lightColorTokens.error[800],
  '--color-error-900': lightColorTokens.error[900],
  '--color-error-950': lightColorTokens.error[950],

  '--color-info': lightColorTokens.info[500],
  '--color-info-50': lightColorTokens.info[50],
  '--color-info-100': lightColorTokens.info[100],
  '--color-info-200': lightColorTokens.info[200],
  '--color-info-300': lightColorTokens.info[300],
  '--color-info-400': lightColorTokens.info[400],
  '--color-info-500': lightColorTokens.info[500],
  '--color-info-600': lightColorTokens.info[600],
  '--color-info-700': lightColorTokens.info[700],
  '--color-info-800': lightColorTokens.info[800],
  '--color-info-900': lightColorTokens.info[900],
  '--color-info-950': lightColorTokens.info[950],

  // 表面颜色变量
  '--color-background-primary': lightSurfaceColors.background.primary,
  '--color-background-secondary': lightSurfaceColors.background.secondary,
  '--color-background-tertiary': lightSurfaceColors.background.tertiary,
  '--color-background-elevated': lightSurfaceColors.background.elevated,
  '--color-background-overlay': lightSurfaceColors.background.overlay,

  '--color-foreground-primary': lightSurfaceColors.foreground.primary,
  '--color-foreground-secondary': lightSurfaceColors.foreground.secondary,
  '--color-foreground-tertiary': lightSurfaceColors.foreground.tertiary,
  '--color-foreground-disabled': lightSurfaceColors.foreground.disabled,
  '--color-foreground-inverse': lightSurfaceColors.foreground.inverse,

  '--color-border-primary': lightSurfaceColors.border.primary,
  '--color-border-secondary': lightSurfaceColors.border.secondary,
  '--color-border-tertiary': lightSurfaceColors.border.tertiary,
  '--color-border-focus': lightSurfaceColors.border.focus,
  '--color-border-disabled': lightSurfaceColors.border.disabled,

  // 状态颜色变量
  '--color-hover-primary': lightStateColors.hover.primary,
  '--color-hover-secondary': lightStateColors.hover.secondary,
  '--color-hover-tertiary': lightStateColors.hover.tertiary,

  '--color-active-primary': lightStateColors.active.primary,
  '--color-active-secondary': lightStateColors.active.secondary,
  '--color-active-tertiary': lightStateColors.active.tertiary,

  '--color-focus-ring': lightStateColors.focus.ring,
  '--color-focus-outline': lightStateColors.focus.outline,

  '--color-disabled-background': lightStateColors.disabled.background,
  '--color-disabled-foreground': lightStateColors.disabled.foreground,
  '--color-disabled-border': lightStateColors.disabled.border,

  // 工作流颜色变量
  '--color-workflow-pending-bg': lightWorkflowColors.pending.bg,
  '--color-workflow-pending-border': lightWorkflowColors.pending.border,
  '--color-workflow-pending-text': lightWorkflowColors.pending.text,
  '--color-workflow-pending-icon': lightWorkflowColors.pending.icon,

  '--color-workflow-running-bg': lightWorkflowColors.running.bg,
  '--color-workflow-running-border': lightWorkflowColors.running.border,
  '--color-workflow-running-text': lightWorkflowColors.running.text,
  '--color-workflow-running-icon': lightWorkflowColors.running.icon,

  '--color-workflow-pass-bg': lightWorkflowColors.pass.bg,
  '--color-workflow-pass-border': lightWorkflowColors.pass.border,
  '--color-workflow-pass-text': lightWorkflowColors.pass.text,
  '--color-workflow-pass-icon': lightWorkflowColors.pass.icon,

  '--color-workflow-fail-bg': lightWorkflowColors.fail.bg,
  '--color-workflow-fail-border': lightWorkflowColors.fail.border,
  '--color-workflow-fail-text': lightWorkflowColors.fail.text,
  '--color-workflow-fail-icon': lightWorkflowColors.fail.icon,

  '--color-workflow-cancelled-bg': lightWorkflowColors.cancelled.bg,
  '--color-workflow-cancelled-border': lightWorkflowColors.cancelled.border,
  '--color-workflow-cancelled-text': lightWorkflowColors.cancelled.text,
  '--color-workflow-cancelled-icon': lightWorkflowColors.cancelled.icon,

  // 字体变量
  '--font-family-sans': fontFamilyTokens.sans.join(', '),
  '--font-family-serif': fontFamilyTokens.serif.join(', '),
  '--font-family-mono': fontFamilyTokens.mono.join(', '),
  '--font-family-display': fontFamilyTokens.display.join(', '),

  // 阴影变量
  '--shadow-sm': lightBoxShadowTokens.sm,
  '--shadow-base': lightBoxShadowTokens.base,
  '--shadow-md': lightBoxShadowTokens.md,
  '--shadow-lg': lightBoxShadowTokens.lg,
  '--shadow-xl': lightBoxShadowTokens.xl,
  '--shadow-2xl': lightBoxShadowTokens['2xl'],
  '--shadow-inner': lightBoxShadowTokens.inner,
  '--shadow-card': lightBoxShadowTokens.card,
  '--shadow-dropdown': lightBoxShadowTokens.dropdown,
  '--shadow-modal': lightBoxShadowTokens.modal,
  '--shadow-popover': lightBoxShadowTokens.popover,
  '--shadow-tooltip': lightBoxShadowTokens.tooltip,
  '--shadow-focus': lightBoxShadowTokens.focus,
  '--shadow-glow': lightBoxShadowTokens.glow,
  '--shadow-outline': lightBoxShadowTokens.outline,

  // 渐变变量
  '--gradient-primary': lightGradientTokens.linear.primary,
  '--gradient-secondary': lightGradientTokens.linear.secondary,
  '--gradient-accent': lightGradientTokens.linear.accent,
  '--gradient-success': lightGradientTokens.linear.success,
  '--gradient-warning': lightGradientTokens.linear.warning,
  '--gradient-error': lightGradientTokens.linear.error,
  '--gradient-neutral': lightGradientTokens.linear.neutral,
};

// 生成CSS变量字符串
export const lightThemeCSS = Object.entries(lightThemeCSSVariables)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n');

// 亮色主题类名
export const lightThemeClassName = 'theme-light';

// 亮色主题媒体查询
export const lightThemeMediaQuery = '(prefers-color-scheme: light)';

// 主题元数据
export const lightThemeMetadata = {
  name: 'Light Theme',
  id: 'light',
  description: '明亮清新的亮色主题，适合日间使用',
  version: '1.0.0',
  author: 'ChUseA Design System',
  created: new Date().toISOString(),
  tags: ['light', 'default', 'accessible'],
  accessibility: {
    contrastRatio: 'AAA',
    colorBlindSafe: true,
    highContrast: false,
  },
  features: [
    'OKLCH色彩空间',
    '语义化颜色',
    '可访问性优化',
    '工作流状态颜色',
    '响应式设计',
  ],
};

// 导出亮色主题配置
export default {
  theme: lightTheme,
  cssVariables: lightThemeCSSVariables,
  css: lightThemeCSS,
  className: lightThemeClassName,
  mediaQuery: lightThemeMediaQuery,
  metadata: lightThemeMetadata,
};