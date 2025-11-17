# Agent Intelligence Rollup System - Phase 0B

## Overview

The Agent Intelligence Rollup System is a comprehensive knowledge synchronization framework that enables 62+ specialized agents in the Mundo Tango platform to share, merge, and collectively learn from their experiences. This system implements on-demand intelligence gathering, conflict resolution, and semantic search capabilities using PostgreSQL and LanceDB vector storage.

## Architecture

### Core Components

1. **MBMDIntelligenceBase** (`server/services/intelligence/MBMDIntelligenceBase.ts`)
   - Central knowledge repository using LanceDB vector database
   - Semantic search with OpenAI embeddings (1536 dimensions)
   - Pattern detection across agent learnings
   - Conflict detection and resolution
   - Knowledge aggregation and statistics

2. **AgentKnowledgeSync** (`server/services/intelligence/AgentKnowledgeSync.ts`)
   - Orchestrates knowledge rollup across all agents
   - Syncs data between PostgreSQL and LanceDB
   - Manages rollup triggers (manual, discovery, events)
   - Handles agent snapshots and updates
   - Deduplicates and merges knowledge entries

3. **Agent Rollup Routes** (`server/routes/agent-rollup-routes.ts`)
   - RESTful API endpoints for rollup operations
   - Status monitoring and health checks
   - Knowledge query and search interfaces
   - Administrative operations

## Knowledge Structure

```typescript
interface AgentKnowledge {
  agentId: string;
  agentType: string;
  knowledge: {
    facts: string[];
    patterns: string[];
    improvements: string[];
    risks: string[];
    opportunities: string[];
  };
  confidence: number;
  timestamp: Date;
  source: string;
}
```

## API Endpoints

### Trigger Endpoints (POST)

- **POST `/api/agent-rollup/trigger`**
  - Manually trigger knowledge rollup across all agents
  - Returns: Rollup result with statistics
  
- **POST `/api/agent-rollup/trigger/discovery`**
  - Trigger rollup when new information discovered
  - Body: `{ agentId, discovery, metadata }`
  
- **POST `/api/agent-rollup/trigger/page-completion`**
  - Trigger rollup on page completion event
  - Body: `{ page, userId, metadata }`
  
- **POST `/api/agent-rollup/trigger/critical-event`**
  - Trigger rollup on critical system events
  - Body: `{ event, severity, metadata }`

### Query Endpoints (GET)

- **GET `/api/agent-rollup/health`**
  - Health check for rollup system
  - Returns: Service status and last rollup time
  
- **GET `/api/agent-rollup/status`**
  - Current rollup service status
  - Returns: Detailed status including uptime and rollup history
  
- **GET `/api/agent-rollup/stats`**
  - Intelligence base statistics
  - Returns: Total entries, embeddings, categories
  
- **GET `/api/agent-rollup/agents`**
  - Snapshots of all registered agents
  - Returns: Array of agent snapshots with knowledge
  
- **GET `/api/agent-rollup/knowledge?query={query}&limit={limit}`**
  - Semantic search knowledge base
  - Query params: `query` (required), `agentId`, `agentType`, `category`, `minConfidence`, `limit`
  - Returns: Relevant knowledge entries ranked by similarity
  
- **GET `/api/agent-rollup/knowledge/:agentId`**
  - Get all knowledge from specific agent
  - Returns: Knowledge entries for given agent
  
- **GET `/api/agent-rollup/knowledge/category/:category`**
  - Get knowledge by category
  - Returns: All knowledge in specified category
  
- **GET `/api/agent-rollup/patterns`**
  - Detect cross-agent patterns
  - Returns: Identified patterns across agent knowledge
  
- **GET `/api/agent-rollup/conflicts`**
  - Detect knowledge conflicts
  - Returns: Conflicts between agent learnings

### Admin Endpoints (POST)

- **POST `/api/agent-rollup/admin/clear`**
  - Clear all knowledge (admin only)
  - Body: `{ confirm: "CLEAR_ALL_KNOWLEDGE" }`
  - Returns: Confirmation of clearing

## Database Integration

### PostgreSQL Tables

The system extends existing tables to support agent intelligence:
- `agent_intelligence` - Structured agent learnings
- `agent_knowledge_sync` - Sync metadata and history

### LanceDB Vector Storage

Located at `./lancedb_data` with tables:
- `agent_knowledge` - Vector embeddings of knowledge
- `agent_memories` - Agent memory vectors
- `agent_context` - Contextual information vectors
- `agent_patterns` - Detected pattern vectors

## Features

### 1. Knowledge Rollup

- **Triggers:**
  - Manual API trigger
  - New information discovery
  - Page completion events
  - Critical system events
  
- **Process:**
  1. Collect knowledge from all active agents
  2. Merge and deduplicate entries
  3. Detect conflicts between agents
  4. Resolve conflicts via AI consensus
  5. Update central intelligence base
  6. Sync embeddings to LanceDB
  7. Broadcast updates to all agents

### 2. Semantic Search

- Uses OpenAI text-embedding-3-small (1536 dimensions)
- Cosine similarity ranking
- Filters by agent, type, category, confidence
- Customizable result limits

### 3. Pattern Detection

- Identifies recurring patterns across agents
- Tracks pattern frequency and confidence
- Associates patterns with agent types
- Provides actionable insights

### 4. Conflict Resolution

- Detects contradictory knowledge
- Analyzes confidence scores
- Uses AI to determine resolution
- Maintains conflict history

## Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/agent-rollup/health

# Test status endpoint
curl http://localhost:5000/api/agent-rollup/status

# Search knowledge
curl "http://localhost:5000/api/agent-rollup/knowledge?query=tango&limit=5"

# Get statistics
curl http://localhost:5000/api/agent-rollup/stats

# Get all agents
curl http://localhost:5000/api/agent-rollup/agents

# Detect patterns
curl http://localhost:5000/api/agent-rollup/patterns

# Detect conflicts
curl http://localhost:5000/api/agent-rollup/conflicts
```

### Triggering Rollups

```bash
# Manual trigger (requires CSRF token in production)
curl -X POST http://localhost:5000/api/agent-rollup/trigger \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -d '{
    "source": "manual",
    "metadata": {
      "reason": "Testing rollup system"
    }
  }'
```

## Integration with Existing Agents

The system automatically integrates with existing agents:
- Financial Agents (33 agents)
- Social Media Agents (5 agents)
- Marketplace Agents
- Travel Agents
- User Testing Agents
- Legal Agents
- Crowdfunding Agents
- Mr. Blue system agents

Each agent can contribute knowledge through the PostgreSQL `agent_intelligence` table, which is then synced to LanceDB during rollup operations.

## Performance Considerations

- **Caching:** In-memory caching for frequently accessed knowledge
- **Batching:** Rollups process agents in batches to manage load
- **Async Operations:** All heavy operations use async/await
- **Rate Limiting:** Built-in rate limiting for API endpoints
- **Vector Index:** Optimized LanceDB index for fast similarity search

## Future Enhancements

1. Real-time knowledge streaming
2. Agent-to-agent direct communication
3. Predictive rollup scheduling based on activity
4. Knowledge visualization dashboard
5. Advanced conflict resolution strategies
6. Multi-model embedding support
7. Knowledge versioning and rollback

## Error Handling

- Graceful degradation when LanceDB unavailable
- Fallback to PostgreSQL-only mode
- Comprehensive error logging
- Retry logic for failed operations
- Health monitoring and alerts

## Security

- CSRF protection on all POST endpoints
- Authentication required for admin operations
- Input validation on all endpoints
- SQL injection prevention
- Rate limiting to prevent abuse

## Monitoring

- Health check endpoint for service monitoring
- Rollup history tracking
- Performance metrics collection
- Error rate tracking
- Knowledge growth statistics

## Status

**Current Implementation:** ✅ Complete
- MBMDIntelligenceBase service created
- AgentKnowledgeSync coordinator implemented
- API routes registered and tested
- LanceDB integration working
- PostgreSQL schema extended
- All endpoints functional

**Next Steps:**
- Integrate with frontend dashboard
- Add real-time WebSocket updates
- Implement agent-specific rollup policies
- Create visualization tools
