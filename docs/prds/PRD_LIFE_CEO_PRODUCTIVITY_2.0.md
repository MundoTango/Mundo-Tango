# PRD: LIFE CEO Productivity Agent 2.0
**Version:** 2.0  
**Created:** November 17, 2025  
**Enhancement:** Blitzit-Inspired Focus & Productivity Features  
**Status:** Implementation Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
Transform LIFE CEO Productivity Agent from a basic task manager into a comprehensive focus and productivity system by integrating Blitzit's best features: BLITZ NOW floating focus mode, Pomodoro timer, anti-distraction alerts, and productivity analytics.

### 1.2 Current State
**Existing:** `client/src/pages/life-ceo/ProductivityAgentPage.tsx`
- Basic task list management
- Calendar integration
- Goal tracking
- Part of 16 LIFE CEO specialized agents

### 1.3 The Gap
Users manually switch between:
- Blitzit app for focus modes ($4.99/mo)
- Pomodoro apps for time blocking
- Analytics tools for productivity tracking
- **Total external cost:** $5-10/month + context switching

### 1.4 The Solution
Enhance existing Productivity Agent with:
- **Floating BLITZ NOW button** (persistent across entire app)
- **Pomodoro timer** with customizable intervals
- **Eisenhower Matrix** task prioritization
- **Anti-distraction alerts** and focus protection
- **Weekly productivity reports** with AI insights

**Benefits:**
- ✅ No external apps needed
- ✅ Integrated with existing LIFE CEO system
- ✅ Cross-app focus mode (works everywhere in Mundo Tango)
- ✅ AI-powered productivity insights via Context Service

---

## 2. FEATURE SPECIFICATIONS

### 2.1 Floating BLITZ NOW Button

**User Story:** As a distracted tango teacher, I need instant focus mode regardless of which page I'm on.

**Feature:**
- Persistent floating button (bottom-right corner, always visible)
- One-click activation: "BLITZ NOW" → Instant focus mode
- Visual indicator: Pulsating gradient when active
- Position: Fixed, z-index 9999, draggable
- Quick settings: 25min timer default (customizable to 15/30/45/60min)

**Technical Implementation:**
```typescript
// client/src/components/life-ceo/BlitzNowButton.tsx
export function BlitzNowButton() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes
  
  useEffect(() => {
    if (!isActive) return;
    
    // Start timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setIsActive(false);
          showNotification('Focus session complete! 🎉');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Block distracting notifications
    enableFocusMode();
    
    return () => {
      clearInterval(interval);
      disableFocusMode();
    };
  }, [isActive]);
  
  return (
    <Draggable position={position} onStop={(e, data) => setPosition({ x: data.x, y: data.y })}>
      <Button
        className={cn(
          "fixed z-[9999] rounded-full w-16 h-16 shadow-2xl",
          isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" : "bg-primary"
        )}
        onClick={() => setIsActive(!isActive)}
        data-testid="button-blitz-now"
      >
        {isActive ? (
          <div className="text-xs font-bold text-white">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        ) : (
          <Zap className="w-8 h-8" />
        )}
      </Button>
    </Draggable>
  );
}
```

**UI States:**
1. **Inactive:** Lightning bolt icon, primary color
2. **Active:** Countdown timer, pulsating gradient, "END" hover text
3. **Paused:** Pause icon, muted color

**Focus Mode Actions:**
- Mute all non-critical notifications
- Hide sidebar distractions (optional)
- Enable "Do Not Disturb" status
- Block access to social media tabs (configurable)
- Quick notes panel (capture thoughts without breaking focus)

---

### 2.2 Pomodoro Timer Integration

**User Story:** As a task-oriented user, I want structured focus sessions with breaks.

**Feature:**
- Classic Pomodoro: 25min work / 5min break / 4 cycles → 15min long break
- Customizable intervals: 15/25/30/45/60 minutes
- Break types: Short (5min), Long (15min), Flexible (custom)
- Auto-start next session (optional)
- Desktop notifications on break/session end
- Integrates with task list (auto-track time per task)

