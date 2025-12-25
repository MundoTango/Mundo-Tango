# N8N Workflow Monitoring Guide

## Overview
This guide provides comprehensive monitoring procedures for all n8n workflows in the Mundo Tango system. These workflows orchestrate critical operations between Mr. Blue and the Mundo Tango platform.

## Active Workflows (5)

### 1. Multi-Agent Orchestration Webhook
**Purpose**: Coordinates multiple AI agents (MB1-MB8) for complex tasks

**Monitoring Points**:
- Webhook endpoint: `https://boddye.app.n8n.cloud/webhook/multi-agent`
- Expected response time: < 2 seconds
- Agent routing accuracy: 100%

**Key Metrics**:
- Total requests per hour
- Agent distribution (MB1-MB8 usage)
- Failed routing attempts
- Average response latency

**Alerts**:
- 🔴 Critical: Webhook returns 5xx errors
- 🟡 Warning: Response time > 5 seconds
- 🟡 Warning: Agent routing failures > 5%

**Health Check**:
```bash
use mb.md: n8n:multi-agent:health
```

**Troubleshooting**:
- Check agent availability in n8n Cloud
- Verify webhook signature validation
- Review agent context detection accuracy

---

### 2. Database Query Executor
**Purpose**: Executes database operations via n8n workflows

**Monitoring Points**:
- Query execution success rate
- Database connection pool status
- Query performance metrics

**Key Metrics**:
- Queries per minute
- Average query execution time
- Failed query count
- Connection timeout errors

**Alerts**:
- 🔴 Critical: Database connection failures
- 🔴 Critical: Query timeout > 30 seconds
- 🟡 Warning: Slow queries (> 5 seconds)

**Health Check**:
```bash
use mb.md: n8n:database:status
```

**Troubleshooting**:
- Verify database credentials in n8n Cloud
- Check connection string configuration
- Review query optimization opportunities

---

### 3. Slack Notification Integration
**Purpose**: Sends automated notifications to Slack channels

**Monitoring Points**:
- Message delivery success rate
- Channel accessibility
- Rate limiting status

**Key Metrics**:
- Messages sent per hour
- Failed deliveries
- Average delivery latency
- Rate limit hits

**Alerts**:
- 🔴 Critical: Slack API authentication failure
- 🟡 Warning: Delivery failures > 10%
- 🟡 Warning: Rate limit approached (80%)

**Channels Monitored**:
- `#all-mundo-tango` - General updates
- `#mr-blue-alerts` - Agent notifications
- `#system-monitoring` - Infrastructure alerts

**Health Check**:
```bash
use mb.md: n8n:slack:test
```

**Troubleshooting**:
- Refresh Slack OAuth token
- Verify channel permissions
- Check rate limit quotas

---

### 4. Email Processing Workflow
**Purpose**: Processes incoming emails and triggers appropriate actions

**Monitoring Points**:
- Email polling frequency
- Processing success rate
- Action trigger accuracy

**Key Metrics**:
- Emails processed per hour
- Processing failures
- Average processing time
- Unhandled email count

**Alerts**:
- 🔴 Critical: Email connection lost > 5 minutes
- 🟡 Warning: Unprocessed emails > 50
- 🟡 Warning: Processing errors > 5%

**Health Check**:
```bash
use mb.md: n8n:email:status
```

**Troubleshooting**:
- Verify IMAP/SMTP credentials
- Check email filter rules
- Review processing logic errors

---

### 5. API Integration Hub
**Purpose**: Central hub for external API integrations

**Monitoring Points**:
- API endpoint availability
- Authentication status
- Rate limit management

**Key Metrics**:
- API calls per endpoint
- Success/failure rates by endpoint
- Average response times
- Token refresh events

**Alerts**:
- 🔴 Critical: API authentication expired
- 🔴 Critical: Endpoint unreachable > 5 minutes
- 🟡 Warning: Rate limits exceeded

**Health Check**:
```bash
use mb.md: n8n:api-hub:health
```

**Troubleshooting**:
- Refresh API credentials
- Check endpoint URLs
- Review rate limit configurations

---

## Inactive Workflows (3)

### 6. AI Agent Workflow (Inactive)
**Status**: Disabled - Replaced by Multi-Agent Orchestration
**Reason**: Consolidated into workflow #1 for better efficiency
**Action**: Archive after 30 days if no issues

