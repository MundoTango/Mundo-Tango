import { Router, Request, Response } from 'express';
import { sessionOrchestrator } from '../services/userTesting/SessionOrchestrator';
import { interactionAnalyzer } from '../services/userTesting/InteractionAnalyzer';
import { insightExtractor } from '../services/userTesting/InsightExtractor';
import { knowledgeBaseManager } from '../services/userTesting/KnowledgeBaseManager';

const router = Router();

router.post('/orchestrate-session', async (req: Request, res: Response) => {
  try {
    const { projectId, requirements } = req.body;

    const sessionPlan = await sessionOrchestrator.scheduleSession(projectId, requirements);

    const durationOptimization = await sessionOrchestrator.optimizeDuration(
      sessionPlan.tasks
    );

    res.json({
      success: true,
      data: {
        ...sessionPlan,
        durationOptimization
      }
    });
  } catch (error: any) {
    console.error('Session orchestration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze-interactions', async (req: Request, res: Response) => {
  try {
    const { sessionId, mouseEvents, clickEvents, scrollEvents, interactions, behaviors } =
      req.body;

    const [heatmap, clickPatterns, scrollBehavior, confusionIndicators, frustration] =
      await Promise.all([
        interactionAnalyzer.analyzeMouseMovements(sessionId, mouseEvents),
        interactionAnalyzer.analyzeClickPatterns(sessionId, clickEvents),
        interactionAnalyzer.trackScrollBehavior(sessionId, scrollEvents),
        interactionAnalyzer.detectConfusion(sessionId, interactions),
        interactionAnalyzer.detectFrustration(sessionId, behaviors)
      ]);

    const analysis = {
      heatmap,
      clickPatterns,
      scrollBehavior,
      confusionIndicators,
      frustrationScore: frustration.score
    };

    const report = await interactionAnalyzer.generateReport(sessionId, analysis);

    res.json({
      success: true,
      data: {
        analysis,
        report
      }
    });
  } catch (error: any) {
    console.error('Interaction analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/extract-insights', async (req: Request, res: Response) => {
  try {
    const { sessionId, audioUrl, interactionData } = req.body;

    const transcripts = await insightExtractor.transcribeAudio(audioUrl, sessionId);

    const [issues, painPoints, featureRequests] = await Promise.all([
      insightExtractor.identifyProblems(sessionId, transcripts, interactionData),
      insightExtractor.extractPainPoints(sessionId, transcripts),
      insightExtractor.detectFeatureRequests(sessionId, transcripts)
    ]);

    const categorizedIssues = await insightExtractor.categorizeIssues(issues);

    const improvements = await insightExtractor.generateImprovements(
      sessionId,
      issues,
      painPoints
    );

    const report = await insightExtractor.generateReport(sessionId, {
      transcripts,
      issues,
      painPoints,
      featureRequests
    });

    res.json({
      success: true,
      data: {
        transcripts,
        issues: categorizedIssues,
        painPoints,
        featureRequests,
        improvements,
        report
      }
    });
  } catch (error: any) {
    console.error('Insight extraction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/knowledge-base/analyze', async (req: Request, res: Response) => {
  try {
    const { sessions } = req.body;

    const [patterns, commonIssues, bestPractices] = await Promise.all([
      knowledgeBaseManager.recognizePatterns(sessions),
      knowledgeBaseManager.aggregateCommonIssues(sessions),
      knowledgeBaseManager.identifyBestPractices(
        sessions.filter((s: any) => s.successMetrics)
      )
    ]);

    const designRecommendations = await knowledgeBaseManager.generateDesignRecommendations(
      commonIssues,
      patterns
    );

    const backlog = await knowledgeBaseManager.generateUXBacklog(
      designRecommendations,
      commonIssues
    );

    res.json({
      success: true,
      data: {
        patterns,
        commonIssues,
        bestPractices,
        designRecommendations,
        backlog
      }
    });
  } catch (error: any) {
    console.error('Knowledge base analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/create-bug-report', async (req: Request, res: Response) => {
  try {
    const { issue, sessionDetails } = req.body;

    const bugReport = await knowledgeBaseManager.createBugReport(issue, sessionDetails);

    res.json({
      success: true,
      data: bugReport
    });
  } catch (error: any) {
    console.error('Bug report creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/document-learnings', async (req: Request, res: Response) => {
  try {
    const { sessions } = req.body;

    const documentation = await knowledgeBaseManager.documentLearnings(sessions);

    res.json({
      success: true,
      data: { documentation }
    });
  } catch (error: any) {
    console.error('Documentation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
