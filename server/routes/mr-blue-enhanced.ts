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
import { browserAutomationService } from '../services/mrBlue/BrowserAutomationService';
import { facebookMessengerService } from '../services/mrBlue/FacebookMessengerService';
import { mrBlueDataService } from '../services/mr-blue-data-service';
import { db } from '@db';
import { computerUseTasks, computerUseScreenshots } from '@shared/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';

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
 * Computer Use Intent Detection
 * Detects automation requests AND questions about Computer Use
 */
function detectComputerUseIntent(message: string): {
  isAutomation: boolean;
  type: 'wix_extraction' | 'facebook_automation' | 'info_request' | 'custom' | null;
  confidence: number;
} {
  const msg = message.toLowerCase();
  
  // General Computer Use info patterns (user asking ABOUT the feature)
  const infoPatterns = [
    /computer.*use/i,
    /use.*computer/i,  // Bidirectional: "can you use computer"
    /compute.*use/i,
    /use.*compute/i,   // Bidirectional: "can you use compute"
    /computer.*access/i,
    /access.*computer/i,  // Bidirectional
    /compute.*access/i,
    /access.*compute/i,   // Bidirectional
    /browser.*automat/i,
    /automat.*browser/i,  // Bidirectional
    /what.*automat/i,
    /can.*you.*automat/i,
    /do.*you.*have.*automat/i,
    /automation.*feature/i,
    /automation.*capabilit/i,
    /what.*can.*you.*do.*automat/i,
    /\bai.*automat/i,  // AI automation
    /automat.*\bai/i,  // automation AI
  ];
  
  for (const pattern of infoPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: 'info_request',
        confidence: 0.85
      };
    }
  }
  
  // Wix extraction patterns
  const wixPatterns = [
    /wix.*contact/i,
    /extract.*wix/i,
    /get.*wix.*data/i,
    /download.*wix.*contact/i,
    /migrate.*wix/i,
  ];
  
  for (const pattern of wixPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: 'wix_extraction',
        confidence: 0.9
      };
    }
  }
  
  // Facebook automation patterns
  const facebookPatterns = [
    /send.*fb.*invit.*to/i,
    /send.*facebook.*invit.*to/i,
    /invite.*on.*facebook/i,
    /facebook.*message.*to/i,
    /fb.*message.*to/i,
    /facebook.*automat/i,
    /automate.*facebook/i,
    /facebook.*invite/i,
    /fb.*invite/i,
  ];
  
  for (const pattern of facebookPatterns) {
    if (pattern.test(message)) {
      return {
        isAutomation: true,
        type: 'facebook_automation',
        confidence: 0.8
      };
    }
  }
  
  return {
    isAutomation: false,
    type: null,
    confidence: 0
  };
}

/**
 * Context-aware chat endpoint for Mr. Blue interactions
 * Now supports:
 * - Computer Use automation triggers
 * - ElevenLabs TTS for voice responses
 * - Context-aware assistance
 */
