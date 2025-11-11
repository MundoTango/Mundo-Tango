/**
 * LANCEDB VECTOR DATABASE WRAPPER
 * Simple in-memory implementation for Life CEO semantic memory
 * Can be upgraded to actual LanceDB when vector search is critical
 */

interface VectorMemory {
  [key: string]: any;
  embedding?: number[];
}

class VectorDBWrapper {
  private tables: Map<string, VectorMemory[]> = new Map();

  /**
   * Add memory to vector database
   */
  async addMemory(tableName: string, data: Record<string, any>): Promise<void> {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, []);
    }

    const table = this.tables.get(tableName)!;
    
    const embedding = this.generateSimpleEmbedding(JSON.stringify(data));
    
    table.push({
      ...data,
      embedding,
      _id: Date.now() + Math.random(),
    });

    if (table.length > 1000) {
      table.splice(0, table.length - 1000);
    }
  }

  /**
   * Search memories with semantic similarity
   */
  async searchMemories(
    tableName: string,
    query: string,
    limit: number = 5,
    filters?: Record<string, any>
  ): Promise<VectorMemory[]> {
    const table = this.tables.get(tableName);
    if (!table) {
      return [];
    }

    let results = table;

    if (filters) {
      results = results.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    if (query) {
      const queryEmbedding = this.generateSimpleEmbedding(query);
      
      results = results.map(item => ({
        ...item,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding || []),
      })).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    }

    return results.slice(0, limit);
  }

  /**
   * Clear a table
   */
  async clearTable(tableName: string): Promise<void> {
    this.tables.delete(tableName);
  }

  /**
   * Generate simple embedding (can be upgraded to real embeddings later)
   */
  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + j) % embedding.length;
        embedding[index] += 1 / (i + 1);
      }
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
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

export const vectordb = new VectorDBWrapper();
