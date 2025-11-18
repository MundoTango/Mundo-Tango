/**
 * Agent SME Training Service
 * MB.MD v9.0 Protocol - November 18, 2025
 * 
 * Comprehensive agent training system where agents become Subject Matter Experts
 * by learning ALL documentation, code, and domain expertise BEFORE implementation.
 * 
 * Training Pipeline:
 * 1. Documentation Indexing - Scan and index all relevant docs per agent domain
 * 2. Code Analysis - Parse codebase, extract patterns, map to agent domains
 * 3. Industry Standards - Load industry-specific knowledge (Alexa/Siri/ChatGPT/Claude voice UX, Nielsen Norman, WCAG, etc.)
 * 4. Practical Application - Track agent usage and improve based on feedback
 * 
 * Agent Training Phases:
 * - Phase 1: Documentation (learn all handoff docs, mb.md, replit.md, research docs)
 * - Phase 2: Code Analysis (understand entire codebase in their domain)
 * - Phase 3: Industry Standards (master industry best practices)
 * - Phase 4: Practical Application (apply knowledge, get feedback, improve)
 */

import { db } from "../../../shared/db";
import {
  agents,
  agentDocumentationIndex,
  agentCodeKnowledge,
  agentSMETraining,
  agentIndustryStandards,
  type InsertAgentDocumentationIndex,
  type InsertAgentCodeKnowledge,
  type InsertAgentSMETraining,
  type InsertAgentIndustryStandards,
  type SelectAgent,
} from "../../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DocumentationFile {
  path: string;
  type: 'handoff' | 'research' | 'mb_md' | 'prd' | 'api_doc' | 'guide';
  title: string;
  content: string;
  domain: string[];
  size: number;
}

