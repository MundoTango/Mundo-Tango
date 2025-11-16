/**
 * LIMICurator - Golden Examples Curation System
 * 
 * LIMI = Learning from Interaction, Memory, and Improvement
 * Curates 78 high-quality routing examples for training TaskClassifier.
 * 
 * Key Features:
 * - Curate golden examples from routing decisions
 * - Criteria: High quality (4-5 stars), Cost-effective (50%+ savings), Diverse, Edge cases
 * - Maintain 78 examples across all domains
 * - Target: 78 examples by Week 12
 * 
 * Curation Criteria:
 * ✅ Quality: User rated 4-5 stars OR quality score >0.85
 * ✅ Cost-Effective: Saved 50%+ vs premium model
 * ✅ Diverse: Covers all domains (code, chat, reasoning, etc.)
 * ✅ Edge Case: Unusual queries that teach the classifier
 */

import { db } from '../../db';
import { goldenExamples, routingDecisions } from '@shared/schema';
import { eq, desc, sql, count, and } from 'drizzle-orm';
import type { SelectGoldenExample, SelectRoutingDecision } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface CurationCriteria {
  minQuality: number;
  minSavingsPercentage: number;
  maxExamplesPerDomain: number;
  prioritizeEdgeCases: boolean;
}

export interface DiversityReport {
  totalExamples: number;
  domainDistribution: Record<string, number>;
  qualityRange: { min: number; max: number; avg: number };
  costRange: { min: number; max: number; avg: number };
  savingsRange: { min: number; max: number; avg: number };
  coverage: number; // Percentage of domains covered
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TARGET_EXAMPLES = 78;
const DOMAINS = ['chat', 'code', 'reasoning', 'summarization', 'bulk', 'analysis'];

const DEFAULT_CRITERIA: CurationCriteria = {
  minQuality: 0.85,
  minSavingsPercentage: 50,
  maxExamplesPerDomain: 15,
  prioritizeEdgeCases: true,
};

// ============================================================================
// LIMI CURATOR SERVICE
// ============================================================================

export class LIMICurator {
  /**
   * Curate a golden example from a routing decision
   * Only adds if decision meets quality, cost, and diversity criteria
   */
  static async curateGoldenExample(
    decision: SelectRoutingDecision,
    criteria: Partial<CurationCriteria> = {}
  ): Promise<SelectGoldenExample | null> {
    try {
      const finalCriteria = { ...DEFAULT_CRITERIA, ...criteria };

      // Parse decision data
      const classification = decision.classification as any;
      const quality = decision.quality ? parseFloat(decision.quality as any) : 0;
      const savingsPercentage = decision.savingsPercentage ? parseFloat(decision.savingsPercentage as any) : 0;
      const domain = classification.domain || 'unknown';

      console.log(
        `[LIMI Curator] Evaluating decision ${decision.id}: ` +
        `Quality=${quality.toFixed(2)}, Savings=${savingsPercentage.toFixed(1)}%, Domain=${domain}`
      );

      // Check quality threshold
      if (quality < finalCriteria.minQuality) {
        console.log(`[LIMI Curator] ❌ Quality too low: ${quality.toFixed(2)} < ${finalCriteria.minQuality}`);
        return null;
      }

      // Check savings threshold
      if (savingsPercentage < finalCriteria.minSavingsPercentage) {
        console.log(`[LIMI Curator] ❌ Savings too low: ${savingsPercentage.toFixed(1)}% < ${finalCriteria.minSavingsPercentage}%`);
        return null;
      }

      // Check diversity (don't add too many from same domain)
      const [{ domainCount }] = await db
        .select({ domainCount: count() })
        .from(goldenExamples)
        .where(eq(goldenExamples.domain, domain));

      if (domainCount >= finalCriteria.maxExamplesPerDomain) {
        console.log(`[LIMI Curator] ❌ Domain quota exceeded: ${domain} has ${domainCount}/${finalCriteria.maxExamplesPerDomain} examples`);
        return null;
      }

      // Determine tags
      const tags: string[] = [];
      if (quality >= 0.95) tags.push('high_quality');
      if (savingsPercentage >= 70) tags.push('cost_effective');
      if (classification.complexity < 0.2 || classification.complexity > 0.8) tags.push('edge_case');
      if (domainCount < 3) tags.push('diverse');

      // Create golden example
      const [goldenExample] = await db
        .insert(goldenExamples)
        .values({
          query: decision.query,
          classification: classification,
          modelUsed: decision.modelUsed,
          platform: decision.platform,
          cost: decision.cost,
          quality: quality.toString(),
          savingsPercentage: savingsPercentage.toString(),
          reasoning: `High-quality routing decision with ${savingsPercentage.toFixed(1)}% cost savings vs premium model`,
          tags,
          userRating: decision.userFeedback === 'thumbs_up' ? 5 : null,
          domain,
        })
        .returning();

      console.log(
        `[LIMI Curator] ✅ Curated golden example ${goldenExample.id}: ` +
        `${decision.platform}/${decision.modelUsed} | $${parseFloat(decision.cost).toFixed(4)} | Tags: ${tags.join(', ')}`
      );

      return goldenExample;
    } catch (error: any) {
      console.error('[LIMI Curator] ❌ Failed to curate golden example:', error);
      throw error;
    }
  }