### 7. Faceless Video Marketing Publisher (Inactive)
**Status**: Disabled - Project paused
**Reason**: Marketing strategy changed
**Action**: Keep for potential future use

### 8. Zoom Meeting Recorder Automation (Inactive)
**Status**: Disabled - Not currently needed
**Reason**: Manual recording preferred
**Action**: Can be re-enabled on demand

---

## Monitoring Dashboard

### n8n Cloud Dashboard
Access: https://boddye.app.n8n.cloud/projects/syk1rkUErtEbe7rv/workflows

**Key Views**:
- Workflow execution history
- Error logs and stack traces
- Performance metrics
- Credential status

### Daily Monitoring Checklist

**Morning Check (9:00 AM)**:
- [ ] Verify all 5 active workflows are running
- [ ] Check overnight execution logs for errors
- [ ] Review Slack notifications for alerts
- [ ] Confirm webhook endpoints responding

**Afternoon Check (2:00 PM)**:
- [ ] Review performance metrics
- [ ] Check rate limit status
- [ ] Verify database connectivity
- [ ] Test critical workflow paths

**Evening Check (6:00 PM)**:
- [ ] Review daily execution summary
- [ ] Check for any failed executions
- [ ] Verify all alerts addressed
- [ ] Prepare overnight monitoring

---

## Performance Baselines

### Response Time Targets
- Webhook responses: < 2 seconds (p95)
- Database queries: < 1 second (p95)
- Slack notifications: < 5 seconds (p95)
- Email processing: < 10 seconds (p95)
- API calls: < 3 seconds (p95)

### Throughput Targets
- Multi-agent requests: 100/hour
- Database queries: 500/hour
- Slack messages: 50/hour
- Emails processed: 20/hour
- API calls: 200/hour

### Error Rate Targets
- All workflows: < 1% error rate
- Critical workflows: < 0.1% error rate

---

## Incident Response

### Severity Levels

**P0 - Critical (Response: Immediate)**
- All active workflows down
- Data loss occurring
- Security breach detected

**P1 - High (Response: < 1 hour)**
- Single critical workflow down
- Major functionality impaired
- High error rates (> 10%)

**P2 - Medium (Response: < 4 hours)**
- Performance degradation
- Non-critical errors
- Monitoring gaps

**P3 - Low (Response: Next business day)**
- Minor issues
- Optimization opportunities
- Documentation updates

### Escalation Path
1. Check n8n Cloud status page
2. Review workflow execution logs
3. Test webhook endpoints manually
4. Contact n8n support if platform issue
5. Notify team in #mr-blue-alerts

---

## Maintenance Windows

### Weekly Maintenance (Sundays 2:00-4:00 AM PST)
- Review and archive old execution logs
- Update workflow credentials
- Test disaster recovery procedures
- Apply workflow optimizations

### Monthly Maintenance (First Sunday)
- Full system health check
- Performance baseline review
- Security audit
- Documentation updates

---

## Integration with Mr. Blue

All workflows can be monitored and controlled through Mr. Blue using the mb.md invocation patterns:

```bash
# Check all workflow statuses
use mb.md: n8n:status:all

# Get specific workflow details
use mb.md: n8n:workflow:<workflow-id>

# Trigger manual execution
use mb.md: n8n:execute:<workflow-name>

# View recent errors
use mb.md: n8n:errors:recent

# Get performance metrics
use mb.md: n8n:metrics:summary
```

---

## Logging and Analytics

### Log Retention
- Execution logs: 30 days
- Error logs: 90 days
- Performance metrics: 1 year
- Audit logs: 2 years

### Key Log Locations
- n8n Cloud: Execution history tab
- Slack: #system-monitoring channel
- Application logs: Replit console

---

## Related Documentation
- [N8N Implementation Guide](../n8n/n8n-implementation-guide.md)
- [Workflow Templates](../n8n/workflow-templates.md)
- [Connection Guide](../n8n/connection-guide.md)
- [Webhook Endpoints](../n8n/webhook-endpoints.md)
- [Troubleshooting Playbook](../playbooks/n8n-troubleshooting.md)

---

**Last Updated**: December 21, 2024
**Document Owner**: Mr. Blue Operations Team
**Review Frequency**: Monthly
