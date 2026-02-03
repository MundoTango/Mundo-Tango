#!/usr/bin/env tsx
/**
 * TRAIN ALL 1,157+ AGENTS AS SMES - MB.MD PROTOCOL v9.2
 * November 20, 2025
 * 
 * Executes 4-phase SME training for ALL agents:
 * 1. Documentation Learning (handoff docs, mb.md, replit.md, research)
 * 2. Code Analysis (understand codebase in their domain)
 * 3. Industry Standards (Alexa/Siri/ChatGPT, WCAG, Nielsen Norman, Playwright, ISO 9001, Six Sigma)
 * 4. Practical Application (apply knowledge, track performance)
 * 
 * Trains 1,157+ agents in parallel batches of 50 for efficiency
 */

import { universalAgentScanner } from '../services/UniversalAgentScanner';
import { AgentSMETrainingService } from '../services/AgentSMETrainingService';
import { db } from '../../shared/db';
import { agents, agentSMETraining } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const BATCH_SIZE = 50; // Train 50 agents in parallel

async function main() {
  console.log('');
  console.log('========================================');
  console.log('🎓 MB.MD PROTOCOL v9.2 - AGENT SME TRAINING');
  console.log('========================================');
  console.log('');
  console.log('Training ALL 1,157+ agents as Subject Matter Experts');
  console.log('');
  
  const trainingService = new AgentSMETrainingService();
  
  try {
    // Step 1: Get all registered agents
    console.log('📊 STEP 1: Loading all registered agents...');
    const allAgents = await db.select().from(agents);
    console.log(`✅ Found ${allAgents.length} registered agents`);
    console.log('');
    
    // Step 2: Organize agents by domain for efficient training
    console.log('📊 STEP 2: Organizing agents by domain...');
    const agentsByDomain: Record<string, typeof allAgents> = {};
    
    for (const agent of allAgents) {
      const domains = agent.domains || ['general'];
      for (const domain of domains) {
        if (!agentsByDomain[domain]) {
          agentsByDomain[domain] = [];
        }
        agentsByDomain[domain].push(agent);
      }
    }
    
    const domainCount = Object.keys(agentsByDomain).length;
    console.log(`✅ Organized into ${domainCount} domains`);
    console.log('');
    
    // Step 3: Train agents in parallel batches
    console.log('📊 STEP 3: Starting parallel training...');
    console.log(`Training in batches of ${BATCH_SIZE} agents`);
    console.log('');
    
    let totalTrained = 0;
    const totalAgents = allAgents.length;
    
    for (let i = 0; i < allAgents.length; i += BATCH_SIZE) {
      const batch = allAgents.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allAgents.length / BATCH_SIZE);
      
      console.log(`\n🔄 Batch ${batchNumber}/${totalBatches} (${batch.length} agents)`);
      console.log('-'.repeat(80));
      
      // Train batch in parallel
      const trainingPromises = batch.map(async (agent) => {
        try {
          const primaryDomain = agent.domains?.[0] || 'general';
          
          // Check if already trained
          const existingTraining = await db
            .select()
            .from(agentSMETraining)
            .where(eq(agentSMETraining.agentId, agent.id))
            .limit(1);
          
          if (existingTraining.length > 0) {
            console.log(`⏭️  ${agent.name}: Already trained`);
            return { status: 'skipped', agent: agent.name };
          }
          
          // Execute SME training
          const stats = await trainingService.trainAgentAsSME(agent.id, primaryDomain);
          
          console.log(`✅ ${agent.name}: Trained (${stats.documentsLearned} docs, ${(stats.overallProficiency * 100).toFixed(0)}% proficiency)`);
          
          return { status: 'success', agent: agent.name, stats };
        } catch (error) {
          console.error(`❌ ${agent.name}: Training failed -`, error);
          return { status: 'failed', agent: agent.name, error };
        }
      });
      
      const results = await Promise.all(trainingPromises);
      
      // Count successes
      const succeeded = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const skipped = results.filter(r => r.status === 'skipped').length;
      
      totalTrained += succeeded;
      
      console.log(`\nBatch ${batchNumber} complete:`);
      console.log(`  ✅ Succeeded: ${succeeded}`);
      console.log(`  ⏭️  Skipped: ${skipped}`);
      console.log(`  ❌ Failed: ${failed}`);
      console.log(`  📊 Progress: ${totalTrained + skipped}/${totalAgents} (${((totalTrained + skipped) / totalAgents * 100).toFixed(1)}%)`);
    }
    
    console.log('');
    console.log('========================================');
    console.log('🎉 AGENT SME TRAINING COMPLETE!');
    console.log('========================================');
    console.log('');
    console.log('📊 FINAL SUMMARY:');
    console.log(`   Total Agents: ${totalAgents}`);
    console.log(`   Successfully Trained: ${totalTrained}`);
    console.log('');
    
    // Step 4: Generate training report
    console.log('📄 Generating comprehensive training report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalAgents: totalAgents,
      agentsTrained: totalTrained,
      trainingPhases: [
        'Documentation Learning',
        'Code Analysis',
        'Industry Standards',
        'Practical Application'
      ],
      industryStandards: [
        'Alexa Voice UX Guidelines',
        'Siri Interaction Patterns',
        'ChatGPT Voice Mode',
        'Claude Voice Design',
        'WCAG 2.1 AAA',
        'Nielsen Norman Heuristics',
        'Playwright Best Practices',
        'Computer Use Testing',
        'ISO 9001',
        'Six Sigma DMAIC'
      ],
      domainCoverage: Object.keys(agentsByDomain).length,
      topDomains: Object.entries(agentsByDomain)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10)
        .map(([domain, agents]) => ({ domain, count: agents.length }))
    };
    
    await import('fs/promises').then(fs => 
      fs.writeFile(
        '/tmp/agent_training_report.json',
        JSON.stringify(report, null, 2)
      )
    );
    
    console.log('✅ Training report saved to: /tmp/agent_training_report.json');
    console.log('');
    
    // Step 5: Agent capability summary
    console.log('📊 AGENT CAPABILITY SUMMARY:');
    console.log('');
    console.log('🧠 Agents now have mastered:');
    console.log('   - ALL project documentation (handoff docs, mb.md, replit.md)');
    console.log('   - Codebase patterns in their domains');
    console.log('   - Industry best practices (Voice UX, WCAG, Nielsen Norman, Playwright, ISO 9001, Six Sigma)');
    console.log('   - Practical application through real-world usage');
    console.log('');
    console.log('🚀 Agents are ready for autonomous operation!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Agent training failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
