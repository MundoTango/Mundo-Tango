/**
 * Page Audit Service
 * MB.MD v9.0 - Self-Healing Page Agent System
 * November 18, 2025
 * 
 * Runs comprehensive audits on pages using activated agents
 * Target: <200ms audit time
 */

import { db } from '../../../shared/db';
import { 
  pageAudits, 
  agentBeliefs, 
  predictionErrors,
  type InsertPageAudit,
  type InsertAgentBeliefs,
  type InsertPredictionError,
  type SelectAgentBeliefs,
  type SelectPageAudit
} from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';
import axios from 'axios';

// Initialize GROQ client for AI-powered analysis
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export interface AuditIssue {
  category: 'ui_ux' | 'routing' | 'integration' | 'performance' | 'accessibility' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  suggestedFix: string;
  agentId: string;
  surpriseScore?: number; // FEP: Prediction error magnitude (0-1)
  priority?: 'critical' | 'high' | 'medium' | 'low'; // FEP-based priority
}

export interface AuditResults {
  pageId: string;
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  issuesByCategory: {
    ui_ux: AuditIssue[];
    routing: AuditIssue[];
    integration: AuditIssue[];
    performance: AuditIssue[];
    accessibility: AuditIssue[];
    security: AuditIssue[];
  };
  hasIssues: boolean;
  auditDurationMs: number;
  auditorAgents: string[];
}

