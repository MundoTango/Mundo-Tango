import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const allLangs = [
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

if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      defaultNS: 'common',
      ns: ['common', 'navigation', 'pages', 'errors'],
      debug: false,
      load: 'currentOnly',
      fallbackLng: {
        'es-ar': ['en'],
        'default': ['en']
      },
      nonExplicitSupportedLngs: false,
      cleanCode: false,
      lowerCaseLng: false,
      interpolation: { escapeValue: false },
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      react: { useSuspense: true },
      supportedLngs: allLangs,
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: 'i18nextLng',
        caches: [],
        excludeCacheFor: ['cimode'],
        convertDetectedLanguage: (lng: string) => lng,
      },
    });
}

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

// Helper function to properly change language, handling regional variants
export async function changeLanguageWithRegionalSupport(languageCode: string): Promise<void> {
  console.log('[i18n] changeLanguageWithRegionalSupport called with:', languageCode);
  
  // For regional variants like es-ar, manually load resources
  if (languageCode.includes('-')) {
    try {
      const namespaces = ['common', 'navigation', 'pages', 'errors'];
      for (const ns of namespaces) {
        const res = await fetch(`/locales/${languageCode}/${ns}.json`);
        if (res.ok) {
          const data = await res.json();
          i18n.addResourceBundle(languageCode, ns, data, true, true);
          console.log(`[i18n] Loaded ${languageCode}/${ns}.json`);
        }
      }
      // Call changeLanguage
      await i18n.changeLanguage(languageCode);
      // Force the language to stay as requested if i18next normalized it
      if (i18n.language !== languageCode) {
        console.log(`[i18n] Forcing language from ${i18n.language} to ${languageCode}`);
        (i18n as any).language = languageCode;
        (i18n as any).languages = [languageCode, 'en'];
        // Emit language changed event
        i18n.emit('languageChanged', languageCode);
      }
      console.log('[i18n] After regional load, i18n.language:', i18n.language);
    } catch (err) {
      console.error('[i18n] Error loading regional variant:', err);
      await i18n.changeLanguage(languageCode);
    }
  } else {
    await i18n.changeLanguage(languageCode);
  }
}

export function updateDocumentDirection(lang: string): void {
  const dir = isRTLLanguage(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

export async function detectAndApplyLanguage(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLng = urlParams.get('lng');
  
  console.log('[i18n] detectAndApplyLanguage called');
  console.log('[i18n] URL:', window.location.href);
  console.log('[i18n] urlLng param:', urlLng);
  console.log('[i18n] current i18n.language:', i18n.language);
  
  if (urlLng && allLangs.includes(urlLng)) {
    await changeLanguageWithRegionalSupport(urlLng);
    console.log('[i18n] After changeLanguage, i18n.language is now:', i18n.language);
    return;
  }
  
  const stored = localStorage.getItem('i18nextLng');
  if (stored && allLangs.includes(stored)) {
    if (i18n.language !== stored) {
      await i18n.changeLanguage(stored);
    }
    return;
  }
  
  const nav = navigator.language;
  if (allLangs.includes(nav)) {
    if (i18n.language !== nav) {
      await i18n.changeLanguage(nav);
    }
    return;
  }
  
  const navBase = nav.split('-')[0];
  if (allLangs.includes(navBase)) {
    if (i18n.language !== navBase) {
      await i18n.changeLanguage(navBase);
    }
  }
}

i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  localStorage.setItem('i18nextLng', lng);
});

if (typeof window !== 'undefined') {
  updateDocumentDirection(i18n.language || 'en');
}

export default i18n;
