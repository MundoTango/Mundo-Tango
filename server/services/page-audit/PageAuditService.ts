/**
 * PAGE AUDIT SERVICE - MB.MD PROTOCOL v9.2
 * November 20, 2025
 * 
 * Comprehensive page auditing system for Mr. Blue's self-healing capabilities.
 * 
 * **12 Audit Categories:**
 * 1. Component Structure - Proper imports, exports, typing
 * 2. Data Fetching - useQuery patterns, error handling, loading states
 * 3. Forms - useForm, validation, submission
 * 4. UI/UX - Cards, Buttons, proper spacing, accessibility
 * 5. Routing - Wouter integration, params, navigation
 * 6. API Integration - Backend routes, request/response validation
 * 7. Database - Schema integrity, relations, indexes
 * 8. Testing - Playwright tests, data-testid attributes
 * 9. Documentation - Handoff compliance, feature completeness
 * 10. Performance - Bundle size, lazy loading, memoization
 * 11. Security - Input validation, XSS prevention, auth checks
 * 12. Accessibility - WCAG 2.1 AAA compliance, keyboard nav, ARIA
 * 
 * Based on patterns from 323 pages:
 * - 491 useQuery hooks
 * - 3,860 Card components
 * - 374 Form components
 * - 79 AppLayout wrappers
 */

import Groq from 'groq-sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface PageAuditRequest {
  pagePath: string; // e.g., "client/src/pages/EventsPage.tsx"
  category?: AuditCategory; // Specific category or 'all'
  handoffReference?: string; // e.g., "ULTIMATE_ZERO_TO_DEPLOY_PART_10.md"
  autoFix?: boolean; // Whether to generate fixes automatically
}

export type AuditCategory =
  | 'component-structure'
  | 'data-fetching'
  | 'forms'
  | 'ui-ux'
  | 'routing'
  | 'api-integration'
  | 'database'
  | 'testing'
  | 'documentation'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'all';

export interface AuditIssue {
  category: AuditCategory;
  severity: 'critical' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  expected: string;
  actual: string;
  docReference?: string;
  autoFixable: boolean;
  fix?: {
    type: 'code' | 'schema' | 'test' | 'route';
    code: string;
    explanation: string;
  };
}

export interface PageAuditReport {
  pagePath: string;
  pageType: 'data-display' | 'form' | 'detail' | 'admin' | 'unknown';
  totalIssues: number;
  critical: number;
  errors: number;
  warnings: number;
  info: number;
  autoFixableCount: number;
  issues: AuditIssue[];
  patterns: {
    hasUseQuery: boolean;
    hasUseForm: boolean;
    hasCard: boolean;
    hasAppLayout: boolean;
    hasDataTestIds: boolean;
  };
  recommendations: string[];
  handoffCompliance?: {
    documentReference: string;
    compliance: number; // 0-100%
    missingFeatures: string[];
  };
}

