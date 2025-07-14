# ChUseA TypeScript Type Definitions

## Overview

ChUseA uses a comprehensive TypeScript type system to ensure type safety across the entire application. The type definitions are organized into logical modules for maintainability and ease of use.

## Type Structure

```
src/types/
├── api.ts         # API request/response types and HTTP utilities
├── auth.ts        # Authentication, authorization, and user management
├── document.ts    # Document management and collaboration
├── workflow.ts    # Writing workflow and automation
├── ui.ts          # UI components and state management
└── index.ts       # Unified exports and legacy compatibility
```

## Core Type Modules

### 1. API Types (`src/types/api.ts`)

#### Base API Types

```typescript
// Generic API response wrapper
interface APIResponse<T = any> {
  data: T;                    // The actual response data
  message?: string;           // Optional status message
  success: boolean;           // Request success indicator
  timestamp: string;          // Response timestamp
  meta?: {                   // Pagination metadata
    total?: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Standardized error structure
interface APIError {
  message: string;            // Human-readable error message
  code: string;              // Machine-readable error code
  details?: Record<string, any>; // Additional error context
  timestamp: string;          // Error timestamp
  stack?: string;            // Stack trace (development only)
}
```

#### Request Configuration

```typescript
interface RequestConfig {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onUploadProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

interface UploadProgress {
  loaded: number;             // Bytes loaded
  total: number;              // Total bytes
  percentage: number;         // Progress percentage
}
```

#### Authentication Endpoints

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}
```

### 2. Authentication Types (`src/types/auth.ts`)

#### Core Authentication

```typescript
// Authentication session data
interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
  issuedAt: number;
  lastActivity: number;
}

// Complete user profile
interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  role: UserRole;
  permissions: Permission[];
  subscription: AuthUserSubscription;
  preferences: AuthUserPreferences;
  metadata: AuthUserMetadata;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

#### Permissions and Roles

```typescript
// User roles in the system
type UserRole = 
  | 'user'           // Regular user
  | 'premium'        // Premium subscriber
  | 'admin'          // Administrator
  | 'moderator'      // Content moderator
  | 'developer';     // API developer access

// Granular permissions
type Permission = 
  // Document permissions
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'documents:share'
  | 'documents:export'
  
  // AI permissions
  | 'ai:generate'
  | 'ai:optimize'
  | 'ai:analyze'
  | 'ai:advanced_models'
  
  // Workflow permissions
  | 'workflows:read'
  | 'workflows:write'
  | 'workflows:delete'
  | 'workflows:template_create'
  
  // Admin permissions
  | 'admin:users'
  | 'admin:analytics'
  | 'admin:settings'
  | 'admin:billing';
```

#### Subscription Management

```typescript
interface AuthUserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: SubscriptionFeatures;
  limits: SubscriptionLimits;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  customerId?: string;
  subscriptionId?: string;
}

type SubscriptionPlan = 
  | 'free'
  | 'starter'
  | 'professional' 
  | 'enterprise'
  | 'custom';

// Feature flags per subscription
interface SubscriptionFeatures {
  aiGeneration: boolean;
  aiOptimization: boolean;
  advancedAI: boolean;
  workflowTemplates: boolean;
  customWorkflows: boolean;
  collaboration: boolean;
  analytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  sso: boolean;
  advancedSecurity: boolean;
}

// Usage limits per subscription
interface SubscriptionLimits {
  documentsPerMonth: number;
  aiRequestsPerMonth: number;
  storageGB: number;
  collaborators: number;
  workflowsPerDocument: number;
  apiRequestsPerMonth: number;
  fileUploadSizeMB: number;
}
```

### 3. Document Types (`src/types/document.ts`)

#### Core Document Structure

```typescript
interface Document {
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
type DocumentStatus = 
  | 'draft'         // Initial creation
  | 'writing'       // Actively being written
  | 'reviewing'     // Under review
  | 'editing'       // Being edited
  | 'ready'         // Ready for publishing
  | 'published'     // Published/live
  | 'archived'      // Archived but accessible
  | 'deleted';      // Soft deleted

// Document visibility levels
type DocumentVisibility = 
  | 'private'       // Only creator can see
  | 'shared'        // Shared with specific users
  | 'team'          // Visible to team/organization
  | 'public'        // Publicly accessible
  | 'unlisted';     // Public but not indexed
```

#### Document Metadata

```typescript
interface DocumentMetadata {
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
```

#### Collaboration Features

