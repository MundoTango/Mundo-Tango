# VibeCoding Learning Guide: Expert Knowledge Required

**Version:** 1.0.0  
**Created:** December 29, 2025  
**For:** Developers building true VibeCoding capabilities into Mr. Blue

---

## WHO NEEDS TO LEARN WHAT

### For Mr. Blue (AI Learning)

Mr. Blue needs to internalize these concepts through mb.md patterns:

| Concept | How Mr. Blue Learns | Pattern ID |
|---------|---------------------|------------|
| Task Decomposition | Pattern 68: Plan-Execute Loop | 68 |
| Iterative Reasoning | Pattern 69: ReAct Orchestration | 69 |
| Safety Awareness | Pattern 70: Safety Confirmation | 70 |
| State Management | Pattern 71: Checkpoint Management | 71 |
| Solution Templates | Pattern 72: Skill Catalog | 72 |

### For Developers (Human Learning)

| Topic | Why Needed | Priority |
|-------|------------|----------|
| LangChain/LangGraph | Agent loop implementation | HIGH |
| ReAct Pattern | Core reasoning architecture | HIGH |
| Playwright | Browser automation | HIGH |
| OAuth 2.0 | Connector integrations | MEDIUM |
| Vector Databases | Skill/memory storage | MEDIUM |
| Temporal/BullMQ | Long-running task orchestration | MEDIUM |

---

## OPEN SOURCE TOOLS BREAKDOWN

### 1. AGENTIC FRAMEWORK

#### LangChain + LangGraph (Recommended)

**What it does:** Provides the ReAct loop, state management, and tool orchestration.

**Installation:**
```bash
npm install @langchain/core @langchain/langgraph @langchain/openai
```

**Key Concepts to Master:**

```typescript
// 1. Tool Definition
import { tool } from "@langchain/core/tools";

const readFileTool = tool({
  name: "readFile",
  description: "Read contents of a file",
  schema: z.object({
    filePath: z.string().describe("Path to the file")
  }),
  func: async ({ filePath }) => {
    return await fs.readFile(filePath, 'utf-8');
  }
});

// 2. Agent State (LangGraph)
interface AgentState {
  messages: BaseMessage[];
  currentStep: number;
  plan: string[];
  observations: string[];
}

// 3. ReAct Loop
const reactLoop = new StateGraph<AgentState>({
  channels: {
    messages: { value: [] },
    currentStep: { value: 0 },
    plan: { value: [] },
    observations: { value: [] }
  }
})
.addNode("think", thinkNode)      // Generate thought
.addNode("act", actNode)          // Execute tool
.addNode("observe", observeNode)  // Process result
.addEdge("think", "act")
.addEdge("act", "observe")
.addConditionalEdges("observe", shouldContinue, {
  continue: "think",
  end: END
});
```

