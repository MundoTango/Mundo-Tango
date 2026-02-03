/**
 * FeedPageAgent - Specialized agent for Feed/Memories Page
 * 
 * MB.MD Level 3: This agent knows the COMPLETE specification of the Feed page:
 * - Expected components and their hierarchy
 * - API endpoints and their schemas
 * - Database tables and column names
 * - Common failure modes and how to fix them
 * - Orchestrates feature agents for testing
 * 
 * Created via Q&A Session with Replit AI mentoring Mr. Blue
 */

import fs from "node:fs/promises";
import * as path from 'path';
import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, QAExchange } from './BaseFeatureAgent';
import { InfiniteScrollFeatureAgent } from './InfiniteScrollFeatureAgent';
import { PostCreatorFeatureAgent } from './PostCreatorFeatureAgent';
import { PostReactionsFeatureAgent } from './PostReactionsFeatureAgent';
import { StoriesCarouselFeatureAgent } from './StoriesCarouselFeatureAgent';

// PRD-style knowledge of what Feed page SHOULD be
export interface FeedPagePRD {
  expectedComponents: string[];
  requiredAPIs: { endpoint: string; method: string; description: string }[];
  schemaKnowledge: { table: string; column: string; description: string }[];
  commonBugs: { pattern: string; fix: string; severity: 'critical' | 'high' | 'medium' | 'low' }[];
  expectedBehaviors: string[];
}

export interface AgentQASession {
  sessionId: string;
  startTime: string;
  exchanges: QAExchange[];
  participants: string[];
  summary: string;
}

export class FeedPageAgent extends BasePageAgent {
  private prd: FeedPagePRD;
  private featureAgents: Map<string, BaseFeatureAgent>;
  private qaHistory: AgentQASession[] = [];

  constructor() {
    super(
      'feed-page',
      'Feed Page Agent',
      [
        'client/src/pages/FeedPage.tsx',
        'client/src/components/feed/InfiniteScrollFeed.tsx',
        'client/src/components/feed/RecommendedPosts.tsx',
        'client/src/components/feed/PostItem.tsx',
        'client/src/components/feed/PostReactions.tsx',
        'client/src/components/feed/PostActions.tsx',
        'client/src/components/feed/FeedTabs.tsx',
        'client/src/components/feed/FeedFilters.tsx',
        'client/src/components/feed/StoriesCarousel.tsx',
        'client/src/components/feed/NewPostsBanner.tsx',
        'client/src/components/feed/FeedHeroWelcome.tsx',
        'client/src/components/feed/UpcomingEventsSidebar.tsx',
        'client/src/components/universal/PostCreator.tsx',
        'server/services/feedAlgorithm.ts',
        'server/routes/feedRoutes.ts',
      ]
    );

    // Initialize feature agents
    this.featureAgents = new Map();
    this.initializeFeatureAgents();

    // Initialize PRD knowledge - what Feed page SHOULD be
    this.prd = this.initializePRD();
    this.initializeKnowledge();
  }

