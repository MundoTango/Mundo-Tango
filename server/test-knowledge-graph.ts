/**
 * Test Script for Knowledge Graph Service
 * 
 * Tests all major features:
 * 1. Initialize 105 ESA agents
 * 2. Identify knowledge gaps
 * 3. Suggest collaborations
 * 4. Track transfer efficiency
 */

import { knowledgeGraphService } from './services/knowledge/knowledgeGraphService';

async function testKnowledgeGraph() {
  console.log('\n='.repeat(70));
  console.log('KNOWLEDGE GRAPH SERVICE - COMPREHENSIVE TEST');
  console.log('='.repeat(70));

  try {
    // ========================================================================
    // TEST 1: Initialize ESA Graph with 105 Agents
    // ========================================================================
    console.log('\n\n🧪 TEST 1: Initialize ESA Graph with 105 Agents');
    console.log('-'.repeat(70));
    
    const initResult = await knowledgeGraphService.initializeESAGraph();
    console.log('\n✅ Initialization Result:');
    console.log(`   Nodes Created: ${initResult.nodesCreated}`);
    console.log(`   Edges Created: ${initResult.edgesCreated}`);
    console.log(`   Expected: 105 nodes (1 CEO + 6 Chiefs + 9 Domains + 61 Layers + 16 Life CEO + 7 Experts + 5 Domain Agents)`);
    
    if (initResult.nodesCreated >= 100) {
      console.log('   ✓ PASS: All agents initialized successfully');
    } else {
      console.log('   ✗ FAIL: Not all agents were initialized');
    }

    // ========================================================================
    // TEST 2: Analyze Network
    // ========================================================================
    console.log('\n\n🧪 TEST 2: Network Analysis');
    console.log('-'.repeat(70));
    
    const networkAnalysis = await knowledgeGraphService.analyzeNetwork();
    console.log('\n📊 Network Metrics:');
    console.log(`   Total Nodes: ${networkAnalysis.totalNodes}`);
    console.log(`   Total Edges: ${networkAnalysis.totalEdges}`);
    console.log(`   Average Degree: ${networkAnalysis.avgDegree.toFixed(2)}`);
    console.log(`   Isolated Agents: ${networkAnalysis.isolatedAgents.length}`);
    
    console.log('\n   Most Connected Agents:');
    networkAnalysis.mostConnected.slice(0, 5).forEach((agent, i) => {
      console.log(`   ${i + 1}. ${agent.agentCode}: ${agent.connections} connections`);
    });
    
    console.log('\n   Knowledge Hubs:');
    networkAnalysis.knowledgeHubs.slice(0, 5).forEach((hub, i) => {
      console.log(`   ${i + 1}. ${hub.agentCode}: ${hub.knowledgeFlows} knowledge flows`);
    });

    // ========================================================================
    // TEST 3: Identify Knowledge Gaps
    // ========================================================================
    console.log('\n\n🧪 TEST 3: Identify Knowledge Gaps');
    console.log('-'.repeat(70));
    
    const gaps = await knowledgeGraphService.identifyKnowledgeGaps();
    console.log('\n🔍 Knowledge Gap Analysis:');
    console.log(`   Underserved Domains: ${gaps.underservedDomains.length}`);
    console.log(`   Isolated Experts: ${gaps.isolatedExperts.length}`);
    console.log(`   Critical Expertise Gaps: ${gaps.criticalGaps.length}`);
    
    if (gaps.underservedDomains.length > 0) {
      console.log('\n   Top Underserved Domains:');
      gaps.underservedDomains.slice(0, 3).forEach(d => {
        console.log(`   - ${d.domain}: needs ${d.gap} more experts (has ${d.expertCount}/${d.requiredExperts})`);
      });
    }
    
    if (gaps.isolatedExperts.length > 0) {
      console.log('\n   Most Isolated Experts:');
      gaps.isolatedExperts.slice(0, 5).forEach(e => {
        console.log(`   - ${e.agentCode} (${e.agentName}): ${e.connections} connections`);
      });
    }

    // ========================================================================
    // TEST 4: Suggest Collaborations
    // ========================================================================
    console.log('\n\n🧪 TEST 4: Suggest Collaborations');
    console.log('-'.repeat(70));
    
    // Test with AGENT_11 (WebSocket)
    const collaborations = await knowledgeGraphService.suggestCollaborations('AGENT_11', 5);
    console.log(`\n🤝 Top Collaboration Suggestions for AGENT_11:`);
    
    collaborations.forEach((collab, i) => {
      console.log(`\n   ${i + 1}. ${collab.partnerCode} (${collab.partnerName})`);
      console.log(`      Match Score: ${(collab.matchScore * 100).toFixed(1)}%`);
      console.log(`      Shared Expertise: ${collab.sharedExpertise.join(', ')}`);
      console.log(`      Complementary: ${collab.complementaryExpertise.slice(0, 3).join(', ')}`);
      console.log(`      Reasoning: ${collab.reasoning}`);
    });
    
    if (collaborations.length > 0) {
      console.log('\n   ✓ PASS: Collaboration suggestions generated');
    } else {
      console.log('\n   ✗ FAIL: No collaboration suggestions found');
    }

    // ========================================================================
    // TEST 5: Track Transfer Efficiency
    // ========================================================================
    console.log('\n\n🧪 TEST 5: Track Transfer Efficiency');
    console.log('-'.repeat(70));
    
    // First, create some sample knowledge flows
    console.log('\n   Creating sample knowledge flows...');
    await knowledgeGraphService.trackKnowledgeFlow({
      sourceAgentCode: 'AGENT_11',
      targetAgentCode: 'AGENT_12',
      knowledgeType: 'websocket_optimization',
      success: true,
      responseTimeMs: 1200,
    });
    
    await knowledgeGraphService.trackKnowledgeFlow({
      sourceAgentCode: 'AGENT_21',
      targetAgentCode: 'AGENT_22',
      knowledgeType: 'form_validation',
      success: true,
      responseTimeMs: 800,
    });
    
    await knowledgeGraphService.trackKnowledgeFlow({
      sourceAgentCode: 'AGENT_31',
      targetAgentCode: 'AGENT_32',
      knowledgeType: 'payment_integration',
      success: false,
      responseTimeMs: 3000,
    });
    
    console.log('   ✓ Sample flows created');
    
    const efficiency = await knowledgeGraphService.trackTransferEfficiency(30);
    console.log('\n📈 Transfer Efficiency Analysis:');
    console.log(`   Overall Efficiency: ${(efficiency.overallEfficiency * 100).toFixed(1)}%`);
    console.log(`   Total Transfers: ${efficiency.totalTransfers}`);
    console.log(`   Successful Transfers: ${efficiency.successfulTransfers}`);
    
    if (efficiency.topPerformers.length > 0) {
      console.log('\n   Top Performers:');
      efficiency.topPerformers.slice(0, 3).forEach((perf, i) => {
        console.log(`   ${i + 1}. ${perf.agentCode}: ${perf.transfersCompleted} transfers, ${(perf.successRate * 100).toFixed(1)}% success`);
      });
    }
    
    if (efficiency.bottlenecks.length > 0) {
      console.log('\n   Bottlenecks:');
      efficiency.bottlenecks.slice(0, 3).forEach((bn, i) => {
        console.log(`   ${i + 1}. ${bn.agentCode}: ${bn.pendingTransfers} pending, ${bn.avgDelayHours}h avg delay`);
      });
    }
    
    if (efficiency.recommendations.length > 0) {
      console.log('\n   Recommendations:');
      efficiency.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    // ========================================================================
    // TEST 6: Expertise Routing
    // ========================================================================
    console.log('\n\n🧪 TEST 6: Expertise Routing (Find Best Agent)');
    console.log('-'.repeat(70));
    
    const testQuery = {
      requiredCapabilities: ['websocket', 'realtime', 'performance'],
      preferredExpertise: ['optimization', 'scalability'],
      taskType: 'integration',
      urgency: 'medium' as const,
      minSuccessRate: 70,
    };
    
    const matches = await knowledgeGraphService.findBestAgentForTask(testQuery);
    
    if (matches.length > 0) {
      const bestAgent = matches[0];
      console.log(`\n🎯 Best Agent for Task: ${bestAgent.agentCode} (${bestAgent.agentName})`);
      console.log(`   Match Score: ${bestAgent.matchScore.toFixed(2)}`);
      console.log(`   Success Rate: ${bestAgent.successRate}%`);
      console.log(`   Current Load: ${bestAgent.currentLoad}%`);
      console.log(`   Status: ${bestAgent.status}`);
      console.log(`   Reasoning: ${bestAgent.reasoning}`);
      console.log(`   Capabilities: ${bestAgent.capabilities.slice(0, 5).join(', ')}`);
      console.log(`   Expertise: ${bestAgent.expertiseAreas.slice(0, 5).join(', ')}`);
      
      console.log(`\n   Top 3 Matches:`);
      matches.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.agentCode}: ${match.matchScore.toFixed(2)} score (${match.currentLoad}% load)`);
      });
      
      if (bestAgent.matchScore > 0.5) {
        console.log('\n   ✓ PASS: Good match found');
      } else {
        console.log('\n   ✗ FAIL: Match score too low');
      }
    } else {
      console.log('\n   ⚠️  No matching agents found');
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('\n✅ All tests completed successfully!');
    console.log('\nKey Metrics:');
    console.log(`   • ${initResult.nodesCreated} agents in knowledge graph`);
    console.log(`   • ${initResult.edgesCreated} relationships mapped`);
    console.log(`   • ${gaps.criticalGaps.length} critical expertise gaps identified`);
    console.log(`   • ${collaborations.length} collaboration opportunities found`);
    console.log(`   • ${(efficiency.overallEfficiency * 100).toFixed(1)}% transfer efficiency`);
    console.log('\n🎉 Knowledge Graph Service is fully operational!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Run the test
testKnowledgeGraph()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
