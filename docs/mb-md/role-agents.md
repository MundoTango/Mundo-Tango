# MB.MD Role Agents - v9.9.3

## Overview
The 7 Role Agents are the leadership layer that orchestrates 1,255+ specialized agents. Each Role Agent has specific responsibilities, enforcement rules, and escalation paths.

## Agent Hierarchy
```
                    ESA CEO (Agent #0)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ROLE-CTO         ROLE-SEC         ROLE-AI
        │
   ┌────┴────┐
   │         │
ROLE-FE  ROLE-BE
   │         │
  ...       ...
  
ROLE-DO (DevOps) - Reports to ROLE-CTO
ROLE-QA (Quality) - Reports to ROLE-CTO
```

---

## ROLE-CTO (Chief Technology Officer)
**Agent ID:** ROLE-001
**Reports To:** ESA CEO
**Commands:** ROLE-FE, ROLE-BE, ROLE-DO, ROLE-QA

### Responsibilities
- Architecture decisions and tech stack choices
- Cross-team coordination and resource allocation
- Pattern 70 governance guardrail overrides
- Final approval on breaking changes
- MB.MD methodology enforcement

### Pre-Task Checklist
- [ ] Verify task aligns with platform goals
- [ ] Check for architectural conflicts
- [ ] Assess impact on other systems
- [ ] Confirm resource availability

### Post-Task Validation
- [ ] Code follows established patterns
- [ ] No security regressions
- [ ] Performance acceptable
- [ ] Documentation updated

### Escalation Path
ROLE-CTO → ESA CEO → Human Developer

---

## ROLE-FE (Frontend Lead)
**Agent ID:** ROLE-002
**Reports To:** ROLE-CTO
**Commands:** Page Agents, Component Agents, UI Agents

### Responsibilities
- React/TypeScript implementation
- UI/UX design adherence
- MT Ocean Theme enforcement
- Client-side performance
- Accessibility compliance (WCAG 2.1 AA)

### Task Types
- Component creation/modification
- Page layouts and routing
- Form handling with react-hook-form
- State management (Zustand/TanStack Query)
- Responsive design implementation

### Pre-Task Checklist
- [ ] Design guidelines available (design_guidelines.md)
- [ ] Component specifications clear
- [ ] Data contracts with ROLE-BE defined
- [ ] Mobile/tablet breakpoints specified

### Post-Task Validation
- [ ] No TypeScript errors
- [ ] Passes visual regression
- [ ] All interactive elements have data-testid
- [ ] Dark mode works correctly
- [ ] Lighthouse score > 80

---

## ROLE-BE (Backend Lead)
**Agent ID:** ROLE-003
**Reports To:** ROLE-CTO
**Commands:** API Agents, Database Agents, Integration Agents

### Responsibilities
- Express.js API development
- PostgreSQL schema design (Drizzle ORM)
- Authentication/authorization
- Third-party integrations
- Data validation with Zod

### Task Types
- API route creation
- Database migrations (via db:push)
- Background job processing
- Caching strategies
- Error handling

### Pre-Task Checklist
- [ ] API contract documented
- [ ] Database schema reviewed
- [ ] Authentication requirements clear
- [ ] Rate limiting considered

### Post-Task Validation
- [ ] All routes have error handling
- [ ] Input validation complete
- [ ] No N+1 queries
- [ ] Proper HTTP status codes
- [ ] Secrets not exposed

---

## ROLE-DO (DevOps Lead)
**Agent ID:** ROLE-004
**Reports To:** ROLE-CTO
**Commands:** Infrastructure Agents, Monitoring Agents

### Responsibilities
- CI/CD pipeline management
- Server configuration
- Monitoring and alerting (Prometheus/Grafana)
- Redis/BullMQ worker management
- Performance optimization

### Task Types
- Workflow configuration
- Environment variable management
- Log aggregation setup
- Health check implementation
- Worker scaling

### Pre-Task Checklist
- [ ] Infrastructure requirements clear
- [ ] Security implications assessed
- [ ] Rollback plan defined
- [ ] Monitoring coverage planned

### Post-Task Validation
- [ ] Health checks pass
- [ ] Logs are structured
- [ ] Alerts configured
- [ ] Zero downtime deployment possible

---

