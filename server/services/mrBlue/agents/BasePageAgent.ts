/**
 * BasePageAgent - Base class for all page agents
 * 
 * MB.MD Level 3 Architecture:
 * Each page agent knows its domain (files, components, elements)
 * and can respond to queries about what it owns.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ElementLocation {
  filePath: string;
  lineNumber: number;
  componentName: string;
  elementType: string;
  currentClassName: string;
  textContent: string;
  agentId: string;
}

export interface StyleChange {
  property: 'className' | 'style' | 'text';
  oldValue: string;
  newValue: string;
  description: string;
}

export interface FileUpdate {
  success: boolean;
  filePath: string;
  before: string;
  after: string;
  diff: string;
  linesChanged: number;
  element: ElementLocation;
}

export abstract class BasePageAgent {
  protected id: string;
  protected name: string;
  protected domain: string[]; // Files this agent owns
  protected projectRoot: string;
  protected elementKnowledge: Map<string, ElementLocation>; // Cached knowledge of elements

  constructor(id: string, name: string, domain: string[]) {
    this.id = id;
    this.name = name;
    this.domain = domain;
    this.projectRoot = process.cwd();
    this.elementKnowledge = new Map();
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get files this agent owns
   */
  getDomain(): string[] {
    return this.domain;
  }

  /**
   * Check if this agent owns a specific file
   */
  ownsFile(filePath: string): boolean {
    return this.domain.some(domainPath => {
      const normalizedDomain = path.normalize(domainPath);
      const normalizedFile = path.normalize(filePath);
      return normalizedFile.includes(normalizedDomain) || normalizedFile === normalizedDomain;
    });
  }

  /**
   * Query if this agent can handle a specific element request
   * Returns confidence score (0-1) and element location if found
   */
  abstract canHandle(query: string): Promise<{
    canHandle: boolean;
    confidence: number;
    element: ElementLocation | null;
    reason: string;
  }>;

  /**
   * Find element in agent's domain
   */
  abstract findElement(query: string): Promise<ElementLocation | null>;

  /**
   * Apply change to element
   */
  async applyChange(element: ElementLocation, change: StyleChange): Promise<FileUpdate> {
    try {
      console.log(`[${this.name}] Applying change to ${element.filePath}:${element.lineNumber}`);

      // Read current file
      const fullPath = path.isAbsolute(element.filePath) 
        ? element.filePath 
        : path.join(this.projectRoot, element.filePath);
      
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const lines = fileContent.split('\n');

      // Find the line with the className
      let targetLineIndex = element.lineNumber - 1;
      let updatedLines = [...lines];

      // Find className line (might be on a different line than element.lineNumber)
      for (let i = Math.max(0, targetLineIndex - 3); i < Math.min(lines.length, targetLineIndex + 10); i++) {
        if (lines[i].includes('className=')) {
          targetLineIndex = i;
          break;
        }
      }

      // Replace className
      const oldLine = updatedLines[targetLineIndex];
      const newLine = oldLine.replace(
        /className=["']([^"']+)["']/,
        `className="${change.newValue}"`
      );

      updatedLines[targetLineIndex] = newLine;

      // Write back to file
      const newContent = updatedLines.join('\n');
      await fs.writeFile(fullPath, newContent, 'utf-8');

      // Generate diff
      const diff = this.generateDiff(oldLine, newLine, targetLineIndex + 1);

      console.log(`[${this.name}] ✅ Successfully updated ${element.filePath}`);

      return {
        success: true,
        filePath: element.filePath,
        before: oldLine,
        after: newLine,
        diff,
        linesChanged: 1,
        element,
      };
    } catch (error: any) {
      console.error(`[${this.name}] Error applying change:`, error);
      throw new Error(`Failed to apply change: ${error.message}`);
    }
  }

  /**
   * Generate unified diff format
   */
  protected generateDiff(before: string, after: string, lineNumber: number): string {
    return `@@ -${lineNumber},1 +${lineNumber},1 @@\n-${before.trim()}\n+${after.trim()}`;
  }

  /**
   * Extract element info from file lines
   */
  protected extractElementInfo(
    lines: string[],
    lineIndex: number,
    filePath: string
  ): ElementLocation | null {
    try {
      // Find the opening tag (scan backwards if needed)
      let openTagLine = lineIndex;
      let openTag = lines[lineIndex];

      // If current line doesn't have opening tag, scan backwards
      if (!openTag.includes('<')) {
        for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 5); i--) {
          if (lines[i].includes('<')) {
            openTagLine = i;
            openTag = lines[i];
            break;
          }
        }
      }

      // Extract element type (Button, div, etc.)
      const elementTypeMatch = openTag.match(/<(\w+)/);
      if (!elementTypeMatch) return null;
      const elementType = elementTypeMatch[1];

      // Extract className if present (scan up to 10 lines down)
      let className = '';
      for (let i = openTagLine; i < Math.min(lines.length, openTagLine + 10); i++) {
        const classMatch = lines[i].match(/className=["']([^"']+)["']/);
        if (classMatch) {
          className = classMatch[1];
          break;
        }
      }

      // Extract text content
      let textContent = '';
      for (let i = openTagLine; i < Math.min(lines.length, openTagLine + 10); i++) {
        const line = lines[i].trim();
        // Skip lines that are JSX tags or have "className"
        if (line.startsWith('<') || line.includes('className') || line.includes('data-testid')) {
          continue;
        }
        // Extract text between > and <
        const textMatch = line.match(/>([^<]+)</);
        if (textMatch) {
          textContent = textMatch[1].trim();
          break;
        }
        // Or just plain text line
        if (line && !line.includes('{') && !line.includes('<')) {
          textContent = line;
          break;
        }
      }

      // Get component name from file path
      const fileName = path.basename(filePath, path.extname(filePath));

      return {
        filePath,
        lineNumber: openTagLine + 1,
        componentName: fileName,
        elementType,
        currentClassName: className,
        textContent: textContent,
        agentId: this.id,
      };
    } catch (error) {
      console.error(`[${this.name}] Error extracting element info:`, error);
      return null;
    }
  }

  /**
   * Parse natural language query to extract key terms
   */
  protected parseQuery(query: string): {
    action: string;
    elementType: string;
    textPattern: string;
    style: string;
  } {
    const lower = query.toLowerCase();

    // Extract action
    let action = 'modify';
    if (lower.includes('make') || lower.includes('change')) action = 'modify';
    if (lower.includes('create') || lower.includes('add')) action = 'create';
    if (lower.includes('delete') || lower.includes('remove')) action = 'delete';

    // Extract element type
    let elementType = 'unknown';
    if (lower.includes('button')) elementType = 'button';
    if (lower.includes('header')) elementType = 'header';
    if (lower.includes('nav')) elementType = 'nav';
    if (lower.includes('footer')) elementType = 'footer';
    if (lower.includes('card')) elementType = 'card';

    // Extract text pattern (remove action/style words)
    const wordsToRemove = ['make', 'change', 'the', 'a', 'an', 'dark', 'blue', 'red', 'green', 'bigger', 'smaller', 'button', 'header', 'nav'];
    let words = query.split(/\s+/);
    words = words.filter(w => !wordsToRemove.includes(w.toLowerCase()));
    const textPattern = words.join(' ').trim();

    // Extract style
    let style = '';
    if (lower.includes('dark blue')) style = 'dark-blue';
    if (lower.includes('blue')) style = 'blue';
    if (lower.includes('red')) style = 'red';
    if (lower.includes('green')) style = 'green';
    if (lower.includes('bigger')) style = 'bigger';
    if (lower.includes('smaller')) style = 'smaller';

    return { action, elementType, textPattern, style };
  }
}
