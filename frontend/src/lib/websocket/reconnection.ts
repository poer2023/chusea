/**
 * WebSocket reconnection mechanism with exponential backoff
 * Handles automatic reconnection with jitter and configurable limits
 */

import { ReconnectConfig } from './types';

export interface ReconnectionManager {
  shouldReconnect(): boolean;
  getNextDelay(): number;
  onReconnectAttempt(): void;
  onReconnectSuccess(): void;
  onReconnectFailure(): void;
  reset(): void;
  getAttemptCount(): number;
  isMaxAttemptsReached(): boolean;
}

export class ExponentialBackoffReconnection implements ReconnectionManager {
  private attemptCount = 0;
  private lastAttemptTime = 0;
  private currentDelay: number;
  
  constructor(private config: ReconnectConfig) {
    this.currentDelay = config.initialDelay;
  }

  shouldReconnect(): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    if (this.attemptCount >= this.config.maxAttempts) {
      return false;
    }
    
    // Prevent too frequent reconnection attempts
    const timeSinceLastAttempt = Date.now() - this.lastAttemptTime;
    return timeSinceLastAttempt >= this.currentDelay;
  }

  getNextDelay(): number {
    // Apply jitter if enabled
    const jitter = this.config.jitter ? (Math.random() * 0.3 + 0.85) : 1;
    return Math.min(this.currentDelay * jitter, this.config.maxDelay);
  }

  onReconnectAttempt(): void {
    this.attemptCount++;
    this.lastAttemptTime = Date.now();
    
    // Increase delay for next attempt (exponential backoff)
    this.currentDelay = Math.min(
      this.currentDelay * this.config.backoffFactor,
      this.config.maxDelay
    );
  }

  onReconnectSuccess(): void {
    this.reset();
  }

  onReconnectFailure(): void {
    // Delay is already increased in onReconnectAttempt
    // Additional failure handling can be added here
  }

  reset(): void {
    this.attemptCount = 0;
    this.lastAttemptTime = 0;
    this.currentDelay = this.config.initialDelay;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  isMaxAttemptsReached(): boolean {
    return this.attemptCount >= this.config.maxAttempts;
  }
}

// Default reconnection configuration
export const defaultReconnectConfig: ReconnectConfig = {
  enabled: true,
  maxAttempts: 10,
  initialDelay: 1000, // 1 second
  maxDelay: 30000,    // 30 seconds
  backoffFactor: 2,
  jitter: true,
};

// Utility functions for reconnection management
export const createReconnectionManager = (
  config: Partial<ReconnectConfig> = {}
): ReconnectionManager => {
  const finalConfig = { ...defaultReconnectConfig, ...config };
  return new ExponentialBackoffReconnection(finalConfig);
};

// Reconnection strategies
export type ReconnectionStrategy = 'exponential' | 'linear' | 'fixed';

export class LinearBackoffReconnection implements ReconnectionManager {
  private attemptCount = 0;
  private lastAttemptTime = 0;
  
  constructor(private config: ReconnectConfig) {}

  shouldReconnect(): boolean {
    if (!this.config.enabled) return false;
    if (this.attemptCount >= this.config.maxAttempts) return false;
    
    const timeSinceLastAttempt = Date.now() - this.lastAttemptTime;
    return timeSinceLastAttempt >= this.getNextDelay();
  }

  getNextDelay(): number {
    const baseDelay = this.config.initialDelay;
    const increment = (this.config.maxDelay - this.config.initialDelay) / this.config.maxAttempts;
    const delay = Math.min(baseDelay + (increment * this.attemptCount), this.config.maxDelay);
    
    const jitter = this.config.jitter ? (Math.random() * 0.3 + 0.85) : 1;
    return delay * jitter;
  }

  onReconnectAttempt(): void {
    this.attemptCount++;
    this.lastAttemptTime = Date.now();
  }

  onReconnectSuccess(): void {
    this.reset();
  }

  onReconnectFailure(): void {
    // Linear strategy doesn't need additional failure handling
  }

  reset(): void {
    this.attemptCount = 0;
    this.lastAttemptTime = 0;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  isMaxAttemptsReached(): boolean {
    return this.attemptCount >= this.config.maxAttempts;
  }
}

export class FixedDelayReconnection implements ReconnectionManager {
  private attemptCount = 0;
  private lastAttemptTime = 0;
  
  constructor(private config: ReconnectConfig) {}

  shouldReconnect(): boolean {
    if (!this.config.enabled) return false;
    if (this.attemptCount >= this.config.maxAttempts) return false;
    
    const timeSinceLastAttempt = Date.now() - this.lastAttemptTime;
    return timeSinceLastAttempt >= this.getNextDelay();
  }

  getNextDelay(): number {
    const jitter = this.config.jitter ? (Math.random() * 0.3 + 0.85) : 1;
    return this.config.initialDelay * jitter;
  }

  onReconnectAttempt(): void {
    this.attemptCount++;
    this.lastAttemptTime = Date.now();
  }

  onReconnectSuccess(): void {
    this.reset();
  }

  onReconnectFailure(): void {
    // Fixed delay strategy doesn't need additional failure handling
  }

