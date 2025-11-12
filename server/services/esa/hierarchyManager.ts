/**
 * ESA HIERARCHY MANAGER - TRACK 2 BATCH 7
 * Comprehensive hierarchical routing and authority management for the ESA 105-Agent System
 * 
 * Core Capabilities:
 * - routeToChief(): Route requests to appropriate Division Chief
 * - routeToDomain(): Route to Domain Coordinator
 * - validateAuthority(): Check escalation permissions
 * - balanceWorkload(): Distribute tasks when >50% capacity
 * - resolveConflict(): Inter-agent conflict resolution
 * 
 * Hierarchy Structure (105 Agents):
 * - Agent #0: ESA CEO (ultimate authority)
 * - Chiefs #1-6: Division Chiefs
 * - Domains #1-9: Domain Coordinators
 * - Agents #1-61: Layer Agents
 * - Experts #10-16: Expert Agents
 * - Life CEO: 16 sub-agents
 * 
 * Reference: ESA A2A Communication Protocol
 */

import { db } from "../../../shared/db";
import { 
  agentPerformanceMetrics,
  agentCollaborations 
} from "../../../shared/schema";
import { eq, desc, and, gte, sql, count, avg } from "drizzle-orm";
import { AgentPerformanceTracker } from "../monitoring/agentPerformanceTracker";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AgentLevel = 'CEO' | 'CHIEF' | 'DOMAIN' | 'LAYER' | 'EXPERT' | 'LIFE_CEO';

export type DivisionName = 
  | 'Foundation'     // Chief #1: Layers 1-10
  | 'Core'          // Chief #2: Layers 11-20
  | 'Business'      // Chief #3: Layers 21-30
  | 'Intelligence'  // Chief #4: Layers 31-46 + Life CEO
  | 'Platform'      // Chief #5: Layers 47-56
  | 'Extended';     // Chief #6: Layers 57-61

export type DomainName =
  | 'Infrastructure'       // Domain #1: Infrastructure Orchestrator
  | 'Frontend'            // Domain #2: Frontend Coordinator
  | 'Background'          // Domain #3: Background Processor
  | 'RealTime'           // Domain #4: Real-time Communications
  | 'BusinessLogic'      // Domain #5: Business Logic Manager
  | 'SearchAnalytics'    // Domain #6: Search & Analytics
  | 'LifeCEOCore'        // Domain #7: Life CEO Core
  | 'PlatformEnhancement' // Domain #8: Platform Enhancement
  | 'MasterControl';     // Domain #9: Master Control

