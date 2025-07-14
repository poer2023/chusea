/**
 * 设计token - 颜色系统
 * 
 * 基于OKLCH颜色空间的语义化颜色定义
 * 支持亮色/暗色主题，提供状态颜色和工作流特定颜色
 */

// OKLCH颜色值类型
export type OKLCHColor = `oklch(${number} ${number} ${number})` | `oklch(${number} ${number} ${number} / ${number})`;

// 颜色token接口
export interface ColorTokens {
  // 语义化颜色
  primary: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor; // 主要颜色
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  secondary: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  accent: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  neutral: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  
  // 功能性颜色
  success: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  warning: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  error: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
  info: {
    50: OKLCHColor;
    100: OKLCHColor;
    200: OKLCHColor;
    300: OKLCHColor;
    400: OKLCHColor;
    500: OKLCHColor;
    600: OKLCHColor;
    700: OKLCHColor;
    800: OKLCHColor;
    900: OKLCHColor;
    950: OKLCHColor;
  };
}

// 工作流颜色token
export interface WorkflowColorTokens {
  pending: {
    bg: OKLCHColor;
    border: OKLCHColor;
    text: OKLCHColor;
    icon: OKLCHColor;
  };
  running: {
    bg: OKLCHColor;
    border: OKLCHColor;
    text: OKLCHColor;
    icon: OKLCHColor;
  };
  pass: {
    bg: OKLCHColor;
    border: OKLCHColor;
    text: OKLCHColor;
    icon: OKLCHColor;
  };
  fail: {
    bg: OKLCHColor;
    border: OKLCHColor;
    text: OKLCHColor;
    icon: OKLCHColor;
  };
  cancelled: {
    bg: OKLCHColor;
    border: OKLCHColor;
    text: OKLCHColor;
    icon: OKLCHColor;
  };
}

// 表面颜色token (背景、边框等)
export interface SurfaceColorTokens {
  background: {
    primary: OKLCHColor;
    secondary: OKLCHColor;
    tertiary: OKLCHColor;
    elevated: OKLCHColor;
    overlay: OKLCHColor;
  };
  foreground: {
    primary: OKLCHColor;
    secondary: OKLCHColor;
    tertiary: OKLCHColor;
    disabled: OKLCHColor;
    inverse: OKLCHColor;
  };
  border: {
    primary: OKLCHColor;
    secondary: OKLCHColor;
    tertiary: OKLCHColor;
    focus: OKLCHColor;
    disabled: OKLCHColor;
  };
}

// 状态颜色token
export interface StateColorTokens {
  hover: {
    primary: OKLCHColor;
    secondary: OKLCHColor;
    tertiary: OKLCHColor;
  };
  active: {
    primary: OKLCHColor;
    secondary: OKLCHColor;
    tertiary: OKLCHColor;
  };
  focus: {
    ring: OKLCHColor;
    outline: OKLCHColor;
  };
  disabled: {
    background: OKLCHColor;
    foreground: OKLCHColor;
    border: OKLCHColor;
  };
}

