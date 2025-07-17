# AI Integration Documentation

## Overview

This document describes the comprehensive AI integration implemented in Phase 2 of the ChUseA project. The AI integration provides real-time AI-powered writing assistance through WebSocket connections, slash commands, and streaming responses.

## Architecture

The AI integration consists of four main components:

1. **Slash Command System** (`/lib/ai/slash-commands.ts`)
2. **WebSocket AI Client** (`/lib/ai/websocket-client.ts`)
3. **AI Service Integration** (`/lib/ai/ai-service.ts`)
4. **Enhanced ChatPanel** (`/components/writing-workspace/ChatPanel/ChatPanel.tsx`)

## Components

### 1. Slash Command System

The slash command system provides structured AI interactions through command parsing and validation.

#### Features:
- **Command Definitions**: Pre-defined commands for various AI tasks
- **Parameter Validation**: Type-safe parameter parsing and validation
- **Autocomplete**: Real-time command suggestions with filtering
- **Context Awareness**: Commands adapt based on text selection and context

#### Available Commands:
- `/rewrite` - Rewrite text with different styles and tones
- `/expand` - Expand text with more detail or examples
- `/summarize` - Create summaries of selected text
- `/translate` - Translate text to different languages
- `/grammar` - Check and fix grammar issues
- `/improve` - Improve clarity and readability
- `/cite` - Generate citations and find sources
- `/format` - Format text according to style guidelines
- `/analyze` - Analyze text for various insights
- `/help` - Show help information

#### Usage Example:
```typescript
import { slashCommandParser } from '@/lib/ai/slash-commands';

const parsed = slashCommandParser.parse('/rewrite academic formal');
if (parsed.isValid) {
  // Execute command
}
```

### 2. WebSocket AI Client

The WebSocket client handles real-time communication with AI services.

#### Features:
- **Real-time Streaming**: Supports streaming AI responses
- **Connection Management**: Automatic reconnection and error handling
- **Message Queuing**: Handles concurrent requests and responses
- **Event System**: Comprehensive event handling for different states

#### Usage Example:
```typescript
import { AIWebSocketClient } from '@/lib/ai/websocket-client';

const client = new AIWebSocketClient('/api/chat/ws');
await client.connect();

const response = await client.sendChatMessage('Hello AI', context, {
  onStream: (chunk) => console.log(chunk.content)
});
```

### 3. AI Service Integration

The AI service provides high-level methods for different AI tasks.

#### Features:
- **Task-Specific Methods**: Specialized methods for different AI operations
- **Prompt Engineering**: Optimized prompts for different use cases
- **Error Handling**: Comprehensive error handling and retry logic
- **Caching**: Request caching for improved performance

#### Usage Example:
```typescript
import { aiService } from '@/lib/ai/ai-service';

await aiService.initializeWebSocket({ userId: 'user123' });

const rewritten = await aiService.rewriteText(
  'Original text',
  context,
  { style: 'academic', tone: 'formal' }
);
```

### 4. Enhanced ChatPanel

The ChatPanel component provides the user interface for AI interactions.

#### Features:
- **Slash Command Autocomplete**: Visual command suggestions with keyboard navigation
- **Real-time Streaming**: Live display of AI responses as they're generated
- **Message History**: Persistent chat history with different message types
- **Error Handling**: Visual error states and feedback
- **Selection Integration**: Automatic context from text selection

#### Props:
```typescript
interface ChatPanelProps {
  onMessageSend?: (message: string) => void;
  onCommandExecute?: (command: string, args: string[]) => void;
  onTextInsert?: (text: string) => void;
  onTextReplace?: (oldText: string, newText: string) => void;
  selectedText?: string;
  fullText?: string;
  cursorPosition?: number;
  documentId?: string;
  workflowId?: string;
  className?: string;
}
```

## Integration with WritingWorkspace

The AI integration is fully integrated with the WritingWorkspace component:

