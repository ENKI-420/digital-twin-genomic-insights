// Provider-Agnostic Model Interface

import OpenAI from 'openai';
import { ModelProvider } from './types';
import { agentLogger } from './logger';

export interface ModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: ModelProvider;
}

export interface ModelRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export abstract class BaseModelProvider {
  protected provider: ModelProvider;

  constructor(provider: ModelProvider) {
    this.provider = provider;
  }

  abstract generateCompletion(request: ModelRequest): Promise<ModelResponse>;
}

export class OpenAIProvider extends BaseModelProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    super('openai');
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(request: ModelRequest): Promise<ModelResponse> {
    const model = request.model || 'gpt-4-turbo-preview';

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4000,
      });

      const response: ModelResponse = {
        content: completion.choices[0]?.message?.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model,
        provider: this.provider,
      };

      agentLogger.logModelCall(this.provider, model, response.usage.totalTokens);
      return response;
    } catch (error) {
      agentLogger.log('error', 'OpenAI API error', error);
      throw error;
    }
  }
}

export class ClaudeProvider extends BaseModelProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    super('claude');
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  async generateCompletion(request: ModelRequest): Promise<ModelResponse> {
    const model = request.model || 'claude-3-opus-20240229';

    try {
      // Claude API implementation
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxTokens || 4000,
          temperature: request.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();

      const result: ModelResponse = {
        content: data.content[0]?.text || '',
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        model,
        provider: this.provider,
      };

      agentLogger.logModelCall(this.provider, model, result.usage.totalTokens);
      return result;
    } catch (error) {
      agentLogger.log('error', 'Claude API error', error);
      throw error;
    }
  }
}

export class LintCriticProvider extends BaseModelProvider {
  constructor() {
    super('lintcritic');
  }

  async generateCompletion(request: ModelRequest): Promise<ModelResponse> {
    // Specialized linting-focused model
    // This could integrate with ESLint, TSLint, or custom analysis
    const model = 'lintcritic-v1';

    try {
      // Simulate lint analysis based on code in messages
      const codeContent = request.messages.find(m => m.role === 'user')?.content || '';

      // Mock implementation - replace with actual lint engine
      const lintResults = await this.analyzeLintIssues(codeContent);

      const response: ModelResponse = {
        content: JSON.stringify(lintResults, null, 2),
        usage: {
          promptTokens: codeContent.length,
          completionTokens: 100,
          totalTokens: codeContent.length + 100,
        },
        model,
        provider: this.provider,
      };

      agentLogger.logModelCall(this.provider, model, response.usage.totalTokens);
      return response;
    } catch (error) {
      agentLogger.log('error', 'LintCritic error', error);
      throw error;
    }
  }

  private async analyzeLintIssues(code: string): Promise<any> {
    // Mock lint analysis
    return {
      issues: [],
      suggestions: ['Consider adding type annotations', 'Extract complex logic into functions'],
      metrics: {
        complexity: 'low',
        maintainability: 'high',
      }
    };
  }
}

export class LocalModelProvider extends BaseModelProvider {
  constructor() {
    super('local');
  }

  async generateCompletion(request: ModelRequest): Promise<ModelResponse> {
    // Local model implementation (e.g., Ollama, llama.cpp)
    const model = request.model || 'llama-2-7b';

    try {
      // Mock implementation - replace with actual local model
      const response: ModelResponse = {
        content: 'Local model response placeholder',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model,
        provider: this.provider,
      };

      agentLogger.logModelCall(this.provider, model, response.usage.totalTokens);
      return response;
    } catch (error) {
      agentLogger.log('error', 'Local model error', error);
      throw error;
    }
  }
}

export class ModelInterfaceFactory {
  private static providers = new Map<ModelProvider, BaseModelProvider>();

  static getProvider(provider: ModelProvider): BaseModelProvider {
    if (!this.providers.has(provider)) {
      switch (provider) {
        case 'openai':
          this.providers.set(provider, new OpenAIProvider());
          break;
        case 'claude':
          this.providers.set(provider, new ClaudeProvider());
          break;
        case 'lintcritic':
          this.providers.set(provider, new LintCriticProvider());
          break;
        case 'local':
          this.providers.set(provider, new LocalModelProvider());
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    }

    return this.providers.get(provider)!;
  }
}