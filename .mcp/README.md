# Docker MCP Gateway - Mundo Tango Integration

## Overview

The Model Context Protocol (MCP) Gateway integrates 10+ AI-powered tools into Mundo Tango, enhancing capabilities for Life CEO agents, Talent Match AI, and platform automation.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Mundo Tango App │────▶│  MCP Gateway     │────▶│  MCP Servers        │
│ (Node.js/React) │     │  (Port 8811)     │     │  (Docker containers)│
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                              │
                              ▼
                        Docker Socket
                    (Dynamic container mgmt)
```

## Enabled MCP Servers

| Server | Purpose | Key Tools | Use Cases in Mundo Tango |
|--------|---------|-----------|--------------------------|
| **GitHub** | Code integration | `github_search_repositories`, `github_create_issue` | ESA agents create issues, track bugs |
| **Postgres** | Database ops | `query`, `explain`, `health_check` | Life CEO query analytics, optimize queries |
| **Fetch** | Web scraping | `fetch_url`, `convert_to_markdown` | Event discovery, news aggregation |
| **Memory** | Knowledge graph | `create_memory`, `query_memories` | Life CEO persistent memory, user context |
| **Filesystem** | File operations | `read_file`, `write_file` | Resume parsing, document management |
| **Slack** | Notifications | `send_message`, `create_channel` | Team alerts, admin notifications |
| **Google Drive** | Cloud storage | `upload_file`, `list_files` | Talent Match resume storage |
| **Puppeteer** | Browser automation | `navigate`, `screenshot` | Event scraping, web testing |
| **Clarity** | Analytics | `get_session_recordings`, `heatmaps` | User behavior analysis |
| **Sequential** | AI reasoning | `think_step_by_step` | Enhanced Life CEO decision-making |

## Quick Start

### 1. Setup Secrets

```bash
# Copy template
cp .mcp/secrets.template.env .mcp/secrets.env

# Fill in your API keys
nano .mcp/secrets.env
```

### 2. Start MCP Gateway

```bash
# Start all services
docker-compose -f .mcp/docker-compose.mcp.yml up -d

# Check status
docker-compose -f .mcp/docker-compose.mcp.yml ps

# View logs
docker-compose -f .mcp/docker-compose.mcp.yml logs -f mcp-gateway
```

### 3. Verify Health

```bash
# Health check
curl http://localhost:8811/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Integration with Mundo Tango

### Backend Integration

```typescript
// server/services/mcp-client.ts
import { MCPClient } from './mcp-integration';

const mcpClient = new MCPClient(process.env.MCP_GATEWAY_URL!);

// Example: Use GitHub server to create issue
await mcpClient.callTool('github', 'github_create_issue', {
  repo: 'mundotango/platform',
  title: 'Bug reported by user',
  body: 'User feedback: ...',
});

// Example: Query database via MCP
const results = await mcpClient.callTool('postgres', 'query', {
  sql: 'SELECT COUNT(*) FROM events WHERE start_date > NOW()',
});

// Example: Fetch event data
const eventData = await mcpClient.callTool('fetch', 'fetch_url', {
  url: 'https://tangoevents.com/api/events',
  format: 'markdown',
});
```

### Life CEO Agent Integration

```typescript
// Life CEO agents can now use MCP tools for enhanced capabilities
const lifeCEO = new LifeCEOAgent(userId);

// Store user goals in persistent memory
await lifeCEO.rememberGoal({
  goal: 'Learn advanced tango sequences',
  deadline: '2025-12-31',
  progress: 30,
});

// Query stored memories
const relatedGoals = await lifeCEO.queryMemories('tango learning goals');

// Reason through complex decisions
const decision = await lifeCEO.thinkStepByStep({
  question: 'Should I attend this event?',
  context: { budget: 100, schedule: '...' },
});
```

## MCP Server Configuration

### Adding New Servers

1. Find server in Docker MCP Catalog:
```bash
docker mcp catalog show docker-mcp
```

2. Enable the server:
```bash
docker mcp server enable <server-name>
```

3. Update `docker-compose.mcp.yml`:
```yaml
command:
  - --servers=github,postgres,fetch,memory,<new-server>
```

4. Add secrets if needed to `secrets.env`

5. Restart gateway:
```bash
docker-compose -f .mcp/docker-compose.mcp.yml restart mcp-gateway
```

### Custom MCP Servers

Create custom servers for Mundo Tango-specific tools:

```typescript
// .mcp/custom-servers/tango-events.ts
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'tango-events',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {
      'search_tango_events': {
        description: 'Search tango events worldwide',
        inputSchema: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            date: { type: 'string' },
          },
        },
      },
    },
  },
});

// Implement tool handler
server.setRequestHandler('tools/call', async (request) => {
  // Custom logic here
});
```

## Monitoring & Debugging

### View Logs

```bash
# All logs
docker-compose -f .mcp/docker-compose.mcp.yml logs -f

# Just gateway
docker-compose -f .mcp/docker-compose.mcp.yml logs -f mcp-gateway

# Specific server container
docker logs mcp-github-1 -f
```

### Performance Metrics

```bash
# Container stats
docker stats mcp-gateway-1

# Request logs
tail -f .mcp/logs/gateway.log
```

### Debugging Failed Calls

```typescript
// Enable verbose logging
const mcpClient = new MCPClient(process.env.MCP_GATEWAY_URL!, {
  logLevel: 'debug',
});

// Catch errors
try {
  await mcpClient.callTool('github', 'github_create_issue', params);
} catch (error) {
  console.error('MCP call failed:', error);
  // Fallback to direct API call
}
```

## Security Best Practices

1. **Never commit secrets.env to git**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Rotate API keys regularly**
   - GitHub tokens: 90 days
   - Service API keys: Quarterly

3. **Enable signature verification**
   - Ensures only trusted servers run
   - Configured in `docker-compose.mcp.yml`

4. **Monitor for leaked secrets**
   - `--block-secrets` flag scans responses
   - Alerts if secrets detected in logs

5. **Network isolation**
   - Gateway runs in isolated Docker network
   - Only exposed port is 8811

## Production Deployment

### Environment Variables

```bash
# .env.production
MCP_GATEWAY_URL=https://mcp.mundotango.com
MCP_GATEWAY_API_KEY=<secure-random-key>
MCP_LOG_LEVEL=info
MCP_MAX_CONCURRENT=100
```

### Scaling

```yaml
# docker-compose.mcp.yml - production scale
services:
  mcp-gateway:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

### High Availability

```yaml
# Add load balancer
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  ports:
    - "80:80"
  depends_on:
    - mcp-gateway
```

## Troubleshooting

### Gateway Won't Start

```bash
# Check Docker socket access
ls -la /var/run/docker.sock

# Fix permissions
sudo chmod 666 /var/run/docker.sock
```

### Server Not Responding

```bash
# List running MCP containers
docker ps | grep mcp

# Restart specific server
docker restart mcp-github-1

# Check server logs
docker logs mcp-github-1 --tail 100
```

### High Memory Usage

```bash
# Check container resource usage
docker stats mcp-gateway-1

# Restart gateway to clear cache
docker-compose -f .mcp/docker-compose.mcp.yml restart mcp-gateway
```

## References

- [Docker MCP Gateway Docs](https://docs.docker.com/ai/mcp-gateway/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Server Catalog](https://hub.docker.com/search?q=mcp)
- [Mundo Tango MCP Integration Guide](../docs/mcp-integration.md)

## Support

For issues or questions:
1. Check logs: `docker-compose -f .mcp/docker-compose.mcp.yml logs`
2. Review [MCP documentation](https://modelcontextprotocol.io/)
3. Open issue in Mundo Tango repo
4. Contact DevOps team

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Maintainer:** Mundo Tango DevOps Team
