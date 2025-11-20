# AUTONOMOUS AGENT KNOWLEDGE BASE

**Auto-Generated Knowledge Base** - Updated: 2025-11-20T00:00:00.000Z

This knowledge base is automatically maintained by the Autonomous Agent.

---

## Common Issues

### Task Execution Without User Confirmation

**Problem:**
Agent executes destructive actions without user approval, causing unintended changes.

**Solution:**
1. Always ask for confirmation before destructive actions
2. Provide preview of changes before applying
3. Use dry-run mode for complex operations
4. Create git commits before major changes
5. Maintain rollback capability

**Pattern:**
Autonomous action hierarchy:
- READ operations: Execute freely
- CREATE operations: Execute with logging
- MODIFY operations: Preview + ask confirmation
- DELETE operations: Always require explicit approval
- DESTRUCTIVE operations: Multi-step confirmation

---

### Decision-Making Without Context

**Problem:**
Agent makes decisions without full context, leading to suboptimal or incorrect results.

**Solution:**
1. Query all knowledge bases before deciding
2. Check user preferences for guidance
3. Review error patterns for past failures
4. Analyze recent conversation history
5. Consider project-wide impact
6. Start with conservative approach

**Pattern:**
Decision-making checklist:
- Query errorPatterns for known issues
- Check userPreferences for guidance
- Review conversation history
- Search knowledge bases for similar cases
- Analyze codebase patterns
- Validate with quality checks
- Provide confidence score with decision

---

## Best Practices

### Autonomous Learning
- Learn from every action taken
- Track success/failure rates
- Update decision trees based on outcomes
- Share insights with other agents
- Build confidence over time

### Safety First
- Never delete without confirmation
- Always create backups
- Use git for versioning
- Validate before executing
- Provide rollback mechanism

### Progressive Autonomy
- Start with simple tasks
- Build user trust gradually
- Increase autonomy based on success
- Always explain decisions
- Learn user's risk tolerance

---
