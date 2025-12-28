# Agent Ecosystem Overview

**Invocation:** `use mb.md: agents`

---

## 🏢 AGENT ORGANIZATIONAL HIERARCHY

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MUNDO TANGO AGENT ORG CHART                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         EXECUTIVE LAYER                           │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │   ┌─────────────────┐           ┌─────────────────┐              │ │
│  │   │    CTO AGENT    │           │    CEO AGENT    │              │ │
│  │   │   (Technical)   │           │   (Strategic)   │              │ │
│  │   │                 │           │                 │              │ │
│  │   │ • Architecture  │           │ • Vision        │              │ │
│  │   │ • Code Quality  │           │ • Priorities    │              │ │
│  │   │ • Tech Debt     │           │ • User Focus    │              │ │
│  │   │ • Security      │           │ • Growth        │              │ │
│  │   └────────┬────────┘           └────────┬────────┘              │ │
│  │            │                             │                        │ │
│  └────────────┼─────────────────────────────┼────────────────────────┘ │
│               │                             │                          │
│               └──────────────┬──────────────┘                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      ORCHESTRATION LAYER                          │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │                    ┌─────────────────┐                            │ │
│  │                    │    MR. BLUE     │                            │ │
│  │                    │  (Coordinator)  │                            │ │
│  │                    │                 │                            │ │
│  │                    │ • Task Routing  │                            │ │
│  │                    │ • Agent Select  │                            │ │
│  │                    │ • A2A Comms     │                            │ │
│  │                    │ • User-Facing   │                            │ │
│  │                    └────────┬────────┘                            │ │
│  │                             │                                     │ │
│  └─────────────────────────────┼─────────────────────────────────────┘ │
│                                │                                        │
│    ┌───────────────────────────┼───────────────────────────┐           │
│    │           │               │               │           │           │
│    ▼           ▼               ▼               ▼           ▼           │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                       MANAGER LAYER                               │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │ │
│  │  │   Page   │ │LifeCEO   │ │SelfHeal  │ │ Scraping │ │Business │ │ │
│  │  │ Manager  │ │ Manager  │ │ Manager  │ │ Manager  │ │ Manager │ │ │
│  │  │          │ │          │ │          │ │          │ │         │ │ │
│  │  │ 10 pages │ │16 domains│ │10 services│ │10 scrapers│ │32 agents│ │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │ │
│  │       │            │            │            │            │      │ │
│  └───────┼────────────┼────────────┼────────────┼────────────┼──────┘ │
│          │            │            │            │            │        │
│          ▼            ▼            ▼            ▼            ▼        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   INDIVIDUAL CONTRIBUTOR (IC) LAYER               │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │                                                                   │ │
│  │  Page ICs:        LifeCEO ICs:      SelfHeal ICs:                │ │
│  │  • LandingPage    • CareerCoach     • PageAuditService           │ │
│  │  • FeedPage       • HealthAdvisor   • SelfHealingService         │ │
│  │  • ProfilePage    • FinancePlanner  • ErrorAnalysisAgent         │ │
│  │  • EventsPage     • RelationshipCo  • UXValidationService        │ │
│  │  • HousingPage    • LearningTutor   • PerformanceMonitor         │ │
│  │  • GroupsPage     • ...             • ...                        │ │
│  │  • MessagesPage                                                   │ │
│  │  • AdminPage      Scraping ICs:     Business ICs:                │ │
│  │  • FinancialPage  • MasterOrch      • DynamicPricing             │ │
│  │  • MrBluePage     • HoyMilonga      • PaymentProcessor           │ │
│  │                   • TangoCat        • ContentGenerator           │ │
│  │                   • Unified         • CampaignOptimizer          │ │
│  │                   • ...             • ...                        │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hierarchy Levels Explained

| Level | Role | Responsibility | Count |
|-------|------|----------------|-------|
| **Executive** | CTO + CEO Agents | Strategic vision, architecture decisions, priorities | 2 |
| **Orchestration** | Mr. Blue | Task routing, agent selection, user communication | 1 |
| **Manager** | Domain Managers | Coordinate IC agents within their domain | 5 |
| **IC** | Individual Contributors | Execute specific tasks (pages, features, scrapers) | 140+ |

### Executive Agent Profiles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTIVE LEADERSHIP TEAM                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌───────────────┐                                 │
│                           │   CEO AGENT   │                                 │
│                           │  (Strategy)   │                                 │
│                           └───────┬───────┘                                 │
│                                   │                                         │
│         ┌─────────────────────────┼─────────────────────────┐               │
│         │                         │                         │               │
│         ▼                         ▼                         ▼               │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐         │
│  │ CTO AGENT   │          │ CPO AGENT   │          │ CFO AGENT   │         │
│  │ (Technical) │          │ (Product)   │          │ (Finance)   │         │
│  └──────┬──────┘          └──────┬──────┘          └──────┬──────┘         │
│         │                        │                        │                 │
│  ┌──────┴──────────────────────────────────────────────────┴──────┐        │
│  │                    TECHNICAL LEADERSHIP                         │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│    │VP Engin. │ │VP Design │ │VP Data   │ │VP Secur. │ │VP DevOps │       │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                                             │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│    │Head of AI│ │Head of QA│ │Head FE   │ │Head BE   │ │Head Mobile│       │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## C-SUITE AGENTS

| Agent | Role | Responsibilities | Reports To |
|-------|------|------------------|------------|
| **CEO Agent** | Chief Executive | Vision, strategy, priorities, user focus, growth | Human Stakeholders |
| **CTO Agent** | Chief Technology | Architecture, tech stack, code quality, tech debt | CEO Agent |
| **CPO Agent** | Chief Product | Product roadmap, features, UX direction, user research | CEO Agent |
| **CFO Agent** | Chief Financial | Revenue, costs, monetization, budgets, subscriptions | CEO Agent |
| **CMO Agent** | Chief Marketing | User acquisition, brand, content, community growth | CEO Agent |

---

## VP-LEVEL AGENTS (Technical Leadership)

| Agent | Domain | Responsibilities | Reports To |
|-------|--------|------------------|------------|
| **VP Engineering Agent** | Engineering Ops | Code reviews, sprints, velocity, team coordination | CTO Agent |
| **VP Design Agent** | Design System | UI/UX patterns, design tokens, accessibility, brand consistency | CPO Agent |
| **VP Data Agent** | Data & Analytics | Metrics, dashboards, user behavior, A/B tests, insights | CTO Agent |
| **VP Security Agent** | Security & Privacy | GDPR, auth, encryption, vulnerability scans, compliance | CTO Agent |
| **VP DevOps Agent** | Infrastructure | CI/CD, deployments, monitoring, uptime, scaling | CTO Agent |
| **VP Platform Agent** | Platform Health | API design, integrations, third-party services, SDKs | CTO Agent |

---

## HEAD-LEVEL AGENTS (Domain Experts)

| Agent | Specialty | Responsibilities | Reports To |
|-------|-----------|------------------|------------|
| **Head of AI Agent** | AI/ML | Mr. Blue brain, LLM orchestration, AI features, model selection | CTO Agent |
| **Head of QA Agent** | Quality Assurance | Testing strategy, E2E tests, bug triage, regression prevention | VP Engineering |
| **Head of Frontend Agent** | Frontend | React, UI components, performance, responsive design | VP Engineering |
| **Head of Backend Agent** | Backend | Express, APIs, database, server architecture | VP Engineering |
| **Head of Mobile Agent** | Mobile | PWA, mobile-first design, touch interactions | VP Engineering |
| **Head of Search Agent** | Search & Discovery | Elasticsearch, recommendations, filtering, relevance | VP Data |
| **Head of Content Agent** | Content Ops | Event scraping, data quality, moderation, user content | VP Data |
| **Head of Growth Agent** | User Growth | Onboarding, activation, retention, referrals | CMO Agent |
| **Head of Community Agent** | Community | Moderation, groups, events, user engagement | CMO Agent |
| **Head of Payments Agent** | Payments | Stripe, subscriptions, invoicing, refunds | CFO Agent |

---

## TECHNICAL EXPERT AGENT PROFILES

### CEO Agent
- **Mission**: Drive Mundo Tango to become the #1 global tango community platform
- **Decisions**: Feature priorities, resource allocation, strategic partnerships
- **Metrics**: MAU, revenue, NPS, market position
- **Invoke**: `use mb.md: agents:ceo`

### CTO Agent
- **Mission**: Build a scalable, secure, maintainable technical foundation
- **Decisions**: Tech stack, architecture patterns, technical hiring
- **Metrics**: Uptime, page load, bug count, tech debt ratio
- **Direct Reports**: VP Engineering, VP Data, VP Security, VP DevOps, VP Platform, Head of AI
- **Invoke**: `use mb.md: agents:cto`

### CPO Agent
- **Mission**: Deliver features that delight tango dancers worldwide
- **Decisions**: Roadmap, feature specs, UX flows, user research priorities
- **Metrics**: Feature adoption, user satisfaction, task completion rate
- **Direct Reports**: VP Design, UX Researchers
- **Invoke**: `use mb.md: agents:cpo`

### CFO Agent
- **Mission**: Ensure financial sustainability and growth
- **Decisions**: Pricing, monetization, cost optimization, revenue forecasting
- **Metrics**: MRR, churn, CAC, LTV, burn rate
- **Direct Reports**: Head of Payments, Finance Analysts
- **Invoke**: `use mb.md: agents:cfo`

### CMO Agent
- **Mission**: Grow the Mundo Tango community globally
- **Decisions**: Marketing campaigns, content strategy, brand positioning
- **Metrics**: User acquisition, brand awareness, engagement rates
- **Direct Reports**: Head of Growth, Head of Community, Content Team
- **Invoke**: `use mb.md: agents:cmo`

### VP Engineering Agent
- **Mission**: Deliver high-quality code on schedule
- **Decisions**: Sprint planning, code standards, tooling, team processes
- **Metrics**: Velocity, PR turnaround, deployment frequency
- **Direct Reports**: Head of Frontend, Head of Backend, Head of Mobile, Head of QA
- **Invoke**: `use mb.md: agents:vp-engineering`

### VP Design Agent
- **Mission**: Create a beautiful, consistent, accessible user experience
- **Decisions**: Design system, component library, brand guidelines
- **Metrics**: Design consistency score, accessibility compliance, user feedback
- **Invoke**: `use mb.md: agents:vp-design`

### VP Data Agent
- **Mission**: Turn data into actionable insights
- **Decisions**: Analytics strategy, data pipelines, experiment design
- **Metrics**: Data accuracy, insight velocity, experiment win rate
- **Direct Reports**: Head of Search, Head of Content, Data Engineers
- **Invoke**: `use mb.md: agents:vp-data`

### VP Security Agent
- **Mission**: Protect user data and platform integrity
- **Decisions**: Security policies, compliance roadmap, incident response
- **Metrics**: Vulnerabilities found/fixed, GDPR compliance, incident count
- **Invoke**: `use mb.md: agents:vp-security`

### VP DevOps Agent
- **Mission**: Keep the platform running smoothly at scale
- **Decisions**: Infrastructure architecture, deployment strategy, monitoring
- **Metrics**: Uptime %, deploy success rate, MTTR
- **Invoke**: `use mb.md: agents:vp-devops`

### Head of AI Agent
- **Mission**: Power intelligent features across the platform
- **Decisions**: Model selection, AI architecture, prompt engineering
- **Metrics**: AI response quality, latency, cost per query
- **Invoke**: `use mb.md: agents:head-ai`

---

## 🤖 140+ AGENTS ACROSS 7 DOMAINS

