# MB.MD - Mundo Blue Methodology Directive

**Version:** 1.0  
**Created:** October 30, 2025  
**Purpose:** Universal execution protocol for complex tasks

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

**Full Documentation:** See `docs/phase-0/part-0-mbmd-methodology.md` for complete details (1,847 lines).

**For Questions:** This document is self-contained and comprehensive. If you need more details, refer to the full methodology document.

**Version:** 1.0  
**Status:** Production-ready  
**Usage:** Universal execution protocol for all Mundo Tango work
