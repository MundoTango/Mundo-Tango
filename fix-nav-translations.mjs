import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  baseURL: 'https://api.perplexity.ai',
  apiKey: process.env.PPLX_API_KEY
});

const missingKeys = {
  common: {
    home: 'home',
    ambassadors: 'Ambassadors',
    forDancers: 'For Dancers',
    forTeachers: 'For Teachers',
    forOrganizers: 'For Organizers',
    tangoRoles: 'Tango Roles',
    openSource: 'Open Source'
  }
};

async function translate(text, targetLang) {
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `Translate to ${targetLang}. Return ONLY the translation, nothing else.`
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.3
    });
    await new Promise(resolve => setTimeout(resolve, 30));
    return res.choices[0].message.content.trim();
  } catch (e) {
    console.error(`Error translating "${text}" to ${targetLang}:`, e.message);
    return text;
  }
}

const languages = {
  af: 'Afrikaans', ar: 'Arabic', bn: 'Bengali', bg: 'Bulgarian', ca: 'Catalan',
  zh: 'Chinese', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch',
  en: 'English', et: 'Estonian', fi: 'Finnish', fr: 'French', de: 'German',
  el: 'Greek', he: 'Hebrew', hi: 'Hindi', hu: 'Hungarian', is: 'Icelandic',
  id: 'Indonesian', it: 'Italian', ja: 'Japanese', ko: 'Korean', lv: 'Latvian',
  lt: 'Lithuanian', ms: 'Malay', no: 'Norwegian', fa: 'Persian', pl: 'Polish',
  pt: 'Portuguese', ro: 'Romanian', ru: 'Russian', sr: 'Serbian', sk: 'Slovak',
  sl: 'Slovenian', es: 'Spanish', es_AR: 'Spanish (Argentina)', sv: 'Swedish',
  th: 'Thai', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', vi: 'Vietnamese'
};

async function main() {
  const localesDir = path.join(__dirname, 'client/public/locales');
  let count = 0;
  const total = Object.keys(languages).length;
  
  for (const [code, name] of Object.entries(languages)) {
    count++;
    console.log(`[${count}/${total}] Processing ${code} (${name})...`);
    
    const commonFile = path.join(localesDir, code, 'common.json');
    
    if (!fs.existsSync(path.dirname(commonFile))) {
      fs.mkdirSync(path.dirname(commonFile), { recursive: true });
    }
    
    let common = {};
    if (fs.existsSync(commonFile)) {
      common = JSON.parse(fs.readFileSync(commonFile, 'utf8'));
    }
    
    let updated = false;
    for (const [key, value] of Object.entries(missingKeys.common)) {
      if (!common[key]) {
        if (code === 'en') {
          common[key] = value;
        } else {
          common[key] = await translate(value, name);
        }
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(commonFile, JSON.stringify(common, null, 2));
      console.log(`  ✓ Updated common.json for ${code}`);
    } else {
      console.log(`  - No updates needed for ${code}`);
    }
  }
  
  console.log('\n✅ Done! All missing navigation keys have been added and translated.');
}

main().catch(console.error);