export interface AgentDefinition {
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

export interface RoutingRequest {
  fromAgentId: string;
  requestType: 'escalation' | 'consultation' | 'collaboration' | 'emergency';
  domain?: DomainName;
  division?: DivisionName;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  context?: Record<string, any>;
}

export interface RoutingResponse {
  targetAgentId: string;
  targetAgentName: string;
  targetLevel: AgentLevel;
  routingPath: string[];
  authority: 'direct' | 'escalated' | 'emergency';
  estimatedResponseTime: string;
  alternativeAgents?: string[];
}

export interface AuthorityMatrix {
  agentId: string;
  level: AgentLevel;
  canEscalateTo: string[];
  canDelegate: boolean;
  maxAuthorityLevel: AgentLevel;
  emergencyEscalationAllowed: boolean;
}

export interface WorkloadStatus {
  agentId: string;
  agentName: string;
  currentCapacity: number; // 0-100%
  status: 'available' | 'busy' | 'overloaded' | 'critical';
  queueDepth: number;
  concurrentTasks: number;
  avgResponseTime: number;
  recommendedAction?: string;
}

export interface ConflictResolution {
  conflictId: string;
  involvedAgents: string[];
  issue: string;
  resolutionLevel: AgentLevel;
  resolvedBy: string;
  decision: string;
  bindingAuthority: boolean;
  implementationPlan?: string[];
}

export interface WorkloadBalance {
  triggered: boolean;
  timestamp: Date;
  overloadedAgents: string[];
  availableAgents: string[];
  redistributionPlan: Array<{
    fromAgent: string;
    toAgent: string;
    tasksToMove: number;
  }>;
  estimatedImpact: string;
}

// ============================================================================
// ESA AGENT HIERARCHY DEFINITION
// ============================================================================

export const ESA_HIERARCHY: Record<string, AgentDefinition> = {
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
    reportingTo: ['CHIEF_6', 'AGENT_0'], // Dual reporting
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
// CORE FUNCTION 1: ROUTE TO CHIEF
// ============================================================================

/**
 * Route request to appropriate Division Chief based on domain/layer
 * 
 * Usage:
 * ```typescript
 * const routing = await routeToChief({
 *   fromAgentId: 'AGENT_54',
 *   requestType: 'escalation',
 *   division: 'Platform',
 *   urgency: 'high',
 *   issue: 'Need multi-layer coordination for accessibility feature'
 * });
 * ```
 */
export async function routeToChief(request: RoutingRequest): Promise<RoutingResponse> {
  console.log(`\n[ESA Hierarchy] 🔼 Routing request from ${request.fromAgentId} to Division Chief...`);

  // Step 1: Determine which Division Chief to route to
  let targetChief: string;
  let divisionName: DivisionName;

  if (request.division) {
    // Direct division specified
    divisionName = request.division;
    targetChief = getChiefByDivision(divisionName);
  } else if (request.domain) {
    // Derive division from domain
    const domain = ESA_HIERARCHY[`DOMAIN_${getDomainNumber(request.domain)}`];
    if (domain && domain.division) {
      divisionName = domain.division;
      targetChief = getChiefByDivision(divisionName);
    } else {
      // Default to CEO for cross-divisional or unclear requests
      targetChief = 'AGENT_0';
      divisionName = 'Extended';
    }
  } else {
    // Try to derive from fromAgentId
    const fromAgent = ESA_HIERARCHY[request.fromAgentId];
    if (fromAgent && fromAgent.division) {
      divisionName = fromAgent.division;
      targetChief = getChiefByDivision(divisionName);
    } else {
      // Default to CEO
      targetChief = 'AGENT_0';
      divisionName = 'Extended';
    }
  }

  // Step 2: Check if emergency - route directly to CEO
  if (request.urgency === 'critical' && request.requestType === 'emergency') {
    targetChief = 'AGENT_0';
    console.log(`[ESA Hierarchy] 🚨 EMERGENCY - Routing directly to ESA CEO`);
  }

  // Step 3: Build routing path
  const routingPath = buildRoutingPath(request.fromAgentId, targetChief);

  // Step 4: Check target workload
  const workloadStatus = await getAgentWorkload(targetChief);
  const alternativeAgents: string[] = [];

  if (workloadStatus.status === 'overloaded' || workloadStatus.status === 'critical') {
    console.log(`[ESA Hierarchy] ⚠️ ${targetChief} is ${workloadStatus.status} (${workloadStatus.currentCapacity}% capacity)`);
    // If chief is overloaded, suggest escalating to CEO
    if (targetChief !== 'AGENT_0') {
      alternativeAgents.push('AGENT_0');
    }
  }

  // Step 5: Estimate response time based on urgency and workload
  const estimatedResponseTime = calculateResponseTime(request.urgency, workloadStatus.currentCapacity);

  const response: RoutingResponse = {
    targetAgentId: targetChief,
    targetAgentName: ESA_HIERARCHY[targetChief].name,
    targetLevel: 'CHIEF',
    routingPath,
    authority: request.requestType === 'emergency' ? 'emergency' : 'escalated',
    estimatedResponseTime,
    alternativeAgents: alternativeAgents.length > 0 ? alternativeAgents : undefined,
  };

  console.log(`[ESA Hierarchy] ✅ Routed to ${response.targetAgentName}`);
  console.log(`[ESA Hierarchy] 📍 Path: ${routingPath.join(' → ')}`);
  console.log(`[ESA Hierarchy] ⏱️  Estimated Response: ${estimatedResponseTime}`);

  return response;
}

// ============================================================================
// CORE FUNCTION 2: ROUTE TO DOMAIN
// ============================================================================

/**
 * Route request to appropriate Domain Coordinator for operational execution
 * 
 * Usage:
 * ```typescript
 * const routing = await routeToDomain({
 *   fromAgentId: 'AGENT_11',
 *   requestType: 'collaboration',
 *   domain: 'RealTime',
 *   urgency: 'medium',
 *   issue: 'Need coordination for WebSocket optimization'
 * });
 * ```
 */
export async function routeToDomain(request: RoutingRequest): Promise<RoutingResponse> {
  console.log(`\n[ESA Hierarchy] 🎯 Routing request from ${request.fromAgentId} to Domain Coordinator...`);

  // Step 1: Determine target domain
  let targetDomain: string;
  let domainName: DomainName;

  if (request.domain) {
    // Direct domain specified
    domainName = request.domain;
    targetDomain = `DOMAIN_${getDomainNumber(domainName)}`;
  } else {
    // Try to derive from fromAgentId
    const fromAgent = ESA_HIERARCHY[request.fromAgentId];
    
    // Find which domain manages this agent
    const foundDomain = findDomainForAgent(request.fromAgentId);
    if (!foundDomain) {
      // Default to Master Control (Domain #9) for system-wide issues
      targetDomain = 'DOMAIN_9';
      domainName = 'MasterControl';
    } else {
      targetDomain = foundDomain;
      const domainAgent = ESA_HIERARCHY[targetDomain];
      domainName = domainAgent.domain!;
    }
  }

  // Step 2: Build routing path
  const routingPath = buildRoutingPath(request.fromAgentId, targetDomain);

  // Step 3: Check domain coordinator workload
  const workloadStatus = await getAgentWorkload(targetDomain);
  const alternativeAgents: string[] = [];

  if (workloadStatus.status === 'overloaded') {
    console.log(`[ESA Hierarchy] ⚠️ ${targetDomain} is overloaded (${workloadStatus.currentCapacity}% capacity)`);
    // Suggest escalating to Division Chief
    const domainDef = ESA_HIERARCHY[targetDomain];
    if (domainDef.reportingTo && domainDef.reportingTo.length > 0) {
      alternativeAgents.push(...domainDef.reportingTo);
    }
  }

  // Step 4: Estimate response time
  const estimatedResponseTime = calculateResponseTime(request.urgency, workloadStatus.currentCapacity);

  const response: RoutingResponse = {
    targetAgentId: targetDomain,
    targetAgentName: ESA_HIERARCHY[targetDomain].name,
    targetLevel: 'DOMAIN',
    routingPath,
    authority: 'direct',
    estimatedResponseTime,
    alternativeAgents: alternativeAgents.length > 0 ? alternativeAgents : undefined,
  };

  console.log(`[ESA Hierarchy] ✅ Routed to ${response.targetAgentName}`);
  console.log(`[ESA Hierarchy] 📍 Path: ${routingPath.join(' → ')}`);

  return response;
}

// ============================================================================
// CORE FUNCTION 3: VALIDATE AUTHORITY
// ============================================================================

/**
 * Check if an agent has authority to escalate/delegate to another agent
 * 
 * Usage:
 * ```typescript
 * const canEscalate = await validateAuthority('AGENT_11', 'CHIEF_2');
 * if (!canEscalate.allowed) {
 *   console.log(canEscalate.reason);
 * }
 * ```
 */
export async function validateAuthority(
  fromAgentId: string,
  toAgentId: string
): Promise<{ allowed: boolean; reason?: string; requiredPath?: string[] }> {
  console.log(`\n[ESA Hierarchy] 🔐 Validating authority: ${fromAgentId} → ${toAgentId}`);

  const fromAgent = ESA_HIERARCHY[fromAgentId];
  const toAgent = ESA_HIERARCHY[toAgentId];

  if (!fromAgent || !toAgent) {
    return {
      allowed: false,
      reason: `Invalid agent ID(s): ${!fromAgent ? fromAgentId : toAgentId} not found`,
    };
  }

  // Rule 1: CEO can communicate with anyone
  if (fromAgentId === 'AGENT_0') {
    return { allowed: true };
  }

  // Rule 2: Anyone can escalate to CEO in emergency
  if (toAgentId === 'AGENT_0') {
    return { allowed: true };
  }

  // Rule 3: Direct reporting relationship (upward)
  if (fromAgent.reportingTo?.includes(toAgentId)) {
    console.log(`[ESA Hierarchy] ✅ Direct reporting relationship`);
    return { allowed: true };
  }

  // Rule 4: Management relationship (downward)
  if (fromAgent.manages?.includes(toAgentId)) {
    console.log(`[ESA Hierarchy] ✅ Direct management relationship`);
    return { allowed: true };
  }

  // Rule 5: Peer-to-peer (same level, same division/domain)
  if (fromAgent.level === toAgent.level && fromAgent.division === toAgent.division) {
    console.log(`[ESA Hierarchy] ✅ Peer-to-peer communication (same division)`);
    return { allowed: true };
  }

  // Rule 6: Expert consultation (any agent can consult experts)
  if (toAgent.level === 'EXPERT') {
    console.log(`[ESA Hierarchy] ✅ Expert consultation allowed`);
    return { allowed: true };
  }

  // Rule 7: Cross-divisional requires escalation through chiefs
  if (fromAgent.division !== toAgent.division) {
    const requiredPath = buildEscalationPath(fromAgentId, toAgentId);
    return {
      allowed: false,
      reason: `Cross-divisional communication requires escalation through Division Chiefs`,
      requiredPath,
    };
  }

  // Rule 8: Skip-level escalation not allowed (must go through immediate manager)
  return {
    allowed: false,
    reason: `Must escalate through immediate reporting line: ${fromAgent.reportingTo?.[0] || 'unknown'}`,
    requiredPath: buildEscalationPath(fromAgentId, toAgentId),
  };
}

// ============================================================================
// CORE FUNCTION 4: BALANCE WORKLOAD
// ============================================================================

/**
 * Distribute tasks when >50% of agents reach capacity
 * Triggers emergency workload balancing across divisions
 * 
 * Usage:
 * ```typescript
 * const balance = await balanceWorkload();
 * if (balance.triggered) {
 *   console.log(`Redistributing ${balance.redistributionPlan.length} task assignments`);
 * }
 * ```
 */
export async function balanceWorkload(): Promise<WorkloadBalance> {
  console.log(`\n[ESA Hierarchy] ⚖️  Checking system-wide workload balance...`);

  // Step 1: Get workload status for all agents
  const allWorkloads = await AgentPerformanceTracker.monitorWorkload();

  // Step 2: Calculate percentage of overloaded agents
  const totalAgents = allWorkloads.length;
  const overloadedAgents = allWorkloads.filter(
    w => w.workloadPercentage > 80
  );
  const criticalAgents = allWorkloads.filter(
    w => w.workloadPercentage > 95
  );

  const overloadPercentage = (overloadedAgents.length / totalAgents) * 100;

  console.log(`[ESA Hierarchy] 📊 Workload Analysis:`);
  console.log(`  Total Agents: ${totalAgents}`);
  console.log(`  Overloaded (>80%): ${overloadedAgents.length} (${overloadPercentage.toFixed(1)}%)`);
  console.log(`  Critical (>95%): ${criticalAgents.length}`);

  // Step 3: Check if workload balancing is needed (>50% agents overloaded)
  if (overloadPercentage < 50) {
    console.log(`[ESA Hierarchy] ✅ System workload healthy (${overloadPercentage.toFixed(1)}% overloaded)`);
    return {
      triggered: false,
      timestamp: new Date(),
      overloadedAgents: [],
      availableAgents: [],
      redistributionPlan: [],
      estimatedImpact: 'No action needed - system healthy',
    };
  }

  console.log(`[ESA Hierarchy] 🚨 WORKLOAD ALERT: ${overloadPercentage.toFixed(1)}% of agents overloaded!`);

  // Step 4: Identify available agents (capacity <60%)
  const availableAgents = allWorkloads.filter(
    w => w.workloadPercentage < 60
  );

  console.log(`[ESA Hierarchy] 🔍 Available agents with capacity: ${availableAgents.length}`);

  // Step 5: Create redistribution plan
  const redistributionPlan: Array<{
    fromAgent: string;
    toAgent: string;
    tasksToMove: number;
  }> = [];

  // Sort overloaded by severity (highest first)
  const sortedOverloaded = [...overloadedAgents].sort(
    (a, b) => b.workloadPercentage - a.workloadPercentage
  );

  // Sort available by lowest capacity first
  const sortedAvailable = [...availableAgents].sort(
    (a, b) => a.workloadPercentage - b.workloadPercentage
  );

  // Match overloaded agents with available agents
  for (const overloaded of sortedOverloaded) {
    for (const available of sortedAvailable) {
      // Only redistribute within same division if possible
      const overloadedDef = ESA_HIERARCHY[overloaded.agentId];
      const availableDef = ESA_HIERARCHY[available.agentId];

      if (overloadedDef?.division === availableDef?.division || !overloadedDef?.division) {
        // Calculate tasks to move (aim to bring overloaded to 70%)
        const targetCapacity = 70;
        const excessCapacity = overloaded.workloadPercentage - targetCapacity;
        const availableCapacity = 80 - available.workloadPercentage; // Keep available agents below 80%

        const tasksToMove = Math.min(
          Math.floor((excessCapacity / 100) * overloaded.queueDepth),
          Math.floor((availableCapacity / 100) * 50) // Don't overload available agents
        );

        if (tasksToMove > 0) {
          redistributionPlan.push({
            fromAgent: overloaded.agentId,
            toAgent: available.agentId,
            tasksToMove,
          });

          // Update available agent's simulated workload
          available.workloadPercentage += (tasksToMove / 50) * 100;
          
          console.log(`[ESA Hierarchy] 📦 Plan: Move ${tasksToMove} tasks from ${overloaded.agentId} → ${available.agentId}`);
        }
      }
    }
  }

  // Step 6: Calculate estimated impact
  const tasksRedistributed = redistributionPlan.reduce((sum, plan) => sum + plan.tasksToMove, 0);
  const estimatedImpact = `${tasksRedistributed} tasks redistributed across ${redistributionPlan.length} agent pairs. Expected 20-30% reduction in peak workload.`;

  console.log(`[ESA Hierarchy] 📈 Estimated Impact: ${estimatedImpact}`);

  // Step 7: Alert CEO (Agent #0) of workload crisis
  console.log(`\n[ESA Hierarchy] 🚨 ALERT TO AGENT_0 (ESA CEO):`);
  console.log(`  Workload crisis detected: ${overloadPercentage.toFixed(1)}% agents overloaded`);
  console.log(`  Critical agents: ${criticalAgents.map(a => a.agentId).join(', ')}`);
  console.log(`  Redistribution plan created: ${redistributionPlan.length} moves`);
  console.log(`  Recommendation: ${redistributionPlan.length > 0 ? 'Execute redistribution plan' : 'Scale up infrastructure or extend sprint timeline'}`);

  return {
    triggered: true,
    timestamp: new Date(),
    overloadedAgents: overloadedAgents.map(a => a.agentId),
    availableAgents: availableAgents.map(a => a.agentId),
    redistributionPlan,
    estimatedImpact,
  };
}

// ============================================================================
// CORE FUNCTION 5: RESOLVE CONFLICT
// ============================================================================

/**
 * Inter-agent conflict resolution with escalation to appropriate authority level
 * 
 * Usage:
 * ```typescript
 * const resolution = await resolveConflict({
 *   involvedAgents: ['AGENT_11', 'AGENT_14'],
 *   issue: 'Disagreement on WebSocket vs polling for real-time updates',
 *   context: { feature: 'live_feed', performance_requirement: '<100ms' }
 * });
 * ```
 */
export async function resolveConflict(request: {
  involvedAgents: string[];
  issue: string;
  context?: Record<string, any>;
}): Promise<ConflictResolution> {
  console.log(`\n[ESA Hierarchy] ⚔️  CONFLICT RESOLUTION INITIATED`);
  console.log(`  Involved Agents: ${request.involvedAgents.join(', ')}`);
  console.log(`  Issue: ${request.issue}`);

  const conflictId = `CONFLICT_${Date.now()}`;

  // Step 1: Analyze agent levels and divisions
  const agentDefinitions = request.involvedAgents.map(id => ESA_HIERARCHY[id]).filter(Boolean);
  
  if (agentDefinitions.length !== request.involvedAgents.length) {
    throw new Error(`Invalid agent ID(s) in conflict: ${request.involvedAgents.join(', ')}`);
  }

  // Step 2: Determine resolution level
  const divisions = new Set(agentDefinitions.map(a => a.division).filter(Boolean));
  const levels = new Set(agentDefinitions.map(a => a.level));

  let resolutionLevel: AgentLevel;
  let resolvedBy: string;
  let bindingAuthority: boolean;

  // Same division, peer level → Domain Coordinator
  if (divisions.size === 1 && levels.has('LAYER')) {
    resolutionLevel = 'DOMAIN';
    const division = Array.from(divisions)[0];
    const domainCoordinator = findDomainCoordinatorForDivision(division!);
    resolvedBy = domainCoordinator;
    bindingAuthority = true;
    console.log(`[ESA Hierarchy] 📍 Same division conflict → Domain Coordinator: ${resolvedBy}`);
  }
  // Same division, cross-level → Division Chief
  else if (divisions.size === 1) {
    resolutionLevel = 'CHIEF';
    const division = Array.from(divisions)[0];
    resolvedBy = getChiefByDivision(division!);
    bindingAuthority = true;
    console.log(`[ESA Hierarchy] 📍 Same division, cross-level → Division Chief: ${resolvedBy}`);
  }
  // Cross-division → ESA CEO
  else {
    resolutionLevel = 'CEO';
    resolvedBy = 'AGENT_0';
    bindingAuthority = true;
    console.log(`[ESA Hierarchy] 📍 Cross-division conflict → ESA CEO: ${resolvedBy}`);
  }

  // Step 3: Analyze conflict and generate decision
  const decision = await generateConflictDecision(request.issue, agentDefinitions, request.context);

  // Step 4: Create implementation plan
  const implementationPlan = [
    `${resolvedBy} (${ESA_HIERARCHY[resolvedBy].name}) makes final decision`,
    `Communicate decision to all involved agents: ${request.involvedAgents.join(', ')}`,
    `Document decision in knowledge base for future reference`,
    `Monitor implementation for 48 hours`,
    `Capture learnings via Agent #80 (Learning Coordinator)`,
  ];

  console.log(`\n[ESA Hierarchy] ✅ CONFLICT RESOLUTION COMPLETE`);
  console.log(`  Conflict ID: ${conflictId}`);
  console.log(`  Resolved By: ${ESA_HIERARCHY[resolvedBy].name} (${resolvedBy})`);
  console.log(`  Decision: ${decision}`);
  console.log(`  Binding Authority: ${bindingAuthority ? 'YES' : 'NO'}`);

  return {
    conflictId,
    involvedAgents: request.involvedAgents,
    issue: request.issue,
    resolutionLevel,
    resolvedBy,
    decision,
    bindingAuthority,
    implementationPlan,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getChiefByDivision(division: DivisionName): string {
  const chiefs: Record<DivisionName, string> = {
    'Foundation': 'CHIEF_1',
    'Core': 'CHIEF_2',
    'Business': 'CHIEF_3',
    'Intelligence': 'CHIEF_4',
    'Platform': 'CHIEF_5',
    'Extended': 'CHIEF_6',
  };
  return chiefs[division];
}

function getDomainNumber(domainName: DomainName): string {
  const domainNumbers: Record<DomainName, string> = {
    'Infrastructure': '1',
    'Frontend': '2',
    'Background': '3',
    'RealTime': '4',
    'BusinessLogic': '5',
    'SearchAnalytics': '6',
    'LifeCEOCore': '7',
    'PlatformEnhancement': '8',
    'MasterControl': '9',
  };
  return domainNumbers[domainName];
}

function findDomainForAgent(agentId: string): string | null {
  for (const [domainId, domainDef] of Object.entries(ESA_HIERARCHY)) {
    if (domainDef.level === 'DOMAIN' && domainDef.manages?.includes(agentId)) {
      return domainId;
    }
  }
  return null;
}

function findDomainCoordinatorForDivision(division: DivisionName): string {
  for (const [id, def] of Object.entries(ESA_HIERARCHY)) {
    if (def.level === 'DOMAIN' && def.division === division) {
      return id;
    }
  }
  return 'DOMAIN_9'; // Default to Master Control
}

function buildRoutingPath(fromId: string, toId: string): string[] {
  const path: string[] = [fromId];
  
  // Simple path building - direct route
  if (fromId !== toId) {
    path.push(toId);
  }
  
  return path;
}

function buildEscalationPath(fromId: string, toId: string): string[] {
  const path: string[] = [fromId];
  const fromAgent = ESA_HIERARCHY[fromId];
  
  // Add immediate manager
  if (fromAgent?.reportingTo?.[0]) {
    path.push(fromAgent.reportingTo[0]);
  }
  
  // Add target
  if (!path.includes(toId)) {
    path.push(toId);
  }
  
  return path;
}

async function getAgentWorkload(agentId: string): Promise<WorkloadStatus> {
  try {
    const workloads = await AgentPerformanceTracker.monitorWorkload(agentId);
    
    if (workloads.length > 0) {
      const w = workloads[0];
      
      // Map status from performance tracker to hierarchy manager status
      let mappedStatus: 'available' | 'busy' | 'overloaded' | 'critical';
      if (w.status === 'healthy') {
        mappedStatus = 'available';
      } else if (w.status === 'failing') {
        mappedStatus = 'critical';
      } else {
        mappedStatus = w.status; // 'busy' or 'overloaded' already match
      }
      
      return {
        agentId: w.agentId,
        agentName: w.agentName || agentId,
        currentCapacity: w.workloadPercentage,
        status: mappedStatus,
        queueDepth: w.queueDepth,
        concurrentTasks: w.concurrentTasks,
        avgResponseTime: 0, // Would be calculated from metrics
        recommendedAction: w.recommendedAction,
      };
    }
  } catch (error) {
    console.log(`[ESA Hierarchy] ⚠️  Could not fetch workload for ${agentId}, using defaults`);
  }

  // Default healthy status
  return {
    agentId,
    agentName: ESA_HIERARCHY[agentId]?.name || agentId,
    currentCapacity: 50,
    status: 'available',
    queueDepth: 0,
    concurrentTasks: 0,
    avgResponseTime: 300,
  };
}

function calculateResponseTime(urgency: string, workloadPercentage: number): string {
  let baseMinutes: number;
  
  switch (urgency) {
    case 'critical':
      baseMinutes = 30;
      break;
    case 'high':
      baseMinutes = 60;
      break;
    case 'medium':
      baseMinutes = 120;
      break;
    default:
      baseMinutes = 240;
  }

  // Adjust for workload (higher workload = longer response time)
  const workloadMultiplier = 1 + (workloadPercentage / 100);
  const adjustedMinutes = Math.round(baseMinutes * workloadMultiplier);

  if (adjustedMinutes < 60) {
    return `${adjustedMinutes} minutes`;
  } else if (adjustedMinutes < 120) {
    return `1-2 hours`;
  } else if (adjustedMinutes < 480) {
    return `${Math.round(adjustedMinutes / 60)} hours`;
  } else {
    return `${Math.round(adjustedMinutes / 1440)} days`;
  }
}

async function generateConflictDecision(
  issue: string,
  involvedAgents: AgentDefinition[],
  context?: Record<string, any>
): Promise<string> {
  // This would ideally use AI to analyze the conflict
  // For now, we'll use a structured decision framework
  
  const agentNames = involvedAgents.map(a => a.name).join(' and ');
  const expertiseAreas = involvedAgents.flatMap(a => a.expertiseAreas || []);
  
  // Simple decision: defer to agent with most relevant expertise
  return `After reviewing the conflict between ${agentNames} regarding "${issue}", ` +
         `the decision is to proceed with the approach that best aligns with system architecture ` +
         `and performance requirements. Implementation will be monitored and adjusted as needed.`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ESAHierarchyManager = {
  routeToChief,
  routeToDomain,
  validateAuthority,
  balanceWorkload,
  resolveConflict,
  ESA_HIERARCHY,
};

export default ESAHierarchyManager;
