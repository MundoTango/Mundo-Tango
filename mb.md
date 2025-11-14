# MB.MD - Mundo Blue Methodology Directive

**Version:** 4.0  
**Created:** October 30, 2025  
**Last Updated:** November 14, 2025  
**Purpose:** Universal execution protocol for complex tasks  
**Project:** Mundo Tango (927 features, 47 P0 blockers)

---

## 📚 Version History

| Version | Date | Key Innovation | Performance |
|---------|------|----------------|-------------|
| v1.0 | Oct 2024 | Core methodology (Simultaneously, Recursively, Critically) | 180min/wave, $60/wave |
| v2.0 | Nov 2024 | Basic parallelization (2-3 subagents) | 120min/wave, $45/wave |
| v3.0 | Nov 13, 2024 | Mega-wave execution (10 parallel tracks) | 165min/wave, $49/wave |
| **v4.0** | **Nov 14, 2024** | **Batching + Templates + Memory + The Plan** | **90min/wave, $32/wave** |

**v4.0 Improvement:** 45% faster, 35% cheaper than v3.0

---

## Quick Reference

**Usage:** Prefix any task with "Use MB.MD:" to execute using this methodology.

**The Three Pillars:**
1. **SIMULTANEOUSLY** - Execute all independent operations in parallel
2. **RECURSIVELY** - Deep-dive into every subsystem until atomic level
3. **CRITICALLY** - Apply rigorous quality standards at every step

---

## When to Use MB.MD

✅ **Always use MB.MD for:**
- Complex multi-component tasks
- Documentation creation
- Platform development
- Feature implementation
- System design
- Code refactoring
- Testing and QA
- Any task with 3+ independent subtasks

❌ **Skip MB.MD for:**
- Single simple operations
- Trivial fixes
- Quick responses
- Conversational questions

---

## The Three Pillars Explained

### 1. SIMULTANEOUSLY (Parallel Execution)

**Rule:** Never do sequentially what can be done in parallel.

**Examples:**

**BAD - Sequential:**
```javascript
// Create files one by one
await createFile('file1.ts');
await createFile('file2.ts');
await createFile('file3.ts');
// Time: 3 seconds
```

**GOOD - Parallel:**
```javascript
// Create all files simultaneously
await Promise.all([
  createFile('file1.ts'),
  createFile('file2.ts'),
  createFile('file3.ts'),
]);
// Time: 1 second
```

**For AI Agents:**
- Use parallel tool calls for independent operations
- Create multiple files at once
- Read multiple files simultaneously
- Launch parallel subagents for independent work

---

### 2. RECURSIVELY (Deep-Dive Exploration)

**Rule:** Drill down into every component until reaching atomic level.

**Recursion Levels:**
```
Level 0: Platform (Mundo Tango)
  ↓
Level 1: Major Systems (Frontend, Backend, Database)
  ↓
Level 2: Subsystems (Components, Routes, Tables)
  ↓
Level 3: Components (LoginForm, /api/users, users table)
  ↓
Level 4: Functions (handleSubmit(), validateUser())
  ↓
Level 5: Logic (validation rules, algorithms)
  ↓
Level 6: Atomic (individual lines, values)
```

**Stopping Conditions:**
- Primitive values (strings, numbers, booleans)
- Well-documented external libraries
- Previously documented components
- Atomic operations that cannot be subdivided

**Example - Documenting Authentication:**
```
Task: Document authentication system

Level 1: What is the auth system?
  → JWT + Sessions + 2FA

Level 2: What are the components?
  → Login, Register, Password Reset, 2FA Setup

Level 3: How does Login work?
  → POST /api/auth/login
  → Validates credentials
  → Generates tokens
  → Creates session

Level 4: How does token generation work?
  → Uses jsonwebtoken library
  → Signs with JWT_SECRET
  → Sets 15-minute expiry
  → Returns access + refresh tokens

Level 5: What security measures?
  → bcrypt password hashing (10 rounds)
  → Rate limiting (5 attempts per 15 min)
  → HttpOnly cookies
  → CSRF protection

COMPLETE: Full recursive documentation achieved
```

---

### 3. CRITICALLY (Quality & Rigor)

**Rule:** Question everything, verify thoroughly, ensure production-ready quality.

**Critical Questions:**

1. **Correctness**: Is this implementation correct?
   - Does it handle all inputs?
   - Are edge cases covered?
   - Does it work with real data?

2. **Completeness**: Have I covered everything?
   - Are there missing features?
   - Is documentation complete?
   - Are all paths tested?

3. **Security**: Is this secure?
   - Input validation present?
   - SQL injection prevented?
   - XSS protection in place?
   - Secrets properly managed?

4. **Performance**: Is this efficient?
   - Are there N+1 queries?
   - Is caching needed?
   - Will this scale?

5. **Maintainability**: Can others understand this?
   - Is code readable?
   - Are types properly defined?
   - Is documentation clear?

6. **Error Handling**: What can go wrong?
   - API failure handling?
   - Network errors caught?
   - User feedback provided?

**Quality Gates:**

Before marking any task complete:
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Edge cases handled
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Production-ready

---

## ⚡ v4.0 NEW Optimizations

### **1. Micro-Batching (60% Cost Reduction)**

**Problem:** Subagent overhead dominates costs  
**Old:** 1 feature = 1 subagent ($4.50 overhead each)  
**New:** 3-4 features = 1 subagent (shared overhead)

**Example:**
```
❌ v3.0: 9 features = 9 subagents = $40.50 overhead
✅ v4.0: 9 features = 3 subagents = $13.50 overhead
Savings: $27 (67% reduction)
```

**Rules:**
- Batch similar-sized features together
- Micro (5-10min) + Micro + Micro = 1 subagent
- Small (15-30min) + Small + Small = 1 subagent
- Medium (45-90min) alone or + Micro features
- Large (2-4h) always alone

---

### **2. Template Reuse System (70% Time Savings)**

**Problem:** Rebuilding similar features from scratch wastes time  
**Solution:** Build once, copy forever

**Template Library (docs/patterns.md):**
- Dashboard Pattern: 60min → 15min (75% faster)
- CRUD API Pattern: 40min → 10min (75% faster)
- Service Pattern: 30min → 8min (73% faster)
- Email Template: 20min → 5min (75% faster)

**Template Promotion Process:**
1. Build feature from scratch
2. Test thoroughly, fix all bugs
3. Use in production for 1 wave
4. If stable → Promote to patterns.md
5. Future features copy template

**Quality Gate:** Only battle-tested code becomes templates

---

### **3. Context Pre-Loading (20-30min/subagent)**

**Problem:** Subagents waste time exploring file structure  
**Solution:** Give exact file paths upfront

**File Map (docs/file-map.md):**
```
Need tier enforcement? → server/middleware/tierEnforcement.ts
Need analytics? → server/services/AnalyticsService.ts
Need admin UI? → client/src/pages/admin/[Feature]Dashboard.tsx
Need encryption? → server/utils/encryption.ts
```

**Subagent Task Format:**
```markdown
Task: Build Subscription Analytics Dashboard

Files to use:
- Template: client/src/pages/admin/AnalyticsDashboard.tsx
- Service: server/services/SubscriptionService.ts
- API: server/routes/subscription-routes.ts

No exploration needed - paths provided above.
```

**Savings:** 25min exploration → 0min (100% elimination)

---

### **4. Zero Documentation Mode (35min/wave)**

**Problem:** Creating .md reports wastes time  
**Old:** Generate comprehensive reports after each wave  
**New:** Code only, log learnings

**What NOT to create:**
- ❌ Feature implementation reports
- ❌ Detailed changelogs  
- ❌ Verbose documentation

**What TO create:**
- ✅ Code (TypeScript, React, SQL)
- ✅ Tests (Playwright)
- ✅ Brief learnings in wave-log.md

**Exception:** MB.MD system docs (this file, patterns.md, etc.)

---

### **5. Main Agent Parallel Work (No Idle Time)**

**Problem:** Main agent waits while subagents work  
**Solution:** Main agent builds 2-3 simple features

**v3.0 Timeline:**
```
0-60min: Subagents work (main agent idle) ❌
60-90min: Main agent tests everything
```

**v4.0 Timeline:**
```
0-60min: Subagents + Main agent all work ✅
60-90min: Validation & testing (all parallel)
```

**Main Agent Tasks:**
- Micro features (5-10min each)
- Simple updates (add field, fix bug)
- Quick integrations
- Testing coordination

---

### **6. Smart Dependency Ordering (33% Time Savings)**

**Problem:** Building in wrong order = rebuilding later  
**Solution:** Dependency graph guides build order

**Example Waste:**
```
❌ Random order:
  Wave 1: Email service (30min)
  Wave 5: User preferences (20min)
  Wave 7: Rebuild email to use preferences (25min)
  Total: 75min
```

**Smart Order:**
```
✅ Foundation-first:
  Wave 1: User preferences (20min)
  Wave 2: Email service with preferences (35min)
  Total: 55min (27% savings)
```

**Dependency Graph (docs/dependency-graph.md):**
- Foundation layers identified
- Build order optimized
- Zero rebuilds

---

### **7. Parallel Testing (33% Faster)**

**Problem:** Sequential testing phase wastes time  
**Old:** Build all → Test all (2 phases)  
**New:** Build + Test simultaneously

**Each subagent task includes:**
1. Build features
2. Run Playwright tests
3. Validate LSP
4. Report results
5. Fix bugs immediately

**Benefits:**
- Bugs caught when context fresh (easier to fix)
- No waiting for test phase
- Faster feedback loop
- Higher quality

---

### **8. Progressive Enhancement (Ship Faster)**

**Strategy:** MVP → Enhanced → Polished

**Example: GDPR Compliance**
```
Wave 8 (MVP): 
  - Essential data export
  - Basic deletion
  - Consent tracking
  Ship: 2 hours ✅

Wave 12 (Enhanced):
  - Automated compliance reports
  - Data portability formats
  - Advanced consent management
  Ship: +1 hour

Wave 18 (Polished):
  - Multi-jurisdiction support
  - Compliance dashboard
  - Automated audits
  Ship: +1 hour
```

**Benefits:**
- Faster to P1 features
- Learn from real usage
- Avoid over-engineering

---

## 🧠 Memory System (Self-Improvement)

### Problem
Agent memory resets between sessions → Re-explores files, rebuilds patterns, repeats mistakes

### Solution: 5-Document Memory Architecture

#### **1. docs/patterns.md** - Reusable Code Templates
- Dashboard patterns (analytics, moderation, subscription)
- CRUD API patterns (events, housing, groups)
- Service patterns (email, SMS, notifications)
- Component patterns (forms, tables, cards)

**Updated:** After each wave when new patterns emerge  
**Usage:** Copy template, customize 10-20 lines, ship

---

#### **2. docs/wave-log.md** - Learning History
- What worked well (keep doing)
- What wasted time (stop doing)
- Anti-patterns discovered
- Optimization insights
- Bug patterns

**Updated:** End of each wave  
**Usage:** Review before starting new wave

---

#### **3. docs/cost-log.md** - Cost Tracking & Predictions
- Actual costs per wave
- Cost per feature
- Cost per feature type
- Predictive modeling
- Budget forecasting

**Updated:** After each wave  
**Usage:** Cost planning, optimization decisions

---

#### **4. docs/file-map.md** - File Location Reference
- All major files cataloged
- Architecture patterns documented
- No exploration needed
- Instant file access

**Updated:** When new systems added  
**Usage:** Subagent task preparation

---

#### **5. docs/dependency-graph.md** - Build Order Optimization
- Foundation → Features mapping
- Dependency chains identified
- Build order suggestions
- Rebuild avoidance

**Updated:** When new dependencies discovered  
**Usage:** Wave planning

---

## 🎯 The Plan: Project Tracker Integration (Agent #65)

### What is "The Plan"?

**The Plan** = Built-in Kanban project tracker at `/project-tracker`

**Purpose:** Replace temporary task lists with real project management  
**Features:**
- Kanban board (Backlog, To Do, In Progress, In Review, Done)
- Issue types (Epic, Story, Task, Bug)
- GitHub sync (PRs, commits)
- @mentions, file attachments
- Rich text descriptions

---

### When AI Builds, How to Use The Plan

#### Wave Structure:
```
Epic: "Wave 8 - Final P0 Blockers"
  ├─ Story: "Security Foundation" (P0 #3, #7, #9)
  │   ├─ Task: "Implement CSRF Protection"
  │   ├─ Task: "Build 2FA System"
  │   └─ Task: "Add Legal Acceptance"
  │
  ├─ Story: "Revenue Systems" (P0 #4, #13)
  │   ├─ Task: "Revenue Sharing Service"
  │   └─ Task: "MT Ad System"
  │
  └─ Story: "Compliance" (P0 #5, #10, #12)
      ├─ Task: "GDPR Compliance"
      ├─ Task: "20 Tango Roles"
      └─ Task: "Event Participant Roles"
```

