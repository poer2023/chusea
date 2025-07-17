/**
 * Quality Checking System - Validates workflow step quality and provides metrics
 * Provides comprehensive quality assessment for each workflow step
 */

import type { WorkflowStep } from '@/types/layout';

export interface QualityMetrics {
  overallScore: number; // 0-1 scale
  metrics: Record<string, number>;
  suggestions: string[];
  timestamp: Date;
  details?: QualityDetails;
}

export interface QualityDetails {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readabilityScore: number;
  grammarScore: number;
  structureScore: number;
  citationScore?: number;
  originalityScore?: number;
  coherenceScore: number;
  clarityScore: number;
}

export interface QualityThresholds {
  planning: number;
  drafting: number;
  citation: number;
  grammar: number;
  readability: number;
}

export type QualityLevel = 'basic' | 'standard' | 'strict';

// Quality thresholds for different levels
const QUALITY_THRESHOLDS: Record<QualityLevel, QualityThresholds> = {
  basic: {
    planning: 0.6,
    drafting: 0.5,
    citation: 0.7,
    grammar: 0.7,
    readability: 0.6,
  },
  standard: {
    planning: 0.7,
    drafting: 0.6,
    citation: 0.8,
    grammar: 0.8,
    readability: 0.7,
  },
  strict: {
    planning: 0.8,
    drafting: 0.7,
    citation: 0.9,
    grammar: 0.9,
    readability: 0.8,
  },
};

export class QualityChecker {
  private level: QualityLevel;
  private thresholds: QualityThresholds;

  constructor(level: QualityLevel = 'standard') {
    this.level = level;
    this.thresholds = QUALITY_THRESHOLDS[level];
  }

  /**
   * Check quality for a specific workflow step
   */
  async checkStepQuality(
    step: WorkflowStep,
    data: any,
    context: Record<string, any> = {}
  ): Promise<QualityMetrics> {
    const content = data.content || data;
    
    switch (step) {
      case 'planning':
        return this.checkPlanningQuality(content);
      case 'drafting':
        return this.checkDraftingQuality(content);
      case 'citation':
        return this.checkCitationQuality(content);
      case 'grammar':
        return this.checkGrammarQuality(content);
      case 'readability':
        return this.checkReadabilityQuality(content);
      default:
        throw new Error(`Unknown workflow step: ${step}`);
    }
  }

  /**
   * Check planning quality
   */
  private async checkPlanningQuality(content: string): Promise<QualityMetrics> {
    const metrics: Record<string, number> = {};
    const suggestions: string[] = [];
    
    // Structure analysis
    const structureScore = this.analyzeStructure(content);
    metrics.structure = structureScore;
    
    // Completeness check
    const completenessScore = this.checkPlanCompleteness(content);
    metrics.completeness = completenessScore;
    
    // Clarity assessment
    const clarityScore = this.assessClarity(content);
    metrics.clarity = clarityScore;
    
    // Coherence check
    const coherenceScore = this.checkCoherence(content);
    metrics.coherence = coherenceScore;
    
    // Generate suggestions
    if (structureScore < 0.7) {
      suggestions.push('Consider adding more detailed structure with clear sections and subsections');
    }
    if (completenessScore < 0.7) {
      suggestions.push('The plan appears incomplete. Add more specific details and objectives');
    }
    if (clarityScore < 0.7) {
      suggestions.push('Improve clarity by using more specific language and concrete examples');
    }
    if (coherenceScore < 0.7) {
      suggestions.push('Improve logical flow and connection between different sections');
    }
    
    const overallScore = (structureScore + completenessScore + clarityScore + coherenceScore) / 4;
    
    return {
      overallScore,
      metrics,
      suggestions,
      timestamp: new Date(),
      details: {
        wordCount: this.countWords(content),
        sentenceCount: this.countSentences(content),
        paragraphCount: this.countParagraphs(content),
        readabilityScore: this.calculateReadabilityScore(content),
        grammarScore: await this.checkGrammar(content),
        structureScore,
        coherenceScore,
        clarityScore,
      },
    };
  }

