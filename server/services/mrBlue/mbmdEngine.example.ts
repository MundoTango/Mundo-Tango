/**
 * MB.MD Protocol Engine - Usage Examples
 * 
 * This file demonstrates how to use the MB.MD Engine for task decomposition
 */

import { mbmdEngine } from './mbmdEngine';

/**
 * Example 1: Simple task decomposition
 */
async function example1_SimpleDecomposition() {
  console.log('\n=== Example 1: Simple Task Decomposition ===\n');

  // Initialize engine (loads mb.md and patterns.md)
  await mbmdEngine.initialize();

  // Decompose a task
  const task = await mbmdEngine.decomposeTask(
    'Create a user authentication system with login, registration, and password reset'
  );

  console.log('Main Task:', task.mainTask);
  console.log('Complexity:', task.metadata.taskComplexity);
  console.log('Subtasks:', task.subtasks.length);
  console.log('Parallel Tracks:', task.parallelTracks.length);
  console.log('Estimated Time:', task.estimatedTime, 'minutes');
  
  // Print subtasks
  console.log('\nSubtasks:');
  task.subtasks.forEach((subtask, i) => {
    console.log(`${i + 1}. [${subtask.type}] ${subtask.description} (${subtask.estimatedMinutes}min)`);
    if (subtask.dependencies.length > 0) {
      console.log(`   Dependencies: ${subtask.dependencies.join(', ')}`);
    }
  });

  // Print matched patterns
  if (task.patterns.length > 0) {
    console.log('\nMatched Patterns:');
    task.patterns.forEach(pattern => {
      console.log(`- ${pattern.name} (${pattern.timeSavings})`);
    });
  }
}

/**
 * Example 2: Quality validation
 */
