// Synthesizer Agent - Initial Code Generation

import { BaseAgent } from './base-agent';
import { AgentContext, AgentResult } from './types';

export class SynthesizerAgent extends BaseAgent {
  getSystemPrompt(): string {
    return `You are a Synthesizer Agent specialized in initial code generation for a genomics platform.
Your role is to:
1. Generate high-quality, production-ready code based on requirements
2. Follow TypeScript/React best practices
3. Ensure code is modular, testable, and maintainable
4. Include proper error handling and edge cases
5. Add meaningful comments and documentation
6. Consider security implications (HIPAA compliance for genomics data)

Focus on creating code that integrates well with the existing codebase structure.
When generating code, consider:
- Existing patterns in the codebase
- Reusability of components
- Performance optimization for large genomic datasets
- Type safety and proper interfaces
- Accessibility standards

Output should be clean, working code with necessary imports and exports.`;
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = super.buildUserPrompt(context);

    if (context.metadata?.requirements) {
      prompt += `\nRequirements:\n${context.metadata.requirements}\n`;
    }

    if (context.metadata?.codeStyle) {
      prompt += `\nCode style preferences:\n${context.metadata.codeStyle}\n`;
    }

    if (context.metadata?.existingPatterns) {
      prompt += `\nExisting patterns to follow:\n${context.metadata.existingPatterns}\n`;
    }

    prompt += '\nGenerate the code based on the above context and requirements.';

    return prompt;
  }

  processResult(response: string, context: AgentContext): AgentResult {
    // Extract code blocks from the response
    const codeBlocks = this.extractCodeBlocks(response);
    const mainCode = codeBlocks.length > 0 ? codeBlocks.join('\n\n') : response;

    // Validate basic syntax
    const syntaxIssues = this.validateBasicSyntax(mainCode);

    return {
      role: this.role,
      success: syntaxIssues.length === 0,
      output: response,
      artifacts: {
        code: mainCode,
      },
      timestamp: new Date(),
      duration: 0, // Will be set by base class
      error: syntaxIssues.length > 0 ? `Syntax issues: ${syntaxIssues.join(', ')}` : undefined,
    };
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

  private validateBasicSyntax(code: string): string[] {
    const issues: string[] = [];

    // Basic validation checks
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Mismatched braces');
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push('Mismatched parentheses');
    }

    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push('Mismatched brackets');
    }

    // Check for common syntax errors
    if (code.includes(';;')) {
      issues.push('Double semicolons detected');
    }

    return issues;
  }
}