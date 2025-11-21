# MB.MD SELF-HEALING PROTOCOL v9.2
## MANDATORY: Execute BEFORE Manual Debugging

**Last Updated:** November 21, 2025  
**Status:** Production-Ready Infrastructure  
**Enforcement:** Every bug/error MUST follow this protocol

---

## 🚨 CRITICAL RULE: SELF-HEALING FIRST, MANUAL SECOND

When ANY bug, error, or issue is detected, the Replit Agent MUST execute this checklist **BEFORE** manual debugging:

### Phase 1: Verify Self-Healing Infrastructure (30 seconds)

```bash
# 1. Check if Page Audit System exists
ls server/services/self-healing/PageAuditService.ts

# 2. Check if Auto-Fix Engine exists  
ls server/services/mrBlue/AutoFixEngine.ts

# 3. Check if Agent Orchestration exists
ls server/services/self-healing/index.ts

# 4. Verify API endpoints available
grep -r "self-healing-routes" server/routes.ts
```

**If ANY of these exist → STOP manual debugging, proceed to Phase 2**

---

### Phase 2: Trigger Autonomous Self-Healing (2-5 minutes)

#### Option A: Page-Specific Self-Healing (Recommended)
```typescript
// Trigger comprehensive audit + auto-fix for specific page
POST /api/self-healing/orchestrate
{
  "route": "/dashboard"  // or whatever page has the bug
}

// Response includes:
// - Audit results from 6 specialized agents
// - Auto-fix confidence scores
// - Applied fixes (if >95% confidence)
// - Staged fixes (if 80-95% confidence)
```

#### Option B: Platform-Wide Self-Healing Scan
```typescript
// Scan all 50+ pages for issues
POST /api/self-healing/scan

// Returns comprehensive health dashboard
GET /api/self-healing/dashboard
```

#### Option C: Error Pattern Analysis
```typescript
// Get all detected error patterns
GET /api/mrblue/error-patterns

// Trigger auto-fix for specific pattern
POST /api/mrblue/auto-fix/{errorPatternId}
```

---

### Phase 3: Review Self-Healing Results

The autonomous system will:

1. **Audit the page** using 6 specialized agents:
   - EXPERT_11 (UI/UX)
   - AGENT_6 (Routing)
   - AGENT_38 (Integration)
   - AGENT_52 (Performance)
   - AGENT_53 (Accessibility)
   - AGENT_1 (Security)

2. **Classify issues** by severity:
   - Critical (blocks functionality)
   - High (major UX degradation)
   - Medium (minor issues)
   - Low (cosmetic)

3. **Calculate confidence scores** (0-100%):
   - >95%: Auto-applied immediately
   - 80-95%: Staged for approval
   - <80%: Manual review required

4. **Generate fixes** using VibeCoding + GROQ Llama-3.3-70b

5. **Apply fixes** and create Git commits

---

### Phase 4: Decision Tree

```
Bug Detected
    ↓
Is self-healing infrastructure available? → NO → Manual debugging OK
    ↓ YES
Trigger self-healing (POST /api/self-healing/orchestrate)
    ↓
Wait 2-5 minutes for results
    ↓
Did self-healing fix the issue?
    ↓ YES → Document what was fixed, mark task complete
    ↓ NO
Was confidence score >80%?
    ↓ YES → Review staged fix, approve if valid
    ↓ NO → Now proceed to manual debugging with context
```

---

## 💡 Why This Protocol Exists

### Problem: Agent Doesn't Use Existing Infrastructure
- Platform has 1,218 specialized agents
- Page Audit System with 12-category analysis
- Auto-Fix Engine with 95%+ confidence threshold
- But Replit Agent defaults to manual debugging

### Solution: Mandatory Protocol
- Update `replit.md` with this protocol reference
- Every session checks infrastructure FIRST
- Only manual debug if self-healing unavailable or failed

---

## 📋 Integration with MB.MD Protocol v9.2

