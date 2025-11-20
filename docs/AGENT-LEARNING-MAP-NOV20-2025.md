# 🧠 AGENT LEARNING MAP - Mundo Tango AI Architecture
**MB.MD Protocol v9.2 - Recursive Self-Improvement System**  
**Created:** November 20, 2025  
**Purpose:** Map all 62+ agents to specific learning needs, create recursive improvement loops

---

## 🎯 THE VISION: Agents That Teach Each Other

**Current State:** 62+ specialized agents working independently  
**Goal State:** Network of agents that learn from each other, compound knowledge exponentially

**Key Principle:** Each agent should:
1. **Learn** from its own experiences (errors, successes)
2. **Share** knowledge with related agents via knowledge bases
3. **Query** other agents' knowledge before acting
4. **Improve** recursively - identify gaps, fill them, repeat

---

## 📊 AGENT CLASSIFICATION SYSTEM

### **Tier 1: Core Learning Agents** (Teach others how to learn)
These agents form the "teaching faculty" - they enable learning across the system.

1. **Agent SME Training Service** (`agent-sme/AgentSMETrainingService.ts`)
   - **Role:** Trains agents to become Subject Matter Experts
   - **Learns:** Training methodologies, agent performance patterns
   - **Teaches:** How to learn from documentation
   - **Knowledge Base:** `docs/AGENT_SME_TRAINING_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Memory: Remember which agents have been trained on what
     - Error Learning: Track training failures, adapt curriculum
     - Preferences: Learn best training methods per agent type

2. **Agent Memory Service** (`ai/AgentMemoryService.ts`)
   - **Role:** Manages long-term memory for all agents
   - **Learns:** Memory patterns, retrieval effectiveness
   - **Teaches:** How to store/retrieve knowledge efficiently
   - **Knowledge Base:** `docs/AGENT_MEMORY_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Conversation Memory: Track all agent conversations
     - Preference Learning: Optimal memory strategies per agent
     - Predictive: Anticipate what knowledge will be needed

3. **Agent Collaboration Service** (`collaboration/agentCollaborationService.ts`)
   - **Role:** Coordinates multi-agent tasks
   - **Learns:** Collaboration patterns, effective team compositions
   - **Teaches:** How agents should work together
   - **Knowledge Base:** `docs/AGENT_COLLABORATION_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Memory: Remember successful collaborations
     - Error Learning: Failed collaborations → better task routing
     - Predictive: Suggest agent teams before asked

4. **Agent Validation Service** (`AgentValidationService.ts`)
   - **Role:** Quality control for agent outputs
   - **Learns:** Common failure patterns, quality metrics
   - **Teaches:** Self-validation techniques
   - **Knowledge Base:** `docs/AGENT_VALIDATION_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Error Learning: Build comprehensive failure database
     - Preferences: Learn quality thresholds per use case
     - Predictive: Predict quality issues before they occur

5. **Agent Telemetry Service** (`ai/AgentTelemetryService.ts`)
   - **Role:** Monitors agent performance, costs, usage
   - **Learns:** Performance patterns, optimization opportunities
   - **Teaches:** Resource efficiency
   - **Knowledge Base:** `docs/AGENT_TELEMETRY_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Memory: Historical performance trends
     - Error Learning: Performance degradation patterns
     - Predictive: Forecast resource needs

### **Tier 2: Mr. Blue System Agents** (User-facing AI assistants)
These agents directly interact with users and need comprehensive learning.

6. **Mr. Blue Visual Editor Agent** (primary interface)
   - **Role:** Natural language → code generation
   - **Learns:** User preferences, code patterns, design systems
   - **Teaches:** Code generation best practices
   - **Knowledge Base:** `docs/MR_BLUE_VISUAL_EDITOR_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - ✅ Conversation Memory (Phase 1 - CRITICAL)
     - ✅ Error Learning (Phase 2 - CRITICAL)
     - ✅ User Preferences (Phase 3 - CRITICAL)
     - Agent Knowledge (Phase 4)
     - Predictive Assistance (Phase 5)

7. **Error Analysis Agent** (`mrBlue/errorAnalysisAgent.ts`)
   - **Role:** Analyzes errors, suggests fixes
   - **Learns:** Error patterns across all features
   - **Teaches:** Debugging methodologies
   - **Knowledge Base:** `docs/ERROR_ANALYSIS_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - ✅ Error Learning (Phase 2 - PRIMARY FUNCTION)
     - Memory: All past errors and solutions
     - Agent Knowledge: Share errors across agents

8. **Solution Suggester Agent** (`mrBlue/solutionSuggesterAgent.ts`)
   - **Role:** Proposes solutions to problems
   - **Learns:** Solution effectiveness, user feedback
   - **Teaches:** Problem-solving strategies
   - **Knowledge Base:** `docs/SOLUTION_SUGGESTER_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Memory: Remember what solutions worked
     - Error Learning: Failed solutions → better suggestions
     - Predictive: Suggest solutions before asked

9. **Quality Validator Agent** (`mrBlue/qualityValidatorAgent.ts`)
   - **Role:** Validates code quality, accessibility, performance
   - **Learns:** Quality standards, common issues
   - **Teaches:** Self-validation techniques
   - **Knowledge Base:** `docs/QUALITY_VALIDATOR_KNOWLEDGE_BASE.md`
   - **Learning Needs:**
     - Error Learning: Quality failure patterns
     - Preferences: Project-specific standards
     - Agent Knowledge: Share quality insights

10. **Autonomous Agent** (`mrBlue/autonomousAgent.ts`)
    - **Role:** Executes tasks autonomously without user intervention
    - **Learns:** Task execution patterns, success criteria
    - **Teaches:** Autonomous operation best practices
    - **Knowledge Base:** `docs/AUTONOMOUS_AGENT_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - ✅ ALL 5 PHASES (most critical for autonomy)
      - Memory: Remember entire task histories
      - Error Learning: Learn from every autonomous execution
      - Preferences: User trust levels, approval patterns
      - Agent Knowledge: Collaborate with specialists
      - Predictive: Anticipate user needs before they ask

11. **Progress Tracking Agent** (`mrBlue/ProgressTrackingAgent.ts`)
    - **Role:** Tracks task progress, updates users
    - **Learns:** Task duration patterns, blockers
    - **Teaches:** Project management
    - **Knowledge Base:** `docs/PROGRESS_TRACKING_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: Historical task durations
      - Predictive: Estimate completion times
      - Agent Knowledge: Cross-agent progress coordination

12. **Tour Guide Agent** (`mrBlue/tourGuideAgent.ts`)
    - **Role:** Onboards new users, explains features
    - **Learns:** User confusion points, effective explanations
    - **Teaches:** Platform navigation
    - **Knowledge Base:** `docs/TOUR_GUIDE_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: User onboarding history
      - Preferences: Learning styles per user
      - Predictive: Anticipate questions before asked

13. **Avatar Agent** (`mrBlue/avatarAgent.ts`)
    - **Role:** Visual representation, video generation
    - **Learns:** User avatar preferences, effective visual communication
    - **Teaches:** Visual communication
    - **Knowledge Base:** `docs/AVATAR_AGENT_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: User avatar preferences
      - Preferences: Visual style per user
      - Agent Knowledge: Coordinate with video services

14. **Role Adapter Agent** (`mrBlue/roleAdapterAgent.ts`)
    - **Role:** Adapts behavior based on user role (admin, teacher, student)
    - **Learns:** Role-specific needs, effective adaptations
    - **Teaches:** Context-aware behavior
    - **Knowledge Base:** `docs/ROLE_ADAPTER_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: Role patterns per user
      - Preferences: Role-specific preferences
      - Predictive: Anticipate role-based needs

15. **Subscription Agent** (`mrBlue/subscriptionAgent.ts`)
    - **Role:** Manages premium features, billing
    - **Learns:** Upgrade patterns, feature value
    - **Teaches:** Monetization strategies
    - **Knowledge Base:** `docs/SUBSCRIPTION_AGENT_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: User subscription history
      - Predictive: Churn risk, upgrade opportunities
      - Agent Knowledge: Coordinate with billing systems

### **Tier 3: Self-Healing & Quality Agents** (Platform maintenance)
These agents keep the platform running smoothly.

16. **Agent Activation Service** (`self-healing/AgentActivationService.ts`)
    - **Role:** Activates relevant agents per page
    - **Learns:** Activation effectiveness, agent relevance
    - **Teaches:** Intelligent agent routing
    - **Knowledge Base:** `docs/AGENT_ACTIVATION_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: Agent activation history
      - Predictive: Pre-activate agents before page load
      - Agent Knowledge: Agent capabilities catalog

17. **Agent Orchestration Service** (`self-healing/AgentOrchestrationService.ts`)
    - **Role:** Coordinates self-healing workflow
    - **Learns:** Healing effectiveness, issue patterns
    - **Teaches:** System resilience
    - **Knowledge Base:** `docs/AGENT_ORCHESTRATION_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: All healing attempts
      - Error Learning: Failed healings → better strategies
      - Predictive: Predict issues before they occur

18. **Page Audit Service** (`self-healing/PageAuditService.ts`)
    - **Role:** Audits pages for issues (UI/UX, performance, accessibility)
    - **Learns:** Common page issues, audit effectiveness
    - **Teaches:** Quality standards
    - **Knowledge Base:** `docs/PAGE_AUDIT_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: Historical audit results
      - Error Learning: Missed issues → better detection
      - Predictive: Predict issues on new pages

19. **UX Validation Service** (`self-healing/UXValidationService.ts`)
    - **Role:** Validates user experience, navigation
    - **Learns:** UX best practices, user feedback
    - **Teaches:** UX design principles
    - **Knowledge Base:** `docs/UX_VALIDATION_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - Memory: User interaction patterns
      - Preferences: UX preferences per user segment
      - Predictive: UX improvements before user complains

20. **Predictive Pre-Check Service** (`self-healing/PredictivePreCheckService.ts`)
    - **Role:** Predicts issues before page loads
    - **Learns:** Prediction accuracy, failure patterns
    - **Teaches:** Proactive problem prevention
    - **Knowledge Base:** `docs/PREDICTIVE_PRECHECK_KNOWLEDGE_BASE.md`
    - **Learning Needs:**
      - ✅ Predictive (Phase 5 - PRIMARY FUNCTION)
      - Memory: All page load outcomes
      - Error Learning: False positives/negatives
      - Agent Knowledge: Aggregate predictions

### **Tier 4: Domain-Specific Agents** (Business features)
Agents that power specific Mundo Tango features.

21. **Facebook Messenger Service** (`mrBlue/FacebookMessengerService.ts`)
    - **Role:** Sends AI-generated messages via Facebook
    - **Learns:** Message effectiveness, user engagement
    - **Teaches:** Social media automation
    - **Knowledge Base:** ✅ `docs/FACEBOOK_MESSENGER_KNOWLEDGE_BASE.md` (EXISTS!)
    - **Learning Needs:**
      - Memory: Message history, user responses
      - Error Learning: Failed messages, API errors
      - Preferences: Message tone per user
      - Agent Knowledge: Coordinate with social media agents

[... 41 MORE AGENTS TO MAP ...]

---

## 🔄 RECURSIVE LEARNING ARCHITECTURE

### **How Agents Learn from Each Other:**

