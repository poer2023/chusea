'use client';

/**
 * Responsive Chat Layout Component
 * Optimized for mobile and desktop with adaptive design
 */

import React, { useState, useEffect } from 'react';
import { ChatInterface } from './chat-interface';
import { ChatSidebar } from './chat-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  MessageSquare,
  Workflow,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ResponsiveChatProps {
  workflowId?: string;
  documentId?: string;
  enableWorkflows?: boolean;
  enableDocuments?: boolean;
  className?: string;
}

export const ResponsiveChat: React.FC<ResponsiveChatProps> = ({
  workflowId,
  documentId,
  enableWorkflows = true,
  enableDocuments = true,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Detect mobile and orientation
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768); // md breakpoint
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Auto-close sidebar on mobile when orientation changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, orientation]);

  const getContextIcon = () => {
    if (workflowId) return <Workflow className="w-4 h-4" />;
    if (documentId) return <FileText className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const getContextType = () => {
    if (workflowId) return 'Workflow';
    if (documentId) return 'Document';
    return 'Chat';
  };

  const MobileHeader = () => (
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-8 w-8 p-0"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        
        <div className="flex items-center space-x-2">
          {getContextIcon()}
          <span className="font-medium text-sm">{getContextType()} Assistant</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {workflowId && (
          <Badge variant="secondary" className="text-xs">
            Workflow
          </Badge>
        )}
        {documentId && (
          <Badge variant="outline" className="text-xs">
            Document
          </Badge>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="hidden md:flex h-full">
      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <div className="w-80 flex-shrink-0 border-r bg-white">
          <ChatSidebar
            onSessionSelect={(sessionId) => console.log('Selected session:', sessionId)}
            showWorkflowSessions={enableWorkflows}
            showDocumentSessions={enableDocuments}
            className="h-full border-none"
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Toggle */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              {getContextIcon()}
              <span className="font-semibold">{getContextType()} Assistant</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {workflowId && (
              <Badge variant="secondary">
                Workflow: {workflowId.slice(-8)}
              </Badge>
            )}
            {documentId && (
              <Badge variant="outline">
                Document: {documentId.slice(-8)}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ChatInterface
          workflowId={workflowId}
          documentId={documentId}
          enableCommands={true}
          enableWorkflows={enableWorkflows}
          enableFileUpload={true}
          enableVoiceInput={false}
          showHeader={false}
          className="flex-1 border-none rounded-none"
          maxHeight="h-full"
        />
      </div>
    </div>
  );

  const MobileLayout = () => (
    <div className="md:hidden flex flex-col h-full">
      <MobileHeader />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Chat Sessions</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <ChatSidebar
              onSessionSelect={(sessionId) => {
                console.log('Selected session:', sessionId);
                setSidebarOpen(false);
              }}
              showWorkflowSessions={enableWorkflows}
              showDocumentSessions={enableDocuments}
              className="h-full border-none"
            />
          </div>
        </>
      )}

      {/* Main Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          workflowId={workflowId}
          documentId={documentId}
          enableCommands={true}
          enableWorkflows={enableWorkflows}
          enableFileUpload={true}
          enableVoiceInput={true} // Enable voice input on mobile
          showHeader={false}
          className="h-full border-none rounded-none"
          maxHeight="h-full"
          placeholder="Type a message..."
        />
      </div>
    </div>
  );

  return (
    <div className={cn('h-full bg-gray-50', className)}>
      {/* Adaptive Layout */}
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      
      {/* Mobile-specific optimizations */}
      {isMobile && (
        <style jsx global>{`
          /* Prevent zoom on input focus on iOS */
          input[type="text"],
          input[type="search"],
          textarea {
            font-size: 16px !important;
          }
          
          /* Optimize touch targets */
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Better scrolling on mobile */
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Safe area padding for notched devices */
          @supports (padding: env(safe-area-inset-top)) {
            .mobile-safe-top {
              padding-top: env(safe-area-inset-top);
            }
            .mobile-safe-bottom {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default ResponsiveChat;