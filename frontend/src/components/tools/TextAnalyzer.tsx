'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TextAnalysisResult {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
  readabilityScore: number;
  readabilityGrade: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  keywordDensity: Array<{
    word: string;
    count: number;
    density: number;
  }>;
  structureAnalysis: {
    hasIntroduction: boolean;
    hasConclusion: boolean;
    paragraphLengthVariation: 'low' | 'medium' | 'high';
    sentenceLengthVariation: 'low' | 'medium' | 'high';
  };
}

interface TextAnalyzerProps {
  initialText?: string;
  onAnalysisComplete?: (result: TextAnalysisResult) => void;
  className?: string;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({
  initialText = '',
  onAnalysisComplete,
  className
}) => {
  const [text, setText] = useState(initialText);
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate basic text statistics
  const calculateBasicStats = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      return {
        wordCount: 0,
        characterCount: 0,
        characterCountNoSpaces: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        averageWordsPerSentence: 0,
        averageSentencesPerParagraph: 0
      };
    }

    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);

    return {
      wordCount: words.length,
      characterCount: inputText.length,
      characterCountNoSpaces: inputText.replace(/\s/g, '').length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      averageSentencesPerParagraph: paragraphs.length > 0 ? sentences.length / paragraphs.length : 0
    };
  }, []);

  // Calculate readability score (Flesch Reading Ease)
  const calculateReadabilityScore = useCallback((inputText: string) => {
    const stats = calculateBasicStats(inputText);
    
    if (stats.wordCount === 0 || stats.sentenceCount === 0) {
      return { score: 0, grade: 'N/A' };
    }

    const avgWordsPerSentence = stats.averageWordsPerSentence;
    const avgSyllablesPerWord = 1.5; // Approximation
    
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    let grade: string;
    if (score >= 90) grade = 'Very Easy';
    else if (score >= 80) grade = 'Easy';
    else if (score >= 70) grade = 'Fairly Easy';
    else if (score >= 60) grade = 'Standard';
    else if (score >= 50) grade = 'Fairly Difficult';
    else if (score >= 30) grade = 'Difficult';
    else grade = 'Very Difficult';

    return { score: Math.max(0, Math.min(100, score)), grade };
  }, [calculateBasicStats]);

  // Simple sentiment analysis
  const analyzeSentiment = useCallback((inputText: string) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed', 'poor'];
    
    const words = inputText.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, label: 'neutral' as const, confidence: 0 };
    }
    
    const score = (positiveCount - negativeCount) / total;
    const confidence = total / words.length;
    
    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';
    else label = 'neutral';
    
    return { score, label, confidence };
  }, []);

  // Calculate keyword density
  const calculateKeywordDensity = useCallback((inputText: string) => {
    const words = inputText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / words.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, []);

  // Analyze text structure
  const analyzeStructure = useCallback((inputText: string) => {
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple heuristics for structure analysis
    const hasIntroduction = paragraphs.length > 0 && paragraphs[0].length > 100;
    const hasConclusion = paragraphs.length > 1 && paragraphs[paragraphs.length - 1].length > 50;
    
    // Calculate paragraph length variation
    const paragraphLengths = paragraphs.map(p => p.length);
    const avgParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
    const paragraphVariance = paragraphLengths.reduce((sum, length) => sum + Math.pow(length - avgParagraphLength, 2), 0) / paragraphLengths.length;
    const paragraphStdDev = Math.sqrt(paragraphVariance);
    
    let paragraphLengthVariation: 'low' | 'medium' | 'high';
    if (paragraphStdDev < avgParagraphLength * 0.3) paragraphLengthVariation = 'low';
    else if (paragraphStdDev < avgParagraphLength * 0.6) paragraphLengthVariation = 'medium';
    else paragraphLengthVariation = 'high';
    
    // Calculate sentence length variation
    const sentenceLengths = sentences.map(s => s.length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const sentenceVariance = sentenceLengths.reduce((sum, length) => sum + Math.pow(length - avgSentenceLength, 2), 0) / sentenceLengths.length;
    const sentenceStdDev = Math.sqrt(sentenceVariance);
    
    let sentenceLengthVariation: 'low' | 'medium' | 'high';
    if (sentenceStdDev < avgSentenceLength * 0.3) sentenceLengthVariation = 'low';
    else if (sentenceStdDev < avgSentenceLength * 0.6) sentenceLengthVariation = 'medium';
    else sentenceLengthVariation = 'high';
    
    return {
      hasIntroduction,
      hasConclusion,
      paragraphLengthVariation,
      sentenceLengthVariation
    };
  }, []);

  // Main analysis function
  const analyzeText = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const basicStats = calculateBasicStats(inputText);
      const readability = calculateReadabilityScore(inputText);
      const sentiment = analyzeSentiment(inputText);
      const keywordDensity = calculateKeywordDensity(inputText);
      const structureAnalysis = analyzeStructure(inputText);

      const result: TextAnalysisResult = {
        ...basicStats,
        readabilityScore: readability.score,
        readabilityGrade: readability.grade,
        sentiment,
        keywordDensity,
        structureAnalysis
      };

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculateBasicStats, calculateReadabilityScore, analyzeSentiment, calculateKeywordDensity, analyzeStructure, onAnalysisComplete]);

  // Auto-analyze on text change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeText(text);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [text, analyzeText]);

  const getSentimentColor = (sentiment: TextAnalysisResult['sentiment']) => {
    switch (sentiment.label) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Text Analyzer
          </CardTitle>
          <CardDescription>
            Analyze your text for readability, sentiment, and structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Text to analyze
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here for analysis..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => analyzeText(text)}
                loading={isAnalyzing}
                disabled={!text.trim()}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
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
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysis.wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysis.characterCount}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysis.sentenceCount}</div>
                  <div className="text-sm text-gray-600">Sentences</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analysis.paragraphCount}</div>
                  <div className="text-sm text-gray-600">Paragraphs</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Avg. words per sentence:</span>
                  <span className="text-sm font-medium">{analysis.averageWordsPerSentence.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. sentences per paragraph:</span>
                  <span className="text-sm font-medium">{analysis.averageSentencesPerParagraph.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Readability */}
          <Card>
            <CardHeader>
              <CardTitle>Readability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={cn(
                  'inline-flex items-center px-4 py-2 rounded-full font-medium',
                  getReadabilityColor(analysis.readabilityScore)
                )}>
                  <span className="text-2xl font-bold mr-2">{analysis.readabilityScore.toFixed(0)}</span>
                  <span>{analysis.readabilityGrade}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.readabilityScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Flesch Reading Ease Score
              </p>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={cn(
                  'inline-flex items-center px-4 py-2 rounded-full font-medium capitalize',
                  getSentimentColor(analysis.sentiment)
                )}>
                  {analysis.sentiment.label}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Sentiment Score:</span>
                  <span className="text-sm font-medium">{analysis.sentiment.score.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Confidence:</span>
                  <span className="text-sm font-medium">{(analysis.sentiment.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Structure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Has Introduction:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs',
                    analysis.structureAnalysis.hasIntroduction
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                    {analysis.structureAnalysis.hasIntroduction ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Has Conclusion:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs',
                    analysis.structureAnalysis.hasConclusion
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                    {analysis.structureAnalysis.hasConclusion ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Paragraph Variation:</span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 capitalize">
                    {analysis.structureAnalysis.paragraphLengthVariation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sentence Variation:</span>
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 capitalize">
                    {analysis.structureAnalysis.sentenceLengthVariation}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysis?.keywordDensity && analysis.keywordDensity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Density</CardTitle>
            <CardDescription>
              Most frequently used words (excluding common words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {analysis.keywordDensity.map((keyword, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{keyword.word}</div>
                  <div className="text-xs text-gray-600">{keyword.count} times</div>
                  <div className="text-xs text-blue-600">{keyword.density.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextAnalyzer;