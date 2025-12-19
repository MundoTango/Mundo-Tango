# Reflexion Loop (Self-Critique + Learning)

**Invocation:** `use mb.md: cognition:reflexion`

---

## 🧠 WHAT IS REFLEXION?

Reflexion enables agents to **learn from mistakes without retraining**. After each task, the agent reflects on what worked, what failed, and stores these insights in long-term memory for future use.

```
┌─────────────────────────────────────────────────────────────┐
│                    REFLEXION LOOP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────────┐                                            │
│    │  TASK    │                                            │
│    └────┬─────┘                                            │
│         │                                                   │
│         ▼                                                   │
│    ┌──────────┐     ┌──────────────┐                       │
│    │  ATTEMPT │────▶│  EVALUATE    │                       │
│    └──────────┘     └──────┬───────┘                       │
│         ▲                  │                                │
│         │            ┌─────┴─────┐                         │
│         │            ▼           ▼                         │
│         │       [SUCCESS]   [FAILURE]                      │
│         │            │           │                         │
│         │            ▼           ▼                         │
│         │      ┌─────────┐ ┌──────────┐                   │
│         │      │ REFLECT │ │ REFLECT  │                   │
│         │      │ (what   │ │ (what    │                   │
│         │      │ worked) │ │ failed)  │                   │
│         │      └────┬────┘ └────┬─────┘                   │
│         │           │           │                          │
│         │           ▼           ▼                          │
│         │      ┌────────────────────┐                      │
│         │      │   STORE IN MEMORY  │                      │
│         │      └────────────────────┘                      │
│         │                  │                               │
│         └──────────────────┘ (retry with reflection)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 WHEN TO USE

| Use Reflexion When | Don't Use When |
|--------------------|----------------|
| After task completion | During task execution |
| After failures | For trivial tasks |
| For pattern extraction | When speed is critical |
| For self-improvement | For one-off tasks |
| After debugging sessions | For pure data retrieval |

---

## 🔧 IMPLEMENTATION

### Core Reflexion System

```typescript
interface Reflection {
  taskId: string;
  taskDescription: string;
  outcome: 'success' | 'failure' | 'partial';
  whatWorked: string[];
  whatFailed: string[];
  rootCause: string | null;
  lessonsLearned: string[];
  futureStrategy: string;
  timestamp: Date;
}

class ReflexionService {
  private memoryStore: LanceDB;
  
  async reflect(task: Task, result: TaskResult): Promise<Reflection> {
    // Generate reflection via LLM
    const reflection = await this.generateReflection(task, result);
    
    // Store in long-term memory
    await this.storeReflection(reflection);
    
    // Update pattern library if applicable
    if (reflection.lessonsLearned.length > 0) {
      await this.updatePatterns(reflection);
    }
    
    return reflection;
  }
  
  private async generateReflection(
    task: Task, 
    result: TaskResult
  ): Promise<Reflection> {
    const prompt = `
Analyze this completed task and generate a reflection:

TASK: ${task.description}
STEPS TAKEN: ${JSON.stringify(result.steps)}
OUTCOME: ${result.success ? 'SUCCESS' : 'FAILURE'}
${result.error ? `ERROR: ${result.error}` : ''}

Generate a reflection with:
1. What worked well (list specific techniques/approaches)
2. What failed or could improve
3. Root cause (if failure)
4. Lessons learned (generalizable insights)
5. Future strategy (how to approach similar tasks)

Format as JSON matching Reflection interface.
`;
    
    return await llm.generate(prompt, { responseFormat: 'json' });
  }
  
  async retrieveRelevantReflections(task: Task): Promise<Reflection[]> {
    // Semantic search for similar past tasks
    return await this.memoryStore.search({
      query: task.description,
      table: 'reflections',
      limit: 5
    });
  }
}
```

### Using Reflections for Future Tasks

```typescript
async function executeTaskWithReflection(task: Task): Promise<TaskResult> {
  const reflexion = new ReflexionService();
  
  // BEFORE: Retrieve relevant past learnings
  const pastReflections = await reflexion.retrieveRelevantReflections(task);
  
  // Enhance task with past learnings
  const enhancedPrompt = buildPromptWithReflections(task, pastReflections);
  
  // Execute task with informed approach
  const result = await executeTask(enhancedPrompt);
  
  // AFTER: Reflect and store
  await reflexion.reflect(task, result);
  
  return result;
}

