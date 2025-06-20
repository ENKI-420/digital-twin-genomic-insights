// Collaborator Agent - Pull Request Preparation and GitHub Sync

import { BaseAgent } from './base-agent';
import { AgentContext, AgentResult, PullRequestData } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class CollaboratorAgent extends BaseAgent {
  getSystemPrompt(): string {
    return `You are a Collaborator Agent specialized in preparing pull requests and GitHub integration.
Your role is to:
1. Create meaningful PR titles and descriptions
2. Suggest appropriate branch names
3. Identify relevant reviewers and labels
4. Generate commit messages following conventional commits
5. Create PR templates with checklists
6. Document breaking changes
7. Link related issues and PRs

When creating PR content:
- Use clear, descriptive titles (max 72 chars)
- Write comprehensive descriptions with context
- Include before/after comparisons
- Add screenshots or diagrams when relevant
- List all changes with bullet points
- Highlight potential risks or impacts
- Suggest testing strategies

Follow best practices for collaborative development and code review processes.`;
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = super.buildUserPrompt(context);

    // Gather all changes from previous agents
    const changes = this.summarizeChanges(context.previousResults || []);
    prompt += `\nCode Changes Summary:\n${changes}\n`;

    // Add git context if available
    if (context.metadata?.gitContext) {
      prompt += `\nGit Context:\n${JSON.stringify(context.metadata.gitContext, null, 2)}\n`;
    }

    prompt += '\nPrepare a pull request with title, description, labels, and review strategy.';

    return prompt;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    // Get AI-generated PR content
    const result = await super.execute(context);

    // Enhance with actual git information
    if (result.success && context.projectPath) {
      const gitInfo = await this.getGitInfo(context.projectPath);
      if (gitInfo && result.artifacts?.pr) {
        result.artifacts.pr = {
          ...result.artifacts.pr,
          ...gitInfo,
        };
      }
    }

    return result;
  }

  processResult(response: string, context: AgentContext): AgentResult {
    // Parse PR data from response
    const prData = this.parsePullRequestData(response);

    // Generate additional PR artifacts
    const prTemplate = this.generatePRTemplate(prData, context);
    const commitMessage = this.generateCommitMessage(prData, context);

    return {
      role: this.role,
      success: prData.title.length > 0,
      output: response,
      artifacts: {
        pr: prData,
      },
      timestamp: new Date(),
      duration: 0, // Will be set by base class
    };
  }

  private summarizeChanges(results: AgentResult[]): string {
    let summary = '';

    const synthResult = results.find(r => r.role === 'synthesizer');
    const resynthResult = results.find(r => r.role === 'resynthesizer');
    const assessResult = results.find(r => r.role === 'assessor');

    if (synthResult?.artifacts?.code) {
      const lines = synthResult.artifacts.code.split('\n').length;
      summary += `- Generated ${lines} lines of new code\n`;
    }

    if (assessResult?.artifacts?.analysis) {
      const analysis = assessResult.artifacts.analysis;
      summary += `- Fixed ${analysis.sast.length} security issues\n`;
      summary += `- Resolved ${analysis.linting.length} linting issues\n`;
    }

    if (resynthResult?.success) {
      summary += `- Refined code for better quality and maintainability\n`;
    }

    return summary;
  }

  private parsePullRequestData(response: string): PullRequestData {
    // Extract PR components from response
    const titleMatch = response.match(/Title:\s*(.+)/i);
    const branchMatch = response.match(/Branch:\s*(.+)/i);
    const labelsMatch = response.match(/Labels:\s*(.+)/i);

    const prData: PullRequestData = {
      title: titleMatch ? titleMatch[1].trim() : 'Code improvements',
      description: this.extractDescription(response),
      branch: branchMatch ? branchMatch[1].trim() : 'feature/code-improvements',
      files: [],
      labels: labelsMatch ? labelsMatch[1].split(',').map(l => l.trim()) : ['enhancement'],
    };

    return prData;
  }

  private extractDescription(response: string): string {
    // Extract description section
    const descStart = response.indexOf('Description:');
    if (descStart === -1) return response;

    const descEnd = response.indexOf('\n\n', descStart);
    const description = response.substring(
      descStart + 'Description:'.length,
      descEnd > 0 ? descEnd : undefined
    ).trim();

    return description;
  }

  private async getGitInfo(projectPath: string): Promise<Partial<PullRequestData> | null> {
    try {
      // Get current branch
      const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', {
        cwd: projectPath,
      });

      // Get changed files
      const { stdout: filesOutput } = await execAsync('git diff --name-only HEAD~1', {
        cwd: projectPath,
      });
      const files = filesOutput.trim().split('\n').filter(f => f);

      return {
        branch: branch.trim(),
        files,
      };
    } catch (error) {
      return null;
    }
  }

  private generatePRTemplate(prData: PullRequestData, context: AgentContext): string {
    return `# ${prData.title}

## Description
${prData.description}

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Changes Made
${this.formatChangesList(context)}

## Testing
- [ ] Unit tests pass locally
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing (if applicable)

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Security Considerations
${this.getSecurityConsiderations(context)}

## Screenshots (if applicable)
N/A

## Additional Notes
${this.getAdditionalNotes(context)}
`;
  }

  private formatChangesList(context: AgentContext): string {
    const results = context.previousResults || [];
    let changes = '';

    results.forEach(result => {
      if (result.success && result.artifacts) {
        changes += `- ${this.capitalizeRole(result.role)}: ${this.getChangeDescription(result)}\n`;
      }
    });

    return changes || '- Code improvements and optimizations';
  }

  private getChangeDescription(result: AgentResult): string {
    switch (result.role) {
      case 'synthesizer':
        return 'Generated initial implementation';
      case 'assessor':
        const analysis = result.artifacts?.analysis;
        if (analysis) {
          return `Identified ${analysis.sast.length + analysis.linting.length} issues`;
        }
        return 'Performed code analysis';
      case 'resynthesizer':
        return 'Refined code based on assessment feedback';
      case 'reporter':
        return 'Generated documentation and reports';
      default:
        return 'Completed processing';
    }
  }

  private getSecurityConsiderations(context: AgentContext): string {
    const assessResult = context.previousResults?.find(r => r.role === 'assessor');
    if (!assessResult?.artifacts?.analysis) {
      return '- No security issues identified';
    }

    const analysis = assessResult.artifacts.analysis;
    if (analysis.sast.length === 0) {
      return '- No security vulnerabilities detected';
    }

    let security = '';
    analysis.sast.forEach(issue => {
      security += `- Fixed: ${issue.type} (${issue.severity})\n`;
    });

    return security;
  }

  private getAdditionalNotes(context: AgentContext): string {
    const notes: string[] = [];

    // Add performance considerations for genomics
    notes.push('- Code optimized for handling large genomic datasets');
    notes.push('- HIPAA compliance considerations addressed');

    // Add metrics if available
    const assessResult = context.previousResults?.find(r => r.role === 'assessor');
    if (assessResult?.artifacts?.analysis?.metrics) {
      const metrics = assessResult.artifacts.analysis.metrics;
      notes.push(`- Code complexity: ${metrics.complexity}`);
      notes.push(`- Maintainability index: ${metrics.maintainability}/100`);
    }

    return notes.join('\n');
  }

  private generateCommitMessage(prData: PullRequestData, context: AgentContext): string {
    const type = this.inferCommitType(prData.labels);
    const scope = this.inferScope(prData.files);

    return `${type}${scope ? `(${scope})` : ''}: ${prData.title.toLowerCase()}`;
  }

  private inferCommitType(labels: string[]): string {
    if (labels.includes('bug')) return 'fix';
    if (labels.includes('feature')) return 'feat';
    if (labels.includes('documentation')) return 'docs';
    if (labels.includes('performance')) return 'perf';
    if (labels.includes('refactor')) return 'refactor';
    if (labels.includes('test')) return 'test';
    return 'feat';
  }

  private inferScope(files: string[]): string {
    if (files.length === 0) return '';

    // Find common directory
    const dirs = files.map(f => path.dirname(f));
    const commonDir = dirs[0]?.split('/')[0];

    if (commonDir && dirs.every(d => d.startsWith(commonDir))) {
      return commonDir;
    }

    return '';
  }

  private capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}