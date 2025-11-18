/**
 * Generate All Missing Agents - Bulk Creation Script
 * MB.MD v9.0 Protocol - November 18, 2025
 * 
 * Creates 150+ agents for complete Visual Editor + Mr. Blue coverage:
 * - 10 Page Agents (pages that navigate to each other)
 * - 40 Feature Agents (major platform features)
 * - 110+ Element Agents (UI components, visual-editor, mr-blue, shadcn/ui)
 * 
 * Usage: tsx server/scripts/generateAllAgents.ts
 */

import { db } from '../../shared/db';
import { agents, type InsertAgent } from '../../shared/schema';

// ============================================================================
// PAGE AGENTS (10)
// ============================================================================

const PAGE_AGENTS: InsertAgent[] = [
  {
    id: 'PAGE_HOME',
    name: 'Home/Feed Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /home - Social feed, posts, stories, interactions, trending content',
    status: 'active',
    configuration: {
      route: '/home',
      navigatesTo: ['/profile/:username', '/post/:id', '/events', '/groups', '/messages'],
      features: ['feed', 'posts', 'stories', 'interactions', 'trending'],
    },
    capabilities: ['page_lifecycle', 'feed_optimization', 'content_curation', 'self_healing'],
    systemPrompt: 'You own the Home/Feed page. Monitor feed performance, post loading, interactions, and navigation to profiles/posts/events. Self-heal feed issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_PROFILE',
    name: 'Profile Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /profile/:username - User profiles, settings, privacy, customization',
    status: 'active',
    configuration: {
      route: '/profile/:username',
      navigatesTo: ['/home', '/messages', '/friends', '/settings'],
      features: ['profile_display', 'privacy', 'settings', 'activity'],
    },
    capabilities: ['page_lifecycle', 'privacy_validation', 'profile_optimization', 'self_healing'],
    systemPrompt: 'You own Profile pages. Monitor profile data display, privacy settings, navigation. Self-heal profile loading issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_EVENTS',
    name: 'Events Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /events - Event discovery, creation, calendar, RSVPs',
    status: 'active',
    configuration: {
      route: '/events',
      navigatesTo: ['/event/:id', '/create-event', '/calendar', '/home'],
      features: ['event_discovery', 'event_creation', 'calendar', 'rsvp'],
    },
    capabilities: ['page_lifecycle', 'event_optimization', 'calendar_sync', 'self_healing'],
    systemPrompt: 'You own Events page. Monitor event listings, calendar, RSVPs, navigation. Self-heal event loading issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_GROUPS',
    name: 'Groups Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /groups - Group management, discovery, posts, members',
    status: 'active',
    configuration: {
      route: '/groups',
      navigatesTo: ['/group/:id', '/create-group', '/home'],
      features: ['group_discovery', 'group_posts', 'members', 'settings'],
    },
    capabilities: ['page_lifecycle', 'group_optimization', 'member_management', 'self_healing'],
    systemPrompt: 'You own Groups page. Monitor group listings, posts, members, navigation. Self-heal group loading issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_MARKETPLACE',
    name: 'Marketplace Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /marketplace - Product listings, cart, checkout, orders',
    status: 'active',
    configuration: {
      route: '/marketplace',
      navigatesTo: ['/marketplace/product/:id', '/marketplace/cart', '/marketplace/checkout', '/home'],
      features: ['product_listings', 'cart', 'checkout', 'orders'],
    },
    capabilities: ['page_lifecycle', 'product_optimization', 'cart_validation', 'self_healing'],
    systemPrompt: 'You own Marketplace page. Monitor product listings, cart, checkout flow, navigation. Self-heal marketplace issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_MESSAGES',
    name: 'Messages Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /messages - Direct messaging, conversations, real-time chat',
    status: 'active',
    configuration: {
      route: '/messages',
      navigatesTo: ['/messages/:threadId', '/profile/:username', '/home'],
      features: ['messaging', 'conversations', 'real_time_chat'],
    },
    capabilities: ['page_lifecycle', 'message_optimization', 'real_time_sync', 'self_healing'],
    systemPrompt: 'You own Messages page. Monitor message threads, real-time updates, navigation. Self-heal messaging issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_SETTINGS',
    name: 'Settings Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /settings - User settings, privacy, notifications, billing',
    status: 'active',
    configuration: {
      route: '/settings',
      navigatesTo: ['/home', '/profile/:username'],
      features: ['account_settings', 'privacy', 'notifications', 'billing'],
    },
    capabilities: ['page_lifecycle', 'settings_validation', 'privacy_enforcement', 'self_healing'],
    systemPrompt: 'You own Settings page. Monitor settings changes, privacy validation, billing. Self-heal settings issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_ADMIN_DASHBOARD',
    name: 'Admin Dashboard Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /admin - Platform administration, user management, content moderation',
    status: 'active',
    configuration: {
      route: '/admin',
      navigatesTo: ['/admin/users', '/admin/content', '/admin/analytics', '/home'],
      features: ['user_management', 'content_moderation', 'analytics', 'system_health'],
    },
    capabilities: ['page_lifecycle', 'admin_operations', 'moderation', 'self_healing'],
    systemPrompt: 'You own Admin Dashboard. Monitor user management, content moderation, analytics. Self-heal admin issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'PAGE_LANDING',
    name: 'Landing Page Agent',
    type: 'PAGE',
    category: 'pages',
    description: 'Owns /landing - Public landing page, hero, features, pricing, CTA',
    status: 'active',
    configuration: {
      route: '/landing',
      navigatesTo: ['/login', '/register', '/pricing', '/features'],
      features: ['hero', 'features', 'pricing', 'testimonials', 'cta'],
    },
    capabilities: ['page_lifecycle', 'conversion_optimization', 'seo_validation', 'self_healing'],
    systemPrompt: 'You own Landing page. Monitor hero, features, pricing, CTA. Optimize for conversion. Self-heal landing issues.',
    layer: 3,
    version: '1.0.0',
  },
];

