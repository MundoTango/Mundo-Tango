/**
 * TEST SCRIPT: Multi-Agent Orchestration Workflows
 * Tests all three workflow types with real agents
 * 
 * Run: tsx server/scripts/test-orchestration-workflows.ts
 */

import axios from 'axios';

// Configuration
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const TEST_USER_ID = 168; // avatars user from logs

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

// ============================================================================
// TEST 1: SEQUENTIAL WORKFLOW
// health-advisor → nutrition-expert → fitness-trainer
// ============================================================================

async function testSequentialWorkflow() {
  log(colors.blue, '\n🧪 TEST 1: Sequential Workflow');
  log(colors.cyan, '   Pipeline: health-advisor → nutrition-expert → fitness-trainer\n');

  try {
    const response = await axios.post(`${API_BASE}/api/orchestration/workflow/execute`, {
      type: 'sequential',
      name: 'Health Assessment Pipeline',
      steps: [
        {
          id: 'step-1-health',
          agentId: 'life-ceo-health-advisor',
          task: 'Analyze user health goals: lose 10 pounds, improve cardiovascular health',
          context: { userId: TEST_USER_ID }
        },
        {
          id: 'step-2-nutrition',
          agentId: 'life-ceo-nutrition-expert',
          task: 'Create personalized nutrition plan based on health analysis',
          context: {}
        },
        {
          id: 'step-3-fitness',
          agentId: 'life-ceo-fitness-trainer',
          task: 'Design workout routine aligned with nutrition plan',
          context: {}
        }
      ],
      timeout: 60000
    });

    if (response.data.success) {
      log(colors.green, '✅ Sequential Workflow: SUCCESS');
      log(colors.cyan, `   Workflow ID: ${response.data.data.workflowId}`);
      log(colors.cyan, `   Duration: ${response.data.data.duration}ms`);
      log(colors.cyan, `   Steps Completed: ${response.data.data.results.length}/3`);
      
      response.data.data.results.forEach((result: any, index: number) => {
        log(colors.yellow, `   Step ${index + 1} (${result.agentId}): ${result.success ? '✓' : '✗'}`);
      });

      return { success: true, workflowId: response.data.data.workflowId };
    } else {
      log(colors.red, '❌ Sequential Workflow: FAILED');
      log(colors.red, `   Error: ${JSON.stringify(response.data.errors)}`);
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ Sequential Workflow: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// TEST 2: PARALLEL WORKFLOW
// Multiple knowledge agents searching different domains simultaneously
// ============================================================================

async function testParallelWorkflow() {
  log(colors.blue, '\n🧪 TEST 2: Parallel Workflow');
  log(colors.cyan, '   Concurrent search across multiple domain experts\n');

  try {
    const response = await axios.post(`${API_BASE}/api/orchestration/workflow/execute`, {
      type: 'parallel',
      name: 'Multi-Domain Knowledge Search',
      steps: [
        {
          id: 'search-health',
          agentId: 'life-ceo-health-advisor',
          task: 'Search health knowledge for diabetes management tips',
          context: {}
        },
        {
          id: 'search-nutrition',
          agentId: 'life-ceo-nutrition-expert',
          task: 'Search nutrition database for low-glycemic recipes',
          context: {}
        },
        {
          id: 'search-fitness',
          agentId: 'life-ceo-fitness-trainer',
          task: 'Find exercises suitable for diabetes patients',
          context: {}
        },
        {
          id: 'search-mental',
          agentId: 'life-ceo-mental-health-counselor',
          task: 'Research stress management techniques for chronic conditions',
          context: {}
        }
      ],
      timeout: 60000
    });

    if (response.data.success) {
      log(colors.green, '✅ Parallel Workflow: SUCCESS');
      log(colors.cyan, `   Workflow ID: ${response.data.data.workflowId}`);
      log(colors.cyan, `   Duration: ${response.data.data.duration}ms`);
      log(colors.cyan, `   Successful: ${response.data.data.results.filter((r: any) => r.success).length}/4`);
      
      response.data.data.results.forEach((result: any) => {
        log(colors.yellow, `   ${result.stepId}: ${result.success ? '✓ Completed' : '✗ Failed'}`);
      });

      return { success: true, workflowId: response.data.data.workflowId };
    } else {
      log(colors.red, '❌ Parallel Workflow: FAILED');
      log(colors.red, `   Error: ${JSON.stringify(response.data.errors)}`);
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ Parallel Workflow: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// TEST 3: INTELLIGENCE CYCLE
// Plan → Execute → Review → Learn (7-step recursive cycle)
// ============================================================================

async function testIntelligenceCycle() {
  log(colors.blue, '\n🧪 TEST 3: Intelligence Cycle Workflow');
  log(colors.cyan, '   Recursive learning: Plan → Execute → Analyze → Collaborate → Build → Test → Report\n');

  try {
    const response = await axios.post(`${API_BASE}/api/orchestration/workflow/execute`, {
      type: 'intelligence-cycle',
      name: 'Platform Quality Improvement Cycle',
      steps: [
        {
          id: 'planner',
          agentId: 'orchestration-task-planner',
          task: 'Plan quality improvements for platform',
          context: {}
        },
        {
          id: 'executor',
          agentId: 'mr-blue-autonomous',
          task: 'Execute improvement tasks',
          context: {}
        },
        {
          id: 'validator',
          agentId: 'orchestration-quality-validator',
          task: 'Validate changes and measure quality',
          context: {}
        },
        {
          id: 'learner',
          agentId: 'orchestration-learning-agent',
          task: 'Learn patterns and update knowledge base',
          context: {}
        }
      ],
      timeout: 300000, // 5 minutes for cycle
      metadata: {
        description: 'Automated quality improvement via intelligence cycle'
      }
    });

    if (response.data.success) {
      log(colors.green, '✅ Intelligence Cycle: SUCCESS');
      log(colors.cyan, `   Cycle ID: ${response.data.data.results[0]?.cycleId || 'N/A'}`);
      log(colors.cyan, `   Duration: ${response.data.data.duration}ms`);
      
      const metrics = response.data.data.results[0]?.metrics;
      if (metrics) {
        log(colors.yellow, `   Total Duration: ${metrics.totalDuration || 'N/A'}ms`);
        log(colors.yellow, `   Avg Step Duration: ${metrics.avgStepDuration || 'N/A'}ms`);
        log(colors.yellow, `   Quality Score: ${metrics.qualityScore || 'N/A'}`);
      }

      return { success: true, workflowId: response.data.data.workflowId };
    } else {
      log(colors.red, '❌ Intelligence Cycle: FAILED');
      log(colors.red, `   Error: ${JSON.stringify(response.data.errors)}`);
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ Intelligence Cycle: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// TEST 4: GET WORKFLOW STATUS
// ============================================================================

async function testGetWorkflowStatus(workflowId: string) {
  log(colors.blue, '\n🧪 TEST 4: Get Workflow Status');
  log(colors.cyan, `   Fetching status for: ${workflowId}\n`);

  try {
    const response = await axios.get(`${API_BASE}/api/orchestration/workflow/${workflowId}`);

    if (response.data.success) {
      log(colors.green, '✅ Get Workflow Status: SUCCESS');
      const workflow = response.data.data;
      log(colors.cyan, `   Type: ${workflow.type}`);
      log(colors.cyan, `   Success: ${workflow.success}`);
      log(colors.cyan, `   Duration: ${workflow.duration}ms`);
      log(colors.cyan, `   Steps: ${workflow.steps.length}`);
      log(colors.cyan, `   Started: ${new Date(workflow.startedAt).toLocaleString()}`);
      
      return { success: true };
    } else {
      log(colors.red, '❌ Get Workflow Status: FAILED');
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ Get Workflow Status: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// TEST 5: LIST WORKFLOWS
// ============================================================================

async function testListWorkflows() {
  log(colors.blue, '\n🧪 TEST 5: List Recent Workflows');
  log(colors.cyan, '   Fetching recent workflow executions\n');

  try {
    const response = await axios.get(`${API_BASE}/api/orchestration/workflows?limit=10`);

    if (response.data.success) {
      log(colors.green, '✅ List Workflows: SUCCESS');
      log(colors.cyan, `   Count: ${response.data.data.workflows.length}`);
      
      response.data.data.workflows.forEach((workflow: any, index: number) => {
        log(colors.yellow, `   ${index + 1}. ${workflow.type} - ${workflow.success ? '✓' : '✗'} - ${workflow.duration}ms`);
      });

      return { success: true };
    } else {
      log(colors.red, '❌ List Workflows: FAILED');
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ List Workflows: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// TEST 6: GET STATISTICS
// ============================================================================

async function testGetStatistics() {
  log(colors.blue, '\n🧪 TEST 6: Get Workflow Statistics');
  log(colors.cyan, '   Fetching overall workflow stats\n');

  try {
    const response = await axios.get(`${API_BASE}/api/orchestration/stats`);

    if (response.data.success) {
      log(colors.green, '✅ Get Statistics: SUCCESS');
      const stats = response.data.data;
      log(colors.cyan, `   Total Workflows: ${stats.total}`);
      log(colors.cyan, `   Successful: ${stats.successful}`);
      log(colors.cyan, `   Failed: ${stats.failed}`);
      log(colors.cyan, `   Avg Duration: ${Math.round(stats.avgDuration)}ms`);
      log(colors.yellow, `   By Type:`);
      log(colors.yellow, `     - Sequential: ${stats.byType.sequential}`);
      log(colors.yellow, `     - Parallel: ${stats.byType.parallel}`);
      log(colors.yellow, `     - Intelligence Cycle: ${stats.byType['intelligence-cycle']}`);

      return { success: true };
    } else {
      log(colors.red, '❌ Get Statistics: FAILED');
      return { success: false };
    }
  } catch (error: any) {
    log(colors.red, '❌ Get Statistics: ERROR');
    log(colors.red, `   ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log(colors.green, '\n' + '='.repeat(80));
  log(colors.green, '  MULTI-AGENT ORCHESTRATION WORKFLOW TESTS');
  log(colors.green, '='.repeat(80));

  const results = {
    sequential: false,
    parallel: false,
    intelligenceCycle: false,
    getStatus: false,
    listWorkflows: false,
    getStats: false
  };

  let sequentialWorkflowId: string | undefined;
  let parallelWorkflowId: string | undefined;

  // Test 1: Sequential Workflow
  const test1 = await testSequentialWorkflow();
  results.sequential = test1.success;
  sequentialWorkflowId = test1.workflowId;

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Parallel Workflow
  const test2 = await testParallelWorkflow();
  results.parallel = test2.success;
  parallelWorkflowId = test2.workflowId;

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Intelligence Cycle (can take longer)
  const test3 = await testIntelligenceCycle();
  results.intelligenceCycle = test3.success;

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Get Workflow Status (use sequential workflow ID)
  if (sequentialWorkflowId) {
    const test4 = await testGetWorkflowStatus(sequentialWorkflowId);
    results.getStatus = test4.success;
  }

  // Test 5: List Workflows
  const test5 = await testListWorkflows();
  results.listWorkflows = test5.success;

  // Test 6: Get Statistics
  const test6 = await testGetStatistics();
  results.getStats = test6.success;

  // Print summary
  log(colors.green, '\n' + '='.repeat(80));
  log(colors.green, '  TEST SUMMARY');
  log(colors.green, '='.repeat(80) + '\n');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;

  Object.entries(results).forEach(([test, passed]) => {
    log(passed ? colors.green : colors.red, `  ${passed ? '✅' : '❌'} ${test}`);
  });

  log(colors.green, '\n' + '='.repeat(80));
  log(colors.cyan, `  TOTAL: ${passedTests}/${totalTests} tests passed`);
  log(colors.green, '='.repeat(80) + '\n');

  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log(colors.red, `\n❌ Fatal error: ${error.message}`);
  process.exit(1);
});
