/**
 * 设计token - 字体排版系统
 * 
 * 定义字体族、字号阶梯、行高比例、字重级别
 * 支持响应式排版和可访问性
 */

// 字体族定义
export interface FontFamilyTokens {
  sans: string[];
  serif: string[];
  mono: string[];
  display: string[];
}

// 字号token (基于rem单位)
export interface FontSizeTokens {
  xs: {
    fontSize: string;
    lineHeight: string;
  };
  sm: {
    fontSize: string;
    lineHeight: string;
  };
  base: {
    fontSize: string;
    lineHeight: string;
  };
  lg: {
    fontSize: string;
    lineHeight: string;
  };
  xl: {
    fontSize: string;
    lineHeight: string;
  };
  '2xl': {
    fontSize: string;
    lineHeight: string;
  };
  '3xl': {
    fontSize: string;
    lineHeight: string;
  };
  '4xl': {
    fontSize: string;
    lineHeight: string;
  };
  '5xl': {
    fontSize: string;
    lineHeight: string;
  };
  '6xl': {
    fontSize: string;
    lineHeight: string;
  };
  '7xl': {
    fontSize: string;
    lineHeight: string;
  };
  '8xl': {
    fontSize: string;
    lineHeight: string;
  };
  '9xl': {
    fontSize: string;
    lineHeight: string;
  };
}

// 字重token
export interface FontWeightTokens {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

// 行高token
export interface LineHeightTokens {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

// 字母间距token
export interface LetterSpacingTokens {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

// 排版预设token
export interface TypographyPresetTokens {
  // 标题预设
  heading: {
    h1: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    h2: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    h3: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    h4: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    h5: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    h6: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
  };
  
  // 正文预设
  body: {
    large: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    medium: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    small: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
  };
  
  // 标签和说明文本预设
  label: {
    large: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    medium: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    small: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
  };
  
  // 代码文本预设
  code: {
    large: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    medium: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
    small: {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    };
  };
}

// 字体族定义
export const fontFamilyTokens: FontFamilyTokens = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
  serif: [
    'ui-serif',
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'SF Mono',
    'Monaco',
    'Inconsolata',
    'Roboto Mono',
    'Source Code Pro',
    'Menlo',
    'Consolas',
    'DejaVu Sans Mono',
    'monospace',
  ],
  display: [
    'Inter Display',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
};

// 字号token定义
export const fontSizeTokens: FontSizeTokens = {
  xs: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem', // 16px
  },
  sm: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
  },
  base: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
  },
  lg: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.75rem', // 28px
  },
  xl: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.75rem', // 28px
  },
  '2xl': {
    fontSize: '1.5rem', // 24px
    lineHeight: '2rem', // 32px
  },
  '3xl': {
    fontSize: '1.875rem', // 30px
    lineHeight: '2.25rem', // 36px
  },
  '4xl': {
    fontSize: '2.25rem', // 36px
    lineHeight: '2.5rem', // 40px
  },
  '5xl': {
    fontSize: '3rem', // 48px
    lineHeight: '1',
  },
  '6xl': {
    fontSize: '3.75rem', // 60px
    lineHeight: '1',
  },
  '7xl': {
    fontSize: '4.5rem', // 72px
    lineHeight: '1',
  },
  '8xl': {
    fontSize: '6rem', // 96px
    lineHeight: '1',
  },
  '9xl': {
    fontSize: '8rem', // 128px
    lineHeight: '1',
  },
};

// 字重token定义
export const fontWeightTokens: FontWeightTokens = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// 行高token定义
export const lineHeightTokens: LineHeightTokens = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// 字母间距token定义
export const letterSpacingTokens: LetterSpacingTokens = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// 排版预设token定义
export const typographyPresetTokens: TypographyPresetTokens = {
  heading: {
    h1: {
      fontSize: '3rem', // 48px
      lineHeight: '1.0833', // 52px
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.1111', // 40px
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.2', // 36px
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.3333', // 32px
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4', // 28px
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.5556', // 28px
      fontWeight: 600,
      letterSpacing: '0em',
    },
  },
  
  body: {
    large: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.5556', // 28px
      fontWeight: 400,
      letterSpacing: '0em',
    },
    medium: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5', // 24px
      fontWeight: 400,
      letterSpacing: '0em',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4286', // 20px
      fontWeight: 400,
      letterSpacing: '0em',
    },
  },
  
  label: {
    large: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5', // 24px
      fontWeight: 500,
      letterSpacing: '0em',
    },
    medium: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4286', // 20px
      fontWeight: 500,
      letterSpacing: '0em',
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.3333', // 16px
      fontWeight: 500,
      letterSpacing: '0.025em',
    },
  },
  
  code: {
    large: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5', // 24px
      fontWeight: 400,
      letterSpacing: '0em',
    },
    medium: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4286', // 20px
      fontWeight: 400,
      letterSpacing: '0em',
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.3333', // 16px
      fontWeight: 400,
      letterSpacing: '0em',
    },
  },
};

