const fs = require('fs');
const path = require('path');

const localesDir = 'public/locales';
const namespaces = ['common', 'navigation', 'pages', 'errors'];

const allLangs = [
  'en', 'es-ar', 'es', 'pt', 'fr', 'de', 'it',
  'zh', 'ja', 'ko', 'ru', 'ar', 'hi',
  'nl', 'sv', 'no', 'da', 'fi', 'pl',
  'tr', 'he', 'th', 'vi', 'id', 'ms',
  'tl', 'cs', 'el', 'hu', 'ro', 'uk',
  'bg', 'hr', 'sr', 'sk', 'sl', 'et',
  'lv', 'lt', 'is', 'ga', 'mt', 'cy',
  'sq', 'mk', 'bs', 'ka', 'az', 'hy',
  'bn', 'ur', 'fa', 'sw', 'zu', 'xh',
  'af', 'am', 'kn', 'ml', 'ta', 'te',
  'mr', 'gu', 'pa', 'ne', 'si', 'km',
  'lo', 'my', 'mn'
];

console.log('📦 Generating placeholder translation files for all 69 languages...\n');

let created = 0;
let skipped = 0;

for (const lang of allLangs) {
  const langDir = path.join(localesDir, lang);
  
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
    console.log(`📁 Created directory: ${lang}/`);
  }
  
  for (const ns of namespaces) {
    const targetFile = path.join(langDir, `${ns}.json`);
    const sourceFile = path.join(localesDir, 'en', `${ns}.json`);
    
    if (fs.existsSync(targetFile)) {
      const content = fs.readFileSync(targetFile, 'utf8').trim();
      if (content && content !== '{}' && content.length > 10) {
        skipped++;
        continue;
      }
    }
    
    if (fs.existsSync(sourceFile)) {
      const content = fs.readFileSync(sourceFile, 'utf8');
      fs.writeFileSync(targetFile, content);
      console.log(`✅ ${lang}/${ns}.json`);
      created++;
    }
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Created/Updated: ${created} files`);
console.log(`   Skipped (already exists): ${skipped} files`);
console.log(`   Languages: ${allLangs.length}`);
console.log(`   Namespaces: ${namespaces.length}`);
console.log(`\n✅ All translation files ready!`);
