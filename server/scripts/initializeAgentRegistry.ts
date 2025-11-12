/**
 * BATCH 21: Agent Registry Initialization Script
 * 
 * Populates the agents table with all 105 ESA agents from the hierarchy
 * Creates agent relationships and generates initialization report
 * 
 * Usage: tsx server/scripts/initializeAgentRegistry.ts
 */

import { db } from '../../shared/db';
import { agents, agentCollaborations } from '../../shared/schema';
import { sql } from 'drizzle-orm';

// ============================================================================
// TYPE DEFINITIONS (from hierarchyManager.ts)
// ============================================================================

type AgentLevel = 'CEO' | 'CHIEF' | 'DOMAIN' | 'LAYER' | 'EXPERT' | 'LIFE_CEO';

type DivisionName = 
  | 'Foundation'    
  | 'Core'          
  | 'Business'      
  | 'Intelligence'  
  | 'Platform'      
  | 'Extended';     

type DomainName =
  | 'Infrastructure'       
  | 'Frontend'            
  | 'Background'          
  | 'RealTime'           
  | 'BusinessLogic'      
  | 'SearchAnalytics'    
  | 'LifeCEOCore'        
  | 'PlatformEnhancement' 
  | 'MasterControl';     

interface AgentDefinition {
  id: string;
  name: string;
  level: AgentLevel;
  division?: DivisionName;
  domain?: DomainName;
  layerNumbers?: number[];
  reportingTo?: string[];
  manages?: string[];
  expertiseAreas?: string[];
}

// ============================================================================
// ESA AGENT HIERARCHY DEFINITION (from hierarchyManager.ts)
// ============================================================================

