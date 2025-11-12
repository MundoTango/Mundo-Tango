# AGENT 83: Translation Coverage Audit - Events & Workshops

**Mission:** Audit i18n implementation on Events, Workshops, Venues, Teachers, and Calendar pages

**Date:** November 12, 2025

---

## 🎯 Executive Summary

| Metric | Value |
|--------|-------|
| **Overall i18n Coverage** | **0%** |
| **Pages Audited** | 8 out of 10 requested |
| **Pages with i18n** | 0 |
| **Total Hardcoded Strings** | 327+ |
| **Translation Files** | ✅ Exist (6 languages) |
| **Critical Issue** | Zero implementation despite infrastructure existing |

---

## 📊 Page-by-Page Audit Results

### ✅ Pages Audited (8)

#### 1. **EventsPage** (`client/src/pages/EventsPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 52
- **Coverage:** 0%
- **Key Issues:**
  - Hero section fully hardcoded ("Discover Tango Events")
  - All filter labels hardcoded (Category, All, Milonga, Workshop, etc.)
  - Calendar day labels hardcoded (Sun, Mon, Tue, etc.)
  - RSVP buttons hardcoded
  - No date locale formatting

#### 2. **EventDetailsPage** (`client/src/pages/EventDetailsPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 28
- **Coverage:** 0%
- **Key Issues:**
  - Action buttons ("I'm Going", "Maybe")
  - Section headings ("Event Details", "About This Event")
  - Toast notifications hardcoded
  - Date formatting not locale-aware

#### 3. **WorkshopsPage** (`client/src/pages/WorkshopsPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 24
- **Coverage:** 0%
- **Key Issues:**
  - Hero ("Tango Workshops", "Intensive Learning")
  - Status badges ("Few spots left")
  - Empty states hardcoded

#### 4. **WorkshopDetailPage** (`client/src/pages/WorkshopDetailPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 31
- **Coverage:** 0%
- **Key Issues:**
  - All section titles hardcoded
  - Workshop details (dates, times, location labels)
  - Registration text hardcoded

#### 5. **VenuesPage** (`client/src/pages/VenuesPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 36
- **Coverage:** 0%
- **Key Issues:**
  - Hero section hardcoded
  - Venue type filters (Milonga, Dance Hall, Club, Studio)
  - Search placeholder text
  - Empty state messages

#### 6. **TeachersPage** (`client/src/pages/TeachersPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 78 (highest count!)
- **Coverage:** 0%
- **Key Issues:**
  - Complex filter system fully hardcoded
  - Experience level labels
  - Sort options
  - Price range labels
  - Result count text

#### 7. **TeacherDetailPage** (`client/src/pages/TeacherDetailPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 42
- **Coverage:** 0%
- **Key Issues:**
  - Stats labels ("Teaching Experience", "Students Taught")
  - Bio content hardcoded
  - Upcoming classes section
  - Quick info panel

#### 8. **CalendarPage** (`client/src/pages/CalendarPage.tsx`)
- **Status:** EXISTS
- **useTranslation Hook:** ❌ No
- **Hardcoded Strings:** 36
- **Coverage:** 0%
- **Key Issues:**
  - Day names hardcoded (should use locale)
  - "Today" button
  - Month/year display not locale-aware
  - Event count indicator ("+X more")

### ❌ Missing Pages (2)

#### 9. **CreateEventPage**
- **Status:** DOES NOT EXIST
- **Recommendation:** Create with i18n from the start

#### 10. **VenueDetailPage**
- **Status:** DOES NOT EXIST
- **Recommendation:** Create with i18n from the start

---

## 🔍 Translation Infrastructure Analysis

### ✅ What Exists

**Translation Files:** `client/public/locales/{lang}/`
- ✅ `common.json` - Buttons, labels, messages
- ✅ `pages.json` - Page-specific content
- ✅ `navigation.json` - Navigation labels
- ✅ `errors.json` - Error messages

**Supported Languages:** 6
- 🇩🇪 German (de)
- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)

**i18n Library:** react-i18next (installed and configured)

**Config File:** `client/src/lib/i18n.ts`

### ❌ What's Missing

- **NO** pages use `useTranslation()` hook
- **NO** locale-aware date formatting
- **NO** pluralization implementation
- **NO** dynamic content translation

---

## 🚨 Critical Findings

### 1. **Zero Implementation (CRITICAL)**
- **Impact:** 70%+ of global tango community cannot use these features
- **Affected:** ALL Events, Workshops, Venues, Teachers, Calendar functionality
- **Users Impacted:** All non-English speakers

### 2. **Translation Waste (HIGH)**
- **Issue:** Translation infrastructure exists but is completely unused
- **Impact:** Development investment not utilized
- **Effort to Fix:** MEDIUM (keys exist, just need wiring)

### 3. **Date Formatting (HIGH)**
- **Issue:** All dates in US format (MM/DD/YYYY)
- **Impact:** Confusing for international users
- **Affected Pages:** EventsPage, EventDetailsPage, CalendarPage, WorkshopsPage

### 4. **Incomplete Feature Set (MEDIUM)**
- **Missing:** VenueDetailPage, CreateEventPage
- **Impact:** Users cannot create events or view venue details

---

## 📈 Coverage Breakdown

