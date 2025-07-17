'use client';

/**
 * AppHeader - Application Header Component
 * 
 * Features:
 * - Responsive navigation with hamburger menu
 * - Theme toggle integration
 * - User menu and profile
 * - Search functionality
 * - Breadcrumb navigation
 * - Sidebar toggle button
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLayout, useNavigation } from '@/stores/ui-store';
import { useTheme, ThemeToggle } from '@/lib/providers/theme-provider';
import { useAuth } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';

import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  FileText,
  MessageSquare,
  Workflow,
  ChevronRight,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';

interface AppHeaderProps {
  variant?: 'default' | 'compact' | 'prominent';
  height?: number;
  showSidebarToggle?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  customLogo?: React.ReactNode;
  customActions?: React.ReactNode;
  className?: string;
}

const Logo: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="font-bold text-sm">C</span>
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none">ChUseA</span>
          <span className="text-xs text-muted-foreground leading-none">AI Writing Tool</span>
        </div>
      )}
    </div>
  );
};

const SearchBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={cn(
      'relative',
      compact ? 'w-64' : 'w-80 max-w-md'
    )}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search documents, workflows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4"
      />
    </div>
  );
};

const NavigationBreadcrumbs: React.FC = () => {
  const { breadcrumbs } = useNavigation();

  if (!breadcrumbs.length) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.href || index}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {(item as any).isClickable && item.href ? (
            <a
              href={item.href}
              className={cn(
                'hover:text-foreground transition-colors',
                (item as any).isActive && 'text-foreground font-medium'
              )}
            >
              {item.label}
            </a>
          ) : (
            <span className={cn(
              (item as any).isActive && 'text-foreground font-medium'
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth() as any;

  if (!user) {
    return (
      <Button variant="outline" size="sm">
        <User className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    );
  }

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-4 w-4" />
              </div>
            )}
          </Avatar>
        </Button>
      }
      placement="bottom-end"
    >
      <div className="flex items-center justify-start gap-2 p-2">
        <div className="flex flex-col space-y-1 leading-none">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Dropdown.Separator />
      <Dropdown.Item icon={<User className="h-4 w-4" />}>
        Profile
      </Dropdown.Item>
      <Dropdown.Item icon={<Settings className="h-4 w-4" />}>
        Settings
      </Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item 
        icon={<LogOut className="h-4 w-4" />}
        onClick={logout}
      >
        Log out
      </Dropdown.Item>
    </Dropdown>
  );
};

const NotificationButton: React.FC = () => {
  const [hasNotifications] = useState(true); // TODO: Connect to notifications store

  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-4 w-4" />
      {hasNotifications && (
        <Badge 
          variant="default" 
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500"
        >
          3
        </Badge>
      )}
    </Button>
  );
};

const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-72 bg-background border-r shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Logo />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex flex-col space-y-2 p-4">
          <Button variant="ghost" className="justify-start">
            <Home className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start">
            <FileText className="mr-3 h-4 w-4" />
            Documents
          </Button>
          <Button variant="ghost" className="justify-start">
            <Workflow className="mr-3 h-4 w-4" />
            Workflows
          </Button>
          <Button variant="ghost" className="justify-start">
            <MessageSquare className="mr-3 h-4 w-4" />
            Chat
          </Button>
        </nav>
      </div>
    </div>
  );
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'default',
  height = 64,
  showSidebarToggle = true,
  showSearch = true,
  showUserMenu = true,
  showNotifications = true,
  customLogo,
  customActions,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useLayout();

  const isCompact = variant === 'compact';
  const isProminent = variant === 'prominent';

  const handleSidebarToggle = () => {
    if (window.innerWidth < 768) { // Mobile
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      toggleSidebar();
    }
  };

  return (
    <>
      <div 
        className={cn(
          'flex items-center justify-between w-full px-4',
          isCompact && 'px-3',
          isProminent && 'px-6',
          className
        )}
        style={{ height }}
      >
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle (desktop) */}
          {showSidebarToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSidebarToggle}
              className="hidden md:flex"
            >
              {sidebarOpen && !sidebarCollapsed ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Logo */}
          {customLogo || <Logo compact={isCompact} />}

          {/* Breadcrumbs (desktop only) */}
          {!isCompact && (
            <div className="hidden lg:block">
              <NavigationBreadcrumbs />
            </div>
          )}
        </div>

        {/* Center section */}
        {showSearch && (
          <div className="hidden md:block">
            <SearchBar compact={isCompact} />
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Custom actions */}
          {customActions}

          {/* Search (mobile) */}
          {showSearch && (
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          {showNotifications && <NotificationButton />}

          {/* User menu */}
          {showUserMenu && <UserMenu />}
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  );
};

export default AppHeader;