---

### AI Workflow with The Plan

#### Before Wave Starts:
```typescript
// Create Epic for wave
await createPlanIssue({
  type: 'epic',
  title: 'Wave 8 - Final P0 Blockers',
  description: '8 remaining P0s to complete 47/47 (100%)',
  labels: ['wave-8', 'P0'],
  status: 'in-progress'
});
```

#### As AI Builds Each Feature:
```typescript
// Create Story (broader stroke)
const story = await createPlanIssue({
  type: 'story',
  title: 'Security Foundation Complete',
  description: 'CSRF + 2FA + Legal Acceptance',
  epic_id: waveEpicId,
  status: 'in-progress'
});

// When complete, update status
await updatePlanIssue(taskId, {
  status: 'in-review', // Ready for human verification
  comment: 'Playwright E2E test passing, LSP clean'
});
```

---

### Human Verification Workflow

#### Owner Review (Page Readiness):
1. Navigate to `/project-tracker`
2. Filter: Status = "In Review"
3. For each Story, verify:
   - [ ] Page loads without errors
   - [ ] UI looks professional
   - [ ] Features work as expected
   - [ ] Ready for users
4. Drag to "Done" column when verified

#### Backend Engineer Review (Technical):
1. Open task in `/project-tracker`
2. Review checklist in description:
   - [ ] Schema changes safe
   - [ ] API routes secure
   - [ ] Tests passing
   - [ ] No vulnerabilities
3. Add comment with findings
4. Approve or request changes

---

### The Plan Task Format (Broader Strokes)

**GOOD Story Example:**
```
Title: Security Foundation Complete
Type: Story
Epic: Wave 8

Description:
Outcome: Platform protected with CSRF, 2FA, legal compliance
Features: P0 #3, #7, #9
Estimate: 70min, ~$14

Owner Verification:
- [ ] 2FA settings work
- [ ] Legal terms shown on signup
- [ ] Forms submit successfully

Backend Verification:
- [ ] CSRF middleware applied
- [ ] 2FA uses TOTP standard
- [ ] Legal acceptance in DB
- [ ] E2E tests pass
```

**NOT This (Too Detailed):**
```
❌ Task: Create server/middleware/csrf.ts with...
[100 lines of code]
```

---

### Fallback: When The Plan Unavailable

If `/project-tracker` not accessible:
- Use `write_task_list` tool (temporary)
- Document tasks in wave-log.md
- Migrate to The Plan when available

---

## 🤝 H2AC: Human-to-AI Collaboration

### Philosophy: Build Now, Review at Launch

**AI Role:** Build everything autonomously, no blocking approvals  
**Human Role:** Review at launch, validate readiness  
**Timeline:** AI completes all P0s → Humans verify before user access

---

### Two Types of Human Reviewers

#### 1. **Owner (Product Readiness)**
**Responsibility:** Verify pages are ready for end users  
**When:** Before public launch  
**Checklist Per Page:**
- [ ] Page loads without errors
- [ ] UI looks professional
- [ ] All features work as expected
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Ready for users ✅

**Format:** Simple checkboxes in The Plan or launch document

---

#### 2. **Backend Engineers (Technical Validation)**
**Responsibility:** Validate AI implementation quality  
**When:** Before production deployment  
**Technical Checklist:**

**Database & Schema:**
- [ ] Schema changes reviewed
- [ ] Migrations safe (no data loss)
- [ ] Indexes optimized
- [ ] Foreign keys valid
- [ ] No breaking changes

**API & Routes:**
- [ ] RESTful conventions followed
- [ ] Proper HTTP status codes
- [ ] Error handling complete
- [ ] Input validation (Zod schemas)
- [ ] Authentication/authorization correct

**Security:**
- [ ] No SQL injection vulnerabilities
- [ ] CSRF protection applied
- [ ] XSS prevention implemented
- [ ] Secrets not exposed
- [ ] Rate limiting on sensitive endpoints

