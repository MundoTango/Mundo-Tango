import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Documentation Governance Service
 * Implements APPENDIX P rules for preventing documentation drift and duplication
 * 
 * The 4 Core Rules:
 * 1. UPDATE IN PLACE - Never duplicate, modify existing sections
 * 2. VERSION CONTROL - Track all changes with dates and versions
 * 3. REFERENCE DON'T COPY - Use links instead of copying content
 * 4. CONSOLIDATE - Check for existing content before adding new
 */

export interface DocumentSection {
  title: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  version?: string;
  lastUpdated?: string;
}

export interface DuplicateMatch {
  section1: DocumentSection;
  section2: DocumentSection;
  similarity: number;
  type: 'exact' | 'near';
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    exactDuplicates: number;
    nearDuplicates: number;
    versionConflicts: number;
    brokenReferences: number;
    totalSections: number;
  };
  duplicates: DuplicateMatch[];
}

export interface VersionInfo {
  version: string;
  lastUpdated: string;
  changes: string[];
}

export interface SingleSourceOfTruth {
  concept: string;
  canonicalLocation: string;
  lineRange: string;
  crossReferencesAllowed: boolean;
}

/**
 * Single Source of Truth Map - Canonical locations for each concept
 * Based on APPENDIX P (lines 26,661-26,677)
 */
export const SINGLE_SOURCE_MAP: SingleSourceOfTruth[] = [
  {
    concept: 'ESA Framework Overview',
    canonicalLocation: 'APPENDIX I',
    lineRange: '8,139-13,130',
    crossReferencesAllowed: true
  },
  {
    concept: '927+ Agents Complete Spec',
    canonicalLocation: 'APPENDIX J',
    lineRange: '13,131-21,771',
    crossReferencesAllowed: true
  },
  {
    concept: 'Agent Profiles',
    canonicalLocation: 'APPENDIX K',
    lineRange: '21,772-23,050',
    crossReferencesAllowed: true
  },
  {
    concept: 'Expert Research',
    canonicalLocation: 'APPENDIX L',
    lineRange: '23,051-23,530',
    crossReferencesAllowed: true
  },
  {
    concept: 'Agent Training (15 Agents)',
    canonicalLocation: 'APPENDIX M',
    lineRange: '23,531-24,174',
    crossReferencesAllowed: true
  },
  {
    concept: 'ESA New Agent Guide',
    canonicalLocation: 'APPENDIX N',
    lineRange: '24,175-26,159',
    crossReferencesAllowed: true
  },
  {
    concept: 'Complete Agent Training',
    canonicalLocation: 'APPENDIX O',
    lineRange: '26,160-26,619',
    crossReferencesAllowed: true
  },
  {
    concept: 'Pattern Library',
    canonicalLocation: 'Lines 1,811-5,817',
    lineRange: '1,811-5,817',
    crossReferencesAllowed: true
  },
  {
    concept: 'Learning Accelerators',
    canonicalLocation: 'Lines 1,021-1,810',
    lineRange: '1,021-1,810',
    crossReferencesAllowed: true
  },
  {
    concept: 'Top 50 Patterns',
    canonicalLocation: 'Lines 1-1,020',
    lineRange: '1-1,020',
    crossReferencesAllowed: true
  }
];

export class DocumentationGovernanceService {
  private docsPath: string;

  constructor(docsPath: string = 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md') {
    this.docsPath = path.resolve(docsPath);
  }

  /**
   * RULE 1: UPDATE IN PLACE - Validates that updates modify existing sections
   */
  async validateUpdateInPlace(
    filePath: string,
    sectionTitle: string,
    newContent: string
  ): Promise<{ valid: boolean; message: string }> {
    const content = await this.readFile(filePath);
    const sections = this.extractSections(content);
    
    const existingSection = sections.find(s => 
      s.title.toLowerCase().includes(sectionTitle.toLowerCase())
    );

    if (existingSection) {
      // Section exists - update is valid
      return {
        valid: true,
        message: `Found existing section at lines ${existingSection.lineStart}-${existingSection.lineEnd}. Update in place.`
      };
    } else {
      // New section - check if similar content exists elsewhere
      const duplicates = await this.findSimilarContent(content, newContent);
      if (duplicates.length > 0) {
        return {
          valid: false,
          message: `Similar content found. Update existing section instead: ${duplicates[0].section1.title}`
        };
      }
      return {
        valid: true,
        message: 'New section approved - no duplicates found.'
      };
    }
  }

  /**
   * RULE 2: VERSION CONTROL - Validates version tracking
   */
  validateVersionControl(content: string): {
    valid: boolean;
    issues: string[];
    versionInfo?: VersionInfo;
  } {
    const issues: string[] = [];
    
    // Check for version number
    const versionMatch = content.match(/\*\*Version:\*\*\s*([\d.]+)/i);
    if (!versionMatch) {
      issues.push('Missing version number');
    }

    // Check for last updated date
    const dateMatch = content.match(/\*\*Last Updated:\*\*\s*([^\n]+)/i);
    if (!dateMatch) {
      issues.push('Missing last updated date');
    }

    // Check for changes documentation
    const changesMatch = content.match(/\*\*Changes:\*\*\s*([^\n]+)/i);
    if (!changesMatch) {
      issues.push('Missing change description');
    }

    const versionInfo: VersionInfo | undefined = versionMatch && dateMatch ? {
      version: versionMatch[1],
      lastUpdated: dateMatch[1],
      changes: changesMatch ? [changesMatch[1]] : []
    } : undefined;

    return {
      valid: issues.length === 0,
      issues,
      versionInfo
    };
  }

  /**
   * RULE 3: REFERENCE DON'T COPY - Detects copied content instead of references
   */
  async validateReferenceDontCopy(content: string): Promise<{
    violations: Array<{ concept: string; location: string }>;
    valid: boolean;
  }> {
    const violations: Array<{ concept: string; location: string }> = [];

    for (const ssot of SINGLE_SOURCE_MAP) {
      // Check if content from canonical location is duplicated elsewhere
      const pattern = new RegExp(ssot.concept, 'gi');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 2) {
        // More than 2 mentions might indicate copying instead of referencing
        violations.push({
          concept: ssot.concept,
          location: ssot.canonicalLocation
        });
      }
    }

