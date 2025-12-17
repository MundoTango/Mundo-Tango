import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'pages', 'errors'],
    
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: true,
    },
    
    supportedLngs: [
      'en', 'es', 'pt', 'fr', 'de', 'it',
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
    ],
  });

export default i18n;
