// Agent System - Main Entry Point

export * from './types';
export * from './base-agent';
export * from './synthesizer-agent';
export * from './assessor-agent';
export * from './resynthesizer-agent';
export * from './reporter-agent';
export * from './collaborator-agent';
export * from './orchestrator';
export * from './model-interface';
export * from './logger';

// Re-export convenient functions
export { getOrchestrator } from './orchestrator';
export { agentLogger } from './logger';

// Export a simple API for common use cases
import { getOrchestrator, AgentOrchestrator } from './orchestrator';
import { HotkeyAction, AgentContext, AgentResult } from './types';

/**
 * Execute a hotkey action with optional context
 */
export async function executeHotkey(
  action: HotkeyAction,
  context?: Partial<AgentContext>
): Promise<AgentResult[]> {
  const orchestrator = getOrchestrator(context?.projectPath || process.cwd());
  return orchestrator.executeHotkey(action, context);
}

/**
 * Quick helper functions for each hotkey
 */
export const agents = {
  /**
   * [S] Generate - Initial code synthesis
   */
  generate: async (context?: Partial<AgentContext>) => executeHotkey('S', context),

  /**
   * [R] Full Recursive Loop - synth → assess → resynth → report
   */
  fullLoop: async (context?: Partial<AgentContext>) => executeHotkey('R', context),

  /**
   * [C] Full Loop + GitHub Collaboration
   */
  collaborate: async (context?: Partial<AgentContext>) => executeHotkey('C', context),

  /**
   * [A] Static Analysis Only
   */
  analyze: async (context?: Partial<AgentContext>) => executeHotkey('A', context),

  /**
   * [P] Report Generation
   */
  report: async (context?: Partial<AgentContext>) => executeHotkey('P', context),

  /**
   * Get or create orchestrator instance
   */
  getOrchestrator: (projectPath?: string) => getOrchestrator(projectPath),

  /**
   * Clean up resources
   */
  cleanup: async () => {
    const orchestrator = getOrchestrator();
    await orchestrator.cleanup();
  },
};

// Default export for convenience
export default agents;