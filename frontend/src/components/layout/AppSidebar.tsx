'use client';

/**
 * AppSidebar - Application Sidebar Component
 * 
 * Features:
 * - Collapsible navigation with smooth animations
 * - Hierarchical menu structure
 * - Active state management
 * - Search functionality
 * - Responsive behavior (overlay on mobile)
 * - Integration with UI store
 */

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout, useNavigation } from '@/stores/ui-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Using native scrolling instead of ScrollArea component

import {
  Home,
  FileText,
  MessageSquare,
  Workflow,
  Settings,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Star,
  Clock,
  Folder,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  variant?: 'default' | 'mini' | 'floating' | 'overlay';
  width?: number;
  collapsedWidth?: number;
  isCollapsed?: boolean;
  enableCollapse?: boolean;
  isMobile?: boolean;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MenuItem[];
  disabled?: boolean;
  divider?: boolean;
  group?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

// Navigation menu structure
const navigationGroups: MenuGroup[] = [
  {
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: Home,
      },
      {
        id: 'documents',
        label: 'Documents',
        href: '/documents',
        icon: FileText,
        badge: '12',
        children: [
          {
            id: 'documents-recent',
            label: 'Recent',
            href: '/documents/recent',
            icon: Clock,
          },
          {
            id: 'documents-starred',
            label: 'Starred',
            href: '/documents/starred',
            icon: Star,
          },
          {
            id: 'documents-drafts',
            label: 'Drafts',
            href: '/documents/drafts',
            icon: FileText,
            badge: '3',
          },
        ],
      },
      {
        id: 'workflows',
        label: 'Workflows',
        href: '/workflows',
        icon: Workflow,
        badge: 'New',
        children: [
          {
            id: 'workflows-templates',
            label: 'Templates',
            href: '/workflows/templates',
            icon: Folder,
          },
          {
            id: 'workflows-active',
            label: 'Active',
            href: '/workflows/active',
            icon: Workflow,
            badge: '2',
          },
        ],
      },
      {
        id: 'chat',
        label: 'AI Assistant',
        href: '/chat',
        icon: MessageSquare,
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        id: 'demo',
        label: 'Components Demo',
        href: '/demo',
        icon: Settings,
      },
      {
        id: 'editor',
        label: 'Rich Text Editor',
        href: '/demo/editor',
        icon: FileText,
      },
    ],
  },
];

const MenuItemComponent: React.FC<{
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  level: number;
  onNavigate: (href: string) => void;
}> = ({ item, isActive, isCollapsed, level, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.href) {
      onNavigate(item.href);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const ItemIcon = item.icon;

  return (
    <div>
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start h-9 px-3',
          level > 0 && 'ml-4 w-auto',
          isCollapsed && 'px-2 justify-center',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleClick}
        disabled={item.disabled}
      >
        <ItemIcon className={cn(
          'h-4 w-4',
          !isCollapsed && 'mr-3',
          isCollapsed && level === 0 && 'mx-auto'
        )} />
        
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 px-1.5 text-xs"
              >
                {item.badge}
              </Badge>
            )}
            
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  'h-4 w-4 ml-auto transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </>
        )}
      </Button>

      {/* Children */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              isActive={false} // TODO: Check if child is active
              isCollapsed={false}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SearchInput: React.FC<{ 
  isCollapsed: boolean; 
  value: string; 
  onChange: (value: string) => void; 
}> = ({ isCollapsed, value, onChange }) => {
  if (isCollapsed) {
    return (
      <Button variant="ghost" size="sm" className="w-full justify-center px-2">
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-9"
      />
    </div>
  );
};

const QuickActions: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  if (isCollapsed) {
    return (
      <Button variant="ghost" size="sm" className="w-full justify-center px-2">
        <Plus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="h-8 justify-start">
          <Plus className="h-3 w-3 mr-1" />
          New Doc
        </Button>
        <Button variant="outline" size="sm" className="h-8 justify-start">
          <Workflow className="h-3 w-3 mr-1" />
          Workflow
        </Button>
      </div>
    </div>
  );
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  variant = 'default',
  width = 280,
  collapsedWidth = 64,
  isCollapsed = false,
  enableCollapse = true,
  isMobile = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { setSidebarCollapsed } = useLayout();

  const handleNavigate = (href: string) => {
    router.push(href);
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleClose = () => {
    setSidebarCollapsed(true);
  };

  // Filter menu items based on search query
  const filteredGroups = searchQuery
    ? navigationGroups.map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.children?.some(child =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ),
      })).filter(group => group.items.length > 0)
    : navigationGroups;

  const actualWidth = isCollapsed ? collapsedWidth : width;

  return (
    <div
      className={cn(
        'flex flex-col bg-background border-r h-full',
        'transition-all duration-300 ease-in-out',
        variant === 'floating' && 'rounded-lg shadow-lg m-2 border',
        variant === 'overlay' && 'shadow-xl',
        className
      )}
      style={{ width: isMobile ? width : actualWidth }}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b',
        isCollapsed && 'px-2 justify-center'
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="text-xs font-bold">C</span>
            </div>
            <span className="font-semibold">Navigation</span>
          </div>
        )}
        
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className={cn(
        'p-4 border-b',
        isCollapsed && 'px-2'
      )}>
        <SearchInput
          isCollapsed={isCollapsed}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={cn(
          'p-4 space-y-6',
          isCollapsed && 'px-2 space-y-2'
        )}>
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                  {group.label}
                </h4>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => (
                  <MenuItemComponent
                    key={item.id}
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                    level={0}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cn(
        'p-4 border-t',
        isCollapsed && 'px-2'
      )}>
        <QuickActions isCollapsed={isCollapsed} />
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>ChUseA v0.2</p>
            <p>AI Writing Tool</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSidebar;