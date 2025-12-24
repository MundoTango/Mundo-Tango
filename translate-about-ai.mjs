import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const languageMap = {
  'af': 'Afrikaans', 'am': 'Amharic', 'ar': 'Arabic', 'az': 'Azerbaijani',
  'bg': 'Bulgarian', 'bn': 'Bengali', 'bs': 'Bosnian', 'cs': 'Czech',
  'cy': 'Welsh', 'da': 'Danish', 'de': 'German', 'el': 'Greek',
  'en': 'English', 'es-ar': 'Argentine Spanish (Rioplatense with voseo)', 'es': 'Spanish',
  'et': 'Estonian', 'fa': 'Persian', 'fi': 'Finnish', 'fr': 'French',
  'ga': 'Irish', 'gu': 'Gujarati', 'he': 'Hebrew', 'hi': 'Hindi',
  'hr': 'Croatian', 'hu': 'Hungarian', 'hy': 'Armenian', 'id': 'Indonesian',
  'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ka': 'Georgian',
  'km': 'Khmer', 'kn': 'Kannada', 'ko': 'Korean', 'lo': 'Lao',
  'lt': 'Lithuanian', 'lv': 'Latvian', 'mk': 'Macedonian', 'ml': 'Malayalam',
  'mn': 'Mongolian', 'mr': 'Marathi', 'ms': 'Malay', 'mt': 'Maltese',
  'my': 'Burmese', 'ne': 'Nepali', 'nl': 'Dutch', 'no': 'Norwegian',
  'pa': 'Punjabi', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian',
  'ru': 'Russian', 'si': 'Sinhala', 'sk': 'Slovak', 'sl': 'Slovenian',
  'sq': 'Albanian', 'sr': 'Serbian', 'sv': 'Swedish', 'sw': 'Swahili',
  'ta': 'Tamil', 'te': 'Telugu', 'th': 'Thai', 'tl': 'Tagalog',
  'tr': 'Turkish', 'uk': 'Ukrainian', 'ur': 'Urdu', 'vi': 'Vietnamese',
  'xh': 'Xhosa', 'zh': 'Chinese', 'zu': 'Zulu'
};

const englishAbout = {
  badge: 'About Us',
  title: 'About Mundo Tango',
  subtitle: 'Connecting the global tango community, one dance at a time',
  missionTitle: 'Our Mission',
  missionDescription: 'Mundo Tango is dedicated to fostering connections within the global tango community. We believe in the power of dance to bring people together across cultures, languages, and borders.',
  valuesTitle: 'Our Values',
  valueCommunityTitle: 'Community First',
  valueCommunityDescription: 'We prioritize authentic connections and meaningful interactions.',
  valueAuthenticityTitle: 'Authenticity',
  valueAuthenticityDescription: 'We honor the traditions of Argentine tango while embracing its evolution.',
  valueInclusivityTitle: 'Inclusivity',
  valueInclusivityDescription: 'Everyone is welcome in our community.'
};

async function translateText(text, targetLang) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${targetLang}. For Argentine Spanish (es-ar), use Rioplatense dialect with voseo conjugations. Maintain the tone and meaning. Return ONLY the translated text, no explanations.`
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

async function translateAboutSection(langCode, langName) {
  if (langCode === 'en') return englishAbout;
  
  console.log(`Translating to ${langName} (${langCode})...`);
  
  const translated = {};
  for (const [key, value] of Object.entries(englishAbout)) {
    translated[key] = await translateText(value, langName);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return translated;
}

async function main() {
  const localesPath = path.join(__dirname, 'client/public/locales');
  const languages = Object.keys(languageMap);
  
  console.log(`\nTranslating About section to ${languages.length} languages using OpenAI...\n`);
  
  let completed = 0;
  
  for (const langCode of languages) {
    try {
      const pagesFile = path.join(localesPath, langCode, 'pages.json');
      const content = JSON.parse(fs.readFileSync(pagesFile, 'utf-8'));
      
      const translatedAbout = await translateAboutSection(langCode, languageMap[langCode]);
      content.about = translatedAbout;
      
      fs.writeFileSync(pagesFile, JSON.stringify(content, null, 2) + '\n');
      completed++;
      const progress = Math.round((completed / languages.length) * 100);
      console.log(`✅ [${progress}%] ${langCode} - ${languageMap[langCode]}`);
    } catch (error) {
      console.error(`❌ ${langCode}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Translation complete! ${completed}/${languages.length} languages updated.`);
}

main();
