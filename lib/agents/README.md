# AI Agent Orchestration System

A modular, extensible AI agent system for code generation, analysis, and collaboration workflows. This system provides intelligent agents that work together to generate, assess, refine, document, and prepare code for production.

## 🚀 Features

- **Modular Agent Architecture**: Five specialized agents working in harmony
- **Provider-Agnostic**: Supports OpenAI, Claude, LintCritic, and local models
- **Hotkey Sequences**: Quick access to common workflows
- **Persistent Audit Trail**: Complete logging in `agentmc3.log`
- **Event-Driven**: Real-time progress tracking and monitoring
- **GitHub Integration**: Automated PR preparation and collaboration

## 📦 Agent Roles

### 1. **Synthesizer Agent** 🎨
- Initial code generation from requirements
- TypeScript/React best practices
- HIPAA-compliant genomics code patterns
- Modular, testable implementations

### 2. **Assessor Agent** 🔍
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- ESLint integration and code quality checks
- Test coverage inference
- Complexity and maintainability metrics

### 3. **Resynthesizer Agent** 🔧
- Refines code based on assessment feedback
- Fixes security vulnerabilities
- Resolves linting issues
- Optimizes performance
- Improves maintainability

### 4. **Reporter Agent** 📊
- Generates markdown reports
- Creates changelogs
- Provides actionable recommendations
- Tracks execution metrics
- Saves reports to `agent-reports/`

### 5. **Collaborator Agent** 🤝
- Prepares pull requests
- Generates PR descriptions
- Suggests reviewers and labels
- Creates conventional commits
- Integrates with GitHub workflows

## ⚡ Hotkey Sequences

| Hotkey | Action | Description |
|--------|--------|-------------|
| **[S]** | Generate | Run synthesizer only for initial code generation |
| **[R]** | Full Recursive Loop | synth → assess → resynth → report |
| **[C]** | Full Loop + GitHub | Complete workflow with PR preparation |
| **[A]** | Static Analysis Only | Run assessor on existing code |
| **[P]** | Report Generation | Generate reports from existing results |

## 🛠️ Installation

```bash
# Install dependencies
npm install openai

# Set up environment variables
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key" # Optional
```

## 📖 Usage

### Quick Start

```typescript
import agents from 'lib/agents';

// Simple code generation
const results = await agents.generate({
  currentFile: 'components/Feature.tsx',
  metadata: {
    requirements: 'Create a React component for genomic visualization'
  }
});

// Full analysis and refinement loop
const improved = await agents.fullLoop({
  projectPath: process.cwd(),
  metadata: {
    requirements: 'Implement secure variant processing'
  }
});
```

### Advanced Usage with Orchestrator

```typescript
import { AgentOrchestrator } from 'lib/agents';

const orchestrator = new AgentOrchestrator(process.cwd());

// Listen to events
orchestrator.on('agent:start', ({ role }) => {
  console.log(`Starting ${role} agent...`);
});

orchestrator.on('agent:complete', ({ role, result }) => {
  console.log(`${role} completed in ${result.duration}ms`);
});

// Configure specific agents
orchestrator.configureAgent('synthesizer', {
  provider: 'claude',
  temperature: 0.8,
  model: 'claude-3-opus-20240229'
});

// Execute workflow
const results = await orchestrator.executeHotkey('R', {
  currentFile: 'lib/genomics/analyzer.ts',
  metadata: {
    requirements: 'High-performance VCF parser'
  }
});
```

### Analyzing Existing Code

```typescript
// Set up code to analyze
const orchestrator = agents.getOrchestrator();
orchestrator.updateContext({
  previousResults: [{
    role: 'synthesizer',
    success: true,
    artifacts: { code: existingCode },
    timestamp: new Date(),
    duration: 0
  }]
});

// Run analysis
const analysis = await agents.analyze();
console.log('Issues found:', analysis[0]?.artifacts?.analysis);
```

## 🔧 Configuration

### Model Providers

Configure different AI providers for each agent:

```typescript
orchestrator.configureAgent('synthesizer', {
  provider: 'openai',     // or 'claude', 'lintcritic', 'local'
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 4000
});
```

### Custom System Prompts

Override default prompts for specialized behavior:

```typescript
orchestrator.configureAgent('assessor', {
  systemPrompt: 'Focus on OWASP Top 10 and genomics-specific security issues...'
});
```

## 📊 Output Structure

### Agent Results

```typescript
interface AgentResult {
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
```

### Analysis Result

```typescript
interface AnalysisResult {
  sast: SecurityIssue[];
  dast: SecurityIssue[];
  linting: LintIssue[];
  tests: TestInference[];
  metrics: CodeMetrics;
}
```

## 📝 Logging

All agent activities are logged to `agentmc3.log`:

```
================================================================================
SESSION START: 2024-01-20T10:00:00.000Z
================================================================================
[2024-01-20T10:00:01.000Z] INFO: Starting synthesizer agent
[2024-01-20T10:00:05.000Z] INFO: synthesizer agent SUCCESS (4000ms)
[2024-01-20T10:00:05.000Z] INFO: Starting assessor agent
...
```

## 🧪 Examples

See `example-usage.ts` for comprehensive examples:

1. Simple code generation
2. Full recursive loop with refinement
3. Analyzing existing code
4. GitHub collaboration workflow
5. Event-driven orchestration
6. Report generation

## 🏗️ Architecture

```
┌─────────────────┐
│   Orchestrator  │
│  (Event-Driven) │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Hotkeys │
    └────┬────┘
         │
┌────────┴────────────────────────┐
│          Agent Pipeline          │
├──────────┬──────────┬───────────┤
│Synthesizer│ Assessor │Resynthesizer│
├──────────┴──────────┴───────────┤
│   Reporter  │   Collaborator     │
└─────────────┴────────────────────┘
         │
┌────────┴────────┐
│ Model Interface │
├─────────────────┤
│ OpenAI │ Claude │
│LintCritic│Local │
└─────────────────┘
```

## 🔒 Security Considerations

- All genomics data handling follows HIPAA compliance
- Security scanning includes OWASP Top 10 checks
- Sensitive data is never logged
- API keys are managed through environment variables

## 🚧 Roadmap

- [ ] Real-time streaming responses
- [ ] Parallel agent execution optimization
- [ ] Custom agent plugin system
- [ ] Visual workflow builder
- [ ] Integration with more code analysis tools
- [ ] Automated test generation
- [ ] Performance profiling agents

## 📄 License

This agent system is part of the genomics platform and follows the same licensing terms.

## 🤝 Contributing

To add a new agent:

1. Create a new agent class extending `BaseAgent`
2. Implement `getSystemPrompt()` and `processResult()`
3. Add the agent to the orchestrator
4. Define hotkey mappings if needed
5. Update documentation

---

Built with ❤️ for the genomics research community