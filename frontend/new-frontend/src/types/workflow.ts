// Writing workflow types for ChUseA

// Core workflow interface
export interface WritingWorkflow {
  id: string;
  name: string;
  description?: string;
  documentId: string;
  templateId?: string;
  currentStep: WorkflowStep;
  steps: WorkflowStepData[];
  progress: WorkflowProgress;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  settings: WorkflowSettings;
  automation: WorkflowAutomation;
  collaboration: WorkflowCollaboration;
  ai: WorkflowAI;
  analytics: WorkflowAnalytics;
  metadata: WorkflowMetadata;
  audit: WorkflowAudit;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
  userId: string;
  organizationId?: string;
}

// Workflow step definitions
export type WorkflowStep = 
  | 'planning'          // Project planning and goal setting
  | 'research'          // Information gathering
  | 'outlining'         // Structure and outline creation
  | 'writing'           // Content creation
  | 'first_draft'       // Initial draft completion
  | 'self_review'       // Self-editing and review
  | 'ai_optimization'   // AI-assisted optimization
  | 'peer_review'       // Collaborative review
  | 'editing'           // Professional editing
  | 'proofreading'      // Final proofreading
  | 'formatting'        // Layout and formatting
  | 'seo_optimization'  // SEO enhancement
  | 'fact_checking'     // Verification and validation
  | 'approval'          // Final approval
  | 'publishing'        // Publication preparation
  | 'distribution'      // Content distribution
  | 'promotion'         // Marketing and promotion
  | 'analytics'         // Performance tracking
  | 'maintenance'       // Ongoing maintenance
  | 'archiving';        // Content archiving

// Workflow status
export type WorkflowStatus = 
  | 'draft'             // Being configured
  | 'ready'             // Ready to start
  | 'active'            // Currently running
  | 'paused'            // Temporarily paused
  | 'completed'         // Successfully completed
  | 'cancelled'         // Cancelled by user
  | 'failed'            // Failed due to error
  | 'on_hold'           // Waiting for external input
  | 'reviewing';        // Under review

// Workflow priority levels
export type WorkflowPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical';

