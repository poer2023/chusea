/**
 * 设计token - 阴影和效果系统
 * 
 * 定义盒子阴影、文字阴影、模糊效果、渐变
 * 支持亮色/暗色主题的阴影效果
 */

// 盒子阴影token
export interface BoxShadowTokens {
  none: string;
  sm: string;
  base: string; // 默认
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  // 语义化阴影
  card: string;
  dropdown: string;
  modal: string;
  popover: string;
  tooltip: string;
  focus: string;
  // 特殊效果
  glow: string;
  outline: string;
}

// 文字阴影token
export interface TextShadowTokens {
  none: string;
  sm: string;
  base: string;
  lg: string;
  // 特殊效果
  glow: string;
  outline: string;
}

// 模糊效果token
export interface BlurTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

// 背景模糊token
export interface BackdropBlurTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

// 渐变token
export interface GradientTokens {
  // 线性渐变
  linear: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    // 方向性渐变
    toRight: string;
    toBottom: string;
    toBottomRight: string;
    toTopRight: string;
  };
  
  // 径向渐变
  radial: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  
  // 圆锥渐变
  conic: {
    primary: string;
    rainbow: string;
  };
}

// 盒子阴影token定义 - 亮色主题
export const lightBoxShadowTokens: BoxShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // 语义化阴影
  card: '0 2px 8px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.1)',
  dropdown: '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px 0 rgb(0 0 0 / 0.06)',
  modal: '0 20px 30px -8px rgb(0 0 0 / 0.15), 0 8px 16px -6px rgb(0 0 0 / 0.1)',
  popover: '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
  tooltip: '0 4px 8px -2px rgb(0 0 0 / 0.15), 0 2px 4px -1px rgb(0 0 0 / 0.1)',
  focus: '0 0 0 3px oklch(0.55 0.18 250 / 0.2)',
  
  // 特殊效果
  glow: '0 0 20px oklch(0.55 0.18 250 / 0.3), 0 0 40px oklch(0.55 0.18 250 / 0.15)',
  outline: '0 0 0 1px rgb(0 0 0 / 0.05), 0 0 0 3px oklch(0.55 0.18 250 / 0.1)',
};

// 盒子阴影token定义 - 暗色主题
export const darkBoxShadowTokens: BoxShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  
  // 语义化阴影
  card: '0 2px 8px 0 rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.4)',
  dropdown: '0 4px 12px 0 rgb(0 0 0 / 0.4), 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  modal: '0 20px 30px -8px rgb(0 0 0 / 0.5), 0 8px 16px -6px rgb(0 0 0 / 0.4)',
  popover: '0 8px 16px -4px rgb(0 0 0 / 0.4), 0 4px 8px -2px rgb(0 0 0 / 0.3)',
  tooltip: '0 4px 8px -2px rgb(0 0 0 / 0.5), 0 2px 4px -1px rgb(0 0 0 / 0.4)',
  focus: '0 0 0 3px oklch(0.55 0.18 250 / 0.3)',
  
  // 特殊效果
  glow: '0 0 20px oklch(0.55 0.18 250 / 0.4), 0 0 40px oklch(0.55 0.18 250 / 0.2)',
  outline: '0 0 0 1px rgb(255 255 255 / 0.1), 0 0 0 3px oklch(0.55 0.18 250 / 0.2)',
};

// 文字阴影token定义 - 亮色主题
export const lightTextShadowTokens: TextShadowTokens = {
  none: 'none',
  sm: '0 1px 2px rgb(0 0 0 / 0.2)',
  base: '0 1px 3px rgb(0 0 0 / 0.3)',
  lg: '0 2px 4px rgb(0 0 0 / 0.4)',
  
  // 特殊效果
  glow: '0 0 10px rgb(255 255 255 / 0.8), 0 0 20px rgb(255 255 255 / 0.4)',
  outline: '-1px -1px 0 rgb(0 0 0 / 0.5), 1px -1px 0 rgb(0 0 0 / 0.5), -1px 1px 0 rgb(0 0 0 / 0.5), 1px 1px 0 rgb(0 0 0 / 0.5)',
};

// 文字阴影token定义 - 暗色主题
export const darkTextShadowTokens: TextShadowTokens = {
  none: 'none',
  sm: '0 1px 2px rgb(0 0 0 / 0.8)',
  base: '0 1px 3px rgb(0 0 0 / 0.9)',
  lg: '0 2px 4px rgb(0 0 0 / 1)',
  
  // 特殊效果
  glow: '0 0 10px rgb(255 255 255 / 0.6), 0 0 20px rgb(255 255 255 / 0.3)',
  outline: '-1px -1px 0 rgb(0 0 0 / 1), 1px -1px 0 rgb(0 0 0 / 1), -1px 1px 0 rgb(0 0 0 / 1), 1px 1px 0 rgb(0 0 0 / 1)',
};

