/**
 * WebSocket Client for ChUseA Real-time Communication System
 * Provides connection management, message handling, and automatic reconnection
 */

import { 
  WebSocketConfig, 
  WebSocketMessage, 
  ConnectionStatus, 
  ConnectionState,
  WebSocketEventHandlers,
  PerformanceMetrics,
  WebSocketErrorInfo,
  MessageFilter,
  MessageMiddleware
} from './types';
import { ReconnectionManager, createReconnectionManager } from './reconnection';

export class ChUseAWebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectionManager: ReconnectionManager;
  private eventHandlers: WebSocketEventHandlers;
  private connectionState: ConnectionState;
  private messageQueue: WebSocketMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private missedHeartbeats = 0;
  private metrics: PerformanceMetrics;
  private messageFilters: MessageFilter[] = [];
  private middleware: MessageMiddleware[] = [];
  private rateLimitTokens: number = 0;
  private rateLimitLastRefill: number = Date.now();
  private isDestroyed = false;

  constructor(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
    this.config = this.validateAndSetDefaults(config);
    this.eventHandlers = handlers;
    this.reconnectionManager = createReconnectionManager(config.reconnect);
    
    this.connectionState = {
      status: 'disconnected',
      url: config.url,
      protocols: config.protocols,
      reconnectAttempts: 0,
      maxReconnectAttempts: config.reconnect.maxAttempts,
      reconnectInterval: config.reconnect.initialDelay,
    };

    this.metrics = {
      connectionTime: 0,
      messageLatency: [],
      messagesReceived: 0,
      messagesSent: 0,
      reconnections: 0,
      bytesReceived: 0,
      bytesSent: 0,
      errors: [],
    };

    // Initialize rate limiting
    if (this.config.rateLimiting) {
      this.rateLimitTokens = this.config.rateLimiting.burstSize;
    }
  }

  // Connection Management
  public connect(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('WebSocket client has been destroyed');
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return Promise.resolve();
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState.status = 'connecting';
        const startTime = Date.now();

        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        if (this.config.binaryType) {
          this.ws.binaryType = this.config.binaryType;
        }

        this.ws.onopen = (event) => {
          this.metrics.connectionTime = Date.now() - startTime;
          this.connectionState.status = 'connected';
          this.connectionState.lastConnected = Date.now();
          this.reconnectionManager.onReconnectSuccess();
          
          this.startHeartbeat();
          this.processMessageQueue();
          
          this.eventHandlers.onOpen?.(event);
          resolve();
        };

        this.ws.onclose = (event) => {
          this.handleDisconnection(event);
        };

        this.ws.onerror = (event) => {
          this.handleError(event);
          if (this.connectionState.status === 'connecting') {
            reject(new Error('Failed to establish WebSocket connection'));
          }
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.connectionState.status = 'failed';
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.connectionState.status = 'disconnecting';
    this.stopHeartbeat();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client initiated disconnect');
    }
    
    this.connectionState.status = 'disconnected';
    this.connectionState.lastDisconnected = Date.now();
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.messageQueue = [];
    this.messageFilters = [];
    this.middleware = [];
    this.ws = null;
  }

  // Message Handling
  public sendMessage(message: WebSocketMessage): boolean {
    if (this.isDestroyed) {
      console.warn('Cannot send message: WebSocket client has been destroyed');
      return false;
    }

    // Apply rate limiting
    if (!this.checkRateLimit()) {
      console.warn('Message dropped due to rate limiting');
      return false;
    }

    // Apply outgoing middleware
    const processedMessage = this.applyOutgoingMiddleware(message);
    if (!processedMessage) {
      return false; // Message was filtered out by middleware
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const messageString = JSON.stringify(processedMessage);
        this.ws.send(messageString);
        
        this.metrics.messagesSent++;
        this.metrics.bytesSent += messageString.length;
        
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        this.recordError('message', error as Error);
        return false;
      }
    } else {
      // Queue message for later delivery
      if (this.messageQueue.length < this.config.messageQueue.maxSize) {
        this.messageQueue.push(processedMessage);
        return true;
      } else {
        console.warn('Message queue is full, dropping message');
        return false;
      }
    }
  }

  public sendHeartbeat(): void {
    const heartbeatMessage: WebSocketMessage = {
      type: 'heartbeat',
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };
    
    this.sendMessage(heartbeatMessage);
  }

  // Filters and Middleware
  public addMessageFilter(filter: MessageFilter): void {
    this.messageFilters.push(filter);
  }

  public removeMessageFilter(filter: MessageFilter): void {
    const index = this.messageFilters.indexOf(filter);
    if (index > -1) {
      this.messageFilters.splice(index, 1);
    }
  }

  public addMiddleware(middleware: MessageMiddleware): void {
    this.middleware.push(middleware);
  }

  public removeMiddleware(middleware: MessageMiddleware): void {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }

  // State Getters
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionState.status;
  }

  // Private Methods
  private validateAndSetDefaults(config: WebSocketConfig): WebSocketConfig {
    const defaultConfig: WebSocketConfig = {
      url: config.url,
      protocols: config.protocols || [],
      reconnect: {
        enabled: true,
        maxAttempts: 10,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2,
        jitter: true,
      },
      heartbeat: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        maxMissed: 3,
      },
      messageQueue: {
        maxSize: 1000,
        persistOffline: false,
      },
      rateLimiting: {
        messagesPerSecond: 10,
        burstSize: 20,
        windowSize: 1000,
      },
      compression: false,
      binaryType: 'arraybuffer',
    };

    return {
      ...defaultConfig,
      ...config,
      reconnect: { ...defaultConfig.reconnect, ...config.reconnect },
      heartbeat: { ...defaultConfig.heartbeat, ...config.heartbeat },
      messageQueue: { ...defaultConfig.messageQueue, ...config.messageQueue },
      rateLimiting: config.rateLimiting ? { ...defaultConfig.rateLimiting, ...config.rateLimiting } : undefined,
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      this.metrics.messagesReceived++;
      this.metrics.bytesReceived += event.data.length;

      // Handle heartbeat response
      if (message.type === 'heartbeat') {
        this.handleHeartbeatResponse(message);
        return;
      }

      // Apply filters
      if (!this.passesFilters(message)) {
        return;
      }

      // Apply incoming middleware
      const processedMessage = this.applyIncomingMiddleware(message);
      if (!processedMessage) {
        return;
      }

      // Calculate latency if message has timestamp
      if (message.timestamp) {
        const latency = Date.now() - message.timestamp;
        this.metrics.messageLatency.push(latency);
        
        // Keep only last 100 latency measurements
        if (this.metrics.messageLatency.length > 100) {
          this.metrics.messageLatency.shift();
        }
      }

      this.eventHandlers.onMessage?.(processedMessage);

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.recordError('message', error as Error);
    }
  }

  private handleDisconnection(event: CloseEvent): void {
    this.connectionState.status = 'disconnected';
    this.connectionState.lastDisconnected = Date.now();
    this.connectionState.disconnectReason = `Code: ${event.code}, Reason: ${event.reason}`;
    
    this.stopHeartbeat();
    this.eventHandlers.onClose?.(event);

    // Attempt reconnection if appropriate
    if (this.shouldReconnect(event)) {
      this.attemptReconnection();
    }
  }

  private handleError(event: Event): void {
    this.recordError('connection', new Error('WebSocket connection error'));
    this.eventHandlers.onError?.(event);
  }

  private shouldReconnect(event: CloseEvent): boolean {
    // Don't reconnect on clean closure or if destroyed
    if (event.code === 1000 || this.isDestroyed) {
      return false;
    }

    // Don't reconnect on authentication failure
    if (event.code === 1008) {
      this.eventHandlers.onAuthRequired?.();
      return false;
    }

    return this.reconnectionManager.shouldReconnect();
  }

  private async attemptReconnection(): Promise<void> {
    if (this.isDestroyed) return;

    this.connectionState.status = 'reconnecting';
    this.connectionState.reconnectAttempts = this.reconnectionManager.getAttemptCount();
    
    this.reconnectionManager.onReconnectAttempt();
    this.metrics.reconnections++;

    const delay = this.reconnectionManager.getNextDelay();
    
    setTimeout(async () => {
      if (this.isDestroyed) return;

      try {
        await this.connect();
        this.eventHandlers.onReconnect?.(this.reconnectionManager.getAttemptCount());
      } catch {
        this.reconnectionManager.onReconnectFailure();
        
        if (this.reconnectionManager.isMaxAttemptsReached()) {
          this.connectionState.status = 'failed';
          this.eventHandlers.onReconnectFailed?.();
        } else {
          this.attemptReconnection();
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeat.enabled || this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendHeartbeat();
        
        // Set timeout for heartbeat response
        this.heartbeatTimeout = setTimeout(() => {
          this.missedHeartbeats++;
          
          if (this.missedHeartbeats >= this.config.heartbeat.maxMissed) {
            console.warn('Too many missed heartbeats, closing connection');
            this.ws?.close(1000, 'Heartbeat timeout');
          }
        }, this.config.heartbeat.timeout);
      }
    }, this.config.heartbeat.interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    this.missedHeartbeats = 0;
  }

  private handleHeartbeatResponse(message: WebSocketMessage): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    this.missedHeartbeats = 0;
    
    // Update connection latency
    if (message.data?.timestamp) {
      const latency = Date.now() - message.data.timestamp;
      this.connectionState.latency = latency;
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToSend) {
      if (!this.sendMessage(message)) {
        // If send fails, re-queue the message
        this.messageQueue.push(message);
      }
    }
  }

  private checkRateLimit(): boolean {
    if (!this.config.rateLimiting) return true;

    const now = Date.now();
    const timeSinceLastRefill = now - this.rateLimitLastRefill;
    
    // Refill tokens based on time passed
    const tokensToAdd = Math.floor(
      (timeSinceLastRefill / this.config.rateLimiting.windowSize) * 
      this.config.rateLimiting.messagesPerSecond
    );
    
    if (tokensToAdd > 0) {
      this.rateLimitTokens = Math.min(
        this.config.rateLimiting.burstSize,
        this.rateLimitTokens + tokensToAdd
      );
      this.rateLimitLastRefill = now;
    }

    if (this.rateLimitTokens > 0) {
      this.rateLimitTokens--;
      return true;
    }

    return false;
  }

  private passesFilters(message: WebSocketMessage): boolean {
    return this.messageFilters.every(filter => {
      if (filter.types && !filter.types.includes(message.type)) {
        return false;
      }
      
      if (filter.custom && !filter.custom(message)) {
        return false;
      }

      // Additional filtering logic can be added here
      return true;
    });
  }

  private applyIncomingMiddleware(message: WebSocketMessage): WebSocketMessage | null {
    let currentMessage: WebSocketMessage | null = message;
    
    for (const middleware of this.middleware) {
      if (middleware.incoming && currentMessage) {
        currentMessage = middleware.incoming(currentMessage);
      }
    }
    
    return currentMessage;
  }

  private applyOutgoingMiddleware(message: WebSocketMessage): WebSocketMessage | null {
    let currentMessage: WebSocketMessage | null = message;
    
    for (const middleware of this.middleware) {
      if (middleware.outgoing && currentMessage) {
        currentMessage = middleware.outgoing(currentMessage);
      }
    }
    
    return currentMessage;
  }

  private recordError(type: WebSocketErrorInfo['type'], error: Error): void {
    this.metrics.errors.push({
      type,
      error,
      timestamp: Date.now(),
      recovered: false,
    });

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function for creating WebSocket clients
export const createWebSocketClient = (
  config: WebSocketConfig,
  handlers?: WebSocketEventHandlers
): ChUseAWebSocketClient => {
  return new ChUseAWebSocketClient(config, handlers);
};

// Default configurations
export const createDefaultConfig = (url: string): WebSocketConfig => ({
  url,
  protocols: [],
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
  },
  heartbeat: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    maxMissed: 3,
  },
  messageQueue: {
    maxSize: 1000,
    persistOffline: false,
  },
  rateLimiting: {
    messagesPerSecond: 10,
    burstSize: 20,
    windowSize: 1000,
  },
});

// Authentication helper
export const createAuthenticatedConfig = (
  url: string,
  tokenProvider: () => Promise<string>
): WebSocketConfig => ({
  ...createDefaultConfig(url),
  authentication: {
    type: 'bearer',
    tokenProvider,
    refreshThreshold: 300000, // 5 minutes
    retryOnAuthFailure: true,
  },
});