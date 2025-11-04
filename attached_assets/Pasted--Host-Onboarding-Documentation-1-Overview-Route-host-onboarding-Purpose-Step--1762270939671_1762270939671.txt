# Host Onboarding Documentation

## 1. Overview
- **Route**: `/host-onboarding`
- **Purpose**: Step-by-step wizard for hosts to list their properties on the platform
- **ESA Framework Layer**: Layer 2 - User Onboarding

## 2. Technical Implementation

### Components
- `client/src/pages/HostOnboarding.tsx` - Main onboarding flow
- `PropertyTypeStep` - Property type selection
- `PropertyDetailsStep` - Rooms, beds, amenities
- `LocationStep` - Address and map positioning
- `AmenitiesStep` - Feature selection
- `PhotosStep` - Image upload interface
- `PricingStep` - Rate configuration
- `AvailabilityStep` - Calendar setup
- `ReviewStep` - Final review and submission

### API Endpoints
- `POST /api/host/onboarding/start` - Initialize process
- `PUT /api/host/onboarding/property` - Save property data
- `POST /api/host/onboarding/photos` - Upload images
- `PUT /api/host/onboarding/pricing` - Set pricing
- `PUT /api/host/onboarding/availability` - Configure calendar
- `POST /api/host/onboarding/complete` - Publish listing
- `GET /api/host/onboarding/progress` - Resume session

### Real-time Features
- Auto-save progress
- Live address validation
- Real-time photo optimization
- Dynamic pricing suggestions
- Instant preview updates

### Database Tables
- `host_onboarding_sessions` - Progress tracking
- `draft_listings` - Temporary data
- `host_profiles` - Host information
- `property_drafts` - Property details
- `uploaded_media` - Temporary photos
- `pricing_rules` - Rate configuration

## 3. User Permissions
- **New Host**: Full onboarding access
- **Existing Host**: Quick listing mode
- **Admin**: Review and approval
- **Support**: Assistance access

## 4. Aurora Tide Design System Implementation

**Status:** ✅ Production-Ready (October 6, 2025)  
**Design System:** [Aurora Tide Documentation](../design-systems/aurora-tide.md)

### Glassmorphic Components

The host onboarding flow now uses Aurora Tide's glassmorphic card system:

```typescript
import { GlassCard } from '@/components/glass/GlassComponents';
import { FadeIn, StaggerContainer, ScaleIn } from '@/components/animations/FramerMotionWrappers';
import { MagneticButton, PulseButton } from '@/components/interactions/MicroInteractions';

// Step Container - Depth 3 for elevated wizard
<FadeIn>
  <GlassCard depth={3} className="border-cyan-200/30 dark:border-cyan-500/30">
    <StepContent />
  </GlassCard>
</FadeIn>

// Navigation Buttons
<div className="flex gap-4">
  <MagneticButton 
    onClick={handleBack}
    className="px-4 py-2 glass-card"
    data-testid="button-back"
  >
    <ArrowLeft className="w-5 h-5" />
  </MagneticButton>
  
  <PulseButton
    onClick={handleNext}
    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl"
    data-testid="button-next"
  >
    {t('onboarding.next', 'Next Step')}
  </PulseButton>
</div>
```

### Framer Motion Animations

**Step Transitions:**
- FadeIn for wizard container (0.5s duration)
- StaggerContainer for form field groups
- ScaleIn for success confirmation

**Progress Indicator:**
```typescript
<div className="h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
</div>
```

### MT Ocean Theme Gradients

**Step Cards:**
```css
/* Background gradient */
background: linear-gradient(to-br, 
  rgb(248 250 252) 0%,     /* slate-50 */
  rgb(255 255 255) 50%,    /* white */
  rgb(240 253 250) 100%    /* cyan-50 */
);

/* Dark mode */
.dark {
  background: linear-gradient(to-br,
    rgb(2 6 23) 0%,        /* slate-950 */
    rgb(15 23 42) 50%,     /* slate-900 */
    rgb(8 47 73) 100%      /* cyan-950 */
  );
}
```

**Submit Button:**
```tsx
<PulseButton className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white">
  {t('onboarding.submit', 'Publish Listing')}
</PulseButton>
```

### i18next Translations

All text uses translation keys:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Progress indicator
{t('onboarding.step', { defaultValue: 'Step {{current}} of {{total}}', current: 2, total: 8 })}

// Form labels
{t('onboarding.property_type', 'Property Type')}
{t('onboarding.location', 'Location')}
{t('onboarding.amenities', 'Amenities')}

// Validation messages
{t('onboarding.error.required', 'This field is required')}
{t('onboarding.error.invalid_address', 'Please enter a valid address')}
```

### Dark Mode Support

All components include dark mode variants:

```tsx
<GlassCard className="
  bg-white/80 dark:bg-slate-900/80
  border-cyan-200/30 dark:border-cyan-500/30
  text-slate-900 dark:text-white
">
  <h3 className="text-slate-900 dark:text-white">
    {t('onboarding.welcome', 'Welcome, Host!')}
  </h3>
  <p className="text-slate-600 dark:text-slate-400">
    {t('onboarding.subtitle', 'List your space')}
  </p>
</GlassCard>
```

### Data-testid Coverage

```typescript
// Step indicator
<div data-testid="step-indicator-1" />

// Form fields
<input data-testid="input-property-type" />
<input data-testid="input-address" />

// Navigation
<MagneticButton data-testid="button-back" />
<PulseButton data-testid="button-next" />
<PulseButton data-testid="button-submit" />

// Photo upload
<div data-testid="upload-zone" />
<button data-testid="button-upload-photo" />
```

## 5. Test Coverage
- **Unit Tests**: 83% coverage
- **Integration Tests**: Multi-step flow
- **E2E Tests**: Complete onboarding
- **Upload Tests**: Photo handling
- **Validation Tests**: Form validation

## 6. Known Issues
- Photo upload progress on slow connections
- Map pin placement accuracy
- Calendar widget mobile display
- Auto-save conflict resolution

## 7. Agent Responsibilities
- **Onboarding Agent**: Flow management
- **Validation Agent**: Data verification
- **Photo Agent**: Image processing
- **Pricing Agent**: Rate optimization
- **Geocoding Agent**: Address validation

## 8. Integration Points
- **Google Maps**: Location services
- **Image Service**: Photo optimization
- **Calendar Service**: Availability setup
- **Pricing Engine**: Rate suggestions
- **Email Service**: Welcome messages
- **Analytics Service**: Conversion tracking

## 9. Performance Metrics
- **Step Load**: < 1 second
- **Photo Upload**: < 5 seconds per image
- **Address Lookup**: < 500ms
- **Save Progress**: < 300ms
- **Completion Rate**: > 60%
- **Average Time**: 10-15 minutes

## 10. Accessibility
- **Screen Reader**: Step announcements
- **Keyboard Navigation**: Full support
- **Error Messages**: Clear guidance
- **Help Tooltips**: Context assistance
- **Skip Options**: Advanced users
- **Mobile Optimized**: Touch interface

---

## 11. Related Documentation

### Housing System
- **[Housing System Hub](./index.md)** - Complete housing documentation index
- **[Housing Marketplace](./housing-marketplace.md)** - Main marketplace page
- **[Housing on Group Pages](./housing-on-group-page.md)** - City group integration
- **[Guest Onboarding](./GuestOnboarding.md)** - Guest preferences flow

### Map & Location
- [Geocoding System](../geocoding-system/index.md) - Automatic geocoding
- [LocationStep Implementation](../geocoding-system/map-components.md) - Map integration

### Framework
- [ESA Layer 27: Marketplace](../esa-layers/layer-27-marketplace.md)
- [ESA Framework Guide](/docs/ESA.md)