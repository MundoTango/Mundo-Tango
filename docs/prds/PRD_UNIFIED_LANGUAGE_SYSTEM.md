# PRD: Unified Language System

**Version:** 1.0  
**Created:** November 28, 2025  
**Status:** Active  
**Category:** User Experience, Internationalization

## Overview

The Unified Language System provides a consistent, intuitive interface for language selection across the Mundo Tango platform. It synchronizes the user's primary language preference with the site's internationalization (i18n) system for immediate UI language changes.

## Core Components

### 1. UnifiedLanguagePicker (`client/src/components/input/UnifiedLanguagePicker.tsx`)

A reusable component supporting two modes:

| Mode | Purpose | Value Type | syncI18n |
|------|---------|------------|----------|
| `primary` | Single language selection for primary language | `string` | Optional (true/false) |
| `additional` | Multi-language selection for additional languages | `string[]` | N/A |

**Features:**
- **Top 10 Popular Languages Grid**: English, Spanish, Portuguese, French, German, Italian, Chinese, Japanese, Korean, Russian
- **Expandable Search**: Search across 68+ supported languages
- **Language Display**: Shows native name + flag + English name
- **i18n Sync**: When `syncI18n=true`, selecting primary language immediately updates site display language

### 2. Data Structure

```typescript
interface Language {
  code: string;      // ISO 639-1 code (e.g., 'en', 'es')
  name: string;      // English name (e.g., 'English', 'Spanish')
  nativeName: string; // Native name (e.g., 'English', 'Español')
  flag?: string;     // Emoji flag (e.g., '🇬🇧', '🇪🇸')
}
```

**Export Functions:**
- `getLanguageByCode(code: string): Language | undefined`
- `getLanguageByName(name: string): Language | undefined`
- `ALL_LANGUAGES: Language[]` - Full list of 68 languages
- `TOP_10_LANGUAGES: Language[]` - Popular languages for quick selection

## Integration Points

### 1. Profile Settings (`ProfileTabAbout.tsx`)

```tsx
<UnifiedLanguagePicker
  mode="primary"
  value={editValues.primaryLanguage}
  onChange={(value) => setEditValues({ ...editValues, primaryLanguage: value })}
  syncI18n={true}  // Immediately updates site language
  placeholder="Select your primary language"
/>

<UnifiedLanguagePicker
  mode="additional"
  value={editValues.languages}
  onChange={(value) => setEditValues({ ...editValues, languages: value })}
  excludeLanguages={[editValues.primaryLanguage]}  // Prevents duplicate selection
/>
```

### 2. Onboarding (`LanguagesPage.tsx`)

```tsx
<UnifiedLanguagePicker
  mode="primary"
  value={primaryLanguage}
  onChange={handlePrimaryLanguageChange}
  syncI18n={false}  // Handled manually in onChange
/>
```

### 3. Login-Time Sync (`AuthContext.tsx`)

When a user logs in or session loads, their `primaryLanguage` is applied to the i18n system:

```typescript
if (userData.primaryLanguage) {
  i18n.changeLanguage(userData.primaryLanguage);
  localStorage.setItem('i18nextLng', userData.primaryLanguage);
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     LANGUAGE SELECTION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Selects Primary Language                                   │
│          │                                                       │
│          ▼                                                       │
│  ┌───────────────────┐                                          │
│  │ UnifiedLanguage   │                                          │
│  │     Picker        │                                          │
│  └────────┬──────────┘                                          │
│           │                                                      │
│           ▼                                                      │
│  ┌───────────────────┐    ┌───────────────────┐                 │
│  │ syncI18n=true?    │─►  │ i18n.change       │                 │
│  │                   │    │ Language()        │                 │
│  └────────┬──────────┘    └────────┬──────────┘                 │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌───────────────────┐    ┌───────────────────┐                 │
│  │ onChange()        │    │ localStorage      │                 │
│  │ callback          │    │ 'i18nextLng'      │                 │
│  └────────┬──────────┘    └───────────────────┘                 │
│           │                                                      │
│           ▼                                                      │
│  ┌───────────────────┐                                          │
│  │ Save to Database  │                                          │
│  │ (users table)     │                                          │
│  └───────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

**users table fields:**
```sql
primaryLanguage VARCHAR  -- ISO 639-1 code (e.g., 'en', 'es')
languages TEXT[]         -- Array of additional language codes
```

## Files Using This System

| File | Usage |
|------|-------|
| `client/src/components/input/UnifiedLanguagePicker.tsx` | Core component |
| `client/src/components/profile/ProfileTabAbout.tsx` | Profile language editing |
| `client/src/pages/onboarding/LanguagesPage.tsx` | Onboarding step 4 |
| `client/src/contexts/AuthContext.tsx` | Login-time i18n sync |
| `client/src/lib/i18n.ts` | i18n configuration |

## Props Reference

```typescript
interface UnifiedLanguagePickerProps {
  mode: 'primary' | 'additional';     // Selection mode
  value: string | string[];           // Current value(s)
  onChange: (value: string | string[]) => void;  // Change handler
  syncI18n?: boolean;                 // Auto-sync with i18n (default: false)
  excludeLanguages?: string[];        // Languages to hide from selection
  placeholder?: string;               // Placeholder text
  className?: string;                 // Additional CSS classes
  'data-testid'?: string;             // Test ID for automation
}
```

## Supported Languages (68 total)

**Top 10 Popular:**
English, Spanish, Portuguese, French, German, Italian, Chinese, Japanese, Korean, Russian

**Additional:**
Arabic, Hindi, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Turkish, Hebrew, Thai, Vietnamese, Indonesian, Malay, Tagalog, Czech, Greek, Hungarian, Romanian, Ukrainian, Bulgarian, Croatian, Serbian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Icelandic, Irish, Maltese, Welsh, Albanian, Macedonian, Bosnian, Georgian, Azerbaijani, Armenian, Bengali, Urdu, Persian, Swahili, Zulu, Xhosa, Afrikaans, Amharic, Kannada, Malayalam, Tamil, Telugu, Marathi, Gujarati, Punjabi, Nepali, Sinhala, Khmer, Lao, Burmese, Mongolian

## Future Enhancements

1. **Talent Match AI Integration** - Use language preferences for teacher/student matching
2. **Event Recommendations** - Filter events by language
3. **Group Discovery** - Suggest language-specific groups
4. **Real-time Translation** - Auto-translate posts based on reader's language

## Related PRDs

- [PRD_UNIFIED_LOCATION_PICKER.md](PRD_UNIFIED_LOCATION_PICKER.md) - Location selection system
- [PRD_PER_ROLE_EXPERIENCE.md](PRD_PER_ROLE_EXPERIENCE.md) - Role experience tracking
