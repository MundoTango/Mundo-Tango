# Mr. Blue n8n Coordination Guide

## Purpose
This document defines how Mr. Blue coordinates with n8n workflows to automate tasks and processes within the Mundo Tango ecosystem.

## Overview
Mr. Blue acts as the intelligent coordinator between Slack conversations and n8n workflow executions. When users request automated tasks via Slack, Mr. Blue interprets the intent, selects appropriate workflows, and manages the execution lifecycle.

## Core Responsibilities

### 1. Request Interpretation
- Parse natural language requests from Slack
- Identify automation opportunities
- Determine appropriate n8n workflow to execute
- Extract parameters from conversation context

### 2. Workflow Selection
Mr. Blue maintains awareness of available workflows and their capabilities:

```javascript
const workflowRegistry = {
  'event-scraping': {
    id: 'workflow_123',
    description: 'Scrape tango events from external sources',
    requiredParams: ['source_url', 'date_range'],
    optionalParams: ['city', 'event_type']
  },
  'user-notifications': {
    id: 'workflow_456',
    description: 'Send targeted notifications to user segments',
    requiredParams: ['segment', 'message_template'],
    optionalParams: ['schedule_time']
  },
  'data-sync': {
    id: 'workflow_789',
    description: 'Sync data between systems',
    requiredParams: ['sync_type'],
    optionalParams: ['force_update']
  }
};
```

### 3. Execution Management
- Trigger workflows via n8n API
- Monitor execution status
- Handle errors and retries
- Report results back to Slack

### 4. Context Maintenance
- Track ongoing workflow executions
- Link executions to Slack threads
- Maintain conversation history for follow-ups

## Workflow Execution Protocol

### Step 1: User Request Detection
When Mr. Blue receives a Slack mention:

```javascript
// Slack event received at /slack/events
{
  "type": "app_mention",
  "user": "U123456",
  "text": "@Mr. Blue please scrape events from tangotravel.com for next month",
  "channel": "C789012",
  "thread_ts": "1234567890.123456"
}
```

### Step 2: Intent Analysis
Mr. Blue analyzes the request:

```javascript
const intent = {
  action: 'scrape_events',
  workflow: 'event-scraping',
  parameters: {
    source_url: 'tangotravel.com',
    date_range: '30_days',
    requested_by: 'U123456'
  },
  context: {
    channel: 'C789012',
    thread_ts: '1234567890.123456'
  }
};
```

### Step 3: Workflow Execution
Mr. Blue triggers the workflow:

```javascript
const n8nClient = require('./services/n8nClient');

async function executeWorkflow(intent) {
  try {
    // Post initial confirmation
    await slackClient.postMessage({
      channel: intent.context.channel,
      thread_ts: intent.context.thread_ts,
      text: '🔄 Starting event scraping workflow...'
    });

    // Trigger n8n workflow
    const execution = await n8nClient.executeWorkflow(
      intent.workflow,
      intent.parameters
    );

    // Monitor execution
    const result = await n8nClient.waitForCompletion(execution.id);

    // Post results
    await slackClient.postMessage({
      channel: intent.context.channel,
      thread_ts: intent.context.thread_ts,
      text: formatResults(result)
    });

  } catch (error) {
    await slackClient.postMessage({
      channel: intent.context.channel,
      thread_ts: intent.context.thread_ts,
      text: `❌ Workflow failed: ${error.message}`
    });
  }
}
```

### Step 4: Result Reporting
Format and present results to user:

```javascript
function formatResults(result) {
  if (result.status === 'success') {
    return `✅ Workflow completed successfully!
    
📊 Results:
- Events found: ${result.data.eventsCount}
- New events: ${result.data.newEvents}
- Updated events: ${result.data.updatedEvents}

View details: ${result.data.reportUrl}`;
  } else {
    return `⚠️ Workflow completed with warnings:
${result.warnings.join('\n')}`;
  }
}
```

## Communication Patterns

### Pattern A: Simple Request-Response
```
User: @Mr. Blue run the daily data sync
Mr. Blue: 🔄 Starting data sync workflow...
[waits for completion]
Mr. Blue: ✅ Data sync completed! 150 records updated.
```

### Pattern B: Interactive Parameter Collection
```
User: @Mr. Blue scrape events
Mr. Blue: I can help with that! Which website should I scrape?
User: tangotravel.com
Mr. Blue: Great! What date range? (e.g., "next week", "next month")
User: next 2 weeks
Mr. Blue: 🔄 Starting event scraping from tangotravel.com for next 2 weeks...
```

### Pattern C: Scheduled Execution
```
User: @Mr. Blue schedule event scraping every Monday at 9am
Mr. Blue: ✅ I've configured the event-scraping workflow to run:
- Frequency: Weekly
- Day: Monday
- Time: 9:00 AM UTC
- Workflow ID: workflow_123

I'll notify you in this thread after each execution.
```

### Pattern D: Status Checking
```
User: @Mr. Blue what's the status of the scraping job?
Mr. Blue: The event-scraping workflow is currently running:
- Started: 5 minutes ago
- Progress: Processing page 3/10
- Expected completion: ~3 minutes

I'll notify you when it's done!
```

## Error Handling

### Scenario 1: Missing Parameters
```javascript
if (!hasRequiredParams(intent)) {
  await slackClient.postMessage({
    channel: intent.context.channel,
    thread_ts: intent.context.thread_ts,
    text: `I need some additional information:
${getMissingParams(intent).map(p => `- ${p}`).join('\n')}

Please provide these details and I'll start the workflow.`
  });
  return;
}
```

### Scenario 2: Workflow Failure
```javascript
catch (error) {
  const errorMessage = analyzeError(error);
  
  await slackClient.postMessage({
    channel: intent.context.channel,
    thread_ts: intent.context.thread_ts,
    text: `❌ Workflow encountered an error:

**Error**: ${errorMessage.type}
**Details**: ${errorMessage.description}

**Next steps**:
${errorMessage.suggestedActions.map(a => `- ${a}`).join('\n')}

Would you like me to retry?`
  });
}
```

### Scenario 3: Timeout
```javascript
const TIMEOUT_MS = 300000; // 5 minutes

try {
  const result = await Promise.race([
    n8nClient.waitForCompletion(execution.id),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    )
  ]);
} catch (error) {
  if (error.message === 'Timeout') {
    await slackClient.postMessage({
      text: `⏱️ Workflow is taking longer than expected (>5 min).
      
It's still running in the background. I'll notify you when it completes.

You can check status anytime by asking "what's the status of workflow ${execution.id}?"`
    });
  }
}
```

## Security & Validation

### Input Validation
```javascript
function validateWorkflowParams(workflow, params) {
  const schema = workflowSchemas[workflow];
  
  // Check required params
  for (const required of schema.required) {
    if (!params[required]) {
      throw new ValidationError(`Missing required parameter: ${required}`);
    }
  }
  
  // Validate param types
  for (const [key, value] of Object.entries(params)) {
    if (!schema.properties[key]) {
      throw new ValidationError(`Unknown parameter: ${key}`);
    }
    
    const expectedType = schema.properties[key].type;
    if (typeof value !== expectedType) {
      throw new ValidationError(
        `Parameter ${key} must be ${expectedType}, got ${typeof value}`
      );
    }
  }
  
  return true;
}
```

### Authorization
```javascript
async function checkUserPermissions(userId, workflow) {
  const userRole = await db.getUserRole(userId);
  const workflowPermissions = workflowRegistry[workflow].permissions;
  
  if (!workflowPermissions.includes(userRole)) {
    throw new AuthorizationError(
      `User role ${userRole} is not authorized to execute ${workflow}`
    );
  }
}
```

## Monitoring & Logging

### Execution Logging
```javascript
const executionLog = {
  id: generateId(),
  workflow_id: workflow,
  triggered_by: userId,
  triggered_at: new Date().toISOString(),
  parameters: params,
  status: 'pending',
  channel: context.channel,
  thread_ts: context.thread_ts
};

// Save to database
await db.logExecution(executionLog);

