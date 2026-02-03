/**
 * BaseAPIAgent - Base class for API route agents
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Each API route has an agent that understands:
 * - Request/response schemas
 * - Validation rules
 * - Authentication requirements
 * - Database queries used
 * - Error handling
 */

export interface APIChange {
  file: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  method: string;
  description: string;
  changes: string[];
}

export interface APIAgentCapabilities {
  canCreateEndpoint: boolean;
  canUpdateValidation: boolean;
  canUpdateAuth: boolean;
  canOptimizeQueries: boolean;
}

export abstract class BaseAPIAgent {
  protected id: string;
  protected name: string;
  protected routes: string[]; // API routes this agent owns
  protected files: string[]; // Backend files this agent manages
  protected capabilities: APIAgentCapabilities;

  constructor(
    id: string,
    name: string,
    routes: string[],
    files: string[]
  ) {
    this.id = id;
    this.name = name;
    this.routes = routes;
    this.files = files;
    this.capabilities = {
      canCreateEndpoint: true,
      canUpdateValidation: true,
      canUpdateAuth: true,
      canOptimizeQueries: true,
    };
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get routes this agent owns
   */
  getRoutes(): string[] {
    return this.routes;
  }

  /**
   * Get files this agent manages
   */
  getFiles(): string[] {
    return this.files;
  }

  /**
   * Check if this agent owns a specific route
   */
  ownsRoute(route: string): boolean {
    return this.routes.some(r => route.startsWith(r));
  }

  /**
   * Analyze UI changes and determine required backend changes
   * @param uiChanges - Changes made to the UI
   * @returns List of API changes needed
   */
  abstract analyzeUIChanges(uiChanges: any[]): Promise<APIChange[]>;

  /**
   * Apply backend changes to make UI work
   * @param changes - API changes to apply
   * @returns Success status and details
   */
  abstract applyChanges(changes: APIChange[]): Promise<{
    success: boolean;
    filesModified: string[];
    errors: string[];
  }>;

  /**
   * Validate that backend changes are safe
   * @param changes - Proposed API changes
   * @returns Validation result
   */
  abstract validateChanges(changes: APIChange[]): Promise<{
    safe: boolean;
    warnings: string[];
    errors: string[];
  }>;
}
