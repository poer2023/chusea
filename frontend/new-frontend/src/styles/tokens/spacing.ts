/**
 * 设计token - 间距和布局系统
 * 
 * 定义间距阶梯、圆角、边框宽度、z-index层级
 * 基于4px网格系统，支持响应式间距
 */

// 间距token (基于4px网格系统)
export interface SpacingTokens {
  0: string;
  px: string;
  0.5: string; // 2px
  1: string;   // 4px
  1.5: string; // 6px
  2: string;   // 8px
  2.5: string; // 10px
  3: string;   // 12px
  3.5: string; // 14px
  4: string;   // 16px
  5: string;   // 20px
  6: string;   // 24px
  7: string;   // 28px
  8: string;   // 32px
  9: string;   // 36px
  10: string;  // 40px
  11: string;  // 44px
  12: string;  // 48px
  14: string;  // 56px
  16: string;  // 64px
  20: string;  // 80px
  24: string;  // 96px
  28: string;  // 112px
  32: string;  // 128px
  36: string;  // 144px
  40: string;  // 160px
  44: string;  // 176px
  48: string;  // 192px
  52: string;  // 208px
  56: string;  // 224px
  60: string;  // 240px
  64: string;  // 256px
  72: string;  // 288px
  80: string;  // 320px
  96: string;  // 384px
}

// 圆角token
export interface BorderRadiusTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// 边框宽度token
export interface BorderWidthTokens {
  0: string;
  1: string; // default
  2: string;
  4: string;
  8: string;
}

// Z-index层级token
export interface ZIndexTokens {
  auto: string;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  // 语义化层级
  behind: number;      // -1
  base: number;        // 0
  dropdown: number;    // 1000
  sticky: number;      // 1010
  fixed: number;       // 1020
  overlay: number;     // 1030
  modal: number;       // 1040
  popover: number;     // 1050
  tooltip: number;     // 1060
  toast: number;       // 1070
  maximum: number;     // 9999
}

// 尺寸token (宽度和高度)
export interface SizeTokens {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
  // 特殊尺寸
  auto: string;
  '1/2': string;
  '1/3': string;
  '2/3': string;
  '1/4': string;
  '2/4': string;
  '3/4': string;
  '1/5': string;
  '2/5': string;
  '3/5': string;
  '4/5': string;
  '1/6': string;
  '2/6': string;
  '3/6': string;
  '4/6': string;
  '5/6': string;
  '1/12': string;
  '2/12': string;
  '3/12': string;
  '4/12': string;
  '5/12': string;
  '6/12': string;
  '7/12': string;
  '8/12': string;
  '9/12': string;
  '10/12': string;
  '11/12': string;
  full: string;
  screen: string;
  min: string;
  max: string;
  fit: string;
}

// 最大宽度token
export interface MaxWidthTokens {
  0: string;
  none: string;
  xs: string;    // 320px
  sm: string;    // 384px
  md: string;    // 448px
  lg: string;    // 512px
  xl: string;    // 576px
  '2xl': string; // 672px
  '3xl': string; // 768px
  '4xl': string; // 896px
  '5xl': string; // 1024px
  '6xl': string; // 1152px
  '7xl': string; // 1280px
  full: string;
  min: string;
  max: string;
  fit: string;
  prose: string; // 65ch
  // 屏幕尺寸
  screen: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

// 间距token定义
export const spacingTokens: SpacingTokens = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
};

// 圆角token定义
export const borderRadiusTokens: BorderRadiusTokens = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px (默认)
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// 边框宽度token定义
export const borderWidthTokens: BorderWidthTokens = {
  0: '0px',
  1: '1px', // 默认
  2: '2px',
  4: '4px',
  8: '8px',
};

// Z-index层级token定义
export const zIndexTokens: ZIndexTokens = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  // 语义化层级
  behind: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1010,
  fixed: 1020,
  overlay: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  maximum: 9999,
};

// 尺寸token定义
export const sizeTokens: SizeTokens = {
  ...spacingTokens,
  // 分数尺寸
  auto: 'auto',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '2/4': '50%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  '1/6': '16.666667%',
  '2/6': '33.333333%',
  '3/6': '50%',
  '4/6': '66.666667%',
  '5/6': '83.333333%',
  '1/12': '8.333333%',
  '2/12': '16.666667%',
  '3/12': '25%',
  '4/12': '33.333333%',
  '5/12': '41.666667%',
  '6/12': '50%',
  '7/12': '58.333333%',
  '8/12': '66.666667%',
  '9/12': '75%',
  '10/12': '83.333333%',
  '11/12': '91.666667%',
  full: '100%',
  screen: '100vh',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',
};

