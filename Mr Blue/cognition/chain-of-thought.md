# Chain-of-Thought (CoT) Reasoning

**Invocation:** `use mb.md: cognition:cot`

---

## 🧠 WHAT IS CHAIN-OF-THOUGHT?

Chain-of-Thought prompts the model to "think aloud" step-by-step before answering. No external tools—purely internal reasoning that makes the thought process explicit.

```
┌─────────────────────────────────────────────┐
│         CHAIN-OF-THOUGHT FLOW               │
├─────────────────────────────────────────────┤
│  Question                                   │
│      ↓                                      │
│  Step 1: First reasoning step               │
│      ↓                                      │
│  Step 2: Build on step 1                    │
│      ↓                                      │
│  Step 3: Continue reasoning chain           │
│      ↓                                      │
│  ...                                        │
│      ↓                                      │
│  Final Answer                               │
└─────────────────────────────────────────────┘
```

---

## 📋 WHEN TO USE

| Use CoT When | Don't Use When |
|--------------|----------------|
| Complex arithmetic | Simple lookups |
| Multi-step logic | Need external data |
| Commonsense reasoning | Real-time information |
| Problem decomposition | Tool-based tasks |
| Decision analysis | Creative generation |

---

## 🔧 IMPLEMENTATION

### Zero-Shot CoT (Simplest)

Just add "Let's think step by step" to any prompt:

```
Question: Scott has 5 milongas to organize. Each milonga needs 3 DJs 
and 2 venues. How many total bookings does he need to make?

Let's think step by step:

Step 1: Count DJ bookings
        5 milongas × 3 DJs = 15 DJ bookings

Step 2: Count venue bookings  
        5 milongas × 2 venues = 10 venue bookings

Step 3: Add total bookings
        15 + 10 = 25 total bookings

Answer: Scott needs to make 25 bookings.
```

### Few-Shot CoT (More Reliable)

Provide examples of reasoning chains:

```typescript
const cotPrompt = `
Here are examples of step-by-step reasoning:

Q: A tango festival has 3 days. Each day has 4 workshops and 2 milongas.
   How many total events?
A: Let's solve this step by step:
   1. Events per day = 4 workshops + 2 milongas = 6 events
   2. Total events = 3 days × 6 events = 18 events
   Answer: 18 events

Q: ${userQuestion}
A: Let's solve this step by step:
`;
```

### CoT with Self-Consistency

Generate multiple reasoning chains and vote on answer:

```typescript
async function cotWithSelfConsistency(
  question: string, 
  numPaths: number = 5
): Promise<string> {
  // Generate multiple reasoning chains
  const chains = await Promise.all(
    Array(numPaths).fill(null).map(() => 
      generateCoTChain(question)
    )
  );
  
  // Extract answers from each chain
  const answers = chains.map(extractAnswer);
  
  // Vote on most common answer
  const answerCounts = new Map<string, number>();
  for (const answer of answers) {
    answerCounts.set(answer, (answerCounts.get(answer) || 0) + 1);
  }
  
  // Return majority answer
  return [...answerCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0][0];
}
```

---

## 📊 EXAMPLES

### Example 1: Architecture Decision

```
Question: Should we use PostgreSQL or MongoDB for storing tango events?

Let's think step by step:

Step 1: Identify data characteristics
        - Events have structured fields (date, venue, organizer)
        - Events relate to users, venues, and cities
        - We need to query by date ranges, location, organizer

Step 2: Consider PostgreSQL strengths
        - Strong relational support (events ↔ venues ↔ users)
        - ACID transactions for booking integrity
        - Powerful date/time handling
        - Drizzle ORM already in our stack

Step 3: Consider MongoDB strengths
        - Flexible schema for varying event types
        - Easy horizontal scaling
        - Document model fits some use cases

Step 4: Evaluate our specific needs
        - We have clear relationships (relational wins)
        - We need transactions for bookings (PostgreSQL wins)
        - We already use Drizzle with PostgreSQL (no migration cost)

Step 5: Make decision
        PostgreSQL is the better choice because our data is inherently
        relational, we need transactions, and it's already in our stack.

Answer: Use PostgreSQL.
```

### Example 2: Debugging Logic

```
Question: Why might the event count show 0 when there are events?

Let's think step by step:

Step 1: Identify possible failure points
        - Database query returns empty
        - Filter excludes all events
        - Date range mismatch
        - Authorization blocks access

Step 2: Consider database query issues
        - Table might be empty (unlikely if we see events elsewhere)
        - Query might have WHERE clause error
        - JOIN might exclude unmatched rows

Step 3: Consider filter issues
        - Frontend filter might be too restrictive
        - Default date filter might exclude past/future events
        - Status filter might hide draft events

Step 4: Consider date issues
        - Timezone mismatch (server vs client)
        - Comparing date-only to datetime
        - Off-by-one in range queries

Step 5: Most likely cause
        Date filter with timezone mismatch - common bug pattern.

Answer: Most likely a timezone mismatch in the date filter. Check if 
        server uses UTC while client uses local time.
```

---

## 🎯 INTEGRATION WITH MB.MD

CoT is used for **pure reasoning** tasks:

```typescript
// When to invoke CoT vs ReAct
function selectCognitiveMode(query: string): CognitiveMode {
  // CoT indicators
  const cotIndicators = [
    'why', 'should', 'compare', 'decide', 'reason',
    'analyze', 'explain', 'evaluate', 'consider'
  ];
  
  // ReAct indicators
  const reactIndicators = [
    'find', 'search', 'fix', 'build', 'create',
    'update', 'check', 'read', 'write'
  ];
  
  const queryLower = query.toLowerCase();
  
  if (cotIndicators.some(i => queryLower.includes(i))) {
    return 'chain-of-thought';
  }
  
  if (reactIndicators.some(i => queryLower.includes(i))) {
    return 'react';
  }
  
  return 'react'; // Default
}
```

---

## 📈 PROMPT TEMPLATES

### Simple CoT Trigger
```
{question}

Let's think through this step by step:
```

### Structured CoT Template
```
Question: {question}

I'll analyze this systematically:

1. Understanding the problem:
   [Restate the problem clearly]

2. Key factors to consider:
   [List relevant factors]

3. Analysis:
   [Work through the logic]

4. Conclusion:
   [Final answer with reasoning]
```

### Expert CoT Template
```
As an expert in {domain}, I'll analyze this question:

{question}

My reasoning:

First, I consider {aspect1}...
This leads me to think about {aspect2}...
Given these factors, {analysis}...

Therefore, my answer is: {conclusion}
```

---

## 🔗 RELATED FRAMEWORKS

- **ReAct**: When you need external tools → `use mb.md: cognition:react`
- **Tree of Thoughts**: Explore multiple paths → `use mb.md: cognition:tot`
- **Reflexion**: Learn from reasoning → `use mb.md: cognition:reflexion`

---

*CoT makes thinking visible.*
