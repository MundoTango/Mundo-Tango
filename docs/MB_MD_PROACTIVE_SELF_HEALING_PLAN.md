# MB.MD Protocol v9.4 - Proactive Self-Healing System Plan
**Agent-Driven Auto-Fix with Real-Time Status Tracking**

## Mission Statement
Build a fully autonomous self-healing system where Mr. Blue proactively detects and fixes issues BEFORE and DURING user navigation, with real-time status tracking in Visual Editor and automated git/deployment staging.

---

## 🎯 Problem Statement

**Current Issue:** God-level user registration flow missing "Where do you live?" city picker with:
1. ❌ No location input field in RegisterPage.tsx
2. ❌ No auto-fill functionality
3. ❌ No city-to-website mapping confirmation flow
4. ❌ No URL suggestion or custom URL input

**Desired State:** Mr. Blue autonomously:
- Detects missing UI components before page load
- Auto-fixes components during navigation
- Shows real-time progress in Visual Editor status bar
- Stages git commits and deployment for approval
- Executes complete fix without user intervention

---

## 🔬 MB.MD Protocol Application

### The Three Pillars

#### 1. Work Simultaneously (Parallel Execution)
**Apply to:**
- Parallel issue detection (scan multiple pages simultaneously)
- Concurrent auto-fix execution (fix UI + backend + database in parallel)
- Multi-threaded status updates (Visual Editor + Mr. Blue chat + git staging)

**Implementation:**
```typescript
// Launch 3 parallel subagents for comprehensive fix
const [uiFix, backendFix, testFix] = await Promise.all([
  fixLocationPickerUI(),      // Add UnifiedLocationPicker to RegisterPage
  fixCityWebsiteMapping(),    // Add city_websites table + API
  generateE2ETest()           // Create test for registration flow
]);
```

#### 2. Work Recursively (Deep Exploration)
**Apply to:**
- Trace entire registration flow from RegisterPage → auth route → database
- Follow city picker dependencies: UnifiedLocationPicker → /api/locations/search
- Understand city-to-website mapping requirements
- Verify existing patterns in codebase

**Investigation Path:**
```
1. Read RegisterPage.tsx → DISCOVERED: Missing location field
2. Read UnifiedLocationPicker.tsx → DISCOVERED: Component exists, not integrated
3. Read auth routes → DISCOVERED: Registration doesn't capture location
4. Read users table schema → DISCOVERED: No city/website columns
5. Design city_websites table → NEW REQUIREMENT
6. Create complete solution
```

#### 3. Work Critically (Rigorous Quality)
**Apply to:**
- E2E test for complete god-level registration flow
- Verify auto-fill functionality works
- Test city-to-website mapping confirmation
- Validate custom URL input and database persistence
- Check git commit and deployment staging

**Quality Gates:**
- ✅ Location picker renders and functions
- ✅ Auto-fill suggests cities from database
- ✅ Website confirmation dialog appears
- ✅ Custom URL can be submitted
- ✅ All changes committed to git
- ✅ Deployment staged for approval
- ✅ E2E test passes end-to-end

---

## 🏗️ System Architecture

### Component 1: Proactive Issue Detector
**Purpose:** Scan pages BEFORE navigation and detect issues

**Features:**
- Route monitoring (detect when user is about to navigate)
- Component tree analysis (detect missing UI elements)
- API endpoint verification (check if endpoints exist)
- Database schema validation (verify required columns)

**Implementation:**
```typescript
// server/services/mrBlue/ProactiveDetector.ts
class ProactiveIssueDetector {
  async scanBeforeNavigation(route: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Scan UI components
    const componentIssues = await this.scanComponents(route);
    issues.push(...componentIssues);
    
    // Scan API endpoints
    const apiIssues = await this.scanAPIs(route);
    issues.push(...apiIssues);
    
    // Scan database schema
    const dbIssues = await this.scanDatabase(route);
    issues.push(...dbIssues);
    
    return issues;
  }
}
```

