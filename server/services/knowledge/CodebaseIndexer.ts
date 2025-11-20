/**
 * CODEBASE INDEXER SERVICE
 * AST-based codebase parsing and semantic search
 * 
 * Features:
 * - Parse TypeScript/JavaScript files using TypeScript Compiler API
 * - Extract functions, classes, imports, exports, types
 * - Generate embeddings and store in LanceDB
 * - Semantic code search with context
 * - Integration with agent_code_knowledge table
 */

import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from '../../db';
import { agentCodeKnowledge } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { lanceDB } from '../../lib/lancedb';
import { glob } from 'glob';

export interface CodeChunk {
  filePath: string;
  fileType: string;
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'component' | 'route';
  signature: string;
  description: string;
  code: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
  lineStart: number;
  lineEnd: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface SearchResult extends CodeChunk {
  similarity: number;
  context: string;
}

export class CodebaseIndexer {
  private vectorTableName = 'codebase_vectors';
  private rootPath = process.cwd();
  private excludePaths = ['node_modules', 'dist', 'build', '.next', 'coverage', 'lancedb_data'];

  /**
   * Index entire codebase
   */
  async indexCodebase(rootPath?: string): Promise<{
    filesIndexed: number;
    chunksCreated: number;
    errors: string[];
  }> {
    const targetPath = rootPath || this.rootPath;
    console.log(`[CodebaseIndexer] 🔍 Indexing codebase at: ${targetPath}`);

    const results = {
      filesIndexed: 0,
      chunksCreated: 0,
      errors: [] as string[],
    };

    try {
      // Get all TypeScript/JavaScript files
      const files = await this.getAllTsJsFiles(targetPath);
      console.log(`[CodebaseIndexer] Found ${files.length} files to index`);

      // Process files in batches
      const batchSize = 10;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (file) => {
            try {
              const chunks = await this.parseAndIndexFile(file);
              results.filesIndexed++;
              results.chunksCreated += chunks;
            } catch (error: any) {
              results.errors.push(`${file}: ${error.message}`);
            }
          })
        );

        console.log(`[CodebaseIndexer] Progress: ${Math.min(i + batchSize, files.length)}/${files.length} files`);
      }

      console.log(`[CodebaseIndexer] ✅ Indexing complete!`);
      console.log(`  Files indexed: ${results.filesIndexed}`);
      console.log(`  Code chunks: ${results.chunksCreated}`);
      console.log(`  Errors: ${results.errors.length}`);

