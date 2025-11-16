# MB.MD PLAN: MAKE MR BLUE ACTUALLY SMART

**Date**: November 16, 2025  
**Methodology**: MB.MD v8.0 (6 Pillars + 5 Development Principles)  
**Objective**: Implement ALL AI learnings (DPO, Curriculum, GEPA, LIMI, AI Arbitrage) into Mr Blue

---

## 🎯 THE MISSION

Take Mr Blue from **"has 8 systems deployed"** to **"actually smart AI agent"** by implementing:
1. **AI Arbitrage** (intelligent routing + cost optimization)
2. **DPO Training** (learn from preferences)
3. **Curriculum Learning** (simple → complex progression)
4. **GEPA Self-Evolution** (reflect → propose → test → select)
5. **LIMI Curation** (78 golden examples)

---

## 📊 CURRENT STATE AUDIT

### **What Mr Blue Has** ✅
1. ✅ **System 1: Context Service** - LanceDB RAG (134,648 lines)
2. ✅ **System 2: Video Conference** - Daily.co calls
3. ✅ **System 3: 3D Avatar** - React Three Fiber
4. ✅ **System 4: Vibe Coding** - GROQ Llama-3.1-70b
5. ✅ **System 5: Voice Cloning** - ElevenLabs
6. ✅ **System 6: Messenger** - Facebook 2-way chat
7. ✅ **System 7: Autonomous Engine** - Task decomposition
8. ✅ **System 8: Memory System** - LanceDB conversation history
9. ✅ **Multi-AI Orchestration** - 5 platforms, fallback chains, semantic caching

### **What Mr Blue Lacks** ❌
1. ❌ **AI Arbitrage** - No task-based intelligent routing, no cascade strategy
2. ❌ **DPO Training** - Not learning from routing preferences
3. ❌ **Curriculum Learning** - No progressive difficulty scaling
4. ❌ **GEPA Self-Evolution** - No automated improvement cycles
5. ❌ **LIMI Curation** - No golden example dataset (0/78)
6. ❌ **Cost Budgets** - No per-user spending limits
7. ❌ **Quality Metrics** - No confidence scoring for cascade decisions

---

## 🧠 ARCHITECTURE: SMART MR BLUE

```
┌─────────────────────────────────────────────────────────┐
│                    USER REQUEST                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  🧠 TASK CLASSIFIER (LLM-based)                        │
│  - Analyze query complexity (0.0 - 1.0)                │
│  - Identify domain (code/chat/reasoning/summarization) │
│  - Determine required quality threshold                │
│  - Check user budget constraints                       │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  💰 MODEL SELECTOR (Cost-Aware)                        │
│  - Query model registry (5 platforms, 15+ models)      │
│  - Filter by quality threshold                         │
│  - Sort by cost (cheapest first)                       │
│  - Build cascade chain (3 tiers)                       │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  🎯 CASCADE EXECUTOR (Progressive Escalation)          │
│  - Tier 1: Cheapest model (Llama 3 8B, Gemini Flash)  │
│  - Check confidence score (>0.8 = accept)              │
│  - Tier 2: Mid-tier (GPT-3.5, Gemini Pro)             │
│  - Check confidence score (>0.9 = accept)              │
│  - Tier 3: Premium (GPT-4o, Claude Sonnet)            │
│  - Always accept (no further escalation)               │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  📊 COST TRACKER (Budget Monitoring)                   │
│  - Track spend per user/tier                           │
│  - Alert if budget threshold exceeded (80%)            │
│  - Block requests if budget maxed out                  │
│  - Generate daily/weekly cost reports                  │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  🎓 DPO TRAINER (Learn from Preferences)               │
│  - Store routing decision (query, model, cost, quality)│
│  - Collect user feedback (thumbs up/down)              │
│  - Generate (CHOSEN, REJECTED) pairs                   │
│  - Retrain classifier every 1,000 decisions            │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  🔄 GEPA SELF-EVOLVER (Continuous Improvement)         │
│  - Reflect: Analyze failures (low quality, budget fail)│
│  - Propose: Generate alternative routing strategies    │
│  - Test: A/B test on 10% of traffic                    │
│  - Select: Adopt best cost/quality ratio               │
│  - Update: Merge learnings into mb.md + code           │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              RESPONSE TO USER                          │
└────────────────────────────────────────────────────────┘
```

---

## 📋 IMPLEMENTATION PLAN (3 PARALLEL SUBAGENTS)

### **SUBAGENT 1: AI ARBITRAGE CORE** (45 min)

**Files to Create**:
1. `server/services/ai/TaskClassifier.ts` (200 lines)
2. `server/services/ai/ModelSelector.ts` (250 lines)
3. `server/services/ai/CascadeExecutor.ts` (300 lines)
4. `server/services/ai/CostTracker.ts` (200 lines)

**Files to Enhance**:
1. `server/services/ai/UnifiedAIOrchestrator.ts` - Integrate new components
2. `shared/schema.ts` - Add routing_decisions, cost_tracking tables

**Tasks**:
1. **Build TaskClassifier** - LLM-based complexity analyzer
   ```typescript
   export class TaskClassifier {
     async classify(query: string, context?: string): Promise<TaskClassification> {
       // Use Llama 3 8B (free, fast) to analyze complexity
       const analysis = await GroqService.query({
         model: 'llama-3.1-8b-instant',
         systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
         prompt: `Analyze this query: "${query}"\n\nContext: ${context || 'none'}`,
       });
       
       return parseClassification(analysis);
     }
   }
   
   interface TaskClassification {
     complexity: number;          // 0.0 - 1.0 (0 = trivial, 1 = expert-level)
     domain: 'code' | 'chat' | 'reasoning' | 'summarization' | 'translation';
     requiredQuality: number;     // 0.0 - 1.0 (minimum acceptable quality)
     estimatedTokens: number;     // Input + output token estimate
     budgetConstraint: number;    // Max $ per request (from user tier)
   }
   ```

2. **Build ModelSelector** - Cost-aware routing logic
   ```typescript
   export class ModelSelector {
     async selectModel(classification: TaskClassification): Promise<ModelSelection> {
       // Get all models meeting quality threshold
       const candidates = await this.getEligibleModels(classification);
       
       // Sort by cost (cheapest first)
       const sorted = candidates.sort((a, b) => a.cost - b.cost);
       
       // Build 3-tier cascade chain
       return {
         tier1: sorted[0],           // Cheapest
         tier2: sorted[Math.floor(sorted.length / 2)], // Mid-tier
         tier3: sorted[sorted.length - 1],            // Premium
       };
     }
     
     private async getEligibleModels(classification: TaskClassification) {
       const registry = MODEL_REGISTRY[classification.domain];
       return registry.filter(model => 
         model.qualityScore >= classification.requiredQuality &&
         model.cost <= classification.budgetConstraint
       );
     }
   }
   ```

3. **Build CascadeExecutor** - Progressive escalation
   ```typescript
   export class CascadeExecutor {
     async execute(
       query: string,
       cascade: ModelSelection
     ): Promise<CascadeResult> {
       // Tier 1: Cheapest model
       let result = await this.tryModel(cascade.tier1, query);
       if (result.confidence >= 0.8) {
         return { ...result, tier: 1, escalated: false };
       }
       
       // Tier 2: Mid-tier model
       result = await this.tryModel(cascade.tier2, query);
       if (result.confidence >= 0.9) {
         return { ...result, tier: 2, escalated: true };
       }
       
       // Tier 3: Premium model (always accept)
       result = await this.tryModel(cascade.tier3, query);
       return { ...result, tier: 3, escalated: true };
     }
     
     private async tryModel(model: ModelInfo, query: string) {
       const response = await UnifiedAIOrchestrator.queryDirect(
         model.platform,
         model.model,
         query
       );
       
       // Calculate confidence from response metadata
       const confidence = this.calculateConfidence(response);
       
       return { ...response, confidence };
     }
   }
   ```

4. **Build CostTracker** - Budget monitoring
   ```typescript
   export class CostTracker {
     async trackSpend(userId: number, cost: number, platform: string) {
       // Update user spend
       await db.insert(aiSpendTracking).values({
         userId,
         cost,
         platform,
         timestamp: new Date(),
       });
       
       // Check budget threshold
       const totalSpend = await this.getUserSpend(userId);
       const userTier = await this.getUserTier(userId);
       const budget = TIER_BUDGETS[userTier];
       
       if (totalSpend >= budget * 0.8) {
         await this.sendBudgetAlert(userId, totalSpend, budget);
       }
       
       if (totalSpend >= budget) {
         throw new Error('Budget exceeded. Upgrade to continue.');
       }
     }
   }
   ```

**Deliverable**: AI Arbitrage Core (4 new services + enhanced orchestrator)

---

### **SUBAGENT 2: AI LEARNING SYSTEMS** (40 min)

**Files to Create**:
1. `server/services/ai/DPOTrainer.ts` (300 lines)
2. `server/services/ai/CurriculumManager.ts` (200 lines)
3. `server/services/ai/GEPAEvolver.ts` (250 lines)
4. `server/services/ai/LIMICurator.ts` (150 lines)

**Files to Enhance**:
1. `shared/schema.ts` - Add dpo_training_data, curriculum_levels, gepa_experiments, golden_examples tables

**Tasks**:
1. **Build DPOTrainer** - Learn from preferences
   ```typescript
   export class DPOTrainer {
     async recordDecision(decision: RoutingDecision) {
       // Store routing decision
       await db.insert(routingDecisions).values({
         query: decision.query,
         classification: decision.classification,
         modelUsed: decision.modelUsed,
         cost: decision.cost,
         latency: decision.latency,
         quality: decision.quality,
         userFeedback: null, // Filled later
       });
     }
     
     async trainFromFeedback() {
       // Get decisions with feedback
       const decisions = await this.getDecisionsWithFeedback();
       
       // Generate (CHOSEN, REJECTED) pairs
       const pairs = this.generatePreferencePairs(decisions);
       
       // Train classifier on preferences
       await this.updateClassifier(pairs);
       
       console.log(`✅ DPO training complete: ${pairs.length} pairs processed`);
     }
     
     private generatePreferencePairs(decisions: RoutingDecision[]) {
       const pairs = [];
       
       for (const decision of decisions) {
         if (decision.userFeedback === 'positive') {
           // CHOSEN: Actual decision (good cost/quality)
           // REJECTED: More expensive alternative
           pairs.push({
             query: decision.query,
             chosen: decision.modelUsed,
             rejected: this.findMoreExpensiveModel(decision),
           });
         }
       }
       
       return pairs;
     }
   }
   ```

2. **Build CurriculumManager** - Progressive difficulty
   ```typescript
   export class CurriculumManager {
     async getCurrentLevel(userId: number): Promise<CurriculumLevel> {
       const userStats = await this.getUserStats(userId);
       
       // Simple → Complex progression
       if (userStats.successRate < 0.7) return 'basic';
       if (userStats.successRate < 0.85) return 'intermediate';
       if (userStats.successRate < 0.95) return 'advanced';
       return 'expert';
     }
     
     async adjustDifficulty(userId: number, result: TaskResult) {
       // If user succeeds consistently, increase difficulty
       const recentSuccess = await this.getRecentSuccessRate(userId);
       
       if (recentSuccess > 0.9) {
         await this.promoteCurriculumLevel(userId);
       } else if (recentSuccess < 0.6) {
         await this.demoteCurriculumLevel(userId);
       }
     }
     
     getLevelConfig(level: CurriculumLevel): CurriculumConfig {
       const configs = {
         basic: { maxComplexity: 0.3, allowedModels: ['llama-3-8b', 'gemini-flash'] },
         intermediate: { maxComplexity: 0.6, allowedModels: ['gpt-3.5', 'gemini-pro'] },
         advanced: { maxComplexity: 0.85, allowedModels: ['gpt-4o', 'claude-sonnet'] },
         expert: { maxComplexity: 1.0, allowedModels: ['all'] },
       };
       
       return configs[level];
     }
   }
   ```

3. **Build GEPAEvolver** - Self-evolution
   ```typescript
   export class GEPAEvolver {
     async runEvolutionCycle() {
       // 1. REFLECT: Analyze failures
       const failures = await this.analyzeFailures();
       
       // 2. PROPOSE: Generate alternative strategies
       const proposals = await this.generateProposals(failures);
       
       // 3. TEST: A/B test on 10% of traffic
       const results = await this.abTest(proposals);
       
       // 4. SELECT: Adopt best strategy
       const best = this.selectBestStrategy(results);
       
       // 5. UPDATE: Merge learnings
       await this.updateRoutingLogic(best);
       await this.updateMbMd(best);
       
       console.log(`✅ GEPA evolution complete: ${best.name} adopted`);
     }
     
     private async generateProposals(failures: Failure[]) {
       // Use GPT-4o to analyze failures and propose alternatives
       const analysis = await OpenAIService.query({
         model: 'gpt-4o',
         systemPrompt: GEPA_SYSTEM_PROMPT,
         prompt: `Failures: ${JSON.stringify(failures)}\n\nPropose 3 alternative routing strategies.`,
       });
       
       return parseProposals(analysis);
     }
   }
   ```

4. **Build LIMICurator** - Golden examples
   ```typescript
   export class LIMICurator {
     async curateGoldenExample(decision: RoutingDecision) {
       // Criteria for golden examples:
       // 1. High quality output (user rated 4-5 stars)
       // 2. Cost-effective (saved 50%+ vs. baseline)
       // 3. Diverse (covers different domains)
       // 4. Edge case (includes unusual queries)
       
       if (!this.meetsGoldenCriteria(decision)) return;
       
       await db.insert(goldenExamples).values({
         query: decision.query,
         classification: decision.classification,
         modelUsed: decision.modelUsed,
         cost: decision.cost,
         quality: decision.quality,
         reasoning: decision.reasoning,
         tags: decision.tags,
       });
       
       const count = await this.getGoldenExamplesCount();
       console.log(`✅ Golden example added (${count}/78)`);
     }
     
     async getTrainingDataset(): Promise<GoldenExample[]> {
       // Return 78 curated examples for DPO training
       return await db.select().from(goldenExamples).limit(78);
     }
   }
   ```

**Deliverable**: AI Learning Systems (4 new services)

---

### **SUBAGENT 3: DATABASE & API ROUTES** (25 min)

**Files to Create**:
1. `server/routes/ai-arbitrage-routes.ts` (150 lines)
2. `server/routes/dpo-training-routes.ts` (100 lines)

**Files to Enhance**:
1. `shared/schema.ts` - Add 6 new tables
2. `server/routes.ts` - Register new routes

**Tasks**:
1. **Database Schema** - Add AI arbitrage tables
   ```typescript
   // routing_decisions table
   export const routingDecisions = pgTable("routing_decisions", {
     id: serial("id").primaryKey(),
     userId: integer("user_id").notNull().references(() => users.id),
     query: text("query").notNull(),
     classification: jsonb("classification").notNull(), // TaskClassification
     modelUsed: varchar("model_used").notNull(),
     cost: decimal("cost").notNull(),
     latency: integer("latency").notNull(),
     quality: decimal("quality"),
     userFeedback: varchar("user_feedback"), // 'positive', 'negative', null
     createdAt: timestamp("created_at").defaultNow(),
   });
   
   // ai_spend_tracking table
   export const aiSpendTracking = pgTable("ai_spend_tracking", {
     id: serial("id").primaryKey(),
     userId: integer("user_id").notNull().references(() => users.id),
     platform: varchar("platform").notNull(),
     model: varchar("model").notNull(),
     cost: decimal("cost").notNull(),
     tokens: integer("tokens").notNull(),
     timestamp: timestamp("timestamp").defaultNow(),
   });
   
   // golden_examples table
   export const goldenExamples = pgTable("golden_examples", {
     id: serial("id").primaryKey(),
     query: text("query").notNull(),
     classification: jsonb("classification").notNull(),
     modelUsed: varchar("model_used").notNull(),
     cost: decimal("cost").notNull(),
     quality: decimal("quality").notNull(),
     reasoning: text("reasoning"),
     tags: text("tags").array(),
     createdAt: timestamp("created_at").defaultNow(),
   });
   
   // gepa_experiments table
   export const gepaExperiments = pgTable("gepa_experiments", {
     id: serial("id").primaryKey(),
     name: varchar("name").notNull(),
     hypothesis: text("hypothesis").notNull(),
     config: jsonb("config").notNull(),
     results: jsonb("results"),
     status: varchar("status").notNull(), // 'running', 'completed', 'adopted'
     createdAt: timestamp("created_at").defaultNow(),
   });
   
   // curriculum_levels table
   export const curriculumLevels = pgTable("curriculum_levels", {
     id: serial("id").primaryKey(),
     userId: integer("user_id").notNull().references(() => users.id),
     level: varchar("level").notNull(), // 'basic', 'intermediate', 'advanced', 'expert'
     successRate: decimal("success_rate"),
     taskCount: integer("task_count").default(0),
     updatedAt: timestamp("updated_at").defaultNow(),
   });
   
   // dpo_training_data table
   export const dpoTrainingData = pgTable("dpo_training_data", {
     id: serial("id").primaryKey(),
     query: text("query").notNull(),
     chosenModel: varchar("chosen_model").notNull(),
     chosenCost: decimal("chosen_cost").notNull(),
     rejectedModel: varchar("rejected_model").notNull(),
     rejectedCost: decimal("rejected_cost").notNull(),
     qualityDelta: decimal("quality_delta"),
     createdAt: timestamp("created_at").defaultNow(),
   });
   ```

2. **API Routes** - Expose AI arbitrage endpoints
   ```typescript
   // server/routes/ai-arbitrage-routes.ts
   router.post("/ai/smart-query", authenticateToken, async (req, res) => {
     try {
       const { query, context } = req.body;
       const userId = req.userId!;
       
       // 1. Classify task
       const classification = await TaskClassifier.classify(query, context);
       
       // 2. Select model (cost-aware)
       const cascade = await ModelSelector.selectModel(classification);
       
       // 3. Execute cascade
       const result = await CascadeExecutor.execute(query, cascade);
       
       // 4. Track cost
       await CostTracker.trackSpend(userId, result.cost, result.platform);
       
       // 5. Record decision (for DPO)
       await DPOTrainer.recordDecision({ userId, query, classification, ...result });
       
       // 6. Update curriculum
       await CurriculumManager.adjustDifficulty(userId, result);
       
       res.json({
         content: result.content,
         metadata: {
           model: result.model,
           cost: result.cost,
           latency: result.latency,
           tier: result.tier,
           escalated: result.escalated,
         },
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   });
   
   router.post("/ai/feedback", authenticateToken, async (req, res) => {
     try {
       const { decisionId, feedback } = req.body; // 'positive' or 'negative'
       
       await DPOTrainer.recordFeedback(decisionId, feedback);
       
       res.json({ success: true });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   });
   
   router.get("/ai/cost-stats", authenticateToken, async (req, res) => {
     try {
       const userId = req.userId!;
       
       const stats = await CostTracker.getUserStats(userId);
       
       res.json(stats);
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

**Deliverable**: Database schema + API routes

---

## 🧪 TESTING STRATEGY

### **Unit Tests** (95%+ coverage)
1. TaskClassifier - Test complexity scoring
2. ModelSelector - Test cost-aware selection
3. CascadeExecutor - Test progressive escalation
4. CostTracker - Test budget enforcement

### **Integration Tests**
1. E2E routing flow (query → classification → selection → execution)
2. DPO training loop (decision → feedback → retrain)
3. GEPA evolution cycle (reflect → propose → test → select)

### **Performance Tests**
1. Routing latency (<200ms overhead)
2. Cascade execution (3 tiers, 80% tier-1 success)
3. Cache hit rate (90%+ with SemanticCache)

### **Cost Benchmarks**
1. Baseline: 100% GPT-4 = $0.06/1K tokens
2. Target: Blended routing = $0.008/1K tokens (87% savings)

---

## 📈 SUCCESS METRICS

### **AI Arbitrage**
- ✅ 50-90% cost reduction vs. baseline
- ✅ <5% quality degradation
- ✅ <200ms routing latency
- ✅ 80% tier-1 success rate (cheap models handle most tasks)

### **DPO Training**
- ✅ Collect 100+ routing decisions/week
- ✅ 95%+ accuracy in complexity classification
- ✅ Retrain classifier every 1,000 decisions

### **Curriculum Learning**
- ✅ Track user progression (basic → expert)
- ✅ Adjust difficulty based on success rate
- ✅ 90%+ user retention (engaging difficulty curve)

### **GEPA Self-Evolution**
- ✅ Run 1 evolution cycle/month
- ✅ A/B test 3+ proposals per cycle
- ✅ Adopt 1+ improvement per cycle

### **LIMI Curation**
- ✅ Curate 78 golden examples by Week 12
- ✅ Diversity across domains (code, chat, reasoning, etc.)
- ✅ Include edge cases (unusual queries, budget limits)

---

## 🚀 EXECUTION TIMELINE

### **Phase 1: AI Arbitrage Core** (45 min)
- Build TaskClassifier, ModelSelector, CascadeExecutor, CostTracker
- Enhance UnifiedAIOrchestrator
- Add database tables

### **Phase 2: AI Learning Systems** (40 min)
- Build DPOTrainer, CurriculumManager, GEPAEvolver, LIMICurator
- Add database tables

### **Phase 3: API Routes & Testing** (25 min)
- Create AI arbitrage routes
- Unit tests (95%+ coverage)
- Integration tests
- Cost benchmarks

**TOTAL**: 110 minutes (3 parallel subagents)

---

## ✅ COMPLETION CHECKLIST

### **AI Arbitrage** (CORE)
- ⏳ TaskClassifier built (LLM-based complexity analyzer)
- ⏳ ModelSelector built (cost-aware routing logic)
- ⏳ CascadeExecutor built (progressive escalation)
- ⏳ CostTracker built (budget monitoring)
- ⏳ UnifiedAIOrchestrator enhanced (integration)

### **AI Learning** (PILLAR 6)
- ⏳ DPOTrainer built (learn from preferences)
- ⏳ CurriculumManager built (progressive difficulty)
- ⏳ GEPAEvolver built (self-evolution)
- ⏳ LIMICurator built (golden examples)

### **Database & API**
- ⏳ 6 new tables created (routing_decisions, ai_spend_tracking, etc.)
- ⏳ AI arbitrage routes created (/ai/smart-query, /ai/feedback, etc.)
- ⏳ Schema migrations pushed (npm run db:push)

### **Testing & Validation**
- ⏳ Unit tests (95%+ coverage)
- ⏳ Integration tests (E2E routing flow)
- ⏳ Cost benchmarks (50-90% savings target)
- ⏳ LSP diagnostics (0 errors)

### **Documentation**
- ⏳ Update mb.md with AI arbitrage learnings
- ⏳ Update replit.md with completion status
- ⏳ Create MB_MD_SMART_MR_BLUE_SUMMARY.md

---

## 🎯 NEXT STEPS

1. ✅ **AI Arbitrage Learning Plan** - Complete
2. ✅ **Make Mr Blue Smart Plan** - This document
3. ⏳ **Audit MB_MD_FINAL_PLAN.md** - Review/fix existing plan
4. ⏳ **Execute Implementation** - Build AI arbitrage + learning systems
5. ⏳ **Execute Final Plan** - Build remaining 927 features

**Status**: Planning complete. Ready for implementation! 🚀

---

**Prepared by**: Replit AI  
**Methodology**: MB.MD v8.0 (6 Pillars + 5 Development Principles)  
**Date**: November 16, 2025  
**Time Invested**: 25 minutes (planning)