// 响应式排版token
export interface ResponsiveTypographyTokens {
  // 移动端优先的响应式断点
  breakpoints: {
    sm: string; // 640px
    md: string; // 768px
    lg: string; // 1024px
    xl: string; // 1280px
    '2xl': string; // 1536px
  };
  
  // 响应式字号调整
  responsive: {
    h1: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    h2: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    h3: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    body: {
      base: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

// 响应式排版token定义
export const responsiveTypographyTokens: ResponsiveTypographyTokens = {
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  responsive: {
    h1: {
      base: '2.25rem', // 36px
      sm: '2.5rem', // 40px
      md: '3rem', // 48px
      lg: '3.5rem', // 56px
      xl: '4rem', // 64px
    },
    h2: {
      base: '1.875rem', // 30px
      sm: '2rem', // 32px
      md: '2.25rem', // 36px
      lg: '2.5rem', // 40px
      xl: '3rem', // 48px
    },
    h3: {
      base: '1.5rem', // 24px
      sm: '1.625rem', // 26px
      md: '1.875rem', // 30px
      lg: '2rem', // 32px
      xl: '2.25rem', // 36px
    },
    body: {
      base: '0.875rem', // 14px
      sm: '1rem', // 16px
      md: '1rem', // 16px
      lg: '1rem', // 16px
      xl: '1.125rem', // 18px
    },
  },
};

// 字体加载配置
export interface FontLoadingConfig {
  fontDisplay: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preloadFonts: {
    href: string;
    crossorigin: 'anonymous' | 'use-credentials';
  }[];
}

// 字体加载配置
export const fontLoadingConfig: FontLoadingConfig = {
  fontDisplay: 'swap',
  preloadFonts: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
      crossorigin: 'anonymous',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap',
      crossorigin: 'anonymous',
    },
  ],
};

// 排版工具函数
export const typographyUtils = {
  /**
   * 生成CSS字体族字符串
   */
  getFontFamilyCSS: (family: keyof FontFamilyTokens): string => {
    return fontFamilyTokens[family].map(font => 
      font.includes(' ') ? `"${font}"` : font
    ).join(', ');
  },

  /**
   * 计算相对行高
   */
  calculateRelativeLineHeight: (fontSize: string, lineHeight: string): number => {
    const fontSizeNum = parseFloat(fontSize);
    const lineHeightNum = parseFloat(lineHeight);
    return lineHeightNum / fontSizeNum;
  },

  /**
   * 获取响应式字号CSS
   */
  getResponsiveFontSize: (element: keyof ResponsiveTypographyTokens['responsive']): string => {
    const sizes = responsiveTypographyTokens.responsive[element];
    return `
      font-size: ${sizes.base};
      @media (min-width: ${responsiveTypographyTokens.breakpoints.sm}) {
        font-size: ${sizes.sm};
      }
      @media (min-width: ${responsiveTypographyTokens.breakpoints.md}) {
        font-size: ${sizes.md};
      }
      @media (min-width: ${responsiveTypographyTokens.breakpoints.lg}) {
        font-size: ${sizes.lg};
      }
      @media (min-width: ${responsiveTypographyTokens.breakpoints.xl}) {
        font-size: ${sizes.xl};
      }
    `;
  },

  /**
   * 生成排版预设CSS类
   */
  generateTypographyClass: (preset: any): string => {
    return `
      font-size: ${preset.fontSize};
      line-height: ${preset.lineHeight};
      font-weight: ${preset.fontWeight};
      letter-spacing: ${preset.letterSpacing};
    `;
  },

  /**
   * 验证字体大小值
   */
  validateFontSize: (size: string): boolean => {
    const remRegex = /^\d*\.?\d+rem$/;
    const pxRegex = /^\d*\.?\d+px$/;
    const emRegex = /^\d*\.?\d+em$/;
    return remRegex.test(size) || pxRegex.test(size) || emRegex.test(size);
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
};

// 导出所有排版token
export {
  fontFamilyTokens as fontFamily,
  fontSizeTokens as fontSize,
  fontWeightTokens as fontWeight,
  lineHeightTokens as lineHeight,
  letterSpacingTokens as letterSpacing,
  typographyPresetTokens as typography,
  responsiveTypographyTokens as responsive,
};