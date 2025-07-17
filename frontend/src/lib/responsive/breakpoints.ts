import { useEffect, useState } from 'react';
import { useLayoutStore } from '@/stores/layout-store';

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  wide: 1440,
} as const;

export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tablet}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
} as const;

export const useBreakpoint = () => {
  const { state, actions } = useLayoutStore();
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      
      if (width < BREAKPOINTS.mobile) {
        breakpoint = 'mobile';
      } else if (width < BREAKPOINTS.tablet) {
        breakpoint = 'tablet';
      } else {
        breakpoint = 'desktop';
      }
      
      if (breakpoint !== state.currentBreakpoint) {
        actions.updateBreakpoint(breakpoint);
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [state.currentBreakpoint, actions]);
  
  return state.currentBreakpoint;
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);
  
  return matches;
};