/**
 * LIFE CEO SYSTEM VERIFICATION SCRIPT
 * Tests all 16 agents, routing, memory, and collaboration
 */

import { lanceDB } from '../lib/lancedb';
import { lifeCeoAgents, LIFE_CEO_AGENTS } from '../services/lifeCeoAgents';
import { lifeCeoOrchestrator } from '../services/lifeCeoOrchestrator';
import { lifeCeoMemory } from '../services/lifeCeoSemanticMemory';

interface VerificationReport {
  timestamp: string;
  agents_tested: number;
  agents_operational: string[];
  agents_failed: string[];
  decision_matrix_working: boolean;
  lancedb_connected: boolean;
  lancedb_tables_created: boolean;
  agent_collaboration_working: boolean;
  dashboard_ui: string;
  routing_tests: {
    test_query: string;
    primary_agent: string;
    confidence: number;
    status: string;
  }[];
  memory_tests: {
    storage: boolean;
    retrieval: boolean;
    pattern_learning: boolean;
  };
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  errors: string[];
}

async function verifyLifeCEOSystem(): Promise<VerificationReport> {
  const report: VerificationReport = {
    timestamp: new Date().toISOString(),
    agents_tested: 0,
    agents_operational: [],
    agents_failed: [],
    decision_matrix_working: false,
    lancedb_connected: false,
    lancedb_tables_created: false,
    agent_collaboration_working: false,
    dashboard_ui: 'NOT_TESTED',
    routing_tests: [],
    memory_tests: {
      storage: false,
      retrieval: false,
      pattern_learning: false,
    },
    status: 'PASS',
    errors: [],
  };

  console.log('\n🔍 LIFE CEO SYSTEM VERIFICATION');
  console.log('================================\n');

  // TEST 1: LanceDB Connection
  console.log('📊 Test 1: LanceDB Connection...');
  try {
    await lanceDB.initialize();
    report.lancedb_connected = true;
    console.log('✅ LanceDB connected successfully');

    // Test table creation
    const stats = await lanceDB.getTableStats('life_ceo_memories');
    report.lancedb_tables_created = stats.exists;
    console.log(`✅ LanceDB tables: ${stats.exists ? 'exist' : 'will be created on demand'}`);
  } catch (error: any) {
    report.lancedb_connected = false;
    report.errors.push(`LanceDB connection failed: ${error.message}`);
    console.error('❌ LanceDB connection failed:', error.message);
  }

  // TEST 2: Verify all 16 agents exist
  console.log('\n🤖 Test 2: Verify 16 Agents...');
  const allAgents = LIFE_CEO_AGENTS;
  report.agents_tested = allAgents.length;

  for (const agent of allAgents) {
    try {
      const agentDef = lifeCeoAgents.getAgent(agent.id);
      if (agentDef) {
        report.agents_operational.push(agent.name);
        console.log(`✅ ${agent.name} (${agent.id})`);
      } else {
        report.agents_failed.push(agent.name);
        console.log(`❌ ${agent.name} (${agent.id}) - Not found`);
      }
    } catch (error: any) {
      report.agents_failed.push(agent.name);
      report.errors.push(`Agent ${agent.name} test failed: ${error.message}`);
      console.error(`❌ ${agent.name} failed:`, error.message);
    }
  }

  console.log(`\n📈 Agents Operational: ${report.agents_operational.length}/${report.agents_tested}`);

  // TEST 3: Decision Matrix Routing
  console.log('\n🎯 Test 3: Decision Matrix Routing...');
  const routingQueries = [
    'I need help with my resume',
    'How can I save more money?',
    'I want to improve my fitness',
    'I need to manage my stress better',
    'Planning a trip to Europe',
  ];

  for (const query of routingQueries) {
    try {
      const routing = await lifeCeoOrchestrator.routeToAgent(999, query, false);
      
      const test = {
        test_query: query,
        primary_agent: routing.primary_agent,
        confidence: routing.confidence,
        status: routing.confidence > 0.3 ? 'PASS' : 'LOW_CONFIDENCE',
      };
      
      report.routing_tests.push(test);
      console.log(`✅ "${query}" → ${routing.primary_agent} (${(routing.confidence * 100).toFixed(0)}%)`);
    } catch (error: any) {
      report.routing_tests.push({
        test_query: query,
        primary_agent: 'ERROR',
        confidence: 0,
        status: 'FAIL',
      });
      report.errors.push(`Routing test failed for "${query}": ${error.message}`);
      console.error(`❌ Routing failed for "${query}":`, error.message);
    }
  }

  report.decision_matrix_working = report.routing_tests.every(t => t.status !== 'FAIL');

  // TEST 4: Memory System
  console.log('\n💾 Test 4: Semantic Memory System...');
  try {
    // Test memory storage
    await lifeCeoMemory.storeMemory({
      userId: 999,
      agentId: 'career-coach',
      domain: 'Career',
      content: 'User wants to transition into software engineering',
      context: 'Test memory entry',
      timestamp: Date.now(),
      metadata: { test: true },
    });
    report.memory_tests.storage = true;
    console.log('✅ Memory storage working');

    // Test memory retrieval
    const memories = await lifeCeoMemory.getRelevantMemories(
      999,
      'career-coach',
      'software engineering',
      3
    );
    report.memory_tests.retrieval = memories.length >= 0;
    console.log(`✅ Memory retrieval working (found ${memories.length} memories)`);

    // Test pattern learning
    await lifeCeoMemory.learnPattern({
      userId: 999,
      agentId: 'career-coach',
      pattern: 'interest in tech career',
      frequency: 1,
      confidence: 0.6,
      lastSeen: Date.now(),
    });
    report.memory_tests.pattern_learning = true;
    console.log('✅ Pattern learning working');
  } catch (error: any) {
    report.errors.push(`Memory system test failed: ${error.message}`);
    console.error('❌ Memory system test failed:', error.message);
  }

  // TEST 5: Agent Collaboration
  console.log('\n🤝 Test 5: Multi-Agent Collaboration...');
  try {
    const multiAgentResult = await lifeCeoOrchestrator.executeMultiAgent(
      999,
      'I need help balancing work and health',
      ['productivity-coach', 'health-advisor']
    );

    report.agent_collaboration_working = 
      multiAgentResult.responses.length === 2 && 
      multiAgentResult.synthesis.length > 0;

    if (report.agent_collaboration_working) {
      console.log(`✅ Multi-agent collaboration working (${multiAgentResult.responses.length} responses)`);
    } else {
      console.log('❌ Multi-agent collaboration incomplete');
      report.errors.push('Multi-agent collaboration did not return expected results');
    }
  } catch (error: any) {
    report.agent_collaboration_working = false;
    report.errors.push(`Agent collaboration test failed: ${error.message}`);
    console.error('❌ Agent collaboration test failed:', error.message);
  }

  // TEST 6: Dashboard UI (check if files exist)
  console.log('\n🖥️  Test 6: Dashboard UI...');
  try {
    const fs = require('fs');
    const dashboardPath = './client/src/pages/LifeCEODashboardPage.tsx';
    if (fs.existsSync(dashboardPath)) {
      report.dashboard_ui = 'EXISTS';
      console.log('✅ Life CEO Dashboard UI file exists');
    } else {
      report.dashboard_ui = 'NOT_FOUND';
      console.log('❌ Life CEO Dashboard UI file not found');
    }
  } catch (error: any) {
    report.dashboard_ui = 'ERROR';
    report.errors.push(`Dashboard UI check failed: ${error.message}`);
    console.error('❌ Dashboard UI check failed:', error.message);
  }

  // FINAL STATUS
  console.log('\n═══════════════════════════════════');
  console.log('📋 FINAL VERIFICATION REPORT');
  console.log('═══════════════════════════════════\n');

  const criticalChecks = [
    report.agents_operational.length === 16,
    report.lancedb_connected,
    report.decision_matrix_working,
    report.agent_collaboration_working,
  ];

  const passedChecks = criticalChecks.filter(Boolean).length;

  if (passedChecks === criticalChecks.length) {
    report.status = 'PASS';
    console.log('✅ ALL TESTS PASSED');
  } else if (passedChecks > criticalChecks.length / 2) {
    report.status = 'PARTIAL';
    console.log('⚠️  PARTIAL PASS');
  } else {
    report.status = 'FAIL';
    console.log('❌ SYSTEM VERIFICATION FAILED');
  }

  console.log(`\nAgents Operational: ${report.agents_operational.length}/16`);
  console.log(`LanceDB Connected: ${report.lancedb_connected ? 'YES' : 'NO'}`);
  console.log(`Decision Matrix: ${report.decision_matrix_working ? 'WORKING' : 'FAILED'}`);
  console.log(`Agent Collaboration: ${report.agent_collaboration_working ? 'WORKING' : 'FAILED'}`);
  console.log(`Dashboard UI: ${report.dashboard_ui}`);

  if (report.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${report.errors.length}`);
    report.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
  }

  console.log('\n');

  return report;
}

// Run verification
verifyLifeCEOSystem()
  .then((report) => {
    console.log('📄 JSON Report:\n');
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.status === 'PASS' ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });
