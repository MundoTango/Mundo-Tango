// PHASE 6: PLATFORM INDEPENDENCE - Database Schema
// Feature 1: Deployment Automation
// Created: October 31, 2025
// Following existing Drizzle patterns from shared/schema.ts

import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./schema";

// Table 1: Deployments
// Tracks all deployments to Vercel + Railway
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Deployment metadata
  type: varchar("type", { length: 20 }).notNull(), // 'production' | 'preview' | 'rollback'
  status: varchar("status", { length: 20 }).notNull(), // 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled'
  
  // GitHub info
  gitCommitSha: varchar("git_commit_sha", { length: 40 }),
  gitBranch: varchar("git_branch", { length: 255 }).notNull(),
  gitCommitMessage: text("git_commit_message"),
  
  // Deployment URLs
  vercelUrl: text("vercel_url"),
  railwayUrl: text("railway_url"),
  vercelDeploymentId: varchar("vercel_deployment_id", { length: 255 }),
  railwayDeploymentId: varchar("railway_deployment_id", { length: 255 }),
  
  // Build logs
  buildLogs: text("build_logs"),
  errorMessage: text("error_message"),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("deployments_user_id_idx").on(table.userId),
  statusIdx: index("deployments_status_idx").on(table.status),
  typeIdx: index("deployments_type_idx").on(table.type),
  createdAtIdx: index("deployments_created_at_idx").on(table.createdAt),
}));

// Table 2: Platform Integrations
// Stores API keys and settings for Vercel, Railway, GitHub, etc.
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Platform info
  platform: varchar("platform", { length: 50 }).notNull(), // 'vercel' | 'railway' | 'github'
  isActive: boolean("is_active").default(true),
  
  // Settings (encrypted API keys, tokens, etc.)
  settings: jsonb("settings").notNull().$type<{
    apiKey?: string;
    apiToken?: string;
    projectId?: string;
    organizationId?: string;
    webhookUrl?: string;
    [key: string]: any;
  }>(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("platform_integrations_user_id_idx").on(table.userId),
  platformIdx: index("platform_integrations_platform_idx").on(table.platform),
  userPlatformUnique: index("platform_integrations_user_platform_idx").on(table.userId, table.platform),
}));

// Table 3: Environment Variables (for Feature 2: Secrets Management)
export const environmentVariables = pgTable("environment_variables", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Variable info
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // Encrypted with AES-256
  environment: varchar("environment", { length: 20 }).notNull(), // 'development' | 'preview' | 'production'
  
  // Platform sync status
  syncedToVercel: boolean("synced_to_vercel").default(false),
  syncedToRailway: boolean("synced_to_railway").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("environment_variables_user_id_idx").on(table.userId),
  envIdx: index("environment_variables_environment_idx").on(table.environment),
  keyIdx: index("environment_variables_key_idx").on(table.key),
}));

// Table 4: Preview Deployments
// Auto-deployed preview environments with 7-day expiration
export const previewDeployments = pgTable("preview_deployments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Preview metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  
  // Git info
  gitCommitSha: varchar("git_commit_sha", { length: 40 }),
  gitBranch: varchar("git_branch", { length: 255 }).notNull(),
  
  // Preview URLs (shareable)
  previewUrl: text("preview_url"),
  deploymentId: integer("deployment_id").references(() => deployments.id),
  
  // Expiration (7 days)
  expiresAt: timestamp("expires_at").notNull(),
  expiredAt: timestamp("expired_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("preview_deployments_user_id_idx").on(table.userId),
  statusIdx: index("preview_deployments_status_idx").on(table.status),
  expiresAtIdx: index("preview_deployments_expires_at_idx").on(table.expiresAt),
}));

