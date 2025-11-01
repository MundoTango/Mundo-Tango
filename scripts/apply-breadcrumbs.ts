#!/usr/bin/env tsx

/**
 * Automated Breadcrumb Rollout Script
 * Applies PageLayout wrapper to pages missing breadcrumbs
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PAGES_DIR = path.join(__dirname, '../client/src/pages');
const DRY_RUN = process.argv.includes('--dry-run');

interface PageInfo {
  path: string;
  hasPageLayout: boolean;
  hasTitle: boolean;
  category: string;
}

async function analyzePage(filePath: string): Promise<PageInfo> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(PAGES_DIR, filePath);
  
  return {
    path: filePath,
    hasPageLayout: content.includes('import') && content.includes('PageLayout'),
    hasTitle: /<h1[^>]*>/.test(content),
    category: getCategoryFromPath(relativePath)
  };
}

function getCategoryFromPath(relativePath: string): string {
  if (relativePath.startsWith('admin/')) return 'Admin';
  if (relativePath.startsWith('marketing/')) return 'Marketing Agents';
  if (relativePath.startsWith('hr/')) return 'HR Agents';
  if (relativePath.startsWith('life-ceo/')) return 'Life CEO';
  if (relativePath.startsWith('onboarding/')) return 'Onboarding';
  if (relativePath.includes('Settings')) return 'Settings';
  if (relativePath.includes('Event') || relativePath.includes('Workshop')) return 'Events';
  return 'Other';
}

function applyPageLayout(filePath: string, content: string): string {
  // Extract existing title from h1 tag
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.tsx').replace('Page', '');
  
  // Add import if not present
  let newContent = content;
  if (!content.includes("import { PageLayout }")) {
    const lastImportIndex = newContent.lastIndexOf('import');
    const endOfLastImport = newContent.indexOf('\n', lastImportIndex);
    newContent = newContent.slice(0, endOfLastImport + 1) +
      `import { PageLayout } from "@/components/PageLayout";\n` +
      newContent.slice(endOfLastImport + 1);
  }

  // Find the main return statement
  const returnMatch = newContent.match(/return\s*\(/);
  if (!returnMatch) return content; // Skip if no return found

  const returnIndex = returnMatch.index!;
  const afterReturn = newContent.indexOf('(', returnIndex) + 1;
  
  // Find the matching closing paren
  let depth = 1;
  let endIndex = afterReturn;
  while (depth > 0 && endIndex < newContent.length) {
    if (newContent[endIndex] === '(') depth++;
    if (newContent[endIndex] === ')') depth--;
    endIndex++;
  }
  
  const existingJSX = newContent.slice(afterReturn, endIndex - 1).trim();
  
  // Remove existing h1 and container if present
  let cleanedJSX = existingJSX;
  if (titleMatch) {
    cleanedJSX = cleanedJSX.replace(/<div[^>]*mb-8[^>]*>[\s\S]*?<\/h1>[\s\S]*?<\/div>/, '');
    cleanedJSX = cleanedJSX.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '');
  }

  // Wrap with PageLayout
  const wrappedJSX = `<PageLayout title="${title}" showBreadcrumbs>\n${cleanedJSX}\n    </PageLayout>`;
  
  newContent = newContent.slice(0, afterReturn) +
    '\n    ' + wrappedJSX +
    newContent.slice(endIndex - 1);

  return newContent;
}

async function main() {
  console.log('🔍 Scanning for pages without breadcrumbs...\n');

  const pageFiles = await glob('**/*.tsx', { cwd: PAGES_DIR });
  const pages: PageInfo[] = [];

  for (const file of pageFiles) {
    const fullPath = path.join(PAGES_DIR, file);
    const info = await analyzePage(fullPath);
    pages.push(info);
  }

  // Group by category
  const byCategory = pages.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, PageInfo[]>);

  // Report
  console.log('📊 Analysis Results:');
  console.log('─'.repeat(70));
  
  let totalPages = 0;
  let pagesWithBreadcrumbs = 0;
  let pagesToUpdate = 0;

  Object.entries(byCategory).forEach(([category, categoryPages]) => {
    const withBreadcrumbs = categoryPages.filter(p => p.hasPageLayout).length;
    const without = categoryPages.length - withBreadcrumbs;
    
    totalPages += categoryPages.length;
    pagesWithBreadcrumbs += withBreadcrumbs;
    pagesToUpdate += without;

    console.log(`  ${category.padEnd(20)} ${categoryPages.length.toString().padStart(3)} pages  (${withBreadcrumbs} ✅  ${without} ⏳)`);
  });

  console.log('─'.repeat(70));
  console.log(`  TOTAL: ${totalPages} pages | ${pagesWithBreadcrumbs} with breadcrumbs | ${pagesToUpdate} to update\n`);

  if (DRY_RUN) {
    console.log('🔍 DRY RUN - No files will be modified');
    console.log('   Remove --dry-run flag to apply changes\n');
    return;
  }

  // Apply breadcrumbs
  console.log('🚀 Applying breadcrumbs...\n');

  let updated = 0;
  for (const page of pages) {
    if (page.hasPageLayout) continue;

    try {
      const content = fs.readFileSync(page.path, 'utf-8');
      const newContent = applyPageLayout(page.path, content);
      
      if (newContent !== content) {
        fs.writeFileSync(page.path, newContent);
        console.log(`  ✅ ${path.relative(PAGES_DIR, page.path)}`);
        updated++;
      }
    } catch (error) {
      console.error(`  ❌ ${path.relative(PAGES_DIR, page.path)} - ${error}`);
    }
  }

  console.log(`\n✅ Complete! Updated ${updated} pages\n`);
}

main().catch(console.error);
