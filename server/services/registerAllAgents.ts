/**
 * Register All 140+ Agents for MB.MD Pattern 99
 * Multi-Agent Site Auditor System
 * 
 * Registers all agents documented in Mr Blue/agents/overview.md
 */

import { agentCardRegistry } from './AgentCardRegistry';
import type { AgentCard } from '@shared/types/a2a';

const createAgentCard = (
  id: string,
  name: string,
  description: string,
  capabilities: string[],
  domain: string
): AgentCard => ({
  id,
  name,
  description,
  capabilities: [...capabilities, domain, 'ai-powered'],
  inputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      context: { type: 'object' }
    },
    required: ['message']
  },
  outputSchema: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      recommendations: { type: 'array' }
    }
  },
  methods: ['message/send'],
  a2aEndpoint: `/api/v1/a2a/${id}`,
  version: '1.0.0'
});

export async function registerAllAgents(): Promise<number> {
  const agents: AgentCard[] = [];

  // ============================================================
  // C-SUITE LEADERSHIP AGENTS (5)
  // ============================================================
  const cSuiteAgents = [
    { id: 'ceo-agent', name: 'CEO Agent', desc: 'Strategic vision, priorities, user focus, growth', caps: ['strategy', 'vision', 'priorities'] },
    { id: 'cto-agent', name: 'CTO Agent', desc: 'Architecture, code quality, tech debt, security', caps: ['architecture', 'code-quality', 'tech-debt'] },
    { id: 'cpo-agent', name: 'CPO Agent', desc: 'Product roadmap, features, UX direction', caps: ['product', 'roadmap', 'ux'] },
    { id: 'cfo-agent', name: 'CFO Agent', desc: 'Revenue, costs, monetization, budgets', caps: ['finance', 'revenue', 'budgets'] },
    { id: 'cmo-agent', name: 'CMO Agent', desc: 'User acquisition, brand, content, community growth', caps: ['marketing', 'growth', 'brand'] },
  ];
  for (const a of cSuiteAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'leadership'));
  }

  // ============================================================
  // VP-LEVEL AGENTS (6)
  // ============================================================
  const vpAgents = [
    { id: 'vp-engineering-agent', name: 'VP Engineering Agent', desc: 'Code reviews, sprints, velocity, team coordination', caps: ['engineering', 'sprints', 'velocity'] },
    { id: 'vp-design-agent', name: 'VP Design Agent', desc: 'UI/UX patterns, design tokens, accessibility', caps: ['design', 'ui-ux', 'accessibility'] },
    { id: 'vp-data-agent', name: 'VP Data Agent', desc: 'Metrics, dashboards, user behavior, A/B tests', caps: ['analytics', 'metrics', 'ab-testing'] },
    { id: 'vp-security-agent', name: 'VP Security Agent', desc: 'GDPR, auth, encryption, vulnerability scans', caps: ['security', 'gdpr', 'vulnerabilities'] },
    { id: 'vp-devops-agent', name: 'VP DevOps Agent', desc: 'CI/CD, deployments, monitoring, uptime', caps: ['devops', 'cicd', 'monitoring'] },
    { id: 'vp-platform-agent', name: 'VP Platform Agent', desc: 'API design, integrations, third-party services', caps: ['platform', 'api', 'integrations'] },
  ];
  for (const a of vpAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'leadership'));
  }

  // ============================================================
  // HEAD-LEVEL AGENTS (10)
  // ============================================================
  const headAgents = [
    { id: 'head-ai-agent', name: 'Head of AI Agent', desc: 'Mr. Blue brain, LLM orchestration, AI features', caps: ['ai', 'llm', 'orchestration'] },
    { id: 'head-qa-agent', name: 'Head of QA Agent', desc: 'Testing strategy, E2E tests, bug triage', caps: ['qa', 'testing', 'e2e'] },
    { id: 'head-frontend-agent', name: 'Head of Frontend Agent', desc: 'React, UI components, performance, responsive', caps: ['frontend', 'react', 'responsive'] },
    { id: 'head-backend-agent', name: 'Head of Backend Agent', desc: 'Express, APIs, database, server architecture', caps: ['backend', 'express', 'api'] },
    { id: 'head-mobile-agent', name: 'Head of Mobile Agent', desc: 'PWA, mobile-first design, touch interactions', caps: ['mobile', 'pwa', 'touch'] },
    { id: 'head-search-agent', name: 'Head of Search Agent', desc: 'Search, recommendations, filtering, relevance', caps: ['search', 'recommendations', 'filtering'] },
    { id: 'head-content-agent', name: 'Head of Content Agent', desc: 'Event scraping, data quality, moderation', caps: ['content', 'scraping', 'moderation'] },
    { id: 'head-growth-agent', name: 'Head of Growth Agent', desc: 'Onboarding, activation, retention, referrals', caps: ['growth', 'onboarding', 'retention'] },
    { id: 'head-community-agent', name: 'Head of Community Agent', desc: 'Moderation, groups, events, user engagement', caps: ['community', 'moderation', 'engagement'] },
    { id: 'head-payments-agent', name: 'Head of Payments Agent', desc: 'Stripe, subscriptions, invoicing, refunds', caps: ['payments', 'stripe', 'subscriptions'] },
  ];
  for (const a of headAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'leadership'));
  }

  // ============================================================
  // PAGE AGENTS (10)
  // ============================================================
  const pageAgents = [
    { id: 'landing-page-agent', name: 'Landing Page Agent', desc: 'Marketing, SEO, conversion', caps: ['landing', 'seo', 'conversion'] },
    { id: 'feed-page-agent', name: 'Feed Page Agent', desc: 'Posts, stories, engagement', caps: ['feed', 'posts', 'engagement'] },
    { id: 'profile-page-agent', name: 'Profile Page Agent', desc: 'User data, settings, privacy', caps: ['profile', 'settings', 'privacy'] },
    { id: 'events-page-agent', name: 'Events Page Agent', desc: 'Calendar, filtering, maps, RSVP', caps: ['events', 'calendar', 'rsvp'] },
    { id: 'housing-page-agent', name: 'Housing Page Agent', desc: 'Listings, booking, maps', caps: ['housing', 'listings', 'booking'] },
    { id: 'groups-page-agent', name: 'Groups Page Agent', desc: 'Communities, membership, discussions', caps: ['groups', 'communities', 'discussions'] },
    { id: 'messages-page-agent', name: 'Messages Page Agent', desc: 'Chat, notifications, real-time', caps: ['messages', 'chat', 'realtime'] },
    { id: 'admin-page-agent', name: 'Admin Page Agent', desc: 'Dashboard, management, moderation', caps: ['admin', 'dashboard', 'management'] },
    { id: 'financial-page-agent', name: 'Financial Page Agent', desc: 'Payments, subscriptions, billing', caps: ['financial', 'payments', 'billing'] },
    { id: 'mrblue-page-agent', name: 'Mr Blue Page Agent', desc: 'AI assistant interface, VibeCoding', caps: ['mrblue', 'ai-assistant', 'vibecoding'] },
  ];
  for (const a of pageAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'page'));
  }

  // ============================================================
  // LIFE CEO AGENTS (16)
  // ============================================================
  const lifeCeoAgents = [
    { id: 'career-coach-agent', name: 'Career Coach Agent', desc: 'Jobs, skills, growth', caps: ['career', 'jobs', 'skills'] },
    { id: 'health-advisor-agent', name: 'Health Advisor Agent', desc: 'Wellness, fitness', caps: ['health', 'wellness', 'fitness'] },
    { id: 'financial-planner-agent', name: 'Financial Planner Agent', desc: 'Budget, investing', caps: ['budget', 'investing', 'planning'] },
    { id: 'relationship-counselor-agent', name: 'Relationship Counselor Agent', desc: 'Social connections', caps: ['relationships', 'social', 'connections'] },
    { id: 'learning-tutor-agent', name: 'Learning Tutor Agent', desc: 'Education, courses', caps: ['learning', 'education', 'courses'] },
    { id: 'creativity-mentor-agent', name: 'Creativity Mentor Agent', desc: 'Art, music, writing', caps: ['creativity', 'art', 'music'] },
    { id: 'home-organizer-agent', name: 'Home Organizer Agent', desc: 'Living space', caps: ['home', 'organization', 'space'] },
    { id: 'travel-planner-agent', name: 'Travel Planner Agent', desc: 'Trips, logistics', caps: ['travel', 'trips', 'logistics'] },
    { id: 'mindfulness-guide-agent', name: 'Mindfulness Guide Agent', desc: 'Mental health', caps: ['mindfulness', 'mental-health', 'meditation'] },
    { id: 'entertainment-curator-agent', name: 'Entertainment Curator Agent', desc: 'Leisure, hobbies', caps: ['entertainment', 'leisure', 'hobbies'] },
    { id: 'productivity-coach-agent', name: 'Productivity Coach Agent', desc: 'Time management', caps: ['productivity', 'time-management', 'efficiency'] },
    { id: 'fitness-trainer-agent', name: 'Fitness Trainer Agent', desc: 'Exercise, nutrition', caps: ['fitness', 'exercise', 'training'] },
    { id: 'nutrition-expert-agent', name: 'Nutrition Expert Agent', desc: 'Diet, meal planning', caps: ['nutrition', 'diet', 'meals'] },
    { id: 'sleep-consultant-agent', name: 'Sleep Consultant Agent', desc: 'Rest, recovery', caps: ['sleep', 'rest', 'recovery'] },
    { id: 'stress-manager-agent', name: 'Stress Manager Agent', desc: 'Anxiety, coping', caps: ['stress', 'anxiety', 'coping'] },
    { id: 'goal-tracker-agent', name: 'Goal Tracker Agent', desc: 'Objectives, progress', caps: ['goals', 'objectives', 'progress'] },
  ];
  for (const a of lifeCeoAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'life-ceo'));
  }

  // ============================================================
  // SELF-HEALING SERVICE AGENTS (10)
  // ============================================================
  const selfHealingAgents = [
    { id: 'page-audit-service', name: 'Page Audit Service Agent', desc: 'Monitors page health', caps: ['audit', 'monitoring', 'health'] },
    { id: 'predictive-precheck', name: 'Predictive PreCheck Agent', desc: 'Predicts failures', caps: ['prediction', 'precheck', 'failures'] },
    { id: 'self-healing-service', name: 'Self-Healing Service Agent', desc: 'Auto-repairs issues', caps: ['healing', 'repairs', 'auto-fix'] },
    { id: 'error-analysis-service', name: 'Error Analysis Service Agent', desc: 'Diagnoses errors', caps: ['errors', 'diagnosis', 'analysis'] },
    { id: 'ux-validation-service', name: 'UX Validation Service Agent', desc: 'Validates UI/UX', caps: ['ux', 'validation', 'ui'] },
    { id: 'performance-monitor', name: 'Performance Monitor Agent', desc: 'Tracks speed', caps: ['performance', 'speed', 'metrics'] },
    { id: 'security-scanner', name: 'Security Scanner Agent', desc: 'Checks vulnerabilities', caps: ['security', 'vulnerabilities', 'scanning'] },
    { id: 'accessibility-checker', name: 'Accessibility Checker Agent', desc: 'A11y compliance', caps: ['accessibility', 'a11y', 'compliance'] },
    { id: 'data-integrity-agent', name: 'Data Integrity Agent', desc: 'Database health', caps: ['data', 'integrity', 'database'] },
    { id: 'log-analyzer', name: 'Log Analyzer Agent', desc: 'Pattern detection', caps: ['logs', 'analysis', 'patterns'] },
  ];
  for (const a of selfHealingAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'self-healing'));
  }

  // ============================================================
  // SCRAPING AGENTS (10)
  // ============================================================
  const scrapingAgents = [
    { id: 'master-orchestrator-scraper', name: 'Master Orchestrator Agent', desc: 'Coordinates all scrapers', caps: ['orchestration', 'scheduling', 'coordination'] },
    { id: 'hoy-milonga-scraper', name: 'HoyMilonga Scraper Agent', desc: 'Buenos Aires milongas', caps: ['hoy-milonga', 'buenos-aires', 'playwright'] },
    { id: 'tango-mango-scraper', name: 'TangoMango Scraper Agent', desc: 'US city events', caps: ['tango-mango', 'us-cities', 'html'] },
    { id: 'tango-cat-scraper', name: 'TangoCat Scraper Agent', desc: 'International festivals', caps: ['tango-cat', 'festivals', 'ai-enrichment'] },
    { id: 'tango-festivals-scraper', name: 'TangoFestivals Scraper Agent', desc: 'Global festival calendar', caps: ['festivals', 'calendar', 'global'] },
    { id: 'unified-event-scraper', name: 'Unified Event Scraper Agent', desc: 'AI-powered generic scraper', caps: ['unified', 'ai-powered', 'generic'] },
    { id: 'static-scraper', name: 'Static Scraper Agent', desc: 'Simple HTML sites', caps: ['static', 'html', 'cheerio'] },
    { id: 'js-scraper', name: 'JS Scraper Agent', desc: 'Playwright for SPAs', caps: ['javascript', 'playwright', 'spa'] },
    { id: 'social-scraper', name: 'Social Scraper Agent', desc: 'Facebook/Instagram', caps: ['social', 'facebook', 'instagram'] },
    { id: 'venue-scraper', name: 'Venue Scraper Agent', desc: 'Venue details', caps: ['venues', 'details', 'locations'] },
  ];
  for (const a of scrapingAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'scraping'));
  }

  // ============================================================
  // BUSINESS AGENTS - MARKETPLACE (9)
  // ============================================================
  const marketplaceAgents = [
    { id: 'marketplace-orchestrator', name: 'Marketplace Orchestrator Agent', desc: 'Coordinates marketplace ops', caps: ['marketplace', 'orchestration', 'operations'] },
    { id: 'dynamic-pricing-agent', name: 'Dynamic Pricing Agent', desc: 'Calculate prices, analyze demand', caps: ['pricing', 'demand', 'optimization'] },
    { id: 'fraud-detection-agent', name: 'Fraud Detection Agent', desc: 'Transaction anomaly detection', caps: ['fraud', 'anomaly', 'detection'] },
    { id: 'inventory-manager-agent', name: 'Inventory Manager Agent', desc: 'Stock tracking, availability', caps: ['inventory', 'stock', 'availability'] },
    { id: 'quality-assurance-agent', name: 'Quality Assurance Agent', desc: 'Listing review, photo quality', caps: ['quality', 'listings', 'review'] },
    { id: 'recommendation-engine-agent', name: 'Recommendation Engine Agent', desc: 'Personalized suggestions', caps: ['recommendations', 'personalization', 'suggestions'] },
    { id: 'review-analyzer-agent', name: 'Review Analyzer Agent', desc: 'Sentiment analysis, fake review detection', caps: ['reviews', 'sentiment', 'analysis'] },
    { id: 'seller-support-agent', name: 'Seller Support Agent', desc: 'Onboarding, performance tracking', caps: ['sellers', 'support', 'onboarding'] },
    { id: 'transaction-monitor-agent', name: 'Transaction Monitor Agent', desc: 'Payment tracking, disputes', caps: ['transactions', 'payments', 'disputes'] },
  ];
  for (const a of marketplaceAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'business'));
  }

  // ============================================================
  // BUSINESS AGENTS - FINANCIAL (7)
  // ============================================================
  const financialAgents = [
    { id: 'financial-orchestrator', name: 'Financial Orchestrator Agent', desc: 'Coordinates financial ops', caps: ['financial', 'orchestration', 'operations'] },
    { id: 'payment-processor-agent', name: 'Payment Processor Agent', desc: 'Stripe integration, multi-currency', caps: ['payments', 'stripe', 'currency'] },
    { id: 'subscription-manager-agent', name: 'Subscription Manager Agent', desc: 'Plan management, billing', caps: ['subscriptions', 'plans', 'billing'] },
    { id: 'invoice-generator-agent', name: 'Invoice Generator Agent', desc: 'Automatic invoicing, PDF', caps: ['invoices', 'pdf', 'billing'] },
    { id: 'revenue-tracker-agent', name: 'Revenue Tracker Agent', desc: 'Income analytics, forecasting', caps: ['revenue', 'analytics', 'forecasting'] },
    { id: 'tax-calculator-agent', name: 'Tax Calculator Agent', desc: 'Tax rate lookup, compliance', caps: ['taxes', 'compliance', 'calculations'] },
    { id: 'refund-handler-agent', name: 'Refund Handler Agent', desc: 'Refund processing, policies', caps: ['refunds', 'processing', 'policies'] },
  ];
  for (const a of financialAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'business'));
  }

  // ============================================================
  // BUSINESS AGENTS - SOCIAL MEDIA (8)
  // ============================================================
  const socialMediaAgents = [
    { id: 'social-orchestrator', name: 'Social Orchestrator Agent', desc: 'Coordinates social media ops', caps: ['social', 'orchestration', 'media'] },
    { id: 'content-generator-agent', name: 'Content Generator Agent', desc: 'Generate content, repurpose', caps: ['content', 'generation', 'repurpose'] },
    { id: 'post-scheduler-agent', name: 'Post Scheduler Agent', desc: 'Calendar, optimal timing', caps: ['scheduling', 'calendar', 'timing'] },
    { id: 'engagement-analyzer-agent', name: 'Engagement Analyzer Agent', desc: 'Metrics tracking, insights', caps: ['engagement', 'metrics', 'insights'] },
    { id: 'cross-platform-poster-agent', name: 'Cross Platform Poster Agent', desc: 'Multi-platform posting', caps: ['cross-platform', 'posting', 'syndication'] },
    { id: 'hashtag-optimizer-agent', name: 'Hashtag Optimizer Agent', desc: 'Trending analysis, suggestions', caps: ['hashtags', 'trending', 'optimization'] },
    { id: 'influencer-matcher-agent', name: 'Influencer Matcher Agent', desc: 'Profile analysis, outreach', caps: ['influencers', 'matching', 'outreach'] },
    { id: 'analytics-reporter-agent', name: 'Analytics Reporter Agent', desc: 'Dashboard creation, KPIs', caps: ['analytics', 'dashboards', 'kpis'] },
  ];
  for (const a of socialMediaAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'business'));
  }

  // ============================================================
  // BUSINESS AGENTS - CROWDFUNDING (5)
  // ============================================================
  const crowdfundingAgents = [
    { id: 'crowdfunding-orchestrator', name: 'Crowdfunding Orchestrator Agent', desc: 'Coordinates crowdfunding', caps: ['crowdfunding', 'orchestration', 'campaigns'] },
    { id: 'campaign-optimizer-agent', name: 'Campaign Optimizer Agent', desc: 'Goal setting, optimization', caps: ['campaigns', 'optimization', 'goals'] },
    { id: 'backer-communication-agent', name: 'Backer Communication Agent', desc: 'Updates, engagement', caps: ['backers', 'communication', 'updates'] },
    { id: 'reward-fulfillment-agent', name: 'Reward Fulfillment Agent', desc: 'Reward tracking, delivery', caps: ['rewards', 'fulfillment', 'delivery'] },
    { id: 'funding-analytics-agent', name: 'Funding Analytics Agent', desc: 'Progress tracking, projections', caps: ['funding', 'analytics', 'projections'] },
  ];
  for (const a of crowdfundingAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'business'));
  }

  // ============================================================
  // AUTO-INVOKE LEADERSHIP AGENTS (2)
  // ============================================================
  const autoInvokeAgents = [
    { id: 'github-practices-agent', name: 'GitHub Practices Agent', desc: 'Conventional commits, atomic commits, branch naming', caps: ['github', 'commits', 'branching'] },
    { id: 'plan-tracker-agent', name: 'Plan Tracker Agent', desc: 'Updates The Plan with task status/progress', caps: ['planning', 'tracking', 'status'] },
  ];
  for (const a of autoInvokeAgents) {
    agents.push(createAgentCard(a.id, a.name, a.desc, a.caps, 'leadership'));
  }

  // ============================================================
  // REGISTER ALL AGENTS
  // ============================================================
  console.log(`[registerAllAgents] Registering ${agents.length} agents...`);
  
  for (const agent of agents) {
    try {
      await agentCardRegistry.registerAgent(agent);
    } catch (error) {
      console.error(`[registerAllAgents] Failed to register ${agent.id}:`, error);
    }
  }

  const totalCount = agentCardRegistry.getAgentCount();
  console.log(`[registerAllAgents] Complete! Total agents in registry: ${totalCount}`);
  
  return totalCount;
}

// Export for use in server startup
export default registerAllAgents;
