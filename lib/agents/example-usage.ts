// Example Usage of the Agent System

import agents, { AgentOrchestrator, AgentContext } from './index';

/**
 * Example 1: Simple code generation
 */
async function example1_simpleGeneration() {
  console.log('Example 1: Simple Code Generation');

  // Generate code for a new React component
  const results = await agents.generate({
    currentFile: 'components/NewFeature.tsx',
    metadata: {
      requirements: 'Create a React component for displaying genomic variant details with 3D visualization',
      codeStyle: 'Use TypeScript, React hooks, and Tailwind CSS',
    }
  });

  console.log('Generated code:', results[0]?.artifacts?.code);
}

/**
 * Example 2: Full recursive loop with analysis and refinement
 */
async function example2_fullLoop() {
  console.log('\nExample 2: Full Recursive Loop');

  const context: Partial<AgentContext> = {
    projectPath: '/path/to/genomics-project',
    currentFile: 'lib/genomics/variant-analyzer.ts',
    metadata: {
      requirements: 'Create a high-performance variant analyzer that processes VCF files',
      existingPatterns: 'Use streaming for large files, implement HIPAA compliance',
    }
  };

  // Execute full loop: synthesize → assess → resynthesize → report
  const results = await agents.fullLoop(context);

  results.forEach(result => {
    console.log(`${result.role}: ${result.success ? '✅' : '❌'} (${result.duration}ms)`);
  });
}

/**
 * Example 3: Analyze existing code
 */
async function example3_analyzeCode() {
  console.log('\nExample 3: Analyze Existing Code');

  // First, set up some code to analyze
  const orchestrator = agents.getOrchestrator();
  orchestrator.updateContext({
    previousResults: [{
      role: 'synthesizer',
      success: true,
      output: 'Generated code',
      artifacts: {
        code: `
          function processGenomicData(vcfData: string) {
            const lines = vcfData.split('\\n');
            for (let i = 0; i < lines.length; i++) {
              // Process without validation
              eval(lines[i]); // Security issue!
            }
          }
        `
      },
      timestamp: new Date(),
      duration: 100
    }]
  });

  // Run analysis only
  const results = await agents.analyze();

  const analysis = results[0]?.artifacts?.analysis;
  if (analysis) {
    console.log('Security issues:', analysis.sast.length);
    console.log('Linting issues:', analysis.linting.length);
    console.log('Code complexity:', analysis.metrics.complexity);
  }
}

/**
 * Example 4: Full collaboration workflow
 */
async function example4_collaboration() {
  console.log('\nExample 4: Full Collaboration Workflow');

  const results = await agents.collaborate({
    projectPath: process.cwd(),
    metadata: {
      requirements: 'Add mutation impact prediction to the genomics platform',
      gitContext: {
        currentBranch: 'feature/mutation-prediction',
        baseBranch: 'main',
      }
    }
  });

  // Get the PR data
  const prData = results.find(r => r.role === 'collaborator')?.artifacts?.pr;
  if (prData) {
    console.log('PR Title:', prData.title);
    console.log('Labels:', prData.labels);
    console.log('Files changed:', prData.files.length);
  }
}

/**
 * Example 5: Using the orchestrator directly with events
 */
async function example5_orchestratorEvents() {
  console.log('\nExample 5: Orchestrator with Events');

  const orchestrator = new AgentOrchestrator(process.cwd());

  // Listen to events
  orchestrator.on('hotkey:start', ({ action, mapping }) => {
    console.log(`Starting hotkey [${action}]: ${mapping.description}`);
  });

  orchestrator.on('agent:start', ({ role }) => {
    console.log(`  → Starting ${role} agent...`);
  });

  orchestrator.on('agent:complete', ({ role, result }) => {
    console.log(`  ✓ ${role} completed in ${result.duration}ms`);
  });

  orchestrator.on('hotkey:complete', ({ action, results }) => {
    console.log(`Hotkey [${action}] complete with ${results.length} results`);
  });

  // Configure specific agent
  orchestrator.configureAgent('synthesizer', {
    provider: 'claude',
    temperature: 0.8,
  });

  // Execute with custom context
  await orchestrator.executeHotkey('R', {
    currentFile: 'lib/ai/genomics-predictor.ts',
    metadata: {
      requirements: 'Implement AI-powered genomics prediction service',
    }
  });

  // Clean up
  await orchestrator.cleanup();
}

/**
 * Example 6: Generate report for existing results
 */
async function example6_reportGeneration() {
  console.log('\nExample 6: Report Generation');

  // Simulate previous results
  const orchestrator = agents.getOrchestrator();
  orchestrator.updateContext({
    previousResults: [
      {
        role: 'synthesizer',
        success: true,
        output: 'Generated 150 lines of code',
        timestamp: new Date(),
        duration: 2000,
      },
      {
        role: 'assessor',
        success: true,
        output: 'Found 3 security issues, 5 linting warnings',
        artifacts: {
          analysis: {
            sast: [
              { severity: 'high', type: 'SQL Injection', file: 'db.ts', line: 45, message: 'Unsanitized input' }
            ],
            dast: [],
            linting: Array(5).fill({ rule: 'no-unused-vars', severity: 'warning', file: 'test.ts', line: 10, column: 5, message: 'Unused variable' }),
            tests: [],
            metrics: { complexity: 15, maintainability: 75, duplications: 2, techDebt: '3 hours' }
          }
        },
        timestamp: new Date(),
        duration: 1500,
      },
      {
        role: 'resynthesizer',
        success: true,
        output: 'Fixed all security issues and improved code quality',
        timestamp: new Date(),
        duration: 1800,
      }
    ]
  });

  // Generate report
  const results = await agents.report();

  console.log('Report generated:', results[0]?.success);
  console.log('Report saved to:', 'agent-reports/report-*.md');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1_simpleGeneration();
    await example2_fullLoop();
    await example3_analyzeCode();
    await example4_collaboration();
    await example5_orchestratorEvents();
    await example6_reportGeneration();

    // Clean up
    await agents.cleanup();
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export examples
export {
  example1_simpleGeneration,
  example2_fullLoop,
  example3_analyzeCode,
  example4_collaboration,
  example5_orchestratorEvents,
  example6_reportGeneration,
  runAllExamples
};

// Run if called directly
if (require.main === module) {
  runAllExamples();
}