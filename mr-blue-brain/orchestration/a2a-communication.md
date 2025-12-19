# A2A Communication Protocol

**Invocation:** `use mb.md: orchestration:a2a`

---

## 🧠 AGENT-TO-AGENT PROTOCOL

A2A enables agents to communicate directly, share context, and collaborate without centralized coordination.

```
┌─────────────────────────────────────────────────────────────┐
│                  A2A PROTOCOL                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐         Message          ┌─────────┐        │
│   │ Agent A │ ──────────────────────▶ │ Agent B │        │
│   └─────────┘                          └─────────┘        │
│        │                                    │              │
│        │    ┌──────────────────────┐       │              │
│        └───▶│   AGENT REGISTRY     │◀──────┘              │
│             │   (Discovery)        │                       │
│             └──────────────────────┘                       │
│                        │                                   │
│                        ▼                                   │
│             ┌──────────────────────┐                       │
│             │   SHARED CONTEXT     │                       │
│             │   (LanceDB/Memory)   │                       │
│             └──────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 MESSAGE TYPES

```typescript
// Standard A2A message format
interface A2AMessage {
  id: string;
  from: AgentId;
  to: AgentId | 'broadcast';
  type: MessageType;
  payload: any;
  context: SharedContext;
  timestamp: Date;
  replyTo?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

type MessageType = 
  | 'request'      // Ask agent to do something
  | 'response'     // Reply to request
  | 'inform'       // Share information
  | 'query'        // Ask for information
  | 'delegate'     // Hand off task
  | 'escalate'     // Report issue
  | 'broadcast'    // Message to all agents
  | 'subscribe'    // Listen for events
  | 'event';       // Publish event
```

---

## 🔧 IMPLEMENTATION

### Agent Registry

```typescript
interface AgentCard {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  endpoints: {
    message: string;      // POST /agents/:id/message
    status: string;       // GET /agents/:id/status
    stream: string;       // WS /agents/:id/stream
  };
  protocols: string[];    // ['a2a-v1', 'mcp']
  availability: 'online' | 'busy' | 'offline';
}

class AgentRegistry {
  private agents: Map<string, AgentCard> = new Map();
  
  register(agent: AgentCard): void {
    this.agents.set(agent.id, agent);
  }
  
  discover(capability: string): AgentCard[] {
    return [...this.agents.values()].filter(a =>
      a.capabilities.includes(capability) && 
      a.availability === 'online'
    );
  }
  
  get(id: string): AgentCard | undefined {
    return this.agents.get(id);
  }
}
```

### Message Router

```typescript
class A2ARouter {
  private registry: AgentRegistry;
  private messageQueue: Map<string, A2AMessage[]> = new Map();
  
  async send(message: A2AMessage): Promise<A2AResponse> {
    // Resolve recipient
    const recipient = this.registry.get(message.to);
    if (!recipient) {
      throw new Error(`Agent ${message.to} not found`);
    }
    
    // Route based on type
    switch (message.type) {
      case 'request':
        return await this.sendRequest(recipient, message);
      case 'broadcast':
        return await this.broadcastMessage(message);
      case 'delegate':
        return await this.delegateTask(recipient, message);
      default:
        return await this.sendMessage(recipient, message);
    }
  }
  
  private async sendRequest(
    recipient: AgentCard, 
    message: A2AMessage
  ): Promise<A2AResponse> {
    const response = await fetch(recipient.endpoints.message, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }
}
```

### Agent Base Class

```typescript
abstract class A2AAgent {
  protected id: string;
  protected router: A2ARouter;
  protected registry: AgentRegistry;
  
  // Receive and handle messages
  async handleMessage(message: A2AMessage): Promise<A2AResponse> {
    switch (message.type) {
      case 'request':
        return await this.handleRequest(message);
      case 'query':
        return await this.handleQuery(message);
      case 'delegate':
        return await this.handleDelegation(message);
      default:
        return { status: 'unhandled', message: 'Unknown message type' };
    }
  }
  
  // Send message to another agent
  async sendTo(
    targetId: string, 
    type: MessageType, 
    payload: any
  ): Promise<A2AResponse> {
    const message: A2AMessage = {
      id: generateId(),
      from: this.id,
      to: targetId,
      type,
      payload,
      context: await this.getContext(),
      timestamp: new Date(),
      priority: 'normal'
    };
    return await this.router.send(message);
  }
  
  // Delegate task to specialized agent
  async delegateTo(targetId: string, task: Task): Promise<TaskResult> {
    const response = await this.sendTo(targetId, 'delegate', { task });
    return response.result;
  }
  
  // Find agent by capability
  async findAgent(capability: string): Promise<AgentCard | null> {
    const agents = this.registry.discover(capability);
    return agents.length > 0 ? agents[0] : null;
  }
  
  // Abstract methods for subclasses
  abstract handleRequest(message: A2AMessage): Promise<A2AResponse>;
  abstract handleQuery(message: A2AMessage): Promise<A2AResponse>;
  abstract handleDelegation(message: A2AMessage): Promise<A2AResponse>;
}
```

---

## 📊 EXAMPLE: Multi-Agent Collaboration

```typescript
// Scenario: DebugAgent needs database help

// 1. DebugAgent discovers DatabaseAgent
const dbAgent = await debugAgent.findAgent('database');

// 2. DebugAgent sends query
const queryResult = await debugAgent.sendTo(dbAgent.id, 'query', {
  question: 'What tables reference the events table?',
  context: { errorType: 'foreign_key_violation' }
});

// 3. DatabaseAgent responds
// Response: { tables: ['event_registrations', 'event_comments', ...] }

// 4. DebugAgent uses info to fix issue
const fix = await debugAgent.analyze(queryResult.data);

// 5. DebugAgent broadcasts solution
await debugAgent.sendTo('broadcast', 'inform', {
  type: 'bug_fix',
  pattern: 'foreign_key_check_before_delete',
  solution: fix
});
```

---

## 🎯 ENDPOINTS

```typescript
// Standard A2A endpoints for each agent
const agentEndpoints = {
  // Core messaging
  'POST /agents/:id/message':        'Send message to agent',
  'POST /agents/:id/message/stream': 'Stream response',
  
  // Discovery
  'GET /agents':                     'List all agents',
  'GET /agents/:id':                 'Get agent card',
  'GET /agents/:id/status':          'Agent availability',
  
  // Capabilities
  'GET /agents/:id/capabilities':    'What agent can do',
  'POST /agents/:id/can-handle':     'Check if agent can handle task',
  
  // Events
  'WS /agents/:id/events':           'Subscribe to agent events',
  'POST /agents/:id/subscribe':      'Subscribe to event type'
};
```

---

## 🔗 RELATED

- **MoE Router**: Select agents → `use mb.md: orchestration:moe`
- **Magentic**: Dynamic coordination → `use mb.md: orchestration:magentic`
- **n8n Integration**: External workflows → `use mb.md: n8n`

---

*Agents that talk to agents.*
