import { EventEmitter } from 'events'
import { Redis } from '@upstash/redis'

export interface AgentCapability {
  id: string
  name: string
  department: string
  capabilities: string[]
  requiredPermissions: string[]
  status: 'active' | 'inactive' | 'maintenance'
}

export interface AgentMessage {
  id: string
  from: string
  to: string | string[]
  type: 'request' | 'response' | 'event' | 'broadcast'
  payload: any
  timestamp: number
  correlationId?: string
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export class AgentRegistry extends EventEmitter {
  private agents: Map<string, AgentCapability> = new Map()
  private redis: Redis
  private messageQueue: AgentMessage[] = []

  constructor(redisUrl?: string) {
    super()
    this.redis = new Redis({
      url: redisUrl || process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
  }

  // Register a new agent
  async registerAgent(agent: AgentCapability): Promise<void> {
    this.agents.set(agent.id, agent)
    await this.redis.hset('agents', agent.id, JSON.stringify(agent))
    this.emit('agent:registered', agent)

    // Announce to other agents
    await this.broadcast({
      type: 'event',
      from: 'orchestrator',
      to: '*',
      payload: { event: 'agent_joined', agent },
      timestamp: Date.now(),
      priority: 'normal'
    })
  }

  // Remove agent from registry
  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (agent) {
      this.agents.delete(agentId)
      await this.redis.hdel('agents', agentId)
      this.emit('agent:unregistered', agent)

      await this.broadcast({
        type: 'event',
        from: 'orchestrator',
        to: '*',
        payload: { event: 'agent_left', agentId },
        timestamp: Date.now(),
        priority: 'normal'
      })
    }
  }

  // Route message between agents
  async routeMessage(message: AgentMessage): Promise<void> {
    // Validate sender has permission
    const sender = this.agents.get(message.from)
    if (!sender || sender.status !== 'active') {
      throw new Error(`Agent ${message.from} not authorized to send messages`)
    }

    // Add to audit log
    await this.auditMessage(message)

    // Route based on recipient
    if (message.to === '*') {
      await this.broadcast(message)
    } else if (Array.isArray(message.to)) {
      await Promise.all(message.to.map(agentId => this.sendToAgent(agentId, message)))
    } else {
      await this.sendToAgent(message.to, message)
    }
  }

  // Send message to specific agent
  private async sendToAgent(agentId: string, message: AgentMessage): Promise<void> {
    const recipient = this.agents.get(agentId)
    if (!recipient || recipient.status !== 'active') {
      // Queue for later delivery
      this.messageQueue.push(message)
      return
    }

    // Publish to agent's channel
    await this.redis.publish(`agent:${agentId}`, JSON.stringify(message))
    this.emit('message:sent', { to: agentId, message })
  }

  // Broadcast to all agents
  private async broadcast(message: AgentMessage): Promise<void> {
    const activeAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'active' && a.id !== message.from)

    await Promise.all(
      activeAgents.map(agent =>
        this.redis.publish(`agent:${agent.id}`, JSON.stringify(message))
      )
    )
  }

  // Audit all messages for compliance
  private async auditMessage(message: AgentMessage): Promise<void> {
    const audit = {
      messageId: message.id,
      from: message.from,
      to: message.to,
      type: message.type,
      timestamp: message.timestamp,
      // Don't log PHI payload, just metadata
      payloadType: typeof message.payload,
      hasPhiData: this.containsPHI(message.payload)
    }

    await this.redis.lpush('audit:messages', JSON.stringify(audit))
    await this.redis.expire('audit:messages', 30 * 24 * 60 * 60) // 30 days
  }

  // Basic PHI detection (extend with ML model)
  private containsPHI(payload: any): boolean {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{10,}\b/, // Medical record numbers
      /patient|diagnosis|medication/i
    ]

    const str = JSON.stringify(payload)
    return phiPatterns.some(pattern => pattern.test(str))
  }

  // Get agent by capability
  findAgentsByCapability(capability: string): AgentCapability[] {
    return Array.from(this.agents.values())
      .filter(agent =>
        agent.status === 'active' &&
        agent.capabilities.includes(capability)
      )
  }

  // Get department agents
  getAgentsByDepartment(department: string): AgentCapability[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.department === department)
  }

  // Health check
  async healthCheck(): Promise<Record<string, any>> {
    const activeAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'active').length

    return {
      status: 'healthy',
      activeAgents,
      totalAgents: this.agents.size,
      queuedMessages: this.messageQueue.length,
      timestamp: new Date().toISOString()
    }
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry()