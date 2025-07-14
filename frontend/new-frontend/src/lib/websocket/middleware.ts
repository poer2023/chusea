/**
 * WebSocket Message Middleware System for ChUseA
 * Provides message filtering, transformation, buffering, and batch processing
 */

import { 
  WebSocketMessage, 
  MessageMiddleware,
  MessageFilter,
  WorkflowUpdateMessage,
  DocumentChangeMessage,
  NotificationMessage,
  SystemMessage
} from './types';

// Utility types for middleware
export interface MiddlewareContext {
  timestamp: number;
  clientId: string;
  userId?: string;
  sessionId?: string;
}

export interface BatchOptions {
  maxSize: number;
  maxWait: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface TransformOptions {
  includeMetadata?: boolean;
  sanitizeContent?: boolean;
  validateSchema?: boolean;
}

// Core middleware implementations
export class MessageTransformMiddleware implements MessageMiddleware {
  constructor(private options: TransformOptions = {}) {}

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    try {
      // Add client-side metadata
      if (this.options.includeMetadata) {
        message.metadata = {
          ...message.metadata,
          clientReceived: Date.now(),
          clientVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        };
      }

      // Validate message schema
      if (this.options.validateSchema && !this.validateMessageSchema(message)) {
        console.warn('Invalid message schema, dropping message:', message);
        return null;
      }

      // Sanitize content if needed
      if (this.options.sanitizeContent) {
        message = this.sanitizeMessage(message);
      }

      return message;
    } catch (error) {
      console.error('Error in incoming message transform:', error);
      return null;
    }
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    try {
      // Ensure message has required fields
      if (!message.id) {
        message.id = this.generateMessageId();
      }

      if (!message.timestamp) {
        message.timestamp = Date.now();
      }

      // Add version if not present
      if (!message.version) {
        message.version = '1.0';
      }

      return message;
    } catch (error) {
      console.error('Error in outgoing message transform:', error);
      return null;
    }
  };

  private validateMessageSchema(message: WebSocketMessage): boolean {
    return (
      typeof message.type === 'string' &&
      typeof message.timestamp === 'number' &&
      typeof message.id === 'string' &&
      message.data !== undefined
    );
  }

  private sanitizeMessage(message: WebSocketMessage): WebSocketMessage {
    // Remove potentially harmful content
    const sanitized = { ...message };
    
    if (typeof sanitized.data === 'object' && sanitized.data !== null) {
      sanitized.data = this.sanitizeObject(sanitized.data);
    }

    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip dangerous properties
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }

      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Deduplication middleware
export class DeduplicationMiddleware implements MessageMiddleware {
  private seenMessages = new Set<string>();
  private maxCacheSize = 1000;

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    const messageKey = this.getMessageKey(message);
    
    if (this.seenMessages.has(messageKey)) {
      console.debug('Duplicate message detected, dropping:', messageKey);
      return null;
    }

    this.seenMessages.add(messageKey);
    
    // Prevent memory leaks by limiting cache size
    if (this.seenMessages.size > this.maxCacheSize) {
      const firstKey = this.seenMessages.values().next().value;
      this.seenMessages.delete(firstKey);
    }

    return message;
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    return message; // No deduplication needed for outgoing messages
  };

  private getMessageKey(message: WebSocketMessage): string {
    // Create a unique key based on message content
    return `${message.type}-${message.id}-${message.timestamp}`;
  }

  public clearCache(): void {
    this.seenMessages.clear();
  }
}

// Priority-based batching middleware
export class BatchingMiddleware implements MessageMiddleware {
  private messageBatches: Map<string, WebSocketMessage[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private batchCallback: (messages: WebSocketMessage[]) => void;

  constructor(
    private options: BatchOptions,
    batchCallback: (messages: WebSocketMessage[]) => void
  ) {
    this.batchCallback = batchCallback;
  }

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    const batchKey = this.getBatchKey(message);
    
    if (!this.messageBatches.has(batchKey)) {
      this.messageBatches.set(batchKey, []);
    }

    const batch = this.messageBatches.get(batchKey)!;
    batch.push(message);

    // Check if batch is ready for processing
    if (batch.length >= this.options.maxSize) {
      this.processBatch(batchKey);
      return null; // Messages will be processed in batch
    }

    // Set timer for batch processing if not already set
    if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.processBatch(batchKey);
      }, this.options.maxWait);
      
      this.batchTimers.set(batchKey, timer);
    }

    return null; // Messages will be processed in batch
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    return message; // No batching for outgoing messages
  };

  private getBatchKey(message: WebSocketMessage): string {
    // Group messages by type and priority
    const priority = this.getMessagePriority(message);
    return `${message.type}-${priority}`;
  }

  private getMessagePriority(message: WebSocketMessage): string {
    // Determine priority based on message type and content
    switch (message.type) {
      case 'workflow_error':
      case 'system_message':
        return 'high';
      case 'workflow_update':
      case 'document_change':
        return 'medium';
      default:
        return 'low';
    }
  }

  private processBatch(batchKey: string): void {
    const batch = this.messageBatches.get(batchKey);
    const timer = this.batchTimers.get(batchKey);

    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    if (batch && batch.length > 0) {
      this.batchCallback(batch);
      this.messageBatches.set(batchKey, []);
    }
  }

  public flushAll(): void {
    for (const batchKey of this.messageBatches.keys()) {
      this.processBatch(batchKey);
    }
  }

  public destroy(): void {
    // Clear all timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    
    this.batchTimers.clear();
    this.messageBatches.clear();
  }
}

// Rate limiting middleware
export class RateLimitingMiddleware implements MessageMiddleware {
  private messageCount = 0;
  private lastReset = Date.now();
  private droppedMessages = 0;

  constructor(
    private maxMessages: number,
    private windowMs: number = 1000
  ) {}

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    return message; // No rate limiting on incoming messages
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastReset >= this.windowMs) {
      this.messageCount = 0;
      this.lastReset = now;
    }

    // Check if we're within the rate limit
    if (this.messageCount >= this.maxMessages) {
      this.droppedMessages++;
      console.warn(`Rate limit exceeded, dropping message. Total dropped: ${this.droppedMessages}`);
      return null;
    }

    this.messageCount++;
    return message;
  };

  public getStats(): { sent: number; dropped: number; remaining: number } {
    return {
      sent: this.messageCount,
      dropped: this.droppedMessages,
      remaining: Math.max(0, this.maxMessages - this.messageCount),
    };
  }

  public reset(): void {
    this.messageCount = 0;
    this.droppedMessages = 0;
    this.lastReset = Date.now();
  }
}

