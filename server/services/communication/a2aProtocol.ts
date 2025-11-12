import { EventEmitter } from 'events';
import { logInfo, logError, logDebug } from "../../../server/middleware/logger";

export enum AgentLevel {
  CEO = 1,           // Agent #0
  CHIEF = 2,         // 6 Division Chiefs
  DOMAIN = 3,        // 9 Domain Coordinators
  LAYER = 4,         // 61 Layer Agents
  EXPERT = 5,        // 7 Expert Agents
  LIFECEO = 6        // 16 Life CEO Agents
}

export enum MessagePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export enum MessageType {
  ESCALATION = 'ESCALATION',
  PEER_COLLABORATION = 'PEER_COLLABORATION',
  DIRECTIVE = 'DIRECTIVE',
  CONSULTATION = 'CONSULTATION',
  PERFORMANCE_UPDATE = 'PERFORMANCE_UPDATE',
  EMERGENCY = 'EMERGENCY',
  WORKLOAD_ALERT = 'WORKLOAD_ALERT',
  KNOWLEDGE_SHARE = 'KNOWLEDGE_SHARE',
  TASK_PLANNING = 'TASK_PLANNING',
  PROGRESS_TRACKING = 'PROGRESS_TRACKING'
}

export enum EscalationLevel {
  PEER = 1,           // Same layer/domain (30 min)
  CHIEF = 2,          // Division chief (1 hour)
  DOMAIN = 3,         // Domain coordinator (immediate)
  CEO = 4             // Agent #0 (2 hours)
}

export interface AgentMetrics {
  tasksCompleted: number;
  avgTaskDuration: number;
  errorRate: number;
  currentWorkload: number;
  maxCapacity: number;
  lastActive: string;
  cacheHitRate?: number;
}

export interface Agent {
  id: string;
  level: AgentLevel;
  division?: string;
  domain?: string;
  name: string;
  layerNumber?: number;
  reports_to?: string;
  manages?: string[];
  coordinates_with?: string[];
  consults?: string[];
  metrics?: AgentMetrics;
  expertise?: string[];
}

interface MessageContext {
  attemptedSolutions?: string[];
  blockingIssue?: string;
  impact?: string;
  suggestedAgents?: string[];
  situation?: string;
  options?: Array<{ name: string; pros: string[]; cons: string[]; supporters: string[] }>;
  recommendation?: string;
  previousAttempts?: string[];
  protocol?: EmergencyProtocol;
  affectedSystems?: string[];
  overloadedAgents?: string[];
  percentage?: number;
  threshold?: number;
  escalationLevel?: EscalationLevel;
  expertiseNeeded?: string[];
  knowledgeType?: string;
  taskSize?: string;
  dependencies?: string[];
  [key: string]: unknown;
}

interface MessageMetrics {
  responseTime?: number;
  completionTime?: number;
  successRate?: number;
  [key: string]: unknown;
}

export interface A2AMessage {
  messageId: string;
  type: MessageType;
  priority: MessagePriority;
  from: string;
  to: string[];
  subject: string;
  body: string;
  context?: MessageContext;
  metrics?: MessageMetrics;
  timestamp: string;
  responseRequired: boolean;
  responseDeadline?: string;
}

export interface EscalationRequest {
  agentId: string;
  issue: string;
  attemptedSolutions: string[];
  blockingIssue: string;
  helpNeeded: string;
  impact: string;
  suggestedAgents?: string[];
  priority: MessagePriority;
  escalationLevel?: EscalationLevel;
}

export interface EmergencyProtocol {
  triggered: boolean;
  reason: string;
  affectedAgents: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  coordinator: string;
}

export interface ConsultationRequest {
  from: string;
  expertiseNeeded: string[];
  topic: string;
  currentApproach?: string;
  specificQuestion: string;
  priority?: MessagePriority;
}

export interface KnowledgeShare {
  from: string;
  knowledgeType: 'lesson_learned' | 'best_practice' | 'optimization' | 'incident_report' | 'integration_guide';
  title: string;
  content: string;
  relevantAgents?: string[];
  tags?: string[];
}

export interface TaskPlanningRequest {
  from: string;
  taskDescription: string;
  feelingOverwhelmed: string;
  helpNeeded: 'breakdown' | 'timeline' | 'resources' | 'sprint_planning';
  estimatedSize?: 'small' | 'medium' | 'large' | 'epic';
  dependencies?: string[];
}

class A2AProtocolService extends EventEmitter {
  private agents: Map<string, Agent>;
  private messageLog: A2AMessage[];
  private emergencyThreshold: number = 0.5;
  private workloadThreshold: number = 0.8;
  private knowledgeBase: Map<string, KnowledgeShare[]>;

  constructor() {
    super();
    this.agents = new Map();
    this.messageLog = [];
    this.knowledgeBase = new Map();
    this.initializeAgentHierarchy();
  }

  private initializeAgentHierarchy(): void {
    // Level 1: CEO
    this.agents.set('AGENT_0', {
      id: 'AGENT_0',
      level: AgentLevel.CEO,
      name: 'ESA CEO/Orchestrator',
      manages: ['CHIEF_1', 'CHIEF_2', 'CHIEF_3', 'CHIEF_4', 'CHIEF_5', 'CHIEF_6', 'DOMAIN_9'],
      expertise: ['strategic_planning', 'framework_governance', 'conflict_resolution', 'emergency_intervention']
    });

    // Level 2: 6 Division Chiefs
    this.agents.set('CHIEF_1', {
      id: 'CHIEF_1',
      level: AgentLevel.CHIEF,
      division: 'Foundation',
      name: 'Foundation Division Chief (Layers 1-10)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_1', 'DOMAIN_2', 'AGENT_1', 'AGENT_2', 'AGENT_3', 'AGENT_4', 'AGENT_5', 'AGENT_6', 'AGENT_7', 'AGENT_8', 'AGENT_9', 'AGENT_10'],
      coordinates_with: ['CHIEF_2', 'CHIEF_3', 'CHIEF_4', 'CHIEF_5', 'CHIEF_6'],
      consults: ['EXPERT_11']
    });

