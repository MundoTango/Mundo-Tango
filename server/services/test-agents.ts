/**
 * Test Real AI Agent Implementations
 * Tests orchestration, self-healing, knowledge, and AI arbitrage agents
 */

import { a2aProtocolService } from './A2AProtocolService';
import { agentCardRegistry } from './AgentCardRegistry';
import type { A2AMessage } from '@shared/types/a2a';

async function testAgents() {
  console.log('\n========================================');
  console.log('🧪 Testing Real AI Agent Implementations');
  console.log('========================================\n');

  // Wait for registry initialization
  console.log('⏳ Initializing agent registry...');
  await agentCardRegistry.initialize();
  
  // Wait a moment for agent registration to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const agentCount = agentCardRegistry.getAgentCount();
  console.log(`✅ Registry initialized with ${agentCount} agents\n`);

  const results: Array<{
    agent: string;
    success: boolean;
    response: string;
    duration: number;
  }> = [];

  // Test 1: Orchestration Agent
  console.log('📋 Test 1: Orchestration Agent');
  console.log('--------------------------------');
  try {
    const startTime = Date.now();
    const orchestrationMessage: A2AMessage = {
      jsonrpc: '2.0',
      id: 'test-orchestration-1',
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{
            type: 'text',
            text: 'Create a workflow plan for deploying a new feature: 1) Run tests, 2) Build production bundle, 3) Deploy to staging, 4) Run smoke tests, 5) Deploy to production. Consider parallelization opportunities.'
          }]
        },
        context: {
          feature: 'user-authentication',
          environment: 'production'
        }
      }
    };

    const response = await a2aProtocolService.routeMessage('orchestration-workflow', orchestrationMessage);
    const duration = Date.now() - startTime;
    
    if (response.error) {
      console.log('❌ FAILED:', response.error.message);
      results.push({ agent: 'orchestration-workflow', success: false, response: response.error.message, duration });
    } else {
      const content = response.result?.artifacts[0].parts[0].text || 'No response';
      console.log('✅ SUCCESS');
      console.log('Response:', content.substring(0, 300) + '...');
      console.log(`Duration: ${duration}ms\n`);
      results.push({ agent: 'orchestration-workflow', success: true, response: content, duration });
    }
  } catch (error: any) {
    console.log('❌ ERROR:', error.message, '\n');
    results.push({ agent: 'orchestration-workflow', success: false, response: error.message, duration: 0 });
  }

  // Test 2: Self-Healing Agent
  console.log('🔧 Test 2: Self-Healing Agent');
  console.log('--------------------------------');
  try {
    const startTime = Date.now();
    const healingMessage: A2AMessage = {
      jsonrpc: '2.0',
      id: 'test-healing-1',
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{
            type: 'text',
            text: 'Analyze this system error pattern: Database connection timeouts occurring 5 times in the last hour, affecting 15% of user requests. Average response time increased from 200ms to 1500ms.'
          }]
        },
        context: {
          errorType: 'database-timeout',
          frequency: 5,
          timeWindow: '1 hour',
          impactPercentage: 15
        }
      }
    };

    const response = await a2aProtocolService.routeMessage('self-healing-monitor', healingMessage);
    const duration = Date.now() - startTime;
    
    if (response.error) {
      console.log('❌ FAILED:', response.error.message);
      results.push({ agent: 'self-healing-monitor', success: false, response: response.error.message, duration });
    } else {
      const content = response.result?.artifacts[0].parts[0].text || 'No response';
      console.log('✅ SUCCESS');
      console.log('Response:', content.substring(0, 300) + '...');
      console.log(`Duration: ${duration}ms\n`);
      results.push({ agent: 'self-healing-monitor', success: true, response: content, duration });
    }
  } catch (error: any) {
    console.log('❌ ERROR:', error.message, '\n');
    results.push({ agent: 'self-healing-monitor', success: false, response: error.message, duration: 0 });
  }

  // Test 3: AI Arbitrage Agent
  console.log('🤖 Test 3: AI Arbitrage Agent');
  console.log('--------------------------------');
  try {
    const startTime = Date.now();
    const aiMessage: A2AMessage = {
      jsonrpc: '2.0',
      id: 'test-ai-1',
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{
            type: 'text',
            text: 'I need to generate 1000 product descriptions for an e-commerce site. What AI model should I use? Priority: Cost-effective and fast.'
          }]
        },
        context: {
          taskType: 'bulk-generation',
          volume: 1000,
          priority: 'cost'
        }
      }
    };

    const response = await a2aProtocolService.routeMessage('ai-optimizer', aiMessage);
    const duration = Date.now() - startTime;
    
    if (response.error) {
      console.log('❌ FAILED:', response.error.message);
      results.push({ agent: 'ai-optimizer', success: false, response: response.error.message, duration });
    } else {
      const content = response.result?.artifacts[0].parts[0].text || 'No response';
      console.log('✅ SUCCESS');
      console.log('Response:', content.substring(0, 300) + '...');
      console.log(`Duration: ${duration}ms\n`);
      results.push({ agent: 'ai-optimizer', success: true, response: content, duration });
    }
  } catch (error: any) {
    console.log('❌ ERROR:', error.message, '\n');
    results.push({ agent: 'ai-optimizer', success: false, response: error.message, duration: 0 });
  }

  // Test 4: Knowledge Agent (with LanceDB integration)
  console.log('📚 Test 4: Knowledge Agent (LanceDB RAG)');
  console.log('--------------------------------');
  try {
    const startTime = Date.now();
    const knowledgeMessage: A2AMessage = {
      jsonrpc: '2.0',
      id: 'test-knowledge-1',
      method: 'message/send',
      params: {
        message: {
          role: 'user',
          parts: [{
            type: 'text',
            text: 'What is the Mr. Blue system and how does it work?'
          }]
        },
        context: {
          searchDepth: 'comprehensive'
        }
      }
    };

    const response = await a2aProtocolService.routeMessage('knowledge-retrieval', knowledgeMessage);
    const duration = Date.now() - startTime;
    
    if (response.error) {
      console.log('❌ FAILED:', response.error.message);
      results.push({ agent: 'knowledge-retrieval', success: false, response: response.error.message, duration });
    } else {
      const content = response.result?.artifacts[0].parts[0].text || 'No response';
      console.log('✅ SUCCESS');
      console.log('Response:', content.substring(0, 300) + '...');
      console.log(`Duration: ${duration}ms\n`);
      results.push({ agent: 'knowledge-retrieval', success: true, response: content, duration });
    }
  } catch (error: any) {
    console.log('❌ ERROR:', error.message, '\n');
    results.push({ agent: 'knowledge-retrieval', success: false, response: error.message, duration: 0 });
  }

  // Summary
  console.log('\n========================================');
  console.log('📊 Test Summary');
  console.log('========================================');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalCount;
  
  console.log(`\nTests Passed: ${successCount}/${totalCount}`);
  console.log(`Average Response Time: ${avgDuration.toFixed(0)}ms\n`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.agent}: ${result.duration}ms`);
  });
  
  console.log('\n========================================\n');
  
  if (successCount >= 3) {
    console.log('🎉 SUCCESS: At least 3 agent types are working with real AI!\n');
    return true;
  } else {
    console.log('⚠️  WARNING: Less than 3 agent types working. Check errors above.\n');
    return false;
  }
}

// Run tests
testAgents()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
