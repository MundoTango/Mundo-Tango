# n8n Implementation Guide for Mundo Tango

## Overview
This guide documents the integration between n8n workflows and Mundo Tango, enabling Mr. Blue (AI assistant) to coordinate automation tasks through the n8n platform.

## Architecture

### Components
1. **n8n Cloud Instance**: https://boddye.app.n8n.cloud
2. **Mundo Tango Backend**: https://mundotango.life
3. **Mr. Blue**: AI assistant coordinating between systems
4. **Slack Integration**: Communication hub for notifications

### Communication Flow
```
Slack (@mention) → Mundo Tango Webhook → Mr. Blue → n8n API → Workflow Execution → Results
```

## Prerequisites

### n8n Setup
- n8n cloud account with API access
- API key generated from n8n settings
- Workspace ID: `syk1rkUErtEbe7rv`

### Mundo Tango Requirements
- Environment variables configured in Replit
- Slack webhook integration active
- Database access for workflow metadata

## API Configuration

### n8n API Endpoints

**Base URL**: `https://boddye.app.n8n.cloud/api/v1`

**Authentication**:
```
Headers:
  X-N8N-API-KEY: <your-api-key>
  Content-Type: application/json
```

**Key Endpoints**:
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows/:id/execute` - Execute workflow
- `GET /executions` - List execution history
- `GET /executions/:id` - Get execution details

### Environment Variables
Add to Replit `.env`:
```
N8N_API_KEY=your_n8n_api_key_here
N8N_BASE_URL=https://boddye.app.n8n.cloud
N8N_WORKSPACE_ID=syk1rkUErtEbe7rv
```

## Workflow Execution

### Basic Workflow Trigger
```javascript
const axios = require('axios');

async function executeN8nWorkflow(workflowId, inputData) {
  const response = await axios.post(
    `${process.env.N8N_BASE_URL}/api/v1/workflows/${workflowId}/execute`,
    {
      data: inputData
    },
    {
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}
```

### Workflow Monitoring
```javascript
async function getExecutionStatus(executionId) {
  const response = await axios.get(
    `${process.env.N8N_BASE_URL}/api/v1/executions/${executionId}`,
    {
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY
      }
    }
  );
  
  return response.data;
}
```

## Integration Patterns

### Pattern 1: Slack-Triggered Workflows
When Mr. Blue is mentioned in Slack:
1. Slack sends event to `/slack/events`
2. Mr. Blue analyzes the request
3. If n8n workflow needed, Mr. Blue triggers via API
4. Results posted back to Slack thread

### Pattern 2: Scheduled Workflows
For automated tasks:
1. n8n workflow runs on schedule
2. Webhook node calls Mundo Tango API
3. Results stored in database
4. Notification sent to Slack if needed

### Pattern 3: Event-Driven Workflows
For data changes:
1. Mundo Tango detects event (new user, event update)
2. Triggers n8n workflow via webhook
3. n8n processes data and returns
4. Mundo Tango updates database

## Mr. Blue Coordination Protocol

### Request Format
When Mr. Blue needs to execute n8n workflows:

```json
{
  "action": "execute_workflow",
  "workflow_id": "123",
  "parameters": {
    "event_name": "Argentine Tango Night",
    "date": "2025-01-15"
  },
  "callback_channel": "C123456",
  "thread_ts": "1234567890.123456"
}
```

### Response Handling
Mr. Blue should:
1. Confirm workflow execution started
2. Poll for completion if synchronous
3. Post results to Slack thread
4. Log execution details

## Common Workflows

### Workflow: Event Data Scraping
- **ID**: TBD
- **Purpose**: Scrape tango events from external sources
- **Trigger**: Manual or scheduled
- **Inputs**: `{ "source": "website_url", "date_range": "30_days" }`
- **Outputs**: Array of event objects

### Workflow: User Notification Campaign  
- **ID**: TBD
- **Purpose**: Send personalized notifications to users
- **Trigger**: API call from Mundo Tango
- **Inputs**: `{ "user_segment": "premium", "message_template": "template_id" }`
- **Outputs**: Campaign statistics

### Workflow: Data Sync
- **ID**: TBD
- **Purpose**: Sync data between systems
- **Trigger**: Scheduled (daily)
- **Inputs**: `{ "sync_type": "events|users|venues" }`
- **Outputs**: Sync report

## Error Handling

### Common Errors
1. **Authentication Failed (401)**
   - Check API key validity
   - Verify key has required permissions

2. **Workflow Not Found (404)**
   - Verify workflow ID
   - Check workflow is published

3. **Execution Failed (500)**
   - Check workflow configuration
   - Review execution logs in n8n
   - Verify input data format

### Retry Logic
```javascript
async function executeWithRetry(workflowId, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await executeN8nWorkflow(workflowId, data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

## Security Considerations

1. **API Key Protection**
   - Store in environment variables only
   - Never commit to version control
   - Rotate keys periodically

2. **Webhook Security**
   - Validate webhook signatures
   - Use HTTPS only
   - Implement rate limiting

3. **Data Privacy**
   - Sanitize user data before processing
   - Follow GDPR guidelines
   - Log access for audit trails

## Testing

### Test Workflow Execution
```bash
curl -X POST \
  https://boddye.app.n8n.cloud/api/v1/workflows/{workflow_id}/execute \
  -H 'X-N8N-API-KEY: your_api_key' \
  -H 'Content-Type: application/json' \
  -d '{"data": {"test": true}}'
```

### Test Slack Integration
1. Mention @Mr. Blue in test channel
2. Request: "Execute n8n workflow test"
3. Verify response in thread
4. Check n8n execution logs

## Monitoring & Logging

### Key Metrics
- Workflow execution count
- Success/failure rate
- Average execution time
- API response times

### Logging Points
1. Workflow trigger requests
2. API call results
3. Error messages
4. Execution durations

## Deployment Checklist

- [ ] n8n API key configured
- [ ] Environment variables set in Replit
- [ ] Webhook endpoints tested
- [ ] Slack integration verified
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Documentation updated
- [ ] Team trained on usage

## Support & Troubleshooting

### Debug Mode
Enable detailed logging:
```javascript
process.env.DEBUG_N8N = 'true';
```

### Common Issues
1. **Workflow timeouts**: Increase timeout in n8n settings
2. **Memory errors**: Optimize workflow nodes
3. **Rate limiting**: Implement exponential backoff

### Getting Help
- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Mundo Tango Issues: GitHub repository

## Future Enhancements

1. **Workflow Templates**: Pre-built workflows for common tasks
2. **Visual Dashboard**: Real-time workflow monitoring
3. **Advanced Analytics**: Detailed execution reports
4. **Workflow Marketplace**: Share workflows with community
5. **Enhanced Security**: OAuth integration
6. **Performance Optimization**: Caching and batching

## Changelog

### Version 1.0.0 (Initial)
- Basic n8n API integration
- Slack webhook coordination
- Mr. Blue command processing
- Error handling and logging

---

**Maintained by**: Mundo Tango Development Team  
**Last Updated**: 2025  
**Contact**: Via Slack #dev-team channel
