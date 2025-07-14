/**
 * FastAPI TypeScript类型定义
 * 基于FastAPI后端Pydantic模型的类型映射
 */

// 枚举类型映射
export enum DocumentType {
  ACADEMIC = 'academic',
  BLOG = 'blog',
  SOCIAL = 'social',
}

export enum AgentType {
  WRITING = 'writing',
  LITERATURE = 'literature',
  TOOLS = 'tools',
}

export enum LiteratureSource {
  GOOGLE_SCHOLAR = 'google_scholar',
  PUBMED = 'pubmed',
  ARXIV = 'arxiv',
  MANUAL = 'manual',
}

export enum WorkflowStatus {
  IDLE = 'idle',
  PLANNING = 'planning',
  DRAFTING = 'drafting',
  CITATION_CHECK = 'citation_check',
  GRAMMAR_CHECK = 'grammar_check',
  READABILITY_CHECK = 'readability_check',
  DONE = 'done',
  FAILED = 'failed',
}

export enum NodeType {
  PLAN = 'plan',
  DRAFT = 'draft',
  CITATION = 'citation',
  GRAMMAR = 'grammar',
  READABILITY = 'readability',
  USER_EDIT = 'user_edit',
  PLUGIN = 'plugin',
}

export enum NodeStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASS = 'pass',
  FAIL = 'fail',
}

// 基础模型类型
export interface FastAPIUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FastAPIUserCreate {
  username: string;
  email: string;
  password: string;
}

export interface FastAPIUserResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// 文档相关类型
export interface FastAPIDocument {
  id: string;
  title: string;
  content: string;
  documentType: DocumentType;
  wordCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    wordCount: number;
    type: DocumentType;
    status: string;
    tags: string[];
    version: number;
  };
}

export interface FastAPIDocumentCreate {
  title: string;
  content?: string;
  document_type: DocumentType;
}

export interface FastAPIDocumentUpdate {
  title?: string;
  content?: string;
  document_type?: DocumentType;
}

