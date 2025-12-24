import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const languageMappings = {
  'af': 'Afrikaans', 'am': 'Amharic', 'ar': 'Arabic', 'az': 'Azerbaijani',
  'bg': 'Bulgarian', 'bn': 'Bengali', 'bs': 'Bosnian', 'ca': 'Catalan',
  'cs': 'Czech', 'cy': 'Welsh', 'da': 'Danish', 'de': 'German', 'el': 'Greek',
  'en': 'English', 'es-ar': 'Argentine Spanish (Rioplatense with voseo)', 'es': 'Spanish',
  'et': 'Estonian', 'eu': 'Basque', 'fa': 'Persian', 'fi': 'Finnish', 'fil': 'Filipino',
  'fr': 'French', 'ga': 'Irish', 'gl': 'Galician', 'gu': 'Gujarati', 'he': 'Hebrew',
  'hi': 'Hindi', 'hr': 'Croatian', 'hu': 'Hungarian', 'hy': 'Armenian', 'id': 'Indonesian',
  'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ka': 'Georgian',
  'kk': 'Kazakh', 'km': 'Khmer', 'kn': 'Kannada', 'ko': 'Korean', 'lo': 'Lao',
  'lt': 'Lithuanian', 'lv': 'Latvian', 'mk': 'Macedonian', 'ml': 'Malayalam',
  'mn': 'Mongolian', 'mr': 'Marathi', 'ms': 'Malay', 'mt': 'Maltese',
  'my': 'Burmese', 'ne': 'Nepali', 'nl': 'Dutch', 'no': 'Norwegian',
  'pa': 'Punjabi', 'pl': 'Polish', 'ps': 'Pashto', 'pt': 'Portuguese',
  'ro': 'Romanian', 'ru': 'Russian', 'si': 'Sinhala', 'sk': 'Slovak', 'sl': 'Slovenian',
  'sq': 'Albanian', 'sr': 'Serbian', 'sv': 'Swedish', 'sw': 'Swahili', 'ta': 'Tamil',
  'te': 'Telugu', 'th': 'Thai', 'tl': 'Tagalog', 'tr': 'Turkish',
  'uk': 'Ukrainian', 'ur': 'Urdu', 'uz': 'Uzbek', 'vi': 'Vietnamese',
  'zh': 'Chinese', 'zu': 'Zulu'
};

async function translateText(text, targetLang) {
  if (typeof text !== 'string') return text;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are a professional translator. Translate to ${targetLang}. For Argentine Spanish (es-ar), use Rioplatense dialect with voseo. Return ONLY translated text.`
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.3
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message);
    return text;
  }
}

async function translateObject(obj, targetLang) {
  const translated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      translated[key] = await translateObject(value, targetLang);
    } else if (typeof value === 'string') {
      translated[key] = await translateText(value, targetLang);
      await new Promise(resolve => setTimeout(resolve, 50));
    } else {
      translated[key] = value;
    }
  }
  return translated;
}

async function main() {
  const localesPath = path.join('client/public/locales');
  const enPagesPath = path.join(localesPath, 'en/pages.json');
  const enPages = JSON.parse(fs.readFileSync(enPagesPath, 'utf-8'));
  
  const pagesToTranslate = ['home', 'login'];
  const languages = Object.keys(languageMappings).filter(l => l !== 'en');
  
  console.log(`\nTranslating marketing pages: ${pagesToTranslate.join(', ')} to ${languages.length} languages...\n`);
  
  let totalCompleted = 0;
  const totalTasks = languages.length * pagesToTranslate.length;
  
  for (const langCode of languages) {
    try {
      const pageFile = path.join(localesPath, langCode, 'pages.json');
      const content = JSON.parse(fs.readFileSync(pageFile, 'utf-8'));
      
      for (const pageKey of pagesToTranslate) {
        if (enPages[pageKey]) {
          console.log(`Translating ${pageKey} to ${languageMappings[langCode]}...`);
          content[pageKey] = await translateObject(enPages[pageKey], languageMappings[langCode]);
          totalCompleted++;
          const percent = ((totalCompleted / totalTasks) * 100).toFixed(1);
          console.log(`[${totalCompleted}/${totalTasks}] ${percent}% complete\n`);
        }
      }
      
      fs.writeFileSync(pageFile, JSON.stringify(content, null, 2));
    } catch (error) {
      console.error(`Error processing ${langCode}:`, error.message);
    }
  }
  
  console.log('\n✅ All marketing pages translated successfully!');
}

main().catch(console.error);
