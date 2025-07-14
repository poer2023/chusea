// Authentication and authorization types for ChUseA

// User authentication states
export type AuthState = 
  | 'idle'
  | 'loading' 
  | 'authenticated' 
  | 'unauthenticated' 
  | 'error';

// Authentication session data
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
  issuedAt: number;
  lastActivity: number;
}

// User data for authentication context
export interface AuthUser {
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

// User roles in the system
export type UserRole = 
  | 'user'           // Regular user
  | 'premium'        // Premium subscriber
  | 'admin'          // Administrator
  | 'moderator'      // Content moderator
  | 'developer';     // API developer access

// Granular permissions
export type Permission = 
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
  | 'admin:billing'
  
  // API permissions
  | 'api:read'
  | 'api:write'
  | 'api:admin';

// Subscription information for auth
export interface AuthUserSubscription {
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

export type SubscriptionPlan = 
  | 'free'
  | 'starter'
  | 'professional' 
  | 'enterprise'
  | 'custom';

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

// Feature flags per subscription
export interface SubscriptionFeatures {
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
export interface SubscriptionLimits {
  documentsPerMonth: number;
  aiRequestsPerMonth: number;
  storageGB: number;
  collaborators: number;
  workflowsPerDocument: number;
  apiRequestsPerMonth: number;
  fileUploadSizeMB: number;
}

// User preferences for auth context
export interface AuthUserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultWritingStyle: string;
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  security: SecurityPreferences;
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    documentShared: boolean;
    workflowCompleted: boolean;
    aiSuggestions: boolean;
  };
  inApp: {
    documentUpdates: boolean;
    collaborationRequests: boolean;
    aiCompletions: boolean;
    systemMaintenance: boolean;
  };
  push: {
    enabled: boolean;
    criticalOnly: boolean;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  dataCollection: {
    analytics: boolean;
    performance: boolean;
    marketing: boolean;
  };
  aiTraining: {
    useMyContent: boolean;
    shareAnonymized: boolean;
  };
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  loginNotifications: boolean;
  deviceTracking: boolean;
  ipWhitelist: string[];
}

// Additional user metadata
export interface AuthUserMetadata {
  source: 'web' | 'mobile' | 'api' | 'import';
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  onboardingCompleted: boolean;
  onboardingStep?: string;
  lastSeenFeatures: string[];
  experimentGroups: Record<string, string>;
  customFields: Record<string, any>;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
  inviteCode?: string;
  referrer?: string;
}

// Social authentication providers
export type SocialProvider = 
  | 'google'
  | 'github'
  | 'linkedin'
  | 'microsoft'
  | 'apple';

export interface SocialAuthData {
  provider: SocialProvider;
  token: string;
  email?: string;
  name?: string;
  avatar?: string;
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  backupCode?: boolean;
}

// Password reset flow
export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

export interface PasswordResetVerification {
  token: string;
  newPassword: string;
}

// Session management
export interface SessionInfo {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  current: boolean;
  createdAt: string;
  lastActivity: string;
}

// Authentication events
export type AuthEvent = 
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset'
  | 'password_change'
  | 'email_verify'
  | 'two_factor_enable'
  | 'two_factor_disable'
  | 'session_expire'
  | 'account_lock'
  | 'account_unlock';

export interface AuthAuditLog {
  id: string;
  userId: string;
  event: AuthEvent;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
}

// Token types and validation
export interface TokenPayload {
  sub: string; // Subject (user ID)
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: string;
  iat: number; // Issued at
  exp: number; // Expires at
  aud: string; // Audience
  iss: string; // Issuer
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

// Authentication context state
export interface AuthContextState {
  state: AuthState;
  session: AuthSession | null;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  isWithinLimit: (limit: keyof SubscriptionLimits, current: number) => boolean;
}

// Authentication actions
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  loginWithSocial: (data: SocialAuthData) => Promise<AuthSession>;
  register: (data: RegisterData) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  resetPassword: (data: PasswordResetRequest) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  setupTwoFactor: () => Promise<TwoFactorSetup>;
  verifyTwoFactor: (data: TwoFactorVerification) => Promise<void>;
  disableTwoFactor: (password: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>;
  updatePreferences: (preferences: Partial<AuthUserPreferences>) => Promise<AuthUserPreferences>;
  getSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
}

// Error types specific to authentication
export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'TWO_FACTOR_REQUIRED'
  | 'INVALID_TWO_FACTOR'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'SESSION_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_INVITE_CODE'
  | 'SUBSCRIPTION_REQUIRED'
  | 'LIMIT_EXCEEDED';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  retryAfter?: number; // For rate limiting
}

// Security contexts
export interface SecurityContext {
  requiresAuth: boolean;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  requiredFeatures?: (keyof SubscriptionFeatures)[];
  allowedPlans?: SubscriptionPlan[];
  rateLimits?: {
    requests: number;
    windowMs: number;
  };
}

// SSO Configuration
export interface SSOConfig {
  enabled: boolean;
  provider: 'saml' | 'oidc' | 'oauth2';
  entityId: string;
  ssoUrl: string;
  x509cert: string;
  attributeMapping: {
    email: string;
    name: string;
    role?: string;
  };
  autoProvisioning: boolean;
  defaultRole: UserRole;
}