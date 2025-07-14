'use client';

/**
 * Layout Demo Page - Holy Grail Layout Testing
 * 
 * This page demonstrates the AppShell layout system with:
 * - Responsive behavior testing
 * - Theme switching
 * - Sidebar collapse/expand
 * - Integration with TipTap editor and chat components
 */

import React, { useState } from 'react';
import { AppShell } from '@/components/layout';
import { RichTextEditor } from '@/components/editor';
import { ChatInterface } from '@/components/chat/chat-interface';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Monitor,
  Tablet,
  Smartphone,
  Layout,
  FileText,
  MessageSquare,
  Settings,
  Maximize,
  Minimize,
} from 'lucide-react';

const DemoControls: React.FC<{
  currentDemo: string;
  onDemoChange: (demo: string) => void;
  onViewportChange: (viewport: string) => void;
}> = ({ currentDemo, onDemoChange, onViewportChange }) => {
  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Layout Demo Controls</h3>
          <p className="text-sm text-muted-foreground">
            Test the Holy Grail layout system with different content types and responsive behaviors.
          </p>
        </div>

        {/* Demo Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Demo Content Type</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentDemo === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDemoChange('editor')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Rich Text Editor
            </Button>
            <Button
              variant={currentDemo === 'chat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDemoChange('chat')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat Interface
            </Button>
            <Button
              variant={currentDemo === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDemoChange('grid')}
            >
              <Layout className="mr-2 h-4 w-4" />
              Content Grid
            </Button>
          </div>
        </div>

        {/* Viewport Simulation */}
        <div>
          <label className="text-sm font-medium mb-2 block">Viewport Simulation</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewportChange('desktop')}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Desktop (≥1024px)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewportChange('tablet')}
            >
              <Tablet className="mr-2 h-4 w-4" />
              Tablet (768-1023px)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewportChange('mobile')}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile (&lt;768px)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Note: Use browser DevTools to actually test responsive behavior
          </p>
        </div>
      </div>
    </Card>
  );
};

const EditorDemo: React.FC = () => {
  return (
    <div className="h-full p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Rich Text Editor Demo</h2>
          <p className="text-muted-foreground">
            Testing the TipTap editor within the Holy Grail layout system.
          </p>
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document Editor</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Draft</Badge>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg">
              <RichTextEditor
                placeholder="Start writing your document..."
                className="min-h-[400px]"
                showBubbleMenu={true}
                showToolbar={true}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ChatDemo: React.FC = () => {
  return (
    <div className="h-full">
      <ChatInterface
        enableCommands={true}
        enableWorkflows={true}
        className="h-full border-none rounded-none"
        placeholder="Test the chat interface in the layout..."
        welcomeMessage="Welcome to the layout demo chat! This demonstrates how the chat interface integrates with the Holy Grail layout system."
      />
    </div>
  );
};

const GridDemo: React.FC = () => {
  const gridItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Content Block ${i + 1}`,
    description: `This is a sample content block demonstrating how grid layouts work within the Holy Grail layout system.`,
    type: ['Document', 'Workflow', 'Chat', 'Settings'][i % 4],
  }));

  return (
    <div className="h-full p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Content Grid Demo</h2>
          <p className="text-muted-foreground">
            Testing responsive grid layouts within the main content area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridItems.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{item.title}</h3>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Maximize className="mr-2 h-4 w-4" />
                    Expand
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function LayoutDemoPage() {
  const [currentDemo, setCurrentDemo] = useState('editor');

  const handleViewportChange = (viewport: string) => {
    // In a real app, this might trigger responsive simulation
    console.log('Simulating viewport:', viewport);
    alert(`Viewport simulation: ${viewport}\n\nUse browser DevTools to test actual responsive behavior!`);
  };

  const renderDemoContent = () => {
    switch (currentDemo) {
      case 'editor':
        return <EditorDemo />;
      case 'chat':
        return <ChatDemo />;
      case 'grid':
        return <GridDemo />;
      default:
        return <EditorDemo />;
    }
  };

  return (
    <AppShell
      headerVariant="default"
      sidebarVariant="default"
      footerVariant="detailed"
      enableSidebarCollapse={true}
      enableResponsiveBreakpoints={true}
      showHeader={true}
      showSidebar={true}
      showFooter={true}
      className="h-screen"
    >
      <div className="h-full flex flex-col">
        {/* Demo Controls */}
        <div className="flex-shrink-0 p-6 bg-muted/50">
          <DemoControls
            currentDemo={currentDemo}
            onDemoChange={setCurrentDemo}
            onViewportChange={handleViewportChange}
          />
        </div>

        {/* Demo Content */}
        <div className="flex-1 min-h-0">
          {renderDemoContent()}
        </div>
      </div>
    </AppShell>
  );
}