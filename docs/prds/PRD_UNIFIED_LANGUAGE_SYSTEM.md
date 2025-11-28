# PRD: Unified Language System

**Version:** 1.1  
**Created:** November 28, 2025  
**Last Updated:** November 28, 2025  
**Status:** Active  
**Category:** User Experience, Internationalization, AI Integration

## Overview

The Unified Language System provides a consistent, intuitive interface for language selection across the Mundo Tango platform. It synchronizes the user's primary language preference with the site's internationalization (i18n) system for immediate UI language changes, and integrates with AI systems for intelligent talent matching, event recommendations, and teacher discovery.

## Core Components

### 1. UnifiedLanguagePicker (`client/src/components/input/UnifiedLanguagePicker.tsx`)

A reusable component supporting two modes:

| Mode | Purpose | Value Type | syncI18n |
|------|---------|------------|----------|
| `primary` | Single language selection for primary language | `string` | Optional (true/false) |
| `additional` | Multi-language selection for additional languages | `string[]` | N/A |

**Features:**
- **Top 10 Popular Languages Grid**: English, Argentine Spanish (Rioplatense), Portuguese, French, German, Italian, Chinese, Japanese, Korean, Russian
- **Expandable Search**: Search across 68+ supported languages
- **Language Display**: Shows native name + flag + English name
- **i18n Sync**: When `syncI18n=true`, selecting primary language immediately updates site display language

### 2. Data Structure

```typescript
interface Language {
  code: string;      // ISO 639-1 code (e.g., 'en', 'es-AR')
  name: string;      // English name (e.g., 'English', 'Argentine Spanish (Rioplatense)')
  nativeName: string; // Native name (e.g., 'English', 'Español Rioplatense')
  flag?: string;     // Emoji flag (e.g., '🇬🇧', '🇦🇷')
}
```

**Export Functions:**
- `getLanguageByCode(code: string): Language | undefined`
- `getLanguageByName(name: string): Language | undefined`
- `ALL_LANGUAGES: Language[]` - Full list of 68 languages
- `TOP_10_LANGUAGES: Language[]` - Popular languages for quick selection

## Popular Languages

The platform prioritizes languages most commonly used in the global tango community:

| Rank | Language | Code | Flag | Rationale |
|------|----------|------|------|-----------|
| 1 | English | `en` | 🇬🇧 | Global lingua franca |
| **2** | **Argentine Spanish (Rioplatense)** | `es-AR` | 🇦🇷 | **Tango's birthplace language with lunfardo** |
| 3 | Portuguese | `pt` | 🇵🇹 | Strong tango communities in Brazil/Portugal |
| 4 | French | `fr` | 🇫🇷 | Historic tango culture in France |
| 5 | German | `de` | 🇩🇪 | Large European tango scene |
| 6 | Italian | `it` | 🇮🇹 | Italian immigrant influence on tango |
| 7 | Chinese | `zh` | 🇨🇳 | Growing Asian tango community |
| 8 | Japanese | `ja` | 🇯🇵 | Established tango culture in Japan |
| 9 | Korean | `ko` | 🇰🇷 | Emerging tango scene |
| 10 | Russian | `ru` | 🇷🇺 | Active Eastern European tango culture |

### Argentine Spanish (Rioplatense) - Special Consideration

Argentine Spanish is positioned as #2 due to:
- **Cultural Authenticity**: Tango originated in Buenos Aires; Rioplatense dialect is integral to understanding traditional lyrics and milonga culture
- **Lunfardo Vocabulary**: Specialized slang terms used in tango lyrics and community (e.g., "milonguero", "cortina", "tanda")
- **Teaching Context**: Many world-class tango teachers are native Rioplatense speakers
- **Code Differentiation**: Uses `es-AR` to distinguish from standard Spanish (`es`), enabling dialect-specific matching

## UI Integration Points

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

## AI Integration Points

Language preferences are critical inputs for the platform's AI systems. The following table documents how each AI feature utilizes language data:

### Integration Matrix

| AI Feature | Data Source | Use Case | Priority |
|------------|-------------|----------|----------|
| Talent Match AI | `user.languages[]`, `user.primaryLanguage` | Filter teachers/DJs/performers by spoken languages | High |
| Event Recommendations | `event.hostLanguages`, `user.languages[]` | Prioritize events with matching language hosts | High |
| Teacher Search | `teacher.teachingLanguages`, `student.primaryLanguage` | Match students with teachers they can understand | Critical |
| Platform i18n | `user.primaryLanguage` | Set UI display language | Critical |

### a) Talent Match AI (`NaturalLanguageTalentSearch.ts`)

The Talent Match AI parses natural language queries to extract language requirements and matches against user profiles.

**Query Parsing Examples:**

| User Query | Extracted Language Filter | SQL/DB Query |
|------------|---------------------------|--------------|
| "Find a teacher who speaks Portuguese" | `languages CONTAINS 'pt'` | `WHERE 'pt' = ANY(languages) OR primaryLanguage = 'pt'` |
| "Show me DJs from Argentina" | Implicit `es-AR` preference | `WHERE primaryLanguage = 'es-AR' OR 'es-AR' = ANY(languages)` |
| "Teachers who speak Spanish and English" | `languages CONTAINS ['es', 'en']` | `WHERE languages @> ARRAY['es', 'en']` |

**Implementation Pattern:**

```typescript
interface TalentSearchFilters {
  languages?: string[];           // Required spoken languages
  primaryLanguage?: string;       // Preferred primary language
  excludeLanguages?: string[];    // Languages to exclude
  languageMatchMode?: 'any' | 'all';  // Match any or all languages
}

// Example: Parse natural language query
function parseLanguageFromQuery(query: string): string[] {
  const languagePatterns = [
    { pattern: /speaks?\s+([\w\s]+)/i, extract: 1 },
    { pattern: /in\s+([\w]+)\s+language/i, extract: 1 },
    { pattern: /who\s+knows?\s+([\w\s]+)/i, extract: 1 },
  ];
  
  // Match against ALL_LANGUAGES names and return codes
  return extractedLanguages.map(name => getLanguageByName(name)?.code);
}
```

**API Endpoint:**

```typescript
// POST /api/talent/search
{
  "query": "Find a tango teacher who speaks Portuguese",
  "filters": {
    "role": "teacher",
    "languages": ["pt"],
    "languageMatchMode": "any"
  }
}

// Response includes language match scoring
{
  "results": [
    {
      "userId": 123,
      "name": "Maria Silva",
      "primaryLanguage": "pt",
      "languages": ["pt", "en", "es"],
      "languageMatchScore": 1.0,
      "roles": ["teacher"]
    }
  ]
}
```

### b) Event Recommendations

Events are prioritized based on language compatibility between attendees and hosts/teachers.

**Matching Logic:**

```typescript
interface EventLanguageMatch {
  eventId: number;
  hostLanguages: string[];        // Languages spoken by host/teachers
  userLanguages: string[];        // User's language preferences
  matchScore: number;             // 0-1 compatibility score
  hasCommonLanguage: boolean;     // Quick check flag
}

function calculateEventLanguageScore(
  userLanguages: string[],
  eventHostLanguages: string[]
): number {
  const commonLanguages = userLanguages.filter(
    lang => eventHostLanguages.includes(lang)
  );
  
  // Weighted scoring: primary language match = 1.0, additional = 0.5
  if (commonLanguages.includes(user.primaryLanguage)) {
    return 1.0;
  }
  return commonLanguages.length > 0 ? 0.5 : 0.1;
}
```

**Event Card Language Badges:**

Events display language badges to help users quickly identify compatible events:

```tsx
<EventCard>
  <EventLanguageBadges languages={event.hostLanguages} />
  {/* Renders: 🇦🇷 🇬🇧 🇵🇹 badges with tooltips */}
</EventCard>
```

### c) Teacher Search