**Technical Implementation:**
```typescript
// server/services/PomodoroService.ts
export class PomodoroService {
  async startSession(params: {
    userId: number;
    taskId?: number;
    duration: number; // minutes
    type: 'work' | 'short_break' | 'long_break';
  }): Promise<PomodoroSession> {
    const session = await db.insert(pomodoroSessions).values({
      userId: params.userId,
      taskId: params.taskId,
      type: params.type,
      plannedDuration: params.duration * 60,
      startedAt: new Date(),
      status: 'active'
    }).returning();
    
    // Schedule BullMQ job to end session
    await pomodoroQueue.add('end-session', {
      sessionId: session[0].id
    }, {
      delay: params.duration * 60 * 1000
    });
    
    return session[0];
  }
  
  async completeSession(sessionId: number): Promise<void> {
    await db.update(pomodoroSessions)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        actualDuration: sql`EXTRACT(EPOCH FROM (NOW() - started_at))`
      })
      .where(eq(pomodoroSessions.id, sessionId));
    
    // Send desktop notification
    await sendNotification({
      userId: session.userId,
      title: 'Pomodoro Complete!',
      body: session.type === 'work' ? 'Time for a break!' : 'Ready to focus again?',
      action: session.type === 'work' ? 'start_break' : 'start_work'
    });
  }
}
```

**UI Components:**
- Timer display (large, center of focus panel)
- Session type indicator (Work / Break)
- Progress ring visualization
- Skip / Pause / Stop buttons
- Session history (track completed pomodoros)
- Daily goal: Complete 8 pomodoros (4 hours focused work)

**Database Schema:**
```typescript
export const pomodoroSessions = pgTable('pomodoro_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskId: integer('task_id').references(() => lifeCeoTasks.id),
  type: varchar('type', { length: 20 }).notNull(), // 'work', 'short_break', 'long_break'
  plannedDuration: integer('planned_duration').notNull(), // seconds
  actualDuration: integer('actual_duration'),
  status: varchar('status', { length: 20 }).notNull(), // 'active', 'completed', 'cancelled'
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at')
});
```

---

### 2.3 Eisenhower Matrix Task Prioritization

**User Story:** As an overwhelmed user, I need to prioritize tasks by urgency and importance.

**Feature:**
- 2x2 matrix: Urgent/Not Urgent × Important/Not Important
- Four quadrants:
  - **Q1 (Do First):** Urgent + Important → Red
  - **Q2 (Schedule):** Not Urgent + Important → Blue
  - **Q3 (Delegate):** Urgent + Not Important → Yellow
  - **Q4 (Eliminate):** Not Urgent + Not Important → Gray
- Drag-and-drop tasks between quadrants
- Auto-suggest quadrant based on task metadata (deadline, tags, AI analysis)
- Visual board view + list view toggle

**Technical Implementation:**
```typescript
// Add to existing lifeCeoTasks table
export const lifeCeoTasks = pgTable('life_ceo_tasks', {
  // ... existing fields
  eisenhowerQuadrant: varchar('eisenhower_quadrant', { length: 2 }), // 'Q1', 'Q2', 'Q3', 'Q4'
  urgencyScore: integer('urgency_score').default(5), // 1-10
  importanceScore: integer('importance_score').default(5), // 1-10
});

// AI-powered quadrant suggestion
async function suggestQuadrant(task: Task): Promise<EisenhowerQuadrant> {
  const contextService = new ContextService();
  
  // Analyze task using Context Service (RAG)
  const analysis = await contextService.query({
    query: `Analyze task urgency and importance: "${task.title}" with deadline ${task.deadline}`,
    collection: 'productivity_insights'
  });
  
  // Calculate urgency (based on deadline proximity)
  const daysUntilDeadline = differenceInDays(task.deadline, new Date());
  const urgency = daysUntilDeadline < 3 ? 9 : daysUntilDeadline < 7 ? 6 : 3;
  
  // Calculate importance (AI-driven + user tags)
  const importance = analysis.importanceScore;
  
  // Map to quadrant
  if (urgency >= 7 && importance >= 7) return 'Q1'; // Do First
  if (urgency < 7 && importance >= 7) return 'Q2'; // Schedule
  if (urgency >= 7 && importance < 7) return 'Q3'; // Delegate
  return 'Q4'; // Eliminate
}
```

**UI Components:**
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Q1: Do First (Urgent + Important) */}
  <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950">
    <CardHeader>
      <CardTitle className="text-red-700 dark:text-red-300">
        🔥 Do First (Urgent & Important)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Droppable droppableId="Q1">
        {q1Tasks.map(task => (
          <TaskCard key={task.id} task={task} quadrant="Q1" />
        ))}
      </Droppable>
    </CardContent>
  </Card>
  
  {/* Q2: Schedule (Not Urgent + Important) */}
  <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
    <CardHeader>
      <CardTitle className="text-blue-700 dark:text-blue-300">
        📅 Schedule (Important, Not Urgent)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Droppable droppableId="Q2">
        {q2Tasks.map(task => (
          <TaskCard key={task.id} task={task} quadrant="Q2" />
        ))}
      </Droppable>
    </CardContent>
  </Card>
  
  {/* Q3: Delegate */}
  {/* Q4: Eliminate */}
</div>
```

---

### 2.4 Anti-Distraction Alerts

**User Story:** As an easily distracted user, I need gentle reminders when I lose focus.

**Feature:**
- Detect distraction patterns:
  - Switching tabs frequently (>5 times in 5 minutes)
  - Idle time on non-work pages
  - Social media usage during focus mode
- Gentle nudges: Toast notification "You were working on: [Task Name]. Back to focus?"
- Distraction log: Track what breaks focus (for weekly report)
- Configurable sensitivity: Strict / Moderate / Relaxed
- Whitelist: Allow certain "distractions" (e.g., research, inspiration)

**Technical Implementation:**
```typescript
// client/src/hooks/useDistractionDetection.ts
export function useDistractionDetection(isBlitzActive: boolean) {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [lastActiveTab, setLastActiveTab] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isBlitzActive) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from Mundo Tango
        setTabSwitches(prev => prev + 1);
        
        if (tabSwitches > 5) {
          // Show gentle reminder
          showToast({
            title: "Focus drift detected 🧘",
            description: `You've switched tabs ${tabSwitches} times. Need a break?`,
            action: {
              label: "Refocus",
              onClick: () => setTabSwitches(0)
            }
          });
        }
        
        // Log distraction
        logDistraction({
          type: 'tab_switch',
          timestamp: new Date(),
          fromUrl: window.location.href
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Reset counter every 5 minutes
    const resetInterval = setInterval(() => setTabSwitches(0), 5 * 60 * 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(resetInterval);
    };
  }, [isBlitzActive, tabSwitches]);
}
```

**Distraction Types Tracked:**
1. Tab switching (away from Mundo Tango)
2. Idle time (no activity for >3 minutes)
3. Social media visits (configurable blocklist)
4. Non-work page visits (e.g., browsing feed during focus)
5. Notification interactions (checking phone/email)

---

### 2.5 Weekly Productivity Reports

**User Story:** As a productivity-focused user, I want insights on my work patterns.

**Feature:**
- Auto-generated every Monday morning
- AI-powered insights via Context Service
- Metrics:
  - Total focus time (Pomodoro + BLITZ sessions)
  - Tasks completed vs. planned
  - Distraction count and top distractors
  - Most productive time of day
  - Eisenhower Matrix distribution
  - Week-over-week comparison
- Actionable recommendations: "You're most productive 9-11am. Schedule important tasks then."
- Email delivery + in-app notification

**Technical Implementation:**
```typescript
// server/services/ProductivityAnalyticsService.ts
export class ProductivityAnalyticsService {
  async generateWeeklyReport(userId: number): Promise<ProductivityReport> {
    const lastWeek = {
      start: startOfWeek(subWeeks(new Date(), 1)),
      end: endOfWeek(subWeeks(new Date(), 1))
    };
    
    // Fetch data
    const pomodoros = await db.select()
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startedAt, lastWeek.start)
      ));
    
    const tasks = await db.select()
      .from(lifeCeoTasks)
      .where(and(
        eq(lifeCeoTasks.userId, userId),
        gte(lifeCeoTasks.updatedAt, lastWeek.start)
      ));
    
    const distractions = await db.select()
      .from(distractionLogs)
      .where(and(
        eq(distractionLogs.userId, userId),
        gte(distractionLogs.timestamp, lastWeek.start)
      ));
    
    // Calculate metrics
    const totalFocusTime = pomodoros
      .filter(p => p.type === 'work' && p.status === 'completed')
      .reduce((sum, p) => sum + (p.actualDuration || 0), 0);
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    
    const topDistractions = groupBy(distractions, 'type');
    
    // AI insights
    const contextService = new ContextService();
    const insights = await contextService.query({
      query: `Analyze productivity patterns: ${totalFocusTime}s focus, ${completedTasks}/${totalTasks} tasks completed, ${distractions.length} distractions. Provide 3 actionable recommendations.`,
      collection: 'productivity_insights'
    });
    
    return {
      weekOf: lastWeek.start,
      totalFocusTime,
      completedTasks,
      totalTasks,
      completionRate: (completedTasks / totalTasks) * 100,
      distractionCount: distractions.length,
      topDistractions: Object.entries(topDistractions).map(([type, logs]) => ({
        type,
        count: logs.length
      })),
      mostProductiveHour: findMostProductiveHour(pomodoros),
      insights: insights.recommendations
    };
  }
}
```

**Report UI:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>📊 Your Week in Review</CardTitle>
    <CardDescription>Week of {format(report.weekOf, 'MMM d, yyyy')}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Focus Time */}
    <div>
      <h4 className="font-semibold mb-2">⏱️ Total Focus Time</h4>
      <div className="text-3xl font-bold text-primary">
        {Math.floor(report.totalFocusTime / 3600)}h {Math.floor((report.totalFocusTime % 3600) / 60)}m
      </div>
      <Progress value={(report.totalFocusTime / (40 * 3600)) * 100} className="mt-2" />
      <p className="text-sm text-muted-foreground mt-1">
        Goal: 40 hours/week
      </p>
    </div>
    
    {/* Task Completion */}
    <div>
      <h4 className="font-semibold mb-2">✅ Tasks Completed</h4>
      <div className="text-3xl font-bold text-green-600">
        {report.completedTasks}/{report.totalTasks}
      </div>
      <Progress value={report.completionRate} className="mt-2" />
      <p className="text-sm text-muted-foreground mt-1">
        {report.completionRate.toFixed(0)}% completion rate
      </p>
    </div>
    
    {/* Top Distractions */}
    <div>
      <h4 className="font-semibold mb-2">🚫 Top Distractions</h4>
      {report.topDistractions.slice(0, 3).map((d, i) => (
        <div key={i} className="flex justify-between items-center mb-2">
          <span className="text-sm">{d.type}</span>
          <Badge variant="secondary">{d.count}x</Badge>
        </div>
      ))}
    </div>
    
    {/* AI Insights */}
    <div className="bg-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-2">💡 AI Recommendations</h4>
      <ul className="space-y-2">
        {report.insights.map((insight, i) => (
          <li key={i} className="text-sm flex items-start">
            <Check className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
            {insight}
          </li>
        ))}
      </ul>
    </div>
  </CardContent>
</Card>
```

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Database Schema