```typescript
interface DocumentCollaboration {
  enabled: boolean;
  mode: CollaborationMode;
  permissions: CollaborationPermissions;
  collaborators: Collaborator[];
  invitations: CollaborationInvitation[];
  comments: DocumentComment[];
  suggestions: DocumentSuggestion[];
  realtime: RealtimeSession;
}

type CollaborationMode = 
  | 'edit'          // Full editing access
  | 'suggest'       // Can suggest changes
  | 'comment'       // Can only comment
  | 'view';         // Read-only access

interface Collaborator {
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
```

#### Version Control

```typescript
interface DocumentVersion {
  current: number;
  history: VersionHistory[];
  autoSave: boolean;
  lastAutoSave?: string;
}

interface VersionHistory {
  version: number;
  content: string;
  changes: DocumentChange[];
  message?: string;
  createdBy: string;
  createdAt: string;
  size: number;
  checksum: string;
}

interface DocumentChange {
  type: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  length?: number;
  content?: string;
  attributes?: Record<string, any>;
}
```

### 4. Workflow Types (`src/types/workflow.ts`)

#### Core Workflow Structure

```typescript
interface WritingWorkflow {
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
type WorkflowStep = 
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
```

#### Step Configuration

```typescript
interface WorkflowStepData {
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

type StepStatus = 
  | 'pending'           // Not started
  | 'ready'             // Ready to start
  | 'in_progress'       // Currently active
  | 'blocked'           // Blocked by dependencies
  | 'review'            // Under review
  | 'completed'         // Successfully completed
  | 'skipped'           // Skipped by user
  | 'failed'            // Failed to complete
  | 'cancelled';        // Cancelled

type StepType = 
  | 'manual'            // Requires manual action
  | 'automated'         // Fully automated
  | 'ai_assisted'       // AI-assisted manual work
  | 'collaborative'     // Requires collaboration
  | 'review'            // Review/approval step
  | 'milestone';        // Milestone marker
```

#### Workflow Automation

```typescript
interface WorkflowAutomation {
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  rules: AutomationRule[];
  schedules: AutomationSchedule[];
  conditions: AutomationCondition[];
}

interface AutomationTrigger {
  id: string;
  event: TriggerEvent;
  conditions: TriggerCondition[];
  enabled: boolean;
}

type TriggerEvent = 
  | 'step_start'
  | 'step_complete'
  | 'step_overdue'
  | 'milestone_reached'
  | 'quality_check'
  | 'time_based'
  | 'external_event';
```

### 5. UI Types (`src/types/ui.ts`)

#### Global UI State

```typescript
interface UIState {
  theme: ThemeState;
  layout: LayoutState;
  navigation: NavigationState;
  notifications: NotificationState;
  modals: ModalState;
  loading: LoadingState;
  errors: ErrorState;
  forms: FormState;
  responsive: ResponsiveState;
  accessibility: AccessibilityState;
  preferences: UIPreferences;
}

// Theme configuration
interface ThemeState {
  mode: ThemeMode;
  scheme: ColorScheme;
  customColors?: CustomColors;
  fontSize: FontSize;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  spacing: SpacingScale;
  shadows: ShadowScale;
  animations: AnimationSettings;
}

type ThemeMode = 'light' | 'dark' | 'system' | 'auto';
```

#### Component States

```typescript
interface ButtonState {
  variant: ButtonVariant;
  size: ButtonSize;
  state: ComponentState;
  loading: boolean;
  disabled: boolean;
  icon?: string;
  iconPosition: 'left' | 'right' | 'only';
}

type ButtonVariant = 
  | 'default'
  | 'primary' 
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

type ComponentState = 
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading'
  | 'error'
  | 'success';
```

#### Notification System

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  avatar?: string;
  timestamp: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  progress?: number;
  category?: string;
  priority: NotificationPriority;
  read: boolean;
  dismissed: boolean;
  groupId?: string;
  metadata?: Record<string, any>;
}

type NotificationType = 
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'update'
  | 'mention'
  | 'system';
```

## Type Usage Patterns

### 1. Generic API Responses

```typescript
// Type-safe API responses
const response: APIResponse<Document[]> = await apiClient.get('/documents');
const documents: Document[] = response.data;

// Error handling with typed errors
try {
  await apiClient.post('/documents', documentData);
} catch (error) {
  const apiError = error as APIError;
  if (apiError.code === 'VALIDATION_ERROR') {
    // Handle validation errors
  }
}
```

### 2. Component Props

```typescript
// Document component props
interface DocumentEditorProps {
  document: Document;
  readonly?: boolean;
  onSave: (document: Document) => void;
  onDelete: () => void;
}

