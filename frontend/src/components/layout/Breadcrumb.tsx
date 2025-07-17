'use client';

/**
 * Breadcrumb - Navigation Breadcrumb Component
 * 
 * Features:
 * - Hierarchical navigation breadcrumbs
 * - Responsive design with collapsing
 * - Keyboard navigation support
 * - Accessibility features
 * - Customizable separators and styling
 * - Auto-generation from route path
 * - Context menu for quick navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNavigation, useScreenInfo } from '@/stores/ui-store';

import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { Tooltip } from '@/components/ui/tooltip';

import {
  ChevronRight,
  Home,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Bookmark,
  Share,
  ArrowLeft,
  ArrowRight,
  Slash,
  Dot,
  ChevronDown,
} from 'lucide-react';

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  isClickable?: boolean;
  disabled?: boolean;
  tooltip?: string;
  metadata?: Record<string, any>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  showIcons?: boolean;
  showTooltips?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
  itemClassName?: string;
  separatorClassName?: string;
  autoGenerate?: boolean;
  enableKeyboardNav?: boolean;
  enableContextMenu?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  onItemHover?: (item: BreadcrumbItem, index: number) => void;
  renderItem?: (item: BreadcrumbItem, index: number, isLast: boolean) => React.ReactNode;
  renderSeparator?: (index: number) => React.ReactNode;
}

// Default separator components
const separators = {
  chevron: <ChevronRight className="h-4 w-4" />,
  slash: <Slash className="h-4 w-4" />,
  dot: <Dot className="h-4 w-4" />,
  arrow: <ArrowRight className="h-4 w-4" />,
};

// Context menu for breadcrumb items
const BreadcrumbContextMenu: React.FC<{
  item: BreadcrumbItem;
  onCopy: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onOpenInNewTab: () => void;
}> = ({ item, onCopy, onShare, onBookmark, onOpenInNewTab }) => {
  return (
    <div className="min-w-48">
      <Dropdown.Item icon={<Copy className="h-4 w-4" />} onClick={onCopy}>
        Copy link
      </Dropdown.Item>
      <Dropdown.Item icon={<Share className="h-4 w-4" />} onClick={onShare}>
        Share
      </Dropdown.Item>
      <Dropdown.Item icon={<Bookmark className="h-4 w-4" />} onClick={onBookmark}>
        Bookmark
      </Dropdown.Item>
      {item.href && (
        <Dropdown.Item icon={<ExternalLink className="h-4 w-4" />} onClick={onOpenInNewTab}>
          Open in new tab
        </Dropdown.Item>
      )}
    </div>
  );
};

// Collapsed breadcrumb items dropdown
const CollapsedItemsDropdown: React.FC<{
  items: BreadcrumbItem[];
  onItemClick: (item: BreadcrumbItem, index: number) => void;
}> = ({ items, onItemClick }) => {
  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
      placement="bottom-start"
    >
      <div className="py-1">
        {items.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <Dropdown.Item
              key={item.id || index}
              icon={ItemIcon && <ItemIcon className="h-4 w-4" />}
              onClick={() => onItemClick(item, index)}
              disabled={item.disabled}
            >
              {item.label}
            </Dropdown.Item>
          );
        })}
      </div>
    </Dropdown>
  );
};

// Single breadcrumb item component
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  variant: 'default' | 'compact' | 'minimal';
  size: 'sm' | 'md' | 'lg';
  showIcons: boolean;
  showTooltips: boolean;
  enableContextMenu: boolean;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  onItemHover?: (item: BreadcrumbItem, index: number) => void;
  renderItem?: (item: BreadcrumbItem, index: number, isLast: boolean) => React.ReactNode;
}> = ({
  item,
  index,
  isLast,
  variant,
  size,
  showIcons,
  showTooltips,
  enableContextMenu,
  className,
  onItemClick,
  onItemHover,
  renderItem,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (item.disabled) return;
    
    if (item.isClickable !== false && item.href) {
      router.push(item.href);
    }
    
    onItemClick?.(item, index);
  }, [item, index, router, onItemClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onItemHover?.(item, index);
  }, [item, index, onItemHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (item.href) {
      navigator.clipboard.writeText(window.location.origin + item.href);
    }
  }, [item.href]);

  const handleShare = useCallback(() => {
    if (navigator.share && item.href) {
      navigator.share({
        title: item.label,
        url: window.location.origin + item.href,
      });
    }
  }, [item.href, item.label]);

  const handleBookmark = useCallback(() => {
    // Implementation depends on your bookmarking system
    console.log('Bookmark item:', item);
  }, [item]);

  const handleOpenInNewTab = useCallback(() => {
    if (item.href) {
      window.open(item.href, '_blank');
    }
  }, [item.href]);

  // Use custom render if provided
  if (renderItem) {
    return <>{renderItem(item, index, isLast)}</>;
  }

  const ItemIcon = item.icon;
  const isClickable = item.isClickable !== false && item.href && !item.disabled;

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  const itemContent = (
    <div
      className={cn(
        'flex items-center space-x-1.5',
        variant === 'compact' && 'space-x-1',
        className
      )}
    >
      {showIcons && ItemIcon && (
        <ItemIcon className={cn(
          'shrink-0',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )} />
      )}
      <span className={cn(
        'truncate',
        isLast && 'font-medium',
        item.disabled && 'opacity-50'
      )}>
        {item.label}
      </span>
    </div>
  );

  const buttonElement = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        sizeClasses[size],
        'justify-start font-normal',
        isLast && 'font-medium text-foreground cursor-default',
        !isLast && 'text-muted-foreground hover:text-foreground',
        item.disabled && 'opacity-50 cursor-not-allowed',
        !isClickable && 'cursor-default hover:bg-transparent',
        variant === 'minimal' && 'hover:bg-transparent px-1'
      )}
      onClick={isClickable ? handleClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={item.disabled}
      aria-current={isLast ? 'page' : undefined}
    >
      {itemContent}
    </Button>
  );

  const wrappedElement = enableContextMenu && !isLast ? (
    <Dropdown
      trigger={buttonElement}
      placement="bottom-start"
      // triggerMode="contextmenu"
    >
      <BreadcrumbContextMenu
        item={item}
        onCopy={handleCopy}
        onShare={handleShare}
        onBookmark={handleBookmark}
        onOpenInNewTab={handleOpenInNewTab}
      />
    </Dropdown>
  ) : buttonElement;

  return showTooltips && item.tooltip ? (
    <Tooltip content={item.tooltip}>
      {wrappedElement}
    </Tooltip>
  ) : wrappedElement;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = separators.chevron,
  maxItems = 3,
  showHome = true,
  showIcons = true,
  showTooltips = false,
  variant = 'default',
  size = 'md',
  className,
  containerClassName,
  itemClassName,
  separatorClassName,
  autoGenerate = true,
  enableKeyboardNav = true,
  enableContextMenu = true,
  onItemClick,
  onItemHover,
  renderItem,
  renderSeparator,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { breadcrumbs: storeBreadcrumbs } = useNavigation();
  const { isMobile } = useScreenInfo();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use provided items or generate from store/pathname
  const breadcrumbItems = items || storeBreadcrumbs || [];

  // Auto-generate breadcrumbs if enabled and no items provided
  const finalItems = autoGenerate && breadcrumbItems.length === 0 
    ? generateBreadcrumbsFromPath(pathname)
    : breadcrumbItems;

  // Add home item if enabled
  const allItems = showHome 
    ? [{ label: 'Home', href: '/', icon: Home, isClickable: true }, ...finalItems]
    : finalItems;

  // Handle responsive collapsing
  const shouldCollapse = isMobile || (allItems.length > maxItems);
  const visibleItems = shouldCollapse && allItems.length > maxItems
    ? [
        allItems[0], // First item (usually Home)
        ...allItems.slice(-(maxItems - 1)) // Last items
      ]
    : allItems;

  const collapsedItems = shouldCollapse && allItems.length > maxItems
    ? allItems.slice(1, -(maxItems - 1))
    : [];

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            // Navigate to previous breadcrumb
            const currentIndex = allItems.findIndex(item => (item as any).isActive);
            if (currentIndex > 0) {
              const prevItem = allItems[currentIndex - 1];
              if (prevItem.href) {
                router.push(prevItem.href);
              }
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            // Navigate to next breadcrumb if available
            const activeIndex = allItems.findIndex(item => (item as any).isActive);
            if (activeIndex < allItems.length - 1) {
              const nextItem = allItems[activeIndex + 1];
              if (nextItem.href) {
                router.push(nextItem.href);
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, allItems, router]);

  if (allItems.length === 0) {
    return null;
  }

  return (
    <nav
      ref={containerRef}
      className={cn(
        'flex items-center space-x-1',
        variant === 'compact' && 'space-x-0.5',
        variant === 'minimal' && 'space-x-1',
        containerClassName
      )}
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <ol className={cn(
        'flex items-center space-x-1',
        variant === 'compact' && 'space-x-0.5',
        className
      )}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const actualIndex = shouldCollapse && collapsedItems.length > 0 && index > 0
            ? index + collapsedItems.length
            : index;

          return (
            <React.Fragment key={(item as any).id || actualIndex}>
              {/* Show collapsed items dropdown after first item */}
              {index === 1 && collapsedItems.length > 0 && (
                <>
                  <li className="flex items-center">
                    <span className={cn(
                      'text-muted-foreground',
                      separatorClassName
                    )}>
                      {renderSeparator ? renderSeparator(index) : separator}
                    </span>
                  </li>
                  <li>
                    <CollapsedItemsDropdown
                      items={collapsedItems}
                      onItemClick={onItemClick || (() => {})}
                    />
                  </li>
                </>
              )}

              {/* Separator */}
              {index > 0 && (
                <li className="flex items-center">
                  <span className={cn(
                    'text-muted-foreground',
                    separatorClassName
                  )}>
                    {renderSeparator ? renderSeparator(actualIndex) : separator}
                  </span>
                </li>
              )}

              {/* Breadcrumb item */}
              <li className={cn(
                'flex items-center',
                isLast && 'text-foreground'
              )}>
                <BreadcrumbItemComponent
                  item={item}
                  index={actualIndex}
                  isLast={isLast}
                  variant={variant}
                  size={size}
                  showIcons={showIcons}
                  showTooltips={showTooltips}
                  enableContextMenu={enableContextMenu}
                  className={itemClassName}
                  onItemClick={onItemClick}
                  onItemHover={onItemHover}
                  renderItem={renderItem}
                />
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => ({
    id: `breadcrumb-${index}`,
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isActive: index === segments.length - 1,
    isClickable: index < segments.length - 1,
  }));
}

export default Breadcrumb;