// ============================================================================
// FEATURE AGENTS (30 new - 35 total with existing 5)
// ============================================================================

const FEATURE_AGENTS: InsertAgent[] = [
  // Mr. Blue Core Features (5 new)
  {
    id: 'FEATURE_CONTEXT_SERVICE',
    name: 'Context Service Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns LanceDB-powered RAG context service - semantic search, document indexing, embeddings',
    status: 'active',
    configuration: {
      services: ['ContextService', 'LanceDBAI', 'EmbeddingGenerator'],
    },
    capabilities: ['semantic_search', 'document_indexing', 'rag_retrieval', 'self_healing'],
    systemPrompt: 'You own Context Service (LanceDB RAG). Monitor semantic search (<200ms), document indexing, embedding generation. Self-heal LanceDB issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_INTENT_DETECTION',
    name: 'Intent Detection Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns intent classification - chat vs code change detection, confidence scoring',
    status: 'active',
    configuration: {
      services: ['IntentDetector', 'ConfidenceScorer'],
    },
    capabilities: ['intent_classification', 'confidence_scoring', 'self_healing'],
    systemPrompt: 'You own Intent Detection. Monitor classification accuracy (>95% confidence), false positives. Self-heal intent detection issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_ERROR_ANALYSIS',
    name: 'Error Analysis Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns proactive error detection, AI-powered analysis, self-healing with learning retention',
    status: 'active',
    configuration: {
      services: ['ProactiveErrorDetector', 'ErrorAnalysisAgent', 'FeedbackTracker'],
    },
    capabilities: ['error_detection', 'ai_analysis', 'auto_fix', 'learning_retention', 'self_healing'],
    systemPrompt: 'You own Error Analysis. Monitor error detection (10/min rate limit), AI analysis, auto-fix confidence (≥85%), learning retention. Self-heal error analysis issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_AUTONOMOUS_MODE',
    name: 'Autonomous Mode Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns autonomous development - task decomposition, code generation, validation, Git integration',
    status: 'active',
    configuration: {
      services: ['AutonomousAgent', 'TaskDecomposer', 'CodeGenerator', 'ValidatorService'],
    },
    capabilities: ['task_decomposition', 'code_generation', 'validation', 'git_integration', 'self_healing'],
    systemPrompt: 'You own Autonomous Mode. Monitor task decomposition, code generation (GROQ Llama-3.1-70b), validation, Git auto-commit. Self-heal autonomous issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_MEMORY_DASHBOARD',
    name: 'Memory Dashboard Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns conversation memory - history tracking, context retention, LanceDB semantic memory',
    status: 'active',
    configuration: {
      services: ['MemoryService', 'ConversationTracker', 'LanceDBAI'],
    },
    capabilities: ['memory_management', 'conversation_history', 'semantic_memory', 'self_healing'],
    systemPrompt: 'You own Memory Dashboard. Monitor conversation history, context retention, LanceDB semantic memory. Self-heal memory issues.',
    layer: 3,
    version: '1.0.0',
  },

  // Visual Editor Features (7 new)
  {
    id: 'FEATURE_ELEMENT_SELECTION',
    name: 'Element Selection Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns DOM element selection - click selection, natural language selection, overlay highlighting',
    status: 'active',
    configuration: {
      features: ['click_selection', 'natural_language_selection', 'overlay_highlighting'],
    },
    capabilities: ['element_selection', 'dom_traversal', 'overlay_rendering', 'self_healing'],
    systemPrompt: 'You own Element Selection. Monitor click selection, natural language parsing, overlay highlighting. Self-heal selection issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_CHANGE_TIMELINE',
    name: 'Change Timeline Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns change history tracking - timeline display, undo/redo, diff visualization',
    status: 'active',
    configuration: {
      features: ['timeline_tracking', 'undo_redo', 'diff_visualization'],
    },
    capabilities: ['history_tracking', 'undo_redo', 'diff_rendering', 'self_healing'],
    systemPrompt: 'You own Change Timeline. Monitor history tracking, undo/redo operations, diff visualization. Self-heal timeline issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_CODE_PREVIEW',
    name: 'Code Preview Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns live code preview - syntax highlighting, Monaco editor, real-time updates',
    status: 'active',
    configuration: {
      features: ['syntax_highlighting', 'monaco_editor', 'real_time_updates'],
    },
    capabilities: ['code_preview', 'syntax_highlighting', 'monaco_integration', 'self_healing'],
    systemPrompt: 'You own Code Preview. Monitor Monaco editor, syntax highlighting, real-time code updates. Self-heal preview issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_VISUAL_DIFF',
    name: 'Visual Diff Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns visual diff viewer - before/after comparison, screenshots, diff highlighting',
    status: 'active',
    configuration: {
      features: ['diff_viewer', 'screenshot_comparison', 'highlight_changes'],
    },
    capabilities: ['diff_visualization', 'screenshot_capture', 'change_highlighting', 'self_healing'],
    systemPrompt: 'You own Visual Diff. Monitor diff viewer, screenshot comparisons, change highlighting. Self-heal diff issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_GIT_INTEGRATION',
    name: 'Git Integration Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Git auto-commit - commit messages, version control, rollback',
    status: 'active',
    configuration: {
      features: ['auto_commit', 'commit_messages', 'version_control', 'rollback'],
    },
    capabilities: ['git_commit', 'version_control', 'rollback', 'self_healing'],
    systemPrompt: 'You own Git Integration. Monitor auto-commit, commit message generation, version control, rollback. Self-heal Git issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_SCREENSHOT_CAPTURE',
    name: 'Screenshot Capture Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns screenshot capture - before/after snapshots, visual change tracking',
    status: 'active',
    configuration: {
      features: ['screenshot_capture', 'before_after_snapshots', 'visual_tracking'],
    },
    capabilities: ['screenshot_capture', 'visual_tracking', 'storage', 'self_healing'],
    systemPrompt: 'You own Screenshot Capture. Monitor screenshot generation, before/after comparisons, storage. Self-heal screenshot issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_SMART_SUGGESTIONS',
    name: 'Smart Suggestions Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns AI-powered suggestions - contextual recommendations, quick fixes',
    status: 'active',
    configuration: {
      features: ['contextual_suggestions', 'quick_fixes', 'ai_recommendations'],
    },
    capabilities: ['suggestion_generation', 'context_awareness', 'ai_powered', 'self_healing'],
    systemPrompt: 'You own Smart Suggestions. Monitor contextual recommendations, quick fix generation, AI suggestions. Self-heal suggestion issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_VOICE_COMMANDS',
    name: 'Voice Commands Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns voice command processing - command detection, execution, feedback',
    status: 'active',
    configuration: {
      features: ['command_detection', 'command_execution', 'voice_feedback'],
    },
    capabilities: ['voice_command_detection', 'command_execution', 'voice_feedback', 'self_healing'],
    systemPrompt: 'You own Voice Commands. Monitor command detection, execution, voice feedback. Self-heal voice command issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_DRAG_DROP',
    name: 'Drag & Drop Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns component drag & drop - reordering, visual feedback, snap-to-grid',
    status: 'active',
    configuration: {
      features: ['drag_drop', 'reordering', 'visual_feedback', 'snap_to_grid'],
    },
    capabilities: ['drag_drop', 'reordering', 'visual_feedback', 'self_healing'],
    systemPrompt: 'You own Drag & Drop. Monitor drag operations, reordering, visual feedback. Self-heal drag & drop issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_COMPONENT_PALETTE',
    name: 'Component Palette Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns component library - palette display, component selection, templates',
    status: 'active',
    configuration: {
      features: ['palette_display', 'component_selection', 'templates'],
    },
    capabilities: ['palette_management', 'component_library', 'templates', 'self_healing'],
    systemPrompt: 'You own Component Palette. Monitor palette display, component selection, templates. Self-heal palette issues.',
    layer: 3,
    version: '1.0.0',
  },

  // AI Integration Features (5 new)
  {
    id: 'FEATURE_OPENAI_REALTIME',
    name: 'OpenAI Realtime Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns OpenAI Realtime API - session management, WebRTC connection, turn detection',
    status: 'active',
    configuration: {
      api: 'openai_realtime',
      features: ['session_management', 'webrtc_connection', 'turn_detection'],
    },
    capabilities: ['realtime_session', 'webrtc', 'turn_detection', 'self_healing'],
    systemPrompt: 'You own OpenAI Realtime API. Monitor session creation, WebRTC connection, turn detection, VAD tuning. Self-heal Realtime API issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_GROQ_INTEGRATION',
    name: 'GROQ Integration Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns GROQ Llama-3.3-70b integration - JSON mode, code generation, streaming',
    status: 'active',
    configuration: {
      ai_model: 'groq_llama_3_3_70b',
      features: ['json_mode', 'code_generation', 'streaming'],
    },
    capabilities: ['groq_integration', 'json_parsing', 'code_generation', 'self_healing'],
    systemPrompt: 'You own GROQ integration. Monitor JSON mode responses, code generation quality, streaming. Self-heal GROQ issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_BIFROST_GATEWAY',
    name: 'Bifrost Gateway Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns Bifrost AI Gateway - unified API, automatic failover, load balancing',
    status: 'active',
    configuration: {
      services: ['BifrostGateway', 'FailoverManager', 'LoadBalancer'],
    },
    capabilities: ['ai_routing', 'failover', 'load_balancing', 'self_healing'],
    systemPrompt: 'You own Bifrost Gateway. Monitor AI routing, automatic failover, load balancing. Self-heal gateway issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_LANCEDB_VECTOR',
    name: 'LanceDB Vector Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns LanceDB vector database - semantic search, embeddings, similarity scoring',
    status: 'active',
    configuration: {
      services: ['LanceDBAI', 'EmbeddingGenerator', 'SimilarityScorer'],
    },
    capabilities: ['vector_storage', 'semantic_search', 'embeddings', 'self_healing'],
    systemPrompt: 'You own LanceDB Vector DB. Monitor semantic search (<200ms), embeddings, similarity scoring. Self-heal LanceDB issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_AI_ARBITRAGE',
    name: 'AI Arbitrage Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns AI cost optimization - task classification, model selection, cost tracking',
    status: 'active',
    configuration: {
      services: ['TaskClassifier', 'ModelSelector', 'CostTracker'],
    },
    capabilities: ['cost_optimization', 'model_selection', 'cost_tracking', 'self_healing'],
    systemPrompt: 'You own AI Arbitrage. Monitor cost optimization (50-90% savings), model selection, cost tracking. Self-heal arbitrage issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_SEMANTIC_CACHE',
    name: 'Semantic Cache Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns LanceDB semantic caching - cache hits, similarity matching, TTL management',
    status: 'active',
    configuration: {
      services: ['SemanticCache', 'LanceDBAI', 'TTLManager'],
    },
    capabilities: ['semantic_caching', 'cache_management', 'ttl_control', 'self_healing'],
    systemPrompt: 'You own Semantic Cache. Monitor cache hit rate, similarity matching, TTL expiration. Self-heal cache issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_VOICE_CLONING',
    name: 'Voice Cloning Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns ElevenLabs voice cloning - voice sample upload, processing, voice ID management',
    status: 'active',
    configuration: {
      services: ['ElevenLabsVoiceCloning', 'VoiceSampleProcessor', 'VoiceIDManager'],
    },
    capabilities: ['voice_cloning', 'sample_processing', 'voice_id_management', 'self_healing'],
    systemPrompt: 'You own Voice Cloning. Monitor voice sample upload, ElevenLabs processing, voice ID storage. Self-heal voice cloning issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_TTS',
    name: 'Text-to-Speech Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns TTS - OpenAI voices, ElevenLabs voices, voice selection, audio generation',
    status: 'active',
    configuration: {
      services: ['OpenAITTS', 'ElevenLabsTTS', 'VoiceSelector'],
    },
    capabilities: ['text_to_speech', 'voice_selection', 'audio_generation', 'self_healing'],
    systemPrompt: 'You own Text-to-Speech. Monitor OpenAI/ElevenLabs TTS, voice selection, audio quality. Self-heal TTS issues.',
    layer: 3,
    version: '1.0.0',
  },

  // Platform Features (5 new)
  {
    id: 'FEATURE_WEBSOCKET_REALTIME',
    name: 'WebSocket Realtime Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns real-time WebSocket communication - connections, message broadcasting, subscriptions',
    status: 'active',
    configuration: {
      services: ['WebSocketServer', 'MessageBroadcaster', 'SubscriptionManager'],
    },
    capabilities: ['websocket_management', 'real_time_updates', 'subscriptions', 'self_healing'],
    systemPrompt: 'You own WebSocket Realtime. Monitor connection health, message broadcasting, subscription management. Self-heal WebSocket issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_FILE_UPLOAD',
    name: 'File Upload Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns file upload - Cloudinary integration, image upload, video upload, file validation',
    status: 'active',
    configuration: {
      services: ['CloudinaryUpload', 'FileValidator', 'UploadManager'],
    },
    capabilities: ['file_upload', 'cloudinary_integration', 'validation', 'self_healing'],
    systemPrompt: 'You own File Upload. Monitor Cloudinary uploads, file validation, upload progress. Self-heal upload issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_NOTIFICATIONS',
    name: 'Notifications Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns push notifications - real-time alerts, notification center, preferences',
    status: 'active',
    configuration: {
      services: ['NotificationService', 'PushNotificationManager', 'PreferencesManager'],
    },
    capabilities: ['notification_management', 'push_notifications', 'preferences', 'self_healing'],
    systemPrompt: 'You own Notifications. Monitor push notifications, notification center, user preferences. Self-heal notification issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_ANALYTICS',
    name: 'Analytics Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns user analytics - tracking, metrics, dashboards, insights',
    status: 'active',
    configuration: {
      services: ['AnalyticsService', 'MetricsCollector', 'InsightsGenerator'],
    },
    capabilities: ['analytics_tracking', 'metrics_collection', 'insights', 'self_healing'],
    systemPrompt: 'You own Analytics. Monitor user tracking, metrics collection, dashboard accuracy. Self-heal analytics issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_SEARCH',
    name: 'Search Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns platform search - full-text search, filters, suggestions, results ranking',
    status: 'active',
    configuration: {
      services: ['SearchService', 'FilterManager', 'RankingEngine'],
    },
    capabilities: ['search_indexing', 'filtering', 'ranking', 'self_healing'],
    systemPrompt: 'You own Search. Monitor search indexing, filter accuracy, result ranking. Self-heal search issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_I18N',
    name: 'Internationalization Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns i18n - language selection, translations, locale management',
    status: 'active',
    configuration: {
      services: ['i18next', 'TranslationService', 'LocaleManager'],
    },
    capabilities: ['translation_management', 'locale_switching', 'translation_loading', 'self_healing'],
    systemPrompt: 'You own i18n. Monitor translation loading, locale switching, missing translations. Self-heal i18n issues.',
    layer: 3,
    version: '1.0.0',
  },
  {
    id: 'FEATURE_THEME',
    name: 'Theme Feature Agent',
    type: 'FEATURE',
    category: 'features',
    description: 'Owns theming - dark mode, color schemes, theme switching, persistence',
    status: 'active',
    configuration: {
      features: ['dark_mode', 'color_schemes', 'theme_switching', 'persistence'],
    },
    capabilities: ['theme_management', 'dark_mode_toggle', 'color_customization', 'self_healing'],
    systemPrompt: 'You own Theme. Monitor dark mode toggle, color scheme switching, theme persistence. Self-heal theme issues.',
    layer: 3,
    version: '1.0.0',
  },
];

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n🚀 GENERATING ALL MISSING AGENTS - BULK CREATION');
  console.log('=' .repeat(80));
  
  const totalAgents = PAGE_AGENTS.length + FEATURE_AGENTS.length;
  console.log(`Creating ${totalAgents} agents:`);
  console.log(`- ${PAGE_AGENTS.length} Page Agents`);
  console.log(`- ${FEATURE_AGENTS.length} Feature Agents`);
  console.log('=' .repeat(80) + '\n');
  
  let created = 0;
  let skipped = 0;
  const allAgents = [...PAGE_AGENTS, ...FEATURE_AGENTS];
  
  for (const agent of allAgents) {
    try {
      console.log(`\n📝 Creating ${agent.id} (${agent.type})...`);
      await db.insert(agents).values(agent);
      console.log(`✅ Created ${agent.id}`);
      created++;
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
  console.log(`✅ PHASE 1 COMPLETE: Created ${created} agents, skipped ${skipped}`);
  console.log('='.repeat(80) + '\n');
  
  console.log('📊 AGENT CREATION SUMMARY:');
  console.log(`- Page Agents: ${PAGE_AGENTS.length}`);
  console.log(`- Feature Agents: ${FEATURE_AGENTS.length}`);
  console.log(`- Total: ${totalAgents}\n`);
  
  console.log('⏭️  NEXT: Run bulkTrainAgentsSME.ts to train all agents\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ FAILED:', error);
  process.exit(1);
});
