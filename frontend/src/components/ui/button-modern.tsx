import * as React from 'react';
import { cn } from '@/lib/utils';
import { designSystem } from '@/styles/design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 
      font-medium transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-700 
        text-white shadow-lg shadow-blue-500/25
        hover:from-blue-700 hover:to-blue-800 
        hover:shadow-xl hover:shadow-blue-500/40
        focus:ring-blue-500
        active:scale-95
      `,
      secondary: `
        bg-gradient-to-r from-gray-100 to-gray-200 
        text-gray-900 shadow-md
        hover:from-gray-200 hover:to-gray-300
        hover:shadow-lg
        focus:ring-gray-500
        active:scale-95
      `,
      outline: `
        border-2 border-blue-300 
        text-blue-700 bg-white
        hover:bg-blue-50 hover:border-blue-400
        focus:ring-blue-500
        active:scale-95
      `,
      ghost: `
        text-gray-700 bg-white
        hover:bg-gray-100 hover:text-gray-900
        focus:ring-gray-500
        active:scale-95
      `,
      destructive: `
        bg-gradient-to-r from-red-600 to-red-700 
        text-white shadow-lg shadow-red-500/25
        hover:from-red-700 hover:to-red-800 
        hover:shadow-xl hover:shadow-red-500/40
        focus:ring-red-500
        active:scale-95
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-2xl',
    };

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* 背景动画效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* 内容 */}
        <div className="relative flex items-center gap-2">
          {loading ? (
            <LoadingSpinner />
          ) : (
            leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
          )}
          
          {children && (
            <span className={loading ? 'opacity-0' : 'opacity-100'}>
              {children}
            </span>
          )}
          
          {!loading && rightIcon && (
            <span className="flex-shrink-0">{rightIcon}</span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };