import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const langs = {
  'af':'Afrikaans','am':'Amharic','ar':'Arabic','az':'Azerbaijani','bg':'Bulgarian','bn':'Bengali','bs':'Bosnian','ca':'Catalan','cs':'Czech','cy':'Welsh','da':'Danish','de':'German','el':'Greek','es-ar':'Argentine Spanish with voseo','es':'Spanish','et':'Estonian','eu':'Basque','fa':'Persian','fi':'Finnish','fil':'Filipino','fr':'French','ga':'Irish','gl':'Galician','gu':'Gujarati','he':'Hebrew','hi':'Hindi','hr':'Croatian','hu':'Hungarian','hy':'Armenian','id':'Indonesian','is':'Icelandic','it':'Italian','ja':'Japanese','ka':'Georgian','kk':'Kazakh','km':'Khmer','kn':'Kannada','ko':'Korean','lo':'Lao','lt':'Lithuanian','lv':'Latvian','mk':'Macedonian','ml':'Malayalam','mn':'Mongolian','mr':'Marathi','ms':'Malay','mt':'Maltese','my':'Burmese','ne':'Nepali','nl':'Dutch','no':'Norwegian','pa':'Punjabi','pl':'Polish','ps':'Pashto','pt':'Portuguese','ro':'Romanian','ru':'Russian','si':'Sinhala','sk':'Slovak','sl':'Slovenian','sq':'Albanian','sr':'Serbian','sv':'Swedish','sw':'Swahili','ta':'Tamil','te':'Telugu','th':'Thai','tl':'Tagalog','tr':'Turkish','uk':'Ukrainian','ur':'Urdu','uz':'Uzbek','vi':'Vietnamese','zh':'Chinese','zu':'Zulu'
};

async function trans(obj, lang) {
  const r = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      r[k] = await trans(v, lang);
    } else if (typeof v === 'string') {
      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{role:'system',content:`Translate to ${lang}. Return ONLY translation.`},{role:'user',content:v}],
          temperature: 0.3
        });
        r[k] = res.choices[0].message.content.trim();
        await new Promise(resolve => setTimeout(resolve, 30));
      } catch (e) {
        r[k] = v;
      }
    } else {
      r[k] = v;
    }
  }
  return r;
}

async function main() {
  const base = 'client/public/locales';
  const files = ['navigation', 'common'];
  const langCodes = Object.keys(langs).filter(l => l !== 'en');
  let done = 0;
  const total = langCodes.length * files.length;
  
  console.log(`\nTranslating ${files.join(', ')} to ${langCodes.length} languages...\n`);
  
  for (const code of langCodes) {
    for (const file of files) {
      try {
        const src = path.join(base, 'en', `${file}.json`);
        const dst = path.join(base, code, `${file}.json`);
        const en = JSON.parse(fs.readFileSync(src, 'utf-8'));
        console.log(`[${done+1}/${total}] ${file} -> ${langs[code]}...`);
        const translated = await trans(en, langs[code]);
        fs.writeFileSync(dst, JSON.stringify(translated, null, 2));
        done++;
        console.log(`✓ ${((done/total)*100).toFixed(1)}%\n`);
      } catch (e) {
        console.error(`Error ${code}/${file}:`, e.message);
        done++;
      }
    }
  }
  console.log(`\n🎉 Done! ${done}/${total} files translated.`);
}

main().catch(console.error);