function DocumentEditor({ document, readonly, onSave, onDelete }: DocumentEditorProps) {
  // Type-safe component implementation
}
```

### 3. Hook Return Types

```typescript
// Custom hook with typed return
function useDocumentEditor(documentId: string): {
  document: Document | undefined;
  isLoading: boolean;
  error: APIError | null;
  save: (content: string) => Promise<void>;
  delete: () => Promise<void>;
} {
  // Implementation
}
```

### 4. Form Validation

```typescript
// Form schema based on API types
const documentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['private', 'shared', 'team', 'public'])
});

type DocumentFormData = z.infer<typeof documentFormSchema>;
```

## Type Guards and Utilities

### 1. Type Guards

```typescript
// API response type guards
export const isAPIResponse = <T>(obj: any): obj is APIResponse<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    'timestamp' in obj &&
    'data' in obj
  );
};

export const isAPIError = (obj: any): obj is APIError => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    'code' in obj &&
    'timestamp' in obj
  );
};
```

### 2. Utility Types

```typescript
// Extract ID type from entity
type EntityId<T> = T extends { id: infer U } ? U : never;

// Partial update types
type DocumentUpdate = Partial<Pick<Document, 'title' | 'content' | 'tags' | 'visibility'>>;

// API endpoint parameter types
type GetDocumentsParams = {
  page?: number;
  pageSize?: number;
  status?: DocumentStatus;
  search?: string;
  tags?: string[];
};
```

### 3. Discriminated Unions

```typescript
// Step type discrimination
type WorkflowStepConfig = 
  | { type: 'manual'; userAssignee: string }
  | { type: 'automated'; script: string }
  | { type: 'ai_assisted'; model: string; prompt: string }
  | { type: 'collaborative'; requiredApprovals: number };

// Notification type discrimination  
type NotificationData = 
  | { type: 'document_shared'; documentId: string; sharedBy: string }
  | { type: 'workflow_completed'; workflowId: string; completedAt: string }
  | { type: 'comment_added'; documentId: string; commentId: string };
```

## Migration and Compatibility

### Legacy Type Support

```typescript
// Legacy types for backward compatibility (will be removed in future versions)
// @deprecated Use types from specific modules instead

// User types - moved to auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: UserSubscription;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}
```

### Migration Helpers

```typescript
// Helper functions for migrating between type versions
export function migrateUserToAuthUser(user: User): AuthUser {
  return {
    ...user,
    emailVerified: false,
    role: 'user',
    permissions: [],
    subscription: migrateSubscription(user.subscription),
    preferences: migratePreferences(user.preferences),
    metadata: {
      source: 'migration',
      onboardingCompleted: true
    }
  };
}
```

## Best Practices

### 1. Type Organization

```typescript
// ✅ Good: Specific, descriptive types
interface CreateDocumentRequest {
  title: string;
  content?: string;
  templateId?: string;
}

// ❌ Bad: Generic, unclear types
interface DocumentData {
  [key: string]: any;
}
```

### 2. Null Safety

```typescript
// ✅ Good: Explicit null handling
interface Document {
  id: string;
  title: string;
  publishedAt?: string; // Optional but explicit
}

// ❌ Bad: Implicit null values
interface Document {
  id: string;
  title: string;
  publishedAt: string | null; // Unclear intent
}
```

### 3. Union Types

```typescript
// ✅ Good: Descriptive union types
type DocumentAction = 'create' | 'update' | 'delete' | 'archive' | 'restore';

// ❌ Bad: String literals without context
type Action = 'create' | 'update' | 'delete';
```

### 4. Generic Constraints

```typescript
// ✅ Good: Constrained generics
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T>;
  save(entity: T): Promise<T>;
}

// ❌ Bad: Unconstrained generics
interface Repository<T> {
  findById(id: any): Promise<T>;
  save(entity: any): Promise<T>;
}
```

## Development Workflow

### 1. Type-First Development

1. Define types before implementation
2. Use TypeScript strict mode
3. Avoid `any` type usage
4. Implement comprehensive type guards

### 2. Type Testing

```typescript
// Type testing with expectType utility
import { expectType } from 'tsd';

// Test API response type
const response = await apiClient.get<Document>('/documents/123');
expectType<Document>(response);

// Test hook return type
const { data, isLoading } = useDocument('123');
expectType<Document | undefined>(data);
expectType<boolean>(isLoading);
```

### 3. Documentation

- All public types should have JSDoc comments
- Include usage examples in type definitions
- Maintain type changelog for breaking changes
- Generate type documentation automatically

## Conclusion

The ChUseA type system provides comprehensive type safety across the entire application stack. By following these patterns and best practices, developers can build robust, maintainable features with confidence in type correctness and API compatibility.

For questions about specific types or patterns, refer to the source files or reach out to the development team.