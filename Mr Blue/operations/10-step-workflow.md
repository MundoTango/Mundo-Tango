# 10-Step Workflow

**Invocation:** `use mb.md: operations`

---

## 🎯 THE CORE METHODOLOGY

Every task follows this sequence:

```
┌─────────────────────────────────────────────────────────────┐
│                    10-STEP WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                           │
│  │ 1. UNDERSTAND│ Read request, identify scope             │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 2. RESEARCH │ Gather context, find patterns            │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 3. PLAN     │ Decompose into tasks                     │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 4. VALIDATE │ Check plan against requirements          │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 5. EXECUTE  │ Build (parallel where possible)          │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 6. TEST     │ Verify functionality works               │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 7. DOCUMENT │ Update docs and memory                   │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 8. REVIEW   │ Self-critique (Reflexion)                │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 9. ITERATE  │ Fix issues found                         │
│  └──────┬──────┘                                           │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ 10. COMPLETE│ Report to user, mark done                │
│  └─────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 STEP DETAILS

### Step 1: UNDERSTAND

**Goal:** Fully comprehend what's being asked

**Actions:**
- Read the user request carefully
- Identify explicit requirements
- Infer implicit requirements
- Determine scope (what's in, what's out)
- Identify stakeholders affected

**Output:** Clear problem statement

```typescript
interface Understanding {
  explicitRequirements: string[];
  implicitRequirements: string[];
  scope: { included: string[]; excluded: string[] };
  stakeholders: string[];
  successCriteria: string[];
}
```

### Step 2: RESEARCH

**Goal:** Gather all relevant context

**Actions:**
- Search codebase for related code
- Read existing implementations
- Check for patterns in mb.md
- Review error history if debugging
- Identify dependencies

**Tools:** `search_codebase`, `grep`, `read`, `search_integrations`

**Output:** Context document with relevant findings

### Step 3: PLAN

**Goal:** Create actionable task list

**Actions:**
- Break problem into smaller tasks
- Identify dependencies between tasks
- Determine parallelization opportunities
- Estimate effort per task
- Order tasks optimally

**Output:** Task list with clear success criteria

```typescript
interface Plan {
  tasks: {
    id: string;
    description: string;
    dependencies: string[];
    parallelizable: boolean;
    successCriteria: string[];
    estimatedMinutes: number;
  }[];
}
```

### Step 4: VALIDATE

**Goal:** Ensure plan is correct before execution

**Actions:**
- Review plan against requirements
- Check for missing tasks
- Verify dependencies are correct
- Confirm parallelization is safe
- Get user approval if high-risk

**Output:** Validated plan or adjustments

### Step 5: EXECUTE

**Goal:** Build the solution

**Actions:**
- Execute tasks (parallel where possible)
- Write code following patterns
- Use existing utilities
- Apply code conventions
- Handle edge cases

**Principles:**
- Work simultaneously (parallelize)
- Work critically (quality first)
- Work effectively (use existing systems)

### Step 6: TEST

**Goal:** Verify the solution works

**Actions:**
- Run unit tests if available
- Execute E2E tests for UI changes
- Test edge cases manually
- Verify error handling
- Check performance

**Tools:** `run_test`, `bash` for test commands

### Step 7: DOCUMENT

**Goal:** Update relevant documentation

**Actions:**
- Update replit.md if architecture changed
- Update mb.md if pattern discovered
- Add inline comments if complex
- Update API docs if endpoints changed

**Rule:** Only document what's necessary

### Step 8: REVIEW

**Goal:** Self-critique and identify improvements

**Actions:**
- Apply Reflexion framework
- Ask: What went well?
- Ask: What could improve?
- Ask: What would I do differently?
- Store insights in memory

**Output:** Reflection stored in LanceDB

### Step 9: ITERATE

**Goal:** Fix any issues found in review

**Actions:**
- Address quality issues
- Fix edge cases missed
- Improve performance if needed
- Clean up code

### Step 10: COMPLETE

**Goal:** Finalize and report

**Actions:**
- Mark tasks complete
- Summarize changes for user
- Suggest next steps if applicable
- Update task list status

---

## ⚡ SHORTCUTS

For trivial tasks, steps can be combined:

| Task Complexity | Steps to Follow |
|-----------------|-----------------|
| Trivial (< 5 min) | 1 → 5 → 10 |
| Simple (5-15 min) | 1 → 2 → 5 → 6 → 10 |
| Medium (15-60 min) | All 10 steps |
| Complex (> 60 min) | All 10 steps + task list |

---

## 🎯 QUALITY GATES

Before moving to next step, verify:

| After Step | Verify |
|------------|--------|
| 1. Understand | Can I explain the problem in one sentence? |
| 2. Research | Do I have all context needed? |
| 3. Plan | Is every task actionable and clear? |
| 4. Validate | Does plan address all requirements? |
| 5. Execute | Does code follow patterns? |
| 6. Test | Do all tests pass? |
| 7. Document | Will future me understand this? |
| 8. Review | Did I learn something? |
| 9. Iterate | Are all issues fixed? |
| 10. Complete | Would I be proud to show Scott? |

---

*Follow the process. Trust the process.*
