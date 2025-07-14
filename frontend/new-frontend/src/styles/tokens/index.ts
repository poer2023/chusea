/**
 * 设计token - 统一导出
 * 
 * 集中导出所有设计token，提供类型安全的访问接口
 */

// 导出所有token类型
export type {
  OKLCHColor,
  ColorTokens,
  WorkflowColorTokens,
  SurfaceColorTokens,
  StateColorTokens,
} from './colors';

export type {
  FontFamilyTokens,
  FontSizeTokens,
  FontWeightTokens,
  LineHeightTokens,
  LetterSpacingTokens,
  TypographyPresetTokens,
  ResponsiveTypographyTokens,
  FontLoadingConfig,
} from './typography';

export type {
  SpacingTokens,
  BorderRadiusTokens,
  BorderWidthTokens,
  ZIndexTokens,
  SizeTokens,
  MaxWidthTokens,
  ContainerTokens,
  ResponsiveSpacingTokens,
} from './spacing';

export type {
  BoxShadowTokens,
  TextShadowTokens,
  BlurTokens,
  BackdropBlurTokens,
  GradientTokens,
  AnimationTokens,
} from './shadows';

// 导出颜色token
export {
  lightColorTokens,
  darkColorTokens,
  lightWorkflowColors,
  darkWorkflowColors,
  lightSurfaceColors,
  darkSurfaceColors,
  lightStateColors,
  darkStateColors,
  colorTokenUtils,
  // 默认导出（亮色主题）
  colors,
  workflowColors,
  surfaceColors,
  stateColors,
} from './colors';

// 导出字体token
export {
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
  typographyPresetTokens,
  responsiveTypographyTokens,
  fontLoadingConfig,
  typographyUtils,
  // 默认导出
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography,
  responsive as responsiveTypography,
} from './typography';

// 导出间距和布局token
export {
  spacingTokens,
  borderRadiusTokens,
  borderWidthTokens,
  zIndexTokens,
  sizeTokens,
  maxWidthTokens,
  containerTokens,
  responsiveSpacingTokens,
  spacingUtils,
  layoutUtils,
  // 默认导出
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  size,
  maxWidth,
  container,
  responsive as responsiveSpacing,
} from './spacing';

// 导出阴影和效果token
export {
  lightBoxShadowTokens,
  darkBoxShadowTokens,
  lightTextShadowTokens,
  darkTextShadowTokens,
  blurTokens,
  backdropBlurTokens,
  lightGradientTokens,
  darkGradientTokens,
  animationTokens,
  shadowUtils,
  // 默认导出（亮色主题）
  boxShadow,
  textShadow,
  blur,
  backdropBlur,
  gradient,
  animation,
} from './shadows';

// 主题token集合接口
export interface ThemeTokens {
  colors: typeof lightColorTokens;
  workflowColors: typeof lightWorkflowColors;
  surfaceColors: typeof lightSurfaceColors;
  stateColors: typeof lightStateColors;
  typography: typeof typographyPresetTokens;
  spacing: typeof spacingTokens;
  borderRadius: typeof borderRadiusTokens;
  borderWidth: typeof borderWidthTokens;
  zIndex: typeof zIndexTokens;
  size: typeof sizeTokens;
  maxWidth: typeof maxWidthTokens;
  container: typeof containerTokens;
  boxShadow: typeof lightBoxShadowTokens;
  textShadow: typeof lightTextShadowTokens;
  blur: typeof blurTokens;
  backdropBlur: typeof backdropBlurTokens;
  gradient: typeof lightGradientTokens;
  animation: typeof animationTokens;
}

// 导入所有token
import {
  lightColorTokens,
  darkColorTokens,
  lightWorkflowColors,
  darkWorkflowColors,
  lightSurfaceColors,
  darkSurfaceColors,
  lightStateColors,
  darkStateColors,
} from './colors';

import {
  typographyPresetTokens,
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
} from './typography';

import {
  spacingTokens,
  borderRadiusTokens,
  borderWidthTokens,
  zIndexTokens,
  sizeTokens,
  maxWidthTokens,
  containerTokens,
} from './spacing';

import {
  lightBoxShadowTokens,
  darkBoxShadowTokens,
  lightTextShadowTokens,
  darkTextShadowTokens,
  blurTokens,
  backdropBlurTokens,
  lightGradientTokens,
  darkGradientTokens,
  animationTokens,
} from './shadows';

// 创建完整的主题token对象
export const createThemeTokens = (mode: 'light' | 'dark'): ThemeTokens => {
  return {
    colors: mode === 'light' ? lightColorTokens : darkColorTokens,
    workflowColors: mode === 'light' ? lightWorkflowColors : darkWorkflowColors,
    surfaceColors: mode === 'light' ? lightSurfaceColors : darkSurfaceColors,
    stateColors: mode === 'light' ? lightStateColors : darkStateColors,
    typography: typographyPresetTokens,
    spacing: spacingTokens,
    borderRadius: borderRadiusTokens,
    borderWidth: borderWidthTokens,
    zIndex: zIndexTokens,
    size: sizeTokens,
    maxWidth: maxWidthTokens,
    container: containerTokens,
    boxShadow: mode === 'light' ? lightBoxShadowTokens : darkBoxShadowTokens,
    textShadow: mode === 'light' ? lightTextShadowTokens : darkTextShadowTokens,
    blur: blurTokens,
    backdropBlur: backdropBlurTokens,
    gradient: mode === 'light' ? lightGradientTokens : darkGradientTokens,
    animation: animationTokens,
  };
};