// 颜色token定义 - 亮色主题
export const lightColorTokens: ColorTokens = {
  primary: {
    50: 'oklch(0.97 0.015 250)',
    100: 'oklch(0.93 0.03 250)',
    200: 'oklch(0.87 0.06 250)',
    300: 'oklch(0.79 0.09 250)',
    400: 'oklch(0.68 0.14 250)',
    500: 'oklch(0.55 0.18 250)', // 主要颜色
    600: 'oklch(0.45 0.15 250)',
    700: 'oklch(0.38 0.12 250)',
    800: 'oklch(0.32 0.09 250)',
    900: 'oklch(0.27 0.06 250)',
    950: 'oklch(0.18 0.04 250)',
  },
  secondary: {
    50: 'oklch(0.98 0.01 200)',
    100: 'oklch(0.95 0.02 200)',
    200: 'oklch(0.89 0.04 200)',
    300: 'oklch(0.82 0.06 200)',
    400: 'oklch(0.73 0.08 200)',
    500: 'oklch(0.62 0.1 200)',
    600: 'oklch(0.52 0.08 200)',
    700: 'oklch(0.43 0.06 200)',
    800: 'oklch(0.36 0.04 200)',
    900: 'oklch(0.3 0.03 200)',
    950: 'oklch(0.2 0.02 200)',
  },
  accent: {
    50: 'oklch(0.97 0.02 300)',
    100: 'oklch(0.94 0.04 300)',
    200: 'oklch(0.87 0.08 300)',
    300: 'oklch(0.78 0.12 300)',
    400: 'oklch(0.67 0.16 300)',
    500: 'oklch(0.55 0.2 300)',
    600: 'oklch(0.45 0.17 300)',
    700: 'oklch(0.38 0.14 300)',
    800: 'oklch(0.32 0.11 300)',
    900: 'oklch(0.27 0.08 300)',
    950: 'oklch(0.18 0.05 300)',
  },
  neutral: {
    50: 'oklch(0.98 0.002 250)',
    100: 'oklch(0.96 0.004 250)',
    200: 'oklch(0.92 0.008 250)',
    300: 'oklch(0.86 0.012 250)',
    400: 'oklch(0.75 0.016 250)',
    500: 'oklch(0.62 0.02 250)',
    600: 'oklch(0.49 0.016 250)',
    700: 'oklch(0.4 0.012 250)',
    800: 'oklch(0.32 0.008 250)',
    900: 'oklch(0.25 0.006 250)',
    950: 'oklch(0.15 0.004 250)',
  },
  success: {
    50: 'oklch(0.96 0.02 140)',
    100: 'oklch(0.92 0.04 140)',
    200: 'oklch(0.85 0.08 140)',
    300: 'oklch(0.76 0.12 140)',
    400: 'oklch(0.65 0.16 140)',
    500: 'oklch(0.54 0.2 140)',
    600: 'oklch(0.45 0.17 140)',
    700: 'oklch(0.38 0.14 140)',
    800: 'oklch(0.32 0.11 140)',
    900: 'oklch(0.27 0.08 140)',
    950: 'oklch(0.18 0.05 140)',
  },
  warning: {
    50: 'oklch(0.97 0.02 60)',
    100: 'oklch(0.94 0.04 60)',
    200: 'oklch(0.88 0.08 60)',
    300: 'oklch(0.8 0.12 60)',
    400: 'oklch(0.7 0.16 60)',
    500: 'oklch(0.6 0.2 60)',
    600: 'oklch(0.52 0.17 60)',
    700: 'oklch(0.44 0.14 60)',
    800: 'oklch(0.37 0.11 60)',
    900: 'oklch(0.32 0.08 60)',
    950: 'oklch(0.22 0.05 60)',
  },
  error: {
    50: 'oklch(0.97 0.02 20)',
    100: 'oklch(0.94 0.04 20)',
    200: 'oklch(0.88 0.08 20)',
    300: 'oklch(0.8 0.12 20)',
    400: 'oklch(0.7 0.16 20)',
    500: 'oklch(0.6 0.2 20)',
    600: 'oklch(0.52 0.17 20)',
    700: 'oklch(0.44 0.14 20)',
    800: 'oklch(0.37 0.11 20)',
    900: 'oklch(0.32 0.08 20)',
    950: 'oklch(0.22 0.05 20)',
  },
  info: {
    50: 'oklch(0.97 0.015 220)',
    100: 'oklch(0.93 0.03 220)',
    200: 'oklch(0.87 0.06 220)',
    300: 'oklch(0.79 0.09 220)',
    400: 'oklch(0.68 0.14 220)',
    500: 'oklch(0.55 0.18 220)',
    600: 'oklch(0.45 0.15 220)',
    700: 'oklch(0.38 0.12 220)',
    800: 'oklch(0.32 0.09 220)',
    900: 'oklch(0.27 0.06 220)',
    950: 'oklch(0.18 0.04 220)',
  },
};