  reset(): void {
    this.attemptCount = 0;
    this.lastAttemptTime = 0;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  isMaxAttemptsReached(): boolean {
    return this.attemptCount >= this.config.maxAttempts;
  }
}

// Factory function for creating reconnection managers
export const createReconnectionManagerWithStrategy = (
  strategy: ReconnectionStrategy,
  config: Partial<ReconnectConfig> = {}
): ReconnectionManager => {
  const finalConfig = { ...defaultReconnectConfig, ...config };
  
  switch (strategy) {
    case 'exponential':
      return new ExponentialBackoffReconnection(finalConfig);
    case 'linear':
      return new LinearBackoffReconnection(finalConfig);
    case 'fixed':
      return new FixedDelayReconnection(finalConfig);
    default:
      return new ExponentialBackoffReconnection(finalConfig);
  }
};

// Connection quality assessment
export interface ConnectionQuality {
  latency: number;
  reliability: number; // 0-1 based on success rate
  stability: number;   // 0-1 based on connection duration
}

export class ConnectionQualityMonitor {
  private connectTimes: number[] = [];
  private disconnectTimes: number[] = [];
  private pingTimes: number[] = [];
  private maxHistorySize = 100;

  recordConnection(): void {
    this.connectTimes.push(Date.now());
    if (this.connectTimes.length > this.maxHistorySize) {
      this.connectTimes.shift();
    }
  }

  recordDisconnection(): void {
    this.disconnectTimes.push(Date.now());
    if (this.disconnectTimes.length > this.maxHistorySize) {
      this.disconnectTimes.shift();
    }
  }

  recordPing(latency: number): void {
    this.pingTimes.push(latency);
    if (this.pingTimes.length > this.maxHistorySize) {
      this.pingTimes.shift();
    }
  }

  getConnectionQuality(): ConnectionQuality {
    const latency = this.getAverageLatency();
    const reliability = this.getReliability();
    const stability = this.getStability();

    return { latency, reliability, stability };
  }

  private getAverageLatency(): number {
    if (this.pingTimes.length === 0) return 0;
    return this.pingTimes.reduce((sum, time) => sum + time, 0) / this.pingTimes.length;
  }

  private getReliability(): number {
    const totalConnections = this.connectTimes.length;
    const totalDisconnections = this.disconnectTimes.length;
    
    if (totalConnections === 0) return 1;
    
    // Higher reliability if fewer disconnections relative to connections
    return Math.max(0, 1 - (totalDisconnections / totalConnections));
  }

  private getStability(): number {
    if (this.connectTimes.length === 0 || this.disconnectTimes.length === 0) {
      return 1;
    }

    // Calculate average connection duration
    const connectionDurations: number[] = [];
    
    for (let i = 0; i < Math.min(this.connectTimes.length, this.disconnectTimes.length); i++) {
      const duration = this.disconnectTimes[i] - this.connectTimes[i];
      if (duration > 0) {
        connectionDurations.push(duration);
      }
    }

    if (connectionDurations.length === 0) return 1;

    const averageDuration = connectionDurations.reduce((sum, duration) => sum + duration, 0) / connectionDurations.length;
    
    // Normalize to 0-1 scale (consider 10 minutes as perfect stability)
    const perfectDuration = 10 * 60 * 1000; // 10 minutes in ms
    return Math.min(1, averageDuration / perfectDuration);
  }

  reset(): void {
    this.connectTimes = [];
    this.disconnectTimes = [];
    this.pingTimes = [];
  }
}

// Adaptive reconnection strategy based on connection quality
export class AdaptiveReconnectionManager implements ReconnectionManager {
  private baseManager: ReconnectionManager;
  private qualityMonitor: ConnectionQualityMonitor;
  
  constructor(
    private config: ReconnectConfig,
    private strategy: ReconnectionStrategy = 'exponential'
  ) {
    this.baseManager = createReconnectionManagerWithStrategy(strategy, config);
    this.qualityMonitor = new ConnectionQualityMonitor();
  }

  shouldReconnect(): boolean {
    return this.baseManager.shouldReconnect();
  }

  getNextDelay(): number {
    const baseDelay = this.baseManager.getNextDelay();
    const quality = this.qualityMonitor.getConnectionQuality();
    
    // Adjust delay based on connection quality
    let multiplier = 1;
    
    if (quality.reliability < 0.5) {
      multiplier *= 1.5; // Slower reconnection for unreliable connections
    }
    
    if (quality.latency > 1000) {
      multiplier *= 1.3; // Slower reconnection for high latency
    }
    
    if (quality.stability < 0.3) {
      multiplier *= 2; // Much slower reconnection for unstable connections
    }

    return Math.min(baseDelay * multiplier, this.config.maxDelay);
  }

  onReconnectAttempt(): void {
    this.baseManager.onReconnectAttempt();
  }

  onReconnectSuccess(): void {
    this.qualityMonitor.recordConnection();
    this.baseManager.onReconnectSuccess();
  }

  onReconnectFailure(): void {
    this.qualityMonitor.recordDisconnection();
    this.baseManager.onReconnectFailure();
  }

  recordPing(latency: number): void {
    this.qualityMonitor.recordPing(latency);
  }

  getConnectionQuality(): ConnectionQuality {
    return this.qualityMonitor.getConnectionQuality();
  }

  reset(): void {
    this.baseManager.reset();
    this.qualityMonitor.reset();
  }

  getAttemptCount(): number {
    return this.baseManager.getAttemptCount();
  }

  isMaxAttemptsReached(): boolean {
    return this.baseManager.isMaxAttemptsReached();
  }
}