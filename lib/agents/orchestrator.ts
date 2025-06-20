// Agent Orchestrator - Main Control System

import { AgentConfig, AgentContext, AgentResult, AgentRole, HotkeyAction, HotkeyMapping } from './types';
import { SynthesizerAgent } from './synthesizer-agent';
import { AssessorAgent } from './assessor-agent';
import { ResynthesizerAgent } from './resynthesizer-agent';
import { ReporterAgent } from './reporter-agent';
import { CollaboratorAgent } from './collaborator-agent';
import { BaseAgent } from './base-agent';
import { agentLogger } from './logger';
import EventEmitter from 'events';

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<AgentRole, BaseAgent> = new Map();
  private hotkeyMappings: Map<HotkeyAction, HotkeyMapping>;
  private currentContext: AgentContext;
  private executionHistory: AgentResult[] = [];

  constructor(projectPath: string) {
    super();
    this.currentContext = {
      projectPath,
      previousResults: [],
    };
    this.initializeAgents();
    this.initializeHotkeyMappings();
  }

  private initializeAgents() {
    // Initialize all agents with default configurations
    const configs: Record<AgentRole, AgentConfig> = {
      synthesizer: {
        role: 'synthesizer',
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 4000,
      },
      assessor: {
        role: 'assessor',
        provider: 'lintcritic',
        temperature: 0.3,
        maxTokens: 2000,
      },
      resynthesizer: {
        role: 'resynthesizer',
        provider: 'claude',
        model: 'claude-3-opus-20240229',
        temperature: 0.5,
        maxTokens: 4000,
      },
      reporter: {
        role: 'reporter',
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.5,
        maxTokens: 3000,
      },
      collaborator: {
        role: 'collaborator',
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.6,
        maxTokens: 2000,
      },
    };

    // Create agent instances
    this.agents.set('synthesizer', new SynthesizerAgent(configs.synthesizer));
    this.agents.set('assessor', new AssessorAgent(configs.assessor));
    this.agents.set('resynthesizer', new ResynthesizerAgent(configs.resynthesizer));
    this.agents.set('reporter', new ReporterAgent(configs.reporter));
    this.agents.set('collaborator', new CollaboratorAgent(configs.collaborator));
  }

  private initializeHotkeyMappings() {
    this.hotkeyMappings = new Map([
      ['S', {
        key: 'S',
        description: 'Generate - Run synthesizer only',
        agents: ['synthesizer'],
        sequential: false,
      }],
      ['R', {
        key: 'R',
        description: 'Full Recursive Loop - synth → assess → resynth → report',
        agents: ['synthesizer', 'assessor', 'resynthesizer', 'reporter'],
        sequential: true,
      }],
      ['C', {
        key: 'C',
        description: 'Full Loop + GitHub Collaboration',
        agents: ['synthesizer', 'assessor', 'resynthesizer', 'reporter', 'collaborator'],
        sequential: true,
      }],
      ['A', {
        key: 'A',
        description: 'Static Analysis Only',
        agents: ['assessor'],
        sequential: false,
      }],
      ['P', {
        key: 'P',
        description: 'Report Generation',
        agents: ['reporter'],
        sequential: false,
      }],
    ]);
  }

  /**
   * Execute agents based on hotkey action
   */
  async executeHotkey(action: HotkeyAction, context?: Partial<AgentContext>): Promise<AgentResult[]> {
    const mapping = this.hotkeyMappings.get(action);
    if (!mapping) {
      throw new Error(`Unknown hotkey action: ${action}`);
    }

    agentLogger.logHotkeyAction(action, mapping.agents);
    this.emit('hotkey:start', { action, mapping });

    // Update context
    if (context) {
      this.currentContext = {
        ...this.currentContext,
        ...context,
      };
    }

    // Execute agents
    const results = mapping.sequential
      ? await this.executeSequential(mapping.agents)
      : await this.executeParallel(mapping.agents);

    // Update execution history
    this.executionHistory.push(...results);

    this.emit('hotkey:complete', { action, results });
    return results;
  }

  /**
   * Execute agents sequentially (output of one feeds into the next)
   */
  private async executeSequential(agentRoles: AgentRole[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    for (const role of agentRoles) {
      const agent = this.agents.get(role);
      if (!agent) {
        agentLogger.log('error', `Agent not found: ${role}`);
        continue;
      }

      // Update context with previous results
      this.currentContext.previousResults = results;

      this.emit('agent:start', { role });

      try {
        const result = await agent.execute(this.currentContext);
        results.push(result);

        this.emit('agent:complete', { role, result });

        // If an agent fails, optionally stop the sequence
        if (!result.success && this.shouldStopOnFailure(role)) {
          agentLogger.log('warn', `Stopping sequence due to ${role} failure`);
          break;
        }
      } catch (error) {
        agentLogger.log('error', `Agent ${role} threw an error`, error);
        const errorResult: AgentResult = {
          role,
          success: false,
          output: 'Agent execution failed with exception',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
          duration: 0,
        };
        results.push(errorResult);

        if (this.shouldStopOnFailure(role)) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Execute agents in parallel (independent execution)
   */
  private async executeParallel(agentRoles: AgentRole[]): Promise<AgentResult[]> {
    const promises = agentRoles.map(async (role) => {
      const agent = this.agents.get(role);
      if (!agent) {
        agentLogger.log('error', `Agent not found: ${role}`);
        return null;
      }

      this.emit('agent:start', { role });

      try {
        const result = await agent.execute(this.currentContext);
        this.emit('agent:complete', { role, result });
        return result;
      } catch (error) {
        agentLogger.log('error', `Agent ${role} threw an error`, error);
        const errorResult: AgentResult = {
          role,
          success: false,
          output: 'Agent execution failed with exception',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
          duration: 0,
        };
        return errorResult;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((r): r is AgentResult => r !== null);
  }

  /**
   * Configure an individual agent
   */
  configureAgent(role: AgentRole, config: Partial<AgentConfig>) {
    const agent = this.agents.get(role);
    if (!agent) {
      throw new Error(`Agent not found: ${role}`);
    }

    // Recreate agent with new config
    const currentConfig = (agent as any).config as AgentConfig;
    const newConfig = { ...currentConfig, ...config };

    switch (role) {
      case 'synthesizer':
        this.agents.set(role, new SynthesizerAgent(newConfig));
        break;
      case 'assessor':
        this.agents.set(role, new AssessorAgent(newConfig));
        break;
      case 'resynthesizer':
        this.agents.set(role, new ResynthesizerAgent(newConfig));
        break;
      case 'reporter':
        this.agents.set(role, new ReporterAgent(newConfig));
        break;
      case 'collaborator':
        this.agents.set(role, new CollaboratorAgent(newConfig));
        break;
    }

    agentLogger.log('info', `Reconfigured ${role} agent`, config);
  }

  /**
   * Update the current execution context
   */
  updateContext(context: Partial<AgentContext>) {
    this.currentContext = {
      ...this.currentContext,
      ...context,
    };
    agentLogger.log('debug', 'Context updated', context);
  }

  /**
   * Get execution history
   */
  getHistory(): AgentResult[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
    this.currentContext.previousResults = [];
    agentLogger.log('info', 'Execution history cleared');
  }

  /**
   * Get available hotkey mappings
   */
  getHotkeyMappings(): Map<HotkeyAction, HotkeyMapping> {
    return new Map(this.hotkeyMappings);
  }

  /**
   * Determine if execution should stop on agent failure
   */
  private shouldStopOnFailure(role: AgentRole): boolean {
    // Critical agents that should stop the pipeline on failure
    const criticalAgents: AgentRole[] = ['synthesizer'];
    return criticalAgents.includes(role);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await agentLogger.flush();
    agentLogger.close();
    this.removeAllListeners();
  }
}

// Export singleton instance for convenience
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(projectPath?: string): AgentOrchestrator {
  if (!orchestratorInstance) {
    if (!projectPath) {
      throw new Error('Project path required for first initialization');
    }
    orchestratorInstance = new AgentOrchestrator(projectPath);
  }
  return orchestratorInstance;
}