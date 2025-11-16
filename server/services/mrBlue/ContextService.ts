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

interface ContextSearchResult {
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

      console.log('[MrBlue Context] No index found - indexing required');
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
}

// Export singleton instance
export const contextService = new ContextService();
