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
import { legalOrchestrator } from '../services/legal/LegalOrchestrator';
import { ElevenLabsVoiceService } from '../services/premium/elevenlabsVoiceService';

const router = Router();
const elevenlabsService = new ElevenLabsVoiceService();

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
 * Context-aware chat endpoint for Mr. Blue interactions
 * Now supports ElevenLabs TTS for human-sounding voice responses
 */
router.post('/api/mrblue/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context, voiceEnabled, selectedVoiceId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Build context-aware system message
    let systemMessage = 'You are Mr. Blue, the tango community AI assistant.';
    
    if (context) {
      const { currentPage, pageTitle, breadcrumbs, userIntent } = context;
      
      // Add page context
      if (currentPage) {
        systemMessage += `\n\nCurrent Page: ${currentPage}`;
      }
      
      if (pageTitle) {
        systemMessage += `\nPage Title: ${pageTitle}`;
      }
      
      // Add user intent
      if (userIntent) {
        systemMessage += `\n\nUser Intent: ${userIntent}`;
      }
      
      // Add recent user actions
      if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
        systemMessage += '\n\nRecent User Actions:';
        breadcrumbs.slice(-5).forEach((b: any) => {
          const target = b.target ? ` (${b.target})` : '';
          systemMessage += `\n- ${b.action} on ${b.page}${target}`;
        });
      }
      
      systemMessage += '\n\nProvide context-aware assistance based on what the user is currently doing.';
    }
    
    // Generate context-aware response based on page and intent
    let responseContent = '';
    
    if (context?.currentPage?.includes('/events')) {
      responseContent = `I see you're viewing events! ${message.toLowerCase().includes('help') ? 'I can help you find milongas, festivals, and workshops. Would you like me to show you upcoming events in your area, or help you search for specific types of tango events?' : 'What would you like to know about the events?'}`;
    } else if (context?.currentPage?.includes('/profile')) {
      responseContent = `I notice you're on a profile page. ${message.toLowerCase().includes('help') ? 'I can help you edit your profile, manage your tango preferences, or explain any profile features. What would you like to do?' : 'How can I assist you with profiles?'}`;
    } else if (context?.currentPage?.includes('/messages')) {
      responseContent = `I see you're in the messages section. ${message.toLowerCase().includes('help') ? 'I can help you send messages, manage conversations, or explain messaging features. What do you need?' : 'What can I help you with regarding messages?'}`;
    } else if (context?.currentPage?.includes('/groups')) {
      responseContent = `You're exploring groups! ${message.toLowerCase().includes('help') ? 'I can help you find tango groups, join communities, or create your own group. What interests you?' : 'What would you like to know about groups?'}`;
    } else if (context?.currentPage?.includes('/housing')) {
      responseContent = `I see you're looking at housing options. ${message.toLowerCase().includes('help') ? 'I can help you find accommodation for tango festivals, connect with hosts, or list your own space. What are you looking for?' : 'How can I assist with housing?'}`;
    } else if (context?.currentPage?.includes('/marketplace')) {
      responseContent = `You're browsing the marketplace! ${message.toLowerCase().includes('help') ? 'I can help you find tango shoes, clothing, music, or other items. What are you shopping for?' : 'What interests you in the marketplace?'}`;
    } else if (context?.userIntent === 'exploring the platform') {
      responseContent = `I notice you're exploring the platform. ${message.toLowerCase().includes('help') ? 'I can give you a tour of the features, explain how things work, or help you find specific content. What would you like to know?' : 'What would you like to discover?'}`;
    } else {
      // Default response
      responseContent = `I'm Mr. Blue, your AI companion for the tango community. ${message.toLowerCase().includes('help') ? 'I can help you navigate the platform, find events, connect with dancers, and much more. What are you interested in?' : `You asked: "${message}". How can I help you today?`}`;
    }
    
    const response = {
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      contextUsed: !!context,
      audioUrl: null as string | null,
      characterCount: responseContent.length,
    };
    
    // If voice is enabled, convert response to speech using ElevenLabs
    if (voiceEnabled) {
      try {
        console.log('[Mr. Blue] Generating TTS with ElevenLabs...');
        const voiceId = selectedVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Default: Rachel
        
        const voiceResult = await elevenlabsService.textToSpeech(
          responseContent,
          voiceId,
          userId
        );
        
        response.audioUrl = voiceResult.audioUrl;
        response.characterCount = voiceResult.characterCount;
        
        console.log(`[Mr. Blue] TTS generated: ${voiceResult.characterCount} characters`);
      } catch (error: any) {
        console.error('[Mr. Blue] TTS error:', error);
        // Graceful fallback - return text-only response if TTS fails
        console.log('[Mr. Blue] Continuing with text-only response');
      }
    }
    
    res.json(response);
  } catch (error: any) {
    console.error('[Mr. Blue Chat] Error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * Enhanced chat endpoint with automatic error detection and legal intelligence
 */
router.post('/api/mr-blue/chat-enhanced', authenticateToken, async (req, res) => {
  try {
    const { message, errorContext, currentPage } = enhancedChatSchema.parse(req.body);
    
    // Step 1: Check for legal queries (Agents #185-186)
    const legalQuery = detectLegalQuery(message);
    
    if (legalQuery.isLegal) {
      const legalResponse = await handleLegalQuery(
        message, 
        legalQuery.queryType,
        (req as any).user?.id
      );
      
      return res.json({
        success: true,
        response: legalResponse,
        queryType: 'legal',
        legalAgentUsed: legalQuery.agent
      });
    }
    
    // Step 2: Check if user is reporting an error
    const isErrorReport = detectErrorInMessage(message, errorContext);
    
    if (isErrorReport) {
      // Step 3: Search knowledge base for matching issues
      const matchingIssues = findMatchingIssues(
        message + ' ' + (errorContext?.errorMessage || '')
      );
      
      if (matchingIssues.length > 0) {
        // Step 4: Prioritize critical issues
        const criticalMatch = matchingIssues.find(i => i.severity === 'critical');
        const topMatch = criticalMatch || matchingIssues[0];
        
        // Step 5: Provide solution
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
    
    // Step 6: If no error detected, proceed with normal conversation
    return res.json({
      success: true,
      response: 'I can help you with development tasks and legal document analysis. What would you like to do?',
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

/**
 * Detect if message is a legal query (Agents #185-186)
 */
function detectLegalQuery(message: string): { isLegal: boolean; queryType?: string; agent?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Legal query keywords
  const reviewKeywords = ['review', 'analyze', 'check', 'evaluate', 'assess', 'risk', 'compliance'];
  const contractKeywords = ['contract', 'clause', 'waiver', 'agreement', 'template', 'document'];
  const complianceKeywords = ['esign', 'ueta', 'gdpr', 'ccpa', 'compliant', 'compliance', 'legal'];
  const assistKeywords = ['suggest', 'recommend', 'auto-fill', 'fill', 'compare', 'missing'];
  
  const hasReviewKeyword = reviewKeywords.some(k => lowerMessage.includes(k));
  const hasContractKeyword = contractKeywords.some(k => lowerMessage.includes(k));
  const hasComplianceKeyword = complianceKeywords.some(k => lowerMessage.includes(k));
  const hasAssistKeyword = assistKeywords.some(k => lowerMessage.includes(k));
  
  // Document Review Agent (#185)
  if ((hasReviewKeyword || hasComplianceKeyword) && hasContractKeyword) {
    return {
      isLegal: true,
      queryType: 'review',
      agent: 'document-reviewer'
    };
  }
  
  // Contract Assistant (#186)
  if (hasAssistKeyword && hasContractKeyword) {
    return {
      isLegal: true,
      queryType: 'assist',
      agent: 'contract-assistant'
    };
  }
  
  // Compliance check
  if (hasComplianceKeyword) {
    return {
      isLegal: true,
      queryType: 'compliance',
      agent: 'document-reviewer'
    };
  }
  
  return { isLegal: false };
}

/**
 * Handle legal queries with appropriate agent
 */
async function handleLegalQuery(
  message: string, 
  queryType?: string,
  userId?: number
): Promise<string> {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Review queries
    if (queryType === 'review') {
      return `🔍 **Legal Document Review (Agent #185)**

I can help you review legal documents for:
- **Clause Analysis**: Identify missing or incomplete clauses
- **Risk Assessment**: Evaluate one-sided terms and liability exposure
- **Compliance Checking**: Verify ESIGN, UETA, GDPR, CCPA compliance
- **Plain Language**: Simplify legal jargon

**To review a document:**
1. Use the API: POST /api/legal/agents/review-document
2. Provide document content or document ID
3. Get comprehensive analysis with risk scores

**Example questions I can answer:**
- "Review this waiver for risks"
- "Is this document ESIGN compliant?"
- "What clauses am I missing in this contract?"

Would you like me to review a specific document?`;
    }
    
    // Assistance queries
    if (queryType === 'assist') {
      return `🤝 **Smart Contract Assistant (Agent #186)**

I can help you with:
- **Clause Recommendations**: Context-aware suggestions for your document type
- **Auto-Fill**: Intelligently fill {{variables}} with user/event data
- **Template Comparison**: Compare two contract templates side-by-side
- **Negotiation Advice**: Identify negotiable terms and suggest compromises
- **Workflow Optimization**: Optimize signature workflows (sequential/parallel)

**Available APIs:**
- POST /api/legal/agents/assist-contract - Get clause recommendations
- POST /api/legal/agents/suggest-clauses - Suggest specific clauses
- POST /api/legal/agents/auto-fill - Auto-fill document variables
- POST /api/legal/agents/compare-documents - Compare templates

**Example requests:**
- "Suggest clauses for an event waiver"
- "Auto-fill this contract with participant data"
- "Compare template A vs template B"

What would you like help with?`;
    }
    
    // Compliance queries
    if (queryType === 'compliance') {
      return `✅ **Compliance Verification**

I can check your documents for compliance with:
- **ESIGN Act** (US Electronic Signatures)
- **UETA** (Uniform Electronic Transactions Act)
- **GDPR** (EU Data Privacy)
- **CCPA** (California Consumer Privacy Act)
- **Jurisdiction-specific** requirements

**To check compliance:**
Use POST /api/legal/agents/check-compliance with your document

**I'll provide:**
- Compliance score (0-100)
- Specific issues found
- Recommendations for compliance
- Jurisdiction-specific guidance

Would you like me to check a document's compliance?`;
    }
    
    // General legal help
    return `⚖️ **Legal Document AI Agents**

I have two specialized legal AI agents:

**Agent #185: Document Review Agent**
- Analyzes legal documents for completeness
- Checks compliance (ESIGN, UETA, GDPR, CCPA)
- Assesses risk factors
- Suggests plain language alternatives

**Agent #186: Smart Contract Assistant**
- Recommends appropriate clauses
- Auto-fills contract variables
- Provides negotiation advice
- Compares contract templates
- Optimizes signature workflows

**Available Templates:**
1. Event Liability Waiver
2. Teacher Employment Contract
3. Venue Rental Agreement
4. Participant Release Form
5. IP Agreement
6. Photo/Video Release
7. Music Licensing Agreement

**How to use:**
- "Review this waiver" → Document review
- "Suggest clauses for teacher contract" → Clause recommendations
- "Check ESIGN compliance" → Compliance verification
- "Compare these templates" → Template comparison

What legal task can I help you with?`;
    
  } catch (error) {
    console.error('[Legal Query Handler] Error:', error);
    return 'I encountered an error processing your legal query. Please try using the legal agent APIs directly.';
  }
}

export default router;
