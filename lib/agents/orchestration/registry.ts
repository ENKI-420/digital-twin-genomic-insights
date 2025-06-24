import { FederatedAgent } from '../base/federated-agent';
import { AgentStatus, AgentRole } from '../types';

export interface AgentInfo {
  id: string;
  department: string;
  role: AgentRole;
  status: AgentStatus;
  capabilities: string[];
  load: number;
  lastHeartbeat: Date;
  metadata: Record<string, any>;
}

export class AgentRegistry {
  private agents: Map<string, AgentInfo> = new Map();
  private departmentAgents: Map<string, Set<string>> = new Map();
  private roleAgents: Map<string, Set<string>> = new Map();

  async registerAgent(agent: FederatedAgent): Promise<void> {
    const agentInfo: AgentInfo = {
      id: agent.id,
      department: agent.department,
      role: agent.role,
      status: agent.status,
      capabilities: agent.capabilities,
      load: 0,
      lastHeartbeat: new Date(),
      metadata: agent.metadata || {}
    };

    this.agents.set(agent.id, agentInfo);

    // Index by department
    if (!this.departmentAgents.has(agent.department)) {
      this.departmentAgents.set(agent.department, new Set());
    }
    this.departmentAgents.get(agent.department)!.add(agent.id);

    // Index by role
    const roleKey = `${agent.department}-${agent.role}`;
    if (!this.roleAgents.has(roleKey)) {
      this.roleAgents.set(roleKey, new Set());
    }
    this.roleAgents.get(roleKey)!.add(agent.id);

    console.log(`Agent ${agent.id} registered in registry`);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (!agentInfo) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    // Remove from main registry
    this.agents.delete(agentId);

    // Remove from department index
    const departmentSet = this.departmentAgents.get(agentInfo.department);
    if (departmentSet) {
      departmentSet.delete(agentId);
      if (departmentSet.size === 0) {
        this.departmentAgents.delete(agentInfo.department);
      }
    }

    // Remove from role index
    const roleKey = `${agentInfo.department}-${agentInfo.role}`;
    const roleSet = this.roleAgents.get(roleKey);
    if (roleSet) {
      roleSet.delete(agentId);
      if (roleSet.size === 0) {
        this.roleAgents.delete(roleKey);
      }
    }

    console.log(`Agent ${agentId} unregistered from registry`);
  }

  async getAgent(agentId: string): Promise<AgentInfo | null> {
    return this.agents.get(agentId) || null;
  }

  async getAgentsByDepartment(department: string): Promise<AgentInfo[]> {
    const agentIds = this.departmentAgents.get(department);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((agent): agent is AgentInfo => agent !== undefined);
  }

  async getAgentsByRole(department: string, role: AgentRole): Promise<AgentInfo[]> {
    const roleKey = `${department}-${role}`;
    const agentIds = this.roleAgents.get(roleKey);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((agent): agent is AgentInfo => agent !== undefined);
  }

  async getAvailableAgents(): Promise<AgentInfo[]> {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'available');
  }

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (agentInfo) {
      agentInfo.status = status;
      agentInfo.lastHeartbeat = new Date();
    }
  }

  async updateAgentLoad(agentId: string, load: number): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (agentInfo) {
      agentInfo.load = load;
      agentInfo.lastHeartbeat = new Date();
    }
  }

  async heartbeat(agentId: string): Promise<void> {
    const agentInfo = this.agents.get(agentId);
    if (agentInfo) {
      agentInfo.lastHeartbeat = new Date();
    }
  }

  async getRegistryStats(): Promise<{
    totalAgents: number;
    agentsByDepartment: Record<string, number>;
    agentsByRole: Record<string, number>;
    availableAgents: number;
  }> {
    const stats = {
      totalAgents: this.agents.size,
      agentsByDepartment: {} as Record<string, number>,
      agentsByRole: {} as Record<string, number>,
      availableAgents: 0
    };

    // Count by department
    for (const [department, agentIds] of this.departmentAgents) {
      stats.agentsByDepartment[department] = agentIds.size;
    }

    // Count by role
    for (const [roleKey, agentIds] of this.roleAgents) {
      stats.agentsByRole[roleKey] = agentIds.size;
    }

    // Count available agents
    stats.availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'available').length;

    return stats;
  }

  async cleanupStaleAgents(timeoutMs: number = 60000): Promise<string[]> {
    const now = new Date();
    const staleAgents: string[] = [];

    for (const [agentId, agentInfo] of this.agents) {
      const timeSinceHeartbeat = now.getTime() - agentInfo.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > timeoutMs) {
        staleAgents.push(agentId);
      }
    }

    // Remove stale agents
    for (const agentId of staleAgents) {
      await this.unregisterAgent(agentId);
    }

    return staleAgents;
  }
}