# Magentic Dynamic Orchestration

**Invocation:** `use mb.md: orchestration:magentic`

---

## 🧠 WHAT IS MAGENTIC ORCHESTRATION?

Magentic (from Microsoft AutoGen's MagenticOne) is **context-aware dynamic orchestration**. Unlike static workflows, the orchestrator continuously evaluates:

1. **Current context** - What's happening now?
2. **Task progress** - What's been accomplished?
3. **Agent capabilities** - Who can help next?
4. **Adaptive routing** - Which agent should act now?

```
┌─────────────────────────────────────────────────────────────┐
│              MAGENTIC ORCHESTRATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SHARED CONTEXT                          │   │
│  │  - Task description                                  │   │
│  │  - Progress so far                                   │   │
│  │  - Current state                                     │   │
│  │  - Available agents                                  │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           ORCHESTRATOR (Manager)                     │   │
│  │                                                      │   │
│  │   "Given current context, which agent next?"        │   │
│  │                                                      │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│        ┌─────────────────┼─────────────────┐               │
│        ▼                 ▼                 ▼               │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐           │
│   │Agent A  │      │Agent B  │      │Agent C  │           │
│   └────┬────┘      └─────────┘      └─────────┘           │
│        │                                                    │
│        ▼ (executes, updates context)                       │
│        │                                                    │
│        └────────▶ ORCHESTRATOR (re-evaluates)              │
│                          │                                  │
│                          ▼                                  │
│                   [NEXT AGENT]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION

### Orchestrator Core

```typescript
interface SharedContext {
  task: Task;
  history: AgentAction[];
  currentState: any;
  remainingGoals: string[];
  insights: string[];
}

class MagenticOrchestrator {
  private context: SharedContext;
  private agents: Agent[];
  private llm: LLMClient;
  
  async execute(task: Task): Promise<Result> {
    this.context = {
      task,
      history: [],
      currentState: {},
      remainingGoals: task.goals,
      insights: []
    };
    
    while (!this.isComplete()) {
      // Dynamic agent selection
      const nextAgent = await this.selectNextAgent();
      
      // Agent executes with full context
      const action = await nextAgent.execute(this.context);
      
      // Update shared context
      this.updateContext(action);
      
      // Check for completion or issues
      if (this.shouldEscalate(action)) {
        await this.handleEscalation(action);
      }
    }
    
    return this.synthesizeResult();
  }
  
  private async selectNextAgent(): Promise<Agent> {
    const prompt = `
Given the current context:
- Task: ${this.context.task.description}
- Progress: ${this.summarizeHistory()}
- Remaining goals: ${this.context.remainingGoals.join(', ')}
- Current state: ${JSON.stringify(this.context.currentState)}

Available agents:
${this.agents.map(a => `- ${a.name}: ${a.capabilities.join(', ')}`).join('\n')}

Which agent should act next? Consider:
1. What's the most important next step?
2. Which agent is best suited for that step?
3. Is there anything blocking progress?

Respond with the agent name and reasoning.
`;
    
    const response = await this.llm.generate(prompt);
    return this.parseAgentSelection(response);
  }
  
  private updateContext(action: AgentAction): void {
    this.context.history.push(action);
    
    if (action.stateChanges) {
      Object.assign(this.context.currentState, action.stateChanges);
    }
    
    if (action.completedGoals) {
      this.context.remainingGoals = this.context.remainingGoals
        .filter(g => !action.completedGoals.includes(g));
    }
    
    if (action.insights) {
      this.context.insights.push(...action.insights);
    }
  }
}
```

### Agent Interface for Magentic

```typescript
interface MagenticAgent {
  name: string;
  capabilities: string[];
  
  // Agents receive full context
  execute(context: SharedContext): Promise<AgentAction>;
  
  // Self-assessment of ability to help
  canHandle(context: SharedContext): Promise<number>; // 0-1
}

interface AgentAction {
  agent: string;
  action: string;
  result: any;
  stateChanges?: Record<string, any>;
  completedGoals?: string[];
  insights?: string[];
  nextSuggestion?: string;  // Agent can suggest who should go next
}
```

---

## 📊 EXAMPLE: Complex Feature Build

```typescript
// Task: "Add housing search with map integration"

const executionLog = [
  {
    agent: 'ArchitectAgent',
    action: 'Analyze requirements',
    result: 'Need: Leaflet map, housing API, filter system',
    completedGoals: ['understand_requirements'],
    nextSuggestion: 'SchemaAgent for data model'
  },
  {
    agent: 'SchemaAgent',
    action: 'Design housing table',
    result: 'Created schema with location, price, amenities',
    stateChanges: { schemaReady: true },
    completedGoals: ['design_schema']
  },
  {
    agent: 'BackendAgent',
    action: 'Create API endpoints',
    result: 'GET /api/housing, GET /api/housing/:id',
    stateChanges: { apiReady: true },
    completedGoals: ['build_api']
  },
  {
    agent: 'FrontendAgent',
    action: 'Build map component',
    result: 'Leaflet map with pin clusters',
    stateChanges: { mapReady: true }
  },
  {
    agent: 'FrontendAgent',
    action: 'Build filter panel',
    result: 'Price, dates, amenities filters',
    stateChanges: { filtersReady: true },
    completedGoals: ['build_ui']
  },
  {
    agent: 'TestAgent',
    action: 'E2E test housing flow',
    result: 'All tests passing',
    completedGoals: ['verify_functionality']
  }
];

// Orchestrator dynamically selected each agent based on
// context, not a predefined workflow
```

---

## 🎯 VS. OTHER PATTERNS

| Pattern | When to Use |
|---------|-------------|
| **Magentic** | Open-ended tasks, unknown solution path |
| **Sequential** | Well-defined linear workflows |
| **Parallel** | Independent subtasks |
| **MoE** | Single-step expert selection |

---

## 🔧 CONFIGURATION

```typescript
const magenticConfig = {
  maxIterations: 20,
  timeoutMs: 300000,
  
  // How often to re-evaluate progress
  evaluationFrequency: 'after_each_action',
  
  // Escalation triggers
  escalateOn: {
    agentFailure: true,
    noProgress: 3,  // iterations without goal completion
    userRequest: true
  },
  
  // Context management
  contextWindow: 10,  // Recent actions to include
  summarizeHistory: true
};
```

---

*Adapt dynamically. Orchestrate intelligently.*
