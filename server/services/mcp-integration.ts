// ============================================================================
// MCP GATEWAY INTEGRATION - Mundo Tango
// ============================================================================
// Connects to Docker MCP Gateway to access 10+ AI-powered tools

interface MCPClientConfig {
  gatewayUrl: string;
  apiKey?: string;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

interface MCPToolCall {
  server: string;
  tool: string;
  params: Record<string, any>;
}

interface MCPToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

export class MCPClient {
  private config: MCPClientConfig;
  private baseUrl: string;

  constructor(gatewayUrl: string, config: Partial<MCPClientConfig> = {}) {
    this.config = {
      gatewayUrl,
      timeout: config.timeout || 30000,
      logLevel: config.logLevel || 'info',
      apiKey: config.apiKey || process.env.MCP_GATEWAY_API_KEY,
    };
    
    this.baseUrl = gatewayUrl.replace(/\/$/, '');
  }

  // ============================================================================
  // CORE METHOD - Call any MCP tool
  // ============================================================================

  async callTool(server: string, tool: string, params: Record<string, any> = {}): Promise<MCPToolResponse> {
    const startTime = Date.now();
    
    try {
      this.log('debug', `Calling ${server}.${tool}`, params);

      const response = await fetch(`${this.baseUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          server,
          tool,
          params,
        }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MCP call failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      this.log('info', `✓ ${server}.${tool} completed in ${responseTime}ms`);

      return {
        success: true,
        data,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.log('error', `✗ ${server}.${tool} failed after ${responseTime}ms`, { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
        responseTime,
      };
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR SPECIFIC MCP SERVERS
  // ============================================================================

  // GitHub Integration
  github = {
    searchRepositories: async (query: string, limit: number = 10) => {
      return this.callTool('github', 'github_search_repositories', { query, limit });
    },
    
    createIssue: async (repo: string, title: string, body: string, labels?: string[]) => {
      return this.callTool('github', 'github_create_issue', { repo, title, body, labels });
    },
    
    getPullRequest: async (repo: string, number: number) => {
      return this.callTool('github', 'github_get_pr', { repo, number });
    },
  };

  // Postgres Database Operations
  postgres = {
    query: async (sql: string, params?: any[]) => {
      return this.callTool('postgres', 'query', { sql, params });
    },
    
    explain: async (sql: string) => {
      return this.callTool('postgres', 'explain', { sql });
    },
    
    healthCheck: async () => {
      return this.callTool('postgres', 'health_check', {});
    },
    
    suggestIndexes: async (tableName: string) => {
      return this.callTool('postgres', 'index_suggestions', { table: tableName });
    },
  };

  // Web Fetch
  fetch = {
    url: async (url: string, format: 'html' | 'markdown' | 'text' = 'markdown') => {
      return this.callTool('fetch', 'fetch_url', { url, format });
    },
    
    convertToMarkdown: async (html: string) => {
      return this.callTool('fetch', 'convert_to_markdown', { html });
    },
  };

  // Knowledge Graph Memory
  memory = {
    createMemory: async (content: string, tags?: string[], metadata?: Record<string, any>) => {
      return this.callTool('memory', 'create_memory', { content, tags, metadata });
    },
    
    queryMemories: async (query: string, limit: number = 10) => {
      return this.callTool('memory', 'query_memories', { query, limit });
    },
    
    relateMemories: async (memory1: string, memory2: string, relationship: string) => {
      return this.callTool('memory', 'relate_concepts', { 
        concept1: memory1, 
        concept2: memory2, 
        relationship,
      });
    },
  };

  // Filesystem Operations
  filesystem = {
    readFile: async (path: string) => {
      return this.callTool('filesystem', 'read_file', { path });
    },
    
    writeFile: async (path: string, content: string) => {
      return this.callTool('filesystem', 'write_file', { path, content });
    },
    
    listDirectory: async (path: string) => {
      return this.callTool('filesystem', 'list_directory', { path });
    },
  };

  // Slack Notifications
  slack = {
    sendMessage: async (channel: string, text: string, blocks?: any[]) => {
      return this.callTool('slack', 'send_message', { channel, text, blocks });
    },
    
    createChannel: async (name: string, isPrivate: boolean = false) => {
      return this.callTool('slack', 'create_channel', { name, is_private: isPrivate });
    },
  };

  // Puppeteer Browser Automation
  puppeteer = {
    navigate: async (url: string, waitFor?: string) => {
      return this.callTool('puppeteer', 'navigate', { url, wait_for: waitFor });
    },
    
    screenshot: async (url: string, fullPage: boolean = false) => {
      return this.callTool('puppeteer', 'screenshot', { url, full_page: fullPage });
    },
    
    extractData: async (url: string, selector: string) => {
      return this.callTool('puppeteer', 'extract_data', { url, selector });
    },
  };

  // Sequential Thinking (Advanced AI Reasoning)
  sequential = {
    thinkStepByStep: async (question: string, context?: Record<string, any>) => {
      return this.callTool('sequential', 'think_step_by_step', { question, context });
    },
    
    validateReasoning: async (reasoning: string[], expectedOutcome: string) => {
      return this.callTool('sequential', 'validate_reasoning', { reasoning, expected_outcome: expectedOutcome });
    },
  };

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async callToolsBatch(calls: MCPToolCall[]): Promise<MCPToolResponse[]> {
    const results = await Promise.allSettled(
      calls.map(call => this.callTool(call.server, call.tool, call.params))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Batch call failed',
        };
      }
    });
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // LOGGING
  // ============================================================================

  private log(level: MCPClientConfig['logLevel'], message: string, data?: any) {
    if (!this.shouldLog(level!)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[MCP Client ${timestamp}] ${message}`;
    
    if (data) {
      console[level!](logMessage, data);
    } else {
      console[level!](logMessage);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel!);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let mcpClientInstance: MCPClient | null = null;

export function getMCPClient(): MCPClient {
  if (!mcpClientInstance) {
    const gatewayUrl = process.env.MCP_GATEWAY_URL || 'http://localhost:8811/mcp';
    mcpClientInstance = new MCPClient(gatewayUrl, {
      logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    });
  }
  return mcpClientInstance;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Search GitHub repositories
const mcp = getMCPClient();
const repos = await mcp.github.searchRepositories('tango social network', 5);

// Example 2: Query database
const analytics = await mcp.postgres.query(
  'SELECT COUNT(*) as total FROM events WHERE start_date > $1',
  [new Date()]
);

// Example 3: Fetch event data
const eventData = await mcp.fetch.url('https://tangoevents.com/api/events');

// Example 4: Store user goal in memory
await mcp.memory.createMemory(
  'User wants to learn advanced tango sequences',
  ['goals', 'tango', 'learning'],
  { userId: 123, deadline: '2025-12-31' }
);

// Example 5: Send Slack notification
await mcp.slack.sendMessage(
  '#admin-alerts',
  'New user registered: John Doe'
);

// Example 6: Advanced reasoning
const decision = await mcp.sequential.thinkStepByStep(
  'Should we recommend this event to the user?',
  { userBudget: 100, eventPrice: 75, distance: 10 }
);
*/
