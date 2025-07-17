import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageSquare, Settings, X, Maximize2, Minimize2, Zap, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/stores/layout-store';
import { useBreakpoint } from '@/lib/responsive/breakpoints';
import { cn } from '@/lib/utils';
import { AIService, aiService } from '@/lib/ai/ai-service';
import { AIWebSocketClient } from '@/lib/ai/websocket-client';
import { slashCommandParser, SlashCommand, SlashCommandContext } from '@/lib/ai/slash-commands';
import { useAuthStore } from '@/stores/auth-store';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    command?: string;
    model?: string;
    usage?: any;
    executionTime?: number;
  };
}

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

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onMessageSend,
  onCommandExecute,
  onTextInsert,
  onTextReplace,
  selectedText,
  fullText = '',
  cursorPosition = 0,
  documentId,
  workflowId,
  className
}) => {
  const { state, actions } = useLayoutStore();
  const breakpoint = useBreakpoint();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'AI Writing Assistant ready! Use slash commands like /rewrite, /expand, /cite to get started.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<SlashCommand[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [wsClient, setWsClient] = useState<AIWebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize AI service and WebSocket
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await aiService.initializeWebSocket({
          userId: user?.id,
          sessionId: `session_${Date.now()}`
        });
        
        // Set up WebSocket client for real-time communication
        const client = new AIWebSocketClient('/api/chat/ws', {
          userId: user?.id,
          sessionId: `session_${Date.now()}`
        });
        
        await client.connect();
        setWsClient(client);
        
        // Set up event listeners
        client.on('ai_response', (response) => {
          if (response.isComplete) {
            setIsProcessing(false);
            setStreamingMessageId(null);
          }
        });
        
        client.on('ai_stream', (chunk) => {
          if (streamingMessageId) {
            setMessages(prev => prev.map(msg => 
              msg.id === streamingMessageId 
                ? { ...msg, content: msg.content + chunk.content }
                : msg
            ));
          }
        });
        
        client.on('ai_error', (error) => {
          setIsProcessing(false);
          setStreamingMessageId(null);
          addMessage({
            type: 'error',
            content: `Error: ${error.error}`,
            timestamp: new Date()
          });
        });
        
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        addMessage({
          type: 'error',
          content: 'Failed to connect to AI service. Some features may not work.',
          timestamp: new Date()
        });
      }
    };
    
    initializeAI();
    
    return () => {
      wsClient?.destroy();
    };
  }, [user?.id]);

  // Handle input changes for command suggestions
  useEffect(() => {
    if (inputValue.startsWith('/')) {
      const context: SlashCommandContext = {
        selectedText,
        fullText,
        cursorPosition,
        documentId,
        workflowId,
        userId: user?.id
      };
      
      const suggestions = slashCommandParser.getSuggestions(inputValue, context);
      setCommandSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
      setCommandSuggestions([]);
    }
  }, [inputValue, selectedText, fullText, cursorPosition, documentId, workflowId, user?.id]);

  // Helper function to add messages
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue;
    setInputValue('');
    setShowSuggestions(false);
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    
    setIsProcessing(true);
    
    try {
      const context: SlashCommandContext = {
        selectedText,
        fullText,
        cursorPosition,
        documentId,
        workflowId,
        userId: user?.id
      };
      
      if (userMessage.startsWith('/')) {
        // Handle slash command
        const result = await aiService.executeSlashCommand(userMessage, context, {
          onStream: (chunk) => {
            // Handle streaming response
            if (!streamingMessageId) {
              const msgId = addMessage({
                type: 'ai',
                content: chunk.content,
                timestamp: new Date(),
                isStreaming: true
              });
              setStreamingMessageId(msgId);
            }
          }
        });
        
        if (result.success) {
          // Handle successful command execution
          if (result.shouldReplaceSelection && selectedText && onTextReplace) {
            onTextReplace(selectedText, result.replaceText || '');
          } else if (result.shouldInsertText && onTextInsert) {
            onTextInsert(result.insertText || '');
          }
          
          if (result.showInChat && result.chatMessage) {
            addMessage({
              type: 'system',
              content: result.chatMessage,
              timestamp: new Date()
            });
          }
        } else {
          // Handle command error
          addMessage({
            type: 'error',
            content: result.error || 'Command execution failed',
            timestamp: new Date()
          });
        }
        
        // Legacy callback for backwards compatibility
        if (onCommandExecute) {
          const [command, ...args] = userMessage.slice(1).split(' ');
          onCommandExecute(command, args);
        }
      } else {
        // Handle regular chat message
        const response = await aiService.generateText(userMessage, context, {
          onStream: (chunk) => {
            if (!streamingMessageId) {
              const msgId = addMessage({
                type: 'ai',
                content: chunk.content,
                timestamp: new Date(),
                isStreaming: true
              });
              setStreamingMessageId(msgId);
            }
          }
        });
        
        if (!streamingMessageId) {
          addMessage({
            type: 'ai',
            content: response,
            timestamp: new Date()
          });
        }
        
        // Legacy callback for backwards compatibility
        onMessageSend?.(userMessage);
      }
    } catch (error) {
      addMessage({
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showSuggestions && commandSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev + 1) % commandSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => (prev - 1 + commandSuggestions.length) % commandSuggestions.length);
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        selectSuggestion(commandSuggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectSuggestion = (command: SlashCommand) => {
    setInputValue(`/${command.name} `);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageBubbleClass = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-primary text-primary-foreground ml-12';
      case 'ai':
        return 'bg-muted mr-12';
      case 'system':
        return 'bg-blue-50 border-blue-200 text-blue-800 mx-8';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 mx-8';
      default:
        return 'bg-muted';
    }
  };

  const getMessageIcon = (type: string, isStreaming?: boolean) => {
    switch (type) {
      case 'user':
        return null;
      case 'ai':
        return isStreaming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />;
      case 'system':
        return <MessageSquare className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Mobile FAB when collapsed
  if (breakpoint === 'mobile' && !state.isChatPanelExpanded) {
    return (
      <button
        onClick={() => actions.toggleChatPanel()}
        className={cn(
          'fixed bottom-4 right-4 w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center',
          'hover:scale-105 transition-transform',
          'z-50',
          className
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={cn('chat-panel', 'h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
          <Badge variant="outline" className="text-xs">
            {messages.length - 1}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          
          {breakpoint === 'mobile' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => actions.toggleChatPanel()}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-1',
                  message.type === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <Card className={cn(
                  'p-3 max-w-[80%] break-words',
                  getMessageBubbleClass(message.type)
                )}>
                  <div className="flex items-start gap-2">
                    {getMessageIcon(message.type, message.isStreaming)}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.metadata && (
                        <div className="mt-2 text-xs opacity-75">
                          {message.metadata.command && (
                            <span className="inline-flex items-center gap-1 bg-black/10 rounded px-1">
                              <Zap className="w-3 h-3" />
                              {message.metadata.command}
                            </span>
                          )}
                          {message.metadata.executionTime && (
                            <span className="ml-2">
                              {message.metadata.executionTime}ms
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border relative">
            {/* Command Suggestions */}
            {showSuggestions && commandSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
              >
                {commandSuggestions.map((command, index) => (
                  <div
                    key={command.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                      index === selectedSuggestion && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    onClick={() => selectSuggestion(command)}
                  >
                    <span className="text-lg">{command.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">/{command.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {command.category}
                        </Badge>
                        {command.requiresSelection && !selectedText && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                            Needs selection
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {command.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type a message or /command..."
                className="flex-1"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Status Bar */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {inputValue.startsWith('/') && !showSuggestions && (
                  <span>Type to see command suggestions</span>
                )}
                {selectedText && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedText.length} chars selected
                  </span>
                )}
                {isProcessing && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {wsClient && (
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    wsClient.getState().isConnected ? 'bg-green-500' : 'bg-red-500'
                  )} />
                )}
                <span>AI</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status information */}
      {(selectedText || isProcessing) && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            {selectedText && (
              <span>Selected: {selectedText.length} characters</span>
            )}
            {isProcessing && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                AI is processing...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};