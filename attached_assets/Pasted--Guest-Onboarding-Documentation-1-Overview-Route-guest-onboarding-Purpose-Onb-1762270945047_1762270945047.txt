# Guest Onboarding Documentation

## 1. Overview
- **Route**: `/guest-onboarding`
- **Purpose**: Onboarding flow for guests seeking tango-friendly accommodations
- **ESA Framework Layer**: Layer 2 - User Onboarding

## 2. Technical Implementation

### Components
- `client/src/pages/GuestOnboarding.tsx` - Main guest flow
- `GuestOnboardingFlow` - Step management
- `TravelPreferences` - Stay preferences
- `BudgetSelector` - Price range setting
- `LocationPreferences` - Area selection
- `AmenityPriorities` - Feature ranking
- `TangoSchedule` - Event attendance plans
- `HostPreferences` - Host type selection

### API Endpoints
- `POST /api/guest/onboarding/start` - Begin onboarding
- `PUT /api/guest/onboarding/preferences` - Save preferences
- `GET /api/guest/onboarding/suggestions` - Get recommendations
- `POST /api/guest/onboarding/complete` - Finish setup
- `GET /api/guest/saved-searches` - Retrieve searches
- `POST /api/guest/alerts` - Set up alerts

### Real-time Features
- Dynamic recommendation updates
- Live availability checking
- Instant match notifications
- Real-time pricing updates
- Location-based suggestions

### Database Tables
- `guest_profiles` - Guest preferences
- `guest_searches` - Saved searches
- `guest_alerts` - Notification settings
- `guest_favorites` - Saved properties
- `guest_preferences` - Stay preferences
- `booking_history` - Past bookings

## 3. User Permissions
- **New Guest**: Full onboarding
- **Returning Guest**: Quick search
- **Verified Guest**: Priority access
- **Admin**: Profile management

## 4. Aurora Tide Design System Implementation

**Status:** ✅ Production-Ready (October 6, 2025)  
**Design System:** [Aurora Tide Documentation](../design-systems/aurora-tide.md)

### Glassmorphic Components

The guest onboarding uses Aurora Tide's glassmorphic panels:

```typescript
import { GlassCard } from '@/components/glass/GlassComponents';
import { ScaleIn, SlideIn, StaggerContainer } from '@/components/animations/FramerMotionWrappers';
import { PulseButton } from '@/components/interactions/MicroInteractions';

// Step Container - Depth 2-3 for wizard steps
<ScaleIn delay={0.1}>
  <GlassCard depth={3} className="border-cyan-200/30 dark:border-cyan-500/30 p-6">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
      {t('guest.step_title', 'Your Preferences')}
    </h2>
    <PreferenceForm />
  </GlassCard>
</ScaleIn>

// Preference Cards
<StaggerContainer staggerDelay={0.08}>
  {preferences.map(pref => (
    <ScaleIn key={pref.id}>
      <GlassCard 
        depth={2}
        className={cn(
          "cursor-pointer transition-all",
          "border-cyan-200/30 dark:border-cyan-500/30",
          selected && "border-cyan-400 dark:border-cyan-400 shadow-lg shadow-cyan-500/20"
        )}
        data-testid={`card-preference-${pref.id}`}
      >
        {pref.content}
      </GlassCard>
    </ScaleIn>
  ))}
</StaggerContainer>
```

### Framer Motion Animations

**Entry Animations:**
- ScaleIn for preference cards (0.3s duration)
- SlideIn for date pickers and modals
- Confetti animation on booking confirmation

**Guest Count Selector:**
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
  data-testid="button-increase-guests"
>
  <Plus className="w-5 h-5 mx-auto" />
</motion.button>
```

### MT Ocean Theme Gradients

**Welcome Header:**
```css
background: linear-gradient(135deg,
  #5EEAD4 0%,    /* cyan-300 */
  #14B8A6 25%,   /* teal-500 */
  #0D9488 50%,   /* teal-600 */
  #0F766E 75%,   /* teal-700 */
  #155E75 100%   /* cyan-900 */
);
```

**Connection Degree Chips:**
```tsx
// Direct friends
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-white">
  {t('guest.connection.direct', '1st Degree')}
