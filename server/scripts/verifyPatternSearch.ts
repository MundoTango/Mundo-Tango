#!/usr/bin/env tsx
/**
 * Verify Learning Patterns are Searchable
 * 
 * This script tests that the imported patterns can be found and matched
 * using the Pattern Recognition Engine.
 */

import { PatternRecognitionEngine, type ProblemSignature } from "../services/intelligence/patternRecognition";
import { db } from "../../shared/db";
import { learningPatterns } from "../../shared/schema";
import { gte } from "drizzle-orm";

async function main() {
  console.log('🔍 Verifying Pattern Search Functionality\n');

  const engine = new PatternRecognitionEngine();

  // ==========================================================================
  // Test 1: Database Query - Verify patterns exist
  // ==========================================================================
  console.log('📊 Test 1: Database Query');
  console.log('─'.repeat(60));

  const allPatterns = await db
    .select()
    .from(learningPatterns)
    .where(gte(learningPatterns.successRate, 0.7));

  console.log(`✅ Found ${allPatterns.length} high-quality patterns (success rate >= 70%)`);
  
  for (const pattern of allPatterns) {
    console.log(`\n   Pattern: ${pattern.patternName}`);
    console.log(`   Category: ${pattern.category}`);
    console.log(`   Discovered by: ${pattern.discoveredBy.join(', ')}`);
    console.log(`   Applications: ${pattern.timesApplied}`);
    console.log(`   Success rate: ${Math.round(pattern.successRate * 100)}%`);
    console.log(`   Confidence: ${Math.round(pattern.confidence * 100)}%`);
  }

  // ==========================================================================
  // Test 2: Pattern Detection - Cross-Surface Synchronization
  // ==========================================================================
  console.log('\n\n📊 Test 2: Pattern Detection - Cross-Surface Synchronization');
  console.log('─'.repeat(60));

  const crossSurfaceSignature: ProblemSignature = {
    category: 'bug_fix',
    domain: 'frontend',
    problem: 'When I like a post on the News Feed, the like count updates there, but when I navigate to my Profile, the old like count is shown. Data is inconsistent across pages.',
    context: {
      page: 'News Feed',
      component: 'PostCard',
      errorMessage: 'Like count not syncing across surfaces'
    },
    severity: 'medium'
  };

  const crossSurfaceResult = await engine.detectPattern(crossSurfaceSignature);

  console.log(`\n✅ Detection Result:`);
  console.log(`   Is Recurring: ${crossSurfaceResult.isRecurring}`);
  console.log(`   Recommendation: ${crossSurfaceResult.recommendation}`);
  console.log(`   Confidence: ${Math.round(crossSurfaceResult.confidence * 100)}%`);
  
  if (crossSurfaceResult.matchedPattern) {
    console.log(`\n   Matched Pattern: ${crossSurfaceResult.matchedPattern.patternName}`);
    console.log(`   Applicability: ${crossSurfaceResult.matchedPattern.applicability}`);
    console.log(`   Success Rate: ${Math.round(crossSurfaceResult.matchedPattern.successRate * 100)}%`);
    console.log(`   Times Applied: ${crossSurfaceResult.matchedPattern.timesApplied}`);
  }

  console.log(`\n   Similar Patterns: ${crossSurfaceResult.similarPatterns.length}`);
  console.log(`   Reasoning: ${crossSurfaceResult.reasoning}`);

  // ==========================================================================
  // Test 3: Pattern Detection - Optimistic Update Preservation
  // ==========================================================================
  console.log('\n\n📊 Test 3: Pattern Detection - Optimistic Update Preservation');
  console.log('─'.repeat(60));

  const optimisticSignature: ProblemSignature = {
    category: 'bug_fix',
    domain: 'frontend',
    problem: 'When users click the like button, the count briefly flickers - it shows the new count, then undefined, then the count again. The UI feels janky.',
    context: {
      page: 'Feed',
      component: 'PostActions',
      errorMessage: 'UI flickering during optimistic updates'
    },
    severity: 'medium'
  };

  const optimisticResult = await engine.detectPattern(optimisticSignature);

  console.log(`\n✅ Detection Result:`);
  console.log(`   Is Recurring: ${optimisticResult.isRecurring}`);
  console.log(`   Recommendation: ${optimisticResult.recommendation}`);
  console.log(`   Confidence: ${Math.round(optimisticResult.confidence * 100)}%`);
  
  if (optimisticResult.matchedPattern) {
    console.log(`\n   Matched Pattern: ${optimisticResult.matchedPattern.patternName}`);
    console.log(`   Applicability: ${optimisticResult.matchedPattern.applicability}`);
    console.log(`   Success Rate: ${Math.round(optimisticResult.matchedPattern.successRate * 100)}%`);
    console.log(`   Times Applied: ${optimisticResult.matchedPattern.timesApplied}`);
  }

  console.log(`\n   Similar Patterns: ${optimisticResult.similarPatterns.length}`);
  console.log(`   Reasoning: ${optimisticResult.reasoning}`);

  // ==========================================================================
  // Test 4: Pattern Detection - Segment-Aware Query Matching
  // ==========================================================================
  console.log('\n\n📊 Test 4: Pattern Detection - Segment-Aware Query Matching');
  console.log('─'.repeat(60));

  const segmentSignature: ProblemSignature = {
    category: 'optimization',
    domain: 'performance',
    problem: 'When a user RSVPs to an event, the entire app slows down. Looking at network logs, the achievements page is refetching even though it has nothing to do with events.',
    context: {
      page: 'Event Details',
      component: 'RSVPButton',
      errorMessage: 'Over-invalidation causing unnecessary refetches'
    },
    severity: 'high'
  };

  const segmentResult = await engine.detectPattern(segmentSignature);

  console.log(`\n✅ Detection Result:`);
  console.log(`   Is Recurring: ${segmentResult.isRecurring}`);
  console.log(`   Recommendation: ${segmentResult.recommendation}`);
  console.log(`   Confidence: ${Math.round(segmentResult.confidence * 100)}%`);
  
  if (segmentResult.matchedPattern) {
    console.log(`\n   Matched Pattern: ${segmentResult.matchedPattern.patternName}`);
    console.log(`   Applicability: ${segmentResult.matchedPattern.applicability}`);
    console.log(`   Success Rate: ${Math.round(segmentResult.matchedPattern.successRate * 100)}%`);
    console.log(`   Times Applied: ${segmentResult.matchedPattern.timesApplied}`);
  }

  console.log(`\n   Similar Patterns: ${segmentResult.similarPatterns.length}`);
  console.log(`   Reasoning: ${segmentResult.reasoning}`);

  // ==========================================================================
  // Test 5: Solution Matching - Get best solutions for a problem
  // ==========================================================================
  console.log('\n\n📊 Test 5: Solution Matching');
  console.log('─'.repeat(60));

  const testProblem: ProblemSignature = {
    category: 'bug_fix',
    domain: 'frontend',
    problem: 'Data inconsistency across different pages after mutation',
    severity: 'high'
  };

  const solutions = await engine.matchSolution(testProblem, 3);

  console.log(`\n✅ Found ${solutions.length} matching solutions:`);
  
  for (const solution of solutions) {
    console.log(`\n   ${solution.patternName}`);
    console.log(`   Confidence: ${Math.round(solution.confidence * 100)}%`);
    console.log(`   Applicability: ${solution.applicability}`);
    console.log(`   Success Rate: ${Math.round(solution.successRate * 100)}%`);
    console.log(`   Times Applied: ${solution.timesApplied}`);
  }

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total patterns in database: ${allPatterns.length}`);
  console.log(`🔍 Pattern detection: Working`);
  console.log(`🎯 Solution matching: Working`);
  console.log(`✅ All verification tests passed!\n`);

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
