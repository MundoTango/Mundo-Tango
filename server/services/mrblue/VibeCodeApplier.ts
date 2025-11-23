/**
 * VibeCoding Auto-Apply Service
 * Automatically applies visual changes to source files and DOM
 * 
 * Flow:
 * 1. User: "make join Free button dark blue"
 * 2. Find element in codebase by text search
 * 3. Update className in source file
 * 4. Generate diff for chat display
 * 5. Trigger hot reload
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ElementLocation {
  filePath: string;
  lineNumber: number;
  componentName: string;
  elementType: string;
  currentClassName: string;
  textContent: string;
}

export interface CodeChange {
  property: 'className' | 'style' | 'text';
  oldValue: string;
  newValue: string;
  description: string;
}

export interface DiffResult {
  filePath: string;
  before: string;
  after: string;
  diff: string;
  linesChanged: number;
}

export interface ApplyResult {
  success: boolean;
  filesModified: string[];
  elementsChanged: ElementLocation[];
  diffs: DiffResult[];
  error?: string;
}

export class VibeCodeApplier {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Find target element in codebase by text/description
   * Searches all TSX/JSX files for matching button/element text
   */
  async findTargetElement(description: string): Promise<ElementLocation[]> {
    console.log(`[VibeCodeApplier] 🔍 Searching for element: "${description}"`);

    // Extract key text patterns from description
    // "make join Free button dark blue" → search for "join Free" or "Join Free"
    const textPattern = this.extractTextPattern(description);
    console.log(`[VibeCodeApplier] Extracted text pattern: "${textPattern}"`);

    // Search client/src for TSX/JSX files containing the text
    const clientSrcPath = path.join(this.projectRoot, 'client/src');
    const matches: ElementLocation[] = [];

    try {
      // Use ripgrep for fast search across all TSX/JSX files
      const { stdout } = await execAsync(
        `rg --type-add 'tsx:*.tsx' --type tsx -n -i "${textPattern}" ${clientSrcPath}`,
        { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
      );

      // Parse ripgrep output (format: file:line:content)
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        const match = line.match(/^([^:]+):(\d+):(.+)$/);
        if (!match) continue;

        const [, filePath, lineNum, content] = match;
        
        // Read file to get more context
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        const lineIndex = parseInt(lineNum) - 1;

        // Extract element info from surrounding lines
        // extractElementInfo will scan backwards to find the opening tag
        const elementInfo = this.extractElementInfo(lines, lineIndex, filePath);
        if (elementInfo) {
          matches.push(elementInfo);
        }
      }

      console.log(`[VibeCodeApplier] ✅ Found ${matches.length} matching element(s)`);
      return matches;

    } catch (error: any) {
      // If ripgrep returns no matches, it exits with code 1
      if (error.code === 1) {
        console.log(`[VibeCodeApplier] ℹ️ No matches found for "${textPattern}"`);
        return [];
      }

      console.error('[VibeCodeApplier] Error searching for element:', error);
      throw new Error(`Failed to search for element: ${error.message}`);
    }
  }

  /**
   * Extract text pattern from natural language description
   * "make join Free button dark blue" → "join Free"
   */
  private extractTextPattern(description: string): string {
    const lower = description.toLowerCase();

    // Common patterns to remove
    const prefixes = ['make', 'change', 'update', 'modify', 'turn', 'the'];
    const suffixes = ['button', 'dark', 'blue', 'red', 'green', 'bigger', 'smaller', 'hidden', 'visible'];

    // Split into words
    let words = description.split(/\s+/);

    // Remove common prefix words
    while (words.length > 0 && prefixes.includes(words[0].toLowerCase())) {
      words.shift();
    }

    // Remove common suffix words (but keep the element type word like "button")
    const elementType = words.find(w => ['button', 'header', 'footer', 'nav', 'menu', 'title'].includes(w.toLowerCase()));
    words = words.filter(w => !suffixes.includes(w.toLowerCase()) || w.toLowerCase() === elementType?.toLowerCase());

    // If we found "button" or similar, remove it too
    if (elementType) {
      words = words.filter(w => w.toLowerCase() !== elementType.toLowerCase());
    }

    return words.join(' ').trim();
  }

  /**
   * Check if a code line contains a React element/component
   */
  private isElementLine(content: string): boolean {
    const elementPatterns = [
      /<Button/i,
      /<div/i,
      /<span/i,
      /<a\s/i,
      /<h[1-6]/i,
      /<p\s/i,
      /<Card/i,
      /<Link/i,
    ];

    return elementPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract element information from surrounding code lines
   */
  private extractElementInfo(
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

      // Extract className if present (scan up to 5 lines down)
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
      const componentName = fileName;

      return {
        filePath,
        lineNumber: openTagLine + 1, // Convert to 1-indexed
        componentName,
        elementType,
        currentClassName: className,
        textContent: textContent,
      };
    } catch (error) {
      console.error('[VibeCodeApplier] Error extracting element info:', error);
      return null;
    }
  }

  /**
   * Parse style description and generate appropriate Tailwind classes
   * "dark blue" → "bg-blue-800 hover:bg-blue-900 text-white"
   */
  parseStyleChange(description: string, elementLocation: ElementLocation): CodeChange {
    const lower = description.toLowerCase();

    // Color changes
    if (lower.includes('dark blue')) {
      return {
        property: 'className',
        oldValue: elementLocation.currentClassName,
        newValue: 'bg-blue-800 hover:bg-blue-900 text-white text-lg px-8 py-6 h-auto font-semibold',
        description: 'Changed button color to dark blue with white text',
      };
    } else if (lower.includes('blue')) {
      return {
        property: 'className',
        oldValue: elementLocation.currentClassName,
        newValue: 'bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 h-auto font-semibold',
        description: 'Changed button color to blue with white text',
      };
    } else if (lower.includes('red')) {
      return {
        property: 'className',
        oldValue: elementLocation.currentClassName,
        newValue: 'bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 h-auto font-semibold',
        description: 'Changed button color to red with white text',
      };
    } else if (lower.includes('green')) {
      return {
        property: 'className',
        oldValue: elementLocation.currentClassName,
        newValue: 'bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 h-auto font-semibold',
        description: 'Changed button color to green with white text',
      };
    }

    // Size changes
    if (lower.includes('bigger') || lower.includes('larger')) {
      const newClasses = elementLocation.currentClassName.replace(/text-\w+/, 'text-2xl').replace(/px-\d+/, 'px-12').replace(/py-\d+/, 'py-8');
      return {
        property: 'className',
        oldValue: elementLocation.currentClassName,
        newValue: newClasses,
        description: 'Made button larger',
      };
    }

    // Default: return current (no change)
    return {
      property: 'className',
      oldValue: elementLocation.currentClassName,
      newValue: elementLocation.currentClassName,
      description: 'No style change detected',
    };
  }

  /**
   * Update source file with new className
   */
  async updateSourceFile(
    elementLocation: ElementLocation,
    change: CodeChange
  ): Promise<DiffResult> {
    console.log(`[VibeCodeApplier] 📝 Updating ${elementLocation.filePath} at line ${elementLocation.lineNumber}`);

    // Read original file
    const filePath = elementLocation.filePath;
    const originalContent = await fs.readFile(filePath, 'utf-8');
    const lines = originalContent.split('\n');

    // Find className line (start from element line, scan up to 10 lines down)
    let classNameLineIndex = -1;
    const startLine = elementLocation.lineNumber - 1; // Convert to 0-indexed

    for (let i = startLine; i < Math.min(lines.length, startLine + 10); i++) {
      if (lines[i].includes('className=')) {
        classNameLineIndex = i;
        break;
      }
    }

    if (classNameLineIndex === -1) {
      throw new Error(`Could not find className in ${filePath} near line ${elementLocation.lineNumber}`);
    }

    // Replace className value
    const oldLine = lines[classNameLineIndex];
    const newLine = oldLine.replace(
      /className=["']([^"']+)["']/,
      `className="${change.newValue}"`
    );

    if (oldLine === newLine) {
      console.warn('[VibeCodeApplier] ⚠️ No change detected - className value is the same');
    }

    lines[classNameLineIndex] = newLine;

    // Write updated content
    const newContent = lines.join('\n');
    await fs.writeFile(filePath, newContent, 'utf-8');

    console.log(`[VibeCodeApplier] ✅ File updated successfully`);

    // Generate diff
    const diff = this.generateDiff(oldLine, newLine, classNameLineIndex + 1);

    return {
      filePath: path.relative(this.projectRoot, filePath),
      before: oldLine.trim(),
      after: newLine.trim(),
      diff,
      linesChanged: 1,
    };
  }

  /**
   * Generate unified diff format
   */
  private generateDiff(before: string, after: string, lineNumber: number): string {
    return `@@ -${lineNumber},1 +${lineNumber},1 @@\n- ${before.trim()}\n+ ${after.trim()}`;
  }

  /**
   * Apply visual changes: find element, update file, generate diff
   */
  async applyVibeCodeChanges(
    userMessage: string,
    visualContext?: any
  ): Promise<ApplyResult> {
    try {
      console.log(`[VibeCodeApplier] 🚀 Applying VibeCoding changes for: "${userMessage}"`);

      // Phase 1: Find target element
      const elements = await this.findTargetElement(userMessage);

      if (elements.length === 0) {
        return {
          success: false,
          filesModified: [],
          elementsChanged: [],
          diffs: [],
          error: 'No matching element found. Try describing the element more specifically (e.g., "the Join Free button on the landing page").',
        };
      }

      if (elements.length > 1) {
        // Multiple matches - return list for user to choose
        const elementList = elements.map((e, i) => 
          `${i + 1}. ${e.elementType} in ${path.basename(e.filePath)} (line ${e.lineNumber}): "${e.textContent}"`
        ).join('\n');

        return {
          success: false,
          filesModified: [],
          elementsChanged: elements,
          diffs: [],
          error: `Found ${elements.length} matching elements:\n\n${elementList}\n\nPlease be more specific (e.g., "the button on the landing page").`,
        };
      }

      const element = elements[0];
      console.log(`[VibeCodeApplier] ✅ Found element: ${element.elementType} in ${element.filePath}:${element.lineNumber}`);

      // Phase 2: Parse style change
      const styleChange = this.parseStyleChange(userMessage, element);
      console.log(`[VibeCodeApplier] 📋 Style change: ${styleChange.description}`);

      // Phase 3: Update source file
      const diffResult = await this.updateSourceFile(element, styleChange);

      // Phase 4: Return results
      return {
        success: true,
        filesModified: [diffResult.filePath],
        elementsChanged: [element],
        diffs: [diffResult],
      };

    } catch (error: any) {
      console.error('[VibeCodeApplier] ❌ Error applying changes:', error);
      return {
        success: false,
        filesModified: [],
        elementsChanged: [],
        diffs: [],
        error: error.message || 'Failed to apply changes',
      };
    }
  }
}

// Export singleton instance
export const vibeCodeApplier = new VibeCodeApplier();