```typescript
// Example: Error Analysis Agent shares knowledge

// 1. Agent encounters error
errorAnalysisAgent.analyzeError(error) 
  → AI analyzes root cause
  → Saves to errorPatterns table
  → Writes to ERROR_ANALYSIS_KNOWLEDGE_BASE.md

// 2. Visual Editor Agent about to make same mistake
visualEditorAgent.beforeCodeGeneration(prompt)
  → Queries: "Has this failed before?"
  → contextService.search(prompt, { filter: 'error_knowledge_bases' })
  → Finds Error Analysis Agent's solution
  → Auto-applies fix

// 3. Both agents get smarter
errorAnalysisAgent.stats.solutionsReused++
visualEditorAgent.stats.errorsAvoided++
```

### **Knowledge Sharing Flow:**

1. **Individual Learning:**
   - Agent performs action
   - Records outcome (success/failure)
   - Extracts pattern
   - Saves to personal knowledge base

2. **Knowledge Broadcasting:**
   - Agent updates markdown knowledge base
   - Embeddings regenerated via LanceDB
   - Becomes searchable by all agents

3. **Cross-Agent Query:**
   - Agent A about to act
   - Queries all knowledge bases via RAG
   - Finds Agent B's learned pattern
   - Applies Agent B's wisdom

4. **Validation Loop:**
   - Agent A tries Agent B's solution
   - Records outcome
   - If successful → reinforces pattern
   - If failed → saves counter-example

5. **Compound Intelligence:**
   - Knowledge compounds exponentially
   - Each agent benefits from ALL agents' experiences
   - System gets smarter without code changes

---

## 📈 LEARNING PRIORITY MATRIX

### **PHASE 1 PRIORITY (Conversation Memory) - Implement First:**
**Agents that MUST remember conversations:**
1. Mr. Blue Visual Editor Agent - ⭐⭐⭐⭐⭐ CRITICAL
2. Autonomous Agent - ⭐⭐⭐⭐⭐ CRITICAL
3. Tour Guide Agent - ⭐⭐⭐⭐ HIGH
4. Role Adapter Agent - ⭐⭐⭐ MEDIUM
5. Error Analysis Agent - ⭐⭐⭐ MEDIUM

### **PHASE 2 PRIORITY (Error Learning) - Implement Second:**
**Agents that MUST learn from errors:**
1. Error Analysis Agent - ⭐⭐⭐⭐⭐ CRITICAL (primary function)
2. Autonomous Agent - ⭐⭐⭐⭐⭐ CRITICAL
3. Visual Editor Agent - ⭐⭐⭐⭐⭐ CRITICAL
4. Quality Validator Agent - ⭐⭐⭐⭐ HIGH
5. Page Audit Service - ⭐⭐⭐⭐ HIGH
6. Agent Orchestration Service - ⭐⭐⭐ MEDIUM
7. Facebook Messenger Service - ⭐⭐⭐ MEDIUM

### **PHASE 3 PRIORITY (User Preferences) - Implement Third:**
**Agents that MUST learn user preferences:**
1. Visual Editor Agent - ⭐⭐⭐⭐⭐ CRITICAL
2. Role Adapter Agent - ⭐⭐⭐⭐ HIGH
3. Subscription Agent - ⭐⭐⭐ MEDIUM
4. Tour Guide Agent - ⭐⭐⭐ MEDIUM
5. Avatar Agent - ⭐⭐ LOW

### **PHASE 4 PRIORITY (Agent Knowledge Sharing) - Implement Fourth:**
**ALL AGENTS** benefit from knowledge sharing - ⭐⭐⭐⭐⭐ CRITICAL FOR ALL

### **PHASE 5 PRIORITY (Predictive Assistance) - Implement Fifth:**
**Agents that MUST predict user needs:**
1. Autonomous Agent - ⭐⭐⭐⭐⭐ CRITICAL
2. Predictive Pre-Check Service - ⭐⭐⭐⭐⭐ CRITICAL (primary function)
3. Visual Editor Agent - ⭐⭐⭐⭐ HIGH
4. Progress Tracking Agent - ⭐⭐⭐ MEDIUM
5. Subscription Agent - ⭐⭐⭐ MEDIUM (churn prediction)

