# Tree of Thoughts (ToT)

**Invocation:** `use mb.md: cognition:tot`

---

## 🧠 WHAT IS TREE OF THOUGHTS?

Tree of Thoughts extends Chain-of-Thought by exploring **multiple reasoning paths simultaneously**. Instead of a single chain, we build a tree of possibilities, evaluate each branch, and select the best path.

```
                    ┌─────────┐
                    │ Problem │
                    └────┬────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌────────┐    ┌────────┐    ┌────────┐
      │ Path A │    │ Path B │    │ Path C │
      │ (0.7)  │    │ (0.9)  │    │ (0.4)  │
      └───┬────┘    └───┬────┘    └───┬────┘
          │             │             │
    ┌─────┼─────┐   ┌───┴───┐     [PRUNED]
    ▼     ▼     ▼   ▼       ▼
  ┌───┐ ┌───┐ ┌───┐┌───┐  ┌───┐
  │A.1│ │A.2│ │A.3││B.1│  │B.2│
  │0.6│ │0.8│ │0.5││0.95│ │0.7│
  └───┘ └───┘ └───┘└─┬─┘  └───┘
                     │
                     ▼
              ┌──────────┐
              │ SOLUTION │
              │  (B.1)   │
              └──────────┘
```

---

## 📋 WHEN TO USE

| Use ToT When | Don't Use When |
|--------------|----------------|
| Multiple valid solutions | Single clear answer |
| Strategic planning | Simple tasks |
| Creative problem-solving | Time-critical ops |
| Game-like reasoning | Sequential tool use |
| High-stakes decisions | Well-known patterns |

---

## 🔧 IMPLEMENTATION

### Core Algorithm

```typescript
interface ThoughtNode {
  thought: string;
  score: number;       // Evaluation score (0-1)
  children: ThoughtNode[];
  parent: ThoughtNode | null;
  depth: number;
}

interface ToTConfig {
  branchingFactor: number;  // Children per node (default: 3)
  maxDepth: number;         // Maximum tree depth (default: 4)
  pruneThreshold: number;   // Minimum score to continue (default: 0.5)
  beamWidth: number;        // Best paths to keep (default: 3)
}

async function executeToT(
  problem: string, 
  config: ToTConfig = defaultConfig
): Promise<string> {
  // Initialize root
  const root: ThoughtNode = {
    thought: problem,
    score: 1.0,
    children: [],
    parent: null,
    depth: 0
  };
  
  // BFS with beam search
  let currentLevel: ThoughtNode[] = [root];
  
  for (let depth = 0; depth < config.maxDepth; depth++) {
    const nextLevel: ThoughtNode[] = [];
    
    for (const node of currentLevel) {
      // Generate children
      const children = await generateThoughts(
        node, 
        config.branchingFactor
      );
      
      // Evaluate each child
      for (const child of children) {
        child.score = await evaluateThought(child, problem);
        
        // Prune low-scoring branches
        if (child.score >= config.pruneThreshold) {
          node.children.push(child);
          nextLevel.push(child);
        }
      }
    }
    
    // Beam search: keep only top paths
    nextLevel.sort((a, b) => b.score - a.score);
    currentLevel = nextLevel.slice(0, config.beamWidth);
    
    // Check for solution
    const solution = checkForSolution(currentLevel);
    if (solution) return solution;
  }
  
  // Return best path found
  return extractBestSolution(root);
}
```

### Thought Generation

```typescript
async function generateThoughts(
  parent: ThoughtNode, 
  count: number
): Promise<ThoughtNode[]> {
  const prompt = `
Given this problem and current thinking:

Problem: ${getRootProblem(parent)}
Current path: ${getPathToNode(parent)}

Generate ${count} different next steps to explore.
Each should be a distinct approach or direction.

Format:
Thought 1: [First approach]
Thought 2: [Second approach]
Thought 3: [Third approach]
`;

  const response = await llm.generate(prompt);
  return parseThoughts(response, parent);
}
```

### Thought Evaluation

```typescript
async function evaluateThought(
  node: ThoughtNode, 
  originalProblem: string
): Promise<number> {
  const prompt = `
Evaluate this reasoning path for solving the problem.

Problem: ${originalProblem}
Reasoning path: ${getPathToNode(node)}

Rate on these criteria (0-1 each):
1. Progress: Does this move toward a solution?
2. Coherence: Is the reasoning logical?
3. Feasibility: Can this path lead to a valid solution?
4. Novelty: Does this explore new territory?

Overall score (0-1): 
`;

  const response = await llm.generate(prompt);
  return parseScore(response);
}
```

---

## 📊 EXAMPLE: Architecture Decision

**Problem:** Design the optimal housing feature architecture for Mundo Tango

```
ROOT: How should we architect the housing feature?

LEVEL 1 (Branching):
├── A: Build custom booking system (score: 0.7)
│   └── "Full control, high effort, complete customization"
│
├── B: Integrate Airbnb API (score: 0.8)
│   └── "Leverage existing inventory, faster launch"
│
└── C: Use booking widget embed (score: 0.4)
    └── "Minimal control, depends on third party" [PRUNED]

LEVEL 2 (From A and B):
├── A.1: Monolithic backend (score: 0.5)
├── A.2: Microservices architecture (score: 0.7)
│
├── B.1: Hybrid - our UX, Airbnb inventory (score: 0.9) ★
└── B.2: Full Airbnb embed with styling (score: 0.6)

LEVEL 3 (From B.1):
├── B.1.1: React frontend + Express API (score: 0.95) ★★★
└── B.1.2: Next.js full-stack (score: 0.85)

SOLUTION: B.1.1
Architecture: Hybrid approach with React frontend, Express API,
              Airbnb API for inventory, custom booking flow.
```

---

## 🎯 INTEGRATION WITH MB.MD

ToT is used for **strategic/creative decisions**:

```typescript
// Decision points that trigger ToT
const totTriggers = [
  'design', 'architect', 'plan', 'strategy',
  'choose between', 'best approach', 'options',
  'creative', 'brainstorm', 'alternatives'
];

function shouldUseToT(query: string): boolean {
  const queryLower = query.toLowerCase();
  
  // Check for ToT triggers
  if (totTriggers.some(t => queryLower.includes(t))) {
    return true;
  }
  
  // Check for high-stakes decision markers
  if (queryLower.includes('important') || 
      queryLower.includes('critical')) {
    return true;
  }
  
  return false;
}
```

---

## ⚠️ CONSIDERATIONS

### Token Cost
ToT uses significantly more tokens than linear reasoning:
- 3 branches × 4 depth × evaluation = ~12 LLM calls per problem
- Use sparingly for high-value decisions

### When to Prune Aggressively
```typescript
// Increase pruning for:
const aggressivePrune = {
  timeConstrained: true,     // Lower threshold
  lowStakes: true,           // Fewer branches
  clearWinner: true          // Early termination
};
```

### Parallelization
```typescript
// Evaluate branches in parallel for speed
const scores = await Promise.all(
  children.map(child => evaluateThought(child, problem))
);
```

---

## 🔗 RELATED FRAMEWORKS

- **Chain-of-Thought**: Single path (simpler) → `use mb.md: cognition:cot`
- **Graph of Thoughts**: Arbitrary connections → `use mb.md: cognition:got`
- **Reflexion**: Learn from tree exploration → `use mb.md: cognition:reflexion`

---

*ToT explores the forest of possibilities to find the best tree.*