  /**
   * Check drafting quality
   */
  private async checkDraftingQuality(content: string): Promise<QualityMetrics> {
    const metrics: Record<string, number> = {};
    const suggestions: string[] = [];
    
    // Content quality
    const contentScore = this.assessContentQuality(content);
    metrics.content = contentScore;
    
    // Grammar check
    const grammarScore = await this.checkGrammar(content);
    metrics.grammar = grammarScore;
    
    // Structure analysis
    const structureScore = this.analyzeStructure(content);
    metrics.structure = structureScore;
    
    // Readability
    const readabilityScore = this.calculateReadabilityScore(content);
    metrics.readability = readabilityScore;
    
    // Flow and coherence
    const flowScore = this.assessFlow(content);
    metrics.flow = flowScore;
    
    // Generate suggestions
    if (contentScore < 0.7) {
      suggestions.push('Enhance content with more specific examples and detailed explanations');
    }
    if (grammarScore < 0.8) {
      suggestions.push('Review grammar and sentence structure for improvements');
    }
    if (structureScore < 0.7) {
      suggestions.push('Improve document structure with better paragraph organization');
    }
    if (readabilityScore < 0.7) {
      suggestions.push('Simplify complex sentences and improve readability');
    }
    if (flowScore < 0.7) {
      suggestions.push('Improve transitions between paragraphs and sections');
    }
    
    const overallScore = (contentScore + grammarScore + structureScore + readabilityScore + flowScore) / 5;
    
    return {
      overallScore,
      metrics,
      suggestions,
      timestamp: new Date(),
      details: {
        wordCount: this.countWords(content),
        sentenceCount: this.countSentences(content),
        paragraphCount: this.countParagraphs(content),
        readabilityScore,
        grammarScore,
        structureScore,
        coherenceScore: flowScore,
        clarityScore: readabilityScore,
      },
    };
  }

  /**
   * Check citation quality
   */
  private async checkCitationQuality(content: string): Promise<QualityMetrics> {
    const metrics: Record<string, number> = {};
    const suggestions: string[] = [];
    
    // Citation format check
    const formatScore = this.checkCitationFormat(content);
    metrics.format = formatScore;
    
    // Citation completeness
    const completenessScore = this.checkCitationCompleteness(content);
    metrics.completeness = completenessScore;
    
    // Citation accuracy
    const accuracyScore = this.checkCitationAccuracy(content);
    metrics.accuracy = accuracyScore;
    
    // Consistency check
    const consistencyScore = this.checkCitationConsistency(content);
    metrics.consistency = consistencyScore;
    
    // Generate suggestions
    if (formatScore < 0.8) {
      suggestions.push('Ensure all citations follow the correct format (APA, MLA, etc.)');
    }
    if (completenessScore < 0.8) {
      suggestions.push('Some citations may be missing required information');
    }
    if (accuracyScore < 0.8) {
      suggestions.push('Verify citation accuracy and source validity');
    }
    if (consistencyScore < 0.8) {
      suggestions.push('Maintain consistent citation style throughout the document');
    }
    
    const overallScore = (formatScore + completenessScore + accuracyScore + consistencyScore) / 4;
    
    return {
      overallScore,
      metrics,
      suggestions,
      timestamp: new Date(),
      details: {
        wordCount: this.countWords(content),
        sentenceCount: this.countSentences(content),
        paragraphCount: this.countParagraphs(content),
        readabilityScore: this.calculateReadabilityScore(content),
        grammarScore: await this.checkGrammar(content),
        structureScore: this.analyzeStructure(content),
        citationScore: overallScore,
        coherenceScore: this.checkCoherence(content),
        clarityScore: this.assessClarity(content),
      },
    };
  }

  /**
   * Check grammar quality
   */
  private async checkGrammarQuality(content: string): Promise<QualityMetrics> {
    const metrics: Record<string, number> = {};
    const suggestions: string[] = [];
    
    // Grammar accuracy
    const grammarScore = await this.checkGrammar(content);
    metrics.grammar = grammarScore;
    
    // Spelling check
    const spellingScore = await this.checkSpelling(content);
    metrics.spelling = spellingScore;
    
    // Style consistency
    const styleScore = this.checkStyleConsistency(content);
    metrics.style = styleScore;
    
    // Sentence structure
    const sentenceScore = this.analyzeSentenceStructure(content);
    metrics.sentence = sentenceScore;
    
    // Generate suggestions
    if (grammarScore < 0.9) {
      suggestions.push('Review and correct grammatical errors');
    }
    if (spellingScore < 0.9) {
      suggestions.push('Check and correct spelling mistakes');
    }
    if (styleScore < 0.8) {
      suggestions.push('Maintain consistent writing style throughout');
    }
    if (sentenceScore < 0.8) {
      suggestions.push('Improve sentence structure and variety');
    }
    
    const overallScore = (grammarScore + spellingScore + styleScore + sentenceScore) / 4;
    
    return {
      overallScore,
      metrics,
      suggestions,
      timestamp: new Date(),
      details: {
        wordCount: this.countWords(content),
        sentenceCount: this.countSentences(content),
        paragraphCount: this.countParagraphs(content),
        readabilityScore: this.calculateReadabilityScore(content),
        grammarScore,
        structureScore: this.analyzeStructure(content),
        coherenceScore: this.checkCoherence(content),
        clarityScore: this.assessClarity(content),
      },
    };
  }

  /**
   * Check readability quality
   */
  private async checkReadabilityQuality(content: string): Promise<QualityMetrics> {
    const metrics: Record<string, number> = {};
    const suggestions: string[] = [];
    
    // Readability score
    const readabilityScore = this.calculateReadabilityScore(content);
    metrics.readability = readabilityScore;
    
    // Clarity assessment
    const clarityScore = this.assessClarity(content);
    metrics.clarity = clarityScore;
    
    // Flow analysis
    const flowScore = this.assessFlow(content);
    metrics.flow = flowScore;
    
    // Engagement score
    const engagementScore = this.assessEngagement(content);
    metrics.engagement = engagementScore;
    
    // Generate suggestions
    if (readabilityScore < 0.8) {
      suggestions.push('Simplify complex sentences and use more common words');
    }
    if (clarityScore < 0.8) {
      suggestions.push('Make explanations clearer and more concise');
    }
    if (flowScore < 0.8) {
      suggestions.push('Improve transitions and logical flow between ideas');
    }
    if (engagementScore < 0.7) {
      suggestions.push('Make content more engaging with varied sentence structure');
    }
    
    const overallScore = (readabilityScore + clarityScore + flowScore + engagementScore) / 4;
    
    return {
      overallScore,
      metrics,
      suggestions,
      timestamp: new Date(),
      details: {
        wordCount: this.countWords(content),
        sentenceCount: this.countSentences(content),
        paragraphCount: this.countParagraphs(content),
        readabilityScore,
        grammarScore: await this.checkGrammar(content),
        structureScore: this.analyzeStructure(content),
        coherenceScore: flowScore,
        clarityScore,
      },
    };
  }

  // Helper methods for quality analysis

  private analyzeStructure(content: string): number {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Structure score based on paragraph distribution and sentence variety
    const avgSentencesPerParagraph = sentences.length / paragraphs.length;
    const structureScore = Math.min(1, avgSentencesPerParagraph / 5) * 0.7 + 
                          Math.min(1, paragraphs.length / 3) * 0.3;
    
    return Math.max(0, Math.min(1, structureScore));
  }

  private checkPlanCompleteness(content: string): number {
    // Check for key planning elements
    const hasObjective = /objective|goal|aim|purpose/i.test(content);
    const hasStructure = /structure|outline|section|chapter/i.test(content);
    const hasTimeline = /timeline|schedule|deadline|date/i.test(content);
    const hasResources = /resource|reference|source|material/i.test(content);
    
    const completenessScore = (
      (hasObjective ? 1 : 0) +
      (hasStructure ? 1 : 0) +
      (hasTimeline ? 1 : 0) +
      (hasResources ? 1 : 0)
    ) / 4;
    
    return completenessScore;
  }

