declare module 'tw-animate-css' {
  import type { PluginAPI } from 'tailwindcss/types/config';
  
  interface TwAnimateCssOptions {
    animations?: string[];
    keyframes?: Record<string, Record<string, string>>;
    easing?: Record<string, string>;
    duration?: Record<string, string>;
    delay?: Record<string, string>;
  }

  function twAnimateCSS(options?: TwAnimateCssOptions): (api: PluginAPI) => void;
  
  export = twAnimateCSS;
}