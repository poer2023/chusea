'use client';

/**
 * AppFooter - Application Footer Component
 * 
 * Features:
 * - Responsive footer with multiple variants
 * - Status indicators and metrics
 * - Quick links and actions
 * - Version information
 * - Connection status
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Heart,
  Wifi,
  WifiOff,
  Activity,
  Clock,
  Users,
  Server,
  Github,
  Twitter,
  MessageSquare,
} from 'lucide-react';

interface AppFooterProps {
  variant?: 'default' | 'minimal' | 'detailed';
  height?: number;
  showStatus?: boolean;
  showLinks?: boolean;
  showMetrics?: boolean;
  customContent?: React.ReactNode;
  className?: string;
}

const StatusIndicator: React.FC<{
  isConnected: boolean;
  serverStatus: 'online' | 'offline' | 'maintenance';
}> = ({ isConnected, serverStatus }) => {
  return (
    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Server Status */}
      <div className="flex items-center space-x-1">
        <Server className="h-3 w-3" />
        <span>Server:</span>
        <Badge 
          variant={
            serverStatus === 'online' ? 'default' : 
            serverStatus === 'maintenance' ? 'secondary' : 
            'outline'
          }
          className="h-4 px-1.5 text-xs"
        >
          {serverStatus}
        </Badge>
      </div>

      {/* Last Updated */}
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

const QuickLinks: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Github className="h-3 w-3 mr-1" />
        GitHub
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <MessageSquare className="h-3 w-3 mr-1" />
        Support
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Activity className="h-3 w-3 mr-1" />
        Status
      </Button>
    </div>
  );
};

const AppMetrics: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center space-x-6 text-xs text-muted-foreground">
      <div className="flex items-center space-x-1">
        <Users className="h-3 w-3" />
        <span>Users: 1,234</span>
      </div>
      <div className="flex items-center space-x-1">
        <Activity className="h-3 w-3" />
        <span>Uptime: 99.9%</span>
      </div>
      {user && (
        <div className="flex items-center space-x-1">
          <span>Session: {(user as any).sessionDuration || '15m'}</span>
        </div>
      )}
    </div>
  );
};

const MinimalFooter: React.FC<{ height: number }> = ({ height }) => {
  return (
    <div 
      className="flex items-center justify-center px-4"
      style={{ height }}
    >
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span>Made with</span>
        <Heart className="h-3 w-3 text-red-500" />
        <span>by ChUseA Team</span>
      </div>
    </div>
  );
};

const DefaultFooter: React.FC<{ height: number; showStatus: boolean; showLinks: boolean }> = ({ 
  height, 
  showStatus, 
  showLinks 
}) => {
  return (
    <div 
      className="flex items-center justify-between px-4"
      style={{ height }}
    >
      {/* Left side */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground">
          © 2024 ChUseA AI Writing Tool
        </span>
        <Badge variant="outline" className="h-4 px-1.5 text-xs">
          v0.2.0
        </Badge>
      </div>

      {/* Center */}
      {showStatus && (
        <StatusIndicator 
          isConnected={true} 
          serverStatus="online" 
        />
      )}

      {/* Right side */}
      {showLinks && <QuickLinks />}
    </div>
  );
};

const DetailedFooter: React.FC<{ 
  height: number; 
  showStatus: boolean; 
  showLinks: boolean; 
  showMetrics: boolean; 
}> = ({ height, showStatus, showLinks, showMetrics }) => {
  return (
    <div className="px-4 py-2 space-y-2">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">ChUseA AI Writing Tool</span>
          <Badge variant="outline" className="h-5 px-2 text-xs">
            v0.2.0 Beta
          </Badge>
        </div>
        
        {showLinks && <QuickLinks />}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        {showStatus && (
          <StatusIndicator 
            isConnected={true} 
            serverStatus="online" 
          />
        )}
        
        {showMetrics && <AppMetrics />}
      </div>
    </div>
  );
};

export const AppFooter: React.FC<AppFooterProps> = ({
  variant = 'default',
  height = 48,
  showStatus = true,
  showLinks = true,
  showMetrics = false,
  customContent,
  className,
}) => {
  if (customContent) {
    return (
      <div 
        className={cn('w-full px-4', className)}
        style={{ height }}
      >
        {customContent}
      </div>
    );
  }

  const commonProps = {
    height,
    showStatus,
    showLinks,
    showMetrics,
  };

  return (
    <div className={cn('w-full bg-background border-t', className)}>
      {variant === 'minimal' && <MinimalFooter height={height} />}
      {variant === 'default' && (
        <DefaultFooter 
          height={height}
          showStatus={showStatus}
          showLinks={showLinks}
        />
      )}
      {variant === 'detailed' && (
        <DetailedFooter {...commonProps} />
      )}
    </div>
  );
};

export default AppFooter;