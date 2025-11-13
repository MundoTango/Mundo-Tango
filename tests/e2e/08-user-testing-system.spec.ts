import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';
import { navigateToPage, verifyOnPage, waitForPageLoad } from '../helpers/navigation';
import {
  createTestingSession,
  scheduleSession,
  generateAITasks,
  acceptAITasks,
  startSessionRecording,
  optimizeSession,
  viewCompletedSessions,
  playSessionRecording,
  viewHeatmaps,
  viewTimeOnTask,
  analyzeInteractions,
  verifyConfusionIndicators,
  extractInsights,
  verifyUsabilityIssues,
  viewKnowledgeBase,
  verifyPatternRecognition,
  createBugReport,
  submitBugReport,
  viewUXBacklog,
  viewLearningsDocumentation,
  filterSessionsByFeature,
  viewSessionDetails,
  addSessionParticipant,
  verifyDailyCoIntegration,
} from '../helpers/userTesting';
import {
  testSession,
  aiGeneratedTasks,
  sessionOptimizationResults,
} from '../fixtures/userTesting';

/**
 * WAVE 5 BATCH 2: USER TESTING PLATFORM TESTS
 * Comprehensive E2E tests for session management, AI analysis, and insights
 */

test.describe('User Testing: Session Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should create and schedule testing session', async ({ page }) => {
    // Create session
    await createTestingSession(page, testSession);
    
    // Verify session form populated
    await expect(page.getByTestId('input-feature-to-test')).toHaveValue(testSession.featureToTest);
    
    // Verify tasks added
    for (const task of testSession.tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
    
    // Schedule session
    const sessionId = await scheduleSession(page, {
      date: testSession.sessionDate,
      time: testSession.sessionTime
    });
    
    // Verify redirect to session detail
    await expect(page.url()).toContain(`/user-testing/session/${sessionId}`);
    
    // Verify session details
    await expect(page.getByTestId('session-feature')).toContainText(testSession.featureToTest);
    await expect(page.getByTestId('session-duration')).toContainText(testSession.duration.toString());
  });

  test('should generate AI tasks with Session Orchestrator (Agent #163)', async ({ page }) => {
    await createTestingSession(page, testSession);
    
    // Generate AI tasks
    await generateAITasks(page);
    
    // Verify tasks generated
    await expect(page.getByTestId('ai-generated-tasks')).toBeVisible({ timeout: 15000 });
    
    const tasks = await page.getByTestId(/suggested-task-\d+/).all();
    expect(tasks.length).toBeGreaterThan(0);
    
    // Accept AI tasks
    await acceptAITasks(page);
    
    // Verify tasks added
    await expect(page.getByTestId('task-list')).toBeVisible();
  });

  test('should start session recording', async ({ page }) => {
    // Schedule and start session
    await createTestingSession(page, testSession);
    const sessionId = await scheduleSession(page, {
      date: testSession.sessionDate,
      time: testSession.sessionTime
    });
    
    // Start recording
    await startSessionRecording(page, sessionId);
    
    // Verify recording started
    await expect(page.getByTestId('recording-status')).toHaveText(/recording|active/i);
    
    // Check for Daily.co integration
    const hasDailyCo = await verifyDailyCoIntegration(page);
    
    if (hasDailyCo) {
      // Verify video elements
      await expect(page.getByTestId('local-video')).toBeVisible();
      await expect(page.getByTestId('video-controls')).toBeVisible();
    }
  });

  test('should optimize session with AI recommendations', async ({ page }) => {
    await createTestingSession(page, testSession);
    
    // Optimize session
    await optimizeSession(page);
    
    // Verify optimization results
    await expect(page.getByTestId('session-optimization-results')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('optimal-duration')).toBeVisible();
    await expect(page.getByTestId('task-flow-generation')).toBeVisible();
    await expect(page.getByTestId('participant-matching')).toBeVisible();
    await expect(page.getByTestId('recording-quality-monitoring')).toBeVisible();
    await expect(page.getByTestId('real-time-guidance')).toBeVisible();
  });
});

test.describe('User Testing: Interaction Analysis', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should playback session recording with heatmaps', async ({ page }) => {
    // View completed sessions
    await viewCompletedSessions(page);
    
    // Verify sessions list
    await expect(page.getByTestId('completed-sessions-list')).toBeVisible();
    
    // Play session recording
    await playSessionRecording(page, 1);
    
    // Verify recording player
    await expect(page.getByTestId('session-recording-player')).toBeVisible();
    await expect(page.getByTestId('playback-progress')).toBeVisible();
    
    // View heatmaps
    await viewHeatmaps(page);
    
    // Verify heatmap visualizations
    await expect(page.getByTestId('mouse-movement-heatmap')).toBeVisible();
    await expect(page.getByTestId('click-pattern-heatmap')).toBeVisible();
    await expect(page.getByTestId('scroll-behavior-heatmap')).toBeVisible();
  });

  test('should view time-on-task measurements', async ({ page }) => {
    await navigateToPage(page, '/user-testing/session/1');
    
    // View time on task
    await viewTimeOnTask(page);
    
    // Verify chart displayed
    await expect(page.getByTestId('task-duration-chart')).toBeVisible();
  });

  test('should analyze interactions with AI Agent #164', async ({ page }) => {
    await navigateToPage(page, '/user-testing/session/1');
    
    // Analyze interactions
    await analyzeInteractions(page);
    
    // Verify analysis results
    await expect(page.getByTestId('interaction-analysis-results')).toBeVisible({ timeout: 20000 });
    
    // Verify confusion indicators
    await expect(page.getByTestId('confusion-indicators')).toBeVisible();
    await verifyConfusionIndicators(page);
    
    // Verify frustration detection
    await expect(page.getByTestId('frustration-detection')).toBeVisible();
    
    // Verify success paths
    await expect(page.getByTestId('success-path-identification')).toBeVisible();
    
    // Verify timeline
    await expect(page.getByTestId('interaction-timeline')).toBeVisible();
  });
});

