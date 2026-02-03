/**
 * Data Completeness Validator
 * MB.MD v9.1 - PRD-Based Autonomous Validation Framework
 * November 25, 2025
 * 
 * Validates data completeness against component PRDs.
 * Auto-populates missing data with smart defaults AND logs for agent learning.
 * 
 * User Decision: Auto-populate with smart defaults + log for future prevention
 */

import { db } from "../db";
import { events, users, posts } from "@shared/schema";
import { eq, isNull, sql } from "drizzle-orm";
import { ComponentPRDRegistry, ComponentPRD, FieldRequirement } from "./ComponentPRDRegistry";
import { GlobalKnowledgeBase } from "./GlobalKnowledgeBase";

export interface ValidationResult {
  componentId: string;
  isComplete: boolean;
  totalFields: number;
  completeFields: number;
  missingFields: FieldRequirement[];
  autoPopulatedFields: string[];
  validationErrors: Array<{
    field: string;
    error: string;
    autoFixed: boolean;
  }>;
  completenessScore: number;
}

export interface DataIssue {
  table: string;
  recordId: number | string;
  field: string;
  issueType: 'missing' | 'invalid' | 'inconsistent';
  originalValue: any;
  autoFixedValue?: any;
  wasAutoFixed: boolean;
}

/**
 * Smart Default Strategies
 * MB.MD Q&A Session Output - Comprehensive Smart Defaults for ALL Tables
 * Defines how to auto-populate missing data across all page PRDs
 */
const SMART_DEFAULTS: Record<string, Record<string, (record: any) => any>> = {
  // =========================================================
  // CORE SOCIAL TABLES
  // =========================================================
  events: {
    organizer_id: (event) => event.createdBy || event.user_id || null,
    price: () => 0,
    location: () => 'Location TBA',
    event_type: () => 'event',
    description: (event) => `Join us for ${event.title || 'this event'}!`
  },
  posts: {
    likes: () => 0,
    comments: () => 0,
    shares: () => 0,
    visibility: () => 'public',
    post_type: () => 'post'
  },
  users: {
    followers_count: () => 0,
    following_count: () => 0,
    bio: (user) => `Welcome to ${user.name || 'my'}'s tango journey!`
  },
  
  // =========================================================
  // PROFESSIONAL/TEACHER TABLES
  // =========================================================
  teacher_profiles: {
    specialty: () => 'Tango Instructor',
    years_experience: () => 0,
    hourly_rate: () => null,
    rating: () => 0,
    bio: (teacher) => `Passionate tango instructor with a love for sharing the dance.`
  },
  
  // =========================================================
  // VENUE TABLES
  // =========================================================
  venues: {
    rating: () => 0,
    capacity: () => null,
    venue_type: () => 'dance_studio',
    description: (venue) => `A great place to dance tango at ${venue.name || 'this venue'}.`
  },
  
  // =========================================================
  // GROUP TABLES
  // =========================================================
  groups: {
    member_count: () => 0,
    privacy: () => 'public',
    description: (group) => `Welcome to the ${group.name || 'tango'} community group!`
  },
  
  // =========================================================
  // MARKETPLACE TABLES
  // =========================================================
  marketplace_products: {
    rating: () => 0,
    in_stock: () => true,
    views: () => 0
  },
  
  // =========================================================
  // NOTIFICATION TABLES
  // =========================================================
  notifications: {
    is_read: () => false
  },
  
  // =========================================================
  // MESSAGING TABLES
  // =========================================================
  conversations: {
    unread_count: () => 0
  },
  
  // =========================================================
  // TUTORIAL TABLES
  // =========================================================
  tutorials: {
    level: () => 'beginner',
    views: () => 0,
    likes: () => 0
  },
  
  // =========================================================
  // TRAVEL TABLES
  // =========================================================
  travel_plans: {
    status: () => 'planning',
    events_count: () => 0
  },
  
  // =========================================================
  // CROWDFUNDING TABLES
  // =========================================================
  crowdfunding_campaigns: {
    current_amount: () => 0,
    backer_count: () => 0,
    status: () => 'active'
  }
};

export class DataCompletenessValidator {
  /**
   * Validate data completeness for a component
   */
  static async validateComponent(
    componentId: string,
    data: Record<string, any>
  ): Promise<ValidationResult> {
    const prd = ComponentPRDRegistry.getComponentPRD(componentId);
    if (!prd) {
      return {
        componentId,
        isComplete: false,
        totalFields: 0,
        completeFields: 0,
        missingFields: [],
        autoPopulatedFields: [],
        validationErrors: [{ field: 'prd', error: `No PRD found for ${componentId}`, autoFixed: false }],
        completenessScore: 0
      };
    }

    const missingFields: FieldRequirement[] = [];
    const autoPopulatedFields: string[] = [];
    const validationErrors: Array<{ field: string; error: string; autoFixed: boolean }> = [];
    let completeFields = 0;

    for (const field of prd.fields) {
      const value = data[field.field];
      
      // Check if field is present
      if (field.required && (value === null || value === undefined || value === '')) {
        if (field.fallbackStrategy === 'smart_default' && field.fallbackValue !== undefined) {
          // Auto-populate with smart default
          data[field.field] = field.fallbackValue;
          autoPopulatedFields.push(field.field);
          completeFields++;
        } else {
          missingFields.push(field);
          validationErrors.push({
            field: field.field,
            error: `Required field "${field.field}" is missing`,
            autoFixed: false
          });
        }
      } else if (value !== null && value !== undefined) {
        // Validate if validator exists
        if (field.validation && !field.validation(value)) {
          validationErrors.push({
            field: field.field,
            error: `Field "${field.field}" failed validation`,
            autoFixed: false
          });
        } else {
          completeFields++;
        }
      } else {
        // Non-required field is missing - that's okay
        completeFields++;
      }
    }

    const totalFields = prd.fields.filter(f => f.required).length;
    const completenessScore = totalFields > 0 ? (completeFields / prd.fields.length) * 100 : 100;
    const isComplete = missingFields.length === 0 && validationErrors.filter(e => !e.autoFixed).length === 0;

    return {
      componentId,
      isComplete,
      totalFields,
      completeFields,
      missingFields,
      autoPopulatedFields,
      validationErrors,
      completenessScore
    };
  }

  /**
   * Fix missing data in database with smart defaults
   * Logs all fixes to GlobalKnowledgeBase for agent learning
   */
  static async autoFixMissingData(
    table: string,
    recordId: number | string
  ): Promise<DataIssue[]> {
    const issues: DataIssue[] = [];
    const tableDefaults = SMART_DEFAULTS[table];
    
    if (!tableDefaults) {
      console.log(`⚠️ No smart defaults defined for table: ${table}`);
      return issues;
    }

    try {
      if (table === 'events') {
        await this.fixEventData(recordId as number, issues);
      } else if (table === 'posts') {
        await this.fixPostData(recordId as number, issues);
      } else if (table === 'users') {
        await this.fixUserData(recordId as number, issues);
      }

      // Log to GlobalKnowledgeBase for agent learning
      if (issues.length > 0) {
        await this.logIssuesForLearning(table, issues);
      }

      return issues;
    } catch (error) {
      console.error(`Error auto-fixing data for ${table}:${recordId}:`, error);
      return issues;
    }
  }

  /**
   * Fix event-specific missing data
   * User Decision: Auto-assign organizer to creator if not specified
   */
  private static async fixEventData(eventId: number, issues: DataIssue[]): Promise<void> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    
    if (!event) return;

    const updates: Partial<typeof event> = {};

    // Auto-assign organizer to creator if NULL
    if (event.organizerId === null) {
      const creatorId = (event as any).createdBy || (event as any).userId;
      if (creatorId) {
        updates.organizerId = creatorId;
        issues.push({
          table: 'events',
          recordId: eventId,
          field: 'organizer_id',
          issueType: 'missing',
          originalValue: null,
          autoFixedValue: creatorId,
          wasAutoFixed: true
        });
      }
    }

