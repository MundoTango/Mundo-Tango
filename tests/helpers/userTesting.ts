import { Page, expect } from '@playwright/test';

/**
 * User Testing Platform Helper - Session management, AI analysis, insights
 */

export async function createTestingSession(page: Page, sessionData: {
  featureToTest: string;
  tasks: string[];
  duration: number;
  participants?: string[];
}) {
  await page.goto('/user-testing/dashboard');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-create-session').click();
  await page.waitForSelector('[data-testid="session-form"]');
  
  await page.getByTestId('input-feature-to-test').fill(sessionData.featureToTest);
  await page.getByTestId('input-session-duration').fill(sessionData.duration.toString());
  
  // Add test tasks
  for (const task of sessionData.tasks) {
    await page.getByTestId('input-test-task').fill(task);
    await page.getByTestId('button-add-task').click();
  }
  
  // Add participants
  if (sessionData.participants && sessionData.participants.length > 0) {
    for (const email of sessionData.participants) {
      await page.getByTestId('input-participant-email').fill(email);
      await page.getByTestId('button-add-participant').click();
    }
  }
}

export async function scheduleSession(page: Page, scheduleData: {
  date: string;
  time: string;
}) {
  await page.getByTestId('input-session-date').fill(scheduleData.date);
  await page.getByTestId('input-session-time').fill(scheduleData.time);
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/user-testing/sessions') && response.status() === 201
  );
  
  await page.getByTestId('button-schedule-session').click();
  const response = await responsePromise;
  
  const responseData = await response.json();
  return responseData.id;
}

export async function generateAITasks(page: Page) {
  await page.getByTestId('button-ai-generate-tasks').click();
  
  // Wait for AI Session Orchestrator (Agent #163)
  await page.waitForSelector('[data-testid="ai-generated-tasks"]', { timeout: 15000 });
  
  // Verify suggested tasks displayed
  const tasks = await page.getByTestId(/suggested-task-\d+/).all();
  expect(tasks.length).toBeGreaterThan(0);
}

export async function acceptAITasks(page: Page) {
  await page.getByTestId('button-accept-ai-tasks').click();
  
  // Verify tasks added to session
  await expect(page.getByTestId('task-list')).toBeVisible();
}

export async function startSessionRecording(page: Page, sessionId: number) {
  await page.goto(`/user-testing/session/${sessionId}`);
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-start-recording').click();
  
  // Wait for Daily.co video to initialize (if implemented)
  await page.waitForSelector('[data-testid="video-container"]', { timeout: 10000 }).catch(() => {});
  
  // Verify recording started
  await expect(page.getByTestId('recording-status')).toHaveText(/recording|active/i);
}

export async function optimizeSession(page: Page) {
  await page.getByTestId('button-optimize-session').click();
  
  // Wait for AI Session Orchestrator
  await page.waitForSelector('[data-testid="session-optimization-results"]', { timeout: 15000 });
  
  // Verify optimization components
  await expect(page.getByTestId('optimal-duration')).toBeVisible();
  await expect(page.getByTestId('task-flow-generation')).toBeVisible();
  await expect(page.getByTestId('participant-matching')).toBeVisible();
  await expect(page.getByTestId('recording-quality-monitoring')).toBeVisible();
  await expect(page.getByTestId('real-time-guidance')).toBeVisible();
}

export async function viewCompletedSessions(page: Page) {
  await page.goto('/user-testing/dashboard');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('tab-completed-sessions').click();
  
  // Verify sessions list
  await expect(page.getByTestId('completed-sessions-list')).toBeVisible();
}

export async function playSessionRecording(page: Page, sessionId: number) {
  await page.getByTestId(`button-view-session-${sessionId}`).click();
  
  // Wait for recording player
  await page.waitForSelector('[data-testid="session-recording-player"]');
  
  await page.getByTestId('button-play-recording').click();
  
  // Verify recording is playing
  await expect(page.getByTestId('playback-progress')).toBeVisible();
}

export async function viewHeatmaps(page: Page) {
  await page.getByTestId('tab-heatmaps').click();
  
  // Verify heatmap visualizations
  await expect(page.getByTestId('mouse-movement-heatmap')).toBeVisible();
  await expect(page.getByTestId('click-pattern-heatmap')).toBeVisible();
  await expect(page.getByTestId('scroll-behavior-heatmap')).toBeVisible();
}

export async function viewTimeOnTask(page: Page) {
  await page.getByTestId('tab-time-on-task').click();
  
  // Verify time measurements
  await expect(page.getByTestId('task-duration-chart')).toBeVisible();
}

export async function analyzeInteractions(page: Page) {
  await page.getByTestId('button-analyze-interactions').click();
  
  // Wait for AI Interaction Analyzer (Agent #164)
  await page.waitForSelector('[data-testid="interaction-analysis-results"]', { timeout: 20000 });
  
  // Verify analysis components
  await expect(page.getByTestId('confusion-indicators')).toBeVisible();
  await expect(page.getByTestId('frustration-detection')).toBeVisible();
  await expect(page.getByTestId('success-path-identification')).toBeVisible();
  await expect(page.getByTestId('interaction-timeline')).toBeVisible();
}

