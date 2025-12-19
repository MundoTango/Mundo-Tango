# VISUAL EDITOR INTEGRATION ROADMAP
**Phase 2 Completion: Agents #41-#50**

**Date:** November 22, 2025  
**Status:** 70% Complete (10/20 agents remaining)  
**Goal:** Transform Visual Editor into fully autonomous AI system

---

## 🎯 **INTEGRATION OVERVIEW**

### **✅ COMPLETED (Agents #31-#40)**

| Agent # | Service | Status | Integration Date |
|---------|---------|--------|------------------|
| #31 | Streaming Responses | ✅ Complete | Nov 21 |
| #32 | AI Suggestions (Claude) | ✅ Complete | Nov 22 |
| #33 | Multi-File Editing | ✅ Complete | Nov 21 |
| #34 | Voice Mode | ✅ Complete | Nov 21 |
| #35 | Element Selection | ✅ Complete | Nov 21 |
| #36 | Design Suggestions | ✅ Complete | Nov 21 |
| #37 | Error Analysis Panel | ✅ Complete | Nov 22 |
| #38 | Browser Automation | ✅ Complete | Nov 22 |
| #39 | Memory System (LanceDB) | ✅ Complete | Nov 22 |
| #40 | Progress Tracking (SSE) | ✅ Complete | Nov 22 |

### **🔄 REMAINING (Agents #41-#50)**

| Agent # | Service | Complexity | Est. Time | Priority |
|---------|---------|------------|-----------|----------|
| #41 | GitCommitGenerator | Medium | 30 min | High |
| #42 | PreferenceExtractor | Low | 20 min | Medium |
| #43 | QualityValidatorAgent | Medium | 30 min | High |
| #44 | TaskPlanner | High | 45 min | Critical |
| #45 | AgentEventBus Viewer | Medium | 30 min | Medium |
| #46 | WorkflowPatternTracker | Medium | 30 min | Medium |
| #47 | RoleAdapterAgent | Low | 20 min | Low |
| #48 | SubscriptionAgent | Low | 20 min | Medium |
| #49 | LearningCoordinator | High | 40 min | High |
| #50 | FileDependencyTracker | Medium | 25 min | Medium |

**Total Estimated Time:** 4.5 hours

---

## 📋 **AGENT #41: GIT COMMIT GENERATOR**

### **Purpose**
AI-powered conventional commit message generation with auto-commit capabilities.

### **Key Features**
- GPT-4o powered commit message generation
- Conventional commits format validation
- Auto-stage and commit files
- Optional GitHub push
- Commit history tracking

### **Integration Steps**

**1. Backend API Routes** (`server/routes.ts`)
```typescript
// POST /api/mrblue/git/generate-message
// POST /api/mrblue/git/commit
// GET /api/mrblue/git/history
// GET /api/mrblue/git/status
```

**2. Frontend Panel Component**
```typescript
// New tab in VisualEditorPage middle panel
<GitCommitPanel>
  - File selection checkboxes
  - Commit message preview (AI-generated)
  - Manual override input
  - "Commit" button
  - Commit history list
</GitCommitPanel>
```

**3. Usage Flow**
```
User edits files → 
  Detects uncommitted changes → 
    Shows "Git" badge on panel → 
      User clicks Git tab → 
        Selects files → 
          AI generates message → 
            User reviews/edits → 
              Commits → 
                Success notification
```

**4. Success Metrics**
- ✅ AI message quality score >8/10
- ✅ <3s generation time
- ✅ 100% conventional commits format compliance
- ✅ Optional push works without errors

---

## 📋 **AGENT #42: PREFERENCE EXTRACTOR**

### **Purpose**
Automatically extract and store user preferences from conversations.

### **Key Features**
- Pattern-based preference detection (16 regex patterns)
- Confidence scoring (0-1 scale)
- Category classification (coding_style, tech_stack, design, etc.)
- De-duplication via unique keys
- Context injection for code generation

### **Integration Steps**

**1. Hook into Chat System**
```typescript
// In /api/mrblue/chat endpoint
async function processMessage(userId, message) {
  // ... existing chat logic ...
  
  // Extract preferences in background
  preferenceExtractor.extractAndSave(userId, message, conversationId);
}
```