// Individual step data
export interface WorkflowStepData {
  step: WorkflowStep;
  name: string;
  description?: string;
  order: number;
  status: StepStatus;
  type: StepType;
  config: StepConfig;
  dependencies: StepDependency[];
  assignees: StepAssignee[];
  deadlines: StepDeadline;
  resources: StepResource[];
  checklist: StepChecklist[];
  notes: StepNote[];
  files: StepFile[];
  ai: StepAI;
  metrics: StepMetrics;
  duration: StepDuration;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  skippedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type StepStatus = 
  | 'pending'           // Not started
  | 'ready'             // Ready to start
  | 'in_progress'       // Currently active
  | 'blocked'           // Blocked by dependencies
  | 'review'            // Under review
  | 'completed'         // Successfully completed
  | 'skipped'           // Skipped by user
  | 'failed'            // Failed to complete
  | 'cancelled';        // Cancelled

export type StepType = 
  | 'manual'            // Requires manual action
  | 'automated'         // Fully automated
  | 'ai_assisted'       // AI-assisted manual work
  | 'collaborative'     // Requires collaboration
  | 'review'            // Review/approval step
  | 'milestone';        // Milestone marker

// Step configuration
export interface StepConfig {
  isRequired: boolean;
  canSkip: boolean;
  allowParallel: boolean;
  requiresApproval: boolean;
  autoComplete: boolean;
  timeLimit?: number; // minutes
  retryLimit?: number;
  templates: StepTemplate[];
  integrations: StepIntegration[];
  customFields: Record<string, any>;
}

export interface StepTemplate {
  id: string;
  name: string;
  type: 'content' | 'checklist' | 'form' | 'guide';
  template: string;
  variables: Record<string, any>;
}

export interface StepIntegration {
  service: string;
  action: string;
  config: Record<string, any>;
  enabled: boolean;
}

// Step dependencies
export interface StepDependency {
  stepId: string;
  type: DependencyType;
  condition?: DependencyCondition;
  blocking: boolean;
}

export type DependencyType = 
  | 'completion'        // Requires step completion
  | 'approval'          // Requires step approval
  | 'output'            // Requires specific output
  | 'time'              // Time-based dependency
  | 'resource'          // Resource availability
  | 'external';         // External system dependency

export interface DependencyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// Step assignments
export interface StepAssignee {
  userId: string;
  name: string;
  email: string;
  role: AssigneeRole;
  permissions: AssigneePermissions;
  assignedAt: string;
  assignedBy: string;
  acceptedAt?: string;
  completedAt?: string;
}

export type AssigneeRole = 
  | 'owner'             // Step owner
  | 'collaborator'      // Can edit
  | 'reviewer'          // Can review/approve
  | 'observer'          // Read-only access
  | 'consultant';       // Advisory role

export interface AssigneePermissions {
  canEdit: boolean;
  canComplete: boolean;
  canSkip: boolean;
  canDelegate: boolean;
  canAddNotes: boolean;
  canUploadFiles: boolean;
}

// Step deadlines
export interface StepDeadline {
  soft?: string;        // Soft deadline (warning)
  hard?: string;        // Hard deadline (blocking)
  reminder?: string;    // Reminder time
  timezone: string;
  recurring?: RecurringPattern;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: string;
  occurrences?: number;
}

// Step resources
export interface StepResource {
  type: ResourceType;
  name: string;
  url?: string;
  description?: string;
  required: boolean;
  cost?: number;
  currency?: string;
}

export type ResourceType = 
  | 'document'
  | 'template'
  | 'reference'
  | 'tool'
  | 'service'
  | 'person'
  | 'budget'
  | 'license';

// Step checklists
export interface StepChecklist {
  id: string;
  text: string;
  completed: boolean;
  required: boolean;
  order: number;
  assignee?: string;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

// Step notes
export interface StepNote {
  id: string;
  content: string;
  type: 'note' | 'warning' | 'error' | 'tip';
  visibility: 'private' | 'team' | 'public';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
}

// Step files
export interface StepFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: 'input' | 'output' | 'reference' | 'temp';
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

// Step AI integration
export interface StepAI {
  enabled: boolean;
  suggestions: StepAISuggestion[];
  automation: StepAIAutomation;
  quality: StepAIQuality;
}

export interface StepAISuggestion {
  id: string;
  type: 'content' | 'improvement' | 'optimization' | 'completion';
  suggestion: string;
  confidence: number;
  applied: boolean;
  createdAt: string;
}

export interface StepAIAutomation {
  autoStart: boolean;
  autoComplete: boolean;
  qualityCheck: boolean;
  contentGeneration: boolean;
  config: Record<string, any>;
}

export interface StepAIQuality {
  score: number;
  criteria: QualityCriteria[];
  lastChecked?: string;
}

export interface QualityCriteria {
  name: string;
  weight: number;
  score: number;
  passed: boolean;
  feedback?: string;
}

// Step metrics
export interface StepMetrics {
  timeSpent: number;       // minutes
  attempts: number;
  revisions: number;
  collaborators: number;
  filesCreated: number;
  aiUsage: number;
  qualityScore: number;
  efficiency: number;
}

// Step duration tracking
export interface StepDuration {
  estimated: number;      // minutes
  actual?: number;        // minutes
  tracking: DurationTracking[];
}

export interface DurationTracking {
  startTime: string;
  endTime?: string;
  duration?: number;
  userId: string;
  activity: string;
}

// Workflow progress tracking
export interface WorkflowProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  currentPhase: string;
  milestones: WorkflowMilestone[];
  timeline: WorkflowTimeline;
  blockers: WorkflowBlocker[];
}

export interface WorkflowMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  steps: string[];
  criteria: MilestoneCriteria[];
}

export interface MilestoneCriteria {
  description: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface WorkflowTimeline {
  startDate: string;
  endDate: string;
  estimatedDuration: number;
  actualDuration?: number;
  phases: TimelinePhase[];
  critical_path: string[];
}

export interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  steps: string[];
  status: 'upcoming' | 'active' | 'completed' | 'delayed';
}

