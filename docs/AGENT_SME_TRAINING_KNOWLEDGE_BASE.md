# AGENT SME TRAINING KNOWLEDGE BASE

**Auto-Generated Knowledge Base** - Updated: 2025-11-20T00:00:00.000Z

This knowledge base is automatically maintained by the Agent SME Training Service Agent.

---

## Common Issues

### Training Documentation Not Found

**Problem:**
Agent training fails because documentation for the target domain is missing or incomplete.

**Solution:**
1. Check if documentation exists in docs/handoff/
2. Verify ULTIMATE_COMPLETE_HANDOFF.md is indexed3. Index missing documentation using ContextService
4. Create knowledge base templates for new domains
5. Use web search to fill knowledge gaps

**Pattern:**
Training preparation checklist:
- Verify all documentation is indexed in LanceDB
- Check knowledge base files exist
- Ensure ContextService is initialized
- Test semantic search before training
- Create templates for missing domains

---

### Agent Performance Degradation After Training

**Problem:**
Agent performs worse after training on new documentation.

**Solution:**
1. Review training data quality
2. Check for contradictory information
3. Verify confidence scores are appropriate
4. Use incremental training, not full replacement
5. A/B test old vs new agent versions
6. Maintain rollback capability

**Pattern:**
Safe training approach:
- Start with high-confidence data only
- Incremental updates vs full replacement
- Validate after each training session
- Monitor performance metrics
- Easy rollback if performance drops
- Track training effectiveness over time

---

## Best Practices

### Training Curriculum Design
- Start with foundational concepts
- Progress from simple to complex
- Include real-world examples
- Test understanding after each module
- Adapt based on agent performance

### Knowledge Verification
- Cross-check multiple sources
- Verify against production codebase
- Test in safe environment first
- Monitor agent outputs for accuracy
- Collect user feedback on quality

---