```typescript
// In WritingWorkspace.tsx
<ChatPanel
  onMessageSend={handleMessageSend}
  onCommandExecute={handleCommandExecute}
  onTextInsert={handleTextInsert}
  onTextReplace={handleTextReplace}
  selectedText={selectedText?.text}
  fullText={content}
  cursorPosition={selectedText?.from || 0}
  documentId={documentId}
  workflowId={workflow.id}
/>
```

## WebSocket Protocol

The AI WebSocket client uses a custom protocol for real-time communication:

### Message Types:
- `ai_request` - Send AI requests
- `ai_response` - Receive AI responses
- `ai_stream` - Streaming content chunks
- `ai_complete` - Mark completion of streaming
- `ai_error` - Error notifications
- `ai_cancel` - Cancel requests

### Message Format:
```typescript
interface AIWebSocketMessage {
  type: 'ai_request' | 'ai_response' | 'ai_stream' | 'ai_error' | 'ai_complete' | 'ai_cancel';
  data: any;
  timestamp: number;
  id: string;
}
```

## Error Handling

The AI integration includes comprehensive error handling:

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Request Timeouts**: Configurable timeouts with retry logic
3. **Validation Errors**: Clear error messages for invalid commands
4. **Rate Limiting**: Respect API rate limits and quotas
5. **User Feedback**: Visual error states in the UI

## Performance Considerations

- **Streaming**: Reduces perceived latency for long responses
- **Caching**: Prevents duplicate requests for same inputs
- **Batching**: Efficient handling of multiple concurrent requests
- **Connection Pooling**: Reuse WebSocket connections
- **Memory Management**: Proper cleanup of event listeners and resources

## Security

- **Input Validation**: All user inputs are validated and sanitized
- **Authentication**: WebSocket connections require proper authentication
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Content Filtering**: Filters potentially harmful content

## Testing

The AI integration includes comprehensive testing:

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: End-to-end workflow testing
3. **Mock Services**: Fallback modes for development
4. **Performance Tests**: Load testing for WebSocket connections

## Configuration

The AI integration supports various configuration options:

```typescript
interface AIServiceConfig {
  apiUrl: string;
  wsUrl: string;
  defaultModel: string;
  maxRetries: number;
  timeout: number;
  apiKey?: string;
}
```

## Future Enhancements

Planned improvements for the AI integration:

1. **Multi-language Support**: Extended language support for commands
2. **Custom Commands**: User-defined slash commands
3. **Advanced Analytics**: Detailed usage analytics and insights
4. **Collaborative AI**: Multi-user AI interactions
5. **Voice Integration**: Voice-to-text and text-to-speech capabilities
6. **Plugin System**: Extensible plugin architecture for AI features

## Troubleshooting

Common issues and solutions:

1. **WebSocket Connection Failed**: Check network connectivity and server status
2. **Command Not Found**: Verify command spelling and availability
3. **Streaming Issues**: Check browser WebSocket support
4. **Performance Problems**: Monitor memory usage and connection count
5. **Authentication Errors**: Verify user session and permissions

## API Reference

### Slash Commands
- `slashCommandParser.parse(input)` - Parse command input
- `slashCommandParser.getSuggestions(input, context)` - Get command suggestions
- `slashCommandParser.validateContext(command, context)` - Validate command context

### WebSocket Client
- `client.connect()` - Connect to WebSocket server
- `client.sendChatMessage(message, context, options)` - Send chat message
- `client.executeCommand(command, context, options)` - Execute slash command
- `client.disconnect()` - Disconnect from server

### AI Service
- `aiService.initializeWebSocket(options)` - Initialize WebSocket connection
- `aiService.executeSlashCommand(command, context, options)` - Execute command
- `aiService.generateText(prompt, context, options)` - Generate text
- `aiService.rewriteText(text, context, options)` - Rewrite text
- `aiService.translateText(text, language, context, options)` - Translate text

This documentation provides a comprehensive overview of the AI integration implementation. For specific implementation details, refer to the individual component files.