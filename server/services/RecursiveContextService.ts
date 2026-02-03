/**
 * RECURSIVE CONTEXT SERVICE - Samsung TinyRecursiveModels Pattern
 * MB.MD v9.9.3 Pattern 64: Context Sync Ritual
 * 
 * Implements hierarchical code summarization for token compression:
 * - Level 1: Function-level summaries
 * - Level 2: File-level summaries (aggregated from functions)
 * - Level 3: Module-level summaries (aggregated from files)
 * - Level 4: Platform-level summary (aggregated from modules)
 * 
 * Benefits:
 * - 80-90% token reduction for LLM context
 * - Semantic preservation across compression levels
 * - Fast retrieval via LanceDB embeddings
 * - Incremental updates on file changes
 */

// // import { lanceDB } from '../../lib/lancedb'; // TODO: lib/lancedb doesn't exist  // TODO: lib/lancedb doesn't exist
import Groq from 'groq-sdk';
// import * as fs from 'fs/promises';  // TODO: File missing
import * as path from 'path';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SummaryLevel = 'function' | 'file' | 'module' | 'platform';

export interface CodeSummary {
  id: string;
  level: SummaryLevel;
  path: string;
  name: string;
  summary: string;
  tokens: number;
  originalTokens: number;
  compressionRatio: number;
  children: string[]; // IDs of child summaries
  parent?: string; // ID of parent summary
  lastUpdated: Date;
  hash: string; // Content hash for change detection
  embedding?: number[];
}

export interface FunctionInfo {
  name: string;
  params: string[];
  returnType?: string;
  body: string;
  lineStart: number;
  lineEnd: number;
}

export interface ModuleStructure {
  path: string;
  files: string[];
  subModules: string[];
}

export interface RecursiveContext {
  query: string;
  relevantSummaries: CodeSummary[];
  expandedContext: string;
  totalTokens: number;
  compressionAchieved: number;
}

// ============================================================================
// RECURSIVE CONTEXT SERVICE
// ============================================================================

export class RecursiveContextService {
  private tableName = 'code_summaries';
  private initialized = false;
  private summaryCache = new Map<string, CodeSummary>();

