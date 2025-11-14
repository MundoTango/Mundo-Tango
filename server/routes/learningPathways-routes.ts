import { Router, type Request, Response } from "express";
import { learningCoordinator } from "../services/mrBlue/learningCoordinator";
import { chatFeedbackPathway } from "../services/pathways/chatFeedbackPathway";
import { volunteerTestingPathway } from "../services/pathways/volunteerTestingPathway";
import { liveSessionPathway } from "../services/pathways/liveSessionPathway";
import { visualEditorPathway } from "../services/pathways/visualEditorPathway";
import { telemetryPathway } from "../services/pathways/telemetryPathway";
import { codeGenerationPathway } from "../services/pathways/codeGenerationPathway";
import { tourCompletionPathway } from "../services/pathways/tourCompletionPathway";
import { featureUsagePathway } from "../services/pathways/featureUsagePathway";
import { errorPatternPathway } from "../services/pathways/errorPatternPathway";
import { socialSentimentPathway } from "../services/pathways/socialSentimentPathway";

export function registerLearningPathwaysRoutes(app: Router) {
  // ============================================================================
  // PATHWAY 1: CHAT FEEDBACK
  // ============================================================================

  app.post("/api/pathways/chat-feedback", async (req: Request, res: Response) => {
    try {
      const { userId, message, sentiment } = req.body;

      if (!userId || !message || !sentiment) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: userId, message, sentiment"
        });
      }

      await chatFeedbackPathway.captureFeedback(userId, message, sentiment);

      res.json({
        success: true,
        message: "Feedback captured successfully"
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error capturing chat feedback:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/chat-feedback/bug-reports", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const bugReports = await chatFeedbackPathway.getBugReports(limit);

      res.json({
        success: true,
        bugReports
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting bug reports:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 2: VOLUNTEER TESTING
  // ============================================================================

  app.get("/api/pathways/volunteer-insights", async (req: Request, res: Response) => {
    try {
      const stats = await volunteerTestingPathway.getBugStatistics(7);
      const stuckPoints = await volunteerTestingPathway.findCommonStuckPoints();
      const problematicScenarios = await volunteerTestingPathway.identifyProblematicScenarios();

      res.json({
        success: true,
        insights: {
          bugStatistics: stats,
          stuckPoints,
          problematicScenarios
        }
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting volunteer insights:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/volunteer-insights/scenario/:scenarioId", async (req: Request, res: Response) => {
    try {
      const scenarioId = parseInt(req.params.scenarioId);
      const insight = await volunteerTestingPathway.aggregateTestResults(scenarioId);

      res.json({
        success: true,
        insight
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting scenario insights:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 3: LIVE TESTING SESSIONS
  // ============================================================================

  app.get("/api/pathways/live-session/:id/insights", async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const insight = await liveSessionPathway.analyzeSession(sessionId);
      const learnings = await liveSessionPathway.extractLearnings(sessionId);

      res.json({
        success: true,
        insight,
        learnings
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error analyzing live session:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/live-session/trends", async (req: Request, res: Response) => {
    try {
      const trends = await liveSessionPathway.compareSessionsOverTime();

      res.json({
        success: true,
        trends
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting session trends:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 4: VISUAL EDITOR INTEGRATION
  // ============================================================================

  app.post("/api/pathways/visual-editor/track", async (req: Request, res: Response) => {
    try {
      const { userId, elementId, success } = req.body;

      if (!userId || !elementId || success === undefined) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: userId, elementId, success"
        });
      }

      await visualEditorPathway.trackElementEdit(userId, elementId, success);

      res.json({
        success: true,
        message: "Edit tracking recorded"
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error tracking visual editor edit:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/visual-editor/problematic-elements", async (req: Request, res: Response) => {
    try {
      const elements = await visualEditorPathway.findProblematicElements();
      const suggestions = await visualEditorPathway.suggestEditorImprovements();

      res.json({
        success: true,
        problematicElements: elements,
        suggestions
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting problematic elements:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 5: PASSIVE TELEMETRY
  // ============================================================================

  app.get("/api/pathways/telemetry/analyze", async (req: Request, res: Response) => {
    try {
      const pagePath = req.query.page as string;
      const summary = await telemetryPathway.getTelemetrySummary(7);
      const deadEnds = await telemetryPathway.findDeadEnds();
      const rageClicks = await telemetryPathway.detectRageClicks();

      let scrollData = null;
      if (pagePath) {
        scrollData = await telemetryPathway.analyzeScrollDepth(pagePath);
      }

      res.json({
        success: true,
        telemetry: {
          summary,
          deadEnds,
          rageClicks,
          scrollDepth: scrollData
        }
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error analyzing telemetry:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 6: CODE GENERATION FEEDBACK
  // ============================================================================

  app.post("/api/pathways/code-feedback", async (req: Request, res: Response) => {
    try {
      const { suggestionId, wasHelpful, feedbackText } = req.body;

      if (!suggestionId || wasHelpful === undefined) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: suggestionId, wasHelpful"
        });
      }

      await codeGenerationPathway.recordFeedback(suggestionId, wasHelpful, feedbackText);

      res.json({
        success: true,
        message: "Code feedback recorded"
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error recording code feedback:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/code-feedback/statistics", async (req: Request, res: Response) => {
    try {
      const stats = await codeGenerationPathway.getFeedbackStatistics(7);
      const patterns = await codeGenerationPathway.identifyFailurePatterns();

      res.json({
        success: true,
        statistics: stats,
        failurePatterns: patterns
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting code feedback statistics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 7: TOUR COMPLETION RATES
  // ============================================================================

  app.get("/api/pathways/tour-completion/:tourId", async (req: Request, res: Response) => {
    try {
      const tourId = req.params.tourId;
      const days = parseInt(req.query.days as string) || 7;

      const analytics = await tourCompletionPathway.getTourAnalytics(tourId, days);
      const suggestions = await tourCompletionPathway.improveSteps();

      res.json({
        success: true,
        tourId,
        analytics,
        suggestions
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting tour completion data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 8: FEATURE USAGE ANALYTICS
  // ============================================================================

  app.get("/api/pathways/feature-usage", async (req: Request, res: Response) => {
    try {
      const featureUsage = await featureUsagePathway.getFeatureUsage();
      const unusedFeatures = await featureUsagePathway.findUnusedFeatures();
      const churnPredictions = await featureUsagePathway.predictChurn();

      res.json({
        success: true,
        featureUsage,
        unusedFeatures,
        churnPredictions
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting feature usage analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/feature-usage/:feature/trend", async (req: Request, res: Response) => {
    try {
      const feature = req.params.feature;
      const days = parseInt(req.query.days as string) || 30;

      const trend = await featureUsagePathway.getFeatureAdoptionTrend(feature, days);

      res.json({
        success: true,
        feature,
        trend
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting feature trend:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 9: ERROR PATTERN RECOGNITION
  // ============================================================================

  app.get("/api/pathways/errors", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = await errorPatternPathway.getErrorStatistics(days);
      const categories = await errorPatternPathway.groupByCategory();
      const prioritized = await errorPatternPathway.prioritizeErrors();

      res.json({
        success: true,
        errorAnalysis: {
          statistics: stats,
          categories,
          prioritizedErrors: prioritized.slice(0, 10)
        }
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting error patterns:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY 10: SOCIAL SENTIMENT ANALYSIS
  // ============================================================================

  app.get("/api/pathways/sentiment", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const analysis = await socialSentimentPathway.analyzePosts(limit);
      const frustration = await socialSentimentPathway.detectFrustration();
      const featureRequests = await socialSentimentPathway.extractFeatureRequests();

      res.json({
        success: true,
        sentimentAnalysis: {
          ...analysis,
          frustration,
          featureRequests
        }
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error analyzing social sentiment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/pathways/sentiment/trend", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const trend = await socialSentimentPathway.getSentimentTrend(days);

      res.json({
        success: true,
        trend
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting sentiment trend:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // ORCHESTRATION: RUN ALL PATHWAYS
  // ============================================================================

  app.post("/api/pathways/run-all", async (req: Request, res: Response) => {
    try {
      const results = await learningCoordinator.runAllPathways();

      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length,
          totalDataCollected: results.reduce((sum, r) => sum + r.dataCollected, 0)
        }
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error running all pathways:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // WEEKLY REPORT
  // ============================================================================

  app.get("/api/pathways/weekly-report", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
      const report = await learningCoordinator.generateReport(userId);

      res.json({
        success: true,
        report
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error generating weekly report:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================================================
  // PATHWAY STATUS
  // ============================================================================

  app.get("/api/pathways/status", async (req: Request, res: Response) => {
    try {
      const status = await learningCoordinator.getPathwayStatus();

      res.json({
        success: true,
        pathways: status,
        totalPathways: status.length,
        activePathways: status.filter(p => p.status === 'active').length
      });
    } catch (error) {
      console.error('[Learning Pathways API] Error getting pathway status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Learning Pathways routes registered');
}
