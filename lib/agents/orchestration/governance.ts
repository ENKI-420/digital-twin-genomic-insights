import { AgentRole, AgentMessage, MessageType } from '../types';

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: PolicyCondition[];
  priority: number;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface AccessRequest {
  subject: {
    id: string;
    role: AgentRole;
    department: string;
    permissions: string[];
  };
  resource: {
    type: string;
    id: string;
    department: string;
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  action: string;
  context: {
    timestamp: number;
    location?: string;
    device?: string;
    sessionId?: string;
  };
}

export class GovernanceEngine {
  private policies: Map<string, PolicyRule> = new Map();
  private roleHierarchy: Map<AgentRole, AgentRole[]> = new Map();
  private departmentAccess: Map<string, string[]> = new Map();
  private auditLog: AccessRequest[] = [];

  constructor() {
    this.initializeDefaultPolicies();
    this.initializeRoleHierarchy();
  }

  private initializeDefaultPolicies() {
    // PHI access policies
    this.addPolicy({
      id: 'phi-access',
      name: 'PHI Access Control',
      description: 'Controls access to PHI data',
      effect: 'allow',
      priority: 100,
      conditions: [
        { field: 'subject.role', operator: 'in', value: [AgentRole.ADMIN, AgentRole.CLINICIAN, AgentRole.RESEARCHER] },
        { field: 'resource.sensitivity', operator: 'not_in', value: ['restricted'] },
        { field: 'subject.department', operator: 'equals', value: 'resource.department' }
      ]
    });

    // Cross-department collaboration
    this.addPolicy({
      id: 'cross-dept-collaboration',
      name: 'Cross-Department Collaboration',
      description: 'Allows limited cross-department data sharing for patient care',
      effect: 'allow',
      priority: 80,
      conditions: [
        { field: 'subject.role', operator: 'in', value: [AgentRole.CLINICIAN, AgentRole.ADMIN] },
        { field: 'action', operator: 'in', value: ['read', 'analyze'] },
        { field: 'resource.sensitivity', operator: 'not_in', value: ['restricted'] }
      ]
    });

    // Research data access
    this.addPolicy({
      id: 'research-data-access',
      name: 'Research Data Access',
      description: 'Controls research data access with de-identification requirements',
      effect: 'allow',
      priority: 60,
      conditions: [
        { field: 'subject.role', operator: 'equals', value: AgentRole.RESEARCHER },
        { field: 'action', operator: 'in', value: ['read', 'analyze', 'export'] },
        { field: 'resource.sensitivity', operator: 'not_in', value: ['restricted', 'confidential'] }
      ]
    });

    // Administrative access
    this.addPolicy({
      id: 'admin-access',
      name: 'Administrative Access',
      description: 'Full access for administrative functions',
      effect: 'allow',
      priority: 120,
      conditions: [
        { field: 'subject.role', operator: 'equals', value: AgentRole.ADMIN }
      ]
    });
  }

  private initializeRoleHierarchy() {
    this.roleHierarchy.set(AgentRole.ADMIN, [AgentRole.CLINICIAN, AgentRole.RESEARCHER, AgentRole.ANALYST]);
    this.roleHierarchy.set(AgentRole.CLINICIAN, [AgentRole.ANALYST]);
    this.roleHierarchy.set(AgentRole.RESEARCHER, [AgentRole.ANALYST]);
    this.roleHierarchy.set(AgentRole.ANALYST, []);
  }

  addPolicy(policy: PolicyRule): void {
    this.policies.set(policy.id, policy);
  }

  removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  async evaluateAccess(request: AccessRequest): Promise<{ allowed: boolean; reason: string; policies: string[] }> {
    const applicablePolicies = this.getApplicablePolicies(request);
    const decisions = await Promise.all(
      applicablePolicies.map(policy => this.evaluatePolicy(policy, request))
    );

    // Sort by priority (highest first)
    decisions.sort((a, b) => b.policy.priority - a.policy.priority);

    // Find the first applicable decision
    const decision = decisions.find(d => d.applicable);

    if (!decision) {
      this.auditLog.push(request);
      return {
        allowed: false,
        reason: 'No applicable policies found',
        policies: []
      };
    }

    const allowed = decision.policy.effect === 'allow';
    this.auditLog.push(request);

    return {
      allowed,
      reason: decision.reason,
      policies: [decision.policy.id]
    };
  }

  private getApplicablePolicies(request: AccessRequest): PolicyRule[] {
    return Array.from(this.policies.values()).filter(policy => {
      return policy.conditions.some(condition => {
        const fieldValue = this.getFieldValue(request, condition.field);
        return this.evaluateCondition(fieldValue, condition);
      });
    });
  }

  private async evaluatePolicy(policy: PolicyRule, request: AccessRequest): Promise<{
    policy: PolicyRule;
    applicable: boolean;
    reason: string;
  }> {
    const applicableConditions = policy.conditions.filter(condition => {
      const fieldValue = this.getFieldValue(request, condition.field);
      return this.evaluateCondition(fieldValue, condition);
    });

    const applicable = applicableConditions.length === policy.conditions.length;

    return {
      policy,
      applicable,
      reason: applicable ? 'All conditions met' : 'Some conditions not met'
    };
  }

  private getFieldValue(request: AccessRequest, field: string): any {
    const parts = field.split('.');
    let value: any = request;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private evaluateCondition(fieldValue: any, condition: PolicyCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'regex':
        return new RegExp(condition.value).test(String(fieldValue));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  // Message routing based on governance
  async routeMessage(message: AgentMessage): Promise<{
    allowed: boolean;
    reason: string;
    targetAgents: string[];
  }> {
    const request: AccessRequest = {
      subject: {
        id: message.senderId,
        role: message.senderRole,
        department: message.senderDepartment,
        permissions: message.permissions || []
      },
      resource: {
        type: 'message',
        id: message.id,
        department: message.targetDepartment || message.senderDepartment,
        sensitivity: message.sensitivity || 'internal'
      },
      action: message.type,
      context: {
        timestamp: Date.now(),
        sessionId: message.sessionId
      }
    };

    const accessResult = await this.evaluateAccess(request);

    if (!accessResult.allowed) {
      return {
        allowed: false,
        reason: accessResult.reason,
        targetAgents: []
      };
    }

    // Determine target agents based on message type and governance
    const targetAgents = this.determineTargetAgents(message);

    return {
      allowed: true,
      reason: 'Access granted',
      targetAgents
    };
  }

  private determineTargetAgents(message: AgentMessage): string[] {
    const targets: string[] = [];

    switch (message.type) {
      case MessageType.PATIENT_QUERY:
        // Route to relevant department agents
        if (message.targetDepartment) {
          targets.push(`${message.targetDepartment}-agent`);
        }
        break;
      case MessageType.ANALYSIS_REQUEST:
        // Route to analysis-capable agents
        targets.push('genomics-agent', 'radiology-agent', 'oncology-agent');
        break;
      case MessageType.RESEARCH_QUERY:
        // Route to research agents
        targets.push('research-agent');
        break;
      case MessageType.ADMIN_COMMAND:
        // Route to admin agents
        targets.push('admin-agent');
        break;
      default:
        // Broadcast to all agents in the same department
        if (message.targetDepartment) {
          targets.push(`${message.targetDepartment}-agent`);
        }
    }

    return targets;
  }

  // Audit and compliance
  getAuditLog(filters?: {
    startDate?: Date;
    endDate?: Date;
    subjectId?: string;
    resourceType?: string;
    action?: string;
  }): AccessRequest[] {
    let filtered = this.auditLog;

    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(log => log.context.timestamp >= filters.startDate!.getTime());
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.context.timestamp <= filters.endDate!.getTime());
      }
      if (filters.subjectId) {
        filtered = filtered.filter(log => log.subject.id === filters.subjectId);
      }
      if (filters.resourceType) {
        filtered = filtered.filter(log => log.resource.type === filters.resourceType);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
    }

    return filtered;
  }

  // Compliance reporting
  generateComplianceReport(): {
    totalRequests: number;
    allowedRequests: number;
    deniedRequests: number;
    policyViolations: { policyId: string; count: number }[];
    departmentAccess: { department: string; accessCount: number }[];
  } {
    const totalRequests = this.auditLog.length;
    const allowedRequests = this.auditLog.filter(log =>
      this.getApplicablePolicies(log).some(p => p.effect === 'allow')
    ).length;
    const deniedRequests = totalRequests - allowedRequests;

    const policyViolations = Array.from(this.policies.values()).map(policy => ({
      policyId: policy.id,
      count: this.auditLog.filter(log =>
        this.getApplicablePolicies(log).some(p => p.id === policy.id && p.effect === 'deny')
      ).length
    }));

    const departmentAccess = Array.from(
      this.auditLog.reduce((acc, log) => {
        const dept = log.resource.department;
        acc.set(dept, (acc.get(dept) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([department, accessCount]) => ({ department, accessCount }));

    return {
      totalRequests,
      allowedRequests,
      deniedRequests,
      policyViolations,
      departmentAccess
    };
  }
}

// Singleton instance
export const governanceEngine = new GovernanceEngine();