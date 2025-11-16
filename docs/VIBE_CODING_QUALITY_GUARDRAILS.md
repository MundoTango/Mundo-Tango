# VIBE CODING QUALITY GUARDRAILS
## 10-Layer Quality System for Autonomous AI Development

**Version**: 1.0  
**Created**: November 16, 2025  
**Purpose**: Ensure 99/100 quality score for all Mr Blue autonomous feature development  
**Target**: Zero production bugs, enterprise-grade code quality

---

## 🎯 MISSION

When Mr Blue autonomously builds Mundo Tango features (Weeks 9-12), every feature must pass **10 quality gates** before deployment. This ensures Scott's involvement reduces to 0% while maintaining production-grade quality.

**Quality Target**: 99/100 (up from current 97/100)

---

## 📊 10-LAYER QUALITY PIPELINE

### **LAYER 1: Pre-Coding Validation** ✅

**Goal**: Validate requirements before writing code

**Automated Checks**:
- ✅ Feature request parsed & understood (natural language → structured spec)
- ✅ Database schema changes identified (if any)
- ✅ API endpoints planned (RESTful conventions)
- ✅ Frontend components mapped (reuse vs. new)
- ✅ External dependencies identified (npm packages, APIs)
- ✅ Breaking changes flagged (migrations, deprecations)

**Tools**:
- GROQ Llama-3.1-70b for requirement parsing
- LanceDB semantic search for similar existing features
- Automated dependency conflict detection

**Pass Criteria**:
- Requirements fully understood (no ambiguity)
- No conflicting features found
- All dependencies available

**Example Output**:
```json
{
  "feature": "Event RSVP System",
  "dbChanges": ["eventRsvps table", "user_id foreign key"],
  "apiEndpoints": ["POST /api/events/:id/rsvp", "GET /api/events/:id/attendees"],
  "frontendComponents": ["RsvpButton (new)", "AttendeeList (reuse)"],
  "dependencies": ["@radix-ui/react-dialog"],
  "breakingChanges": false
}
```

---

### **LAYER 2: LSP & Type Safety** ✅

**Goal**: Zero TypeScript/linting errors

**Automated Checks**:
- ✅ TypeScript compilation (zero errors)
- ✅ ESLint validation (zero warnings)
- ✅ Drizzle schema type inference (DB types match code)
- ✅ Zod schema validation (runtime type safety)
- ✅ Import path validation (no broken imports)
- ✅ Unused variable detection

**Tools**:
- `get_latest_lsp_diagnostics` tool
- TypeScript compiler (`tsc --noEmit`)
- ESLint with strict rules

**Pass Criteria**:
- Zero TypeScript errors
- Zero ESLint errors
- All Zod schemas aligned with Drizzle schemas

**Auto-Fix Strategy**:
- Missing imports → Auto-add from existing files
- Type mismatches → Auto-infer from usage
- Unused vars → Auto-remove

---

### **LAYER 3: Code Quality Metrics** ✅

**Goal**: Maintainable, readable, DRY code

**Automated Checks**:
- ✅ Cyclomatic complexity < 10 (per function)
- ✅ File length < 500 lines (split if exceeded)
- ✅ Function length < 50 lines (refactor if exceeded)
- ✅ No code duplication > 5 lines
- ✅ Consistent naming conventions (camelCase, PascalCase)
- ✅ No console.log in production code
- ✅ No TODO/FIXME/HACK comments

**Tools**:
- CodeClimate-style complexity analysis
- Prettier for formatting
- Custom regex patterns for anti-patterns

**Pass Criteria**:
- All metrics within thresholds
- Zero anti-patterns detected
- Code follows project conventions

**Example Violations**:
```typescript
// ❌ BAD: Function too long (60 lines)
function createEvent(data) {
  // ... 60 lines of logic
}

// ✅ GOOD: Refactored into smaller functions
function createEvent(data) {
  validateEventData(data);
  const event = buildEventObject(data);
  return saveEventToDatabase(event);
}
```

---

### **LAYER 4: Security Scanning** 🔒

**Goal**: Zero security vulnerabilities

**Automated Checks**:
- ✅ No hardcoded secrets (API keys, passwords)
- ✅ SQL injection prevention (parameterized queries only)
- ✅ XSS prevention (sanitized user input)
- ✅ CSRF token validation (all POST/PUT/DELETE)
- ✅ JWT expiration checks (auth middleware)
- ✅ RBAC enforcement (permission checks)
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation (Zod schemas on all inputs)

