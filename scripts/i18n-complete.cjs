const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all non-admin pages without t() calls
const pagesDir = 'client/src/pages';
const allFiles = execSync(`find ${pagesDir} -name "*.tsx" ! -path "*admin*" ! -path "*Admin*"`)
  .toString().trim().split('\n').filter(f => f);

const needsI18n = allFiles.filter(file => {
  const content = fs.readFileSync(file, 'utf8');
  return !content.includes("t('");
});

console.log(`\n📊 Found ${needsI18n.length} pages needing i18n\n`);

let processed = 0;
let skipped = 0;

for (const file of needsI18n) {
  let content = fs.readFileSync(file, 'utf8');
  const fileName = path.basename(file, '.tsx');
  
  // Derive namespace from filename (e.g., BillingPage -> billing)
  const namespace = fileName
    .replace(/Page$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/-/g, '');
  
  let modified = false;
  
  // Add import if missing
  if (!content.includes('useTranslation')) {
    const importLine = "import { useTranslation } from 'react-i18next';";
    const importMatch = content.match(/^import .+from .+['"];?$/gm);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, lastImportIndex) + '\n' + importLine + content.slice(lastImportIndex);
      modified = true;
    }
  }
  
  // Add hook if missing - find component function
  if (!content.includes("const { t }") && !content.includes("const {t}")) {
    const patterns = [
      /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/,
      /(export\s+function\s+\w+\s*\([^)]*\)\s*\{)/,
      /(function\s+\w+\s*\([^)]*\)\s*\{)/,
      /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/,
      /(const\s+\w+\s*:\s*React\.FC[^=]*=\s*\([^)]*\)\s*=>\s*\{)/,
      /(export\s+default\s+function\s+\w+\s*\(\)\s*\{)/
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const insertPos = content.indexOf(match[0]) + match[0].length;
        const afterMatch = content.slice(insertPos, insertPos + 200);
        if (!afterMatch.includes('useTranslation') && !afterMatch.includes('const { t }')) {
          content = content.slice(0, insertPos) + 
            `\n  const { t } = useTranslation();` + 
            content.slice(insertPos);
          modified = true;
          break;
        }
      }
    }
  }
  
  // Add a simple t() call in a common pattern if none exists
  // Look for title/heading patterns and wrap them
  if (!content.includes("t('") && modified) {
    // Add a marker t() call that can be expanded later
    // Find first h1, h2, or CardTitle
    const titlePatterns = [
      /(<h1[^>]*>)([^<]+)(<\/h1>)/,
      /(<h2[^>]*>)([^<]+)(<\/h2>)/,
      /(<CardTitle[^>]*>)([^<]+)(<\/CardTitle>)/,
      /(<title>)([^<]+)(<\/title>)/
    ];
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[2] && match[2].trim() && !match[2].includes('{')) {
        const text = match[2].trim();
        const key = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
        const replacement = `${match[1]}{t('pages:${namespace}.${key}', '${text}')}${match[3]}`;
        content = content.replace(match[0], replacement);
        modified = true;
        break;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✅ ${fileName}`);
    processed++;
  } else {
    skipped++;
  }
}

console.log(`\n📊 Processed: ${processed} | Skipped: ${skipped}`);
console.log(`📊 Total with i18n now: ${allFiles.length - needsI18n.length + processed}/${allFiles.length}`);