// 最大宽度token定义
export const maxWidthTokens: MaxWidthTokens = {
  0: '0rem',
  none: 'none',
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  full: '100%',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',
  prose: '65ch',
  screen: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// 容器token
export interface ContainerTokens {
  // 容器最大宽度
  maxWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  // 容器内边距
  padding: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

// 容器token定义
export const containerTokens: ContainerTokens = {
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  padding: {
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '2.5rem',  // 40px
    '2xl': '3rem', // 48px
  },
};

// 响应式间距token
export interface ResponsiveSpacingTokens {
  // 间距断点
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  
  // 响应式间距预设
  responsive: {
    xs: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    sm: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    md: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    lg: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    xl: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

// 响应式间距token定义
export const responsiveSpacingTokens: ResponsiveSpacingTokens = {
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  responsive: {
    xs: {
      base: '0.5rem',  // 8px
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.25rem',   // 20px
      xl: '1.5rem',    // 24px
    },
    sm: {
      base: '1rem',    // 16px
      sm: '1.25rem',   // 20px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
      xl: '2.5rem',    // 40px
    },
    md: {
      base: '1.5rem',  // 24px
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
      xl: '4rem',      // 64px
    },
    lg: {
      base: '2rem',    // 32px
      sm: '2.5rem',    // 40px
      md: '3rem',      // 48px
      lg: '4rem',      // 64px
      xl: '5rem',      // 80px
    },
    xl: {
      base: '2.5rem',  // 40px
      sm: '3rem',      // 48px
      md: '4rem',      // 64px
      lg: '5rem',      // 80px
      xl: '6rem',      // 96px
    },
  },
};

// 间距工具函数
export const spacingUtils = {
  /**
   * 转换间距值到CSS属性
   */
  toCSS: (value: string | number): string => {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  },

  /**
   * 获取间距值
   */
  getSpacing: (key: keyof SpacingTokens): string => {
    return spacingTokens[key];
  },

  /**
   * 获取响应式间距CSS
   */
  getResponsiveSpacing: (size: keyof ResponsiveSpacingTokens['responsive']): string => {
    const spacing = responsiveSpacingTokens.responsive[size];
    return `
      padding: ${spacing.base};
      @media (min-width: ${responsiveSpacingTokens.breakpoints.sm}) {
        padding: ${spacing.sm};
      }
      @media (min-width: ${responsiveSpacingTokens.breakpoints.md}) {
        padding: ${spacing.md};
      }
      @media (min-width: ${responsiveSpacingTokens.breakpoints.lg}) {
        padding: ${spacing.lg};
      }
      @media (min-width: ${responsiveSpacingTokens.breakpoints.xl}) {
        padding: ${spacing.xl};
      }
    `;
  },

  /**
   * 计算负间距
   */
  negative: (value: string): string => {
    if (value === '0px' || value === '0') return '0px';
    return `-${value}`;
  },

  /**
   * 验证间距值
   */
  validateSpacing: (value: string): boolean => {
    const remRegex = /^\d*\.?\d+rem$/;
    const pxRegex = /^\d*\.?\d+px$/;
    const emRegex = /^\d*\.?\d+em$/;
    const percentRegex = /^\d*\.?\d+%$/;
    const zeroRegex = /^0$/;
    
    return remRegex.test(value) || 
           pxRegex.test(value) || 
           emRegex.test(value) || 
           percentRegex.test(value) || 
           zeroRegex.test(value) ||
           value === 'auto';
  },

  /**
   * 转换px到rem
   */
  pxToRem: (px: number, baseFontSize: number = 16): string => {
    return `${px / baseFontSize}rem`;
  },

  /**
   * 转换rem到px
   */
  remToPx: (rem: string, baseFontSize: number = 16): number => {
    const remValue = parseFloat(rem.replace('rem', ''));
    return remValue * baseFontSize;
  },

  /**
   * 生成间距scale
   */
  generateScale: (baseSize: number = 4, steps: number[] = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64]): Record<string, string> => {
    const scale: Record<string, string> = {};
    steps.forEach(step => {
      const pxValue = step * baseSize;
      scale[step.toString()] = `${pxValue / 16}rem`;
    });
    return scale;
  },
};

// 布局工具函数
export const layoutUtils = {
  /**
   * 生成容器CSS
   */
  getContainerCSS: (breakpoint?: keyof ContainerTokens['maxWidth']): string => {
    if (breakpoint) {
      return `
        max-width: ${containerTokens.maxWidth[breakpoint]};
        padding-left: ${containerTokens.padding[breakpoint]};
        padding-right: ${containerTokens.padding[breakpoint]};
        margin-left: auto;
        margin-right: auto;
      `;
    }
    
    return `
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: ${containerTokens.padding.sm};
      padding-right: ${containerTokens.padding.sm};
      
      @media (min-width: ${responsiveSpacingTokens.breakpoints.sm}) {
        max-width: ${containerTokens.maxWidth.sm};
        padding-left: ${containerTokens.padding.md};
        padding-right: ${containerTokens.padding.md};
      }
      
      @media (min-width: ${responsiveSpacingTokens.breakpoints.md}) {
        max-width: ${containerTokens.maxWidth.md};
        padding-left: ${containerTokens.padding.lg};
        padding-right: ${containerTokens.padding.lg};
      }
      
      @media (min-width: ${responsiveSpacingTokens.breakpoints.lg}) {
        max-width: ${containerTokens.maxWidth.lg};
        padding-left: ${containerTokens.padding.xl};
        padding-right: ${containerTokens.padding.xl};
      }
      
      @media (min-width: ${responsiveSpacingTokens.breakpoints.xl}) {
        max-width: ${containerTokens.maxWidth.xl};
        padding-left: ${containerTokens.padding['2xl']};
        padding-right: ${containerTokens.padding['2xl']};
      }
      
      @media (min-width: ${responsiveSpacingTokens.breakpoints['2xl']}) {
        max-width: ${containerTokens.maxWidth['2xl']};
      }
    `;
  },

  /**
   * 获取层级值
   */
  getZIndex: (layer: keyof ZIndexTokens): number | string => {
    return zIndexTokens[layer];
  },

  /**
   * 生成圆角CSS
   */
  getBorderRadius: (radius: keyof BorderRadiusTokens): string => {
    return `border-radius: ${borderRadiusTokens[radius]};`;
  },
};

// 导出所有间距和布局token
export {
  spacingTokens as spacing,
  borderRadiusTokens as borderRadius,
  borderWidthTokens as borderWidth,
  zIndexTokens as zIndex,
  sizeTokens as size,
  maxWidthTokens as maxWidth,
  containerTokens as container,
  responsiveSpacingTokens as responsive,
};