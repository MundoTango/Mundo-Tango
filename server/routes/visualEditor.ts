/**
 * Visual Editor API Routes
 * Endpoints for Figma-like visual editing with AI code generation
 */

import { Router, type Request, Response } from "express";
import { aiCodeGenerator } from "../services/aiCodeGenerator";
import { gitService } from "../services/gitService";
import * as path from "path";

const router = Router();

// Middleware: Check super_admin role
function requireSuperAdmin(req: Request, res: Response, next: Function) {
  // @ts-ignore - req.user is added by auth middleware
  const userRole = req.user?.role;
  
  if (userRole !== 'super_admin' && userRole !== 'god') {
    return res.status(403).json({
      success: false,
      message: 'Visual Editor access requires super_admin role'
    });
  }
  
  next();
}

// Apply super_admin requirement to all routes
router.use(requireSuperAdmin);

// Get page file information
router.get("/page-info", async (req: Request, res: Response) => {
  try {
    const { pagePath } = req.query;

    if (!pagePath || typeof pagePath !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Page path is required'
      });
    }

    // Map URL path to file path
    const filePath = mapPagePathToFile(pagePath);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Page file not found'
      });
    }

    // Get file content
    const code = await gitService.getFileContent(filePath);

    if (!code) {
      return res.status(404).json({
        success: false,
        message: 'Failed to read page file'
      });
    }

    // Get commit history
    const history = await gitService.getCommitHistory(filePath, 5);
    const currentBranch = await gitService.getCurrentBranch();

    res.json({
      success: true,
      filePath,
      code,
      history,
      currentBranch
    });
  } catch (error: any) {
    console.error('[VisualEditor] Page info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get page information'
    });
  }
});

// Generate code using AI
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, pagePath, currentCode, componentId, changeType } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Generate code using OpenAI
    const result = await aiCodeGenerator.generateCode({
      prompt,
      pagePath: pagePath || '/',
      currentCode,
      componentId,
      changeType
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate code'
      });
    }

    res.json({
      success: true,
      code: result.code,
      explanation: result.explanation
    });
  } catch (error: any) {
    console.error('[VisualEditor] Generate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate code'
    });
  }
});

// Save and commit changes
router.post("/save", async (req: Request, res: Response) => {
  try {
    const { pagePath, edits, sessionId } = req.body;
    // @ts-ignore
    const userName = req.user?.name || 'Visual Editor';

    if (!edits || edits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes to save'
      });
    }

    // Create branch name
    const branchName = sessionId || `visual-edit-${Date.now()}`;

    // Get affected files from edits
    const affectedFiles = new Set<string>();
    const filePath = mapPagePathToFile(pagePath || '/');
    if (filePath) {
      affectedFiles.add(filePath);
    }

    // Create commit message
    const commitMessage = `Visual Editor: ${edits.length} changes to ${pagePath || 'homepage'}\n\n${edits.map((e: any, i: number) => `${i + 1}. ${e.description}`).join('\n')}`;

    // Save to Git (using first file as primary)
    const result = await gitService.commitChanges({
      filePath: Array.from(affectedFiles)[0] || 'client/src/pages/HomePage.tsx',
      content: '', // Content will be updated by AI
      commitMessage,
      createPR: false
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to commit changes'
      });
    }

    res.json({
      success: true,
      commitId: result.commitHash,
      branch: branchName,
      message: 'Changes committed successfully. Ready for review.'
    });
  } catch (error: any) {
    console.error('[VisualEditor] Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save changes'
    });
  }
});

// Preview changes (dry run)
router.post("/preview", async (req: Request, res: Response) => {
  try {
    const { pagePath, code } = req.body;

    if (!pagePath || !code) {
      return res.status(400).json({
        success: false,
        message: 'Page path and code are required'
      });
    }

    // Validate code (basic syntax check)
    const isValid = validateReactCode(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Generated code contains syntax errors'
      });
    }

    // Return preview URL (in development, same as current page)
    const previewUrl = pagePath;

    res.json({
      success: true,
      previewUrl,
      valid: true
    });
  } catch (error: any) {
    console.error('[VisualEditor] Preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview changes'
    });
  }
});

// Refine generated code
router.post("/refine", async (req: Request, res: Response) => {
  try {
    const { code, feedback } = req.body;

    if (!code || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Code and feedback are required'
      });
    }

    const result = await aiCodeGenerator.refineCode(code, feedback);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to refine code'
      });
    }

    res.json({
      success: true,
      code: result.code,
      explanation: result.explanation
    });
  } catch (error: any) {
    console.error('[VisualEditor] Refine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refine code'
    });
  }
});

// Explain code
router.post("/explain", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const explanation = await aiCodeGenerator.explainCode(code);

    res.json({
      success: true,
      explanation
    });
  } catch (error: any) {
    console.error('[VisualEditor] Explain error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explain code'
    });
  }
});

// Revert to previous commit
router.post("/revert", async (req: Request, res: Response) => {
  try {
    const { pagePath, commitHash } = req.body;

    if (!pagePath || !commitHash) {
      return res.status(400).json({
        success: false,
        message: 'Page path and commit hash are required'
      });
    }

    const filePath = mapPagePathToFile(pagePath);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Page file not found'
      });
    }

    const result = await gitService.revertToCommit(filePath, commitHash);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to revert changes'
      });
    }

    res.json({
      success: true,
      commitHash: result.commitHash
    });
  } catch (error: any) {
    console.error('[VisualEditor] Revert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revert changes'
    });
  }
});

// Helper: Map URL path to file path
function mapPagePathToFile(pagePath: string): string | null {
  // Remove leading slash
  const cleaned = pagePath.replace(/^\//, '');
  
  // Map common paths
  const pathMappings: Record<string, string> = {
    '': 'client/src/pages/HomePage.tsx',
    'feed': 'client/src/pages/FeedPage.tsx',
    'events': 'client/src/pages/EventsPage.tsx',
    'groups': 'client/src/pages/GroupsPage.tsx',
    'profile': 'client/src/pages/ProfilePage.tsx',
    'messages': 'client/src/pages/MessagesPage.tsx',
    'notifications': 'client/src/pages/NotificationsPage.tsx',
    'settings': 'client/src/pages/SettingsPage.tsx',
  };

  if (pathMappings[cleaned]) {
    return pathMappings[cleaned];
  }

  // Dynamic mapping for event/group pages
  if (cleaned.startsWith('events/')) {
    return 'client/src/pages/EventDetailPage.tsx';
  }

  if (cleaned.startsWith('groups/')) {
    return 'client/src/pages/GroupDetailPage.tsx';
  }

  if (cleaned.startsWith('profile/')) {
    return 'client/src/pages/UserProfilePage.tsx';
  }

  // Fallback: try to construct path
  const parts = cleaned.split('/');
  if (parts.length > 0) {
    const pageName = parts[parts.length - 1];
    const capitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    return `client/src/pages/${capitalized}Page.tsx`;
  }

  return null;
}

// Helper: Basic React code validation
function validateReactCode(code: string): boolean {
  try {
    // Basic syntax checks
    const hasImport = code.includes('import');
    const hasExport = code.includes('export') || code.includes('default');
    const hasReturn = code.includes('return');
    
    // Check for balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    const balanced = openBraces === closeBraces;

    return hasImport && hasExport && hasReturn && balanced;
  } catch (error) {
    return false;
  }
}

export default router;
