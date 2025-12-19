# MB.MD v9.9.3 Core Documentation

## Overview
MB.MD (Machine-Brain Methodology & Design) is a comprehensive framework for AI-to-AI collaboration between Replit AI and Mr Blue AI agents. It enables autonomous, self-healing software development with hierarchical agent orchestration.

## Core Principles

### 1. Research → Plan → Build → Test → Document
Every task follows this sequence:
1. **Research:** Gather context using RecursiveContextService
2. **Plan:** Break down into subtasks with dependencies
3. **Build:** Execute in parallel where possible
4. **Test:** Validate with Playwright E2E tests
5. **Document:** Store learnings in LanceDB

### 2. Hierarchical Agent Structure
```
                    ESA CEO (Agent #0)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ROLE-CTO         ROLE-SEC         ROLE-AI
        │
   ┌────┴────┐
   │         │
ROLE-FE  ROLE-BE
   │         │
Page     API
Agents   Agents
```

### 3. Context Synchronization
Before any task:
- Replit AI shares current file context
- Mr Blue shares conversation history
- Both access shared LanceDB knowledge base

### 4. Self-Healing Automation
- 3-strike auto-fix policy
- <10% escalation rate to humans
- Pattern learning from successes/failures

## Key Components

### RecursiveContextService
Implements Samsung TinyRecursiveModels for hierarchical code summarization:
- **Function Level:** 1-2 sentence summaries
- **File Level:** Aggregated function summaries
- **Module Level:** Aggregated file summaries
- **Platform Level:** Aggregated module summaries

Token compression ratio: 80-90%

### AutoFixEngine
Autonomous error detection and resolution:
1. Detect error patterns
2. Analyze with AI (GROQ)
3. Generate fix with confidence score
4. Apply if >95% confidence
5. Stage for approval if 80-95%
6. Alert human if <80%

### VibeCodingService
Natural language to production code:
- Multi-file editing (5+ files)
- Syntax validation
- LSP error checking
- Git integration for rollback

### FacelessContentService
Automated content marketing pipeline:
- Script generation (GROQ)
- Voice synthesis (ElevenLabs)
- Avatar video (D-ID)
- Multi-platform posting

### FreeAPIService
Open source data enrichment:
- City/country data (OSM, REST Countries)
- Weather (Open-Meteo)
- Exchange rates (Frankfurter)
- IP geolocation (ip-api)

## Agent Types

### Role Agents
- **ROLE-CTO:** Architecture, tech decisions
- **ROLE-FE:** Frontend, React, UI/UX
- **ROLE-BE:** Backend, API, database
- **ROLE-DO:** DevOps, CI/CD, monitoring
- **ROLE-QA:** Testing, E2E, quality
- **ROLE-SEC:** Security, auth, compliance
- **ROLE-AI:** AI/ML, LLM integration

### ESA Agents (1,255+)
- **Chiefs:** Domain leaders (20)
- **Senior Agents:** Complex tasks (50)
- **Specialists:** Focused expertise (100+)
- **Worker Agents:** Atomic tasks (1,000+)

## Patterns

### Pattern 64: Context Sync Ritual
Synchronize context before any task

### Pattern 65: Dual-Lane Planning
Separate sequential from parallel execution

### Pattern 66: Build Swarm Choreography
Coordinate multiple agents for parallel code generation

### Pattern 67: Validation Relay
Chain validation steps: E2E → Visual → Unit → LSP

### Pattern 68: 3-Strike AutoFix Loop
Auto-fix with escalation threshold

### Pattern 69: Knowledge Backprop
Store learnings after each task

### Pattern 70: Governance Guardrails
Enforce pre-task and post-task quality gates

## Quick Reference

### Start Self-Healing
```typescript
import { autoFixEngine } from './services/mrBlue/AutoFixEngine';
await autoFixEngine.initialize();
```

### Generate Context
```typescript
import { recursiveContextService } from './services/intelligence/RecursiveContextService';
const context = await recursiveContextService.getContext(query, maxTokens);
```

### Create Faceless Content
```typescript
import { facelessContentService } from './services/content/FacelessContentService';
const result = await facelessContentService.createContent({
  topic: 'Tango posture tips',
  duration: '30s',
  platforms: ['tiktok', 'instagram'],
  userId: 1
});
```

## Configuration

### Required Environment Variables
- `GROQ_API_KEY`: AI inference
- `OPENAI_API_KEY`: Embeddings
- `ELEVENLABS_API_KEY`: Voice synthesis
- `REDIS_URL`: BullMQ queues (optional)

### Optional Integrations
- D-ID API for avatar videos
- TikTok/YouTube/Instagram OAuth
- Stripe for payments
