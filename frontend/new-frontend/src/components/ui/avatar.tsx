'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Avatar size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Image source for the avatar
   */
  src?: string;
  /**
   * Alt text for the image
   */
  alt?: string;
  /**
   * Fallback text (usually initials) when image fails to load
   */
  fallback?: string;
  /**
   * Avatar shape
   */
  shape?: 'circle' | 'square';
  /**
   * Online status indicator
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /**
   * Whether to show status indicator
   */
  showStatus?: boolean;
}

const avatarSizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const statusIndicatorSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

const statusColorClasses = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  away: 'bg-warning',
  busy: 'bg-error',
};

const avatarShapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-md',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size = 'md',
      src,
      alt,
      fallback,
      shape = 'circle',
      status,
      showStatus = false,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const initials = fallback || alt?.charAt(0)?.toUpperCase() || '?';

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden bg-muted font-medium text-muted-foreground',
            avatarSizeClasses[size],
            avatarShapeClasses[shape]
          )}
        >
          {src && !imageError ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {showStatus && status && (
          <div
            className={cn(
              'absolute -bottom-0 -right-0 rounded-full border-2 border-background',
              statusIndicatorSizeClasses[size],
              statusColorClasses[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group component for displaying multiple avatars
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show before showing count
   */
  max?: number;
  /**
   * Spacing between avatars (negative margin)
   */
  spacing?: 'tight' | 'normal' | 'loose';
  /**
   * Size for all avatars in the group
   */
  size?: AvatarProps['size'];
}

const spacingClasses = {
  tight: '-space-x-1',
  normal: '-space-x-2',
  loose: '-space-x-1',
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      max = 3,
      spacing = 'normal',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const hiddenCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingClasses[spacing], className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="relative ring-2 ring-background rounded-full">
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
              : child}
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <div className="relative ring-2 ring-background rounded-full">
            <Avatar
              size={size}
              fallback={`+${hiddenCount}`}
              className="bg-muted-foreground text-background"
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';