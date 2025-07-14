'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  /**
   * Content to show in the tooltip
   */
  content: React.ReactNode;
  /**
   * Position of the tooltip relative to the trigger
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Delay before showing tooltip (in ms)
   */
  delay?: number;
  /**
   * Whether tooltip is disabled
   */
  disabled?: boolean;
  /**
   * Custom class for tooltip container
   */
  className?: string;
  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;
}

const placementClasses = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground',
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      delay = 300,
      disabled = false,
      className,
      children,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<any>();
    const triggerRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
      if (disabled) return;
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (disabled || !content) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <div ref={triggerRef}>{children}</div>
        
        {isVisible && (
          <div
            className={cn(
              'absolute z-50 px-2 py-1 text-sm text-background bg-foreground rounded-md shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              placementClasses[placement],
              className
            )}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                arrowClasses[placement]
              )}
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';