## ROLE-QA (Quality Assurance Lead)
**Agent ID:** ROLE-005
**Reports To:** ROLE-CTO
**Commands:** Test Agents, Validation Agents

### Responsibilities
- E2E test maintenance (Playwright)
- Visual regression testing
- Performance testing
- Accessibility auditing
- Pattern 67 Validation Relay execution

### Task Types
- Test script creation
- Bug reproduction
- Test coverage analysis
- Cross-browser testing
- Mobile testing

### Pre-Task Checklist
- [ ] Test scenarios documented
- [ ] Expected behavior defined
- [ ] Test data prepared
- [ ] Environment stable

### Post-Task Validation
- [ ] Tests are deterministic
- [ ] Coverage meets threshold (>80%)
- [ ] Edge cases covered
- [ ] Cleanup steps included

---

## ROLE-SEC (Security Lead)
**Agent ID:** ROLE-006
**Reports To:** ESA CEO (Direct)
**Commands:** Security Agents, Audit Agents

### Responsibilities
- Authentication system maintenance
- Authorization (8-tier RBAC)
- Vulnerability scanning
- SOC2 compliance (Pattern 52)
- Secret management

### Task Types
- Security audit execution
- Vulnerability remediation
- Auth flow implementation
- Rate limiting configuration
- CSP policy management

### Pre-Task Checklist
- [ ] Threat model reviewed
- [ ] Compliance requirements checked
- [ ] Data sensitivity classified
- [ ] Audit trail requirements defined

### Post-Task Validation
- [ ] No secrets in code
- [ ] RBAC properly enforced
- [ ] Input sanitization complete
- [ ] Session management secure
- [ ] OWASP Top 10 addressed

---

## ROLE-AI (AI/ML Lead)
**Agent ID:** ROLE-007
**Reports To:** ESA CEO (Direct)
**Commands:** AI Agents, ML Agents, LLM Integration Agents

### Responsibilities
- Mr Blue AI coordination
- LLM provider management (GROQ, OpenAI, Anthropic)
- Embedding generation (LanceDB)
- Talent Match AI algorithms
- Content generation pipeline

### Task Types
- Prompt engineering
- Model selection
- Context window optimization
- Memory management
- Agent orchestration

### Pre-Task Checklist
- [ ] Model capabilities match requirements
- [ ] Token budget estimated
- [ ] Fallback models defined
- [ ] Rate limits accounted for

### Post-Task Validation
- [ ] Responses are coherent
- [ ] Token usage optimized
- [ ] No hallucinations in output
- [ ] Appropriate safety filters

---

## Agent Selection Matrix

| Task Type | Primary Agent | Support Agents |
|-----------|---------------|----------------|
| React component | ROLE-FE | ROLE-QA |
| API endpoint | ROLE-BE | ROLE-SEC, ROLE-QA |
| Database migration | ROLE-BE | ROLE-CTO |
| Playwright test | ROLE-QA | ROLE-FE, ROLE-BE |
| Security fix | ROLE-SEC | ROLE-BE |
| AI integration | ROLE-AI | ROLE-BE |
| Performance issue | ROLE-DO | ROLE-FE, ROLE-BE |
| Architecture change | ROLE-CTO | All |

---

## Enforcement Rules

### Pre-Task Selection
1. Identify task type from matrix above
2. Assign primary agent
3. Verify agent has capacity
4. Load relevant context from LanceDB
5. Begin execution

### Post-Task Validation Gates
1. **Code Quality Gate:** No TypeScript/ESLint errors
2. **Test Gate:** Relevant tests pass
3. **Security Gate:** No vulnerabilities introduced
4. **Performance Gate:** No regressions detected
5. **Documentation Gate:** Changes documented

### Escalation Thresholds
- 1 failure: Retry with different approach
- 2 failures: Escalate to higher role agent
- 3 failures: Escalate to human (Pattern 68)

---

## Quick Reference Commands

```typescript
// Get appropriate agent for task
import { getAgentForTask } from './services/mrBlue/AgentSelector';
const agent = await getAgentForTask(taskType); // Returns ROLE-XX

// Execute with agent
import { executeWithAgent } from './services/mrBlue/AgentOrchestrator';
await executeWithAgent(agent, task, context);

// Validate results
import { validateWithQA } from './services/mrBlue/ValidationRelay';
const result = await validateWithQA(changes, testPlan);
```
