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

**CTO Agent**
- Reports to: Human developers
- Responsibilities: Technical architecture, code quality, security, performance
- Decisions: Technology stack, refactoring priorities, technical debt
- Invoke: `use mb.md: agents:cto`

**CEO Agent**
- Reports to: Human stakeholders
- Responsibilities: Product vision, user priorities, growth strategy, resource allocation
- Decisions: Feature prioritization, user experience direction, business goals
- Invoke: `use mb.md: agents:ceo`

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