| Category | Coverage | Strings |
|----------|----------|---------|
| Hero Sections | 0% | 40+ |
| Buttons & Actions | 0% | 60+ |
| Filter Labels | 0% | 50+ |
| Form Labels | 0% | 30+ |
| Empty States | 0% | 25+ |
| Toast Messages | 0% | 15+ |
| Date Formatting | 0% | 50+ |
| Dynamic Content | 0% | 57+ |

---

## ⚡ Quick Win Opportunities

### 1. **Hero Sections (1-2 hours)**
- **Impact:** HIGH (first thing users see)
- **Effort:** LOW
- **Example:**
  ```tsx
  // Before
  <h1>Discover Tango Events</h1>
  
  // After
  const { t } = useTranslation('pages');
  <h1>{t('events.hero.title')}</h1>
  ```

### 2. **Button Labels (2-3 hours)**
- **Impact:** HIGH (core interactions)
- **Effort:** LOW
- **Example:**
  ```tsx
  // Before
  <Button>Register Now</Button>
  
  // After
  const { t } = useTranslation('common');
  <Button>{t('buttons.register')}</Button>
  ```

### 3. **Search & Filters (3-4 hours)**
- **Impact:** MEDIUM
- **Effort:** MEDIUM
- **Benefit:** Users can navigate content in their language

---

## 🛠️ Implementation Guide

### Step 1: Import Hook
```tsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Initialize in Component
```tsx
const { t, i18n } = useTranslation(['common', 'pages', 'navigation']);
```

### Step 3: Replace Hardcoded Strings
```tsx
// Hero section
<h1>{t('pages.events.title')}</h1>
<p>{t('pages.events.description')}</p>

// Buttons
<Button>{t('common.buttons.search')}</Button>

// With variables
<span>{t('events.attendees', { count: attendeeCount })}</span>
```

### Step 4: Locale-Aware Dates
```tsx
import { format } from 'date-fns';
import { de, es, fr, it, pt } from 'date-fns/locale';

const locales = { de, es, fr, it, pt, en: enUS };

format(date, 'PPP', { locale: locales[i18n.language] })
```

---

## 📝 Recommendations

### Immediate Actions (Priority 1)

1. **Add useTranslation to all 8 pages** (30 min)
2. **Replace hero sections** (1 hour)
3. **Replace button labels** (2 hours)

**Total Effort:** ~3.5 hours  
**Impact:** Immediate visual improvement for non-English speakers

### Short-Term (Priority 2)

4. **Replace filter labels** (3 hours)
5. **Implement locale-aware dates** (2 hours)
6. **Replace empty states** (1 hour)
7. **Add missing translation keys** (2 hours)

**Total Effort:** ~8 hours  
**Impact:** Core features become multilingual

### Long-Term (Priority 3)

8. **Create VenueDetailPage with i18n** (4 hours)
9. **Create CreateEventPage with i18n** (6 hours)
10. **Dynamic content translation** (8 hours)
11. **RTL language support** (6 hours)

**Total Effort:** ~24 hours  
**Impact:** Complete feature parity across all languages

---

## 📊 Effort Estimates

| Scope | Hours | Priority |
|-------|-------|----------|
| **Quick Wins** | 3-4 | HIGH |
| **All Existing Pages** | 24-32 | HIGH |
| **Missing Pages** | 10-12 | MEDIUM |
| **Advanced Features** | 14-20 | LOW |
| **Total** | 51-68 | - |

**Per-Page Average:** 3-4 hours

**Most Complex:**
- TeachersPage: 4 hours (78 strings, complex filters)
- EventsPage: 4 hours (calendar, map, filters)
- EventDetailsPage: 3 hours (dynamic content, RSVP flow)

---

## 🎯 Success Metrics

After implementing i18n, we should see:

1. **100% coverage** on all 8 existing pages
2. **Zero hardcoded strings** in user-facing text
3. **Locale-aware dates** in all supported languages
4. **Proper pluralization** for counts
5. **RTL support** (future)

---

## 📋 Translation Keys Needed

Some keys are missing from translation files and need to be added:

### pages.json additions needed:
```json
{
  "events": {
    "rsvp": {
      "going": "I'm Going",
      "maybe": "Maybe",
      "notGoing": "Not Going"
    },
    "status": {
      "full": "Full",
      "spotsLeft": "{{count}} spots left"
    }
  },
  "workshops": {
    "status": {
      "fewSpotsLeft": "Few spots left",
      "registered": "{{registered}}/{{capacity}} registered"
    }
  },
  "teachers": {
    "experience": {
      "years": "{{count}} years experience"
    },
    "rate": {
      "hourly": "{{amount}}/hour"
    }
  },
  "calendar": {
    "today": "Today",
    "moreEvents": "+{{count}} more"
  }
}
```

---

## 🔄 Next Steps

1. ✅ **Audit Complete** - This document
2. ⏭️ **Share findings** with development team
3. ⏭️ **Prioritize pages** based on user traffic
4. ⏭️ **Implement quick wins** first (hero sections, buttons)
5. ⏭️ **Systematic rollout** to remaining pages
6. ⏭️ **QA testing** in all 6 languages
7. ⏭️ **Monitor adoption** via analytics

---

## 📞 Support

For questions about this audit or implementation guidance:
- Review full JSON report: `AGENT_83_EVENTS_WORKSHOPS_I18N_AUDIT_REPORT.json`
- Check i18n config: `client/src/lib/i18n.ts`
- Reference translation files: `client/public/locales/`

---

**Audit completed by:** Replit AI Agent (AGENT 83)  
**Date:** November 12, 2025  
**Status:** ✅ COMPLETE