// Logging middleware for debugging
export class LoggingMiddleware implements MessageMiddleware {
  constructor(
    private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug',
    private logPrefix = '[WebSocket]'
  ) {}

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    this.log('info', 'Received message:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp,
      dataSize: JSON.stringify(message.data).length,
    });
    
    return message;
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    this.log('info', 'Sending message:', {
      type: message.type,
      id: message.id,
      timestamp: message.timestamp,
      dataSize: JSON.stringify(message.data).length,
    });
    
    return message;
  };

  private log(level: string, message: string, data?: any): void {
    if (this.shouldLog(level)) {
      const logMessage = `${this.logPrefix} ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, data);
          break;
        case 'info':
          console.info(logMessage, data);
          break;
        case 'warn':
          console.warn(logMessage, data);
          break;
        case 'error':
          console.error(logMessage, data);
          break;
      }
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }
}

// Compression middleware
export class CompressionMiddleware implements MessageMiddleware {
  private compressionThreshold = 1024; // Compress messages larger than 1KB

  incoming = (message: WebSocketMessage): WebSocketMessage | null => {
    try {
      // Check if message is compressed
      if (message.metadata?.compressed) {
        message.data = this.decompress(message.data);
        delete message.metadata.compressed;
      }
      
      return message;
    } catch (error) {
      console.error('Failed to decompress message:', error);
      return null;
    }
  };

  outgoing = (message: WebSocketMessage): WebSocketMessage | null => {
    try {
      const messageSize = JSON.stringify(message.data).length;
      
      // Compress large messages
      if (messageSize > this.compressionThreshold) {
        message.data = this.compress(message.data);
        message.metadata = message.metadata || {};
        message.metadata.compressed = true;
        message.metadata.originalSize = messageSize;
      }
      
      return message;
    } catch (error) {
      console.error('Failed to compress message:', error);
      return message; // Return original message if compression fails
    }
  };

  private compress(data: any): string {
    // Simple string compression using LZ-like algorithm
    const jsonString = JSON.stringify(data);
    return this.lzCompress(jsonString);
  }

  private decompress(compressedData: string): any {
    // Decompress and parse
    const jsonString = this.lzDecompress(compressedData);
    return JSON.parse(jsonString);
  }

  private lzCompress(str: string): string {
    // Simple LZ77-like compression
    const dict: Record<string, number> = {};
    let data = str.split('');
    let out: string[] = [];
    let currChar: string;
    let phrase = data[0];
    let code = 256;
    
    for (let i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? String(dict[phrase]) : phrase);
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    
    out.push(phrase.length > 1 ? String(dict[phrase]) : phrase);
    
    return out.join('');
  }

  private lzDecompress(str: string): string {
    // Simple LZ77-like decompression
    const dict: Record<number, string> = {};
    let data = str.split('');
    let currChar = data[0];
    let oldPhrase = currChar;
    let out = [currChar];
    let code = 256;
    let phrase: string;
    
    for (let i = 1; i < data.length; i++) {
      let currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      }
      
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    
    return out.join('');
  }
}

// Factory functions for creating middleware
export const createTransformMiddleware = (options?: TransformOptions): MessageTransformMiddleware => {
  return new MessageTransformMiddleware(options);
};

export const createDeduplicationMiddleware = (): DeduplicationMiddleware => {
  return new DeduplicationMiddleware();
};

export const createBatchingMiddleware = (
  options: BatchOptions,
  callback: (messages: WebSocketMessage[]) => void
): BatchingMiddleware => {
  return new BatchingMiddleware(options, callback);
};

export const createRateLimitingMiddleware = (
  maxMessages: number,
  windowMs: number = 1000
): RateLimitingMiddleware => {
  return new RateLimitingMiddleware(maxMessages, windowMs);
};

export const createLoggingMiddleware = (
  logLevel?: 'debug' | 'info' | 'warn' | 'error',
  prefix?: string
): LoggingMiddleware => {
  return new LoggingMiddleware(logLevel, prefix);
};

export const createCompressionMiddleware = (): CompressionMiddleware => {
  return new CompressionMiddleware();
};

// Middleware chain manager
export class MiddlewareChain {
  private middlewares: MessageMiddleware[] = [];

  add(middleware: MessageMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  remove(middleware: MessageMiddleware): this {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
    return this;
  }

  processIncoming(message: WebSocketMessage): WebSocketMessage | null {
    let currentMessage: WebSocketMessage | null = message;
    
    for (const middleware of this.middlewares) {
      if (middleware.incoming && currentMessage) {
        currentMessage = middleware.incoming(currentMessage);
      }
    }
    
    return currentMessage;
  }

  processOutgoing(message: WebSocketMessage): WebSocketMessage | null {
    let currentMessage: WebSocketMessage | null = message;
    
    for (const middleware of this.middlewares) {
      if (middleware.outgoing && currentMessage) {
        currentMessage = middleware.outgoing(currentMessage);
      }
    }
    
    return currentMessage;
  }

  clear(): void {
    this.middlewares = [];
  }

  getMiddlewareCount(): number {
    return this.middlewares.length;
  }
}

// Default middleware configurations
export const createDefaultMiddlewareChain = (
  batchCallback?: (messages: WebSocketMessage[]) => void
): MiddlewareChain => {
  const chain = new MiddlewareChain();
  
  // Add standard middleware in order
  chain.add(createLoggingMiddleware('info'))
       .add(createTransformMiddleware({ validateSchema: true, sanitizeContent: true }))
       .add(createDeduplicationMiddleware())
       .add(createRateLimitingMiddleware(50, 1000)); // 50 messages per second
  
  if (batchCallback) {
    chain.add(createBatchingMiddleware(
      { maxSize: 10, maxWait: 100 },
      batchCallback
    ));
  }
  
  return chain;
};

export const createProductionMiddlewareChain = (
  batchCallback?: (messages: WebSocketMessage[]) => void
): MiddlewareChain => {
  const chain = new MiddlewareChain();
  
  // Production-optimized middleware
  chain.add(createTransformMiddleware({ 
      validateSchema: true, 
      sanitizeContent: true, 
      includeMetadata: false 
    }))
    .add(createDeduplicationMiddleware())
    .add(createCompressionMiddleware())
    .add(createRateLimitingMiddleware(100, 1000));
  
  if (batchCallback) {
    chain.add(createBatchingMiddleware(
      { maxSize: 20, maxWait: 50 },
      batchCallback
    ));
  }
  
  return chain;
};