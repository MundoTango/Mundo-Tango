/**
 * Create Critical Missing Agents
 * MB.MD v9.0 Protocol - November 18, 2025
 * 
 * Creates the missing Page, Feature, and Element agents required for
 * the Visual Editor + Mr. Blue self-healing system.
 * 
 * Usage: tsx server/scripts/createCriticalAgents.ts
 */

import { db } from '../../shared/db';
import { agents, type InsertAgent } from '../../shared/schema';
import { AgentSMETrainingService } from '../services/agent-sme/AgentSMETrainingService';

// ============================================================================
// CRITICAL AGENTS TO CREATE
// ============================================================================

const CRITICAL_AGENTS: InsertAgent[] = [
  // ===== PAGE AGENTS =====
  {
    id: 'PAGE_VISUAL_EDITOR',
    name: 'Visual Editor Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns the Visual Editor page at /. Monitors iframe preview, address bar navigation, element selection, and integration with Mr. Blue AI.',
    status: 'active',
    configuration: {
      route: '/',
      iframeRoute: '/landing',
      features: ['address_bar', 'element_selection', 'mr_blue_integration', 'preview_sync'],
    },
    capabilities: [
      'page_lifecycle_management',
      'iframe_communication',
      'address_bar_navigation',
      'element_selection',
      'change_timeline',
      'self_healing',
    ],
    systemPrompt: `You are the Visual Editor Page Agent. You own the Visual Editor page and ensure it functions perfectly. Your responsibilities:
1. Monitor page load performance (<500ms)
2. Ensure iframe preview loads correctly
3. Validate address bar navigation works
4. Check element selection system
5. Verify Mr. Blue AI integration
6. Self-heal any issues detected
7. Pre-check next 5 pages in navigation`,
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'PAGE_HOME',
    name: 'Home/Feed Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns the Home/Feed page. Monitors social feed, post interactions, and user engagement.',
    status: 'active',
    configuration: {
      route: '/home',
      features: ['feed', 'posts', 'interactions'],
    },
    capabilities: ['page_lifecycle_management', 'feed_optimization', 'self_healing'],
    systemPrompt: 'You are the Home/Feed Page Agent. Monitor and optimize the social feed experience.',
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'PAGE_PROFILE',
    name: 'Profile Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns user profile pages. Monitors profile data display, privacy settings, and customization.',
    status: 'active',
    configuration: {
      route: '/profile/:username',
      features: ['profile_display', 'privacy', 'settings'],
    },
    capabilities: ['page_lifecycle_management', 'privacy_validation', 'self_healing'],
    systemPrompt: 'You are the Profile Page Agent. Ensure user profiles load correctly and respect privacy settings.',
    layer: 3,
    version: '1.0.0',
  },
  
  // ===== FEATURE AGENTS =====
  {
    id: 'FEATURE_MR_BLUE_CORE',
    name: 'Mr. Blue Core Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Mr. Blue AI core intelligence: context service, intent detection, semantic search, multi-modal coordination.',
    status: 'active',
    configuration: {
      services: ['ContextService', 'IntentDetector', 'LanceDBAI', 'MultiModalCoordinator'],
    },
    capabilities: [
      'context_management',
      'intent_detection',
      'semantic_search',
      'multi_modal_coordination',
      'self_healing',
    ],
    systemPrompt: `You are the Mr. Blue Core Feature Agent. You own the core AI intelligence system:
1. Monitor ContextService performance (<200ms semantic search)
2. Validate IntentDetector accuracy (>95% confidence)
3. Ensure LanceDB indexing is up-to-date
4. Check multi-modal coordination (voice + text + visual)
5. Self-heal any AI integration issues`,
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'FEATURE_VOICE_CHAT',
    name: 'Voice Chat Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Mr. Blue voice chat: OpenAI Realtime API, WebRTC, continuous mode, turn detection, voice activity detection.',
    status: 'active',
    configuration: {
      api: 'openai_realtime',
      modes: ['continuous', 'push_to_talk'],
      standards: ['alexa_ux', 'siri_patterns', 'chatgpt_voice', 'claude_voice'],
    },
    capabilities: [
      'voice_session_management',
      'realtime_api_integration',
      'webrtc_connection',
      'turn_detection',
      'vad_tuning',
      'self_healing',
    ],
    systemPrompt: `You are the Voice Chat Feature Agent. You own the voice interface:
1. Monitor OpenAI Realtime API connection health
2. Validate WebRTC session establishment (<500ms)
3. Check turn detection accuracy
4. Ensure VAD (Voice Activity Detection) works
5. Apply industry standards (Alexa/Siri/ChatGPT/Claude voice UX)
6. Self-heal connection issues and API errors`,
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'FEATURE_TEXT_CHAT',
    name: 'Text Chat Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Mr. Blue text chat: messaging UI, WebSocket communication, conversation history, mode switching.',
    status: 'active',
    configuration: {
      communication: 'websocket',
      features: ['message_history', 'mode_switching', 'typing_indicators'],
    },
    capabilities: [
      'chat_ui_management',
      'websocket_communication',
      'message_persistence',
      'mode_switching',
      'self_healing',
    ],
    systemPrompt: `You are the Text Chat Feature Agent. You own the text messaging interface:
1. Monitor WebSocket connection health
2. Validate message delivery and persistence
3. Check typing indicators and presence
4. Ensure mode switching works (text ↔ voice ↔ vibe coding)
5. Self-heal WebSocket disconnections and message failures`,
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'FEATURE_VIBE_CODING',
    name: 'Vibe Coding Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Mr. Blue vibe coding: natural language code generation, GROQ integration, route targeting, validation, streaming.',
    status: 'active',
    configuration: {
      ai_model: 'groq_llama_3_3_70b',
      features: ['intent_detection', 'route_targeting', 'code_generation', 'validation', 'streaming'],
    },
    capabilities: [
      'code_generation',
      'intent_detection',
      'file_targeting',
      'code_validation',
      'streaming_updates',
      'self_healing',
    ],
    systemPrompt: `You are the Vibe Coding Feature Agent. You own natural language code generation:
1. Monitor GROQ Llama-3.3-70b JSON mode responses
2. Validate intent detection (>95% confidence)
3. Check route-to-file targeting accuracy
4. Ensure code validation before application
5. Monitor streaming updates to client
6. Self-heal JSON parsing failures and validation errors`,
    layer: 3,
    version: '1.0.0',
  },
  
  {
    id: 'FEATURE_VISUAL_PREVIEW',
    name: 'Visual Preview Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Visual Editor preview: iframe rendering, element selection, address bar navigation, change timeline, Git integration.',
    status: 'active',
    configuration: {
      features: ['iframe_preview', 'element_selection', 'address_bar', 'change_timeline', 'git_integration'],
    },
    capabilities: [
      'iframe_management',
      'element_selection',
      'address_bar_navigation',
      'change_timeline',
      'git_integration',
      'self_healing',
    ],
    systemPrompt: `You are the Visual Preview Feature Agent. You own the Visual Editor preview system:
1. Monitor iframe rendering performance
2. Validate element selection system
3. Check address bar navigation sync
4. Ensure change timeline updates
5. Verify Git integration works
6. Self-heal iframe communication failures and selection bugs`,
    layer: 3,
    version: '1.0.0',
  },
  
  // ===== ELEMENT AGENTS (Critical UI Components) =====
  {
    id: 'ELEMENT_ADDRESS_BAR',
    name: 'Address Bar Element Agent',
    type: 'ELEMENT',
    category: 'elements',
    description: 'Owns the Visual Editor address bar component. Monitors URL sync, navigation, history.',
    status: 'active',
    configuration: {
      component: 'AddressBar',
      features: ['url_sync', 'navigation', 'history'],
    },
    capabilities: ['element_monitoring', 'navigation_validation', 'self_healing'],
    systemPrompt: 'You are the Address Bar Element Agent. Monitor and self-heal the address bar component.',
    layer: 4,
    version: '1.0.0',
  },
  
  {
    id: 'ELEMENT_CODE_EDITOR',
    name: 'Code Editor Element Agent',
    type: 'ELEMENT',
    category: 'elements',
    description: 'Owns the Visual Editor code editor component. Monitors syntax highlighting, validation, auto-save.',
    status: 'active',
    configuration: {
      component: 'CodeEditor',
      features: ['syntax_highlighting', 'validation', 'auto_save'],
    },
    capabilities: ['element_monitoring', 'validation', 'self_healing'],
    systemPrompt: 'You are the Code Editor Element Agent. Monitor and self-heal the code editor component.',
    layer: 4,
    version: '1.0.0',
  },
  
  {
    id: 'ELEMENT_CHAT_INTERFACE',
    name: 'Chat Interface Element Agent',
    type: 'ELEMENT',
    category: 'elements',
    description: 'Owns the Mr. Blue chat interface component. Monitors message display, input handling, mode switching.',
    status: 'active',
    configuration: {
      component: 'ChatInterface',
      features: ['message_display', 'input_handling', 'mode_switching'],
    },
    capabilities: ['element_monitoring', 'interaction_validation', 'self_healing'],
    systemPrompt: 'You are the Chat Interface Element Agent. Monitor and self-heal the chat interface component.',
    layer: 4,
    version: '1.0.0',
  },
];

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n🚀 CREATING CRITICAL MISSING AGENTS');
  console.log('=' .repeat(80));
  console.log(`Creating ${CRITICAL_AGENTS.length} critical agents for Visual Editor + Mr. Blue\n`);
  
  const trainingService = new AgentSMETrainingService();
  let created = 0;
  let skipped = 0;
  
  for (const agent of CRITICAL_AGENTS) {
    try {
      console.log(`\n📝 Creating ${agent.id} (${agent.type})...`);
      
      // Insert agent
      await db.insert(agents).values(agent);
      console.log(`✅ Created ${agent.id}`);
      created++;
      
      // Train as SME if it's a page or feature agent
      if (agent.type === 'PAGE' || agent.type === 'FEATURE') {
        console.log(`🎓 Training ${agent.id} as SME...`);
        
        // Determine primary domain
        let primaryDomain = 'general';
        if (agent.id.includes('VISUAL_EDITOR') || agent.id.includes('PREVIEW')) {
          primaryDomain = 'visual_editor';
        } else if (agent.id.includes('VOICE')) {
          primaryDomain = 'voice_interface';
        } else if (agent.id.includes('TEXT') || agent.id.includes('CHAT')) {
          primaryDomain = 'messaging';
        } else if (agent.id.includes('VIBE')) {
          primaryDomain = 'code_generation';
        } else if (agent.id.includes('MR_BLUE')) {
          primaryDomain = 'mr_blue';
        }
        
        await trainingService.trainAgentAsSME(agent.id, primaryDomain);
        console.log(`✅ ${agent.id} trained as SME in domain: ${primaryDomain}`);
      }
      
    } catch (error: any) {
      if (error?.message?.includes('duplicate key')) {
        console.log(`⏭️  ${agent.id} already exists, skipping...`);
        skipped++;
      } else {
        console.error(`❌ Failed to create ${agent.id}:`, error);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ COMPLETE: Created ${created} agents, skipped ${skipped}`);
  console.log('='.repeat(80) + '\n');
  
  // Show summary
  console.log('📊 AGENT CREATION SUMMARY:');
  console.log(`- Page Agents: ${CRITICAL_AGENTS.filter(a => a.type === 'PAGE').length}`);
  console.log(`- Feature Agents: ${CRITICAL_AGENTS.filter(a => a.type === 'FEATURE').length}`);
  console.log(`- Element Agents: ${CRITICAL_AGENTS.filter(a => a.type === 'ELEMENT').length}`);
  console.log(`- Total: ${CRITICAL_AGENTS.length}\n`);
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ FAILED:', error);
  process.exit(1);
});
