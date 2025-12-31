# Translation System Guide - Mundo Tango

## Overview

Mundo Tango supports 68 languages with regional variants. This guide explains how to add, update, and maintain translations across the platform.

## Architecture

### Directory Structure
```
client/public/locales/           # Vite serves translations from here
  en/                            # English (source of truth)
    common.json                  # Shared UI elements
    navigation.json              # Navigation labels
    pages.json                   # Page-specific content
    errors.json                  # Error messages
  es/                            # Spanish
  es-ar/                         # Spanish (Argentina) - regional variant
  ru/                            # Russian
  ... (68 total languages)

public/locales/                  # Backup directory (NOT served by Vite)
```

### Critical Rules

1. **Always edit files in `client/public/locales/`** - Vite does NOT serve from `public/locales/`
2. **Sync changes**: After editing, sync to `public/locales/` for backup
3. **English is source of truth**: All keys must exist in English first
4. **Fallback chain**: Regional variants fall back to base language, then English

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| en | English | Complete (33KB) |
| es | Spanish | Complete (38KB) |
| es-ar | Spanish (Argentina) | Partial (fallback to es) |
| pt | Portuguese | Partial (264/580 keys) |
| pt-br | Portuguese (Brazil) | Partial (fallback to pt) |
| ru | Russian | Complete for login/register |
| fr | French | Partial (264/580 keys) |
| de | German | Partial (264/580 keys) |
| it | Italian | Partial (264/580 keys) |
| zh | Chinese (Simplified) | Partial (264/580 keys) |
| zh-tw | Chinese (Traditional) | Partial (fallback to zh) |
| zh-hk | Chinese (Hong Kong) | Partial (fallback to zh) |
| ja | Japanese | Partial (264/580 keys) |
| ko | Korean | Minimal (5/580 keys) |
| ar | Arabic | Good (434/580 keys) |
| ... | 58 more languages | Varies |

## Namespace Structure

### common.json (80 keys)
Shared UI elements used across the app:
- `email`, `password`, `name` - Form labels
- `submit`, `cancel`, `save` - Button labels
- `loading`, `error`, `success` - Status messages

### navigation.json (47 keys)
Navigation and menu items:
- `home`, `events`, `groups`, `messages` - Main nav
- `profile`, `settings`, `logout` - User menu
- `cookieConsent.*` - Cookie banner

### pages.json (580 keys)
Page-specific content organized by page:
```json
{
  "login": {
    "pageName": "Login",
    "seo": { "title": "...", "description": "..." },
    "badge": "Welcome Back",
    "hero": { "heading": "...", "paragraph": "..." },
    "form": { "email": "...", "password": "...", ... },
    "toast": { "successTitle": "...", ... }
  },
  "register": { ... },
  "onboarding": {
    "welcome": { ... },
    "city": { ... },
    "photo": { ... },
    "roles": { ... },
    "experience": { ... },
    "languages": { ... },
    "hobbies": { ... },
    "social": { ... },
    "navigation": { ... }
  },
  "profile": { ... },
  ...
}
```

### errors.json (31 keys)
Error messages and validation:
- `required`, `invalid`, `tooShort` - Validation
- `networkError`, `serverError` - System errors
- `notFound`, `unauthorized` - HTTP errors

## How to Add Translations

### Step 1: Identify Missing Keys

Run the audit script:
```bash
node -e "
const fs = require('fs');
const path = require('path');

const localesDir = 'client/public/locales';
const enDir = path.join(localesDir, 'en');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const lang = process.argv[2] || 'ru';
const ns = 'pages';

const enFile = path.join(enDir, \`\${ns}.json\`);
const langFile = path.join(localesDir, lang, \`\${ns}.json\`);

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

const enKeys = getKeys(enData);
const langKeys = getKeys(langData);
const missing = enKeys.filter(k => !langKeys.includes(k));

console.log(\`\${lang.toUpperCase()}: \${langKeys.length}/\${enKeys.length} keys (\${missing.length} missing)\`);
console.log('Missing keys:', missing.slice(0, 20).join(', '));
" ru
```

### Step 2: Get English Source Content

```bash
node -e "
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('client/public/locales/en/pages.json'));
console.log(JSON.stringify(en.login, null, 2));
"
```

### Step 3: Create Translations

For each section, translate and preserve the JSON structure:

```json
{
  "login": {
    "pageName": "Вход",
    "badge": "С возвращением",
    "hero": {
      "heading": "Ваше танго-путешествие продолжается",
      "paragraph": "Войдите, чтобы связаться с танцорами..."
    }
  }
}
```

### Step 4: Update Language File

Edit the target language file:
```bash
# Edit the file
vim client/public/locales/ru/pages.json

# Sync to backup
cp client/public/locales/ru/pages.json public/locales/ru/pages.json
```

### Step 5: Test

Visit the page with language parameter:
```
https://your-app.com/login?lng=ru
https://your-app.com/register?lng=es-ar
```

## Translation Agent Commands

The Translation Agent can be invoked to handle bulk translations:

### Translate Section
```typescript
// Translate login section for Russian
await translationAgent.translateSection('login', 'ru');
```

### Translate All Missing Keys
```typescript
// Fill all missing keys for French
await translationAgent.fillMissingKeys('fr');
```

### Audit Language
```typescript
// Get coverage report for German
const report = await translationAgent.auditLanguage('de');
```

## Quality Guidelines

### Do:
- Preserve interpolation variables: `{{count}}+ dancers` -> `{{count}}+ танцоров`
- Keep HTML tags intact: `<strong>Welcome</strong>` -> `<strong>Bienvenido</strong>`
- Maintain key structure exactly as English
- Use formal/polite forms where culturally appropriate
- Consider text length for UI (German/Russian text often longer)

### Don't:
- Translate proper nouns like "Mundo Tango"
- Change placeholder formats (keep `{{variable}}` syntax)
- Add or remove keys from the structure
- Use machine translation without review for user-facing text

## Fallback System

The i18n config (`client/src/lib/i18n.ts`) defines fallbacks:

```typescript
fallbackLng: {
  'es-ar': ['es', 'en'],      // Argentine Spanish -> Spanish -> English
  'pt-br': ['pt', 'en'],      // Brazilian Portuguese -> Portuguese -> English
  'zh-tw': ['zh', 'en'],      // Traditional Chinese -> Simplified -> English
  'zh-hk': ['zh', 'en'],      // Hong Kong Chinese -> Simplified -> English
  default: ['en'],            // All others -> English
}
```

## URL Language Parameter

Users can override language via URL:
- `?lng=es` - Switch to Spanish
- `?lng=ru` - Switch to Russian

This is configured via `lookupQuerystring: "lng"` in i18n config.

## Priority Languages

For immediate translation (login, register, onboarding):
1. Spanish (es) - Complete
2. Portuguese (pt, pt-br)
3. French (fr)
4. German (de)
5. Italian (it)
6. Russian (ru) - Complete for login/register
7. Chinese (zh, zh-tw, zh-hk)
8. Japanese (ja)
9. Korean (ko)
10. Arabic (ar)

## Translation Agent Service

Location: `server/services/mrblue/agents/features/TranslationAgent.ts`

The Translation Agent provides:
- Automated missing key detection
- Bulk translation with AI assistance
- Quality validation
- Coverage reporting
- Sync between client and backup directories

See the agent implementation for detailed API documentation.
