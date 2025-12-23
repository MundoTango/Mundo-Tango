const fs = require('fs');
const path = require('path');

// Get all pages without t() calls
const { execSync } = require('child_process');
const remaining = execSync(`find client/src/pages -name "*.tsx" ! -path "*admin*" ! -path "*Admin*" ! -exec grep -l "t('" {} \\; 2>/dev/null`).toString().trim().split('\n').filter(f => f);

console.log(`Found ${remaining.length} pages without i18n`);

let processed = 0;
for (const file of remaining) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already has useTranslation
  if (content.includes('useTranslation')) {
    console.log(`SKIP (has hook): ${file}`);
    continue;
  }
  
  // Add import at top after existing imports
  const importLine = "import { useTranslation } from 'react-i18next';";
  
  // Find last import statement
  const importMatch = content.match(/^import .+from .+;$/gm);
  if (importMatch && importMatch.length > 0) {
    const lastImport = importMatch[importMatch.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
    content = content.slice(0, lastImportIndex) + '\n' + importLine + content.slice(lastImportIndex);
  }
  
  // Find component function and add useTranslation hook
  // Match: export default function ComponentName() { or function ComponentName() { or const ComponentName = () => {
  const funcPatterns = [
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/,
    /export\s+function\s+\w+\s*\([^)]*\)\s*\{/,
    /function\s+\w+\s*\([^)]*\)\s*\{/,
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,
    /const\s+\w+\s*:\s*React\.FC[^=]*=\s*\([^)]*\)\s*=>\s*\{/
  ];
  
  let hookAdded = false;
  for (const pattern of funcPatterns) {
    const match = content.match(pattern);
    if (match) {
      const insertPos = content.indexOf(match[0]) + match[0].length;
      // Check if hook already exists after this
      const afterMatch = content.slice(insertPos, insertPos + 200);
      if (!afterMatch.includes('useTranslation')) {
        content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
        hookAdded = true;
        break;
      }
    }
  }
  
  if (hookAdded) {
    fs.writeFileSync(file, content);
    console.log(`DONE: ${file}`);
    processed++;
  } else {
    console.log(`SKIP (no func match): ${file}`);
  }
}

console.log(`\nProcessed ${processed} files`);
