/**
 * MB.MD Pattern 50: Pre-Authenticated Playwright Testing
 * Talent Match Interview - Full 20 Question Flow
 * 
 * Uses saved auth state to skip login and go directly to interview
 * Run auth.setup.ts first: npx playwright test --project=setup
 */

import { test, expect } from '@playwright/test';
import { AUTH_STATE_PATH } from './e2e/helpers/test-auth';

test.use({ storageState: AUTH_STATE_PATH });

const RESUME_ANSWERS = [
  "I have 5 years of experience with React, TypeScript, and Node.js.",
  "My strongest skills are frontend architecture and API design.",
  "I'm most proud of building a real-time collaboration platform.",
  "I want to use more AI/ML technologies in my work.",
  "I focus on user experience, performance, and accessibility.",
  "Yes, I've contributed to several open source projects on GitHub.",
  "I prefer collaborative work with regular code reviews.",
  "I learn by building prototypes and reading documentation.",
  "I want to help connect global communities through technology.",
  "I also have DevOps experience with Docker and cloud platforms."
];

const WORK_ANSWERS = [
  "I'm most interested in frontend development and AI features.",
  "I'd love to work on the event discovery and matching features.",
  "Technical development and problem-solving energize me most.",
  "I can commit 15-20 hours per week to volunteer work.",
  "I enjoy both independent deep work and team collaboration.",
  "Yes, I'm very comfortable with pair programming sessions.",
  "I have 5 years of agile development experience with sprints.",
  "Very comfortable with Git, GitHub workflows, and code reviews.",
  "I prefer working on new features but can also fix bugs.",
  "Slack or Discord works best for me for communication."
];

test.describe('Talent Match Interview - Full 20 Questions', () => {
  test.setTimeout(300000);

  test('complete interview with personalized AI responses', async ({ page }) => {
    await page.goto('/talent-match');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    console.log('[Test] On Talent Match page, looking for start button...');
    
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Get Started"), [data-testid*="start"]').first();
    
    if (await startButton.isVisible({ timeout: 5000 })) {
      await startButton.click();
      await page.waitForTimeout(2000);
    }
    
    await page.waitForURL(url => url.pathname.includes('/talent-match'), { timeout: 10000 });
    
    const interviewInput = page.locator('[data-testid="input-interview-answer"]');
    const sendButton = page.locator('[data-testid="button-send-answer"]');
    
    const inputVisible = await interviewInput.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (!inputVisible) {
      console.log('[Test] Interview input not found, may need to start interview first');
      const anyStartButton = page.locator('button').filter({ hasText: /start|begin|interview/i }).first();
      if (await anyStartButton.isVisible()) {
        await anyStartButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    console.log('[Test] Starting Phase 1: Resume Deep-Dive...');
    
    for (let i = 0; i < RESUME_ANSWERS.length; i++) {
      const questionNum = i + 1;
      console.log(`[Test] Phase 1 - Question ${questionNum}/10`);
      
      await expect(interviewInput).toBeVisible({ timeout: 15000 });
      
      const aiMessage = await page.locator('[data-testid^="message-assistant"]').last().textContent();
      console.log(`[Test] AI Question: ${aiMessage?.substring(0, 100)}...`);
      
      await interviewInput.fill(RESUME_ANSWERS[i]);
      await sendButton.click();
      
      await page.waitForTimeout(3000);
      
      const progressText = await page.locator('text=/Resume.*\\(\\d+\\/10\\)/').textContent().catch(() => '');
      console.log(`[Test] Progress: ${progressText}`);
    }
    
    console.log('[Test] Phase 1 complete, transitioning to Phase 2...');
    await page.waitForTimeout(2000);
    
    const phase2Badge = page.locator('text=/Phase 2|Work Assignment/i');
    await expect(phase2Badge).toBeVisible({ timeout: 15000 });
    
    console.log('[Test] Starting Phase 2: Work Assignment Matching...');
    
    for (let i = 0; i < WORK_ANSWERS.length; i++) {
      const questionNum = i + 1;
      console.log(`[Test] Phase 2 - Question ${questionNum}/10`);
      
      await expect(interviewInput).toBeVisible({ timeout: 15000 });
      
      const aiMessage = await page.locator('[data-testid^="message-assistant"]').last().textContent();
      console.log(`[Test] AI Question: ${aiMessage?.substring(0, 100)}...`);
      
      await interviewInput.fill(WORK_ANSWERS[i]);
      await sendButton.click();
      
      await page.waitForTimeout(3000);
      
      const progressText = await page.locator('text=/Work Assignment.*\\(\\d+\\/10\\)/').textContent().catch(() => '');
      console.log(`[Test] Progress: ${progressText}`);
    }
    
    console.log('[Test] Phase 2 complete, verifying completion...');
    
    const completeBadge = page.locator('text=/Interview Complete|complete/i');
    await expect(completeBadge).toBeVisible({ timeout: 15000 });
    
    const completionMessage = await page.locator('[data-testid^="message-assistant"]').last().textContent();
    console.log(`[Test] Completion message: ${completionMessage?.substring(0, 200)}...`);
    
    expect(completionMessage).toBeTruthy();
    expect(completionMessage!.length).toBeGreaterThan(50);
    
    const progressBar = page.locator('[data-testid="progress-interview"]');
    const progressValue = await progressBar.getAttribute('value').catch(() => null) || 
                          await progressBar.getAttribute('aria-valuenow').catch(() => null);
    console.log(`[Test] Final progress: ${progressValue}%`);
    
    await page.screenshot({ path: 'test-results/talent-match-complete.png', fullPage: true });
    
    console.log('[Test] ✅ Interview completed successfully!');
  });

  test('navigate to Volunteer Dashboard and verify data', async ({ page }) => {
    await page.goto('/h2ac-dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const dashboardTitle = page.locator('h1, h2').filter({ hasText: /volunteer|dashboard|h2ac/i }).first();
    await expect(dashboardTitle).toBeVisible({ timeout: 10000 });
    
    const titleText = await dashboardTitle.textContent();
    console.log(`[Test] Dashboard title: ${titleText}`);
    
    const metricsCards = page.locator('[class*="card"]').filter({ hasText: /matches|tasks|skill|agents/i });
    const cardCount = await metricsCards.count();
    console.log(`[Test] Found ${cardCount} metric cards`);
    
    const opportunitiesSection = page.locator('text=/opportunities|matches|assignments/i').first();
    if (await opportunitiesSection.isVisible({ timeout: 5000 })) {
      console.log('[Test] ✅ Opportunities section visible');
    }
    
    await page.screenshot({ path: 'test-results/volunteer-dashboard.png', fullPage: true });
    
    console.log('[Test] ✅ Dashboard verification complete');
  });
});
