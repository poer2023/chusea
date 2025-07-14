// Document management types for ChUseA

// Core document interface
export interface Document {
  id: string;
  title: string;
  content: string;
  summary?: string;
  excerpt?: string;
  slug?: string;
  metadata: DocumentMetadata;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  tags: DocumentTag[];
  category?: DocumentCategory;
  template?: DocumentTemplate;
  version: DocumentVersion;
  collaboration: DocumentCollaboration;
  workflow?: DocumentWorkflow;
  ai: DocumentAI;
  files: DocumentFile[];
  analytics: DocumentAnalytics;
  settings: DocumentSettings;
  audit: DocumentAudit;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  userId: string;
  organizationId?: string;
}

// Document status lifecycle
export type DocumentStatus = 
  | 'draft'         // Initial creation
  | 'writing'       // Actively being written
  | 'reviewing'     // Under review
  | 'editing'       // Being edited
  | 'ready'         // Ready for publishing
  | 'published'     // Published/live
  | 'archived'      // Archived but accessible
  | 'deleted';      // Soft deleted

// Document visibility levels
export type DocumentVisibility = 
  | 'private'       // Only creator can see
  | 'shared'        // Shared with specific users
  | 'team'          // Visible to team/organization
  | 'public'        // Publicly accessible
  | 'unlisted';     // Public but not indexed

// Rich document metadata
export interface DocumentMetadata {
  // Content analytics
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  readingTime: number; // minutes
  readabilityScore: number;
  
  // Language and localization
  language: string;
  region?: string;
  
  // SEO and marketing
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  
  // Content classification
  targetAudience?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  contentType?: ContentType;
  industry?: string;
  purpose?: DocumentPurpose;
  
  // Technical metadata
  format: DocumentFormat;
  encoding: string;
  checksum: string;
  
  // Custom metadata
  customFields: Record<string, any>;
}

export type ContentType = 
  | 'article'
  | 'blog_post'
  | 'research_paper'
  | 'report'
  | 'proposal'
  | 'email'
  | 'social_post'
  | 'press_release'
  | 'documentation'
  | 'creative_writing'
  | 'academic'
  | 'business'
  | 'marketing'
  | 'technical'
  | 'legal'
  | 'other';

export type DocumentPurpose = 
  | 'inform'
  | 'persuade'
  | 'entertain'
  | 'instruct'
  | 'analyze'
  | 'report'
  | 'propose'
  | 'market'
  | 'educate';

export type DocumentFormat = 
  | 'markdown'
  | 'html'
  | 'plain_text'
  | 'rich_text'
  | 'json'
  | 'xml';

// Document tagging system
export interface DocumentTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  category?: string;
  isSystem: boolean;
  usage: number;
  createdAt: string;
  createdBy: string;
}

// Document categorization
export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  parentId?: string;
  path: string[];
  isDefault: boolean;
  sortOrder: number;
}

// Document templates
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  content: string;
  structure: TemplateStructure;
  variables: TemplateVariable[];
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateStructure {
  sections: TemplateSection[];
  styles: Record<string, any>;
  layout: 'single' | 'multi_column' | 'custom';
}

export interface TemplateSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'image' | 'variable';
  name: string;
  content: string;
  placeholder?: string;
  required: boolean;
  order: number;
  config?: Record<string, any>;
}

export interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'boolean';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: string[]; // For select types
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Document versioning
export interface DocumentVersion {
  current: number;
  history: VersionHistory[];
  autoSave: boolean;
  lastAutoSave?: string;
}

export interface VersionHistory {
  version: number;
  content: string;
  changes: DocumentChange[];
  message?: string;
  createdBy: string;
  createdAt: string;
  size: number;
  checksum: string;
}

export interface DocumentChange {
  type: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  length?: number;
  content?: string;
  attributes?: Record<string, any>;
}

// Document collaboration
export interface DocumentCollaboration {
  enabled: boolean;
  mode: CollaborationMode;
  permissions: CollaborationPermissions;
  collaborators: Collaborator[];
  invitations: CollaborationInvitation[];
  comments: DocumentComment[];
  suggestions: DocumentSuggestion[];
  realtime: RealtimeSession;
}