// TIER 2: Feature 2.1 - Custom Domains
export const customDomains = pgTable("custom_domains", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Domain info
  domain: varchar("domain", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 255 }),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  // DNS verification
  verificationToken: varchar("verification_token", { length: 255 }).notNull(),
  verificationMethod: varchar("verification_method", { length: 50 }).notNull(), // 'TXT' | 'CNAME'
  verifiedAt: timestamp("verified_at"),
  
  // SSL/TLS
  sslStatus: varchar("ssl_status", { length: 20 }).default('pending'), // 'pending' | 'active' | 'failed'
  sslIssuedAt: timestamp("ssl_issued_at"),
  
  // Platform sync
  deploymentId: integer("deployment_id").references(() => deployments.id),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("custom_domains_user_id_idx").on(table.userId),
  domainIdx: index("custom_domains_domain_idx").on(table.domain),
  isActiveIdx: index("custom_domains_is_active_idx").on(table.isActive),
}));

// TIER 2: Feature 2.2 - Analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  
  // Event info
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'page_view' | 'deployment' | 'api_call' | 'error'
  eventName: varchar("event_name", { length: 255 }).notNull(),
  
  // Event metadata
  metadata: jsonb("metadata").$type<{
    path?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    userAgent?: string;
    ipAddress?: string;
    [key: string]: any;
  }>(),
  
  // Deployment context
  deploymentId: integer("deployment_id").references(() => deployments.id),
  
  // Timestamp
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("analytics_events_user_id_idx").on(table.userId),
  eventTypeIdx: index("analytics_events_event_type_idx").on(table.eventType),
  timestampIdx: index("analytics_events_timestamp_idx").on(table.timestamp),
  deploymentIdIdx: index("analytics_events_deployment_id_idx").on(table.deploymentId),
}));

// TIER 2: Feature 2.3 - Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  memberId: integer("member_id").references(() => users.id).notNull(),
  
  // Role and permissions
  role: varchar("role", { length: 20 }).notNull(), // 'owner' | 'admin' | 'developer' | 'viewer'
  permissions: jsonb("permissions").$type<{
    canDeploy?: boolean;
    canManageSecrets?: boolean;
    canManageDomains?: boolean;
    canViewAnalytics?: boolean;
    canManageTeam?: boolean;
    [key: string]: boolean | undefined;
  }>().notNull(),
  
  // Invitation
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending' | 'active' | 'suspended'
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  acceptedAt: timestamp("accepted_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ownerIdIdx: index("team_members_owner_id_idx").on(table.ownerId),
  memberIdIdx: index("team_members_member_id_idx").on(table.memberId),
  statusIdx: index("team_members_status_idx").on(table.status),
  ownerMemberUnique: index("team_members_owner_member_idx").on(table.ownerId, table.memberId),
}));

// TIER 3: Feature 3.1 - Cost Tracking
export const costRecords = pgTable("cost_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Cost info
  platform: varchar("platform", { length: 50 }).notNull(), // 'vercel' | 'railway' | 'supabase'
  service: varchar("service", { length: 100 }).notNull(), // 'hosting' | 'database' | 'storage' | 'bandwidth'
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).notNull().default('USD'),
  
  // Billing period
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  
  // Usage metrics
  usageMetrics: jsonb("usage_metrics").$type<{
    requests?: number;
    bandwidth?: number;
    storage?: number;
    buildMinutes?: number;
    [key: string]: any;
  }>(),
  
  // Metadata
  deploymentId: integer("deployment_id").references(() => deployments.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("cost_records_user_id_idx").on(table.userId),
  platformIdx: index("cost_records_platform_idx").on(table.platform),
  billingPeriodIdx: index("cost_records_billing_period_idx").on(table.billingPeriodStart),
}));

// TIER 3: Feature 3.2 - Database Backups
export const databaseBackups = pgTable("database_backups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Backup info
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'manual' | 'automatic' | 'scheduled'
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'failed'
  
  // Backup details
  sizeBytes: integer("size_bytes"),
  backupUrl: text("backup_url"),
  storageProvider: varchar("storage_provider", { length: 50 }).notNull(), // 'supabase' | 's3' | 'gcs'
  
  // Restore info
  canRestore: boolean("can_restore").default(true),
  lastRestoredAt: timestamp("last_restored_at"),
  
  // Error handling
  errorMessage: text("error_message"),
  
  // Retention (30 days default)
  expiresAt: timestamp("expires_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("database_backups_user_id_idx").on(table.userId),
  statusIdx: index("database_backups_status_idx").on(table.status),
  createdAtIdx: index("database_backups_created_at_idx").on(table.createdAt),
}));

