'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReadabilityScore {
  name: string;
  score: number;
  grade: string;
  description: string;
  interpretation: string;
  color: string;
}

interface ReadabilityAnalysis {
  fleschReadingEase: ReadabilityScore;
  fleschKincaidGrade: ReadabilityScore;
  gunningFog: ReadabilityScore;
  smogIndex: ReadabilityScore;
  automatedReadabilityIndex: ReadabilityScore;
  colemanLiauIndex: ReadabilityScore;
  averageScore: number;
  overallGrade: string;
  recommendations: string[];
  textComplexity: {
    averageWordsPerSentence: number;
    averageSyllablesPerWord: number;
    complexWords: number;
    complexWordsPercentage: number;
    polysyllabicWords: number;
    longSentences: number;
  };
}

interface ReadabilityCheckerProps {
  initialText?: string;
  onAnalysisComplete?: (analysis: ReadabilityAnalysis) => void;
  className?: string;
}

const ReadabilityChecker: React.FC<ReadabilityCheckerProps> = ({
  initialText = '',
  onAnalysisComplete,
  className
}) => {
  const [text, setText] = useState(initialText);
  const [analysis, setAnalysis] = useState<ReadabilityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Count syllables in a word (approximation)
  const countSyllables = useCallback((word: string): number => {
    const vowels = 'aeiouyAEIOUY';
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    
    if (cleanWord.length === 0) return 0;
    
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < cleanWord.length; i++) {
      const isVowel = vowels.includes(cleanWord[i]);
      
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e' at the end
    if (cleanWord.endsWith('e') && syllableCount > 1) {
      syllableCount--;
    }
    
    // Every word has at least one syllable
    return Math.max(1, syllableCount);
  }, []);

  // Calculate Flesch Reading Ease
  const calculateFleschReadingEase = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    
    if (totalWords === 0 || totalSentences === 0) {
      return {
        name: 'Flesch Reading Ease',
        score: 0,
        grade: 'N/A',
        description: 'Insufficient text',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;
    
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    const clampedScore = Math.max(0, Math.min(100, score));
    
    let grade: string;
    let interpretation: string;
    let color: string;
    
    if (clampedScore >= 90) {
      grade = 'Very Easy';
      interpretation = '5th grade level';
      color = 'text-green-600';
    } else if (clampedScore >= 80) {
      grade = 'Easy';
      interpretation = '6th grade level';
      color = 'text-green-500';
    } else if (clampedScore >= 70) {
      grade = 'Fairly Easy';
      interpretation = '7th grade level';
      color = 'text-yellow-600';
    } else if (clampedScore >= 60) {
      grade = 'Standard';
      interpretation = '8th-9th grade level';
      color = 'text-yellow-500';
    } else if (clampedScore >= 50) {
      grade = 'Fairly Difficult';
      interpretation = '10th-12th grade level';
      color = 'text-orange-600';
    } else if (clampedScore >= 30) {
      grade = 'Difficult';
      interpretation = 'College level';
      color = 'text-red-600';
    } else {
      grade = 'Very Difficult';
      interpretation = 'Graduate level';
      color = 'text-red-800';
    }
    
    return {
      name: 'Flesch Reading Ease',
      score: clampedScore,
      grade,
      description: 'Measures readability based on sentence length and syllable count',
      interpretation,
      color
    };
  }, [countSyllables]);

  // Calculate Flesch-Kincaid Grade Level
  const calculateFleschKincaidGrade = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    
    if (totalWords === 0 || totalSentences === 0) {
      return {
        name: 'Flesch-Kincaid Grade',
        score: 0,
        grade: 'N/A',
        description: 'Insufficient text',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;
    
    const grade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
    const clampedGrade = Math.max(0, grade);
    
    let interpretation: string;
    let color: string;
    
    if (clampedGrade <= 6) {
      interpretation = 'Elementary school level';
      color = 'text-green-600';
    } else if (clampedGrade <= 9) {
      interpretation = 'Middle school level';
      color = 'text-yellow-600';
    } else if (clampedGrade <= 12) {
      interpretation = 'High school level';
      color = 'text-orange-600';
    } else if (clampedGrade <= 16) {
      interpretation = 'College level';
      color = 'text-red-600';
    } else {
      interpretation = 'Graduate level';
      color = 'text-red-800';
    }
    
    return {
      name: 'Flesch-Kincaid Grade',
      score: clampedGrade,
      grade: `Grade ${clampedGrade.toFixed(1)}`,
      description: 'Indicates the US grade level required to understand the text',
      interpretation,
      color
    };
  }, [countSyllables]);

  // Calculate Gunning Fog Index
  const calculateGunningFog = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    
    if (totalWords === 0 || totalSentences === 0) {
      return {
        name: 'Gunning Fog Index',
        score: 0,
        grade: 'N/A',
        description: 'Insufficient text',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    // Count complex words (3+ syllables, excluding proper nouns, compound words, and common suffixes)
    const complexWords = words.filter(word => {
      const syllables = countSyllables(word);
      const isCompound = word.includes('-');
      const commonSuffixes = ['ed', 'es', 'ing', 'ly'];
      const hasCommonSuffix = commonSuffixes.some(suffix => word.toLowerCase().endsWith(suffix));
      
      return syllables >= 3 && !isCompound && !hasCommonSuffix;
    }).length;
    
    const avgWordsPerSentence = totalWords / totalSentences;
    const complexWordsPercentage = (complexWords / totalWords) * 100;
    
    const fog = 0.4 * (avgWordsPerSentence + complexWordsPercentage);
    
    let interpretation: string;
    let color: string;
    
    if (fog <= 8) {
      interpretation = 'Easy to read';
      color = 'text-green-600';
    } else if (fog <= 12) {
      interpretation = 'Moderate difficulty';
      color = 'text-yellow-600';
    } else if (fog <= 16) {
      interpretation = 'Difficult to read';
      color = 'text-orange-600';
    } else {
      interpretation = 'Very difficult to read';
      color = 'text-red-600';
    }
    
    return {
      name: 'Gunning Fog Index',
      score: fog,
      grade: `Grade ${fog.toFixed(1)}`,
      description: 'Measures complexity based on sentence length and complex words',
      interpretation,
      color
    };
  }, [countSyllables]);

  // Calculate SMOG Index
  const calculateSMOGIndex = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalSentences = sentences.length;
    
    if (totalSentences < 30) {
      return {
        name: 'SMOG Index',
        score: 0,
        grade: 'N/A',
        description: 'Requires at least 30 sentences for accurate measurement',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    // Count polysyllabic words (3+ syllables)
    const polysyllabicWords = words.filter(word => countSyllables(word) >= 3).length;
    
    const smog = 1.043 * Math.sqrt(polysyllabicWords * (30 / totalSentences)) + 3.1291;
    
    let interpretation: string;
    let color: string;
    
    if (smog <= 8) {
      interpretation = 'Elementary level';
      color = 'text-green-600';
    } else if (smog <= 12) {
      interpretation = 'Middle/High school level';
      color = 'text-yellow-600';
    } else if (smog <= 16) {
      interpretation = 'College level';
      color = 'text-orange-600';
    } else {
      interpretation = 'Graduate level';
      color = 'text-red-600';
    }
    
    return {
      name: 'SMOG Index',
      score: smog,
      grade: `Grade ${smog.toFixed(1)}`,
      description: 'Estimates years of education needed to understand the text',
      interpretation,
      color
    };
  }, [countSyllables]);

  // Calculate Automated Readability Index
  const calculateARI = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalCharacters = words.join('').length;
    
    if (totalWords === 0 || totalSentences === 0) {
      return {
        name: 'Automated Readability Index',
        score: 0,
        grade: 'N/A',
        description: 'Insufficient text',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    const avgCharactersPerWord = totalCharacters / totalWords;
    const avgWordsPerSentence = totalWords / totalSentences;
    
    const ari = (4.71 * avgCharactersPerWord) + (0.5 * avgWordsPerSentence) - 21.43;
    const clampedARI = Math.max(0, ari);
    
    let interpretation: string;
    let color: string;
    
    if (clampedARI <= 6) {
      interpretation = 'Elementary school level';
      color = 'text-green-600';
    } else if (clampedARI <= 9) {
      interpretation = 'Middle school level';
      color = 'text-yellow-600';
    } else if (clampedARI <= 12) {
      interpretation = 'High school level';
      color = 'text-orange-600';
    } else {
      interpretation = 'College+ level';
      color = 'text-red-600';
    }
    
    return {
      name: 'Automated Readability Index',
      score: clampedARI,
      grade: `Grade ${clampedARI.toFixed(1)}`,
      description: 'Uses character count instead of syllable count',
      interpretation,
      color
    };
  }, []);

  // Calculate Coleman-Liau Index
  const calculateColemanLiau = useCallback((words: string[], sentences: string[]): ReadabilityScore => {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalCharacters = words.join('').length;
    
    if (totalWords === 0) {
      return {
        name: 'Coleman-Liau Index',
        score: 0,
        grade: 'N/A',
        description: 'Insufficient text',
        interpretation: 'Need more text for analysis',
        color: 'text-gray-600'
      };
    }
    
    const avgCharactersPer100Words = (totalCharacters / totalWords) * 100;
    const avgSentencesPer100Words = (totalSentences / totalWords) * 100;
    
    const cli = (0.0588 * avgCharactersPer100Words) - (0.296 * avgSentencesPer100Words) - 15.8;
    const clampedCLI = Math.max(0, cli);
    
    let interpretation: string;
    let color: string;
    
    if (clampedCLI <= 6) {
      interpretation = 'Elementary school level';
      color = 'text-green-600';
    } else if (clampedCLI <= 9) {
      interpretation = 'Middle school level';
      color = 'text-yellow-600';
    } else if (clampedCLI <= 12) {
      interpretation = 'High school level';
      color = 'text-orange-600';
    } else {
      interpretation = 'College+ level';
      color = 'text-red-600';
    }
    
    return {
      name: 'Coleman-Liau Index',
      score: clampedCLI,
      grade: `Grade ${clampedCLI.toFixed(1)}`,
      description: 'Based on characters per word and sentences per word',
      interpretation,
      color
    };
  }, []);

  // Generate recommendations based on analysis
  const generateRecommendations = useCallback((analysis: ReadabilityAnalysis): string[] => {
    const recommendations: string[] = [];
    const { textComplexity, averageScore } = analysis;
    
    if (averageScore > 12) {
      recommendations.push('Consider breaking up long sentences to improve readability');
    }
    
    if (textComplexity.averageWordsPerSentence > 20) {
      recommendations.push('Your sentences are quite long. Try to keep them under 20 words on average');
    }
    
    if (textComplexity.complexWordsPercentage > 15) {
      recommendations.push('Consider using simpler words where possible to improve accessibility');
    }
    
    if (textComplexity.longSentences > textComplexity.averageWordsPerSentence * 1.5) {
      recommendations.push('Break up very long sentences to improve flow and comprehension');
    }
    
    if (textComplexity.averageSyllablesPerWord > 2) {
      recommendations.push('Try to use shorter words with fewer syllables when possible');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your text has good readability! Consider your target audience when making adjustments');
    }
    
    return recommendations;
  }, []);

  // Main analysis function
  const analyzeReadability = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Parse text
      const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
      const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      
      // Calculate all readability scores
      const fleschReadingEase = calculateFleschReadingEase(words, sentences);
      const fleschKincaidGrade = calculateFleschKincaidGrade(words, sentences);
      const gunningFog = calculateGunningFog(words, sentences);
      const smogIndex = calculateSMOGIndex(words, sentences);
      const automatedReadabilityIndex = calculateARI(words, sentences);
      const colemanLiauIndex = calculateColemanLiau(words, sentences);
      
      // Calculate text complexity metrics
      const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
      const complexWords = words.filter(word => countSyllables(word) >= 3).length;
      const longSentences = sentences.filter(sentence => 
        sentence.trim().split(/\s+/).length > 25
      ).length;
      
      const textComplexity = {
        averageWordsPerSentence: words.length / sentences.length,
        averageSyllablesPerWord: totalSyllables / words.length,
        complexWords,
        complexWordsPercentage: (complexWords / words.length) * 100,
        polysyllabicWords: words.filter(word => countSyllables(word) >= 3).length,
        longSentences
      };
      
      // Calculate average grade level
      const grades = [
        fleschKincaidGrade.score,
        gunningFog.score,
        automatedReadabilityIndex.score,
        colemanLiauIndex.score
      ].filter(score => score > 0);
      
      const averageScore = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      
      let overallGrade: string;
      if (averageScore <= 6) overallGrade = 'Elementary';
      else if (averageScore <= 9) overallGrade = 'Middle School';
      else if (averageScore <= 12) overallGrade = 'High School';
      else if (averageScore <= 16) overallGrade = 'College';
      else overallGrade = 'Graduate';
      
      const result: ReadabilityAnalysis = {
        fleschReadingEase,
        fleschKincaidGrade,
        gunningFog,
        smogIndex,
        automatedReadabilityIndex,
        colemanLiauIndex,
        averageScore,
        overallGrade,
        textComplexity,
        recommendations: []
      };
      
      result.recommendations = generateRecommendations(result);
      
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error('Readability analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculateFleschReadingEase, calculateFleschKincaidGrade, calculateGunningFog, calculateSMOGIndex, calculateARI, calculateColemanLiau, countSyllables, generateRecommendations, onAnalysisComplete]);

  // Auto-analyze on text change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeReadability(text);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [text, analyzeReadability]);

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Readability Checker
          </CardTitle>
          <CardDescription>
            Analyze text readability using multiple proven metrics
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
                placeholder="Enter your text here to check readability..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => analyzeReadability(text)}
                loading={isAnalyzing}
                disabled={!text.trim()}
              >
                {isAnalyzing ? 'Analyzing...' : 'Check Readability'}
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
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Readability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analysis.overallGrade}
                </div>
                <div className="text-lg text-muted-foreground mb-4">
                  Average Grade Level: {analysis.averageScore.toFixed(1)}
                </div>
                <div className="max-w-md mx-auto bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((analysis.averageScore / 16) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              analysis.fleschReadingEase,
              analysis.fleschKincaidGrade,
              analysis.gunningFog,
              analysis.smogIndex,
              analysis.automatedReadabilityIndex,
              analysis.colemanLiauIndex
            ].map((score, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{score.name}</CardTitle>
                  <CardDescription>{score.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-2xl font-bold', score.color)}>
                      {score.name === 'Flesch Reading Ease' ? score.score.toFixed(0) : score.score.toFixed(1)}
                    </span>
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', score.color.replace('text-', 'bg-').replace('-600', '-100'), score.color)}>
                      {score.grade}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {score.interpretation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Text Complexity */}
          <Card>
            <CardHeader>
              <CardTitle>Text Complexity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average words per sentence:</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.averageWordsPerSentence.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average syllables per word:</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.averageSyllablesPerWord.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Complex words:</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.complexWords}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Complex words percentage:</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.complexWordsPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Polysyllabic words:</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.polysyllabicWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Long sentences (25+ words):</span>
                    <span className="text-sm font-medium">{analysis.textComplexity.longSentences}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve readability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
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

export default ReadabilityChecker;