</span>

// Friends of friends
<span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white">
  {t('guest.connection.indirect', '2nd Degree')}
</span>
```

**Book Now CTA:**
```tsx
<PulseButton className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-cyan-500/30">
  {t('guest.book_now', 'Request to Book')}
</PulseButton>
```

### i18next Translations

All user-facing text uses translation keys:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Step titles
{t('guest.step.dates', 'When are you traveling?')}
{t('guest.step.guests', 'How many guests?')}
{t('guest.step.preferences', 'What are your preferences?')}

// Preference options
{t('guest.preference.quiet', 'Quiet neighborhood')}
{t('guest.preference.central', 'Close to milongas')}
{t('guest.preference.kitchen', 'Kitchen access')}

// Date picker
{t('guest.checkin', 'Check-in')}
{t('guest.checkout', 'Check-out')}
{t('guest.nights', { defaultValue: '{{count}} night', defaultValue_plural: '{{count}} nights', count: 3 })}
```

### Dark Mode Support

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
">
  <h3 className="text-slate-900 dark:text-white">
    {t('guest.properties_found', '{{count}} properties match your preferences', { count: 5 })}
  </h3>
  
  <div className="mt-4 p-4 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/30 dark:border-cyan-500/30">
    <p className="text-sm text-slate-600 dark:text-slate-400">
      {t('guest.tip', 'Tip: Direct connections get priority booking')}
    </p>
  </div>
</GlassCard>
```

### Data-testid Coverage

```typescript
// Step navigation
<div data-testid="step-indicator-dates" />
<div data-testid="step-indicator-guests" />

// Form controls
<input data-testid="input-checkin-date" />
<input data-testid="input-checkout-date" />
<button data-testid="button-increase-guests" />
<button data-testid="button-decrease-guests" />

// Preference selection
<GlassCard data-testid="card-preference-quiet" />
<GlassCard data-testid="card-preference-central" />

// Booking action
<PulseButton data-testid="button-book-now" />
```

## 5. Test Coverage
- **Unit Tests**: 81% coverage
- **Integration Tests**: Preference flow
- **E2E Tests**: Complete journey
- **Recommendation Tests**: Match accuracy
- **Performance Tests**: Search speed

## 6. Known Issues
- Budget slider mobile touch sensitivity
- Location search autocomplete lag
- Preference saving race condition
- Recommendation cold start

## 7. Agent Responsibilities
- **Guest Agent**: Profile management
- **Recommendation Agent**: Property matching
- **Search Agent**: Query optimization
- **Alert Agent**: Notification handling
- **Preference Agent**: Settings management

## 8. Integration Points
- **Recommendation Engine**: ML matching
- **Search Service**: Query processing
- **Notification Service**: Alerts
- **Maps Service**: Location search
- **Analytics Service**: Behavior tracking
- **Email Service**: Welcome flow

## 9. Performance Metrics
- **Onboarding Load**: < 1.5 seconds
- **Preference Save**: < 300ms
- **Recommendation Generation**: < 2 seconds
- **Search Results**: < 1 second
- **Completion Rate**: > 70%
- **Time to First Booking**: < 24 hours

## 10. Accessibility
- **Screen Reader**: Full narration
- **Keyboard Navigation**: Tab support
- **Touch Targets**: Mobile-sized
- **Color Contrast**: WCAG AA
- **Form Validation**: Inline help
- **Language Support**: Multi-lingual

---

## 11. Related Documentation

### Housing System
- **[Housing System Hub](./index.md)** - Complete housing documentation index
- **[Housing Marketplace](./housing-marketplace.md)** - Main marketplace page
- **[Housing on Group Pages](./housing-on-group-page.md)** - City group integration
- **[Host Onboarding](./HostOnboarding.md)** - Property listing flow
- **[Guest Step 1: Accommodation](./guest/guest-step1-accommodation.md)** - Detailed step docs
- **[Guest Step 4: Location](./guest/guest-step4-location.md)** - Location preferences

### Framework
- [ESA Layer 27: Marketplace](../esa-layers/layer-27-marketplace.md)
- [ESA Framework Guide](/docs/ESA.md)