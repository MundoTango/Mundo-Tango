/**
 * PRODUCTION-READY LANCEDB VECTOR DATABASE INTEGRATION
 * Provides persistent vector storage with OpenAI embeddings for agent memory
 * 
 * Features:
 * - Real LanceDB with Apache Arrow for performance
 * - OpenAI text-embedding-3-small for semantic search
 * - Persistent storage on disk
 * - Automatic table creation
 * - Vector similarity search with filters
 * - Efficient batch operations
 */

import { connect, Connection, Table } from '@lancedb/lancedb';
import OpenAI from 'openai';
import * as path from 'path';

// OpenAI client with Bifrost gateway support
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

// LanceDB connection config
const LANCEDB_PATH = process.env.LANCEDB_PATH || './lancedb_data';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

interface VectorMemory {
  id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  timestamp?: number;
  [key: string]: any;
}

interface SearchResult extends VectorMemory {
  _distance?: number;
  similarity?: number;
}

/**
 * Production LanceDB Vector Database Service
 * Handles all vector storage and retrieval operations
 */
class LanceDBService {
  private connection: Connection | null = null;
  private embeddingCache: Map<string, number[]> = new Map();
  private tableCache: Map<string, Table> = new Map();
  
  /**
   * Initialize LanceDB connection
   */
  async initialize(): Promise<void> {
    try {
      console.log('[LanceDB] Initializing connection...');
      this.connection = await connect(LANCEDB_PATH);
      console.log(`[LanceDB] ✅ Connected to ${LANCEDB_PATH}`);
    } catch (error) {
      console.error('[LanceDB] ❌ Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get or create a table
   */
  private async getTable(tableName: string): Promise<Table> {
    if (!this.connection) {
      await this.initialize();
    }

    // Check cache first
    if (this.tableCache.has(tableName)) {
      return this.tableCache.get(tableName)!;
    }

    try {
      // Check if table exists
      const tableNames = await this.connection!.tableNames();
      
      if (tableNames.includes(tableName)) {
        const table = await this.connection!.openTable(tableName);
        this.tableCache.set(tableName, table);
        return table;
      }

      // Create new table with schema
      console.log(`[LanceDB] Creating new table: ${tableName}`);
      const sampleData: VectorMemory[] = [{
        id: 'init',
        content: 'Initialization record',
        embedding: new Array(EMBEDDING_DIMENSIONS).fill(0),
        metadata: { initialized: true },
        timestamp: Date.now()
      }];

      const table = await this.connection!.createTable(tableName, sampleData, { mode: 'overwrite' });
      this.tableCache.set(tableName, table);
      
      console.log(`[LanceDB] ✅ Table created: ${tableName}`);
      return table;
    } catch (error) {
      console.error(`[LanceDB] ❌ Error getting/creating table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generate OpenAI embedding for text
   * With caching to reduce API calls
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    const cacheKey = text.slice(0, 500); // Cache key based on first 500 chars
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      const embedding = response.data[0].embedding;

      // Validate embedding dimensions
      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        console.warn(`[LanceDB] Warning: Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}`);
      }

      // Cache for reuse (limit cache size)
      if (this.embeddingCache.size >= 1000) {
        // Remove oldest entry (simple LRU)
        const firstKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(firstKey);
      }
      this.embeddingCache.set(cacheKey, embedding);

      return embedding;
    } catch (error) {
      console.error('[LanceDB] ❌ Error generating embedding:', error);
      // Return zero vector on error
      return new Array(EMBEDDING_DIMENSIONS).fill(0);
    }
  }

  /**
   * Add memory to vector database
   */
  async addMemory(tableName: string, data: Omit<VectorMemory, 'embedding'>): Promise<void> {
    try {
      const table = await this.getTable(tableName);

      // Generate embedding for content
      const embedding = await this.generateEmbedding(data.content);

      // Prepare record
      const record: VectorMemory = {
        id: data.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        embedding,
        metadata: data.metadata || {},
        timestamp: data.timestamp || Date.now(),
        ...data
      };

      // Add to table
      await table.add([record]);

      console.log(`[LanceDB] ✅ Memory added to ${tableName}: ${record.id}`);
    } catch (error) {
      console.error('[LanceDB] ❌ Error adding memory:', error);
      throw error;
    }
  }

  /**
   * Add multiple memories in batch (more efficient)
   */
  async addMemories(tableName: string, dataArray: Array<Omit<VectorMemory, 'embedding'>>): Promise<void> {
    try {
      const table = await this.getTable(tableName);

      // Generate embeddings for all contents in parallel
      const embeddings = await Promise.all(
        dataArray.map(data => this.generateEmbedding(data.content))
      );

      // Prepare records
      const records: VectorMemory[] = dataArray.map((data, index) => ({
        id: data.id || `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        embedding: embeddings[index],
        metadata: data.metadata || {},
        timestamp: data.timestamp || Date.now(),
        ...data
      }));

      // Add all records at once
      await table.add(records);

      console.log(`[LanceDB] ✅ Batch added ${records.length} memories to ${tableName}`);
    } catch (error) {
      console.error('[LanceDB] ❌ Error adding batch memories:', error);
      throw error;
    }
  }