**Learning Resources:**
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain ReAct Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [ReAct Pattern Paper](https://arxiv.org/abs/2210.03629)

---

### 2. CODE EXECUTION SANDBOX

#### Option A: E2B (Recommended for Cloud)

**What it does:** Secure sandboxed code execution in the cloud.

**Installation:**
```bash
npm install @e2b/sdk
```

**Key Concepts:**
```typescript
import { Sandbox } from '@e2b/sdk';

// Create sandbox
const sandbox = await Sandbox.create();

// Execute code safely
const result = await sandbox.runCode(`
  import pandas as pd
  df = pd.DataFrame({'a': [1, 2, 3]})
  print(df.describe())
`);

// Cleanup
await sandbox.close();
```

**Pricing:** Pay per execution time

#### Option B: Open Interpreter (Local)

**What it does:** Local multi-language code execution.

**Installation:**
```bash
pip install open-interpreter
```

**Key Concepts:**
```python
from interpreter import interpreter

interpreter.chat("Create a pandas dataframe and plot it")
```

**Learning Resources:**
- [E2B Documentation](https://e2b.dev/docs)
- [Open Interpreter GitHub](https://github.com/openinterpreter/open-interpreter)

---

### 3. BROWSER AUTOMATION

#### Playwright (Already Installed)

**What it does:** Browser control, form filling, screenshot capture, testing.

**Key Concepts:**
```typescript
import { chromium } from 'playwright';

// Launch browser
const browser = await chromium.launch();
const page = await browser.newPage();

// Navigate and interact
await page.goto('http://localhost:5000');
await page.fill('[data-testid="input-email"]', 'test@example.com');
await page.click('[data-testid="button-submit"]');

// Screenshot for verification
await page.screenshot({ path: 'result.png' });

// Validate result
const successMessage = await page.locator('[data-testid="text-success"]');
expect(await successMessage.isVisible()).toBe(true);

await browser.close();
```

**Use Cases:**
- Automated UI testing after code changes
- Form submission validation
- Visual regression testing
- User flow verification

**Learning Resources:**
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)

---

### 4. WEB SEARCH INTEGRATION

#### Tavily (Recommended)

**What it does:** AI-optimized search API for documentation lookup.

**Installation:**
```bash
npm install tavily
```

**Key Concepts:**
```typescript
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const searchTool = new TavilySearchResults({
  maxResults: 3,
  apiKey: process.env.TAVILY_API_KEY
});

// Search for documentation
const results = await searchTool.invoke(
  "LangGraph state machine tutorial"
);
```

**API Key Required:** Sign up at tavily.com

---

### 5. VECTOR STORE (For Skills/Memory)

#### LanceDB (Already Installed)

**What it does:** Vector similarity search for matching user queries to skills.

**Key Concepts:**
```typescript
import * as lancedb from "@lancedb/lancedb";

// Create connection
const db = await lancedb.connect("./data/skills.lance");

// Create table with embeddings
const skillsTable = await db.createTable("skills", [
  { text: "Create a React component", embedding: [...], code: "..." },
  { text: "Add database table", embedding: [...], code: "..." }
]);

// Search for matching skill
const results = await skillsTable.search(queryEmbedding).limit(3).toArray();
```

**Use Cases:**
- Match user requests to pre-built solutions
- Store and retrieve code snippets
- Semantic search across documentation

---

### 6. TASK ORCHESTRATION

#### BullMQ (Already Installed)

**What it does:** Background job processing for long-running tasks.

**Key Concepts:**
```typescript
import { Queue, Worker } from 'bullmq';

// Create queue for agent tasks
const agentQueue = new Queue('agent-tasks', { connection: redis });

// Add task
await agentQueue.add('execute-plan', {
  userId: 'user-123',
  plan: ['create file', 'write code', 'run tests'],
  currentStep: 0
});

// Process tasks
const worker = new Worker('agent-tasks', async (job) => {
  const { plan, currentStep } = job.data;
  
  // Execute step
  await executeStep(plan[currentStep]);
  
  // Update progress
  await job.updateProgress((currentStep + 1) / plan.length * 100);
  
  // Queue next step if not done
  if (currentStep < plan.length - 1) {
    await agentQueue.add('execute-plan', {
      ...job.data,
      currentStep: currentStep + 1
    });
  }
});
```

---

## EXPERT KNOWLEDGE AREAS

### 1. ReAct Pattern Deep Dive

**Core Loop:**
```
THOUGHT: What do I need to do next?
ACTION: Which tool should I use?
OBSERVATION: What did the tool return?
(Repeat until task complete)
FINAL ANSWER: Here's the result
```

**Key Considerations:**
- Maximum iterations to prevent infinite loops
- Error handling in observations
- When to give up vs. retry
- Parallel tool execution when possible

### 2. Safety Patterns

**Destructive Action Detection:**
```typescript
const DESTRUCTIVE_ACTIONS = [
  /delete|remove|drop|truncate/i,
  /rm\s+-rf/i,
  /git\s+reset\s+--hard/i,
  /overwrite/i
];

function requiresConfirmation(action: string): boolean {
  return DESTRUCTIVE_ACTIONS.some(pattern => pattern.test(action));
}
```

**Checkpoint Before Destructive Actions:**
```typescript
async function safeExecute(action: string, execute: () => Promise<any>) {
  if (requiresConfirmation(action)) {
    const checkpoint = await createCheckpoint();
    try {
      return await execute();
    } catch (error) {
      await restoreCheckpoint(checkpoint);
      throw error;
    }
  }
  return await execute();
}
```

### 3. Checkpoint/Rollback System

**Implementation Approach:**
```typescript
interface Checkpoint {
  id: string;
  timestamp: Date;
  fileSnapshots: Map<string, string>;
  databaseState?: string;
  gitCommit?: string;
}

class CheckpointManager {
  async create(): Promise<Checkpoint> {
    return {
      id: generateId(),
      timestamp: new Date(),
      fileSnapshots: await this.snapshotFiles(),
      gitCommit: await this.getCurrentCommit()
    };
  }
  
  async restore(checkpoint: Checkpoint): Promise<void> {
    // Restore files
    for (const [path, content] of checkpoint.fileSnapshots) {
      await fs.writeFile(path, content);
    }
    // Optionally restore git state
    if (checkpoint.gitCommit) {
      await exec(`git checkout ${checkpoint.gitCommit}`);
    }
  }
}
```

### 4. OAuth Connector Patterns

**Generic OAuth Flow:**
```typescript
interface Connector {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

async function initiateOAuth(connector: Connector, userId: string) {
  const state = generateState(userId);
  const authUrl = new URL(connector.authUrl);
  authUrl.searchParams.set('client_id', process.env[`${connector.name}_CLIENT_ID`]);
  authUrl.searchParams.set('redirect_uri', `${BASE_URL}/oauth/callback`);
  authUrl.searchParams.set('scope', connector.scopes.join(' '));
  authUrl.searchParams.set('state', state);
  return authUrl.toString();
}
```

---

## MB.MD COGNITIVE UPDATES

### New Files to Create

```
Mr Blue/cognition/
├── langgraph-executor.md        # LangGraph implementation guide
├── safety-gates.md              # Destructive action prevention
├── checkpoint-recovery.md       # State save/restore patterns

Mr Blue/operations/
├── autonomous-execution.md      # Multi-step task running
├── rollback-procedures.md       # Error recovery steps
├── connector-provisioning.md    # OAuth setup guide

Mr Blue/agents/
├── task-planner-agent.md        # Task decomposition specialist
├── safety-agent.md              # Action validation specialist
├── test-agent.md                # Automated testing specialist
```

### Pattern Documentation Template

```markdown
# Pattern XX: [Pattern Name]

## Purpose
[What this pattern solves]

## When to Use
- [Trigger condition 1]
- [Trigger condition 2]

## Implementation
[Code or pseudocode]

## Anti-Patterns
- [What NOT to do]

## Examples
[Real-world usage]

## Related Patterns
- Pattern YY: [Related pattern]
```

---

## IMPLEMENTATION PRIORITY

### Week 1-2: Foundation
1. Install LangGraph
2. Implement basic ReAct loop in VibeCodingToolService
3. Add checkpoint system for file operations
4. Document Patterns 68-70

### Week 3-4: Execution
1. Integrate E2B or Modal for code sandbox
2. Add Playwright-based UI verification
3. Implement Safety Agent
4. Document Patterns 71-74

### Week 5-6: Integration
1. Add Tavily for web search
2. Build connector registry (GitHub, Slack, etc.)
3. Create skill catalog structure
4. Document Patterns 75-77

### Week 7-8: Autonomy
1. Enable multi-step autonomous execution
2. Add automatic test generation
3. Implement deployment automation
4. Achieve VibeCoding parity

---

## SUCCESS CRITERIA

| Metric | Before | After |
|--------|--------|-------|
| Max consecutive steps | 1 | 50+ |
| Planning capability | None | Full decomposition |
| Tool orchestration | Single | Multi-tool chains |
| Error recovery | Manual | Automatic rollback |
| External integrations | 1 | 10+ |
| Gap score | 3/10 | 9/10 |

---

## SECURITY & COMPLIANCE LEARNING

### Security Patterns for VibeCoding

**1. Sandbox Isolation:**
```typescript
// NEVER run user code in main process
// ALWAYS use isolated sandbox
const sandbox = await E2B.create({
  timeout: 30000,        // Max 30 seconds
  memory: '256mb',       // Memory limit
  network: false         // No network access by default
});
```

**2. OAuth Security:**
```typescript
// ALWAYS use PKCE for OAuth
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Store tokens encrypted
const encryptedToken = await encrypt(accessToken, process.env.TOKEN_KEY);
```

**3. Action Confirmation:**
```typescript
interface ConfirmationRequired {
  action: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeout: number;
  defaultDeny: boolean;
}

async function confirmDestructiveAction(action: ConfirmationRequired): Promise<boolean> {
  if (action.riskLevel === 'high') {
    return await promptUserConfirmation(action, { defaultDeny: true });
  }
  return true;
}
```

### CI/CD Integration

**Automated Security Checks:**
```yaml
# .github/workflows/security.yml
jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run npm audit
        run: npm audit --audit-level=high
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
      - name: SAST scan
        uses: github/codeql-action/analyze@v3
```

### Monitoring Setup

**Telemetry Collection:**
```typescript
import { metrics } from '@opentelemetry/api';

const toolExecutionCounter = metrics.getMeter('mrblue').createCounter('tool_executions', {
  description: 'Number of VibeCoding tool executions'
});

const toolLatencyHistogram = metrics.getMeter('mrblue').createHistogram('tool_latency_ms', {
  description: 'Tool execution latency in milliseconds'
});

// Track every execution
async function executeWithTelemetry(tool: string, fn: () => Promise<any>) {
  const start = Date.now();
  try {
    const result = await fn();
    toolExecutionCounter.add(1, { tool, status: 'success' });
    return result;
  } catch (error) {
    toolExecutionCounter.add(1, { tool, status: 'error' });
    throw error;
  } finally {
    toolLatencyHistogram.record(Date.now() - start, { tool });
  }
}
```

---

*This guide will be updated as implementation progresses. Check `VIBECODING_GAP_ANALYSIS.md` for the full capability comparison and governance requirements.*
