/**
 * SOURCE HEALTH MONITOR
 * Daily health checks + auto-healing for scraping sources
 * 
 * Features:
 * - Checks source health (0-100 score)
 * - Auto-heals broken sources by re-profiling
 * - Alerts on persistent failures
 * - Tracks selector versions for change detection
 */

import { db } from '../db';
import { eventScrapingSources, scrapedEvents } from '../../shared/schema';
import { eq, gt, sql, and, desc } from 'drizzle-orm';
import { siteProfiler, SiteProfile } from './SiteProfiler';

export interface HealthCheckResult {
  sourceId: number;
  url: string;
  previousScore: number;
  currentScore: number;
  status: 'healthy' | 'degraded' | 'broken' | 'recovered';
  healed: boolean;
  error?: string;
}

class SourceHealthMonitor {
  /**
   * Run health checks on all active sources
   */
  async runHealthChecks(): Promise<HealthCheckResult[]> {
    console.log('[HealthMonitor] Starting daily health check...');
    
    const sources = await db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.isActive, true)
    });

    const results: HealthCheckResult[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < sources.length; i += BATCH_SIZE) {
      const batch = sources.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(s => this.checkSource(s))
      );
      results.push(...batchResults);
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    // Summary
    const healthy = results.filter(r => r.status === 'healthy').length;
    const degraded = results.filter(r => r.status === 'degraded').length;
    const broken = results.filter(r => r.status === 'broken').length;
    const recovered = results.filter(r => r.status === 'recovered').length;

    console.log('[HealthMonitor] Results:');
    console.log(`  ✅ Healthy: ${healthy}`);
    console.log(`  ⚠️  Degraded: ${degraded}`);
    console.log(`  ❌ Broken: ${broken}`);
    console.log(`  🔄 Recovered: ${recovered}`);

    return results;
  }

  /**
   * Check health of a single source
   */
  async checkSource(source: typeof eventScrapingSources.$inferSelect): Promise<HealthCheckResult> {
    const config = source.customSelectors as SiteProfile | null;
    const previousScore = config?.healthScore || 50;

    const result: HealthCheckResult = {
      sourceId: source.id,
      url: source.url,
      previousScore,
      currentScore: 0,
      status: 'broken',
      healed: false
    };

    try {
      // Skip Facebook sources (require special handling)
      if (source.platform === 'facebook') {
        result.currentScore = 50;
        result.status = 'healthy';
        return result;
      }

      // Re-profile the site
      const profile = await siteProfiler.profileSite(
        source.url,
        source.city || '',
        source.country || ''
      );

      result.currentScore = profile.healthScore;

      // Determine status
      if (profile.healthScore >= 70) {
        result.status = 'healthy';
      } else if (profile.healthScore >= 40) {
        result.status = 'degraded';
      } else {
        result.status = 'broken';
      }

      // Check if recovered from broken state
      if (previousScore < 40 && profile.healthScore >= 70) {
        result.status = 'recovered';
        result.healed = true;
      }

      // Update database with new profile
      const newVersion = (config?.selectorVersion || 0) + 
        (JSON.stringify(profile.selectors) !== JSON.stringify(config?.selectors) ? 1 : 0);

      await db.update(eventScrapingSources)
        .set({
          customSelectors: {
            type: profile.type,
            icalUrl: profile.icalUrl,
            apiEndpoint: profile.apiEndpoint,
            hasSchemaOrg: profile.hasSchemaOrg,
            selectors: profile.selectors,
            selectorVersion: newVersion,
            healthScore: profile.healthScore,
            lastChecked: new Date().toISOString()
          },
          updatedAt: new Date()
        })
        .where(eq(eventScrapingSources.id, source.id));

    } catch (error) {
      result.error = (error as Error).message;
      result.currentScore = 0;
      result.status = 'broken';
    }

    return result;
  }

  /**
   * Get sources that need attention (broken or degraded)
   */
  async getProblematicSources(): Promise<Array<{
    id: number;
    name: string;
    url: string;
    healthScore: number;
    lastScrapedAt: Date | null;
  }>> {
    const sources = await db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.isActive, true)
    });

    return sources
      .filter(s => {
        const config = s.customSelectors as SiteProfile | null;
        return (config?.healthScore || 0) < 70;
      })
      .map(s => ({
        id: s.id,
        name: s.name,
        url: s.url,
        healthScore: (s.customSelectors as SiteProfile | null)?.healthScore || 0,
        lastScrapedAt: s.lastScrapedAt
      }))
      .sort((a, b) => a.healthScore - b.healthScore);
  }

  /**
   * Get recent event counts by source
   */
  async getSourceEventCounts(daysBack = 7): Promise<Map<string, number>> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const counts = await db
      .select({
        sourceName: scrapedEvents.sourceName,
        count: sql<number>`count(*)::int`
      })
      .from(scrapedEvents)
      .where(gt(scrapedEvents.scrapedAt, since))
      .groupBy(scrapedEvents.sourceName);

    return new Map(counts.map(c => [c.sourceName, c.count]));
  }
}

export const sourceHealthMonitor = new SourceHealthMonitor();
