/**
 * Bulk Train All Agents as SMEs
 * MB.MD v9.0 Protocol - November 18, 2025
 * 
 * Trains all agents in parallel batches to become Subject Matter Experts
 * 
 * Usage: tsx server/scripts/bulkTrainAgentsSME.ts
 */

import { AgentSMETrainingService } from '../services/agent-sme/AgentSMETrainingService';
import { db } from '../../shared/db';
import { agents } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Domain mapping for agents
const AGENT_DOMAIN_MAP: Record<string, string> = {
  // Page Agents
  'PAGE_VISUAL_EDITOR': 'visual_editor',
  'PAGE_HOME': 'feed',
  'PAGE_PROFILE': 'profile',
  'PAGE_EVENTS': 'events',
  'PAGE_GROUPS': 'groups',
  'PAGE_MARKETPLACE': 'marketplace',
  'PAGE_MESSAGES': 'messaging',
  'PAGE_SETTINGS': 'settings',
  'PAGE_ADMIN_DASHBOARD': 'admin',
  'PAGE_LANDING': 'landing',

  // Feature Agents - Mr. Blue
  'FEATURE_MR_BLUE_CORE': 'mr_blue',
  'FEATURE_VOICE_CHAT': 'voice_interface',
  'FEATURE_TEXT_CHAT': 'messaging',
  'FEATURE_VIBE_CODING': 'code_generation',
  'FEATURE_VISUAL_PREVIEW': 'visual_editor',
  'FEATURE_CONTEXT_SERVICE': 'rag',
  'FEATURE_INTENT_DETECTION': 'intent_detection',
  'FEATURE_ERROR_ANALYSIS': 'error_analysis',
  'FEATURE_AUTONOMOUS_MODE': 'autonomous',
  'FEATURE_MEMORY_DASHBOARD': 'memory',

  // Feature Agents - Visual Editor
  'FEATURE_ELEMENT_SELECTION': 'visual_editor',
  'FEATURE_CHANGE_TIMELINE': 'visual_editor',
  'FEATURE_CODE_PREVIEW': 'code_editor',
  'FEATURE_VISUAL_DIFF': 'visual_editor',
  'FEATURE_GIT_INTEGRATION': 'git',
  'FEATURE_SCREENSHOT_CAPTURE': 'screenshots',
  'FEATURE_SMART_SUGGESTIONS': 'ai_suggestions',
  'FEATURE_VOICE_COMMANDS': 'voice_commands',
  'FEATURE_DRAG_DROP': 'drag_drop',
  'FEATURE_COMPONENT_PALETTE': 'component_library',

  // Feature Agents - AI Integration
  'FEATURE_OPENAI_REALTIME': 'voice_interface',
  'FEATURE_GROQ_INTEGRATION': 'groq',
  'FEATURE_BIFROST_GATEWAY': 'ai_gateway',
  'FEATURE_LANCEDB_VECTOR': 'vector_database',
  'FEATURE_AI_ARBITRAGE': 'cost_optimization',
  'FEATURE_SEMANTIC_CACHE': 'caching',
  'FEATURE_VOICE_CLONING': 'voice_cloning',
  'FEATURE_TTS': 'text_to_speech',

  // Feature Agents - Platform
  'FEATURE_WEBSOCKET_REALTIME': 'websocket',
  'FEATURE_FILE_UPLOAD': 'file_upload',
  'FEATURE_NOTIFICATIONS': 'notifications',
  'FEATURE_ANALYTICS': 'analytics',
  'FEATURE_SEARCH': 'search',
  'FEATURE_I18N': 'internationalization',
  'FEATURE_THEME': 'theming',
};

async function trainInBatch(agentIds: string[], batchSize: number = 5) {
  const trainingService = new AgentSMETrainingService();
  const results = {
    trained: 0,
    failed: 0,
    errors: [] as Array<{ agentId: string; error: string }>
  };

  // Process in batches
  for (let i = 0; i < agentIds.length; i += batchSize) {
    const batch = agentIds.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(agentIds.length / batchSize)}`);
    console.log(`Agents: ${batch.join(', ')}\n`);

    await Promise.all(
      batch.map(async (agentId) => {
        try {
          const domain = AGENT_DOMAIN_MAP[agentId] || 'general';
          console.log(`🎓 Training ${agentId} in domain: ${domain}...`);
          await trainingService.trainAgentAsSME(agentId, domain);
          console.log(`✅ ${agentId} trained successfully`);
          results.trained++;
        } catch (error: any) {
          console.error(`❌ Failed to train ${agentId}:`, error.message);
          results.failed++;
          results.errors.push({ agentId, error: error.message });
        }
      })
    );
  }

  return results;
}

async function main() {
  console.log('\n🎓 BULK SME TRAINING - ALL AGENTS');
  console.log('=' .repeat(80));
  console.log('Training agents to become Subject Matter Experts');
  console.log('Processing in parallel batches of 5');
  console.log('=' .repeat(80) + '\n');

  try {
    // Get all active agents that need training
    const allAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.status, 'active'));

    const agentIds = allAgents.map(a => a.id);
    console.log(`Found ${agentIds.length} active agents to train\n`);

    // Train in batches
    const results = await trainInBatch(agentIds, 5);

    console.log('\n' + '='.repeat(80));
    console.log('✅ BULK SME TRAINING COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📊 RESULTS:`);
    console.log(`- Successfully trained: ${results.trained}`);
    console.log(`- Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ ERRORS:`);
      results.errors.forEach(({ agentId, error }) => {
        console.log(`  - ${agentId}: ${error}`);
      });
    }

    console.log('\n');
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ TRAINING FAILED:', error);
    process.exit(1);
  }
}

main();
