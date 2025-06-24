export type UserRole = 'patient' | 'clinician' | 'researcher' | 'admin' | 'director';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode | string;
  targetElement?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'input' | 'navigate' | 'wait';
    target?: string;
    value?: string;
    timeout?: number;
  };
  validation?: {
    type: 'element_exists' | 'input_filled' | 'custom';
    validator?: () => boolean;
  };
  canSkip?: boolean;
  isOptional?: boolean;
  triggerNext?: 'auto' | 'manual';
  // Enhanced AGENT features
  contextConditions?: {
    fhirContext?: string[];
    epicLaunchContext?: string[];
    dataPresent?: string[];
    variantType?: string[];
    labStatus?: string[];
  };
  dynamicContent?: (context: OnboardingContext) => React.ReactNode | string;
  voiceCommands?: string[];
  accessibilityLabel?: string;
  estimatedDuration?: number; // in seconds
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  role: UserRole;
  steps: OnboardingStep[];
  prerequisites?: string[];
  estimatedTime?: number; // in minutes
  // Enhanced AGENT features
  unlockCondition?: (progress: OnboardingProgress, integrationData: IntegrationData) => boolean;
  category?: 'onboarding' | 'feature-introduction' | 'advanced-workflow' | 'troubleshooting';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  version?: string;
  lastUpdated?: Date;
}

export interface OnboardingProgress {
  userId: string;
  flowId: string;
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: Date;
  lastActivity: Date;
  completedAt?: Date;
  abandoned?: boolean;
  // Enhanced AGENT features
  sessionData?: Record<string, any>;
  interruptionPoints?: { stepId: string; timestamp: Date; reason: string }[];
  resumeToken?: string;
  encryptedProgress?: string;
  contextSnapshot?: OnboardingContext;
}

export interface OnboardingContext {
  user: {
    id: string;
    role: UserRole;
    name?: string;
    email?: string;
    institution?: string;
    permissions?: string[];
    preferences?: UserPreferences;
  };
  platform: {
    features: string[];
    tier: string;
    permissions: string[];
    version?: string;
  };
  preferences: {
    showHints: boolean;
    autoAdvance: boolean;
    skipAnimation: boolean;
    voiceEnabled?: boolean;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
  };
  // Enhanced AGENT features
  clinical?: {
    epicContext?: EpicContext;
    fhirData?: FHIRData;
    currentPatient?: PatientContext;
    currentEncounter?: EncounterContext;
  };
  session: {
    id: string;
    startTime: Date;
    lastActivity: Date;
    deviceInfo?: DeviceInfo;
    location?: string;
  };
}

// New interfaces for AGENT system
export interface EpicContext {
  patientId?: string;
  encounterId?: string;
  userId?: string;
  launchType?: 'patient' | 'provider' | 'standalone';
  smartToken?: string;
  fhirServer?: string;
}

export interface FHIRData {
  patient?: any;
  observations?: any[];
  diagnosticReports?: any[];
  medications?: any[];
  conditions?: any[];
}

export interface PatientContext {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  variants?: VariantInfo[];
  labResults?: LabResult[];
  activeTrials?: ClinicalTrial[];
}

export interface VariantInfo {
  gene: string;
  variant: string;
  classification: string;
  clinicalSignificance?: string;
  pharmacogenomic?: boolean;
}

export interface LabResult {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'cancelled';
  result?: string;
  date: Date;
}

export interface ClinicalTrial {
  id: string;
  title: string;
  phase: string;
  status: string;
  matchScore?: number;
}

export interface EncounterContext {
  id: string;
  type: string;
  status: string;
  date: Date;
}

export interface DeviceInfo {
  userAgent: string;
  screenSize: { width: number; height: number };
  isMobile: boolean;
  hasKeyboard: boolean;
  hasTouchscreen: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  analyticsOptIn: boolean;
  notificationsEnabled: boolean;
}

export interface IntegrationData {
  epic?: EpicContext;
  fhir?: FHIRData;
  external?: Record<string, any>;
}

export interface OnboardingMetrics {
  flowId: string;
  completionRate: number;
  averageTime: number;
  dropoffPoints: { stepId: string; dropoffRate: number }[];
  userFeedback: {
    helpful: number;
    confusing: number;
    tooLong: number;
    justRight: number;
  };
  // Enhanced AGENT metrics
  roleSpecificMetrics: Record<UserRole, RoleMetrics>;
  variantTypeMetrics?: Record<string, VariantMetrics>;
  deviceMetrics: Record<string, DeviceMetrics>;
  accessibilityMetrics?: AccessibilityMetrics;
}

