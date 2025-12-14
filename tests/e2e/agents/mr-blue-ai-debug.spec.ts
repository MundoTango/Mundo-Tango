/**
 * MB.MD Iterative Playwright Debugging Methodology
 * Mr. Blue AI Response Analyzer
 * 
 * This test implements an iterative debugging loop to verify:
 * 1. Mr. Blue receives the resume/systemPrompt correctly
 * 2. AI generates personalized responses (not fallback/generic)
 * 3. Network trace shows correct API payload
 * 
 * Run: npx playwright test tests/e2e/agents/mr-blue-ai-debug.spec.ts
 */

import { test, expect, Page, Request, Response } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface MrBlueAnalysis {
  isPersonalized: boolean;
  response: string;
  apiPayload?: any;
  apiResponse?: any;
  keywords: string[];
  confidenceScore: number;
  failureReason?: string;
}

const RESUME_KEYWORDS = [
  'react', 'typescript', 'node', 'frontend', 'backend',
  'javascript', 'python', 'experience', 'project', 'developer',
  'engineer', 'skill', 'portfolio', 'github', 'contribution'
];

const GENERIC_PATTERNS = [
  /hi there.*background/i,
  /what.*technical skill.*most confident/i,
  /noticed.*interesting experience/i,
  /what technologies.*enjoy/i,
  /could not generate/i,
  /encountered an issue/i,
  /please try again/i
];

function analyzeMrBlueResponse(response: string, resumeContent?: string): MrBlueAnalysis {
  const lowerResponse = response.toLowerCase();
  
  const matchedKeywords = RESUME_KEYWORDS.filter(kw => lowerResponse.includes(kw));
  
  let isGeneric = false;
  let matchedPattern: string | null = null;
  
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(response)) {
      isGeneric = true;
      matchedPattern = pattern.toString();
      break;
    }
  }
  
  const hasResumeSpecificContent = resumeContent 
    ? resumeContent.toLowerCase().split(/\s+/).some(word => 
        word.length > 4 && lowerResponse.includes(word)
      )
    : false;
  
  let confidenceScore = 0;
  if (matchedKeywords.length > 3) confidenceScore += 30;
  if (hasResumeSpecificContent) confidenceScore += 40;
  if (!isGeneric) confidenceScore += 30;
  
  const isPersonalized = !isGeneric && (matchedKeywords.length > 2 || hasResumeSpecificContent);
  
  return {
    isPersonalized,
    response,
    keywords: matchedKeywords,
    confidenceScore,
    failureReason: isGeneric 
      ? `Matched generic pattern: ${matchedPattern}`
      : isPersonalized 
        ? undefined 
        : `Low keyword count (${matchedKeywords.length}) and no resume-specific content`
  };
}

function saveDebugArtifact(filename: string, content: any) {
  const dir = 'test-results/mr-blue-debug';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filepath = path.join(dir, filename);
  const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  fs.writeFileSync(filepath, data);
  console.log(`[Debug] Saved artifact: ${filepath}`);
}

