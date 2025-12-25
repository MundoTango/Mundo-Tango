# ReAct Protocol (Reasoning + Acting)

**Invocation:** `use mb.md: cognition:react`

---

## 🧠 WHAT IS ReAct?

ReAct interleaves **reasoning traces** (thoughts) with **actions** (tool calls) in a dynamic loop. The agent thinks → acts → observes → repeats until task completion.

```
┌─────────────────────────────────────────────┐
│              ReAct LOOP                     │
├─────────────────────────────────────────────┤
│  1. THOUGHT  → Internal reasoning           │
│       ↓                                     │
│  2. ACTION   → Execute tool/API call        │
│       ↓                                     │
│  3. OBSERVE  → Process result               │
│       ↓                                     │
│  4. ITERATE  → Back to THOUGHT or FINISH    │
└─────────────────────────────────────────────┘
```

---

## 📋 WHEN TO USE

| Use ReAct When | Don't Use When |
|----------------|----------------|
| Sequential tool operations | Pure reasoning tasks |
| API calls with dependencies | Known answer in memory |
| Multi-step data retrieval | Simple questions |
| Code generation with validation | Creative brainstorming |
| Debugging with investigation | Static content generation |

---

## 🔧 IMPLEMENTATION

### Basic ReAct Pattern

```typescript
interface ReActStep {
  thought: string;      // Reasoning trace
  action: string;       // Tool to invoke
  actionInput: any;     // Tool parameters
  observation: string;  // Tool result
}

interface ReActResult {
  steps: ReActStep[];
  finalAnswer: string;
}

async function executeReAct(query: string): Promise<ReActResult> {
  const steps: ReActStep[] = [];
  let finished = false;
  
  while (!finished && steps.length < MAX_ITERATIONS) {
    // THOUGHT: Reason about next step
    const thought = await generateThought(query, steps);
    
    // Check if we can answer now
    if (thought.includes('Final Answer:')) {
      finished = true;
      break;
    }
    
    // ACTION: Determine and execute tool
    const { action, actionInput } = await selectAction(thought);
    
    // OBSERVE: Get tool result
    const observation = await executeAction(action, actionInput);
    
    // Store step
    steps.push({ thought, action, actionInput, observation });
  }
  
  return {
    steps,
    finalAnswer: extractFinalAnswer(steps)
  };
}
```

### Thought Generation Prompt

```
You are solving a task using the ReAct method.

Available tools: {tools}

Task: {query}

Previous steps:
{formatted_steps}

Generate your next thought. Format:
Thought: [Your reasoning about what to do next]
Action: [Tool name]
Action Input: [Tool parameters as JSON]

Or if you have enough information:
Thought: I have enough information to answer.
Final Answer: [Your complete answer]
```

---

## 📊 EXAMPLE: Debugging API Error

**Task:** "The /api/events endpoint returns 500 error"

```
STEP 1:
Thought: I need to find the events route handler to understand the error.
         The routes are likely in server/routes/ directory.
Action: grep
Action Input: { pattern: "events", path: "server/routes" }
Observation: server/routes/events.ts:15: router.get('/api/events', ...)

STEP 2:
Thought: Found the route file. Now I need to read it to see the handler logic.
Action: read
Action Input: { file_path: "server/routes/events.ts" }
Observation: [File contents showing the handler]

STEP 3:
Thought: The handler calls storage.getEvents(). I should check if there's an
         error in the storage layer. Let me search for that function.
Action: grep
Action Input: { pattern: "getEvents", path: "server/storage" }
Observation: server/storage/events.ts:42: async getEvents()...

STEP 4:
Thought: Found it. Let me read the storage function.
Action: read
Action Input: { file_path: "server/storage/events.ts", offset: 40, limit: 30 }
Observation: [Storage code showing SQL query with potential null issue]

STEP 5:
Thought: I found the issue. The query doesn't handle null dates properly,
         causing a crash when events have no end_date. I can now answer.
Final Answer: The 500 error is caused by a null handling issue in 
              storage/events.ts line 48. The SQL query fails when 
              events have no end_date. Fix: Add COALESCE or null check.
```

---

## 🎯 INTEGRATION WITH MB.MD

ReAct is the **default cognitive mode** for tool-based operations:

```typescript
// Mr. Blue's execution flow
async function handleRequest(userQuery: string) {
  // Determine cognitive mode
  const mode = selectCognitiveMode(userQuery);
  
  switch (mode) {
    case 'react':
      // Tool-based investigation/execution
      return await executeReAct(userQuery);
    
    case 'chain-of-thought':
      // Pure reasoning
      return await executeCoT(userQuery);
    
    case 'tree-of-thoughts':
      // Multi-path exploration
      return await executeToT(userQuery);
    
    default:
      return await executeReAct(userQuery); // Default
  }
}
```

---

## ⚠️ PITFALLS & SOLUTIONS

| Pitfall | Solution |
|---------|----------|
| Infinite loops | Set MAX_ITERATIONS (default: 10) |
| Wrong tool selection | Improve tool descriptions |
| Repetitive actions | Track action history, detect cycles |
| Hallucinated tools | Validate tool exists before action |
| Incomplete observations | Retry with different parameters |

---

## 📈 METRICS

Track ReAct performance:

```typescript
interface ReActMetrics {
  totalSteps: number;         // Steps to completion
  toolCalls: number;          // API/tool invocations
  backtrackCount: number;     // Times reasoning revised
  successRate: number;        // Task completion %
  avgTimeToSolution: number;  // Milliseconds
}
```

---

## 🔗 RELATED FRAMEWORKS

- **Chain-of-Thought**: Pure reasoning without tools → `use mb.md: cognition:cot`
- **Reflexion**: Learn from ReAct failures → `use mb.md: cognition:reflexion`
- **Plan-and-Execute**: Plan all steps upfront → `use mb.md: orchestration:plan-execute`

---

*ReAct is the bridge between thinking and doing.*