// TIER 4: CI/CD Pipelines
export const cicdPipelines = pgTable("cicd_pipelines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Pipeline info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Trigger config
  triggers: jsonb("triggers").$type<{
    onPush?: boolean;
    onPullRequest?: boolean;
    onSchedule?: string; // cron expression
    branches?: string[];
    [key: string]: any;
  }>().notNull(),
  
  // Steps (build, test, deploy)
  steps: jsonb("steps").$type<Array<{
    name: string;
    command: string;
    timeout?: number;
    continueOnError?: boolean;
  }>>().notNull(),
  
  // Status
  lastRunId: integer("last_run_id"),
  lastRunStatus: varchar("last_run_status", { length: 20 }), // 'success' | 'failed' | 'cancelled'
  lastRunAt: timestamp("last_run_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("cicd_pipelines_user_id_idx").on(table.userId),
  isActiveIdx: index("cicd_pipelines_is_active_idx").on(table.isActive),
}));

export const cicdRuns = pgTable("cicd_runs", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").references(() => cicdPipelines.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Run info
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  triggerType: varchar("trigger_type", { length: 20 }).notNull(), // 'manual' | 'push' | 'pull_request' | 'schedule'
  
  // Git context
  gitCommitSha: varchar("git_commit_sha", { length: 40 }),
  gitBranch: varchar("git_branch", { length: 255 }),
  
  // Results
  logs: text("logs"),
  errorMessage: text("error_message"),
  deploymentId: integer("deployment_id").references(() => deployments.id),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pipelineIdIdx: index("cicd_runs_pipeline_id_idx").on(table.pipelineId),
  userIdIdx: index("cicd_runs_user_id_idx").on(table.userId),
  statusIdx: index("cicd_runs_status_idx").on(table.status),
  createdAtIdx: index("cicd_runs_created_at_idx").on(table.createdAt),
}));

// Types for TypeScript
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

export type PlatformIntegration = typeof platformIntegrations.$inferSelect;
export type InsertPlatformIntegration = typeof platformIntegrations.$inferInsert;

export type EnvironmentVariable = typeof environmentVariables.$inferSelect;
export type InsertEnvironmentVariable = typeof environmentVariables.$inferInsert;

export type PreviewDeployment = typeof previewDeployments.$inferSelect;
export type InsertPreviewDeployment = typeof previewDeployments.$inferInsert;

export type CustomDomain = typeof customDomains.$inferSelect;
export type InsertCustomDomain = typeof customDomains.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export type CostRecord = typeof costRecords.$inferSelect;
export type InsertCostRecord = typeof costRecords.$inferInsert;

export type DatabaseBackup = typeof databaseBackups.$inferSelect;
export type InsertDatabaseBackup = typeof databaseBackups.$inferInsert;

export type CicdPipeline = typeof cicdPipelines.$inferSelect;
export type InsertCicdPipeline = typeof cicdPipelines.$inferInsert;

export type CicdRun = typeof cicdRuns.$inferSelect;
export type InsertCicdRun = typeof cicdRuns.$inferInsert;

// ============================================================================
// ESA FRAMEWORK (Parts 3-4): 105 Agents, 61 Layers, Agent Training System
// ============================================================================

