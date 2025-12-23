# N8N Troubleshooting Playbook

## Quick Reference

This playbook provides step-by-step troubleshooting procedures for common n8n workflow issues in the Mundo Tango system.

### Emergency Contacts
- **n8n Cloud Support**: support@n8n.io
- **Slack Channel**: #mr-blue-alerts
- **On-Call Engineer**: Check team roster

---

## Common Issues

### Issue 1: Webhook Not Responding

**Symptoms**:
- Webhook returns 404 or 500 errors
- No response from webhook endpoint
- Timeout errors

**Diagnostic Steps**:

1. **Verify Workflow Status**
   ```bash
   # Check if workflow is active
   use mb.md: n8n:workflow:status
   ```
   - Go to n8n Cloud dashboard
   - Confirm workflow shows "Active" status
   - Check last execution timestamp

2. **Test Webhook Endpoint**
   ```bash
   curl -X POST https://boddye.app.n8n.cloud/webhook/multi-agent \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Check Execution Logs**
   - Navigate to workflow → Executions tab
   - Look for recent failures
   - Review error messages

**Common Causes**:
- ❌ Workflow is paused/inactive
- ❌ Webhook URL changed
- ❌ n8n Cloud maintenance window
- ❌ Rate limiting reached

**Resolution Steps**:

1. **If workflow is inactive**:
   - Go to workflow settings
   - Click "Active" toggle
   - Test webhook again

2. **If URL is incorrect**:
   - Check webhook-endpoints.md for correct URL
   - Update application configuration
   - Redeploy if necessary

3. **If rate limited**:
   - Check n8n Cloud quota
   - Implement request throttling
   - Upgrade plan if needed

**Verification**:
```bash
use mb.md: n8n:webhook:test
```

---

### Issue 2: Workflow Execution Failures

**Symptoms**:
- Executions fail with errors
- Workflows stuck in "Running" state
- Partial execution completion

**Diagnostic Steps**:

1. **Check Recent Executions**
   - Open workflow in n8n Cloud
   - Click "Executions" tab
   - Identify failing step

2. **Review Error Details**
   - Click on failed execution
   - Expand error node
   - Copy error message and stack trace

3. **Verify Node Credentials**
   - Check if credentials are expired
   - Test connection for each service
   - Refresh OAuth tokens if needed

**Common Errors**:

#### Error: "Authentication Failed"
**Cause**: Expired or invalid credentials

**Resolution**:
1. Go to Credentials page in n8n Cloud
2. Find the failing credential
3. Click "Reconnect" or "Update"
4. Re-authenticate with service
5. Test workflow again

#### Error: "Timeout"
**Cause**: Node taking too long to execute

**Resolution**:
1. Increase timeout in node settings
2. Optimize query/request
3. Add retry logic
4. Split into smaller operations

#### Error: "Rate Limit Exceeded"
**Cause**: Too many requests to external API

**Resolution**:
1. Add delay between requests
2. Implement exponential backoff
3. Check API quota
4. Batch requests if possible

**Verification**:
```bash
use mb.md: n8n:execute:test
```

---

### Issue 3: Database Connection Errors

**Symptoms**:
- "Connection refused" errors
- Queries timing out
- Intermittent connection drops

**Diagnostic Steps**:

1. **Test Database Connectivity**
   ```bash
   use mb.md: n8n:database:ping
   ```

2. **Check Connection String**
   - Verify hostname/IP
   - Confirm port number
   - Validate database name
   - Test credentials

3. **Review Connection Pool**
   - Check active connections
   - Look for connection leaks
   - Verify pool size settings

**Resolution Steps**:

1. **Update Connection Credentials**:
   - Go to n8n Credentials
   - Select database credential
   - Update connection details
   - Save and test

2. **Optimize Connection Settings**:
   - Increase connection timeout
   - Adjust pool size
   - Enable connection retry
   - Add keep-alive pings

3. **Network Issues**:
   - Check firewall rules
   - Verify IP whitelist
   - Test from n8n Cloud IP
   - Contact database provider

**Verification**:
```bash
use mb.md: n8n:database:test-query
```

---

### Issue 4: Slack Notifications Not Sending

**Symptoms**:
- Messages not appearing in Slack
- "Channel not found" errors
- Silent failures

**Diagnostic Steps**:

1. **Verify Slack Integration**
   ```bash
   use mb.md: n8n:slack:status
   ```

2. **Check OAuth Token**
   - Go to Slack credential in n8n
   - Verify token is valid
   - Check token scopes

3. **Confirm Channel Access**
   - Ensure bot is invited to channel
   - Verify channel ID is correct
   - Check channel permissions

**Resolution Steps**:

1. **Refresh Slack Token**:
   - Remove existing Slack credential
   - Create new credential
   - Re-authenticate with Slack
   - Add to all channels

2. **Fix Channel Configuration**:
   - Get correct channel ID from Slack
   - Update workflow node
   - Invite bot to private channels

3. **Check Rate Limits**:
   - Review Slack API limits
   - Implement message throttling
   - Batch notifications if possible

**Verification**:
```bash
use mb.md: n8n:slack:send-test
```

---

### Issue 5: Multi-Agent Routing Failures

**Symptoms**:
- Wrong agent selected for task
- Agent routing errors
- Context detection failures

**Diagnostic Steps**:

1. **Check Context Detection**
   ```bash
   use mb.md: n8n:context:analyze
   ```

2. **Review Agent Routing Logic**
   - Check IF conditions in workflow
   - Verify agent selection criteria
   - Test with sample inputs

3. **Validate Agent Availability**
   - Confirm all agents (MB1-MB8) are accessible
   - Check agent endpoint URLs
   - Test individual agent responses

**Resolution Steps**:

1. **Fix Context Metadata**:
   - Review page metadata in application
   - Add missing context fields
   - Update context detection rules

2. **Update Routing Logic**:
   - Adjust agent selection criteria
   - Add fallback routing
   - Improve error handling

3. **Test Agent Endpoints**:
   - Verify each agent is responding
   - Check authentication
   - Update agent URLs if changed

**Verification**:
```bash
use mb.md: n8n:multi-agent:test-routing
```

---

### Issue 6: Performance Degradation

**Symptoms**:
- Workflows taking longer than usual
- Queue building up
- Execution timeouts

**Diagnostic Steps**:

1. **Check Execution Times**
   ```bash
   use mb.md: n8n:metrics:performance
   ```

2. **Review Resource Usage**
   - Check n8n Cloud plan limits
   - Monitor execution quota
   - Review concurrent execution limits

3. **Identify Bottlenecks**
   - Profile each node execution time
   - Find slowest operations
   - Look for unnecessary loops

**Resolution Steps**:

1. **Optimize Workflow**:
   - Remove unnecessary nodes
   - Cache frequent queries
   - Parallelize independent operations
   - Reduce data payload sizes

2. **Increase Resources**:
   - Upgrade n8n Cloud plan
   - Increase execution timeout
   - Add more workers if available

3. **Implement Queueing**:
   - Add queue for async processing
   - Batch similar operations
   - Implement rate limiting

**Verification**:
```bash
use mb.md: n8n:metrics:check-improvement
```

---

## Diagnostic Commands

### Health Checks
```bash
# Check all workflows
use mb.md: n8n:status:all