    // Auto-populate price if NULL
    if (event.price === null || event.price === undefined) {
      updates.price = 0;
      issues.push({
        table: 'events',
        recordId: eventId,
        field: 'price',
        issueType: 'missing',
        originalValue: null,
        autoFixedValue: 0,
        wasAutoFixed: true
      });
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await db.update(events)
        .set(updates)
        .where(eq(events.id, eventId));
      
      console.log(`✅ Auto-fixed ${Object.keys(updates).length} fields for event ${eventId}`);
    }
  }

  /**
   * Fix post-specific missing data
   */
  private static async fixPostData(postId: number, issues: DataIssue[]): Promise<void> {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    
    if (!post) return;

    const updates: Record<string, any> = {};

    if (post.likes === null) {
      updates.likes = 0;
      issues.push({
        table: 'posts',
        recordId: postId,
        field: 'likes',
        issueType: 'missing',
        originalValue: null,
        autoFixedValue: 0,
        wasAutoFixed: true
      });
    }

    if (post.comments === null) {
      updates.comments = 0;
      issues.push({
        table: 'posts',
        recordId: postId,
        field: 'comments',
        issueType: 'missing',
        originalValue: null,
        autoFixedValue: 0,
        wasAutoFixed: true
      });
    }

    if (Object.keys(updates).length > 0) {
      await db.update(posts)
        .set(updates)
        .where(eq(posts.id, postId));
      
      console.log(`✅ Auto-fixed ${Object.keys(updates).length} fields for post ${postId}`);
    }
  }

  /**
   * Fix user-specific missing data
   */
  private static async fixUserData(userId: number, issues: DataIssue[]): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) return;

    const updates: Record<string, any> = {};

    if ((user as any).followersCount === null) {
      updates.followersCount = 0;
      issues.push({
        table: 'users',
        recordId: userId,
        field: 'followers_count',
        issueType: 'missing',
        originalValue: null,
        autoFixedValue: 0,
        wasAutoFixed: true
      });
    }

    if ((user as any).followingCount === null) {
      updates.followingCount = 0;
      issues.push({
        table: 'users',
        recordId: userId,
        field: 'following_count',
        issueType: 'missing',
        originalValue: null,
        autoFixedValue: 0,
        wasAutoFixed: true
      });
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users)
        .set(updates)
        .where(eq(users.id, userId));
      
      console.log(`✅ Auto-fixed ${Object.keys(updates).length} fields for user ${userId}`);
    }
  }

  /**
   * Log issues to GlobalKnowledgeBase for agent learning
   * Enables pattern recognition and prevention
   */
  private static async logIssuesForLearning(table: string, issues: DataIssue[]): Promise<void> {
    try {
      const groupedIssues = issues.reduce((acc, issue) => {
        if (!acc[issue.field]) {
          acc[issue.field] = [];
        }
        acc[issue.field].push(issue);
        return acc;
      }, {} as Record<string, DataIssue[]>);

      for (const [field, fieldIssues] of Object.entries(groupedIssues)) {
        await GlobalKnowledgeBase.saveLesson({
          agentId: 'data-completeness-validator',
          context: `Data completeness validation for ${table}.${field}`,
          issue: `${fieldIssues.length} record(s) missing ${field} in ${table}`,
          solution: `Auto-populated with smart default: ${JSON.stringify(fieldIssues[0].autoFixedValue)}`,
          confidence: 0.9,
          appliesTo: ['page-agents', 'data-agents', 'form-agents'],
          metadata: {
            table,
            field,
            issueCount: fieldIssues.length,
            sampleRecordIds: fieldIssues.slice(0, 5).map(i => i.recordId),
            autoFixApplied: true,
            timestamp: new Date().toISOString()
          }
        });
      }

      console.log(`📚 Logged ${Object.keys(groupedIssues).length} field issue patterns to GlobalKnowledgeBase`);
    } catch (error) {
      console.error('Error logging issues to GlobalKnowledgeBase:', error);
    }
  }

  /**
   * Batch fix all events with missing organizer
   * User Decision: Auto-assign to creator
   */
  static async batchFixEventsWithMissingOrganizer(): Promise<number> {
    try {
      // Find all events with NULL organizer_id
      const eventsWithMissingOrganizer = await db
        .select({ id: events.id, title: events.title })
        .from(events)
        .where(isNull(events.organizerId));

      console.log(`\n🔍 Found ${eventsWithMissingOrganizer.length} events with missing organizer`);

      let fixedCount = 0;
      const issues: DataIssue[] = [];

      for (const event of eventsWithMissingOrganizer) {
        const eventIssues = await this.autoFixMissingData('events', event.id);
        if (eventIssues.length > 0) {
          fixedCount++;
          issues.push(...eventIssues);
        }
      }

      console.log(`✅ Auto-fixed organizer for ${fixedCount} events`);

      return fixedCount;
    } catch (error) {
      console.error('Error batch fixing events:', error);
      return 0;
    }
  }

  /**
   * Validate page data completeness
   * Runs validation for all components on a page
   */
  static async validatePage(pageId: string, pageData: Record<string, any>): Promise<{
    pageId: string;
    isComplete: boolean;
    overallScore: number;
    componentResults: ValidationResult[];
  }> {
    const components = ComponentPRDRegistry.getPageComponents(pageId);
    const componentResults: ValidationResult[] = [];

    for (const component of components) {
      const componentData = pageData[component.componentId] || pageData;
      const result = await this.validateComponent(component.componentId, componentData);
      componentResults.push(result);
    }

    const isComplete = componentResults.every(r => r.isComplete);
    const overallScore = componentResults.length > 0
      ? componentResults.reduce((sum, r) => sum + r.completenessScore, 0) / componentResults.length
      : 100;

    return {
      pageId,
      isComplete,
      overallScore,
      componentResults
    };
  }

  /**
   * MB.MD Q&A Session - System-Wide PRD Coverage Report
   * Generates comprehensive report of all page PRD coverage
   */
  static generatePRDCoverageReport(): {
    totalPages: number;
    totalComponents: number;
    pagesWithPRDs: string[];
    componentsWithPRDs: string[];
    coverage: {
      pages: number;
      components: number;
    };
    smartDefaultCoverage: {
      tables: string[];
      totalFields: number;
    };
  } {
    const allPageIds = ComponentPRDRegistry.getAllPageIds();
    const allComponentIds = ComponentPRDRegistry.getAllComponentIds();
    
    const smartDefaultTables = Object.keys(SMART_DEFAULTS);
    const totalSmartDefaultFields = Object.values(SMART_DEFAULTS)
      .reduce((sum, tableDefaults) => sum + Object.keys(tableDefaults).length, 0);

    return {
      totalPages: allPageIds.length,
      totalComponents: allComponentIds.length,
      pagesWithPRDs: allPageIds,
      componentsWithPRDs: allComponentIds,
      coverage: {
        pages: allPageIds.length,
        components: allComponentIds.length
      },
      smartDefaultCoverage: {
        tables: smartDefaultTables,
        totalFields: totalSmartDefaultFields
      }
    };
  }

  /**
   * Get smart default value for a table field
   */
  static getSmartDefault(table: string, field: string, record: any = {}): any {
    const tableDefaults = SMART_DEFAULTS[table];
    if (!tableDefaults || !tableDefaults[field]) {
      return undefined;
    }
    return tableDefaults[field](record);
  }

  /**
   * Check if table has smart defaults configured
   */
  static hasSmartDefaults(table: string): boolean {
    return !!SMART_DEFAULTS[table];
  }

  /**
   * Get all fields with smart defaults for a table
   */
  static getTableSmartDefaults(table: string): string[] {
    const tableDefaults = SMART_DEFAULTS[table];
    return tableDefaults ? Object.keys(tableDefaults) : [];
  }

  /**
   * Apply smart defaults to a record
   * Returns the record with defaults applied for missing fields
   */
  static applySmartDefaults(table: string, record: Record<string, any>): Record<string, any> {
    const tableDefaults = SMART_DEFAULTS[table];
    if (!tableDefaults) return record;

    const updatedRecord = { ...record };
    
    for (const [field, defaultFn] of Object.entries(tableDefaults)) {
      if (updatedRecord[field] === null || updatedRecord[field] === undefined) {
        updatedRecord[field] = defaultFn(record);
      }
    }

    return updatedRecord;
  }

  /**
   * Log PRD validation summary to console
   * Useful for agent learning and debugging
   */
  static logPRDSummary(): void {
    const report = this.generatePRDCoverageReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 MB.MD PRD COVERAGE REPORT');
    console.log('='.repeat(60));
    console.log(`📄 Total Pages with PRDs: ${report.totalPages}`);
    console.log(`🧩 Total Components with PRDs: ${report.totalComponents}`);
    console.log(`🔧 Tables with Smart Defaults: ${report.smartDefaultCoverage.tables.length}`);
    console.log(`📊 Total Smart Default Fields: ${report.smartDefaultCoverage.totalFields}`);
    console.log('\n📄 Pages:');
    report.pagesWithPRDs.forEach(p => console.log(`   • ${p}`));
    console.log('\n🧩 Components:');
    report.componentsWithPRDs.forEach(c => console.log(`   • ${c}`));
    console.log('\n🔧 Smart Default Tables:');
    report.smartDefaultCoverage.tables.forEach(t => {
      const fields = this.getTableSmartDefaults(t);
      console.log(`   • ${t}: ${fields.join(', ')}`);
    });
    console.log('='.repeat(60) + '\n');
  }
}