**2. Inject Preferences into Code Generation**
```typescript
// In VibeCodingService
async function generateCode(userId, prompt) {
  const preferenceContext = await preferenceExtractor.buildPreferenceContext(userId);
  
  const enhancedPrompt = `${prompt}\n\n${preferenceContext}`;
  
  // ... proceed with code generation ...
}
```

**3. Preferences Panel (Optional)**
```typescript
// New "Preferences" tab in settings
<PreferencesPanel>
  - List of detected preferences
  - Confidence scores
  - Edit/delete buttons
  - Manual add preference
</PreferencesPanel>
```

**4. Success Metrics**
- ✅ >70% preference detection accuracy
- ✅ Code generation respects preferences >85% of time
- ✅ No false positives on generic statements

---

## 📋 **AGENT #43: QUALITY VALIDATOR AGENT**

### **Purpose**
Real-time code quality, security, and performance validation.

### **Key Features**
- **Content Validation:** Profanity filter, spam detection
- **Code Quality:** GPT-4o powered review (0-100 score)
- **Security Scanning:** SQL injection, XSS, exposed secrets, CSRF
- **Performance:** Inefficient loops, blocking operations, unnecessary rerenders
- **Auto-Fix Generation:** Suggests fixes for detected issues

### **Integration Steps**

**1. Real-Time Validation**
```typescript
// Trigger validation on code generation
onCodeGenerated(code, language) {
  // Run validation in background
  const qualityReport = await qualityValidatorAgent.detectCodeQuality(code, language);
  const securityReport = await qualityValidatorAgent.detectSecurityVulnerabilities(code, language);
  
  // Show warnings if score <70
  if (qualityReport.score < 70) {
    showQualityWarning(qualityReport);
  }
  
  if (securityReport.vulnerabilities.length > 0) {
    showSecurityWarnings(securityReport);
  }
}
```

**2. Quality Dashboard Component**
```typescript
<CodeQualityDashboard>
  <ScoreCircle score={qualityReport.score} />
  <IssuesList issues={qualityReport.issues} />
  <SecurityAlerts vulnerabilities={securityReport.vulnerabilities} />
  <PerformanceOptimizations suggestions={performanceIssues} />
  <AutoFixButtons canAutoFix={hasAutoFixable} />
</CodeQualityDashboard>
```

**3. Success Metrics**
- ✅ Detect >90% of security vulnerabilities
- ✅ <2s validation time for typical component
- ✅ Auto-fix success rate >75%
- ✅ Zero false positives on production code

---

## 📋 **AGENT #44: TASK PLANNER**

### **Purpose**
AI-powered decomposition of complex requests into atomic, executable subtasks.

### **Key Features**
- GROQ Llama-3.3-70b powered decomposition
- Dependency graph analysis
- Parallel execution planning
- Risk assessment (safe/moderate/risky)
- Complexity estimation (simple/medium/complex/very-complex)

### **Integration Steps**

**1. Decomposition Flow**
```typescript
// When user submits complex request
async function handleComplexRequest(userRequest) {
  // Show loading indicator
  setStatus('analyzing');
  
  // Decompose into subtasks
  const decomposition = await taskPlanner.decomposeTask(userRequest);
  
  // Show task breakdown UI
  showTaskBreakdown(decomposition);
  
  // User approves → Execute tasks
  if (userApproved) {
    executeSubtasks(decomposition.subtasks);
  }
}
```

**2. Task Breakdown UI**
```typescript
<TaskBreakdownPanel>
  <ComplexityBadge level={decomposition.complexity} />
  <EstimatedTime minutes={decomposition.estimatedTotalTime} />
  
  <SubtaskList>
    {decomposition.subtasks.map(task => (
      <SubtaskCard
        key={task.id}
        description={task.description}
        type={task.type}
        dependencies={task.dependencies}
        estimatedMinutes={task.estimatedMinutes}
        riskLevel={task.riskLevel}
        requiresApproval={task.requiresApproval}
      />
    ))}
  </SubtaskList>
  
  <DependencyGraph graph={taskPlanner.buildDependencyGraph(subtasks)} />
  
  <ActionButtons>
    <Button onClick={executeAll}>Execute All</Button>
    <Button onClick={executeSequential}>One at a Time</Button>
  </ActionButtons>
</TaskBreakdownPanel>
```