export interface RoleMetrics {
  totalUsers: number;
  completionRate: number;
  averageTime: number;
  commonDropoffs: string[];
  preferredFlows: string[];
}

export interface VariantMetrics {
  variantType: string;
  behaviorDifferences: Record<string, number>;
  customFlowUsage: number;
}

export interface DeviceMetrics {
  deviceType: string;
  completionRate: number;
  interactionPatterns: string[];
}

export interface AccessibilityMetrics {
  voiceCommandUsage: number;
  keyboardNavigationUsage: number;
  screenReaderUsage: number;
  highContrastUsage: number;
}

export type OnboardingEvent =
  | { type: 'FLOW_STARTED'; flowId: string; userId: string; context: OnboardingContext }
  | { type: 'STEP_COMPLETED'; stepId: string; duration: number; method: 'click' | 'keyboard' | 'voice' }
  | { type: 'STEP_SKIPPED'; stepId: string; reason?: string }
  | { type: 'FLOW_COMPLETED'; completionTime: number; feedback?: string }
  | { type: 'FLOW_ABANDONED'; lastStep: string; reason?: string }
  | { type: 'HELP_REQUESTED'; stepId: string; question?: string }
  | { type: 'FLOW_PAUSED'; stepId: string; reason: string }
  | { type: 'FLOW_RESUMED'; stepId: string; pauseDuration: number }
  | { type: 'VOICE_COMMAND_USED'; command: string; stepId: string }
  | { type: 'KEYBOARD_SHORTCUT_USED'; shortcut: string; stepId: string }
  | { type: 'CONTEXT_SWITCH'; fromContext: string; toContext: string }
  | { type: 'INTEGRATION_EVENT'; source: string; event: string; stepId?: string };

export interface OnboardingConfig {
  enabled: boolean;
  autoStart: boolean;
  showProgress: boolean;
  allowSkipping: boolean;
  collectAnalytics: boolean;
  maxRetries: number;
  theme: {
    primaryColor: string;
    overlayColor: string;
    highlightColor: string;
    textColor: string;
  };
  // Enhanced AGENT config
  features: {
    voiceNavigation: boolean;
    keyboardShortcuts: boolean;
    contextAwareness: boolean;
    sessionPersistence: boolean;
    epicIntegration: boolean;
    fhirData: boolean;
    encryptedStorage: boolean;
    auditLogging: boolean;
  };
  storage: {
    provider: 'sessionStorage' | 'localStorage' | 'backend' | 'encrypted';
    encryptionKey?: string;
    backendUrl?: string;
  };
  accessibility: {
    highContrast: boolean;
    screenReaderSupport: boolean;
    keyboardNavigation: boolean;
    voiceCommands: boolean;
  };
  compliance: {
    hipaaLogging: boolean;
    auditRetention: number; // in days
    exportFormats: string[];
  };
}

// Context type for the TourProvider
export interface TourContextType {
  currentRole: UserRole;
  currentStep: number;
  currentFlow?: OnboardingFlow;
  progress: Record<string, OnboardingProgress>;
  context: OnboardingContext;
  config: OnboardingConfig;

  // Core tour management
  startTour: (flowId: string, context?: Partial<OnboardingContext>) => Promise<void>;
  pauseTour: (reason?: string) => void;
  resumeTour: () => void;
  completeStep: (stepId: string, method?: 'click' | 'keyboard' | 'voice') => void;
  skipStep: (stepId: string, reason?: string) => void;
  completeTour: (feedback?: string) => void;
  abandonTour: (reason?: string) => void;

  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;

  // State management
  getProgress: () => Record<string, OnboardingProgress>;
  setUserRole: (role: UserRole) => void;
  updateContext: (updates: Partial<OnboardingContext>) => void;

  // Status checks
  isPaused: boolean;
  isActive: boolean;
  canAdvance: boolean;
  canGoBack: boolean;

  // Analytics
  trackEvent: (event: OnboardingEvent) => void;
  getMetrics: (flowId?: string) => Promise<OnboardingMetrics>;

  // Session management
  saveProgress: () => Promise<void>;
  loadProgress: (userId: string) => Promise<void>;
  clearProgress: (flowId?: string) => void;

  // Integration
  updateIntegrationData: (data: Partial<IntegrationData>) => void;
  checkUnlockConditions: () => string[]; // Returns unlocked flow IDs
}