// Assessor Agent - Code Analysis and Security Testing

import { BaseAgent } from './base-agent';
import { AgentContext, AgentResult, AnalysisResult, SecurityIssue, LintIssue, TestInference, CodeMetrics } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AssessorAgent extends BaseAgent {
  getSystemPrompt(): string {
    return `You are an Assessor Agent specialized in code analysis, security testing, and quality assessment.
Your role is to:
1. Perform Static Application Security Testing (SAST)
2. Identify potential security vulnerabilities (OWASP Top 10, CWE)
3. Run linting and code quality checks
4. Infer missing tests and test coverage gaps
5. Calculate code metrics (complexity, maintainability)
6. Check for HIPAA compliance issues in genomics data handling

Focus on:
- Security vulnerabilities (SQL injection, XSS, authentication issues)
- Code quality (DRY, SOLID principles, clean code)
- Performance bottlenecks (especially for genomic data processing)
- Missing error handling
- Accessibility issues
- Test coverage gaps

Provide actionable recommendations with severity levels.`;
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = super.buildUserPrompt(context);

    // Add code to analyze if available from previous results
    const synthesizerResult = context.previousResults?.find(r => r.role === 'synthesizer');
    if (synthesizerResult?.artifacts?.code) {
      prompt += `\nCode to analyze:\n\`\`\`typescript\n${synthesizerResult.artifacts.code}\n\`\`\`\n`;
    }

    prompt += '\nPerform comprehensive security and quality analysis on the code.';

    return prompt;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    // First get AI analysis
    const aiResult = await super.execute(context);

    // Then run actual tools if code is available
    const synthesizerResult = context.previousResults?.find(r => r.role === 'synthesizer');
    if (synthesizerResult?.artifacts?.code) {
      const toolAnalysis = await this.runAnalysisTools(synthesizerResult.artifacts.code, context);

      // Merge AI and tool results
      if (aiResult.artifacts?.analysis && toolAnalysis) {
        aiResult.artifacts.analysis = this.mergeAnalysisResults(
          aiResult.artifacts.analysis,
          toolAnalysis
        );
      }
    }

    return aiResult;
  }

  processResult(response: string, context: AgentContext): AgentResult {
    // Parse the AI response into structured analysis
    const analysis = this.parseAnalysisResponse(response);

    return {
      role: this.role,
      success: true,
      output: response,
      artifacts: {
        analysis,
      },
      timestamp: new Date(),
      duration: 0, // Will be set by base class
    };
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    // Mock parsing - in production, use proper parsing logic
    const analysis: AnalysisResult = {
      sast: [],
      dast: [],
      linting: [],
      tests: [],
      metrics: {
        complexity: 0,
        maintainability: 0,
        duplications: 0,
        techDebt: '0 hours',
      },
    };

    // Extract security issues
    if (response.includes('Security')) {
      analysis.sast.push({
        severity: 'high',
        type: 'Potential SQL Injection',
        file: 'unknown',
        line: 0,
        message: 'User input not properly sanitized',
        cwe: 'CWE-89',
      });
    }

    // Extract lint issues
    if (response.includes('lint') || response.includes('quality')) {
      analysis.linting.push({
        rule: 'no-unused-vars',
        severity: 'warning',
        file: 'unknown',
        line: 0,
        column: 0,
        message: 'Variable declared but never used',
      });
    }

    return analysis;
  }

  private async runAnalysisTools(code: string, context: AgentContext): Promise<AnalysisResult | null> {
    const analysis: AnalysisResult = {
      sast: [],
      dast: [],
      linting: [],
      tests: [],
      metrics: {
        complexity: 0,
        maintainability: 0,
        duplications: 0,
        techDebt: '0 hours',
      },
    };

    try {
      // Run ESLint (if available)
      if (context.projectPath) {
        try {
          const { stdout } = await execAsync(`npx eslint --format json "${context.currentFile || '.'}"`, {
            cwd: context.projectPath,
          });

          const eslintResults = JSON.parse(stdout);
          analysis.linting = this.parseESLintResults(eslintResults);
        } catch (error) {
          // ESLint might not be configured
        }
      }

      // Run security audit
      try {
        const { stdout } = await execAsync('npm audit --json', {
          cwd: context.projectPath,
        });

        const auditResults = JSON.parse(stdout);
        analysis.sast = this.parseSecurityAudit(auditResults);
      } catch (error) {
        // Audit might fail
      }

      // Calculate basic metrics
      analysis.metrics = this.calculateCodeMetrics(code);

      // Infer test requirements
      analysis.tests = this.inferTestRequirements(code);

    } catch (error) {
      console.error('Error running analysis tools:', error);
    }

    return analysis;
  }

  private parseESLintResults(results: any[]): LintIssue[] {
    const issues: LintIssue[] = [];

    for (const fileResult of results) {
      for (const message of fileResult.messages || []) {
        issues.push({
          rule: message.ruleId || 'unknown',
          severity: message.severity === 2 ? 'error' : 'warning',
          file: fileResult.filePath,
          line: message.line || 0,
          column: message.column || 0,
          message: message.message,
          fix: message.fix ? 'Available' : undefined,
        });
      }
    }

    return issues;
  }

  private parseSecurityAudit(audit: any): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Parse npm audit results
    if (audit.vulnerabilities) {
      Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
        issues.push({
          severity: vuln.severity,
          type: `Vulnerable dependency: ${pkg}`,
          file: 'package.json',
          line: 0,
          message: vuln.title || 'Security vulnerability detected',
          cwe: vuln.cwe || undefined,
        });
      });
    }

    return issues;
  }

  private calculateCodeMetrics(code: string): CodeMetrics {
    const lines = code.split('\n');
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//'));

    // Simple complexity calculation
    let complexity = 1;
    complexity += (code.match(/if\s*\(/g) || []).length;
    complexity += (code.match(/for\s*\(/g) || []).length;
    complexity += (code.match(/while\s*\(/g) || []).length;
    complexity += (code.match(/case\s+/g) || []).length;

    // Maintainability index (simplified)
    const maintainability = Math.max(0, 100 - (complexity * 2) - (codeLines.length / 10));

    return {
      complexity,
      maintainability: Math.round(maintainability),
      duplications: 0,
      techDebt: complexity > 10 ? `${Math.round(complexity / 5)} hours` : '0 hours',
    };
  }

  private inferTestRequirements(code: string): TestInference[] {
    const inferences: TestInference[] = [];

    // Extract functions/methods
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{|function\s*\([^)]*\)\s*{)/g;
    const functions: string[] = [];
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      functions.push(match[1]);
    }

    if (functions.length > 0) {
      inferences.push({
        file: 'current',
        suggestedTests: functions.map(fn => `Test ${fn} function`),
        coverage: 0,
        missingScenarios: [
          'Happy path tests',
          'Error handling tests',
          'Edge case tests',
          'Performance tests for large genomic datasets',
        ],
      });
    }

    return inferences;
  }

  private mergeAnalysisResults(aiAnalysis: AnalysisResult, toolAnalysis: AnalysisResult): AnalysisResult {
    return {
      sast: [...aiAnalysis.sast, ...toolAnalysis.sast],
      dast: [...aiAnalysis.dast, ...toolAnalysis.dast],
      linting: [...aiAnalysis.linting, ...toolAnalysis.linting],
      tests: [...aiAnalysis.tests, ...toolAnalysis.tests],
      metrics: {
        complexity: Math.max(aiAnalysis.metrics.complexity, toolAnalysis.metrics.complexity),
        maintainability: Math.min(aiAnalysis.metrics.maintainability, toolAnalysis.metrics.maintainability),
        duplications: Math.max(aiAnalysis.metrics.duplications, toolAnalysis.metrics.duplications),
        techDebt: toolAnalysis.metrics.techDebt || aiAnalysis.metrics.techDebt,
      },
    };
  }
}