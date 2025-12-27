/**
 * MR BLUE SELF-HEALING ROUTES
 * MB.MD Pattern 53 - Self-Healing System for God-Level Users
 * 
 * Provides AI-powered error analysis using MB.MD methodology
 * for god-level users (admin, god, super_admin, founder)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// God-level roles that can access self-healing features
const GOD_LEVEL_ROLES = ['super_admin', 'admin', 'god', 'founder'];

interface SelfHealRequest {
  errorMessage: string;
  errorStack?: string;
  page: string;
  componentStack?: string;
  url: string;
  userAgent?: string;
}

interface MBMDAnalysis {
  mbmdPattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  filesAffected: string[];
  rootCause: string;
  recommendedFix: string;
  autoFixable: boolean;
  patternNumber?: number;
}

/**
 * Analyze error using MB.MD patterns
 */
function analyzeMBMDError(error: SelfHealRequest): MBMDAnalysis {
  const { errorMessage, errorStack, page, componentStack } = error;
  
  // Extract file references from stack
  const fileMatches = (errorStack || componentStack || '').match(/([a-zA-Z0-9_-]+\.(tsx?|jsx?|ts|js))(:?\d*)/g) || [];
  const filesAffected = [...new Set(fileMatches)].slice(0, 5);
  
  // Pattern matching for common error types
  let analysis: MBMDAnalysis = {
    mbmdPattern: 'Unknown Pattern',
    severity: 'medium',
    filesAffected,
    rootCause: 'Unknown root cause',
    recommendedFix: 'Investigate error stack trace',
    autoFixable: false
  };
  
  // Pattern 1: React component errors
  if (errorMessage.includes('React.Children.only') || 
      errorMessage.includes('expected to receive a single React element')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 12: React Children Wrapper',
      severity: 'low',
      rootCause: 'Component using asChild prop receives multiple children',
      recommendedFix: 'Wrap multiple children in a single Fragment or div element',
      autoFixable: true,
      patternNumber: 12
    };
  }
  
  // Pattern 2: Chunk loading / dynamic import errors
  else if (errorMessage.includes('Loading chunk') || 
           errorMessage.includes('dynamically imported module')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 38: Build Cache Mismatch',
      severity: 'high',
      rootCause: 'Stale JavaScript bundles from previous deployment',
      recommendedFix: 'Re-publish application to sync build artifacts, or hard refresh browser cache',
      autoFixable: true,
      patternNumber: 38
    };
  }
  
  // Pattern 3: Network / fetch errors
  else if (errorMessage.match(/network|fetch.*failed|CORS/i)) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 21: Network Resilience',
      severity: 'medium',
      rootCause: 'API endpoint unreachable or CORS misconfiguration',
      recommendedFix: 'Check API server status, verify CORS headers, implement retry logic',
      autoFixable: false,
      patternNumber: 21
    };
  }
  
  // Pattern 4: Type/undefined errors
  else if (errorMessage.includes('undefined') || 
           errorMessage.includes('null') ||
           errorMessage.includes('Cannot read properties')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 7: Defensive Null Checks',
      severity: 'high',
      rootCause: 'Accessing property of undefined/null object - missing null checks',
      recommendedFix: 'Add optional chaining (?.) or null checks before property access',
      autoFixable: true,
      patternNumber: 7
    };
  }
  
  // Pattern 5: PDF parsing / file processing
  else if (errorMessage.includes('PDF') || 
           errorMessage.includes('parse') ||
           page.includes('talent-match')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 53: Defensive UX / Fail-Fast Validation',
      severity: 'medium',
      rootCause: 'Silent failure in file processing - status set before validation',
      recommendedFix: 'Validate actual result before updating status, show error state to user',
      autoFixable: true,
      patternNumber: 53
    };
  }
  
  // Pattern 6: Database / storage errors
  else if (errorMessage.includes('database') || 
           errorMessage.includes('SQL') ||
           errorMessage.includes('drizzle')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 29: Database Resilience',
      severity: 'critical',
      rootCause: 'Database query failed - connection issue or schema mismatch',
      recommendedFix: 'Check database connection, verify schema matches, check for migrations',
      autoFixable: false,
      patternNumber: 29
    };
  }
  
  // Pattern 7: Authentication errors
  else if (errorMessage.includes('auth') || 
           errorMessage.includes('401') ||
           errorMessage.includes('unauthorized')) {
    analysis = {
      ...analysis,
      mbmdPattern: 'Pattern 15: Auth Session Management',
      severity: 'high',
      rootCause: 'Authentication token expired or invalid',
      recommendedFix: 'Implement token refresh, add logout handler for invalid sessions',
      autoFixable: true,
      patternNumber: 15
    };
  }
  
  console.log(`[Self-Heal] MB.MD Analysis: ${analysis.mbmdPattern}`);
  console.log(`[Self-Heal] Severity: ${analysis.severity}, AutoFixable: ${analysis.autoFixable}`);
  console.log(`[Self-Heal] Files: ${filesAffected.join(', ')}`);
  
  return analysis;
}

/**
 * POST /api/mrblue/self-heal
 * Analyze error using MB.MD patterns for god-level users
 */
router.post('/self-heal', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check god-level access
    if (!user || !GOD_LEVEL_ROLES.includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Self-healing requires god-level access' 
      });
    }
    
    const errorData: SelfHealRequest = req.body;
    
    if (!errorData.errorMessage || !errorData.page) {
      return res.status(400).json({ 
        success: false, 
        error: 'errorMessage and page are required' 
      });
    }
    
    console.log(`[Self-Heal] God-level user ${user.email} triggered self-heal on ${errorData.page}`);
    console.log(`[Self-Heal] Error: ${errorData.errorMessage.substring(0, 200)}`);
    
    // Analyze using MB.MD patterns
    const analysis = analyzeMBMDError(errorData);
    
    // Store error pattern for learning (future: LanceDB)
    console.log('[Self-Heal] Analysis complete, returning to Mr. Blue chat');
    
    res.json({
      success: true,
      analysis,
      message: `MB.MD ${analysis.mbmdPattern} detected`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[Self-Heal] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Self-heal analysis failed' 
    });
  }
});

/**
 * GET /api/mrblue/self-heal/patterns
 * List available MB.MD patterns for error detection
 */
router.get('/self-heal/patterns', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || !GOD_LEVEL_ROLES.includes(user.role)) {
    return res.status(403).json({ error: 'God-level access required' });
  }
  
  const patterns = [
    { number: 7, name: 'Defensive Null Checks', autoFixable: true },
    { number: 12, name: 'React Children Wrapper', autoFixable: true },
    { number: 15, name: 'Auth Session Management', autoFixable: true },
    { number: 21, name: 'Network Resilience', autoFixable: false },
    { number: 29, name: 'Database Resilience', autoFixable: false },
    { number: 38, name: 'Build Cache Mismatch', autoFixable: true },
    { number: 53, name: 'Defensive UX / Fail-Fast Validation', autoFixable: true },
  ];
  
  res.json({ success: true, patterns });
});

export default router;
