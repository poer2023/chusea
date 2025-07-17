'use client';

/**
 * AppLayout - Main Application Layout Wrapper
 * 
 * A comprehensive layout component that provides:
 * - Unified application structure
 * - Responsive design with mobile-first approach
 * - Theme management integration
 * - User authentication integration
 * - Global search functionality
 * - Breadcrumb navigation
 * - Loading states and error boundaries
 * - Notification system
 * - Accessibility features
 */

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout, useScreenInfo, useNavigation } from '@/stores/ui-store';
import { useAuth } from '@/stores/auth-store';
import { useTheme } from '@/lib/providers/theme-provider';

// Layout components
import { AppShell } from './AppShell';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';

// UI components
import { Button } from '@/components/ui/button';
// import { ToastProvider } from '@/lib/components/toast';
import { ErrorBoundary } from '@/lib/providers/error-boundary';
import { Loading } from '@/components/ui/loading';

// Icons
import { 
  AlertCircle, 
  RefreshCw, 
  Home,
  ArrowLeft,
  WifiOff,
  Settings,
  HelpCircle 
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  
  // Layout configuration
  layoutConfig?: {
    showHeader?: boolean;
    showSidebar?: boolean;
    showFooter?: boolean;
    showBreadcrumbs?: boolean;
    enableSearch?: boolean;
    enableNotifications?: boolean;
    enableThemeToggle?: boolean;
    enableUserMenu?: boolean;
  };
  
  // Page metadata
  pageProps?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    noIndex?: boolean;
    requireAuth?: boolean;
    roles?: string[];
  };
  
  // Custom components
  customComponents?: {
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
    footer?: React.ReactNode;
    loading?: React.ReactNode;
    error?: React.ReactNode;
  };
  
  // Styling
  className?: string;
  containerClassName?: string;
}

// Default layout configuration
const DEFAULT_LAYOUT_CONFIG = {
  showHeader: true,
  showSidebar: true,
  showFooter: true,
  showBreadcrumbs: true,
  enableSearch: true,
  enableNotifications: true,
  enableThemeToggle: true,
  enableUserMenu: true,
};

// Loading overlay component
const LoadingOverlay: React.FC<{ 
  message?: string; 
  progress?: number; 
  cancellable?: boolean;
  onCancel?: () => void;
}> = ({ message, progress, cancellable, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-lg">
        <Loading size="lg" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        {progress !== undefined && (
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {cancellable && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

// Error boundary fallback component
const ErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  title?: string;
}> = ({ error, resetError, title = "Something went wrong" }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        
        <div className="space-y-2">
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
        
        {showDetails && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-left">
            <h3 className="font-medium mb-2">Error Details:</h3>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        )}
        
        <div className="flex justify-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

// Connection status component
const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 rounded-lg bg-destructive px-3 py-2 text-destructive-foreground shadow-lg">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    </div>
  );
};

// Skip to content link for accessibility
const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 z-50 
                 bg-primary text-primary-foreground px-4 py-2 rounded-md 
                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  layoutConfig = {},
  pageProps = {},
  customComponents = {},
  className,
  containerClassName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const layoutRef = useRef<HTMLDivElement>(null);
  
  // Merge with default configuration
  const config = { ...DEFAULT_LAYOUT_CONFIG, ...layoutConfig };
  
  // Store hooks
  const { isMobile, isDesktop } = useScreenInfo();
  const { setBreadcrumbs, setActiveRoute } = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [error, setError] = useState<Error | null>(null);
  
  // Page title and metadata
  useEffect(() => {
    if (pageProps.title) {
      document.title = `${pageProps.title} - ChUseA`;
    }
    
    // Set meta description
    if (pageProps.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', pageProps.description);
    }
    
    // Set canonical URL
    if (pageProps.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', pageProps.canonical);
    }
  }, [pageProps.title, pageProps.description, pageProps.canonical]);
  
  // Update navigation state
  useEffect(() => {
    setActiveRoute(pathname);
    
    // Generate breadcrumbs based on pathname
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + segments.slice(0, index + 1).join('/'),
      isActive: index === segments.length - 1,
      isClickable: index < segments.length - 1,
    }));
    
    if (breadcrumbs.length > 0) {
      setBreadcrumbs([
        { label: 'Home', href: '/', isActive: false, isClickable: true },
        ...breadcrumbs
      ]);
    }
  }, [pathname, setBreadcrumbs, setActiveRoute]);
  
  // Authentication check
  useEffect(() => {
    if (pageProps.requireAuth && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [pageProps.requireAuth, isAuthenticated, router]);
  
  // Role-based access control
  useEffect(() => {
    if (pageProps.roles && pageProps.roles.length > 0 && user) {
      const hasRequiredRole = pageProps.roles.some(role => 
        (user as any).roles?.includes(role)
      );
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [pageProps.roles, user, router]);
  
  // Handle global loading state
  const handleSetLoading = (loading: boolean, message?: string) => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };
  
  // Error boundary reset
  const handleErrorReset = () => {
    setError(null);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcuts
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            // Focus search bar
            document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
            break;
          case '/':
            event.preventDefault();
            // Toggle sidebar
            document.querySelector<HTMLButtonElement>('[data-sidebar-toggle]')?.click();
            break;
          case ',':
            event.preventDefault();
            // Open settings
            router.push('/settings');
            break;
          case '?':
            event.preventDefault();
            // Open help
            router.push('/help');
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
  
  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        resetError={handleErrorReset}
        title="Application Error"
      />
    );
  }
  
  return (
    <ErrorBoundary
      fallback={<ErrorFallback error={new Error('Unknown error')} resetError={() => {}} />}
    >
      {/* <ToastProvider> */}
        <div 
          ref={layoutRef}
          className={cn(
            'relative min-h-screen bg-background text-foreground',
            'transition-colors duration-200',
            className
          )}
          data-theme={resolvedTheme}
        >
          {/* Skip to content link */}
          <SkipToContent />
          
          {/* Global loading overlay */}
          {isLoading && (
            <LoadingOverlay 
              message={loadingMessage}
              cancellable={true}
              onCancel={() => handleSetLoading(false)}
            />
          )}
          
          {/* Main application shell */}
          <AppShell
            className={containerClassName}
            showHeader={config.showHeader}
            showSidebar={config.showSidebar}
            showFooter={config.showFooter}
            customHeader={customComponents.header}
            customSidebar={customComponents.sidebar}
            customFooter={customComponents.footer}
            headerVariant={isMobile ? 'compact' : 'default'}
            sidebarVariant={isMobile ? 'overlay' : 'default'}
          >
            {/* Main content area */}
            <div 
              id="main-content"
              className="flex-1 flex flex-col min-h-0"
              role="main"
              aria-label="Main content"
            >
              {/* Page content */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </AppShell>
          
          {/* Connection status indicator */}
          <ConnectionStatus />
          
          {/* Accessibility announcements */}
          <div 
            id="live-region"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
        </div>
      {/* </ToastProvider> */}
    </ErrorBoundary>
  );
};

export default AppLayout;