      return results;
    } catch (error: any) {
      console.error('[CodebaseIndexer] ❌ Indexing failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse and index a single file
   */
  private async parseAndIndexFile(filePath: string): Promise<number> {
    try {
      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse AST
      const sourceFile = this.parseFile(filePath, content);
      
      // Extract code chunks
      const chunks = this.extractChunks(sourceFile, filePath, content);

      if (chunks.length === 0) {
        return 0;
      }

      // Store in database and vector DB
      await this.storeChunks(chunks);

      return chunks.length;
    } catch (error: any) {
      console.error(`[CodebaseIndexer] Error parsing ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse TypeScript/JavaScript file into AST
   */
  private parseFile(filePath: string, content: string): ts.SourceFile {
    return ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') || filePath.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
  }

  /**
   * Extract code chunks from AST
   */
  private extractChunks(sourceFile: ts.SourceFile, filePath: string, content: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const lines = content.split('\n');

    const visit = (node: ts.Node) => {
      // Extract functions
      if (ts.isFunctionDeclaration(node) && node.name) {
        chunks.push(this.extractFunction(node, filePath, lines));
      }

      // Extract arrow functions and const functions
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((decl) => {
          if (decl.initializer && (
            ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer)
          )) {
            chunks.push(this.extractVariableFunction(decl, filePath, lines));
          }
        });
      }

      // Extract classes
      if (ts.isClassDeclaration(node) && node.name) {
        chunks.push(this.extractClass(node, filePath, lines));
      }

      // Extract interfaces
      if (ts.isInterfaceDeclaration(node)) {
        chunks.push(this.extractInterface(node, filePath, lines));
      }

      // Extract type aliases
      if (ts.isTypeAliasDeclaration(node)) {
        chunks.push(this.extractType(node, filePath, lines));
      }

      // Recursively visit children
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return chunks;
  }

  /**
   * Extract function declaration
   */
  private extractFunction(node: ts.FunctionDeclaration, filePath: string, lines: string[]): CodeChunk {
    const name = node.name?.getText() || 'anonymous';
    const { line: lineStart } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    const { line: lineEnd } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    
    const code = lines.slice(lineStart, lineEnd + 1).join('\n');
    const signature = this.extractSignature(node, lines);

    return {
      filePath,
      fileType: this.getFileType(filePath),
      name,
      type: 'function',
      signature,
      description: this.extractJsDoc(node) || `Function: ${name}`,
      code,
      imports: [],
      exports: this.isExported(node) ? [name] : [],
      dependencies: this.extractDependencies(code),
      lineStart: lineStart + 1,
      lineEnd: lineEnd + 1,
      complexity: this.calculateComplexity(code),
    };
  }

  /**
   * Extract variable function (const/let with arrow function)
   */
  private extractVariableFunction(node: ts.VariableDeclaration, filePath: string, lines: string[]): CodeChunk {
    const name = node.name.getText();
    const { line: lineStart } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    const { line: lineEnd } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    
    const code = lines.slice(lineStart, lineEnd + 1).join('\n');
    const signature = code.split('\n')[0];

    return {
      filePath,
      fileType: this.getFileType(filePath),
      name,
      type: 'function',
      signature,
      description: `Function: ${name}`,
      code,
      imports: [],
      exports: [],
      dependencies: this.extractDependencies(code),
      lineStart: lineStart + 1,
      lineEnd: lineEnd + 1,
      complexity: this.calculateComplexity(code),
    };
  }

  /**
   * Extract class declaration
   */
  private extractClass(node: ts.ClassDeclaration, filePath: string, lines: string[]): CodeChunk {
    const name = node.name?.getText() || 'AnonymousClass';
    const { line: lineStart } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    const { line: lineEnd } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    
    const code = lines.slice(lineStart, lineEnd + 1).join('\n');
    const signature = `class ${name}`;

    return {
      filePath,
      fileType: this.getFileType(filePath),
      name,
      type: 'class',
      signature,
      description: this.extractJsDoc(node) || `Class: ${name}`,
      code,
      imports: [],
      exports: this.isExported(node) ? [name] : [],
      dependencies: this.extractDependencies(code),
      lineStart: lineStart + 1,
      lineEnd: lineEnd + 1,
      complexity: this.calculateComplexity(code),
    };
  }

  /**
   * Extract interface declaration
   */
  private extractInterface(node: ts.InterfaceDeclaration, filePath: string, lines: string[]): CodeChunk {
    const name = node.name.getText();
    const { line: lineStart } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    const { line: lineEnd } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    
    const code = lines.slice(lineStart, lineEnd + 1).join('\n');

    return {
      filePath,
      fileType: this.getFileType(filePath),
      name,
      type: 'interface',
      signature: `interface ${name}`,
      description: this.extractJsDoc(node) || `Interface: ${name}`,
      code,
      imports: [],
      exports: this.isExported(node) ? [name] : [],
      dependencies: [],
      lineStart: lineStart + 1,
      lineEnd: lineEnd + 1,
      complexity: 'low',
    };
  }

  /**
   * Extract type alias
   */
  private extractType(node: ts.TypeAliasDeclaration, filePath: string, lines: string[]): CodeChunk {
    const name = node.name.getText();
    const { line: lineStart } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    const { line: lineEnd } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    
    const code = lines.slice(lineStart, lineEnd + 1).join('\n');

    return {
      filePath,
      fileType: this.getFileType(filePath),
      name,
      type: 'type',
      signature: `type ${name}`,
      description: this.extractJsDoc(node) || `Type: ${name}`,
      code,
      imports: [],
      exports: this.isExported(node) ? [name] : [],
      dependencies: [],
      lineStart: lineStart + 1,
      lineEnd: lineEnd + 1,
      complexity: 'low',
    };
  }

  /**
   * Store chunks in database and vector DB
   */
  private async storeChunks(chunks: CodeChunk[]): Promise<void> {
    // Store in vector DB for semantic search
    const vectorChunks = chunks.map((chunk, index) => ({
      id: `${chunk.filePath}_${chunk.name}_${index}`,
      content: `${chunk.name}\n${chunk.description}\n${chunk.signature}\n${chunk.code}`,
      metadata: {
        filePath: chunk.filePath,
        fileType: chunk.fileType,
        name: chunk.name,
        type: chunk.type,
        lineStart: chunk.lineStart,
        lineEnd: chunk.lineEnd,
        complexity: chunk.complexity,
      },
      timestamp: Date.now(),
    }));

    await lanceDB.addMemories(this.vectorTableName, vectorChunks);

    // Also store in agent_code_knowledge table for persistence
    for (const chunk of chunks) {
      try {
        await db.insert(agentCodeKnowledge).values({
          agentId: 'codebase-indexer',
          filePath: chunk.filePath,
          fileType: chunk.fileType,
          domain: this.extractDomain(chunk.filePath),
          codePattern: this.detectCodePattern(chunk),
          functionSignatures: [chunk.signature],
          dependencies: chunk.dependencies,
          exports: chunk.exports,
          componentsUsed: [],
          understandingLevel: 'basic',
          canModify: false,
          lastAnalyzed: new Date(),
          lineCount: chunk.lineEnd - chunk.lineStart,
          complexity: chunk.complexity,
          notes: chunk.description,
          metadata: {
            name: chunk.name,
            type: chunk.type,
            code: chunk.code.substring(0, 1000), // Store first 1000 chars
          },
        });
      } catch (error: any) {
        // Ignore duplicates
        if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
          console.error(`[CodebaseIndexer] Error storing chunk:`, error.message);
        }
      }
    }
  }

  /**
   * Semantic search for code
   */
  async searchCode(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      console.log(`[CodebaseIndexer] 🔍 Searching code for: "${query}"`);

      const results = await lanceDB.searchMemories(this.vectorTableName, query, limit);

      return results.map(r => ({
        filePath: r.metadata?.filePath || '',
        fileType: r.metadata?.fileType || '',
        name: r.metadata?.name || '',
        type: r.metadata?.type || 'function',
        signature: '',
        description: '',
        code: r.content || '',
        imports: [],
        exports: [],
        dependencies: [],
        lineStart: r.metadata?.lineStart || 0,
        lineEnd: r.metadata?.lineEnd || 0,
        complexity: r.metadata?.complexity || 'medium',
        similarity: r.similarity || 0,
        context: r.content || '',
      }));
    } catch (error: any) {
      console.error('[CodebaseIndexer] Search failed:', error.message);
      return [];
    }
  }

  /**
   * Get all TypeScript/JavaScript files
   */
  private async getAllTsJsFiles(rootPath: string): Promise<string[]> {
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
    ];

    const ignorePatterns = this.excludePaths.map(p => `**/${p}/**`);

    try {
      const files: string[] = [];
      
      for (const pattern of patterns) {
        const matches = await glob(pattern, {
          cwd: rootPath,
          ignore: ignorePatterns,
          absolute: true,
        });
        files.push(...matches);
      }

      return [...new Set(files)]; // Remove duplicates
    } catch (error: any) {
      console.error('[CodebaseIndexer] Error finding files:', error.message);
      return [];
    }
  }

  /**
   * Extract function signature
   */
  private extractSignature(node: ts.Node, lines: string[]): string {
    const { line } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    return lines[line]?.trim() || '';
  }

  /**
   * Extract JSDoc comment
   */
  private extractJsDoc(node: ts.Node): string | undefined {
    const jsDoc = (node as any).jsDoc;
    if (jsDoc && jsDoc.length > 0) {
      return jsDoc[0].comment || undefined;
    }
    return undefined;
  }

  /**
   * Check if node is exported
   */
  private isExported(node: ts.Node): boolean {
    return (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) || false;
  }

  /**
   * Extract dependencies from code
   */
  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(code: string): 'low' | 'medium' | 'high' {
    const lines = code.split('\n').length;
    const cyclomaticComplexity = (code.match(/if|else|for|while|switch|case|\?\?|\?\./g) || []).length;

    if (lines < 20 && cyclomaticComplexity < 5) return 'low';
    if (lines < 50 && cyclomaticComplexity < 10) return 'medium';
    return 'high';
  }

  /**
   * Get file type from path
   */
  private getFileType(filePath: string): string {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/routes/')) return 'route';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/utils/')) return 'util';
    if (filePath.includes('/lib/')) return 'library';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) return 'component';
    return 'module';
  }

  /**
   * Extract domain from file path
   */
  private extractDomain(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.includes('client')) return 'frontend';
    if (parts.includes('server')) return 'backend';
    if (parts.includes('shared')) return 'shared';
    return 'general';
  }

  /**
   * Detect code pattern
   */
  private detectCodePattern(chunk: CodeChunk): string {
    if (chunk.type === 'class') {
      if (chunk.code.includes('extends Component') || chunk.code.includes('extends React.Component')) {
        return 'react_class_component';
      }
      if (chunk.code.includes('Service')) return 'service_class';
      return 'class';
    }

    if (chunk.type === 'function') {
      if (chunk.code.includes('return (') && chunk.code.includes('</')) {
        return 'react_component';
      }
      if (chunk.code.includes('router.') || chunk.code.includes('app.')) {
        return 'express_route';
      }
      if (chunk.code.includes('useState') || chunk.code.includes('useEffect')) {
        return 'react_hook';
      }
    }

    return 'general';
  }

  /**
   * Get indexing stats
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalChunks: number;
    byFileType: Record<string, number>;
    byComplexity: Record<string, number>;
  }> {
    try {
      const stats = await lanceDB.getTableStats(this.vectorTableName);
      
      return {
        totalFiles: 0, // Would need to track separately
        totalChunks: stats.recordCount,
        byFileType: {},
        byComplexity: {},
      };
    } catch (error: any) {
      console.error('[CodebaseIndexer] Failed to get stats:', error.message);
      return {
        totalFiles: 0,
        totalChunks: 0,
        byFileType: {},
        byComplexity: {},
      };
    }
  }
}

export const codebaseIndexer = new CodebaseIndexer();
