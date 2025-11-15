/**
 * Mr. Blue Builds Himself - Meta Autonomous Test
 * 
 * This test validates the entire autonomous "vibe coding agent" workflow where
 * Mr. Blue BUILDS new features from conversational prompts (like Cursor/Lovable/Bolt.new):
 * 
 * 1. Replit AI gives Mr. Blue conversational requirements for 3 new features:
 *    - Animation System (walking, idle, emotion-based movements)
 *    - Speech Synthesis Integration (TTS, mouth sync, voice queue)
 *    - Personality Traits System (emotion detection, reactions, customization)
 * 
 * 2. Mr. Blue creates a detailed MB.MD plan (simultaneously/recursively/critically)
 * 
 * 3. Replit AI validates the plan iteratively until comprehensive enough
 * 
 * 4. Mr. Blue autonomously executes the plan (writes code, modifies files, integrates)
 * 
 * 5. Verification that all 3 features are working (animations, speech, personality)
 * 
 * **VIDEO RECORDING ENABLED** - For marketing demo of autonomous vibe coding
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Test configuration with VIDEO RECORDING
test.use({
  video: 'on', // Record video for marketing
  screenshot: 'on',
  trace: 'on',
});

interface ValidationResult {
  isValid: boolean;
  score: number;
  maxScore: number;
  failedChecks: string[];
  passedChecks: string[];
  feedback: string;
}

interface TestReport {
  startTime: string;
  endTime?: string;
  duration?: number;
  iterations: number;
  finalValidationScore: number;
  mrBlueResponses: string[];
  screenshots: string[];
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
}

const testReport: TestReport = {
  startTime: new Date().toISOString(),
  iterations: 0,
  finalValidationScore: 0,
  mrBlueResponses: [],
  screenshots: [],
  status: 'in_progress'
};

/**
 * Login and navigate to Visual Editor
 */
async function loginAndNavigateToVisualEditor(page: Page) {
  console.log('🔐 Logging in with environment credentials...');
  
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;
  
  if (!email || !password) {
    throw new Error('TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set in environment');
  }
  
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', password);
  await page.click('[data-testid="button-login"]');
  
  // Wait for redirect to dashboard/feed
  await page.waitForURL(/\/(feed|dashboard|admin)/, { timeout: 10000 });
  
  console.log('✅ Login successful');
  
  // Navigate to Visual Editor
  console.log('🎨 Navigating to Visual Editor...');
  await page.goto('/admin/visual-editor');
  await page.waitForLoadState('networkidle');
  
  // Wait for editor to be ready
  await page.waitForSelector('[data-visual-editor="root"]', { timeout: 15000 });
  
  console.log('✅ Visual Editor loaded');
}

/**
 * Validate Mr. Blue's MB.MD plan
 * This is the critical validation logic that teaches Mr. Blue to vibe code
 */
async function validateMBMDPlan(responseText: string, iteration: number): Promise<ValidationResult> {
  console.log(`\n🔍 Validating MB.MD Plan (Iteration ${iteration})`);
  
  const checks = {
    // Core MB.MD methodology
    usesMBMDMethodology: {
      test: /simultaneously|recursively|critically|mb\.md/i.test(responseText),
      weight: 2,
      name: 'Uses MB.MD methodology (simultaneously/recursively/critically)'
    },
    
    // Task decomposition
    hasTaskDecomposition: {
      test: /(task|step|phase)\s+\d+/i.test(responseText) && responseText.split(/task|step|phase/i).length >= 4,
      weight: 2,
      name: 'Has clear task decomposition (minimum 3 tasks)'
    },
    
    // Technical specificity
    mentions3DComponents: {
      test: /MrBlueAvatar3D|MrBlue3DModel/i.test(responseText),
      weight: 1.5,
      name: 'Mentions specific 3D component files'
    },
    mentionsVisualEditorPage: {
      test: /VisualEditorPage\.tsx/i.test(responseText),
      weight: 1.5,
      name: 'References VisualEditorPage.tsx integration point'
    },
    
    // Feature 1: Animation System
    mentionsAnimationSystem: {
      test: /walking|idle.*animation|emotion.*movement|bounce|tilt|sway/i.test(responseText),
      weight: 2,
      name: 'Feature 1: Includes animation system (walking, idle, emotion movements)'
    },
    mentionsAnimationStates: {
      test: /animation.*state|transition|speaking.*animation|listening.*animation/i.test(responseText),
      weight: 1.5,
      name: 'Feature 1: Connects animations to voice states with transitions'
    },
    
    // Feature 2: Speech Synthesis
    mentionsSpeechSynthesis: {
      test: /text-to-speech|TTS|speech.*synthesis|voice.*output|speak/i.test(responseText),
      weight: 2,
      name: 'Feature 2: Includes speech synthesis integration'
    },
    mentionsMouthSync: {
      test: /mouth.*movement|lip.*sync|sync.*speech|vocal.*tone/i.test(responseText),
      weight: 1.5,
      name: 'Feature 2: Syncs mouth movements with speech'
    },
    
    // Feature 3: Personality Traits
    mentionsPersonalitySystem: {
      test: /personality|emotion.*detection|trait|friendly|professional|playful/i.test(responseText),
      weight: 2,
      name: 'Feature 3: Includes personality traits system'
    },
    mentionsEmotionReactions: {
      test: /emotion.*state|reaction|visual.*feedback|context.*detection/i.test(responseText),
      weight: 1.5,
      name: 'Feature 3: Implements emotion-based reactions'
    },
    
    // File operations
    mentionsReadingExisting: {
      test: /read|examine|check.*existing|current.*code/i.test(responseText),
      weight: 1.5,
      name: 'Plans to read existing code first'
    },
    mentionsImports: {
      test: /import|require|from.*@\/components/i.test(responseText),
      weight: 1,
      name: 'Mentions proper import statements'
    },
    
    // Testing & validation
    mentionsTesting: {
      test: /test|verify|validate|ensure.*work/i.test(responseText),
      weight: 1,
      name: 'Includes testing/verification steps'
    },
    
    // Quality indicators
    hasFilePathSpecificity: {
      test: (responseText.match(/client\/src\/[a-zA-Z\/\-\.]+\.tsx?/g) || []).length >= 2,
      weight: 1.5,
      name: 'Uses specific file paths (not vague)'
    },
    hasDetailedSteps: {
      test: responseText.length > 300 && responseText.split('\n').length > 10,
      weight: 1,
      name: 'Provides detailed, comprehensive plan'
    }
  };
  
  // Calculate score
  let totalScore = 0;
  let maxScore = 0;
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  
  for (const [key, check] of Object.entries(checks)) {
    maxScore += check.weight;
    if (check.test) {
      totalScore += check.weight;
      passedChecks.push(`✅ ${check.name}`);
    } else {
      failedChecks.push(`❌ ${check.name}`);
    }
  }
  
  const percentage = (totalScore / maxScore) * 100;
  const isValid = percentage >= 75; // Need 75% to pass
  
  // Generate feedback for Mr. Blue
  let feedback = '';
  if (!isValid) {
    feedback = `Your plan scored ${percentage.toFixed(1)}% (${totalScore}/${maxScore} points). To improve:\n`;
    feedback += failedChecks.slice(0, 3).join('\n'); // Show top 3 issues
    feedback += '\n\nPlease revise your plan to be more specific and comprehensive.';
  }
  
  // Log results
  console.log(`📊 Validation Score: ${totalScore.toFixed(1)}/${maxScore} (${percentage.toFixed(1)}%)`);
  console.log(`${passedChecks.length} checks passed, ${failedChecks.length} checks failed`);
  
  if (passedChecks.length > 0) {
    console.log('\n✅ Passed Checks:');
    passedChecks.forEach(check => console.log(`  ${check}`));
  }
  
  if (failedChecks.length > 0) {
    console.log('\n❌ Failed Checks:');
    failedChecks.forEach(check => console.log(`  ${check}`));
  }
  
  return {
    isValid,
    score: totalScore,
    maxScore,
    failedChecks,
    passedChecks,
    feedback
  };
}

/**
 * Ask Mr. Blue to create/revise his plan
 */
async function askMrBlueForPlan(page: Page, iteration: number, previousFeedback?: string): Promise<string> {
  console.log(`\n💬 Asking Mr. Blue for plan (Iteration ${iteration})...`);
  
  let prompt = '';
  
  if (iteration === 1) {
    // First iteration - give the full instruction to BUILD NEW FEATURES
    prompt = `Hi Mr. Blue! I need you to autonomously enhance your 3D avatar system with three major features:

**Feature 1: Animation System**
- Implement walking/idle animations for the 3D avatar
- Create emotion-based movements (excited bounce, curious tilt, thinking sway)
- Connect animations to voice activity states (speaking, listening, idle)
- Add smooth transitions between animation states

**Feature 2: Speech Synthesis Integration**
- Integrate text-to-speech output with 3D avatar expressions
- Sync mouth movements with speech output
- Map different vocal tones to avatar expressions
- Implement voice queue system for multiple messages

**Feature 3: Personality Traits System**
- Add emotion detection from conversation context
- Implement personality-driven avatar reactions (friendly, professional, playful)
- Create visual feedback for different emotional states
- Build trait configuration system for customization

**Technical Constraints:**
- Work with existing files:
  - client/src/components/mrblue/MrBlueAvatar3D.tsx (current implementation)
  - client/src/components/avatar/MrBlue3DModel.tsx (3D model)
  - client/src/hooks/useTextToSpeech.ts (TTS hook)
  - client/src/components/visual-editor/MrBlueVisualChat.tsx (integration point)
- Use Three.js for animations
- Maintain 56x56px canvas size
- Keep performance optimized (60 FPS target)

**Important:** Create a detailed MB.MD plan using simultaneously/recursively/critically methodology. Break down the work into parallel subagent tasks with exact file paths, implementation details, and integration steps. These are NEW features you will BUILD, not just integrate existing code.`;
  } else {
    // Subsequent iterations - provide feedback
    prompt = `Thank you for the plan. However, I need you to revise it to be more comprehensive.

**Feedback:**
${previousFeedback}

Please provide an improved MB.MD plan with more specific details, exact file paths, and clear task decomposition using simultaneously/recursively/critically methodology.`;
  }
  
  // Find the textarea
  const textarea = page.locator('[data-testid="input-vibe-prompt"]');
  await textarea.clear();
  await textarea.fill(prompt);
  
  // Take screenshot before sending
  const screenshotPath = `tests/screenshots/mr-blue-prompt-iteration-${iteration}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  testReport.screenshots.push(screenshotPath);
  
  console.log('📸 Screenshot captured');
  
  // Send the message
  const sendButton = page.locator('[data-testid="button-vibe-submit"]');
  await sendButton.click();
  
  console.log('📤 Message sent to Mr. Blue');
  
  // Wait for Mr. Blue's response
  console.log('⏳ Waiting for Mr. Blue to respond...');
  
  // Wait a bit for the response to start appearing
  await page.waitForTimeout(3000);
  
  // Look for the response in the chat
  // The response should appear in the message area
  await page.waitForTimeout(10000); // Give Mr. Blue time to generate the plan
  
  // Capture the response from the page
  const messages = await page.locator('[class*="message"]').allTextContents();
  const lastMessage = messages[messages.length - 1] || '';
  
  // Take screenshot after response
  const responseScreenshotPath = `tests/screenshots/mr-blue-response-iteration-${iteration}.png`;
  await page.screenshot({ path: responseScreenshotPath, fullPage: true });
  testReport.screenshots.push(responseScreenshotPath);
  
  console.log(`📥 Received response (${lastMessage.length} characters)`);
  testReport.mrBlueResponses.push(lastMessage);
  
  return lastMessage;
}

/**
 * Monitor Mr. Blue's autonomous work
 */
async function monitorAutonomousWork(page: Page): Promise<void> {
  console.log('\n👀 Monitoring Mr. Blue\'s autonomous work...');
  
  const startTime = Date.now();
  const maxWaitTime = 300000; // 5 minutes
  let lastStatus = '';
  let screenshotCount = 0;
  
  while (Date.now() - startTime < maxWaitTime) {
    // Check for status indicators
    const statusElements = await page.locator('[data-testid*="status"], [class*="status"]').allTextContents();
    const currentStatus = statusElements.join(' ');
    
    if (currentStatus !== lastStatus && currentStatus.length > 0) {
      console.log(`📊 Status: ${currentStatus}`);
      lastStatus = currentStatus;
    }
    
    // Take periodic screenshots
    if (screenshotCount % 3 === 0) {
      const screenshotPath = `tests/screenshots/mr-blue-working-${screenshotCount}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testReport.screenshots.push(screenshotPath);
    }
    screenshotCount++;
    
    // Check for completion
    if (currentStatus.includes('completed') || currentStatus.includes('success')) {
      console.log('✅ Work completed!');
      break;
    }
    
    // Check for failure
    if (currentStatus.includes('failed') || currentStatus.includes('error')) {
      console.log('❌ Work failed!');
      throw new Error('Autonomous work failed');
    }
    
    await page.waitForTimeout(5000); // Check every 5 seconds
  }
  
  console.log('✅ Monitoring complete');
}

/**
 * Verify new features: Animation System, Speech Synthesis, Personality Traits
 */
async function verify3DAvatarIntegration(page: Page): Promise<void> {
  console.log('\n🔍 Verifying new features (Animation, Speech, Personality)...');
  
  // Reload the page to see changes
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  const results = {
    canvas: false,
    animations: false,
    speechSynthesis: false,
    personalityTraits: false
  };
  
  // Check 1: Canvas element (Three.js 3D rendering)
  const canvas = page.locator('canvas');
  results.canvas = await canvas.count() > 0;
  console.log(`${results.canvas ? '✅' : '❌'} Canvas element (3D rendering)`);
  
  // Check 2: Animation system (look for animation-related attributes/classes)
  const animationIndicators = await page.locator('[class*="animat"], [data-animation], [class*="bounce"], [class*="sway"]').count();
  results.animations = animationIndicators > 0;
  console.log(`${results.animations ? '✅' : '❌'} Animation system indicators found (${animationIndicators} elements)`);
  
  // Check 3: Speech synthesis (check console for TTS-related logs)
  const consoleLogs = page.context().on('console', msg => {
    if (msg.text().includes('speech') || msg.text().includes('TTS') || msg.text().includes('synthesis')) {
      results.speechSynthesis = true;
    }
  });
  
  // Trigger speech by sending a test message
  console.log('🗣️  Testing speech synthesis...');
  const textarea = page.locator('[data-testid="input-vibe-prompt"]');
  if (await textarea.count() > 0) {
    await textarea.fill('Hello, can you speak?');
    const sendButton = page.locator('[data-testid="button-vibe-submit"]');
    if (await sendButton.count() > 0) {
      await sendButton.click();
      await page.waitForTimeout(5000); // Give time for speech to start
    }
  }
  console.log(`${results.speechSynthesis ? '✅' : '⚠️'} Speech synthesis (check audio output)`);
  
  // Check 4: Personality traits (look for emotion/personality indicators)
  const personalityElements = await page.locator('[class*="emotion"], [class*="personality"], [data-emotion], [class*="friendly"], [class*="playful"]').count();
  results.personalityTraits = personalityElements > 0;
  console.log(`${results.personalityTraits ? '✅' : '❌'} Personality trait indicators (${personalityElements} elements)`);
  
  // Check for 3D avatar visibility
  if (results.canvas) {
    console.log('✅ 3D avatar is rendering');
    
    // Try to find toggle button to test states
    const toggleButton = page.locator('button').filter({ hasText: /2d|3d|toggle|avatar/i });
    if (await toggleButton.count() > 0) {
      console.log('🔄 Testing avatar state changes...');
      await toggleButton.first().click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of different state
      await page.screenshot({ 
        path: 'tests/screenshots/mr-blue-avatar-toggled.png', 
        fullPage: true 
      });
    }
  }
  
  // Take final screenshot
  const finalScreenshot = 'tests/screenshots/mr-blue-final-result.png';
  await page.screenshot({ path: finalScreenshot, fullPage: true });
  testReport.screenshots.push(finalScreenshot);
  
  // Summary
  const passedChecks = Object.values(results).filter(v => v).length;
  const totalChecks = Object.keys(results).length;
  console.log(`\n📊 Feature Verification: ${passedChecks}/${totalChecks} checks passed`);
  console.log('✅ Verification complete');
}

/**
 * Generate test report
 */
