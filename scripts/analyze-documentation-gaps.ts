/**
 * DOCUMENTATION GAP ANALYZER
 * Recursive Search Through Documentation and Code
 * 
 * This system:
 * 1. Recursively searches all documentation files
 * 2. Scans implementation code (pages, routes, tests)
 * 3. Identifies missing pages, agents, APIs, and tests
 * 4. Generates prioritized recommendations
 * 5. Outputs comprehensive JSON report
 * 
 * Methodology: MB.MD (Simultaneously, Recursively, Critically)
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Gap analysis result structure
 */
export interface GapAnalysis {
  timestamp: string;
  summary: {
    documentedPages: number;
    implementedPages: number;
    missingPages: number;
    documentedAgents: number;
    implementedAgents: number;
    missingAgents: number;
    documentedAPIs: number;
    implementedAPIs: number;
    missingAPIs: number;
    totalTests: number;
    missingTests: number;
  };
  gaps: {
    missingPages: PageGap[];
    missingAgents: AgentGap[];
    missingAPIs: APIGap[];
    missingTests: TestGap[];
    undocumentedImplementations: UndocumentedItem[];
  };
  recommendations: Recommendation[];
  details: {
    documentationSources: string[];
    codeSources: string[];
    testSources: string[];
  };
}

interface PageGap {
  pageId: string;
  pageName: string;
  route: string;
  agent: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  documentedIn: string[];
  reason: string;
}

interface AgentGap {
  agentId: string;
  agentName: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  documentedIn: string[];
  reason: string;
}

interface APIGap {
  endpoint: string;
  method: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  documentedIn: string[];
  reason: string;
}

interface TestGap {
  pageId: string;
  pageName: string;
  testType: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

interface UndocumentedItem {
  type: 'page' | 'api' | 'agent';
  name: string;
  location: string;
  suggestion: string;
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  action: string;
}

/**
 * Documentation Gap Analyzer Class
 */
export class DocumentationGapAnalyzer {
  private rootDir: string;
  
  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  /**
   * Run complete gap analysis
   */
  async analyze(): Promise<GapAnalysis> {
    console.log('🔍 Starting Documentation Gap Analysis...\n');

    // Scan documentation
    const documentedPages = await this.scanDocumentedPages();
    const documentedAgents = await this.scanDocumentedAgents();
    const documentedAPIs = await this.scanDocumentedAPIs();

    // Scan implementation
    const implementedPages = await this.scanImplementedPages();
    const implementedAgents = await this.scanImplementedAgents();
    const implementedAPIs = await this.scanImplementedAPIs();

    // Scan tests
    const existingTests = await this.scanExistingTests();

    // Find gaps
    const missingPages = this.findMissingPages(documentedPages, implementedPages);
    const missingAgents = this.findMissingAgents(documentedAgents, implementedAgents);
    const missingAPIs = this.findMissingAPIs(documentedAPIs, implementedAPIs);
    const missingTests = this.findMissingTests(implementedPages, existingTests);
    const undocumentedImplementations = this.findUndocumented(
      implementedPages,
      implementedAPIs,
      documentedPages,
      documentedAPIs
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      missingPages,
      missingAgents,
      missingAPIs,
      missingTests
    );

    const analysis: GapAnalysis = {
      timestamp: new Date().toISOString(),
      summary: {
        documentedPages: documentedPages.length,
        implementedPages: implementedPages.length,
        missingPages: missingPages.length,
        documentedAgents: documentedAgents.length,
        implementedAgents: implementedAgents.length,
        missingAgents: missingAgents.length,
        documentedAPIs: documentedAPIs.length,
        implementedAPIs: implementedAPIs.length,
        missingAPIs: missingAPIs.length,
        totalTests: existingTests.length,
        missingTests: missingTests.length,
      },
      gaps: {
        missingPages,
        missingAgents,
        missingAPIs,
        missingTests,
        undocumentedImplementations,
      },
      recommendations,
      details: {
        documentationSources: await this.getDocumentationSources(),
        codeSources: await this.getCodeSources(),
        testSources: await this.getTestSources(),
      },
    };

    // Save report
    await this.saveReport(analysis);

    // Print summary
    this.printSummary(analysis);

    return analysis;
  }

  /**
   * Scan documented pages from handoff documents
   */
  private async scanDocumentedPages(): Promise<any[]> {
    const pages: any[] = [];
    const docPatterns = [
      'docs/handoff/**/*.txt',
      'docs/handoff/**/*.md',
      'attached_assets/*HANDOFF*.txt',
      'attached_assets/*handoff*.txt',
    ];

    for (const pattern of docPatterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
        
        // Extract page references (P1, P2, etc.)
        const pageMatches = content.matchAll(/P(\d+):\s*([^\n]+)/gi);
        for (const match of pageMatches) {
          pages.push({
            pageId: `P${match[1]}`,
            pageName: match[2].trim(),
            source: file,
          });
        }
      }
    }

    return pages;
  }

  /**
   * Scan documented agents from handoff documents
   */
  private async scanDocumentedAgents(): Promise<any[]> {
    const agents: any[] = [];
    const docPatterns = [
      'docs/handoff/**/*.txt',
      'docs/handoff/**/*.md',
      'attached_assets/*HANDOFF*.txt',
    ];

    for (const pattern of docPatterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
        
        // Extract agent references (Agent #1, Agent #2, etc.)
        const agentMatches = content.matchAll(/Agent\s*#(\d+)[:\-\s]*([^\n]+)/gi);
        for (const match of agentMatches) {
          agents.push({
            agentId: `Agent${match[1]}`,
            agentName: match[2].trim(),
            source: file,
          });
        }
      }
    }

    return agents;
  }

  /**
   * Scan documented APIs from documentation
   */
  private async scanDocumentedAPIs(): Promise<any[]> {
    const apis: any[] = [];
    const docPatterns = [
      'docs/api/**/*.md',
      'docs/handoff/**/*.txt',
    ];

    for (const pattern of docPatterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
        
        // Extract API endpoint references
        const apiMatches = content.matchAll(/(?:GET|POST|PUT|DELETE|PATCH)\s+(\/api\/[^\s\n]+)/gi);
        for (const match of apiMatches) {
          apis.push({
            endpoint: match[1],
            method: match[0].split(' ')[0],
            source: file,
          });
        }
      }
    }