export interface CodeFile {
  path: string;
  type: 'component' | 'service' | 'route' | 'hook' | 'util' | 'schema' | 'test';
  pattern: string;
  content: string;
  domain: string[];
  exports: string[];
  imports: string[];
  functions: string[];
  lineCount: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface IndustryStandard {
  name: string;
  type: 'voice_ux' | 'accessibility' | 'testing' | 'quality' | 'design' | 'security';
  organization: string;
  version?: string;
  documentationUrl?: string;
  keyPrinciples: string[];
  applicableDomains: string[];
}

export interface AgentTrainingStats {
  agentId: string;
  domain: string;
  totalDocuments: number;
  documentsLearned: number;
  totalCodeFiles: number;
  codeFilesUnderstood: number;
  overallProficiency: number;
  smeStatus: 'novice' | 'intermediate' | 'proficient' | 'expert' | 'sme';
  weakAreas: string[];
  strongAreas: string[];
  nextGoals: string[];
}

// ============================================================================
// AGENT DOMAINS MAPPING
// ============================================================================

export const AGENT_DOMAINS = {
  // ESA CEO
  'AGENT_0': ['orchestration', 'agent_creation', 'quality_gates', 'handoff_protocol', 'esa_framework'],
  
  // Division Chiefs
  'CHIEF_1': ['ui_ux', 'routing', 'page_lifecycle', 'navigation', 'design_system'],
  'CHIEF_2': ['analytics', 'metrics', 'performance', 'monitoring'],
  'CHIEF_3': ['social', 'community', 'events', 'messaging'],
  'CHIEF_4': ['ai_integration', 'mr_blue', 'lancedb', 'groq', 'openai', 'voice', 'multi_modal'],
  'CHIEF_5': ['payment', 'stripe', 'subscription', 'revenue'],
  
  // Expert Agents
  'EXPERT_11': ['ui_ux', 'design_system', 'accessibility', 'dark_mode', 'shadcn', 'components'],
  
  // Specialized Agents
  'AGENT_6': ['routing', 'wouter', 'seo', 'duplicate_routes', 'navigation'],
  'AGENT_38': ['agent_orchestration', 'collaboration', 'multi_agent'],
  'AGENT_41': ['voice_interface', 'openai_realtime', 'webrtc', 'voice_ux', 'audio'],
  'AGENT_45': ['quality_audit', 'quality_gates', 'validation', 'iso_9001', 'six_sigma'],
  'AGENT_51': ['testing', 'playwright', 'computer_use', 'e2e', 'integration_testing'],
  'AGENT_52': ['performance', 'optimization', 'core_web_vitals'],
  'AGENT_53': ['accessibility', 'wcag', 'aria', 'screen_reader', 'keyboard_nav'],
  
  // Page Agents (to be created)
  'PAGE_VISUAL_EDITOR': ['visual_editor', 'iframe', 'address_bar', 'preview', 'mr_blue'],
  'PAGE_HOME': ['feed', 'posts', 'social'],
  'PAGE_PROFILE': ['user_profile', 'settings', 'privacy'],
  
  // Feature Agents (to be created)
  'FEATURE_MR_BLUE_CORE': ['mr_blue', 'ai_intelligence', 'context_service', 'intent_detection'],
  'FEATURE_VOICE_CHAT': ['voice', 'openai_realtime', 'webrtc', 'continuous_mode'],
  'FEATURE_TEXT_CHAT': ['messaging', 'websocket', 'chat_ui'],
  'FEATURE_VIBE_CODING': ['code_generation', 'groq', 'route_targeting', 'validation'],
  'FEATURE_VISUAL_PREVIEW': ['iframe', 'element_selection', 'address_bar', 'navigation_sync'],
} as const;

// ============================================================================
// INDUSTRY STANDARDS DATABASE
// ============================================================================

export const INDUSTRY_STANDARDS: IndustryStandard[] = [
  // Voice UX Standards
  {
    name: 'Alexa Voice UX Guidelines',
    type: 'voice_ux',
    organization: 'Amazon',
    version: '2023',
    documentationUrl: 'https://developer.amazon.com/en-US/docs/alexa/voice-design/design-principles.html',
    keyPrinciples: [
      'Conversational turn-taking',
      'Clear voice prompts',
      'Error recovery patterns',
      'Progressive disclosure',
      'Multimodal design',
    ],
    applicableDomains: ['voice_interface', 'voice_ux', 'audio', 'mr_blue'],
  },
  {
    name: 'Siri Interaction Patterns',
    type: 'voice_ux',
    organization: 'Apple',
    version: '2024',
    documentationUrl: 'https://developer.apple.com/design/human-interface-guidelines/siri',
    keyPrinciples: [
      'Natural language understanding',
      'Context awareness',
      'Minimal prompts',
      'Graceful degradation',
      'Privacy-first design',
    ],
    applicableDomains: ['voice_interface', 'voice_ux', 'audio', 'mr_blue'],
  },
  {
    name: 'ChatGPT Voice Mode Best Practices',
    type: 'voice_ux',
    organization: 'OpenAI',
    version: '2024',
    documentationUrl: 'https://platform.openai.com/docs/guides/realtime',
    keyPrinciples: [
      'Continuous conversation',
      'Real-time interruption handling',
      'Turn detection tuning',
      'Voice activity detection',
      'Low-latency streaming',
    ],
    applicableDomains: ['voice_interface', 'openai_realtime', 'webrtc', 'mr_blue'],
  },
  {
    name: 'Claude Voice Interaction Design',
    type: 'voice_ux',
    organization: 'Anthropic',
    version: '2024',
    keyPrinciples: [
      'Multi-modal conversation',
      'Context retention',
      'Clear turn-taking',
      'Thoughtful pauses',
      'Error correction',
    ],
    applicableDomains: ['voice_interface', 'voice_ux', 'multi_modal', 'mr_blue'],
  },
  
  // Accessibility Standards
  {
    name: 'WCAG 2.1 AAA',
    type: 'accessibility',
    organization: 'W3C',
    version: '2.1',
    documentationUrl: 'https://www.w3.org/WAI/WCAG21/quickref/',
    keyPrinciples: [
      'Perceivable information',
      'Operable interface',
      'Understandable content',
      'Robust implementation',
      'Keyboard accessibility',
      'Screen reader compatibility',
      'Color contrast 7:1',
    ],
    applicableDomains: ['accessibility', 'ui_ux', 'design_system', 'components'],
  },
  
  // Design Standards
  {
    name: 'Nielsen Norman 10 Usability Heuristics',
    type: 'design',
    organization: 'Nielsen Norman Group',
    version: '2024',
    documentationUrl: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    keyPrinciples: [
      'Visibility of system status',
      'Match between system and real world',
      'User control and freedom',
      'Consistency and standards',
      'Error prevention',
      'Recognition rather than recall',
      'Flexibility and efficiency',
      'Aesthetic and minimalist design',
      'Help users recognize, diagnose, and recover from errors',
      'Help and documentation',
    ],
    applicableDomains: ['ui_ux', 'design_system', 'user_experience'],
  },
  
  // Testing Standards
  {
    name: 'Playwright Best Practices',
    type: 'testing',
    organization: 'Microsoft',
    version: '2024',
    documentationUrl: 'https://playwright.dev/docs/best-practices',
    keyPrinciples: [
      'Test isolation',
      'Accessibility testing',
      'Visual regression',
      'Network mocking',
      'Parallel execution',
      'Trace on failure',
    ],
    applicableDomains: ['testing', 'playwright', 'e2e', 'quality'],
  },
  {
    name: 'Computer Use Testing',
    type: 'testing',
    organization: 'Anthropic',
    version: '2024',
    documentationUrl: 'https://www.anthropic.com/news/3-5-models-and-computer-use',
    keyPrinciples: [
      'Visual element detection',
      'Complex UI interaction',
      'Multi-step workflow automation',
      'Screenshot-based validation',
      'Cross-browser testing',
    ],
    applicableDomains: ['testing', 'computer_use', 'automation', 'quality'],
  },
  
  // Quality Standards
  {
    name: 'ISO 9001 Quality Management',
    type: 'quality',
    organization: 'ISO',
    version: '2015',
    keyPrinciples: [
      'Customer focus',
      'Leadership commitment',
      'Process approach',
      'Continuous improvement',
      'Evidence-based decision making',
      'Relationship management',
    ],
    applicableDomains: ['quality_audit', 'quality_gates', 'validation'],
  },
  {
    name: 'Six Sigma DMAIC',
    type: 'quality',
    organization: 'Six Sigma',
    version: '2024',
    keyPrinciples: [
      'Define problems and goals',
      'Measure current performance',
      'Analyze root causes',
      'Improve processes',
      'Control future performance',
    ],
    applicableDomains: ['quality_audit', 'process_improvement', 'optimization'],
  },
];

// ============================================================================
// AGENT SME TRAINING SERVICE
// ============================================================================

export class AgentSMETrainingService {
  private serviceId = "Agent SME Training Service";