export async function verifyConfusionIndicators(page: Page) {
  const indicators = ['back-button-usage', 'rapid-clicks', 'mouse-hovering', 'repeated-actions'];
  
  for (const indicator of indicators) {
    await expect(page.getByTestId(`indicator-${indicator}`)).toBeVisible();
  }
}

export async function extractInsights(page: Page) {
  await page.getByTestId('button-extract-insights').click();
  
  // Wait for AI Insight Extractor (Agent #165) with Whisper API
  await page.waitForSelector('[data-testid="extracted-insights"]', { timeout: 25000 });
  
  // Verify insight components
  await expect(page.getByTestId('key-problems')).toBeVisible();
  await expect(page.getByTestId('pain-points')).toBeVisible();
  await expect(page.getByTestId('feature-requests')).toBeVisible();
  await expect(page.getByTestId('usability-issues')).toBeVisible();
  await expect(page.getByTestId('improvement-suggestions')).toBeVisible();
  await expect(page.getByTestId('priority-ranking')).toBeVisible();
}

export async function verifyUsabilityIssues(page: Page, expectedCategories: string[]) {
  for (const category of expectedCategories) {
    await expect(
      page.getByTestId(`usability-issue-${category}`)
    ).toBeVisible();
  }
}

export async function viewKnowledgeBase(page: Page) {
  await page.goto('/user-testing/knowledge-base');
  await page.waitForLoadState('networkidle');
  
  // Verify knowledge base dashboard
  await expect(page.getByTestId('knowledge-base-dashboard')).toBeVisible();
}

export async function verifyPatternRecognition(page: Page) {
  await page.getByTestId('tab-patterns').click();
  
  // Verify AI Knowledge Base Manager (Agent #166) results
  await expect(page.getByTestId('pattern-recognition')).toBeVisible();
  await expect(page.getByTestId('common-issues-aggregation')).toBeVisible();
  await expect(page.getByTestId('best-practices')).toBeVisible();
  await expect(page.getByTestId('design-system-recommendations')).toBeVisible();
}

export async function createBugReport(page: Page) {
  await page.getByTestId('button-create-bug-report').click();
  
  // Wait for Jira ticket generation (if integrated)
  await page.waitForSelector('[data-testid="bug-report-form"]', { timeout: 10000 });
  
  // Verify form pre-filled with insights
  await expect(page.getByTestId('input-bug-title')).toHaveValue(/.+/);
  await expect(page.getByTestId('textarea-bug-description')).toHaveValue(/.+/);
}

export async function submitBugReport(page: Page) {
  const responsePromise = page.waitForResponse(
    response => (
      response.url().includes('/api/user-testing/bug-reports') ||
      response.url().includes('/api/jira')
    ) && response.status() === 201
  );
  
  await page.getByTestId('button-submit-bug-report').click();
  await responsePromise;
  
  // Verify success
  await expect(page.getByText(/bug.*report.*created|ticket.*created/i)).toBeVisible();
}

export async function viewUXBacklog(page: Page) {
  await page.getByTestId('tab-ux-backlog').click();
  
  // Verify backlog items
  await expect(page.getByTestId('ux-backlog-list')).toBeVisible();
  
  const items = await page.getByTestId(/backlog-item-\d+/).all();
  expect(items.length).toBeGreaterThan(0);
}

export async function viewLearningsDocumentation(page: Page) {
  await page.getByTestId('tab-learnings').click();
  
  // Verify documented learnings
  await expect(page.getByTestId('learnings-documentation')).toBeVisible();
}

export async function filterSessionsByFeature(page: Page, feature: string) {
  await page.getByTestId('input-filter-feature').fill(feature);
  await page.getByTestId('button-apply-filter').click();
  await page.waitForLoadState('networkidle');
  
  // Verify filtered results
  const sessions = await page.getByTestId(/session-card-\d+/).all();
  for (const session of sessions) {
    await expect(session).toContainText(new RegExp(feature, 'i'));
  }
}

export async function viewSessionDetails(page: Page, sessionId: number) {
  await page.goto(`/user-testing/session/${sessionId}`);
  await page.waitForLoadState('networkidle');
  
  // Verify session details displayed
  await expect(page.getByTestId('session-feature')).toBeVisible();
  await expect(page.getByTestId('session-duration')).toBeVisible();
  await expect(page.getByTestId('session-participants')).toBeVisible();
  await expect(page.getByTestId('session-tasks')).toBeVisible();
}

export async function addSessionParticipant(page: Page, email: string, role: 'internal' | 'external') {
  await page.getByTestId('button-add-participant').click();
  await page.waitForSelector('[data-testid="participant-form"]');
  
  await page.getByTestId('input-participant-email').fill(email);
  
  await page.getByTestId('select-participant-role').click();
  await page.getByRole('option', { name: role }).click();
  
  await page.getByTestId('button-save-participant').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/user-testing/participants') && response.status() === 201
  );
}

export async function verifyDailyCoIntegration(page: Page) {
  // Check if Daily.co video is initialized
  const videoContainer = page.getByTestId('daily-video-container');
  
  if (await videoContainer.isVisible()) {
    // Verify video elements
    await expect(page.getByTestId('local-video')).toBeVisible();
    await expect(page.getByTestId('remote-video')).toBeVisible();
    await expect(page.getByTestId('video-controls')).toBeVisible();
    
    return true;
  }
  
  return false;
}