    return apis;
  }

  /**
   * Scan implemented pages from client code
   */
  private async scanImplementedPages(): Promise<any[]> {
    const pages: any[] = [];
    const pageFiles = await glob('client/src/pages/**/*.tsx', { cwd: this.rootDir });

    for (const file of pageFiles) {
      const fileName = path.basename(file, '.tsx');
      const relativePath = path.relative(path.join(this.rootDir, 'client/src/pages'), file);
      
      pages.push({
        pageName: fileName,
        filePath: file,
        route: this.inferRoute(relativePath),
      });
    }

    return pages;
  }

  /**
   * Scan implemented agents (Life CEO, HR, Marketing, etc.)
   */
  private async scanImplementedAgents(): Promise<any[]> {
    const agents: any[] = [];
    const agentPatterns = [
      'client/src/pages/life-ceo/**/*.tsx',
      'client/src/pages/hr/**/*.tsx',
      'client/src/pages/marketing/**/*.tsx',
      'server/services/**/*Agent*.ts',
    ];

    for (const pattern of agentPatterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      
      for (const file of files) {
        const fileName = path.basename(file, path.extname(file));
        agents.push({
          agentName: fileName,
          filePath: file,
        });
      }
    }

    return agents;
  }

  /**
   * Scan implemented API endpoints
   */
  private async scanImplementedAPIs(): Promise<any[]> {
    const apis: any[] = [];
    const routeFiles = await glob('server/routes/**/*.ts', { cwd: this.rootDir });

    for (const file of routeFiles) {
      const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
      
      // Extract route definitions
      const routeMatches = content.matchAll(/(?:router|app)\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi);
      for (const match of routeMatches) {
        apis.push({
          method: match[1].toUpperCase(),
          endpoint: match[2],
          file,
        });
      }
    }

    return apis;
  }

  /**
   * Scan existing tests
   */
  private async scanExistingTests(): Promise<any[]> {
    const tests: any[] = [];
    const testFiles = await glob('tests/e2e/**/*.spec.ts', { cwd: this.rootDir });

    for (const file of testFiles) {
      const content = fs.readFileSync(path.join(this.rootDir, file), 'utf-8');
      
      // Extract test names
      const testMatches = content.matchAll(/test\(['"`]([^'"`]+)['"`]/g);
      for (const match of testMatches) {
        tests.push({
          testName: match[1],
          file,
        });
      }
    }

    return tests;
  }

  /**
   * Find missing pages
   */
  private findMissingPages(documented: any[], implemented: any[]): PageGap[] {
    const missing: PageGap[] = [];
    
    for (const doc of documented) {
      const found = implemented.some(impl => 
        impl.pageName.toLowerCase().includes(doc.pageName.toLowerCase().split(' ')[0]) ||
        doc.pageName.toLowerCase().includes(impl.pageName.toLowerCase())
      );

      if (!found) {
        missing.push({
          pageId: doc.pageId,
          pageName: doc.pageName,
          route: 'Unknown',
          agent: 'Unknown',
          priority: this.determinePriority(doc.pageName),
          documentedIn: [doc.source],
          reason: 'Page documented but not implemented',
        });
      }
    }

    return missing;
  }

  /**
   * Find missing agents
   */
  private findMissingAgents(documented: any[], implemented: any[]): AgentGap[] {
    const missing: AgentGap[] = [];
    
    for (const doc of documented) {
      const found = implemented.some(impl => 
        impl.agentName.toLowerCase().includes(doc.agentName.toLowerCase().split(' ')[0])
      );

      if (!found) {
        missing.push({
          agentId: doc.agentId,
          agentName: doc.agentName,
          category: 'Unknown',
          priority: 'medium',
          documentedIn: [doc.source],
          reason: 'Agent documented but not implemented',
        });
      }
    }

    return missing;
  }

  /**
   * Find missing APIs
   */
  private findMissingAPIs(documented: any[], implemented: any[]): APIGap[] {
    const missing: APIGap[] = [];
    
    for (const doc of documented) {
      const found = implemented.some(impl => 
        impl.endpoint === doc.endpoint && impl.method === doc.method
      );

      if (!found) {
        missing.push({
          endpoint: doc.endpoint,
          method: doc.method,
          description: `${doc.method} ${doc.endpoint}`,
          priority: 'high',
          documentedIn: [doc.source],
          reason: 'API documented but not implemented',
        });
      }
    }

    return missing;
  }

  /**
   * Find missing tests
   */
  private findMissingTests(pages: any[], tests: any[]): TestGap[] {
    const missing: TestGap[] = [];
    
    for (const page of pages) {
      const hasTest = tests.some(test => 
        test.testName.toLowerCase().includes(page.pageName.toLowerCase())
      );

      if (!hasTest) {
        missing.push({
          pageId: 'Unknown',
          pageName: page.pageName,
          testType: 'E2E Test',
          priority: this.determinePriority(page.pageName),
          reason: 'Page implemented but no test exists',
        });
      }
    }

    return missing;
  }

  /**
   * Find undocumented implementations
   */
  private findUndocumented(
    implementedPages: any[],
    implementedAPIs: any[],
    documentedPages: any[],
    documentedAPIs: any[]
  ): UndocumentedItem[] {
    const undocumented: UndocumentedItem[] = [];

    // Check pages
    for (const impl of implementedPages) {
      const documented = documentedPages.some(doc => 
        doc.pageName.toLowerCase().includes(impl.pageName.toLowerCase())
      );

      if (!documented) {
        undocumented.push({
          type: 'page',
          name: impl.pageName,
          location: impl.filePath,
          suggestion: 'Add page documentation to handoff documents',
        });
      }
    }

    return undocumented;
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(
    missingPages: PageGap[],
    missingAgents: AgentGap[],
    missingAPIs: APIGap[],
    missingTests: TestGap[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Critical recommendations
    const criticalPages = missingPages.filter(p => p.priority === 'critical');
    if (criticalPages.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Pages',
        message: `${criticalPages.length} critical pages are documented but not implemented`,
        action: `Implement: ${criticalPages.map(p => p.pageName).join(', ')}`,
      });
    }

    // High priority recommendations
    const highPriorityTests = missingTests.filter(t => t.priority === 'high');
    if (highPriorityTests.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Tests',
        message: `${highPriorityTests.length} high-priority pages lack test coverage`,
        action: 'Create E2E tests for critical user journeys',
      });
    }

    // Medium priority
    if (missingAPIs.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'APIs',
        message: `${missingAPIs.length} API endpoints are documented but not implemented`,
        action: 'Implement documented API endpoints',
      });
    }

    if (missingAgents.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Agents',
        message: `${missingAgents.length} agents are documented but not implemented`,
        action: 'Implement or remove from documentation',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Determine priority based on page name
   */
  private determinePriority(name: string): 'critical' | 'high' | 'medium' | 'low' {
    const critical = ['login', 'register', 'dashboard', 'home', 'feed'];
    const high = ['profile', 'settings', 'admin', 'messages'];
    
    const lowerName = name.toLowerCase();
    
    if (critical.some(keyword => lowerName.includes(keyword))) return 'critical';
    if (high.some(keyword => lowerName.includes(keyword))) return 'high';
    
    return 'medium';
  }

  /**
   * Infer route from file path
   */
  private inferRoute(relativePath: string): string {
    return '/' + relativePath
      .replace(/\.tsx?$/, '')
      .replace(/Page$/, '')
      .replace(/\\/g, '/')
      .toLowerCase();
  }

  /**
   * Get documentation sources
   */
  private async getDocumentationSources(): Promise<string[]> {
    const patterns = [
      'docs/handoff/**/*.txt',
      'docs/handoff/**/*.md',
      'attached_assets/*HANDOFF*.txt',
    ];

    const sources: string[] = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      sources.push(...files);
    }

    return sources;
  }

  /**
   * Get code sources
   */
  private async getCodeSources(): Promise<string[]> {
    const patterns = [
      'client/src/pages/**/*.tsx',
      'server/routes/**/*.ts',
    ];

    const sources: string[] = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      sources.push(...files);
    }

    return sources;
  }

  /**
   * Get test sources
   */
  private async getTestSources(): Promise<string[]> {
    const files = await glob('tests/e2e/**/*.spec.ts', { cwd: this.rootDir });
    return files;
  }

  /**
   * Save analysis report to file
   */
  private async saveReport(analysis: GapAnalysis): Promise<void> {
    const reportPath = path.join(this.rootDir, 'test-results', 'documentation-gap-analysis.json');
    
    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📊 Gap analysis report saved to: ${reportPath}\n`);
  }

  /**
   * Print summary to console
   */
  private printSummary(analysis: GapAnalysis): void {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   DOCUMENTATION GAP ANALYSIS - SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📄 PAGES:');
    console.log(`   Documented: ${analysis.summary.documentedPages}`);
    console.log(`   Implemented: ${analysis.summary.implementedPages}`);
    console.log(`   Missing: ${analysis.summary.missingPages}\n`);

    console.log('🤖 AGENTS:');
    console.log(`   Documented: ${analysis.summary.documentedAgents}`);
    console.log(`   Implemented: ${analysis.summary.implementedAgents}`);
    console.log(`   Missing: ${analysis.summary.missingAgents}\n`);

    console.log('🔌 APIS:');
    console.log(`   Documented: ${analysis.summary.documentedAPIs}`);
    console.log(`   Implemented: ${analysis.summary.implementedAPIs}`);
    console.log(`   Missing: ${analysis.summary.missingAPIs}\n`);

    console.log('🧪 TESTS:');
    console.log(`   Existing Tests: ${analysis.summary.totalTests}`);
    console.log(`   Missing Tests: ${analysis.summary.missingTests}\n`);

    if (analysis.recommendations.length > 0) {
      console.log('📋 TOP RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 5).forEach((rec, idx) => {
        const emoji = { critical: '🚨', high: '⚠️', medium: 'ℹ️', low: '💡' }[rec.priority];
        console.log(`   ${idx + 1}. ${emoji} ${rec.priority.toUpperCase()}: ${rec.message}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════\n');
  }
}

/**
 * Main execution
 */
async function main() {
  const analyzer = new DocumentationGapAnalyzer();
  await analyzer.analyze();
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { DocumentationGapAnalyzer };