**Tools**:
- Custom regex for secret detection
- Drizzle ORM (prevents SQL injection)
- OWASP Top 10 checklist
- **VibeAudits.com** (manual review for critical features)

**Pass Criteria**:
- Zero secrets in code
- All inputs validated
- All endpoints protected

**Auto-Fix Strategy**:
- Hardcoded secret → Move to Replit Secrets + env var
- Missing CSRF → Auto-add middleware
- No rate limiting → Auto-add express-rate-limit

---

### **LAYER 5: Performance Validation** ⚡

**Goal**: Fast, responsive user experience

**Automated Checks**:
- ✅ API response time < 200ms (99th percentile)
- ✅ Page load time < 3s (LCP < 2.5s)
- ✅ Database query optimization (no N+1 queries)
- ✅ Redis caching for expensive operations
- ✅ Image optimization (WebP, lazy loading)
- ✅ Bundle size < 500KB (gzipped)
- ✅ Lighthouse score > 90 (Performance)

**Tools**:
- Custom performance monitoring middleware
- Lighthouse CI
- React DevTools Profiler
- Database query analyzer (EXPLAIN ANALYZE)

**Pass Criteria**:
- All performance budgets met
- No performance regressions vs. previous version

**Example Optimization**:
```typescript
// ❌ BAD: N+1 query
const events = await db.select().from(events);
for (const event of events) {
  event.attendees = await db.select().from(rsvps).where(eq(rsvps.eventId, event.id));
}

// ✅ GOOD: Single query with join
const events = await db
  .select()
  .from(events)
  .leftJoin(rsvps, eq(events.id, rsvps.eventId))
  .groupBy(events.id);
```

---

### **LAYER 6: E2E Testing** 🧪

**Goal**: Feature works end-to-end in real browser

**Automated Checks**:
- ✅ User flow completable (signup → action → success)
- ✅ UI elements visible & clickable (no z-index issues)
- ✅ Forms submittable (validation + success state)
- ✅ API requests successful (200/201 responses)
- ✅ Error states handled (404, 500, network errors)
- ✅ Dark mode compatibility (light/dark tested)
- ✅ Mobile responsiveness (viewport < 768px)

**Tools**:
- **run_test tool** (Playwright-based E2E testing)
- Automated screenshot comparison
- Network request mocking for reliability

**Pass Criteria**:
- 100% test pass rate
- Zero console errors
- Zero visual regressions

**Test Plan Template**:
```markdown
1. [New Context] Create browser context
2. [API] Create test data (e.g., event via POST /api/events)
3. [Browser] Navigate to /events
4. [Verify] Assert event is displayed
5. [Browser] Click RSVP button
6. [Verify] Assert RSVP confirmation shown
7. [API] Verify RSVP exists in database
```

---

### **LAYER 7: Accessibility (A11y)** ♿

**Goal**: WCAG 2.1 Level AA compliance

**Automated Checks**:
- ✅ All images have `alt` text
- ✅ All form inputs have `<label>` or `aria-label`
- ✅ Color contrast ratio ≥ 4.5:1 (text)
- ✅ Keyboard navigation works (Tab, Enter, Esc)
- ✅ Focus indicators visible (outline on interactive elements)
- ✅ ARIA attributes correct (roles, states, properties)
- ✅ Screen reader compatibility (semantic HTML)

**Tools**:
- axe-core (automated a11y testing)
- Lighthouse Accessibility score
- Manual keyboard testing

**Pass Criteria**:
- Lighthouse Accessibility score > 95
- Zero axe-core violations
- All interactive elements keyboard-accessible

**Example Fixes**:
```tsx
// ❌ BAD: No alt text, no label
<img src={event.image} />
<input type="text" />

// ✅ GOOD: Alt text + label
<img src={event.image} alt={`Event photo for ${event.name}`} />
<label htmlFor="event-name">Event Name</label>
<input id="event-name" type="text" />
```

---

### **LAYER 8: Error Handling & Resilience** 🛡️

**Goal**: Graceful degradation, no crashes

**Automated Checks**:
- ✅ All async operations wrapped in try-catch
- ✅ User-friendly error messages (no stack traces)
- ✅ Fallback UI for failed API calls
- ✅ Loading states for async operations
- ✅ Retry logic for transient failures (3 attempts)
- ✅ Error logging to Sentry (production)
- ✅ Self-healing error boundaries (React)