// 亮色主题token
export const lightThemeTokens = createThemeTokens('light');

// 暗色主题token
export const darkThemeTokens = createThemeTokens('dark');

// 默认主题token（亮色）
export const defaultTokens = lightThemeTokens;

// Token验证工具
export const tokenValidation = {
  /**
   * 验证token是否存在
   */
  hasToken: (tokens: ThemeTokens, path: string): boolean => {
    const keys = path.split('.');
    let current: any = tokens;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return current !== undefined;
  },

  /**
   * 获取token值
   */
  getToken: (tokens: ThemeTokens, path: string): any => {
    const keys = path.split('.');
    let current: any = tokens;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  },

  /**
   * 验证所有必需的token是否存在
   */
  validateTheme: (tokens: ThemeTokens): { valid: boolean; missing: string[] } => {
    const requiredPaths = [
      'colors.primary.500',
      'colors.secondary.500',
      'surfaceColors.background.primary',
      'surfaceColors.foreground.primary',
      'typography.heading.h1',
      'spacing.4',
      'borderRadius.base',
      'boxShadow.base',
    ];

    const missing: string[] = [];
    
    for (const path of requiredPaths) {
      if (!tokenValidation.hasToken(tokens, path)) {
        missing.push(path);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  },

  /**
   * 获取token统计信息
   */
  getStats: (tokens: ThemeTokens): Record<string, number> => {
    const stats: Record<string, number> = {};
    
    const countTokens = (obj: any, prefix: string = ''): void => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          stats[prefix] = obj.length;
        } else {
          let count = 0;
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              countTokens(value, currentPath);
            } else {
              count++;
            }
          }
          if (count > 0) {
            stats[prefix || 'root'] = count;
          }
        }
      }
    };

    countTokens(tokens);
    return stats;
  },
};

// CSS变量生成工具
export const cssVariableUtils = {
  /**
   * 生成CSS变量定义
   */
  generateCSSVariables: (tokens: ThemeTokens, prefix: string = ''): string => {
    const variables: string[] = [];
    
    const processTokens = (obj: any, path: string = ''): void => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}-${key}` : key;
          
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            processTokens(value, currentPath);
          } else if (typeof value === 'string' || typeof value === 'number') {
            const variableName = prefix ? `${prefix}-${currentPath}` : currentPath;
            variables.push(`  --${variableName}: ${value};`);
          }
        }
      }
    };

    processTokens(tokens);
    return variables.join('\n');
  },

  /**
   * 生成CSS变量引用
   */
  createVariableReference: (path: string, prefix: string = ''): string => {
    const variableName = prefix ? `${prefix}-${path}` : path;
    return `var(--${variableName})`;
  },

  /**
   * 生成主题切换CSS
   */
  generateThemeCSS: (lightTokens: ThemeTokens, darkTokens: ThemeTokens): string => {
    const lightVars = cssVariableUtils.generateCSSVariables(lightTokens);
    const darkVars = cssVariableUtils.generateCSSVariables(darkTokens);
    
    return `
:root {
${lightVars}
}

@media (prefers-color-scheme: dark) {
  :root {
${darkVars}
  }
}

[data-theme="light"] {
${lightVars}
}

[data-theme="dark"] {
${darkVars}
}
    `.trim();
  },
};

// 常用token快捷访问
export const tokens = {
  // 颜色快捷访问
  color: {
    primary: lightColorTokens.primary[500],
    secondary: lightColorTokens.secondary[500],
    accent: lightColorTokens.accent[500],
    success: lightColorTokens.success[500],
    warning: lightColorTokens.warning[500],
    error: lightColorTokens.error[500],
    
    background: lightSurfaceColors.background.primary,
    foreground: lightSurfaceColors.foreground.primary,
    border: lightSurfaceColors.border.primary,
  },
  
  // 间距快捷访问
  space: {
    xs: spacingTokens[1],
    sm: spacingTokens[2],
    md: spacingTokens[4],
    lg: spacingTokens[6],
    xl: spacingTokens[8],
  },
  
  // 字体快捷访问
  font: {
    sans: fontFamilyTokens.sans.join(', '),
    mono: fontFamilyTokens.mono.join(', '),
    size: {
      sm: fontSizeTokens.sm.fontSize,
      base: fontSizeTokens.base.fontSize,
      lg: fontSizeTokens.lg.fontSize,
      xl: fontSizeTokens.xl.fontSize,
    },
  },
  
  // 阴影快捷访问
  shadow: {
    sm: lightBoxShadowTokens.sm,
    base: lightBoxShadowTokens.base,
    lg: lightBoxShadowTokens.lg,
    xl: lightBoxShadowTokens.xl,
  },
  
  // 圆角快捷访问
  radius: {
    sm: borderRadiusTokens.sm,
    base: borderRadiusTokens.base,
    lg: borderRadiusTokens.lg,
    full: borderRadiusTokens.full,
  },
};