/**
 * MR BLUE CONTEXT SERVICE - SYSTEM 1
 * LanceDB-powered context system for loading 134,648+ lines of documentation
 * Provides <200ms semantic search for Mr Blue AI Partner
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Loads ULTIMATE_COMPLETE_HANDOFF.md, Parts 0-10, replit.md
 * - Chunks documentation for optimal vector search
 * - Semantic RAG (Retrieval Augmented Generation)
 * - Sub-200ms query response time
 * - Progressive indexing (batch processing)
 */

import { lanceDB } from '../../lib/lancedb';
import { knowledgeBaseManager, KnowledgeSearchResult } from '../knowledge/KnowledgeBaseManager';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DocumentChunk {
  id: string;
  source: string;
  content: string;
  section: string;
  metadata: {
    fileType: string;
    chunkIndex: number;
    totalChunks: number;
    characterCount: number;
    lineCount: number;
    indexed: boolean;
  };
  timestamp: number;
}

export interface ContextSearchResult {
  content: string;
  source: string;
  section: string;
  similarity: number;
  metadata: Record<string, any>;
}

export class ContextService {
  private tableName = 'mr_blue_context';
  private chunkSize = 2000; // Characters per chunk (optimal for embeddings)
  private chunkOverlap = 200; // Overlap for context continuity
  private isIndexing = false;
  private indexingProgress = 0;

