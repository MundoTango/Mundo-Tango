/**
 * Context Builder Service - MB.MD v9.2
 * Smart chunking context aggregation for Mr. Blue
 * 
 * Collects and formats context from:
 * - Current page (URL, HTML snapshot)
 * - Error Analysis panel (recent errors)
 * - Selected elements and recent edits
 * - Project documentation (replit.md chunks)
 * 
 * Uses keyword-based smart chunking to keep context focused and fast
 */

export interface PageContext {
  currentUrl: string;
  pageTitle: string;
  htmlSnapshot?: string;
  selectedElement?: {
    tagName: string;
    testId: string | null;
    className: string;
    text: string;
  };
  recentEdits: Array<{
    timestamp: Date;
    description: string;
  }>;
}

export interface ErrorContext {
  errorType: string;
  errorMessage: string;
  frequency: number;
  lastSeen: string;
  suggestedFix?: string;
}

export interface DocumentationChunk {
  source: string;
  content: string;
  relevanceScore: number;
}

export interface FullContext {
  page: PageContext;
  errors: ErrorContext[];
  documentation: DocumentationChunk[];
  timestamp: Date;
}

export class ContextBuilderService {
  private static instance: ContextBuilderService;
  private documentationCache: Map<string, string> = new Map();
  
  private constructor() {
    // Singleton pattern
  }
  
  public static getInstance(): ContextBuilderService {
    if (!ContextBuilderService.instance) {
      ContextBuilderService.instance = new ContextBuilderService();
    }
    return ContextBuilderService.instance;
  }
  
  /**
   * Build complete context for Mr. Blue from all available sources
   */
  public async buildContext(
    currentUrl: string,
    selectedElement: any | null,
    errorPatterns: ErrorContext[],
    recentEdits: any[],
    keywords?: string[]
  ): Promise<FullContext> {
    console.log('[ContextBuilder] Building context with keywords:', keywords);
    
    // Build page context
    const pageContext: PageContext = {
      currentUrl,
      pageTitle: this.extractPageTitle(currentUrl),
      selectedElement: selectedElement ? {
        tagName: selectedElement.tagName,
        testId: selectedElement.testId,
        className: selectedElement.className,
        text: selectedElement.text || ''
      } : undefined,
      recentEdits: recentEdits.slice(0, 5).map(edit => ({
        timestamp: new Date(edit.timestamp),
        description: edit.description || 'Edit made'
      }))
    };
    
    // Filter and format errors (top 5 most recent)
    const errorContext = errorPatterns
      .slice(0, 5)
      .map(err => ({
        errorType: err.errorType,
        errorMessage: err.errorMessage,
        frequency: err.frequency,
        lastSeen: err.lastSeen,
        suggestedFix: err.suggestedFix
      }));
    
    // Smart chunk documentation based on keywords
    const documentationChunks = await this.getRelevantDocumentation(keywords || []);
    
    return {
      page: pageContext,
      errors: errorContext,
      documentation: documentationChunks,
      timestamp: new Date()
    };
  }
  
  /**
   * Format context as string array for API calls
   */
  public formatContextForAPI(context: FullContext): string[] {
    const formatted: string[] = [];
    
    // Page context
    formatted.push(`CURRENT PAGE: ${context.page.currentUrl} (${context.page.pageTitle})`);
    
    if (context.page.selectedElement) {
      formatted.push(`SELECTED ELEMENT: <${context.page.selectedElement.tagName}> ${context.page.selectedElement.testId ? `[${context.page.selectedElement.testId}]` : ''}`);
    }
    
    if (context.page.recentEdits.length > 0) {
      formatted.push(`RECENT EDITS: ${context.page.recentEdits.length} changes made`);
      context.page.recentEdits.forEach((edit, i) => {
        formatted.push(`  ${i + 1}. ${edit.description}`);
      });
    }
    
    // Error context
    if (context.errors.length > 0) {
      formatted.push(`\n🚨 ACTIVE ERRORS (${context.errors.length} detected):`);
      context.errors.forEach((err, i) => {
        formatted.push(`  ${i + 1}. [${err.errorType}] ${err.errorMessage.substring(0, 100)}`);
        if (err.suggestedFix) {
          formatted.push(`     → Suggested fix: ${err.suggestedFix.substring(0, 150)}`);
        }
      });
    }
    
    // Documentation chunks
    if (context.documentation.length > 0) {
      formatted.push(`\n📚 RELEVANT DOCUMENTATION:`);
      context.documentation.forEach((doc, i) => {
        formatted.push(`  ${i + 1}. [${doc.source}] (relevance: ${(doc.relevanceScore * 100).toFixed(0)}%)`);
        formatted.push(`     ${doc.content.substring(0, 200)}...`);
      });
    }
    
    return formatted;
  }
  
