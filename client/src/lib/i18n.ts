import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const i18nKey = '__i18n_initialized__';

// Support all languages in both dev and production for proper i18n testing
const allLangs = [
  'en', 'es-ar', 'es', 'pt', 'fr', 'de', 'it',
  'zh', 'ja', 'ko', 'ru', 'ar', 'hi',
  'nl', 'sv', 'no', 'da', 'fi', 'pl',
  'tr', 'he', 'th', 'vi', 'id', 'ms',
  'tl', 'cs', 'el', 'hu', 'ro', 'uk',
  'bg', 'hr', 'sr', 'sk', 'sl', 'et',
  'lv', 'lt', 'is', 'ga', 'mt', 'cy',
  'sq', 'mk', 'bs', 'ka', 'az', 'hy',
  'bn', 'ur', 'fa', 'sw', 'zu', 'xh',
  'af', 'am', 'kn', 'ml', 'ta', 'te',
  'mr', 'gu', 'pa', 'ne', 'si', 'km',
  'lo', 'my', 'ka', 'mn'
];

if (!(window as any)[i18nKey]) {
  (window as any)[i18nKey] = true;
  
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'navigation', 'pages', 'errors'],
      
      debug: false, // Disable debug logging for performance
      
      // Enable language fallback: es-ar -> es -> en
      load: 'languageOnly',
      
      // Allow regional variants like es-ar, pt-br to fall back to base language
      nonExplicitSupportedLngs: true,
      
      interpolation: {
        escapeValue: false,
      },
      
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lng',
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      
      react: {
        useSuspense: true,
      },
      
      supportedLngs: allLangs,
    });
}

// RTL languages that require right-to-left text direction
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Check if a language is RTL
export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

// Update document direction based on language
export function updateDocumentDirection(lang: string): void {
  const dir = isRTLLanguage(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

// Listen for language changes and update direction
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Set initial direction
if (typeof window !== 'undefined') {
  updateDocumentDirection(i18n.language || 'en');
}

export default i18n;
