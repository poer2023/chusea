'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Tool interface
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'writing' | 'productivity' | 'export' | 'research';
  isActive?: boolean;
  features?: string[];
  onClick?: () => void;
}

interface ToolsGridProps {
  className?: string;
  onToolSelect?: (tool: Tool) => void;
  selectedTool?: string;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ 
  className, 
  onToolSelect, 
  selectedTool 
}) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define available tools
  const availableTools: Tool[] = [
    {
      id: 'text-analyzer',
      name: 'Text Analyzer',
      description: 'Analyze text for readability, sentiment, and structure',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      category: 'analysis',
      features: ['Readability scoring', 'Sentiment analysis', 'Structure analysis'],
      isActive: true
    },
    {
      id: 'word-counter',
      name: 'Word Counter',
      description: 'Count words, characters, and analyze text statistics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      category: 'analysis',
      features: ['Word count', 'Character count', 'Reading time', 'Paragraph analysis'],
      isActive: true
    },
    {
      id: 'readability-checker',
      name: 'Readability Checker',
      description: 'Check text readability using various metrics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      category: 'analysis',
      features: ['Flesch Reading Ease', 'Flesch-Kincaid Grade', 'SMOG Index', 'ARI'],
      isActive: true
    },
    {
      id: 'plagiarism-checker',
      name: 'Plagiarism Checker',
      description: 'Check text for potential plagiarism and duplicates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      category: 'analysis',
      features: ['Similarity detection', 'Source identification', 'Originality score'],
      isActive: true
    },
    {
      id: 'template-manager',
      name: 'Template Manager',
      description: 'Manage and create document templates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      category: 'writing',
      features: ['Custom templates', 'Template library', 'Quick insertion'],
      isActive: true
    },
    {
      id: 'export-tools',
      name: 'Export Tools',
      description: 'Export documents to various formats',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      category: 'export',
      features: ['PDF export', 'Word export', 'LaTeX export', 'HTML export'],
      isActive: true
    },
    {
      id: 'import-tools',
      name: 'Import Tools',
      description: 'Import documents from various sources',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      category: 'export',
      features: ['File upload', 'URL import', 'Cloud sync', 'Batch import'],
      isActive: true
    },
    {
      id: 'writing-calculator',
      name: 'Writing Calculator',
      description: 'Calculate writing time and progress metrics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      category: 'productivity',
      features: ['Reading time', 'Writing speed', 'Progress tracking', 'Goal setting'],
      isActive: true
    },
    {
      id: 'research-helper',
      name: 'Research Helper',
      description: 'Research assistance and citation tools',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      category: 'research',
      features: ['Citation generator', 'Reference manager', 'Source finder', 'Bibliography'],
      isActive: true
    }
  ];

  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setTools(availableTools);
        setError(null);
      } catch (err) {
        setError('Failed to load tools');
        console.error('Error loading tools:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const handleToolClick = (tool: Tool) => {
    if (tool.onClick) {
      tool.onClick();
    }
    onToolSelect?.(tool);
  };

  const getCategoryColor = (category: Tool['category']): string => {
    switch (category) {
      case 'analysis': return 'text-blue-600 bg-blue-50';
      case 'writing': return 'text-green-600 bg-green-50';
      case 'productivity': return 'text-purple-600 bg-purple-50';
      case 'export': return 'text-orange-600 bg-orange-50';
      case 'research': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryName = (category: Tool['category']): string => {
    switch (category) {
      case 'analysis': return 'Text Analysis';
      case 'writing': return 'Writing Tools';
      case 'productivity': return 'Productivity';
      case 'export': return 'Import/Export';
      case 'research': return 'Research';
      default: return 'Other';
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Writing Tools</h1>
        <p className="text-muted-foreground">
          Enhance your writing workflow with powerful tools and utilities
        </p>
      </div>

      {Object.entries(groupedTools).map(([category, categoryTools]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getCategoryColor(category as Tool['category'])
            )}>
              {getCategoryName(category as Tool['category'])}
            </span>
            <span className="text-sm text-muted-foreground">
              {categoryTools.length} tool{categoryTools.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTools.map((tool) => (
              <Card
                key={tool.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-lg',
                  selectedTool === tool.id && 'ring-2 ring-primary',
                  !tool.isActive && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => tool.isActive && handleToolClick(tool)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        getCategoryColor(tool.category)
                      )}>
                        {tool.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                    {!tool.isActive && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {tool.features && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Features:
                      </h4>
                      <ul className="space-y-1">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolsGrid;