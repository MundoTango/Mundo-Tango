import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es-ar', name: 'Argentine Spanish (Rioplatense)' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'mt', name: 'Maltese' },
  { code: 'cy', name: 'Welsh' },
  { code: 'sq', name: 'Albanian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'ka', name: 'Georgian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'hy', name: 'Armenian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'fa', name: 'Persian' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'am', name: 'Amharic' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'my', name: 'Burmese' },
  { code: 'mn', name: 'Mongolian' },
];

const namespaces = ['common', 'navigation', 'pages', 'errors'];

async function translateJSON(englishContent: object, targetLang: { code: string; name: string }, namespace: string): Promise<object> {
  const prompt = `Translate the following JSON object from English to ${targetLang.name}. 
This is for a tango dance community website called "Mundo Tango".
Keep the JSON keys exactly the same, only translate the string values.
Preserve any placeholders like {{name}} or {count}.
For tango-specific terms (milonga, practica, etc.), keep them in their original form as they are internationally recognized.
For ${targetLang.code === 'es-ar' ? 'Argentine Spanish, use Rioplatense dialect with voseo (vos instead of tú)' : targetLang.name}.

Return ONLY valid JSON, no explanations or markdown.

JSON to translate:
${JSON.stringify(englishContent, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error(`Error translating ${namespace} to ${targetLang.name}:`, error);
    return englishContent;
  }
}

async function generateTranslations() {
  const localesDir = path.join(process.cwd(), 'public', 'locales');
  const englishDir = path.join(localesDir, 'en');

  console.log('🌍 Starting translation generation for 68 languages...\n');

  for (const namespace of namespaces) {
    const englishFilePath = path.join(englishDir, `${namespace}.json`);
    if (!fs.existsSync(englishFilePath)) {
      console.log(`⚠️ English ${namespace}.json not found, skipping...`);
      continue;
    }

    const englishContent = JSON.parse(fs.readFileSync(englishFilePath, 'utf-8'));
    console.log(`📁 Processing ${namespace}.json...`);

    for (const lang of languages) {
      if (lang.code === 'en') continue;

      const langDir = path.join(localesDir, lang.code);
      const outputPath = path.join(langDir, `${namespace}.json`);

      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      if (fs.existsSync(outputPath)) {
        console.log(`  ✓ ${lang.code}/${namespace}.json already exists, skipping...`);
        continue;
      }

      console.log(`  🔄 Translating to ${lang.name} (${lang.code})...`);
      
      try {
        const translated = await translateJSON(englishContent, lang, namespace);
        fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2));
        console.log(`  ✅ ${lang.code}/${namespace}.json created`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ Failed to translate ${namespace} to ${lang.name}:`, error);
        fs.writeFileSync(outputPath, JSON.stringify(englishContent, null, 2));
        console.log(`  ⚠️ ${lang.code}/${namespace}.json created with English fallback`);
      }
    }
  }

  console.log('\n✅ Translation generation complete!');
  console.log(`📊 Generated translations for ${languages.length - 1} languages across ${namespaces.length} namespaces`);
}

generateTranslations().catch(console.error);