---

## 🎯 RECURSIVE SELF-IMPROVEMENT LOOP

### **The MB.MD v9.2 Learning Cycle:**

```
1. AGENT PERFORMS ACTION
   ↓
2. RECORDS OUTCOME (success/failure, duration, cost)
   ↓
3. ANALYZES PATTERN (AI-powered)
   "Why did this work/fail?"
   "What can we learn?"
   "How can we improve?"
   ↓
4. UPDATES KNOWLEDGE BASE
   Markdown file + LanceDB embeddings
   ↓
5. SHARES WITH OTHER AGENTS
   All agents can now query this knowledge
   ↓
6. IDENTIFIES GAPS
   "What am I still bad at?"
   "What knowledge am I missing?"
   ↓
7. REQUESTS LEARNING
   "I need to learn about X"
   "Which agent knows about X?"
   ↓
8. LEARNS FROM SPECIALIST
   Query specialist agent's knowledge base
   Apply specialist's patterns
   ↓
9. VALIDATES LEARNING
   Try new pattern
   Record outcome
   ↓
10. REPEAT (RECURSIVE!)
    Go back to step 1 with new knowledge
```

### **Recursive Discovery:**

```typescript
// Agents discover their own learning needs
async function recursiveSelfImprovement(agent: Agent) {
  while (true) {
    // 1. What am I bad at?
    const weaknesses = await agent.analyzePerformance();
    
    // 2. For each weakness, find knowledge
    for (const weakness of weaknesses) {
      // 3. Query all knowledge bases
      const solutions = await contextService.search(
        `How to improve ${weakness}?`,
        { filter: 'all_knowledge_bases' }
      );
      
      // 4. Apply best solution
      if (solutions.length > 0) {
        await agent.learn(solutions[0]);
      } else {
        // 5. No existing knowledge → request training
        await agentSMETraining.trainOn(agent, weakness);
      }
    }
    
    // 6. Repeat every 24 hours
    await sleep(24 * 60 * 60 * 1000);
  }
}
```

---

## 🚀 IMPLEMENTATION PLAN (All Phases in Parallel)

### **SUBAGENT 1: Phases 1-2 (Memory + Error Learning)**
**File:** Core learning infrastructure
**Tasks:**
1. Implement conversation persistence in Visual Editor
2. Build error pattern matcher
3. Create cross-conversation memory retrieval
4. Implement auto-apply learned fixes

**Target Agents:** Visual Editor, Autonomous, Error Analysis

### **SUBAGENT 2: Phases 3-4 (Preferences + Knowledge Sharing)**
**File:** User personalization + agent collaboration
**Tasks:**
1. Extract preferences from conversations
2. Create agent knowledge base system
3. Implement cross-agent RAG search
4. Auto-apply preferences in code gen

**Target Agents:** All 62+ agents

### **SUBAGENT 3: Phase 5 (Predictive Assistance)**
**File:** Proactive AI features
**Tasks:**
1. Build workflow pattern tracker
2. Create prediction algorithms
3. Implement suggestion UI
4. Test prediction accuracy

**Target Agents:** Autonomous, Predictive Pre-Check, Visual Editor

---

## 📊 EXPECTED OUTCOMES

### **Week 1-2 (Phases 1-2):**
- All agents remember conversations across sessions
- 50% reduction in repeat errors
- Error knowledge shared across all agents

### **Week 3-4 (Phases 3-4):**
- 100% of user preferences auto-applied
- All 62 agents sharing knowledge via knowledge bases
- Compound intelligence - agents learning from each other

### **Week 5-6 (Phase 5):**
- 70% prediction accuracy
- Proactive suggestions before user asks
- Autonomous agents operating independently

### **Week 7+ (Recursive Improvement):**
- Agents identify their own learning needs
- Automatic knowledge base updates
- Exponential intelligence growth
- System improves without code changes

---

**Next Action:** Launch 3 parallel subagents to implement all phases simultaneously
