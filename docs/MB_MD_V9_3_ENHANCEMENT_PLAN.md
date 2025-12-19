# MB.MD v9.3 Enhancement Plan
**Neuroscience-Inspired AI Agent Evolution**  
**Research Date**: November 18, 2025  
**Target**: Mr. Blue, Visual Editor, Self-Healing System

---

## 🎯 Vision

Transform Mundo Tango's agent system from **reactive FEP-based learning** to **proactive neurosymbolic intelligence** by integrating cutting-edge open-source frameworks discovered through in-depth research.

---

## 📚 Research Foundation

### **8 Areas Researched**:
1. ✅ Free Energy Principle / Active Inference implementations
2. ✅ Self-healing AI systems & autonomous agents
3. ✅ AI-powered visual code editors with real-time collaboration
4. ✅ Multi-agent reinforcement learning frameworks
5. ✅ Bayesian belief updating & surprise learning
6. ✅ Agent orchestration frameworks (LangGraph, AutoGPT, etc.)
7. ✅ Neurosymbolic AI & cognitive architectures (SOAR, ACT-R)
8. ✅ Predictive coding & brain-inspired error minimization

---

## 🚀 6-Phase Enhancement Roadmap

### **Phase 1: Real-Time Bayesian Inference (RxInfer.jl Client)**
**Status**: Pending Q1 2025 release  
**Repository**: https://github.com/ReactiveBayes/RxInfer.jl  
**TypeScript Client**: RxInferClient.ts (coming Q1 2025)

**What It Adds**:
- **Reactive message passing** for real-time belief updates
- **Scalable Bayesian inference** (millions of parameters, streaming data)
- **Factor graph backend** for efficient probabilistic modeling
- **Client-server architecture** (Julia server, TypeScript client)

**Integration Plan**:
```typescript
// Future: RxInferClient.ts integration
import { RxInferClient } from 'rxinfer-client';

const client = new RxInferClient({ serverUrl: 'http://localhost:8080' });

// Real-time agent belief updates via reactive streams
const beliefStream = client.inferBeliefs({
  pageId: 'visual-editor',
  observations: auditResults,
  priorBeliefs: agentBeliefs
});

beliefStream.subscribe(posterior => {
  updateAgentBeliefs(posterior); // Update DB
  triggerSelfHealing(posterior); // If surprise > threshold
});
```

**Benefits**:
- ✅ Sub-200ms Bayesian inference (reactive message passing)
- ✅ Streaming belief updates (no batch delays)
- ✅ Scalable to 1000+ agents (factor graph efficiency)
- ✅ Hybrid discrete/continuous models (FEP + RL)

**Timeline**: Integrate when RxInferClient.ts releases (Q1 2025)

---

### **Phase 2: LangGraph-Style State Management**
**Status**: Ready to implement  
**Repository**: https://github.com/langchain-ai/langgraph  
**Inspiration**: Production systems (LinkedIn, Uber, Replit)

**What It Adds**:
- **Graph-based state machines** for agent workflows
- **PostgreSQL checkpointing** (persistent memory across sessions)
- **Conditional routing** (dynamic decision points)
- **Human-in-the-loop** (HITL) with interrupts
- **Multi-agent supervisor patterns** (hierarchical orchestration)

**Current State** (Mundo Tango):
```typescript
// Current: Direct service calls
const result = await PageAuditService.runAudit(pageId);
await SelfHealingService.executeFixes(result);
await PredictivePreCheckService.checkPages(pageId);
```

**Enhanced** (LangGraph-inspired):
```typescript
// Enhanced: State machine with checkpointing
import { StateGraph } from '@/lib/langgraph';

const selfHealingGraph = new StateGraph<SelfHealingState>({
  nodes: {
    audit: PageAuditService.auditNode,
    prioritize: SurprisePrioritizationNode,
    heal: SelfHealingService.healNode,
    validate: UXValidationNode,
    preCheck: PredictivePreCheckNode
  },
  edges: {
    audit: ['prioritize'],
    prioritize: { 
      conditional: (state) => state.hasIssues ? 'heal' : 'preCheck' 
    },
    heal: ['validate'],
    validate: { 
      conditional: (state) => state.healingSuccess ? 'preCheck' : 'audit' 
    }
  },
  checkpointer: new PostgresCheckpointer(db)
});

// Resume from checkpoint after refresh
const result = await selfHealingGraph.run({ 
  pageId, 
  threadId: `user-${userId}:session-${sessionId}` 
});
```

**Benefits**:
- ✅ Persistent memory (survive server restarts)
- ✅ Retry loops (self-correcting on failures)
- ✅ Interrupt points (human review for critical fixes)
- ✅ Hierarchical agents (supervisor delegates to workers)
- ✅ Production observability (LangSmith integration ready)

**Implementation Priority**: **HIGH** (immediate value)

---

### **Phase 3: SOAR-Inspired Cognitive Memory**
**Status**: Ready to implement  
**Repository**: https://github.com/SoarGroup/Soar  
**License**: BSD (open source, v9.6.2 August 2024)

**What It Adds**:
- **3 Memory Types**: Episodic (past events), Semantic (facts), Procedural (skills)
- **Chunking** (automatic rule learning from successful experiences)
- **Mental simulation** (agent rehearses fixes before applying)
- **Theory of mind** (agents predict user behavior)

**Current Agent Memory** (Mundo Tango):
```sql
-- Current: Only short-term beliefs
CREATE TABLE agent_beliefs (
  agent_id VARCHAR,
  page_id VARCHAR,
  expected_issue_count REAL,
  confidence REAL,
  observation_count INTEGER
);
```

**Enhanced** (SOAR-inspired):
```sql
-- Episodic Memory: Past experiences
CREATE TABLE agent_episodic_memory (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR,
  page_id VARCHAR,
  event_type VARCHAR, -- 'audit', 'fix', 'validation'
  context JSONB, -- Full state snapshot
  outcome VARCHAR, -- 'success', 'failure'
  timestamp TIMESTAMPTZ,
  surprise_score REAL -- How unexpected was this?
);

-- Semantic Memory: General knowledge
CREATE TABLE agent_semantic_memory (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR,
  concept VARCHAR, -- 'broken_button', 'missing_route'
  pattern JSONB, -- Generalized pattern
  confidence REAL,
  learned_from_count INTEGER -- How many episodes?
);

-- Procedural Memory: Learned fixes
CREATE TABLE agent_procedural_memory (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR,
  rule_name VARCHAR,
  condition JSONB, -- When to apply
  action JSONB, -- What to do
  success_rate REAL, -- RL-style reward
  application_count INTEGER
);
```

**Agent Learning Loop**:
```typescript
// 1. Episodic: Record experience
await AgentEpisodicMemory.record({
  agentId: 'EXPERT_11',
  pageId: 'visual-editor',
  eventType: 'fix_applied',
  context: { issue: 'broken_button', fix: 'add_onclick' },
  outcome: 'success',
  surpriseScore: 0.8 // High surprise = remember vividly
});

// 2. Chunking: Generalize to semantic knowledge
if (similarEpisodes.length >= 3) {
  await AgentSemanticMemory.chunk({
    concept: 'broken_button_pattern',
    pattern: { hasElement: true, missingHandler: true },
    learnedFrom: similarEpisodes
  });
}

// 3. Procedural: Create rule
await AgentProceduralMemory.createRule({
  ruleName: 'fix_missing_onclick',
  condition: { elementType: 'button', hasOnClick: false },
  action: { addAttribute: 'onClick', value: 'handleClick' },
  successRate: 0.95
});

// 4. Mental Simulation: Test before applying
const simulatedOutcome = await mentalSimulation.test({
  rule: 'fix_missing_onclick',
  currentState: pageState
});
if (simulatedOutcome.confidence > 0.8) {
  applyFix();
}
```

**Benefits**:
- ✅ Agents learn from experience (chunking)
- ✅ Transfer learning (semantic patterns apply across pages)
- ✅ Risk-free testing (mental simulation)
- ✅ Long-term memory (episodic recall)
- ✅ Self-improvement (procedural rules evolve)

**Implementation Priority**: **MEDIUM** (major capability boost)

---

### **Phase 4: Predictive Coding for Visual Editor**
**Status**: Ready to implement  
**Repository**: https://github.com/bjornvz/PRECO (PyTorch)  
**Alternative**: https://github.com/RobertRosenbaum/Torch2PC

**What It Adds**:
- **Brain-inspired error minimization** (like FEP but for visual predictions)
- **Iterative inference** (agent refines predictions until convergence)
- **Local learning** (Hebbian-style plasticity, no global backprop)
- **Biological plausibility** (neuromorphic hardware ready)

**Use Case**: Visual Editor Code Generation
```typescript
// Current: Direct LLM generation
const generatedCode = await groq.chat({
  model: 'llama-3.3-70b',
  messages: [{ role: 'user', content: userIntent }]
});

// Enhanced: Predictive Coding Loop
class PredictiveCodingCodeGenerator {
  private predictions: CodePrediction[] = [];
  
  async generateWithPC(userIntent: string): Promise<string> {
    // 1. Initial prediction (top-down)
    let prediction = await this.predictCode(userIntent);
    this.predictions.push(prediction);
    
    // 2. Iterative refinement (minimize prediction error)
    for (let i = 0; i < 20; i++) {
      // Compare prediction with expected structure
      const error = this.computePredictionError(prediction);
      
      if (error < threshold) break; // Converged
      
      // Update prediction (error-driven)
      prediction = await this.refinePrediction(prediction, error);
      this.predictions.push(prediction);
    }
    
    // 3. Return final prediction
    return prediction.code;
  }
  
  private computePredictionError(pred: CodePrediction): number {
    // Compare predicted code structure with:
    // - AST patterns (syntax validity)
    // - Type signatures (TypeScript compliance)
    // - Route patterns (matches existing conventions)
    // - Test coverage (has test cases)
    return Math.abs(expected - predicted);
  }
}
```

**Benefits**:
- ✅ Higher quality code (iterative refinement)
- ✅ Fewer syntax errors (prediction error minimization)
- ✅ Better alignment with codebase (context-aware predictions)
- ✅ Explainable (can inspect prediction refinement steps)

**Implementation Priority**: **LOW** (experimental, research-oriented)

---

### **Phase 5: SuperAGI Production Patterns**
**Status**: Ready to implement  
**Repository**: https://github.com/TransformerOptimus/SuperAGI

**What It Adds**:
- **Performance telemetry** (agent execution time, token usage)
- **Cost tracking** (per-agent, per-page, per-fix)
- **Marketplace architecture** (pluggable agent toolkits)
- **Optimized token usage** (reduce API costs 50-90%)

**Current Monitoring** (Mundo Tango):
```typescript
// Current: Basic timing
const startTime = Date.now();
await runAudit(pageId);
const duration = Date.now() - startTime;
console.log(`Audit took ${duration}ms`);
```

**Enhanced** (SuperAGI-inspired):
```typescript
// Enhanced: Full telemetry
interface AgentMetrics {
  agentId: string;
  operation: string;
  duration: number;
  tokensUsed: number;
  costUSD: number;
  cacheHitRate: number;
  successRate: number;
}

class AgentTelemetry {
  async trackOperation<T>(
    agentId: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const startTokens = this.getTokenCount();
    
    try {
      const result = await fn();
      
      await this.recordMetrics({
        agentId,
        operation,
        duration: Date.now() - startTime,
        tokensUsed: this.getTokenCount() - startTokens,
        costUSD: this.calculateCost(),
        cacheHitRate: this.getCacheHitRate(),
        successRate: 1.0
      });
      
      return result;
    } catch (error) {
      await this.recordMetrics({ ...metrics, successRate: 0.0 });
      throw error;
    }
  }
}

// Usage
const result = await telemetry.trackOperation(
  'EXPERT_11',
  'audit_visual_editor',
  () => PageAuditService.runAudit('visual-editor')
);

// Dashboard query
const agentCosts = await db
  .select()
  .from(agentMetrics)
  .where(gte(agentMetrics.timestamp, last30Days))
  .groupBy(agentMetrics.agentId);
// → EXPERT_11: $2.50, AGENT_6: $0.80, ...
```

**Benefits**:
- ✅ Cost visibility (which agents are expensive?)
- ✅ Performance optimization (identify slow agents)
- ✅ Budget controls (cap spending per agent)
- ✅ ROI tracking (cost vs value delivered)

**Implementation Priority**: **HIGH** (immediate ROI)

---

### **Phase 6: Multi-Agent RL (Mava + PyMARL)**
**Status**: **IN PROGRESS** ⭐  
**Repository**: https://github.com/instadeepai/Mava (JAX-based)  
**Alternative**: https://github.com/sjtu-marl/malib (PSRO, Self-Play)

**What It Adds**:
- **Cooperative learning** (agents learn to collaborate)
- **Self-play** (agents train against each other)
- **Population-based training** (evolve agent strategies)
- **JAX acceleration** (blazing fast experiments)

**Use Case**: Self-Healing Agent Collaboration
```python
# Mava-based multi-agent self-healing trainer
import jax
from mava import agents, systems

# Define agent team
team = {
  'audit_agent': AuditAgent(),
  'fix_agent': FixAgent(),
  'validate_agent': ValidateAgent()
}

# Environment: Mundo Tango page with issues
env = SelfHealingEnv(pageId='visual-editor')

# Cooperative MARL training
system = systems.Anakin(
  agents=team,
  env=env,
  learning_paradigm='CTDE',  # Centralized training, decentralized execution
  n_episodes=10000
)

# Train agents to minimize:
# - Time to fix (reward)
# - User satisfaction (reward)
# - Cost (penalty)
# - Regression rate (penalty)
trained_agents = system.train()

# Deploy learned policies
await deployAgentPolicies(trained_agents);
```

