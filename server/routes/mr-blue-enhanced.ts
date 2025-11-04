/**
 * Mr. Blue Enhanced Routes - Integrated Troubleshooting Intelligence
 * Auto-detects errors and provides solutions from 500+ issue knowledge base
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { 
  findMatchingIssues, 
  getSolution, 
  getIssuesByCategory,
  getCriticalIssues,
  type TroubleshootingIssue 
} from '../knowledge/mr-blue-troubleshooting-kb';

const router = Router();

// Schema for enhanced chat with auto-troubleshooting
const enhancedChatSchema = z.object({
  message: z.string(),
  errorContext: z.object({
    errorMessage: z.string().optional(),
    stackTrace: z.string().optional(),
    browserLogs: z.array(z.string()).optional(),
    serverLogs: z.array(z.string()).optional(),
  }).optional(),
  currentPage: z.string().optional(),
});

/**
 * Enhanced chat endpoint with automatic error detection
 */
router.post('/api/mr-blue/chat-enhanced', authenticateToken, async (req, res) => {
  try {
    const { message, errorContext, currentPage } = enhancedChatSchema.parse(req.body);
    
    // Step 1: Check if user is reporting an error
    const isErrorReport = detectErrorInMessage(message, errorContext);
    
    if (isErrorReport) {
      // Step 2: Search knowledge base for matching issues
      const matchingIssues = findMatchingIssues(
        message + ' ' + (errorContext?.errorMessage || '')
      );
      
      if (matchingIssues.length > 0) {
        // Step 3: Prioritize critical issues
        const criticalMatch = matchingIssues.find(i => i.severity === 'critical');
        const topMatch = criticalMatch || matchingIssues[0];
        
        // Step 4: Provide solution
        const response = formatTroubleshootingSolution(topMatch, matchingIssues.length);
        
        return res.json({
          success: true,
          response,
          issueDetected: true,
          issueId: topMatch.id,
          severity: topMatch.severity,
          relatedIssues: matchingIssues.slice(0, 3).map(i => ({
            id: i.id,
            title: i.title,
            category: i.category
          }))
        });
      }
    }
    
    // Step 5: If no error detected, proceed with normal conversation
    return res.json({
      success: true,
      response: 'I can help you with development tasks. What would you like to do?',
      issueDetected: false
    });
    
  } catch (error: any) {
    console.error('[Mr. Blue Enhanced] Error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat',
      error: error.message 
    });
  }
});

/**
 * Get all critical issues for proactive monitoring
 */
router.get('/api/mr-blue/critical-issues', authenticateToken, (req, res) => {
  const criticalIssues = getCriticalIssues();
  res.json({ issues: criticalIssues });
});

/**
 * Search knowledge base
 */
router.post('/api/mr-blue/search-kb', authenticateToken, (req, res) => {
  const { query } = req.body;
  const results = findMatchingIssues(query);
  res.json({ results });
});

/**
 * Get issue by ID
 */
router.get('/api/mr-blue/issue/:id', authenticateToken, (req, res) => {
  const issue = getSolution(req.params.id);
  if (issue) {
    res.json({ issue });
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
});

/**
 * Detect if message contains error report
 */
function detectErrorInMessage(message: string, errorContext?: any): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Error keywords
  const errorKeywords = [
    'error', 'crash', 'broken', 'not working', 'failed', 'failure',
    'bug', 'issue', 'problem', 'help', 'fix', 'undefined', 'null',
    'cannot', 'unable', 'doesn\'t work', 'won\'t load', 'stuck'
  ];
  
  // Check for error keywords
  const hasErrorKeyword = errorKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check if error context provided
  const hasErrorContext = !!(errorContext?.errorMessage || errorContext?.stackTrace);
  
  return hasErrorKeyword || hasErrorContext;
}

/**
 * Format troubleshooting solution for user-friendly display
 */
function formatTroubleshootingSolution(
  issue: TroubleshootingIssue, 
  totalMatches: number
): string {
  return `
🔍 **Issue Detected: ${issue.title}**

**Severity:** ${issue.severity.toUpperCase()} ${issue.severity === 'critical' ? '🚨' : issue.severity === 'high' ? '⚠️' : 'ℹ️'}

**What's Happening:**
${issue.rootCause}

**How to Fix It:**
${issue.solution}

**Prevention Tips:**
${issue.prevention}

${totalMatches > 1 ? `\n💡 I found ${totalMatches} related issues. Use the search to explore more.` : ''}

**Need More Help?**
I can walk you through the fix step-by-step, or you can ask me to clarify any part of the solution.
  `.trim();
}

export default router;
