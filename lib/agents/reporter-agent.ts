// Reporter Agent - Markdown Summaries and Changelogs

import { BaseAgent } from './base-agent';
import { AgentContext, AgentResult, ReportContent } from './types';
import { agentLogger } from './logger';
import fs from 'fs';
import path from 'path';

export class ReporterAgent extends BaseAgent {
  getSystemPrompt(): string {
    return `You are a Reporter Agent specialized in creating comprehensive documentation and reports.
Your role is to:
1. Generate executive summaries of code changes
2. Create detailed changelogs with semantic versioning
3. Document security improvements and fixes
4. Summarize test coverage and quality metrics
5. Highlight performance optimizations
6. Create release notes for stakeholders
7. Generate technical documentation

Format all output in clean, readable Markdown with:
- Clear headings and subheadings
- Bullet points for lists
- Code blocks for examples
- Tables for metrics and comparisons
- Links to relevant resources
- Badges for status indicators

Focus on clarity, completeness, and actionability for different audiences (developers, QA, management).`;
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = super.buildUserPrompt(context);

    // Gather all previous agent results
    const agentSummary = this.summarizeAgentResults(context.previousResults || []);
    prompt += `\nAgent Execution Summary:\n${agentSummary}\n`;

    prompt += '\nGenerate a comprehensive report including summary, changelog, and recommendations.';

    return prompt;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const result = await super.execute(context);

    // Save report to file if successful
    if (result.success && result.artifacts?.report) {
      await this.saveReportToFile(result.artifacts.report, context);
    }

    return result;
  }

  processResult(response: string, context: AgentContext): AgentResult {
    // Parse the response into structured report content
    const report = this.parseReportResponse(response);

    // Generate additional artifacts
    const changelog = this.generateChangelog(context);
    const metrics = this.calculateMetrics(context);

    return {
      role: this.role,
      success: true,
      output: response,
      artifacts: {
        report: {
          ...report,
          changelog: report.changelog || changelog,
          metrics: { ...report.metrics, ...metrics },
        },
      },
      timestamp: new Date(),
      duration: 0, // Will be set by base class
    };
  }

  private summarizeAgentResults(results: AgentResult[]): string {
    let summary = '';

    results.forEach(result => {
      summary += `\n### ${this.capitalizeRole(result.role)} Agent\n`;
      summary += `- Status: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
      summary += `- Duration: ${result.duration}ms\n`;

      if (result.role === 'synthesizer' && result.artifacts?.code) {
        const lines = result.artifacts.code.split('\n').length;
        summary += `- Generated ${lines} lines of code\n`;
      }

      if (result.role === 'assessor' && result.artifacts?.analysis) {
        const analysis = result.artifacts.analysis;
        summary += `- Security issues: ${analysis.sast.length}\n`;
        summary += `- Linting issues: ${analysis.linting.length}\n`;
        summary += `- Complexity: ${analysis.metrics.complexity}\n`;
      }

      if (result.role === 'resynthesizer' && result.artifacts?.code) {
        summary += `- Refined code with improvements\n`;
      }

      if (result.error) {
        summary += `- Error: ${result.error}\n`;
      }
    });

    return summary;
  }

  private parseReportResponse(response: string): ReportContent {
    // Extract sections from markdown response
    const sections = this.extractMarkdownSections(response);

    return {
      summary: sections.summary || response,
      changelog: sections.changelog,
      recommendations: this.extractRecommendations(response),
      metrics: {},
    };
  }

  private extractMarkdownSections(markdown: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = markdown.split('\n');
    let currentSection = 'summary';
    let content: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (content.length > 0) {
          sections[currentSection] = content.join('\n').trim();
        }
        currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '_');
        content = [];
      } else {
        content.push(line);
      }
    }

    if (content.length > 0) {
      sections[currentSection] = content.join('\n').trim();
    }

    return sections;
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');
    let inRecommendations = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation')) {
        inRecommendations = true;
      } else if (line.startsWith('## ')) {
        inRecommendations = false;
      } else if (inRecommendations && line.trim().startsWith('-')) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }

    return recommendations;
  }

  private generateChangelog(context: AgentContext): string {
    const date = new Date().toISOString().split('T')[0];
    let changelog = `# Changelog\n\n## [${date}]\n\n`;

    const synthResult = context.previousResults?.find(r => r.role === 'synthesizer');
    const assessResult = context.previousResults?.find(r => r.role === 'assessor');
    const resynthResult = context.previousResults?.find(r => r.role === 'resynthesizer');

    if (synthResult?.success) {
      changelog += '### Added\n';
      changelog += '- New code implementation\n';
    }

    if (assessResult?.artifacts?.analysis) {
      const analysis = assessResult.artifacts.analysis;
      if (analysis.sast.length > 0) {
        changelog += '\n### Security\n';
        analysis.sast.forEach(issue => {
          changelog += `- Fixed ${issue.severity} severity: ${issue.type}\n`;
        });
      }
    }

    if (resynthResult?.success) {
      changelog += '\n### Changed\n';
      changelog += '- Refined code based on assessment feedback\n';
      changelog += '- Improved code quality and maintainability\n';
    }

    return changelog;
  }

  private calculateMetrics(context: AgentContext): Record<string, any> {
    const metrics: Record<string, any> = {
      totalExecutionTime: 0,
      agentsExecuted: 0,
      successRate: 0,
    };

    const results = context.previousResults || [];
    metrics.agentsExecuted = results.length;
    metrics.totalExecutionTime = results.reduce((sum, r) => sum + r.duration, 0);

    const successCount = results.filter(r => r.success).length;
    metrics.successRate = results.length > 0 ? (successCount / results.length) * 100 : 0;

    // Add specific metrics from assessor
    const assessResult = results.find(r => r.role === 'assessor');
    if (assessResult?.artifacts?.analysis) {
      metrics.codeMetrics = assessResult.artifacts.analysis.metrics;
      metrics.issuesFound = {
        security: assessResult.artifacts.analysis.sast.length,
        linting: assessResult.artifacts.analysis.linting.length,
      };
    }

    return metrics;
  }

  private async saveReportToFile(report: ReportContent, context: AgentContext): Promise<void> {
    try {
      const reportDir = path.join(context.projectPath, 'agent-reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reportDir, `report-${timestamp}.md`);

      const fullReport = this.formatFullReport(report);
      fs.writeFileSync(reportPath, fullReport);

      agentLogger.log('info', `Report saved to ${reportPath}`);
    } catch (error) {
      agentLogger.log('error', 'Failed to save report', error);
    }
  }

  private formatFullReport(report: ReportContent): string {
    let markdown = `# Agent Execution Report\n\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;

    markdown += `## Summary\n\n${report.summary}\n\n`;

    if (report.changelog) {
      markdown += `## Changelog\n\n${report.changelog}\n\n`;
    }

    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += '\n';
    }

    if (Object.keys(report.metrics).length > 0) {
      markdown += `## Metrics\n\n`;
      markdown += '| Metric | Value |\n';
      markdown += '|--------|-------|\n';
      Object.entries(report.metrics).forEach(([key, value]) => {
        if (typeof value === 'object') {
          markdown += `| ${key} | ${JSON.stringify(value)} |\n`;
        } else {
          markdown += `| ${key} | ${value} |\n`;
        }
      });
    }

    return markdown;
  }

  private capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}