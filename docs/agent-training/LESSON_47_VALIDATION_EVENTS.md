# LESSON 47: Event Bus Must Support Validation Events

**Date:** November 24, 2025  
**Training Level:** CRITICAL - All Agents Using AgentEventBus  
**Status:** MANDATORY IMPLEMENTATION

---

## 🎯 WHAT WE LEARNED

**Problem:** AgentEventBus only published `code:generated` but not `code:validated`.

**Evidence:**
```typescript
// Current event types (INCOMPLETE)
type AgentEventType =
  | 'code:generated'
  | 'agent:started'
  | 'agent:completed'
  | 'progress:updated';

// ❌ MISSING: Validation event types!
```

**Root Cause:** Event bus was designed for linear workflows (start → generate → complete) but not for validation loops (generate → validate → retry → escalate).

---

## ❌ WHY THIS FAILED

**Old Event Flow (WRONG):**
```
agent:started
    ↓
code:generated
    ↓
agent:completed ← NO VALIDATION!
```

**What Was Missing:**
1. No `code:validated` event
2. No `validation:failed` event
3. No `retry:attempted` event
4. No `task:escalated` event
5. No `evidence:collected` event

**Impact:**
- ValidationAgent couldn't subscribe to code generation events
- No way to track retry attempts
- No escalation notifications
- Agents worked in isolation instead of coordinating

---

## ✅ NEW PROTOCOL (MANDATORY)

### **Updated Event Types:**

```typescript
// NEW event types (COMPLETE)
type AgentEventType =
  // Existing events
  | 'agent:started'
  | 'agent:completed'
  | 'progress:updated'
  | 'code:generated'
  
  // ✅ NEW: Validation events
  | 'code:validated'         // Validation passed
  | 'validation:failed'      // Validation failed
  
  // ✅ NEW: Retry events
  | 'retry:attempted'        // Auto-retry in progress
  | 'retry:succeeded'        // Retry succeeded
  | 'retry:exhausted'        // All retries failed
  
  // ✅ NEW: Escalation events
  | 'task:escalated'         // Task escalated to Replit AI
  | 'escalation:resolved'    // Escalation resolved
  
  // ✅ NEW: Evidence events
  | 'evidence:collected'     // Evidence package ready
  | 'evidence:uploaded';     // Evidence uploaded to Cloudinary
```

---

## 🔄 EVENT FLOW DIAGRAM

### **Complete Validation Loop:**

```
Step 1: Code Generation
agent:started (VibeCodingAgent)
    ↓
code:generated (files changed)
    ↓
    
Step 2: Validation (ValidationAgent subscribes)
code:validated (LSP + E2E passed)
    OR
validation:failed (errors detected)
    ↓
    
Step 3A: If Validation Passed
evidence:collected
    ↓
agent:completed
    
Step 3B: If Validation Failed
retry:attempted (attempt 1/3)
    ↓
code:generated (retry)
    ↓
code:validated OR validation:failed
    ↓
retry:attempted (attempt 2/3) OR retry:succeeded
    ↓
If retry:exhausted (3 attempts failed)
    ↓
task:escalated
    ↓
escalation:resolved (Replit AI fixes)
    ↓
    
Final Step: Evidence Collection
evidence:collected
evidence:uploaded
agent:completed
```

---

## 📝 EVENT PAYLOADS

### **code:validated Event:**

```typescript
interface CodeValidatedEvent {
  type: 'code:validated';
  sessionId: string;
  source: 'ValidationAgent';
  timestamp: Date;
  payload: {
    passed: true;
    lspErrors: [];
    e2eTests: {
      passed: 10,
      failed: 0,
      duration: '2.3s'
    };
    screenshots: {
      before: 'cloudinary.com/...',
      after: 'cloudinary.com/...'
    };
    confidence: 0.98;
  };
}
```

### **validation:failed Event:**

```typescript
interface ValidationFailedEvent {
  type: 'validation:failed';
  sessionId: string;
  source: 'ValidationAgent';
  timestamp: Date;
  payload: {
    passed: false;
    lspErrors: ['Type error on line 45'];
    e2eTests: {
      passed: 8,
      failed: 2,
      failures: ['Button click not working', 'Form validation failed']
    };
    confidence: 0.45;
  };
}
```

### **retry:attempted Event:**

```typescript
interface RetryAttemptedEvent {
  type: 'retry:attempted';
  sessionId: string;
  source: 'AutoRetryService';
  timestamp: Date;
  payload: {
    attemptNumber: 1; // 1, 2, or 3
    maxAttempts: 3;
    reason: 'E2E test failed: Button click not working';
    strategyAdjustment: 'Applied learned pattern from similar failure';
  };
}
```

### **task:escalated Event:**

```typescript
interface TaskEscalatedEvent {
  type: 'task:escalated';
  sessionId: string;
  source: 'EscalationService';
  timestamp: Date;
  payload: {
    reason: 'COMPLEXITY_EXCEEDED'; // or 'CLARIFICATION_NEEDED', 'INFRASTRUCTURE_ISSUE'
    attempts: 3;
    errors: ['Error 1', 'Error 2', 'Error 3'];
    recommendation: 'This requires human expertise in quantum computing';
    evidence: {
      screenshots: ['...'],
      logs: ['...'],
      tests: { passed: 5, failed: 3 }
    };
  };
}
```

### **evidence:collected Event:**

```typescript
interface EvidenceCollectedEvent {
  type: 'evidence:collected';
  sessionId: string;
  source: 'EvidenceCollector';
  timestamp: Date;
  payload: {
    filesChanged: ['Button.tsx', 'styles.css'];
    screenshots: {
      before: 'cloudinary.com/before.png',
      after: 'cloudinary.com/after.png'
    };
    testResults: {
      passed: 10,
      failed: 0,
      duration: '2.3s'
    };
    consoleLogs: 'No errors detected';
    lspValidation: { errors: [] };
    confidence: 0.98;
  };
}
```

---

## 📝 CODE IMPLEMENTATION

### **Required Update to AgentEventBus.ts:**

```typescript
// Update event type definition
export type AgentEventType =
  // Existing events
  | 'agent:started'
  | 'agent:completed'
  | 'progress:updated'
  | 'code:generated'
  
  // ✅ NEW: Validation events
  | 'code:validated'
  | 'validation:failed'
  
  // ✅ NEW: Retry events
  | 'retry:attempted'
  | 'retry:succeeded'
  | 'retry:exhausted'
  
  // ✅ NEW: Escalation events
  | 'task:escalated'
  | 'escalation:resolved'
  
  // ✅ NEW: Evidence events
  | 'evidence:collected'
  | 'evidence:uploaded';

// Event payload interface
export interface AgentEvent {
  type: AgentEventType;
  sessionId: string;
  source: string;
  timestamp: Date;
  payload: any; // Specific to event type
}

// AgentEventBus implementation (no changes needed, already supports any event type)
class AgentEventBus {
  private subscribers: Map<AgentEventType, Array<(event: AgentEvent) => void>> = new Map();
  
  async publish(event: AgentEvent): Promise<void> {
    console.log(`[EventBus] Publishing ${event.type} from ${event.source}`);
    
    const listeners = this.subscribers.get(event.type) || [];
    
    // Execute all subscribers in parallel
    await Promise.all(
      listeners.map(listener => listener(event))
    );
  }
  
  subscribe(eventType: AgentEventType, callback: (event: AgentEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push(callback);
    console.log(`[EventBus] New subscriber for ${eventType}`);
  }
}
```

---

## 🔄 AGENT SUBSCRIPTION EXAMPLES

### **ValidationAgent Subscribes to code:generated:**

```typescript
class ValidationAgent {
  constructor(private eventBus: AgentEventBus) {
    // Subscribe to code generation events
    this.eventBus.subscribe('code:generated', async (event) => {
      console.log('[ValidationAgent] Code generated, starting validation...');
      
      // Run validation
      const result = await this.validateCode(event.sessionId);
      
      // Publish validation result
      if (result.passed) {
        await this.eventBus.publish({
          type: 'code:validated',
          sessionId: event.sessionId,
          source: 'ValidationAgent',
          timestamp: new Date(),
          payload: result
        });
      } else {
        await this.eventBus.publish({
          type: 'validation:failed',
          sessionId: event.sessionId,
          source: 'ValidationAgent',
          timestamp: new Date(),
          payload: result
        });
      }
    });
  }
}
```