**3. Success Metrics**
- ✅ Decomposition accuracy >85%
- ✅ No circular dependencies
- ✅ Estimated time within ±30% of actual
- ✅ Risky operations flagged >95% of time

---

## 📋 **AGENT #45: AGENT EVENT BUS VIEWER**

### **Purpose**
Real-time monitoring of agent coordination and inter-agent communication.

### **Key Features**
- Pub/sub event visualization
- Agent activity timeline
- Message flow diagram
- Performance metrics
- Debug mode for troubleshooting

### **Integration Steps**

**1. Event Bus Tap**
```typescript
// Tap into AgentEventBus to capture all events
agentEventBus.on('*', (event) => {
  // Send to frontend via WebSocket
  websocket.send('agent-event', event);
});
```

**2. Event Viewer Component**
```typescript
<AgentEventViewer>
  <EventTimeline events={liveEvents} />
  <AgentActivityGraph agents={activeAgents} />
  <MessageFlowDiagram flows={recentMessages} />
  <EventFilters categories={['coordination', 'learning', 'execution']} />
  <DebugPanel expanded={debugMode} />
</AgentEventViewer>
```

**3. Success Metrics**
- ✅ <50ms event display latency
- ✅ 1000+ events buffered without lag
- ✅ Filter/search works instantly
- ✅ Helps debug 80% of coordination issues

---

## 📋 **AGENT #46: WORKFLOW PATTERN TRACKER**

### **Purpose**
Learn user workflows to predict next actions and provide proactive suggestions.

### **Key Features**
- N-gram pattern analysis
- Confidence-based predictions (60% minimum)
- Action sequence recording
- Feedback loop learning
- Workflow statistics

### **Integration Steps**

**1. Action Recording**
```typescript
// Record every user action
workflowPatternTracker.recordAction({
  userId,
  actionType: 'code_generation',
  context: { prompt, files },
  timestamp: new Date(),
  sessionId
});
```

**2. Predictive Suggestions**
```typescript
// After each action, check for predictions
const prediction = await workflowPatternTracker.predictNextAction(userId);

if (prediction && prediction.confidence > 0.7) {
  showSuggestion({
    action: prediction.suggestedAction,
    confidence: prediction.confidence,
    reasoning: prediction.reasoning
  });
}
```

**3. Success Metrics**
- ✅ Prediction accuracy >65%
- ✅ User accepts suggestions >40% of time
- ✅ Patterns identified after 5+ repetitions
- ✅ No annoying false suggestions

---

## 📋 **AGENT #47: ROLE ADAPTER AGENT**

### **Purpose**
Adapt content and features based on user subscription tier.

### **Key Features**
- Tier-based feature gating (free/basic/plus/pro/god)
- Content adaptation (hide premium features)
- Upgrade suggestions
- Feature access validation

### **Integration Steps**

**1. Feature Gating**
```typescript
// Before showing premium features
const hasAccess = await roleAdapterAgent.checkFeatureAccess(userId, 'video_upload');

if (!hasAccess) {
  showUpgradePrompt('video_upload');
}
```

**2. Content Adaptation**
```typescript
// Adapt AI responses based on tier
const { adapted, hiddenFeatures } = await roleAdapterAgent.adaptContent(
  aiResponse,
  user.subscriptionTier
);
```

**3. Success Metrics**
- ✅ Zero unauthorized feature access
- ✅ Upgrade conversion rate >5%
- ✅ Clear tier benefits communication

---

## 📋 **AGENT #48: SUBSCRIPTION AGENT**

### **Purpose**
Track feature usage quotas and enforce subscription limits.

### **Key Features**
- Daily/monthly/total quota tracking
- Real-time usage monitoring
- Limit enforcement with friendly messages
- Upgrade prompts at 80% usage

### **Integration Steps**

**1. Quota Checking**
```typescript
// Before allowing feature use
const { allowed, reason, quota } = await subscriptionAgent.canUseFeature(userId, 'aiRequests');

if (!allowed) {
  showQuotaExceeded(reason, quota);
  return;
}

// Increment usage
await subscriptionAgent.incrementUsage(userId, 'aiRequests');
```

