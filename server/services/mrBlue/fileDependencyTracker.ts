/**
 * File Dependency Tracker for Mr. Blue Visual Editor
 * Tracks which files affect which visual elements and routes
 * 
 * Features:
 * - Build dependency graph for files
 * - Track file → visual element relationships
 * - Determine what needs reload when files change
 * - Support CSS, JS, and HTML dependencies
 * 
 * Examples:
 * - app.css affects all elements
 * - Button.tsx affects all <Button> components
 * - HomePage.tsx affects / route only
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// ==================== TYPE DEFINITIONS ====================

/**
 * File dependency node
 */
export interface FileDependency {
  file: string;
  dependsOn: string[]; // Files this file depends on
  affects: string[];   // Visual elements/routes this file affects
  type: 'css' | 'tsx' | 'ts' | 'jsx' | 'js' | 'html';
  lastModified: Date;
}

/**
 * Dependency graph
 */
export interface DependencyGraph {
  nodes: Map<string, FileDependency>;
  edges: Array<{ from: string; to: string }>;
}

/**
 * Impact analysis result
 */
export interface ImpactAnalysis {
  affectedFiles: string[];
  affectedElements: string[];
  affectedRoutes: string[];
  reloadStrategy: 'full' | 'module' | 'style' | 'none';
}

// ==================== FILE DEPENDENCY TRACKER ====================

export class FileDependencyTracker {
  private graph: DependencyGraph = {
    nodes: new Map(),
    edges: []
  };
  
  private elementToFileMap: Map<string, string[]> = new Map();
  private routeToFileMap: Map<string, string[]> = new Map();
  
  constructor() {
    console.log('[FileDependencyTracker] Initialized');
  }

  // ==================== BUILD DEPENDENCY GRAPH ====================

  /**
   * Build complete dependency graph for the project
   */
  async buildDependencyGraph(): Promise<DependencyGraph> {
    console.log('[FileDependencyTracker] Building dependency graph...');
    
    // Clear existing graph
    this.graph.nodes.clear();
    this.graph.edges = [];
    this.elementToFileMap.clear();
    this.routeToFileMap.clear();

    try {
      // Find all source files
      const clientFiles = await glob('client/src/**/*.{tsx,ts,jsx,js,css}', { 
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*'],
        absolute: true 
      });

      // Process each file
      for (const file of clientFiles) {
        await this.processFile(file);
      }

      console.log(`[FileDependencyTracker] Built graph with ${this.graph.nodes.size} nodes`);
      return this.graph;
    } catch (error) {
      console.error('[FileDependencyTracker] Error building graph:', error);
      throw error;
    }
  }

  /**
   * Process a single file and extract dependencies
   */
  private async processFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      const fileType = this.getFileType(filePath);
      const stats = await fs.stat(filePath);

      // Extract dependencies (imports)
      const dependsOn = await this.extractImports(content, filePath);
      
      // Extract affected elements and routes
      const affects = this.extractAffects(content, filePath, fileType);

      // Create dependency node
      const node: FileDependency = {
        file: relativePath,
        dependsOn,
        affects,
        type: fileType,
        lastModified: stats.mtime
      };

      this.graph.nodes.set(relativePath, node);

      // Build edges
      for (const dep of dependsOn) {
        this.graph.edges.push({ from: relativePath, to: dep });
      }

      // Update element/route maps
      for (const affect of affects) {
        if (affect.startsWith('/')) {
          // Route
          if (!this.routeToFileMap.has(affect)) {
            this.routeToFileMap.set(affect, []);
          }
          this.routeToFileMap.get(affect)!.push(relativePath);
        } else {
          // Element
          if (!this.elementToFileMap.has(affect)) {
            this.elementToFileMap.set(affect, []);
          }
          this.elementToFileMap.get(affect)!.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`[FileDependencyTracker] Error processing ${filePath}:`, error);
    }
  }

  /**
   * Extract import statements from file
   */
  private async extractImports(content: string, filePath: string): Promise<string[]> {
    const imports: string[] = [];
    const dir = path.dirname(filePath);

    // Match import statements
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }

      // Resolve relative path
      let resolvedPath = importPath;
      if (importPath.startsWith('.')) {
        resolvedPath = path.relative(
          process.cwd(),
          path.resolve(dir, importPath)
        );
      } else if (importPath.startsWith('@/')) {
        resolvedPath = importPath.replace('@/', 'client/src/');
      }

      // Add common extensions if missing
      if (!path.extname(resolvedPath)) {
        const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css'];
        for (const ext of possibleExtensions) {
          try {
            const testPath = resolvedPath + ext;
            const fullPath = path.resolve(process.cwd(), testPath);
            await fs.access(fullPath);
            resolvedPath = testPath;
            break;
          } catch {
            // Try next extension
          }
        }
      }

      imports.push(resolvedPath);
    }

    return imports;
  }

  /**
   * Extract what this file affects (components, routes)
   */
  private extractAffects(content: string, filePath: string, fileType: string): string[] {
    const affects: string[] = [];

    // Global CSS affects all elements
    if (filePath.includes('index.css') || filePath.includes('global.css')) {
      affects.push('*'); // All elements
      return affects;
    }

    // Component files
    if (fileType === 'tsx' || fileType === 'jsx') {
      // Extract component exports
      const componentRegex = /export\s+(?:default\s+)?(?:function|const)\s+(\w+)/g;
      let match;
      while ((match = componentRegex.exec(content)) !== null) {
        affects.push(match[1]);
      }

      // Extract routes
      const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
      while ((match = routeRegex.exec(content)) !== null) {
        affects.push(match[1]);
      }
    }

    // CSS modules affect specific components
    if (fileType === 'css') {
      const fileName = path.basename(filePath, '.css');
      affects.push(fileName);
    }

    return affects;
  }

  /**
   * Get file type from extension
   */
  private getFileType(filePath: string): FileDependency['type'] {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.tsx': return 'tsx';
      case '.ts': return 'ts';
      case '.jsx': return 'jsx';
      case '.js': return 'js';
      case '.css': return 'css';
      case '.html': return 'html';
      default: return 'ts';
    }
  }

  // ==================== IMPACT ANALYSIS ====================

  /**
   * Analyze impact of file changes
   */
  async analyzeImpact(changedFiles: string[]): Promise<ImpactAnalysis> {
    console.log('[FileDependencyTracker] Analyzing impact for:', changedFiles);

    const affectedFiles = new Set<string>(changedFiles);
    const affectedElements = new Set<string>();
    const affectedRoutes = new Set<string>();
    let reloadStrategy: ImpactAnalysis['reloadStrategy'] = 'none';

    // Build graph if not already built
    if (this.graph.nodes.size === 0) {
      await this.buildDependencyGraph();
    }

    // For each changed file, find what it affects
    for (const file of changedFiles) {
      const node = this.graph.nodes.get(file);
      if (!node) continue;

      // Determine reload strategy based on file type
      if (node.type === 'css') {
        reloadStrategy = reloadStrategy === 'full' ? 'full' : 'style';
      } else if (node.type === 'tsx' || node.type === 'jsx') {
        reloadStrategy = reloadStrategy === 'full' ? 'full' : 'module';
      } else {
        reloadStrategy = 'full'; // Default to full reload for TS/JS changes
      }

      // Add directly affected elements/routes
      for (const affect of node.affects) {
        if (affect === '*') {
          reloadStrategy = 'full';
        } else if (affect.startsWith('/')) {
          affectedRoutes.add(affect);
        } else {
          affectedElements.add(affect);
        }
      }

      // Find files that depend on this file (reverse dependencies)
      for (const [depFile, depNode] of this.graph.nodes) {
        if (depNode.dependsOn.includes(file)) {
          affectedFiles.add(depFile);
          // Add affected elements from dependent files
          for (const affect of depNode.affects) {
            if (affect.startsWith('/')) {
              affectedRoutes.add(affect);
            } else {
              affectedElements.add(affect);
            }
          }
        }
      }
    }

    return {
      affectedFiles: Array.from(affectedFiles),
      affectedElements: Array.from(affectedElements),
      affectedRoutes: Array.from(affectedRoutes),
      reloadStrategy
    };
  }

  /**
   * Get all files that affect a specific element
   */
  getFilesForElement(elementName: string): string[] {
    return this.elementToFileMap.get(elementName) || [];
  }

  /**
   * Get all files that affect a specific route
   */
  getFilesForRoute(route: string): string[] {
    return this.routeToFileMap.get(route) || [];
  }

  /**
   * Get dependency graph
   */
  getGraph(): DependencyGraph {
    return this.graph;
  }
}

// Singleton instance
export const fileDependencyTracker = new FileDependencyTracker();