router.post('/api/mrblue/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context, voiceEnabled, selectedVoiceId, systemPrompt: customSystemPrompt, conversationHistory } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // MB.MD Fix: If custom systemPrompt provided (e.g., from Talent Match interview), use Groq AI
    if (customSystemPrompt && typeof customSystemPrompt === 'string') {
      console.log('[Mr. Blue] Using custom system prompt for AI response');
      console.log('[Mr. Blue] systemPrompt length:', customSystemPrompt.length, 'chars');
      console.log('[Mr. Blue] systemPrompt preview:', customSystemPrompt.substring(0, 200));
      console.log('[Mr. Blue] User message:', message);
      
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ 
          apiKey: process.env.GROQ_API_KEY || '',
          baseURL: process.env.GROQ_BASE_URL || undefined
        });
        
        // Build messages array with conversation history for continuity
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: customSystemPrompt }
        ];
        
        // Include prior conversation turns if provided
        if (Array.isArray(conversationHistory)) {
          for (const msg of conversationHistory) {
            if (msg.role && msg.content) {
              messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content || msg.message || ''
              });
            }
          }
        }
        
        // Add current user message
        messages.push({ role: 'user', content: message });
        
        const aiResponse = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 300,
          temperature: 0.7
        });
        
        const responseContent = aiResponse.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
        
        return res.json({
          response: responseContent,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          contextUsed: true,
          aiGenerated: true
        });
      } catch (aiError: any) {
        console.error('[Mr. Blue] AI generation error:', aiError);
        return res.json({
          response: 'I encountered an issue generating a response. Let me try a different approach - could you tell me more about your background?',
          role: 'assistant',
          content: 'I encountered an issue generating a response. Let me try a different approach - could you tell me more about your background?',
          timestamp: new Date().toISOString(),
          error: aiError.message
        });
      }
    }
    
    const userId = (req as any).user?.id;
    const userRoleLevel = (req as any).user?.roleLevel || 0;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // STEP 1: Check for Computer Use automation intent
    const automationIntent = detectComputerUseIntent(message);
    
    if (automationIntent.isAutomation && userRoleLevel >= 8) {
      console.log(`[Mr. Blue] Detected automation intent: ${automationIntent.type}`);
      
      if (automationIntent.type === 'wix_extraction') {
        try {
          // Check if Wix credentials are configured
          if (!process.env.WIX_EMAIL || !process.env.WIX_PASSWORD) {
            return res.json({
              role: 'assistant',
              content: "I'd love to help extract your Wix contacts, but I need WIX_EMAIL and WIX_PASSWORD configured in environment variables first. Please ask an admin to set these up.",
              timestamp: new Date().toISOString(),
              contextUsed: true,
              automationType: 'wix_extraction',
              automationStatus: 'credentials_missing'
            });
          }
          
          const taskId = `wix_extract_${nanoid(10)}`;
          
          // Create task record
          await db.insert(computerUseTasks).values({
            taskId,
            instruction: 'Extract all contacts from Wix (triggered by Mr. Blue chat)',
            status: 'running',
            steps: [],
            currentStep: 0,
            maxSteps: 20,
            requiresApproval: false,
            automationType: 'wix_extraction'
          });
          
          // Execute extraction in background
          (async () => {
            try {
              const result = await browserAutomationService.extractWixContacts(taskId);
              
              // Store screenshots
              if (result.screenshots && result.screenshots.length > 0) {
                for (const screenshot of result.screenshots) {
                  await db.insert(computerUseScreenshots).values({
                    taskId,
                    stepNumber: screenshot.step,
                    screenshotBase64: screenshot.base64,
                    action: { description: screenshot.action }
                  });
                }
              }
              
              // Update task with result
              await db.update(computerUseTasks)
                .set({
                  status: result.success ? 'completed' : 'failed',
                  currentStep: result.screenshots?.length || 0,
                  result: result.data,
                  error: result.error,
                  steps: result.screenshots?.map(s => ({
                    step: s.step,
                    action: s.action
                  })) || []
                })
                .where(eq(computerUseTasks.taskId, taskId));
              
              console.log(`[Mr. Blue] Wix extraction task ${taskId} completed:`, result.success ? 'SUCCESS' : 'FAILED');
            } catch (error: any) {
              console.error(`[Mr. Blue] Wix extraction error:`, error);
              
              await db.update(computerUseTasks)
                .set({
                  status: 'failed',
                  error: error.message
                })
                .where(eq(computerUseTasks.taskId, taskId));
            }
          })();
          
          // Return immediate response
          return res.json({
            role: 'assistant',
            content: `🚀 Starting Wix contact extraction!\n\nTask ID: ${taskId}\n\nI'm now:\n1. Logging into your Wix account\n2. Navigating to Contacts\n3. Exporting all contacts\n4. Downloading the CSV\n\nThis will take 2-3 minutes. I'll show you real-time screenshots as I go. You can check the status anytime in the Computer Use tab.\n\nPoll /api/computer-use/task/${taskId} for live updates!`,
            timestamp: new Date().toISOString(),
            contextUsed: true,
            automationType: 'wix_extraction',
            automationStatus: 'started',
            taskId,
            pollUrl: `/api/computer-use/task/${taskId}`
          });
        } catch (error: any) {
          console.error('[Mr. Blue] Wix extraction error:', error);
          return res.json({
            role: 'assistant',
            content: `❌ Failed to start Wix extraction: ${error.message}\n\nPlease try again or check the Computer Use tab for more details.`,
            timestamp: new Date().toISOString(),
            automationType: 'wix_extraction',
            automationStatus: 'error',
            error: error.message
          });
        }
      } else if (automationIntent.type === 'facebook_automation') {
        try {
          // Check if Facebook credentials are configured
          if (!process.env.FACEBOOK_EMAIL || !process.env.FACEBOOK_PASSWORD) {
            return res.json({
              role: 'assistant',
              content: "I'd love to help with Facebook automation, but I need FACEBOOK_EMAIL and FACEBOOK_PASSWORD configured in environment variables first. Please ask an admin to set these up.",
              timestamp: new Date().toISOString(),
              contextUsed: true,
              automationType: 'facebook_automation',
              automationStatus: 'credentials_missing'
            });
          }
          
          // Extract recipient name from message using patterns
          const namePatterns = [
            /send.*(?:fb|facebook).*invit.*to\s+(.+?)(?:\.|$)/i,
            /invite\s+(.+?)\s+on\s+facebook/i,
            /(?:fb|facebook).*message.*to\s+(.+?)(?:\.|$)/i,
          ];
          
          let recipientName: string | null = null;
          for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              recipientName = match[1].trim();
              break;
            }
          }
          
          if (!recipientName) {
            return res.json({
              role: 'assistant',
              content: `I detected you want to send a Facebook invitation, but I couldn't determine the recipient name.

Please use one of these formats:
• "Send FB invitation to John Smith"
• "Invite Maria Garcia on Facebook"
• "Send Facebook message to Carlos Mendez"

What name would you like to send to?`,
              timestamp: new Date().toISOString(),
              automationType: 'facebook_automation',
              automationStatus: 'missing_recipient'
            });
          }
          
          // Check rate limit
          const rateLimit = await facebookMessengerService.checkRateLimit(userId);
          if (!rateLimit.canSend) {
            return res.json({
              role: 'assistant',
              content: `⏱️ Facebook invitation rate limit reached!

**Current Status:**
• Daily limit: ${rateLimit.dailyCount}/5 sent
• Hourly limit: ${rateLimit.hourlyCount}/1 sent

You can send your next invitation at: ${rateLimit.nextAvailable?.toLocaleString()}

These limits help protect your Facebook account from being flagged for spam. Thank you for your patience! 🙏`,
              timestamp: new Date().toISOString(),
              automationType: 'facebook_automation',
              automationStatus: 'rate_limited',
              rateLimitInfo: rateLimit
            });
          }
          
          const taskId = `fb_invite_${nanoid(10)}`;
          
          // Create task record
          await db.insert(computerUseTasks).values({
            taskId,
            userId,
            instruction: `Send Facebook invitation to ${recipientName} (triggered by Mr. Blue chat)`,
            status: 'running',
            steps: [],
            currentStep: 0,
            maxSteps: 15,
            requiresApproval: false,
            automationType: 'facebook_automation'
          });
          
          // Execute Facebook automation in background
          (async () => {
            try {
              const result = await facebookMessengerService.sendInvitation(
                taskId,
                userId,
                recipientName,
                'mundo_tango_invite'
              );
              
              // Store screenshots
              if (result.screenshots && result.screenshots.length > 0) {
                for (const screenshot of result.screenshots) {
                  await db.insert(computerUseScreenshots).values({
                    taskId,
                    stepNumber: screenshot.step,
                    screenshotBase64: screenshot.base64,
                    action: { description: screenshot.action }
                  });
                }
              }
              
              // Update task with result
              await db.update(computerUseTasks)
                .set({
                  status: result.success ? 'completed' : 'failed',
                  currentStep: result.screenshots?.length || 0,
                  result: {
                    success: result.success,
                    messagesSent: result.messagesSent,
                    recipientNames: result.recipientNames
                  },
                  error: result.error,
                  steps: result.screenshots?.map(s => ({
                    step: s.step,
                    action: s.action
                  })) || []
                })
                .where(eq(computerUseTasks.taskId, taskId));
              
              console.log(`[Mr. Blue] Facebook automation task ${taskId} completed:`, result.success ? 'SUCCESS' : 'FAILED');
            } catch (error: any) {
              console.error(`[Mr. Blue] Facebook automation error:`, error);
              
              await db.update(computerUseTasks)
                .set({
                  status: 'failed',
                  error: error.message
                })
                .where(eq(computerUseTasks.taskId, taskId));
            }
          })();
          
          // Return immediate response
          return res.json({
            role: 'assistant',
            content: `🚀 Starting Facebook invitation to ${recipientName}!

Task ID: ${taskId}

**I'm now:**
1. 🔐 Logging into Facebook
2. 💬 Opening Messenger
3. 🔍 Searching for "${recipientName}"
4. ✉️ Sending personalized Mundo Tango invitation

**Rate Limits:**
• Daily: ${rateLimit.dailyCount + 1}/5
• Hourly: ${rateLimit.hourlyCount + 1}/1

This will take 1-2 minutes. I'll show you real-time screenshots as I go!

Poll /api/computer-use/task/${taskId} for live updates! 📸`,
            timestamp: new Date().toISOString(),
            contextUsed: true,
            automationType: 'facebook_automation',
            automationStatus: 'started',
            taskId,
            pollUrl: `/api/computer-use/task/${taskId}`,
            recipientName
          });
        } catch (error: any) {
          console.error('[Mr. Blue] Facebook automation error:', error);
          return res.json({
            role: 'assistant',
            content: `❌ Failed to start Facebook automation: ${error.message}\n\nPlease try again or check the Computer Use tab for more details.`,
            timestamp: new Date().toISOString(),
            automationType: 'facebook_automation',
            automationStatus: 'error',
            error: error.message
          });
        }
      } else if (automationIntent.type === 'info_request') {
        // User is asking ABOUT Computer Use capabilities
        return res.json({
          role: 'assistant',
          content: `🤖 **Yes! I have access to Computer Use automation!**

I can control a real web browser to automate tasks for you. Here's what I can do:

**Available Automations:**

📦 **Wix Data Migration**
"Extract my Wix contacts" - I'll log into Wix, navigate to your contacts, and download them as CSV

💌 **Facebook Messenger Invitations** ✨ NEW!
"Send FB invitation to [name]" - I'll log into Facebook, search for the person, and send a personalized Mundo Tango invitation

**How It Works:**
1. You tell me what to automate (natural language)
2. I detect the intent and start the automation
3. You see real-time progress with screenshots
4. Task completes and you get the results

**Try It Now:**

*Wix Migration:*
• "Extract my Wix contacts"
• "Migrate my Wix data"
• "Get my Wix contact list"

*Facebook Invitations:*
• "Send FB invitation to John Smith"
• "Invite Maria Garcia on Facebook"
• "Send Facebook message to Carlos Mendez"

**Features:**
✅ Real-time progress updates
✅ Live browser screenshots
✅ Background execution (non-blocking)
✅ Secure (admin-only access)
✅ Rate limiting (5/day, 1/hour for FB)

Would you like to try one?`,
          timestamp: new Date().toISOString(),
          automationType: 'info_request',
          automationStatus: 'explained'
        });
      }
    }
    
    // Handle non-admin users asking about Computer Use
    if (automationIntent.isAutomation && userRoleLevel < 8) {
      return res.json({
        role: 'assistant',
        content: `🔒 Computer Use automation is available, but requires admin access (role level 8+).

Your current role level: ${userRoleLevel}

Computer Use allows me to control a web browser to automate tasks like:
• Extracting data from websites
• Automating social media actions
• Migrating data between platforms

Please contact an administrator if you need access to this feature.`,
        timestamp: new Date().toISOString(),
        automationType: 'info_request',
        automationStatus: 'insufficient_permissions'
      });
    }
    
    // STEP 2: Build context-aware system message with real platform data
    let platformContext = '';
    let userContext = '';
    let godModeContext = '';
    
    try {
      platformContext = await mrBlueDataService.buildPlatformContext();
    } catch (err) {
      console.log('[Mr. Blue] Could not fetch platform context:', err);
    }
    
    // MB.MD Pattern 64: Add user-specific context (friends, RSVPs, cities, groups)
    try {
      userContext = await mrBlueDataService.buildUserContextString(userId);
      console.log('[Mr. Blue] User context loaded for userId:', userId);
    } catch (err) {
      console.log('[Mr. Blue] Could not fetch user context:', err);
    }
    
    // MB.MD Pattern 65: Add god mode context for admin/CTO users (roleLevel >= 8)
    const isGodMode = userRoleLevel >= 8;
    if (isGodMode) {
      try {
        godModeContext = await mrBlueDataService.buildGodModeContext();
        console.log('[Mr. Blue] God mode activated for admin user');
      } catch (err) {
        console.log('[Mr. Blue] Could not fetch god mode context:', err);
      }
    }
    
    let systemMessage = `You are Mr. Blue, the friendly and knowledgeable AI assistant for Mundo Tango - a global social platform connecting the tango dance community.

PERSONALITY:
- Warm, welcoming, and passionate about tango
- Concise but helpful responses (2-4 sentences unless more detail is requested)
- Uses relevant tango terminology naturally
- Can help with events, cities, travel tips, connecting with dancers, and platform navigation

${platformContext}
${userContext}
${godModeContext}`;
    
    if (context) {
      const { currentPage, pageTitle, breadcrumbs, userIntent } = context;
      
      if (currentPage) {
        systemMessage += `\n\nUser's Current Page: ${currentPage}`;
      }
      if (pageTitle) {
        systemMessage += `\nPage Title: ${pageTitle}`;
      }
      if (userIntent) {
        systemMessage += `\nUser Intent: ${userIntent}`;
      }
      if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
        systemMessage += '\n\nRecent Actions:';
        breadcrumbs.slice(-3).forEach((b: any) => {
          systemMessage += `\n- ${b.action} on ${b.page}`;
        });
      }
    }
    
    systemMessage += `\n\nRespond naturally to the user's question. If they ask about events, cities, or the platform, use the real data above. Be helpful, concise, and engaging.`;
    
    // STEP 3: Generate AI response using Groq
    let responseContent = '';
    
    try {
      const groq = new Groq({ 
        apiKey: process.env.GROQ_API_KEY || '',
        baseURL: process.env.GROQ_BASE_URL || undefined
      });
      
      const queryIntent = mrBlueDataService.detectQueryIntent(message);
      
      // Add relevant data to context based on query intent
      if (queryIntent.type === 'events' && queryIntent.location) {
        const cityEvents = await mrBlueDataService.getEventsInCity(queryIntent.location, 5);
        if (cityEvents.length > 0) {
          systemMessage += `\n\nEVENTS IN ${queryIntent.location.toUpperCase()}:\n`;
          cityEvents.forEach(e => {
            const date = e.startDate ? new Date(e.startDate).toLocaleDateString() : 'TBD';
            systemMessage += `- ${e.title} (${e.eventType || 'Event'}) on ${date}\n`;
          });
        }
      } else if (queryIntent.type === 'cities') {
        const cities = await mrBlueDataService.getPopularCities(8);
        if (cities.length > 0) {
          systemMessage += `\n\nTOP TANGO CITIES:\n`;
          cities.forEach(c => {
            systemMessage += `- ${c.name}, ${c.country || ''}\n`;
          });
        }
      }
      
      const aiResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      responseContent = aiResponse.choices[0]?.message?.content || 
        "I'm here to help with your tango journey! What would you like to know about events, cities, or connecting with the tango community?";
      
      console.log('[Mr. Blue] AI response generated successfully');
    } catch (aiError: any) {
      console.error('[Mr. Blue] AI generation error, falling back to context-aware response:', aiError.message);
      
      // Fallback to smart template response if AI fails
      if (context?.currentPage?.includes('/feed')) {
        responseContent = `Welcome to the Feed! Share your tango moments, connect with dancers, and discover what's happening in the community. What would you like to do?`;
      } else if (context?.currentPage?.includes('/events')) {
        responseContent = `Looking for tango events? I can help you find milongas, festivals, and workshops. What type of event are you interested in?`;
      } else if (context?.currentPage?.includes('/city')) {
        responseContent = `Exploring a tango city! Each city page shows local events, venues, teachers, and community members. What would you like to know?`;
      } else {
        responseContent = `I'm Mr. Blue, your tango community guide! I can help you find events, explore cities, or connect with dancers. How can I assist you today?`;
      }
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
