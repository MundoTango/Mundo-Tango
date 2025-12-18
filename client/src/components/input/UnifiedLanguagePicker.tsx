import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Search, Star, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export const ALL_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es-AR', name: 'Argentine Spanish (Rioplatense)', nativeName: 'Español Rioplatense', flag: '🇦🇷' },
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
  { code: 'hy', name: 'Armenian', nativeName: 'Հdelays', flag: '🇦🇲' },
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

export const TOP_10_LANGUAGES = [
  ALL_LANGUAGES[0],  // English (🇬🇧)
  ALL_LANGUAGES[1],  // Argentine Spanish (🇦🇷)
  ALL_LANGUAGES[3],  // Portuguese (🇵🇹)
  ALL_LANGUAGES[4],  // French (🇫🇷)
  ALL_LANGUAGES[5],  // German (🇩🇪)
  ALL_LANGUAGES[6],  // Italian (🇮🇹)
  ALL_LANGUAGES[7],  // Chinese (🇨🇳)
  ALL_LANGUAGES[8],  // Japanese (🇯🇵)
  ALL_LANGUAGES[9],  // Korean (🇰🇷)
  ALL_LANGUAGES[10], // Russian (🇷🇺)
];

export function getLanguageByCode(code: string): Language | undefined {
  return ALL_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageByName(name: string): Language | undefined {
  return ALL_LANGUAGES.find(
    lang => lang.name.toLowerCase() === name.toLowerCase() || 
            lang.nativeName.toLowerCase() === name.toLowerCase()
  );
}

interface UnifiedLanguagePickerProps {
  mode: 'primary' | 'additional';
  value: string | string[];
  onChange: (value: string | string[]) => void;
  syncI18n?: boolean;
  excludeLanguages?: string[];
  placeholder?: string;
  className?: string;
  'data-testid'?: string;
}

export function UnifiedLanguagePicker({
  mode,
  value,
  onChange,
  syncI18n = false,
  excludeLanguages = [],
  placeholder,
  className,
  'data-testid': testId,
}: UnifiedLanguagePickerProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const selectedLanguages = useMemo(() => {
    if (mode === 'primary') {
      return value ? [value as string] : [];
    }
    return (value as string[]) || [];
  }, [mode, value]);

  const availableLanguages = useMemo(() => {
    return ALL_LANGUAGES.filter(lang => !excludeLanguages.includes(lang.code));
  }, [excludeLanguages]);

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return availableLanguages;
    const term = searchTerm.toLowerCase();
    return availableLanguages.filter(
      lang =>
        lang.name.toLowerCase().includes(term) ||
        lang.nativeName.toLowerCase().includes(term) ||
        lang.code.toLowerCase().includes(term)
    );
  }, [availableLanguages, searchTerm]);

  const displayedLanguages = showAllLanguages 
    ? filteredLanguages 
    : filteredLanguages.slice(0, 10);

  const handleSelectLanguage = (langCode: string) => {
    if (mode === 'primary') {
      onChange(langCode);
      if (syncI18n) {
        i18n.changeLanguage(langCode);
        localStorage.setItem('i18nextLng', langCode);
      }
      setIsOpen(false);
    } else {
      const currentValues = (value as string[]) || [];
      if (currentValues.includes(langCode)) {
        onChange(currentValues.filter(c => c !== langCode));
      } else {
        onChange([...currentValues, langCode]);
      }
    }
    setSearchTerm('');
  };

  const handleRemoveLanguage = (langCode: string) => {
    if (mode === 'additional') {
      const currentValues = (value as string[]) || [];
      onChange(currentValues.filter(c => c !== langCode));
    }
  };

  const selectedLanguage = mode === 'primary' && value 
    ? getLanguageByCode(value as string) || getLanguageByName(value as string)
    : null;

  return (
    <div className={cn("space-y-2", className)} data-testid={testId}>
      {mode === 'primary' ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
              data-testid={`${testId}-trigger`}
            >
              {selectedLanguage ? (
                <span className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {selectedLanguage.flag && <span>{selectedLanguage.flag}</span>}
                  <span>{selectedLanguage.nativeName}</span>
                  <span className="text-muted-foreground text-sm">({selectedLanguage.name})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder || 'Select primary language'}</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" align="start">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  data-testid={`${testId}-search`}
                />
              </div>
            </div>
            
            {!searchTerm && (
              <div className="p-3 border-b">
                <p className="text-xs text-muted-foreground mb-2">Popular Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_10_LANGUAGES.filter(l => !excludeLanguages.includes(l.code)).map((lang) => (
                    <Badge
                      key={lang.code}
                      variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                      className="cursor-pointer hover-elevate"
                      onClick={() => handleSelectLanguage(lang.code)}
                      data-testid={`${testId}-popular-${lang.code}`}
                    >
                      {lang.flag} {lang.nativeName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="max-h-[250px] overflow-y-auto p-2">
              {displayedLanguages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No languages found</p>
              ) : (
                <>
                  {displayedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedLanguages.includes(lang.code) && "bg-accent"
                      )}
                      data-testid={`${testId}-option-${lang.code}`}
                    >
                      {selectedLanguages.includes(lang.code) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className={cn(!selectedLanguages.includes(lang.code) && "ml-6")}>
                        {lang.flag} {lang.nativeName}
                      </span>
                      <span className="text-muted-foreground text-xs ml-auto">{lang.name}</span>
                    </button>
                  ))}
                  
                  {!showAllLanguages && filteredLanguages.length > 10 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setShowAllLanguages(true)}
                      data-testid={`${testId}-show-more`}
                    >
                      Show all {filteredLanguages.length} languages
                    </Button>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {selectedLanguages.map((langCode) => {
              const lang = getLanguageByCode(langCode) || getLanguageByName(langCode);
              return lang ? (
                <Badge key={langCode} variant="secondary" className="gap-1" data-testid={`${testId}-selected-${langCode}`}>
                  {lang.flag} {lang.nativeName}
                  <button
                    onClick={() => handleRemoveLanguage(langCode)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`${testId}-remove-${langCode}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1" data-testid={`${testId}-add`}>
                + Add language
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid={`${testId}-search`}
                  />
                </div>
              </div>
              
              {!searchTerm && (
                <div className="p-3 border-b">
                  <p className="text-xs text-muted-foreground mb-2">Popular Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOP_10_LANGUAGES.filter(l => !excludeLanguages.includes(l.code) && !selectedLanguages.includes(l.code)).map((lang) => (
                      <Badge
                        key={lang.code}
                        variant="outline"
                        className="cursor-pointer hover-elevate"
                        onClick={() => handleSelectLanguage(lang.code)}
                        data-testid={`${testId}-popular-${lang.code}`}
                      >
                        {lang.flag} {lang.nativeName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="max-h-[250px] overflow-y-auto p-2">
                {displayedLanguages.filter(l => !selectedLanguages.includes(l.code)).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No more languages available</p>
                ) : (
                  <>
                    {displayedLanguages.filter(l => !selectedLanguages.includes(l.code)).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-accent hover:text-accent-foreground"
                        data-testid={`${testId}-option-${lang.code}`}
                      >
                        <span>{lang.flag} {lang.nativeName}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{lang.name}</span>
                      </button>
                    ))}
                    
                    {!showAllLanguages && filteredLanguages.filter(l => !selectedLanguages.includes(l.code)).length > 10 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowAllLanguages(true)}
                        data-testid={`${testId}-show-more`}
                      >
                        Show more languages
                      </Button>
                    )}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

export default UnifiedLanguagePicker;
