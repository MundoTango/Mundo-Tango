#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Implements APPENDIX P governance rules
 * 
 * Usage: node scripts/validate-docs.cjs [options]
 * 
 * Options:
 *   --file <path>    Path to documentation file (default: docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md)
 *   --strict         Fail on warnings as well as errors
 *   --json           Output results as JSON
 *   --fix            Attempt to auto-fix simple issues
 * 
 * Exit Codes:
 *   0 = Pass (no duplicates/errors)
 *   1 = Fail (duplicates or errors found)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_DOC_PATH = 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md';
const SIMILARITY_THRESHOLD = 0.85;
const MAX_VERSION_VARIANTS = 1;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  file: DEFAULT_DOC_PATH,
  strict: false,
  json: false,
  fix: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    options.file = args[i + 1];
    i++;
  } else if (args[i] === '--strict') {
    options.strict = true;
  } else if (args[i] === '--json') {
    options.json = true;
  } else if (args[i] === '--fix') {
    options.fix = true;
  }
}

/**
 * Single Source of Truth Map
 */
const SINGLE_SOURCE_MAP = [
  { concept: 'ESA Framework Overview', location: 'APPENDIX I', lines: '8,139-13,130' },
  { concept: '927+ Agents Complete Spec', location: 'APPENDIX J', lines: '13,131-21,771' },
  { concept: 'Agent Profiles', location: 'APPENDIX K', lines: '21,772-23,050' },
  { concept: 'Expert Research', location: 'APPENDIX L', lines: '23,051-23,530' },
  { concept: 'Agent Training (15 Agents)', location: 'APPENDIX M', lines: '23,531-24,174' },
  { concept: 'ESA New Agent Guide', location: 'APPENDIX N', lines: '24,175-26,159' },
  { concept: 'Complete Agent Training', location: 'APPENDIX O', lines: '26,160-26,619' },
  { concept: 'Pattern Library', location: 'Lines 1,811-5,817', lines: '1,811-5,817' },
  { concept: 'Learning Accelerators', location: 'Lines 1,021-1,810', lines: '1,021-1,810' },
  { concept: 'Top 50 Patterns', location: 'Lines 1-1,020', lines: '1-1,020' }
];

/**
 * Extract sections from markdown content
 */
function extractSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach((line, index) => {
    const headerMatch = line.match(/^##\s+(.+)/);
    
    if (headerMatch) {
      if (currentSection) {
        currentSection.lineEnd = index;
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }
      
      currentSection = {
        title: headerMatch[1].trim(),
        content: '',
        lineStart: index + 1,
        lineEnd: index + 1,
        version: null,
        lastUpdated: null
      };

      // Extract version and date from next few lines
      const nextLines = lines.slice(index + 1, index + 10).join('\n');
      const versionMatch = nextLines.match(/\*\*Version:\*\*\s*([\d.]+)/);
      const dateMatch = nextLines.match(/\*\*Last Updated:\*\*\s*([^\n]+)/);
      
      if (versionMatch) currentSection.version = versionMatch[1];
      if (dateMatch) currentSection.lastUpdated = dateMatch[1];
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  });

  if (currentSection) {
    currentSection.lineEnd = lines.length;
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return 1 - matrix[s2.length][s1.length] / maxLength;
}

/**
 * RULE 1: Check for duplicate sections
 */
function checkDuplicates(sections) {
  const duplicates = {
    exact: [],
    near: []
  };

  const contentMap = new Map();

  for (let i = 0; i < sections.length; i++) {
    const normalized = sections[i].content.toLowerCase().trim();
    
    // Check for exact duplicates
    if (contentMap.has(normalized)) {
      duplicates.exact.push({
        section1: contentMap.get(normalized),
        section2: sections[i],
        similarity: 1.0
      });
    } else {
      contentMap.set(normalized, sections[i]);
    }

    // Check for near-duplicates
    for (let j = i + 1; j < sections.length; j++) {
      const similarity = calculateSimilarity(sections[i].content, sections[j].content);
      
      if (similarity > SIMILARITY_THRESHOLD && similarity < 1.0) {
        duplicates.near.push({
          section1: sections[i],
          section2: sections[j],
          similarity
        });
      }
    }
  }

  return duplicates;
}

/**
 * RULE 2: Check version control compliance
 */
function checkVersionControl(content) {
  const issues = [];
  
  // Check for document version in header
  const headerVersionMatch = content.match(/\*\*Document Version:\*\*\s*([\d.]+)/);
  if (!headerVersionMatch) {
    issues.push('Missing document version number in header');
  }

  // Check for last updated date
  const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\*\s*([^\n]+)/);
  if (!lastUpdatedMatch) {
    issues.push('Missing last updated date in header');
  }

  // Find all version numbers in document
  const versionMatches = [...content.matchAll(/\*\*Version:\*\*\s*([\d.]+)/gi)];
  const versions = new Set(versionMatches.map(m => m[1]));
  
  if (versions.size > MAX_VERSION_VARIANTS) {
    issues.push(`Found ${versions.size} different version numbers (expected: ${MAX_VERSION_VARIANTS})`);
  }

  return {
    valid: issues.length === 0,
    issues,
    versions: Array.from(versions)
  };
}

/**
 * RULE 3: Check for copied content instead of references
 */
function checkReferenceDontCopy(content, sections) {
  const violations = [];

  for (const ssot of SINGLE_SOURCE_MAP) {
    // Count mentions of each concept
    const pattern = new RegExp(ssot.concept, 'gi');
    const matches = content.match(pattern);
    
    if (matches && matches.length > 3) {
      // More than 3 mentions might indicate copying
      violations.push({
        concept: ssot.concept,
        canonicalLocation: ssot.location,
        mentions: matches.length
      });
    }
  }

  return violations;
}

/**
 * RULE 4: Check for broken internal references
 */
function checkBrokenReferences(content) {
  const broken = [];
  const refPattern = /\[([^\]]+)\]\(#([^)]+)\)/g;
  const matches = [...content.matchAll(refPattern)];

  for (const match of matches) {
    const anchor = match[2];
    const anchorPattern = new RegExp(`<a\\s+(?:name|id)="${anchor}"`, 'i');
    const headerPattern = new RegExp(`##\\s+${anchor.replace(/-/g, '\\s+')}`, 'i');
    
    if (!anchorPattern.test(content) && !headerPattern.test(content)) {
      broken.push({
        text: match[1],
        anchor: anchor,
        context: content.substring(Math.max(0, match.index - 50), match.index + 50)
      });
    }
  }

  return broken;
}

/**
 * Print formatted results
 */
function printResults(results) {
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`\n${colors.bold}${colors.cyan}📋 Documentation Validation Results${colors.reset}\n`);
  console.log(`${colors.blue}File:${colors.reset} ${results.file}`);
  console.log(`${colors.blue}Date:${colors.reset} ${new Date().toISOString()}\n`);

  // Summary stats
  console.log(`${colors.bold}Statistics:${colors.reset}`);
  console.log(`  Total Sections: ${results.stats.totalSections}`);
  console.log(`  Exact Duplicates: ${results.stats.exactDuplicates}`);
  console.log(`  Near Duplicates: ${results.stats.nearDuplicates}`);
  console.log(`  Version Conflicts: ${results.stats.versionConflicts}`);
  console.log(`  Broken References: ${results.stats.brokenReferences}\n`);

  // Errors
  if (results.errors.length > 0) {
    console.log(`${colors.bold}${colors.red}❌ Errors (${results.errors.length}):${colors.reset}`);
    results.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️  Warnings (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
    console.log('');
  }

  // Duplicates detail
  if (results.duplicates.exact.length > 0) {
    console.log(`${colors.bold}${colors.red}Exact Duplicates:${colors.reset}`);
    results.duplicates.exact.forEach((dup, i) => {
      console.log(`  ${i + 1}. "${dup.section1.title}" (lines ${dup.section1.lineStart}-${dup.section1.lineEnd})`);
      console.log(`     duplicates "${dup.section2.title}" (lines ${dup.section2.lineStart}-${dup.section2.lineEnd})`);
    });
    console.log('');
  }

  if (results.duplicates.near.length > 0 && results.duplicates.near.length <= 10) {
    console.log(`${colors.bold}${colors.yellow}Near Duplicates (${(SIMILARITY_THRESHOLD * 100).toFixed(0)}%+ similar):${colors.reset}`);
    results.duplicates.near.forEach((dup, i) => {
      console.log(`  ${i + 1}. "${dup.section1.title}" ↔️ "${dup.section2.title}" (${(dup.similarity * 100).toFixed(1)}% similar)`);
    });
    console.log('');
  }

  // Final verdict
  if (results.passed) {
    console.log(`${colors.bold}${colors.green}✅ VALIDATION PASSED${colors.reset}\n`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}Please fix the errors above before committing.${colors.reset}\n`);
  }

  // Recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log(`${colors.bold}💡 Recommendations:${colors.reset}`);
    results.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
  }
}

/**
 * Main validation function
 */
function validateDocumentation(filePath) {
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = extractSections(content);

    // Initialize results
    const results = {
      file: filePath,
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: [],
      stats: {
        totalSections: sections.length,
        exactDuplicates: 0,
        nearDuplicates: 0,
        versionConflicts: 0,
        brokenReferences: 0
      },
      duplicates: {
        exact: [],
        near: []
      },
      recommendations: []
    };

    // Run checks
    
    // RULE 1: Check for duplicates
    const duplicates = checkDuplicates(sections);
    results.duplicates = duplicates;
    results.stats.exactDuplicates = duplicates.exact.length;
    results.stats.nearDuplicates = duplicates.near.length;

    if (duplicates.exact.length > 0) {
      results.errors.push(`Found ${duplicates.exact.length} exact duplicate sections`);
      results.passed = false;
      results.recommendations.push('Use UPDATE IN PLACE rule: modify existing sections instead of creating duplicates');
    }

    if (duplicates.near.length > 0) {
      results.warnings.push(`Found ${duplicates.near.length} near-duplicate sections (>85% similar)`);
      results.recommendations.push('Use CONSOLIDATE rule: merge similar sections into one canonical location');
      
      if (options.strict) {
        results.passed = false;
      }
    }

    // RULE 2: Check version control
    const versionCheck = checkVersionControl(content);
    if (!versionCheck.valid) {
      versionCheck.issues.forEach(issue => results.warnings.push(`Version control: ${issue}`));
      results.stats.versionConflicts = versionCheck.versions.length - 1;
      
      if (options.strict) {
        results.passed = false;
      }
    }

    // RULE 3: Check reference don't copy
    const refViolations = checkReferenceDontCopy(content, sections);
    if (refViolations.length > 0) {
      refViolations.forEach(v => {
        results.warnings.push(`Concept "${v.concept}" mentioned ${v.mentions} times - may indicate copying instead of referencing`);
      });
      results.recommendations.push('Use REFERENCE DON\'T COPY rule: link to canonical locations instead of duplicating content');
    }

    // RULE 4: Check for broken references
    const brokenRefs = checkBrokenReferences(content);
    results.stats.brokenReferences = brokenRefs.length;
    
    if (brokenRefs.length > 0) {
      results.errors.push(`Found ${brokenRefs.length} broken internal references`);
      results.passed = false;
      brokenRefs.forEach(ref => {
        results.errors.push(`  Broken link: "${ref.text}" → #${ref.anchor}`);
      });
    }

    // Print results
    printResults(results);

    // Return exit code
    return results.passed ? 0 : 1;

  } catch (error) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.error(`${colors.yellow}File not found: ${filePath}${colors.reset}`);
      console.error(`${colors.yellow}Use --file option to specify correct path${colors.reset}`);
    }
    
    return 1;
  }
}

// Run validation
const exitCode = validateDocumentation(options.file);
process.exit(exitCode);
