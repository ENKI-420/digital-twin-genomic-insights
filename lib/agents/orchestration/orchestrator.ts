import { AgentRegistry } from './registry';
import { SecureEventBus } from './event-bus';
import { GovernanceEngine } from './governance';
import { FederatedAgent } from '../base/federated-agent';
import { AgentMessage, MessageType, AgentRole, AgentStatus } from '../types';

export interface OrchestrationConfig {
  maxRetries: number;
  timeoutMs: number;
  healthCheckInterval: number;
  circuitBreakerThreshold: number;
  loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'priority-based';
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  agents: Map<string, AgentStatus>;
  eventBus: {
    queueSize: number;
    retryCount: number;
    listenerCount: number;
  };
  governance: {
    totalRequests: number;
    allowedRequests: number;
    deniedRequests: number;
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export class FederatedOrchestrator {
  private registry: AgentRegistry;
  private eventBus: SecureEventBus;
  private governance: GovernanceEngine;
  private config: OrchestrationConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private performanceMetrics: {
    responseTimes: number[];
    requestCount: number;
    errorCount: number;
  };

  constructor(config: Partial<OrchestrationConfig> = {}) {
    this.registry = new AgentRegistry();
    this.eventBus = new SecureEventBus();
    this.governance = new GovernanceEngine();
    this.config = {
      maxRetries: 3,
      timeoutMs: 10000,
      healthCheckInterval: 30000,
      circuitBreakerThreshold: 5,
      loadBalancingStrategy: 'priority-based',
      ...config
    };

    this.performanceMetrics = {
      responseTimes: [],
      requestCount: 0,
      errorCount: 0
    };

    this.setupEventHandlers();
    this.startHealthMonitoring();
  }

  private setupEventHandlers() {
    // Handle agent registration
    this.eventBus.subscribe('agent.register', (message) => {
      this.handleAgentRegistration(message);
    });

    // Handle agent health updates
    this.eventBus.subscribe('agent.health', (message) => {
      this.handleHealthUpdate(message);
    });

    // Handle system-wide events
    this.eventBus.subscribe('system.emergency', (message) => {
      this.handleEmergency(message);
    });

    // Handle circuit breaker events
    this.eventBus.on('circuit_breaker', (data) => {
      this.handleCircuitBreaker(data);
    });
  }

  async registerAgent(agent: FederatedAgent): Promise<void> {
    try {
      await this.registry.registerAgent(agent);

      // Subscribe to agent-specific topics
      this.eventBus.subscribe(`${agent.department}.${agent.role}`, (message) => {
        this.routeMessageToAgent(agent.id, message);
      });

      console.log(`Agent ${agent.id} registered successfully`);
    } catch (error) {
      console.error(`Failed to register agent ${agent.id}:`, error);
      throw error;
    }
  }

  async unregisterAgent(agentId: string): Promise<void> {
    try {
      await this.registry.unregisterAgent(agentId);
      console.log(`Agent ${agentId} unregistered successfully`);
    } catch (error) {
      console.error(`Failed to unregister agent ${agentId}:`, error);
      throw error;
    }
  }

  async sendMessage(message: AgentMessage): Promise<AgentMessage[]> {
    const startTime = Date.now();
    this.performanceMetrics.requestCount++;

    try {
      // Apply governance policies
      const routingResult = await this.governance.routeMessage(message);

      if (!routingResult.allowed) {
        throw new Error(`Access denied: ${routingResult.reason}`);
      }

      // Select target agents based on load balancing strategy
      const targetAgents = await this.selectTargetAgents(
        routingResult.targetAgents,
        message
      );

      if (targetAgents.length === 0) {
        throw new Error('No suitable agents available');
      }

      // Send message to all target agents
      const responses = await Promise.allSettled(
        targetAgents.map(agent => this.sendToAgent(agent, message))
      );

      // Process responses
      const successfulResponses: AgentMessage[] = [];
      const failedResponses: Error[] = [];

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResponses.push(result.value);
        } else {
          failedResponses.push(result.reason);
          this.performanceMetrics.errorCount++;
        }
      });

      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.performanceMetrics.responseTimes.push(responseTime);
      if (this.performanceMetrics.responseTimes.length > 100) {
        this.performanceMetrics.responseTimes.shift();
      }

      // Handle partial failures
      if (failedResponses.length > 0 && successfulResponses.length === 0) {
        throw new Error(`All target agents failed: ${failedResponses.map(e => e.message).join(', ')}`);
      }

      return successfulResponses;

    } catch (error) {
      this.performanceMetrics.errorCount++;
      throw error;
    }
  }

  private async selectTargetAgents(
    targetAgentTypes: string[],
    message: AgentMessage
  ): Promise<FederatedAgent[]> {
    const availableAgents = await this.registry.getAvailableAgents();

    // Filter by target types
    let candidates = availableAgents.filter(agent =>
      targetAgentTypes.includes(`${agent.department}-${agent.role}`)
    );

    if (candidates.length === 0) {
      return [];
    }

    // Apply load balancing strategy
    switch (this.config.loadBalancingStrategy) {
      case 'round-robin':
        return this.roundRobinSelection(candidates);

      case 'least-loaded':
        return this.leastLoadedSelection(candidates);

      case 'priority-based':
        return this.priorityBasedSelection(candidates, message);

      default:
        return candidates;
    }
  }

  private roundRobinSelection(agents: FederatedAgent[]): FederatedAgent[] {
    // Simple round-robin - could be enhanced with state tracking
    return [agents[Math.floor(Math.random() * agents.length)]];
  }

  private leastLoadedSelection(agents: FederatedAgent[]): FederatedAgent[] {
    // Select agent with lowest load (could be enhanced with actual load metrics)
    return [agents.reduce((min, agent) =>
      agent.status.load < min.status.load ? agent : min
    )];
  }

  private priorityBasedSelection(
    agents: FederatedAgent[],
    message: AgentMessage
  ): FederatedAgent[] {
    // Prioritize based on message type and agent capabilities
    const prioritized = agents.sort((a, b) => {
      const aScore = this.calculatePriorityScore(a, message);
      const bScore = this.calculatePriorityScore(b, message);
      return bScore - aScore;
    });

    return [prioritized[0]];
  }

  private calculatePriorityScore(agent: FederatedAgent, message: AgentMessage): number {
    let score = 0;

    // Base score from agent status
    score += agent.status.health === 'healthy' ? 10 : 0;
    score += agent.status.load < 0.5 ? 5 : 0;

    // Message type priority
    switch (message.type) {
      case MessageType.EMERGENCY:
        score += 20;
        break;
      case MessageType.PATIENT_QUERY:
        score += 15;
        break;
      case MessageType.ANALYSIS_REQUEST:
        score += 10;
        break;
      default:
        score += 5;
    }

    // Department matching
    if (agent.department === message.targetDepartment) {
      score += 10;
    }

    return score;
  }

  private async sendToAgent(
    agent: FederatedAgent,
    message: AgentMessage
  ): Promise<AgentMessage> {
    const topic = `${agent.department}.${agent.role}`;

    try {
      const response = await this.eventBus.requestResponse(
        topic,
        message,
        this.config.timeoutMs
      );

      return response;
    } catch (error) {
      // Update agent status on failure
      await this.registry.updateAgentStatus(agent.id, {
        ...agent.status,
        health: 'unhealthy',
        lastError: error.message
      });

      throw error;
    }
  }

  private async handleAgentRegistration(message: AgentMessage) {
    // Handle dynamic agent registration
    console.log(`Agent registration request: ${message.senderId}`);
  }

  private async handleHealthUpdate(message: AgentMessage) {
    // Update agent health status
    if (message.data?.status) {
      await this.registry.updateAgentStatus(message.senderId, message.data.status);
    }
  }

  private async handleEmergency(message: AgentMessage) {
    // Emergency handling - could trigger failover, alerts, etc.
    console.error('EMERGENCY:', message);

    // Notify all admin agents
    const adminAgents = await this.registry.getAgentsByRole(AgentRole.ADMIN);
    adminAgents.forEach(agent => {
      this.eventBus.publish(`${agent.department}.${agent.role}`, {
        ...message,
        type: MessageType.EMERGENCY,
        priority: 'high'
      });
    });
  }

  private async handleCircuitBreaker(data: any) {
    console.error('Circuit breaker triggered:', data);

    // Implement circuit breaker logic
    // Could disable certain agents or routes temporarily
  }

  private startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck() {
    const agents = await this.registry.getAllAgents();

    for (const agent of agents) {
      try {
        // Send health check message
        await this.eventBus.requestResponse(
          `${agent.department}.${agent.role}`,
          {
            id: `health-check-${Date.now()}`,
            type: MessageType.HEALTH_CHECK,
            senderId: 'orchestrator',
            senderRole: AgentRole.ADMIN,
            senderDepartment: 'system',
            timestamp: Date.now(),
            data: { healthCheck: true }
          },
          5000
        );
      } catch (error) {
        // Mark agent as unhealthy
        await this.registry.updateAgentStatus(agent.id, {
          ...agent.status,
          health: 'unhealthy',
          lastError: error.message
        });
      }
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const agents = await this.registry.getAllAgents();
    const agentStatuses = new Map<string, AgentStatus>();

    agents.forEach(agent => {
      agentStatuses.set(agent.id, agent.status);
    });

    const healthyAgents = agents.filter(a => a.status.health === 'healthy').length;
    const totalAgents = agents.length;

    let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyAgents === totalAgents) {
      overallHealth = 'healthy';
    } else if (healthyAgents > totalAgents * 0.7) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'unhealthy';
    }

    const avgResponseTime = this.performanceMetrics.responseTimes.length > 0
      ? this.performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTimes.length
      : 0;

    const throughput = this.performanceMetrics.requestCount;
    const errorRate = this.performanceMetrics.requestCount > 0
      ? this.performanceMetrics.errorCount / this.performanceMetrics.requestCount
      : 0;

    return {
      overall: overallHealth,
      agents: agentStatuses,
      eventBus: this.eventBus.getHealthMetrics(),
      governance: this.governance.generateComplianceReport(),
      performance: {
        avgResponseTime,
        throughput,
        errorRate
      }
    };
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Gracefully shutdown all agents
    const agents = await this.registry.getAllAgents();
    await Promise.allSettled(
      agents.map(agent => agent.shutdown())
    );

    console.log('Federated orchestrator shutdown complete');
  }
}

// Singleton instance
export const orchestrator = new FederatedOrchestrator();