  /**
   * Search memories with semantic similarity
   * Returns results sorted by relevance
   */
  async searchMemories(
    tableName: string,
    query: string,
    limit: number = 5,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    try {
      const table = await this.getTable(tableName);

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Perform vector search
      let searchQuery = table
        .search(queryEmbedding)
        .limit(limit);

      // Apply filters if provided
      if (filters) {
        const filterConditions = Object.entries(filters)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return `${key} = '${value}'`;
            }
            return `${key} = ${value}`;
          })
          .join(' AND ');
        
        if (filterConditions) {
          searchQuery = searchQuery.where(filterConditions);
        }
      }

      // Execute search
      const results = await searchQuery.toArray();

      // Convert distance to similarity score (0-1, higher is better)
      const resultsWithSimilarity = results.map((result: any) => ({
        ...result,
        similarity: result._distance !== undefined 
          ? Math.max(0, 1 - result._distance) 
          : 0
      }));

      console.log(`[LanceDB] ✅ Found ${resultsWithSimilarity.length} results for query in ${tableName}`);
      return resultsWithSimilarity;
    } catch (error) {
      console.error('[LanceDB] ❌ Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get all memories from table (with optional filter)
   */
  async getAllMemories(
    tableName: string,
    filters?: Record<string, any>,
    limit?: number
  ): Promise<VectorMemory[]> {
    try {
      const table = await this.getTable(tableName);

      let query = table.query();

      // Apply filters
      if (filters) {
        const filterConditions = Object.entries(filters)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return `${key} = '${value}'`;
            }
            return `${key} = ${value}`;
          })
          .join(' AND ');
        
        if (filterConditions) {
          query = query.where(filterConditions);
        }
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const results = await query.toArray();
      return results;
    } catch (error) {
      console.error('[LanceDB] ❌ Error getting all memories:', error);
      return [];
    }
  }

  /**
   * Delete memories by filter
   */
  async deleteMemories(tableName: string, filters: Record<string, any>): Promise<number> {
    try {
      const table = await this.getTable(tableName);

      const filterConditions = Object.entries(filters)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key} = '${value}'`;
          }
          return `${key} = ${value}`;
        })
        .join(' AND ');

      if (!filterConditions) {
        console.warn('[LanceDB] ⚠️ No filters provided for deletion');
        return 0;
      }

      // Delete matching records
      await table.delete(filterConditions);

      console.log(`[LanceDB] ✅ Deleted memories from ${tableName} matching: ${filterConditions}`);
      return 1; // LanceDB doesn't return count, return success indicator
    } catch (error) {
      console.error('[LanceDB] ❌ Error deleting memories:', error);
      return 0;
    }
  }

  /**
   * Delete old memories (for auto-expiration)
   */
  async deleteOldMemories(tableName: string, olderThanMs: number): Promise<number> {
    try {
      const cutoffTime = Date.now() - olderThanMs;
      return await this.deleteMemories(tableName, { timestamp: `< ${cutoffTime}` });
    } catch (error) {
      console.error('[LanceDB] ❌ Error deleting old memories:', error);
      return 0;
    }
  }

  /**
   * Clear entire table
   */
  async clearTable(tableName: string): Promise<void> {
    try {
      if (!this.connection) {
        await this.initialize();
      }

      await this.connection!.dropTable(tableName);
      this.tableCache.delete(tableName);
      
      console.log(`[LanceDB] ✅ Table cleared: ${tableName}`);
    } catch (error) {
      console.error(`[LanceDB] ❌ Error clearing table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<{
    name: string;
    recordCount: number;
    exists: boolean;
  }> {
    try {
      if (!this.connection) {
        await this.initialize();
      }

      const tableNames = await this.connection!.tableNames();
      
      if (!tableNames.includes(tableName)) {
        return {
          name: tableName,
          recordCount: 0,
          exists: false
        };
      }

      const table = await this.getTable(tableName);
      const count = await table.countRows();

      return {
        name: tableName,
        recordCount: count,
        exists: true
      };
    } catch (error) {
      console.error(`[LanceDB] ❌ Error getting table stats for ${tableName}:`, error);
      return {
        name: tableName,
        recordCount: 0,
        exists: false
      };
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * Utility method for custom similarity calculations
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// Export singleton instance
export const lanceDB = new LanceDBService();

// For backward compatibility with existing code
export const vectordb = {
  addMemory: (tableName: string, data: any) => lanceDB.addMemory(tableName, data),
  searchMemories: (tableName: string, query: string, limit?: number, filters?: any) => 
    lanceDB.searchMemories(tableName, query, limit, filters),
  clearTable: (tableName: string) => lanceDB.clearTable(tableName),
};
