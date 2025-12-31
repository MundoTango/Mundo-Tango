import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export const allLangs = [
  "en",
  "es-ar",
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "zh",
  "ja",
  "ko",
  "ru",
  "ar",
  "hi",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "pl",
  "tr",
  "he",
  "th",
  "vi",
  "id",
  "ms",
  "tl",
  "cs",
  "el",
  "hu",
  "ro",
  "uk",
  "bg",
  "hr",
  "sr",
  "sk",
  "sl",
  "et",
  "lv",
  "lt",
  "is",
  "ga",
  "mt",
  "cy",
  "sq",
  "mk",
  "bs",
  "ka",
  "az",
  "hy",
  "bn",
  "ur",
  "fa",
  "sw",
  "zu",
  "xh",
  "af",
  "am",
  "kn",
  "ml",
  "ta",
  "te",
  "mr",
  "gu",
  "pa",
  "ne",
  "si",
  "km",
  "lo",
  "my",
  "mn",
];

// Map regional variants to base language codes that match our locale folders
function normalizeToBaseLanguage(lng: string): string {
  const lower = lng.toLowerCase();
  // Keep es-ar as is (we have a specific folder for it)
  if (lower === 'es-ar') return 'es-ar';
  // Extract base language code from regional variants like fr-FR -> fr
  const base = lower.split('-')[0];
  // If the base is in our supported list, use it
  if (allLangs.includes(base)) return base;
  return lower;
}

if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      defaultNS: "common",
      ns: ["common", "navigation", "pages", "errors"],
      debug: false,
      load: "languageOnly",
      fallbackLng: {
        'es-ar': ['es', 'en'],
        'pt-br': ['pt', 'en'],
        'zh-tw': ['zh', 'en'],
        'zh-hk': ['zh', 'en'],
        default: ['en'],
      },
      nonExplicitSupportedLngs: false,
      cleanCode: false,
      lowerCaseLng: true,
      interpolation: { escapeValue: false },
      backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
      react: { 
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
      },
      supportedLngs: allLangs,
      detection: {
        order: ["querystring", "localStorage", "navigator", "htmlTag"],
        lookupQuerystring: "lng",
        lookupLocalStorage: "i18nextLng",
        caches: ["localStorage"],
        excludeCacheFor: ["cimode"],
        // Normalize regional codes to base language codes that match our locale folders
        convertDetectedLanguage: normalizeToBaseLanguage,
      },
    });
}

export const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

// Helper function to properly change language, handling regional variants
export async function changeLanguageWithRegionalSupport(
  languageCode: string,
): Promise<void> {
  // Normalize regional codes to base language codes that match our locale folders
  const lower = languageCode.toLowerCase();
  // Keep es-ar as is (we have a specific folder for it)
  let normalizedCode = lower;
  if (lower !== 'es-ar' && lower.includes('-')) {
    const base = lower.split('-')[0];
    if (allLangs.includes(base)) {
      normalizedCode = base;
    }
  }
  
  console.log(
    "[i18n] changeLanguageWithRegionalSupport called with:",
    languageCode,
    "normalized to:",
    normalizedCode,
  );

  // Update localStorage with normalized code
  localStorage.setItem('i18nextLng', normalizedCode);
  
  // Change language with normalized code
  await i18n.changeLanguage(normalizedCode);

  console.log(
    "[i18n] After changeLanguage, i18n.language:",
    i18n.language,
    "resolvedLanguage:",
    i18n.resolvedLanguage,
  );

  // Reload resources to ensure they're fetched
  const namespaces = ["common", "navigation", "pages", "errors"];
  try {
    await i18n.reloadResources(normalizedCode, namespaces);
    console.log("[i18n] Resources reloaded for:", normalizedCode);
  } catch (err) {
    console.error("[i18n] Error reloading resources:", err);
  }
}

export function updateDocumentDirection(lang: string): void {
  const dir = isRTLLanguage(lang) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

export async function detectAndApplyLanguage(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLng = urlParams.get("lng");

  console.log("[i18n] detectAndApplyLanguage called");
  console.log("[i18n] URL:", window.location.href);
  console.log("[i18n] urlLng param:", urlLng);
  console.log("[i18n] current i18n.language:", i18n.language);

  if (urlLng && allLangs.includes(urlLng)) {
    await changeLanguageWithRegionalSupport(urlLng);
    console.log(
      "[i18n] After changeLanguage, i18n.language is now:",
      i18n.language,
    );
    return;
  }

  const stored = localStorage.getItem("i18nextLng");
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

  const navBase = nav.split("-")[0];
  if (allLangs.includes(navBase)) {
    if (i18n.language !== navBase) {
      await i18n.changeLanguage(navBase);
    }
  }
}

i18n.on("languageChanged", (lng) => {
  // Normalize to lowercase for consistency with our locale folder names
  const normalizedLng = lng.toLowerCase();
  updateDocumentDirection(normalizedLng);
  localStorage.setItem("i18nextLng", normalizedLng);
});

if (typeof window !== "undefined") {
  updateDocumentDirection(i18n.language || "en");
}

export default i18n;