test.describe('User Testing: Insight Extraction & Knowledge Base', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should extract insights with AI Agent #165 (Whisper API)', async ({ page }) => {
    await navigateToPage(page, '/user-testing/session/1');
    
    // Extract insights
    await extractInsights(page);
    
    // Verify insights extracted (may take longer for Whisper transcription)
    await expect(page.getByTestId('extracted-insights')).toBeVisible({ timeout: 25000 });
    
    // Verify insight components
    await expect(page.getByTestId('key-problems')).toBeVisible();
    await expect(page.getByTestId('pain-points')).toBeVisible();
    await expect(page.getByTestId('feature-requests')).toBeVisible();
    await expect(page.getByTestId('usability-issues')).toBeVisible();
    await expect(page.getByTestId('improvement-suggestions')).toBeVisible();
    await expect(page.getByTestId('priority-ranking')).toBeVisible();
    
    // Verify usability issue categorization
    await verifyUsabilityIssues(page, ['critical', 'moderate', 'minor']);
  });

  test('should view knowledge base with AI Agent #166', async ({ page }) => {
    // View knowledge base
    await viewKnowledgeBase(page);
    
    // Verify dashboard
    await expect(page.getByTestId('knowledge-base-dashboard')).toBeVisible();
    
    // Verify pattern recognition
    await verifyPatternRecognition(page);
    
    await expect(page.getByTestId('pattern-recognition')).toBeVisible();
    await expect(page.getByTestId('common-issues-aggregation')).toBeVisible();
    await expect(page.getByTestId('best-practices')).toBeVisible();
    await expect(page.getByTestId('design-system-recommendations')).toBeVisible();
  });

  test('should create automated bug report', async ({ page }) => {
    await navigateToPage(page, '/user-testing/session/1');
    
    // Extract insights first
    await extractInsights(page);
    
    // Create bug report
    await createBugReport(page);
    
    // Verify form pre-filled
    await expect(page.getByTestId('bug-report-form')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('input-bug-title')).toHaveValue(/.+/);
    await expect(page.getByTestId('textarea-bug-description')).toHaveValue(/.+/);
    
    // Submit bug report
    await submitBugReport(page);
    
    // Verify created
    await expect(page.getByText(/bug.*report.*created|ticket.*created/i)).toBeVisible();
  });

  test('should view UX improvement backlog', async ({ page }) => {
    await viewKnowledgeBase(page);
    
    // View backlog
    await viewUXBacklog(page);
    
    // Verify backlog items
    await expect(page.getByTestId('ux-backlog-list')).toBeVisible();
    
    const items = await page.getByTestId(/backlog-item-\d+/).all();
    expect(items.length).toBeGreaterThan(0);
  });

  test('should view learnings documentation', async ({ page }) => {
    await viewKnowledgeBase(page);
    
    // View learnings
    await viewLearningsDocumentation(page);
    
    // Verify documentation
    await expect(page.getByTestId('learnings-documentation')).toBeVisible();
  });
});

test.describe('User Testing: Session Management & Filtering', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should filter sessions by feature', async ({ page }) => {
    await navigateToPage(page, '/user-testing/dashboard');
    
    // Filter sessions
    await filterSessionsByFeature(page, 'Event Registration');
    
    // Verify filtered results
    const sessions = await page.getByTestId(/session-card-\d+/).all();
    
    for (const session of sessions) {
      await expect(session).toContainText(/Event Registration/i);
    }
  });

  test('should view session details', async ({ page }) => {
    await viewSessionDetails(page, 1);
    
    // Verify details displayed
    await expect(page.getByTestId('session-feature')).toBeVisible();
    await expect(page.getByTestId('session-duration')).toBeVisible();
    await expect(page.getByTestId('session-participants')).toBeVisible();
    await expect(page.getByTestId('session-tasks')).toBeVisible();
  });

  test('should add session participants', async ({ page }) => {
    await navigateToPage(page, '/user-testing/session/1');
    
    // Add internal participant
    await addSessionParticipant(page, 'internal.tester@example.com', 'internal');
    
    // Verify added
    await expect(page.getByText('internal.tester@example.com')).toBeVisible();
    
    // Add external participant
    await addSessionParticipant(page, 'external.user@example.com', 'external');
    
    // Verify added
    await expect(page.getByText('external.user@example.com')).toBeVisible();
  });
});

test.describe('User Testing: Performance & Usability', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load user testing pages within performance targets', async ({ page }) => {
    const pages = [
      '/user-testing/dashboard',
      '/user-testing/session/1',
      '/user-testing/knowledge-base'
    ];
    
    for (const url of pages) {
      const loadTime = await waitForPageLoad(page, 3000);
      await navigateToPage(page, url);
      
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should persist session data across page reloads', async ({ page }) => {
    // Create session
    await createTestingSession(page, testSession);
    const sessionId = await scheduleSession(page, {
      date: testSession.sessionDate,
      time: testSession.sessionTime
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data persists
    await expect(page.getByTestId('session-feature')).toContainText(testSession.featureToTest);
  });
});
