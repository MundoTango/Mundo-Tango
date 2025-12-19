# AGENT VALIDATION KNOWLEDGE BASE

**Auto-Generated Knowledge Base** - Updated: 2025-11-20T00:00:00.000Z

This knowledge base is automatically maintained by the Agent Validation Service Agent.

---

## Common Issues

### False Positives in Validation

**Problem:**
Validation rejects correct outputs, blocking valid agent actions.

**Solution:**
1. Review validation rules for over-restriction
2. Add exception handling for edge cases
3. Implement confidence thresholds
4. Allow user override with confirmation
5. Track false positive rate
6. Adjust rules based on feedback

**Pattern:**
Balanced validation:
- Critical errors: Always block
- Warnings: Allow with user confirmation
- Style issues: Log but don't block
- Track false positive rate
- Adjust thresholds over time
- Provide override mechanism
- Learn from user corrections

---

### Validation Bottleneck

**Problem:**
Validation takes too long, slowing down agent pipeline.

**Solution:**
1. Implement parallel validation checks
2. Cache validation results for similar inputs
3. Use incremental validation (only changes)
4. Skip validation for low-risk operations
5. Implement fast-path for common cases
6. Async validation for non-critical checks

**Pattern:**
Fast validation strategies:
- Parallel execution of independent checks
- Cache results by content hash
- Incremental validation (diff-based)
- Risk-based prioritization
- Fast-path for known-good patterns
- Async for non-blocking checks
- Progressive validation (basic → detailed)

---

## Best Practices

### Validation Layers
1. Syntax validation (fast, always run)
2. Type checking (medium, TypeScript only)
3. LSP diagnostics (slower, code generation)
4. Integration tests (slowest, high-risk changes)
5. User acceptance (final gate)

### Continuous Improvement
- Track validation accuracy
- Monitor false positive/negative rates
- Collect user feedback
- Update rules based on patterns
- A/B test validation strategies
- Share insights with other agents

---