// Table: ESA Agents Registry
// Stores all 105 agents with their metadata, status, and certifications
export const esaAgents = pgTable("esa_agents", {
  id: serial("id").primaryKey(),
  
  // Agent identification
  agentCode: varchar("agent_code", { length: 50 }).notNull().unique(), // 'P1', 'E23', 'A12', 'L5', etc.
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  agentType: varchar("agent_type", { length: 50 }).notNull(), // 'page' | 'component' | 'algorithm' | 'layer' | 'division' | 'board' | 'journey' | 'dataflow' | 'mr_blue' | 'life_ceo' | 'marketing' | 'hr'
  
  // Agent hierarchy
  parentAgentId: integer("parent_agent_id").references((): any => esaAgents.id),
  divisionChiefId: integer("division_chief_id").references((): any => esaAgents.id),
  layerNumber: integer("layer_number"), // For layer agents (1-61)
  tier: integer("tier"), // For division structure (1-6)
  
  // Agent details
  description: text("description"),
  responsibilities: text("responsibilities").array(),
  competencies: text("competencies").array(),
  
  // Status and certification
  status: varchar("status", { length: 20 }).notNull().default('inactive'), // 'inactive' | 'training' | 'certified' | 'active' | 'suspended'
  certificationLevel: integer("certification_level").default(0), // 0=None, 1=Basic, 2=Production, 3=Master
  certifiedAt: timestamp("certified_at"),
  
  // Training methodology
  trainingMethodology: varchar("training_methodology", { length: 100 }), // 'MB.MD' | 'Ultra-Micro Parallel' | 'Critical Thinking' | etc.
  trainingCompletedAt: timestamp("training_completed_at"),
  
  // Performance metrics
  tasksCompleted: integer("tasks_completed").default(0),
  tasksSuccess: integer("tasks_success").default(0),
  tasksFailed: integer("tasks_failed").default(0),
  avgCompletionTime: integer("avg_completion_time"), // in seconds
  lastActiveAt: timestamp("last_active_at"),
  
  // Configuration
  configuration: jsonb("configuration").$type<{
    capabilities?: string[];
    dependencies?: string[];
    communicationProtocols?: string[];
    qualityGates?: string[];
    [key: string]: any;
  }>(),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentCodeIdx: index("esa_agents_agent_code_idx").on(table.agentCode),
  agentTypeIdx: index("esa_agents_agent_type_idx").on(table.agentType),
  statusIdx: index("esa_agents_status_idx").on(table.status),
  certificationLevelIdx: index("esa_agents_certification_level_idx").on(table.certificationLevel),
  parentAgentIdx: index("esa_agents_parent_agent_idx").on(table.parentAgentId),
}));

// Table: Agent Tasks
// Tracks tasks assigned to and completed by agents
export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => esaAgents.id).notNull(),
  
  // Task details
  taskType: varchar("task_type", { length: 50 }).notNull(), // 'build_page' | 'implement_feature' | 'fix_bug' | 'review_code' | 'train_agent' | 'coordinate'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high' | 'critical'
  
  // Task execution
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled'
  assignedBy: integer("assigned_by").references(() => esaAgents.id),
  dependencies: jsonb("dependencies").$type<{
    requiredAgents?: string[];
    requiredTasks?: number[];
    [key: string]: any;
  }>(),
  
  // Results
  result: text("result"),
  artifacts: jsonb("artifacts").$type<{
    filesCreated?: string[];
    filesModified?: string[];
    linesOfCode?: number;
    testsCreated?: number;
    [key: string]: any;
  }>(),
  errorMessage: text("error_message"),
  
  // Timing
  estimatedDuration: integer("estimated_duration"), // in seconds
  actualDuration: integer("actual_duration"), // in seconds
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentIdIdx: index("agent_tasks_agent_id_idx").on(table.agentId),
  statusIdx: index("agent_tasks_status_idx").on(table.status),
  priorityIdx: index("agent_tasks_priority_idx").on(table.priority),
  createdAtIdx: index("agent_tasks_created_at_idx").on(table.createdAt),
}));