    this.agents.set('CHIEF_2', {
      id: 'CHIEF_2',
      level: AgentLevel.CHIEF,
      division: 'Core',
      name: 'Core Division Chief (Layers 11-20)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_3', 'DOMAIN_4', 'AGENT_11', 'AGENT_12', 'AGENT_13', 'AGENT_14', 'AGENT_15', 'AGENT_16', 'AGENT_17', 'AGENT_18', 'AGENT_19', 'AGENT_20'],
      coordinates_with: ['CHIEF_1', 'CHIEF_3', 'CHIEF_4', 'CHIEF_5', 'CHIEF_6'],
      consults: ['EXPERT_12', 'EXPERT_13']
    });

    this.agents.set('CHIEF_3', {
      id: 'CHIEF_3',
      level: AgentLevel.CHIEF,
      division: 'Business',
      name: 'Business Division Chief (Layers 21-30)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_5', 'DOMAIN_6', 'AGENT_21', 'AGENT_22', 'AGENT_23', 'AGENT_24', 'AGENT_25', 'AGENT_26', 'AGENT_27', 'AGENT_28', 'AGENT_29', 'AGENT_30'],
      coordinates_with: ['CHIEF_1', 'CHIEF_2', 'CHIEF_4', 'CHIEF_5', 'CHIEF_6']
    });

    this.agents.set('CHIEF_4', {
      id: 'CHIEF_4',
      level: AgentLevel.CHIEF,
      division: 'Intelligence',
      name: 'Intelligence Division Chief (Layers 31-46)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_7', 'AGENT_31', 'AGENT_32', 'AGENT_33', 'AGENT_34', 'AGENT_35', 'AGENT_36', 'AGENT_37', 'AGENT_38', 'AGENT_39', 'AGENT_40', 'AGENT_41', 'AGENT_42', 'AGENT_43', 'AGENT_44', 'AGENT_45', 'AGENT_46'],
      coordinates_with: ['CHIEF_1', 'CHIEF_2', 'CHIEF_3', 'CHIEF_5', 'CHIEF_6'],
      consults: ['EXPERT_10']
    });

    this.agents.set('CHIEF_5', {
      id: 'CHIEF_5',
      level: AgentLevel.CHIEF,
      division: 'Platform',
      name: 'Platform Division Chief (Layers 47-56)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_8', 'AGENT_47', 'AGENT_48', 'AGENT_49', 'AGENT_50', 'AGENT_51', 'AGENT_52', 'AGENT_53', 'AGENT_54', 'AGENT_55', 'AGENT_56'],
      coordinates_with: ['CHIEF_1', 'CHIEF_2', 'CHIEF_3', 'CHIEF_4', 'CHIEF_6'],
      consults: ['EXPERT_14', 'EXPERT_15', 'EXPERT_16']
    });

    this.agents.set('CHIEF_6', {
      id: 'CHIEF_6',
      level: AgentLevel.CHIEF,
      division: 'Extended',
      name: 'Extended Division Chief (Layers 57-61)',
      reports_to: 'AGENT_0',
      manages: ['DOMAIN_9', 'AGENT_57', 'AGENT_58', 'AGENT_59', 'AGENT_60', 'AGENT_61'],
      coordinates_with: ['CHIEF_1', 'CHIEF_2', 'CHIEF_3', 'CHIEF_4', 'CHIEF_5']
    });

    // Level 3: 9 Domain Coordinators
    const domainConfigs = [
      { id: 'DOMAIN_1', chief: 'CHIEF_1', name: 'Infrastructure Orchestrator', agents: ['AGENT_1', 'AGENT_3', 'AGENT_14'] },
      { id: 'DOMAIN_2', chief: 'CHIEF_1', name: 'Frontend Coordinator', agents: ['AGENT_8', 'AGENT_9', 'AGENT_10'] },
      { id: 'DOMAIN_3', chief: 'CHIEF_2', name: 'Background Processor', agents: ['AGENT_12', 'AGENT_20'] },
      { id: 'DOMAIN_4', chief: 'CHIEF_2', name: 'Real-time Communications', agents: ['AGENT_11', 'AGENT_25'] },
      { id: 'DOMAIN_5', chief: 'CHIEF_3', name: 'Business Logic Manager', agents: Array.from({length: 10}, (_, i) => `AGENT_${21 + i}`) },
      { id: 'DOMAIN_6', chief: 'CHIEF_3', name: 'Search & Analytics', agents: ['AGENT_15', 'AGENT_18', 'AGENT_26'] },
      { id: 'DOMAIN_7', chief: 'CHIEF_4', name: 'Life CEO Core', agents: Array.from({length: 16}, (_, i) => `AGENT_${31 + i}`) },
      { id: 'DOMAIN_8', chief: 'CHIEF_5', name: 'Platform Enhancement', agents: Array.from({length: 10}, (_, i) => `AGENT_${47 + i}`) },
      { id: 'DOMAIN_9', chief: 'CHIEF_6', name: 'Master Control', agents: Array.from({length: 5}, (_, i) => `AGENT_${57 + i}`) }
    ];

    domainConfigs.forEach(config => {
      this.agents.set(config.id, {
        id: config.id,
        level: AgentLevel.DOMAIN,
        domain: config.name,
        name: config.name,
        reports_to: config.chief,
        manages: config.agents
      });
    });

    // Level 4: 61 Layer Agents
    const layerAgents = [
      // Foundation Division (1-10)
      { id: 'AGENT_1', name: 'Database Layer', division: 'Foundation', domain: 'Infrastructure', chief: 'CHIEF_1', domainCoord: 'DOMAIN_1' },
      { id: 'AGENT_2', name: 'API Structure', division: 'Foundation', chief: 'CHIEF_1' },
      { id: 'AGENT_3', name: 'Background Jobs', division: 'Foundation', domain: 'Infrastructure', chief: 'CHIEF_1', domainCoord: 'DOMAIN_1' },
      { id: 'AGENT_4', name: 'Authentication', division: 'Foundation', chief: 'CHIEF_1' },
      { id: 'AGENT_5', name: 'Authorization', division: 'Foundation', chief: 'CHIEF_1' },
      { id: 'AGENT_6', name: 'Session Management', division: 'Foundation', chief: 'CHIEF_1' },
      { id: 'AGENT_7', name: 'File Management', division: 'Foundation', chief: 'CHIEF_1' },
      { id: 'AGENT_8', name: 'Client Framework', division: 'Foundation', domain: 'Frontend', chief: 'CHIEF_1', domainCoord: 'DOMAIN_2' },
      { id: 'AGENT_9', name: 'State Management', division: 'Foundation', domain: 'Frontend', chief: 'CHIEF_1', domainCoord: 'DOMAIN_2' },
      { id: 'AGENT_10', name: 'Component Library', division: 'Foundation', domain: 'Frontend', chief: 'CHIEF_1', domainCoord: 'DOMAIN_2' },
      
      // Core Division (11-20)
      { id: 'AGENT_11', name: 'Real-time Features', division: 'Core', domain: 'RealTime', chief: 'CHIEF_2', domainCoord: 'DOMAIN_4' },
      { id: 'AGENT_12', name: 'Email Service', division: 'Core', domain: 'Background', chief: 'CHIEF_2', domainCoord: 'DOMAIN_3' },
      { id: 'AGENT_13', name: 'File Storage', division: 'Core', chief: 'CHIEF_2' },
      { id: 'AGENT_14', name: 'Caching Strategy', division: 'Core', domain: 'Infrastructure', chief: 'CHIEF_2', domainCoord: 'DOMAIN_1' },
      { id: 'AGENT_15', name: 'Search Functionality', division: 'Core', domain: 'SearchAnalytics', chief: 'CHIEF_2', domainCoord: 'DOMAIN_6' },
      { id: 'AGENT_16', name: 'Notifications', division: 'Core', chief: 'CHIEF_2' },
      { id: 'AGENT_17', name: 'Logging & Monitoring', division: 'Core', chief: 'CHIEF_2' },
      { id: 'AGENT_18', name: 'Reporting & Analytics', division: 'Core', domain: 'SearchAnalytics', chief: 'CHIEF_2', domainCoord: 'DOMAIN_6' },
      { id: 'AGENT_19', name: 'Content Management', division: 'Core', chief: 'CHIEF_2' },
      { id: 'AGENT_20', name: 'Data Validation', division: 'Core', domain: 'Background', chief: 'CHIEF_2', domainCoord: 'DOMAIN_3' },
      
      // Business Division (21-30)
      { id: 'AGENT_21', name: 'User Management', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_22', name: 'Profile System', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_23', name: 'Community Features', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_24', name: 'Social Features', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_25', name: 'Messaging', division: 'Business', domain: 'RealTime', chief: 'CHIEF_3', domainCoord: 'DOMAIN_4' },
      { id: 'AGENT_26', name: 'Events System', division: 'Business', domain: 'SearchAnalytics', chief: 'CHIEF_3', domainCoord: 'DOMAIN_6' },
      { id: 'AGENT_27', name: 'Groups & Organizations', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_28', name: 'Payment Processing', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_29', name: 'Subscription Management', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      { id: 'AGENT_30', name: 'Marketplace', division: 'Business', domain: 'BusinessLogic', chief: 'CHIEF_3', domainCoord: 'DOMAIN_5' },
      
      // Intelligence Division (31-46) - Life CEO agents
      { id: 'AGENT_31', name: 'Core AI Agent', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_32', name: 'Prompt Engineering', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_33', name: 'Context Management', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_34', name: 'Voice & Speech', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_35', name: 'AI Agent Management', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_36', name: 'Memory Systems', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_37', name: 'Learning & Adaptation', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_38', name: 'Personality System', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_39', name: 'Decision Support', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_40', name: 'Task Automation', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_41', name: 'Recommendation Engine', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_42', name: 'Natural Language Processing', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_43', name: 'Sentiment Analysis', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_44', name: 'Knowledge Graph', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_45', name: 'Vision & Image Recognition', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      { id: 'AGENT_46', name: 'Multi-AI Orchestration', division: 'Intelligence', domain: 'LifeCEOCore', chief: 'CHIEF_4', domainCoord: 'DOMAIN_7' },
      
      // Platform Division (47-56)
      { id: 'AGENT_47', name: 'Error Handling', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_48', name: 'Performance Optimization', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_49', name: 'Security', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_50', name: 'Rate Limiting', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_51', name: 'Testing Infrastructure', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_52', name: 'Documentation', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_53', name: 'Internationalization', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_54', name: 'Accessibility', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_55', name: 'Developer Tools', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      { id: 'AGENT_56', name: 'Build & Deployment', division: 'Platform', domain: 'PlatformEnhancement', chief: 'CHIEF_5', domainCoord: 'DOMAIN_8' },
      
      // Extended Division (57-61)
      { id: 'AGENT_57', name: 'Visual Editor', division: 'Extended', domain: 'MasterControl', chief: 'CHIEF_6', domainCoord: 'DOMAIN_9' },
      { id: 'AGENT_58', name: 'Admin Dashboard', division: 'Extended', domain: 'MasterControl', chief: 'CHIEF_6', domainCoord: 'DOMAIN_9' },
      { id: 'AGENT_59', name: 'System Health', division: 'Extended', domain: 'MasterControl', chief: 'CHIEF_6', domainCoord: 'DOMAIN_9' },
      { id: 'AGENT_60', name: 'Metrics & KPIs', division: 'Extended', domain: 'MasterControl', chief: 'CHIEF_6', domainCoord: 'DOMAIN_9' },
      { id: 'AGENT_61', name: 'Feature Flags', division: 'Extended', domain: 'MasterControl', chief: 'CHIEF_6', domainCoord: 'DOMAIN_9' },
      
      // Task Coordination Agents
      { id: 'AGENT_63', name: 'Sprint Manager', division: 'Extended', chief: 'CHIEF_6' },
      { id: 'AGENT_65', name: 'Project Tracker', division: 'Extended', chief: 'CHIEF_6' }
    ];

    layerAgents.forEach((config, index) => {
      this.agents.set(config.id, {
        id: config.id,
        level: AgentLevel.LAYER,
        name: config.name,
        division: config.division,
        domain: config.domain,
        layerNumber: index + 1,
        reports_to: config.domainCoord || config.chief,
        coordinates_with: this.findPeerAgents(config.id, config.division, config.domain)
      });
    });

    // Level 5: 7 Expert Agents
    const expertConfigs = [
      { id: 'EXPERT_10', chief: 'CHIEF_4', name: 'AI Research Expert', expertise: ['ai_trends', 'ml_research', 'llm_optimization'] },
      { id: 'EXPERT_11', chief: 'CHIEF_1', name: 'UI/UX Design (Aurora) Expert', expertise: ['design_systems', 'accessibility', 'user_experience'], manages: ['EXPERT_16'] },
      { id: 'EXPERT_12', chief: 'CHIEF_2', name: 'Data Visualization Expert', expertise: ['charts', 'dashboards', 'analytics_ui'] },
      { id: 'EXPERT_13', chief: 'CHIEF_2', name: 'Content & Media Expert', expertise: ['media_optimization', 'cdn', 'streaming'] },
      { id: 'EXPERT_14', chief: 'CHIEF_5', name: 'Code Quality Expert', expertise: ['code_review', 'best_practices', 'refactoring'] },
      { id: 'EXPERT_15', chief: 'CHIEF_5', name: 'Developer Experience Expert', expertise: ['dx_improvement', 'tooling', 'productivity'] },
      { id: 'EXPERT_16', chief: 'EXPERT_11', name: 'Translation & i18n Expert', expertise: ['localization', 'translation', 'multi_language'] }
    ];

    expertConfigs.forEach(config => {
      this.agents.set(config.id, {
        id: config.id,
        level: AgentLevel.EXPERT,
        name: config.name,
        reports_to: config.chief,
        manages: config.manages,
        expertise: config.expertise
      });
    });

    // Level 6: 16 Life CEO Sub-Agents
    const lifeCEOAgents = [
      { id: 'LIFECEO_HEALTH', name: 'Health Agent', domain: 'health_wellness' },
      { id: 'LIFECEO_FITNESS', name: 'Fitness Agent', domain: 'fitness_exercise' },
      { id: 'LIFECEO_NUTRITION', name: 'Nutrition Agent', domain: 'nutrition_diet' },
      { id: 'LIFECEO_SLEEP', name: 'Sleep Agent', domain: 'sleep_recovery' },
      { id: 'LIFECEO_STRESS', name: 'Stress Management Agent', domain: 'stress_mental_health' },
      { id: 'LIFECEO_FINANCE', name: 'Finance Agent', domain: 'finance_budgeting' },
      { id: 'LIFECEO_CAREER', name: 'Career Agent', domain: 'career_professional_dev' },
      { id: 'LIFECEO_LEARNING', name: 'Learning Agent', domain: 'learning_education' },
      { id: 'LIFECEO_PRODUCTIVITY', name: 'Productivity Agent', domain: 'productivity_time_mgmt' },
      { id: 'LIFECEO_SOCIAL', name: 'Social Agent', domain: 'social_relationships' },
      { id: 'LIFECEO_RELATIONSHIP', name: 'Relationship Agent', domain: 'relationships_family' },
      { id: 'LIFECEO_HOME', name: 'Home Management Agent', domain: 'home_organization' },
      { id: 'LIFECEO_TRAVEL', name: 'Travel Agent', domain: 'travel_planning' },
      { id: 'LIFECEO_ENTERTAINMENT', name: 'Entertainment Agent', domain: 'entertainment_hobbies' },
      { id: 'LIFECEO_CREATIVITY', name: 'Creativity Agent', domain: 'creativity_arts' },
      { id: 'LIFECEO_WELLNESS', name: 'Wellness Agent', domain: 'holistic_wellness' }
    ];

    lifeCEOAgents.forEach(config => {
      this.agents.set(config.id, {
        id: config.id,
        level: AgentLevel.LIFECEO,
        name: config.name,
        division: 'Intelligence',
        domain: 'LifeCEOCore',
        reports_to: 'DOMAIN_7',
        coordinates_with: lifeCEOAgents.filter(a => a.id !== config.id).map(a => a.id).slice(0, 3),
        expertise: [config.domain]
      });
    });
  }

  private findPeerAgents(agentId: string, division?: string, domain?: string): string[] {
    const peers: string[] = [];
    
    for (const [id, agent] of this.agents) {
      if (id === agentId) continue;
      
      if (domain && agent.domain === domain && agent.level === AgentLevel.LAYER) {
        peers.push(id);
      } else if (division && agent.division === division && agent.level === AgentLevel.LAYER) {
        if (peers.length < 3) peers.push(id);
      }
    }
    
    return peers.slice(0, 5);
  }

  public async escalateToChief(request: EscalationRequest): Promise<A2AMessage> {
    const agent = this.agents.get(request.agentId);
    if (!agent) {
      const error = new Error(`Agent ${request.agentId} not found`);
      logError(error, { agentId: request.agentId, context: 'Escalate to chief' });
      throw error;
    }

    const chief = this.findChief(request.agentId);
    if (!chief) {
      const error = new Error(`No chief found for agent ${request.agentId}`);
      logError(error, { agentId: request.agentId, context: 'Escalate to chief' });
      throw error;
    }

    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.ESCALATION,
      priority: request.priority,
      from: request.agentId,
      to: [chief.id],
      subject: `Escalation Request - Resource/Coordination Needed`,
      body: this.formatEscalationMessage(request),
      context: {
        attemptedSolutions: request.attemptedSolutions,
        blockingIssue: request.blockingIssue,
        impact: request.impact,
        suggestedAgents: request.suggestedAgents,
        escalationLevel: EscalationLevel.CHIEF
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(request.priority, 60)
    };

    logInfo('Escalation to chief created', {
      from: request.agentId,
      to: chief.id,
      priority: request.priority,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('escalation', message);

    return message;
  }

  public async escalateToCEO(escalationData: {
    from: string;
    situation: string;
    options: Array<{ name: string; pros: string[]; cons: string[]; supporters: string[] }>;
    recommendation?: string;
    decisionNeededBy: string;
    impactIfUnresolved: string;
    previousAttempts: string[];
  }): Promise<A2AMessage> {
    const fromAgent = this.agents.get(escalationData.from);
    if (!fromAgent || (fromAgent.level !== AgentLevel.CHIEF && fromAgent.level !== AgentLevel.DOMAIN)) {
      const error = new Error('Only Chiefs and Domain Coordinators can escalate to CEO');
      logError(error, { from: escalationData.from, context: 'Escalate to CEO' });
      throw error;
    }

    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.ESCALATION,
      priority: MessagePriority.CRITICAL,
      from: escalationData.from,
      to: ['AGENT_0'],
      subject: `Strategic Decision Required - CEO Escalation`,
      body: this.formatCEOEscalation(escalationData),
      context: {
        situation: escalationData.situation,
        options: escalationData.options,
        recommendation: escalationData.recommendation,
        previousAttempts: escalationData.previousAttempts,
        escalationLevel: EscalationLevel.CEO
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: escalationData.decisionNeededBy
    };

    logInfo('Strategic escalation to CEO created', {
      from: escalationData.from,
      situation: escalationData.situation,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('ceo_escalation', message);

    return message;
  }

  public async peerCollaboration(request: {
    from: string;
    to: string;
    topic: string;
    currentApproach: string;
    specificHelp: string;
    context?: string;
    priority?: MessagePriority;
  }): Promise<A2AMessage> {
    if (!this.validatePeerRelationship(request.from, request.to)) {
      const error = new Error('Agents are not peers or related enough for direct collaboration');
      logError(error, { from: request.from, to: request.to, context: 'Peer collaboration' });
      throw error;
    }

    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.PEER_COLLABORATION,
      priority: request.priority || MessagePriority.MEDIUM,
      from: request.from,
      to: [request.to],
      subject: `Assistance Request - ${request.topic}`,
      body: `
CURRENT TASK: ${request.topic}
MY APPROACH SO FAR: ${request.currentApproach}
SPECIFIC HELP NEEDED: ${request.specificHelp}
${request.context ? `CONTEXT: ${request.context}` : ''}
      `.trim(),
      context: {
        escalationLevel: EscalationLevel.PEER
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(request.priority || MessagePriority.MEDIUM, 30)
    };

    logDebug('Peer collaboration request created', {
      from: request.from,
      to: request.to,
      topic: request.topic,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('peer_collaboration', message);

    return message;
  }

  public async consultExpert(request: ConsultationRequest): Promise<A2AMessage> {
    const relevantExperts = this.findExpertsByExpertise(request.expertiseNeeded);
    
    if (relevantExperts.length === 0) {
      const error = new Error(`No experts found for expertise: ${request.expertiseNeeded.join(', ')}`);
      logError(error, { from: request.from, expertise: request.expertiseNeeded, context: 'Consult expert' });
      throw error;
    }

    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.CONSULTATION,
      priority: request.priority || MessagePriority.MEDIUM,
      from: request.from,
      to: relevantExperts,
      subject: `Expert Consultation - ${request.topic}`,
      body: `
TOPIC: ${request.topic}
${request.currentApproach ? `CURRENT APPROACH: ${request.currentApproach}` : ''}
SPECIFIC QUESTION: ${request.specificQuestion}
EXPERTISE NEEDED: ${request.expertiseNeeded.join(', ')}
      `.trim(),
      context: {
        expertiseNeeded: request.expertiseNeeded
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(request.priority || MessagePriority.MEDIUM, 60)
    };

    logInfo('Expert consultation request created', {
      from: request.from,
      experts: relevantExperts,
      expertise: request.expertiseNeeded,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('expert_consultation', message);

    return message;
  }

  public async shareKnowledge(knowledge: KnowledgeShare): Promise<void> {
    const recipients = knowledge.relevantAgents || this.findRelevantAgentsForKnowledge(knowledge);

    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.KNOWLEDGE_SHARE,
      priority: MessagePriority.LOW,
      from: knowledge.from,
      to: recipients,
      subject: `Knowledge Share - ${knowledge.title}`,
      body: knowledge.content,
      context: {
        knowledgeType: knowledge.knowledgeType
      },
      timestamp: new Date().toISOString(),
      responseRequired: false
    };

    const knowledgeKey = knowledge.knowledgeType;
    if (!this.knowledgeBase.has(knowledgeKey)) {
      this.knowledgeBase.set(knowledgeKey, []);
    }
    this.knowledgeBase.get(knowledgeKey)!.push(knowledge);

    logInfo('Knowledge shared', {
      from: knowledge.from,
      type: knowledge.knowledgeType,
      title: knowledge.title,
      recipientCount: recipients.length,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('knowledge_share', { message, knowledge });
  }

  public async requestTaskPlanning(request: TaskPlanningRequest): Promise<A2AMessage> {
    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.TASK_PLANNING,
      priority: MessagePriority.HIGH,
      from: request.from,
      to: ['AGENT_63'],
      subject: `Task Planning Assistance - ${request.taskDescription.substring(0, 50)}`,
      body: `
CURRENT TASK: ${request.taskDescription}
FEELING OVERWHELMED BECAUSE: ${request.feelingOverwhelmed}
HELP NEEDED: ${request.helpNeeded}
${request.estimatedSize ? `ESTIMATED SIZE: ${request.estimatedSize}` : ''}
${request.dependencies ? `DEPENDENCIES: ${request.dependencies.join(', ')}` : ''}
      `.trim(),
      context: {
        taskSize: request.estimatedSize,
        dependencies: request.dependencies
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(MessagePriority.HIGH, 60)
    };

    logInfo('Task planning assistance requested', {
      from: request.from,
      helpNeeded: request.helpNeeded,
      size: request.estimatedSize,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('task_planning', message);

    return message;
  }

  public async requestProgressTracking(request: {
    from: string;
    taskDescription: string;
    trackingNeed: 'dependency_mapping' | 'progress_visualization' | 'status_reporting' | 'cross_agent_coordination';
    relatedAgents?: string[];
    timeline?: string;
    currentStatus?: string;
  }): Promise<A2AMessage> {
    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.PROGRESS_TRACKING,
      priority: MessagePriority.MEDIUM,
      from: request.from,
      to: ['AGENT_65'],
      subject: `Tracking Assistance - ${request.taskDescription.substring(0, 50)}`,
      body: `
CURRENT TASK: ${request.taskDescription}
TRACKING NEED: ${request.trackingNeed}
${request.relatedAgents ? `RELATED AGENTS: ${request.relatedAgents.join(', ')}` : ''}
${request.timeline ? `TIMELINE: ${request.timeline}` : ''}
${request.currentStatus ? `CURRENT STATUS: ${request.currentStatus}` : ''}
      `.trim(),
      context: {
        dependencies: request.relatedAgents
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(MessagePriority.MEDIUM, 60)
    };

    logInfo('Progress tracking assistance requested', {
      from: request.from,
      trackingNeed: request.trackingNeed,
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('progress_tracking', message);

    return message;
  }

  public async emergencyIntervention(emergency: {
    triggeredBy: string;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedSystems: string[];
    immediateAction: string;
  }): Promise<EmergencyProtocol> {
    const protocol: EmergencyProtocol = {
      triggered: true,
      reason: emergency.reason,
      affectedAgents: this.identifyAffectedAgents(emergency.affectedSystems),
      severity: emergency.severity,
      action: emergency.immediateAction,
      coordinator: 'AGENT_0'
    };

    const emergencyMessage: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.EMERGENCY,
      priority: MessagePriority.EMERGENCY,
      from: emergency.triggeredBy,
      to: ['AGENT_0', 'DOMAIN_9', ...this.getAllChiefs()],
      subject: `EMERGENCY ESCALATION - ${emergency.reason}`,
      body: this.formatEmergencyMessage(emergency),
      context: {
        protocol,
        affectedSystems: emergency.affectedSystems,
        escalationLevel: EscalationLevel.CEO
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(MessagePriority.EMERGENCY, 5)
    };

    logInfo('Emergency intervention triggered', {
      triggeredBy: emergency.triggeredBy,
      reason: emergency.reason,
      severity: emergency.severity,
      affectedAgentsCount: protocol.affectedAgents.length,
      messageId: emergencyMessage.messageId
    });

    this.logMessage(emergencyMessage);
    this.emit('emergency', { message: emergencyMessage, protocol });

    return protocol;
  }

  public validateAuthority(agentId: string, action: string, targetAgentId?: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    switch (action) {
      case 'ESCALATE_TO_CHIEF':
        return agent.level === AgentLevel.LAYER || agent.level === AgentLevel.EXPERT || agent.level === AgentLevel.LIFECEO;
      
      case 'ESCALATE_TO_CEO':
        return agent.level === AgentLevel.CHIEF || agent.level === AgentLevel.DOMAIN;
      
      case 'ISSUE_DIRECTIVE':
        return agent.level <= AgentLevel.CHIEF;
      
      case 'PEER_COLLABORATE':
        if (!targetAgentId) return false;
        return this.validatePeerRelationship(agentId, targetAgentId);
      
      case 'EMERGENCY_PROTOCOL':
        return true;
      
      case 'CONSULT_EXPERT':
        return agent.level === AgentLevel.LAYER || agent.level === AgentLevel.DOMAIN;
      
      case 'SHARE_KNOWLEDGE':
        return true;
      
      case 'REQUEST_TASK_PLANNING':
        return agent.level === AgentLevel.LAYER || agent.level === AgentLevel.DOMAIN;
      
      default:
        return false;
    }
  }

  public async routeMessage(message: Partial<A2AMessage>): Promise<A2AMessage> {
    const fromAgent = this.agents.get(message.from!);
    if (!fromAgent) {
      const error = new Error(`Source agent ${message.from} not found`);
      logError(error, { from: message.from, context: 'Route message' });
      throw error;
    }

    let recipients: string[] = [];

    if (message.type === MessageType.ESCALATION) {
      if (fromAgent.level === AgentLevel.LAYER || fromAgent.level === AgentLevel.EXPERT || fromAgent.level === AgentLevel.LIFECEO) {
        const chief = this.findChief(message.from!);
        recipients = chief ? [chief.id] : [];
      } else if (fromAgent.level === AgentLevel.CHIEF || fromAgent.level === AgentLevel.DOMAIN) {
        recipients = ['AGENT_0'];
      }
    } else if (message.type === MessageType.EMERGENCY) {
      recipients = ['AGENT_0', 'DOMAIN_9', ...this.getAllChiefs()];
    } else if (message.type === MessageType.PEER_COLLABORATION && message.to && message.to.length > 0) {
      recipients = message.to;
    } else if (message.type === MessageType.CONSULTATION) {
      const expertiseNeeded = message.context?.expertiseNeeded as string[] || [];
      recipients = this.findExpertsByExpertise(expertiseNeeded);
    } else if (message.type === MessageType.DIRECTIVE) {
      if (fromAgent.manages) {
        recipients = fromAgent.manages;
      }
    } else if (message.type === MessageType.TASK_PLANNING) {
      recipients = ['AGENT_63'];
    } else if (message.type === MessageType.PROGRESS_TRACKING) {
      recipients = ['AGENT_65'];
    }

    const routedMessage: A2AMessage = {
      messageId: message.messageId || this.generateMessageId(),
      type: message.type!,
      priority: message.priority || MessagePriority.MEDIUM,
      from: message.from!,
      to: recipients,
      subject: message.subject || 'Communication',
      body: message.body || '',
      context: message.context,
      timestamp: message.timestamp || new Date().toISOString(),
      responseRequired: message.responseRequired || false,
      responseDeadline: message.responseDeadline
    };

    logDebug('Message routed', {
      from: message.from,
      to: recipients,
      type: message.type,
      messageId: routedMessage.messageId
    });

    this.logMessage(routedMessage);
    this.emit('message_routed', routedMessage);

    return routedMessage;
  }

  public async checkWorkloadBalance(): Promise<{
    overloadedAgents: string[];
    percentage: number;
    emergencyRequired: boolean;
  }> {
    const allAgents = Array.from(this.agents.values()).filter(
      a => a.level === AgentLevel.LAYER || a.level === AgentLevel.EXPERT
    );

    const overloadedAgents = allAgents.filter(agent => {
      if (!agent.metrics) return false;
      return (agent.metrics.currentWorkload / agent.metrics.maxCapacity) >= this.workloadThreshold;
    });

    const percentage = allAgents.length > 0 ? overloadedAgents.length / allAgents.length : 0;
    const emergencyRequired = percentage >= this.emergencyThreshold;

    logDebug('Workload balance checked', {
      totalAgents: allAgents.length,
      overloadedCount: overloadedAgents.length,
      percentage: percentage * 100,
      emergencyRequired
    });

    if (emergencyRequired) {
      await this.triggerWorkloadEmergency(overloadedAgents.map(a => a.id), percentage);
    }

    return {
      overloadedAgents: overloadedAgents.map(a => a.id),
      percentage,
      emergencyRequired
    };
  }

  private async triggerWorkloadEmergency(agentIds: string[], percentage: number): Promise<void> {
    const message: A2AMessage = {
      messageId: this.generateMessageId(),
      type: MessageType.WORKLOAD_ALERT,
      priority: MessagePriority.CRITICAL,
      from: 'DOMAIN_9',
      to: ['AGENT_0'],
      subject: 'System-Wide Workload Emergency',
      body: `
WORKLOAD THRESHOLD EXCEEDED

AFFECTED AGENTS: ${agentIds.length} (${(percentage * 100).toFixed(1)}% of workforce)
THRESHOLD: ${this.emergencyThreshold * 100}%
OVERLOADED AGENTS: ${agentIds.join(', ')}

RECOMMENDED ACTIONS:
1. Delay non-critical work
2. Extend current sprint timeline
3. Allocate additional resources
4. Optimize critical path workflows

IMMEDIATE ATTENTION REQUIRED
      `.trim(),
      context: {
        overloadedAgents: agentIds,
        percentage,
        threshold: this.emergencyThreshold,
        escalationLevel: EscalationLevel.CEO
      },
      timestamp: new Date().toISOString(),
      responseRequired: true,
      responseDeadline: this.calculateDeadline(MessagePriority.CRITICAL, 120)
    };

    logInfo('Workload emergency triggered', {
      affectedAgents: agentIds.length,
      percentage: (percentage * 100).toFixed(1),
      messageId: message.messageId
    });

    this.logMessage(message);
    this.emit('workload_emergency', message);
  }

  private findChief(agentId: string): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;

    if (agent.level === AgentLevel.CHIEF) {
      return agent;
    }

    if (agent.reports_to) {
      const superior = this.agents.get(agent.reports_to);
      if (superior && superior.level === AgentLevel.CHIEF) {
        return superior;
      }
      if (superior && superior.reports_to) {
        return this.findChief(superior.id);
      }
    }

    return undefined;
  }

  private validatePeerRelationship(agentId1: string, agentId2: string): boolean {
    const agent1 = this.agents.get(agentId1);
    const agent2 = this.agents.get(agentId2);

    if (!agent1 || !agent2) return false;

    if (agent1.level === agent2.level) return true;

    if (agent1.coordinates_with?.includes(agentId2)) return true;
    if (agent2.coordinates_with?.includes(agentId1)) return true;

    if (agent1.reports_to === agent2.reports_to) return true;

    const agent1Domain = this.findDomain(agentId1);
    const agent2Domain = this.findDomain(agentId2);
    if (agent1Domain && agent2Domain && agent1Domain.id === agent2Domain.id) return true;

    return false;
  }

  private findDomain(agentId: string): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;

    if (agent.level === AgentLevel.DOMAIN) return agent;

    if (agent.reports_to) {
      const superior = this.agents.get(agent.reports_to);
      if (superior && superior.level === AgentLevel.DOMAIN) {
        return superior;
      }
    }

    for (const [_, domain] of this.agents) {
      if (domain.level === AgentLevel.DOMAIN && domain.manages?.includes(agentId)) {
        return domain;
      }
    }

    return undefined;
  }

  private identifyAffectedAgents(systems: string[]): string[] {
    const affected: Set<string> = new Set();

    systems.forEach(system => {
      for (const [id, agent] of this.agents) {
        if (agent.name.toLowerCase().includes(system.toLowerCase()) ||
            agent.domain?.toLowerCase().includes(system.toLowerCase()) ||
            agent.division?.toLowerCase().includes(system.toLowerCase())) {
          affected.add(id);
        }
      }
    });

    return Array.from(affected);
  }

  private getAllChiefs(): string[] {
    return Array.from(this.agents.values())
      .filter(a => a.level === AgentLevel.CHIEF)
      .map(a => a.id);
  }

  private findExpertsByExpertise(expertiseNeeded: string[]): string[] {
    const experts = Array.from(this.agents.values()).filter(a => a.level === AgentLevel.EXPERT);
    
    return experts
      .filter(expert => {
        if (!expert.expertise) return false;
        return expertiseNeeded.some(needed => 
          expert.expertise!.some(exp => exp.toLowerCase().includes(needed.toLowerCase()))
        );
      })
      .map(expert => expert.id);
  }

  private findRelevantAgentsForKnowledge(knowledge: KnowledgeShare): string[] {
    const relevantAgents: string[] = [];
    
    const tags = knowledge.tags || [];
    const knowledgeType = knowledge.knowledgeType;
    
    for (const [id, agent] of this.agents) {
      if (agent.level === AgentLevel.LAYER || agent.level === AgentLevel.EXPERT) {
        if (agent.expertise?.some(exp => tags.includes(exp))) {
          relevantAgents.push(id);
        } else if (agent.domain && tags.includes(agent.domain.toLowerCase())) {
          relevantAgents.push(id);
        }
      }
    }
    
    return relevantAgents.length > 0 ? relevantAgents : this.getAllChiefs();
  }

  private formatEscalationMessage(request: EscalationRequest): string {
    return `
CURRENT TASK: ${request.issue}
ATTEMPTED SOLUTIONS: 
${request.attemptedSolutions.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

BLOCKING ISSUE: ${request.blockingIssue}
HELP NEEDED: ${request.helpNeeded}
IMPACT: ${request.impact}
${request.suggestedAgents ? `SUGGESTED AGENTS: ${request.suggestedAgents.join(', ')}` : ''}
    `.trim();
  }

  private formatCEOEscalation(data: {
    situation: string;
    options: Array<{ name: string; pros: string[]; cons: string[]; supporters: string[] }>;
    recommendation?: string;
    decisionNeededBy: string;
    impactIfUnresolved: string;
    previousAttempts: string[];
  }): string {
    return `
SITUATION: ${data.situation}

OPTIONS EVALUATED:
${data.options.map((opt, i) => `
${i + 1}. ${opt.name}:
   - Pros: ${opt.pros.join(', ')}
   - Cons: ${opt.cons.join(', ')}
   - Divisions supporting: ${opt.supporters.join(', ')}
`).join('\n')}

${data.recommendation ? `RECOMMENDATION: ${data.recommendation}` : ''}
DECISION NEEDED BY: ${data.decisionNeededBy}
IMPACT IF UNRESOLVED: ${data.impactIfUnresolved}

PREVIOUS ESCALATION ATTEMPTS:
${data.previousAttempts.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
    `.trim();
  }

  private formatEmergencyMessage(emergency: {
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedSystems: string[];
    immediateAction: string;
  }): string {
    return `
EMERGENCY ESCALATION

INCIDENT: ${emergency.reason}
SEVERITY: ${emergency.severity.toUpperCase()}
AFFECTED SYSTEMS: ${emergency.affectedSystems.join(', ')}
IMMEDIATE ACTIONS TAKEN: ${emergency.immediateAction}

RESPONSE REQUIRED IMMEDIATELY
    `.trim();
  }

  private generateMessageId(): string {
    return `a2a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDeadline(priority: MessagePriority, defaultMinutes: number): string {
    const minutes = priority === MessagePriority.EMERGENCY ? 5 :
                    priority === MessagePriority.CRITICAL ? 30 :
                    priority === MessagePriority.HIGH ? 60 :
                    priority === MessagePriority.MEDIUM ? 120 :
                    defaultMinutes;

    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + minutes);
    return deadline.toISOString();
  }

  private logMessage(message: A2AMessage): void {
    this.messageLog.push(message);
    if (this.messageLog.length > 1000) {
      this.messageLog = this.messageLog.slice(-1000);
    }
  }

  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  public getAgentsByLevel(level: AgentLevel): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.level === level);
  }

  public getAgentsByDivision(division: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.division === division);
  }

  public getAgentsByDomain(domain: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.domain === domain);
  }

  public getMessageHistory(agentId?: string, limit: number = 50): A2AMessage[] {
    let messages = this.messageLog;
    if (agentId) {
      messages = messages.filter(m => m.from === agentId || m.to.includes(agentId));
    }
    return messages.slice(-limit);
  }

  public getKnowledgeBase(type?: string): KnowledgeShare[] {
    if (type) {
      return this.knowledgeBase.get(type) || [];
    }
    
    const allKnowledge: KnowledgeShare[] = [];
    for (const knowledge of this.knowledgeBase.values()) {
      allKnowledge.push(...knowledge);
    }
    return allKnowledge;
  }

  public updateAgentMetrics(agentId: string, metrics: AgentMetrics): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.metrics = metrics;
    }
  }

  public getHierarchyPath(agentId: string): string[] {
    const path: string[] = [agentId];
    let currentAgent = this.agents.get(agentId);

    while (currentAgent && currentAgent.reports_to) {
      path.push(currentAgent.reports_to);
      currentAgent = this.agents.get(currentAgent.reports_to);
    }

    return path;
  }

  public getEscalationPath(agentId: string): { level: EscalationLevel; agentId: string; name: string }[] {
    const path: { level: EscalationLevel; agentId: string; name: string }[] = [];
    const agent = this.agents.get(agentId);
    
    if (!agent) return path;

    const peers = agent.coordinates_with || [];
    if (peers.length > 0) {
      const peer = this.agents.get(peers[0]);
      if (peer) {
        path.push({ level: EscalationLevel.PEER, agentId: peer.id, name: peer.name });
      }
    }

    const chief = this.findChief(agentId);
    if (chief) {
      path.push({ level: EscalationLevel.CHIEF, agentId: chief.id, name: chief.name });
    }

    const domain = this.findDomain(agentId);
    if (domain && domain.id !== chief?.id) {
      path.push({ level: EscalationLevel.DOMAIN, agentId: domain.id, name: domain.name });
    }

    path.push({ level: EscalationLevel.CEO, agentId: 'AGENT_0', name: 'ESA CEO' });

    return path;
  }

  public getTotalAgentCount(): { total: number; byLevel: Record<string, number> } {
    const byLevel: Record<string, number> = {};
    let total = 0;

    for (const agent of this.agents.values()) {
      total++;
      const levelName = AgentLevel[agent.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
    }

    return { total, byLevel };
  }
}

// ============================================================================
// LAZY INITIALIZATION - Avoid blocking during module load
// ============================================================================

let a2aProtocolInstance: A2AProtocolService | null = null;

function getA2AProtocol(): A2AProtocolService {
  if (!a2aProtocolInstance) {
    console.log('[A2A Protocol] 🔧 Initializing A2A Protocol Service...');
    a2aProtocolInstance = new A2AProtocolService();
    console.log('[A2A Protocol] ✅ A2A Protocol Service initialized');
  }
  return a2aProtocolInstance;
}

// Export lazy getter object for backward compatibility
export const a2aProtocol = {
  escalateIssue: (request: EscalationRequest) => getA2AProtocol().escalateIssue(request),
  requestPeerCollaboration: (request: any) => getA2AProtocol().requestPeerCollaboration(request),
  declareEmergency: (request: any) => getA2AProtocol().declareEmergency(request),
  shareKnowledge: (request: any) => getA2AProtocol().shareKnowledge(request),
  sendMessage: (message: A2AMessage) => getA2AProtocol().sendMessage(message),
  getAgent: (agentId: string) => getA2AProtocol().getAgent(agentId),
  getMessageHistory: (agentId?: string, limit?: number) => getA2AProtocol().getMessageHistory(agentId, limit),
  getKnowledgeBase: (type?: string) => getA2AProtocol().getKnowledgeBase(type),
  updateAgentMetrics: (agentId: string, metrics: AgentMetrics) => getA2AProtocol().updateAgentMetrics(agentId, metrics),
  getHierarchyPath: (agentId: string) => getA2AProtocol().getHierarchyPath(agentId),
  getEscalationPath: (agentId: string) => getA2AProtocol().getEscalationPath(agentId),
  getTotalAgentCount: () => getA2AProtocol().getTotalAgentCount(),
};

export default a2aProtocol;