export interface WorkflowBlocker {
  id: string;
  type: 'dependency' | 'resource' | 'approval' | 'technical' | 'external';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSteps: string[];
  estimatedDelay: number; // hours
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// Workflow settings
export interface WorkflowSettings {
  notifications: WorkflowNotifications;
  automation: WorkflowAutomationSettings;
  collaboration: WorkflowCollaborationSettings;
  quality: WorkflowQualitySettings;
  security: WorkflowSecuritySettings;
  integrations: WorkflowIntegrationSettings;
}

export interface WorkflowNotifications {
  stepStart: boolean;
  stepComplete: boolean;
  stepBlocked: boolean;
  stepOverdue: boolean;
  milestoneReached: boolean;
  workflowComplete: boolean;
  collaboratorChanges: boolean;
  aiSuggestions: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams';
  enabled: boolean;
  config: Record<string, any>;
}

export interface WorkflowAutomationSettings {
  autoAdvance: boolean;
  autoAssign: boolean;
  autoReminder: boolean;
  autoQualityCheck: boolean;
  aiAssistance: boolean;
  conditions: AutomationCondition[];
}

export interface AutomationCondition {
  trigger: string;
  action: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowCollaborationSettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  versionControl: boolean;
  conflictResolution: 'manual' | 'auto_merge' | 'latest_wins';
  commentNotifications: boolean;
}

export interface WorkflowQualitySettings {
  enableQualityGates: boolean;
  minimumQualityScore: number;
  autoReject: boolean;
  qualityChecks: QualityCheck[];
}

export interface QualityCheck {
  name: string;
  type: 'grammar' | 'style' | 'content' | 'seo' | 'readability';
  enabled: boolean;
  threshold: number;
  blocking: boolean;
}

export interface WorkflowSecuritySettings {
  accessControl: 'open' | 'restricted' | 'private';
  dataEncryption: boolean;
  auditLogging: boolean;
  approvalRequired: boolean;
  allowedDomains: string[];
}

export interface WorkflowIntegrationSettings {
  googleDocs: boolean;
  notion: boolean;
  slack: boolean;
  trello: boolean;
  asana: boolean;
  custom: CustomIntegration[];
}

export interface CustomIntegration {
  name: string;
  type: 'webhook' | 'api' | 'plugin';
  config: Record<string, any>;
  enabled: boolean;
}

// Workflow automation
export interface WorkflowAutomation {
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  rules: AutomationRule[];
  schedules: AutomationSchedule[];
  conditions: AutomationCondition[];
}

export interface AutomationTrigger {
  id: string;
  event: TriggerEvent;
  conditions: TriggerCondition[];
  enabled: boolean;
}

export type TriggerEvent = 
  | 'step_start'
  | 'step_complete'
  | 'step_overdue'
  | 'milestone_reached'
  | 'quality_check'
  | 'time_based'
  | 'external_event';

export interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  enabled: boolean;
}

export type ActionType = 
  | 'send_notification'
  | 'assign_step'
  | 'complete_step'
  | 'create_document'
  | 'run_ai_check'
  | 'send_email'
  | 'webhook_call'
  | 'update_status';

export interface AutomationRule {
  id: string;
  name: string;
  triggerId: string;
  actionIds: string[];
  priority: number;
  enabled: boolean;
}

export interface AutomationSchedule {
  id: string;
  name: string;
  cron: string;
  actionIds: string[];
  enabled: boolean;
  timezone: string;
}

// Workflow collaboration
export interface WorkflowCollaboration {
  enabled: boolean;
  participants: WorkflowParticipant[];
  permissions: WorkflowPermissions;
  communication: WorkflowCommunication;
}

export interface WorkflowParticipant {
  userId: string;
  name: string;
  email: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  assignedSteps: string[];
  joinedAt: string;
  lastActive?: string;
}

export type ParticipantRole = 
  | 'owner'
  | 'manager'
  | 'contributor'
  | 'reviewer'
  | 'observer';

export interface ParticipantPermissions {
  canEdit: boolean;
  canAssign: boolean;
  canComplete: boolean;
  canComment: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
}

export interface WorkflowPermissions {
  defaultRole: ParticipantRole;
  inheritFromDocument: boolean;
  guestAccess: boolean;
  publicView: boolean;
}

export interface WorkflowCommunication {
  comments: WorkflowComment[];
  mentions: WorkflowMention[];
  discussions: WorkflowDiscussion[];
}

export interface WorkflowComment {
  id: string;
  content: string;
  stepId?: string;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  users: string[];
}

export interface WorkflowMention {
  id: string;
  userId: string;
  commentId: string;
  read: boolean;
  createdAt: string;
}

export interface WorkflowDiscussion {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  comments: string[];
}

// Workflow AI integration
export interface WorkflowAI {
  enabled: boolean;
  optimization: AIOptimization;
  assistance: AIAssistance;
  quality: AIQualityAssurance;
  analytics: AIAnalytics;
}

export interface AIOptimization {
  autoOptimize: boolean;
  optimizationTypes: OptimizationType[];
  schedule?: string;
  history: OptimizationRecord[];
}

export type OptimizationType = 
  | 'step_order'
  | 'resource_allocation'
  | 'timeline_optimization'
  | 'quality_improvement'
  | 'automation_suggestions';

export interface OptimizationRecord {
  id: string;
  type: OptimizationType;
  changes: OptimizationChange[];
  impact: OptimizationImpact;
  applied: boolean;
  timestamp: string;
}

export interface OptimizationChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface OptimizationImpact {
  efficiency: number;
  quality: number;
  timeReduction: number;
  costReduction: number;
}

export interface AIAssistance {
  suggestions: AISuggestion[];
  contentGeneration: boolean;
  qualityChecks: boolean;
  stepRecommendations: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'step' | 'content' | 'optimization' | 'resource';
  suggestion: string;
  confidence: number;
  applied: boolean;
  createdAt: string;
}

export interface AIQualityAssurance {
  enabled: boolean;
  checks: AIQualityCheck[];
  thresholds: QualityThreshold[];
  autoReject: boolean;
}

export interface AIQualityCheck {
  type: string;
  enabled: boolean;
  weight: number;
  config: Record<string, any>;
}

