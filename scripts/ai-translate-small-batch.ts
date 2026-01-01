import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI();
const CLIENT_DIR = 'client/public/locales';
const BACKUP_DIR = 'public/locales';

const LANG_NAMES: Record<string, string> = {
  'lo': 'Lao', 'mt': 'Maltese', 'tl': 'Tagalog'
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
  const keys = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

async function translateBatch(strings: { path: string; value: string }[], targetLang: string) {
  const langName = LANG_NAMES[targetLang] || targetLang;
  const inputObj: Record<string, string> = {};
  strings.forEach((s, i) => { inputObj[`k${i}`] = s.value; });
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Translate to ${langName}. Return JSON with same keys. Keep {{placeholders}}.\n${JSON.stringify(inputObj)}` }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return strings.map((s, i) => ({ path: s.path, value: parsed[`k${i}`] || s.value }));
  } catch (e) { return strings; }
}

async function translateLanguage(lang: string) {
  const langPath = path.join(CLIENT_DIR, lang, 'pages.json');
  const enPath = path.join(CLIENT_DIR, 'en', 'pages.json');
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const allStrings = getLeafPaths(langData);
  const enStrings = getLeafPaths(enData);
  const enMap = new Map(enStrings.map(s => [s.path, s.value]));
  const needsTranslation = allStrings.filter(s => s.value === enMap.get(s.path));
  
  if (needsTranslation.length === 0) { console.log(`✅ ${lang}: Complete`); return; }
  console.log(`🔄 ${lang}: ${needsTranslation.length} strings`);
  
  const BATCH = 10; // Smaller batches
  for (let i = 0; i < needsTranslation.length; i += BATCH) {
    const translated = await translateBatch(needsTranslation.slice(i, i + BATCH), lang);
    for (const t of translated) setValueAtPath(langData, t.path, t.value);
    process.stdout.write('.');
    // Save periodically
    if (i % 100 === 0) {
      fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
    }
  }
  fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
  fs.mkdirSync(path.dirname(path.join(BACKUP_DIR, lang, 'pages.json')), { recursive: true });
  fs.writeFileSync(path.join(BACKUP_DIR, lang, 'pages.json'), JSON.stringify(langData, null, 2));
  console.log(` ✅`);
}

async function main() {
  for (const lang of process.argv.slice(2)) await translateLanguage(lang);
}
main();
