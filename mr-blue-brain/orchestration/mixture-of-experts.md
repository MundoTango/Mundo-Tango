# Mixture of Experts (MoE) Router

**Invocation:** `use mb.md: orchestration:moe`

---

## 🧠 WHAT IS MIXTURE OF EXPERTS?

MoE routes tasks to specialized agents based on capability matching. Instead of one agent handling everything, a **router** selects the most relevant experts for each task.

```
┌─────────────────────────────────────────────────────────────┐
│                    MoE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌──────────┐                            │
│                    │   TASK   │                            │
│                    └────┬─────┘                            │
│                         │                                   │
│                         ▼                                   │
│                  ┌─────────────┐                           │
│                  │   ROUTER    │                           │
│                  │  (Gating)   │                           │
│                  └──────┬──────┘                           │
│           ┌─────────────┼─────────────┐                    │
│           ▼             ▼             ▼                    │
│      ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│      │Expert A │  │Expert B │  │Expert C │  ...          │
│      │ (0.85)  │  │ (0.10)  │  │ (0.05)  │               │
│      └────┬────┘  └─────────┘  └─────────┘               │
│           │          (sparse activation)                   │
│           ▼                                                │
│      ┌──────────┐                                         │
│      │ RESPONSE │                                         │
│      └──────────┘                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 MR. BLUE'S 140+ AGENT ROUTER

### Router Implementation

```typescript
interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  domains: string[];
  embedding: number[];  // Capability vector
}

interface RoutingDecision {
  selectedAgents: Array<{ agent: Agent; weight: number }>;
  reasoning: string;
}

class MoERouter {
  private agents: Agent[];
  private embedder: EmbeddingService;
  
  async route(task: Task): Promise<RoutingDecision> {
    // Embed the task
    const taskEmbedding = await this.embedder.embed(task.description);
    
    // Score each agent
    const scores = this.agents.map(agent => ({
      agent,
      score: this.cosineSimilarity(taskEmbedding, agent.embedding)
    }));
    
    // Sort by relevance
    scores.sort((a, b) => b.score - a.score);
    
    // Select top-k experts
    const topK = scores.slice(0, 3);
    
    // Normalize weights
    const totalScore = topK.reduce((sum, s) => sum + s.score, 0);
    const selectedAgents = topK.map(s => ({
      agent: s.agent,
      weight: s.score / totalScore
    }));
    
    return {
      selectedAgents,
      reasoning: this.explainSelection(task, selectedAgents)
    };
  }
}
```

### Agent Registry

```typescript
// 140+ agents organized by domain
const agentRegistry = {
  // Page Agents (10)
  page: [
    { id: 'landing-page', capabilities: ['ui', 'marketing', 'seo'] },
    { id: 'events-page', capabilities: ['events', 'calendar', 'filtering'] },
    { id: 'housing-page', capabilities: ['listings', 'maps', 'booking'] },
    // ... 7 more
  ],
  
  // Life CEO Agents (16)
  lifeCeo: [
    { id: 'career-coach', capabilities: ['career', 'jobs', 'skills'] },
    { id: 'health-advisor', capabilities: ['health', 'fitness', 'nutrition'] },
    { id: 'financial-planner', capabilities: ['money', 'budget', 'investing'] },
    // ... 13 more
  ],
  
  // Self-Healing Agents (10)
  selfHealing: [
    { id: 'page-audit', capabilities: ['monitoring', 'health', 'ui'] },
    { id: 'error-analysis', capabilities: ['debugging', 'logs', 'errors'] },
    { id: 'auto-fix', capabilities: ['repair', 'recovery', 'stability'] },
    // ... 7 more
  ],
  
  // Scraping Agents (10)
  scraping: [
    { id: 'hoy-milonga', capabilities: ['events', 'buenos-aires', 'milongas'] },
    { id: 'tango-cat', capabilities: ['festivals', 'international', 'marathons'] },
    { id: 'unified-scraper', capabilities: ['generic', 'ai', 'extraction'] },
    // ... 7 more
  ],
  
  // Business Agents (32)
  business: {
    marketplace: ['pricing', 'inventory', 'recommendations'],
    financial: ['payments', 'stripe', 'subscriptions'],
    social: ['content', 'scheduling', 'engagement'],
    crowdfunding: ['campaigns', 'donors', 'goals'],
    legal: ['contracts', 'compliance', 'documents']
  },
  
  // Core Agents (49)
  core: [
    { id: 'context-service', capabilities: ['memory', 'search', 'context'] },
    { id: 'vibe-coding', capabilities: ['code-gen', 'ui', 'natural-language'] },
    { id: 'voice-first', capabilities: ['speech', 'transcription', 'tts'] },
    // ... 46 more
  ]
};
```

---

## 🔧 ROUTING STRATEGIES

### 1. Capability-Based Routing (Default)

```typescript
// Match task keywords to agent capabilities
function capabilityMatch(task: Task, agent: Agent): number {
  const taskKeywords = extractKeywords(task.description);
  const matchCount = taskKeywords.filter(kw => 
    agent.capabilities.includes(kw)
  ).length;
  return matchCount / taskKeywords.length;
}
```

### 2. Semantic Routing (Advanced)

```typescript
// Use embeddings for semantic similarity
async function semanticMatch(task: Task, agent: Agent): Promise<number> {
  const taskEmbed = await embed(task.description);
  return cosineSimilarity(taskEmbed, agent.embedding);
}
```

### 3. Historical Performance Routing

```typescript
// Weight by past success rate
function performanceMatch(task: Task, agent: Agent): number {
  const history = getAgentHistory(agent.id, task.type);
  return history.successRate * history.avgQuality;
}
```

### 4. Ensemble Routing

```typescript
// Combine multiple strategies
async function ensembleRoute(task: Task): Promise<RoutingDecision> {
  const agents = getAllAgents();
  
  const scores = await Promise.all(agents.map(async agent => {
    const capability = capabilityMatch(task, agent);
    const semantic = await semanticMatch(task, agent);
    const performance = performanceMatch(task, agent);
    
    // Weighted combination
    const finalScore = 
      0.3 * capability +
      0.4 * semantic +
      0.3 * performance;
    
    return { agent, score: finalScore };
  }));
  
  return selectTopAgents(scores);
}
```

---

## 📊 LOAD BALANCING

```typescript
interface AgentLoad {
  agentId: string;
  currentTasks: number;
  maxCapacity: number;
  avgResponseTime: number;
}

function balancedRoute(
  candidates: Agent[], 
  loads: Map<string, AgentLoad>
): Agent {
  // Score = capability * availability
  const scored = candidates.map(agent => {
    const load = loads.get(agent.id);
    const availability = 1 - (load.currentTasks / load.maxCapacity);
    return { agent, score: agent.score * availability };
  });
  
  return scored.sort((a, b) => b.score - a.score)[0].agent;
}
```

---

## 🎯 INTEGRATION

```typescript
// Mr. Blue main entry point
async function handleRequest(request: UserRequest): Promise<Response> {
  const router = new MoERouter();
  
  // Route to best experts
  const { selectedAgents, reasoning } = await router.route(request);
  
  // Execute with selected agents
  const responses = await Promise.all(
    selectedAgents.map(({ agent, weight }) =>
      agent.execute(request).then(r => ({ response: r, weight }))
    )
  );
  
  // Aggregate responses (weighted by expert scores)
  return aggregateResponses(responses);
}
```

---

*Route smart, execute with the best.*
