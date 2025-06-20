// Agent System Type Definitions

export type AgentRole = 'synthesizer' | 'assessor' | 'resynthesizer' | 'reporter' | 'collaborator';

export type ModelProvider = 'openai' | 'claude' | 'lintcritic' | 'local';

export interface AgentConfig {
  role: AgentRole;
  provider: ModelProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AgentContext {
  projectPath: string;
  currentFile?: string;
  previousResults?: AgentResult[];
  metadata?: Record<string, any>;
}

export interface AgentResult {
  role: AgentRole;
  success: boolean;
  output: string;
  artifacts?: {
    code?: string;
    analysis?: AnalysisResult;
    report?: ReportContent;
    pr?: PullRequestData;
  };
  timestamp: Date;
  duration: number;
  error?: string;
}

export interface AnalysisResult {
  sast: SecurityIssue[];
  dast: SecurityIssue[];
  linting: LintIssue[];
  tests: TestInference[];
  metrics: CodeMetrics;
}

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  file: string;
  line: number;
  message: string;
  cwe?: string;
}

export interface LintIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  column: number;
  message: string;
  fix?: string;
}

export interface TestInference {
  file: string;
  suggestedTests: string[];
  coverage: number;
  missingScenarios: string[];
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  duplications: number;
  techDebt: string;
}

export interface ReportContent {
  summary: string;
  changelog?: string;
  recommendations: string[];
  metrics: Record<string, any>;
}

export interface PullRequestData {
  title: string;
  description: string;
  branch: string;
  files: string[];
  labels: string[];
}

export type HotkeyAction = 'S' | 'R' | 'C' | 'A' | 'P';

export interface HotkeyMapping {
  key: HotkeyAction;
  description: string;
  agents: AgentRole[];
  sequential: boolean;
}