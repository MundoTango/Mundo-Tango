const fs = require('fs');
const { execSync } = require('child_process');

// Get all pages without t() calls
const remaining = execSync(`find client/src/pages -name "*.tsx" ! -path "*admin*" ! -path "*Admin*" ! -exec grep -l "t('" {} \\; 2>/dev/null`).toString().trim().split('\n').filter(f => f);

console.log(`Found ${remaining.length} pages without i18n`);

let processed = 0;
for (const file of remaining) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already has useTranslation  
  if (content.includes('useTranslation')) {
    continue;
  }
  
  // Add import
  const importLine = "import { useTranslation } from 'react-i18next';";
  const importMatch = content.match(/^import .+from .+;$/gm);
  if (importMatch && importMatch.length > 0) {
    const lastImport = importMatch[importMatch.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
    content = content.slice(0, lastImportIndex) + '\n' + importLine + content.slice(lastImportIndex);
  }
  
  // Add hook after function declaration
  const funcPatterns = [
    /(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)/,
    /(export\s+function\s+\w+\s*\([^)]*\)\s*\{)/,
    /(function\s+\w+Page\s*\([^)]*\)\s*\{)/,
    /(const\s+\w+\s*=\s*\(\)\s*=>\s*\{)/
  ];
  
  let hookAdded = false;
  for (const pattern of funcPatterns) {
    const match = content.match(pattern);
    if (match) {
      const insertPos = content.indexOf(match[0]) + match[0].length;
      const afterMatch = content.slice(insertPos, insertPos + 300);
      if (!afterMatch.includes('useTranslation')) {
        content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
        hookAdded = true;
        break;
      }
    }
  }
  
  if (hookAdded) {
    fs.writeFileSync(file, content);
    console.log(`+ ${file}`);
    processed++;
  }
}

console.log(`\nInjected useTranslation into ${processed} files`);