**Tools**:
- Custom error boundary validator
- Sentry error tracking
- Automated retry simulation

**Pass Criteria**:
- Zero unhandled promise rejections
- All error states have UI feedback
- No app crashes on error

**Example Pattern**:
```typescript
// ✅ GOOD: Comprehensive error handling
async function createEvent(data: EventData) {
  try {
    const event = await apiRequest('/api/events', {
      method: 'POST',
      body: data,
    });
    toast.success('Event created successfully!');
    return event;
  } catch (error) {
    console.error('[createEvent]', error);
    toast.error('Failed to create event. Please try again.');
    throw error; // Re-throw for caller handling
  }
}
```

---

### **LAYER 9: Documentation & Data-TestID** 📝

**Goal**: Maintainable, testable code

**Automated Checks**:
- ✅ All exported functions have JSDoc comments
- ✅ All API endpoints documented (Swagger/OpenAPI)
- ✅ All interactive elements have `data-testid`
- ✅ Complex logic has inline comments
- ✅ Database schema documented (table purpose)
- ✅ Environment variables documented (.env.example)

**Tools**:
- Custom JSDoc validator
- Swagger auto-generation
- data-testid coverage checker

**Pass Criteria**:
- 100% `data-testid` coverage on interactive elements
- All public APIs documented
- Zero undocumented complex functions

**data-testid Pattern**:
```tsx
// ✅ GOOD: Clear, hierarchical testids
<Button data-testid="button-create-event">Create Event</Button>
<Input data-testid="input-event-name" />
<Card data-testid={`card-event-${event.id}`}>
  <CardTitle data-testid={`text-event-name-${event.id}`}>{event.name}</CardTitle>
</Card>
```

---

### **LAYER 10: Final Review & Deploy Check** 🚀

**Goal**: Production-ready deployment

**Automated Checks**:
- ✅ All 9 layers passed
- ✅ No merge conflicts with main branch
- ✅ Database migrations generated (if schema changed)
- ✅ Rollback plan documented (if risky change)
- ✅ Feature flag created (for gradual rollout)
- ✅ Monitoring alerts configured (for critical paths)
- ✅ Changelog updated (user-facing changes)

**Manual Checks** (Scott review for P0 features):
- ✅ User flow intuitive (UX review)
- ✅ Visual design matches MT Ocean theme
- ✅ Mobile experience tested on real device

**Pass Criteria**:
- All automated checks passed
- Manual review approved (if required)
- Deployment pipeline green

**Deployment Checklist**:
```markdown
- [ ] All 10 layers passed
- [ ] PR created with clear description
- [ ] Database migration tested (rollback verified)
- [ ] Feature flag enabled for 10% of users
- [ ] Sentry monitoring active
- [ ] Ready for production deploy
```

---

## 🤖 AUTONOMOUS EXECUTION WORKFLOW

### **Phase 1: Planning** (5 minutes)
1. Parse feature request (natural language → structured spec)
2. Search existing codebase (LanceDB) for similar features
3. Identify reusable components vs. new code needed
4. Generate implementation plan (files, endpoints, UI)

### **Phase 2: Implementation** (15-30 minutes)
1. Update database schema (if needed) → `npm run db:push --force`
2. Create/update API routes (backend) → Layer 2 LSP validation
3. Build frontend components (UI) → Layer 3 code quality
4. Integrate with existing systems → Layer 6 E2E testing

### **Phase 3: Validation** (10-15 minutes)
1. **Run Layers 1-9 in parallel** (maximum speed)
2. Auto-fix common issues (imports, types, formatting)
3. Generate E2E test plan → Execute via `run_test` tool
4. Compile results → Pass/Fail report

### **Phase 4: Iteration** (if needed)
1. Review failures from validation
2. Auto-fix 90%+ issues (types, security, performance)
3. Re-run validation → Repeat until 100% pass
4. Maximum 3 iterations before requesting human review

### **Phase 5: Deployment** (5 minutes)
1. Generate changelog entry
2. Create feature flag (gradual rollout)
3. Deploy to production
4. Monitor Sentry for 24 hours

**Total Time**: 35-55 minutes per feature (fully autonomous)

---

## 🎯 QUALITY SCORE CALCULATION

**Formula**: `Quality Score = (Passed Layers / 10) × 100`

**Target**: 99/100 (9.9/10 layers passed)

**Layer Weights**:
- Layer 1-4: **Critical** (failure = block deployment)
- Layer 5-7: **High** (failure = warning, manual review)
- Layer 8-10: **Medium** (failure = ticket for follow-up)