### Component 2: Autonomous Auto-Fixer
**Purpose:** Fix issues in real-time AS user navigates

**Features:**
- Code generation via GROQ Llama-3.3-70b
- File modification with verification
- Database migration execution
- API endpoint creation
- Real-time progress tracking

**Implementation:**
```typescript
// server/services/mrBlue/AutoFixer.ts
class AutonomousAutoFixer {
  async fixIssue(issue: Issue): Promise<FixResult> {
    const startTime = Date.now();
    
    // Generate fix code via GROQ
    const fixCode = await this.generateFix(issue);
    
    // Apply fix to codebase
    await this.applyFix(fixCode);
    
    // Run validation
    const isValid = await this.validateFix(issue);
    
    // Track progress
    await this.updateProgress(issue.id, 100);
    
    return {
      success: isValid,
      duration: Date.now() - startTime,
      code: fixCode
    };
  }
}
```

### Component 3: Visual Editor Status Bar
**Purpose:** Display real-time progress of auto-fix operations

**Features:**
- Pre-issues found count (before navigation)
- Issues identified count (during scan)
- Fix progress percentage (0-100%)
- Completion status ("✅ No issues found")

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Visual Editor - Status Bar                              │
├─────────────────────────────────────────────────────────┤
│ 🔍 Pre-scan: 3 issues found                             │
│ 🛠️  Fixing: 2/3 complete (67%)                          │
│ ✅ Fix applied: Added location picker to RegisterPage   │
│ 🚀 Git: Staged for approval                             │
└─────────────────────────────────────────────────────────┘
```

### Component 4: Git + Deployment Automation
**Purpose:** Stage commits and deployment for auto/manual approval

**Features:**
- Auto-commit after each fix
- Branch creation for feature fixes
- Deployment staging (dev → production)
- Approval workflow (auto or manual)

**Implementation:**
```typescript
// server/services/mrBlue/GitDeploymentService.ts
class GitDeploymentService {
  async stageFixCommit(fixResult: FixResult): Promise<string> {
    // Create feature branch
    const branch = `auto-fix/${fixResult.issue.id}`;
    await git.createBranch(branch);
    
    // Commit changes
    const commitHash = await git.commit({
      message: `🤖 Auto-fix: ${fixResult.issue.title}`,
      files: fixResult.changedFiles
    });
    
    // Stage for deployment
    await this.stageDeployment({
      commitHash,
      approvalMode: 'manual', // or 'auto' based on confidence
      environment: 'dev'
    });
    
    return commitHash;
  }
}
```

### Component 5: n8n-Type Workflow Automation
**Purpose:** Trigger-based automation flows

**Workflows:**

#### Workflow 1: Pre-Navigation Issue Detection
```yaml
Trigger: User navigates to /register
  ↓
Action 1: Scan RegisterPage components
  ↓
Action 2: Detect missing location picker
  ↓
Action 3: Send to Auto-Fixer
  ↓
Action 4: Update Visual Editor status bar
```

#### Workflow 2: Real-Time Auto-Fix
```yaml
Trigger: Issue detected
  ↓
Action 1: Generate fix code (GROQ)
  ↓
Action 2: Apply fix to file
  ↓
Action 3: Run validation test
  ↓
Action 4: Commit to git
  ↓
Action 5: Stage deployment
  ↓
Action 6: Update status (100%)
```

#### Workflow 3: Deployment Approval
```yaml
Trigger: Fix committed to git
  ↓
Decision: Auto-approve or manual?
  ├─ Auto: Deploy to dev immediately
  └─ Manual: Wait for god-level approval
  ↓
Action: Deploy to environment
  ↓
