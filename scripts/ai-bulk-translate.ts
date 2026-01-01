import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI();
const CLIENT_DIR = 'client/public/locales';
const BACKUP_DIR = 'public/locales';

// Language display names for translation context
const LANG_NAMES: Record<string, string> = {
  'af': 'Afrikaans', 'ar': 'Arabic', 'bg': 'Bulgarian', 'bn': 'Bengali',
  'ca': 'Catalan', 'cs': 'Czech', 'da': 'Danish', 'de': 'German',
  'el': 'Greek', 'es': 'Spanish', 'es-ar': 'Argentine Spanish', 'et': 'Estonian',
  'fa': 'Persian/Farsi', 'fi': 'Finnish', 'fr': 'French', 'gu': 'Gujarati',
  'he': 'Hebrew', 'hi': 'Hindi', 'hr': 'Croatian', 'hu': 'Hungarian',
  'id': 'Indonesian', 'it': 'Italian', 'ja': 'Japanese', 'kn': 'Kannada',
  'ko': 'Korean', 'lt': 'Lithuanian', 'lv': 'Latvian', 'ml': 'Malayalam',
  'mr': 'Marathi', 'ms': 'Malay', 'nl': 'Dutch', 'no': 'Norwegian',
  'pa': 'Punjabi', 'pl': 'Polish', 'pt': 'Portuguese', 'pt-br': 'Brazilian Portuguese',
  'ro': 'Romanian', 'ru': 'Russian', 'sk': 'Slovak', 'sl': 'Slovenian',
  'sv': 'Swedish', 'sw': 'Swahili', 'ta': 'Tamil', 'te': 'Telugu',
  'th': 'Thai', 'tl': 'Tagalog/Filipino', 'tr': 'Turkish', 'uk': 'Ukrainian',
  'ur': 'Urdu', 'vi': 'Vietnamese', 'xh': 'Xhosa', 'zh': 'Simplified Chinese',
  'zh-hk': 'Hong Kong Cantonese', 'zh-tw': 'Traditional Chinese (Taiwan)',
  'zu': 'Zulu'
};

// Get all leaf values with their paths
function getLeafPaths(obj: any, prefix = ''): { path: string; value: string }[] {
  let results: { path: string; value: string }[] = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      results = results.concat(getLeafPaths(obj[key], fullPath));
    } else if (typeof obj[key] === 'string') {
      results.push({ path: fullPath, value: obj[key] });
    }
  }
  return results;
}

// Set value at path
function setValueAtPath(obj: any, path: string, value: string) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// Translate a batch of strings
async function translateBatch(
  strings: { path: string; value: string }[],
  targetLang: string
): Promise<{ path: string; value: string }[]> {
  const langName = LANG_NAMES[targetLang] || targetLang;
  
  const prompt = `Translate the following UI strings to ${langName}. 
CRITICAL RULES:
1. Preserve ALL placeholders exactly as-is: {{name}}, {{count}}, {variable}, etc.
2. Keep HTML tags unchanged: <strong>, <a>, etc.
3. Maintain the same tone (formal/informal) as English
4. For RTL languages (Arabic, Hebrew, Persian, Urdu): use proper RTL text
5. Return ONLY a JSON array of translated strings in the same order

Input strings (translate ONLY the "value" field):
${JSON.stringify(strings.map(s => ({ path: s.path, value: s.value })), null, 2)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(content);
  return parsed.translations || parsed.strings || strings;
}

async function translateLanguage(lang: string) {
  const langPath = path.join(CLIENT_DIR, lang, 'pages.json');
  const enPath = path.join(CLIENT_DIR, 'en', 'pages.json');
  
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  // Find all English strings that need translation
  const allStrings = getLeafPaths(langData);
  const enStrings = getLeafPaths(enData);
  const enMap = new Map(enStrings.map(s => [s.path, s.value]));
  
  // Find strings that are still in English
  const needsTranslation = allStrings.filter(s => {
    const enValue = enMap.get(s.path);
    return s.value === enValue; // Same as English = needs translation
  });
  
  if (needsTranslation.length === 0) {
    console.log(`✅ ${lang}: Already fully translated`);
    return;
  }
  
  console.log(`🔄 ${lang}: Translating ${needsTranslation.length} strings...`);
  
  // Batch in chunks of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < needsTranslation.length; i += BATCH_SIZE) {
    const batch = needsTranslation.slice(i, i + BATCH_SIZE);
    try {
      const translated = await translateBatch(batch, lang);
      for (const t of translated) {
        setValueAtPath(langData, t.path, t.value);
      }
      process.stdout.write('.');
    } catch (e) {
      console.error(`Error batch ${i}:`, e);
    }
  }
  
  // Save
  fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
  fs.mkdirSync(path.dirname(path.join(BACKUP_DIR, lang, 'pages.json')), { recursive: true });
  fs.writeFileSync(path.join(BACKUP_DIR, lang, 'pages.json'), JSON.stringify(langData, null, 2));
  console.log(`\n✅ ${lang}: Complete!`);
}

// Main
async function main() {
  const targetLangs = process.argv.slice(2);
  if (targetLangs.length === 0) {
    console.log('Usage: npx tsx scripts/ai-bulk-translate.ts <lang1> <lang2> ...');
    console.log('Example: npx tsx scripts/ai-bulk-translate.ts th id ms');
    return;
  }
  
  for (const lang of targetLangs) {
    await translateLanguage(lang);
  }
}

main().catch(console.error);