// 模糊效果token定义
export const blurTokens: BlurTokens = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
};

// 背景模糊token定义
export const backdropBlurTokens: BackdropBlurTokens = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
};

// 渐变token定义 - 亮色主题
export const lightGradientTokens: GradientTokens = {
  linear: {
    primary: 'linear-gradient(135deg, oklch(0.68 0.14 250) 0%, oklch(0.55 0.18 250) 100%)',
    secondary: 'linear-gradient(135deg, oklch(0.73 0.08 200) 0%, oklch(0.62 0.1 200) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.67 0.16 300) 0%, oklch(0.55 0.2 300) 100%)',
    success: 'linear-gradient(135deg, oklch(0.65 0.16 140) 0%, oklch(0.54 0.2 140) 100%)',
    warning: 'linear-gradient(135deg, oklch(0.7 0.16 60) 0%, oklch(0.6 0.2 60) 100%)',
    error: 'linear-gradient(135deg, oklch(0.7 0.16 20) 0%, oklch(0.6 0.2 20) 100%)',
    neutral: 'linear-gradient(135deg, oklch(0.75 0.016 250) 0%, oklch(0.62 0.02 250) 100%)',
    
    // 方向性渐变
    toRight: 'linear-gradient(to right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toBottom: 'linear-gradient(to bottom, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toBottomRight: 'linear-gradient(to bottom right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toTopRight: 'linear-gradient(to top right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
  },
  
  radial: {
    primary: 'radial-gradient(circle, oklch(0.68 0.14 250) 0%, oklch(0.55 0.18 250) 100%)',
    secondary: 'radial-gradient(circle, oklch(0.73 0.08 200) 0%, oklch(0.62 0.1 200) 100%)',
    accent: 'radial-gradient(circle, oklch(0.67 0.16 300) 0%, oklch(0.55 0.2 300) 100%)',
    neutral: 'radial-gradient(circle, oklch(0.98 0.002 250) 0%, oklch(0.92 0.008 250) 100%)',
  },
  
  conic: {
    primary: 'conic-gradient(from 180deg at 50% 50%, oklch(0.55 0.18 250) 0deg, oklch(0.68 0.14 250) 180deg, oklch(0.55 0.18 250) 360deg)',
    rainbow: 'conic-gradient(from 180deg at 50% 50%, oklch(0.6 0.2 0) 0deg, oklch(0.6 0.2 60) 60deg, oklch(0.6 0.2 120) 120deg, oklch(0.6 0.2 180) 180deg, oklch(0.6 0.2 240) 240deg, oklch(0.6 0.2 300) 300deg, oklch(0.6 0.2 360) 360deg)',
  },
};

// 渐变token定义 - 暗色主题
export const darkGradientTokens: GradientTokens = {
  linear: {
    primary: 'linear-gradient(135deg, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    secondary: 'linear-gradient(135deg, oklch(0.62 0.1 200) 0%, oklch(0.73 0.08 200) 100%)',
    accent: 'linear-gradient(135deg, oklch(0.55 0.2 300) 0%, oklch(0.67 0.16 300) 100%)',
    success: 'linear-gradient(135deg, oklch(0.54 0.2 140) 0%, oklch(0.65 0.16 140) 100%)',
    warning: 'linear-gradient(135deg, oklch(0.6 0.2 60) 0%, oklch(0.7 0.16 60) 100%)',
    error: 'linear-gradient(135deg, oklch(0.6 0.2 20) 0%, oklch(0.7 0.16 20) 100%)',
    neutral: 'linear-gradient(135deg, oklch(0.25 0.008 250) 0%, oklch(0.32 0.012 250) 100%)',
    
    // 方向性渐变
    toRight: 'linear-gradient(to right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toBottom: 'linear-gradient(to bottom, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toBottomRight: 'linear-gradient(to bottom right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
    toTopRight: 'linear-gradient(to top right, oklch(0.55 0.18 250) 0%, oklch(0.68 0.14 250) 100%)',
  },
  
  radial: {
    primary: 'radial-gradient(circle, oklch(0.55 0.18 250) 0%, oklch(0.38 0.15 250) 100%)',
    secondary: 'radial-gradient(circle, oklch(0.62 0.1 200) 0%, oklch(0.43 0.08 200) 100%)',
    accent: 'radial-gradient(circle, oklch(0.55 0.2 300) 0%, oklch(0.38 0.17 300) 100%)',
    neutral: 'radial-gradient(circle, oklch(0.16 0.006 250) 0%, oklch(0.08 0.002 250) 100%)',
  },
  
  conic: {
    primary: 'conic-gradient(from 180deg at 50% 50%, oklch(0.55 0.18 250) 0deg, oklch(0.68 0.14 250) 180deg, oklch(0.55 0.18 250) 360deg)',
    rainbow: 'conic-gradient(from 180deg at 50% 50%, oklch(0.6 0.2 0) 0deg, oklch(0.6 0.2 60) 60deg, oklch(0.6 0.2 120) 120deg, oklch(0.6 0.2 180) 180deg, oklch(0.6 0.2 240) 240deg, oklch(0.6 0.2 300) 300deg, oklch(0.6 0.2 360) 360deg)',
  },
};

// 动画效果token
export interface AnimationTokens {
  // 过渡时间
  duration: {
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };
  
  // 缓动函数
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
  
  // 预设动画
  preset: {
    fadeIn: string;
    fadeOut: string;
    slideIn: string;
    slideOut: string;
    scaleIn: string;
    scaleOut: string;
    spin: string;
    pulse: string;
    bounce: string;
  };
}

// 动画效果token定义
export const animationTokens: AnimationTokens = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  preset: {
    fadeIn: 'opacity 300ms cubic-bezier(0, 0, 0.2, 1)',
    fadeOut: 'opacity 300ms cubic-bezier(0.4, 0, 1, 1)',
    slideIn: 'transform 300ms cubic-bezier(0, 0, 0.2, 1)',
    slideOut: 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
    scaleIn: 'transform 300ms cubic-bezier(0, 0, 0.2, 1)',
    scaleOut: 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
    spin: 'transform 1000ms linear infinite',
    pulse: 'opacity 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'transform 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
  },
};

// 阴影和效果工具函数
export const shadowUtils = {
  /**
   * 获取指定主题的盒子阴影
   */
  getBoxShadow: (theme: 'light' | 'dark', shadow: keyof BoxShadowTokens): string => {
    return theme === 'light' ? lightBoxShadowTokens[shadow] : darkBoxShadowTokens[shadow];
  },

  /**
   * 获取指定主题的文字阴影
   */
  getTextShadow: (theme: 'light' | 'dark', shadow: keyof TextShadowTokens): string => {
    return theme === 'light' ? lightTextShadowTokens[shadow] : darkTextShadowTokens[shadow];
  },

  /**
   * 获取指定主题的渐变
   */
  getGradient: (theme: 'light' | 'dark'): GradientTokens => {
    return theme === 'light' ? lightGradientTokens : darkGradientTokens;
  },

  /**
   * 生成自定义阴影
   */
  createCustomShadow: (
    offsetX: number,
    offsetY: number,
    blur: number,
    spread: number,
    color: string,
    inset: boolean = false
  ): string => {
    const insetStr = inset ? 'inset ' : '';
    return `${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
  },

  /**
   * 组合多个阴影
   */
  combineShadows: (...shadows: string[]): string => {
    return shadows.filter(shadow => shadow !== 'none').join(', ');
  },

  /**
   * 验证阴影值
   */
  validateShadow: (shadow: string): boolean => {
    if (shadow === 'none') return true;
    
    // 简单的阴影格式验证
    const shadowRegex = /^(inset\s+)?(-?\d+px\s+){2,4}(rgb|hsl|oklch|#)[^,]*$/;
    return shadowRegex.test(shadow.trim());
  },

  /**
   * 生成阴影CSS变量
   */
  toCSSVariable: (shadowValue: string, variableName: string): string => {
    return `--shadow-${variableName}: ${shadowValue};`;
  },

  /**
   * 生成阴影CSS变量引用
   */
  toCSSVariableReference: (variableName: string): string => {
    return `var(--shadow-${variableName})`;
  },

  /**
   * 生成模糊滤镜
   */
  createBlurFilter: (blur: keyof BlurTokens): string => {
    return `blur(${blurTokens[blur]})`;
  },

  /**
   * 生成背景模糊滤镜
   */
  createBackdropBlurFilter: (blur: keyof BackdropBlurTokens): string => {
    return `backdrop-filter: blur(${backdropBlurTokens[blur]});`;
  },

  /**
   * 生成动画CSS
   */
  createAnimation: (
    name: string,
    duration: keyof AnimationTokens['duration'],
    easing: keyof AnimationTokens['easing'],
    iterations: number | 'infinite' = 1,
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal'
  ): string => {
    return `animation: ${name} ${animationTokens.duration[duration]} ${animationTokens.easing[easing]} ${iterations} ${direction};`;
  },

  /**
   * 生成过渡CSS
   */
  createTransition: (
    property: string,
    duration: keyof AnimationTokens['duration'],
    easing: keyof AnimationTokens['easing'],
    delay: string = '0ms'
  ): string => {
    return `transition: ${property} ${animationTokens.duration[duration]} ${animationTokens.easing[easing]} ${delay};`;
  },
};

// 导出所有阴影和效果token
export {
  lightBoxShadowTokens as boxShadow,
  lightTextShadowTokens as textShadow,
  blurTokens as blur,
  backdropBlurTokens as backdropBlur,
  lightGradientTokens as gradient,
  animationTokens as animation,
};