export interface FastAPIDocumentResponse {
  id: string;
  title: string;
  content: string;
  document_type: DocumentType;
  word_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FastAPIDocumentListResponse {
  documents: FastAPIDocumentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface FastAPIDocumentStats {
  total_documents: number;
  document_types: Record<string, number>;
  total_words: number;
  average_words_per_document: number;
}

// 文献相关类型
export interface FastAPILiterature {
  id: number;
  title: string;
  authors: string | null;
  year: number | null;
  source: LiteratureSource;
  doi: string | null;
  abstract: string | null;
  url: string | null;
  filePath: string | null;
  userId: number;
  isFavorite: boolean;
  createdAt: Date;
}

export interface FastAPILiteratureCreate {
  title: string;
  authors?: string;
  year?: number;
  source: LiteratureSource;
  doi?: string;
  abstract?: string;
  url?: string;
}

export interface FastAPILiteratureUpdate {
  title?: string;
  authors?: string;
  year?: number;
  doi?: string;
  abstract?: string;
  url?: string;
  is_favorite?: boolean;
}

export interface FastAPILiteratureResponse {
  id: number;
  title: string;
  authors: string | null;
  year: number | null;
  source: LiteratureSource;
  doi: string | null;
  abstract: string | null;
  url: string | null;
  file_path: string | null;
  user_id: number;
  is_favorite: boolean;
  created_at: string;
}

export interface FastAPILiteratureSearchRequest {
  query: string;
  max_results?: number;
  year_range?: [number, number];
  include_abstract?: boolean;
}

export interface FastAPILiteratureSearchResponse {
  results: FastAPILiteratureResponse[];
  total: number;
  success: boolean;
  error?: string;
}

// 写作相关类型
export interface FastAPIWritingRequest {
  prompt: string;
  user_id?: number;
  document_id?: number;
  mode?: string;
  context?: Record<string, any>;
}

export interface FastAPIWritingResponse {
  content: string;
  success: boolean;
  metadata: Record<string, any>;
  tokens_used: number;
  error?: string;
}

export interface FastAPIWritingSession {
  id: number;
  documentId: number | null;
  agentType: AgentType;
  prompt: string;
  response: string | null;
  tokensUsed: number;
  userId: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

export interface FastAPIWritingSessionCreate {
  document_id?: number;
  agent_type: AgentType;
  prompt: string;
  response?: string;
  tokens_used?: number;
  success?: boolean;
  error_message?: string;
}

export interface FastAPIWritingSessionResponse {
  id: number;
  document_id: number | null;
  agent_type: AgentType;
  prompt: string;
  response: string | null;
  tokens_used: number;
  user_id: number;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

// 工具相关类型
export interface FastAPIFormatConversionRequest {
  content: string;
  from_format: 'markdown' | 'html' | 'docx' | 'pdf';
  to_format: 'markdown' | 'html' | 'docx' | 'pdf';
}

export interface FastAPIFormatConversionResponse {
  result: string;
  success: boolean;
  original_format: string;
  target_format: string;
  error?: string;
}

export interface FastAPIChartGenerationRequest {
  data: Record<string, any>;
  chart_type: 'bar' | 'line' | 'pie' | 'scatter';
  title?: string;
  description?: string;
}

export interface FastAPIChartGenerationResponse {
  chart_data: Record<string, any>;
  success: boolean;
  chart_type: string;
  error?: string;
}

// 工作流相关类型
export interface FastAPIWorkflowDocument {
  id: string;
  title: string;
  content: string;
  status: WorkflowStatus;
  config: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

export interface FastAPIWorkflowNode {
  id: string;
  type: NodeType;
  status: NodeStatus;
  content: string | null;
  createdAt: string;
  retryCount: number;
  metrics: {
    readabilityScore: number;
    grammarErrors: number;
    citationCount: number;
    wordCount: number;
    processingTime: number;
  } | null;
}

export interface FastAPILoopConfig {
  readability_threshold?: number;
  max_retries?: number;
  auto_run?: boolean;
  timeout?: number;
  writing_mode?: string;
}

export interface FastAPIStartWorkflowRequest {
  document_id: string;
  prompt: string;
  config?: FastAPILoopConfig;
}

export interface FastAPIWorkflowResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface FastAPIWorkflowStatusResponse {
  document_id: string;
  status: string;
  progress: number;
  current_node: FastAPIWorkflowNode | null;
  nodes: FastAPIWorkflowNode[];
}

// Agent相关类型
export interface FastAPIAgentRequest {
  prompt: string;
  agent_type: AgentType;
  context?: Record<string, any>;
  user_id: number;
  document_id?: number;
}

export interface FastAPIAgentResponse {
  content: string;
  success: boolean;
  agent_type: AgentType;
  metadata?: Record<string, any>;
  tokens_used: number;
  error?: string;
}

// 认证相关类型
export interface FastAPIToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface FastAPILoginRequest {
  username: string;
  password: string;
}

export interface FastAPIVerifyResponse {
  valid: boolean;
  user_id: string;
  username: string;
}

export interface FastAPIDevAuthStatus {
  debug_mode: boolean;
  auto_login_available: boolean;
  admin_username: string | null;
  message: string;
}

// 用户设置类型
export interface FastAPIUserSettings {
  id: number;
  userId: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FastAPIUserSettingsUpdate {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'zh-CN' | 'en-US';
  auto_save?: boolean;
  auto_save_interval?: number;
}

export interface FastAPIUserSettingsResponse {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  auto_save: boolean;
  auto_save_interval: number;
  created_at: string;
  updated_at: string;
}

// 健康检查类型
export interface FastAPIHealthResponse {
  status: string;
  timestamp: string;
  version: string;
  components: {
    database: string;
    agents: {
      writing: string;
      literature: string;
      tools: string;
    };
  };
}

export interface FastAPIRootResponse {
  message: string;
  version: string;
  docs: string;
  redoc: string;
  health: string;
  endpoints: {
    writing: string;
    literature: string;
    tools: string;
    documents: string;
    workflow: string;
  };
}

// 错误响应类型
export interface FastAPIErrorResponse {
  detail: string;
  code?: string;
  timestamp?: string;
}

export interface FastAPIValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// 分页和过滤类型
export interface FastAPIPaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface FastAPIDocumentFilters extends FastAPIPaginationParams {
  document_type?: DocumentType;
}

export interface FastAPILiteratureFilters extends FastAPIPaginationParams {
  source?: LiteratureSource;
  year_from?: number;
  year_to?: number;
  is_favorite?: boolean;
}

// WebSocket消息类型
export interface FastAPIWebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface FastAPIWorkflowUpdateMessage {
  workflow_id: string;
  document_id: string;
  status: WorkflowStatus;
  progress: number;
  current_node?: FastAPIWorkflowNode;
  message?: string;
}

// 文件上传类型
export interface FastAPIUploadRequest {
  file: File;
  purpose?: string;
  document_id?: string;
}

export interface FastAPIUploadResponse {
  file_id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface FastAPIUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// 多部分上传类型
export interface FastAPIMultipartUploadInit {
  filename: string;
  fileSize: number;
  totalChunks: number;
  uploadId: string;
}

export interface FastAPIMultipartUploadInitResponse {
  uploadId: string;
  chunkSize: number;
  expiresAt: string;
}

export interface FastAPIUploadChunkRequest {
  uploadId: string;
  chunkIndex: number;
  chunk: Blob;
}

export interface FastAPIUploadCompleteRequest {
  uploadId: string;
}

// 统计和分析类型
export interface FastAPIWritingStats {
  total_sessions: number;
  total_tokens_used: number;
  average_session_length: number;
  most_used_mode: string;
  success_rate: number;
}

export interface FastAPIDocumentAnalytics {
  word_count_distribution: Record<string, number>;
  type_distribution: Record<DocumentType, number>;
  creation_timeline: Array<{
    date: string;
    count: number;
  }>;
}

// 导出所有类型的联合类型，便于类型检查
export type FastAPIRequestTypes =
  | FastAPIUserCreate
  | FastAPIDocumentCreate
  | FastAPIDocumentUpdate
  | FastAPILiteratureCreate
  | FastAPILiteratureUpdate
  | FastAPILiteratureSearchRequest
  | FastAPIWritingRequest
  | FastAPIWritingSessionCreate
  | FastAPIFormatConversionRequest
  | FastAPIChartGenerationRequest
  | FastAPIStartWorkflowRequest
  | FastAPIAgentRequest
  | FastAPILoginRequest
  | FastAPIUserSettingsUpdate
  | FastAPIUploadRequest;

export type FastAPIResponseTypes =
  | FastAPIUserResponse
  | FastAPIDocumentResponse
  | FastAPIDocumentListResponse
  | FastAPIDocumentStats
  | FastAPILiteratureResponse
  | FastAPILiteratureSearchResponse
  | FastAPIWritingResponse
  | FastAPIWritingSessionResponse
  | FastAPIFormatConversionResponse
  | FastAPIChartGenerationResponse
  | FastAPIWorkflowResponse
  | FastAPIWorkflowStatusResponse
  | FastAPIAgentResponse
  | FastAPIToken
  | FastAPIVerifyResponse
  | FastAPIDevAuthStatus
  | FastAPIUserSettingsResponse
  | FastAPIHealthResponse
  | FastAPIRootResponse
  | FastAPIUploadResponse
  | FastAPIErrorResponse
  | FastAPIValidationError;

// 类型守卫函数
export const isFastAPIError = (obj: any): obj is FastAPIErrorResponse => {
  return obj && typeof obj.detail === 'string';
};

export const isFastAPIValidationError = (obj: any): obj is FastAPIValidationError => {
  return obj && Array.isArray(obj.detail) && obj.detail.every((error: any) => 
    Array.isArray(error.loc) && typeof error.msg === 'string' && typeof error.type === 'string'
  );
};

export const isDocumentType = (value: any): value is DocumentType => {
  return Object.values(DocumentType).includes(value);
};

export const isAgentType = (value: any): value is AgentType => {
  return Object.values(AgentType).includes(value);
};

export const isLiteratureSource = (value: any): value is LiteratureSource => {
  return Object.values(LiteratureSource).includes(value);
};

export const isWorkflowStatus = (value: any): value is WorkflowStatus => {
  return Object.values(WorkflowStatus).includes(value);
};

export const isNodeType = (value: any): value is NodeType => {
  return Object.values(NodeType).includes(value);
};

export const isNodeStatus = (value: any): value is NodeStatus => {
  return Object.values(NodeStatus).includes(value);
};