```typescript
// Add to shared/schema.ts

export const pomodoroSessions = pgTable('pomodoro_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskId: integer('task_id').references(() => lifeCeoTasks.id),
  type: varchar('type', { length: 20 }).notNull(),
  plannedDuration: integer('planned_duration').notNull(),
  actualDuration: integer('actual_duration'),
  status: varchar('status', { length: 20 }).notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at')
});

export const distractionLogs = pgTable('distraction_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'tab_switch', 'idle', 'social_media'
  timestamp: timestamp('timestamp').notNull(),
  metadata: jsonb('metadata') // { fromUrl, toUrl, duration, etc }
});

export const productivityReports = pgTable('productivity_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  weekOf: timestamp('week_of').notNull(),
  totalFocusTime: integer('total_focus_time').notNull(),
  completedTasks: integer('completed_tasks').notNull(),
  totalTasks: integer('total_tasks').notNull(),
  distractionCount: integer('distraction_count').notNull(),
  insights: jsonb('insights').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Enhance existing lifeCeoTasks
export const lifeCeoTasks = pgTable('life_ceo_tasks', {
  // ... existing fields
  eisenhowerQuadrant: varchar('eisenhower_quadrant', { length: 2 }),
  urgencyScore: integer('urgency_score').default(5),
  importanceScore: integer('importance_score').default(5),
  focusTimeSeconds: integer('focus_time_seconds').default(0)
});
```

