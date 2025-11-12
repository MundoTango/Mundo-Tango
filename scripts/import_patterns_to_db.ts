/**
 * Database Import Script for Learning Patterns
 * BATCH 26: Import Top 100 Learning Patterns into learningPatterns table
 * 
 * Reads patterns_for_import.json and inserts patterns into database
 * with duplicate detection and validation
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '../shared/db';
import { learningPatterns, type InsertLearningPattern } from '../shared/schema';
import { eq, or, ilike } from 'drizzle-orm';

interface PatternImportData {
  metadata: {
    extractedAt: string;
    totalPatternsGenerated: number;
    top100Selected: boolean;
    sourceDocument: string;
    codebaseScanned: boolean;
    hookFilesFound: number;
    version: string;
  };
  patterns: {
    patternName: string;
    category: 'bug_fix' | 'optimization' | 'feature' | 'refactor' | 'pattern' | 'architecture';
    problemSignature: string;
    solutionTemplate: string;
    confidence: number;
    successRate: number;
    timesApplied: number;
    discoveredBy: string[];
    codeExample?: string;
    whenNotToUse?: string;
    variations?: Record<string, any>;
    esaLayers?: number[];
    agentDomains?: string[];
    successMetrics?: Record<string, any>;
    appliedTo?: string[];
  }[];
}

async function checkForDuplicates(patternName: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(learningPatterns)
    .where(eq(learningPatterns.patternName, patternName))
    .limit(1);
  
  return existing.length > 0;
}

async function importPatterns(): Promise<void> {
  console.log('🚀 Starting pattern import to database...\n');
  
  // 1. Load JSON file
  const jsonPath = path.join(process.cwd(), 'patterns_for_import.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`patterns_for_import.json not found at: ${jsonPath}`);
  }
  
  const data: PatternImportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  console.log('📋 Import Metadata:');
  console.log(`   Source: ${data.metadata.sourceDocument}`);
  console.log(`   Version: ${data.metadata.version}`);
  console.log(`   Total Patterns: ${data.patterns.length}`);
  console.log(`   Extracted: ${data.metadata.extractedAt}\n`);
  
  // 2. Check for existing patterns
  console.log('🔍 Checking for duplicate patterns...');
  const existingCount = await db.select().from(learningPatterns);
  console.log(`   Found ${existingCount.length} existing patterns in database\n`);
  
  // 3. Prepare patterns for insertion
  const patternsToInsert: InsertLearningPattern[] = [];
  const skippedPatterns: string[] = [];
  
  for (const pattern of data.patterns) {
    // Check for duplicates
    const isDuplicate = await checkForDuplicates(pattern.patternName);
    
    if (isDuplicate) {
      skippedPatterns.push(pattern.patternName);
      continue;
    }
    
    // Transform to database schema
    const dbPattern: InsertLearningPattern = {
      patternName: pattern.patternName,
      category: pattern.category,
      problemSignature: pattern.problemSignature,
      solutionTemplate: pattern.solutionTemplate,
      confidence: pattern.confidence,
      successRate: pattern.successRate,
      timesApplied: pattern.timesApplied,
      discoveredBy: pattern.discoveredBy,
      codeExample: pattern.codeExample || null,
      whenNotToUse: pattern.whenNotToUse || null,
      variations: pattern.variations || null
    };
    
    patternsToInsert.push(dbPattern);
  }
  
  console.log(`✅ Patterns ready for import: ${patternsToInsert.length}`);
  if (skippedPatterns.length > 0) {
    console.log(`⚠️  Skipped duplicates: ${skippedPatterns.length}`);
  }
  
  // 4. Insert in batches
  if (patternsToInsert.length === 0) {
    console.log('\n⚠️  No new patterns to import (all duplicates)\n');
    return;
  }
  
  console.log('\n💾 Inserting patterns into database...');
  
  const BATCH_SIZE = 10;
  let inserted = 0;
  
  for (let i = 0; i < patternsToInsert.length; i += BATCH_SIZE) {
    const batch = patternsToInsert.slice(i, i + BATCH_SIZE);
    
    try {
      await db.insert(learningPatterns).values(batch);
      inserted += batch.length;
      console.log(`   Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(patternsToInsert.length / BATCH_SIZE)} (${batch.length} patterns)`);
    } catch (error) {
      console.error(`   ❌ Failed to insert batch at index ${i}:`, error);
    }
  }
  
  console.log(`\n✅ Import Complete!`);
  console.log(`   Total inserted: ${inserted}`);
  console.log(`   Total skipped: ${skippedPatterns.length}`);
  
  // 5. Verification
  console.log('\n🔍 Verifying import...');
  const finalCount = await db.select().from(learningPatterns);
  console.log(`   Total patterns in database: ${finalCount.length}`);
  
  // 6. Show statistics
  console.log('\n📊 Database Statistics:');
  
  // Count by category
  const categoryStats: Record<string, number> = {};
  for (const pattern of finalCount) {
    categoryStats[pattern.category] = (categoryStats[pattern.category] || 0) + 1;
  }
  
  console.log('   By Category:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`     ${category}: ${count}`);
  });
  
  // Top patterns by confidence
  const topPatterns = finalCount
    .sort((a, b) => (b.confidence * b.timesApplied) - (a.confidence * a.timesApplied))
    .slice(0, 5);
  
  console.log('\n   Top 5 Patterns (by value):');
  topPatterns.forEach((p, i) => {
    const value = Math.round(p.confidence * p.timesApplied);
    console.log(`     ${i + 1}. ${p.patternName} (confidence: ${(p.confidence * 100).toFixed(1)}%, applied: ${p.timesApplied}x)`);
  });
  
  console.log('\n✨ Pattern import complete and verified!\n');
}

// Run import
importPatterns().catch((error) => {
  console.error('\n❌ Import failed:', error);
  process.exit(1);
});