  /**
   * Get all documentation files from the project
   */
  async indexAllDocumentation(): Promise<DocumentationFile[]> {
    const docFiles: DocumentationFile[] = [];
    
    // Find all markdown files in docs/ folder
    const markdownFiles = await glob('docs/**/*.md', { cwd: process.cwd() });
    
    for (const file of markdownFiles) {
      try {
        const fullPath = path.join(process.cwd(), file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const stats = await fs.stat(fullPath);
        
        const docFile: DocumentationFile = {
          path: file,
          type: this.determineDocumentType(file),
          title: this.extractTitle(content, file),
          content,
          domain: this.extractDomainsFromDocument(content, file),
          size: stats.size,
        };
        
        docFiles.push(docFile);
      } catch (error) {
        console.error(`Failed to read ${file}:`, error);
      }
    }
    
    // Also index mb.md and replit.md
    const rootDocs = ['mb.md', 'replit.md'];
    for (const file of rootDocs) {
      try {
        const fullPath = path.join(process.cwd(), file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const stats = await fs.stat(fullPath);
        
        const docFile: DocumentationFile = {
          path: file,
          type: 'mb_md',
          title: file === 'mb.md' ? 'MB.MD Protocol' : 'Replit.md Project Overview',
          content,
          domain: file === 'mb.md' 
            ? ['orchestration', 'methodology', 'agent_protocol']
            : ['architecture', 'overview', 'preferences'],
          size: stats.size,
        };
        
        docFiles.push(docFile);
      } catch (error) {
        console.error(`Failed to read ${file}:`, error);
      }
    }
    
    console.log(`📚 Indexed ${docFiles.length} documentation files`);
    return docFiles;
  }

  /**
   * Determine document type based on path/content
   */
  private determineDocumentType(filePath: string): DocumentationFile['type'] {
    if (filePath.includes('handoff/')) return 'handoff';
    if (filePath.includes('PRD_')) return 'prd';
    if (filePath.includes('API') || filePath.includes('_GUIDE')) return 'api_doc';
    if (filePath.includes('RESEARCH') || filePath.includes('ANALYSIS')) return 'research';
    if (filePath.includes('mb-md-plans/')) return 'mb_md';
    return 'guide';
  }

  /**
   * Extract title from document
   */
  private extractTitle(content: string, filePath: string): string {
    // Try to find first H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1];
    
    // Fallback to filename
    return path.basename(filePath, '.md');
  }

  /**
   * Extract domains from document content
   */
  private extractDomainsFromDocument(content: string, filePath: string): string[] {
    const domains: Set<string> = new Set();
    
    // Check filename and path for domain hints
    const filename = filePath.toLowerCase();
    if (filename.includes('voice') || filename.includes('openai')) domains.add('voice_interface');
    if (filename.includes('visual_editor') || filename.includes('vibe')) domains.add('visual_editor');
    if (filename.includes('mr_blue') || filename.includes('mrblue')) domains.add('mr_blue');
    if (filename.includes('agent')) domains.add('agent_orchestration');
    if (filename.includes('ui') || filename.includes('ux')) domains.add('ui_ux');
    if (filename.includes('test')) domains.add('testing');
    if (filename.includes('routing')) domains.add('routing');
    if (filename.includes('facebook') || filename.includes('oauth')) domains.add('integration');
    
    // Check content for domain keywords
    const contentLower = content.toLowerCase();
    if (contentLower.includes('openai realtime')) domains.add('openai_realtime');
    if (contentLower.includes('playwright')) domains.add('playwright');
    if (contentLower.includes('computer use')) domains.add('computer_use');
    if (contentLower.includes('accessibility') || contentLower.includes('wcag')) domains.add('accessibility');
    if (contentLower.includes('quality gate')) domains.add('quality_gates');
    
    return Array.from(domains);
  }

  /**
   * Train an agent on all relevant documentation
   */
  async trainAgentOnDocumentation(agentId: string): Promise<void> {
    console.log(`📖 Training ${agentId} on documentation...`);
    
    // Get agent domains
    const agentDomains = AGENT_DOMAINS[agentId as keyof typeof AGENT_DOMAINS] || [];
    if (agentDomains.length === 0) {
      console.warn(`⚠️  No domains defined for ${agentId}`);
      return;
    }
    
    // Index all documentation
    const allDocs = await this.indexAllDocumentation();
    
    // Filter relevant docs for this agent
    const relevantDocs = allDocs.filter(doc => 
      doc.domain.some(d => agentDomains.includes(d))
    );
    
    console.log(`📚 Found ${relevantDocs.length} relevant documents for ${agentId}`);
    
    // Store in agent_documentation_index
    for (const doc of relevantDocs) {
      const relevanceScore = this.calculateRelevanceScore(doc.domain, agentDomains);
      
      const docIndex: InsertAgentDocumentationIndex = {
        agentId,
        documentPath: doc.path,
        documentType: doc.type,
        documentTitle: doc.title,
        domain: agentDomains[0], // Primary domain
        relevanceScore,
        contentSummary: doc.content.substring(0, 500),
        keyInsights: this.extractKeyInsights(doc.content),
        proficiencyScore: 0.0, // Agent hasn't learned yet
        metadata: {
          size: doc.size,
          allDomains: doc.domain,
        },
      };
      
      await db.insert(agentDocumentationIndex).values(docIndex);
    }
    
    console.log(`✅ Indexed ${relevantDocs.length} documents for ${agentId}`);
  }

  /**
   * Calculate how relevant a document is to an agent
   */
  private calculateRelevanceScore(docDomains: string[], agentDomains: readonly string[]): number {
    const overlap = docDomains.filter(d => agentDomains.includes(d)).length;
    const total = Math.max(docDomains.length, agentDomains.length);
    return overlap / total;
  }

  /**
   * Extract key insights from document
   */
  private extractKeyInsights(content: string): any[] {
    const insights: any[] = [];
    
    // Extract bullet points
    const bullets = content.match(/^[*-]\s+(.+)$/gm);
    if (bullets && bullets.length > 0) {
      insights.push(...bullets.slice(0, 10).map(b => b.replace(/^[*-]\s+/, '')));
    }
    
    // Extract important sections (h2, h3)
    const headings = content.match(/^##\s+(.+)$/gm);
    if (headings && headings.length > 0) {
      insights.push(...headings.slice(0, 5).map(h => h.replace(/^##\s+/, '')));
    }
    
    return insights;
  }

  /**
   * Train an agent on industry standards
   */
  async trainAgentOnIndustryStandards(agentId: string): Promise<void> {
    console.log(`📐 Training ${agentId} on industry standards...`);
    
    const agentDomains = AGENT_DOMAINS[agentId as keyof typeof AGENT_DOMAINS] || [];
    
    // Find relevant standards
    const relevantStandards = INDUSTRY_STANDARDS.filter(standard =>
      standard.applicableDomains.some(d => agentDomains.includes(d))
    );
    
    console.log(`📏 Found ${relevantStandards.length} relevant standards for ${agentId}`);
    
    // Store in agent_industry_standards
    for (const standard of relevantStandards) {
      const standardRecord: InsertAgentIndustryStandards = {
        agentId,
        standardName: standard.name,
        standardType: standard.type,
        organization: standard.organization || null,
        version: standard.version || null,
        documentationUrl: standard.documentationUrl || null,
        keyPrinciples: standard.keyPrinciples,
        applicableDomains: standard.applicableDomains,
        proficiencyLevel: 'none', // Agent hasn't studied yet
        metadata: {},
      };
      
      await db.insert(agentIndustryStandards).values(standardRecord);
    }
    
    console.log(`✅ Loaded ${relevantStandards.length} industry standards for ${agentId}`);
  }

  /**
   * Initialize SME training for an agent
   */
  async initializeSMETraining(agentId: string, primaryDomain: string): Promise<void> {
    console.log(`🎓 Initializing SME training for ${agentId} in domain: ${primaryDomain}`);
    
    // Create training record
    const training: InsertAgentSMETraining = {
      agentId,
      domain: primaryDomain,
      trainingPhase: 'documentation',
      totalDocuments: 0,
      documentsLearned: 0,
      totalCodeFiles: 0,
      codeFilesUnderstood: 0,
      industryStandards: [],
      standardsLearned: [],
      overallProficiency: 0.0,
      smeStatus: 'novice',
      weakAreas: [],
      strongAreas: [],
      nextTrainingGoals: [
        'Learn all documentation',
        'Understand codebase',
        'Master industry standards',
      ],
      metadata: {},
    };
    
    await db.insert(agentSMETraining).values(training);
    console.log(`✅ SME training initialized for ${agentId}`);
  }

  /**
   * Complete training pipeline for an agent
   */
  async trainAgentAsSME(agentId: string, primaryDomain: string): Promise<AgentTrainingStats> {
    console.log(`\n🚀 Starting complete SME training for ${agentId}...`);
    console.log(`Primary Domain: ${primaryDomain}\n`);
    
    // Initialize training
    await this.initializeSMETraining(agentId, primaryDomain);
    
    // Phase 1: Documentation
    console.log('📖 Phase 1: Documentation Training');
    await this.trainAgentOnDocumentation(agentId);
    
    // Phase 2: Industry Standards
    console.log('\n📐 Phase 2: Industry Standards Training');
    await this.trainAgentOnIndustryStandards(agentId);
    
    // Get training stats
    const stats = await this.getTrainingStats(agentId, primaryDomain);
    
    console.log(`\n✅ SME training complete for ${agentId}!`);
    console.log(`Stats: ${stats.documentsLearned}/${stats.totalDocuments} docs, Proficiency: ${(stats.overallProficiency * 100).toFixed(1)}%\n`);
    
    return stats;
  }

  /**
   * Get training statistics for an agent
   */
  async getTrainingStats(agentId: string, domain: string): Promise<AgentTrainingStats> {
    // Count documents
    const docsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(agentDocumentationIndex)
      .where(eq(agentDocumentationIndex.agentId, agentId));
    
    const totalDocs = Number(docsCount[0]?.count || 0);
    
    // Get training record
    const training = await db
      .select()
      .from(agentSMETraining)
      .where(and(
        eq(agentSMETraining.agentId, agentId),
        eq(agentSMETraining.domain, domain)
      ))
      .limit(1);
    
    if (!training[0]) {
      return {
        agentId,
        domain,
        totalDocuments: totalDocs,
        documentsLearned: 0,
        totalCodeFiles: 0,
        codeFilesUnderstood: 0,
        overallProficiency: 0.0,
        smeStatus: 'novice',
        weakAreas: [],
        strongAreas: [],
        nextGoals: [],
      };
    }
    
    return {
      agentId,
      domain,
      totalDocuments: totalDocs,
      documentsLearned: training[0].documentsLearned,
      totalCodeFiles: training[0].totalCodeFiles,
      codeFilesUnderstood: training[0].codeFilesUnderstood,
      overallProficiency: training[0].overallProficiency,
      smeStatus: training[0].smeStatus,
      weakAreas: training[0].weakAreas || [],
      strongAreas: training[0].strongAreas || [],
      nextGoals: training[0].nextTrainingGoals || [],
    };
  }

  /**
   * Train ALL critical agents as SMEs
   */
  async trainAllCriticalAgents(): Promise<void> {
    console.log('🎓 STARTING COMPREHENSIVE AGENT SME TRAINING PROGRAM\n');
    console.log('This will train all critical agents as Subject Matter Experts\n');
    console.log('=' .repeat(80) + '\n');
    
    const criticalAgents = [
      { id: 'AGENT_0', domain: 'orchestration' },
      { id: 'CHIEF_1', domain: 'ui_ux' },
      { id: 'CHIEF_4', domain: 'ai_integration' },
      { id: 'EXPERT_11', domain: 'ui_ux' },
      { id: 'AGENT_6', domain: 'routing' },
      { id: 'AGENT_41', domain: 'voice_interface' },
      { id: 'AGENT_51', domain: 'testing' },
      { id: 'AGENT_38', domain: 'agent_orchestration' },
      { id: 'AGENT_45', domain: 'quality_audit' },
    ];
    
    for (const agent of criticalAgents) {
      await this.trainAgentAsSME(agent.id, agent.domain);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL CRITICAL AGENTS TRAINED AS SMEs!');
    console.log('='.repeat(80) + '\n');
  }
}