    return {
      violations,
      valid: violations.length === 0
    };
  }

  /**
   * RULE 4: CONSOLIDATE - Check for existing content before adding
   */
  async consolidateCheck(
    filePath: string,
    newSectionTitle: string,
    newContent: string
  ): Promise<{ shouldConsolidate: boolean; existingSections: DocumentSection[] }> {
    const content = await this.readFile(filePath);
    const sections = this.extractSections(content);
    
    const existingSections = sections.filter(s =>
      this.calculateSimilarity(s.title, newSectionTitle) > 0.7 ||
      this.calculateSimilarity(s.content, newContent) > 0.85
    );

    return {
      shouldConsolidate: existingSections.length > 0,
      existingSections
    };
  }

  /**
   * Comprehensive validation - runs all checks
   */
  async validateDocument(filePath: string): Promise<ValidationResult> {
    const content = await this.readFile(filePath);
    const errors: string[] = [];
    const warnings: string[] = [];
    const duplicates: DuplicateMatch[] = [];

    // Extract sections
    const sections = this.extractSections(content);

    // Check for exact duplicates
    const exactDuplicates = this.findExactDuplicates(sections);
    duplicates.push(...exactDuplicates);
    
    if (exactDuplicates.length > 0) {
      errors.push(`Found ${exactDuplicates.length} exact duplicate sections`);
    }

    // Check for near-duplicates (>85% similarity)
    const nearDuplicates = await this.findNearDuplicates(sections);
    duplicates.push(...nearDuplicates);
    
    if (nearDuplicates.length > 0) {
      warnings.push(`Found ${nearDuplicates.length} near-duplicate sections (>85% similar)`);
    }

    // Check version control
    const versionCheck = this.validateVersionControl(content);
    if (!versionCheck.valid) {
      warnings.push(...versionCheck.issues.map(i => `Version control: ${i}`));
    }

    // Check for broken references
    const brokenRefs = await this.findBrokenReferences(content);
    if (brokenRefs.length > 0) {
      errors.push(`Found ${brokenRefs.length} broken internal references`);
    }

    // Check reference don't copy
    const refCheck = await this.validateReferenceDontCopy(content);
    if (!refCheck.valid) {
      warnings.push(`Possible content copying instead of referencing: ${refCheck.violations.map(v => v.concept).join(', ')}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      stats: {
        exactDuplicates: exactDuplicates.length,
        nearDuplicates: nearDuplicates.length,
        versionConflicts: this.findVersionConflicts(content),
        brokenReferences: brokenRefs.length,
        totalSections: sections.length
      },
      duplicates
    };
  }

  /**
   * Track documentation dependencies (cross-references)
   */
  async trackDependencies(filePath: string): Promise<Map<string, string[]>> {
    const content = await this.readFile(filePath);
    const dependencies = new Map<string, string[]>();

    // Find all references to appendices and sections
    const refPattern = /(?:see|refer to|documented in)\s+\*\*([^*]+)\*\*/gi;
    const matches = content.matchAll(refPattern);

    for (const match of matches) {
      const reference = match[1];
      const context = content.substring(Math.max(0, match.index! - 100), match.index!);
      
      // Extract section title from context
      const sectionMatch = context.match(/##\s+([^\n]+)/);
      if (sectionMatch) {
        const section = sectionMatch[1];
        if (!dependencies.has(section)) {
          dependencies.set(section, []);
        }
        dependencies.get(section)!.push(reference);
      }
    }

    return dependencies;
  }

  /**
   * Git integration - get commit history for documentation
   */
  async getDocumentationHistory(filePath: string, limit: number = 10): Promise<Array<{
    hash: string;
    date: string;
    author: string;
    message: string;
  }>> {
    try {
      const { stdout } = await execAsync(
        `git log --pretty=format:"%H|%ad|%an|%s" --date=short -n ${limit} -- ${filePath}`
      );

      return stdout.split('\n').filter(Boolean).map(line => {
        const [hash, date, author, message] = line.split('|');
        return { hash, date, author, message };
      });
    } catch (error) {
      console.error('Git history error:', error);
      return [];
    }
  }

  /**
   * Helper: Read file content
   */
  private async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  /**
   * Helper: Extract sections from markdown
   */
  private extractSections(content: string): DocumentSection[] {
    const lines = content.split('\n');
    const sections: DocumentSection[] = [];
    let currentSection: DocumentSection | null = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^##\s+(.+)/);
      
      if (headerMatch) {
        if (currentSection) {
          currentSection.lineEnd = index - 1;
          sections.push(currentSection);
        }
        
        currentSection = {
          title: headerMatch[1],
          content: '',
          lineStart: index + 1,
          lineEnd: index + 1
        };

        // Extract version and date if present in next few lines
        const nextLines = lines.slice(index + 1, index + 10).join('\n');
        const versionMatch = nextLines.match(/\*\*Version:\*\*\s*([\d.]+)/);
        const dateMatch = nextLines.match(/\*\*Last Updated:\*\*\s*([^\n]+)/);
        
        if (versionMatch) currentSection.version = versionMatch[1];
        if (dateMatch) currentSection.lastUpdated = dateMatch[1];
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection) {
      currentSection.lineEnd = lines.length;
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Helper: Find exact duplicate sections
   */
  private findExactDuplicates(sections: DocumentSection[]): DuplicateMatch[] {
    const duplicates: DuplicateMatch[] = [];
    const contentMap = new Map<string, DocumentSection>();

    for (const section of sections) {
      const normalized = section.content.trim().toLowerCase();
      
      if (contentMap.has(normalized)) {
        duplicates.push({
          section1: contentMap.get(normalized)!,
          section2: section,
          similarity: 1.0,
          type: 'exact'
        });
      } else {
        contentMap.set(normalized, section);
      }
    }

    return duplicates;
  }

  /**
   * Helper: Find near-duplicate sections (>85% similarity)
   */
  private async findNearDuplicates(sections: DocumentSection[]): Promise<DuplicateMatch[]> {
    const duplicates: DuplicateMatch[] = [];

    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const similarity = this.calculateSimilarity(
          sections[i].content,
          sections[j].content
        );

        if (similarity > 0.85 && similarity < 1.0) {
          duplicates.push({
            section1: sections[i],
            section2: sections[j],
            similarity,
            type: 'near'
          });
        }
      }
    }

    return duplicates;
  }

  /**
   * Helper: Calculate text similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    return 1 - matrix[s2.length][s1.length] / maxLength;
  }

  /**
   * Helper: Find broken internal references
   */
  private async findBrokenReferences(content: string): Promise<string[]> {
    const broken: string[] = [];
    const refPattern = /\[([^\]]+)\]\(#([^)]+)\)/g;
    const matches = content.matchAll(refPattern);

    for (const match of matches) {
      const anchor = match[2];
      const anchorPattern = new RegExp(`<a\\s+(?:name|id)="${anchor}"`, 'i');
      
      if (!anchorPattern.test(content) && !content.includes(`## ${anchor}`)) {
        broken.push(match[1]);
      }
    }

    return broken;
  }

  /**
   * Helper: Find version conflicts in document
   */
  private findVersionConflicts(content: string): number {
    const versionMatches = content.matchAll(/\*\*Version:\*\*\s*([\d.]+)/gi);
    const versions = new Set<string>();
    
    for (const match of versionMatches) {
      versions.add(match[1]);
    }

    return Math.max(0, versions.size - 1);
  }

  /**
   * Helper: Find similar content
   */
  private async findSimilarContent(
    fullContent: string,
    newContent: string,
    threshold: number = 0.85
  ): Promise<DuplicateMatch[]> {
    const sections = this.extractSections(fullContent);
    const matches: DuplicateMatch[] = [];

    for (const section of sections) {
      const similarity = this.calculateSimilarity(section.content, newContent);
      
      if (similarity > threshold) {
        matches.push({
          section1: section,
          section2: {
            title: 'New Content',
            content: newContent,
            lineStart: 0,
            lineEnd: 0
          },
          similarity,
          type: similarity === 1.0 ? 'exact' : 'near'
        });
      }
    }

    return matches;
  }
}

// Export singleton instance
export const governanceService = new DocumentationGovernanceService();
