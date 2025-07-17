'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlagiarismMatch {
  id: string;
  text: string;
  source: string;
  similarity: number;
  position: {
    start: number;
    end: number;
  };
  url?: string;
  type: 'exact' | 'paraphrase' | 'similar';
}

interface PlagiarismResult {
  overallScore: number;
  originalityPercentage: number;
  matches: PlagiarismMatch[];
  sources: Array<{
    url: string;
    title: string;
    matchCount: number;
    similarity: number;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface PlagiarismCheckerProps {
  initialText?: string;
  onCheckComplete?: (result: PlagiarismResult) => void;
  className?: string;
}

const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({
  initialText = '',
  onCheckComplete,
  className
}) => {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<PlagiarismMatch | null>(null);

  // Simulate plagiarism check (in real implementation, this would call an API)
  const checkPlagiarism = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock plagiarism detection result
      const mockMatches: PlagiarismMatch[] = [
        {
          id: '1',
          text: 'Climate change is one of the most pressing issues',
          source: 'Wikipedia - Climate Change',
          similarity: 95,
          position: { start: 0, end: 45 },
          url: 'https://en.wikipedia.org/wiki/Climate_change',
          type: 'exact'
        },
        {
          id: '2',
          text: 'renewable energy sources are becoming more efficient',
          source: 'Nature Journal Article',
          similarity: 78,
          position: { start: 120, end: 172 },
          url: 'https://nature.com/articles/renewable-energy',
          type: 'paraphrase'
        },
        {
          id: '3',
          text: 'global warming effects on ecosystems',
          source: 'Scientific American',
          similarity: 65,
          position: { start: 200, end: 236 },
          url: 'https://scientificamerican.com/article/global-warming',
          type: 'similar'
        }
      ];

      const sources = [
        {
          url: 'https://en.wikipedia.org/wiki/Climate_change',
          title: 'Wikipedia - Climate Change',
          matchCount: 3,
          similarity: 85
        },
        {
          url: 'https://nature.com/articles/renewable-energy',
          title: 'Nature Journal - Renewable Energy',
          matchCount: 2,
          similarity: 70
        },
        {
          url: 'https://scientificamerican.com/article/global-warming',
          title: 'Scientific American - Global Warming',
          matchCount: 1,
          similarity: 65
        }
      ];

      const overallScore = 25; // 25% similarity
      const originalityPercentage = 100 - overallScore;
      
      let riskLevel: 'low' | 'medium' | 'high';
      if (overallScore < 15) riskLevel = 'low';
      else if (overallScore < 30) riskLevel = 'medium';
      else riskLevel = 'high';

      const recommendations = [
        'Consider paraphrasing the highlighted sections in your own words',
        'Add proper citations for borrowed content',
        'Review the similar sources and ensure your work is original',
        'Consider using quotation marks for direct quotes'
      ];

      const mockResult: PlagiarismResult = {
        overallScore,
        originalityPercentage,
        matches: mockMatches,
        sources,
        riskLevel,
        recommendations
      };

      setResult(mockResult);
      onCheckComplete?.(mockResult);
    } catch (err) {
      setError('Plagiarism check failed. Please try again.');
      console.error('Plagiarism check error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [onCheckComplete]);

  const getMatchTypeColor = (type: PlagiarismMatch['type']) => {
    switch (type) {
      case 'exact': return 'text-red-600 bg-red-50 border-red-200';
      case 'paraphrase': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'similar': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const highlightText = (text: string, matches: PlagiarismMatch[]): React.ReactNode => {
    if (!matches.length) return text;

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    matches.forEach((match, index) => {
      // Add text before match
      if (match.position.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, match.position.start)}
          </span>
        );
      }

      // Add highlighted match
      elements.push(
        <span
          key={`match-${index}`}
          className={cn(
            'cursor-pointer border rounded px-1',
            getMatchTypeColor(match.type),
            selectedMatch?.id === match.id && 'ring-2 ring-primary'
          )}
          onClick={() => setSelectedMatch(match)}
          title={`${match.similarity}% similarity with ${match.source}`}
        >
          {text.slice(match.position.start, match.position.end)}
        </span>
      );

      lastIndex = match.position.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Plagiarism Checker
          </CardTitle>
          <CardDescription>
            Check your text for potential plagiarism and similarity matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Text to check
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here to check for plagiarism..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => checkPlagiarism(text)}
                loading={isChecking}
                disabled={!text.trim()}
                colorScheme="primary"
              >
                {isChecking ? 'Checking...' : 'Check for Plagiarism'}
              </Button>
              {text && (
                <Button
                  variant="outline"
                  onClick={() => setText('')}
                >
                  Clear
                </Button>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="text-xs text-gray-500">
              <p>⚠️ This is a demo tool. For production use, integrate with services like Turnitin, Copyscape, or similar APIs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Overall Results */}
          <Card>
            <CardHeader>
              <CardTitle>Plagiarism Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {result.overallScore}%
                  </div>
                  <div className="text-sm text-gray-600">Similarity Found</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {result.originalityPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Original Content</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={cn(
                    'text-3xl font-bold mb-1 capitalize',
                    getRiskLevelColor(result.riskLevel).split(' ')[0]
                  )}>
                    {result.riskLevel}
                  </div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${result.overallScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0% Similarity</span>
                <span>100% Similarity</span>
              </div>
            </CardContent>
          </Card>

          {/* Text with Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Text Analysis</CardTitle>
              <CardDescription>
                Click on highlighted sections to see details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-gray-50 min-h-32 whitespace-pre-wrap leading-relaxed">
                {highlightText(text, result.matches)}
              </div>
              
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span>Exact Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                  <span>Paraphrase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span>Similar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Details */}
          {selectedMatch && (
            <Card>
              <CardHeader>
                <CardTitle>Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-sm mb-1">Matched Text:</div>
                    <div className={cn(
                      'p-3 rounded border',
                      getMatchTypeColor(selectedMatch.type)
                    )}>
                      "{selectedMatch.text}"
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-1">Source:</div>
                      <div className="text-sm">{selectedMatch.source}</div>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Similarity:</div>
                      <div className="text-sm font-bold">{selectedMatch.similarity}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Type:</div>
                      <div className="text-sm capitalize">{selectedMatch.type} match</div>
                    </div>
                    {selectedMatch.url && (
                      <div>
                        <div className="font-medium text-sm mb-1">URL:</div>
                        <a 
                          href={selectedMatch.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {selectedMatch.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Sources Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.sources.map((source, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{source.title}</div>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {source.url}
                        </a>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{source.similarity}%</div>
                        <div className="text-sm text-gray-600">{source.matchCount} match{source.matchCount !== 1 ? 'es' : ''}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PlagiarismChecker;