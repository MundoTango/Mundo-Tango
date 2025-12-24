import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * n8n Client Service
 * Handles all communication with n8n workflow automation platform
 * 
 * Following Mr. Blue's coordination protocol:
 * - Executes workflows via n8n API
 * - Monitors execution status
 * - Handles errors with retry logic
 * - Provides execution history
 */

interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  workspaceId: string;
}

interface WorkflowExecutionParams {
  workflowId: string;
  data: Record<string, any>;
  waitForCompletion?: boolean;
  timeout?: number;
}

interface ExecutionResult {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

interface WorkflowInfo {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

class N8nClient {
  private client: AxiosInstance | null = null;
  private config: N8nConfig;
  private initialized: boolean = false;

  constructor() {
    // Load configuration from environment variables
    this.config = {
      baseUrl: process.env.N8N_BASE_URL || 'https://boddye.app.n8n.cloud',
      apiKey: process.env.N8N_API_KEY || '',
      workspaceId: process.env.N8N_WORKSPACE_ID || 'syk1rkUErtEbe7rv'
    };

    // Don't throw during module loading - gracefully handle missing API key
    if (!this.config.apiKey) {
      console.warn('[n8n] N8N_API_KEY not set - n8n integration disabled');
      return;
    }

    this.initializeClient();
  }

