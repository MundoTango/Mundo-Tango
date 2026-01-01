import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI();
const CLIENT_DIR = 'client/public/locales';
const BACKUP_DIR = 'public/locales';

const LANG_NAMES: Record<string, string> = {
  'af': 'Afrikaans', 'am': 'Amharic', 'ar': 'Arabic', 'az': 'Azerbaijani',
  'bg': 'Bulgarian', 'bn': 'Bengali', 'bs': 'Bosnian', 'ca': 'Catalan',
  'cs': 'Czech', 'cy': 'Welsh', 'da': 'Danish', 'de': 'German',
  'el': 'Greek', 'es': 'Spanish', 'es-ar': 'Argentine Spanish', 'et': 'Estonian',
  'fa': 'Persian', 'fi': 'Finnish', 'fr': 'French', 'ga': 'Irish',
  'gu': 'Gujarati', 'he': 'Hebrew', 'hi': 'Hindi', 'hr': 'Croatian',
  'hu': 'Hungarian', 'hy': 'Armenian', 'id': 'Indonesian', 'is': 'Icelandic',
  'it': 'Italian', 'ja': 'Japanese', 'ka': 'Georgian', 'km': 'Khmer',
  'kn': 'Kannada', 'ko': 'Korean', 'lo': 'Lao', 'lt': 'Lithuanian',
  'lv': 'Latvian', 'mk': 'Macedonian', 'ml': 'Malayalam', 'mn': 'Mongolian',
  'mr': 'Marathi', 'ms': 'Malay', 'mt': 'Maltese', 'my': 'Burmese',
  'ne': 'Nepali', 'nl': 'Dutch', 'no': 'Norwegian', 'pa': 'Punjabi',
  'pl': 'Polish', 'pt': 'Portuguese', 'pt-br': 'Brazilian Portuguese',
  'ro': 'Romanian', 'ru': 'Russian', 'si': 'Sinhala', 'sk': 'Slovak',
  'sl': 'Slovenian', 'sq': 'Albanian', 'sr': 'Serbian', 'sv': 'Swedish',
  'sw': 'Swahili', 'ta': 'Tamil', 'te': 'Telugu', 'th': 'Thai',
  'tl': 'Tagalog', 'tr': 'Turkish', 'uk': 'Ukrainian', 'ur': 'Urdu',
  'vi': 'Vietnamese', 'xh': 'Xhosa', 'zh': 'Simplified Chinese',
  'zh-hk': 'Cantonese', 'zh-tw': 'Traditional Chinese', 'zu': 'Zulu'
};

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

function setValueAtPath(obj: any, pathStr: string, value: string) {
  if (!pathStr || typeof pathStr !== 'string') return;
  const keys = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

async function translateBatch(
  strings: { path: string; value: string }[],
  targetLang: string
): Promise<{ path: string; value: string }[]> {
  const langName = LANG_NAMES[targetLang] || targetLang;
  
  // Create a simple JSON object for translation
  const inputObj: Record<string, string> = {};
  strings.forEach((s, i) => {
    inputObj[`k${i}`] = s.value;
  });
  
  const prompt = `Translate these UI strings from English to ${langName}.

CRITICAL RULES:
1. Keep ALL placeholders exactly as-is: {{name}}, {{count}}, {variable}, etc.
2. Keep HTML tags unchanged: <strong>, <a href="...">, etc.
3. Return ONLY a valid JSON object with the same keys (k0, k1, k2...) and translated values.
4. Do NOT add any prefixes, numbers, or separators to the translations.

Input JSON:
${JSON.stringify(inputObj, null, 2)}

Output only the JSON object with translated values:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);
    
    return strings.map((s, i) => ({
      path: s.path,
      value: parsed[`k${i}`] || s.value
    }));
  } catch (e) {
    console.error('API error:', e);
    return strings;
  }
}

async function translateLanguage(lang: string) {
  const langPath = path.join(CLIENT_DIR, lang, 'pages.json');
  const enPath = path.join(CLIENT_DIR, 'en', 'pages.json');
  
  if (!fs.existsSync(langPath)) {
    console.log(`⚠️ ${lang}: File not found, skipping`);
    return;
  }
  
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  const allStrings = getLeafPaths(langData);
  const enStrings = getLeafPaths(enData);
  const enMap = new Map(enStrings.map(s => [s.path, s.value]));
  
  // Find strings that are still in English (exact match)
  const needsTranslation = allStrings.filter(s => s.value === enMap.get(s.path));
  
  if (needsTranslation.length === 0) {
    console.log(`✅ ${lang}: Already complete`);
    return;
  }
  
  console.log(`🔄 ${lang}: Translating ${needsTranslation.length} strings...`);
  
  const BATCH = 25; // Smaller batches for reliability
  for (let i = 0; i < needsTranslation.length; i += BATCH) {
    const batch = needsTranslation.slice(i, i + BATCH);
    const translated = await translateBatch(batch, lang);
    for (const t of translated) {
      if (t.path) setValueAtPath(langData, t.path, t.value);
    }
    process.stdout.write(`[${Math.round((i/needsTranslation.length)*100)}%]`);
  }
  
  fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
  fs.mkdirSync(path.dirname(path.join(BACKUP_DIR, lang, 'pages.json')), { recursive: true });
  fs.writeFileSync(path.join(BACKUP_DIR, lang, 'pages.json'), JSON.stringify(langData, null, 2));
  console.log(` ✅ ${lang}: Done!`);
}

async function main() {
  const langs = process.argv.slice(2);
  for (const lang of langs) {
    await translateLanguage(lang);
  }
}

main().catch(console.error);