export interface QualityThreshold {
  metric: string;
  minimum: number;
  target: number;
  blocking: boolean;
}

export interface AIAnalytics {
  predictions: WorkflowPrediction[];
  insights: WorkflowInsight[];
  recommendations: WorkflowRecommendation[];
}

export interface WorkflowPrediction {
  type: 'completion_time' | 'quality_score' | 'bottleneck' | 'cost';
  value: number;
  confidence: number;
  factors: string[];
  createdAt: string;
}

export interface WorkflowInsight {
  type: 'efficiency' | 'quality' | 'collaboration' | 'automation';
  insight: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: string;
}

export interface WorkflowRecommendation {
  type: 'process' | 'resource' | 'timeline' | 'quality';
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Workflow analytics
export interface WorkflowAnalytics {
  performance: PerformanceMetrics;
  quality: QualityMetrics;
  efficiency: EfficiencyMetrics;
  collaboration: CollaborationMetrics;
  trends: AnalyticsTrend[];
}

export interface PerformanceMetrics {
  completionRate: number;
  averageCompletionTime: number;
  onTimeDelivery: number;
  blockerFrequency: number;
  stepSuccessRates: Record<string, number>;
}

export interface QualityMetrics {
  overallQuality: number;
  qualityByStep: Record<string, number>;
  revisionCount: number;
  rejectionRate: number;
  improvementRate: number;
}

export interface EfficiencyMetrics {
  timeUtilization: number;
  resourceUtilization: number;
  automationRate: number;
  parallelizationRate: number;
  wasteReduction: number;
}

export interface CollaborationMetrics {
  participantEngagement: number;
  communicationFrequency: number;
  conflictResolutionTime: number;
  knowledgeSharing: number;
  teamSatisfaction: number;
}

export interface AnalyticsTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
}

// Workflow metadata
export interface WorkflowMetadata {
  category: string;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  industry?: string;
  language: string;
  audience?: string;
  purpose: string;
  estimatedDuration: number;
  estimatedCost?: number;
  currency?: string;
  tags: string[];
  version: string;
  customFields: Record<string, any>;
}

// Workflow audit
export interface WorkflowAudit {
  events: WorkflowAuditEvent[];
  retention: number;
  compliance: ComplianceRecord[];
}

export interface WorkflowAuditEvent {
  id: string;
  action: WorkflowAuditAction;
  stepId?: string;
  actor: string;
  actorName: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export type WorkflowAuditAction = 
  | 'created'
  | 'started'
  | 'paused'
  | 'resumed'
  | 'completed'
  | 'cancelled'
  | 'step_started'
  | 'step_completed'
  | 'step_skipped'
  | 'participant_added'
  | 'participant_removed'
  | 'settings_changed'
  | 'automation_triggered';

export interface ComplianceRecord {
  standard: string;
  version: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  lastChecked: string;
  evidence: string[];
  gaps: string[];
}

// Workflow templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDuration: number;
  steps: WorkflowTemplateStep[];
  variables: TemplateVariable[];
  configuration: TemplateConfiguration;
  preview: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplateStep {
  step: WorkflowStep;
  name: string;
  description?: string;
  order: number;
  estimatedDuration: number;
  dependencies: string[];
  config: Partial<StepConfig>;
  resources: TemplateResource[];
}

export interface TemplateResource {
  type: ResourceType;
  name: string;
  description?: string;
  required: boolean;
  template?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: string[];
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplateConfiguration {
  allowCustomization: boolean;
  requiredSteps: string[];
  optionalSteps: string[];
  automationRules: AutomationRule[];
  qualityThresholds: QualityThreshold[];
}

// Workflow operations
export interface WorkflowOperations {
  create: (data: CreateWorkflowData) => Promise<WritingWorkflow>;
  update: (id: string, data: UpdateWorkflowData) => Promise<WritingWorkflow>;
  delete: (id: string) => Promise<void>;
  start: (id: string) => Promise<WritingWorkflow>;
  pause: (id: string) => Promise<WritingWorkflow>;
  resume: (id: string) => Promise<WritingWorkflow>;
  complete: (id: string) => Promise<WritingWorkflow>;
  cancel: (id: string) => Promise<WritingWorkflow>;
  duplicate: (id: string, name?: string) => Promise<WritingWorkflow>;
  export: (id: string, format: string) => Promise<Blob>;
  import: (file: File) => Promise<WritingWorkflow>;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  documentId: string;
  templateId?: string;
  steps?: Partial<WorkflowStepData>[];
  settings?: Partial<WorkflowSettings>;
  variables?: Record<string, any>;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  currentStep?: WorkflowStep;
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  settings?: Partial<WorkflowSettings>;
  steps?: Partial<WorkflowStepData>[];
}