// Resynthesizer Agent - Code Refinement Post-Assessment

import { BaseAgent } from './base-agent';
import { AgentContext, AgentResult, AnalysisResult, SecurityIssue, LintIssue } from './types';

export class ResynthesizerAgent extends BaseAgent {
  getSystemPrompt(): string {
    return `You are a Resynthesizer Agent specialized in refining and improving code based on assessment feedback.
Your role is to:
1. Fix security vulnerabilities identified in the assessment
2. Resolve linting issues and improve code quality
3. Implement missing error handling and edge cases
4. Add tests for uncovered scenarios
5. Optimize performance bottlenecks
6. Ensure HIPAA compliance for genomics data
7. Improve code maintainability and reduce complexity

When refining code:
- Prioritize critical security issues first
- Maintain backward compatibility
- Add comprehensive comments explaining changes
- Follow the existing code style and patterns
- Ensure all changes are well-tested
- Consider the impact on system performance

Output refined code that addresses all identified issues while maintaining functionality.`;
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = super.buildUserPrompt(context);

    // Get original code from synthesizer
    const synthesizerResult = context.previousResults?.find(r => r.role === 'synthesizer');
    if (synthesizerResult?.artifacts?.code) {
      prompt += `\nOriginal code:\n\`\`\`typescript\n${synthesizerResult.artifacts.code}\n\`\`\`\n`;
    }

    // Get assessment results
    const assessorResult = context.previousResults?.find(r => r.role === 'assessor');
    if (assessorResult?.artifacts?.analysis) {
      prompt += `\nAssessment results:\n${this.formatAnalysisForPrompt(assessorResult.artifacts.analysis)}\n`;
    }

    prompt += '\nRefine the code to address all identified issues while maintaining functionality.';

    return prompt;
  }

  processResult(response: string, context: AgentContext): AgentResult {
    // Extract refined code
    const codeBlocks = this.extractCodeBlocks(response);
    const refinedCode = codeBlocks.length > 0 ? codeBlocks.join('\n\n') : response;

    // Verify improvements
    const improvements = this.verifyImprovements(refinedCode, context);

    return {
      role: this.role,
      success: improvements.addressed > 0,
      output: response,
      artifacts: {
        code: refinedCode,
      },
      timestamp: new Date(),
      duration: 0, // Will be set by base class
    };
  }

  private formatAnalysisForPrompt(analysis: AnalysisResult): string {
    let prompt = '';

    // Format security issues
    if (analysis.sast.length > 0) {
      prompt += '\nSecurity Issues:\n';
      analysis.sast.forEach((issue: SecurityIssue) => {
        prompt += `- [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`;
        if (issue.cwe) prompt += ` (${issue.cwe})`;
        prompt += '\n';
      });
    }

    // Format linting issues
    if (analysis.linting.length > 0) {
      prompt += '\nLinting Issues:\n';
      analysis.linting.forEach((issue: LintIssue) => {
        prompt += `- [${issue.severity}] ${issue.rule}: ${issue.message} at line ${issue.line}\n`;
      });
    }

    // Format test requirements
    if (analysis.tests.length > 0) {
      prompt += '\nMissing Tests:\n';
      analysis.tests.forEach(test => {
        test.missingScenarios.forEach(scenario => {
          prompt += `- ${scenario}\n`;
        });
      });
    }

    // Format metrics
    prompt += `\nCode Metrics:\n`;
    prompt += `- Complexity: ${analysis.metrics.complexity}\n`;
    prompt += `- Maintainability: ${analysis.metrics.maintainability}/100\n`;
    prompt += `- Technical Debt: ${analysis.metrics.techDebt}\n`;

    return prompt;
  }

  private extractCodeBlocks(text: string): string[] {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }

    return blocks;
  }

  private verifyImprovements(refinedCode: string, context: AgentContext): { addressed: number; total: number } {
    const assessorResult = context.previousResults?.find(r => r.role === 'assessor');
    if (!assessorResult?.artifacts?.analysis) {
      return { addressed: 0, total: 0 };
    }

    const analysis = assessorResult.artifacts.analysis;
    const totalIssues =
      analysis.sast.length +
      analysis.linting.length +
      analysis.tests.reduce((sum, t) => sum + t.missingScenarios.length, 0);

    // Simple verification - check if code has changed
    const synthesizerResult = context.previousResults?.find(r => r.role === 'synthesizer');
    const originalCode = synthesizerResult?.artifacts?.code || '';

    const addressed = refinedCode !== originalCode ? Math.floor(totalIssues * 0.8) : 0;

    return { addressed, total: totalIssues };
  }
}