  private assessClarity(content: string): number {
    // Simple clarity assessment based on sentence length and complexity
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = this.countWords(content) / sentences.length;
    
    // Optimal sentence length is 15-20 words
    const lengthScore = Math.max(0, 1 - Math.abs(avgWordsPerSentence - 17.5) / 17.5);
    
    // Check for clarity indicators
    const hasTransitions = /however|therefore|furthermore|moreover|additionally/i.test(content);
    const hasExamples = /example|instance|such as|for example/i.test(content);
    
    const clarityScore = lengthScore * 0.6 + 
                        (hasTransitions ? 0.2 : 0) + 
                        (hasExamples ? 0.2 : 0);
    
    return Math.max(0, Math.min(1, clarityScore));
  }

  private checkCoherence(content: string): number {
    // Check for coherence indicators
    const hasConnectors = /and|but|however|therefore|because|since|although/i.test(content);
    const hasRepetition = this.checkKeywordConsistency(content);
    const hasLogicalFlow = this.checkLogicalFlow(content);
    
    const coherenceScore = (
      (hasConnectors ? 1 : 0) * 0.4 +
      hasRepetition * 0.3 +
      hasLogicalFlow * 0.3
    );
    
    return Math.max(0, Math.min(1, coherenceScore));
  }

  private assessContentQuality(content: string): number {
    const wordCount = this.countWords(content);
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    const vocabularyRichness = uniqueWords / wordCount;
    
    // Content depth indicators
    const hasDetails = /detail|specific|particular|precise/i.test(content);
    const hasExamples = /example|instance|case study|illustration/i.test(content);
    const hasAnalysis = /analysis|examine|evaluate|consider|compare/i.test(content);
    
    const contentScore = vocabularyRichness * 0.4 +
                        (hasDetails ? 0.2 : 0) +
                        (hasExamples ? 0.2 : 0) +
                        (hasAnalysis ? 0.2 : 0);
    
    return Math.max(0, Math.min(1, contentScore));
  }

  private async checkGrammar(content: string): Promise<number> {
    // Simplified grammar check - in real implementation, use grammar checking API
    const commonErrors = [
      /\b(its|it's)\b/g,
      /\b(there|their|they're)\b/g,
      /\b(your|you're)\b/g,
      /\b(then|than)\b/g,
    ];
    
    const words = content.split(/\s+/);
    let errorCount = 0;
    
    commonErrors.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        errorCount += matches.length * 0.1; // Weight common errors less
      }
    });
    
    // Check for run-on sentences
    const sentences = content.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 30);
    errorCount += longSentences.length * 0.2;
    
