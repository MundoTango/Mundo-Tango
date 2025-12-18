# MB.MD v9.9.3 Role-Based Leadership Agents

## Overview
Role agents provide specialized expertise for different aspects of platform development.
They are activated based on task type and work within the ESA hierarchy.

---

## Agent Definitions

### ROLE-CTO: Chief Technology Officer Agent
**ID:** `ROLE-CTO`
**Level:** Executive
**Reports To:** ESA CEO (Agent #0)
**Manages:** All other Role agents

**Responsibilities:**
- Architecture decisions and tech stack selection
- Scalability planning and performance strategy
- Security policy oversight
- Technology ROI evaluation
- Cross-team coordination

**Activation Triggers:**
- Major architectural changes
- New technology integration
- Performance optimization projects
- Security incident response

**Auto-Fix Authority:** Can approve breaking changes with rollback plan

---

### ROLE-FE: Frontend Lead Agent
**ID:** `ROLE-FE`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** Page Agents, Feature Agents, Component Agents

**Responsibilities:**
- React/TypeScript patterns and standards
- UI component library maintenance
- State management strategy
- Performance optimization (Core Web Vitals)
- Accessibility compliance (WCAG)

**Activation Triggers:**
- New page creation
- Component refactoring
- UI/UX bug fixes
- Design system updates

**Expertise Areas:**
- React, TypeScript, TailwindCSS
- shadcn/ui, Radix UI
- TanStack Query, Zustand
- Framer Motion, Recharts

---

### ROLE-BE: Backend Lead Agent
**ID:** `ROLE-BE`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** API Agents, Database Agents, Service Agents

**Responsibilities:**
- Express.js API design patterns
- Database schema and Drizzle ORM
- Authentication and authorization
- API documentation (Swagger)
- Error handling strategy

**Activation Triggers:**
- New API endpoint creation
- Database schema changes
- Authentication flow modifications
- Performance optimization

**Expertise Areas:**
- Express.js, TypeScript
- PostgreSQL, Drizzle ORM
- JWT, Passport.js
- Redis, BullMQ

---

### ROLE-DO: DevOps Lead Agent
**ID:** `ROLE-DO`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** Infrastructure Agents, Monitoring Agents

**Responsibilities:**
- CI/CD pipeline maintenance
- Deployment automation
- Infrastructure monitoring
- Log aggregation and analysis
- Incident response coordination

**Activation Triggers:**
- Deployment failures
- Performance degradation
- Infrastructure scaling
- Security updates

**Expertise Areas:**
- Replit Deployments
- GitHub Actions
- Prometheus, Grafana
- Sentry, Winston logging

---

### ROLE-QA: QA Lead Agent
**ID:** `ROLE-QA`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** Test Agents, Validation Agents

**Responsibilities:**
- Test strategy and coverage
- E2E testing with Playwright
- Unit test maintenance
- Bug triage and prioritization
- Quality gates enforcement

**Activation Triggers:**
- Feature completion
- Bug reports
- Release preparation
- Regression detection

**Expertise Areas:**
- Playwright, Vitest
- Test automation
- Accessibility testing (axe-core)
- Visual regression testing

---

### ROLE-SEC: Security Lead Agent
**ID:** `ROLE-SEC`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** Security Agents, Compliance Agents

**Responsibilities:**
- Security policy enforcement
- Vulnerability assessment
- Authentication system oversight
- Data protection compliance
- Incident response

**Activation Triggers:**
- Security vulnerability reports
- Authentication changes
- Data handling modifications
- Compliance audits

**Expertise Areas:**
- OWASP Top 10
- JWT security
- CSP, CORS, XSS prevention
- Rate limiting, DDoS protection

---

### ROLE-AI: AI/ML Lead Agent
**ID:** `ROLE-AI`
**Level:** Lead
**Reports To:** ROLE-CTO
**Manages:** Mr Blue Agents, Algorithm Agents

**Responsibilities:**
- LLM integration and optimization
- Prompt engineering standards
- AI cost management
- Model selection and routing
- AI safety and guardrails

**Activation Triggers:**
- New AI feature development
- Model performance issues
- Cost optimization needs
- AI safety concerns

**Expertise Areas:**
- OpenAI, Anthropic, Groq APIs
- LangChain, LanceDB
- Prompt engineering
- AI cost arbitrage

---

## Agent Selection Matrix

| Task Type | Primary Agent | Secondary Agent | Escalation |
|-----------|--------------|-----------------|------------|
| New Page | ROLE-FE | Page Agent | ROLE-CTO |
| API Endpoint | ROLE-BE | API Agent | ROLE-CTO |
| Bug Fix (UI) | ROLE-FE | Feature Agent | ROLE-QA |
| Bug Fix (API) | ROLE-BE | Service Agent | ROLE-QA |
| Performance | ROLE-DO | ROLE-BE | ROLE-CTO |
| Security | ROLE-SEC | ROLE-BE | ROLE-CTO |
| AI Feature | ROLE-AI | Mr Blue Agent | ROLE-CTO |
| Testing | ROLE-QA | Test Agent | ROLE-CTO |
| Deployment | ROLE-DO | ROLE-QA | ROLE-CTO |

---

## Pre-Task Agent Selection Checklist

Before starting any task:

1. **Identify Task Category**
   - [ ] Frontend (UI/UX)
   - [ ] Backend (API/DB)
   - [ ] DevOps (Infrastructure)
   - [ ] Security (Auth/Data)
   - [ ] AI/ML (LLM/ML)
   - [ ] QA (Testing)

2. **Select Primary Agent**
   - Based on task category from matrix above

3. **Check Agent Availability**
   - Verify agent is not at capacity
   - Check for conflicting tasks

4. **Review Agent Expertise**
   - Confirm agent has required skills
   - Identify knowledge gaps

5. **Establish Escalation Path**
   - Define when to escalate
   - Identify escalation target

---

## Post-Task Validation Gates

After completing any task:

1. **Code Quality Gate**
   - [ ] No TypeScript errors
   - [ ] No ESLint warnings
   - [ ] Follows project patterns

2. **Test Gate**
   - [ ] Unit tests pass
   - [ ] E2E tests pass (if applicable)
   - [ ] No regression detected

3. **Security Gate**
   - [ ] No exposed secrets
   - [ ] Input validation present
   - [ ] Auth checks in place

4. **Performance Gate**
   - [ ] No blocking operations
   - [ ] Database queries optimized
   - [ ] Bundle size acceptable

5. **Documentation Gate**
   - [ ] API documented
   - [ ] Complex logic commented
   - [ ] replit.md updated if needed