export class PageAuditService {
  /**
   * Run comprehensive audit on a page
   * MB.MD pattern: Work simultaneously (run all audits in parallel)
   */
  static async runComprehensiveAudit(pageId: string): Promise<AuditResults> {
    const startTime = Date.now();

    try {
      // Run all audits in parallel
      const [
        uiUxIssues,
        routingIssues,
        integrationIssues,
        performanceIssues,
        accessibilityIssues,
        securityIssues
      ] = await Promise.all([
        this.auditUIUX(pageId),
        this.auditRouting(pageId),
        this.auditIntegrations(pageId),
        this.auditPerformance(pageId),
        this.auditAccessibility(pageId),
        this.auditSecurity(pageId)
      ]);

      const issuesByCategory = {
        ui_ux: uiUxIssues,
        routing: routingIssues,
        integration: integrationIssues,
        performance: performanceIssues,
        accessibility: accessibilityIssues,
        security: securityIssues
      };

      const allIssues = [
        ...uiUxIssues,
        ...routingIssues,
        ...integrationIssues,
        ...performanceIssues,
        ...accessibilityIssues,
        ...securityIssues
      ];

      const totalIssues = allIssues.length;
      const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
      const hasIssues = totalIssues > 0;
      const auditDurationMs = Date.now() - startTime;

      const auditorAgents = [
        'EXPERT_11', // UI/UX
        'AGENT_6',   // Routing
        'AGENT_38',  // Integration
        'AGENT_52',  // Performance
        'AGENT_53',  // Accessibility
        'AGENT_1'    // Security
      ];

      const auditResults: AuditResults = {
        pageId,
        timestamp: new Date(),
        totalIssues,
        criticalIssues,
        issuesByCategory,
        hasIssues,
        auditDurationMs,
        auditorAgents
      };

      // Save audit to database
      await this.saveAudit(auditResults);

      console.log(`✅ Audit complete for ${pageId}: ${totalIssues} issues (${criticalIssues} critical) in ${auditDurationMs}ms`);

      return auditResults;
    } catch (error) {
      console.error(`❌ Failed to audit ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * UI/UX Audit (EXPERT_11)
   * Checks for: missing data-testid, inconsistent styling, semantic HTML issues
   * Uses: Cheerio (HTML parsing) + GROQ Llama-3.3-70b (semantic analysis)
   * Target: <200ms
   */
  private static async auditUIUX(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      // For now, we'll audit based on known page patterns
      // In production, this would fetch actual HTML from the page
      const pageHtml = await this.getPageHtml(pageId);
      
      if (!pageHtml) {
        console.log(`⚠️ No HTML found for ${pageId} - skipping UI/UX audit`);
        return issues;
      }

      const $ = cheerio.load(pageHtml);

      // Check 1: Missing data-testid attributes on interactive elements
      $('button, a, input, select, textarea').each((i, element) => {
        const $el = $(element);
        const testId = $el.attr('data-testid');
        
        if (!testId) {
          const tagName = element.tagName;
          const className = $el.attr('class') || '';
          const text = $el.text().trim().substring(0, 30);
          
          issues.push({
            category: 'ui_ux',
            severity: 'medium',
            description: `Missing data-testid attribute on ${tagName} element${text ? `: "${text}"` : ''}`,
            location: `${pageId} - ${tagName}.${className}`,
            suggestedFix: `Add data-testid="${tagName}-${className.split(' ')[0] || 'element'}"`,
            agentId: 'EXPERT_11'
          });
        }
      });

      // Check 2: Inconsistent button styling
      const buttonClasses = new Map<string, number>();
      $('button').each((i, element) => {
        const $el = $(element);
        const classList = $el.attr('class') || '';
        buttonClasses.set(classList, (buttonClasses.get(classList) || 0) + 1);
      });

      if (buttonClasses.size > 5) {
        issues.push({
          category: 'ui_ux',
          severity: 'low',
          description: `Found ${buttonClasses.size} different button styles - consider standardizing`,
          location: pageId,
          suggestedFix: 'Use consistent Button component variants (primary, secondary, ghost, outline)',
          agentId: 'EXPERT_11'
        });
      }

      // Check 3: Use GROQ for semantic HTML analysis (if API key available)
      if (process.env.GROQ_API_KEY && pageHtml.length > 100) {
        try {
          const semanticIssues = await this.analyzeSemanticHTML(pageId, pageHtml, $);
          issues.push(...semanticIssues);
        } catch (error) {
          console.warn('⚠️ GROQ semantic analysis failed:', error);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ UI/UX audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ UI/UX audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Helper: Get page HTML for auditing
   * In production, this would fetch from live page or build artifacts
   */
  private static async getPageHtml(pageId: string): Promise<string | null> {
    // Map pageId to component files (simplified for now)
    const pageMap: Record<string, string> = {
      'search-page': '<div data-testid="search-page"><input type="text" placeholder="Search..." /><button>Search</button></div>',
      'profile-page': '<div data-testid="profile-page"><button>Edit Profile</button><button class="bg-primary">Save</button></div>',
      'events-page': '<div data-testid="events-page"><a href="/event/1">Event 1</a><button>Create Event</button></div>',
    };

    return pageMap[pageId] || null;
  }

  /**
   * Helper: Analyze semantic HTML using GROQ Llama-3.3-70b
   */
  private static async analyzeSemanticHTML(
    pageId: string, 
    html: string, 
    $: cheerio.CheerioAPI
  ): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    try {
      // Extract key HTML structure for analysis
      const structure = {
        buttons: $('button').length,
        links: $('a').length,
        inputs: $('input').length,
        hasHeader: $('header').length > 0,
        hasNav: $('nav').length > 0,
        hasMain: $('main').length > 0,
        headings: {
          h1: $('h1').length,
          h2: $('h2').length,
          h3: $('h3').length,
        }
      };

      const prompt = `Analyze this HTML page structure for UI/UX issues:

Page ID: ${pageId}
Structure: ${JSON.stringify(structure, null, 2)}

Identify potential issues:
1. Missing semantic HTML elements (header, nav, main, footer)
2. Heading hierarchy problems (multiple h1, skipped levels)
3. Accessibility concerns

Return JSON only: { "issues": [{ "type": "semantic|hierarchy|accessibility", "severity": "critical|high|medium|low", "description": "...", "suggestion": "..." }] }`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"issues":[]}');
      
      if (result.issues && Array.isArray(result.issues)) {
        result.issues.forEach((issue: any) => {
          issues.push({
            category: 'ui_ux',
            severity: issue.severity || 'medium',
            description: issue.description,
            location: pageId,
            suggestedFix: issue.suggestion,
            agentId: 'EXPERT_11'
          });
        });
      }
    } catch (error) {
      console.warn('⚠️ GROQ semantic analysis error:', error);
    }

    return issues;
  }

  /**
   * Routing Audit (AGENT_6)
   * Checks for: broken links, invalid route params, missing pages
   * Target: <200ms
   */
  private static async auditRouting(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      const pageHtml = await this.getPageHtml(pageId);
      
      if (!pageHtml) {
        return issues;
      }

      const $ = cheerio.load(pageHtml);

      // Check 1: Validate internal links
      $('a[href^="/"]').each((i, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        
        if (href) {
          // Check for common routing issues
          if (href.includes('undefined') || href.includes('null')) {
            issues.push({
              category: 'routing',
              severity: 'high',
              description: `Invalid link detected: ${href}`,
              location: `${pageId} - ${href}`,
              suggestedFix: 'Ensure route parameters are properly defined',
              agentId: 'AGENT_6'
            });
          }

          // Check for missing route params (e.g., /profile/:id with no id)
          if (href.includes(':') && !href.includes('=')) {
            issues.push({
              category: 'routing',
              severity: 'medium',
              description: `Route parameter not resolved: ${href}`,
              location: `${pageId} - ${href}`,
              suggestedFix: 'Pass actual parameter value instead of placeholder',
              agentId: 'AGENT_6'
            });
          }
        }
      });

      // Check 2: External links missing target="_blank"
      $('a[href^="http"]').each((i, element) => {
        const $el = $(element);
        const target = $el.attr('target');
        const rel = $el.attr('rel');
        
        if (!target || target !== '_blank') {
          issues.push({
            category: 'routing',
            severity: 'low',
            description: 'External link missing target="_blank"',
            location: `${pageId} - ${$el.attr('href')}`,
            suggestedFix: 'Add target="_blank" and rel="noopener noreferrer" to external links',
            agentId: 'AGENT_6'
          });
        }

        if (!rel || !rel.includes('noopener')) {
          issues.push({
            category: 'routing',
            severity: 'medium',
            description: 'External link missing rel="noopener noreferrer"',
            location: `${pageId} - ${$el.attr('href')}`,
            suggestedFix: 'Add rel="noopener noreferrer" for security',
            agentId: 'AGENT_6'
          });
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Routing audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ Routing audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Integration Audit (AGENT_38)
   * Checks for: API endpoint availability, WebSocket health
   * Target: <200ms
   */
  private static async auditIntegrations(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      // Map pages to their required API endpoints
      const pageApiMap: Record<string, string[]> = {
        'profile-page': ['/api/user/profile'],
        'events-page': ['/api/events'],
        'search-page': ['/api/search'],
        'messages-page': ['/api/messages'],
      };

      const requiredApis = pageApiMap[pageId] || [];

      // Check 1: Verify API endpoints are available
      for (const endpoint of requiredApis) {
        try {
          const url = `http://localhost:5000${endpoint}`;
          const response = await axios.get(url, { 
            timeout: 1000,
            validateStatus: () => true // Accept any status
          });

          if (response.status >= 500) {
            issues.push({
              category: 'integration',
              severity: 'critical',
              description: `API endpoint ${endpoint} returning ${response.status} error`,
              location: `${pageId} - ${endpoint}`,
              suggestedFix: 'Check server logs and fix backend error',
              agentId: 'AGENT_38'
            });
          } else if (response.status === 404) {
            issues.push({
              category: 'integration',
              severity: 'high',
              description: `API endpoint ${endpoint} not found (404)`,
              location: `${pageId} - ${endpoint}`,
              suggestedFix: 'Verify endpoint exists in routes or update frontend to use correct endpoint',
              agentId: 'AGENT_38'
            });
          }
        } catch (error: any) {
          if (error.code === 'ECONNREFUSED') {
            issues.push({
              category: 'integration',
              severity: 'critical',
              description: `Cannot connect to API endpoint ${endpoint}`,
              location: `${pageId} - ${endpoint}`,
              suggestedFix: 'Ensure backend server is running',
              agentId: 'AGENT_38'
            });
          } else if (error.code === 'ETIMEDOUT') {
            issues.push({
              category: 'integration',
              severity: 'high',
              description: `API endpoint ${endpoint} timed out`,
              location: `${pageId} - ${endpoint}`,
              suggestedFix: 'Optimize endpoint performance or increase timeout',
              agentId: 'AGENT_38'
            });
          }
        }
      }

      // Check 2: WebSocket health (for real-time pages)
      const wsPages = ['messages-page', 'notifications-page', 'mr-blue-page'];
      if (wsPages.includes(pageId)) {
        // Note: Actual WebSocket testing would require ws library
        // For now, we'll just flag as a check needed
        issues.push({
          category: 'integration',
          severity: 'low',
          description: 'WebSocket connection health check needed',
          location: `${pageId} - WebSocket`,
          suggestedFix: 'Implement WebSocket health monitoring',
          agentId: 'AGENT_38'
        });
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Integration audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ Integration audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Performance Audit (AGENT_52)
   * Checks for: load times, bundle sizes, render performance
   * Target: <200ms
   */
  private static async auditPerformance(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      const pageHtml = await this.getPageHtml(pageId);
      
      if (!pageHtml) {
        return issues;
      }

      const $ = cheerio.load(pageHtml);

      // Check 1: Large image elements without lazy loading
      $('img').each((i, element) => {
        const $el = $(element);
        const loading = $el.attr('loading');
        const src = $el.attr('src');
        
        if (!loading && src && !src.includes('data:image')) {
          issues.push({
            category: 'performance',
            severity: 'medium',
            description: 'Image missing lazy loading attribute',
            location: `${pageId} - img[src="${src?.substring(0, 50)}"]`,
            suggestedFix: 'Add loading="lazy" attribute to images',
            agentId: 'AGENT_52'
          });
        }
      });

      // Check 2: Excessive DOM elements
      const totalElements = $('*').length;
      if (totalElements > 1500) {
        issues.push({
          category: 'performance',
          severity: 'high',
          description: `Page has ${totalElements} DOM elements (recommended < 1500)`,
          location: pageId,
          suggestedFix: 'Reduce DOM complexity, use virtualization for long lists',
          agentId: 'AGENT_52'
        });
      }

      // Check 3: Missing viewport meta tag
      if ($('meta[name="viewport"]').length === 0) {
        issues.push({
          category: 'performance',
          severity: 'medium',
          description: 'Missing viewport meta tag',
          location: pageId,
          suggestedFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          agentId: 'AGENT_52'
        });
      }

      // Check 4: Inline styles (anti-pattern for performance)
      const elementsWithInlineStyles = $('[style]').length;
      if (elementsWithInlineStyles > 10) {
        issues.push({
          category: 'performance',
          severity: 'low',
          description: `Found ${elementsWithInlineStyles} elements with inline styles`,
          location: pageId,
          suggestedFix: 'Move inline styles to CSS classes for better caching',
          agentId: 'AGENT_52'
        });
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Performance audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ Performance audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Accessibility Audit (AGENT_53)
   * Checks for: ARIA labels, keyboard nav, alt text
   * Target: <200ms
   */
  private static async auditAccessibility(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      const pageHtml = await this.getPageHtml(pageId);
      
      if (!pageHtml) {
        return issues;
      }

      const $ = cheerio.load(pageHtml);

      // Check 1: Images missing alt text
      $('img').each((i, element) => {
        const $el = $(element);
        const alt = $el.attr('alt');
        const src = $el.attr('src');
        
        if (!alt && src && !src.includes('data:image')) {
          issues.push({
            category: 'accessibility',
            severity: 'high',
            description: 'Image missing alt text',
            location: `${pageId} - img[src="${src?.substring(0, 50)}"]`,
            suggestedFix: 'Add descriptive alt text for screen readers',
            agentId: 'AGENT_53'
          });
        }
      });

      // Check 2: Buttons without aria-label
      $('button').each((i, element) => {
        const $el = $(element);
        const ariaLabel = $el.attr('aria-label');
        const text = $el.text().trim();
        
        if (!ariaLabel && !text) {
          issues.push({
            category: 'accessibility',
            severity: 'critical',
            description: 'Button has no text or aria-label (screen readers cannot identify)',
            location: `${pageId} - button`,
            suggestedFix: 'Add aria-label or visible text to button',
            agentId: 'AGENT_53'
          });
        }
      });

      // Check 3: Form inputs without labels
      $('input, select, textarea').each((i, element) => {
        const $el = $(element);
        const id = $el.attr('id');
        const ariaLabel = $el.attr('aria-label');
        const ariaLabelledby = $el.attr('aria-labelledby');
        
        if (id && !ariaLabel && !ariaLabelledby) {
          const hasLabel = $(`label[for="${id}"]`).length > 0;
          
          if (!hasLabel) {
            issues.push({
              category: 'accessibility',
              severity: 'high',
              description: 'Form input missing associated label',
              location: `${pageId} - ${element.tagName}#${id}`,
              suggestedFix: 'Add <label for="..."> or aria-label attribute',
              agentId: 'AGENT_53'
            });
          }
        }
      });

      // Check 4: Missing page title
      if ($('title').length === 0) {
        issues.push({
          category: 'accessibility',
          severity: 'high',
          description: 'Page missing <title> element',
          location: pageId,
          suggestedFix: 'Add descriptive <title> for screen readers and SEO',
          agentId: 'AGENT_53'
        });
      }

      // Check 5: Links without descriptive text
      $('a').each((i, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const ariaLabel = $el.attr('aria-label');
        
        if (!text && !ariaLabel) {
          issues.push({
            category: 'accessibility',
            severity: 'high',
            description: 'Link has no text or aria-label',
            location: `${pageId} - a[href="${$el.attr('href')}"]`,
            suggestedFix: 'Add descriptive text or aria-label to link',
            agentId: 'AGENT_53'
          });
        } else if (text && (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more')) {
          issues.push({
            category: 'accessibility',
            severity: 'low',
            description: `Non-descriptive link text: "${text}"`,
            location: `${pageId} - a`,
            suggestedFix: 'Use more descriptive link text that explains destination',
            agentId: 'AGENT_53'
          });
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Accessibility audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ Accessibility audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Security Audit (AGENT_1)
   * Checks for: XSS, CSRF, exposed secrets
   * Target: <200ms
   */
  private static async auditSecurity(pageId: string): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const startTime = Date.now();

    try {
      const pageHtml = await this.getPageHtml(pageId);
      
      if (!pageHtml) {
        return issues;
      }

      const $ = cheerio.load(pageHtml);

      // Check 1: Inline JavaScript (potential XSS vector)
      $('script').each((i, element) => {
        const $el = $(element);
        const src = $el.attr('src');
        const content = $el.html();
        
        if (!src && content) {
          issues.push({
            category: 'security',
            severity: 'medium',
            description: 'Inline JavaScript found (potential XSS risk)',
            location: `${pageId} - inline <script>`,
            suggestedFix: 'Move JavaScript to external file and use CSP',
            agentId: 'AGENT_1'
          });
        }
      });

      // Check 2: Forms missing CSRF protection
      $('form').each((i, element) => {
        const $el = $(element);
        const method = $el.attr('method')?.toUpperCase();
        const hasCsrfToken = $el.find('input[name="_csrf"]').length > 0 || 
                             $el.find('input[name="csrf_token"]').length > 0;
        
        if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && !hasCsrfToken) {
          issues.push({
            category: 'security',
            severity: 'critical',
            description: 'Form missing CSRF token',
            location: `${pageId} - form[method="${method}"]`,
            suggestedFix: 'Add CSRF token hidden input to form',
            agentId: 'AGENT_1'
          });
        }
      });

      // Check 3: Dangerous attributes (potential XSS)
      $('[onclick], [onload], [onerror]').each((i, element) => {
        const tagName = element.tagName;
        issues.push({
          category: 'security',
          severity: 'high',
          description: `Dangerous inline event handler found on ${tagName}`,
          location: `${pageId} - ${tagName}`,
          suggestedFix: 'Remove inline event handlers, use addEventListener instead',
          agentId: 'AGENT_1'
        });
      });

      // Check 4: Exposed API keys or secrets in HTML
      const htmlContent = $.html();
      const apiKeyPatterns = [
        /api[_-]?key["']?\s*[:=]\s*["']([a-zA-Z0-9_-]{20,})/gi,
        /secret["']?\s*[:=]\s*["']([a-zA-Z0-9_-]{20,})/gi,
        /token["']?\s*[:=]\s*["']([a-zA-Z0-9_-]{20,})/gi,
      ];

      apiKeyPatterns.forEach(pattern => {
        const matches = htmlContent.match(pattern);
        if (matches) {
          issues.push({
            category: 'security',
            severity: 'critical',
            description: 'Potential API key or secret exposed in HTML',
            location: pageId,
            suggestedFix: 'Move secrets to environment variables on server-side',
            agentId: 'AGENT_1'
          });
        }
      });

      // Check 5: Mixed content (HTTP resources on HTTPS page)
      $('img, script, link').each((i, element) => {
        const $el = $(element);
        const src = $el.attr('src') || $el.attr('href');
        
        if (src && src.startsWith('http://')) {
          issues.push({
            category: 'security',
            severity: 'medium',
            description: 'Insecure HTTP resource on HTTPS page (mixed content)',
            location: `${pageId} - ${element.tagName}[src="${src.substring(0, 50)}"]`,
            suggestedFix: 'Use HTTPS URLs for all external resources',
            agentId: 'AGENT_1'
          });
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Security audit complete for ${pageId}: ${issues.length} issues found in ${duration}ms`);

      return issues;
    } catch (error) {
      console.error(`❌ Security audit failed for ${pageId}:`, error);
      return issues;
    }
  }

  /**
   * Save audit results to database
   * Gracefully skips saving if page not registered (prevents FK constraint violation)
   */
  private static async saveAudit(results: AuditResults): Promise<void> {
    try {
      // Check if page is registered before saving (prevents FK constraint violation)
      const { pageAgentRegistry } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [pageReg] = await db
        .select()
        .from(pageAgentRegistry)
        .where(eq(pageAgentRegistry.pageId, results.pageId));

      if (!pageReg) {
        console.log(`⚠️ Skipping audit save for ${results.pageId} - page not registered yet`);
        return;
      }

      const auditData: InsertPageAudit = {
        pageId: results.pageId,
        totalIssues: results.totalIssues,
        criticalIssues: results.criticalIssues,
        uiUxIssues: results.issuesByCategory.ui_ux.length,
        routingIssues: results.issuesByCategory.routing.length,
        integrationIssues: results.issuesByCategory.integration.length,
        performanceIssues: results.issuesByCategory.performance.length,
        accessibilityIssues: results.issuesByCategory.accessibility.length,
        securityIssues: results.issuesByCategory.security.length,
        issuesByCategory: results.issuesByCategory,
        auditResults: results,
        auditorAgents: results.auditorAgents,
        auditDurationMs: results.auditDurationMs,
        hasIssues: results.hasIssues,
        healingRequired: results.totalIssues > 0,
        healingApplied: false
      };

      const [insertedAudit] = await db.insert(pageAudits).values(auditData).returning();
      console.log(`✅ Audit saved for ${results.pageId}`);

      // FEP: Update agent beliefs and track prediction errors
      await this.updateFEPBeliefs(results, insertedAudit.id);
    } catch (error) {
      console.error(`❌ Failed to save audit for ${results.pageId}:`, error);
      // Don't throw - allow orchestration to continue even if audit save fails
    }
  }

  /**
   * FEP: Update agent beliefs based on new observations (Bayesian inference)
   * MB.MD v9.2 Pattern 27: Free Energy Principle
   */
  private static async updateFEPBeliefs(results: AuditResults, auditId: number): Promise<void> {
    try {
      // Update beliefs for each auditor agent
      for (const agentId of results.auditorAgents) {
        // Get agent's prior beliefs
        const [priorBelief] = await db
          .select()
          .from(agentBeliefs)
          .where(
            and(
              eq(agentBeliefs.agentId, agentId),
              eq(agentBeliefs.pageId, results.pageId)
            )
          );

        const actualIssueCount = results.totalIssues;

        if (priorBelief) {
          // BAYESIAN UPDATE: posterior = (prior × likelihood) / evidence
          const prior = priorBelief.expectedIssueCount;
          const confidence = priorBelief.confidence;
          
          // Weighted average (simple Bayesian approximation)
          const posterior = (prior * confidence + actualIssueCount * (1 - confidence)) / 
                            (confidence + (1 - confidence));
          
          // Increase confidence (we learned something)
          const newConfidence = Math.min(confidence + 0.1, 0.95);

          // Prediction error (surprise)
          const predictionError = Math.abs(actualIssueCount - prior);
          const surpriseScore = Math.min(predictionError / 10, 1.0); // Normalize to 0-1

          // Update beliefs
          await db
            .update(agentBeliefs)
            .set({
              expectedIssueCount: posterior,
              confidence: newConfidence,
              lastObservation: results,
              lastObservedIssueCount: actualIssueCount,
              predictionError,
              observationCount: priorBelief.observationCount + 1,
              lastUpdated: new Date()
            })
            .where(eq(agentBeliefs.id, priorBelief.id));

          // Track prediction error for learning
          await db.insert(predictionErrors).values({
            pageId: results.pageId,
            agentId,
            predicted: prior,
            actual: actualIssueCount,
            error: predictionError,
            surpriseScore,
            predictionType: 'issue_count',
            auditId,
            beliefUpdated: true,
            actionTaken: predictionError > 0.5 ? 'high_priority_healing' : 'standard_healing'
          });

          console.log(`🧠 FEP: ${agentId} beliefs updated - Expected: ${prior.toFixed(2)} → ${posterior.toFixed(2)}, Surprise: ${surpriseScore.toFixed(3)}`);
        } else {
          // Initialize new belief for this agent/page combination
          await db.insert(agentBeliefs).values({
            agentId,
            pageId: results.pageId,
            expectedIssueCount: actualIssueCount,
            confidence: 0.3, // Start with low confidence
            lastObservation: results,
            lastObservedIssueCount: actualIssueCount,
            predictionError: 0,
            observationCount: 1
          });

          console.log(`🧠 FEP: Initialized beliefs for ${agentId} on ${results.pageId}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to update FEP beliefs:', error);
      // Don't throw - FEP is enhancement, not critical path
    }
  }

  /**
   * FEP: Calculate surprise score (prediction error magnitude)
   * MB.MD v9.2 Pattern 27: High surprise = high information value
   */
  static async calculateSurpriseScore(
    pageId: string,
    agentId: string,
    actualValue: number
  ): Promise<number> {
    try {
      const [belief] = await db
        .select()
        .from(agentBeliefs)
        .where(
          and(
            eq(agentBeliefs.agentId, agentId),
            eq(agentBeliefs.pageId, pageId)
          )
        );

      if (!belief) {
        return 0.5; // Medium surprise for unknown pages
      }

      // Prediction error = |actual - predicted|
      const predictionError = Math.abs(actualValue - belief.expectedIssueCount);
      
      // Normalize to 0-1 (assume max 10 issues)
      const surpriseScore = Math.min(predictionError / 10, 1.0);

      return surpriseScore;
    } catch (error) {
      console.error('❌ Failed to calculate surprise score:', error);
      return 0.5; // Default medium surprise
    }
  }

  /**
   * FEP: Prioritize issues by surprise + severity
   * MB.MD v9.2 Pattern 27: Fix surprising issues first (high information value)
   */
  static async prioritizeIssues(issues: AuditIssue[], pageId: string): Promise<AuditIssue[]> {
    try {
      // Calculate surprise score for each issue
      const issuesWithSurprise = await Promise.all(
        issues.map(async (issue) => {
          const surpriseScore = await this.calculateSurpriseScore(
            pageId,
            issue.agentId,
            1 // Single issue
          );

          return {
            ...issue,
            surpriseScore,
            priorityScore: 
              (issue.severity === 'critical' ? 1.0 : 
               issue.severity === 'high' ? 0.7 : 
               issue.severity === 'medium' ? 0.4 : 0.2) * 0.6 + // Severity weight
              surpriseScore * 0.4 // Surprise weight
          };
        })
      );

      // Sort by priority score (highest first)
      return issuesWithSurprise.sort((a, b) => 
        (b.priorityScore || 0) - (a.priorityScore || 0)
      );
    } catch (error) {
      console.error('❌ Failed to prioritize issues:', error);
      return issues; // Return original order on error
    }
  }

  /**
   * FEP: Get agent's current beliefs about a page
   */
  static async getAgentBeliefs(pageId: string, agentId: string): Promise<SelectAgentBeliefs | null> {
    try {
      const [belief] = await db
        .select()
        .from(agentBeliefs)
        .where(
          and(
            eq(agentBeliefs.agentId, agentId),
            eq(agentBeliefs.pageId, pageId)
          )
        );

      return belief || null;
    } catch (error) {
      console.error('❌ Failed to get agent beliefs:', error);
      return null;
    }
  }

  /**
   * FEP: Get recent prediction errors for learning
   */
  static async getRecentPredictionErrors(pageId: string, limit: number = 10) {
    try {
      return await db
        .select()
        .from(predictionErrors)
        .where(eq(predictionErrors.pageId, pageId))
        .orderBy(desc(predictionErrors.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('❌ Failed to get prediction errors:', error);
      return [];
    }
  }
}
