import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI();
const CLIENT_DIR = 'client/public/locales';

// Get all language directories
const langs = fs.readdirSync(CLIENT_DIR)
  .filter(f => fs.statSync(path.join(CLIENT_DIR, f)).isDirectory() && f !== 'en');

// Read English source files
const enCommon = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'en/common.json'), 'utf8'));
const enNav = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'en/navigation.json'), 'utf8'));

// Get all leaf paths from an object
function getLeafPaths(obj: any, prefix = ''): { path: string; value: string }[] {
  let result: { path: string; value: string }[] = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result = result.concat(getLeafPaths(obj[key], fullPath));
    } else if (typeof obj[key] === 'string') {
      result.push({ path: fullPath, value: obj[key] });
    }
  }
  return result;
}

// Set nested value
function setNestedValue(obj: any, path: string, value: string): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// Get nested value
function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

// Language names for better translation quality
const langNames: Record<string, string> = {
  'es': 'Spanish', 'es-ar': 'Argentine Spanish', 'pt': 'Portuguese', 'pt-br': 'Brazilian Portuguese',
  'fr': 'French', 'de': 'German', 'it': 'Italian', 'ru': 'Russian', 'zh': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese', 'zh-hk': 'Hong Kong Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  'ar': 'Arabic', 'he': 'Hebrew', 'hi': 'Hindi', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian',
  'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'th': 'Thai', 'vi': 'Vietnamese',
  'id': 'Indonesian', 'ms': 'Malay', 'tl': 'Tagalog', 'cs': 'Czech', 'el': 'Greek', 'hu': 'Hungarian',
  'ro': 'Romanian', 'uk': 'Ukrainian', 'bg': 'Bulgarian', 'hr': 'Croatian', 'sr': 'Serbian',
  'sk': 'Slovak', 'sl': 'Slovenian', 'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian',
  'is': 'Icelandic', 'ga': 'Irish', 'mt': 'Maltese', 'cy': 'Welsh', 'sq': 'Albanian', 'mk': 'Macedonian',
  'bs': 'Bosnian', 'ka': 'Georgian', 'az': 'Azerbaijani', 'hy': 'Armenian', 'bn': 'Bengali',
  'ur': 'Urdu', 'fa': 'Persian', 'sw': 'Swahili', 'zu': 'Zulu', 'xh': 'Xhosa', 'af': 'Afrikaans',
  'am': 'Amharic', 'kn': 'Kannada', 'ml': 'Malayalam', 'ta': 'Tamil', 'te': 'Telugu', 'mr': 'Marathi',
  'gu': 'Gujarati', 'pa': 'Punjabi', 'ne': 'Nepali', 'si': 'Sinhala', 'km': 'Khmer', 'lo': 'Lao',
  'my': 'Burmese', 'mn': 'Mongolian'
};

async function translateBatch(strings: { path: string; value: string }[], lang: string): Promise<Record<string, string>> {
  const langName = langNames[lang] || lang;
  const prompt = `Translate these English UI strings to ${langName}. Return ONLY a valid JSON object with the same keys.
Keep: {{placeholders}}, {variables}, HTML tags. Don't translate "Mundo Tango".

${JSON.stringify(Object.fromEntries(strings.map(s => [s.path, s.value])), null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error(`  Error translating for ${lang}:`, e);
  }
  return {};
}

async function processFile(fileName: string, enData: any) {
  const enPaths = getLeafPaths(enData);
  
  for (const lang of langs) {
    const filePath = path.join(CLIENT_DIR, lang, fileName);
    let langData: any = {};
    
    try {
      langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      // File doesn't exist, will create
    }
    
    // Find missing keys
    const missing: { path: string; value: string }[] = [];
    for (const { path, value } of enPaths) {
      const existing = getNestedValue(langData, path);
      if (!existing || existing === value) {
        missing.push({ path, value });
      }
    }
    
    if (missing.length === 0) continue;
    
    console.log(`[${fileName}] ${lang}: ${missing.length} missing keys`);
    
    // Translate in batches of 20
    for (let i = 0; i < missing.length; i += 20) {
      const batch = missing.slice(i, i + 20);
      const translations = await translateBatch(batch, lang);
      
      for (const [path, translated] of Object.entries(translations)) {
        if (translated && typeof translated === 'string') {
          setNestedValue(langData, path, translated);
        }
      }
      process.stdout.write('.');
    }
    console.log(' ✅');
    
    // Write updated file
    fs.writeFileSync(filePath, JSON.stringify(langData, null, 2) + '\n');
  }
}

async function main() {
  console.log('🔄 Propagating common.json keys...');
  await processFile('common.json', enCommon);
  
  console.log('\n🔄 Propagating navigation.json keys...');
  await processFile('navigation.json', enNav);
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