  /**
   * Auto-curate golden examples from recent successful decisions
   * Analyzes routing decisions and adds best ones to golden_examples
   */
  static async autoCurate(limit = 50): Promise<SelectGoldenExample[]> {
    try {
      console.log(`[LIMI Curator] 🔍 Auto-curating from ${limit} recent decisions...`);

      // Fetch recent successful decisions
      const successfulDecisions = await db
        .select()
        .from(routingDecisions)
        .where(
          and(
            sql`${routingDecisions.quality} >= 0.85`,
            sql`${routingDecisions.savingsPercentage} >= 50`
          )
        )
        .orderBy(desc(routingDecisions.createdAt))
        .limit(limit);

      const curatedExamples: SelectGoldenExample[] = [];

      for (const decision of successfulDecisions) {
        const example = await this.curateGoldenExample(decision);
        if (example) {
          curatedExamples.push(example);
        }
      }

      console.log(`[LIMI Curator] ✅ Auto-curated ${curatedExamples.length} golden examples`);
      return curatedExamples;
    } catch (error: any) {
      console.error('[LIMI Curator] ❌ Auto-curation failed:', error);
      throw error;
    }
  }

  /**
   * Get training dataset (all golden examples)
   * Returns 78 curated examples for DPO training
   */
  static async getTrainingDataset(): Promise<SelectGoldenExample[]> {
    try {
      const examples = await db
        .select()
        .from(goldenExamples)
        .orderBy(desc(goldenExamples.quality), desc(goldenExamples.savingsPercentage))
        .limit(TARGET_EXAMPLES);

      console.log(`[LIMI Curator] 📚 Retrieved ${examples.length}/${TARGET_EXAMPLES} golden examples for training`);
      return examples;
    } catch (error: any) {
      console.error('[LIMI Curator] ❌ Failed to get training dataset:', error);
      throw error;
    }
  }

  /**
   * Get diversity report
   * Analyzes distribution and coverage of golden examples
   */
  static async getDiversityReport(): Promise<DiversityReport> {
    try {
      // Count total examples
      const [{ totalExamples }] = await db
        .select({ totalExamples: count() })
        .from(goldenExamples);

      // Domain distribution
      const domainDistributionResult = await db.execute(sql`
        SELECT 
          domain,
          COUNT(*) as count
        FROM golden_examples
        WHERE domain IS NOT NULL
        GROUP BY domain
        ORDER BY count DESC
      `);

      const domainDistribution: Record<string, number> = {};
      for (const row of (domainDistributionResult.rows || [])) {
        const r = row as any;
        domainDistribution[r.domain] = parseInt(r.count);
      }

      // Quality range
      const qualityStats = await db.execute(sql`
        SELECT 
          MIN(quality::numeric) as min_quality,
          MAX(quality::numeric) as max_quality,
          AVG(quality::numeric) as avg_quality
        FROM golden_examples
      `);
      const qualityRow = (qualityStats.rows?.[0] || {}) as any;

      // Cost range
      const costStats = await db.execute(sql`
        SELECT 
          MIN(cost::numeric) as min_cost,
          MAX(cost::numeric) as max_cost,
          AVG(cost::numeric) as avg_cost
        FROM golden_examples
      `);
      const costRow = (costStats.rows?.[0] || {}) as any;

      // Savings range
      const savingsStats = await db.execute(sql`
        SELECT 
          MIN(savings_percentage::numeric) as min_savings,
          MAX(savings_percentage::numeric) as max_savings,
          AVG(savings_percentage::numeric) as avg_savings
        FROM golden_examples
        WHERE savings_percentage IS NOT NULL
      `);
      const savingsRow = (savingsStats.rows?.[0] || {}) as any;

      // Calculate coverage
      const domainsRepresented = Object.keys(domainDistribution).length;
      const coverage = (domainsRepresented / DOMAINS.length) * 100;

      return {
        totalExamples,
        domainDistribution,
        qualityRange: {
          min: parseFloat(qualityRow.min_quality) || 0,
          max: parseFloat(qualityRow.max_quality) || 0,
          avg: parseFloat(qualityRow.avg_quality) || 0,
        },
        costRange: {
          min: parseFloat(costRow.min_cost) || 0,
          max: parseFloat(costRow.max_cost) || 0,
          avg: parseFloat(costRow.avg_cost) || 0,
        },
        savingsRange: {
          min: parseFloat(savingsRow.min_savings) || 0,
          max: parseFloat(savingsRow.max_savings) || 0,
          avg: parseFloat(savingsRow.avg_savings) || 0,
        },
        coverage,
      };
    } catch (error: any) {
      console.error('[LIMI Curator] ❌ Failed to get diversity report:', error);
      throw error;
    }
  }

  /**
   * Get progress toward 78 examples goal
   */
  static async getProgress(): Promise<{
    current: number;
    target: number;
    percentage: number;
    missingDomains: string[];
  }> {
    try {
      const [{ current }] = await db
        .select({ current: count() })
        .from(goldenExamples);

      const report = await this.getDiversityReport();
      const representedDomains = Object.keys(report.domainDistribution);
      const missingDomains = DOMAINS.filter(d => !representedDomains.includes(d));

      return {
        current,
        target: TARGET_EXAMPLES,
        percentage: (current / TARGET_EXAMPLES) * 100,
        missingDomains,
      };
    } catch (error: any) {
      console.error('[LIMI Curator] ❌ Failed to get progress:', error);
      throw error;
    }
  }
}