export type CollaborationMode = 
  | 'edit'          // Full editing access
  | 'suggest'       // Can suggest changes
  | 'comment'       // Can only comment
  | 'view';         // Read-only access

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canSuggest: boolean;
  canShare: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
}

export interface Collaborator {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: CollaborationMode;
  permissions: CollaborationPermissions;
  status: 'active' | 'pending' | 'declined' | 'removed';
  joinedAt: string;
  lastActive?: string;
  invitedBy: string;
}

export interface CollaborationInvitation {
  id: string;
  email: string;
  role: CollaborationMode;
  message?: string;
  expiresAt: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface DocumentComment {
  id: string;
  content: string;
  position: CommentPosition;
  thread: CommentThread[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPosition {
  start: number;
  end: number;
  selectedText: string;
}

export interface CommentThread {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface DocumentSuggestion {
  id: string;
  type: 'insert' | 'delete' | 'replace' | 'format';
  position: {
    start: number;
    end: number;
  };
  originalContent: string;
  suggestedContent: string;
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Real-time collaboration
export interface RealtimeSession {
  active: boolean;
  sessionId?: string;
  participants: RealtimeParticipant[];
  cursors: RealtimeCursor[];
  selections: RealtimeSelection[];
  awareness: RealtimeAwareness;
}

export interface RealtimeParticipant {
  userId: string;
  sessionId: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'active' | 'idle' | 'offline';
  joinedAt: string;
  lastSeen: string;
}

export interface RealtimeCursor {
  userId: string;
  position: number;
  visible: boolean;
}

export interface RealtimeSelection {
  userId: string;
  start: number;
  end: number;
  visible: boolean;
}

export interface RealtimeAwareness {
  users: Record<string, {
    cursor?: number;
    selection?: { start: number; end: number };
    name: string;
    color: string;
  }>;
}

// Document workflow integration
export interface DocumentWorkflow {
  workflowId: string;
  currentStep: string;
  progress: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  automation: WorkflowAutomation;
}

export interface WorkflowAutomation {
  autoSave: boolean;
  autoPublish: boolean;
  autoOptimize: boolean;
  triggers: WorkflowTrigger[];
}

export interface WorkflowTrigger {
  event: 'word_count' | 'time_spent' | 'status_change' | 'ai_suggestion';
  condition: any;
  action: 'save' | 'notify' | 'optimize' | 'publish';
  enabled: boolean;
}

// AI integration for documents
export interface DocumentAI {
  suggestions: AISuggestion[];
  analysis: AIAnalysis;
  generation: AIGeneration;
  optimization: AIOptimization;
}

export interface AISuggestion {
  id: string;
  type: 'grammar' | 'style' | 'tone' | 'structure' | 'content' | 'seo';
  position: {
    start: number;
    end: number;
  };
  originalText: string;
  suggestedText: string;
  reason: string;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  createdAt: string;
}

export interface AIAnalysis {
  readabilityScore: number;
  toneAnalysis: {
    overall: string;
    confidence: number;
    scores: Record<string, number>;
  };
  sentimentAnalysis: {
    polarity: number; // -1 to 1
    subjectivity: number; // 0 to 1
    emotions: Record<string, number>;
  };
  keywordDensity: Record<string, number>;
  topics: Array<{
    topic: string;
    relevance: number;
  }>;
  lastAnalyzedAt: string;
}

export interface AIGeneration {
  requests: AIGenerationRequest[];
  totalTokensUsed: number;
  monthlyUsage: number;
}

export interface AIGenerationRequest {
  id: string;
  prompt: string;
  model: string;
  parameters: Record<string, any>;
  result: string;
  tokensUsed: number;
  processingTime: number;
  quality: number;
  timestamp: string;
}

export interface AIOptimization {
  history: AIOptimizationRecord[];
  settings: {
    autoOptimize: boolean;
    optimizationTypes: string[];
    schedule?: string;
  };
}

export interface AIOptimizationRecord {
  id: string;
  type: string;
  beforeContent: string;
  afterContent: string;
  changes: number;
  improvement: number;
  timestamp: string;
}

// File attachments
export interface DocumentFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  isEmbedded: boolean;
  position?: number; // Position in document
  uploadedBy: string;
  uploadedAt: string;
}

// Document analytics
export interface DocumentAnalytics {
  views: ViewAnalytics;
  engagement: EngagementAnalytics;
  performance: PerformanceAnalytics;
  seo: SEOAnalytics;
}

export interface ViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewHistory: Array<{
    date: string;
    views: number;
    uniqueViews: number;
  }>;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  locations: Record<string, number>;
}

export interface EngagementAnalytics {
  averageTimeSpent: number;
  bounceRate: number;
  scrollDepth: number;
  interactionRate: number;
  socialShares: Record<string, number>;
  comments: number;
  reactions: Record<string, number>;
}

export interface PerformanceAnalytics {
  loadTime: number;
  searchRanking: Record<string, number>;
  conversionRate: number;
  clickThroughRate: number;
}

export interface SEOAnalytics {
  searchVisibility: number;
  keywordRankings: Record<string, number>;
  backlinks: number;
  organicTraffic: number;
  searchImpressions: number;
  averagePosition: number;
}

// Document settings
export interface DocumentSettings {
  editor: EditorSettings;
  export: ExportSettings;
  sharing: SharingSettings;
  notifications: NotificationSettings;
}

export interface EditorSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showWordCount: boolean;
  showReadingTime: boolean;
  spellCheck: boolean;
  grammarCheck: boolean;
  autoCorrect: boolean;
  distraction_free: boolean;
  typewriterMode: boolean;
  focusMode: boolean;
}

export interface ExportSettings {
  format: 'pdf' | 'docx' | 'html' | 'markdown' | 'epub';
  includeMetadata: boolean;
  includeComments: boolean;
  includeImages: boolean;
  paperSize: 'a4' | 'letter' | 'legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SharingSettings {
  allowComments: boolean;
  allowSuggestions: boolean;
  requireAuth: boolean;
  passwordProtected: boolean;
  password?: string;
  expirationDate?: string;
  allowDownload: boolean;
  trackViews: boolean;
}

export interface NotificationSettings {
  onComment: boolean;
  onSuggestion: boolean;
  onShare: boolean;
  onEdit: boolean;
  onPublish: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Document audit trail
export interface DocumentAudit {
  events: AuditEvent[];
  retention: number; // days
}

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actor: string;
  actorName: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type AuditAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'published'
  | 'unpublished'
  | 'archived'
  | 'restored'
  | 'shared'
  | 'unshared'
  | 'commented'
  | 'suggested'
  | 'exported'
  | 'imported'
  | 'ai_generated'
  | 'ai_optimized';

// Document operations
export interface DocumentOperations {
  create: (data: CreateDocumentData) => Promise<Document>;
  update: (id: string, data: UpdateDocumentData) => Promise<Document>;
  delete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<Document>;
  duplicate: (id: string, title?: string) => Promise<Document>;
  archive: (id: string) => Promise<Document>;
  publish: (id: string) => Promise<Document>;
  unpublish: (id: string) => Promise<Document>;
  share: (id: string, data: ShareDocumentData) => Promise<void>;
  export: (id: string, format: string, options?: ExportOptions) => Promise<Blob>;
  import: (file: File, options?: ImportOptions) => Promise<Document>;
}

export interface CreateDocumentData {
  title: string;
  content?: string;
  templateId?: string;
  categoryId?: string;
  tags?: string[];
  visibility?: DocumentVisibility;
  metadata?: Partial<DocumentMetadata>;
}

export interface UpdateDocumentData {
  title?: string;
  content?: string;
  summary?: string;
  status?: DocumentStatus;
  visibility?: DocumentVisibility;
  tags?: string[];
  categoryId?: string;
  metadata?: Partial<DocumentMetadata>;
  settings?: Partial<DocumentSettings>;
}

export interface ShareDocumentData {
  emails: string[];
  role: CollaborationMode;
  message?: string;
  expiresAt?: string;
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeImages?: boolean;
  format?: string;
}

export interface ImportOptions {
  preserveFormatting?: boolean;
  extractImages?: boolean;
  categoryId?: string;
  tags?: string[];
}