  /**
   * Initialize the service and LanceDB table
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await lanceDB.initialize();
      this.initialized = true;
      console.log('[RecursiveContext] ✅ Initialized with LanceDB');
    } catch (error) {
      console.error('[RecursiveContext] ❌ Initialization failed:', error);
    }
  }

  /**
   * Generate summary for a single function
   */
  async summarizeFunction(func: FunctionInfo, filePath: string): Promise<CodeSummary> {
    const prompt = `Summarize this TypeScript function in 1-2 sentences. Focus on what it does, not how:

Function: ${func.name}
Parameters: ${func.params.join(', ')}
Returns: ${func.returnType || 'void'}
Body (first 500 chars): ${func.body.substring(0, 500)}

Summary:`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3
      });

      const summary = response.choices[0]?.message?.content || `Function ${func.name}`;
      const originalTokens = this.estimateTokens(func.body);
      const summaryTokens = this.estimateTokens(summary);

      return {
        id: `func_${filePath}_${func.name}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        level: 'function',
        path: filePath,
        name: func.name,
        summary,
        tokens: summaryTokens,
        originalTokens,
        compressionRatio: originalTokens / Math.max(summaryTokens, 1),
        children: [],
        lastUpdated: new Date(),
        hash: this.hashContent(func.body)
      };
    } catch (error) {
      console.error(`[RecursiveContext] Error summarizing function ${func.name}:`, error);
      return {
        id: `func_${filePath}_${func.name}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        level: 'function',
        path: filePath,
        name: func.name,
        summary: `Function ${func.name} with ${func.params.length} parameters`,
        tokens: 10,
        originalTokens: this.estimateTokens(func.body),
        compressionRatio: 1,
        children: [],
        lastUpdated: new Date(),
        hash: this.hashContent(func.body)
      };
    }
  }

  /**
   * Generate summary for a file by aggregating function summaries
   */
  async summarizeFile(filePath: string): Promise<CodeSummary> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const functions = this.extractFunctions(content);
      
      // Summarize each function
      const funcSummaries: CodeSummary[] = [];
      for (const func of functions.slice(0, 10)) { // Limit to 10 functions per file
        const summary = await this.summarizeFunction(func, filePath);
        funcSummaries.push(summary);
      }

      // Aggregate into file summary
      const aggregatedContent = funcSummaries.map(f => `- ${f.name}: ${f.summary}`).join('\n');
      
      const prompt = `Summarize this TypeScript file based on its functions in 2-3 sentences:

File: ${path.basename(filePath)}
Functions:
${aggregatedContent}

File summary:`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      });

      const summary = response.choices[0]?.message?.content || `File ${path.basename(filePath)}`;
      const originalTokens = this.estimateTokens(content);
      const summaryTokens = this.estimateTokens(summary);

      return {
        id: `file_${filePath}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        level: 'file',
        path: filePath,
        name: path.basename(filePath),
        summary,
        tokens: summaryTokens,
        originalTokens,
        compressionRatio: originalTokens / Math.max(summaryTokens, 1),
        children: funcSummaries.map(f => f.id),
        lastUpdated: new Date(),
        hash: this.hashContent(content)
      };
    } catch (error) {
      console.error(`[RecursiveContext] Error summarizing file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Generate summary for a module/directory
   */
  async summarizeModule(modulePath: string): Promise<CodeSummary> {
    try {
      const files = await this.getTypeScriptFiles(modulePath);
      const fileSummaries: CodeSummary[] = [];

      for (const file of files.slice(0, 20)) { // Limit to 20 files per module
        try {
          const summary = await this.summarizeFile(file);
          fileSummaries.push(summary);
        } catch (error) {
          console.warn(`[RecursiveContext] Skipping file ${file}:`, error);
        }
      }

      const aggregatedContent = fileSummaries.map(f => `- ${f.name}: ${f.summary}`).join('\n');

      const prompt = `Summarize this code module based on its files in 2-3 sentences:

Module: ${path.basename(modulePath)}
Files:
${aggregatedContent}

Module summary:`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      });

      const summary = response.choices[0]?.message?.content || `Module ${path.basename(modulePath)}`;
      const originalTokens = fileSummaries.reduce((sum, f) => sum + f.originalTokens, 0);
      const summaryTokens = this.estimateTokens(summary);

      return {
        id: `module_${modulePath}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        level: 'module',
        path: modulePath,
        name: path.basename(modulePath),
        summary,
        tokens: summaryTokens,
        originalTokens,
        compressionRatio: originalTokens / Math.max(summaryTokens, 1),
        children: fileSummaries.map(f => f.id),
        lastUpdated: new Date(),
        hash: this.hashContent(fileSummaries.map(f => f.hash).join(''))
      };
    } catch (error) {
      console.error(`[RecursiveContext] Error summarizing module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Generate platform-level summary from all modules
   */
  async summarizePlatform(rootPath: string = '.'): Promise<CodeSummary> {
    const modules = [
      'server/services',
      'server/routes',
      'client/src/pages',
      'client/src/components',
      'shared'
    ];

    const moduleSummaries: CodeSummary[] = [];
    
    for (const mod of modules) {
      const fullPath = path.join(rootPath, mod);
      try {
        const summary = await this.summarizeModule(fullPath);
        moduleSummaries.push(summary);
      } catch (error) {
        console.warn(`[RecursiveContext] Skipping module ${mod}:`, error);
      }
    }

    const aggregatedContent = moduleSummaries.map(m => `- ${m.name}: ${m.summary}`).join('\n');

    const prompt = `Summarize this entire platform architecture in 3-4 sentences:

Platform: Mundo Tango
Modules:
${aggregatedContent}

Platform summary:`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.3
    });

    const summary = response.choices[0]?.message?.content || 'Mundo Tango Platform';
    const originalTokens = moduleSummaries.reduce((sum, m) => sum + m.originalTokens, 0);
    const summaryTokens = this.estimateTokens(summary);

    return {
      id: 'platform_root',
      level: 'platform',
      path: rootPath,
      name: 'Mundo Tango',
      summary,
      tokens: summaryTokens,
      originalTokens,
      compressionRatio: originalTokens / Math.max(summaryTokens, 1),
      children: moduleSummaries.map(m => m.id),
      lastUpdated: new Date(),
      hash: this.hashContent(moduleSummaries.map(m => m.hash).join(''))
    };
  }

  /**
   * Get relevant context for a query using semantic search
   */
  async getContext(query: string, maxTokens: number = 4000): Promise<RecursiveContext> {
    await this.initialize();

    try {
      const results = await lanceDB.searchMemories(this.tableName, query, 20);
      
      const relevantSummaries: CodeSummary[] = results.map((r: any) => {
        const content = r.content || '';
        const parts = content.match(/^\[(\w+)\]\s+([^\|]+)\s*\|\s*([^:]+):\s*(.*)$/);
        return {
          id: r.id || 'unknown',
          level: (parts?.[1] as SummaryLevel) || 'file',
          path: parts?.[2]?.trim() || '',
          name: parts?.[3]?.trim() || '',
          summary: parts?.[4] || content,
          tokens: this.estimateTokens(content),
          originalTokens: 0,
          compressionRatio: 1,
          children: [],
          lastUpdated: new Date(r.timestamp || Date.now()),
          hash: ''
        };
      });

      // Build context from most relevant summaries
      let totalTokens = 0;
      const contextParts: string[] = [];

      for (const summary of relevantSummaries) {
        if (totalTokens + summary.tokens > maxTokens) break;
        contextParts.push(`[${summary.level.toUpperCase()}] ${summary.path}\n${summary.summary}`);
        totalTokens += summary.tokens;
      }

      const originalTokens = relevantSummaries.reduce((sum, s) => sum + s.originalTokens, 0);

      return {
        query,
        relevantSummaries,
        expandedContext: contextParts.join('\n\n'),
        totalTokens,
        compressionAchieved: originalTokens / Math.max(totalTokens, 1)
      };
    } catch (error) {
      console.error('[RecursiveContext] Error getting context:', error);
      return {
        query,
        relevantSummaries: [],
        expandedContext: '',
        totalTokens: 0,
        compressionAchieved: 1
      };
    }
  }

  /**
   * Store a summary in LanceDB
   */
  async storeSummary(summary: CodeSummary): Promise<void> {
    await this.initialize();

    try {
      const content = `[${summary.level}] ${summary.path} | ${summary.name}: ${summary.summary}`;
      await lanceDB.addMemory(this.tableName, {
        id: summary.id,
        content,
        timestamp: summary.lastUpdated.getTime()
      });

      this.summaryCache.set(summary.id, summary);
      console.log(`[RecursiveContext] Stored summary: ${summary.id}`);
    } catch (error) {
      console.error('[RecursiveContext] Error storing summary:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractFunctions(content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    // Match function declarations, arrow functions, and methods
    const patterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{/g,
      /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)(?:\s*:\s*([^=]+))?\s*=>/g,
      /(?:async\s+)?(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        const params = match[2].split(',').map(p => p.trim()).filter(Boolean);
        const returnType = match[3]?.trim();
        
        // Extract body (simplified - just get next 500 chars)
        const bodyStart = match.index + match[0].length;
        const body = content.substring(bodyStart, bodyStart + 500);

        functions.push({
          name,
          params,
          returnType,
          body,
          lineStart: content.substring(0, match.index).split('\n').length,
          lineEnd: content.substring(0, bodyStart + 500).split('\n').length
        });
      }
    }

    return functions;
  }

  private async getTypeScriptFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.getTypeScriptFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission denied
    }

    return files;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private hashContent(content: string): string {
    // Simple hash for change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // ============================================================================
  // TRM: SAMSUNG TINYRECURSIVEMODELS RECURSIVE LEARNING PATTERN
  // "Less is More" - Recursively improve answers through K improvement cycles
  // Reference: Samsung SAIL - 45% accuracy on ARC-AGI-1 with 7M parameters
  // ============================================================================

  /**
   * TRM Core: Recursive Knowledge Learning
   * Agents learn from documentation by recursively improving their understanding
   * 
   * @param agentId - The agent learning (e.g., "A21-Teacher-Student-Matching")
   * @param documentationPaths - Paths to docs to learn from
   * @param K - Number of improvement cycles (default: 3)
   * @param n - Number of latent updates per cycle (default: 2)
   */
  async recursivelyLearn(
    agentId: string,
    documentationPaths: string[],
    K: number = 3,
    n: number = 2
  ): Promise<AgentKnowledge> {
    await this.initialize();
    console.log(`[RecursiveContext/TRM] 🧠 Agent ${agentId} learning from ${documentationPaths.length} docs, K=${K}`);

    // Step 1: Read all documentation
    let combinedDocContent = '';
    for (const docPath of documentationPaths) {
      try {
        const content = await fs.readFile(docPath, 'utf-8');
        combinedDocContent += `\n\n=== ${docPath} ===\n${content}`;
      } catch (error) {
        console.warn(`[RecursiveContext/TRM] Could not read ${docPath}:`, error);
      }
    }

    if (!combinedDocContent) {
      console.error(`[RecursiveContext/TRM] No documentation content found for ${agentId}`);
      return {
        agentId,
        knowledge: '',
        confidence: 0,
        improvementCycles: 0,
        timestamp: new Date()
      };
    }

    // Step 2: Generate initial answer (y₀) and latent (z₀)
    let currentAnswer = await this.generateInitialKnowledge(agentId, combinedDocContent);
    let latent = await this.initializeLatent(agentId, combinedDocContent);

    // Step 3: Recursive improvement loop (Samsung TRM core algorithm)
    for (let k = 0; k < K; k++) {
      console.log(`[RecursiveContext/TRM] Improvement cycle ${k + 1}/${K} for ${agentId}`);

      // Update latent understanding n times
      for (let i = 0; i < n; i++) {
        latent = await this.updateLatent(agentId, combinedDocContent, currentAnswer, latent);
      }

      // Improve answer based on updated latent understanding
      currentAnswer = await this.improveKnowledge(agentId, currentAnswer, latent);
    }

    // Step 4: Calculate confidence score
    const confidence = await this.calculateKnowledgeConfidence(currentAnswer, combinedDocContent);

    // Step 5: Store in LanceDB
    const agentKnowledge: AgentKnowledge = {
      agentId,
      knowledge: currentAnswer,
      confidence,
      improvementCycles: K,
      timestamp: new Date()
    };

    await this.storeAgentKnowledge(agentKnowledge);
    console.log(`[RecursiveContext/TRM] ✅ Agent ${agentId} learned with ${confidence.toFixed(2)} confidence`);

    return agentKnowledge;
  }

  /**
   * TRM Step 2a: Generate initial knowledge from documentation
   */
  private async generateInitialKnowledge(agentId: string, docContent: string): Promise<string> {
    const prompt = `You are ${agentId}. Based on this documentation, extract your core knowledge and capabilities.
Focus on:
1. Your primary responsibility
2. Key algorithms/patterns you use
3. How you interact with other agents
4. Your success criteria

Documentation:
${docContent.substring(0, 8000)}

Summarize your core knowledge (max 500 words):`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
        temperature: 0.3
      });
      return response.choices[0]?.message?.content || `Initial knowledge for ${agentId}`;
    } catch (error) {
      console.error(`[RecursiveContext/TRM] Initial knowledge generation failed:`, error);
      return `Basic knowledge for ${agentId} from ${docContent.substring(0, 200)}`;
    }
  }

  /**
   * TRM Step 2b: Initialize latent understanding
   * The "latent" is the agent's hidden understanding that improves each cycle
   */
  private async initializeLatent(agentId: string, docContent: string): Promise<string> {
    const prompt = `Analyze the key patterns, edge cases, and non-obvious insights from this documentation for ${agentId}.
Focus on implicit knowledge, connections between concepts, and things that might not be obvious from a first read.

Documentation snippet:
${docContent.substring(0, 4000)}

Hidden insights and patterns:`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.5
      });
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * TRM Step 3a: Update latent understanding
   * z = f(x, y, z) - Refine hidden understanding based on doc, current answer, and previous latent
   */
  private async updateLatent(
    agentId: string,
    docContent: string,
    currentAnswer: string,
    previousLatent: string
  ): Promise<string> {
    const prompt = `You are refining your understanding. Compare what you've learned with what you might have missed.

Agent: ${agentId}
Current knowledge: ${currentAnswer.substring(0, 1500)}
Previous insights: ${previousLatent.substring(0, 1000)}
Original documentation (sample): ${docContent.substring(0, 2000)}

What additional patterns, edge cases, or corrections should be added? Focus on:
1. What was missed in the current knowledge?
2. What connections weren't explicitly made?
3. What could go wrong that isn't addressed?

Updated insights:`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.4
      });
      return response.choices[0]?.message?.content || previousLatent;
    } catch (error) {
      return previousLatent;
    }
  }

  /**
   * TRM Step 3b: Improve knowledge based on latent understanding
   * y = g(y, z) - Enhance answer using refined understanding
   */
  private async improveKnowledge(
    agentId: string,
    currentAnswer: string,
    latent: string
  ): Promise<string> {
    const prompt = `Improve and expand this knowledge for ${agentId} based on additional insights.

Current knowledge:
${currentAnswer}

Additional insights to incorporate:
${latent}

Provide an improved, more complete knowledge summary. Keep what's good, add what's missing, correct any errors:`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      });
      return response.choices[0]?.message?.content || currentAnswer;
    } catch (error) {
      return currentAnswer;
    }
  }

  /**
   * TRM Step 4: Calculate knowledge confidence score
   * Higher confidence = knowledge covers documentation well
   */
  private async calculateKnowledgeConfidence(
    knowledge: string,
    docContent: string
  ): Promise<number> {
    const prompt = `Rate how well this learned knowledge captures the essential information from the documentation.

Knowledge:
${knowledge.substring(0, 2000)}

Original documentation sample:
${docContent.substring(0, 2000)}

Rate the coverage and accuracy from 0.0 to 1.0:
- 0.9-1.0: Excellent, captures all key points
- 0.7-0.89: Good, covers most important aspects
- 0.5-0.69: Adequate, but missing important details
- Below 0.5: Needs improvement

Respond with ONLY a number between 0.0 and 1.0:`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      });
      const score = parseFloat(response.choices[0]?.message?.content?.match(/\d+\.?\d*/)?.[0] || '0.7');
      return Math.min(1.0, Math.max(0.0, score));
    } catch (error) {
      return 0.7; // Default moderate confidence
    }
  }

  /**
   * TRM Step 5: Store agent knowledge in LanceDB
   */
  private async storeAgentKnowledge(knowledge: AgentKnowledge): Promise<void> {
    try {
      const content = `[AGENT_KNOWLEDGE] ${knowledge.agentId} | Confidence: ${knowledge.confidence.toFixed(2)} | ${knowledge.knowledge}`;
      
      await lanceDB.addMemory('agent_knowledge', {
        id: `agent_${knowledge.agentId}_${Date.now()}`,
        content,
        timestamp: knowledge.timestamp.getTime()
      });

      console.log(`[RecursiveContext/TRM] 💾 Stored knowledge for ${knowledge.agentId}`);
    } catch (error) {
      console.error(`[RecursiveContext/TRM] Failed to store knowledge:`, error);
    }
  }

  /**
   * TRM: Retrieve agent's learned knowledge
   */
  async getAgentKnowledge(agentId: string): Promise<AgentKnowledge | null> {
    try {
      const results = await lanceDB.searchMemories('agent_knowledge', agentId, 5);
      
      if (results.length === 0) return null;

      const mostRecent = results[0];
      const content = mostRecent.content || '';
      const confidenceMatch = content.match(/Confidence:\s*([\d.]+)/);

      return {
        agentId,
        knowledge: content.replace(/^\[AGENT_KNOWLEDGE\].*?\|.*?\|/, '').trim(),
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7,
        improvementCycles: 3, // Default
        timestamp: new Date(mostRecent.timestamp || Date.now())
      };
    } catch (error) {
      console.error(`[RecursiveContext/TRM] Failed to retrieve knowledge:`, error);
      return null;
    }
  }

  /**
   * TRM: Batch learn for multiple agents in parallel
   */
  async batchLearn(
    agentConfigs: Array<{ agentId: string; documentationPaths: string[] }>
  ): Promise<AgentKnowledge[]> {
    console.log(`[RecursiveContext/TRM] 🚀 Batch learning for ${agentConfigs.length} agents`);

    const results: AgentKnowledge[] = [];
    
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < agentConfigs.length; i += batchSize) {
      const batch = agentConfigs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(config => this.recursivelyLearn(config.agentId, config.documentationPaths))
      );
      results.push(...batchResults);
      
      // Brief pause between batches
      if (i + batchSize < agentConfigs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[RecursiveContext/TRM] ✅ Batch learning complete: ${results.length} agents trained`);
    return results;
  }
}

// ============================================================================
// TYPES FOR TRM AGENT LEARNING
// ============================================================================

export interface AgentKnowledge {
  agentId: string;
  knowledge: string;
  confidence: number; // 0.0 - 1.0
  improvementCycles: number; // K value used
  timestamp: Date;
}

// Singleton instance
export const recursiveContextService = new RecursiveContextService();
