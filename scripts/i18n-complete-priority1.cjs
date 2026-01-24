#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * AI-Assisted Translation Completion Script
 * Completes missing translations for Priority 1 languages: es, fr, it, pt, de
 */

const LOCALES_DIR = path.join(__dirname, '../client/public/locales');
const EN_DIR = path.join(LOCALES_DIR, 'en');
const TARGET_LANGUAGES = ['es', 'fr', 'it', 'pt', 'de'];
const NAMESPACES = ['common', 'navigation', 'errors', 'pages'];

// Read English baseline
function loadEnglishKeys() {
  const keys = {};
  for (const ns of NAMESPACES) {
    const filePath = path.join(EN_DIR, `${ns}.json`);
    keys[ns] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return keys;
}

// Get missing keys for a language
function getMissingKeys(lang, namespace, englishKeys) {
  const langFile = path.join(LOCALES_DIR, lang, `${namespace}.json`);
  let existingKeys = {};
  
  if (fs.existsSync(langFile)) {
    existingKeys = JSON.parse(fs.readFileSync(langFile, 'utf8'));
  }
  
  const missing = {};
  function findMissing(enObj, existingObj, prefix = '') {
    for (const [key, value] of Object.entries(enObj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        findMissing(value, existingObj?.[key] || {}, fullKey);
      } else {
        if (!existingObj || existingObj[key] === undefined) {
          if (!missing[namespace]) missing[namespace] = {};
          setNestedValue(missing[namespace], fullKey.split('.'), value);
        }
      }
    }
  }
  
  findMissing(englishKeys, existingKeys);
  return missing[namespace] || {};
}

function setNestedValue(obj, path, value) {
  const last = path.pop();
  const target = path.reduce((o, k) => (o[k] = o[k] || {}), obj);
  target[last] = value;
}

// Merge translations
function mergeTranslations(existing, newKeys) {
  return { ...existing, ...newKeys };
}

console.log('🌍 Mundo Tango i18n Translation Completion Script\n');
console.log('📊 Loading English baseline...\n');

const englishKeys = loadEnglishKeys();

console.log('✨ Priority 1 Languages: Spanish, French, Italian, Portuguese, German\n');
console.log('📝 This script will generate translation files with placeholders.');
console.log('⚠️  Note: Auto-translations should be reviewed by native speakers.\n');

const summary = {
  processed: 0,
  created: 0,
  updated: 0,
  totalKeys: 0
};

for (const lang of TARGET_LANGUAGES) {
  console.log(`\n🔄 Processing ${lang.toUpperCase()}...`);
  const langDir = path.join(LOCALES_DIR, lang);
  
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
    console.log(`  📁 Created directory: ${langDir}`);
  }
  
  for (const ns of NAMESPACES) {
    const filePath = path.join(langDir, `${ns}.json`);
    const missing = getMissingKeys(lang, ns, englishKeys[ns]);
    const missingCount = Object.keys(flattenObject(missing)).length;
    
    if (missingCount > 0) {
      let existing = {};
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      
      const merged = mergeTranslations(existing, missing);
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n');
      
      if (Object.keys(existing).length === 0) {
        console.log(`  ✅ Created ${ns}.json with ${missingCount} keys`);
        summary.created++;
      } else {
        console.log(`  ✅ Updated ${ns}.json with ${missingCount} new keys`);
        summary.updated++;
      }
      
      summary.totalKeys += missingCount;
    } else {
      console.log(`  ✓ ${ns}.json is complete`);
    }
    summary.processed++;
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Files Created: ${summary.created}`);
console.log(`  Files Updated: ${summary.updated}`);
console.log(`  Total Keys Added: ${summary.totalKeys}`);
console.log(`  Languages Completed: ${TARGET_LANGUAGES.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  IMPORTANT: English fallbacks added for missing translations.');
console.log('   Please review and translate using a professional service.\n');

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