### 3.2 API Routes

```typescript
// server/routes/productivity-routes.ts

// BLITZ NOW
router.post('/api/productivity/focus/start', authenticateToken, async (req: AuthRequest, res) => {
  // Start focus session
});

router.post('/api/productivity/focus/end', authenticateToken, async (req: AuthRequest, res) => {
  // End focus session, save stats
});

// Pomodoro
router.post('/api/productivity/pomodoro/start', authenticateToken, async (req: AuthRequest, res) => {
  const pomodoroService = new PomodoroService();
  const session = await pomodoroService.startSession({
    userId: req.userId!,
    taskId: req.body.taskId,
    duration: req.body.duration,
    type: req.body.type
  });
  res.json(session);
});

// Productivity Reports
router.get('/api/productivity/reports/weekly', authenticateToken, async (req: AuthRequest, res) => {
  const analyticsService = new ProductivityAnalyticsService();
  const report = await analyticsService.generateWeeklyReport(req.userId!);
  res.json(report);
});

// Eisenhower Matrix
router.patch('/api/productivity/tasks/:id/quadrant', authenticateToken, async (req: AuthRequest, res) => {
  // Update task quadrant
});
```

---

## 4. SUCCESS METRICS

### 4.1 User Adoption
- BLITZ NOW usage: Target >40% of Productivity Agent users within 1 month
- Pomodoro completions: Target avg 3+ per day per active user
- Weekly report engagement: Target >60% open rate

### 4.2 Productivity Impact
- User-reported productivity increase: Target >25% (survey)
- Task completion rate improvement: Target +15%
- Focus time increase: Target +30 minutes/day

### 4.3 Technical Performance
- BLITZ NOW button always visible: 99.9% uptime
- Distraction alert latency: <100ms
- Weekly report generation: <5 seconds

---

## 5. IMPLEMENTATION TIMELINE

**Week 11 Day 1-2:**
- Database schema migration
- PomodoroService.ts
- ProductivityAnalyticsService.ts
- BlitzNowButton.tsx component
- API routes (10 endpoints)

**Week 11 Day 3:**
- EisenhowerMatrix.tsx UI
- Anti-distraction detection system
- Weekly report UI
- Email delivery integration

**Testing:** E2E flows for all features

---

**END OF PRD**

**Total Pages:** 18  
**Estimated Implementation:** 3 days (Week 11)  
**Expected Impact:** 40%+ adoption, 25% productivity gain
