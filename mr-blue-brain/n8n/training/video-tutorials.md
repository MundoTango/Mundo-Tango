# N8N Video Tutorials & Training Materials

## Overview
This document catalogs all video tutorials and training materials for the Mundo Tango n8n integration. These resources help team members understand and work with n8n workflows effectively.

---

## Tutorial Series

### Series 1: Getting Started with N8N (For Beginners)

#### Video 1.1: Introduction to N8N Cloud
**Duration**: 10 minutes  
**Topics Covered**:
- What is n8n and why we use it
- Mundo Tango's n8n Cloud setup
- Navigating the n8n dashboard
- Understanding workflows vs. executions

**Key Takeaways**:
- Access URL: https://boddye.app.n8n.cloud
- Difference between active and inactive workflows
- Where to find execution logs
- How to monitor workflow health

**Practical Exercise**:
- Log into n8n Cloud
- Explore the 8 existing workflows
- View execution history for one workflow
- Identify active vs. inactive workflows

---

#### Video 1.2: Workflow Anatomy
**Duration**: 15 minutes  
**Topics Covered**:
- Nodes: triggers, actions, and logic
- Data flow between nodes
- Credentials and authentication
- Testing and debugging workflows

**Key Takeaways**:
- Every workflow starts with a trigger
- Data passes between nodes sequentially
- Credentials are stored securely
- Test mode vs. production execution

**Practical Exercise**:
- Open the Multi-Agent Orchestration workflow
- Identify the trigger node
- Trace data flow through 3 nodes
- Test a single node execution

---

#### Video 1.3: Understanding Webhooks
**Duration**: 12 minutes  
**Topics Covered**:
- What are webhooks?
- Webhook URLs in Mundo Tango
- Webhook security and signatures
- Testing webhooks locally

**Key Takeaways**:
- Webhooks allow external systems to trigger workflows
- Each webhook has a unique URL
- Always use webhook signatures for security
- Use test webhooks for development

**Practical Exercise**:
- Find webhook URL in workflow
- Copy URL from webhook-endpoints.md
- Test webhook using curl command
- Review execution in n8n dashboard

```bash
curl -X POST https://boddye.app.n8n.cloud/webhook/multi-agent \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "user": "training"}'
```

---

### Series 2: Working with Mundo Tango Workflows (Intermediate)

#### Video 2.1: Multi-Agent Orchestration Deep Dive
**Duration**: 20 minutes  
**Topics Covered**:
- Agent routing logic (MB1-MB8)
- Context detection mechanisms
- Error handling and fallbacks
- Performance optimization

**Key Takeaways**:
- How agents are selected based on context
- Role of each agent (MB1-MB8)
- What happens when routing fails
- Monitoring agent distribution

**Practical Exercise**:
- Trigger workflow with different contexts
- Observe which agent gets selected
- Review routing decision logs
- Test fallback behavior

---

#### Video 2.2: Database Integration Workflow
**Duration**: 18 minutes  
**Topics Covered**:
- Database connection setup
- Query execution and error handling
- Data transformation
- Performance considerations

**Key Takeaways**:
- Database credentials configuration
- SQL query best practices
- How to handle connection failures
- Query timeout settings

**Practical Exercise**:
- Review database credential setup
- Execute a test query
- Handle a simulated connection error
- Optimize a slow query

---

#### Video 2.3: Slack Notifications Workflow
**Duration**: 15 minutes  
**Topics Covered**:
- Slack app configuration
- Channel management
- Message formatting
- Rate limiting

**Key Takeaways**:
- OAuth token setup and refresh
- Sending to multiple channels
- Rich message formatting with blocks
- Avoiding rate limits

**Practical Exercise**:
- Send test message to #all-mundo-tango
- Format message with attachments
- Handle channel not found error
- Check rate limit status

---

### Series 3: Advanced Topics (Advanced)

#### Video 3.1: Workflow Performance Optimization
**Duration**: 25 minutes  
**Topics Covered**:
- Identifying bottlenecks
- Parallel execution strategies
- Caching techniques
- Resource management

