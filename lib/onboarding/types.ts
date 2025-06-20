export type UserRole = 'clinician' | 'patient' | 'researcher' | 'admin';

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
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  role: UserRole;
  steps: OnboardingStep[];
  prerequisites?: string[];
  estimatedTime?: number; // in minutes
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
}

export interface OnboardingContext {
  user: {
    id: string;
    role: UserRole;
    name?: string;
    email?: string;
    institution?: string;
  };
  platform: {
    features: string[];
    tier: string;
    permissions: string[];
  };
  preferences: {
    showHints: boolean;
    autoAdvance: boolean;
    skipAnimation: boolean;
  };
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
}

export type OnboardingEvent =
  | { type: 'FLOW_STARTED'; flowId: string; userId: string }
  | { type: 'STEP_COMPLETED'; stepId: string; duration: number }
  | { type: 'STEP_SKIPPED'; stepId: string; reason?: string }
  | { type: 'FLOW_COMPLETED'; completionTime: number; feedback?: string }
  | { type: 'FLOW_ABANDONED'; lastStep: string; reason?: string }
  | { type: 'HELP_REQUESTED'; stepId: string; question?: string };

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
}