  /**
   * Extract page title from URL
   */
  private extractPageTitle(url: string): string {
    const pathMap: Record<string, string> = {
      '/': 'Visual Editor',
      '/landing': 'Landing Page',
      '/dashboard': 'Dashboard',
      '/events': 'Events',
      '/profile': 'Profile',
      '/feed': 'Social Feed'
    };
    
    const cleanUrl = url.split('?')[0];
    return pathMap[cleanUrl] || cleanUrl.replace(/\//g, ' ').trim() || 'Unknown Page';
  }
  
  /**
   * Get relevant documentation chunks based on keywords
   * Smart chunking: Only return docs relevant to current context
   */
  private async getRelevantDocumentation(keywords: string[]): Promise<DocumentationChunk[]> {
    const chunks: DocumentationChunk[] = [];
    
    // Key documentation sections from replit.md
    const docSections = {
      'system_architecture': 'System Architecture: React + Express + PostgreSQL + Drizzle ORM. 1,218 AI agents coordinated by Mr. Blue.',
      'ai_systems': 'AI Systems: Hierarchical training (Replit AI → Mr. Blue → 1,218 agents). Self-Healing Infrastructure v2.0 with PreFlightCheck, GlobalKnowledgeBase, AutoFixEngine.',
      'visual_editor': 'Visual Editor: VibeCoding (GROQ Llama-3.3-70b), chat persistence, voice mode, error analysis, browser automation, memory system.',
      'backend': 'Backend: Express + TypeScript, shared/schema.ts for database, server/storage.ts for CRUD, JWT auth, 8-tier RBAC.',
      'ui_ux': 'UI/UX: MT Ocean Theme (ocean blues + warm accents), shadcn/ui + Radix UI, Tailwind CSS dark mode, i18next (68 languages).',
      'testing': 'Testing: 95% E2E coverage target, Playwright for journeys/WebSockets/security, test before complete.',
      'database': 'Database: PostgreSQL (Neon), Drizzle ORM, never change ID types (serial ↔ varchar breaks data), npm run db:push for migrations.'
    };
    
    // If no keywords, return general overview
    if (keywords.length === 0) {
      chunks.push({
        source: 'replit.md',
        content: 'Mundo Tango: Social platform for tango community. 1,218 AI agents, self-healing infrastructure, Visual Editor with VibeCoding.',
        relevanceScore: 0.5
      });
      return chunks;
    }
    
    // Score each section by keyword matches
    const scoredSections = Object.entries(docSections).map(([key, content]) => {
      const contentLower = content.toLowerCase();
      const matchCount = keywords.filter(kw => 
        contentLower.includes(kw.toLowerCase())
      ).length;
      
      return {
        source: `replit.md#${key}`,
        content,
        relevanceScore: matchCount / keywords.length
      };
    }).filter(section => section.relevanceScore > 0);
    
    // Sort by relevance and return top 3
    scoredSections.sort((a, b) => b.relevanceScore - a.relevanceScore);
    chunks.push(...scoredSections.slice(0, 3));
    
    return chunks;
  }
  
  /**
   * Extract keywords from user prompt for smart documentation chunking
   */
  public extractKeywords(prompt: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'make',
      'get', 'got', 'let', 'put', 'set', 'take', 'give', 'find', 'use', 'tell',
      'ask', 'work', 'seem', 'feel', 'try', 'leave', 'call'
    ]);
    
    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Exclude pure numbers
      );
    
    // Remove duplicates and limit to 10 keywords
    return [...new Set(words)].slice(0, 10);
  }
}

// Export singleton instance
export const contextBuilder = ContextBuilderService.getInstance();
