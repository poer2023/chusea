/**
 * 主题管理系统
 * 
 * 统一管理亮色和暗色主题，提供主题切换和配置功能
 */

import lightThemeConfig from './light';
import darkThemeConfig from './dark';

import type { ThemeTokens } from '../tokens';

// 主题配置接口
export interface ThemeConfig {
  theme: ThemeTokens;
  cssVariables: Record<string, string>;
  css: string;
  className: string;
  mediaQuery: string;
  metadata: {
    name: string;
    id: string;
    description: string;
    version: string;
    author: string;
    created: string;
    tags: string[];
    accessibility: {
      contrastRatio: string;
      colorBlindSafe: boolean;
      highContrast: boolean;
      reducedEyeStrain?: boolean;
    };
    features: string[];
  };
}

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system';

// 主题配置映射
export const themeConfigs: Record<'light' | 'dark', ThemeConfig> = {
  light: lightThemeConfig,
  dark: darkThemeConfig,
};

// 主题管理器
export class ThemeManager {
  private currentTheme: ThemeMode = 'system';
  private resolvedTheme: 'light' | 'dark' = 'light';
  private listeners: Set<(theme: 'light' | 'dark') => void> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTheme();
    }
  }

  /**
   * 初始化主题系统
   */
  private initializeTheme(): void {
    // 从localStorage获取保存的主题设置
    const savedTheme = localStorage.getItem('chusea-theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }

    // 设置媒体查询监听器
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // 初始化解析主题
    this.updateResolvedTheme();
    this.applyTheme();
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange(): void {
    if (this.currentTheme === 'system') {
      this.updateResolvedTheme();
      this.applyTheme();
      this.notifyListeners();
    }
  }

  /**
   * 更新解析的主题
   */
  private updateResolvedTheme(): void {
    if (this.currentTheme === 'system') {
      this.resolvedTheme = this.mediaQuery?.matches ? 'dark' : 'light';
    } else {
      this.resolvedTheme = this.currentTheme;
    }
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // 移除现有主题类
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');

    // 添加新主题类
    const themeConfig = themeConfigs[this.resolvedTheme];
    root.classList.add(themeConfig.className);
    body.classList.add(themeConfig.className);

    // 设置data属性
    root.setAttribute('data-theme', this.resolvedTheme);

    // 更新color-scheme
    root.style.colorScheme = this.resolvedTheme;

    // 更新meta theme-color
    this.updateMetaThemeColor();
  }

  /**
   * 更新meta theme-color标签
   */
  private updateMetaThemeColor(): void {
    if (typeof document === 'undefined') return;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    const themeConfig = themeConfigs[this.resolvedTheme];
    const backgroundColor = themeConfig.cssVariables['--color-background-primary'];
    metaThemeColor.setAttribute('content', backgroundColor);
  }

  /**
   * 通知监听器主题变化
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.resolvedTheme));
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.updateResolvedTheme();
    this.applyTheme();
    this.notifyListeners();

    // 保存到localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('chusea-theme', theme);
    }
  }

  /**
   * 获取当前主题设置
   */
  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * 获取解析后的实际主题
   */
  getResolvedTheme(): 'light' | 'dark' {
    return this.resolvedTheme;
  }

  /**
   * 切换主题（在light、dark、system之间循环）
   */
  toggleTheme(): void {
    const themes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  /**
   * 快速切换亮色/暗色主题（跳过system）
   */
  toggleLightDark(): void {
    if (this.currentTheme === 'system') {
      // 如果当前是system，根据实际解析的主题切换
      this.setTheme(this.resolvedTheme === 'light' ? 'dark' : 'light');
    } else {
      this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * 添加主题变化监听器
   */
  addListener(listener: (theme: 'light' | 'dark') => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 获取当前主题配置
   */
  getCurrentThemeConfig(): ThemeConfig {
    return themeConfigs[this.resolvedTheme];
  }

  /**
   * 获取当前主题token
   */
  getCurrentTokens(): ThemeTokens {
    return this.getCurrentThemeConfig().theme;
  }

  /**
   * 检查是否支持主题切换
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
    this.listeners.clear();
  }
}

// 全局主题管理器实例
export const themeManager = new ThemeManager();

// 主题工具函数
export const themeUtils = {
  /**
   * 生成完整的主题CSS
   */
  generateThemeCSS(): string {
    const lightCSS = lightThemeConfig.css;
    const darkCSS = darkThemeConfig.css;

    return `
/* Light theme (default) */
:root {
${lightCSS}
}

/* Dark theme (system preference) */
@media ${darkThemeConfig.mediaQuery} {
  :root {
${darkCSS}
  }
}

/* Light theme (explicit) */
.${lightThemeConfig.className},
[data-theme="light"] {
${lightCSS}
}

/* Dark theme (explicit) */
.${darkThemeConfig.className},
[data-theme="dark"] {
${darkCSS}
}

/* Base theme styles */
* {
  transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out, color 150ms ease-in-out;
}

body {
  background-color: var(--color-background-primary);
  color: var(--color-foreground-primary);
  font-family: var(--font-family-sans);
}
    `.trim();
  },

  /**
   * 注入主题CSS到页面
   */
  injectThemeCSS(): void {
    if (typeof document === 'undefined') return;

    const existingStyle = document.getElementById('chusea-theme-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'chusea-theme-css';
    style.textContent = themeUtils.generateThemeCSS();
    document.head.appendChild(style);
  },

  /**
   * 获取主题对比信息
   */
  getThemeComparison(): {
    light: ThemeConfig['metadata'];
    dark: ThemeConfig['metadata'];
  } {
    return {
      light: lightThemeConfig.metadata,
      dark: darkThemeConfig.metadata,
    };
  },

  /**
   * 验证主题配置
   */
  validateThemeConfig(config: ThemeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必需的属性
    if (!config.theme) errors.push('Missing theme tokens');
    if (!config.cssVariables) errors.push('Missing CSS variables');
    if (!config.css) errors.push('Missing CSS string');
    if (!config.className) errors.push('Missing theme class name');
    if (!config.metadata) errors.push('Missing theme metadata');

    // 检查元数据
    if (config.metadata) {
      if (!config.metadata.name) errors.push('Missing theme name');
      if (!config.metadata.id) errors.push('Missing theme ID');
      if (!config.metadata.version) errors.push('Missing theme version');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 创建自定义主题
   */
  createCustomTheme(
    id: string,
    name: string,
    baseTheme: 'light' | 'dark',
    overrides: Partial<ThemeTokens>
  ): ThemeConfig {
    const baseConfig = themeConfigs[baseTheme];
    const customTheme = {
      ...baseConfig.theme,
      ...overrides,
    };

    // 生成CSS变量（这里简化处理，实际可能需要更复杂的逻辑）
    const cssVariables = { ...baseConfig.cssVariables };
    
    return {
      theme: customTheme,
      cssVariables,
      css: Object.entries(cssVariables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n'),
      className: `theme-${id}`,
      mediaQuery: baseConfig.mediaQuery,
      metadata: {
        name,
        id,
        description: `Custom theme based on ${baseTheme} theme`,
        version: '1.0.0',
        author: 'Custom',
        created: new Date().toISOString(),
        tags: ['custom', baseTheme],
        accessibility: baseConfig.metadata.accessibility,
        features: [...baseConfig.metadata.features, 'custom'],
      },
    };
  },
};

// 导出所有主题相关内容
export {
  lightThemeConfig,
  darkThemeConfig,
};

export type {
  ThemeTokens,
};

// 默认导出主题管理器
export default themeManager;