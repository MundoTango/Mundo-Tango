// A2A Protocol Types (Google Agent-to-Agent Standard)
// Based on JSON-RPC 2.0 specification

export interface A2AMessage {
  jsonrpc: '2.0';
  id: string;
  method: 'message/send' | 'message/stream' | 'tasks/pushNotificationConfig/set';
  params: {
    message: {
      role: 'user' | 'assistant' | 'system';
      parts: Array<TextPart | FilePart>;
    };
    context?: Record<string, any>;
    taskId?: string;
  };
}

export interface TextPart {
  type: 'text';
  text: string;
}

export interface FilePart {
  type: 'file';
  file: {
    name: string;
    mimeType: string;
    bytes: string; // base64 encoded
  };
}

export interface A2AResponse {
  jsonrpc: '2.0';
  id: string;
  result?: {
    artifacts: Array<{
      parts: Array<TextPart | FilePart>;
      metadata?: Record<string, any>;
    }>;
    taskId?: string;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface AgentCard {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  methods: Array<'message/send' | 'message/stream' | 'tasks/pushNotificationConfig/set'>;
  a2aEndpoint: string;
  version: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  task: any;
  context?: Record<string, any>;
  order?: number;
}

export interface WorkflowResult {
  success: boolean;
  results: any[];
  errors?: Array<{
    step: string;
    error: string;
  }>;
  duration: number;
  context: Record<string, any>;
}

export type OrchestrationType = 'sequential' | 'parallel' | 'loop' | 'workflow' | 'task';

export interface WorkflowExecution {
  id: string;
  type: OrchestrationType;
  steps: WorkflowStep[];
  results: any[];
  success: boolean;
  duration: number;
  startedAt: Date;
  completedAt?: Date;
}