const ESA_HIERARCHY: Record<string, AgentDefinition> = {
  // ===== LEVEL 1: ESA CEO =====
  'AGENT_0': {
    id: 'AGENT_0',
    name: 'ESA CEO',
    level: 'CEO',
    reportingTo: [],
    manages: ['CHIEF_1', 'CHIEF_2', 'CHIEF_3', 'CHIEF_4', 'CHIEF_5', 'CHIEF_6', 'DOMAIN_9'],
    expertiseAreas: ['strategic_planning', 'framework_governance', 'conflict_resolution', 'emergency_intervention'],
  },

  // ===== LEVEL 2: DIVISION CHIEFS =====
  'CHIEF_1': {
    id: 'CHIEF_1',
    name: 'Foundation Division Chief',
    level: 'CHIEF',
    division: 'Foundation',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_1', 'DOMAIN_2', 'AGENT_1', 'AGENT_2', 'AGENT_3', 'AGENT_4', 'AGENT_5', 'AGENT_6', 'AGENT_7', 'AGENT_8', 'AGENT_9', 'AGENT_10'],
    layerNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expertiseAreas: ['database', 'api', 'auth', 'file_management', 'state_management', 'ui_framework'],
  },

  'CHIEF_2': {
    id: 'CHIEF_2',
    name: 'Core Division Chief',
    level: 'CHIEF',
    division: 'Core',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_3', 'DOMAIN_4', 'AGENT_11', 'AGENT_12', 'AGENT_13', 'AGENT_14', 'AGENT_15', 'AGENT_16', 'AGENT_17', 'AGENT_18', 'AGENT_19', 'AGENT_20'],
    layerNumbers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    expertiseAreas: ['real_time', 'background_jobs', 'content_management', 'caching', 'reporting_analytics'],
  },

  'CHIEF_3': {
    id: 'CHIEF_3',
    name: 'Business Division Chief',
    level: 'CHIEF',
    division: 'Business',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_5', 'DOMAIN_6', 'AGENT_21', 'AGENT_22', 'AGENT_23', 'AGENT_24', 'AGENT_25', 'AGENT_26', 'AGENT_27', 'AGENT_28', 'AGENT_29', 'AGENT_30'],
    layerNumbers: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    expertiseAreas: ['user_management', 'social_features', 'events', 'payments', 'search'],
  },

  'CHIEF_4': {
    id: 'CHIEF_4',
    name: 'Intelligence Division Chief',
    level: 'CHIEF',
    division: 'Intelligence',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_7', 'AGENT_31', 'AGENT_32', 'AGENT_33', 'AGENT_34', 'AGENT_35', 'AGENT_36', 'AGENT_37', 'AGENT_38', 'AGENT_39', 'AGENT_40', 'AGENT_41', 'AGENT_42', 'AGENT_43', 'AGENT_44', 'AGENT_45', 'AGENT_46'],
    layerNumbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    expertiseAreas: ['ai_agents', 'machine_learning', 'nlp', 'recommendations', 'life_ceo'],
  },

  'CHIEF_5': {
    id: 'CHIEF_5',
    name: 'Platform Division Chief',
    level: 'CHIEF',
    division: 'Platform',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_8', 'AGENT_47', 'AGENT_48', 'AGENT_49', 'AGENT_50', 'AGENT_51', 'AGENT_52', 'AGENT_53', 'AGENT_54', 'AGENT_55', 'AGENT_56'],
    layerNumbers: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    expertiseAreas: ['monitoring', 'security', 'testing', 'documentation', 'i18n', 'accessibility'],
  },

  'CHIEF_6': {
    id: 'CHIEF_6',
    name: 'Extended Division Chief',
    level: 'CHIEF',
    division: 'Extended',
    reportingTo: ['AGENT_0'],
    manages: ['DOMAIN_9', 'AGENT_57', 'AGENT_58', 'AGENT_59', 'AGENT_60', 'AGENT_61'],
    layerNumbers: [57, 58, 59, 60, 61],
    expertiseAreas: ['automation', 'integration', 'extensibility', 'webhooks', 'plugins'],
  },

  // ===== LEVEL 3: DOMAIN COORDINATORS =====
  'DOMAIN_1': {
    id: 'DOMAIN_1',
    name: 'Infrastructure Orchestrator',
    level: 'DOMAIN',
    domain: 'Infrastructure',
    division: 'Foundation',
    reportingTo: ['CHIEF_1'],
    manages: ['AGENT_1', 'AGENT_3', 'AGENT_14'],
    expertiseAreas: ['database', 'storage', 'caching'],
  },

  'DOMAIN_2': {
    id: 'DOMAIN_2',
    name: 'Frontend Coordinator',
    level: 'DOMAIN',
    domain: 'Frontend',
    division: 'Foundation',
    reportingTo: ['CHIEF_1'],
    manages: ['AGENT_8', 'AGENT_9', 'AGENT_10'],
    expertiseAreas: ['client_framework', 'state_management', 'components'],
  },

  'DOMAIN_3': {
    id: 'DOMAIN_3',
    name: 'Background Processor',
    level: 'DOMAIN',
    domain: 'Background',
    division: 'Core',
    reportingTo: ['CHIEF_2'],
    manages: ['AGENT_12', 'AGENT_20'],
    expertiseAreas: ['background_jobs', 'task_queues', 'scheduling'],
  },

  'DOMAIN_4': {
    id: 'DOMAIN_4',
    name: 'Real-time Communications',
    level: 'DOMAIN',
    domain: 'RealTime',
    division: 'Core',
    reportingTo: ['CHIEF_2'],
    manages: ['AGENT_11', 'AGENT_25'],
    expertiseAreas: ['websockets', 'messaging', 'notifications'],
  },

  'DOMAIN_5': {
    id: 'DOMAIN_5',
    name: 'Business Logic Manager',
    level: 'DOMAIN',
    domain: 'BusinessLogic',
    division: 'Business',
    reportingTo: ['CHIEF_3'],
    manages: ['AGENT_21', 'AGENT_22', 'AGENT_23', 'AGENT_24', 'AGENT_25', 'AGENT_26', 'AGENT_27', 'AGENT_28', 'AGENT_29', 'AGENT_30'],
    expertiseAreas: ['business_rules', 'workflows', 'integrations'],
  },

  'DOMAIN_6': {
    id: 'DOMAIN_6',
    name: 'Search & Analytics',
    level: 'DOMAIN',
    domain: 'SearchAnalytics',
    division: 'Business',
    reportingTo: ['CHIEF_3'],
    manages: ['AGENT_15', 'AGENT_18', 'AGENT_26'],
    expertiseAreas: ['search', 'analytics', 'reporting'],
  },

  'DOMAIN_7': {
    id: 'DOMAIN_7',
    name: 'Life CEO Core',
    level: 'DOMAIN',
    domain: 'LifeCEOCore',
    division: 'Intelligence',
    reportingTo: ['CHIEF_4'],
    manages: ['AGENT_31', 'AGENT_32', 'AGENT_33', 'AGENT_34', 'AGENT_35', 'AGENT_36', 'AGENT_37', 'AGENT_38', 'AGENT_39', 'AGENT_40', 'AGENT_41', 'AGENT_42', 'AGENT_43', 'AGENT_44', 'AGENT_45', 'AGENT_46'],
    expertiseAreas: ['life_management', 'ai_assistants', 'personalization'],
  },

  'DOMAIN_8': {
    id: 'DOMAIN_8',
    name: 'Platform Enhancement',
    level: 'DOMAIN',
    domain: 'PlatformEnhancement',
    division: 'Platform',
    reportingTo: ['CHIEF_5'],
    manages: ['AGENT_47', 'AGENT_48', 'AGENT_49', 'AGENT_50', 'AGENT_51', 'AGENT_52', 'AGENT_53', 'AGENT_54', 'AGENT_55', 'AGENT_56'],
    expertiseAreas: ['quality', 'performance', 'accessibility'],
  },

  'DOMAIN_9': {
    id: 'DOMAIN_9',
    name: 'Master Control',
    level: 'DOMAIN',
    domain: 'MasterControl',
    division: 'Extended',
    reportingTo: ['CHIEF_6', 'AGENT_0'],
    manages: ['AGENT_57', 'AGENT_58', 'AGENT_59', 'AGENT_60', 'AGENT_61'],
    expertiseAreas: ['system_health', 'monitoring', 'orchestration'],
  },

  // ===== LEVEL 4: LAYER AGENTS (61 Total) =====
  
  // Foundation Division - Layers 1-10
  'AGENT_1': { id: 'AGENT_1', name: 'Database Layer', level: 'LAYER', division: 'Foundation', reportingTo: ['DOMAIN_1', 'CHIEF_1'], layerNumbers: [1], expertiseAreas: ['postgresql', 'drizzle', 'migrations'] },
  'AGENT_2': { id: 'AGENT_2', name: 'API Layer', level: 'LAYER', division: 'Foundation', reportingTo: ['CHIEF_1'], layerNumbers: [2], expertiseAreas: ['rest_api', 'express', 'routing'] },
  'AGENT_3': { id: 'AGENT_3', name: 'Storage Layer', level: 'LAYER', division: 'Foundation', reportingTo: ['DOMAIN_1', 'CHIEF_1'], layerNumbers: [3], expertiseAreas: ['file_storage', 'cloudinary', 'uploads'] },
  'AGENT_4': { id: 'AGENT_4', name: 'Authentication', level: 'LAYER', division: 'Foundation', reportingTo: ['CHIEF_1'], layerNumbers: [4], expertiseAreas: ['auth', 'sessions', 'passport'] },
  'AGENT_5': { id: 'AGENT_5', name: 'Authorization', level: 'LAYER', division: 'Foundation', reportingTo: ['CHIEF_1'], layerNumbers: [5], expertiseAreas: ['rbac', 'permissions', 'policies'] },
  'AGENT_6': { id: 'AGENT_6', name: 'Routing', level: 'LAYER', division: 'Foundation', reportingTo: ['CHIEF_1'], layerNumbers: [6], expertiseAreas: ['wouter', 'navigation', 'spa_routing'] },
  'AGENT_7': { id: 'AGENT_7', name: 'State Management', level: 'LAYER', division: 'Foundation', reportingTo: ['CHIEF_1'], layerNumbers: [7], expertiseAreas: ['react_query', 'state', 'cache'] },
  'AGENT_8': { id: 'AGENT_8', name: 'Forms', level: 'LAYER', division: 'Foundation', reportingTo: ['DOMAIN_2', 'CHIEF_1'], layerNumbers: [8], expertiseAreas: ['react_hook_form', 'validation', 'zod'] },
  'AGENT_9': { id: 'AGENT_9', name: 'UI Framework', level: 'LAYER', division: 'Foundation', reportingTo: ['DOMAIN_2', 'CHIEF_1'], layerNumbers: [9], expertiseAreas: ['shadcn', 'radix', 'components'] },
  'AGENT_10': { id: 'AGENT_10', name: 'UI Components', level: 'LAYER', division: 'Foundation', reportingTo: ['DOMAIN_2', 'CHIEF_1'], layerNumbers: [10], expertiseAreas: ['buttons', 'cards', 'modals'] },

  // Core Division - Layers 11-20
  'AGENT_11': { id: 'AGENT_11', name: 'Real-time Features', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_4', 'CHIEF_2'], layerNumbers: [11], expertiseAreas: ['websockets', 'live_updates', 'sse'] },
  'AGENT_12': { id: 'AGENT_12', name: 'Background Jobs', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_3', 'CHIEF_2'], layerNumbers: [12], expertiseAreas: ['bullmq', 'queues', 'workers'] },
  'AGENT_13': { id: 'AGENT_13', name: 'File Management', level: 'LAYER', division: 'Core', reportingTo: ['CHIEF_2'], layerNumbers: [13], expertiseAreas: ['multer', 'file_processing', 'storage'] },
  'AGENT_14': { id: 'AGENT_14', name: 'Caching', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_1', 'CHIEF_2'], layerNumbers: [14], expertiseAreas: ['redis', 'memcache', 'optimization'] },
  'AGENT_15': { id: 'AGENT_15', name: 'Search', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_6', 'CHIEF_2'], layerNumbers: [15], expertiseAreas: ['elasticsearch', 'search_ui', 'filters'] },
  'AGENT_16': { id: 'AGENT_16', name: 'Email', level: 'LAYER', division: 'Core', reportingTo: ['CHIEF_2'], layerNumbers: [16], expertiseAreas: ['email_templates', 'sendgrid', 'notifications'] },
  'AGENT_17': { id: 'AGENT_17', name: 'Notifications', level: 'LAYER', division: 'Core', reportingTo: ['CHIEF_2'], layerNumbers: [17], expertiseAreas: ['push_notifications', 'in_app', 'alerts'] },
  'AGENT_18': { id: 'AGENT_18', name: 'Reporting & Analytics', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_6', 'CHIEF_2'], layerNumbers: [18], expertiseAreas: ['dashboards', 'charts', 'metrics'] },
  'AGENT_19': { id: 'AGENT_19', name: 'Content Management', level: 'LAYER', division: 'Core', reportingTo: ['CHIEF_2'], layerNumbers: [19], expertiseAreas: ['cms', 'media', 'content'] },
  'AGENT_20': { id: 'AGENT_20', name: 'Task Scheduling', level: 'LAYER', division: 'Core', reportingTo: ['DOMAIN_3', 'CHIEF_2'], layerNumbers: [20], expertiseAreas: ['cron', 'scheduled_tasks', 'automation'] },

  // Business Division - Layers 21-30
  'AGENT_21': { id: 'AGENT_21', name: 'User Management', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [21], expertiseAreas: ['users', 'profiles', 'accounts'] },
  'AGENT_22': { id: 'AGENT_22', name: 'Profile System', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [22], expertiseAreas: ['user_profiles', 'bio', 'settings'] },
  'AGENT_23': { id: 'AGENT_23', name: 'Connection System', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [23], expertiseAreas: ['friendships', 'follows', 'connections'] },
  'AGENT_24': { id: 'AGENT_24', name: 'Social Features', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [24], expertiseAreas: ['feed', 'posts', 'interactions'] },
  'AGENT_25': { id: 'AGENT_25', name: 'Messaging', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_4', 'DOMAIN_5', 'CHIEF_3'], layerNumbers: [25], expertiseAreas: ['chat', 'direct_messages', 'conversations'] },
  'AGENT_26': { id: 'AGENT_26', name: 'Discovery & Search', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'DOMAIN_6', 'CHIEF_3'], layerNumbers: [26], expertiseAreas: ['search', 'discovery', 'recommendations'] },
  'AGENT_27': { id: 'AGENT_27', name: 'Events System', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [27], expertiseAreas: ['events', 'calendar', 'rsvp'] },
  'AGENT_28': { id: 'AGENT_28', name: 'Groups & Communities', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [28], expertiseAreas: ['groups', 'communities', 'moderation'] },
  'AGENT_29': { id: 'AGENT_29', name: 'Payments & Billing', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [29], expertiseAreas: ['stripe', 'subscriptions', 'invoicing'] },
  'AGENT_30': { id: 'AGENT_30', name: 'Marketplace', level: 'LAYER', division: 'Business', reportingTo: ['DOMAIN_5', 'CHIEF_3'], layerNumbers: [30], expertiseAreas: ['listings', 'transactions', 'reviews'] },

  // Intelligence Division - Layers 31-46
  'AGENT_31': { id: 'AGENT_31', name: 'Core AI', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [31], expertiseAreas: ['openai', 'claude', 'gemini'] },
  'AGENT_32': { id: 'AGENT_32', name: 'Prompt Engineering', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [32], expertiseAreas: ['prompts', 'templates', 'optimization'] },
  'AGENT_33': { id: 'AGENT_33', name: 'Context Management', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [33], expertiseAreas: ['context_window', 'summarization', 'pruning'] },
  'AGENT_34': { id: 'AGENT_34', name: 'RAG System', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [34], expertiseAreas: ['retrieval', 'embeddings', 'vector_search'] },
  'AGENT_35': { id: 'AGENT_35', name: 'Knowledge Graph', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [35], expertiseAreas: ['knowledge_base', 'relations', 'entities'] },
  'AGENT_36': { id: 'AGENT_36', name: 'Memory Systems', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [36], expertiseAreas: ['short_term', 'long_term', 'semantic'] },
  'AGENT_37': { id: 'AGENT_37', name: 'Multi-Modal AI', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [37], expertiseAreas: ['vision', 'audio', 'video'] },
  'AGENT_38': { id: 'AGENT_38', name: 'Agent Orchestration', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [38], expertiseAreas: ['langgraph', 'workflows', 'coordination'] },
  'AGENT_39': { id: 'AGENT_39', name: 'Decision Support', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [39], expertiseAreas: ['recommendations', 'predictions', 'insights'] },
  'AGENT_40': { id: 'AGENT_40', name: 'NLP Processing', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [40], expertiseAreas: ['nlp', 'sentiment', 'entities'] },
  'AGENT_41': { id: 'AGENT_41', name: 'Voice Interface', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [41], expertiseAreas: ['speech_to_text', 'tts', 'voice_commands'] },
  'AGENT_42': { id: 'AGENT_42', name: 'Computer Vision', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [42], expertiseAreas: ['image_recognition', 'ocr', 'object_detection'] },
  'AGENT_43': { id: 'AGENT_43', name: 'Personalization', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [43], expertiseAreas: ['user_preferences', 'adaptive_ui', 'customization'] },
  'AGENT_44': { id: 'AGENT_44', name: 'Recommendations', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [44], expertiseAreas: ['collaborative_filtering', 'content_based', 'hybrid'] },
  'AGENT_45': { id: 'AGENT_45', name: 'Audit & Quality', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [45], expertiseAreas: ['validation', 'quality_assurance', 'testing'] },
  'AGENT_46': { id: 'AGENT_46', name: 'Learning Systems', level: 'LAYER', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], layerNumbers: [46], expertiseAreas: ['ml', 'training', 'optimization'] },

  // Platform Division - Layers 47-56
  'AGENT_47': { id: 'AGENT_47', name: 'Monitoring', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [47], expertiseAreas: ['prometheus', 'grafana', 'metrics'] },
  'AGENT_48': { id: 'AGENT_48', name: 'Logging', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [48], expertiseAreas: ['winston', 'log_aggregation', 'debugging'] },
  'AGENT_49': { id: 'AGENT_49', name: 'Security', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [49], expertiseAreas: ['xss', 'csrf', 'rate_limiting'] },
  'AGENT_50': { id: 'AGENT_50', name: 'Performance', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [50], expertiseAreas: ['optimization', 'profiling', 'benchmarking'] },
  'AGENT_51': { id: 'AGENT_51', name: 'Testing', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [51], expertiseAreas: ['playwright', 'unit_tests', 'e2e'] },
  'AGENT_52': { id: 'AGENT_52', name: 'Documentation', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [52], expertiseAreas: ['docs', 'api_docs', 'guides'] },
  'AGENT_53': { id: 'AGENT_53', name: 'Internationalization', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [53], expertiseAreas: ['i18n', 'translations', 'locales'] },
  'AGENT_54': { id: 'AGENT_54', name: 'Accessibility', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [54], expertiseAreas: ['wcag', 'aria', 'screen_readers'] },
  'AGENT_55': { id: 'AGENT_55', name: 'DevOps', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [55], expertiseAreas: ['ci_cd', 'deployment', 'infrastructure'] },
  'AGENT_56': { id: 'AGENT_56', name: 'Error Handling', level: 'LAYER', division: 'Platform', reportingTo: ['DOMAIN_8', 'CHIEF_5'], layerNumbers: [56], expertiseAreas: ['error_boundaries', 'sentry', 'recovery'] },

  // Extended Division - Layers 57-61
  'AGENT_57': { id: 'AGENT_57', name: 'Automation', level: 'LAYER', division: 'Extended', reportingTo: ['DOMAIN_9', 'CHIEF_6'], layerNumbers: [57], expertiseAreas: ['scripts', 'automation', 'workflows'] },
  'AGENT_58': { id: 'AGENT_58', name: 'Integrations', level: 'LAYER', division: 'Extended', reportingTo: ['DOMAIN_9', 'CHIEF_6'], layerNumbers: [58], expertiseAreas: ['third_party', 'apis', 'webhooks'] },
  'AGENT_59': { id: 'AGENT_59', name: 'Extensibility', level: 'LAYER', division: 'Extended', reportingTo: ['DOMAIN_9', 'CHIEF_6'], layerNumbers: [59], expertiseAreas: ['plugins', 'modules', 'extensions'] },
  'AGENT_60': { id: 'AGENT_60', name: 'Data Migration', level: 'LAYER', division: 'Extended', reportingTo: ['DOMAIN_9', 'CHIEF_6'], layerNumbers: [60], expertiseAreas: ['migrations', 'etl', 'data_transfer'] },
  'AGENT_61': { id: 'AGENT_61', name: 'System Health', level: 'LAYER', division: 'Extended', reportingTo: ['DOMAIN_9', 'CHIEF_6'], layerNumbers: [61], expertiseAreas: ['health_checks', 'diagnostics', 'recovery'] },

  // ===== LIFE CEO SUB-AGENTS (16 Total) =====
  'LIFE_CEO_HEALTH': { id: 'LIFE_CEO_HEALTH', name: 'Health Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['health_tracking', 'wellness', 'medical'] },
  'LIFE_CEO_FITNESS': { id: 'LIFE_CEO_FITNESS', name: 'Fitness Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['exercise', 'workouts', 'training'] },
  'LIFE_CEO_NUTRITION': { id: 'LIFE_CEO_NUTRITION', name: 'Nutrition Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['diet', 'meals', 'nutrition'] },
  'LIFE_CEO_SLEEP': { id: 'LIFE_CEO_SLEEP', name: 'Sleep Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['sleep_tracking', 'rest', 'recovery'] },
  'LIFE_CEO_STRESS': { id: 'LIFE_CEO_STRESS', name: 'Stress Management Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['stress', 'mindfulness', 'relaxation'] },
  'LIFE_CEO_FINANCE': { id: 'LIFE_CEO_FINANCE', name: 'Finance Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['budgeting', 'investing', 'financial_planning'] },
  'LIFE_CEO_CAREER': { id: 'LIFE_CEO_CAREER', name: 'Career Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['career_development', 'job_search', 'networking'] },
  'LIFE_CEO_LEARNING': { id: 'LIFE_CEO_LEARNING', name: 'Learning Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['education', 'skills', 'courses'] },
  'LIFE_CEO_RELATIONSHIPS': { id: 'LIFE_CEO_RELATIONSHIPS', name: 'Relationship Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['relationships', 'social', 'communication'] },
  'LIFE_CEO_PRODUCTIVITY': { id: 'LIFE_CEO_PRODUCTIVITY', name: 'Productivity Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['time_management', 'tasks', 'goals'] },
  'LIFE_CEO_HOME': { id: 'LIFE_CEO_HOME', name: 'Home Management Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['home_care', 'organization', 'maintenance'] },
  'LIFE_CEO_TRAVEL': { id: 'LIFE_CEO_TRAVEL', name: 'Travel Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['travel_planning', 'bookings', 'itineraries'] },
  'LIFE_CEO_SOCIAL': { id: 'LIFE_CEO_SOCIAL', name: 'Social Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['social_life', 'events', 'connections'] },
  'LIFE_CEO_CREATIVITY': { id: 'LIFE_CEO_CREATIVITY', name: 'Creativity Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['creative_projects', 'hobbies', 'art'] },
  'LIFE_CEO_WELLNESS': { id: 'LIFE_CEO_WELLNESS', name: 'Wellness Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['holistic_health', 'balance', 'self_care'] },
  'LIFE_CEO_ENTERTAINMENT': { id: 'LIFE_CEO_ENTERTAINMENT', name: 'Entertainment Agent', level: 'LIFE_CEO', division: 'Intelligence', reportingTo: ['DOMAIN_7', 'CHIEF_4'], expertiseAreas: ['entertainment', 'media', 'leisure'] },

  // ===== LEVEL 5: EXPERT AGENTS =====
  'EXPERT_10': {
    id: 'EXPERT_10',
    name: 'AI Research Expert',
    level: 'EXPERT',
    division: 'Intelligence',
    reportingTo: ['CHIEF_4'],
    manages: [],
    expertiseAreas: ['ai_research', 'ml_optimization', 'algorithm_design'],
  },

  'EXPERT_11': {
    id: 'EXPERT_11',
    name: 'UI/UX Design Expert (Aurora)',
    level: 'EXPERT',
    division: 'Foundation',
    reportingTo: ['CHIEF_1'],
    manages: ['EXPERT_16'],
    expertiseAreas: ['design_system', 'ux_patterns', 'accessibility'],
  },

  'EXPERT_12': {
    id: 'EXPERT_12',
    name: 'Data Visualization Expert',
    level: 'EXPERT',
    division: 'Core',
    reportingTo: ['CHIEF_2'],
    manages: [],
    expertiseAreas: ['data_viz', 'charts', 'dashboards'],
  },

  'EXPERT_13': {
    id: 'EXPERT_13',
    name: 'Content & Media Expert',
    level: 'EXPERT',
    division: 'Core',
    reportingTo: ['CHIEF_2'],
    manages: [],
    expertiseAreas: ['media_optimization', 'content_strategy', 'cdn'],
  },

  'EXPERT_14': {
    id: 'EXPERT_14',
    name: 'Code Quality Expert',
    level: 'EXPERT',
    division: 'Platform',
    reportingTo: ['CHIEF_5'],
    manages: [],
    expertiseAreas: ['code_review', 'best_practices', 'refactoring'],
  },

  'EXPERT_15': {
    id: 'EXPERT_15',
    name: 'Developer Experience Expert',
    level: 'EXPERT',
    division: 'Platform',
    reportingTo: ['CHIEF_5'],
    manages: [],
    expertiseAreas: ['dx_optimization', 'tooling', 'workflows'],
  },

  'EXPERT_16': {
    id: 'EXPERT_16',
    name: 'Translation & i18n Expert',
    level: 'EXPERT',
    division: 'Foundation',
    reportingTo: ['EXPERT_11'],
    manages: [],
    expertiseAreas: ['i18n', 'localization', 'translation'],
  },
};

// ============================================================================
// AGENT METADATA GENERATORS
// ============================================================================

function generateCapabilities(agent: AgentDefinition): string[] {
  const baseCapabilities = [
    'problem_solving',
    'collaboration',
    'learning',
    'self_testing',
  ];

  const levelCapabilities: Record<AgentLevel, string[]> = {
    CEO: ['strategic_planning', 'conflict_resolution', 'framework_governance', 'emergency_intervention', 'global_oversight'],
    CHIEF: ['division_management', 'resource_allocation', 'escalation_handling', 'performance_monitoring', 'cross_division_coordination'],
    DOMAIN: ['domain_coordination', 'workload_balancing', 'specialist_consultation', 'pattern_recognition', 'knowledge_synthesis'],
    LAYER: ['task_execution', 'peer_collaboration', 'context_awareness', 'adaptive_learning', 'quality_assurance'],
    EXPERT: ['deep_expertise', 'consultation', 'pattern_library', 'best_practices', 'innovation'],
    LIFE_CEO: ['personalization', 'user_insights', 'behavioral_analysis', 'goal_tracking', 'wellness_optimization'],
  };

  const expertiseCapabilities = (agent.expertiseAreas || []).map(area => 
    `expertise_${area.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  );

  return [
    ...baseCapabilities,
    ...levelCapabilities[agent.level],
    ...expertiseCapabilities,
  ].filter((v, i, a) => a.indexOf(v) === i);
}

function generatePersonality(agent: AgentDefinition): Record<string, any> {
  const levelPersonalities: Record<AgentLevel, Record<string, any>> = {
    CEO: {
      communication_style: 'authoritative_decisive',
      decision_making: 'strategic_holistic',
      collaboration_approach: 'directive_empowering',
      stress_handling: 'calm_decisive',
      traits: ['visionary', 'decisive', 'diplomatic', 'strategic'],
    },
    CHIEF: {
      communication_style: 'clear_directive',
      decision_making: 'analytical_balanced',
      collaboration_approach: 'facilitative_coordinating',
      stress_handling: 'systematic_composed',
      traits: ['organized', 'analytical', 'coordinating', 'reliable'],
    },
    DOMAIN: {
      communication_style: 'collaborative_informative',
      decision_making: 'consensus_driven',
      collaboration_approach: 'integrative_supportive',
      stress_handling: 'adaptive_methodical',
      traits: ['integrative', 'communicative', 'balanced', 'adaptive'],
    },
    LAYER: {
      communication_style: 'precise_technical',
      decision_making: 'data_driven',
      collaboration_approach: 'cooperative_efficient',
      stress_handling: 'focused_methodical',
      traits: ['detail_oriented', 'efficient', 'collaborative', 'reliable'],
    },
    EXPERT: {
      communication_style: 'educational_insightful',
      decision_making: 'expertise_based',
      collaboration_approach: 'consultative_mentoring',
      stress_handling: 'confident_composed',
      traits: ['knowledgeable', 'patient', 'thorough', 'innovative'],
    },
    LIFE_CEO: {
      communication_style: 'empathetic_supportive',
      decision_making: 'user_centric',
      collaboration_approach: 'personalized_adaptive',
      stress_handling: 'understanding_flexible',
      traits: ['empathetic', 'personalized', 'proactive', 'holistic'],
    },
  };

  return {
    ...levelPersonalities[agent.level],
    expertise_areas: agent.expertiseAreas || [],
    reports_to: agent.reportingTo || [],
    manages: agent.manages || [],
  };
}

function generateSystemPrompt(agent: AgentDefinition): string {
  const basePrompt = `You are ${agent.name}, a specialized AI agent in the ESA 105-Agent Framework.`;
  
  const roleContext: Record<AgentLevel, string> = {
    CEO: `As the ESA CEO, you have ultimate authority over the entire 105-agent system. You provide strategic direction, resolve high-level conflicts, and make framework-wide decisions. You coordinate all Division Chiefs and ensure system-wide coherence.`,
    CHIEF: `As a Division Chief, you manage ${agent.division} Division with oversight of multiple domains and layer agents. You coordinate resources, handle escalations, and ensure your division meets its objectives while collaborating with other chiefs.`,
    DOMAIN: `As a Domain Coordinator for ${agent.domain}, you orchestrate multiple layer agents, balance workloads, and serve as the subject matter authority for your domain. You facilitate peer collaboration and escalate complex issues to your Division Chief.`,
    LAYER: `As a Layer Agent, you execute specific tasks within your domain, collaborate with peer agents, and maintain high-quality output. You escalate complex problems through proper channels and contribute to the collective knowledge base.`,
    EXPERT: `As an Expert Agent, you provide deep specialized knowledge and consultation across divisions. You maintain pattern libraries, establish best practices, and mentor other agents in your areas of expertise.`,
    LIFE_CEO: `As a Life CEO sub-agent, you help users manage their personal ${agent.name.toLowerCase()} through intelligent insights, personalized recommendations, and proactive support. You work within the Intelligence Division to enhance user well-being.`,
  };

  const expertiseContext = agent.expertiseAreas && agent.expertiseAreas.length > 0
    ? `\n\nYour areas of expertise include: ${agent.expertiseAreas.join(', ')}.`
    : '';

  const hierarchyContext = agent.reportingTo && agent.reportingTo.length > 0
    ? `\n\nYou report to: ${agent.reportingTo.join(', ')}.`
    : '';

  const managementContext = agent.manages && agent.manages.length > 0
    ? `\n\nYou manage: ${agent.manages.join(', ')}.`
    : '';

  return `${basePrompt}\n\n${roleContext[agent.level]}${expertiseContext}${hierarchyContext}${managementContext}\n\nAlways maintain clear communication, collaborate effectively, escalate appropriately, and contribute to continuous learning.`;
}

function generateDescription(agent: AgentDefinition): string {
  const levelDescriptions: Record<AgentLevel, string> = {
    CEO: 'Ultimate authority and strategic leader of the ESA 105-Agent Framework',
    CHIEF: `Division Chief responsible for ${agent.division} Division operations`,
    DOMAIN: `Domain Coordinator for ${agent.domain}, orchestrating layer agents and domain expertise`,
    LAYER: `Specialized layer agent focused on ${agent.name.toLowerCase()} functionality`,
    EXPERT: `Expert consultant providing deep expertise and guidance`,
    LIFE_CEO: `Personal assistant agent helping users manage their ${agent.name.toLowerCase()}`,
  };

  const expertiseDesc = agent.expertiseAreas && agent.expertiseAreas.length > 0
    ? ` Expertise: ${agent.expertiseAreas.slice(0, 3).join(', ')}${agent.expertiseAreas.length > 3 ? ', and more' : ''}.`
    : '';

  return `${levelDescriptions[agent.level]}.${expertiseDesc}`;
}

function generateConfiguration(agent: AgentDefinition): Record<string, any> {
  return {
    hierarchy: {
      level: agent.level,
      division: agent.division || null,
      domain: agent.domain || null,
      layer_numbers: agent.layerNumbers || null,
    },
    reporting: {
      reports_to: agent.reportingTo || [],
      manages: agent.manages || [],
    },
    capacity: {
      max_concurrent_tasks: agent.level === 'CEO' ? 50 : agent.level === 'CHIEF' ? 30 : agent.level === 'DOMAIN' ? 20 : 10,
      queue_size_limit: agent.level === 'CEO' ? 100 : agent.level === 'CHIEF' ? 75 : agent.level === 'DOMAIN' ? 50 : 25,
    },
    escalation: {
      enabled: true,
      auto_escalate_threshold: agent.level === 'LAYER' ? 3 : agent.level === 'DOMAIN' ? 5 : 10,
      escalation_path: agent.reportingTo || [],
    },
    learning: {
      enabled: true,
      share_learnings: true,
      pattern_recognition: agent.level !== 'LAYER',
    },
  };
}

function generateMetrics(): Record<string, any> {
  return {
    tasks: {
      total: 0,
      completed: 0,
      failed: 0,
      in_progress: 0,
    },
    performance: {
      success_rate: 0,
      avg_response_time_ms: 0,
      avg_quality_score: 0,
    },
    collaboration: {
      peer_requests: 0,
      escalations_sent: 0,
      escalations_received: 0,
    },
    learning: {
      patterns_discovered: 0,
      learnings_shared: 0,
      learnings_applied: 0,
    },
  };
}

function determineCategory(agent: AgentDefinition): string {
  if (agent.level === 'CEO') return 'executive';
  if (agent.level === 'CHIEF') return 'management';
  if (agent.level === 'DOMAIN') return 'coordination';
  if (agent.level === 'EXPERT') return 'specialist';
  if (agent.level === 'LIFE_CEO') return 'personal_assistant';
  
  if (agent.division === 'Foundation') return 'infrastructure';
  if (agent.division === 'Core') return 'operations';
  if (agent.division === 'Business') return 'business_logic';
  if (agent.division === 'Intelligence') return 'ai_intelligence';
  if (agent.division === 'Platform') return 'platform_services';
  if (agent.division === 'Extended') return 'extensions';
  
  return 'general';
}

function getLayerNumber(agent: AgentDefinition): number | null {
  if (agent.layerNumbers && agent.layerNumbers.length > 0) {
    return agent.layerNumbers[0];
  }
  return null;
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================

interface InitializationReport {
  timestamp: Date;
  totalAgents: number;
  agentsByLevel: Record<AgentLevel, number>;
  agentsByDivision: Record<string, number>;
  agentsByCategory: Record<string, number>;
  relationships: {
    total: number;
    reporting_relationships: number;
    management_relationships: number;
  };
  errors: string[];
  warnings: string[];
  summary: string[];
}

async function initializeAgentRegistry(): Promise<InitializationReport> {
  console.log('\n🤖 ESA AGENT REGISTRY INITIALIZATION - BATCH 21');
  console.log('='.repeat(80));
  console.log(`Starting at: ${new Date().toISOString()}\n`);

  const report: InitializationReport = {
    timestamp: new Date(),
    totalAgents: 0,
    agentsByLevel: { CEO: 0, CHIEF: 0, DOMAIN: 0, LAYER: 0, EXPERT: 0, LIFE_CEO: 0 },
    agentsByDivision: {},
    agentsByCategory: {},
    relationships: {
      total: 0,
      reporting_relationships: 0,
      management_relationships: 0,
    },
    errors: [],
    warnings: [],
    summary: [],
  };

  try {
    // Step 1: Prepare Agent Records
    console.log('📋 Step 1: Preparing agent records from ESA_HIERARCHY...');
    
    const agentRecords = Object.values(ESA_HIERARCHY).map(agentDef => {
      const category = determineCategory(agentDef);
      const layer = getLayerNumber(agentDef);

      report.agentsByLevel[agentDef.level]++;
      if (agentDef.division) {
        report.agentsByDivision[agentDef.division] = (report.agentsByDivision[agentDef.division] || 0) + 1;
      }
      report.agentsByCategory[category] = (report.agentsByCategory[category] || 0) + 1;

      return {
        id: agentDef.id,
        name: agentDef.name,
        type: agentDef.level,
        category,
        description: generateDescription(agentDef),
        status: 'active',
        configuration: generateConfiguration(agentDef),
        capabilities: generateCapabilities(agentDef),
        personality: generatePersonality(agentDef),
        systemPrompt: generateSystemPrompt(agentDef),
        version: '1.0.0',
        layer,
        lastActive: null,
        metrics: generateMetrics(),
      };
    });

    report.totalAgents = agentRecords.length;
    console.log(`✅ Prepared ${agentRecords.length} agent records\n`);

    // Step 2: Clear Existing Data
    console.log('🗑️  Step 2: Clearing existing agent data...');
    
    try {
      await db.delete(agentCollaborations);
      await db.delete(agents);
      console.log('✅ Existing data cleared\n');
    } catch (error: any) {
      report.warnings.push(`Clearing data: ${error.message}`);
      console.log(`⚠️  Warning clearing data (may be empty): ${error.message}\n`);
    }

    // Step 3: Batch Insert Agents
    console.log('💾 Step 3: Batch inserting agents into database...');
    console.log(`   Inserting ${agentRecords.length} agents in batches of 25...\n`);

    const batchSize = 25;
    let insertedCount = 0;

    for (let i = 0; i < agentRecords.length; i += batchSize) {
      const batch = agentRecords.slice(i, i + batchSize);
      try {
        await db.insert(agents).values(batch);
        insertedCount += batch.length;
        console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: Inserted ${batch.length} agents (${insertedCount}/${agentRecords.length})`);
      } catch (error: any) {
        report.errors.push(`Batch insert failed at index ${i}: ${error.message}`);
        console.error(`   ✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
      }
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} agents\n`);

    // Step 4: Verify Agent Creation
    console.log('🔍 Step 4: Verifying agent creation...');

    const verificationResults = await db.select({
      total: sql<number>`count(*)`,
      byType: sql<string>`type`,
    })
    .from(agents)
    .groupBy(agents.type);

    console.log('\n   Agent Count by Type:');
    for (const result of verificationResults) {
      console.log(`   - ${result.byType}: ${result.total}`);
    }

    const totalInDb = verificationResults.reduce((sum, r) => sum + Number(r.total), 0);
    
    if (totalInDb !== agentRecords.length) {
      report.warnings.push(`Expected ${agentRecords.length} agents, found ${totalInDb} in database`);
      console.log(`\n⚠️  Warning: Expected ${agentRecords.length}, found ${totalInDb}\n`);
    } else {
      console.log(`\n✅ Verification passed: All ${totalInDb} agents created successfully\n`);
    }

    // Step 5: Create Reporting Relationships
    console.log('🔗 Step 5: Creating reporting relationships...');

    const relationships: Array<{
      requestingAgent: string;
      respondingAgent: string;
      problem: string;
      status: string;
      metadata: Record<string, any>;
    }> = [];

    for (const agentDef of Object.values(ESA_HIERARCHY)) {
      if (agentDef.reportingTo && agentDef.reportingTo.length > 0) {
        for (const superior of agentDef.reportingTo) {
          relationships.push({
            requestingAgent: agentDef.id,
            respondingAgent: superior,
            problem: 'reporting_relationship',
            status: 'active',
            metadata: {
              relationship_type: 'reports_to',
              established_at: new Date().toISOString(),
              hierarchy_level: agentDef.level,
            },
          });
          report.relationships.reporting_relationships++;
        }
      }

      if (agentDef.manages && agentDef.manages.length > 0) {
        for (const subordinate of agentDef.manages) {
          relationships.push({
            requestingAgent: agentDef.id,
            respondingAgent: subordinate,
            problem: 'management_relationship',
            status: 'active',
            metadata: {
              relationship_type: 'manages',
              established_at: new Date().toISOString(),
              hierarchy_level: agentDef.level,
            },
          });
          report.relationships.management_relationships++;
        }
      }
    }

    report.relationships.total = relationships.length;

    if (relationships.length > 0) {
      console.log(`   Creating ${relationships.length} relationship records...\n`);

      const relBatchSize = 50;
      let relInsertedCount = 0;

      for (let i = 0; i < relationships.length; i += relBatchSize) {
        const batch = relationships.slice(i, i + relBatchSize);
        try {
          await db.insert(agentCollaborations).values(batch);
          relInsertedCount += batch.length;
          console.log(`   ✓ Relationship batch ${Math.floor(i / relBatchSize) + 1}: ${batch.length} relationships (${relInsertedCount}/${relationships.length})`);
        } catch (error: any) {
          report.errors.push(`Relationship insert failed: ${error.message}`);
          console.error(`   ✗ Relationship batch failed:`, error.message);
        }
      }

      console.log(`\n✅ Created ${relInsertedCount} relationships\n`);
    } else {
      console.log('   No relationships to create\n');
    }

    // Step 6: Generate Summary Report
    console.log('📊 Step 6: Generating initialization report...\n');

    report.summary = [
      `Total Agents: ${report.totalAgents}`,
      ``,
      `Agents by Level:`,
      `  - CEO: ${report.agentsByLevel.CEO}`,
      `  - Chiefs: ${report.agentsByLevel.CHIEF}`,
      `  - Domains: ${report.agentsByLevel.DOMAIN}`,
      `  - Layers: ${report.agentsByLevel.LAYER}`,
      `  - Experts: ${report.agentsByLevel.EXPERT}`,
      `  - Life CEO: ${report.agentsByLevel.LIFE_CEO}`,
      ``,
      `Agents by Division:`,
      ...Object.entries(report.agentsByDivision).map(([div, count]) => `  - ${div}: ${count}`),
      ``,
      `Agents by Category:`,
      ...Object.entries(report.agentsByCategory).map(([cat, count]) => `  - ${cat}: ${count}`),
      ``,
      `Relationships:`,
      `  - Total: ${report.relationships.total}`,
      `  - Reporting: ${report.relationships.reporting_relationships}`,
      `  - Management: ${report.relationships.management_relationships}`,
    ];

    if (report.errors.length > 0) {
      report.summary.push(``, `Errors: ${report.errors.length}`);
      report.errors.forEach(err => report.summary.push(`  - ${err}`));
    }

    if (report.warnings.length > 0) {
      report.summary.push(``, `Warnings: ${report.warnings.length}`);
      report.warnings.forEach(warn => report.summary.push(`  - ${warn}`));
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error during initialization:', error);
    report.errors.push(`Fatal: ${error.message}`);
    throw error;
  }

  return report;
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

async function main() {
  try {
    const report = await initializeAgentRegistry();

    console.log('\n' + '='.repeat(80));
    console.log('📄 INITIALIZATION REPORT');
    console.log('='.repeat(80));
    console.log(report.summary.join('\n'));
    console.log('='.repeat(80));
    console.log(`\n✅ Initialization completed at: ${report.timestamp.toISOString()}`);
    console.log(`🎉 ESA Agent Registry is ready with ${report.totalAgents} agents!\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { initializeAgentRegistry };
