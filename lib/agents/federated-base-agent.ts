import { EventEmitter } from 'events'
import { Redis } from '@upstash/redis'
import { AgentCapability, AgentMessage, agentRegistry } from './orchestration/agent-registry'
import { v4 as uuidv4 } from 'uuid'

export abstract class FederatedBaseAgent extends EventEmitter {
  protected capability: AgentCapability
  protected redis: Redis
  private subscription: any
  protected isRunning: boolean = false
  protected message: AgentMessage | null = null

  constructor(capability: AgentCapability) {
    super()
    this.capability = capability
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
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
      // Store current message for reference
      this.message = message

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
    } finally {
      this.message = null
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

  // AI Model helpers
  protected async runTriageModel(data: any): Promise<any> {
    // Mock implementation - would call actual AI model
    return {
      findings: [],
      confidence: 0.95
    }
  }

  protected async runClassificationModel(data: any): Promise<any> {
    // Mock implementation
    return {
      classification: 'benign',
      confidence: 0.87
    }
  }
}