/**
 * BaseServiceAgent - Base class for service layer agents
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Manages business logic services:
 * - External API integrations
 * - Background jobs
 * - Email/notifications
 * - File uploads
 * - Data processing
 */

export interface ServiceChange {
  type: 'integration' | 'job' | 'notification' | 'processing';
  service: string;
  file: string;
  description: string;
  dependencies: string[]; // External services needed
  changes: string[];
}

export interface ServiceValidation {
  valid: boolean;
  missingDependencies: string[];
  errors: string[];
}

export abstract class BaseServiceAgent {
  protected id: string;
  protected name: string;
  protected services: string[]; // Service files this agent manages
  protected externalDeps: string[]; // External services (Stripe, Cloudinary, etc.)

  constructor(
    id: string,
    name: string,
    services: string[],
    externalDeps: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.services = services;
    this.externalDeps = externalDeps;
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
   * Get services this agent manages
   */
  getServices(): string[] {
    return this.services;
  }

  /**
   * Get external dependencies
   */
  getExternalDeps(): string[] {
    return this.externalDeps;
  }

  /**
   * Analyze UI/API changes for service layer needs
   * @param uiChanges - UI changes
   * @param apiChanges - API changes
   * @returns List of service changes needed
   */
  abstract analyzeServiceNeeds(
    uiChanges: any[],
    apiChanges: any[]
  ): Promise<ServiceChange[]>;

  /**
   * Validate service changes and dependencies
   * @param changes - Proposed service changes
   * @returns Validation result
   */
  abstract validateServiceChanges(
    changes: ServiceChange[]
  ): Promise<ServiceValidation>;

  /**
   * Apply service layer changes
   * @param changes - Service changes to apply
   * @returns Success status
   */
  abstract applyServiceChanges(changes: ServiceChange[]): Promise<{
    success: boolean;
    filesModified: string[];
    dependenciesAdded: string[];
    errors: string[];
  }>;
}
