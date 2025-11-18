/**
 * Train All Critical Agents as SMEs
 * MB.MD v9.0 Protocol - November 18, 2025
 * 
 * This script trains all critical agents to become Subject Matter Experts
 * by learning ALL documentation, code, and industry standards BEFORE implementation.
 * 
 * Usage: tsx server/scripts/trainAgentsSME.ts
 */

import { AgentSMETrainingService } from '../services/agent-sme/AgentSMETrainingService';

async function main() {
  console.log('\n🎓 MB.MD v9.0 AGENT SME TRAINING PROGRAM');
  console.log('=' .repeat(80));
  console.log('Training all critical agents to become Subject Matter Experts');
  console.log('=' .repeat(80) + '\n');
  
  const trainingService = new AgentSMETrainingService();
  
  try {
    await trainingService.trainAllCriticalAgents();
    
    console.log('\n✅ SUCCESS: All critical agents are now SMEs!');
    console.log('They are ready to implement features with full domain expertise.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TRAINING FAILED:', error);
    process.exit(1);
  }
}

main();