Teacher-student matching prioritizes language compatibility for effective learning.

**Multi-Language Teacher Support:**

```typescript
interface TeacherProfile {
  userId: number;
  primaryLanguage: string;        // Teacher's native language
  teachingLanguages: string[];    // Languages they can teach IN
  languages: string[];            // All spoken languages
}

// Match query: Find teachers who can teach in user's preferred language
function findCompatibleTeachers(
  studentLanguages: string[],
  allTeachers: TeacherProfile[]
): TeacherProfile[] {
  return allTeachers
    .filter(teacher => 
      teacher.teachingLanguages.some(lang => 
        studentLanguages.includes(lang)
      )
    )
    .sort((a, b) => {
      // Prioritize teachers who share student's primary language
      const aScore = a.primaryLanguage === studentPrimaryLanguage ? 2 : 1;
      const bScore = b.primaryLanguage === studentPrimaryLanguage ? 2 : 1;
      return bScore - aScore;
    });
}
```

**API Query Example:**

```typescript
// GET /api/teachers?languages=pt,en&style=milonguero
// Returns teachers who can teach in Portuguese OR English

// GET /api/teachers?languages=es-AR&strictMatch=true
// Returns teachers who specifically speak Argentine Spanish
```

### d) Platform i18n

The primary language setting directly controls the platform's user interface language.

**i18next Integration:**

```typescript
// Configuration: client/src/lib/i18n.ts
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'es', 'es-AR', 'pt', 'fr', 'de', 'it'],
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

// Sync on language change
function syncLanguagePreference(langCode: string) {
  i18n.changeLanguage(langCode);
  localStorage.setItem('i18nextLng', langCode);
  // Also update user profile in database
  api.updateUser({ primaryLanguage: langCode });
}
```

**Supported UI Languages (68 total):**

The platform supports full UI translation for major languages, with fallback to English for less common languages.

## Language → Feature Mapping Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LANGUAGE SYSTEM INTEGRATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │  User Profile   │                                                        │
│  │  ─────────────  │                                                        │
│  │ primaryLanguage │───┬──────────────────────────────────────────────────┐ │
│  │ languages[]     │   │                                                  │ │
│  └─────────────────┘   │                                                  │ │
│                        │                                                  │ │
│          ┌─────────────┼─────────────────┬────────────────┐               │ │
│          │             │                 │                │               │ │
│          ▼             ▼                 ▼                ▼               │ │
│  ┌───────────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐       │ │
│  │  Platform     │ │  Talent    │ │   Event     │ │   Teacher    │       │ │
│  │    i18n       │ │  Match AI  │ │   Recs      │ │   Search     │       │ │
│  │ ───────────── │ │ ────────── │ │ ─────────── │ │ ──────────── │       │ │
│  │ UI Language   │ │ NL Query   │ │ Host Lang   │ │ Teaching     │       │ │
│  │ Translations  │ │ Parsing    │ │ Matching    │ │ Language     │       │ │
│  │ Date/Number   │ │ Filter by  │ │ Language    │ │ Multi-lang   │       │ │
│  │ Formatting    │ │ Spoken     │ │ Badges      │ │ Support      │       │ │
│  └───────────────┘ └────────────┘ └─────────────┘ └──────────────┘       │ │
│          │             │                 │                │               │ │
│          └─────────────┴─────────────────┴────────────────┘               │ │
│                                    │                                       │ │
│                                    ▼                                       │ │
│                        ┌─────────────────────┐                            │ │
│                        │   Unified Search    │                            │ │
│                        │   ─────────────────  │                            │ │
│                        │ "Find Portuguese-   │                            │ │
│                        │  speaking teacher   │                            │ │
│                        │  for milonga event" │                            │ │
│                        └─────────────────────┘                            │ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
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
│  ┌───────────────────┐    ┌───────────────────┐                 │
│  │ Save to Database  │───►│ AI Systems Sync   │                 │
│  │ (users table)     │    │ (Talent/Events)   │                 │
│  └───────────────────┘    └───────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

