# n8n Workflow Examples & Testing Guide

## Overview
This document provides practical examples for creating and testing n8n workflows integrated with Mundo Tango, following Mr. Blue's coordination protocol.

## Phase 4 Deliverable
Complete workflow examples and integration testing documentation.

## Prerequisites
- n8n Cloud account access: https://boddye.app.n8n.cloud
- API key configured in Replit environment
- Slack workspace with Mr. Blue bot installed
- Understanding of n8n-implementation-guide.md

## Example Workflows

### 1. Event Scraping Workflow
**Purpose**: Scrape tango events from external websites  
**Workflow ID**: `workflow_event_scraping`  
**Trigger**: Slack command "scrape events"

**n8n Workflow Configuration**:
```json
{
  "name": "Event Scraping Workflow",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger",
      "parameters": {
        "path": "event-scraping",
        "httpMethod": "POST"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Scrape Website",
      "parameters": {
        "url": "={{$json.data.source_url}}",
        "method": "GET"
      }
    },
    {
      "type": "n8n-nodes-base.code",
      "name": "Parse Events",
      "parameters": {
        "jsCode": "// Parse HTML and extract events"
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Save to Database",
      "parameters": {
        "operation": "insert",
        "table": "events"
      }
    }
  ]
}
```

**Test Command** (in Slack):
```
@Mr. Blue scrape events from tangotravel.com
```

**Expected Behavior**:
1. Slack webhook receives mention
2. Pattern matched: `/scrape\\s+events?/i`
3. n8nClient.executeWorkflow() called with `workflow_event_scraping`
4. Workflow executes asynchronously
5. Events saved to database
6. Confirmation posted to Slack thread

---

### 2. User Notifications Workflow
**Purpose**: Send targeted notifications to user segments  
**Workflow ID**: `workflow_notifications`  
**Trigger**: Slack command "send notifications"

**n8n Workflow Configuration**:
```json
{
  "name": "User Notifications",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger"
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Get Users",
      "parameters": {
        "operation": "select",
        "table": "users",
        "where": "segment = '{{$json.data.segment}}'"
      }
    },
    {
      "type": "n8n-nodes-base.splitInBatches",
      "name": "Batch Process"
    },
    {
      "type": "n8n-nodes-base.sendEmail",
      "name": "Send Email"
    }
  ]
}
```

**Test Command**:
```
@Mr. Blue send notifications to premium users
```

---

### 3. Data Sync Workflow
**Purpose**: Synchronize data between systems  
**Workflow ID**: `workflow_data_sync`  
**Trigger**: Slack command "sync data" or scheduled

**Test Command**:
```
@Mr. Blue sync data from production
```

---

## Testing Procedures

### Unit Testing

#### Test n8n Client
```typescript
// __tests__/n8nClient.test.ts
import { n8nClient } from '../server/services/n8nClient';

describe('n8nClient', () => {
  test('should execute workflow successfully', async () => {
    const result = await n8nClient.executeWorkflow({
      workflowId: 'test_workflow',
      data: { test: true }
    });
    
    expect(result.id).toBeDefined();
    expect(result.status).toBe('running');
  });

  test('should handle errors gracefully', async () => {
    await expect(
      n8nClient.executeWorkflow({
        workflowId: 'invalid_workflow',
        data: {}
      })
    ).rejects.toThrow();
  });

  test('should check health', async () => {
    const health = await n8nClient.checkHealth();
    expect(health.ok).toBe(true);
  });
});
```

#### Test Slack Integration
```typescript
// __tests__/slack-webhook.test.ts
import request from 'supertest';
import app from '../server';

describe('Slack Webhook', () => {
  test('should trigger n8n workflow on scrape command', async () => {
    const response = await request(app)
      .post('/slack/events')
      .send({
        type: 'event_callback',
        event: {
          type: 'app_mention',
          text: '@Mr. Blue scrape events',
          user: 'U123',
          channel: 'C456',
          ts: '1234567890.123'
        }
      });
    
    expect(response.status).toBe(200);
  });
});
```

### Integration Testing

#### End-to-End Test Flow
1. **Setup**:
   ```bash
   # Set environment variables
   export N8N_API_KEY="your_test_api_key"
   export N8N_BASE_URL="https://boddye.app.n8n.cloud"
   ```