  private initializeClient(): void {
    if (this.initialized) return;

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second default timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[n8n] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[n8n] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Execute a workflow with given parameters
   * @param params Workflow execution parameters
   * @returns Execution result
   */
  async executeWorkflow(params: WorkflowExecutionParams): Promise<ExecutionResult> {
    const { workflowId, data, waitForCompletion = false, timeout = 300000 } = params;

    try {
      console.log(`[n8n] Executing workflow ${workflowId}`, { data });

      // Trigger workflow execution
      const response = await this.client.post(`/workflows/${workflowId}/execute`, {
        data
      });

      const executionId = response.data.id;
      console.log(`[n8n] Workflow execution started: ${executionId}`);

      // If waitForCompletion is true, poll for result
      if (waitForCompletion) {
        return await this.waitForCompletion(executionId, timeout);
      }

      // Return immediate result
      return {
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: new Date().toISOString(),
        data: response.data
      };
    } catch (error) {
      console.error('[n8n] Workflow execution failed:', error);
      throw this.transformError(error);
    }
  }

  /**
   * Wait for workflow execution to complete
   * @param executionId Execution ID to monitor
   * @param timeout Maximum wait time in milliseconds
   * @returns Final execution result
   */
  async waitForCompletion(executionId: string, timeout: number = 300000): Promise<ExecutionResult> {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < timeout) {
      const result = await this.getExecutionStatus(executionId);

      if (result.status === 'success' || result.status === 'error') {
        console.log(`[n8n] Execution ${executionId} completed with status: ${result.status}`);
        return result;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Workflow execution timed out after ${timeout}ms`);
  }

  /**
   * Get current execution status
   * @param executionId Execution ID
   * @returns Execution result
   */
  async getExecutionStatus(executionId: string): Promise<ExecutionResult> {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      const execution = response.data;

      return {
        id: execution.id,
        workflowId: execution.workflowId,
        status: this.mapExecutionStatus(execution.finished, execution.stoppedAt, execution.data?.resultData?.error),
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        data: execution.data?.resultData?.runData,
        error: execution.data?.resultData?.error?.message
      };
    } catch (error) {
      console.error(`[n8n] Failed to get execution status for ${executionId}:`, error);
      throw this.transformError(error);
    }
  }

  /**
   * List all available workflows
   * @returns Array of workflow information
   */
  async listWorkflows(): Promise<WorkflowInfo[]> {
    try {
      const response = await this.client.get('/workflows');
      return response.data.data.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        tags: workflow.tags || [],
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      }));
    } catch (error) {
      console.error('[n8n] Failed to list workflows:', error);
      throw this.transformError(error);
    }
  }

  /**
   * Get workflow details by ID
   * @param workflowId Workflow ID
   * @returns Workflow information
   */
  async getWorkflow(workflowId: string): Promise<WorkflowInfo> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      const workflow = response.data;

      return {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        tags: workflow.tags || [],
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      };
    } catch (error) {
      console.error(`[n8n] Failed to get workflow ${workflowId}:`, error);
      throw this.transformError(error);
    }
  }

  /**
   * Get execution history
   * @param workflowId Optional workflow ID to filter by
   * @param limit Maximum number of results
   * @returns Array of execution results
   */
  async getExecutionHistory(workflowId?: string, limit: number = 20): Promise<ExecutionResult[]> {
    try {
      const params: any = { limit };
      if (workflowId) {
        params.workflowId = workflowId;
      }

      const response = await this.client.get('/executions', { params });
      
      return response.data.data.map((execution: any) => ({
        id: execution.id,
        workflowId: execution.workflowId,
        status: this.mapExecutionStatus(execution.finished, execution.stoppedAt, execution.data?.resultData?.error),
        startedAt: execution.startedAt,
        finishedAt: execution.finishedAt,
        data: execution.data?.resultData?.runData,
        error: execution.data?.resultData?.error?.message
      }));
    } catch (error) {
      console.error('[n8n] Failed to get execution history:', error);
      throw this.transformError(error);
    }
  }

  /**
   * Execute workflow with retry logic
   * Implements exponential backoff for failed executions
   * @param params Workflow execution parameters
   * @param maxRetries Maximum number of retry attempts
   * @returns Execution result
   */
  async executeWithRetry(params: WorkflowExecutionParams, maxRetries: number = 3): Promise<ExecutionResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[n8n] Execution attempt ${attempt + 1}/${maxRetries}`);
        return await this.executeWorkflow(params);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          console.log('[n8n] Error is not retryable, failing immediately');
          throw error;
        }

        // Calculate backoff time: 2^attempt * 2000ms
        const backoffTime = Math.pow(2, attempt) * 2000;
        console.log(`[n8n] Attempt failed, retrying in ${backoffTime}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    throw lastError || new Error('Workflow execution failed after retries');
  }

  /**
   * Health check for n8n API
   * @returns Boolean indicating if API is reachable and authenticated
   */
  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.client.get('/workflows', { params: { limit: 1 } });
      return { ok: true, message: 'n8n API is healthy' };
    } catch (error) {
      const err = error as AxiosError;
      return {
        ok: false,
        message: `n8n API health check failed: ${err.message}`
      };
    }
  }

  /**
   * Map n8n execution status to our standardized status
   */
  private mapExecutionStatus(finished: boolean, stoppedAt: string | null, error: any): ExecutionResult['status'] {
    if (!finished && !stoppedAt) {
      return 'running';
    }
    if (error) {
      return 'error';
    }
    if (finished && !error) {
      return 'success';
    }
    return 'waiting';
  }

  /**
   * Determine if an error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    if (!error.response) {
      return false; // Network errors are retryable
    }

    const status = error.response.status;
    
    // Don't retry client errors (except 429 rate limit)
    if (status >= 400 && status < 500 && status !== 429) {
      return true;
    }

    return false;
  }

  /**
   * Handle API errors with detailed logging
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      console.error('[n8n] API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('[n8n] Network Error: No response received', {
        request: error.request
      });
    } else {
      console.error('[n8n] Request Error:', error.message);
    }
  }

  /**
   * Transform axios error to application error
   */
  private transformError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('n8n API authentication failed. Check API key.');
        case 404:
          return new Error('Workflow not found in n8n.');
        case 429:
          return new Error('n8n API rate limit exceeded. Please try again later.');
        case 500:
          return new Error(`n8n server error: ${data?.message || 'Unknown error'}`);
        default:
          return new Error(`n8n API error (${status}): ${data?.message || error.message}`);
      }
    }

    return new Error(`n8n client error: ${error.message}`);
  }
}

// Export singleton instance
export const n8nClient = new N8nClient();

// Export types for use in other modules
export type {
  N8nConfig,
  WorkflowExecutionParams,
  ExecutionResult,
  WorkflowInfo
};

// Export class for testing
export { N8nClient };
