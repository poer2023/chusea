/**
 * AI Service Integration for Workflow Steps
 * Handles AI generation, processing, and optimization for each workflow step
 */

import { WorkflowConfig } from '@/lib/workflow/workflow-machine';
import { QualityMetrics } from '@/lib/workflow/quality-checker';
import type { WorkflowStep } from '@/types/layout';

// AI Service interfaces
export interface AIGenerationRequest {
  step: WorkflowStep;
  prompt: string;
  context: WorkflowContext;
  config: WorkflowConfig;
  retryCount?: number;
}

export interface AIGenerationResponse {
  content: string;
  metadata: {
    model: string;
    tokens: number;
    processingTime: number;
    confidence: number;
  };
  suggestions?: string[];
  qualityHints?: string[];
}

export interface WorkflowContext {
  documentId: string;
  stepData: Record<string, any>;
  previousResults: Record<string, any>;
  userPreferences: Record<string, any>;
}

export interface AIServiceConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

// Step-specific AI configurations
const STEP_AI_CONFIGS: Record<WorkflowStep, Partial<AIServiceConfig>> = {
  planning: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
  },
  drafting: {
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.95,
  },
  citation: {
    temperature: 0.3,
    maxTokens: 800,
    topP: 0.7,
  },
  grammar: {
    temperature: 0.2,
    maxTokens: 1500,
    topP: 0.6,
  },
  readability: {
    temperature: 0.5,
    maxTokens: 1500,
    topP: 0.8,
  },
};

// Default AI service configuration
const DEFAULT_AI_CONFIG: AIServiceConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1500,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
};

