// Base Agent Class

import { AgentConfig, AgentContext, AgentResult, AgentRole } from './types';
import { ModelInterfaceFactory, ModelRequest } from './model-interface';
import { agentLogger } from './logger';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected role: AgentRole;

  constructor(config: AgentConfig) {
    this.config = config;
    this.role = config.role;
  }

  abstract getSystemPrompt(): string;
  abstract processResult(response: string, context: AgentContext): AgentResult;

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    agentLogger.logAgentStart(this.role, context);

    try {
      // Get the model provider
      const provider = ModelInterfaceFactory.getProvider(this.config.provider);

      // Build the request
      const request: ModelRequest = {
        messages: [
          {
            role: 'system',
            content: this.config.systemPrompt || this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: this.buildUserPrompt(context),
          },
        ],
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        model: this.config.model,
      };

      // Add previous results as context if available
      if (context.previousResults && context.previousResults.length > 0) {
        const previousContext = this.buildPreviousContext(context.previousResults);
        request.messages.push({
          role: 'assistant',
          content: previousContext,
        });
      }

      // Generate completion
      const response = await provider.generateCompletion(request);

      // Process the result
      const result = this.processResult(response.content, context);
      result.duration = Date.now() - startTime;

      agentLogger.logAgentResult(result);
      return result;

    } catch (error) {
      const errorResult: AgentResult = {
        role: this.role,
        success: false,
        output: 'Agent execution failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };

      agentLogger.logAgentResult(errorResult);
      return errorResult;
    }
  }

  protected buildUserPrompt(context: AgentContext): string {
    let prompt = '';

    if (context.currentFile) {
      prompt += `Current file: ${context.currentFile}\n\n`;
    }

    if (context.projectPath) {
      prompt += `Project path: ${context.projectPath}\n\n`;
    }

    if (context.metadata) {
      prompt += `Additional context:\n${JSON.stringify(context.metadata, null, 2)}\n\n`;
    }

    return prompt;
  }

  protected buildPreviousContext(previousResults: AgentResult[]): string {
    return previousResults
      .map(result => {
        return `Previous ${result.role} output:\n${result.output}\n`;
      })
      .join('\n');
  }

  // Helper method for output formatting
  protected formatOutput(sections: Record<string, string>): string {
    return Object.entries(sections)
      .map(([title, content]) => {
        return `## ${title}\n\n${content}`;
      })
      .join('\n\n');
  }
}