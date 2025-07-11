// Base Agent Class

import { EventEmitter } from 'events'
import { Redis } from '@upstash/redis'
import { AgentCapability, AgentMessage, agentRegistry } from './orchestration/agent-registry'
import { v4 as uuidv4 } from 'uuid'
import { AgentConfig, AgentContext, AgentResult, AgentRole } from './types';
import { ModelInterfaceFactory, ModelRequest } from './model-interface';
import { agentLogger } from './logger';

export abstract class BaseAgent extends EventEmitter {
  protected capability: AgentCapability
  protected redis: Redis
  private subscription: any
  protected isRunning: boolean = false
  protected config: AgentConfig;
  protected role: AgentRole;

  constructor(capability: AgentCapability) {
    super()
    this.capability = capability
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
    this.config = capability.config;
    this.role = capability.config.role;
  }

  // Start the agent
  async start(): Promise<void> {
    try {
      // Register with orchestrator
      await agentRegistry.registerAgent(this.capability)

      // Subscribe to agent's channel
      await this.subscribeToChannel()

      this.isRunning = true
      this.emit('started', this.capability)

      console.log(`[${this.capability.name}] Agent started successfully`)
    } catch (error) {
      console.error(`[${this.capability.name}] Failed to start:`, error)
      throw error
    }
  }

  // Stop the agent
  async stop(): Promise<void> {
    try {
      this.isRunning = false

      // Unsubscribe from channel
      if (this.subscription) {
        await this.subscription.unsubscribe()
      }

      // Unregister from orchestrator
      await agentRegistry.unregisterAgent(this.capability.id)

      this.emit('stopped', this.capability)
      console.log(`[${this.capability.name}] Agent stopped`)
    } catch (error) {
      console.error(`[${this.capability.name}] Error during shutdown:`, error)
    }
  }

  // Subscribe to agent's message channel
  private async subscribeToChannel(): Promise<void> {
    // Note: In production, use Redis Pub/Sub or message queue
    // This is a polling implementation for Upstash Redis
    const pollInterval = 1000 // 1 second

    const poll = async () => {
      if (!this.isRunning) return

      try {
        // Check for messages in agent's queue
        const message = await this.redis.lpop(`agent:queue:${this.capability.id}`)

        if (message) {
          const parsedMessage = JSON.parse(message as string) as AgentMessage
          await this.handleMessage(parsedMessage)
        }
      } catch (error) {
        console.error(`[${this.capability.name}] Error polling messages:`, error)
      }

      // Continue polling
      if (this.isRunning) {
        setTimeout(poll, pollInterval)
      }
    }

    // Start polling
    poll()
  }

  // Handle incoming message
  private async handleMessage(message: AgentMessage): Promise<void> {
    try {
      // Log message receipt
      console.log(`[${this.capability.name}] Received message:`, {
        from: message.from,
        type: message.type,
        action: message.payload?.action
      })

      // Process message in child class
      await this.processMessage(message)

    } catch (error) {
      await this.handleError(error, 'processMessage', message)
    }
  }

  // Send message through orchestrator
  protected async sendMessage(params: Omit<AgentMessage, 'id' | 'from' | 'timestamp'>): Promise<void> {
    const message: AgentMessage = {
      ...params,
      id: uuidv4(),
      from: this.capability.id,
      timestamp: Date.now()
    }

    await agentRegistry.routeMessage(message)
  }

  // Handle errors consistently
  protected async handleError(error: any, action: string, context?: any): Promise<void> {
    const errorLog = {
      agent: this.capability.name,
      action,
      error: error.message || error,
      context,
      timestamp: new Date().toISOString()
    }

    console.error(`[${this.capability.name}] Error:`, errorLog)

    // Send error to monitoring agent
    await this.sendMessage({
      to: 'monitoring-agent-001',
      type: 'event',
      payload: {
        action: 'error_reported',
        error: errorLog
      },
      priority: 'high'
    })
  }

  // Handle unknown actions
  protected async handleUnknownAction(message: AgentMessage): Promise<void> {
    console.warn(`[${this.capability.name}] Unknown action:`, message.payload?.action)

    await this.sendMessage({
      to: message.from,
      type: 'response',
      payload: {
        error: `Unknown action: ${message.payload?.action}`,
        supportedActions: this.getSupportedActions()
      },
      correlationId: message.id,
      priority: 'normal'
    })
  }

  // Get supported actions (override in child classes)
  protected getSupportedActions(): string[] {
    return ['ping', 'health_check', 'capabilities']
  }

  // Abstract method - must be implemented by child classes
  abstract processMessage(message: AgentMessage): Promise<void>

  // Utility methods
  protected async cacheResult(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  protected async getCachedResult(key: string): Promise<any | null> {
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached as string) : null
  }

  // Health check
  async healthCheck(): Promise<any> {
    return {
      agent: this.capability.name,
      id: this.capability.id,
      status: this.isRunning ? 'healthy' : 'stopped',
      department: this.capability.department,
      capabilities: this.capability.capabilities,
      timestamp: new Date().toISOString()
    }
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