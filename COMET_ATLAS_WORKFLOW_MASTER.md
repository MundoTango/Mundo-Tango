# COMET ATLAS WORKFLOW MASTER

**Version:** 1.0  
**Created:** 2025  
**Purpose:** Master governance and execution framework for Mundo Tango AI assistant workflows

---

## EXECUTIVE SUMMARY

This document serves as the definitive guide for executing complex AI integration projects within the Mundo Tango ecosystem. It combines the proven execution patterns from **MB.MD (Mundo Blue Methodology Directive v9.9)** with the contextual knowledge from **AS.MD (Architecture Specification)** to create a unified workflow framework.

**Primary Use Case:** Mr Blue + ElevenLabs Voice Integration

---

## 1. GOVERNANCE LAYER

### 1.1 When to Use This Framework

Apply COMET ATLAS when:
- Integrating new AI capabilities into Mundo Tango platform
- Building conversational voice interfaces
- Implementing multi-system integrations requiring orchestration
- Creating documentation for complex technical projects
- Executing hierarchical workflows with parallel execution tracks

### 1.2 Core Principles (from MB.MD)

**Principle 1: Hierarchical Execution (Pattern 28)**  
Never skip levels. All work flows through three tiers:
- **Strategic (Level 1):** Architecture, planning, governance
- **Tactical (Level 2):** Implementation tracks, module creation
- **Atomic (Level 3):** Individual files, functions, tests

**Principle 2: Parallel Execution Where Possible (Pattern 7)**  
Maximize efficiency through concurrent workflows when dependencies allow.

**Principle 3: Document WHY, Not Just WHAT (Pattern 14)**  
Critical decisions must include reasoning to enable future agents to learn.

**Principle 4: Validation Before Deployment (Pattern 22)**  
All code must pass end-to-end testing in target environment (Replit).

**Principle 5: Persistent Memory (Pattern 33)**  
AS.MD serves as the universal knowledge base and persistent memory layer.

---

## 2. EXECUTION FRAMEWORK

### 2.1 Five-Phase Workflow

Every project follows this sequence:

```
AUDIT → MAP → BUILD → TEST → DOCUMENT
```

#### Phase 1: AUDIT
**Objective:** Understand current state and gather requirements

**Actions:**
1. Read AS.MD for platform context
2. Read MB.MD for methodology patterns
3. Identify existing systems and dependencies
4. Catalog available resources (APIs, credentials, documentation)
5. Document gaps and unknowns

**Deliverables:**
- Audit report with findings
- Dependency map
- Resource inventory

#### Phase 2: MAP
**Objective:** Design architecture and plan execution

**Actions:**
1. Define system architecture
2. Identify integration points
3. Plan parallel execution tracks (Alpha, Beta, Gamma, Delta)
4. Create task breakdown structure
5. Assign patterns from MB.MD to each track

**Deliverables:**
- Architecture diagram
- Execution plan with tracks
- Pattern assignment matrix

#### Phase 3: BUILD
**Objective:** Implement the solution

**Actions:**
1. Execute tracks in parallel where possible
2. Create documentation first, then code
3. Follow atomic commit patterns
4. Include test IDs in all UI components
5. Update .env.example for new secrets

**Deliverables:**
- Implementation files
- API integrations
- Configuration files
- Test suites

#### Phase 4: TEST
**Objective:** Validate functionality in target environment

**Actions:**
1. Sync branch to Replit
2. Run unit tests
3. Run integration tests
4. Run end-to-end tests
5. Validate against success criteria

**Deliverables:**
- Test results
- Performance metrics
- Bug reports (if any)

#### Phase 5: DOCUMENT
**Objective:** Create learning artifacts for future agents

**Actions:**
1. Create comprehensive specification documents
2. Write QA verification reports
3. Document lessons learned
4. Update AS.MD with new context
5. Create handoff documentation

**Deliverables:**
- Technical specifications
- User documentation
- Verification reports
- Updated AS.MD

---

## 3. CONTEXT LAYER (AS.MD Integration)

### 3.1 Platform Context

**Mundo Tango Mission:**  
Connect people through tango experiences, events, housing, and community.

**Life CEO Integration:**  
AI-powered assistant platform providing personalized support.

**Mr Blue Identity:**  
The tactical-level AI agent orchestrating 1,218 atomic agents for complex tasks.

### 3.2 Mr Blue Systems (Existing)

1. **Context System** - Maintains conversation state
2. **Video System** - Video processing capabilities
3. **Avatar System** - Visual representation
4. **Vibe Coding System** - Cultural context understanding
5. **Voice System** - Speech integration
6. **Facebook System** - Social media integration
7. **Autonomous System** - Independent task execution
8. **Memory System** - Long-term knowledge storage
9. **Arbitrage System** - Resource optimization
10. **Bytez System** - Data processing

### 3.3 Technology Stack

**Backend:**
- Node.js / TypeScript
- PostgreSQL database
- WebSocket for real-time communication

**Frontend:**
- React / Next.js
- TailwindCSS
- Real-time audio/video capabilities

**AI Services:**
- ElevenLabs (Voice AI)
- OpenAI (Language models)
- Custom agent orchestration

---

## 4. MR BLUE + ELEVENLABS INTEGRATION GUIDE

### 4.1 Integration Objectives

1. Enable conversational voice interface for Mundo Tango users
2. Leverage ElevenLabs "Scott" voice as Mr Blue's voice identity
3. Provide real-time voice interaction with <300ms latency
4. Integrate tools: Events search, Friends connection, Housing search
5. Maintain conversation context across sessions

### 4.2 Execution Tracks

**Alpha Track (Documentation Agent)**
- Creates master documentation
- Defines specifications
- Writes architecture guides

**Beta Track (ElevenLabs Configuration Agent)**
- Configures Voice Lab settings
- Creates agent in ElevenLabs platform
- Defines tool contracts

**Gamma Track (Backend Integration Agent)**
- Builds service layer
- Creates API routes
- Implements tool execution layer

**Delta Track (Frontend Integration Agent)**
- Creates voice chat UI widget
- Implements WebSocket connections
- Adds audio controls

### 4.3 MB.MD Patterns Applied

| Pattern | Name | Application |
|---------|------|-------------|
| 7 | Parallel Execution | Run Alpha/Beta/Gamma/Delta concurrently |
| 14 | Decision Documentation | Document WHY for architecture choices |
| 22 | Validation Gates | Test in Replit before deployment |
| 28 | Hierarchical Execution | Strategic → Tactical → Atomic |
| 33 | Persistent Memory | Use AS.MD as knowledge base |
| 35 | Multi-Agent Orchestration | Coordinate work across 4 tracks |

---

## 5. QUALITY GATES

### 5.1 Definition of Done

A task is complete when:
- [ ] Code is committed to feature branch
- [ ] Documentation is created/updated
- [ ] Tests pass in Replit
- [ ] .env.example is updated (if applicable)
- [ ] No breaking changes to existing systems
- [ ] Performance meets targets (<300ms latency for voice)
- [ ] Security review passed (no exposed secrets)
- [ ] Accessibility requirements met

### 5.2 Review Checklist

Before merging to main:
- [ ] All tracks completed
- [ ] Integration tests pass
- [ ] Documentation reviewed
- [ ] AS.MD updated with new context
- [ ] Lessons learned documented
- [ ] Handoff plan created

---

## 6. ERROR RECOVERY

### 6.1 Common Issues

**Issue:** ElevenLabs API rate limits  
**Solution:** Implement exponential backoff (MB.MD Pattern 18)

**Issue:** WebSocket connection instability  
**Solution:** Add reconnection logic with exponential backoff

**Issue:** Tool execution without permissions  
**Solution:** Validate auth before executing tools

**Issue:** High latency in voice response  
**Solution:** Profile bottlenecks, optimize WebSocket streaming

### 6.2 Rollback Procedures

1. If integration fails in Replit testing:
   - Document failure mode
   - Revert to previous stable state
   - Analyze root cause
   - Update implementation
   - Re-test

2. If production issues occur:
   - Disable feature flag
   - Roll back to previous deployment
   - Create incident report
   - Fix in development environment
   - Re-deploy with additional testing

---

## 7. LEARNING AND ITERATION

### 7.1 Post-Implementation Review

After completing integration:
1. Document what worked well
2. Document what could be improved
3. Update MB.MD with new patterns (if discovered)
4. Update AS.MD with new context
5. Share learnings with team

### 7.2 Continuous Improvement

**Feedback Loop:**
```
Implement → Test → Document → Learn → Improve → Implement
```

**Key Metrics:**
- Task completion time
- Test pass rate
- Documentation completeness
- User satisfaction
- System performance

---

## 8. REFERENCE MATERIALS

### 8.1 Core Documents

- **MB.MD** - Mundo Blue Methodology Directive (5,041 lines, 42 patterns)
- **AS.MD** - Architecture Specification (universal context)
- **MR_BLUE_ELEVENLABS_INTEGRATION_SPEC.MD** - Integration architecture
- **MR_BLUE_AS.MD** - Mr Blue architecture specification

### 8.2 External Resources

- ElevenLabs API Documentation
- ElevenLabs Voice Lab
- ElevenLabs Agents Platform
- WebSocket Protocol Specification

---

## 9. VERSION CONTROL

### 9.1 Branch Strategy

**Main Branch:** `main` (production-ready code)  
**Feature Branches:** `feature/<name>` (development work)  
**Current Branch:** `feature/mr-blue-elevenlabs-integration`

### 9.2 Commit Guidelines

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```
feat(voice): Add ElevenLabs WebSocket integration
docs(mr-blue): Create integration specification
test(voice): Add e2e tests for voice chat widget
```

---

## 10. NEXT STEPS

For current Mr Blue + ElevenLabs integration:

1. ✅ Create COMET_ATLAS_WORKFLOW_MASTER.md (this file)
2. ⏳ Create MR_BLUE_ELEVENLABS_INTEGRATION_SPEC.md
3. ⏳ Create MR_BLUE_AS.MD
4. ⏳ Configure ElevenLabs (Beta Track)
5. ⏳ Implement backend services (Gamma Track)
6. ⏳ Implement frontend UI (Delta Track)
7. ⏳ Test in Replit
8. ⏳ Document and review
9. ⏳ Merge to main

---

## APPENDIX A: MB.MD Pattern Reference

**Pattern 7: Parallel Execution**  
Execute independent tasks concurrently to maximize efficiency.

**Pattern 14: Decision Documentation**  
Document WHY for all critical architectural decisions.

**Pattern 18: Error Recovery**  
Implement exponential backoff and graceful degradation.

**Pattern 22: Validation Gates**  
Test in target environment before considering complete.

**Pattern 28: Hierarchical Execution**  
Maintain three-tier execution: Strategic → Tactical → Atomic.

**Pattern 33: Persistent Memory**  
Use AS.MD as universal knowledge base and memory layer.

**Pattern 35: Multi-Agent Orchestration**  
Coordinate work across multiple parallel execution tracks.

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025  
**Next Review:** After integration completion
