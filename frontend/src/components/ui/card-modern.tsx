import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      rounded = 'xl',
      shadow = 'md',
      hover = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative overflow-hidden transition-all duration-300
      ${interactive ? 'cursor-pointer' : ''}
    `;

    const variants = {
      default: `
        bg-white border border-gray-200 text-gray-900
        ${hover ? 'hover:shadow-lg hover:border-gray-300' : ''}
        ${interactive ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
      elevated: `
        bg-white border border-gray-100 text-gray-900
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        ${interactive ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
      glass: `
        bg-white/80 backdrop-blur-lg border border-white/20 text-gray-900
        ${hover ? 'hover:bg-white/90 hover:border-white/30' : ''}
        ${interactive ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
      bordered: `
        bg-white border-2 border-gray-200 text-gray-900
        ${hover ? 'hover:border-blue-300 hover:shadow-lg' : ''}
        ${interactive ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
      gradient: `
        bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900
        border border-blue-200
        ${hover ? 'hover:from-blue-100 hover:to-purple-100 hover:shadow-lg' : ''}
        ${interactive ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    const roundeds = {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      '2xl': 'rounded-3xl',
    };

    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          roundeds[rounded],
          shadows[shadow],
          className
        )}
        {...props}
      >
        {/* 装饰性渐变背景 */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* 内容 */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card 子组件
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};