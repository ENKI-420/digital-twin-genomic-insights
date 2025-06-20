import { orchestrator } from './orchestration/orchestrator';
import { RadiologyAgent } from './department/radiology-agent';
import { GenomicsAgent } from './department/genomics-agent';
import { OncologyAgent } from './department/oncology-agent';
import { ResearchAgent } from './department/research-agent';
import { AdminAgent } from './department/admin-agent';

export class AgentSystemInitializer {
  private agents: Map<string, any> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Agent system already initialized');
      return;
    }

    console.log('🚀 Initializing Federated Agent System...');

    try {
      // Initialize department agents
      await this.initializeDepartmentAgents();

      // Register all agents with orchestrator
      await this.registerAgents();

      // Start health monitoring
      await this.startHealthMonitoring();

      // Perform initial health check
      await this.performInitialHealthCheck();

      this.isInitialized = true;
      console.log('✅ Federated Agent System initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize agent system:', error);
      throw error;
    }
  }

  private async initializeDepartmentAgents(): Promise<void> {
    console.log('📋 Initializing department agents...');

    // Create department agents
    const radiologyAgent = new RadiologyAgent();
    const genomicsAgent = new GenomicsAgent();
    const oncologyAgent = new OncologyAgent();
    const researchAgent = new ResearchAgent();
    const adminAgent = new AdminAgent();

    // Store agents
    this.agents.set('radiology', radiologyAgent);
    this.agents.set('genomics', genomicsAgent);
    this.agents.set('oncology', oncologyAgent);
    this.agents.set('research', researchAgent);
    this.agents.set('admin', adminAgent);

    // Initialize each agent
    const initPromises = Array.from(this.agents.entries()).map(async ([name, agent]) => {
      try {
        await agent.initialize();
        console.log(`✅ ${name} agent initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${name} agent:`, error);
        throw error;
      }
    });

    await Promise.all(initPromises);
  }

  private async registerAgents(): Promise<void> {
    console.log('📝 Registering agents with orchestrator...');

    const registerPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await orchestrator.registerAgent(agent);
        console.log(`✅ Registered agent: ${agent.id}`);
      } catch (error) {
        console.error(`❌ Failed to register agent ${agent.id}:`, error);
        throw error;
      }
    });

    await Promise.all(registerPromises);
  }

  private async startHealthMonitoring(): Promise<void> {
    console.log('🏥 Starting health monitoring...');

    // Health monitoring is already started in the orchestrator
    // This is just for additional system-wide monitoring
    setInterval(async () => {
      try {
        const health = await orchestrator.getSystemHealth();
        this.logHealthStatus(health);
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 60000); // Check every minute
  }

  private async performInitialHealthCheck(): Promise<void> {
    console.log('🔍 Performing initial health check...');

    try {
      const health = await orchestrator.getSystemHealth();

      if (health.overall === 'healthy') {
        console.log('✅ All agents are healthy');
      } else {
        console.warn(`⚠️ System health is ${health.overall}`);

        // Log unhealthy agents
        const unhealthyAgents = Array.from(health.agents.entries())
          .filter(([_, status]) => status.health !== 'healthy');

        if (unhealthyAgents.length > 0) {
          console.warn('Unhealthy agents:', unhealthyAgents.map(([id, status]) => `${id}: ${status.health}`));
        }
      }
    } catch (error) {
      console.error('Initial health check failed:', error);
    }
  }

  private logHealthStatus(health: any): void {
    const healthyCount = Array.from(health.agents.values())
      .filter((status: any) => status.health === 'healthy').length;
    const totalCount = health.agents.size;

    console.log(`🏥 Health Status: ${healthyCount}/${totalCount} agents healthy (${health.overall})`);
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Federated Agent System...');

    try {
      // Shutdown orchestrator
      await orchestrator.shutdown();

      // Shutdown individual agents
      const shutdownPromises = Array.from(this.agents.values()).map(async (agent) => {
        try {
          await agent.shutdown();
          console.log(`✅ Shutdown agent: ${agent.id}`);
        } catch (error) {
          console.error(`❌ Failed to shutdown agent ${agent.id}:`, error);
        }
      });

      await Promise.allSettled(shutdownPromises);

      this.agents.clear();
      this.isInitialized = false;

      console.log('✅ Federated Agent System shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  getAgent(agentName: string): any {
    return this.agents.get(agentName);
  }

  getAllAgents(): Map<string, any> {
    return new Map(this.agents);
  }

  isSystemInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const agentInitializer = new AgentSystemInitializer();

// Auto-initialize on module load (for development)
if (process.env.NODE_ENV === 'development') {
  // Don't auto-initialize in production - let the application control it
  console.log('Development mode detected - agent system will be initialized on first use');
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await agentInitializer.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await agentInitializer.shutdown();
  process.exit(0);
});