async function example2_QualityValidation() {
  console.log('\n=== Example 2: Quality Validation ===\n');

  await mbmdEngine.initialize();

  const task = await mbmdEngine.decomposeTask(
    'Build a dashboard with analytics charts, user stats, and real-time updates'
  );

  // Validate against quality gates
  const qualityReport = mbmdEngine.validateTaskAgainstQualityGates(task);

  console.log('Quality Report:');
  console.log('- Passed:', qualityReport.passed);
  console.log('- Score:', qualityReport.score.toFixed(1), '%');
  
  console.log('\nChecks:');
  qualityReport.checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.message}`);
    if (check.suggestion) {
      console.log(`   💡 ${check.suggestion}`);
    }
  });

  if (qualityReport.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    qualityReport.warnings.forEach(w => console.log(`- ${w}`));
  }

  if (qualityReport.blockers.length > 0) {
    console.log('\n🚫 Blockers:');
    qualityReport.blockers.forEach(b => console.log(`- ${b}`));
  }
}

/**
 * Example 3: Execution plan generation
 */
async function example3_ExecutionPlan() {
  console.log('\n=== Example 3: Execution Plan ===\n');

  await mbmdEngine.initialize();

  const task = await mbmdEngine.decomposeTask(
    'Implement GDPR compliance with data export, deletion, and consent tracking'
  );

  // Generate execution plan
  const plan = mbmdEngine.generateExecutionPlan(task);

  console.log('Execution Plan:');
  console.log('- Total Phases:', plan.phases.length);
  console.log('- Total Time:', plan.totalEstimatedTime, 'minutes');
  console.log('- Parallelization Factor:', plan.parallelizationFactor.toFixed(2) + 'x');
  console.log('- Critical Path Length:', plan.criticalPath.length, 'tasks');

  console.log('\nPhases:');
  plan.phases.forEach(phase => {
    console.log(`\n📋 ${phase.description}`);
    console.log(`   Time: ${phase.estimatedTime}min | Parallel: ${phase.canRunInParallel ? 'Yes' : 'No'}`);
    console.log('   Tasks:');
    phase.tasks.forEach(task => {
      console.log(`   - ${task.description}`);
    });
  });

  console.log('\n🎯 Critical Path:');
  plan.criticalPath.forEach((taskId, i) => {
    const task = task.subtasks.find(t => t.id === taskId);
    console.log(`${i + 1}. ${task?.description || taskId}`);
  });

  console.log('\n✓ Validation Checkpoints:');
  plan.validationCheckpoints.forEach(cp => console.log(`- ${cp}`));
}

/**
 * Example 4: Inspect loaded protocol and patterns
 */
async function example4_InspectProtocol() {
  console.log('\n=== Example 4: Inspect Protocol ===\n');

  await mbmdEngine.initialize();

  const protocol = mbmdEngine.getProtocol();
  const patterns = mbmdEngine.getPatterns();

  if (protocol) {
    console.log('MB.MD Protocol v' + protocol.version);
    console.log('\nThree Pillars:');
    console.log('1. SIMULTANEOUSLY:', protocol.threePillars.simultaneously.substring(0, 80) + '...');
    console.log('2. RECURSIVELY:', protocol.threePillars.recursively.substring(0, 80) + '...');
    console.log('3. CRITICALLY:', protocol.threePillars.critically.substring(0, 80) + '...');

    console.log('\nPerformance Metrics:');
    console.log(`- Time per wave: ${protocol.performanceMetrics.timePerWave} minutes`);
    console.log(`- Cost per wave: $${protocol.performanceMetrics.costPerWave}`);

    console.log('\nQuality Gates:', protocol.qualityGates.length);
    protocol.qualityGates.slice(0, 3).forEach(gate => {
      console.log(`- ${gate}`);
    });
  }

  console.log('\nLoaded Patterns:', patterns.length);
  patterns.slice(0, 5).forEach(pattern => {
    console.log(`- ${pattern.name}: ${pattern.timeSavings}`);
  });
}

/**
 * Example 5: Real-world usage in API route
 */
async function example5_APIIntegration() {
  console.log('\n=== Example 5: API Integration ===\n');

  // Simulating an API route handler
  async function handleTaskDecomposition(userRequest: string) {
    try {
      // Ensure engine is initialized
      if (!mbmdEngine.isInitialized()) {
        await mbmdEngine.initialize();
      }

      // Decompose task
      const decomposition = await mbmdEngine.decomposeTask(userRequest);

      // Validate quality
      const quality = mbmdEngine.validateTaskAgainstQualityGates(decomposition);

      // Generate execution plan
      const plan = mbmdEngine.generateExecutionPlan(decomposition);

      // Return comprehensive response
      return {
        success: true,
        task: {
          description: decomposition.mainTask,
          complexity: decomposition.metadata.taskComplexity,
          estimatedTime: decomposition.estimatedTime,
          subtaskCount: decomposition.subtasks.length,
          parallelTracks: decomposition.parallelTracks.length
        },
        quality: {
          passed: quality.passed,
          score: quality.score,
          warnings: quality.warnings,
          suggestions: quality.suggestions
        },
        plan: {
          phases: plan.phases.length,
          totalTime: plan.totalEstimatedTime,
          speedup: plan.parallelizationFactor,
          criticalPathLength: plan.criticalPath.length
        },
        patterns: decomposition.patterns.map(p => ({
          name: p.name,
          timeSavings: p.timeSavings,
          similarity: (p.similarity * 100).toFixed(0) + '%'
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test the API handler
  const result = await handleTaskDecomposition(
    'Build a real-time chat system with WebSocket support, message history, and typing indicators'
  );

  console.log('API Response:');
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await example1_SimpleDecomposition();
    await example2_QualityValidation();
    await example3_ExecutionPlan();
    await example4_InspectProtocol();
    await example5_APIIntegration();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Export for use in tests or other modules
export {
  example1_SimpleDecomposition,
  example2_QualityValidation,
  example3_ExecutionPlan,
  example4_InspectProtocol,
  example5_APIIntegration,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