2. **Test Workflow Execution**:
   ```bash
   # Manual test via curl
   curl -X POST https://mundotango.life/slack/events \
     -H "Content-Type: application/json" \
     -d '{
       "type": "event_callback",
       "event": {
         "type": "app_mention",
         "text": "@Mr. Blue execute workflow test",
         "user": "U123",
         "channel": "C456"
       }
     }'
   ```

3. **Verify in n8n**:
   - Open https://boddye.app.n8n.cloud
   - Navigate to "Executions"
   - Confirm workflow execution appears
   - Check execution status and logs

4. **Verify in Slack**:
   - Check bot responses in Slack channel
   - Confirm workflow status updates

### Manual Testing Checklist

- [ ] **Health Check**: Verify n8n API connectivity
  ```bash
  npm run test:n8n-health
  ```

- [ ] **Workflow List**: Retrieve available workflows
  ```bash
  npm run test:list-workflows
  ```

- [ ] **Execute Test Workflow**: Run a simple test workflow
  ```bash
  npm run test:execute-workflow
  ```

- [ ] **Slack Integration**: Test Slack webhook endpoint
  ```bash
  npm run test:slack-webhook
  ```

- [ ] **Error Handling**: Test invalid workflow IDs
- [ ] **Retry Logic**: Test retry mechanism with temporary failures
- [ ] **Timeout Handling**: Test long-running workflows

### Performance Testing

#### Load Test
```javascript
// Test concurrent workflow executions
const loadTest = async () => {
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      n8nClient.executeWorkflow({
        workflowId: 'test_workflow',
        data: { iteration: i }
      })
    );
  }
  const results = await Promise.all(promises);
  console.log(`Executed ${results.length} workflows successfully`);
};
```

## Debugging

### Enable Debug Logging
```typescript
// Set in environment
process.env.DEBUG_N8N = 'true';

// Logs will show:
// [n8n] POST /workflows/123/execute
// [n8n] Workflow execution started: exec_456
// [n8n] Execution exec_456 completed with status: success
```

### Common Issues

#### Issue 1: "N8N_API_KEY environment variable is required"
**Solution**: Add API key to Replit secrets or .env file

#### Issue 2: "Workflow not found in n8n"
**Solution**: Verify workflow ID in n8n dashboard, ensure workflow is published

#### Issue 3: "Workflow execution timed out"
**Solution**: 
- Increase timeout parameter in executeWorkflow()
- Check n8n workflow for performance issues
- Use `waitForCompletion: false` for long-running workflows

#### Issue 4: "n8n API rate limit exceeded"
**Solution**: Implement exponential backoff using executeWithRetry()

## Deployment Verification

### Pre-Deployment Checklist
- [ ] All environment variables configured in Replit
- [ ] n8n API key valid and has required permissions
- [ ] Slack webhook endpoint accessible
- [ ] Database connections working
- [ ] All tests passing

### Post-Deployment Verification
1. **Check Logs**: Monitor Replit console for errors
2. **Test Health Endpoint**: Verify n8n connectivity
3. **Execute Test Workflow**: Run end-to-end test
4. **Monitor Executions**: Watch n8n dashboard for activity
5. **Verify Slack Integration**: Test Mr. Blue responses

## Monitoring

### Key Metrics to Track
- Workflow execution count (per hour/day)
- Success/failure rate
- Average execution time
- API response times
- Error rates by type

### Logging Best Practices
```typescript
// Always log workflow triggers
console.log(`[n8n] Detected trigger for ${workflowId}`);

// Log execution results
console.log(`[n8n] Workflow ${workflowId} completed in ${duration}ms`);

// Log errors with context
console.error(`[n8n] Execution failed:`, {
  workflowId,
  error: error.message,
  userId,
  channel
});
```

## Next Steps

### Phase 5: Deployment
1. Configure environment variables in Replit
2. Deploy to production
3. Verify end-to-end functionality
4. Monitor for 24 hours
5. Document any issues

### Future Enhancements
- Add more workflow examples
- Implement workflow templates in n8n
- Create visual workflow builder UI
- Add workflow scheduling interface
- Implement advanced error recovery
- Create workflow analytics dashboard

## Support Resources

- n8n Documentation: https://docs.n8n.io
- Mundo Tango n8n Guide: `/n8n-implementation-guide.md`
- Mr. Blue Coordination: `/mr-blue-brain/n8n-coordinator.md`
- GitHub Issues: Submit bugs and feature requests

---

**Last Updated**: Phase 4 - December 2025  
**Maintained by**: Mundo Tango Development Team  
**Status**: ✅ Ready for Phase 5 Deployment