```
┌─────────────────────────────────────────────────────────────┐
│                  MR. BLUE AGENT ECOSYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    MR. BLUE                          │   │
│  │              (Orchestrator / Coordinator)            │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐             │
│    │         │          │          │         │             │
│    ▼         ▼          ▼          ▼         ▼             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │ Page │ │ Life │ │ Self │ │Scrap │ │ Biz  │ ...         │
│ │  10  │ │ CEO  │ │ Heal │ │ ing  │ │  32  │              │
│ │agents│ │  16  │ │  10  │ │  10  │ │agents│              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 AGENT INVENTORY

| Domain | Count | Purpose | Invoke |
|--------|-------|---------|--------|
| **Page Agents** | 10 | UI/UX ownership per page | `use mb.md: agents:page` |
| **Feature Agents** | 35+ | Component-level control | (nested in page agents) |
| **Life CEO** | 16 | Personal life assistance | `use mb.md: agents:life-ceo` |
| **Self-Healing** | 10 | Autonomous error detection | `use mb.md: agents:self-healing` |
| **Scraping** | 10 | Event data collection | `use mb.md: agents:scraping` |
| **Business** | 32 | Revenue operations | `use mb.md: agents:business` |
| **Core** | 49 | Fundamental capabilities | `use mb.md: agents:core` |
| **TOTAL** | **140+** | | |

---

## 🔍 AGENT DETAILS BY DOMAIN

### Page Agents (10)

| Agent | Page | Capabilities |
|-------|------|--------------|
| LandingPageAgent | / | Marketing, SEO, conversion |
| FeedPageAgent | /feed | Posts, stories, engagement |
| ProfilePageAgent | /profile | User data, settings |
| EventsPageAgent | /events | Calendar, filtering, maps |
| HousingPageAgent | /housing | Listings, booking, maps |
| GroupsPageAgent | /groups | Communities, membership |
| MessagesPageAgent | /messages | Chat, notifications |
| AdminPageAgent | /admin | Dashboard, management |
| FinancialPageAgent | /finance | Payments, subscriptions |
| MrBluePageAgent | /mr-blue | AI assistant interface |

### Life CEO Agents (16)

| Agent | Domain |
|-------|--------|
| Career Coach | Jobs, skills, growth |
| Health Advisor | Wellness, fitness |
| Financial Planner | Budget, investing |
| Relationship Counselor | Social connections |
| Learning Tutor | Education, courses |
| Creativity Mentor | Art, music, writing |
| Home Organizer | Living space |
| Travel Planner | Trips, logistics |
| Mindfulness Guide | Mental health |
| Entertainment Curator | Leisure, hobbies |
| Productivity Coach | Time management |
| Fitness Trainer | Exercise, nutrition |
| Nutrition Expert | Diet, meal planning |
| Sleep Consultant | Rest, recovery |
| Stress Manager | Anxiety, coping |
| Goal Tracker | Objectives, progress |

### Self-Healing Agents (10)

| Agent | Function |
|-------|----------|
| PageAuditService | Monitors page health |
| PredictivePreCheck | Predicts failures |
| SelfHealingService | Auto-repairs issues |
| ErrorAnalysisAgent | Diagnoses errors |
| UXValidationService | Validates UI/UX |
| PerformanceMonitor | Tracks speed |
| SecurityScanner | Checks vulnerabilities |
| AccessibilityChecker | A11y compliance |
| DataIntegrityAgent | Database health |
| LogAnalyzer | Pattern detection |

### Scraping Agents (10)

| Agent | Source |
|-------|--------|
| MasterOrchestrator | Coordinates all scrapers |
| HoyMilongaScraper | Buenos Aires milongas |
| TangoCatScraper | International festivals |
| TangoFestivalsScraper | Festival calendar |
| UnifiedEventScraper | AI-powered generic |
| StaticScraper | Simple HTML sites |
| JSScraper | JavaScript-heavy sites |
| SocialScraper | Social media events |
| SubpageDiscovery | Finds subpages |
| Deduplicator | Removes duplicates |

### Business Agents (32)

**Marketplace (9):**
DynamicPricing, FraudDetection, InventoryManager, QualityAssurance, RecommendationEngine, ReviewAnalyzer, SellerSupport, TransactionMonitor, MarketplaceOrchestrator

**Financial (7):**
PaymentProcessor, SubscriptionManager, InvoiceGenerator, RevenueTracker, TaxCalculator, RefundHandler, FinancialOrchestrator

**Social Media (8):**
ContentGenerator, PostScheduler, EngagementAnalyzer, CrossPlatformPoster, HashtagOptimizer, InfluencerMatcher, AnalyticsReporter, SocialOrchestrator

**Crowdfunding (5):**
CampaignOptimizer, DonorEngagement, GoalTracker, RewardFulfillment, CrowdfundingOrchestrator

**Legal (3):**
ContractReviewer, ComplianceChecker, LegalOrchestrator

### Core Agents (49)

Key agents include:
- **ContextService**: Semantic search, memory
- **VibeCodingService**: Natural language → code
- **VoiceFirstService**: Speech recognition/synthesis
- **AutonomousEngine**: Self-directed execution
- **MemoryService**: Long-term context
- **AvatarAgent**: D-ID integration
- **FacebookMessenger**: Community messaging
- And 42 more...

---

## 🔧 AGENT INTERFACE

```typescript
interface Agent {
  id: string;
  name: string;
  domain: AgentDomain;
  capabilities: string[];
  
  // Core methods
  execute(task: Task): Promise<TaskResult>;
  canHandle(task: Task): Promise<number>; // 0-1 confidence
  
  // A2A communication
  handleMessage(message: A2AMessage): Promise<A2AResponse>;
  
  // Self-reporting
  getStatus(): AgentStatus;
  getMetrics(): AgentMetrics;
}
```

---

## 🎯 AGENT SELECTION

Use MoE Router for automatic selection:

```typescript
// Task: "Fix the events calendar"
const selectedAgents = await moeRouter.route({
  description: 'Fix the events calendar',
  domain: 'ui',
  keywords: ['events', 'calendar', 'fix']
});

// Result: [EventsPageAgent, CalendarFeatureAgent]
```

---

## 🔗 DETAILED PROFILES

- Page Agents: `use mb.md: agents:page`
- Life CEO: `use mb.md: agents:life-ceo`
- Self-Healing: `use mb.md: agents:self-healing`
- Scraping: `use mb.md: agents:scraping`
- Business: `use mb.md: agents:business`
- Core: `use mb.md: agents:core`

---

*140+ agents. One mission.*