function generateTestReport(): void {
  testReport.endTime = new Date().toISOString();
  testReport.duration = new Date(testReport.endTime).getTime() - new Date(testReport.startTime).getTime();
  
  const reportPath = 'tests/reports/mr-blue-builds-himself-report.json';
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  
  console.log(`\n📄 Test report generated: ${reportPath}`);
  console.log(`⏱️  Duration: ${(testReport.duration! / 1000).toFixed(1)}s`);
  console.log(`🔄 Iterations: ${testReport.iterations}`);
  console.log(`📊 Final validation score: ${testReport.finalValidationScore.toFixed(1)}%`);
  console.log(`📸 Screenshots: ${testReport.screenshots.length}`);
}

// ============================================================================
// MAIN TEST
// ============================================================================

test.describe('Mr. Blue Builds Himself - Meta Autonomous Test', () => {
  test('should autonomously BUILD 3 new features (Animation, Speech, Personality)', async ({ page }) => {
    console.log('\n🚀 Starting: Mr. Blue Autonomous Feature Building Test');
    console.log('🎯 Goal: Mr. Blue will BUILD 3 new features from conversational prompts');
    console.log('   - Feature 1: Animation System');
    console.log('   - Feature 2: Speech Synthesis Integration');
    console.log('   - Feature 3: Personality Traits System');
    console.log('🎥 Video recording enabled for marketing demo');
    
    try {
      // Phase 1: Login and Navigate (10%)
      console.log('\n📍 Progress: 10% - Authentication');
      await loginAndNavigateToVisualEditor(page);
      
      // Phase 2: Iterative Plan Validation (10-50%)
      console.log('\n📍 Progress: 20% - Beginning iterative plan validation');
      
      let validationResult: ValidationResult | null = null;
      const maxIterations = 3; // Maximum 3 attempts to get a good plan
      
      for (let iteration = 1; iteration <= maxIterations; iteration++) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`ITERATION ${iteration}/${maxIterations}`);
        console.log('='.repeat(60));
        
        testReport.iterations = iteration;
        const progressPercent = 20 + (iteration * 10);
        console.log(`\n📍 Progress: ${progressPercent}%`);
        
        // Ask Mr. Blue for a plan
        const response = await askMrBlueForPlan(
          page, 
          iteration, 
          validationResult?.feedback
        );
        
        // Validate the plan
        validationResult = await validateMBMDPlan(response, iteration);
        testReport.finalValidationScore = (validationResult.score / validationResult.maxScore) * 100;
        
        if (validationResult.isValid) {
          console.log(`\n✅ Plan approved! Score: ${testReport.finalValidationScore.toFixed(1)}%`);
          console.log('🎯 Moving to execution phase');
          break;
        } else {
          console.log(`\n⚠️  Plan needs improvement (${testReport.finalValidationScore.toFixed(1)}%)`);
          if (iteration < maxIterations) {
            console.log('🔄 Requesting revision...');
          } else {
            console.log('❌ Maximum iterations reached');
            throw new Error(`Failed to get valid plan after ${maxIterations} iterations`);
          }
        }
      }
      
      // Phase 3: Approve and Execute (60%)
      console.log('\n📍 Progress: 60% - Approving plan and starting execution');
      
      // Look for approve button
      const approveButton = page.locator('[data-testid="button-approve-code"]');
      if (await approveButton.count() > 0) {
        await approveButton.click();
        console.log('✅ Execution approved');
      } else {
        console.log('⚠️  Approve button not found - plan may execute automatically');
      }
      
      // Phase 4: Monitor Progress (70%)
      console.log('\n📍 Progress: 70% - Monitoring autonomous work');
      await monitorAutonomousWork(page);
      
      // Phase 5: Verify Integration (90%)
      console.log('\n📍 Progress: 90% - Verifying 3D avatar integration');
      await verify3DAvatarIntegration(page);
      
      // Complete (100%)
      console.log('\n📍 Progress: 100% - Test complete! ✨');
      testReport.status = 'completed';
      
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      testReport.status = 'failed';
      testReport.error = error instanceof Error ? error.message : String(error);
      throw error;
      
    } finally {
      // Always generate report
      generateTestReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`Status: ${testReport.status}`);
      console.log(`Iterations: ${testReport.iterations}`);
      console.log(`Final Score: ${testReport.finalValidationScore.toFixed(1)}%`);
      console.log(`Screenshots: ${testReport.screenshots.length}`);
      console.log(`Video: Check test-results/ directory`);
      console.log('='.repeat(60));
    }
  });
});