export class AIWorkflowService {
  private config: AIServiceConfig;
  private apiEndpoint: string;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
    this.apiEndpoint = '/api/ai/workflow';
  }

  /**
   * Generate content for a specific workflow step
   */
  async generateForStep(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const { step, prompt, context, config, retryCount = 0 } = request;
    
    // Get step-specific configuration
    const stepConfig = { ...this.config, ...STEP_AI_CONFIGS[step] };
    
    // Build the AI prompt based on step type
    const enhancedPrompt = this.buildStepPrompt(step, prompt, context, config);
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step,
          prompt: enhancedPrompt,
          context,
          config: stepConfig,
          workflowConfig: config,
          retryCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processAIResponse(step, data);
      
    } catch (error) {
      console.error(`AI generation failed for step ${step}:`, error);
      throw error;
    }
  }

  /**
   * Build step-specific prompts with context
   */
  private buildStepPrompt(
    step: WorkflowStep,
    basePrompt: string,
    context: WorkflowContext,
    config: WorkflowConfig
  ): string {
    const stepPrompts: Record<WorkflowStep, string> = {
      planning: this.buildPlanningPrompt(basePrompt, context),
      drafting: this.buildDraftingPrompt(basePrompt, context),
      citation: this.buildCitationPrompt(basePrompt, context),
      grammar: this.buildGrammarPrompt(basePrompt, context),
      readability: this.buildReadabilityPrompt(basePrompt, context),
    };

    return stepPrompts[step] || basePrompt;
  }

  /**
   * Build planning step prompt
   */
  private buildPlanningPrompt(
    basePrompt: string,
    context: WorkflowContext,
  ): string {
    return `
As a professional writing assistant, help create a comprehensive writing plan.

**Task**: ${basePrompt}

**Requirements**:
- Writing style: ${context.stepData.planning?.writingStyle || 'N/A'}
- Target length: ${context.stepData.planning?.targetLength || 'N/A'}
- Include research: ${context.stepData.planning?.includeResearch ? 'Yes' : 'No'}
- Include citations: ${context.stepData.planning?.includeCitations ? 'Yes' : 'No'}
- Review type: ${context.stepData.planning?.reviewType || 'N/A'}

**Context**:
${context.stepData.planning ? `Previous planning work: ${JSON.stringify(context.stepData.planning)}` : 'Starting fresh'}

**Instructions**:
1. Create a clear outline with main sections
2. Define key objectives and target audience
3. Identify required research areas (if applicable)
4. Suggest timeline and milestones
5. Include specific actionable steps

**Output Format**:
Provide a structured plan with:
- Executive summary
- Detailed outline
- Key objectives
- Research requirements (if applicable)
- Timeline and milestones
- Success criteria

Focus on clarity, completeness, and actionability.
    `.trim();
  }

  /**
   * Build drafting step prompt
   */
  private buildDraftingPrompt(
    basePrompt: string,
    context: WorkflowContext,
  ): string {
    const planningData = context.stepData.planning || {};
    
    return `
As a professional writer, create high-quality content based on the planning phase.

**Task**: ${basePrompt}

**Planning Context**:
${JSON.stringify(planningData, null, 2)}

**Writing Guidelines**:
- Style: ${context.stepData.drafting?.writingStyle || 'N/A'}
- Length: ${context.stepData.drafting?.targetLength || 'N/A'}
- AI assistance level: ${context.stepData.drafting?.aiAssistanceLevel || 'N/A'}

**Content Requirements**:
1. Follow the structure from the planning phase
2. Write engaging, clear, and coherent content
3. Maintain consistent tone and style
4. Include smooth transitions between sections
5. Ensure proper flow and logical progression

**Quality Standards**:
- Clear and concise writing
- Engaging introduction and conclusion
- Well-developed main points
- Appropriate use of examples and evidence
- Professional tone and style

**Output Format**:
Provide complete, well-structured content ready for the next workflow step.
Include section headings and maintain proper formatting.
    `.trim();
  }

  /**
   * Build citation step prompt
   */
  private buildCitationPrompt(
    basePrompt: string,
    context: WorkflowContext,
  ): string {
    const draftData = context.stepData.drafting || {};
    
    return `
As a citation specialist, review and improve the citations in the document.

**Task**: ${basePrompt}

**Draft Content**:
${JSON.stringify(draftData, null, 2)}

**Citation Requirements**:
- Format: Academic standard (APA, MLA, etc.)
- Accuracy: Verify all citations are properly formatted
- Completeness: Ensure all sources are cited
- Consistency: Maintain uniform citation style

**Instructions**:
1. Review all citations in the text
2. Check for proper in-text citation format
3. Verify reference list accuracy
4. Ensure consistency throughout
5. Add missing citations where needed
6. Remove or fix incorrect citations

**Quality Criteria**:
- All claims are properly cited
- Citations follow standard format
- Reference list is complete and accurate
- No citation errors or inconsistencies

**Output Format**:
Return the document with properly formatted citations and a complete reference list.
    `.trim();
  }

  /**
   * Build grammar step prompt
   */
  private buildGrammarPrompt(
    basePrompt: string,
    context: WorkflowContext,
  ): string {
    const draftData = context.stepData.drafting || {};
    
    return `
As a professional editor, review and improve the grammar, spelling, and style of the document.

**Task**: ${basePrompt}

**Content to Review**:
${JSON.stringify(draftData, null, 2)}

**Review Criteria**:
- Grammar: Correct all grammatical errors
- Spelling: Fix all spelling mistakes
- Punctuation: Ensure proper punctuation usage
- Sentence structure: Improve clarity and flow
- Word choice: Enhance vocabulary and precision
- Style consistency: Maintain uniform style

**Instructions**:
1. Carefully review each sentence
2. Correct grammatical errors
3. Fix spelling and punctuation
4. Improve sentence structure
5. Enhance word choice and clarity
6. Maintain consistent style

**Quality Standards**:
- Error-free grammar and spelling
- Clear and varied sentence structure
- Appropriate vocabulary and tone
- Consistent style throughout
- Professional presentation

**Output Format**:
Return the corrected document with all improvements implemented.
Maintain the original structure and content while fixing errors.
    `.trim();
  }

  /**
   * Build readability step prompt
   */
  private buildReadabilityPrompt(
    basePrompt: string,
    context: WorkflowContext,
  ): string {
    const draftData = context.stepData.drafting || {};
    
    return `
As a readability expert, optimize the document for clarity, flow, and engagement.

**Task**: ${basePrompt}

**Content to Optimize**:
${JSON.stringify(draftData, null, 2)}

**Readability Goals**:
- Clarity: Make complex ideas accessible
- Flow: Ensure smooth transitions
- Engagement: Keep readers interested
- Comprehension: Optimize for understanding
- Accessibility: Make content inclusive

**Optimization Areas**:
1. Sentence length and variety
2. Paragraph structure and flow
3. Transition words and phrases
4. Word choice and complexity
5. Overall organization
6. Reader engagement techniques

**Instructions**:
1. Analyze current readability level
2. Simplify complex sentences
3. Improve paragraph flow
4. Add effective transitions
5. Enhance word choice
6. Optimize overall structure

**Quality Metrics**:
- Appropriate reading level
- Varied sentence structure
- Smooth transitions
- Engaging content
- Clear organization

**Output Format**:
Return the optimized document with improved readability while maintaining the original meaning and professional quality.
    `.trim();
  }

  /**
   * Process AI response and add metadata
   */
  private processAIResponse(step: WorkflowStep, rawResponse: any): AIGenerationResponse {
    const response: AIGenerationResponse = {
      content: rawResponse.content || '',
      metadata: {
        model: rawResponse.model || this.config.model,
        tokens: rawResponse.usage?.total_tokens || 0,
        processingTime: rawResponse.processingTime || 0,
        confidence: rawResponse.confidence || 0.8,
      },
      suggestions: rawResponse.suggestions || [],
      qualityHints: rawResponse.qualityHints || [],
    };

    // Add step-specific processing
    switch (step) {
      case 'planning':
        response.qualityHints = [
          'Ensure all main sections are clearly defined',
          'Include specific, actionable objectives',
          'Consider your target audience throughout',
        ];
        break;
      
      case 'drafting':
        response.qualityHints = [
          'Maintain consistent tone and style',
          'Use clear transitions between sections',
          'Support main points with examples',
        ];
        break;
      
      case 'citation':
        response.qualityHints = [
          'Verify all citation formats are consistent',
          'Check that all sources are properly cited',
          'Ensure reference list is complete',
        ];
        break;
      
      case 'grammar':
        response.qualityHints = [
          'Review for sentence variety and flow',
          'Check for consistent verb tenses',
          'Ensure proper punctuation usage',
        ];
        break;
      
      case 'readability':
        response.qualityHints = [
          'Optimize sentence length for clarity',
          'Use active voice where appropriate',
          'Ensure logical flow between ideas',
        ];
        break;
    }

    return response;
  }

  /**
   * Get suggestions for improving quality for a specific step
   */
  getStepSuggestions(step: WorkflowStep, metrics: QualityMetrics): string[] {
    const suggestions: string[] = [];
    
    // Example logic for generating suggestions based on metrics
    if (metrics.clarity < 0.7) {
      suggestions.push('Improve clarity by simplifying complex sentences.');
    }
    if (metrics.consistency < 0.8) {
      suggestions.push('Check for consistent terminology and tone.');
    }
    
    return [];
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const aiWorkflowService = new AIWorkflowService();

// Export utility functions
export async function generateStepContent(
  step: WorkflowStep,
  prompt: string,
  context: WorkflowContext,
  config: WorkflowConfig
): Promise<AIGenerationResponse> {
  return aiWorkflowService.generateForStep({
    step,
    prompt,
    context,
    config,
  });
}

export function getStepQualitySuggestions(
  step: WorkflowStep,
  metrics: QualityMetrics
): string[] {
  return aiWorkflowService.getStepSuggestions(step, metrics);
}

// Export types
export type {
  AIGenerationRequest,
  AIGenerationResponse,
  WorkflowContext,
  AIServiceConfig,
};