**Code Quality:**
- [ ] TypeScript types correct
- [ ] No LSP errors
- [ ] Code follows patterns
- [ ] No obvious bugs
- [ ] Performance acceptable

**Testing:**
- [ ] Playwright E2E tests exist
- [ ] Tests pass consistently
- [ ] Edge cases covered
- [ ] Error states tested

---

## MB.MD Execution Workflow

### Step 1: Understand (Critical Thinking)
- What is the ACTUAL goal?
- What are ALL components involved?
- What are the dependencies?
- What is the acceptance criteria?

### Step 2: Break Down (Simultaneous Planning)
- Identify independent work streams
- Identify dependent work streams
- Create parallel execution plan

### Step 3: Execute (Simultaneous + Recursive)
- Launch all independent tasks in parallel
- For each task, drill down recursively
- Complete each to atomic level

### Step 4: Verify (Critical Review)
- Run all quality gates
- Test thoroughly
- Fix any issues
- Get architect review

### Step 5: Complete
- Mark task complete only after all gates pass
- Update documentation
- Notify stakeholders

---

## Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Sequential When Parallel Possible

**BAD:**
```
Create file A
Wait for completion
Create file B
Wait for completion
Create file C
```

**GOOD:**
```
Create files A, B, C simultaneously
```

---

### ❌ Anti-Pattern 2: Surface-Level Documentation

**BAD:**
```
"Login Page - allows users to login"
```

**GOOD:**
```
"Login Page - React component using react-hook-form,
validates email/password via Zod, calls POST /api/auth/login,
handles JWT storage, redirects to /feed on success,
supports 2FA with TOTP, includes rate limiting (5/15min),
uses bcrypt password hashing (10 rounds), implements
CSRF protection, has error boundary..."
```

---

### ❌ Anti-Pattern 3: Uncritical Acceptance

**BAD:**
```
"This looks fine" (no verification)
```

**GOOD:**
```
"Verified:
- TypeScript compiles ✓
- Tests pass (47/47) ✓
- Security audit passed ✓
- Performance < 100ms ✓
- Edge cases handled ✓
- Documentation complete ✓
- Architect reviewed ✓"
```

---

### ❌ Anti-Pattern 4: Placeholder Hell

**BAD:**
```javascript
// TODO: Implement authentication
// TODO: Add error handling
// TODO: Write tests
const login = (email, password) => {
  // Implementation here
};
```

**GOOD:**
```javascript
// Complete implementation with all edge cases
const login = async (email: string, password: string): Promise<AuthResult> => {
  // Full error handling
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }
  
  // Complete implementation
  const user = await db.findUser(email);
  if (!user) {
    throw new AuthError('Invalid credentials');
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await logFailedAttempt(email);
    throw new AuthError('Invalid credentials');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return { user, accessToken, refreshToken };
};

// Tests included
describe('login', () => {
  it('should authenticate valid credentials', async () => {
    // Test implementation
  });
  
  it('should reject invalid credentials', async () => {
    // Test implementation
  });
  
  it('should handle missing fields', async () => {
    // Test implementation
  });
});
```

---

## Communication Template

When executing MB.MD tasks, communicate like this:

**Starting:**
```
I'll use MB.MD to [task description].

Parallel tasks identified:
1. [Independent task 1]
2. [Independent task 2]
3. [Independent task 3]

Sequential dependencies:
- [Task B] depends on [Task A]

Executing all independent tasks simultaneously...
```

**During Execution:**
```
Recursively exploring [component]:
- Level 1: [High-level understanding]
- Level 2: [Subsystem breakdown]
- Level 3: [Implementation details]
- Level 4: [Atomic operations]

Critical review:
✓ Correctness verified
✓ Security checked
✓ Performance acceptable
✓ Tests passing
```

**Completion:**
```
MB.MD execution complete.

Results:
✓ All [N] independent tasks completed in parallel
✓ Recursive exploration reached atomic level
✓ All quality gates passed
✓ Production-ready

Deliverables:
- [Item 1]
- [Item 2]
- [Item 3]
```

---

## MB.MD for AI Agents

### Agent Protocol

When an AI agent sees "Use MB.MD:", execute:

```python
def execute_mbmd(task: str):
    # 1. SIMULTANEOUSLY
    parallel_tasks = identify_independent_tasks(task)
    results = await asyncio.gather(*parallel_tasks)
    
    # 2. RECURSIVELY
    for result in results:
        explore_recursively(result, max_depth=6)
    
    # 3. CRITICALLY
    quality_gates = verify_all_quality_gates(results)
    if not quality_gates.all_passed():
        fix_issues_and_retry()
    
    return results
```

### Agent Rules

1. **Always prefer parallel execution**
   - Launch multiple subagents simultaneously
   - Use parallel tool calls for independent operations
   - Never wait when you can parallelize

2. **Always explore deeply**
   - Don't stop at surface level
   - Document every layer
   - Reach atomic operations

3. **Always verify critically**
   - Run all quality gates
   - Test thoroughly
   - Never assume correctness

---

## Success Criteria

Work is MB.MD-compliant when:

✅ **Simultaneously Verified:**
- All independent tasks executed in parallel
- Total execution time minimized
- No unnecessary sequential processing

✅ **Recursively Verified:**
- All subsystems explored completely
- Documentation reaches atomic level
- No gaps in understanding
- All edge cases covered

✅ **Critically Verified:**
- All quality gates passed
- Tests written and passing
- Security verified
- Performance acceptable
- Production-ready
- No placeholders or TODOs

---

## Examples

### Example 1: Creating Documentation

**Task:** "Use MB.MD: Document the authentication system"

**Execution:**
1. **Simultaneously** create docs for:
   - Login flow
   - Registration flow
   - Password reset flow
   - 2FA setup flow
   - Session management

2. **Recursively** explore each:
   - API endpoints
   - Database tables
   - Frontend components
   - Security measures
   - Error handling

3. **Critically** verify:
   - 100% coverage
   - Technical accuracy
   - Security best practices
   - Completeness

---

### Example 2: Building Features

**Task:** "Use MB.MD: Implement user profile system"

**Execution:**
1. **Simultaneously** build:
   - Database schema (users table)
   - API routes (CRUD operations)
   - Frontend components (ProfilePage, EditProfile)
   - Image upload system
   - Validation schemas

2. **Recursively** implement each:
   - Profile fields (name, bio, image, etc.)
   - Validation rules (Zod schemas)
   - Authorization (only owner can edit)
   - Image processing (resize, optimize)
   - Error handling (network, validation)

3. **Critically** verify:
   - TypeScript compiles
   - Tests pass (unit + integration)
   - Security (auth, authorization, XSS)
   - Performance (image optimization)
   - UX (loading states, errors)

---

## Self-Verification Checklist

Before claiming MB.MD compliance, verify:

**Simultaneously:**
- [ ] Did I identify all independent tasks?
- [ ] Did I execute them in parallel?
- [ ] Did I minimize total execution time?

**Recursively:**
- [ ] Did I explore every subsystem?
- [ ] Did I reach atomic level?
- [ ] Are there any gaps in my understanding?
- [ ] Did I document every layer?

**Critically:**
- [ ] Did I run all quality gates?
- [ ] Did I test thoroughly?
- [ ] Did I verify security?
- [ ] Is this production-ready?
- [ ] Would I deploy this to production?

---

## Quick Decision Tree

```
Is this a complex task with multiple components?
├─ YES → Use MB.MD
│   ├─ Identify independent tasks → Execute in parallel
│   ├─ For each task → Explore recursively to atomic level
│   └─ Before completion → Run all quality gates
│
└─ NO → Is it a simple single operation?
    ├─ YES → Execute directly (no MB.MD needed)
    └─ NO → Break down and use MB.MD
```

---

## Key Takeaways

1. **Never do sequentially what can be done in parallel**
2. **Never stop exploring until atomic level**
3. **Never ship without rigorous verification**

**This is the way.** ✨

---

## 📊 Performance Targets

**Wave 7 (v3.0):** 165min, $49.65, 9 features = $5.52/feature  
**Wave 8 (v4.0):** 90min, $32, 8 features = $4/feature (45% faster, 35% cheaper)  
**Future (v4.0 optimized):** 75min, $25-35, 8-10 features = $2.50-4/feature

---

**Version:** 4.0  
**Status:** Production-ready  
**Usage:** Universal execution protocol for all Mundo Tango work  
**Memory System:** docs/patterns.md, docs/wave-log.md, docs/cost-log.md, docs/file-map.md, docs/dependency-graph.md
