# MB.MD Pre-Task Checklist

## Before Starting Any Task

### 1. Environment Verification
- [ ] Database connected (`DATABASE_URL` set)
- [ ] Required API keys configured (GROQ, OpenAI, ElevenLabs)
- [ ] Object storage accessible
- [ ] No blocking errors in server logs

### 2. Context Gathering
- [ ] Query RecursiveContextService for relevant code
- [ ] Check conversation history in LanceDB
- [ ] Review recent changes (git diff)
- [ ] Identify related files and dependencies

### 3. Agent Selection
- [ ] Determine task category (Frontend/Backend/DevOps/Security/AI/QA)
- [ ] Select primary agent based on category:
  - Frontend UI/UX → ROLE-FE
  - Backend API/DB → ROLE-BE
  - Infrastructure → ROLE-DO
  - Security/Auth → ROLE-SEC
  - AI/ML Features → ROLE-AI
  - Testing → ROLE-QA
- [ ] Identify secondary agents for support
- [ ] Establish escalation path

### 4. Dependency Check
- [ ] Identify blocking dependencies
- [ ] Separate sequential vs parallel tasks
- [ ] Check for conflicting file edits
- [ ] Verify no other agents editing same files

### 5. Resource Availability
- [ ] Agent capacity available
- [ ] No rate limits reached (AI APIs)
- [ ] Sufficient disk space
- [ ] Memory usage acceptable

### 6. Risk Assessment
- [ ] Estimate change complexity (low/medium/high)
- [ ] Identify rollback strategy
- [ ] Flag any destructive operations
- [ ] Document potential side effects

## Quick Reference

### Task → Agent Mapping
| Task Type | Primary Agent |
|-----------|---------------|
| New page | ROLE-FE |
| API endpoint | ROLE-BE |
| Bug fix (UI) | ROLE-FE |
| Bug fix (API) | ROLE-BE |
| Performance | ROLE-DO |
| Security | ROLE-SEC |
| AI feature | ROLE-AI |
| Testing | ROLE-QA |

### Required Environment Variables
```
DATABASE_URL      - PostgreSQL connection
GROQ_API_KEY      - AI inference
OPENAI_API_KEY    - Embeddings
ELEVENLABS_API_KEY - Voice synthesis (optional)
REDIS_URL         - BullMQ queues (optional)
```
