/**
 * API相关TypeScript类型定义
 * 与后端API接口保持一致的类型定义
 */

// ===== 基础类型 =====

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== 用户相关类型 =====

export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  displayName?: string;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  displayName?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

// ===== 认证相关类型 =====

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  userId: string;
  username: string;
  expiresAt?: number;
}

// ===== 文档相关类型 =====

export enum DocumentType {
  ACADEMIC = 'academic',
  BLOG = 'blog',
  SOCIAL = 'social',
  REPORT = 'report',
  ARTICLE = 'article',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  status: DocumentStatus;
  wordCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  wordCount: number;
  type: DocumentType;
  status: DocumentStatus;
  tags: string[];
  version: number;
  author?: string;
  lastEditor?: string;
  collaborators?: string[];
}

export interface CreateDocumentRequest {
  title: string;
  content?: string;
  type: DocumentType;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  tags?: string[];
}

export interface DocumentFilters extends PaginationParams {
  type?: DocumentType;
  status?: DocumentStatus;
  search?: string;
  tags?: string[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  documentTypes: Record<DocumentType, number>;
  totalWords: number;
  averageWordsPerDocument: number;
  recentDocuments: number;
}

// ===== 文献相关类型 =====

export enum LiteratureSource {
  GOOGLE_SCHOLAR = 'google_scholar',
  PUBMED = 'pubmed',
  ARXIV = 'arxiv',
  MANUAL = 'manual',
  IMPORTED = 'imported',
}

export interface Literature {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  source: LiteratureSource;
  doi?: string;
  abstract?: string;
  url?: string;
  filePath?: string;
  userId: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata: LiteratureMetadata;
}

export interface LiteratureMetadata {
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  citationCount?: number;
  keywords?: string[];
}

export interface CreateLiteratureRequest {
  title: string;
  authors: string[];
  year?: number;
  source: LiteratureSource;
  doi?: string;
  abstract?: string;
  url?: string;
  tags?: string[];
  metadata?: Partial<LiteratureMetadata>;
}

export interface UpdateLiteratureRequest {
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  abstract?: string;
  url?: string;
  isFavorite?: boolean;
  tags?: string[];
  metadata?: Partial<LiteratureMetadata>;
}

export interface LiteratureSearchRequest {
  query: string;
  sources?: LiteratureSource[];
  maxResults?: number;
  yearRange?: [number, number];
  includeAbstract?: boolean;
  filters?: {
    authors?: string[];
    keywords?: string[];
    journal?: string;
  };
}

export interface LiteratureSearchResponse {
  results: Literature[];
  total: number;
  success: boolean;
  error?: string;
  metadata: {
    searchQuery: string;
    sources: LiteratureSource[];
    processingTime: number;
  };
}

export interface LiteratureFilters extends PaginationParams {
  source?: LiteratureSource;
  yearFrom?: number;
  yearTo?: number;
  isFavorite?: boolean;
  search?: string;
  tags?: string[];
  authors?: string[];
}

export interface CitationRequest {
  literatureIds: string[];
  style: CitationStyle;
  format: 'text' | 'html' | 'bibtex' | 'ris';
}

export interface CitationResponse {
  citations: string[];
  bibliography: string;
  style: CitationStyle;
  format: string;
}

export enum CitationStyle {
  APA = 'apa',
  MLA = 'mla',
  CHICAGO = 'chicago',
  IEEE = 'ieee',
  HARVARD = 'harvard',
}

// ===== 写作相关类型 =====

export enum WritingMode {
  ACADEMIC = 'academic',
  BLOG = 'blog',
  SOCIAL = 'social',
  TECHNICAL = 'technical',
  CREATIVE = 'creative',
}

export enum WritingAction {
  GENERATE = 'generate',
  IMPROVE = 'improve',
  CONVERT = 'convert',
  SUMMARIZE = 'summarize',
  EXPAND = 'expand',
}

export interface WritingRequest {
  prompt: string;
  mode: WritingMode;
  action: WritingAction;
  context?: {
    documentId?: string;
    content?: string;
    targetLength?: number;
    tone?: string;
    audience?: string;
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeReferences?: boolean;
  };
}

export interface WritingResponse {
  content: string;
  success: boolean;
  metadata: {
    mode: WritingMode;
    action: WritingAction;
    tokensUsed: number;
    processingTime: number;
    confidence: number;
  };
  suggestions?: string[];
  error?: string;
}

export interface WritingSuggestion {
  text: string;
  type: 'improvement' | 'continuation' | 'alternative';
  confidence: number;
  reasoning?: string;
}

export interface WritingModeInfo {
  mode: WritingMode;
  name: string;
  description: string;
  features: string[];
  examples: string[];
}

// ===== 工作流相关类型 =====

export enum WorkflowStatus {
  IDLE = 'idle',
  PLANNING = 'planning',
  DRAFTING = 'drafting',
  CITATION_CHECK = 'citation_check',
  GRAMMAR_CHECK = 'grammar_check',
  READABILITY_CHECK = 'readability_check',
  DONE = 'done',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum NodeType {
  PLAN = 'plan',
  DRAFT = 'draft',
  CITATION = 'citation',
  GRAMMAR = 'grammar',
  READABILITY = 'readability',
  USER_EDIT = 'user_edit',
  PLUGIN = 'plugin',
  REVIEW = 'review',
}

export enum NodeStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface WorkflowConfig {
  readabilityThreshold?: number;
  maxRetries?: number;
  autoRun?: boolean;
  timeout?: number;
  writingMode?: WritingMode;
  enabledSteps?: NodeType[];
  customSteps?: CustomWorkflowStep[];
}

export interface CustomWorkflowStep {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  config: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  status: NodeStatus;
  content?: string;
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  retryCount: number;
  metrics?: WorkflowNodeMetrics;
}

export interface WorkflowNodeMetrics {
  readabilityScore?: number;
  grammarErrors?: number;
  citationCount?: number;
  wordCount?: number;
  processingTime?: number;
  confidence?: number;
}

export interface StartWorkflowRequest {
  documentId: string;
  prompt: string;
  config?: WorkflowConfig;
}

export interface WorkflowResponse {
  success: boolean;
  message: string;
  workflowId?: string;
  data?: any;
}

export interface WorkflowStatusResponse {
  documentId: string;
  workflowId: string;
  status: WorkflowStatus;
  progress: number;
  currentNode?: WorkflowNode;
  nodes: WorkflowNode[];
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
}

// ===== 工具相关类型 =====

export enum ToolType {
  FORMAT_CONVERTER = 'format_converter',
  CHART_GENERATOR = 'chart_generator',
  DATA_ANALYZER = 'data_analyzer',
  TEXT_FORMATTER = 'text_formatter',
  REFERENCE_FORMATTER = 'reference_formatter',
}

export interface FormatConversionRequest {
  content: string;
  fromFormat: 'markdown' | 'html' | 'docx' | 'pdf' | 'txt';
  toFormat: 'markdown' | 'html' | 'docx' | 'pdf' | 'txt';
  options?: {
    preserveFormatting?: boolean;
    includeMetadata?: boolean;
    customStyles?: Record<string, any>;
  };
}

export interface FormatConversionResponse {
  result: string;
  success: boolean;
  originalFormat: string;
  targetFormat: string;
  metadata?: {
    processingTime: number;
    originalSize: number;
    convertedSize: number;
  };
  error?: string;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area',
  HISTOGRAM = 'histogram',
  BOX = 'box',
}

export interface ChartGenerationRequest {
  data: any[];
  chartType: ChartType;
  config: {
    title?: string;
    description?: string;
    xAxis?: string;
    yAxis?: string;
    colorScheme?: string;
    width?: number;
    height?: number;
  };
  options?: {
    interactive?: boolean;
    exportFormat?: 'svg' | 'png' | 'pdf';
    theme?: 'light' | 'dark';
  };
}

export interface ChartGenerationResponse {
  chartData: any;
  chartConfig: any;
  success: boolean;
  chartType: ChartType;
  metadata?: {
    dataPoints: number;
    processingTime: number;
    chartSize: { width: number; height: number };
  };
  error?: string;
}

export interface DataAnalysisRequest {
  data: any[];
  analysisType: 'descriptive' | 'correlation' | 'regression' | 'clustering';
  options?: {
    columns?: string[];
    groupBy?: string;
    filters?: Record<string, any>;
  };
}

export interface DataAnalysisResponse {
  results: any;
  summary: string;
  recommendations: string[];
  visualizations?: any[];
  success: boolean;
  error?: string;
}

// ===== 文件相关类型 =====

export interface FileUploadRequest {
  file: File;
  purpose?: string;
  documentId?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  estimatedTimeRemaining?: number;
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  userId: string;
  purpose?: string;
  documentId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// ===== WebSocket相关类型 =====

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface WorkflowUpdateMessage {
  workflowId: string;
  documentId: string;
  status: WorkflowStatus;
  progress: number;
  currentNode?: WorkflowNode;
  message?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  primary?: boolean;
}

// ===== 系统相关类型 =====

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  components: {
    database: ComponentHealth;
    agents: {
      writing: ComponentHealth;
      literature: ComponentHealth;
      tools: ComponentHealth;
    };
    storage: ComponentHealth;
    cache: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: string;
}

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  docs: string;
  redoc: string;
  health: string;
  endpoints: {
    auth: string;
    documents: string;
    literature: string;
    writing: string;
    workflow: string;
    tools: string;
    files: string;
  };
}

// ===== 请求配置类型 =====

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheDuration?: number;
}

export interface UploadConfig extends RequestConfig {
  onProgress?: (progress: FileUploadProgress) => void;
  chunkSize?: number;
  concurrent?: boolean;
}

// ===== 类型守卫函数 =====

export const isApiError = (obj: any): obj is ApiError => {
  return obj && typeof obj.message === 'string' && typeof obj.code === 'string';
};

export const isPaginatedResponse = <T>(obj: any): obj is PaginatedResponse<T> => {
  return obj && Array.isArray(obj.items) && typeof obj.total === 'number';
};

export const isDocumentType = (value: any): value is DocumentType => {
  return Object.values(DocumentType).includes(value);
};

export const isLiteratureSource = (value: any): value is LiteratureSource => {
  return Object.values(LiteratureSource).includes(value);
};

export const isWritingMode = (value: any): value is WritingMode => {
  return Object.values(WritingMode).includes(value);
};

export const isWorkflowStatus = (value: any): value is WorkflowStatus => {
  return Object.values(WorkflowStatus).includes(value);
};

export const isChartType = (value: any): value is ChartType => {
  return Object.values(ChartType).includes(value);
};

// ===== 联合类型 =====

export type EntityId = string | number;
export type SortOrder = 'asc' | 'desc';
export type DateString = string; // ISO 8601 格式

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface QueryConfig extends PaginationParams {
  sort?: SortConfig[];
  filters?: FilterConfig[];
  search?: string;
  include?: string[];
  exclude?: string[];
}

// ===== 默认导出所有类型 =====

export type {
  // 重新导出主要类型以便于使用
  User,
  Document,
  Literature,
  WorkflowNode,
  WorkflowConfig,
  WritingRequest,
  WritingResponse,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
};