**Example Score**:
```
Layer 1: ✅ Pre-Coding Validation (10/10)
Layer 2: ✅ LSP & Type Safety (10/10)
Layer 3: ✅ Code Quality (9/10 - one function slightly complex)
Layer 4: ✅ Security (10/10)
Layer 5: ✅ Performance (10/10)
Layer 6: ✅ E2E Testing (10/10)
Layer 7: ⚠️ Accessibility (8/10 - missing 2 alt texts)
Layer 8: ✅ Error Handling (10/10)
Layer 9: ✅ Documentation (10/10)
Layer 10: ✅ Deploy Check (10/10)

Total: 97/100 (GOOD - deploy with follow-up ticket for a11y)
```

---

## 🛠️ TOOLING INTEGRATION

### **Free Tools** (Current)
- **LSP Diagnostics**: Built-in Replit LSP
- **Playwright E2E**: `run_test` tool
- **Code Analysis**: Custom regex patterns
- **Performance**: Lighthouse CI

### **Paid Tools** (Future - Week 12)
- **cubic.dev** ($30/dev/mo): Automated PR review, bug detection
- **VibeAudits.com** (one-time): Human security audit before launch
- **Sentry** (free tier): Error tracking & monitoring

### **AI Tools** (Current)
- **GROQ Llama-3.1-70b**: Vibe coding generation
- **OpenAI GPT-4o**: Code review & suggestions
- **LanceDB**: Semantic code search

---

## 📊 SUCCESS METRICS

**Week 9** (First autonomous week):
- Target: 85/100 quality score
- Scott involvement: 20% (review + fixes)

**Week 10** (Learning phase):
- Target: 92/100 quality score
- Scott involvement: 10% (review only)

**Week 11** (Maturity phase):
- Target: 97/100 quality score
- Scott involvement: 5% (spot checks)

**Week 12** (Full autonomy):
- Target: 99/100 quality score
- Scott involvement: 0% (monitoring only)

---

## 🚨 FAILURE HANDLING

### **Auto-Fix Strategies**

**TypeScript Errors**:
- Missing import → Auto-add from similar files
- Type mismatch → Auto-infer from usage context
- Unused variable → Auto-remove

**Security Issues**:
- Hardcoded secret → Move to env var + Replit Secret
- Missing input validation → Auto-generate Zod schema
- No CSRF protection → Auto-add middleware

**Performance Issues**:
- N+1 query → Auto-refactor to JOIN
- Large bundle → Auto-add code splitting
- Missing cache → Auto-add Redis layer

### **Human Escalation**

**Escalate to Scott if**:
1. 3 validation iterations fail
2. Breaking change detected (migrations, API changes)
3. Security vulnerability found (Layer 4 critical failure)
4. Quality score < 80 after auto-fixes

**Escalation Format**:
```markdown
⚠️ HUMAN REVIEW NEEDED

Feature: Event RSVP System
Quality Score: 78/100
Failed Layers: 4 (Security), 6 (E2E Testing)

Issues:
- SQL injection risk in RSVP endpoint (CRITICAL)
- E2E test fails: RSVP button not clickable

Auto-Fix Attempts: 3/3 failed
Recommendation: Manual code review required
```

---

## 🎓 LEARNING & IMPROVEMENT

**Feedback Loop**:
1. Track all failures (type, layer, fix strategy)
2. Update prompts to avoid repeat failures
3. Improve auto-fix algorithms weekly
4. Share learnings with future AI agents (mb.md updates)

**Quality Trend Tracking**:
```
Week 9:  85/100 → 88/100 → 91/100 (improving)
Week 10: 92/100 → 95/100 → 96/100 (stable)
Week 11: 97/100 → 98/100 → 98/100 (mature)
Week 12: 99/100 → 99/100 → 99/100 (autonomous)
```

---

## 📚 REFERENCES

- **MB.MD v7.1**: Full methodology
- **MB_MD_FINAL_PLAN.md**: 20-week roadmap
- **replit.md**: Current project status
- **public-apis/public-apis**: 379K+ free APIs for features
- **Continue.dev**: AI coding patterns
- **cubic.dev**: Automated PR review examples
- **VibeAudits.com**: Security audit checklist

---

**END OF VIBE CODING QUALITY GUARDRAILS**

**Version**: 1.0  
**Last Updated**: November 16, 2025  
**Next Action**: Implement in Autonomous Engine (System 7)