  /**
   * Initialize feature agents subordinate to this page
   */
  private initializeFeatureAgents() {
    const infiniteScrollAgent = new InfiniteScrollFeatureAgent();
    const postCreatorAgent = new PostCreatorFeatureAgent();
    const postReactionsAgent = new PostReactionsFeatureAgent();
    const storiesCarouselAgent = new StoriesCarouselFeatureAgent();

    this.featureAgents.set(infiniteScrollAgent.getFeatureId(), infiniteScrollAgent);
    this.featureAgents.set(postCreatorAgent.getFeatureId(), postCreatorAgent);
    this.featureAgents.set(postReactionsAgent.getFeatureId(), postReactionsAgent);
    this.featureAgents.set(storiesCarouselAgent.getFeatureId(), storiesCarouselAgent);

    console.log(`[Feed Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  /**
   * Get all feature agents
   */
  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  /**
   * Get specific feature agent
   */
  getFeatureAgent(featureId: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(featureId);
  }

  /**
   * Conduct Q&A research session with all feature agents
   * Mr. Blue uses this to understand the page holistically
   */
  async conductQASession(questions: string[]): Promise<AgentQASession> {
    const sessionId = `qa-${Date.now()}`;
    const exchanges: QAExchange[] = [];
    const participants: string[] = [this.name];

    // Ask each feature agent
    for (const agent of this.featureAgents.values()) {
      participants.push(agent.getFeatureName());
      
      for (const question of questions) {
        const answer = agent.answerQuestion(question);
        exchanges.push({
          question: `[${agent.getFeatureName()}] ${question}`,
          answer: answer.answer,
          confidence: answer.confidence,
          source: answer.source,
        });
      }
    }

    // Generate summary
    const summary = this.generateSessionSummary(exchanges);

    const session: AgentQASession = {
      sessionId,
      startTime: new Date().toISOString(),
      exchanges,
      participants,
      summary,
    };

    this.qaHistory.push(session);
    return session;
  }

  /**
   * Generate summary of Q&A session
   */
  private generateSessionSummary(exchanges: QAExchange[]): string {
    const highConfidence = exchanges.filter(e => e.confidence >= 0.9);
    const lowConfidence = exchanges.filter(e => e.confidence < 0.7);
    
    return `Q&A Session Complete: ${exchanges.length} exchanges, ${highConfidence.length} high confidence answers, ${lowConfidence.length} need more research`;
  }

  /**
   * Orchestrate all feature agents to generate comprehensive test plan
   */
  generateComprehensiveTestPlan(): string {
    const plans: string[] = [];
    
    plans.push(`# Feed Page Comprehensive Test Plan`);
    plans.push(`Generated: ${new Date().toISOString()}`);
    plans.push(`Page Agent: ${this.name}`);
    plans.push(`Feature Agents: ${this.featureAgents.size}`);
    plans.push('\n---\n');

    for (const agent of this.featureAgents.values()) {
      plans.push(`## ${agent.getFeatureName()}`);
      plans.push(agent.generatePlaywrightTestPlan());
      plans.push('\n---\n');
    }

    return plans.join('\n');
  }

  /**
   * Get all testable behaviors from all feature agents
   */
  getAllTestableBehaviors(): { featureId: string; featureName: string; behaviors: any[] }[] {
    const results: { featureId: string; featureName: string; behaviors: any[] }[] = [];

    for (const agent of this.featureAgents.values()) {
      results.push({
        featureId: agent.getFeatureId(),
        featureName: agent.getFeatureName(),
        behaviors: agent.getTestPlan(),
      });
    }

    return results;
  }

  /**
   * Get health status of all feature agents
   */
  getFeatureHealthStatus(): {
    pageAgent: string;
    totalFeatures: number;
    totalTests: number;
    totalKnownIssues: number;
    features: any[];
  } {
    const features = Array.from(this.featureAgents.values()).map(a => a.getHealthStatus());
    
    return {
      pageAgent: this.name,
      totalFeatures: this.featureAgents.size,
      totalTests: features.reduce((sum, f) => sum + f.testableCount, 0),
      totalKnownIssues: features.reduce((sum, f) => sum + f.knownIssueCount, 0),
      features,
    };
  }

  /**
   * PRD Knowledge - What the Feed page is SUPPOSED to do
   * This enables the agent to detect when things are WRONG
   */
  private initializePRD(): FeedPagePRD {
    return {
      expectedComponents: [
        'FeedPage - Main container with tabs (Following/Discover)',
        'InfiniteScrollFeed - Paginated feed with infinite scroll',
        'PostCreator - Create new posts with media, mentions, location',
        'PostItem - Individual post with reactions, comments, shares',
        'PostReactions - Reaction picker (love, fire, tango, etc.)',
        'StoriesCarousel - 24-hour ephemeral content',
        'FeedTabs - Toggle between Following/Discover',
        'FeedFilters - Filter by type, visibility, tags',
        'NewPostsBanner - Real-time new posts notification',
        'UpcomingEventsSidebar - Related tango events',
      ],

      requiredAPIs: [
        { endpoint: '/api/feed/following', method: 'GET', description: 'Get posts from followed users with algorithm scoring' },
        { endpoint: '/api/feed/discover', method: 'GET', description: 'Get recommended posts from discovery algorithm' },
        { endpoint: '/api/posts', method: 'GET', description: 'Get all posts with pagination' },
        { endpoint: '/api/posts', method: 'POST', description: 'Create new post' },
        { endpoint: '/api/posts/:id/reactions', method: 'POST', description: 'Add reaction to post' },
        { endpoint: '/api/posts/:id/comments', method: 'GET', description: 'Get comments for post' },
        { endpoint: '/api/stories', method: 'GET', description: 'Get active stories (not expired)' },
      ],

      // CRITICAL: Schema knowledge that prevents bugs like reactions.type vs reactions.reactionType
      schemaKnowledge: [
        { table: 'posts', column: 'id', description: 'serial primary key' },
        { table: 'posts', column: 'userId', description: 'references users.id' },
        { table: 'posts', column: 'content', description: 'text content of post' },
        { table: 'posts', column: 'visibility', description: 'public | friends | private' },
        { table: 'posts', column: 'postType', description: 'memory | post | story' },
        { table: 'posts', column: 'shares', description: 'integer share count - use this instead of postShares table subquery' },
        { table: 'reactions', column: 'id', description: 'serial primary key' },
        { table: 'reactions', column: 'postId', description: 'references posts.id' },
        { table: 'reactions', column: 'userId', description: 'references users.id' },
        { table: 'reactions', column: 'reactionType', description: 'love | passion | fire | tango | celebrate | brilliant - NOTE: NOT "type", it is "reactionType"' },
        { table: 'postComments', column: 'id', description: 'serial primary key' },
        { table: 'postComments', column: 'postId', description: 'references posts.id' },
        { table: 'follows', column: 'followerId', description: 'user who is following' },
        { table: 'follows', column: 'followingId', description: 'user being followed' },
        { table: 'friendships', column: 'userId', description: 'one side of friendship' },
        { table: 'friendships', column: 'friendId', description: 'other side of friendship' },
        { table: 'friendships', column: 'status', description: 'pending | accepted | rejected' },
      ],

      // Known bugs and their fixes - learned from experience
      commonBugs: [
        {
          pattern: 'reactions.type',
          fix: 'Use reactions.reactionType - the column is named "reactionType" not "type"',
          severity: 'critical',
        },
        {
          pattern: 'postShares table subquery',
          fix: 'Use posts.shares column directly instead of SELECT COUNT from postShares - the count is stored inline',
          severity: 'critical',
        },
        {
          pattern: 'AND = ',
          fix: 'SQL syntax error - missing column reference before = operator',
          severity: 'critical',
        },
        {
          pattern: 'friendships.friend_id',
          fix: 'Use friendships.friendId (camelCase in Drizzle, snake_case in raw SQL)',
          severity: 'high',
        },
        {
          pattern: 'Authorization header missing',
          fix: 'Add Authorization: Bearer ${token} header for authenticated endpoints',
          severity: 'high',
        },
      ],

      expectedBehaviors: [
        'Feed loads posts within 2 seconds',
        'Infinite scroll loads next page when 80% scrolled',
        'New posts appear via WebSocket or polling',
        'Reactions update optimistically then confirm with API',
        'Posts from blocked users are filtered out',
        'Private posts only visible to author',
        'Friends-only posts visible to accepted friends',
        'Stories disappear after 24 hours',
        'Feed algorithm prioritizes: friends > following > engagement > recency',
      ],
    };
  }

  /**
   * Initialize knowledge by scanning domain files
   */
  private async initializeKnowledge() {
    try {
      const filePath = path.join(this.projectRoot, 'client/src/pages/FeedPage.tsx');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Cache key elements
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('InfiniteScrollFeed')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/FeedPage.tsx');
          if (element) this.elementKnowledge.set('infinite-scroll-feed', element);
        }

        if (line.includes('PostCreator')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/FeedPage.tsx');
          if (element) this.elementKnowledge.set('post-creator', element);
        }

        if (line.includes('FeedTabs')) {
          const element = this.extractElementInfo(lines, i, 'client/src/pages/FeedPage.tsx');
          if (element) this.elementKnowledge.set('feed-tabs', element);
        }
      }

      console.log(`[Feed Page Agent] ✅ Initialized with ${this.elementKnowledge.size} cached elements and PRD knowledge`);
    } catch (error) {
      console.error('[Feed Page Agent] Failed to initialize knowledge:', error);
    }
  }

  /**
   * Get PRD knowledge for debugging/reporting
   */
  getPRD(): FeedPagePRD {
    return this.prd;
  }

  /**
   * Check code for known bugs from PRD
   */
  async scanForKnownBugs(code: string): Promise<{
    bugsFound: { pattern: string; fix: string; severity: string; lineHint?: number }[];
    isHealthy: boolean;
  }> {
    const bugsFound: { pattern: string; fix: string; severity: string; lineHint?: number }[] = [];
    const lines = code.split('\n');

    for (const bug of this.prd.commonBugs) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(bug.pattern)) {
          bugsFound.push({
            pattern: bug.pattern,
            fix: bug.fix,
            severity: bug.severity,
            lineHint: i + 1,
          });
        }
      }
    }

    return {
      bugsFound,
      isHealthy: bugsFound.length === 0,
    };
  }

  /**
   * Validate a SQL query against schema knowledge
   */
  validateSQL(query: string): { 
    isValid: boolean; 
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for reactions.type (should be reactionType)
    if (query.includes('reactions') && query.includes('.type') && !query.includes('.reactionType')) {
      issues.push('Using "reactions.type" but column is named "reactionType"');
      suggestions.push('Replace "reactions.type" with "reactions.reactionType"');
    }

    // Check for postShares subquery (should use posts.shares)
    if (query.includes('postShares') && query.includes('COUNT')) {
      issues.push('Using postShares table subquery - use posts.shares column instead');
      suggestions.push('Replace COUNT from postShares with posts.shares column');
    }

    // Check for AND = (missing column)
    if (/AND\s+=/.test(query)) {
      issues.push('SQL syntax error: missing column reference before = operator');
      suggestions.push('Add column name between AND and = (e.g., AND reactions.reactionType = )');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  }

  /**
   * Get expected API endpoint info
   */
  getAPIInfo(endpoint: string): { method: string; description: string } | null {
    const api = this.prd.requiredAPIs.find(a => endpoint.includes(a.endpoint.replace(':id', '')));
    return api ? { method: api.method, description: api.description } : null;
  }

  /**
   * Get schema info for a table.column
   */
  getSchemaInfo(table: string, column?: string): { table: string; column: string; description: string }[] {
    return this.prd.schemaKnowledge.filter(s => 
      s.table === table && (column ? s.column === column : true)
    );
  }

  /**
   * Report health status to Mr. Blue
   */
  async getHealthReport(): Promise<{
    agentId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    knownElements: number;
    schemaKnowledge: number;
    commonBugsTracked: number;
    featureAgents: number;
    lastChecked: string;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check if main files exist
    for (const file of this.domain.slice(0, 3)) {
      try {
        await fs.access(path.join(this.projectRoot, file));
      } catch {
        issues.push(`Missing file: ${file}`);
      }
    }

    return {
      agentId: this.id,
      status: issues.length === 0 ? 'healthy' : issues.length < 3 ? 'degraded' : 'unhealthy',
      knownElements: this.elementKnowledge.size,
      schemaKnowledge: this.prd.schemaKnowledge.length,
      commonBugsTracked: this.prd.commonBugs.length,
      featureAgents: this.featureAgents.size,
      lastChecked: new Date().toISOString(),
      issues,
    };
  }

  /**
   * Check if this agent can handle the query
   */
  async canHandle(query: string): Promise<{
    canHandle: boolean;
    confidence: number;
    element: ElementLocation | null;
    reason: string;
  }> {
    const lower = query.toLowerCase();

    // High confidence for feed-related queries
    if (lower.includes('feed') || lower.includes('post') || lower.includes('memories')) {
      return {
        canHandle: true,
        confidence: 0.90,
        element: null,
        reason: 'Feed Page Agent owns all feed, post, and memories functionality',
      };
    }

    if (lower.includes('reaction') || lower.includes('like') || lower.includes('comment')) {
      return {
        canHandle: true,
        confidence: 0.85,
        element: null,
        reason: 'Feed Page Agent owns reactions and comments on posts',
      };
    }

    if (lower.includes('story') || lower.includes('stories')) {
      return {
        canHandle: true,
        confidence: 0.80,
        element: null,
        reason: 'Feed Page Agent owns stories carousel',
      };
    }

    // Check cached elements
    if (lower.includes('infinite scroll')) {
      const element = this.elementKnowledge.get('infinite-scroll-feed');
      if (element) {
        return { canHandle: true, confidence: 0.95, element, reason: 'Known element: InfiniteScrollFeed' };
      }
    }

    return {
      canHandle: false,
      confidence: 0,
      element: null,
      reason: 'Query does not match Feed Page domain',
    };
  }

  /**
   * Find element in agent's domain
   */
  async findElement(query: string): Promise<ElementLocation | null> {
    const lower = query.toLowerCase();

    // Check cached knowledge first
    for (const [key, element] of this.elementKnowledge.entries()) {
      if (lower.includes(key.replace(/-/g, ' '))) {
        return element;
      }
    }

    // Search through domain files
    for (const filePath of this.domain) {
      try {
        const fullPath = path.join(this.projectRoot, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(lower)) {
            return this.extractElementInfo(lines, i, filePath);
          }
        }
      } catch {
        // File might not exist
      }
    }

    return null;
  }
}