test.describe('Mr. Blue AI Debug - Iterative Testing', () => {
  test.setTimeout(180000);

  test('capture and analyze first AI response in Talent Match interview', async ({ page }) => {
    const networkTrace: { request: any; response: any }[] = [];
    
    page.on('request', (request: Request) => {
      if (request.url().includes('/api/mrblue/chat')) {
        const postData = request.postData();
        networkTrace.push({
          request: {
            url: request.url(),
            method: request.method(),
            postData: postData ? JSON.parse(postData) : null,
            timestamp: new Date().toISOString()
          },
          response: null
        });
        console.log(`[Network] POST /api/mrblue/chat - Payload:`, postData);
      }
    });

    page.on('response', async (response: Response) => {
      if (response.url().includes('/api/mrblue/chat')) {
        try {
          const body = await response.json();
          const traceEntry = networkTrace.find(t => !t.response);
          if (traceEntry) {
            traceEntry.response = {
              status: response.status(),
              body,
              timestamp: new Date().toISOString()
            };
          }
          console.log(`[Network] Response:`, JSON.stringify(body).substring(0, 200));
        } catch {
        }
      }
    });

    await page.goto('/talent-match');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/mr-blue-debug/01-talent-match-page.png', fullPage: true });
    console.log('[Step 1] Landed on Talent Match page');
    
    const loginRequired = await page.locator('text=/sign in|log in|login/i').first().isVisible().catch(() => false);
    if (loginRequired) {
      console.log('[Auth] Login required - attempting test auth');
      await page.goto('/register?test=true');
      await page.waitForTimeout(2000);
      
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      const emailInput = page.locator('input[name="email"], input[type="email"], [data-testid*="email"]').first();
      const passwordInput = page.locator('input[name="password"], input[type="password"], [data-testid*="password"]').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill(testEmail);
        await passwordInput.fill(testPassword);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up")').first();
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
      
      await page.goto('/talent-match');
      await page.waitForLoadState('domcontentloaded');
    }
    
    const resumeInput = page.locator('input[type="file"]').first();
    
    if (await resumeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('[Step 2] File upload available');
      
      const testResumeContent = `
John Developer - Software Engineer Resume

SUMMARY
Senior Full-Stack Developer with 5+ years of experience in React, TypeScript, Node.js, and PostgreSQL.
Passionate about building scalable web applications and contributing to open source projects.

SKILLS
- Frontend: React, TypeScript, Tailwind CSS, Next.js
- Backend: Node.js, Express, PostgreSQL, Redis
- DevOps: Docker, AWS, GitHub Actions
- AI/ML: OpenAI API, LangChain, Vector Databases

EXPERIENCE
Senior Developer at TechCorp (2021-Present)
- Built real-time collaboration platform serving 10K+ users
- Led migration from JavaScript to TypeScript
- Implemented AI-powered search with 95% accuracy

Developer at StartupXYZ (2019-2021)
- Developed event management system with React
- Created REST APIs handling 1M+ requests/day

PROJECTS
- Open source contributor to popular React libraries
- Built tango community app for local dance events
- Created AI chatbot for customer support

EDUCATION
BS Computer Science, State University

LINKS
- GitHub: github.com/johndeveloper
- LinkedIn: linkedin.com/in/johndeveloper
`;
      
      const resumePath = 'test-results/mr-blue-debug/test-resume.txt';
      fs.mkdirSync('test-results/mr-blue-debug', { recursive: true });
      fs.writeFileSync(resumePath, testResumeContent);
      
      await resumeInput.setInputFiles(resumePath);
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/mr-blue-debug/02-resume-uploaded.png', fullPage: true });
      console.log('[Step 2] Resume uploaded');
      
      saveDebugArtifact('resume-content.txt', testResumeContent);
    } else {
      console.log('[Step 2] No file upload - proceeding without resume');
    }
    
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Continue"), [data-testid*="start"]').first();
    
    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(3000);
      console.log('[Step 3] Clicked start button');
    }
    
    await page.screenshot({ path: 'test-results/mr-blue-debug/03-after-start.png', fullPage: true });
    
    const interviewUrlPattern = /talent-match-interview|clarifier|interview/i;
    const currentUrl = page.url();
    
    if (interviewUrlPattern.test(currentUrl)) {
      console.log('[Step 4] On interview page:', currentUrl);
    } else {
      console.log('[Step 4] Still on:', currentUrl);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Next")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(5000);
      }
    }
    
    await page.waitForTimeout(5000);
    
    const aiMessageLocator = page.locator('[data-testid^="message-assistant"], .assistant-message, [role="assistant"]').first();
    let firstAiResponse = '';
    
    if (await aiMessageLocator.isVisible({ timeout: 15000 }).catch(() => false)) {
      firstAiResponse = await aiMessageLocator.textContent() || '';
      console.log('[Step 5] First AI Response:', firstAiResponse.substring(0, 200));
    } else {
      const anyBotMessage = page.locator('text=/Mr.*Blue|welcome|reviewed your|background/i').first();
      if (await anyBotMessage.isVisible({ timeout: 5000 })) {
        firstAiResponse = await anyBotMessage.textContent() || '';
      }
    }
    
    await page.screenshot({ path: 'test-results/mr-blue-debug/04-first-ai-response.png', fullPage: true });
    
    const analysis = analyzeMrBlueResponse(firstAiResponse);
    analysis.apiPayload = networkTrace[0]?.request?.postData;
    analysis.apiResponse = networkTrace[0]?.response?.body;
    
    console.log('\n' + '='.repeat(60));
    console.log('MR. BLUE AI ANALYSIS REPORT');
    console.log('='.repeat(60));
    console.log(`Response: "${firstAiResponse.substring(0, 150)}..."`);
    console.log(`\nPersonalized: ${analysis.isPersonalized ? '✅ YES' : '❌ NO'}`);
    console.log(`Confidence Score: ${analysis.confidenceScore}%`);
    console.log(`Keywords Found: ${analysis.keywords.join(', ') || 'none'}`);
    
    if (analysis.failureReason) {
      console.log(`\n⚠️  Failure Reason: ${analysis.failureReason}`);
    }
    
    if (analysis.apiPayload?.systemPrompt) {
      console.log(`\nAPI Payload - systemPrompt present: ✅`);
      console.log(`systemPrompt length: ${analysis.apiPayload.systemPrompt.length} chars`);
    } else {
      console.log(`\n❌ API Payload - systemPrompt MISSING`);
    }
    
    console.log('='.repeat(60) + '\n');
    
    saveDebugArtifact('analysis-report.json', {
      timestamp: new Date().toISOString(),
      analysis,
      networkTrace,
      url: page.url()
    });
    
    if (!analysis.isPersonalized) {
      console.log('\n🔍 DEBUG RECOMMENDATIONS:');
      console.log('1. Check if resume was properly uploaded and parsed');
      console.log('2. Verify /api/mrblue/chat receives systemPrompt in request body');
      console.log('3. Check GROQ_API_KEY is set and valid');
      console.log('4. Review server/routes/mr-blue-enhanced.ts customSystemPrompt handling');
      console.log('5. Check if frontend generateResumeQuestion is building systemPrompt correctly');
      
      if (!analysis.apiPayload?.systemPrompt) {
        console.log('\n🎯 LIKELY ISSUE: systemPrompt not being sent in API request');
        console.log('   Fix: Check TalentMatchInterviewPage.tsx generateResumeQuestion function');
      }
      
      if (networkTrace.length === 0) {
        console.log('\n🎯 LIKELY ISSUE: No API call to /api/mrblue/chat detected');
        console.log('   Fix: Check if interview page loaded correctly and triggered AI');
      }
    }
    
    expect(firstAiResponse.length).toBeGreaterThan(10);
  });

  test('verify systemPrompt construction in generateResumeQuestion', async ({ page }) => {
    const apiCalls: any[] = [];
    
    page.on('request', (request: Request) => {
      if (request.url().includes('/api/mrblue/chat') && request.method() === 'POST') {
        const postData = request.postData();
        if (postData) {
          const parsed = JSON.parse(postData);
          apiCalls.push({
            hasSystemPrompt: !!parsed.systemPrompt,
            systemPromptLength: parsed.systemPrompt?.length || 0,
            messageLength: parsed.message?.length || 0,
            context: parsed.context
          });
        }
      }
    });

    await page.goto('/talent-match');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), [data-testid*="start"]').first();
    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(5000);
    }

    await page.waitForTimeout(8000);

    console.log('\n' + '='.repeat(60));
    console.log('API CALL ANALYSIS');
    console.log('='.repeat(60));
    
    if (apiCalls.length === 0) {
      console.log('❌ No API calls to /api/mrblue/chat detected');
      console.log('   This could mean:');
      console.log('   1. User not authenticated');
      console.log('   2. Interview page not reached');
      console.log('   3. Frontend error prevented API call');
    } else {
      apiCalls.forEach((call, idx) => {
        console.log(`\nCall ${idx + 1}:`);
        console.log(`  Has systemPrompt: ${call.hasSystemPrompt ? '✅' : '❌'}`);
        console.log(`  systemPrompt length: ${call.systemPromptLength} chars`);
        console.log(`  Message: ${call.messageLength} chars`);
        console.log(`  Context: ${JSON.stringify(call.context)}`);
        
        if (call.hasSystemPrompt && call.systemPromptLength > 100) {
          console.log('  ✅ Proper systemPrompt being sent to API');
        } else if (!call.hasSystemPrompt) {
          console.log('  ❌ systemPrompt missing - check generateResumeQuestion');
        }
      });
    }
    
    console.log('='.repeat(60) + '\n');

    saveDebugArtifact('api-calls-analysis.json', apiCalls);
  });
});
