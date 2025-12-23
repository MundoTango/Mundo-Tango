import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

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
  'lo', 'my', 'mn'
];

function detectLanguage(): string {
  console.log('[i18n] window.location.href:', window.location.href);
  console.log('[i18n] window.location.search:', window.location.search);
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlLng = urlParams.get('lng');
  console.log('[i18n] urlParams.get("lng"):', urlLng);
  
  if (urlLng && allLangs.includes(urlLng)) {
    console.log('[i18n] Using URL language:', urlLng);
    return urlLng;
  }
  
  const stored = localStorage.getItem('i18nextLng');
  if (stored && allLangs.includes(stored)) {
    console.log('[i18n] Using localStorage language:', stored);
    return stored;
  }
  
  const nav = navigator.language;
  console.log('[i18n] navigator.language:', nav);
  if (allLangs.includes(nav)) {
    return nav;
  }
  const navBase = nav.split('-')[0];
  if (allLangs.includes(navBase)) {
    console.log('[i18n] Using navigator base language:', navBase);
    return navBase;
  }
  
  console.log('[i18n] Falling back to en');
  return 'en';
}

const detectedLng = detectLanguage();
console.log('[i18n] Final detected language:', detectedLng);

if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: detectedLng,
      defaultNS: 'common',
      ns: ['common', 'navigation', 'pages', 'errors'],
      debug: true,
      load: 'currentOnly',
      fallbackLng: '{ 'es-ar': ['es', 'en'], 'pt-br': ['pt', 'en'], default: ['en'] },
      nonExplicitSupportedLngs: false,
      interpolation: { escapeValue: false },
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      react: { useSuspense: true },
      supportedLngs: allLangs,
    })
    .then(() => {
      console.log('[i18n] After init, i18n.language:', i18n.language);
      if (i18n.language !== detectedLng) {
        console.log('[i18n] Mismatch detected, forcing changeLanguage to:', detectedLng);
        i18n.changeLanguage(detectedLng);
      }
    });
} else {
  console.log('[i18n] Already initialized with:', i18n.language);
  if (i18n.language !== detectedLng) {
    console.log('[i18n] Forcing language change to:', detectedLng);
    i18n.changeLanguage(detectedLng);
  }
}

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

export function updateDocumentDirection(lang: string): void {
  const dir = isRTLLanguage(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

i18n.on('languageChanged', (lng) => {
  console.log('[i18n] languageChanged:', lng);
  updateDocumentDirection(lng);
  localStorage.setItem('i18nextLng', lng);
});

if (typeof window !== 'undefined') {
  updateDocumentDirection(i18n.language || 'en');
}

export default i18n;
