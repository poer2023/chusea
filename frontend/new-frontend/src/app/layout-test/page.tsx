'use client';

/**
 * Layout Test Page - Simple Holy Grail Layout Testing
 * 
 * This page tests the AppShell layout system without complex dependencies
 */

import React, { useState } from 'react';
import { AppShell } from '@/components/layout';
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
  Star,
  Clock,
  User,
} from 'lucide-react';

const TestContent: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'editor':
      return (
        <div className="h-full p-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Rich Text Editor Test</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[300px] bg-muted/50">
                <p className="text-muted-foreground">
                  This simulates the TipTap editor area. The actual editor component
                  would be integrated here within the Holy Grail layout system.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );

    case 'chat':
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 p-6">
            <Card className="h-full p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">AI Chat Interface</h2>
                <Badge variant="secondary">Connected</Badge>
              </div>
              
              <div className="flex-1 bg-muted/50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-primary/10 p-3 rounded-lg max-w-xs">
                    <p className="text-sm">Hello! How can I help you today?</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg max-w-xs ml-auto">
                    <p className="text-sm">Can you help me with my writing?</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg max-w-xs">
                    <p className="text-sm">Of course! I'd be happy to help with your writing. What would you like to work on?</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <Button>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );

    case 'grid':
      return (
        <div className="h-full p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Content Grid Test</h2>
              <p className="text-muted-foreground">
                Testing responsive grid layouts within the main content area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }, (_, i) => (
                <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Item {i + 1}</h3>
                      <Badge variant="outline">Test</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is a test content block for the Holy Grail layout system.
                    </p>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Action
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

    default:
      return (
        <div className="h-full p-6 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Holy Grail Layout Test</h2>
            <p className="text-muted-foreground">
              Select a test type from the controls above to see the layout in action.
            </p>
          </Card>
        </div>
      );
  }
};

export default function LayoutTestPage() {
  const [currentTest, setCurrentTest] = useState('default');

  return (
    <AppShell
      headerVariant="default"
      sidebarVariant="default"
      footerVariant="default"
      enableSidebarCollapse={true}
      enableResponsiveBreakpoints={true}
      showHeader={true}
      showSidebar={true}
      showFooter={true}
      className="h-screen"
    >
      <div className="h-full flex flex-col">
        {/* Test Controls */}
        <div className="flex-shrink-0 p-4 bg-muted/20 border-b">
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold">Holy Grail Layout Test</h1>
              <p className="text-sm text-muted-foreground">
                Testing the responsive layout system with different content types.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentTest === 'editor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTest('editor')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Editor Test
              </Button>
              <Button
                variant={currentTest === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTest('chat')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat Test
              </Button>
              <Button
                variant={currentTest === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTest('grid')}
              >
                <Layout className="mr-2 h-4 w-4" />
                Grid Test
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span>Desktop: ≥1024px</span>
              </div>
              <div className="flex items-center gap-1">
                <Tablet className="h-3 w-3" />
                <span>Tablet: 768-1023px</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span>Mobile: &lt;768px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="flex-1 min-h-0">
          <TestContent type={currentTest} />
        </div>
      </div>
    </AppShell>
  );
}