**2. Usage Dashboard**
```typescript
<UsageDashboard>
  {Object.keys(limits).map(feature => (
    <QuotaCard
      key={feature}
      feature={feature}
      quota={quotas[feature]}
    />
  ))}
</UsageDashboard>
```

**3. Success Metrics**
- ✅ Quota accuracy 100%
- ✅ Proactive upgrade prompts at 80%
- ✅ Zero quota bypass bugs

---

## 📋 **AGENT #49: LEARNING COORDINATOR**

### **Purpose**
Coordinate 10 learning pathways to aggregate user feedback and auto-improve.

### **Key Features**
- **10 Learning Pathways:** Chat feedback, volunteer testing, live sessions, visual editor, telemetry, code generation, tour completion, feature usage, error patterns, social sentiment
- AI-powered insight generation
- Cross-pathway correlation
- Prioritized improvement recommendations

### **Integration Steps**

**1. Daily Learning Run**
```typescript
// Cron job runs daily at midnight
cron.schedule('0 0 * * *', async () => {
  const results = await learningCoordinator.runAllPathways();
  const report = await learningCoordinator.generateDailyReport(results);
  
  // Send to admin dashboard
  notifyAdmins(report);
});
```

**2. Learning Dashboard**
```typescript
<LearningDashboard>
  <PathwayMetrics pathways={results} />
  <TopInsights insights={report.topInsights} />
  <PrioritizedImprovements improvements={report.prioritizedImprovements} />
  <SatisfactionTrend trend={report.userSatisfactionTrend} />
  <HealthScore score={report.systemHealthScore} />
</LearningDashboard>
```

**3. Success Metrics**
- ✅ All 10 pathways running daily
- ✅ >50 insights generated per week
- ✅ >80% of critical issues fixed within 48h
- ✅ User satisfaction trending upward

---

## 📋 **AGENT #50: FILE DEPENDENCY TRACKER**

### **Purpose**
Analyze file dependencies to prevent breaking changes and optimize code organization.

### **Key Features**
- Import/export analysis
- Dependency graph visualization
- Circular dependency detection
- Impact analysis (what breaks if X changes)
- Bundle size optimization

### **Integration Steps**

**1. Real-Time Analysis**
```typescript
// When editing a file
const dependencies = await fileDependencyTracker.analyze(filePath);

// Show warning if many dependents
if (dependencies.dependents.length > 10) {
  showWarning(`${dependencies.dependents.length} files depend on this. Changes may have wide impact.`);
}
```

**2. Dependency Visualization**
```typescript
<DependencyGraph>
  <FileNode file={currentFile} />
  <DependencyEdges 
    imports={dependencies.imports}
    exports={dependencies.exports}
  />
  <CircularDependencyWarnings cycles={detectedCycles} />
</DependencyGraph>
```

**3. Success Metrics**
- ✅ Detects 100% of circular dependencies
- ✅ <1s analysis time for typical file
- ✅ Prevents >50% of breaking changes
- ✅ Bundle size recommendations save >20%

---

## 🚀 **EXECUTION PLAN**

### **Priority Order**
1. **Critical (Do First):** TaskPlanner, QualityValidator
2. **High:** GitCommitGenerator, LearningCoordinator
3. **Medium:** WorkflowPatternTracker, AgentEventBus, PreferenceExtractor, FileDependencyTracker, SubscriptionAgent
4. **Low:** RoleAdapterAgent

### **Parallel Execution Strategy**
- **Backend Team:** Implement API routes for all 10 services
- **Frontend Team:** Build UI components in parallel
- **Testing Team:** E2E tests for each integration
- **Documentation:** Update MB.MD with agent status

### **Timeline**
- **Day 1:** Agents #41-#44 (Critical path)
- **Day 2:** Agents #45-#47 (Medium priority)
- **Day 3:** Agents #48-#50 (Remaining)
- **Day 4:** Integration testing and bug fixes

---

## ✅ **VALIDATION CHECKLIST**

Before marking Phase 2 complete:
- [ ] All 10 services have API endpoints
- [ ] Visual Editor UI updated with new panels/features
- [ ] LSP shows zero errors
- [ ] E2E tests pass for all integrations
- [ ] Performance benchmarks met (<2s response times)
- [ ] Security review passed
- [ ] Documentation updated
- [ ] replit.md reflects new capabilities

---

**END OF INTEGRATION ROADMAP**
