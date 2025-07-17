'use client';

/**
 * Navigation - Enhanced Main Navigation Component
 * 
 * Features:
 * - Hierarchical navigation structure
 * - Active state management
 * - Keyboard navigation support
 * - Search functionality
 * - Responsive design
 * - Accessibility features
 * - Quick actions and shortcuts
 * - Customizable menu items
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout, useNavigation, useScreenInfo } from '@/stores/ui-store';
import { useAuth } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

import {
  Home,
  FileText,
  Edit3,
  BookOpen,
  Wrench,
  Settings,
  User,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Star,
  Clock,
  Folder,
  MoreHorizontal,
  Keyboard,
  Zap,
  Filter,
  X,
  Pin,
  PinOff,
  ExternalLink,
  Bookmark,
  History,
  Sparkles,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
  hidden?: boolean;
  divider?: boolean;
  group?: string;
  keywords?: string[];
  shortcut?: string;
  external?: boolean;
  pinned?: boolean;
  starred?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  description?: string;
  color?: string;
  permission?: string;
  metadata?: Record<string, any>;
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  permission?: string;
  priority?: number;
}

interface NavigationProps {
  items?: NavigationItem[];
  groups?: NavigationGroup[];
  variant?: 'default' | 'compact' | 'mini' | 'tree';
  showSearch?: boolean;
  showQuickActions?: boolean;
  showShortcuts?: boolean;
  enablePinning?: boolean;
  enableStarring?: boolean;
  enableKeyboardNav?: boolean;
  maxRecentItems?: number;
  className?: string;
  onNavigate?: (item: NavigationItem) => void;
  onPin?: (item: NavigationItem) => void;
  onStar?: (item: NavigationItem) => void;
  renderItem?: (item: NavigationItem, isActive: boolean) => React.ReactNode;
  renderGroup?: (group: NavigationGroup) => React.ReactNode;
}

// Default navigation structure for ChUseA
const DEFAULT_NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: Home,
        shortcut: '⌘+H',
        keywords: ['home', 'dashboard', 'overview'],
        description: 'Main dashboard and overview',
      },
      {
        id: 'documents',
        label: 'Documents',
        href: '/documents',
        icon: FileText,
        badge: '12',
        shortcut: '⌘+D',
        keywords: ['documents', 'files', 'papers'],
        description: 'Manage your documents and files',
        children: [
          {
            id: 'documents-recent',
            label: 'Recent',
            href: '/documents/recent',
            icon: Clock,
            keywords: ['recent', 'latest'],
          },
          {
            id: 'documents-starred',
            label: 'Starred',
            href: '/documents/starred',
            icon: Star,
            keywords: ['starred', 'favorites'],
          },
          {
            id: 'documents-drafts',
            label: 'Drafts',
            href: '/documents/drafts',
            icon: FileText,
            badge: '3',
            keywords: ['drafts', 'work in progress'],
          },
        ],
      },
      {
        id: 'editor',
        label: 'Editor',
        href: '/editor',
        icon: Edit3,
        shortcut: '⌘+E',
        keywords: ['editor', 'write', 'compose'],
        description: 'Rich text editor for writing',
      },
      {
        id: 'literature',
        label: 'Literature',
        href: '/literature',
        icon: BookOpen,
        shortcut: '⌘+L',
        keywords: ['literature', 'research', 'references'],
        description: 'Literature review and research',
      },
      {
        id: 'tools',
        label: 'Tools',
        href: '/tools',
        icon: Wrench,
        shortcut: '⌘+T',
        keywords: ['tools', 'utilities', 'helpers'],
        description: 'Writing tools and utilities',
        children: [
          {
            id: 'tools-ai',
            label: 'AI Assistant',
            href: '/tools/ai',
            icon: Sparkles,
            keywords: ['ai', 'assistant', 'help'],
          },
          {
            id: 'tools-grammar',
            label: 'Grammar Check',
            href: '/tools/grammar',
            icon: Edit3,
            keywords: ['grammar', 'spelling', 'check'],
          },
          {
            id: 'tools-citations',
            label: 'Citations',
            href: '/tools/citations',
            icon: BookOpen,
            keywords: ['citations', 'references', 'bibliography'],
          },
        ],
      },
    ],
    defaultExpanded: true,
    priority: 1,
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        href: '/profile',
        icon: User,
        shortcut: '⌘+P',
        keywords: ['profile', 'account', 'user'],
        description: 'Your profile and account settings',
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        shortcut: '⌘+,',
        keywords: ['settings', 'preferences', 'config'],
        description: 'Application settings and preferences',
      },
    ],
    defaultExpanded: false,
    priority: 2,
  },
];

// Navigation item component
const NavigationItemComponent: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  level: number;
  onNavigate: (item: NavigationItem) => void;
  onPin?: (item: NavigationItem) => void;
  onStar?: (item: NavigationItem) => void;
  enablePinning?: boolean;
  enableStarring?: boolean;
  showShortcuts?: boolean;
  renderItem?: (item: NavigationItem, isActive: boolean) => React.ReactNode;
}> = ({ 
  item, 
  isActive, 
  isCollapsed, 
  level, 
  onNavigate, 
  onPin, 
  onStar, 
  enablePinning, 
  enableStarring, 
  showShortcuts,
  renderItem 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback(() => {
    if (item.href) {
      onNavigate(item);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  }, [item, hasChildren, isExpanded, onNavigate]);

  const handlePin = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPin?.(item);
  }, [item, onPin]);

  const handleStar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStar?.(item);
  }, [item, onStar]);

  if (item.hidden) return null;

  // Use custom render if provided
  if (renderItem) {
    return <>{renderItem(item, isActive)}</>;
  }

  const ItemIcon = item.icon;
  const content = (
    <div
      className={cn(
        'group relative',
        item.divider && 'border-t border-border mt-2 pt-2'
      )}
    >
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start h-10 px-3 relative',
          level > 0 && 'ml-4 w-auto',
          isCollapsed && 'px-2 justify-center',
          item.disabled && 'opacity-50 cursor-not-allowed',
          item.pinned && 'bg-accent/50',
          isActive && 'bg-accent font-medium',
          isHovered && 'bg-accent/30'
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={item.disabled}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        <ItemIcon className={cn(
          'h-4 w-4 shrink-0',
          !isCollapsed && 'mr-3',
          isCollapsed && level === 0 && 'mx-auto',
          item.color && `text-${item.color}-500`
        )} />
        
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            
            {/* Badge */}
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 px-1.5 text-xs shrink-0"
              >
                {item.badge}
              </Badge>
            )}
            
            {/* Shortcut */}
            {showShortcuts && item.shortcut && (
              <span className="ml-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {item.shortcut}
              </span>
            )}
            
            {/* External link indicator */}
            {item.external && (
              <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground shrink-0" />
            )}
            
            {/* Chevron for expandable items */}
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  'h-4 w-4 ml-auto transition-transform shrink-0',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </>
        )}
        
        {/* Action buttons */}
        {!isCollapsed && (isHovered || item.pinned || item.starred) && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {enableStarring && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleStar}
              >
                <Star className={cn(
                  'h-3 w-3',
                  item.starred && 'fill-yellow-400 text-yellow-400'
                )} />
              </Button>
            )}
            
            {enablePinning && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handlePin}
              >
                {item.pinned ? (
                  <PinOff className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        )}
      </Button>

      {/* Children */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              isActive={false} // TODO: Check if child is active
              isCollapsed={false}
              level={level + 1}
              onNavigate={onNavigate}
              onPin={onPin}
              onStar={onStar}
              enablePinning={enablePinning}
              enableStarring={enableStarring}
              showShortcuts={showShortcuts}
              renderItem={renderItem}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Wrap with tooltip if collapsed
  if (isCollapsed && level === 0) {
    return (
      <Tooltip content={item.label}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

// Navigation search component
const NavigationSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isCollapsed: boolean;
  placeholder?: string;
}> = ({ value, onChange, onClear, isCollapsed, placeholder = "Search navigation..." }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClear();
      inputRef.current?.blur();
    }
  };

  if (isCollapsed) {
    return (
      <Tooltip content="Search navigation">
        <Button variant="ghost" size="sm" className="w-full justify-center px-2">
          <Search className="h-4 w-4" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-10 h-9"
        data-search-input
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Quick actions component
const QuickActions: React.FC<{
  isCollapsed: boolean;
  onNewDocument: () => void;
  onOpenRecent: () => void;
}> = ({ isCollapsed, onNewDocument, onOpenRecent }) => {
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        <Tooltip content="New document">
          <Button variant="ghost" size="sm" className="w-full justify-center px-2" onClick={onNewDocument}>
            <Plus className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Recent documents">
          <Button variant="ghost" size="sm" className="w-full justify-center px-2" onClick={onOpenRecent}>
            <History className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Zap className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="h-8 justify-start" onClick={onNewDocument}>
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
        <Button variant="outline" size="sm" className="h-8 justify-start" onClick={onOpenRecent}>
          <History className="h-3 w-3 mr-1" />
          Recent
        </Button>
      </div>
    </div>
  );
};

export const Navigation: React.FC<NavigationProps> = ({
  items,
  groups = DEFAULT_NAVIGATION_GROUPS,
  variant = 'default',
  showSearch = true,
  showQuickActions = true,
  showShortcuts = true,
  enablePinning = true,
  enableStarring = true,
  enableKeyboardNav = true,
  maxRecentItems = 5,
  className,
  onNavigate,
  onPin,
  onStar,
  renderItem,
  renderGroup,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed } = useLayout();
  const { isMobile } = useScreenInfo();
  const { user } = useAuth();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [starredItems, setStarredItems] = useState<string[]>([]);

  const isCollapsed = sidebarCollapsed && !isMobile;

  // Initialize expanded groups
  useEffect(() => {
    const defaultExpanded = groups
      .filter(group => group.defaultExpanded)
      .map(group => group.id);
    setExpandedGroups(defaultExpanded);
  }, [groups]);

  // Handle navigation
  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.href) {
      if (item.external) {
        window.open(item.href, '_blank');
      } else {
        router.push(item.href);
      }
    }
    onNavigate?.(item);
  }, [router, onNavigate]);

  // Handle pinning
  const handlePin = useCallback((item: NavigationItem) => {
    setPinnedItems(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id]
    );
    onPin?.(item);
  }, [onPin]);

  // Handle starring
  const handleStar = useCallback((item: NavigationItem) => {
    setStarredItems(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id]
    );
    onStar?.(item);
  }, [onStar]);

  // Filter items based on search
  const filteredGroups = searchQuery
    ? groups.map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keywords?.some(keyword => 
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.children?.some(child =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            child.keywords?.some(keyword => 
              keyword.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        ),
      })).filter(group => group.items.length > 0)
    : groups;

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  // Quick actions
  const handleNewDocument = useCallback(() => {
    router.push('/documents/new');
  }, [router]);

  const handleOpenRecent = useCallback(() => {
    router.push('/documents/recent');
  }, [router]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Check if item is active
  const isItemActive = useCallback((item: NavigationItem) => {
    return pathname === item.href;
  }, [pathname]);

  return (
    <nav 
      className={cn(
        'flex flex-col h-full bg-background',
        variant === 'compact' && 'text-sm',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Search */}
      {showSearch && (
        <div className={cn(
          'p-4 border-b',
          isCollapsed && 'px-2'
        )}>
          <NavigationSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClearSearch}
            isCollapsed={isCollapsed}
          />
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={cn(
          'p-4 space-y-6',
          isCollapsed && 'px-2 space-y-2'
        )}>
          {filteredGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              {/* Group header */}
              {!isCollapsed && (
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground px-3">
                    {group.label}
                  </h4>
                  {group.collapsible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <ChevronRight 
                        className={cn(
                          'h-3 w-3 transition-transform',
                          expandedGroups.includes(group.id) && 'rotate-90'
                        )}
                      />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Group items */}
              {(!group.collapsible || expandedGroups.includes(group.id)) && (
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavigationItemComponent
                      key={item.id}
                      item={{
                        ...item,
                        pinned: pinnedItems.includes(item.id),
                        starred: starredItems.includes(item.id),
                      }}
                      isActive={isItemActive(item)}
                      isCollapsed={isCollapsed}
                      level={0}
                      onNavigate={handleNavigate}
                      onPin={handlePin}
                      onStar={handleStar}
                      enablePinning={enablePinning}
                      enableStarring={enableStarring}
                      showShortcuts={showShortcuts}
                      renderItem={renderItem}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      {showQuickActions && (
        <div className={cn(
          'p-4 border-t',
          isCollapsed && 'px-2'
        )}>
          <QuickActions
            isCollapsed={isCollapsed}
            onNewDocument={handleNewDocument}
            onOpenRecent={handleOpenRecent}
          />
        </div>
      )}
    </nav>
  );
};

export default Navigation;