### **AutoRetryService Subscribes to validation:failed:**

```typescript
class AutoRetryService {
  constructor(private eventBus: AgentEventBus) {
    // Subscribe to validation failures
    this.eventBus.subscribe('validation:failed', async (event) => {
      console.log('[AutoRetry] Validation failed, analyzing for retry...');
      
      // Get attempt number
      const attemptNumber = await this.getAttemptNumber(event.sessionId);
      
      if (attemptNumber < 3) {
        // Publish retry attempt
        await this.eventBus.publish({
          type: 'retry:attempted',
          sessionId: event.sessionId,
          source: 'AutoRetryService',
          timestamp: new Date(),
          payload: {
            attemptNumber: attemptNumber + 1,
            maxAttempts: 3,
            reason: event.payload.errors
          }
        });
        
        // Execute retry
        await this.executeRetry(event.sessionId);
      } else {
        // Publish retry exhausted
        await this.eventBus.publish({
          type: 'retry:exhausted',
          sessionId: event.sessionId,
          source: 'AutoRetryService',
          timestamp: new Date(),
          payload: { attempts: 3 }
        });
        
        // Trigger escalation
        await escalationService.escalate(event.sessionId, event.payload);
      }
    });
  }
}
```

### **EscalationService Subscribes to retry:exhausted:**

```typescript
class EscalationService {
  constructor(private eventBus: AgentEventBus) {
    // Subscribe to retry exhaustion
    this.eventBus.subscribe('retry:exhausted', async (event) => {
      console.log('[Escalation] Retries exhausted, escalating to Replit AI...');
      
      // Create escalation report
      const report = await this.createEscalationReport(event.sessionId);
      
      // Publish escalation event
      await this.eventBus.publish({
        type: 'task:escalated',
        sessionId: event.sessionId,
        source: 'EscalationService',
        timestamp: new Date(),
        payload: report
      });
      
      // Notify Replit AI (via database + UI)
      await this.notifyReplitAI(report);
    });
  }
}
```

---

## 🎓 TRAINING HIERARCHY

### **Level 1: Replit AI**
- Reviews this lesson
- Validates implementation
- Monitors event flow metrics

### **Level 2: Mr. Blue**
- Updates AgentEventBus event types
- Coordinates agent subscriptions
- Reports event metrics to Replit AI

### **Level 3: All Agents**
- Subscribe to relevant events
- Publish events for state changes
- Share learnings via GlobalKnowledgeBase

---

## ✅ VALIDATION CHECKLIST

Before marking this lesson as complete:

- [ ] AgentEventBus supports all 13 event types
- [ ] ValidationAgent subscribes to `code:generated`
- [ ] AutoRetryService subscribes to `validation:failed`
- [ ] EscalationService subscribes to `retry:exhausted`
- [ ] EvidenceCollector subscribes to `code:validated`
- [ ] All events include proper payload structures
- [ ] E2E test validates event flow: `tests/e2e/mb-md-validation-loop.spec.ts`

---

## 📊 SUCCESS METRICS

**This lesson succeeds when:**

1. **Event Coverage:** 100% of validation workflows publish/subscribe to events
2. **Event Flow:** ValidationAgent → AutoRetry → Escalation works end-to-end
3. **Evidence Events:** 100% of tasks publish `evidence:collected`
4. **Retry Events:** 100% of retries publish `retry:attempted`
5. **Escalation Events:** 100% of escalations publish `task:escalated`

---

**MANDATORY IMPLEMENTATION DEADLINE:** Phase A completion  
**OWNER:** Mr. Blue + EventBusAgent + ValidationAgent + RetryAgent + EscalationAgent

---

**END OF LESSON 47**