// Update on completion
await db.updateExecution(executionLog.id, {
  status: result.status,
  completed_at: new Date().toISOString(),
  result_data: result.data
});
```

### Performance Metrics
Track and analyze:
- Average execution time per workflow
- Success/failure rates
- Most frequently requested workflows
- Peak usage times
- User satisfaction (based on feedback)

## Advanced Features

### Workflow Chaining
Execute multiple workflows in sequence:

```javascript
User: @Mr. Blue scrape events then send notifications
Mr. Blue: I'll run two workflows:
1. event-scraping
2. user-notifications

Starting now...

🔄 Step 1/2: Scraping events...
✅ Found 25 new events

🔄 Step 2/2: Sending notifications to premium users...
✅ Notifications sent to 150 users

All done!
```

### Conditional Execution
```javascript
if (result.data.newEvents > 10) {
  await executeWorkflow('user-notifications', {
    segment: 'premium',
    message_template: 'new_events_alert'
  });
}
```

### Batch Processing
```javascript
const sources = ['site1.com', 'site2.com', 'site3.com'];

for (const source of sources) {
  await executeWorkflow('event-scraping', {
    source_url: source,
    date_range: '30_days'
  });
}
```

## Testing

### Mock Workflow Execution
```javascript
// In development/test environments
if (process.env.NODE_ENV !== 'production') {
  return {
    id: 'mock_execution_123',
    status: 'success',
    data: {
      eventsCount: 42,
      newEvents: 15,
      updatedEvents: 5
    }
  };
}
```

### Test Commands
```
@Mr. Blue test workflow event-scraping
@Mr. Blue dry-run data-sync
@Mr. Blue validate workflow-config
```

## Troubleshooting Guide

### Issue: Workflow not starting
**Symptoms**: User request acknowledged but no workflow execution
**Diagnosis**:
1. Check n8n API connectivity
2. Verify workflow ID exists
3. Check n8n API key validity

**Resolution**:
```javascript
const health = await n8nClient.checkHealth();
if (!health.ok) {
  logger.error('n8n API unreachable', health);
  // Alert admin
}
```

### Issue: Results not posting to Slack
**Symptoms**: Workflow completes but no Slack update
**Diagnosis**:
1. Check Slack token validity
2. Verify bot has channel permissions
3. Check thread_ts is valid

**Resolution**: Retry posting with exponential backoff

### Issue: Parameters not extracted correctly
**Symptoms**: Workflow fails due to invalid parameters
**Diagnosis**: Review intent analysis logs

**Resolution**: Improve NLP parameter extraction or add clarifying questions

## Integration Points

### Database Schema
```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_name VARCHAR(255),
  triggered_by VARCHAR(50),
  triggered_at TIMESTAMP,
  parameters JSONB,
  status VARCHAR(50),
  result_data JSONB,
  slack_channel VARCHAR(50),
  slack_thread_ts VARCHAR(50),
  completed_at TIMESTAMP,
  error_message TEXT
);
```

### API Endpoints
Mr. Blue exposes endpoints for n8n callbacks:

```
POST /api/n8n/webhook/completion
POST /api/n8n/webhook/progress
POST /api/n8n/webhook/error
```

## Best Practices

1. **Always confirm before execution**: Give users a chance to review parameters
2. **Provide clear status updates**: Keep users informed of progress
3. **Handle errors gracefully**: Provide actionable error messages
4. **Log everything**: Essential for debugging and analytics
5. **Validate inputs**: Never trust user input without validation
6. **Timeout long-running workflows**: Don't block indefinitely
7. **Use thread conversations**: Keep related messages together
8. **Be conversational**: Natural language responses enhance UX

## Future Enhancements

1. **Visual workflow builder integration**: Allow users to create workflows via Slack
2. **Approval workflows**: Require admin approval for sensitive operations
3. **Workflow templates**: Common patterns users can invoke by name
4. **AI-powered parameter suggestion**: Smart defaults based on context
5. **Multi-language support**: Interpret requests in multiple languages
6. **Voice integration**: Execute workflows via voice commands

---

**Last Updated**: 2025  
**Maintained by**: Mr. Blue Development Team  
**Related Docs**: 
- `/n8n-implementation-guide.md` - Overall n8n integration
- `mr-blue-brain/playbooks/` - Specific workflow playbooks
- `mr-blue-brain/operations/` - Operational procedures