// 工作流颜色定义 - 亮色主题
export const lightWorkflowColors: WorkflowColorTokens = {
  pending: {
    bg: 'oklch(0.94 0.02 60)',
    border: 'oklch(0.8 0.08 60)',
    text: 'oklch(0.4 0.12 60)',
    icon: 'oklch(0.5 0.16 60)',
  },
  running: {
    bg: 'oklch(0.93 0.03 220)',
    border: 'oklch(0.79 0.09 220)',
    text: 'oklch(0.38 0.12 220)',
    icon: 'oklch(0.55 0.18 220)',
  },
  pass: {
    bg: 'oklch(0.92 0.04 140)',
    border: 'oklch(0.76 0.12 140)',
    text: 'oklch(0.38 0.14 140)',
    icon: 'oklch(0.54 0.2 140)',
  },
  fail: {
    bg: 'oklch(0.94 0.04 20)',
    border: 'oklch(0.8 0.12 20)',
    text: 'oklch(0.44 0.14 20)',
    icon: 'oklch(0.6 0.2 20)',
  },
  cancelled: {
    bg: 'oklch(0.96 0.004 250)',
    border: 'oklch(0.86 0.012 250)',
    text: 'oklch(0.4 0.012 250)',
    icon: 'oklch(0.62 0.02 250)',
  },
};

// 表面颜色定义 - 亮色主题
export const lightSurfaceColors: SurfaceColorTokens = {
  background: {
    primary: 'oklch(1 0 0)',
    secondary: 'oklch(0.98 0.002 250)',
    tertiary: 'oklch(0.96 0.004 250)',
    elevated: 'oklch(1 0 0)',
    overlay: 'oklch(0 0 0 / 0.5)',
  },
  foreground: {
    primary: 'oklch(0.15 0.004 250)',
    secondary: 'oklch(0.4 0.012 250)',
    tertiary: 'oklch(0.62 0.02 250)',
    disabled: 'oklch(0.75 0.016 250)',
    inverse: 'oklch(0.98 0.002 250)',
  },
  border: {
    primary: 'oklch(0.92 0.008 250)',
    secondary: 'oklch(0.86 0.012 250)',
    tertiary: 'oklch(0.75 0.016 250)',
    focus: 'oklch(0.55 0.18 250)',
    disabled: 'oklch(0.92 0.008 250)',
  },
};

// 状态颜色定义 - 亮色主题
export const lightStateColors: StateColorTokens = {
  hover: {
    primary: 'oklch(0.96 0.004 250)',
    secondary: 'oklch(0.92 0.008 250)',
    tertiary: 'oklch(0.86 0.012 250)',
  },
  active: {
    primary: 'oklch(0.92 0.008 250)',
    secondary: 'oklch(0.86 0.012 250)',
    tertiary: 'oklch(0.75 0.016 250)',
  },
  focus: {
    ring: 'oklch(0.55 0.18 250)',
    outline: 'oklch(0.55 0.18 250)',
  },
  disabled: {
    background: 'oklch(0.96 0.004 250)',
    foreground: 'oklch(0.75 0.016 250)',
    border: 'oklch(0.92 0.008 250)',
  },
};