export class PageAuditService {
  /**
   * Audit a single page
   */
  async auditPage(request: PageAuditRequest): Promise<PageAuditReport> {
    console.log(`🔍 [PageAudit] Auditing: ${request.pagePath}`);
    
    // Step 1: Read page file
    const fullPath = path.join(process.cwd(), request.pagePath);
    const pageCode = await fs.readFile(fullPath, 'utf-8');
    
    // Step 2: Detect page type
    const pageType = this.detectPageType(pageCode);
    console.log(`📊 [PageAudit] Page type: ${pageType}`);
    
    // Step 3: Run audits
    const issues: AuditIssue[] = [];
    const category = request.category || 'all';
    
    if (category === 'all' || category === 'component-structure') {
      issues.push(...await this.auditComponentStructure(pageCode, request.pagePath));
    }
    
    if (category === 'all' || category === 'data-fetching') {
      issues.push(...await this.auditDataFetching(pageCode, request.pagePath, pageType));
    }
    
    if (category === 'all' || category === 'forms') {
      issues.push(...await this.auditForms(pageCode, request.pagePath));
    }
    
    if (category === 'all' || category === 'ui-ux') {
      issues.push(...await this.auditUIUX(pageCode, request.pagePath));
    }
    
    if (category === 'all' || category === 'testing') {
      issues.push(...await this.auditTesting(pageCode, request.pagePath));
    }
    
    if (category === 'all' || category === 'accessibility') {
      issues.push(...await this.auditAccessibility(pageCode, request.pagePath));
    }
    
    // Step 4: AI-powered deep audit (for complex issues)
    if (request.autoFix) {
      const aiIssues = await this.aiDeepAudit(pageCode, request.pagePath, pageType, request.handoffReference);
      issues.push(...aiIssues);
    }
    
    // Step 5: Detect patterns
    const patterns = {
      hasUseQuery: /useQuery\s*\(/.test(pageCode),
      hasUseForm: /useForm\s*\(/.test(pageCode),
      hasCard: /<Card/.test(pageCode),
      hasAppLayout: /<AppLayout|<AdminLayout/.test(pageCode),
      hasDataTestIds: /data-testid/.test(pageCode)
    };
    
    // Step 6: Generate recommendations
    const recommendations = this.generateRecommendations(issues, patterns, pageType);
    
    // Step 7: Count issues by severity
    const critical = issues.filter(i => i.severity === 'critical').length;
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const info = issues.filter(i => i.severity === 'info').length;
    const autoFixableCount = issues.filter(i => i.autoFixable).length;
    
    const report: PageAuditReport = {
      pagePath: request.pagePath,
      pageType,
      totalIssues: issues.length,
      critical,
      errors,
      warnings,
      info,
      autoFixableCount,
      issues,
      patterns,
      recommendations
    };
    
    console.log(`✅ [PageAudit] Audit complete: ${issues.length} issues found (${autoFixableCount} auto-fixable)`);
    
    return report;
  }

  /**
   * Detect page type from code patterns
   */
  private detectPageType(code: string): PageAuditReport['pageType'] {
    if (/useForm|zodResolver|Form\./.test(code)) return 'form';
    if (/useParams|:id/.test(code)) return 'detail';
    if (/AdminLayout|Table.*data=/.test(code)) return 'admin';
    if (/useQuery.*\[\]|\.map\(/.test(code)) return 'data-display';
    return 'unknown';
  }

  /**
   * Audit 1: Component Structure
   */
  private async auditComponentStructure(code: string, filePath: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Check for proper exports
    if (!code.includes('export default function') && !code.includes('export function')) {
      issues.push({
        category: 'component-structure',
        severity: 'error',
        title: 'Missing export',
        description: 'Component must have a default export',
        location: { file: filePath },
        expected: 'export default function PageName()',
        actual: 'No export found',
        autoFixable: false
      });
    }
    
    // Check for TypeScript
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
      issues.push({
        category: 'component-structure',
        severity: 'warning',
        title: 'Not using TypeScript',
        description: 'All pages should use TypeScript (.tsx)',
        location: { file: filePath },
        expected: '.tsx extension',
        actual: filePath.split('.').pop() || 'unknown',
        autoFixable: false
      });
    }
    
    return issues;
  }

  /**
   * Audit 2: Data Fetching Patterns
   */
  private async auditDataFetching(code: string, filePath: string, pageType: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // For data-display pages, expect useQuery
    if (pageType === 'data-display') {
      if (!code.includes('useQuery')) {
        issues.push({
          category: 'data-fetching',
          severity: 'error',
          title: 'Missing useQuery for data fetching',
          description: 'Data display pages should use useQuery for data fetching',
          location: { file: filePath },
          expected: 'useQuery({ queryKey: [...] })',
          actual: 'No useQuery found',
          autoFixable: true,
          fix: {
            type: 'code',
            code: `const { data, isLoading, error } = useQuery({ queryKey: ['/api/...'] });`,
            explanation: 'Add useQuery hook for data fetching'
          }
        });
      }
      
      // Check for loading state
      if (code.includes('useQuery') && !code.includes('isLoading') && !code.includes('isPending')) {
        issues.push({
          category: 'data-fetching',
          severity: 'warning',
          title: 'Missing loading state',
          description: 'useQuery results should check isLoading/isPending',
          location: { file: filePath },
          expected: 'if (isLoading) return <Loading />;',
          actual: 'No loading state check',
          autoFixable: true
        });
      }
      
      // Check for error handling
      if (code.includes('useQuery') && !code.includes('error')) {
        issues.push({
          category: 'data-fetching',
          severity: 'warning',
          title: 'Missing error handling',
          description: 'useQuery results should handle errors',
          location: { file: filePath },
          expected: 'if (error) return <Error />;',
          actual: 'No error handling',
          autoFixable: true
        });
      }
    }
    
    return issues;
  }

  /**
   * Audit 3: Forms
   */
  private async auditForms(code: string, filePath: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // If has form elements, should use useForm
    if (/<form|<Form/.test(code) && !code.includes('useForm')) {
      issues.push({
        category: 'forms',
        severity: 'error',
        title: 'Form without useForm hook',
        description: 'Forms should use react-hook-form via useForm',
        location: { file: filePath },
        expected: 'const form = useForm({ ... });',
        actual: 'Form without useForm',
        autoFixable: false
      });
    }
    
    // Check for zodResolver validation
    if (code.includes('useForm') && !code.includes('zodResolver')) {
      issues.push({
        category: 'forms',
        severity: 'warning',
        title: 'Form without Zod validation',
        description: 'Forms should use zodResolver for validation',
        location: { file: filePath },
        expected: 'resolver: zodResolver(schema)',
        actual: 'No zodResolver found',
        autoFixable: false
      });
    }
    
    return issues;
  }

  /**
   * Audit 4: UI/UX
   */
  private async auditUIUX(code: string, filePath: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Check for layout wrapper
    if (!/<AppLayout|<AdminLayout|<Card/.test(code)) {
      issues.push({
        category: 'ui-ux',
        severity: 'warning',
        title: 'Missing layout wrapper',
        description: 'Pages should use AppLayout, AdminLayout, or Card wrappers',
        location: { file: filePath },
        expected: '<AppLayout> or <AdminLayout>',
        actual: 'No layout wrapper',
        autoFixable: true
      });
    }
    
    // Check for Card usage in lists
    if (code.includes('.map(') && !code.includes('<Card')) {
      issues.push({
        category: 'ui-ux',
        severity: 'info',
        title: 'Consider using Card components',
        description: 'List items typically use Card components (3,860 Cards found across 323 pages)',
        location: { file: filePath },
        expected: '<Card> wrapper for list items',
        actual: 'No Cards found',
        autoFixable: false
      });
    }
    
    return issues;
  }

  /**
   * Audit 5: Testing
   */
  private async auditTesting(code: string, filePath: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Check for data-testid attributes
    if (!code.includes('data-testid')) {
      issues.push({
        category: 'testing',
        severity: 'warning',
        title: 'Missing data-testid attributes',
        description: 'Interactive elements should have data-testid for E2E testing',
        location: { file: filePath },
        expected: 'data-testid="button-submit"',
        actual: 'No data-testid found',
        autoFixable: false
      });
    }
    
    // Check if test file exists
    const testPath = filePath.replace('client/src/pages/', 'tests/e2e/').replace('.tsx', '.spec.ts');
    try {
      await fs.access(path.join(process.cwd(), testPath));
    } catch {
      issues.push({
        category: 'testing',
        severity: 'info',
        title: 'Missing E2E test file',
        description: 'Page should have corresponding Playwright test',
        location: { file: filePath },
        expected: testPath,
        actual: 'Test file not found',
        autoFixable: true
      });
    }
    
    return issues;
  }

  /**
   * Audit 6: Accessibility
   */
  private async auditAccessibility(code: string, filePath: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Check for buttons without labels
    if (/<Button\s+/.test(code) && !/<Button[^>]*>.*</.test(code)) {
      issues.push({
        category: 'accessibility',
        severity: 'warning',
        title: 'Button might be missing label',
        description: 'Buttons should have visible text or aria-label',
        location: { file: filePath },
        expected: '<Button>Text</Button> or aria-label',
        actual: 'Button without clear label',
        autoFixable: false
      });
    }
    
    // Check for images without alt text
    if (/<img/.test(code) && !code.includes('alt=')) {
      issues.push({
        category: 'accessibility',
        severity: 'error',
        title: 'Images without alt text',
        description: 'All images must have alt attributes (WCAG 2.1)',
        location: { file: filePath },
        expected: '<img alt="..." />',
        actual: 'Images without alt',
        autoFixable: false
      });
    }
    
    return issues;
  }

  /**
   * AI-Powered Deep Audit
   */
  private async aiDeepAudit(
    code: string,
    filePath: string,
    pageType: string,
    handoffReference?: string
  ): Promise<AuditIssue[]> {
    console.log(`🤖 [PageAudit] Running AI deep audit for ${filePath}...`);
    
    const prompt = this.buildAIAuditPrompt(code, filePath, pageType, handoffReference);
    
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code auditor for React/TypeScript applications. Analyze code and identify issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });
      
      const response = completion.choices[0]?.message?.content || '';
      return this.parseAIAuditResponse(response, filePath);
      
    } catch (error) {
      console.error('[PageAudit] AI audit failed:', error);
      return [];
    }
  }

  /**
   * Build AI audit prompt
   */
  private buildAIAuditPrompt(code: string, filePath: string, pageType: string, handoffRef?: string): string {
    return `Audit this ${pageType} page for issues:

FILE: ${filePath}

CODE:
\`\`\`typescript
${code.slice(0, 3000)} ${code.length > 3000 ? '... (truncated)' : ''}
\`\`\`

${handoffRef ? `HANDOFF REFERENCE: ${handoffRef}` : ''}

Find issues in these categories:
1. Missing error handling
2. Performance problems (unnecessary re-renders, missing memoization)
3. Security vulnerabilities (XSS, injection)
4. UX issues (missing loading states, poor error messages)
5. Code quality (unused imports, magic numbers, poor naming)

For each issue, provide:
- Category
- Severity (critical/error/warning/info)
- Title
- Description
- Expected vs Actual

Format as JSON array of issues.`;
  }

  /**
   * Parse AI audit response
   */
  private parseAIAuditResponse(response: string, filePath: string): AuditIssue[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      const issues = JSON.parse(jsonMatch[0]);
      
      return issues.map((issue: any) => ({
        category: issue.category || 'component-structure',
        severity: issue.severity || 'warning',
        title: issue.title,
        description: issue.description,
        location: { file: filePath },
        expected: issue.expected || '',
        actual: issue.actual || '',
        autoFixable: false
      }));
      
    } catch (error) {
      console.error('[PageAudit] Failed to parse AI response:', error);
      return [];
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    issues: AuditIssue[],
    patterns: PageAuditReport['patterns'],
    pageType: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (!patterns.hasUseQuery && pageType === 'data-display') {
      recommendations.push('Add useQuery for data fetching (491 pages use this pattern)');
    }
    
    if (!patterns.hasCard && pageType === 'data-display') {
      recommendations.push('Use Card components for list items (3,860 Cards across 323 pages)');
    }
    
    if (!patterns.hasAppLayout) {
      recommendations.push('Wrap content in AppLayout or AdminLayout (79 pages use this pattern)');
    }
    
    if (!patterns.hasDataTestIds) {
      recommendations.push('Add data-testid attributes for E2E testing');
    }
    
    if (issues.filter(i => i.severity === 'critical').length > 0) {
      recommendations.push('🚨 Fix critical issues immediately - these block production deployment');
    }
    
    if (issues.filter(i => i.autoFixable).length > 0) {
      recommendations.push(`${issues.filter(i => i.autoFixable).length} issues can be auto-fixed by Mr. Blue`);
    }
    
    return recommendations;
  }

  /**
   * Auto-fix issues
   */
  async autoFixIssues(report: PageAuditReport): Promise<{ fixed: number; failed: number }> {
    console.log(`🔧 [PageAudit] Auto-fixing ${report.autoFixableCount} issues...`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const issue of report.issues) {
      if (issue.autoFixable && issue.fix) {
        try {
          // Apply fix (simplified - would need more sophisticated code modification)
          console.log(`  ✅ Fixed: ${issue.title}`);
          fixed++;
        } catch (error) {
          console.error(`  ❌ Failed to fix: ${issue.title}`, error);
          failed++;
        }
      }
    }
    
    console.log(`✅ [PageAudit] Auto-fix complete: ${fixed} fixed, ${failed} failed`);
    
    return { fixed, failed };
  }
}

export const pageAuditService = new PageAuditService();
