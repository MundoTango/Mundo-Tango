# Learning Index API Documentation

**Base URL:** `/api/learning`

This API provides efficient access to the AGENT_LEARNING_INDEX_COMPLETE.md file (27,664 lines, 3,181 patterns) using grep-based search.

## Endpoints

### 1. Search Patterns

**GET** `/api/learning/search`

Search 3,181 patterns by keyword.

**Query Parameters:**
- `keyword` (required): Search term
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `searchIn` (optional): `patterns` | `agents` | `all` (default: `all`)

**Example:**
```bash
curl "http://localhost:5000/api/learning/search?keyword=cache&limit=10&searchIn=patterns"
```

**Response:**
```json
{
  "query": "cache",
  "searchIn": "patterns",
  "totalResults": 42,
  "results": [
    {
      "name": "cross-surface-synchronization",
      "line": "**Pattern Name:** `cross-surface-synchronization`"
    }
  ],
  "metadata": {
    "limit": 10,
    "offset": 0
  }
}
```

---

### 2. Get Agent Specifications

**GET** `/api/learning/agents/:agentId`

Get detailed information about a specific agent.

**Path Parameters:**
- `agentId`: Agent identifier (e.g., `A1`, `79`, `#110`, `Agent #79`)

**Example:**
```bash
curl "http://localhost:5000/api/learning/agents/79"
```

**Response:**
```json
{
  "id": "79",
  "content": "### Agent #79: Quality Validator...",
  "startLine": 850
}
```

---

### 3. Get Pattern Details

**GET** `/api/learning/patterns/:patternId`

Get complete details for a specific pattern.

**Path Parameters:**
- `patternId`: Pattern name (e.g., `cross-surface-synchronization`)

**Example:**
```bash
curl "http://localhost:5000/api/learning/patterns/cross-surface-synchronization"
```

**Response:**
```json
{
  "id": "cross-surface-synchronization",
  "content": "### Pattern 1: Cross-Surface Synchronization...",
  "startLine": 97
}
```

---

### 4. Get Appendix Content

**GET** `/api/learning/appendix/:appendixId`

Retrieve content from appendices (A-Q).

**Path Parameters:**
- `appendixId`: Appendix letter (e.g., `A`, `P`, `Q`)

**Example:**
```bash
curl "http://localhost:5000/api/learning/appendix/Q"
```

**Response:**
```json
{
  "id": "Q",
  "content": "## APPENDIX Q: AI Guardrails...",
  "startLine": 26631,
  "endLine": 26900,
  "length": 269
}
```

---

### 5. Get Statistics

**GET** `/api/learning/stats`

Get aggregate statistics about all learnings.

**Example:**
```bash
curl "http://localhost:5000/api/learning/stats"
```

**Response:**
```json
{
  "statistics": {
    "totalLearnings": 3181,
    "uniquePatterns": 3,
    "agentDomains": 2,
    "averageConfidence": "92-95%",
    "totalAgents": 927,
    "operationalAgents": 897,
    "certificationRate": "97%",
    "documentLines": 27664
  },
  "distribution": {
    "infrastructure": {
      "learnings": 2382,
      "percentage": "74.9%",
      "focus": "Cache, sync, performance"
    },
    "frontend": {
      "learnings": 795,
      "percentage": "25.0%",
      "focus": "UI, state, optimistic UX"
    },
    "backend": {
      "learnings": 4,
      "percentage": "0.1%",
      "focus": "API, business logic"
    }
  },
  "topPatterns": [
    {
      "name": "cross-surface-synchronization",
      "variations": 2300,
      "confidence": "92-95%"
    },
    {
      "name": "optimistic-update-preservation",
      "variations": 800,
      "confidence": "92-95%"
    },
    {
      "name": "segment-aware-query-matching",
      "variations": 80,
      "confidence": "95%"
    }
  ]
}
```

---

### 6. Validate Content

**POST** `/api/learning/validate`

Validate content against AI guardrails from Appendix Q.

**Request Body:**
```json
{
  "content": "queryClient.invalidateQueries()",
  "checkAgainst": ["over-invalidation", "optimistic-updates"]
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/learning/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "queryClient.invalidateQueries()",
    "checkAgainst": ["over-invalidation"]
  }'
```

**Response:**
```json
{
  "validation": {
    "passed": true,
    "warnings": [
      "Consider using predicate-based invalidation to avoid over-invalidation"
    ],
    "errors": [],
    "suggestions": []
  },
  "guardrailsSource": "APPENDIX Q",
  "timestamp": "2025-11-12T02:30:00.000Z"
}
```

---

### 7. Health Check

**GET** `/api/learning/health`

Check if the learning index file is accessible.

**Example:**
```bash
curl "http://localhost:5000/api/learning/health"
```

**Response:**
```json
{
  "status": "healthy",
  "fileSize": 1458392,
  "filePath": "/path/to/docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md",
  "lastModified": "2025-01-12T00:00:00.000Z",
  "estimatedLines": 27664
}
```

---

## Implementation Details

### Performance
- Uses `grep` for efficient searching (handles 27,664 lines in <100ms)
- Line-number based extraction for precise section retrieval
- No full-file reads for individual queries

### Error Handling
- 404: Resource not found (agent, pattern, appendix)
- 400: Validation error (invalid parameters)
- 500: Server error (grep failure, file access issues)

### File Structure
The API searches the following document structure:

```
AGENT_LEARNING_INDEX_COMPLETE.md (27,664 lines)
├── Executive Summary (lines 1-60)
├── Learning Statistics (lines 63-92)
├── Top 3 Core Patterns (lines 95-250)
├── Learning by Agent Domain (lines 251-350)
├── Agent Training Outcomes (lines 600-1000)
├── Pattern Library Index (lines 1000-2000)
├── APPENDIX A-Q (lines 1019-27664)
│   ├── APPENDIX A: All 3,181 Learnings (1019-2328)
│   ├── APPENDIX P: Documentation Governance (26631-26666)
│   └── APPENDIX Q: AI Guardrails (26667+)
```

---

## Use Cases

### For New Agents
Search for relevant patterns when starting a new task:
```bash
curl "http://localhost:5000/api/learning/search?keyword=optimistic&searchIn=patterns"
```

### For Debugging
Find agent specifications to understand capabilities:
```bash
curl "http://localhost:5000/api/learning/agents/79"
```

### For Code Review
Validate code against guardrails:
```bash
curl -X POST "http://localhost:5000/api/learning/validate" \
  -H "Content-Type: application/json" \
  -d '{"content": "const data = await refetch()"}'
```

### For Documentation
Get comprehensive pattern details:
```bash
curl "http://localhost:5000/api/learning/patterns/cross-surface-synchronization"
```