// 暗色主题颜色token
export const darkColorTokens: ColorTokens = {
  primary: {
    50: 'oklch(0.18 0.04 250)',
    100: 'oklch(0.22 0.06 250)',
    200: 'oklch(0.27 0.09 250)',
    300: 'oklch(0.32 0.12 250)',
    400: 'oklch(0.38 0.15 250)',
    500: 'oklch(0.55 0.18 250)', // 主要颜色
    600: 'oklch(0.68 0.14 250)',
    700: 'oklch(0.79 0.09 250)',
    800: 'oklch(0.87 0.06 250)',
    900: 'oklch(0.93 0.03 250)',
    950: 'oklch(0.97 0.015 250)',
  },
  secondary: {
    50: 'oklch(0.2 0.02 200)',
    100: 'oklch(0.25 0.03 200)',
    200: 'oklch(0.3 0.04 200)',
    300: 'oklch(0.36 0.06 200)',
    400: 'oklch(0.43 0.08 200)',
    500: 'oklch(0.62 0.1 200)',
    600: 'oklch(0.73 0.08 200)',
    700: 'oklch(0.82 0.06 200)',
    800: 'oklch(0.89 0.04 200)',
    900: 'oklch(0.95 0.02 200)',
    950: 'oklch(0.98 0.01 200)',
  },
  accent: {
    50: 'oklch(0.18 0.05 300)',
    100: 'oklch(0.22 0.08 300)',
    200: 'oklch(0.27 0.11 300)',
    300: 'oklch(0.32 0.14 300)',
    400: 'oklch(0.38 0.17 300)',
    500: 'oklch(0.55 0.2 300)',
    600: 'oklch(0.67 0.16 300)',
    700: 'oklch(0.78 0.12 300)',
    800: 'oklch(0.87 0.08 300)',
    900: 'oklch(0.94 0.04 300)',
    950: 'oklch(0.97 0.02 300)',
  },
  neutral: {
    50: 'oklch(0.15 0.004 250)',
    100: 'oklch(0.2 0.006 250)',
    200: 'oklch(0.25 0.008 250)',
    300: 'oklch(0.32 0.012 250)',
    400: 'oklch(0.4 0.016 250)',
    500: 'oklch(0.62 0.02 250)',
    600: 'oklch(0.75 0.016 250)',
    700: 'oklch(0.86 0.012 250)',
    800: 'oklch(0.92 0.008 250)',
    900: 'oklch(0.96 0.004 250)',
    950: 'oklch(0.98 0.002 250)',
  },
  success: {
    50: 'oklch(0.18 0.05 140)',
    100: 'oklch(0.22 0.08 140)',
    200: 'oklch(0.27 0.11 140)',
    300: 'oklch(0.32 0.14 140)',
    400: 'oklch(0.38 0.17 140)',
    500: 'oklch(0.54 0.2 140)',
    600: 'oklch(0.65 0.16 140)',
    700: 'oklch(0.76 0.12 140)',
    800: 'oklch(0.85 0.08 140)',
    900: 'oklch(0.92 0.04 140)',
    950: 'oklch(0.96 0.02 140)',
  },
  warning: {
    50: 'oklch(0.22 0.05 60)',
    100: 'oklch(0.27 0.08 60)',
    200: 'oklch(0.32 0.11 60)',
    300: 'oklch(0.37 0.14 60)',
    400: 'oklch(0.44 0.17 60)',
    500: 'oklch(0.6 0.2 60)',
    600: 'oklch(0.7 0.16 60)',
    700: 'oklch(0.8 0.12 60)',
    800: 'oklch(0.88 0.08 60)',
    900: 'oklch(0.94 0.04 60)',
    950: 'oklch(0.97 0.02 60)',
  },
  error: {
    50: 'oklch(0.22 0.05 20)',
    100: 'oklch(0.27 0.08 20)',
    200: 'oklch(0.32 0.11 20)',
    300: 'oklch(0.37 0.14 20)',
    400: 'oklch(0.44 0.17 20)',
    500: 'oklch(0.6 0.2 20)',
    600: 'oklch(0.7 0.16 20)',
    700: 'oklch(0.8 0.12 20)',
    800: 'oklch(0.88 0.08 20)',
    900: 'oklch(0.94 0.04 20)',
    950: 'oklch(0.97 0.02 20)',
  },
  info: {
    50: 'oklch(0.18 0.04 220)',
    100: 'oklch(0.22 0.06 220)',
    200: 'oklch(0.27 0.09 220)',
    300: 'oklch(0.32 0.12 220)',
    400: 'oklch(0.38 0.15 220)',
    500: 'oklch(0.55 0.18 220)',
    600: 'oklch(0.68 0.14 220)',
    700: 'oklch(0.79 0.09 220)',
    800: 'oklch(0.87 0.06 220)',
    900: 'oklch(0.93 0.03 220)',
    950: 'oklch(0.97 0.015 220)',
  },
};

// 工作流颜色定义 - 暗色主题
export const darkWorkflowColors: WorkflowColorTokens = {
  pending: {
    bg: 'oklch(0.27 0.08 60)',
    border: 'oklch(0.44 0.14 60)',
    text: 'oklch(0.8 0.12 60)',
    icon: 'oklch(0.6 0.16 60)',
  },
  running: {
    bg: 'oklch(0.22 0.06 220)',
    border: 'oklch(0.38 0.12 220)',
    text: 'oklch(0.79 0.09 220)',
    icon: 'oklch(0.55 0.18 220)',
  },
  pass: {
    bg: 'oklch(0.22 0.08 140)',
    border: 'oklch(0.38 0.14 140)',
    text: 'oklch(0.76 0.12 140)',
    icon: 'oklch(0.54 0.2 140)',
  },
  fail: {
    bg: 'oklch(0.27 0.08 20)',
    border: 'oklch(0.44 0.14 20)',
    text: 'oklch(0.8 0.12 20)',
    icon: 'oklch(0.6 0.2 20)',
  },
  cancelled: {
    bg: 'oklch(0.2 0.006 250)',
    border: 'oklch(0.32 0.012 250)',
    text: 'oklch(0.86 0.012 250)',
    icon: 'oklch(0.62 0.02 250)',
  },
};