**users table fields:**
```sql
primaryLanguage VARCHAR  -- ISO 639-1 code (e.g., 'en', 'es-AR')
languages TEXT[]         -- Array of additional language codes
```

**events table language fields (recommended):**
```sql
hostLanguages TEXT[]     -- Languages spoken by event hosts
targetLanguages TEXT[]   -- Languages the event content is in
```

**API Query Examples:**

```sql
-- Find users who speak Portuguese
SELECT * FROM users 
WHERE primaryLanguage = 'pt' 
   OR 'pt' = ANY(languages);

-- Find teachers who can teach in Argentine Spanish or English
SELECT * FROM users 
WHERE 'teacher' = ANY(roles)
  AND (languages && ARRAY['es-AR', 'en']);

-- Find events with Spanish-speaking hosts
SELECT * FROM events 
WHERE 'es' = ANY(hostLanguages) 
   OR 'es-AR' = ANY(hostLanguages);
```

## Files Using This System

| File | Usage |
|------|-------|
| `client/src/components/input/UnifiedLanguagePicker.tsx` | Core component |
| `client/src/components/profile/ProfileTabAbout.tsx` | Profile language editing |
| `client/src/pages/onboarding/LanguagesPage.tsx` | Onboarding step 4 |
| `client/src/contexts/AuthContext.tsx` | Login-time i18n sync |
| `client/src/lib/i18n.ts` | i18n configuration |
| `server/services/TalentMatchService.ts` | AI talent matching |
| `client/src/components/ai/NaturalLanguageTalentSearch.tsx` | Natural language query UI |
| `client/src/components/events/EventCard.tsx` | Event language badges |

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
1. English (🇬🇧)
2. **Argentine Spanish - Rioplatense (🇦🇷)** 
3. Portuguese (🇵🇹)
4. French (🇫🇷)
5. German (🇩🇪)
6. Italian (🇮🇹)
7. Chinese (🇨🇳)
8. Japanese (🇯🇵)
9. Korean (🇰🇷)
10. Russian (🇷🇺)

**Additional (58 more):**
Spanish (standard), Arabic, Hindi, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Turkish, Hebrew, Thai, Vietnamese, Indonesian, Malay, Tagalog, Czech, Greek, Hungarian, Romanian, Ukrainian, Bulgarian, Croatian, Serbian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Icelandic, Irish, Maltese, Welsh, Albanian, Macedonian, Bosnian, Georgian, Azerbaijani, Armenian, Bengali, Urdu, Persian, Swahili, Zulu, Xhosa, Afrikaans, Amharic, Kannada, Malayalam, Tamil, Telugu, Marathi, Gujarati, Punjabi, Nepali, Sinhala, Khmer, Lao, Burmese, Mongolian

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| UnifiedLanguagePicker component | ✅ Complete | Supports primary + additional modes |
| Argentine Spanish (es-AR) as #2 | ✅ Complete | Implemented in TOP_10_LANGUAGES |
| Platform i18n sync | ✅ Complete | Works on login and profile update |
| Talent Match AI language parsing | 🔄 Planned | Query parsing for language extraction |
| Event language badges | 🔄 Planned | Visual language indicators on event cards |
| Teacher language filtering | 🔄 Planned | Filter by teaching language capability |

## Related PRDs

- [PRD_UNIFIED_LOCATION_PICKER.md](PRD_UNIFIED_LOCATION_PICKER.md) - Location selection system
- [PRD_PER_ROLE_EXPERIENCE.md](PRD_PER_ROLE_EXPERIENCE.md) - Role experience tracking
- [PRD_TALENT_MATCH_AI.md](PRD_TALENT_MATCH_AI.md) - AI talent matching system (cross-reference)
- [PRD_EVENTS_SYSTEM.md](PRD_EVENTS_SYSTEM.md) - Events and milongas (cross-reference)
- [PRD_TEACHER_SEARCH.md](PRD_TEACHER_SEARCH.md) - Teacher discovery system (cross-reference)