**Key Takeaways**:
- Use execution timeline to find slow nodes
- Parallelize independent operations
- Cache frequently accessed data
- Monitor execution quota usage

**Practical Exercise**:
- Profile a slow workflow
- Implement parallel execution
- Add caching to reduce API calls
- Measure performance improvement

---

#### Video 3.2: Error Handling and Recovery
**Duration**: 20 minutes  
**Topics Covered**:
- Error node configuration
- Retry strategies
- Fallback workflows
- Alert notifications

**Key Takeaways**:
- Catch errors before they fail workflow
- Implement exponential backoff
- Create backup execution paths
- Alert team when critical errors occur

**Practical Exercise**:
- Add error handling to existing workflow
- Configure retry logic
- Test error scenarios
- Verify alert notifications

---

#### Video 3.3: Webhook Security Best Practices
**Duration**: 18 minutes  
**Topics Covered**:
- Signature verification
- IP whitelisting
- Rate limiting
- Audit logging

**Key Takeaways**:
- Always verify webhook signatures
- Restrict webhook access by IP when possible
- Implement rate limiting to prevent abuse
- Log all webhook calls for auditing

**Practical Exercise**:
- Implement signature verification
- Configure IP whitelist
- Test rate limiting
- Review webhook audit logs

---

#### Video 3.4: Creating Custom Workflows
**Duration**: 30 minutes  
**Topics Covered**:
- Workflow planning and design
- Node selection and configuration
- Testing and validation
- Deployment best practices

**Key Takeaways**:
- Plan workflow before building
- Start simple, iterate to complexity
- Test thoroughly in staging
- Document your workflow

**Practical Exercise**:
- Design a new workflow from scratch
- Build and test in n8n Cloud
- Deploy to production
- Monitor first executions

---

## Quick Reference Guides

### 5-Minute Guides

These short videos cover specific tasks:

1. **How to View Workflow Execution Logs** (5 min)
2. **How to Update Workflow Credentials** (5 min)
3. **How to Pause/Resume a Workflow** (3 min)
4. **How to Test a Webhook Locally** (5 min)
5. **How to Export/Import Workflows** (7 min)
6. **How to Set Up Workflow Notifications** (5 min)
7. **How to Monitor Workflow Performance** (6 min)
8. **How to Troubleshoot Failed Executions** (8 min)

---

## Hands-On Labs

### Lab 1: Build a Simple Notification Workflow
**Duration**: 45 minutes  
**Difficulty**: Beginner

**Objectives**:
- Create workflow from scratch
- Set up webhook trigger
- Send Slack notification
- Test end-to-end

**Prerequisites**:
- Completed Video 1.1-1.3
- Access to n8n Cloud
- Slack workspace access

**Lab Guide**: [See detailed lab instructions below]

---

### Lab 2: Implement Error Handling
**Duration**: 60 minutes  
**Difficulty**: Intermediate

**Objectives**:
- Add error handling to existing workflow
- Implement retry logic
- Create fallback path
- Test error scenarios

**Prerequisites**:
- Completed Video 2.1-2.3
- Understanding of workflow structure
- Familiarity with error types

**Lab Guide**: [See detailed lab instructions below]

---

### Lab 3: Optimize Workflow Performance
**Duration**: 90 minutes  
**Difficulty**: Advanced

**Objectives**:
- Profile workflow execution
- Identify bottlenecks
- Implement optimizations
- Measure improvements

**Prerequisites**:
- Completed Video 3.1-3.2
- Understanding of async operations
- SQL query optimization basics

**Lab Guide**: [See detailed lab instructions below]

---

## Integration with Mr. Blue

### Using MB.md Commands

**Video**: Working with MB.md N8N Commands (15 min)

All n8n operations can be controlled through Mr. Blue using mb.md patterns:

```bash
# Check workflow status
use mb.md: n8n:status:all

# Get specific workflow info
use mb.md: n8n:workflow:WEBJmG6uLwUeKSY5:details

# View recent errors
use mb.md: n8n:errors:recent:10

# Test webhook
use mb.md: n8n:webhook:multi-agent:test

# Get performance metrics
use mb.md: n8n:metrics:summary

# Retry failed execution
use mb.md: n8n:execution:<id>:retry
```

**Practical Exercise**:
- Use each command above
- Understand the output
- Chain commands together
- Build a monitoring script

---

## Certification Program

### Level 1: N8N Fundamentals
**Requirements**:
- Complete Series 1 videos (1.1-1.3)
- Pass fundamentals quiz (80%+)
- Complete Lab 1

**Certification**: N8N Associate

---

### Level 2: N8N Workflow Developer
**Requirements**:
- Complete Series 2 videos (2.1-2.3)
- Pass developer quiz (85%+)
- Complete Labs 1-2
- Build 2 custom workflows

**Certification**: N8N Developer

---

### Level 3: N8N Architect
**Requirements**:
- Complete Series 3 videos (3.1-3.4)
- Pass architect quiz (90%+)
- Complete Labs 1-3
- Design and implement complex workflow
- Present workflow to team

**Certification**: N8N Architect

---

## Video Recording Guidelines

### For Content Creators

When recording new tutorial videos:

1. **Preparation**:
   - Write detailed script
   - Prepare demo environment
   - Test all examples
   - Set up screen recording

2. **Recording**:
   - Use 1920x1080 resolution
   - Zoom UI to 125% for visibility
   - Speak clearly and at moderate pace
   - Pause between major sections

3. **Editing**:
   - Add chapter markers
   - Include on-screen captions
   - Highlight important elements
   - Add summary at end

4. **Publishing**:
   - Upload to team video platform
   - Add to this documentation
   - Announce in #mr-blue-alerts
   - Update training calendar

---

## Additional Resources

### Official N8N Documentation
- [N8N Docs](https://docs.n8n.io/)
- [N8N Community](https://community.n8n.io/)
- [N8N Templates](https://n8n.io/workflows/)

### Mundo Tango Specific
- [N8N Implementation Guide](../n8n-implementation-guide.md)
- [Workflow Templates](../workflow-templates.md)
- [Troubleshooting Playbook](../../playbooks/n8n-troubleshooting.md)
- [Monitoring Guide](../../operations/n8n-monitoring.md)

### External Learning
- LinkedIn Learning: Workflow Automation
- Udemy: N8N Masterclass
- YouTube: N8N Official Channel

---

## Training Schedule

### New Team Member Onboarding

**Week 1**: Fundamentals
- Day 1-2: Videos 1.1-1.3
- Day 3: Lab 1
- Day 4: Quiz and review
- Day 5: Shadow experienced team member

**Week 2**: Workflow Development
- Day 1-2: Videos 2.1-2.3
- Day 3: Lab 2
- Day 4: Build practice workflow
- Day 5: Present workflow for feedback

**Week 3**: Advanced Topics
- Day 1-2: Videos 3.1-3.2
- Day 3: Lab 3
- Day 4-5: Real project work with mentorship

---

## Feedback and Improvements

Help us improve the training materials:

**Submit Feedback**:
- Training feedback form: [Link TBD]
- Slack: #mr-blue-training
- Email: training@mundotango.com

**Request New Content**:
- Suggest topics in #mr-blue-alerts
- Vote on requested topics
- Volunteer to create content

**Report Issues**:
- Outdated information
- Broken links or examples
- Technical errors
- Unclear explanations

---

## Training Metrics

We track training effectiveness through:

- Completion rates by video
- Quiz scores and pass rates
- Lab completion times
- Real-world workflow quality
- Team confidence surveys
- Incident reduction over time

---

**Last Updated**: December 21, 2024  
**Content Owner**: Mr. Blue Training Team  
**Review Frequency**: Quarterly  
**Next Review**: March 21, 2025
