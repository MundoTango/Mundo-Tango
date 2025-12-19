# Mundo Tango API Inventory

Complete endpoint inventory for the Mundo Tango platform. Last updated: November 14, 2025.

## Table of Contents

- [Authentication](#authentication)
- [Mr. Blue Agents](#mr-blue-agents)
- [Learning Intelligence](#learning-intelligence)
- [User Testing](#user-testing)
- [Volunteer Testing](#volunteer-testing)
- [Premium Media](#premium-media)
- [Gamification](#gamification)
- [Learning Pathways](#learning-pathways)
- [Knowledge Base](#knowledge-base)
- [System Prompts](#system-prompts)
- [Telemetry & Analytics](#telemetry--analytics)
- [Health & Monitoring](#health--monitoring)
- [Subscription & Billing](#subscription--billing)
- [RBAC & Feature Flags](#rbac--feature-flags)

---

## Authentication

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/auth/register` | POST | No | Register new user account | Track 1 |
| `/api/auth/login` | POST | No | User login with credentials | Track 1 |
| `/api/auth/logout` | POST | Yes | User logout | Track 1 |
| `/api/auth/refresh` | POST | Yes | Refresh authentication token | Track 1 |
| `/api/auth/forgot-password` | POST | No | Initiate password reset | Track 1 |
| `/api/auth/reset-password` | POST | No | Complete password reset | Track 1 |
| `/api/auth/verify-email` | POST | No | Verify user email address | Track 1 |

---

## Mr. Blue Agents

**20+ Specialized AI Agents** (Track 2)

| Route | Method | Auth | Description | Since Track | Tier Required |
|-------|--------|------|-------------|-------------|---------------|
| `/api/mr-blue/agents` | GET | Yes | List all Mr. Blue agents | Track 2 | Free |
| `/api/mr-blue/agents/:id` | GET | Yes | Get agent details | Track 2 | Free |
| `/api/mr-blue/chat` | POST | Yes | Start chat with agent | Track 2 | Free |
| `/api/mr-blue/chat/:conversationId` | GET | Yes | Get conversation history | Track 2 | Free |
| `/api/mr-blue/chat/:conversationId/message` | POST | Yes | Send message in conversation | Track 2 | Free |
| `/api/mr-blue/agents/strategic-planner` | POST | Yes | Strategic planning agent | Track 2 | Basic |
| `/api/mr-blue/agents/financial-advisor` | POST | Yes | Financial planning agent | Track 2 | Basic |
| `/api/mr-blue/agents/health-coach` | POST | Yes | Health & wellness agent | Track 2 | Basic |
| `/api/mr-blue/agents/career-mentor` | POST | Yes | Career development agent | Track 2 | Basic |
| `/api/mr-blue/agents/relationship-guide` | POST | Yes | Relationship counseling agent | Track 2 | Plus |
| `/api/mr-blue/agents/learning-companion` | POST | Yes | Personalized learning agent | Track 2 | Plus |
| `/api/mr-blue/agents/creativity-spark` | POST | Yes | Creative ideation agent | Track 2 | Plus |
| `/api/mr-blue/agents/code-reviewer` | POST | Yes | Code review & optimization | Track 2 | Pro |
| `/api/mr-blue/agents/data-analyst` | POST | Yes | Data analysis agent | Track 2 | Pro |
| `/api/mr-blue/agents/legal-advisor` | POST | Yes | Legal document agent | Track 2 | Pro |
| `/api/mr-blue/agents/travel-planner` | POST | Yes | Travel planning agent | Track 2 | Plus |
| `/api/mr-blue/agents/event-coordinator` | POST | Yes | Event planning agent | Track 2 | Plus |
| `/api/mr-blue/agents/content-creator` | POST | Yes | Content generation agent | Track 2 | Pro |
| `/api/mr-blue/agents/social-media-manager` | POST | Yes | Social media strategy agent | Track 2 | Pro |
| `/api/mr-blue/agents/nutrition-expert` | POST | Yes | Nutrition & diet planning | Track 2 | Plus |

---

## Learning Intelligence

**Adaptive Learning System** (Track 3)

| Route | Method | Auth | Description | Since Track | Cache |
|-------|--------|------|-------------|-------------|-------|
| `/api/learning/intelligence/adaptive-path` | POST | Yes | Generate personalized learning path | Track 3 | No |
| `/api/learning/intelligence/content-recommend` | GET | Yes | Get content recommendations | Track 3 | Yes (10min) |
| `/api/learning/intelligence/skill-gap` | GET | Yes | Analyze skill gaps | Track 3 | Yes (15min) |
| `/api/learning/intelligence/progress` | GET | Yes | Track learning progress | Track 3 | No |
| `/api/learning/intelligence/style-detect` | POST | Yes | Detect learning style | Track 3 | Yes (1hr) |
| `/api/learning/intelligence/difficulty-adjust` | POST | Yes | Adjust content difficulty | Track 3 | No |
| `/api/learning/intelligence/micro-lessons` | GET | Yes | Get micro-lesson suggestions | Track 3 | Yes (30min) |

---

## User Testing

**AI-Powered User Testing** (Track 4)

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/user-testing/scenarios` | GET | Yes | List test scenarios | Track 4 |
| `/api/user-testing/scenarios/:id` | GET | Yes | Get scenario details | Track 4 |
| `/api/user-testing/execute` | POST | Yes | Execute test scenario | Track 4 |
| `/api/user-testing/results` | GET | Yes | Get test results | Track 4 |
| `/api/user-testing/results/:id` | GET | Yes | Get specific test result | Track 4 |
| `/api/user-testing/agents/:agentId/test` | POST | Yes | Test with specific agent | Track 4 |
| `/api/user-testing/record-session` | POST | Yes | Record user testing session | Track 4 |
| `/api/user-testing/heatmaps/:pageId` | GET | Yes | Get interaction heatmaps | Track 4 |
| `/api/user-testing/bugs/report` | POST | Yes | Report discovered bug | Track 4 |
| `/api/user-testing/bugs` | GET | Yes | List reported bugs | Track 4 |
| `/api/user-testing/analytics` | GET | Yes | User testing analytics | Track 4 |
| `/api/user-testing/a-b-test` | POST | Yes | Create A/B test | Track 4 |
| `/api/user-testing/a-b-test/:id` | GET | Yes | Get A/B test results | Track 4 |
| `/api/user-testing/feedback` | POST | Yes | Submit user feedback | Track 4 |
| `/api/user-testing/accessibility` | POST | Yes | Run accessibility tests | Track 4 |
| `/api/user-testing/performance` | POST | Yes | Run performance tests | Track 4 |
| `/api/user-testing/scenarios/generate` | POST | Yes | AI-generate test scenarios | Track 4 |
| `/api/user-testing/reports/generate` | POST | Yes | Generate testing report | Track 4 |

---

## Volunteer Testing

**Crowdsourced Testing System** (Track 6)

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/volunteer/scenarios` | GET | Yes | Available test scenarios | Track 6 |
| `/api/volunteer/scenarios/:id` | GET | Yes | Scenario details | Track 6 |
| `/api/volunteer/enroll` | POST | Yes | Enroll in testing program | Track 6 |
| `/api/volunteer/results` | POST | Yes | Submit test results | Track 6 |
| `/api/volunteer/results/:id` | GET | Yes | Get submission details | Track 6 |
| `/api/volunteer/stats` | GET | Yes | Volunteer statistics | Track 6 |
| `/api/volunteer/rewards` | GET | Yes | Available rewards | Track 6 |
| `/api/volunteer/leaderboard` | GET | Yes | Testing leaderboard | Track 6 |
| `/api/volunteer/feedback` | POST | Yes | Submit feedback | Track 6 |
| `/api/volunteer/recruit` | POST | Yes | Recruit new testers | Track 6 |

---

## Premium Media

**AI-Powered Media Generation** (Track 5)

| Route | Method | Auth | Description | Since Track | Tier Required |
|-------|--------|------|-------------|-------------|---------------|
| `/api/premium/video/create` | POST | Yes | Create AI-generated video | Track 5 | Plus |
| `/api/premium/video/:id` | GET | Yes | Get video details | Track 5 | Free |
| `/api/premium/video/:id/status` | GET | Yes | Check generation status | Track 5 | Free |
| `/api/premium/audio/create` | POST | Yes | Create AI-generated audio | Track 5 | Plus |
| `/api/premium/audio/:id` | GET | Yes | Get audio details | Track 5 | Free |
| `/api/premium/image/create` | POST | Yes | Create AI-generated image | Track 5 | Basic |
| `/api/premium/image/:id` | GET | Yes | Get image details | Track 5 | Free |
| `/api/premium/media/history` | GET | Yes | User media generation history | Track 5 | Free |
| `/api/premium/media/templates` | GET | Yes | Available media templates | Track 5 | Free |
| `/api/premium/media/quota` | GET | Yes | Check generation quota | Track 5 | Free |
| `/api/premium/media/:id/download` | GET | Yes | Download generated media | Track 5 | Free |
| `/api/premium/media/:id/delete` | DELETE | Yes | Delete generated media | Track 5 | Free |

---

## Gamification

**Points, Badges, Achievements** (Track 8)

| Route | Method | Auth | Description | Since Track | Cache |
|-------|--------|------|-------------|-------------|-------|
| `/api/gamification/points/award` | POST | Yes | Award points to user | Track 8 | No |
| `/api/gamification/points/user/:userId` | GET | Yes | Get user points balance | Track 8 | Yes (5min) |
| `/api/gamification/badges/definitions` | GET | Yes | List all badge definitions | Track 8 | Yes (1hr) |
| `/api/gamification/badges/user/:userId` | GET | Yes | Get user's earned badges | Track 8 | Yes (5min) |
| `/api/gamification/badges/award` | POST | Yes | Award badge to user | Track 8 | No |
| `/api/gamification/achievements` | GET | Yes | List all achievements | Track 8 | Yes (1hr) |
| `/api/gamification/achievements/user/:userId` | GET | Yes | Get user achievements | Track 8 | Yes (5min) |
| `/api/gamification/leaderboard` | GET | Yes | Global leaderboard | Track 8 | Yes (5min) |
| `/api/gamification/leaderboard/:category` | GET | Yes | Category leaderboard | Track 8 | Yes (5min) |
| `/api/gamification/level/progress/:userId` | GET | Yes | Level progression | Track 8 | Yes (5min) |
| `/api/gamification/streaks/:userId` | GET | Yes | User activity streaks | Track 8 | No |
| `/api/gamification/missions` | GET | Yes | Available missions | Track 8 | Yes (30min) |

---

## Learning Pathways

**Structured Learning Paths** (Track 7)

| Route | Method | Auth | Description | Since Track | Cache |
|-------|--------|------|-------------|-------------|-------|
| `/api/pathways` | GET | Yes | List all learning pathways | Track 7 | Yes (1hr) |
| `/api/pathways/:id` | GET | Yes | Get pathway details | Track 7 | Yes (1hr) |
| `/api/pathways/:id/enroll` | POST | Yes | Enroll in pathway | Track 7 | No |
| `/api/pathways/:id/progress` | GET | Yes | Get pathway progress | Track 7 | No |
| `/api/pathways/:id/modules/:moduleId` | GET | Yes | Get module content | Track 7 | Yes (1hr) |
| `/api/pathways/:id/modules/:moduleId/complete` | POST | Yes | Mark module as complete | Track 7 | No |
| `/api/pathways/:id/quiz/:quizId` | GET | Yes | Get quiz questions | Track 7 | Yes (1hr) |
| `/api/pathways/:id/quiz/:quizId/submit` | POST | Yes | Submit quiz answers | Track 7 | No |
| `/api/pathways/:id/certificate` | GET | Yes | Get completion certificate | Track 7 | No |
| `/api/pathways/recommendations` | GET | Yes | Get pathway recommendations | Track 7 | Yes (30min) |
| `/api/pathways/:id/reviews` | GET | Yes | Get pathway reviews | Track 7 | Yes (15min) |
| `/api/pathways/:id/reviews` | POST | Yes | Submit pathway review | Track 7 | No |
| `/api/pathways/categories` | GET | Yes | List pathway categories | Track 7 | Yes (1hr) |
| `/api/pathways/search` | POST | Yes | Search pathways | Track 7 | Yes (15min) |
| `/api/pathways/:id/prerequisites` | GET | Yes | Check prerequisites | Track 7 | Yes (1hr) |
| `/api/pathways/:id/cohorts` | GET | Yes | List cohorts | Track 7 | Yes (30min) |
| `/api/pathways/:id/cohorts/:cohortId/join` | POST | Yes | Join cohort | Track 7 | No |
| `/api/pathways/:id/discussions` | GET | Yes | Get discussions | Track 7 | Yes (10min) |
| `/api/pathways/:id/discussions/:discussionId` | GET | Yes | Get discussion thread | Track 7 | Yes (5min) |
| `/api/pathways/:id/discussions` | POST | Yes | Create discussion | Track 7 | No |

---

## Knowledge Base

**Knowledge Management & Search** (Track 9)

| Route | Method | Auth | Description | Since Track | Cache |
|-------|--------|------|-------------|-------------|-------|
| `/api/knowledge/search` | POST | Yes | Semantic knowledge search | Track 3 | Yes (10min) |
| `/api/knowledge/create` | POST | Yes | Create knowledge entry | Track 9 | No |
| `/api/knowledge/category/:category` | GET | Yes | Get by category | Track 9 | Yes (15min) |
| `/api/knowledge/:id` | PUT | Yes | Update knowledge entry | Track 9 | No |
| `/api/knowledge/:id` | DELETE | Yes | Soft delete entry | Track 9 | No |
| `/api/knowledge/stats` | GET | Yes | Knowledge base statistics | Track 3 | Yes (30min) |
| `/api/knowledge/pattern` | POST | Yes | Create learning pattern | Track 3 | No |
| `/api/knowledge/patterns` | GET | Yes | List learning patterns | Track 3 | Yes (15min) |
| `/api/knowledge/patterns/:id` | GET | Yes | Get pattern details | Track 3 | Yes (15min) |
| `/api/knowledge/patterns/:id` | PATCH | Yes | Update pattern | Track 3 | No |

---

## System Prompts

**AI Prompt Management** (Track 9)

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/prompts/create` | POST | Yes | Create system prompt version | Track 9 |
| `/api/prompts/agent/:agentId` | GET | Yes | Get prompts for agent | Track 9 |
| `/api/prompts/:id/activate` | PUT | Yes | Activate prompt version | Track 9 |
| `/api/prompts/:id/deactivate` | PUT | Yes | Deactivate prompt | Track 9 |
| `/api/prompts/:id/performance` | GET | Yes | Get performance metrics | Track 9 |
| `/api/prompts/:id/score` | POST | Yes | Update performance score | Track 9 |
| `/api/prompts/stats` | GET | Yes | Overall prompt statistics | Track 9 |

---

## Telemetry & Analytics

**User Behavior Tracking** (Track 9)

| Route | Method | Auth | Description | Since Track | Rate Limit |
|-------|--------|------|-------------|-------------|-----------|
| `/api/telemetry/track` | POST | No | Track events (batch) | Track 9 | 1000/hr |
| `/api/telemetry/user/:userId` | GET | Yes | Get user telemetry | Track 9 | 500/hr |
| `/api/telemetry/session/:sessionId` | GET | Yes | Get session events | Track 9 | 500/hr |
| `/api/telemetry/heatmap/:pagePath` | GET | Yes | Generate heatmap data | Track 9 | 100/hr |
| `/api/telemetry/funnel` | GET | Yes | Funnel analysis | Track 9 | 100/hr |
| `/api/telemetry/stats` | GET | Yes | Telemetry statistics | Track 9 | 500/hr |

---

## Health & Monitoring

**System Health Checks** (Track 9)

| Route | Method | Auth | Description | Since Track | Cached |
|-------|--------|------|-------------|-------------|--------|
| `/api/health` | GET | No | Basic health check | Track 1 | No |
| `/api/health/detailed` | GET | No | Detailed system status | Track 1 | No |
| `/api/health/agents` | GET | No | All agent health statuses | Track 9 | No |
| `/api/health/quotas` | GET | No | Quota monitoring | Track 9 | No |

---

## Subscription & Billing

**Stripe Integration**

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/subscriptions` | GET | Yes | List user subscriptions | Track 1 |
| `/api/subscriptions/create` | POST | Yes | Create new subscription | Track 1 |
| `/api/subscriptions/:id` | GET | Yes | Get subscription details | Track 1 |
| `/api/subscriptions/:id/cancel` | POST | Yes | Cancel subscription | Track 1 |
| `/api/subscriptions/:id/upgrade` | POST | Yes | Upgrade subscription | Track 1 |
| `/api/billing/history` | GET | Yes | Billing history | Track 1 |
| `/api/billing/invoice/:id` | GET | Yes | Get invoice | Track 1 |
| `/api/billing/payment-methods` | GET | Yes | List payment methods | Track 1 |
| `/api/billing/payment-methods` | POST | Yes | Add payment method | Track 1 |

---

## RBAC & Feature Flags

**Access Control & Feature Management**

| Route | Method | Auth | Description | Since Track |
|-------|--------|------|-------------|-------------|
| `/api/rbac/roles` | GET | Yes | List all roles | Phase 1 |
| `/api/rbac/roles/:id` | GET | Yes | Get role details | Phase 1 |
| `/api/rbac/users/:userId/roles` | GET | Yes | Get user roles | Phase 1 |
| `/api/rbac/users/:userId/roles` | POST | Yes | Assign role to user | Phase 1 |
| `/api/rbac/permissions` | GET | Yes | List all permissions | Phase 1 |
| `/api/feature-flags` | GET | Yes | List feature flags | Phase 2 |
| `/api/feature-flags/:key` | GET | Yes | Get feature flag status | Phase 2 |
| `/api/feature-flags/:key` | PUT | Yes | Update feature flag | Phase 2 |

---

## API Statistics

- **Total Endpoints**: 150+
- **Authenticated Endpoints**: 140+
- **Public Endpoints**: 10+
- **Cached Endpoints**: 30+
- **Rate Limited Endpoints**: All (except /health)

## Subscription Tier Requirements

| Tier | API Requests/Hour | Features |
|------|------------------|----------|
| **Free** | 100 | Basic access to all features |
| **Basic** | 500 | 5+ Mr. Blue agents, increased media quota |
| **Plus** | 2000 | 10+ agents, premium media, learning pathways |
| **Pro** | 10,000 | All agents, unlimited media, priority support |
| **God** | Unlimited | Everything + early access to new features |

---

## Authentication & Security

All authenticated endpoints require a valid JWT Bearer token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role Levels

1. **Level 1-3**: Basic user access
2. **Level 4-6**: Moderator access
3. **Level 7-9**: Admin access
4. **Level 10**: Super admin access

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 402 | Payment Required - Quota exceeded |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

All API endpoints (except `/api/health`) are rate-limited based on subscription tier. When limits are exceeded, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit for your free tier subscription.",
  "tier": "free",
  "retryAfter": 3600,
  "upgradeMessage": "Upgrade to Basic tier for 5x more requests per hour!"
}
```

---

## Response Caching

Cached endpoints include `X-Cache` header:
- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response freshly generated

Cache durations vary by endpoint type (5min to 1hr).

---

*Last updated: November 14, 2025*
*Platform Version: 2.0.0*
*API Documentation: https://mundotango.life/api-docs*
