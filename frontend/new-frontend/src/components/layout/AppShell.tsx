'use client';

/**
 * AppShell - Holy Grail Layout Component
 * 
 * Implements the classic Holy Grail layout using CSS Grid:
 * - Header (sticky navigation)
 * - Sidebar (collapsible navigation) 
 * - Main Content (scrollable area)
 * - Footer (sticky at bottom)
 * 
 * Features:
 * - Responsive design (desktop/tablet/mobile)
 * - Smooth animations and transitions
 * - Integration with UI store and theme system
 * - CSS Grid for optimal layout performance
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore, useLayout, useScreenInfo } from '@/stores/ui-store';
import { useTheme } from '@/lib/providers/theme-provider';

// Import layout components
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  // Layout configuration
  headerHeight?: number;
  footerHeight?: number;
  sidebarWidth?: number;
  sidebarCollapsedWidth?: number;
  // Component overrides
  customHeader?: React.ReactNode;
  customSidebar?: React.ReactNode;
  customFooter?: React.ReactNode;
  // Features
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  enableSidebarCollapse?: boolean;
  enableResponsiveBreakpoints?: boolean;
  // Styling
  headerVariant?: 'default' | 'compact' | 'prominent';
  sidebarVariant?: 'default' | 'mini' | 'floating' | 'overlay';
  footerVariant?: 'default' | 'minimal' | 'detailed';
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  className,
  // Layout configuration
  headerHeight = 64,
  footerHeight = 48,
  sidebarWidth = 280,
  sidebarCollapsedWidth = 64,
  // Component overrides
  customHeader,
  customSidebar,
  customFooter,
  // Features
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  enableSidebarCollapse = true,
  enableResponsiveBreakpoints = true,
  // Styling
  headerVariant = 'default',
  sidebarVariant = 'default',
  footerVariant = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store hooks
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setHeaderHeight 
  } = useLayout();
  
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    updateScreenInfo 
  } = useScreenInfo();
  
  const { resolvedTheme } = useTheme();

  // Set up screen size monitoring
  useEffect(() => {
    if (!enableResponsiveBreakpoints) return;

    // Update screen info on mount
    updateScreenInfo();

    // Set up resize listener
    const handleResize = () => {
      updateScreenInfo();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableResponsiveBreakpoints, updateScreenInfo]);

  // Update header height in store
  useEffect(() => {
    setHeaderHeight(headerHeight);
  }, [headerHeight, setHeaderHeight]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (!enableResponsiveBreakpoints) return;

    if (isMobile && sidebarOpen) {
      setSidebarCollapsed(true);
    } else if (isDesktop && !sidebarOpen && sidebarVariant !== 'overlay') {
      setSidebarCollapsed(false);
    }
  }, [
    isMobile, 
    isDesktop, 
    sidebarOpen, 
    sidebarVariant, 
    setSidebarCollapsed,
    enableResponsiveBreakpoints
  ]);

  // Calculate layout dimensions
  const actualSidebarWidth = 
    !showSidebar ? 0 :
    isMobile ? 0 : // Hidden on mobile
    sidebarCollapsed ? sidebarCollapsedWidth : 
    sidebarWidth;

  const actualHeaderHeight = showHeader ? headerHeight : 0;
  const actualFooterHeight = showFooter ? footerHeight : 0;

  // Grid template areas for different responsive states
  const getGridTemplate = () => {
    if (isMobile) {
      return {
        gridTemplateAreas: showHeader && showFooter 
          ? '"header" "main" "footer"'
          : showHeader 
            ? '"header" "main"'
            : showFooter
              ? '"main" "footer"'
              : '"main"',
        gridTemplateRows: showHeader && showFooter
          ? `${actualHeaderHeight}px 1fr ${actualFooterHeight}px`
          : showHeader
            ? `${actualHeaderHeight}px 1fr`
            : showFooter
              ? `1fr ${actualFooterHeight}px`
              : '1fr',
        gridTemplateColumns: '1fr',
      };
    }

    // Desktop/Tablet layout
    return {
      gridTemplateAreas: showHeader && showFooter && showSidebar
        ? '"header header" "sidebar main" "footer footer"'
        : showHeader && showSidebar
          ? '"header header" "sidebar main"'
          : showFooter && showSidebar
            ? '"sidebar main" "footer footer"'
          : showSidebar
            ? '"sidebar main"'
            : showHeader && showFooter
              ? '"header" "main" "footer"'
              : showHeader
                ? '"header" "main"'
                : showFooter
                  ? '"main" "footer"'
                  : '"main"',
      gridTemplateRows: showHeader && showFooter
        ? `${actualHeaderHeight}px 1fr ${actualFooterHeight}px`
        : showHeader
          ? `${actualHeaderHeight}px 1fr`
          : showFooter
            ? `1fr ${actualFooterHeight}px`
            : '1fr',
      gridTemplateColumns: showSidebar && !isMobile
        ? `${actualSidebarWidth}px 1fr`
        : '1fr',
    };
  };

  const gridTemplate = getGridTemplate();

  // CSS custom properties for responsive values
  const cssCustomProperties = {
    '--app-header-height': `${actualHeaderHeight}px`,
    '--app-footer-height': `${actualFooterHeight}px`,
    '--app-sidebar-width': `${actualSidebarWidth}px`,
    '--app-sidebar-full-width': `${sidebarWidth}px`,
    '--app-sidebar-collapsed-width': `${sidebarCollapsedWidth}px`,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={cn(
        // Base grid layout
        'grid min-h-screen w-full',
        // Theme transitions
        'transition-colors duration-200',
        // Background
        'bg-background text-foreground',
        // Custom class
        className
      )}
      style={{
        ...cssCustomProperties,
        ...gridTemplate,
      }}
    >
      {/* Header */}
      {showHeader && (
        <header 
          className={cn(
            'grid-area-header z-40 border-b bg-background/95 backdrop-blur',
            'supports-[backdrop-filter]:bg-background/60'
          )}
          style={{ gridArea: 'header' }}
        >
          {customHeader || (
            <AppHeader 
              variant={headerVariant}
              height={headerHeight}
              showSidebarToggle={showSidebar && enableSidebarCollapse}
            />
          )}
        </header>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Desktop/Tablet Sidebar */}
          {!isMobile && (
            <aside
              className={cn(
                'grid-area-sidebar z-30 border-r bg-background/95 backdrop-blur',
                'transition-all duration-300 ease-in-out',
                'supports-[backdrop-filter]:bg-background/60',
                // Collapse animation
                sidebarCollapsed && 'border-r-transparent'
              )}
              style={{ 
                gridArea: 'sidebar',
                width: actualSidebarWidth,
              }}
            >
              {customSidebar || (
                <AppSidebar 
                  variant={sidebarVariant}
                  width={sidebarWidth}
                  collapsedWidth={sidebarCollapsedWidth}
                  isCollapsed={sidebarCollapsed}
                  enableCollapse={enableSidebarCollapse}
                />
              )}
            </aside>
          )}

          {/* Mobile Overlay Sidebar */}
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                className={cn(
                  'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm',
                  'animate-in fade-in-0 duration-200'
                )}
                onClick={() => setSidebarCollapsed(true)}
              />
              
              {/* Sidebar */}
              <aside
                className={cn(
                  'fixed inset-y-0 left-0 z-50 w-80 border-r bg-background',
                  'animate-in slide-in-from-left-0 duration-300'
                )}
              >
                {customSidebar || (
                  <AppSidebar 
                    variant="overlay"
                    width={sidebarWidth}
                    collapsedWidth={sidebarCollapsedWidth}
                    isCollapsed={false}
                    enableCollapse={false}
                    isMobile={true}
                  />
                )}
              </aside>
            </>
          )}
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'grid-area-main relative overflow-hidden',
          'flex flex-col',
          // Scrolling context
          'min-h-0', // Important for nested scrolling
        )}
        style={{ gridArea: 'main' }}
      >
        {/* Main content scrollable area */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer
          className={cn(
            'grid-area-footer z-20 border-t bg-background/95 backdrop-blur',
            'supports-[backdrop-filter]:bg-background/60'
          )}
          style={{ gridArea: 'footer' }}
        >
          {customFooter || (
            <AppFooter 
              variant={footerVariant}
              height={footerHeight}
            />
          )}
        </footer>
      )}
    </div>
  );
};

export default AppShell;