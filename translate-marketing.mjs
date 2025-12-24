import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, 'client/public/locales');

// Language mapping: code => {name, nativeName}
const languages = {
  af: { name: 'Afrikaans', native: 'Afrikaans' },
  am: { name: 'Amharic', native: 'አማርኛ' },
  ar: { name: 'Arabic', native: 'العربية' },
  az: { name: 'Azerbaijani', native: 'Azərbaycan' },
  bg: { name: 'Bulgarian', native: 'Български' },
  bn: { name: 'Bengali', native: 'বাংলা' },
  bs: { name: 'Bosnian', native: 'Bosanski' },
  ca: { name: 'Catalan', native: 'Català' },
  cs: { name: 'Czech', native: 'Čeština' },
  cy: { name: 'Welsh', native: 'Cymraeg' },
  da: { name: 'Danish', native: 'Dansk' },
  de: { name: 'German', native: 'Deutsch' },
  el: { name: 'Greek', native: 'Ελληνικά' },
  en: { name: 'English', native: 'English' },
  es: { name: 'Spanish', native: 'Español' },
  'es_AR': { name: 'Spanish (Argentina)', native: 'Español (Argentina)' },
  'es-ar': { name: 'Spanish (Argentina)', native: 'Español (Argentina)' },
  et: { name: 'Estonian', native: 'Eesti' },
  fa: { name: 'Persian', native: 'فارسی' },
  fi: { name: 'Finnish', native: 'Suomi' },
  fr: { name: 'French', native: 'Français' },
  ga: { name: 'Irish', native: 'Gaeilge' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી' },
  he: { name: 'Hebrew', native: 'עברית' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  hr: { name: 'Croatian', native: 'Hrvatski' },
  hu: { name: 'Hungarian', native: 'Magyar' },
  hy: { name: 'Armenian', native: 'Հայերեն' },
  id: { name: 'Indonesian', native: 'Bahasa Indonesia' },
  is: { name: 'Icelandic', native: 'Íslenska' },
  it: { name: 'Italian', native: 'Italiano' },
  ja: { name: 'Japanese', native: '日本語' },
  ka: { name: 'Georgian', native: 'ქართული' },
  km: { name: 'Khmer', native: 'ភាសាខ្មែរ' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
  ko: { name: 'Korean', native: '한국어' },
  lo: { name: 'Lao', native: 'ລາວ' },
  lt: { name: 'Lithuanian', native: 'Lietuvių' },
  lv: { name: 'Latvian', native: 'Latviešu' },
  mk: { name: 'Macedonian', native: 'Македонски' },
  ml: { name: 'Malayalam', native: 'മലയാളം' },
  mn: { name: 'Mongolian', native: 'Монгол' },
  mr: { name: 'Marathi', native: 'मराठी' },
  ms: { name: 'Malay', native: 'Bahasa Melayu' },
  mt: { name: 'Maltese', native: 'Malti' },
  my: { name: 'Burmese', native: 'မြန်မာ' },
  ne: { name: 'Nepali', native: 'नेपाली' },
  nl: { name: 'Dutch', native: 'Nederlands' },
  no: { name: 'Norwegian', native: 'Norsk' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  pl: { name: 'Polish', native: 'Polski' },
  pt: { name: 'Portuguese', native: 'Português' },
  ro: { name: 'Romanian', native: 'Română' },
  ru: { name: 'Russian', native: 'Русский' },
  si: { name: 'Sinhala', native: 'සිංහල' },
  sk: { name: 'Slovak', native: 'Slovenčina' },
  sl: { name: 'Slovenian', native: 'Slovenščina' },
  sq: { name: 'Albanian', native: 'Shqip' },
  sr: { name: 'Serbian', native: 'Српски' },
  sv: { name: 'Swedish', native: 'Svenska' },
  sw: { name: 'Swahili', native: 'Kiswahili' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  th: { name: 'Thai', native: 'ไทย' },
  tl: { name: 'Tagalog', native: 'Tagalog' },
  tr: { name: 'Turkish', native: 'Türkçe' },
  uk: { name: 'Ukrainian', native: 'Українська' },
  ur: { name: 'Urdu', native: 'اردو' },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt' },
  xh: { name: 'Xhosa', native: 'isiXhosa' },
  zh: { name: 'Chinese', native: '中文' },
  zu: { name: 'Zulu', native: 'isiZulu' }
};

// Read English source
const enPath = path.join(LOCALES_DIR, 'en/common.json');
const englishContent = fs.readFileSync(enPath, 'utf-8');
const englishObj = JSON.parse(englishContent);

console.log('English source loaded successfully');
console.log('Total language codes:', Object.keys(languages).length);

// Since we can't use API calls in this script, we'll output instructions
console.log('\n=== TRANSLATION REQUIRED ===');
console.log('We need to translate common.json for the following languages:');
console.log('(Excluding English and Spanish which are already done)');

const langsToTranslate = Object.keys(languages).filter(code => code !== 'en' && code !== 'es');

console.log('\nLanguages needing translation (' + langsToTranslate.length + '):');
langsToTranslate.forEach(code => {
  const lang = languages[code];
  const targetPath = path.join(LOCALES_DIR, code, 'common.json');
  const exists = fs.existsSync(targetPath);
  console.log(`${code.padEnd(8)} - ${lang.name.padEnd(20)} - ${exists ? 'EXISTS' : 'MISSING'}`);
});