// 表面颜色定义 - 暗色主题
export const darkSurfaceColors: SurfaceColorTokens = {
  background: {
    primary: 'oklch(0.08 0.002 250)',
    secondary: 'oklch(0.12 0.004 250)',
    tertiary: 'oklch(0.16 0.006 250)',
    elevated: 'oklch(0.12 0.004 250)',
    overlay: 'oklch(0 0 0 / 0.7)',
  },
  foreground: {
    primary: 'oklch(0.98 0.002 250)',
    secondary: 'oklch(0.86 0.012 250)',
    tertiary: 'oklch(0.62 0.02 250)',
    disabled: 'oklch(0.4 0.016 250)',
    inverse: 'oklch(0.15 0.004 250)',
  },
  border: {
    primary: 'oklch(0.25 0.008 250)',
    secondary: 'oklch(0.32 0.012 250)',
    tertiary: 'oklch(0.4 0.016 250)',
    focus: 'oklch(0.55 0.18 250)',
    disabled: 'oklch(0.25 0.008 250)',
  },
};

// 状态颜色定义 - 暗色主题
export const darkStateColors: StateColorTokens = {
  hover: {
    primary: 'oklch(0.16 0.006 250)',
    secondary: 'oklch(0.2 0.008 250)',
    tertiary: 'oklch(0.25 0.012 250)',
  },
  active: {
    primary: 'oklch(0.2 0.008 250)',
    secondary: 'oklch(0.25 0.012 250)',
    tertiary: 'oklch(0.32 0.016 250)',
  },
  focus: {
    ring: 'oklch(0.55 0.18 250)',
    outline: 'oklch(0.55 0.18 250)',
  },
  disabled: {
    background: 'oklch(0.16 0.006 250)',
    foreground: 'oklch(0.4 0.016 250)',
    border: 'oklch(0.25 0.008 250)',
  },
};

// 颜色token工具函数
export const colorTokenUtils = {
  /**
   * 获取指定主题的完整颜色token
   */
  getColorTokens: (theme: 'light' | 'dark'): ColorTokens => {
    return theme === 'light' ? lightColorTokens : darkColorTokens;
  },

  /**
   * 获取工作流颜色token
   */
  getWorkflowColors: (theme: 'light' | 'dark'): WorkflowColorTokens => {
    return theme === 'light' ? lightWorkflowColors : darkWorkflowColors;
  },

  /**
   * 获取表面颜色token
   */
  getSurfaceColors: (theme: 'light' | 'dark'): SurfaceColorTokens => {
    return theme === 'light' ? lightSurfaceColors : darkSurfaceColors;
  },

  /**
   * 获取状态颜色token
   */
  getStateColors: (theme: 'light' | 'dark'): StateColorTokens => {
    return theme === 'light' ? lightStateColors : darkStateColors;
  },

  /**
   * 验证OKLCH颜色值
   */
  validateOKLCHColor: (color: string): boolean => {
    const oklchRegex = /^oklch\(\s*(\d*\.?\d+)\s+(\d*\.?\d+)\s+(\d*\.?\d+)\s*(?:\/\s*(\d*\.?\d+))?\s*\)$/;
    return oklchRegex.test(color);
  },

  /**
   * 转换OKLCH到CSS变量格式
   */
  toCSSVariable: (colorValue: OKLCHColor, variableName: string): string => {
    return `--color-${variableName}: ${colorValue};`;
  },

  /**
   * 生成CSS变量引用
   */
  toCSSVariableReference: (variableName: string): string => {
    return `var(--color-${variableName})`;
  },
};

// 导出所有颜色token
export {
  lightColorTokens as colors,
  lightWorkflowColors as workflowColors,
  lightSurfaceColors as surfaceColors,
  lightStateColors as stateColors,
};