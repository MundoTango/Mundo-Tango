/**
 * FINANCIAL AGENT WORKER
 * BullMQ worker that runs the 33-agent system every 30 seconds
 * Handles: Market monitoring, strategy execution, risk management, performance tracking
 */

import { Job } from "bullmq";
import { createWorker } from "./redis-fallback";
import { Agent105_MasterOrchestrator } from "../services/financial/AgentOrchestrator";
import { RateLimitedAIOrchestrator } from "../services/ai/integration/rate-limited-orchestrator";
import { storage } from "../storage";

// Initialize the Master Orchestrator with AI integration
const aiOrchestrator = new RateLimitedAIOrchestrator();
const masterOrchestrator = new Agent105_MasterOrchestrator(aiOrchestrator);

/**
 * Handle 30-second monitoring cycle
 */
async function handleMonitoringCycle(job: Job) {
  const { userId, portfolioValue } = job.data;

  console.log(`[Financial Agent Worker] Running monitoring cycle for user ${userId}`);

  try {
    const result = await masterOrchestrator.runMonitoringCycle(userId, portfolioValue);

    console.log(`[Financial Agent Worker] ✅ Cycle complete:`, {
      agentsRun: result.agentsRun,
      alertsGenerated: result.alerts.length,
      decision: result.decision?.finalAction || 'hold',
      errors: result.errors
    });

    return {
      success: true,
      result,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error in monitoring cycle:`, error);
    throw error;
  }
}

/**
 * Handle agent system startup
 */
async function handleSystemStart(job: Job) {
  const { userId } = job.data;

  console.log(`[Financial Agent Worker] Starting agent system for user ${userId}`);

  try {
    const result = await masterOrchestrator.start();

    console.log(`[Financial Agent Worker] ✅ System started:`, result);

    return {
      success: true,
      result,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error starting system:`, error);
    throw error;
  }
}

/**
 * Handle agent system shutdown
 */
async function handleSystemStop(job: Job) {
  const { userId } = job.data;

  console.log(`[Financial Agent Worker] Stopping agent system for user ${userId}`);

  try {
    const result = await masterOrchestrator.stop();

    console.log(`[Financial Agent Worker] ✅ System stopped:`, result);

    return {
      success: true,
      result,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error stopping system:`, error);
    throw error;
  }
}

/**
 * Handle manual agent override
 */
async function handleAgentOverride(job: Job) {
  const { userId, agentId, status } = job.data;

  console.log(`[Financial Agent Worker] Overriding agent ${agentId} to ${status} for user ${userId}`);

  try {
    const result = await masterOrchestrator.overrideAgent(agentId, status);

    console.log(`[Financial Agent Worker] ✅ Agent override:`, result);

    return {
      success: true,
      result,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error overriding agent:`, error);
    throw error;
  }
}

/**
 * Handle daily performance report generation
 */
async function handleDailyReport(job: Job) {
  const { userId } = job.data;

  console.log(`[Financial Agent Worker] Generating daily report for user ${userId}`);

  try {
    // Get recent trades and performance metrics
    const portfolios = await storage.getFinancialPortfoliosByUserId(userId);
    
    if (portfolios.length === 0) {
      console.log(`[Financial Agent Worker] No portfolios found for user ${userId}`);
      return {
        success: true,
        message: 'No portfolios to report on',
        timestamp: new Date()
      };
    }

    const portfolio = portfolios[0];
    
    // Get AI decisions from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDecisions = await storage.getFinancialAIDecisionsByUserId(userId);
    const todayDecisions = recentDecisions.filter(d => 
      d.createdAt && d.createdAt >= oneDayAgo
    );

    console.log(`[Financial Agent Worker] ✅ Daily report generated: ${todayDecisions.length} decisions`);

    return {
      success: true,
      report: {
        userId,
        portfolioValue: portfolio.totalValue,
        cashBalance: portfolio.cashBalance,
        decisionsToday: todayDecisions.length,
        timestamp: new Date()
      }
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error generating daily report:`, error);
    throw error;
  }
}

/**
 * Handle weekly strategy review
 */
async function handleWeeklyReview(job: Job) {
  const { userId } = job.data;

  console.log(`[Financial Agent Worker] Generating weekly review for user ${userId}`);

  try {
    const portfolios = await storage.getFinancialPortfoliosByUserId(userId);
    
    if (portfolios.length === 0) {
      return {
        success: true,
        message: 'No portfolios to review',
        timestamp: new Date()
      };
    }

    console.log(`[Financial Agent Worker] ✅ Weekly review generated`);

    return {
      success: true,
      review: {
        userId,
        portfolios: portfolios.length,
        timestamp: new Date()
      }
    };
  } catch (error) {
    console.error(`[Financial Agent Worker] Error generating weekly review:`, error);
    throw error;
  }
}

// Create Worker with automatic Redis fallback
const financialAgentWorker = createWorker(
  "financial-agents",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "monitoring-cycle":
          return await handleMonitoringCycle(job);

        case "system-start":
          return await handleSystemStart(job);

        case "system-stop":
          return await handleSystemStop(job);

        case "agent-override":
          return await handleAgentOverride(job);

        case "daily-report":
          return await handleDailyReport(job);

        case "weekly-review":
          return await handleWeeklyReview(job);

        default:
          console.error(`Unknown job type: ${job.name}`);
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Financial Agent Worker] Job failed:`, error);
      throw error;
    }
  },
  {
    connection: {
      // Redis connection will be handled by redis-fallback
    },
    limiter: {
      max: 60, // Max 60 jobs per interval
      duration: 60000 // 1 minute interval
    }
  }
);

// Event Handlers
financialAgentWorker.on("completed", (job) => {
  console.log(`✅ Financial Agent job ${job.id} (${job.name}) completed`);
});

financialAgentWorker.on("failed", (job, err) => {
  console.error(`❌ Financial Agent job ${job?.id} (${job?.name}) failed:`, err.message);
});

financialAgentWorker.on("error", (err) => {
  console.error(`❌ Financial Agent Worker error:`, err);
});

console.log("🚀 Financial Agent Automation Worker started");
console.log("📊 33-Agent System Ready for 30-Second Monitoring Cycles");

export default financialAgentWorker;