Notification: User receives deployment confirmation
```

---

## 📋 Implementation Checklist

### Phase 1: Core Infrastructure (Priority 1)
- [ ] Create ProactiveIssueDetector service
- [ ] Create AutonomousAutoFixer service
- [ ] Create GitDeploymentService
- [ ] Add Visual Editor status bar component
- [ ] Implement route monitoring system

### Phase 2: Fix Registration Flow (Priority 1)
- [ ] Add location picker to RegisterPage
- [ ] Create city_websites table schema
- [ ] Add city/website columns to users table
- [ ] Create /api/city-websites endpoints
- [ ] Implement city-to-website confirmation dialog
- [ ] Add custom URL input functionality

### Phase 3: Workflow Automations (Priority 2)
- [ ] Implement Pre-Navigation Detection workflow
- [ ] Implement Real-Time Auto-Fix workflow
- [ ] Implement Deployment Approval workflow
- [ ] Add webhook triggers for external integrations

### Phase 4: Testing & Validation (Priority 1)
- [ ] E2E test: God-level user registration with location
- [ ] E2E test: City-to-website mapping confirmation
- [ ] E2E test: Custom URL submission
- [ ] Integration test: Auto-fix system end-to-end

---

## 🎯 Success Criteria

### User Experience
✅ User navigates to /register
✅ Mr. Blue detects missing location picker (pre-navigation)
✅ Mr. Blue auto-fixes issue in <5 seconds
✅ Visual Editor status bar shows real-time progress
✅ Location picker appears when user loads page
✅ User selects city → website confirmation dialog appears
✅ User confirms or enters custom URL
✅ Registration completes successfully
✅ Git commit created automatically
✅ Deployment staged for approval

### Technical Validation
✅ ProactiveIssueDetector scans 100% of routes
✅ AutonomousAutoFixer achieves 95%+ success rate
✅ Status bar updates in real-time (<100ms latency)
✅ Git commits are atomic and descriptive
✅ Deployment staging works for dev + production
✅ n8n workflows execute without errors
✅ E2E tests pass at 100%

---

## 🔧 Technical Patterns

### Pattern 1: Event-Driven Issue Detection
```typescript
// Monitor route changes
router.beforeEach(async (to, from, next) => {
  // Trigger proactive scan
  const issues = await ProactiveDetector.scan(to.path);
  
  if (issues.length > 0) {
    // Send to auto-fixer
    await AutoFixer.fixAll(issues);
  }
  
  next();
});
```

### Pattern 2: Real-Time Status Updates
```typescript
// Server-Sent Events (SSE) for status streaming
app.get('/api/mrblue/auto-fix/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  
  const emitter = AutoFixer.getStatusEmitter();
  
  emitter.on('progress', (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
});
```

### Pattern 3: Confidence-Based Approval
```typescript
// Auto-approve high-confidence fixes
if (fixResult.confidence > 0.95) {
  await GitDeployment.autoApprove(fixResult.commitHash);
} else {
  await GitDeployment.requestManualApproval(fixResult.commitHash);
}
```

---

## 🧪 Test Scenarios

### Test 1: God-Level Registration with Location
```typescript
test('God-level user registration with city picker', async () => {
  // Pre-condition: Mr. Blue scans /register before navigation
  const preIssues = await ProactiveDetector.scan('/register');
  expect(preIssues).toContainEqual({
    type: 'missing-component',
    component: 'UnifiedLocationPicker'
  });
  
  // Action: Mr. Blue auto-fixes issue
  await AutoFixer.fixAll(preIssues);
  
  // Navigate to register page
  await page.goto('/register');
  
  // Verify: Location picker is now present
  await expect(page.getByTestId('input-location-search')).toBeVisible();
  
  // Fill registration form
  await page.fill('input[name="name"]', 'God User');
  await page.fill('input[name="email"]', 'god@mundotango.com');
  
  // Select city
  await page.fill('[data-testid="input-location-search"]', 'Buenos');
  await page.click('[data-testid="location-result-0"]');
  
  // Verify: Website confirmation dialog appears
  await expect(page.getByText('Is this your community website?')).toBeVisible();
  
  // Confirm or enter custom URL
  await page.fill('[data-testid="input-custom-url"]', 'https://buenosaires-tango.com');
  await page.click('[data-testid="button-confirm-website"]');
  
  // Complete registration
  await page.click('[data-testid="button-register"]');
  
  // Verify: Success
  await expect(page).toHaveURL('/feed');
  
  // Verify: Git commit created
  const commits = await git.log();
  expect(commits[0].message).toContain('Auto-fix: Added location picker');
  
  // Verify: Deployment staged
  const deployments = await DeploymentService.getStagedDeployments();
  expect(deployments).toHaveLength(1);
});
```

---

## 📚 Learnings to Add to mb.md

### Learning 1: Proactive Detection > Reactive Fixes
**Context:** Building self-healing systems
**Pattern:** Scan for issues BEFORE they impact users, not after
**Example:**
```typescript
// ❌ REACTIVE: Wait for error, then fix
user.navigateTo('/register');
// Error: Location picker missing
await fixIssue();

// ✅ PROACTIVE: Detect and fix before navigation
await scanRoute('/register'); // Finds issue
await autoFix();              // Fixes issue
user.navigateTo('/register'); // Smooth experience
```

### Learning 2: Real-Time Status > Silent Operations
**Context:** Autonomous agent operations
**Pattern:** Always show users what the agent is doing
**Example:**
```
Status Bar Updates:
1. "🔍 Scanning /register..."
2. "🛠️  Found 3 issues, fixing..."
3. "✅ 1/3: Added location picker"
4. "✅ 2/3: Created database migration"
5. "✅ 3/3: Updated API endpoints"
6. "🚀 All fixes complete - deployed to dev"
```

### Learning 3: Confidence Scoring > Binary Decisions
**Context:** Deployment automation
**Pattern:** Use confidence scores to determine auto vs manual approval
**Example:**
```typescript
// High confidence (>95%): Auto-approve
if (fix.confidence > 0.95) {
  await deployAutomatically();
}

// Medium confidence (80-95%): Request approval
else if (fix.confidence > 0.80) {
  await requestUserApproval();
}

// Low confidence (<80%): Manual review required
else {
  await requireManualReview();
}
```

---

## 🚀 Execution Plan

### Immediate Actions (Next 2 Hours)
1. ✅ Create comprehensive MB.MD plan (THIS DOCUMENT)
2. 🔄 Fix RegisterPage location picker issue
3. 🔄 Implement ProactiveDetector service
4. 🔄 Add Visual Editor status bar
5. 🔄 Create E2E test for registration flow

### Short-Term (Next Session)
6. Implement AutonomousAutoFixer service
7. Add GitDeploymentService
8. Build n8n workflow automations
9. Test end-to-end auto-fix system

### Medium-Term (Future Enhancement)
10. Add machine learning for issue prediction
11. Implement confidence scoring algorithm
12. Build deployment rollback system
13. Add webhook integrations for external services

---

## 📊 Metrics & KPIs

### Performance Metrics
- **Issue Detection Speed:** <500ms per route scan
- **Auto-Fix Success Rate:** >95%
- **False Positive Rate:** <5%
- **Mean Time to Fix:** <10 seconds

### User Experience Metrics
- **Navigation Delay:** <100ms (imperceptible)
- **Status Update Latency:** <50ms (real-time)
- **Deployment Approval Time:** <30 seconds (manual) | <5 seconds (auto)

### Code Quality Metrics
- **Test Coverage:** >95% for auto-fix system
- **Commit Message Quality:** 100% follow convention
- **Deployment Success Rate:** >99%

---

## 🎓 MB.MD Protocol Adherence

✅ **Simultaneously:** All issues detected and fixed in parallel
✅ **Recursively:** Deep exploration of registration flow dependencies
✅ **Critically:** 95-99/100 quality through comprehensive testing

**Quality Score Target:** 98/100
- Code Quality: 100/100
- Test Coverage: 100/100
- Documentation: 100/100
- Performance: 95/100
- User Experience: 95/100

---

**Status:** PLAN COMPLETE - Ready for Implementation
**Next Step:** Execute Phase 1 + 2 in parallel using 3-6 subagents
