import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, generateText, tool } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Types for chat integration
// Removed unused ChatMessage interface

interface WorkflowContext {
  workflowId?: string;
  currentStep?: string;
  parameters?: Record<string, unknown>;
}

interface DocumentContext {
  documentId?: string;
  documentType?: string;
  content?: string;
}

// Available tools for AI
const tools = {
  executeWorkflow: tool({
    description: 'Execute a workflow with specified parameters',
    parameters: z.object({
      workflowType: z.string(),
      parameters: z.record(z.unknown()).optional(),
    }),
    execute: async ({ workflowType }) => {
      // TODO: Integrate with actual workflow engine
      return {
        success: true,
        workflowId: `workflow-${Date.now()}`,
        status: 'started',
        message: `Started ${workflowType} workflow`,
      };
    },
  }),
  
  analyzeDocument: tool({
    description: 'Analyze a document and provide insights',
    parameters: z.object({
      documentId: z.string(),
      analysisType: z.enum(['summary', 'keywords', 'sentiment', 'structure']),
    }),
    execute: async ({ documentId, analysisType }) => {
      // TODO: Integrate with document analysis service
      return {
        documentId,
        analysisType,
        result: `Analysis of document ${documentId} using ${analysisType} method`,
        timestamp: Date.now(),
      };
    },
  }),
  
  searchKnowledge: tool({
    description: 'Search the knowledge base for relevant information',
    parameters: z.object({
      query: z.string(),
      scope: z.enum(['documents', 'workflows', 'general']).optional(),
    }),
    execute: async ({ query, scope = 'general' }) => {
      // TODO: Integrate with knowledge base search
      return {
        query,
        scope,
        results: [
          {
            title: `Search result for: ${query}`,
            content: `This is a mock search result for the query "${query}" in scope "${scope}".`,
            relevance: 0.85,
          },
        ],
      };
    },
  }),
};

// System prompts for different contexts
const getSystemPrompt = (context: {
  workflowContext?: WorkflowContext;
  documentContext?: DocumentContext;
  userRole?: string;
}) => {
  const { workflowContext, documentContext, userRole } = context;
  
  let systemPrompt = `You are ChUseA AI Assistant, an intelligent assistant that helps users with various tasks including workflow management, document analysis, and general assistance.

You have access to tools that allow you to:
- Execute and manage workflows
- Analyze documents and extract insights
- Search the knowledge base for relevant information

Always be helpful, accurate, and concise in your responses. When users ask about workflows or documents, use the appropriate tools to provide real-time information.`;

  if (workflowContext?.workflowId) {
    systemPrompt += `\n\nCurrent workflow context:
- Workflow ID: ${workflowContext.workflowId}
- Current step: ${workflowContext.currentStep || 'Unknown'}
- You can help manage this workflow and execute related tasks.`;
  }

  if (documentContext?.documentId) {
    systemPrompt += `\n\nCurrent document context:
- Document ID: ${documentContext.documentId}
- Document type: ${documentContext.documentType || 'Unknown'}
- You can analyze this document and provide insights.`;
  }

  if (userRole) {
    systemPrompt += `\n\nUser role: ${userRole}`;
  }

  return systemPrompt;
};

// POST endpoint for chat completions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      messages, 
      model = 'gpt-4o-mini', 
      stream = false, // Disable streaming for demo
      workflowContext,
      documentContext,
      userRole,
      maxTokens = 1000,
      temperature = 0.7,
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if API keys are available
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';
    const hasAnthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here';

    if (!hasOpenAI && !hasAnthropic) {
      // Return mock response for demo purposes
      const lastMessage = messages[messages.length - 1];
      const mockResponse = generateMockResponse(lastMessage?.content || 'Hello', workflowContext, documentContext);
      
      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: mockResponse,
          timestamp: Date.now(),
        },
        usage: { total_tokens: 50, prompt_tokens: 20, completion_tokens: 30 },
        finishReason: 'stop',
        demo: true,
      });
    }

    // Get the appropriate AI provider
    const getModelProvider = (modelName: string) => {
      if (modelName.startsWith('gpt-') || modelName.includes('openai')) {
        return openai(modelName.replace('openai/', ''));
      }
      if (modelName.includes('claude') || modelName.includes('anthropic')) {
        return anthropic(modelName.replace('anthropic/', ''));
      }
      // Default to OpenAI
      return openai('gpt-4o-mini');
    };

    const modelProvider = getModelProvider(model);
    const systemPrompt = getSystemPrompt({ workflowContext, documentContext, userRole });

    // Prepare messages with system prompt
    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: { role: 'user' | 'assistant'; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    if (stream) {
      // Stream response
      const result = await streamText({
        model: modelProvider,
        messages: formattedMessages,
        tools,
        maxTokens,
        temperature,
      });

      return result.toDataStreamResponse();
    } else {
      // Non-streaming response
      const result = await generateText({
        model: modelProvider,
        messages: formattedMessages,
        tools,
        maxTokens,
        temperature,
      });

      return NextResponse.json({
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: result.text,
          timestamp: Date.now(),
        },
        usage: result.usage,
        finishReason: result.finishReason,
      });
    }
  } catch (error) {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Chat API error:', error);
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock response generator for demo purposes
function generateMockResponse(
  userMessage: string, 
  workflowContext?: WorkflowContext, 
  documentContext?: DocumentContext
): string {
  const responses = [
    "Thanks for your message! I'm ChUseA AI Assistant, ready to help you with workflows, documents, and more.",
    "I understand you're looking for assistance. How can I help you today?",
    "I'm here to help with your tasks. What would you like to work on?",
    "Great question! Let me help you with that.",
    "I can assist you with various tasks including workflow management and document analysis.",
  ];

  let response = responses[Math.floor(Math.random() * responses.length)];

  // Add context-aware responses
  if (workflowContext?.workflowId) {
    response += ` I see you're working with workflow ${workflowContext.workflowId}. I can help you manage and execute workflow steps.`;
  }

  if (documentContext?.documentId) {
    response += ` I notice you have document ${documentContext.documentId} open. I can help analyze or edit this document.`;
  }

  // Handle specific commands
  if (userMessage.toLowerCase().includes('workflow')) {
    response = "I can help you with workflows! You can use commands like /workflow start, /workflow status, or /workflow list to manage your workflows.";
  } else if (userMessage.toLowerCase().includes('document')) {
    response = "I'm great at working with documents! I can analyze, summarize, or help you edit your documents.";
  } else if (userMessage.toLowerCase().includes('help')) {
    response = "Here are some things I can help you with:\n\n• **Workflows**: Create, manage, and execute automated workflows\n• **Documents**: Analyze, summarize, and edit documents\n• **Commands**: Use slash commands like /help, /workflow, /analyze\n• **General assistance**: Answer questions and provide information\n\nWhat would you like to explore?";
  }

  return response;
}

// GET endpoint for health check
export async function GET() {
  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';
  const hasAnthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here';
  
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    apiKeys: {
      openai: hasOpenAI,
      anthropic: hasAnthropic,
    },
    demoMode: !hasOpenAI && !hasAnthropic,
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-3.5-turbo',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
    tools: Object.keys(tools),
    message: !hasOpenAI && !hasAnthropic 
      ? 'Running in demo mode. Add API keys to .env.local for full functionality.'
      : 'API ready with AI providers configured.',
  });
}