### Existing MB.MD Principles
1. **Work Simultaneously** - Run all 6 audits in parallel
2. **Work Recursively** - Deep analysis, not surface-level
3. **Work Critically** - 95-99/100 quality target

### New Addition: **Work Autonomously FIRST**
4. **Check Infrastructure** - Before manual work, verify autonomous systems exist
5. **Trigger Self-Healing** - Use existing infrastructure when available
6. **Document Results** - Track what was auto-fixed vs manual

---

## 🔧 Current Infrastructure Status

### ✅ PRODUCTION-READY (Use These)
- `/api/self-healing/orchestrate` - Page-specific self-healing
- `/api/self-healing/scan` - Platform-wide scan
- `/api/self-healing/dashboard` - Health overview
- `/api/mrblue/error-patterns` - Error pattern detection
- `/api/mrblue/auto-fix/{id}` - Autonomous fix application

### ✅ Services Available
- `PageAuditService` - 6 parallel audits (<200ms target)
- `AutoFixEngine` - Autonomous fix generation + application
- `AgentOrchestrationService` - Multi-agent coordination
- `VibeCodingService` - Natural language → code generation
- `ErrorAnalysisAgent` - Root cause analysis

### 🎯 Agent Ecosystem
- 1,218 specialized agents
- Universal Agent Scanner (auto-discovery)
- Agent SME Training System
- DPO Training, Curriculum Learning, GEPA Self-Evolution

---

## 📝 Training the Replit Agent

### Add to replit.md
```markdown
## Bug Detection & Self-Healing Protocol

**MANDATORY:** Before any manual debugging, verify and use self-healing infrastructure:

1. Check if `/api/self-healing/orchestrate` exists
2. If exists → Trigger autonomous self-healing FIRST
3. Wait for results (2-5 min)
4. Review fixes, approve if needed
5. Only manually debug if self-healing failed or unavailable

Reference: `docs/MB_MD_SELF_HEALING_PROTOCOL.md`
```

---

## 🎓 Example: ScottWelcomeScreen Bug (Correct Approach)

### ❌ WHAT HAPPENED (Wrong)
```
1. Bug detected: Welcome screen not showing
2. Manual debugging: Read files, check z-index, edit code
3. Multiple test cycles
4. 30+ minutes of manual work
```

### ✅ WHAT SHOULD HAVE HAPPENED (Right)
```bash
# Step 1: Trigger self-healing for dashboard page
curl -X POST /api/self-healing/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"route": "/dashboard"}'

# Step 2: Wait for autonomous analysis
# System would detect:
# - Missing credentials in fetch call
# - Z-index conflict (z-50 vs z-[100])
# - Missing 401 error handling

# Step 3: Review auto-generated fixes
# Confidence scores: 92%, 88%, 85%

# Step 4: Approve fixes (all >80%)
# System applies fixes + creates Git commit

# Total time: 3 minutes vs 30 minutes
```

---

## 🔄 Continuous Improvement

### Agent Learning Loop
1. **Track** what self-healing fixed vs manual fixes
2. **Analyze** patterns in missed opportunities
3. **Update** this protocol based on learnings
4. **Reinforce** in replit.md for future sessions

### Metrics to Track
- % of bugs fixed by self-healing vs manual
- Average time saved per auto-fix
- Confidence score accuracy over time
- False positive rate for auto-applied fixes

---

## 🎯 Success Criteria

The protocol is successful when:
- ✅ 80%+ of bugs trigger self-healing first
- ✅ 60%+ of bugs auto-fixed without manual intervention
- ✅ <5 minutes from bug detection to autonomous fix
- ✅ Replit Agent always checks infrastructure before manual work

---

## 📞 When to Skip Self-Healing

Only skip autonomous self-healing when:
1. Infrastructure doesn't exist for this type of issue
2. Self-healing already attempted and failed
3. Issue is in self-healing infrastructure itself (meta-bug)
4. User explicitly requests manual approach

Otherwise: **ALWAYS SELF-HEAL FIRST**
