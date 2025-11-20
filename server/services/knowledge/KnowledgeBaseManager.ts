/**
 * KNOWLEDGE BASE MANAGER - PHASE 4
 * Agent-to-Agent Knowledge Sharing System
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Features:
 * - Save agent knowledge to markdown files (docs/{AGENT}_KNOWLEDGE_BASE.md)
 * - Query knowledge using LanceDB RAG
 * - Cross-agent knowledge sharing
 * - Automatic embedding updates
 * - Pattern recognition and solution matching
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { lanceDB } from '../../lib/lancedb';

export interface AgentKnowledge {
  agentName: string;
  problem: string;
  solution: string;
  pattern?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface KnowledgeSearchResult {
  content: string;
  agentName: string;
  problem: string;
  solution: string;
  pattern?: string;
  similarity: number;
  metadata: Record<string, any>;
}

export class KnowledgeBaseManager {
  private knowledgeBasePath = 'docs';
  private tableName = 'agent_knowledge_bases';
  private isIndexing = false;

  /**
   * Initialize the knowledge base system
   */
  async initialize(): Promise<void> {
    console.log('[KnowledgeBase] Initializing Agent Knowledge Base Manager...');
    
    try {
      // Check if knowledge bases are indexed
      const stats = await lanceDB.getTableStats(this.tableName);
      
      if (stats.exists && stats.recordCount > 0) {
        console.log(`[KnowledgeBase] ✅ Found ${stats.recordCount} knowledge entries indexed`);
      } else {
        console.log('[KnowledgeBase] No knowledge bases indexed yet - will index on first use');
      }
    } catch (error: any) {
      console.error('[KnowledgeBase] Error initializing:', error.message);
    }
  }

  /**
   * Save knowledge to agent's knowledge base file
   */
  async saveKnowledge(knowledge: AgentKnowledge): Promise<void> {
    try {
      const fileName = `${knowledge.agentName.toUpperCase().replace(/\s+/g, '_')}_KNOWLEDGE_BASE.md`;
      const filePath = path.join(this.knowledgeBasePath, fileName);
      
      console.log(`[KnowledgeBase] 💾 Saving knowledge to ${fileName}...`);

      // Read existing content or create new file
      let content = '';
      try {
        content = await fs.readFile(filePath, 'utf-8');
      } catch {
        // File doesn't exist, create header
        content = `# ${knowledge.agentName} Knowledge Base\n\n`;
        content += `**Auto-Generated Knowledge Base** - Updated: ${new Date().toISOString()}\n\n`;
        content += `This knowledge base is automatically maintained by the ${knowledge.agentName} agent.\n\n`;
        content += `---\n\n`;
      }

      // Add new knowledge entry
      const timestamp = knowledge.timestamp || new Date();
      const entry = `## ${timestamp.toISOString().split('T')[0]} - ${this.sanitizeTitle(knowledge.problem)}\n\n`;
      const problemSection = `**Problem:**\n${knowledge.problem}\n\n`;
      const solutionSection = `**Solution:**\n${knowledge.solution}\n\n`;
      const patternSection = knowledge.pattern ? `**Pattern:**\n${knowledge.pattern}\n\n` : '';
      const metadataSection = knowledge.metadata ? `**Metadata:**\n\`\`\`json\n${JSON.stringify(knowledge.metadata, null, 2)}\n\`\`\`\n\n` : '';
      
      const newEntry = entry + problemSection + solutionSection + patternSection + metadataSection + '---\n\n';
      
      // Prepend new entry (newest first)
      const headerEndIndex = content.indexOf('---\n\n') + 5;
      if (headerEndIndex > 4) {
        content = content.slice(0, headerEndIndex) + newEntry + content.slice(headerEndIndex);
      } else {
        content += newEntry;
      }

      // Write updated content
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`[KnowledgeBase] ✅ Knowledge saved to ${fileName}`);

      // Re-index this file in LanceDB (async, don't wait)
      this.updateEmbeddings(filePath).catch(error => {
        console.error(`[KnowledgeBase] Failed to update embeddings for ${fileName}:`, error.message);
      });
    } catch (error: any) {
      console.error('[KnowledgeBase] Failed to save knowledge:', error.message);
      throw error;
    }
  }

  /**
   * Query knowledge bases using semantic search
   */
  async queryKnowledge(
    question: string,
    agentFilter?: string[],
    limit: number = 5
  ): Promise<KnowledgeSearchResult[]> {
    try {
      console.log(`[KnowledgeBase] 🔍 Searching knowledge bases for: "${question}"`);
      
      // Use LanceDB semantic search
      const results = await lanceDB.search(
        this.tableName,
        question,
        limit * 2 // Get more results for filtering
      );

      // Parse and filter results
      const knowledgeResults: KnowledgeSearchResult[] = [];
      
      for (const result of results) {
        // Extract agent name from source file
        const agentName = this.extractAgentName(result.source);
        
        // Apply agent filter if specified
        if (agentFilter && agentFilter.length > 0) {
          if (!agentFilter.some(filter => agentName.toLowerCase().includes(filter.toLowerCase()))) {
            continue;
          }
        }

        // Parse knowledge entry from content
        const parsed = this.parseKnowledgeEntry(result.content);
        
        knowledgeResults.push({
          content: result.content,
          agentName,
          problem: parsed.problem,
          solution: parsed.solution,
          pattern: parsed.pattern,
          similarity: result.similarity,
          metadata: result.metadata || {},
        });

        if (knowledgeResults.length >= limit) {
          break;
        }
      }

      console.log(`[KnowledgeBase] ✅ Found ${knowledgeResults.length} relevant knowledge entries`);
      return knowledgeResults;
    } catch (error: any) {
      console.error('[KnowledgeBase] Query failed:', error.message);
      return [];
    }
  }

  /**
   * Update embeddings for knowledge base files
   */
  async updateEmbeddings(filePath?: string): Promise<void> {
    if (this.isIndexing) {
      console.log('[KnowledgeBase] Already indexing, skipping...');
      return;
    }

    this.isIndexing = true;

    try {
      const files = filePath 
        ? [filePath]
        : await this.findAllKnowledgeBaseFiles();

      console.log(`[KnowledgeBase] 📚 Updating embeddings for ${files.length} knowledge base file(s)...`);

      let totalChunks = 0;
      for (const file of files) {
        const chunks = await this.indexKnowledgeFile(file);
        totalChunks += chunks;
      }

      console.log(`[KnowledgeBase] ✅ Indexed ${totalChunks} knowledge chunks`);
    } catch (error: any) {
      console.error('[KnowledgeBase] Failed to update embeddings:', error.message);
    } finally {
      this.isIndexing = false;
    }
  }

  /**
   * Index a single knowledge base file
   */
  private async indexKnowledgeFile(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      // Split into sections (each ## heading is a knowledge entry)
      const sections = content.split(/^## /m).filter(s => s.trim().length > 0);
      
      const chunks: any[] = [];
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Skip header section
        if (section.includes('Auto-Generated Knowledge Base')) {
          continue;
        }

        chunks.push({
          id: `${fileName}_${i}`,
          source: fileName,
          content: section.trim(),
          metadata: {
            type: 'agent_knowledge',
            agentName: this.extractAgentName(fileName),
            chunkIndex: i,
            indexed: true,
          },
          timestamp: Date.now(),
        });
      }

      if (chunks.length > 0) {
        await lanceDB.addVectors(this.tableName, chunks);
      }

      return chunks.length;
    } catch (error: any) {
      console.error(`[KnowledgeBase] Failed to index ${filePath}:`, error.message);
      return 0;
    }
  }

  /**
   * Find all knowledge base files
   */
  private async findAllKnowledgeBaseFiles(): Promise<string[]> {
    const files = await fs.readdir(this.knowledgeBasePath);
    return files
      .filter(file => file.endsWith('_KNOWLEDGE_BASE.md'))
      .map(file => path.join(this.knowledgeBasePath, file));
  }

  /**
   * Extract agent name from file name
   */
  private extractAgentName(source: string): string {
    const match = source.match(/(.+?)_KNOWLEDGE_BASE\.md/i);
    return match ? match[1].replace(/_/g, ' ') : 'Unknown Agent';
  }

  /**
   * Parse knowledge entry from markdown content
   */
  private parseKnowledgeEntry(content: string): {
    problem: string;
    solution: string;
    pattern?: string;
  } {
    const problemMatch = content.match(/\*\*Problem:\*\*\n([\s\S]*?)\n\n/);
    const solutionMatch = content.match(/\*\*Solution:\*\*\n([\s\S]*?)\n\n/);
    const patternMatch = content.match(/\*\*Pattern:\*\*\n([\s\S]*?)\n\n/);

    return {
      problem: problemMatch ? problemMatch[1].trim() : 'Unknown problem',
      solution: solutionMatch ? solutionMatch[1].trim() : 'Unknown solution',
      pattern: patternMatch ? patternMatch[1].trim() : undefined,
    };
  }

  /**
   * Sanitize title for markdown heading
   */
  private sanitizeTitle(text: string): string {
    return text
      .split('\n')[0] // First line only
      .replace(/[#*`]/g, '') // Remove markdown chars
      .substring(0, 80) // Max 80 chars
      .trim();
  }

  /**
   * Get knowledge base stats
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalEntries: number;
    agentNames: string[];
  }> {
    const files = await this.findAllKnowledgeBaseFiles();
    let totalEntries = 0;
    const agentNames: string[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const sections = content.split(/^## /m).filter(s => s.trim().length > 0);
      totalEntries += sections.length - 1; // Subtract header section
      agentNames.push(this.extractAgentName(path.basename(file)));
    }

    return {
      totalFiles: files.length,
      totalEntries,
      agentNames,
    };
  }
}

export const knowledgeBaseManager = new KnowledgeBaseManager();
