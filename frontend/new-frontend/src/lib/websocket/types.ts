/**
 * WebSocket types for ChUseA real-time communication system
 * Supports workflow updates, document collaboration, and notifications
 */

import { WorkflowStep, WorkflowStatus, WorkflowAuditAction } from '@/types/workflow';

// Core WebSocket message interface
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data: T;
  timestamp: number;
  id: string;
  version?: string;
  retry?: number;
}

// Message types
export type WebSocketMessageType = 
  | 'workflow_update'
  | 'workflow_step_change'
  | 'workflow_progress'
  | 'workflow_error'
  | 'document_change'
  | 'document_collaboration'
  | 'user_presence'
  | 'notification'
  | 'system_message'
  | 'heartbeat'
  | 'error'
  | 'auth_required'
  | 'connection_established'
  | 'reconnect_success';

// Workflow update messages
export interface WorkflowUpdateMessage {
  workflowId: string;
  documentId: string;
  userId: string;
  action: WorkflowAuditAction;
  previousStatus?: WorkflowStatus;
  newStatus: WorkflowStatus;
  changes?: Record<string, any>;
  metadata?: WorkflowUpdateMetadata;
}

export interface WorkflowStepChangeMessage {
  workflowId: string;
  documentId: string;
  userId: string;
  previousStep?: WorkflowStep;
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  stepData?: any;
  aiProcessing?: boolean;
  metadata?: WorkflowStepMetadata;
}

export interface WorkflowProgressMessage {
  workflowId: string;
  documentId: string;
  userId: string;
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  nextMilestone?: string;
  isBlocked?: boolean;
  blockerInfo?: WorkflowBlockerInfo;
}

export interface WorkflowErrorMessage {
  workflowId: string;
  documentId: string;
  userId: string;
  error: WorkflowError;
  step?: WorkflowStep;
  recoverable: boolean;
  suggestedActions?: string[];
}

// Document collaboration messages
export interface DocumentChangeMessage {
  documentId: string;
  userId: string;
  userName: string;
  changeType: DocumentChangeType;
  changes: DocumentChange[];
  version: number;
  timestamp: number;
  conflictResolution?: ConflictResolution;
}

export interface DocumentCollaborationMessage {
  documentId: string;
  userId: string;
  userName: string;
  action: CollaborationAction;
  cursor?: CursorPosition;
  selection?: TextSelection;
  presence?: UserPresence;
}

// User presence messages
export interface UserPresenceMessage {
  documentId?: string;
  workflowId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: PresenceStatus;
  activity?: UserActivity;
  location?: PresenceLocation;
  lastSeen?: number;
}

// Notification messages
export interface NotificationMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  data?: NotificationData;
  actions?: NotificationAction[];
  expiry?: number;
  persistent?: boolean;
}

// System messages
export interface SystemMessage {
  type: SystemMessageType;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  maintenanceInfo?: MaintenanceInfo;
  featureAnnouncement?: FeatureAnnouncement;
}

// Connection and authentication
export interface ConnectionState {
  status: ConnectionStatus;
  url: string;
  protocols?: string[];
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  lastConnected?: number;
  lastDisconnected?: number;
  disconnectReason?: string;
  latency?: number;
}

export interface AuthenticationInfo {
  token: string;
  userId: string;
  sessionId: string;
  permissions: string[];
  expires: number;
}

// Enums and supporting types
export type ConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'reconnecting'
  | 'failed'
  | 'rate_limited';

export type DocumentChangeType = 
  | 'insert'
  | 'delete'
  | 'replace'
  | 'format'
  | 'move'
  | 'metadata';

export type CollaborationAction = 
  | 'join'
  | 'leave'
  | 'cursor_move'
  | 'selection_change'
  | 'typing_start'
  | 'typing_stop'
  | 'comment_add'
  | 'comment_edit'
  | 'comment_delete';

export type PresenceStatus = 
  | 'online'
  | 'away'
  | 'busy'
  | 'offline'
  | 'invisible';

export type NotificationType = 
  | 'workflow_update'
  | 'document_change'
  | 'collaboration_invite'
  | 'deadline_reminder'
  | 'ai_suggestion'
  | 'system_alert'
  | 'feature_update';

export type NotificationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type NotificationCategory = 
  | 'workflow'
  | 'document'
  | 'collaboration'
  | 'system'
  | 'ai'
  | 'security';

export type SystemMessageType = 
  | 'maintenance'
  | 'feature_announcement'
  | 'service_update'
  | 'deprecation_notice';

// Supporting interfaces
export interface WorkflowUpdateMetadata {
  source: 'user' | 'ai' | 'system';
  triggerEvent?: string;
  affectedUsers?: string[];
  estimatedImpact?: 'low' | 'medium' | 'high';
}

