import { memo, useEffect, useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { changeLanguageWithRegionalSupport } from '@/lib/i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es-ar', name: 'Argentine Spanish', nativeName: 'Español Rioplatense', flag: '🇦🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', flag: '🇲🇳' },
];

function LanguageSelectorComponent() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  
  // Derive initial state from i18n.language (which is already set from URL by i18n.ts)
  // This ensures we use the canonical source of truth, not localStorage
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // i18n.language is the single source of truth - it was set from URL param in i18n.ts
    return i18n.language || 'en';
  });
  
  // Sync state when i18n.language changes (e.g., from URL param on navigation)
  useEffect(() => {
    if (i18n.language && i18n.language !== selectedLanguage) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n.language, selectedLanguage]);
  
  // Track if user has made a selection to prevent sync from overriding it
  const userSelectedRef = useRef(false);
  // Track the last user ID to detect login/logout
  const lastUserIdRef = useRef<number | null>(null);
  
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  // Sync language from user profile only on login (not on every profile update)
  useEffect(() => {
    // Only sync when user logs in (ID changes from null to a value)
    const justLoggedIn = user?.id && lastUserIdRef.current !== user.id;
    lastUserIdRef.current = user?.id ?? null;
    
    // Sync from profile only on login and if user hasn't actively selected a language
    if (justLoggedIn && user?.primaryLanguage && !userSelectedRef.current) {
      setSelectedLanguage(user.primaryLanguage);
      i18n.changeLanguage(user.primaryLanguage);
      localStorage.setItem('i18nextLng', user.primaryLanguage);
    }
  }, [user?.id, user?.primaryLanguage, i18n]);

  const handleLanguageChange = useCallback(async (languageCode: string) => {
    // Mark that user has made a selection
    userSelectedRef.current = true;
    // Update state immediately for UI feedback
    setSelectedLanguage(languageCode);
    // Update localStorage
    localStorage.setItem('i18nextLng', languageCode);
    // Change i18n language with regional support
    await changeLanguageWithRegionalSupport(languageCode);
    
    // Save to user profile if logged in
    if (user?.id) {
      try {
        await apiRequest('PATCH', '/api/users/me', { primaryLanguage: languageCode });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
    
  }, [user?.id]);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger 
        className="w-[180px]" 
        data-testid="button-language-selector"
      >
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {currentLanguage.flag && <span className="mr-2">{currentLanguage.flag}</span>}
          {currentLanguage.nativeName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            data-testid={`language-option-${language.code}`}
          >
            <div className="flex items-center gap-2">
              {language.flag && <span>{language.flag}</span>}
              <span>{language.nativeName}</span>
              {language.name !== language.nativeName && (
                <span className="text-muted-foreground text-sm">({language.name})</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const LanguageSelector = memo(LanguageSelectorComponent);

function LanguageSelectorButtonComponent() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  
  // Derive initial state from i18n.language (which is already set from URL by i18n.ts)
  // This ensures we use the canonical source of truth, not localStorage
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // i18n.language is the single source of truth - it was set from URL param in i18n.ts
    return i18n.language || 'en';
  });
  
  // Sync state when i18n.language changes (e.g., from URL param on navigation)
  useEffect(() => {
    if (i18n.language && i18n.language !== selectedLanguage) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n.language, selectedLanguage]);
  
  // Track if user has made a selection to prevent sync from overriding it
  const userSelectedRef = useRef(false);
  // Track the last user ID to detect login/logout
  const lastUserIdRef = useRef<number | null>(null);
  
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  // Sync language from user profile only on login (not on every profile update)
  useEffect(() => {
    // Only sync when user logs in (ID changes from null to a value)
    const justLoggedIn = user?.id && lastUserIdRef.current !== user.id;
    lastUserIdRef.current = user?.id ?? null;
    
    // Sync from profile only on login and if user hasn't actively selected a language
    if (justLoggedIn && user?.primaryLanguage && !userSelectedRef.current) {
      setSelectedLanguage(user.primaryLanguage);
      i18n.changeLanguage(user.primaryLanguage);
      localStorage.setItem('i18nextLng', user.primaryLanguage);
    }
  }, [user?.id, user?.primaryLanguage, i18n]);

  const handleLanguageChange = useCallback(async (languageCode: string) => {
    // Mark that user has made a selection
    userSelectedRef.current = true;
    // Update state immediately for UI feedback
    setSelectedLanguage(languageCode);
    // Update localStorage
    localStorage.setItem('i18nextLng', languageCode);
    // Change i18n language with regional support
    await changeLanguageWithRegionalSupport(languageCode);
    
    // Save to user profile if logged in
    if (user?.id) {
      try {
        await apiRequest('PATCH', '/api/users/me', { primaryLanguage: languageCode });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
    
  }, [user?.id]);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-accent" data-testid="button-language-selector-icon">
        <Globe className="h-5 w-5" />
      </SelectTrigger>
      <SelectContent align="end" className="max-h-[400px] w-[250px]">
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            data-testid={`language-option-${language.code}`}
          >
            <div className="flex items-center gap-2">
              {language.flag && <span>{language.flag}</span>}
              <span>{language.nativeName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const LanguageSelectorButton = memo(LanguageSelectorButtonComponent);
