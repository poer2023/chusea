'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WordCountStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  pages: number;
  readingTime: number;
  speakingTime: number;
  longestWord: string;
  averageWordLength: number;
  mostFrequentWords: Array<{
    word: string;
    count: number;
    percentage: number;
  }>;
  sentenceLengths: {
    shortest: number;
    longest: number;
    average: number;
  };
  paragraphLengths: {
    shortest: number;
    longest: number;
    average: number;
  };
}

interface WordCounterProps {
  initialText?: string;
  onStatsChange?: (stats: WordCountStats) => void;
  showAdvancedStats?: boolean;
  className?: string;
}

const WordCounter: React.FC<WordCounterProps> = ({
  initialText = '',
  onStatsChange,
  showAdvancedStats = true,
  className
}) => {
  const [text, setText] = useState(initialText);
  const [stats, setStats] = useState<WordCountStats | null>(null);
  const [goalWords, setGoalWords] = useState<number>(0);
  const [isLiveUpdate, setIsLiveUpdate] = useState(true);

  // Calculate comprehensive word statistics
  const calculateStats = useCallback((inputText: string): WordCountStats => {
    if (!inputText.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        pages: 0,
        readingTime: 0,
        speakingTime: 0,
        longestWord: '',
        averageWordLength: 0,
        mostFrequentWords: [],
        sentenceLengths: { shortest: 0, longest: 0, average: 0 },
        paragraphLengths: { shortest: 0, longest: 0, average: 0 }
      };
    }

    // Basic counts
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    
    // Words (split by whitespace and filter out empty strings)
    const wordsArray = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const words = wordsArray.length;
    
    // Sentences (split by sentence-ending punctuation)
    const sentencesArray = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentences = sentencesArray.length;
    
    // Paragraphs (split by double newlines)
    const paragraphsArray = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    const paragraphs = Math.max(1, paragraphsArray.length);
    
    // Pages (assuming 250 words per page)
    const pages = Math.ceil(words / 250);
    
    // Reading time (average 200 words per minute)
    const readingTime = words / 200;
    
    // Speaking time (average 150 words per minute)
    const speakingTime = words / 150;
    
    // Longest word
    const longestWord = wordsArray.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '');
    
    // Average word length
    const totalWordLength = wordsArray.reduce((sum, word) => sum + word.length, 0);
    const averageWordLength = words > 0 ? totalWordLength / words : 0;
    
    // Most frequent words (excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const wordFrequency: Record<string, number> = {};
    wordsArray.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    const mostFrequentWords = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / words) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Sentence length analysis
    const sentenceLengthsArray = sentencesArray.map(sentence => 
      sentence.trim().split(/\s+/).filter(word => word.length > 0).length
    );
    
    const sentenceLengths = {
      shortest: Math.min(...sentenceLengthsArray) || 0,
      longest: Math.max(...sentenceLengthsArray) || 0,
      average: sentenceLengthsArray.reduce((sum, length) => sum + length, 0) / sentenceLengthsArray.length || 0
    };
    
    // Paragraph length analysis (in words)
    const paragraphLengthsArray = paragraphsArray.map(paragraph => 
      paragraph.trim().split(/\s+/).filter(word => word.length > 0).length
    );
    
    const paragraphLengths = {
      shortest: Math.min(...paragraphLengthsArray) || 0,
      longest: Math.max(...paragraphLengthsArray) || 0,
      average: paragraphLengthsArray.reduce((sum, length) => sum + length, 0) / paragraphLengthsArray.length || 0
    };

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      pages,
      readingTime,
      speakingTime,
      longestWord,
      averageWordLength,
      mostFrequentWords,
      sentenceLengths,
      paragraphLengths
    };
  }, []);

  // Update stats when text changes
  useEffect(() => {
    if (isLiveUpdate) {
      const newStats = calculateStats(text);
      setStats(newStats);
      onStatsChange?.(newStats);
    }
  }, [text, isLiveUpdate, calculateStats, onStatsChange]);

  // Manual calculation
  const handleCalculate = () => {
    const newStats = calculateStats(text);
    setStats(newStats);
    onStatsChange?.(newStats);
  };

  // Format time for display
  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Get progress percentage for word goal
  const getGoalProgress = (): number => {
    if (!goalWords || !stats) return 0;
    return Math.min((stats.words / goalWords) * 100, 100);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Word Counter
          </CardTitle>
          <CardDescription>
            Count words, characters, and analyze text statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Text to count
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here to count words and analyze statistics..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="live-update"
                  checked={isLiveUpdate}
                  onChange={(e) => setIsLiveUpdate(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="live-update" className="text-sm">
                  Live update
                </label>
              </div>

              {!isLiveUpdate && (
                <Button onClick={handleCalculate} size="sm">
                  Calculate Stats
                </Button>
              )}

              <div className="flex items-center gap-2">
                <label htmlFor="word-goal" className="text-sm">
                  Word goal:
                </label>
                <input
                  id="word-goal"
                  type="number"
                  value={goalWords || ''}
                  onChange={(e) => setGoalWords(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              {text && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <>
          {/* Word Goal Progress */}
          {goalWords > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {stats.words} / {goalWords} words
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getGoalProgress().toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={cn(
                        'h-3 rounded-full transition-all duration-300',
                        getGoalProgress() >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${getGoalProgress()}%` }}
                    ></div>
                  </div>
                  {getGoalProgress() >= 100 && (
                    <p className="text-green-600 text-sm font-medium">
                      🎉 Goal achieved! You exceeded your target by {stats.words - goalWords} words.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.words.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Words</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.characters.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Characters</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.sentences.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Sentences</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.paragraphs.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Paragraphs</div>
              </CardContent>
            </Card>
          </div>

          {/* Reading and Speaking Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reading Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(stats.readingTime)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Based on 200 words per minute
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speaking Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(stats.speakingTime)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Based on 150 words per minute
                </p>
              </CardContent>
            </Card>
          </div>

          {showAdvancedStats && (
            <>
              {/* Advanced Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Characters (no spaces):</span>
                        <span className="text-sm font-medium">{stats.charactersNoSpaces.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pages (250 words/page):</span>
                        <span className="text-sm font-medium">{stats.pages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Longest word:</span>
                        <span className="text-sm font-medium">"{stats.longestWord}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average word length:</span>
                        <span className="text-sm font-medium">{stats.averageWordLength.toFixed(1)} characters</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Sentence lengths:</div>
                        <div className="text-xs space-y-1">
                          <div>Shortest: {stats.sentenceLengths.shortest} words</div>
                          <div>Longest: {stats.sentenceLengths.longest} words</div>
                          <div>Average: {stats.sentenceLengths.average.toFixed(1)} words</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Paragraph lengths:</div>
                        <div className="text-xs space-y-1">
                          <div>Shortest: {stats.paragraphLengths.shortest} words</div>
                          <div>Longest: {stats.paragraphLengths.longest} words</div>
                          <div>Average: {stats.paragraphLengths.average.toFixed(1)} words</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Most Frequent Words */}
              {stats.mostFrequentWords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Most Frequent Words</CardTitle>
                    <CardDescription>
                      Excluding common stop words (the, and, is, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {stats.mostFrequentWords.map((wordData, index) => (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-sm">{wordData.word}</div>
                          <div className="text-xs text-gray-600">{wordData.count} times</div>
                          <div className="text-xs text-blue-600">{wordData.percentage.toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WordCounter;