// Table: Agent Communications (H2AC Framework)
// Tracks Human-to-Agent and Agent-to-Agent communications
export const agentCommunications = pgTable("agent_communications", {
  id: serial("id").primaryKey(),
  
  // Communication parties
  communicationType: varchar("communication_type", { length: 20 }).notNull(), // 'H2A' | 'A2H' | 'A2A'
  fromAgentId: integer("from_agent_id").references(() => esaAgents.id),
  toAgentId: integer("to_agent_id").references(() => esaAgents.id),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  
  // Message details
  messageType: varchar("message_type", { length: 50 }).notNull(), // 'command' | 'query' | 'response' | 'notification' | 'escalation' | 'coordination'
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  
  // Context
  taskId: integer("task_id").references(() => agentTasks.id),
  priority: varchar("priority", { length: 20 }).default('normal'), // 'low' | 'normal' | 'high' | 'urgent'
  
  // Response tracking
  requiresResponse: boolean("requires_response").default(false),
  responseId: integer("response_id").references((): any => agentCommunications.id),
  respondedAt: timestamp("responded_at"),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    protocol?: string;
    version?: string;
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  communicationTypeIdx: index("agent_communications_type_idx").on(table.communicationType),
  fromAgentIdx: index("agent_communications_from_agent_idx").on(table.fromAgentId),
  toAgentIdx: index("agent_communications_to_agent_idx").on(table.toAgentId),
  taskIdIdx: index("agent_communications_task_id_idx").on(table.taskId),
  createdAtIdx: index("agent_communications_created_at_idx").on(table.createdAt),
}));

// Table: Agent Certifications
// Tracks individual certification achievements for agents
export const agentCertifications = pgTable("agent_certifications", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => esaAgents.id).notNull(),
  
  // Certification details
  methodology: varchar("methodology", { length: 100 }).notNull(), // 'MB.MD' | 'UMP' | 'Critical Thinking' | 'Quality Gates' | etc.
  level: integer("level").notNull(), // 1=Basic, 2=Production, 3=Master
  
  // Requirements met
  requirementsMet: jsonb("requirements_met").$type<{
    completed?: string[];
    verified?: string[];
    [key: string]: any;
  }>(),
  
  // Verification
  verifiedBy: integer("verified_by").references(() => esaAgents.id),
  certificationDate: timestamp("certification_date").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  
  // Performance at certification
  performanceScore: integer("performance_score"), // 0-100
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdIdx: index("agent_certifications_agent_id_idx").on(table.agentId),
  methodologyIdx: index("agent_certifications_methodology_idx").on(table.methodology),
  levelIdx: index("agent_certifications_level_idx").on(table.level),
}));

// Table: Agent Training Sessions
// Tracks training sessions for agents using Ultra-Micro Parallel methodology
export const agentTrainingSessions = pgTable("agent_training_sessions", {
  id: serial("id").primaryKey(),
  
  // Session details
  sessionName: varchar("session_name", { length: 255 }).notNull(),
  methodology: varchar("methodology", { length: 100 }).notNull(), // 'Ultra-Micro Parallel' | '5-Day Bootcamp' | etc.
  
  // Agents in session
  agentIds: jsonb("agent_ids").$type<number[]>().notNull(),
  batchSize: integer("batch_size").default(1),
  
  // Training content
  trainingModules: jsonb("training_modules").$type<Array<{
    name: string;
    duration: number;
    topics: string[];
    completionCriteria: string[];
  }>>(),
  
  // Progress tracking
  status: varchar("status", { length: 20 }).notNull().default('scheduled'), // 'scheduled' | 'in_progress' | 'completed' | 'failed'
  completionPercentage: integer("completion_percentage").default(0),
  
  // Results
  agentsCertified: integer("agents_certified").default(0),
  averageScore: integer("average_score"),
  
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMinutes: integer("duration_minutes"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("agent_training_sessions_status_idx").on(table.status),
  methodologyIdx: index("agent_training_sessions_methodology_idx").on(table.methodology),
  createdAtIdx: index("agent_training_sessions_created_at_idx").on(table.createdAt),
}));

// Types for TypeScript
export type EsaAgent = typeof esaAgents.$inferSelect;
export type InsertEsaAgent = typeof esaAgents.$inferInsert;

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

export type AgentCommunication = typeof agentCommunications.$inferSelect;
export type InsertAgentCommunication = typeof agentCommunications.$inferInsert;

export type AgentCertification = typeof agentCertifications.$inferSelect;
export type InsertAgentCertification = typeof agentCertifications.$inferInsert;

export type AgentTrainingSession = typeof agentTrainingSessions.$inferSelect;
export type InsertAgentTrainingSession = typeof agentTrainingSessions.$inferInsert;
