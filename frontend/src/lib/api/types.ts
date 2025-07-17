/**
 * API类型定义
 * 基于后端API接口定义前端类型
 */

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  status: number
  headers?: Record<string, string>
}

export interface ApiError {
  status: number
  message: string
  code: string
  details?: any
}

// 枚举类型
export enum DocumentType {
  ACADEMIC = 'academic',
  BLOG = 'blog',
  SOCIAL = 'social'
}

export enum AgentType {
  WRITING = 'writing',
  LITERATURE = 'literature',
  TOOLS = 'tools'
}

export enum LiteratureSource {
  GOOGLE_SCHOLAR = 'google_scholar',
  SEMANTIC_SCHOLAR = 'semantic_scholar',
  PUBMED = 'pubmed',
  ARXIV = 'arxiv',
  MANUAL = 'manual'
}

export enum WorkflowStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum NodeType {
  PLAN = 'plan',
  DRAFT = 'draft',
  REFINE = 'refine',
  REVIEW = 'review',
  FINAL = 'final'
}

export enum NodeStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserResponse {
  id: string
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  username: string
  password: string
}

// 文档相关类型
export interface Document {
  id: number
  title: string
  content: string
  document_type: DocumentType
  user_id: string
  word_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface DocumentCreate {
  title: string
  content?: string
  document_type: DocumentType
}

export interface DocumentUpdate {
  title?: string
  content?: string
  document_type?: DocumentType
}

export interface DocumentResponse {
  id: number
  title: string
  content: string
  document_type: DocumentType
  user_id: string
  word_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface DocumentListResponse {
  documents: DocumentResponse[]
  total: number
  page: number
  page_size: number
}

export interface DocumentStats {
  total_documents: number
  document_types: Record<string, number>
  total_words: number
  average_words_per_document: number
}

// 写作相关类型
export interface WritingRequest {
  prompt: string
  document_id?: number
  mode: 'academic' | 'blog' | 'social'
  context?: Record<string, any>
}

export interface WritingResponse {
  content: string
  success: boolean
  metadata: Record<string, any>
  tokens_used: number
  error?: string
}

export interface WritingMode {
  value: string
  label: string
  description: string
}

// 文献相关类型
export interface Literature {
  id: number
  title: string
  authors: string
  year: number
  doi?: string
  abstract?: string
  source: LiteratureSource
  url?: string
  file_path?: string
  user_id: string
  is_favorite: boolean
  created_at: string
}

export interface LiteratureCreate {
  title: string
  authors: string
  year: number
  doi?: string
  abstract?: string
  source: LiteratureSource
  url?: string
}

export interface LiteratureUpdate {
  title?: string
  authors?: string
  year?: number
  doi?: string
  abstract?: string
  is_favorite?: boolean
}

export interface LiteratureResponse {
  id: number
  title: string
  authors: string
  year: number
  doi?: string
  abstract?: string
  source: LiteratureSource
  url?: string
  file_path?: string
  user_id: string
  is_favorite: boolean
  created_at: string
}

export interface LiteratureSearchRequest {
  query: string
  source?: LiteratureSource
  year_from?: number
  year_to?: number
  max_results?: number
  offset?: number
}

export interface LiteratureSearchResponse {
  results: LiteratureResponse[]
  total: number
  success: boolean
  error?: string
}

export interface LiteratureCitationRequest {
  literature_data: Record<string, any>
  style: 'APA' | 'MLA' | 'Chicago'
}

export interface LiteratureAnalysisRequest {
  literature_items: Record<string, any>[]
  analysis_type: 'relevance' | 'quality' | 'trend'
  query: string
}

export interface LiteratureAgentResponse {
  content: string
  success: boolean
  metadata: Record<string, any>
  tokens_used: number
  error?: string
}

export interface CitationStyle {
  value: string
  label: string
  description: string
}

export interface LiteratureSource {
  value: string
  label: string
  description: string
  features: string[]
}

// 工具相关类型
export interface ChartRequest {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
  data: Record<string, any>[]
  title?: string
  x_axis?: string
  y_axis?: string
  options?: Record<string, any>
}

export interface DataGenerationRequest {
  data_type: 'random' | 'sequence' | 'distribution'
  parameters: Record<string, any>
  count?: number
}

export interface FormatRequest {
  content: string
  format_type: 'markdown' | 'latex' | 'html'
  options?: Record<string, any>
}

export interface ToolResponse {
  success: boolean
  result: any
  error?: string
  metadata?: Record<string, any>
}

export interface ChartType {
  value: string
  label: string
  description: string
}

export interface DataType {
  value: string
  label: string
  description: string
}

export interface FormatType {
  value: string
  label: string
  description: string
}

export interface AgentToolRequest {
  tool_type: string
  content?: string
  context?: Record<string, any>
}

export interface AgentToolResponse {
  content: string
  success: boolean
  metadata: Record<string, any>
  tokens_used: number
  error?: string
}

export interface ToolCapability {
  tool_type: string
  name: string
  description: string
  supported_formats?: string[]
  supported_types?: string[]
}

// 工作流相关类型
export interface LoopConfig {
  readability_threshold?: number
  max_retries?: number
  auto_run?: boolean
  timeout?: number
  writing_mode?: string
}

export interface StartWorkflowRequest {
  document_id: string
  prompt: string
  config?: LoopConfig
}

export interface WorkflowResponse {
  success: boolean
  message: string
  data?: Record<string, any>
}

export interface NodeMetrics {
  readability_score?: number
  grammar_errors?: number
  citation_count?: number
  word_count?: number
  processing_time?: number
}

export interface NodeResponse {
  id: string
  type: string
  status: string
  content?: string
  created_at: string
  retry_count: number
  metrics?: NodeMetrics
}

export interface WorkflowStatusResponse {
  document_id: string
  status: string
  progress: number
  current_node?: NodeResponse
  nodes: NodeResponse[]
}

export interface WorkflowDocument {
  id: string
  title: string
  status: WorkflowStatus
  config: LoopConfig
  created_at: string
  updated_at?: string
  word_count?: number
}

// WebSocket相关类型
export interface WebSocketMessage {
  type: string
  data?: any
  timestamp?: string
  id?: string
}

export interface WebSocketStatus {
  active_connections: number
  document_subscriptions: Record<string, number>
  status: string
}

export interface WorkflowUpdate {
  type: 'workflow_update'
  document_id: string
  status: WorkflowStatus
  progress: number
  current_node?: NodeResponse
  message?: string
}

export interface NodeUpdate {
  type: 'node_update'
  document_id: string
  node: NodeResponse
  action: 'created' | 'updated' | 'completed' | 'failed'
}

export interface AgentMessage {
  type: 'agent_message'
  document_id: string
  agent_type: AgentType
  content: string
  metadata?: Record<string, any>
}

export interface SystemNotification {
  type: 'system_notification'
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  data?: any
}

export interface ClientMessage {
  type: 'client_message'
  content: string
  timestamp?: string
}

export interface PingMessage {
  type: 'ping'
  timestamp?: string
}

export interface PongMessage {
  type: 'pong'
  timestamp?: string
}

export interface SubscribeMessage {
  type: 'subscribe_workflow'
  document_id?: string
}

export interface UnsubscribeMessage {
  type: 'unsubscribe_workflow'
  document_id?: string
}

// 上传相关类型
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadResponse {
  success: boolean
  message: string
  file_path: string
  filename: string
  size: number
}

// 查询参数类型
export interface PaginationParams {
  page?: number
  page_size?: number
}

export interface DocumentQueryParams extends PaginationParams {
  document_type?: DocumentType
  search?: string
}

export interface LiteratureQueryParams extends PaginationParams {
  skip?: number
  limit?: number
}

// 错误处理类型
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ErrorResponse {
  detail: string
  code?: string
  errors?: ValidationError[]
}

// 开发相关类型
export interface DevAuthStatus {
  debug_mode: boolean
  auto_login_available: boolean
  admin_username?: string
  message: string
}

// 联合类型
export type WebSocketMessageType = 
  | WorkflowUpdate
  | NodeUpdate
  | AgentMessage
  | SystemNotification
  | ClientMessage
  | PingMessage
  | PongMessage
  | SubscribeMessage
  | UnsubscribeMessage

export type AgentResponseType = 
  | WritingResponse
  | LiteratureAgentResponse
  | AgentToolResponse

// 类型守卫
export const isWorkflowUpdate = (message: WebSocketMessage): message is WorkflowUpdate => {
  return message.type === 'workflow_update'
}

export const isNodeUpdate = (message: WebSocketMessage): message is NodeUpdate => {
  return message.type === 'node_update'
}

export const isAgentMessage = (message: WebSocketMessage): message is AgentMessage => {
  return message.type === 'agent_message'
}

export const isSystemNotification = (message: WebSocketMessage): message is SystemNotification => {
  return message.type === 'system_notification'
}

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'status' in error && 'message' in error
}