function buildPromptWithReflections(
  task: Task, 
  reflections: Reflection[]
): string {
  if (reflections.length === 0) {
    return task.prompt;
  }
  
  const learnings = reflections
    .flatMap(r => r.lessonsLearned)
    .join('\n- ');
  
  return `
${task.prompt}

LEARNINGS FROM SIMILAR PAST TASKS:
- ${learnings}

Apply these learnings where relevant.
`;
}
```

---

## 📊 EXAMPLE: Learning from API Failure

### First Attempt (Failure)

```
TASK: Fix the 500 error on /api/events

ATTEMPT:
1. Read the route file
2. Found async/await issue
3. Fixed the await
4. Tested - still 500

EVALUATION: FAILURE

REFLECTION:
{
  "outcome": "failure",
  "whatWorked": [
    "Correctly identified route location",
    "Found one issue with async/await"
  ],
  "whatFailed": [
    "Assumed single root cause",
    "Did not check error logs",
    "Did not trace full call stack"
  ],
  "rootCause": "Multiple issues: async bug + null pointer in storage layer",
  "lessonsLearned": [
    "Always check server logs before fixing",
    "500 errors often have multiple causes",
    "Trace full call stack, not just route"
  ],
  "futureStrategy": "For 500 errors: 1) Check logs first, 2) Trace full stack, 3) Look for multiple issues"
}
```

### Second Attempt (Success with Learning)

```
TASK: Fix the 403 error on /api/groups

RETRIEVED REFLECTIONS:
- "For 500 errors: Check logs first, trace full stack, look for multiple issues"

ATTEMPT (Informed by Reflection):
1. Check server logs first → Found "Unauthorized" message
2. Trace call stack → Route → Middleware → Auth check
3. Found: Token validation + permission check both failing
4. Fixed both issues
5. Tested - success!

EVALUATION: SUCCESS

REFLECTION:
{
  "outcome": "success",
  "whatWorked": [
    "Applied past learning: checked logs first",
    "Traced full call stack",
    "Looked for multiple issues (found 2)"
  ],
  "whatFailed": [],
  "lessonsLearned": [
    "Auth errors often have token + permission components",
    "Reflexion learning transferred successfully to similar domain"
  ],
  "futureStrategy": "Continue applying log-first, full-stack approach"
}
```

---

## 🎯 INTEGRATION WITH MB.MD

Reflexion is **automatic after every task**:

```typescript
// Post-task hook in Mr. Blue
async function completeTask(task: Task, result: TaskResult) {
  // Standard completion
  await markTaskComplete(task);
  
  // Automatic reflexion (unless trivial)
  if (task.complexity > 'trivial') {
    await reflexionService.reflect(task, result);
  }
  
  // Pattern extraction for significant learnings
  if (result.failure && result.retryCount > 1) {
    await patternLibrary.extractPattern(task, result);
  }
}
```

### Reflexion Questions (Standard Template)

After every non-trivial task, ask:

1. **What went well?** (Specific techniques that worked)
2. **What could improve?** (Inefficiencies, mistakes)
3. **What would I do differently?** (Concrete changes)
4. **What pattern should be documented?** (Generalizable learning)

---

## 💾 MEMORY STRUCTURE

```typescript
// LanceDB schema for reflections
const reflectionsTable = {
  id: 'string',
  taskDescription: 'string',
  taskEmbedding: 'vector[1536]',  // For semantic search
  outcome: 'string',
  lessonsLearned: 'string[]',
  futureStrategy: 'string',
  timestamp: 'datetime',
  successRate: 'float'  // For similar task types
};
```

---

## 📈 METRICS

Track reflexion effectiveness:

```typescript
interface ReflexionMetrics {
  totalReflections: number;
  lessonsExtracted: number;
  lessonsApplied: number;       // Retrieved and used
  successRateImprovement: number; // Before/after reflexion
  avgRetriesToSuccess: number;
}
```

---

## 🔗 RELATED FRAMEWORKS

- **ReAct**: Execute tasks that generate reflections → `use mb.md: cognition:react`
- **Chain-of-Thought**: Reasoning that benefits from past learnings → `use mb.md: cognition:cot`
- **Memory Service**: Where reflections are stored → `use mb.md: agents:core`

---

*Reflexion turns failures into future successes.*
