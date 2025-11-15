/**
 * Conversation Context Service
 * Tracks conversation history for each user session to enable conversational iteration
 * 
 * Features:
 * - Track prompts, responses, files changed, elements affected
 * - Provide context to MB.MD engine for references like "that button", "make it bigger"
 * - In-memory storage per user session
 * - Context window management (keep last 20 entries)
 * 
 * Phase 2: Backend Intelligence for Conversational Iteration
 */

// ==================== TYPES & INTERFACES ====================

/**
 * Single conversation entry in history
 */
export interface ConversationEntry {
  timestamp: number;
  prompt: string;
  response: any;
  filesChanged: string[];
  selectedElement?: string;
  responseType: 'style' | 'code' | 'error';
  metadata?: {
    cssChanges?: Record<string, any>;
    selector?: string;
    estimatedCost?: number;
  };
}

/**
 * Context summary for AI prompt enhancement
 */
export interface ContextSummary {
  recentPrompts: string[];
  lastSelectedElement?: string;
  filesModified: string[];
  conversationLength: number;
  lastStyleChange?: {
    selector: string;
    css: Record<string, any>;
  };
}

// ==================== CONVERSATION CONTEXT SERVICE ====================

export class ConversationContextService {
  private contexts: Map<number, ConversationEntry[]> = new Map();
  private readonly MAX_CONTEXT_LENGTH = 20; // Keep last 20 entries per user
  private readonly CONTEXT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

  constructor() {
    console.log('[ConversationContext] Initialized');
    
    // Cleanup old contexts every 30 minutes
    setInterval(() => this.cleanupExpiredContexts(), 30 * 60 * 1000);
  }

  /**
   * Add a new conversation entry
   */
  addEntry(userId: number, entry: ConversationEntry): void {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, []);
    }

    const userContext = this.contexts.get(userId)!;
    
    // Add timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }

    userContext.push(entry);

    // Trim to max length (keep most recent)
    if (userContext.length > this.MAX_CONTEXT_LENGTH) {
      userContext.shift(); // Remove oldest
    }

    console.log(`[ConversationContext] Added entry for user ${userId}. Total entries: ${userContext.length}`);
  }

  /**
   * Get full conversation context for a user
   */
  getContext(userId: number): ConversationEntry[] {
    return this.contexts.get(userId) || [];
  }

  /**
   * Get context summary optimized for AI prompts
   */
  getContextSummary(userId: number): ContextSummary {
    const context = this.getContext(userId);
    
    if (context.length === 0) {
      return {
        recentPrompts: [],
        filesModified: [],
        conversationLength: 0
      };
    }

    // Get last 5 prompts
    const recentPrompts = context
      .slice(-5)
      .map(entry => entry.prompt);

    // Get last selected element
    const lastSelectedElement = context
      .slice()
      .reverse()
      .find(entry => entry.selectedElement)?.selectedElement;

    // Get all modified files (unique)
    const filesModified = Array.from(new Set(
      context.flatMap(entry => entry.filesChanged || [])
    ));

    // Get last style change
    const lastStyleEntry = context
      .slice()
      .reverse()
      .find(entry => entry.responseType === 'style');

    const lastStyleChange = lastStyleEntry?.metadata?.cssChanges && lastStyleEntry?.metadata?.selector
      ? {
          selector: lastStyleEntry.metadata.selector,
          css: lastStyleEntry.metadata.cssChanges
        }
      : undefined;

    return {
      recentPrompts,
      lastSelectedElement,
      filesModified,
      conversationLength: context.length,
      lastStyleChange
    };
  }

  /**
   * Get the last selected element from context
   */
  getLastSelectedElement(userId: number): string | null {
    const context = this.getContext(userId);
    
    // Find most recent entry with selectedElement
    for (let i = context.length - 1; i >= 0; i--) {
      if (context[i].selectedElement) {
        return context[i].selectedElement || null;
      }
    }

    return null;
  }

  /**
   * Get files modified in recent conversation
   */
  getRecentFilesModified(userId: number, limit: number = 10): string[] {
    const context = this.getContext(userId);
    const recentEntries = context.slice(-limit);
    
    const filesSet = new Set<string>();
    recentEntries.forEach(entry => {
      entry.filesChanged?.forEach(file => filesSet.add(file));
    });

    return Array.from(filesSet);
  }

  /**
   * Clear conversation context for a user
   */
  clearContext(userId: number): void {
    this.contexts.delete(userId);
    console.log(`[ConversationContext] Cleared context for user ${userId}`);
  }

  /**
   * Check if user has active conversation
   */
  hasActiveContext(userId: number): boolean {
    const context = this.getContext(userId);
    
    if (context.length === 0) {
      return false;
    }

    // Check if last entry is recent (within TTL)
    const lastEntry = context[context.length - 1];
    const age = Date.now() - lastEntry.timestamp;
    
    return age < this.CONTEXT_TTL_MS;
  }

  /**
   * Get formatted context string for AI prompts
   */
  getFormattedContext(userId: number): string {
    const summary = this.getContextSummary(userId);
    
    if (summary.conversationLength === 0) {
      return 'No previous conversation context.';
    }

    const parts: string[] = [];
    
    parts.push(`Recent conversation (${summary.conversationLength} messages):`);
    
    if (summary.recentPrompts.length > 0) {
      parts.push('\nRecent prompts:');
      summary.recentPrompts.forEach((prompt, i) => {
        parts.push(`${i + 1}. "${prompt}"`);
      });
    }

    if (summary.lastSelectedElement) {
      parts.push(`\nLast selected element: ${summary.lastSelectedElement}`);
    }

    if (summary.filesModified.length > 0) {
      parts.push(`\nFiles modified: ${summary.filesModified.join(', ')}`);
    }

    if (summary.lastStyleChange) {
      parts.push(`\nLast style change: ${summary.lastStyleChange.selector}`);
      parts.push(`CSS: ${JSON.stringify(summary.lastStyleChange.css)}`);
    }

    return parts.join('\n');
  }

  /**
   * Cleanup expired contexts (older than TTL)
   */
  private cleanupExpiredContexts(): void {
    const now = Date.now();
    let cleanedCount = 0;

    Array.from(this.contexts.entries()).forEach(([userId, context]) => {
      if (context.length === 0) {
        this.contexts.delete(userId);
        cleanedCount++;
        return;
      }

      const lastEntry = context[context.length - 1];
      const age = now - lastEntry.timestamp;

      if (age > this.CONTEXT_TTL_MS) {
        this.contexts.delete(userId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[ConversationContext] Cleaned up ${cleanedCount} expired contexts`);
    }
  }

  /**
   * Get statistics about conversation contexts
   */
  getStats(): {
    totalUsers: number;
    totalEntries: number;
    averageEntriesPerUser: number;
  } {
    const totalUsers = this.contexts.size;
    const totalEntries = Array.from(this.contexts.values())
      .reduce((sum, context) => sum + context.length, 0);
    const averageEntriesPerUser = totalUsers > 0 ? totalEntries / totalUsers : 0;

    return {
      totalUsers,
      totalEntries,
      averageEntriesPerUser: Math.round(averageEntriesPerUser * 100) / 100
    };
  }
}

// Singleton instance
export const conversationContext = new ConversationContextService();