    const grammarScore = Math.max(0, 1 - errorCount / words.length);
    return grammarScore;
  }

  private async checkSpelling(content: string): Promise<number> {
    // Simplified spelling check - in real implementation, use spelling API
    const words = content.toLowerCase().split(/\s+/);
    let correctWords = 0;
    
    // Basic spell check using common patterns
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && /^[a-z]+$/.test(cleanWord)) {
        correctWords++;
      }
    });
    
    return correctWords / words.length;
  }

  private calculateReadabilityScore(content: string): number {
    const words = this.countWords(content);
    const sentences = this.countSentences(content);
    const syllables = this.countSyllables(content);
    
    // Flesch Reading Ease Score
    const fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    
    // Convert to 0-1 scale (scores 60-100 are considered good)
    return Math.max(0, Math.min(1, (fleschScore - 30) / 70));
  }

  private assessFlow(content: string): number {
    // Check for transition words and phrases
    const transitions = [
      'however', 'therefore', 'furthermore', 'moreover', 'additionally',
      'consequently', 'meanwhile', 'nevertheless', 'nonetheless', 'subsequently',
      'first', 'second', 'finally', 'in conclusion', 'in summary'
    ];
    
    let transitionCount = 0;
    transitions.forEach(transition => {
      const regex = new RegExp(`\\b${transition}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        transitionCount += matches.length;
      }
    });
    
    const paragraphs = this.countParagraphs(content);
    const flowScore = Math.min(1, transitionCount / paragraphs);
    
    return flowScore;
  }

  private assessEngagement(content: string): number {
    // Check for engagement indicators
    const hasQuestions = /\?/.test(content);
    const hasVariedSentences = this.checkSentenceVariety(content);
    const hasActiveVoice = this.checkActiveVoice(content);
    
    const engagementScore = (
      (hasQuestions ? 0.3 : 0) +
      hasVariedSentences * 0.4 +
      hasActiveVoice * 0.3
    );
    
    return Math.max(0, Math.min(1, engagementScore));
  }

  private checkCitationFormat(content: string): number {
    // Check for basic citation patterns
    const citationPatterns = [
      /\([^)]*\d{4}[^)]*\)/g, // (Author, 2023)
      /\[[^\]]*\]/g, // [1]
      /\d+\./g, // 1.
    ];
    
    let citationCount = 0;
    citationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        citationCount += matches.length;
      }
    });
    
    // Basic format check - in real implementation, use more sophisticated parsing
    return citationCount > 0 ? 0.8 : 0.2;
  }

  private checkCitationCompleteness(content: string): number {
    // Check for bibliography or references section
    const hasBibliography = /references|bibliography|works cited/i.test(content);
    const hasInTextCitations = /\([^)]*\d{4}[^)]*\)/.test(content);
    
    return (hasBibliography ? 0.5 : 0) + (hasInTextCitations ? 0.5 : 0);
  }

  private checkCitationAccuracy(content: string): number {
    // Simplified accuracy check
    const citations = content.match(/\([^)]*\d{4}[^)]*\)/g) || [];
    const validCitations = citations.filter(citation => {
      return /\d{4}/.test(citation) && citation.length > 6;
    });
    
    return citations.length > 0 ? validCitations.length / citations.length : 0.5;
  }

  private checkCitationConsistency(content: string): number {
    // Check for consistent citation style
    const inTextCitations = content.match(/\([^)]*\d{4}[^)]*\)/g) || [];
    const bracketCitations = content.match(/\[[^\]]*\]/g) || [];
    
    // Consistency score based on using one style consistently
    const totalCitations = inTextCitations.length + bracketCitations.length;
    if (totalCitations === 0) return 0.5;
    
    const dominantStyle = Math.max(inTextCitations.length, bracketCitations.length);
    return dominantStyle / totalCitations;
  }

  private checkStyleConsistency(content: string): number {
    // Check for style consistency indicators
    const hasConsistentTense = this.checkTenseConsistency(content);
    const hasConsistentPerson = this.checkPersonConsistency(content);
    const hasConsistentTone = this.checkToneConsistency(content);
    
    return (hasConsistentTense + hasConsistentPerson + hasConsistentTone) / 3;
  }

  private analyzeSentenceStructure(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    
    // Check for sentence variety
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    // Good sentence structure has variety (variance > 0) and reasonable average length
    const varietyScore = Math.min(1, variance / 25);
    const lengthScore = Math.max(0, 1 - Math.abs(avgLength - 17) / 17);
    
    return (varietyScore + lengthScore) / 2;
  }

  // Utility methods
  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSentences(content: string): number {
    return content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  private countParagraphs(content: string): number {
    return content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  }

  private countSyllables(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    return words.reduce((count, word) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      const syllables = cleanWord.match(/[aeiouy]+/g) || [];
      return count + Math.max(1, syllables.length);
    }, 0);
  }

  private checkKeywordConsistency(content: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });
    
    const repeatedWords = Array.from(wordFreq.values()).filter(count => count > 1);
    return repeatedWords.length / wordFreq.size;
  }

  private checkLogicalFlow(content: string): number {
    // Simple logical flow check based on paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length < 2) return 0.5;
    
    let flowScore = 0;
    for (let i = 1; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      // Check for logical flow between paragraphs
      if (i > 0) {
        // const prevParagraph = paragraphs[i - 1];
        // Implement more advanced logic to check flow
      }
      
      // Check for topic consistency within paragraph
      const hasConnection = /^(however|therefore|furthermore|moreover|additionally|consequently|meanwhile|nevertheless|nonetheless|subsequently|first|second|finally|in conclusion|in summary)/.test(paragraph);
      
      if (hasConnection) {
        flowScore += 1;
      }
    }
    
    return flowScore / (paragraphs.length - 1);
  }

  private checkSentenceVariety(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    
    if (sentenceLengths.length < 2) return 0.5;
    
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    return Math.min(1, variance / 25);
  }

  private checkActiveVoice(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let activeVoiceCount = 0;
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      const hasPassiveIndicators = /\b(was|were|been|being)\s+\w+ed\b/.test(lowerSentence);
      if (!hasPassiveIndicators) {
        activeVoiceCount++;
      }
    });
    
    return activeVoiceCount / sentences.length;
  }

  private checkTenseConsistency(content: string): number {
    const pastTenseWords = content.match(/\b\w+ed\b/g) || [];
    const presentTenseWords = content.match(/\b\w+(s|es)\b/g) || [];
    const futureTenseWords = content.match(/\bwill\s+\w+/g) || [];
    
    const totalTenseWords = pastTenseWords.length + presentTenseWords.length + futureTenseWords.length;
    if (totalTenseWords === 0) return 0.5;
    
    const dominantTense = Math.max(pastTenseWords.length, presentTenseWords.length, futureTenseWords.length);
    return dominantTense / totalTenseWords;
  }

  private checkPersonConsistency(content: string): number {
    const firstPerson = content.match(/\b(I|we|my|our|me|us)\b/gi) || [];
    const secondPerson = content.match(/\b(you|your|yours)\b/gi) || [];
    const thirdPerson = content.match(/\b(he|she|it|they|his|her|its|their|him|them)\b/gi) || [];
    
    const totalPersonWords = firstPerson.length + secondPerson.length + thirdPerson.length;
    if (totalPersonWords === 0) return 0.5;
    
    const dominantPerson = Math.max(firstPerson.length, secondPerson.length, thirdPerson.length);
    return dominantPerson / totalPersonWords;
  }

  private checkToneConsistency(content: string): number {
    const formalWords = content.match(/\b(therefore|furthermore|consequently|nevertheless|nonetheless|subsequently)\b/gi) || [];
    const informalWords = content.match(/\b(so|but|and|well|ok|okay|yeah)\b/gi) || [];
    
    const totalToneWords = formalWords.length + informalWords.length;
    if (totalToneWords === 0) return 0.5;
    
    const dominantTone = Math.max(formalWords.length, informalWords.length);
    return dominantTone / totalToneWords;
  }

  /**
   * Get quality thresholds for current level
   */
  getThresholds(): QualityThresholds {
    return this.thresholds;
  }

  /**
   * Update quality level
   */
  setLevel(level: QualityLevel): void {
    this.level = level;
    this.thresholds = QUALITY_THRESHOLDS[level];
  }

  /**
   * Get improvement suggestions based on metrics
   */
  getImprovementSuggestions(metrics: QualityMetrics): string[] {
    const suggestions: string[] = [...metrics.suggestions];
    
    // Add general suggestions based on scores
    if (metrics.overallScore < 0.5) {
      suggestions.push('Consider significant revision to improve overall quality');
    } else if (metrics.overallScore < 0.7) {
      suggestions.push('Good foundation, but several areas need improvement');
    } else if (metrics.overallScore < 0.9) {
      suggestions.push('High quality content with minor areas for refinement');
    }
    
    return suggestions;
  }
}

// Export utility function for quick quality assessment
export async function quickQualityCheck(content: string, step: WorkflowStep): Promise<QualityMetrics> {
  const checker = new QualityChecker('standard');
  return await checker.checkStepQuality(step, content);
}

// Export configuration constants
export { QUALITY_THRESHOLDS, QualityLevel };