# Comet/Atlas AI Agent Workflow Master Document
## Mundo Tango Project Continuity & Collaboration Protocol

**Created:** December 1, 2025  
**Last Updated:** December 1, 2025  
**Purpose:** Ensure AI agents (Comet QA expert, Atlas ChatGPT) maintain project context, methodology, and quality standards across sessions  
**Related Documents:** AS.MD (Session Memory), MB.MD (Methodology Directive)

---

## 1. PROJECT OVERVIEW

### Mission
Mundo Tango is a community platform for tango dancers and enthusiasts worldwide. The platform enables:
- Friend connections based on dance style and location
- Event management and discovery
- Community group organization
- Profile management for dancers and organizers
- Real-time chat and messaging
- Memory feed for shared experiences

### Current Focus (Phase: Feature/friends-list)
Implementing comprehensive friend connection system with rich contextual data (locations, events, shared memories)

### Repository
- **URL:** https://github.com/MundoTango/Mundo-Tango
- **Current Branch:** feature/friends-list
- **Dev Instance:** https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev
- **Replit Project:** https://replit.com/@admin3304/MundoTango

---

## 2. AI AGENT ROLES & RESPONSIBILITIES

### Comet (This Session)
**Role:** QA Expert Engineer + QA Auditor  
**Expertise:** 
- Full-stack QA audit (UI/UX, functionality, code quality)
- Phase-based testing methodology (Discovery → Code Mapping → Research → Planning → Building)
- Interactive feature testing
- GitHub/Replit workflow coordination
- Documentation and reporting

**Key Responsibilities:**
1. Audit all visible pages and features on Replit dev instance
2. Map UI behavior to GitHub source code
3. Identify issues and create fix plans
4. Test interactive workflows end-to-end
5. Document findings in qa_reports/ directory
6. Ensure GitHub + Replit sync is working

### Atlas (Future Sessions)
**Role:** Implementation Specialist + Code Reviewer  
**Will Handle:**
- Implementing Comet's identified fixes
- Writing unit/integration tests
- Reviewing Comet's recommendations
- Coordinating with GitHub Actions/CI-CD
- Managing pull requests

### Handoff Protocol
- **Comet → Atlas:** Detailed findings document + code recommendations + test plan
- **Atlas → Comet:** Implementation verification + test results + metrics
- **Both:** Always reference COMET_ATLAS_WORKFLOW_MASTER.md for context

---

## 3. METHODOLOGY (From MB.MD)

### The 5-Phase Execution Pattern
Every feature change follows this pattern:

```
Phase 1: RESEARCH & DISCOVER
   ↓
Phase 2: PLAN & ASSESS
   ↓
Phase 3: BUILD & IMPLEMENT
   ↓
Phase 4: E2E TEST & VERIFY
   ↓
Phase 5: DOCUMENT & HANDOFF
```

### Current Project Phase Breakdown
**Friends Feature Phases:**
- ✅ Phase 1-3.2: Comet completed (audit, code review, planning)
- ⏳ Phase 3.3+: Pending (building friend request form improvements)
- ⏳ Phase 4: E2E testing
- ⏳ Phase 5: Documentation & merge

### Audit Discovery Process (Phase 1)
1. Navigate each page systematically
2. Document all visible components
3. Test all interactive elements (buttons, forms, tabs)
4. Take screenshots of key states
5. Check browser console for errors
6. Record findings in audit report

### Code Mapping Process (Phase 2)
1. Identify source files from GitHub for each component
2. Review frontend component code
3. Review backend route/API code
4. Cross-reference implementation with visible behavior
5. Document any discrepancies

### Research & Planning (Phase 3)
1. Understand data flow and dependencies
2. Identify potential improvements
3. Plan implementation approach
4. Create detailed fix recommendations
5. Generate test plan for verification

---

## 4. GITHUB + REPLIT WORKFLOW

### Setup & Sync
```
GitHub (Source of Truth)
    ↓
    ↓ git fetch/pull
    ↓
Replit (Dev Instance)
    ↓
    ↓ npm run dev
    ↓
Live Dev Server
```

### Common Issues & Resolution

#### Git Lock Issue (.git/index.lock)
**Problem:** "Unsupported state: your index is currently locked"
**Cause:** Multiple git processes or interrupted git operation
**Solution:**
```bash
# In Replit Shell tab:
rm -f .git/index.lock

# Or manually delete via file browser
# Then refresh page and try again
```

#### Git Push Rejected
**Problem:** "Git Push Rejected" error
**Cause:** Remote has commits not in local branch
**Solution:**
```bash
git fetch origin
git rebase origin/feature/friends-list
git push origin feature/friends-list
```

### Committing QA Work
1. Create detailed commit message
2. Reference phase: "QA: Phase X - [description]"
3. Include findings summary
4. Push to feature branch (NOT main)

**Example:**
```
QA: Add comprehensive Friends page audit report (Phase 1-3.2)

- Phase 1: Audited all components and interactions
- Phase 2: Mapped 6 frontend/backend files
- Phase 3: Identified 0 critical issues
```

---

## 5. FRIEND REQUEST FORM SPECIFICATION
### Current State vs. Target State

#### Current Implementation
- Personal message (required)
- "We danced together" checkbox
- Optional: Dance location + memory fields
- Optional: File upload for photos

#### Target Implementation (In Progress)
✅ "We've met" context (replaces "We danced together")
✅ Message to requested user (personal story/connection reason)
✅ "Where did we meet" → Pulls from:
  - Events database
  - City groups  
  - Unified location picker