  /**
   * Primary documentation sources (134,648+ lines total)
   */
  private documentSources = [
    {
      path: 'docs/handoff/ULTIMATE_COMPLETE_HANDOFF.md',
      type: 'complete-strategy',
      priority: 1
    },
    {
      path: 'docs/handoff/replit_md_from_old repo',
      type: 'old-project-context',
      priority: 2
    },
    {
      path: 'replit.md',
      type: 'current-status',
      priority: 1
    },
    {
      path: 'mb.md',
      type: 'methodology',
      priority: 1
    },
    {
      path: 'MB.MD_V7.1_PROTOCOL.md',
      type: 'methodology-detailed',
      priority: 2
    },
    // Parts 2-10 (source material)
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_2.md',
      type: 'part-2',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_3.md',
      type: 'part-3',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_4_USER_PROFILE.md',
      type: 'part-4',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_5.md',
      type: 'part-5',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_6.md',
      type: 'part-6',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_7',
      type: 'part-7',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_8.md',
      type: 'part-8',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_9',
      type: 'part-9',
      priority: 3
    },
    {
      path: 'docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_10.md',
      type: 'part-10',
      priority: 3
    },
    // Mr Blue Agent System
    {
      path: 'Mr Blue/agents/identity/system-prompt.md',
      type: 'mr-blue-identity',
      priority: 1
    },
    {
      path: 'Mr Blue/operations/10-step-workflow.md',
      type: 'mr-blue-workflow',
      priority: 1
    },
    {
      path: 'Mr Blue/playbooks/qa-customer-platform.md',
      type: 'mr-blue-task-qa-platform',
      priority: 1  // High priority - active task
    },
    {
      path: 'Mr Blue/agents/leadership/memory/god-commands.json',
      type: 'god-commands',
      priority: 1
    },
    {
      path: 'Mr Blue/agents/leadership/memory/active-tasks.json',
      type: 'active-tasks',
      priority: 1  // Highest priority - check first
    },
    // VibeCoding Evolution Documents (Dec 2025)
    {
      path: 'Mr Blue/VIBECODING_GAP_ANALYSIS.md',
      type: 'vibecoding-evolution',
      priority: 1  // High priority - learning roadmap
    },
    {
      path: 'Mr Blue/VIBECODING_LEARNING_GUIDE.md',
      type: 'vibecoding-learning',
      priority: 1  // High priority - expert knowledge
    }
  ];

  /**
   * Initialize context system - check if documents are indexed
   */
  async initialize(): Promise<{ indexed: boolean; documentCount: number }> {
    try {
      console.log('[MrBlue Context] Initializing context system...');
      
      const stats = await lanceDB.getTableStats(this.tableName);
      
      if (stats.exists && stats.recordCount > 100) {
        console.log(`[MrBlue Context] ✅ Already indexed ${stats.recordCount} chunks`);
        return { indexed: true, documentCount: stats.recordCount };
      }

      // Don't auto-index on startup (causes heap out of memory)
      // Index will happen on-demand when Mr Blue is first used
      console.log('[MrBlue Context] ⏳ No index found - indexing will happen on first Mr Blue use');
      return { indexed: false, documentCount: 0 };
    } catch (error) {
      console.error('[MrBlue Context] Error initializing:', error);
      return { indexed: false, documentCount: 0 };
    }
  }

  /**
   * Index all documentation (Progressive batching)
   * Runs in background, doesn't block initialization
   */
  async indexDocumentation(): Promise<{ success: boolean; chunksIndexed: number; errors: string[] }> {
    if (this.isIndexing) {
      return { success: false, chunksIndexed: 0, errors: ['Already indexing'] };
    }

    this.isIndexing = true;
    this.indexingProgress = 0;

    const errors: string[] = [];
    let totalChunks = 0;

    try {
      console.log('[MrBlue Context] 📚 Starting documentation indexing...');
      
      // Sort by priority (index critical docs first)
      const sortedSources = this.documentSources.sort((a, b) => a.priority - b.priority);

      for (let i = 0; i < sortedSources.length; i++) {
        const doc = sortedSources[i];
        this.indexingProgress = Math.floor((i / sortedSources.length) * 100);

        try {
          console.log(`[MrBlue Context] [${i + 1}/${sortedSources.length}] Indexing: ${doc.path}`);
          
          const chunks = await this.indexDocument(doc.path, doc.type);
          totalChunks += chunks;

          console.log(`[MrBlue Context] ✅ Indexed ${chunks} chunks from ${doc.path}`);
        } catch (error: any) {
          const errorMsg = `Failed to index ${doc.path}: ${error.message}`;
          console.error(`[MrBlue Context] ❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      this.indexingProgress = 100;
      this.isIndexing = false;

      console.log(`[MrBlue Context] 🎉 Indexing complete! ${totalChunks} chunks indexed`);
      
      return { success: true, chunksIndexed: totalChunks, errors };
    } catch (error: any) {
      console.error('[MrBlue Context] ❌ Indexing failed:', error);
      this.isIndexing = false;
      return { success: false, chunksIndexed: totalChunks, errors: [error.message] };
    }
  }

  /**
   * Index a single document file
   */
  private async indexDocument(filePath: string, fileType: string): Promise<number> {
    try {
      // Read file
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');

      if (!content || content.trim().length === 0) {
        console.warn(`[MrBlue Context] ⚠️  Empty file: ${filePath}`);
        return 0;
      }

      // Extract sections (by markdown headers)
      const sections = this.extractSections(content);

      // Chunk each section
      const allChunks: Omit<DocumentChunk, 'embedding'>[] = [];

      for (const section of sections) {
        const chunks = this.chunkText(section.content, section.title);
        
        chunks.forEach((chunk, index) => {
          allChunks.push({
            id: `${fileType}_${section.title}_${index}_${Date.now()}`,
            source: filePath,
            content: chunk,
            section: section.title,
            metadata: {
              fileType,
              chunkIndex: index,
              totalChunks: chunks.length,
              characterCount: chunk.length,
              lineCount: chunk.split('\n').length,
              indexed: true
            },
            timestamp: Date.now()
          });
        });
      }

      // Batch insert to LanceDB (efficient)
      if (allChunks.length > 0) {
        await lanceDB.addMemories(this.tableName, allChunks);
      }

      return allChunks.length;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`[MrBlue Context] ⚠️  File not found: ${filePath}`);
        return 0;
      }
      throw error;
    }
  }

  /**
   * Extract sections from markdown content
   */
  private extractSections(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    
    // Split by markdown headers (# or ##)
    const headerRegex = /^#{1,3}\s+(.+)$/gm;
    let currentSection = { title: 'Introduction', content: '' };
    let lastIndex = 0;

    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      // Save previous section
      if (lastIndex > 0) {
        currentSection.content = content.substring(lastIndex, match.index).trim();
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
      }

      // Start new section
      currentSection = {
        title: match[1].trim(),
        content: ''
      };
      lastIndex = match.index;
    }

    // Add final section
    if (lastIndex < content.length) {
      currentSection.content = content.substring(lastIndex).trim();
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
    }

    // If no sections found, treat entire content as one section
    if (sections.length === 0) {
      sections.push({ title: 'Content', content: content.trim() });
    }

    return sections;
  }

  /**
   * Chunk text into optimal sizes for embeddings
   * Uses sliding window with overlap for context continuity
   */
  private chunkText(text: string, sectionTitle: string): string[] {
    const chunks: string[] = [];
    
    // If text is smaller than chunk size, return as-is
    if (text.length <= this.chunkSize) {
      return [text];
    }

    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, text.length);
      let chunk = text.substring(startIndex, endIndex);

      // Try to break at paragraph boundary
      if (endIndex < text.length) {
        const lastParagraph = chunk.lastIndexOf('\n\n');
        if (lastParagraph > this.chunkSize / 2) {
          chunk = chunk.substring(0, lastParagraph);
        }
      }

      // Add section context to each chunk
      const contextualChunk = `## ${sectionTitle}\n\n${chunk}`;
      chunks.push(contextualChunk);

      // Move to next chunk with overlap
      startIndex = startIndex + chunk.length - this.chunkOverlap;
    }

    return chunks;
  }

  /**
   * Search documentation with semantic similarity
   * Sub-200ms target response time
   */
  async search(
    query: string,
    limit: number = 5,
    filters?: { fileType?: string; source?: string }
  ): Promise<ContextSearchResult[]> {
    try {
      const startTime = Date.now();
      
      console.log(`[MrBlue Context] 🔍 Searching: "${query}" (limit: ${limit})`);

      // Perform semantic search
      const results = await lanceDB.searchMemories(
        this.tableName,
        query,
        limit,
        filters
      );

      const searchTime = Date.now() - startTime;
      console.log(`[MrBlue Context] ✅ Found ${results.length} results in ${searchTime}ms`);

      // Format results
      return results.map((result: any) => ({
        content: result.content,
        source: result.source,
        section: result.section,
        similarity: result.similarity || 0,
        metadata: {
          fileType: result.metadata?.fileType || result.fileType,
          chunkIndex: result.metadata?.chunkIndex || result.chunkIndex,
          characterCount: result.metadata?.characterCount || result.characterCount
        }
      }));
    } catch (error) {
      console.error('[MrBlue Context] ❌ Search error:', error);
      return [];
    }
  }

  /**
   * PHASE 4: Search both documentation AND agent knowledge bases
   * Provides comprehensive context from docs + cross-agent learning
   */
  async searchWithKnowledgeBases(
    query: string,
    limitDocs: number = 3,
    limitKnowledge: number = 2,
    agentFilter?: string[]
  ): Promise<{
    documentation: ContextSearchResult[];
    knowledge: KnowledgeSearchResult[];
    combined: Array<ContextSearchResult | KnowledgeSearchResult>;
  }> {
    try {
      const startTime = Date.now();
      console.log(`[MrBlue Context] 🔍 Comprehensive search (docs + knowledge): "${query}"`);

      // Search both in parallel
      const [docResults, knowledgeResults] = await Promise.all([
        this.search(query, limitDocs),
        knowledgeBaseManager.queryKnowledge(query, agentFilter, limitKnowledge)
      ]);

      // Combine and sort by similarity
      const combined = [...docResults, ...knowledgeResults].sort(
        (a, b) => (b.similarity || 0) - (a.similarity || 0)
      );

      const searchTime = Date.now() - startTime;
      console.log(
        `[MrBlue Context] ✅ Found ${docResults.length} docs + ${knowledgeResults.length} knowledge entries in ${searchTime}ms`
      );

      return {
        documentation: docResults,
        knowledge: knowledgeResults,
        combined
      };
    } catch (error) {
      console.error('[MrBlue Context] ❌ Comprehensive search error:', error);
      return {
        documentation: [],
        knowledge: [],
        combined: []
      };
    }
  }

  /**
   * PHASE 4: Search ONLY agent knowledge bases
   * Used when specifically looking for agent wisdom/patterns
   */
  async searchKnowledgeBasesOnly(
    query: string,
    limit: number = 5,
    agentFilter?: string[]
  ): Promise<KnowledgeSearchResult[]> {
    try {
      console.log(`[MrBlue Context] 🧠 Knowledge bases only search: "${query}"`);
      
      const results = await knowledgeBaseManager.queryKnowledge(
        query,
        agentFilter,
        limit
      );

      console.log(`[MrBlue Context] ✅ Found ${results.length} knowledge entries`);
      return results;
    } catch (error) {
      console.error('[MrBlue Context] ❌ Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Multi-query search (parallel semantic search for related concepts)
   * Used when single query isn't sufficient
   */
  async multiSearch(
    queries: string[],
    limitPerQuery: number = 3
  ): Promise<ContextSearchResult[]> {
    try {
      console.log(`[MrBlue Context] 🔍 Multi-search: ${queries.length} queries`);

      // Execute all searches in parallel
      const results = await Promise.all(
        queries.map(query => this.search(query, limitPerQuery))
      );

      // Flatten and deduplicate
      const allResults = results.flat();
      const uniqueResults = this.deduplicateResults(allResults);

      // Sort by similarity
      uniqueResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      console.log(`[MrBlue Context] ✅ Multi-search complete: ${uniqueResults.length} unique results`);
      
      return uniqueResults;
    } catch (error) {
      console.error('[MrBlue Context] ❌ Multi-search error:', error);
      return [];
    }
  }

  /**
   * Deduplicate search results by content similarity
   */
  private deduplicateResults(results: ContextSearchResult[]): ContextSearchResult[] {
    const unique: ContextSearchResult[] = [];
    const seen = new Set<string>();

    for (const result of results) {
      // Create hash of first 200 chars for deduplication
      const hash = result.content.substring(0, 200).trim();
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Get indexing status
   */
  getIndexingStatus(): { isIndexing: boolean; progress: number } {
    return {
      isIndexing: this.isIndexing,
      progress: this.indexingProgress
    };
  }

  /**
   * Get context statistics
   */
  async getStats(): Promise<{
    totalChunks: number;
    documentSources: number;
    isIndexed: boolean;
    tableName: string;
  }> {
    const stats = await lanceDB.getTableStats(this.tableName);
    
    return {
      totalChunks: stats.recordCount,
      documentSources: this.documentSources.length,
      isIndexed: stats.exists && stats.recordCount > 0,
      tableName: this.tableName
    };
  }

  /**
   * Clear all indexed data (for re-indexing)
   */
  async clearIndex(): Promise<void> {
    try {
      console.log('[MrBlue Context] 🗑️  Clearing index...');
      await lanceDB.clearTable(this.tableName);
      console.log('[MrBlue Context] ✅ Index cleared');
    } catch (error) {
      console.error('[MrBlue Context] ❌ Error clearing index:', error);
      throw error;
    }
  }

  /**
   * Search for similar errors (Phase 3: Error Analysis API)
   * MB.MD v9.8: Now fully implemented with LanceDB semantic search
   * 
   * @param errorMessage - The error message to search for
   * @param topK - Number of similar errors to return (default: 5)
   * @returns Array of similar errors with similarity scores
   */
  async searchErrors(errorMessage: string, topK: number = 5): Promise<Array<{
    id: number;
    errorMessage: string;
    similarity: number;
  }>> {
    console.log(`[MrBlue Context] searchErrors() called for: "${errorMessage.substring(0, 50)}..." (topK: ${topK})`);
    
    try {
      // Use dedicated error_patterns LanceDB table for semantic search
      const errorTableName = 'error_patterns_vectors';
      
      // Search for similar errors using LanceDB semantic similarity
      const searchResults = await lanceDB.searchMemories(
        errorTableName,
        errorMessage,
        topK
      );
      
      if (searchResults.length === 0) {
        console.log('[MrBlue Context] ⚠️ No similar errors found in LanceDB');
        return [];
      }
      
      // Map LanceDB results to expected format
      const results = searchResults.map(result => ({
        id: parseInt(result.id?.replace('error_', '') || '0', 10),
        errorMessage: result.content || '',
        similarity: result.similarity || 0
      })).filter(r => r.id > 0 && r.similarity > 0.3); // Filter low-confidence matches
      
      console.log(`[MrBlue Context] ✅ Found ${results.length} similar error(s) via LanceDB semantic search`);
      
      return results;
    } catch (error: any) {
      // If error_patterns_vectors table doesn't exist yet, fall back gracefully
      if (error.message?.includes('table') || error.message?.includes('not found')) {
        console.log('[MrBlue Context] ℹ️ Error patterns table not yet initialized - will populate on first error');
        return [];
      }
      
      console.error('[MrBlue Context] ❌ Error searching similar errors:', error.message);
      return [];
    }
  }
  
  /**
   * Index an error in LanceDB for future semantic search
   * Called when new errors are stored in PostgreSQL
   */
  async indexError(errorId: number, errorMessage: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const errorTableName = 'error_patterns_vectors';
      
      await lanceDB.addMemory(errorTableName, {
        id: `error_${errorId}`,
        content: errorMessage,
        metadata: {
          errorId,
          indexedAt: new Date().toISOString(),
          ...metadata
        },
        timestamp: Date.now()
      });
      
      console.log(`[MrBlue Context] ✅ Indexed error #${errorId} in LanceDB for semantic search`);
    } catch (error: any) {
      console.error(`[MrBlue Context] ❌ Failed to index error #${errorId}:`, error.message);
    }
  }
}

// Export singleton instance
export const contextService = new ContextService();
