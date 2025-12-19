# Hierarchical Execution Enforcement

**Invocation:** `use mb.md: orchestration:hierarchy`

---

## 🏗️ THE THREE-TIER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 1: REPLIT AI (Strategic)                             │
│  Role: Oversight & Foundation                               │
│  ──────────────────────────────────────────────────────     │
│  ✅ Design architecture                                      │
│  ✅ Build foundation (Tasks 1-N)                            │
│  ✅ Create handoff plans                                     │
│  ✅ Provide methodology training                             │
│  ❌ NEVER implement agent-level tasks directly               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Hands off to
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 2: MR. BLUE (Tactical)                               │
│  Role: Coordination & Decomposition                         │
│  ──────────────────────────────────────────────────────     │
│  ✅ Read handoff plans                                       │
│  ✅ Decompose into agent-level tasks                         │
│  ✅ Coordinate 140+ agents                                   │
│  ✅ Validate completion quality                              │
│  ❌ NEVER implement directly (delegate to agents)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Coordinates
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 3: 140+ AGENTS (Atomic)                              │
│  Role: Task Execution                                       │
│  ──────────────────────────────────────────────────────     │
│  ✅ Execute specific tasks                                   │
│  ✅ Write code                                               │
│  ✅ Run tests                                                │
│  ✅ Update documentation                                     │
│  ❌ NEVER make strategic decisions                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 ENFORCEMENT RULES

### Rule 1: NO LEVEL SKIPPING

```typescript
// ❌ WRONG: Replit AI implements directly
class ReplitAI {
  async buildFeature(feature: Feature) {
    await this.implementBackend();     // VIOLATION
    await this.implementFrontend();    // VIOLATION
    await this.writeTests();           // VIOLATION
  }
}

// ✅ CORRECT: Replit AI builds foundation, hands off
class ReplitAI {
  async buildFeature(feature: Feature) {
    // Phase 1: Strategic foundation
    const foundation = await this.buildFoundation(feature);
    
    // Phase 2: Create handoff plan
    const handoffPlan = await this.createHandoffPlan(foundation);
    
    // Phase 3: Hand off to Mr. Blue
    await this.handoffToMrBlue(handoffPlan);
    // STOPS HERE
  }
}
```

### Rule 2: HANDOFF METHODOLOGY

Every handoff must include:

```typescript
interface HandoffPlan {
  // What was built (foundation)
  completedWork: {
    tasks: Task[];
    files: string[];
    decisions: string[];
  };
  
  // What remains (for Mr. Blue)
  remainingTasks: {
    task: string;
    description: string;
    suggestedAgent: string;
    successCriteria: string[];
    filesToModify: string[];
  }[];
  
  // How to execute
  methodology: string;
  
  // How to verify
  testingStrategy: string;
}
```

### Rule 3: AGENT COORDINATION

Mr. Blue decomposes tasks for agents:

```typescript
class MrBlue {
  async executeHandoffPlan(plan: HandoffPlan) {
    for (const task of plan.remainingTasks) {
      // Decompose to agent level
      const agentTasks = this.decompose(task);
      
      // Assign to appropriate agents
      const results = await Promise.all(
        agentTasks.map(t => this.assignToAgent(t))
      );
      
      // Validate completion
      await this.validateResults(results, task.successCriteria);
    }
  }
  
  private decompose(task: RemainingTask): AgentTask[] {
    // Break into atomic agent work
    return [
      { agent: 'BackendAgent', action: 'create_endpoint', ... },
      { agent: 'FrontendAgent', action: 'build_component', ... },
      { agent: 'TestAgent', action: 'write_e2e_test', ... }
    ];
  }
}
```

---

## 📊 EXAMPLE: Feature Build

### What Replit AI Does (Foundation)

```
Task 1: Design architecture
  → Created architecture diagram
  → Defined data flow

Task 2: Create base classes
  → server/services/feature/BaseService.ts
  → server/services/feature/BaseController.ts

Task 3: Build orchestrator
  → server/services/feature/FeatureOrchestrator.ts

Task 4: Add API endpoints
  → server/routes/feature.ts

Task 5: Create UI shell
  → client/src/pages/FeaturePage.tsx (shell only)

// REPLIT AI STOPS HERE
// Creates handoff plan for Mr. Blue
```

### Handoff Plan Created

```markdown
# Handoff Plan: Feature X

## Completed (Tasks 1-5)
- Architecture designed
- Base classes created
- Orchestrator built
- API endpoints added
- UI shell created

## Remaining (Tasks 6-10)
### Task 6: Implement business logic
- Agent: BackendAgent
- Files: server/services/feature/FeatureService.ts
- Criteria: All methods implemented, unit tests passing

### Task 7: Build UI components
- Agent: FrontendAgent
- Files: client/src/components/feature/*
- Criteria: Components render correctly, responsive

### Task 8: Integration testing
- Agent: TestAgent
- Files: tests/feature.spec.ts
- Criteria: E2E tests passing

### Task 9: Documentation
- Agent: DocAgent
- Files: docs/feature.md
- Criteria: API documented, usage examples

### Task 10: Performance optimization
- Agent: OptimizationAgent
- Criteria: Response time < 200ms
```

### What Mr. Blue Does (Coordination)

```typescript
// Mr. Blue reads handoff plan and coordinates agents

// Task 6: Assign to BackendAgent
await backendAgent.execute({
  action: 'implement_business_logic',
  file: 'server/services/feature/FeatureService.ts',
  requirements: plan.tasks[6].criteria
});

// Task 7: Assign to FrontendAgent (parallel)
await frontendAgent.execute({
  action: 'build_components',
  files: ['FeatureList.tsx', 'FeatureCard.tsx'],
  requirements: plan.tasks[7].criteria
});

// ... and so on for remaining tasks
```

---

## ✅ QUALITY VALIDATION

Each level validates the level below:

```
Replit AI validates Mr. Blue's work → Target: 95-99/100
Mr. Blue validates agent work      → Target: 90+/100
Agents self-validate atomic tasks  → Target: Pass all criteria
```

---

## 🎯 BENEFITS

1. **Training Reinforcement**: Mr. Blue learns by coordinating
2. **Scalability**: 140+ agents work in parallel
3. **Knowledge Sharing**: GlobalKnowledgeBase propagates learnings
4. **Quality Control**: Multi-level validation
5. **Clear Boundaries**: Each level knows its responsibilities

---

*Strategic → Tactical → Atomic. No shortcuts.*