export interface WorkflowStepMetadata {
  duration?: number;
  quality?: number;
  aiAssistanceUsed?: boolean;
  collaborators?: string[];
  resources?: string[];
}

export interface WorkflowBlockerInfo {
  type: 'dependency' | 'resource' | 'approval' | 'technical';
  description: string;
  estimatedResolutionTime?: number;
  assignedTo?: string;
  alternatives?: string[];
}

export interface WorkflowError {
  code: string;
  message: string;
  details?: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface DocumentChange {
  id: string;
  operation: 'insert' | 'delete' | 'retain';
  position: number;
  content?: string;
  attributes?: Record<string, any>;
  metadata?: ChangeMetadata;
}

export interface ConflictResolution {
  strategy: 'manual' | 'auto_merge' | 'latest_wins' | 'collaborative_merge';
  resolvedBy?: string;
  conflictedChanges?: DocumentChange[];
  resolution?: DocumentChange[];
}

export interface CursorPosition {
  line: number;
  column: number;
  documentId: string;
  selectionStart?: number;
  selectionEnd?: number;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
  context?: string;
}

export interface UserPresence {
  isTyping: boolean;
  currentSection?: string;
  activeFeatures?: string[];
  idleTime?: number;
}

export interface UserActivity {
  action: string;
  target?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PresenceLocation {
  page: string;
  section?: string;
  elementId?: string;
  coordinates?: { x: number; y: number };
}

export interface NotificationData {
  workflowId?: string;
  documentId?: string;
  userId?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
  url?: string;
}

export interface MaintenanceInfo {
  startTime: number;
  endTime: number;
  affectedServices: string[];
  description: string;
  workarounds?: string[];
}

export interface FeatureAnnouncement {
  feature: string;
  description: string;
  releaseDate: number;
  documentation?: string;
  changelog?: string;
}

export interface ChangeMetadata {
  author: string;
  timestamp: number;
  source: 'user' | 'ai' | 'system';
  confidence?: number;
  tags?: string[];
}

// WebSocket client configuration
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: ReconnectConfig;
  heartbeat: HeartbeatConfig;
  authentication?: AuthConfig;
  messageQueue: QueueConfig;
  rateLimiting?: RateLimitConfig;
  compression?: boolean;
  binaryType?: 'blob' | 'arraybuffer';
}

export interface ReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

export interface HeartbeatConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  maxMissed: number;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'custom';
  tokenProvider: () => Promise<string>;
  refreshThreshold?: number;
  retryOnAuthFailure?: boolean;
}

export interface QueueConfig {
  maxSize: number;
  persistOffline: boolean;
  batchSize?: number;
  flushInterval?: number;
}

export interface RateLimitConfig {
  messagesPerSecond: number;
  burstSize: number;
  windowSize: number;
}

// Event handlers
export interface WebSocketEventHandlers {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
  onAuthRequired?: () => void;
}

// Message filters and middleware
export interface MessageFilter {
  types?: WebSocketMessageType[];
  documentIds?: string[];
  workflowIds?: string[];
  userIds?: string[];
  custom?: (message: WebSocketMessage) => boolean;
}

export interface MessageMiddleware {
  incoming?: (message: WebSocketMessage) => WebSocketMessage | null;
  outgoing?: (message: WebSocketMessage) => WebSocketMessage | null;
}

// Performance and analytics
export interface PerformanceMetrics {
  connectionTime: number;
  messageLatency: number[];
  messagesReceived: number;
  messagesSent: number;
  reconnections: number;
  bytesReceived: number;
  bytesSent: number;
  errors: WebSocketErrorInfo[];
}

export interface WebSocketErrorInfo {
  type: 'connection' | 'message' | 'auth' | 'rate_limit';
  error: Error;
  timestamp: number;
  recovered: boolean;
  recoveryTime?: number;
}

// Hook options and return types
export interface UseWebSocketOptions extends Partial<WebSocketConfig> {
  enabled?: boolean;
  filter?: MessageFilter;
  middleware?: MessageMiddleware;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  metrics: PerformanceMetrics;
}

// Collaboration-specific types
export interface CollaborationSession {
  documentId: string;
  participants: CollaborationParticipant[];
  activeUsers: string[];
  conflictResolution: ConflictResolution;
  version: number;
  lastSync: number;
}

export interface CollaborationParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  joinedAt: number;
  lastActivity: number;
  presence: UserPresence;
}

// Real-time sync types
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'workflow' | 'document' | 'step' | 'comment';
  entityId: string;
  data: any;
  timestamp: number;
  userId: string;
  version: number;
}

export interface SyncState {
  lastSyncTime: number;
  pendingOperations: SyncOperation[];
  conflictedOperations: SyncOperation[];
  syncInProgress: boolean;
  syncError?: Error;
}