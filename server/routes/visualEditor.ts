/**
 * Visual Editor API Routes
 * Endpoints for Figma-like visual editing with AI code generation
 */

import { Router, type Request, Response } from "express";
import { aiCodeGenerator } from "../services/aiCodeGenerator";
import { gitService } from "../services/gitService";
import { traceRoute } from "../metrics/tracing";
import { GroqService, GROQ_MODELS } from "../services/ai/GroqService";
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
router.post("/generate", traceRoute("visual-editor-generate"), async (req: Request, res: Response) => {
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

// Apply instant change (for live preview)
router.post("/apply-change", traceRoute("visual-editor-apply-change"), async (req: Request, res: Response) => {
  try {
    const { change, pagePath } = req.body;

    if (!change) {
      return res.status(400).json({
        success: false,
        message: 'Change object is required'
      });
    }

    // This endpoint just validates the change
    // Actual DOM update happens in iframe via postMessage
    res.json({
      success: true,
      message: 'Change validated',
      change
    });
  } catch (error: any) {
    console.error('[VisualEditor] Apply change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply change'
    });
  }
});

// Undo last change
router.post("/undo", async (req: Request, res: Response) => {
  try {
    // Undo is handled client-side in iframe
    // This endpoint just acknowledges the request
    res.json({
      success: true,
      message: 'Undo triggered'
    });
  } catch (error: any) {
    console.error('[VisualEditor] Undo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to undo'
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

    // Get file path
    const filePath = mapPagePathToFile(pagePath || '/');
    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Page file not found'
      });
    }

    // Read current file content
    const currentCode = await gitService.getFileContent(filePath);
    if (!currentCode) {
      return res.status(404).json({
        success: false,
        message: 'Failed to read current file'
      });
    }

    // Generate updated code using AI
    const editDescriptions = edits.map((e: any) => e.description).join('\n');
    const prompt = `Apply these visual edits to the code:\n\n${editDescriptions}`;

    const aiResult = await aiCodeGenerator.generateCode({
      prompt,
      pagePath: pagePath || '/',
      currentCode,
      componentId: undefined,
      changeType: 'full'
    });

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: aiResult.error || 'Failed to generate updated code'
      });
    }

    // Create commit message
    const commitMessage = `Visual Editor: ${edits.length} changes to ${pagePath || 'homepage'}\n\n${edits.map((e: any, i: number) => `${i + 1}. ${e.description}`).join('\n')}`;

    // Save to Git with updated code
    const result = await gitService.commitChanges({
      filePath,
      content: aiResult.code || currentCode,
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
      branch: result.branchName,
      message: 'Changes committed successfully. Code updated and saved.',
      editsApplied: edits.length
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

// AI-Powered Smart Suggestions
router.post("/suggestions", traceRoute("visual-editor-suggestions"), async (req: Request, res: Response) => {
  try {
    const { pageHtml, selectedElement, currentStyles, pagePath } = req.body;

    if (!pageHtml) {
      return res.status(400).json({
        success: false,
        message: 'Page HTML is required'
      });
    }

    console.log('[VisualEditor] Generating AI suggestions for page:', pagePath || 'unknown');

    // Build the analysis prompt
    const systemPrompt = `You are a UI/UX expert specializing in web accessibility, design systems, and modern web best practices.

Your role is to analyze HTML/React pages and provide specific, actionable improvement suggestions.

Focus areas:
1. **Accessibility (WCAG 2.1 AA)**:
   - Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
   - ARIA labels and semantic HTML
   - Keyboard navigation
   - Screen reader compatibility

2. **Design System Compliance**:
   - MT Ocean Theme adherence (Turquoise #40E0D0, Dodger Blue #1E90FF, Cobalt Blue #0047AB)
   - Consistent spacing (4px system)
   - Typography hierarchy
   - Component usage (shadcn/ui)

3. **UX Best Practices**:
   - Button sizing (min 44px touch targets)
   - Form validation and error messages
   - Loading states and feedback
   - Mobile responsiveness

4. **Performance**:
   - Image optimization
   - Unused CSS/JS
   - Large bundle sizes
   - Slow render times

5. **Responsive Design**:
   - Mobile-first approach
   - Breakpoint consistency
   - Touch-friendly interfaces

Return suggestions as a valid JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "category": "accessibility" | "ux" | "design" | "performance" | "responsive",
    "severity": "critical" | "warning" | "suggestion" | "info",
    "title": "Short descriptive title (max 50 chars)",
    "message": "Clear explanation of the issue",
    "fix": "Step-by-step how to fix it",
    "selector": "CSS selector for the affected element (if applicable)",
    "automated": true | false,
    "changes": { "property": "value" } (if automated is true)
  }
]

Rules:
- Return 5-10 suggestions maximum
- Prioritize critical issues first
- Only mark as "automated: true" if it's a simple CSS change
- Be specific with selectors
- Focus on actionable improvements
- Return ONLY valid JSON, no explanations before or after`;

    const userPrompt = `Analyze this page and provide UI/UX improvement suggestions:

Page HTML:
\`\`\`html
${pageHtml.substring(0, 8000)}
\`\`\`

${selectedElement ? `Selected Element:
Tag: ${selectedElement.tagName}
ID: ${selectedElement.id || 'none'}
Classes: ${selectedElement.className || 'none'}
Text: ${selectedElement.textContent?.substring(0, 100) || 'none'}
` : ''}

${currentStyles ? `Current Styles:
${JSON.stringify(currentStyles, null, 2)}
` : ''}

Page Path: ${pagePath || '/'}

Provide 5-10 specific improvement suggestions in JSON format.`;

    // Query Groq Llama-3.3-70b for analysis
    const groqResponse = await GroqService.query({
      prompt: userPrompt,
      model: GROQ_MODELS.LLAMA_70B_LATEST,
      systemPrompt,
      temperature: 0.3, // Lower temperature for consistent, focused analysis
      maxTokens: 2000,
      waitForRateLimit: true
    });

    // Parse AI response
    let suggestions = [];
    try {
      // Extract JSON from response (might be wrapped in markdown)
      const jsonMatch = groqResponse.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the full response
        suggestions = JSON.parse(groqResponse.content);
      }
    } catch (parseError) {
      console.error('[VisualEditor] Failed to parse AI suggestions:', parseError);
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid suggestions format',
        rawResponse: groqResponse.content
      });
    }

    // Validate and sanitize suggestions
    const validSuggestions = suggestions
      .filter((s: any) => s.id && s.category && s.severity && s.title && s.message)
      .slice(0, 10); // Max 10 suggestions

    // Calculate summary statistics
    const summary = {
      total: validSuggestions.length,
      critical: validSuggestions.filter((s: any) => s.severity === 'critical').length,
      warnings: validSuggestions.filter((s: any) => s.severity === 'warning').length,
      suggestions: validSuggestions.filter((s: any) => s.severity === 'suggestion').length,
      automated: validSuggestions.filter((s: any) => s.automated).length
    };

    // Calculate page quality score (0-100)
    const pageScore = Math.max(0, 100 - (
      (summary.critical * 15) +
      (summary.warnings * 5) +
      (summary.suggestions * 2)
    ));

    const report = {
      suggestions: validSuggestions,
      summary,
      pageScore,
      generatedAt: Date.now(),
      model: groqResponse.model,
      analysisSpeed: groqResponse.speed
    };

    console.log(
      `[VisualEditor] ✅ Generated ${validSuggestions.length} suggestions | ` +
      `Critical: ${summary.critical}, Warnings: ${summary.warnings} | ` +
      `Score: ${pageScore}/100 | ` +
      `${groqResponse.speed.latencyMs}ms`
    );

    res.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error('[VisualEditor] Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate suggestions'
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