# Check specific workflow
use mb.md: n8n:workflow:<workflow-id>:health

# Test all webhooks
use mb.md: n8n:webhooks:test-all

# Check credentials
use mb.md: n8n:credentials:verify
```

### Execution Management
```bash
# View recent errors
use mb.md: n8n:errors:recent:10

# Retry failed execution
use mb.md: n8n:execution:<id>:retry

# Clear execution queue
use mb.md: n8n:queue:clear

# Get execution details
use mb.md: n8n:execution:<id>:details
```

### Monitoring
```bash
# Get performance metrics
use mb.md: n8n:metrics:summary

# Check execution count
use mb.md: n8n:metrics:execution-count

# View active executions
use mb.md: n8n:executions:active

# Get error rate
use mb.md: n8n:metrics:error-rate
```

---

## Emergency Procedures

### Procedure 1: Complete System Outage

**If all workflows are down**:

1. **Immediate Actions**:
   - Check n8n Cloud status page
   - Post alert in #mr-blue-alerts
   - Notify on-call engineer

2. **Investigation**:
   - Review n8n Cloud dashboard
   - Check for maintenance announcements
   - Test webhook endpoints manually
   - Review recent changes

3. **Mitigation**:
   - Enable failover workflows if available
   - Switch to backup n8n instance
   - Implement manual processes temporarily
   - Contact n8n support

4. **Recovery**:
   - Wait for n8n Cloud restoration
   - Verify all workflows active
   - Test critical paths
   - Monitor for continued issues

### Procedure 2: Data Loss Risk

**If executions are failing with data errors**:

1. **Stop Processing**:
   - Pause affected workflows immediately
   - Prevent further data corruption

2. **Assess Impact**:
   - Identify affected records
   - Determine data integrity status
   - Check backup availability

3. **Restore**:
   - Restore from latest backup if needed
   - Replay failed transactions
   - Verify data consistency

4. **Resume**:
   - Fix root cause
   - Reactivate workflows
   - Monitor closely

### Procedure 3: Security Incident

**If unauthorized access suspected**:

1. **Immediate Response**:
   - Deactivate all workflows
   - Rotate all credentials
   - Change webhook URLs
   - Review access logs

2. **Investigation**:
   - Check execution history for anomalies
   - Review credential usage
   - Analyze webhook calls
   - Document findings

3. **Remediation**:
   - Implement webhook signature validation
   - Enable IP restrictions
   - Add rate limiting
   - Update security documentation

---

## Escalation Matrix

### Level 1: Self-Service (0-15 minutes)
- Check this playbook
- Review monitoring dashboard
- Test basic connectivity
- Check n8n Cloud status

### Level 2: Team Support (15-30 minutes)
- Post in #mr-blue-alerts
- Tag relevant team members
- Share diagnostic results
- Collaborate on solution

### Level 3: On-Call Engineer (30-60 minutes)
- Page on-call engineer
- Provide incident details
- Grant necessary access
- Implement emergency fixes

### Level 4: n8n Support (60+ minutes)
- Open support ticket
- Provide workflow exports
- Share error logs
- Request urgent assistance

---

## Prevention Best Practices

### Regular Maintenance
- Review execution logs weekly
- Update credentials before expiration
- Test backup workflows monthly
- Optimize slow workflows quarterly

### Monitoring
- Set up alerts for failures
- Monitor execution metrics
- Track error trends
- Review performance baselines

### Documentation
- Document all workflow changes
- Update runbooks as needed
- Share lessons learned
- Maintain change log

### Testing
- Test workflows after changes
- Validate in staging first
- Use test webhooks
- Verify rollback procedures

---

## Related Documentation
- [N8N Monitoring Guide](../operations/n8n-monitoring.md)
- [N8N Implementation Guide](../n8n/n8n-implementation-guide.md)
- [Workflow Templates](../n8n/workflow-templates.md)
- [Connection Guide](../n8n/connection-guide.md)
- [Webhook Endpoints](../n8n/webhook-endpoints.md)

---

**Last Updated**: December 21, 2024
**Document Owner**: Mr. Blue Operations Team
**Review Frequency**: Monthly
**Emergency Contact**: #mr-blue-alerts Slack channel