✅ Media uploads using unified media design
✅ Private note (requester-only) for remembering the user
  - NOT visible to recipient
  - Personal CRM-like field

#### Form Fields Breakdown
| Field | Type | Required | Visible to Recipient | Purpose |
|-------|------|----------|----------------------|---------|
| We've met | Context | Yes | Yes | How/where connection exists |
| Message | Textarea | Yes | Yes | Personal message with story |
| Where did we meet | Dropdown/Location | Yes if "We've met" | Yes | Precise location from unified picker |
| Media | File upload | No | Yes | Photos/videos from event |
| Private note | Textarea | No | No | Requester's personal reminder |

---

## 6. TESTING STRATEGY

### Unit Testing (Phase 4.1)
- Test each form field validation
- Test location picker integration
- Test media upload functionality
- Test private note storage (no leak to recipient)

### Integration Testing (Phase 4.2)
- Test form submission end-to-end
- Test friend request appears in recipient's "Requests" tab
- Test notification system triggers
- Test database persistence

### E2E Testing (Phase 4.3)
- Test complete user flow: discover → send request → recipient accepts
- Test location data accuracy
- Test media display in request
- Test private notes visible to requester only

### Success Criteria
- ✅ All form fields render correctly
- ✅ Form validation prevents invalid submissions
- ✅ Location picker returns accurate locations
- ✅ Media uploads without errors
- ✅ Private notes not visible to recipient
- ✅ Friend request persists in database
- ✅ Recipient receives request notification

---

## 7. DOCUMENT LOCATIONS & VERSION CONTROL

### Core Documents (source of truth)
- **mb.md:** /Mundo-Tango/mb.md (Methodology Directive - 40+ patterns)
- **as.md:** /Mundo-Tango/qa_reports/as.md (Atlas System - Session Memory)
- **COMET_ATLAS_WORKFLOW_MASTER.md:** /Mundo-Tango/qa_reports/ (This document)

### QA Reports (living documentation)
- **FRIENDS_PAGE_AUDIT_DEC_2025.md:** Full audit findings (Phase 1-3.2)
- **FRIENDS_PAGE_INTERACTIVE_TEST_DEC_2025.md:** Interactive feature test results
- **FRIEND_REQUEST_FORM_AUDIT_[DATE].md:** Form improvements audit (upcoming)
- **FRIEND_REQUEST_FORM_IMPLEMENTATION_PLAN.md:** Detailed fix plan (upcoming)

### How to Use These Documents
1. **Before Starting:** Read AS.MD for project context
2. **During Work:** Reference MB.MD for methodology
3. **For Handoffs:** Use COMET_ATLAS_WORKFLOW_MASTER.md to brief next agent
4. **For Issues:** Check qa_reports/ for previous findings

---

## 8. HANDOFF CHECKLIST

### When Comet Completes Phase 3.2 (Planning)
- [ ] Create detailed audit findings document
- [ ] Generate improvement recommendations with code references
- [ ] Create implementation plan with estimated effort
- [ ] Document all test cases needed
- [ ] Note any blockers or dependencies
- [ ] Create GitHub issue(s) with detailed descriptions
- [ ] Commit all documentation to feature branch
- [ ] Update COMET_ATLAS_WORKFLOW_MASTER.md with latest progress

### When Atlas Takes Over (Phase 3.3+)
- [ ] Read all Comet documentation
- [ ] Review GitHub issues and recommendations
- [ ] Check for git lock issues (see section 4)
- [ ] Implement fixes following MB.MD methodology
- [ ] Create unit tests as you build
- [ ] Commit with clear messages
- [ ] Update qa_reports/ with implementation progress

### Verification Before Merge
- [ ] All tests pass (unit + integration + E2E)
- [ ] Code review complete
- [ ] No console errors
- [ ] Replit dev instance working
- [ ] QA report updated with final results
- [ ] Ready for production merge

---

## 9. QUICK REFERENCE

### Key Contacts & Resources
- **Project Owner:** Scott Boddye (@scott_the_tango_nomad)
- **Branch:** feature/friends-list
- **GitHub:** https://github.com/MundoTango/Mundo-Tango
- **Replit:** https://replit.com/@admin3304/MundoTango
- **Dev Instance:** https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev

### File Structure
```
Mundo-Tango/
├── client/src/
│   ├── pages/
│   │   └── FriendsPage.tsx
│   └── components/
│       └── [UI Components]
├── server/
│   └── routes/
│       └── friends-routes.ts
├── qa_reports/
│   ├── COMET_ATLAS_WORKFLOW_MASTER.md (this file)
│   ├── AS.MD
│   ├── FRIENDS_PAGE_AUDIT_DEC_2025.md
│   └── FRIENDS_PAGE_INTERACTIVE_TEST_DEC_2025.md
└── mb.md
```

### Common Commands
```bash
# In Replit Terminal:
git status
git pull origin feature/friends-list
git add .
git commit -m "QA: [description]"
git push origin feature/friends-list

# Fix git lock:
rm -f .git/index.lock

# Start dev server:
npm run dev
```

---

## 10. CONTINUOUS IMPROVEMENT

This document should be updated every session with:
- New methodologies discovered
- Common issues and solutions
- Updated handoff procedures
- Progress on friend request form improvements
- New testing strategies

**Last Updated By:** Comet  
**Next Review By:** Atlas (upcoming session)