**Benefits**:
- ✅ Agents learn optimal collaboration (who does what, when?)
- ✅ Emergent strategies (agents discover novel fixes)
- ✅ Continuous improvement (self-play evolution)
- ✅ Robust to distribution shift (trained on diverse scenarios)

**Implementation Priority**: **MEDIUM** (long-term capability)

---

## 🎯 Immediate Action Plan

### **Week 1: Production Foundations** (Phases 2 + 5)
1. ✅ Implement LangGraph-style state management
2. ✅ Add PostgreSQL checkpointing
3. ✅ Build SuperAGI-inspired telemetry
4. ✅ Create agent cost/performance dashboard

**Expected Impact**:
- 50% reduction in lost progress (checkpoints)
- 70% cost visibility improvement (telemetry)
- 30% faster debugging (state inspection)

---

### **Month 1: Cognitive Memory** (Phase 3)
1. ✅ Add 3 memory tables (episodic, semantic, procedural)
2. ✅ Implement chunking algorithm (generalize from episodes)
3. ✅ Build mental simulation service (test-before-apply)
4. ✅ Create memory dashboard (what has each agent learned?)

**Expected Impact**:
- 40% reduction in repeated mistakes (procedural memory)
- 60% faster issue resolution (semantic patterns)
- 80% reduction in risky fixes (mental simulation)

---

### **Q1 2025: Real-Time Inference** (Phase 1)
1. ⏳ Wait for RxInferClient.ts release
2. ⏳ Integrate TypeScript client with agent beliefs
3. ⏳ Migrate from batch updates to streaming inference
4. ⏳ Benchmark latency (<200ms target)

**Expected Impact**:
- 90% latency reduction (batch → streaming)
- 10x scalability (factor graphs)
- Real-time belief updates (no delays)

---

### **Q2 2025: Advanced Capabilities** (Phases 4 + 6)
1. 🔬 Research: Predictive coding for Visual Editor
2. 🔬 Research: Multi-agent RL for self-healing
3. 🔬 Prototype: PyTorch integration for PC
4. 🔬 Prototype: Mava-based agent training

**Expected Impact**:
- 20% code quality improvement (predictive coding)
- 30% faster issue resolution (MARL collaboration)
- Novel agent strategies (emergent from RL)

---

## 📊 Success Metrics

### **Phase 2 (LangGraph State)**:
- ✅ 100% of agent workflows checkpointed
- ✅ <50ms state persistence latency
- ✅ Zero lost progress on server restarts

### **Phase 3 (SOAR Memory)**:
- ✅ 1000+ episodes stored per agent (episodic)
- ✅ 50+ generalized patterns learned (semantic)
- ✅ 30+ procedural rules created (skills)
- ✅ 95%+ mental simulation accuracy

### **Phase 5 (Telemetry)**:
- ✅ 100% of agent operations tracked
- ✅ Real-time cost dashboard (<1s refresh)
- ✅ 50% cost reduction via optimization

---

## 🔗 Key Resources

### **Frameworks to Integrate**:
1. **RxInfer.jl** - https://rxinfer.ml (Q1 2025)
2. **LangGraph** - https://langchain-ai.github.io/langgraph/
3. **SOAR** - https://github.com/SoarGroup/Soar
4. **SuperAGI** - https://github.com/TransformerOptimus/SuperAGI
5. **Mava** - https://github.com/instadeepai/Mava
6. **PRECO** - https://github.com/bjornvz/PRECO

### **Research Papers**:
- "Introducing ActiveInference.jl" (Entropy, Jan 2025)
- "Neuro-Symbolic AI in 2024: A Systematic Review" (arXiv 2501.05435)
- "LangGraph: Multi-Agent Workflows" (LangChain Blog)
- "Introduction to SOAR Cognitive Architecture" (arXiv 2205.03854)

---

## 🚀 Next Steps

1. **Immediate** (This Week):
   - Implement LangGraph-style state management
   - Add SuperAGI telemetry
   - Build agent cost dashboard

2. **Short-Term** (This Month):
   - Add SOAR-inspired memory tables
   - Implement chunking + mental simulation
   - Create memory visualization dashboard

3. **Long-Term** (Q1-Q2 2025):
   - Integrate RxInfer.jl client when released
   - Research predictive coding for Visual Editor
   - Prototype multi-agent RL training

---

**This plan transforms Mundo Tango from FEP-based reactive learning to proactive neurosymbolic intelligence** 🧠✨
