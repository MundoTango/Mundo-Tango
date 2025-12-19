# Component Showcase

**Complete reference for all adaptive components**  
**Version**: 1.0.0  
**Coverage**: Bold Minimaximalist + MT Ocean themes

---

## AdaptiveButton

Auto-switching button component that adapts to current theme.

### Import

```tsx
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
```

### Variants

#### Primary Button

```tsx
<AdaptiveButton variant="primary" size="md">
  Click Me
</AdaptiveButton>
```

**Bold theme**: Burgundy #b91c3b background, 600 weight, 6px radius, strong shadow  
**Ocean theme**: Turquoise #14b8a6 background, 400 weight, 16px radius, soft shadow

#### Secondary Button

```tsx
<AdaptiveButton variant="secondary" size="md">
  Click Me
</AdaptiveButton>
```

**Bold theme**: Transparent background, burgundy border, 600 weight  
**Ocean theme**: Transparent background, turquoise border, 400 weight

#### Ghost Button

```tsx
<AdaptiveButton variant="ghost" size="sm">
  Cancel
</AdaptiveButton>
```

**Both themes**: Transparent, subtle hover effect

### Sizes

```tsx
<AdaptiveButton size="sm">Small</AdaptiveButton>
<AdaptiveButton size="md">Medium (default)</AdaptiveButton>
<AdaptiveButton size="lg">Large</AdaptiveButton>
```

### Full Example

```tsx
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { Save, X } from 'lucide-react';

function ActionButtons() {
  return (
    <div className="flex gap-4">
      <AdaptiveButton 
        variant="primary" 
        size="lg"
        onClick={handleSave}
      >
        <Save className="mr-2" size={20} />
        Save Changes
      </AdaptiveButton>
      
      <AdaptiveButton 
        variant="ghost" 
        size="lg"
        onClick={handleCancel}
      >
        <X className="mr-2" size={20} />
        Cancel
      </AdaptiveButton>
    </div>
  );
}
```

---

## AdaptiveCard

Auto-switching card component with solid or glassmorphic variants.

### Import

```tsx
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
```

### Variants

#### Solid Card

```tsx
<AdaptiveCard variant="solid">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</AdaptiveCard>
```

**Bold theme**: Solid white background, 6px radius, burgundy shadow  
**Ocean theme**: Solid white background, 16px radius, turquoise shadow, subtle border

#### Glass Card (Ocean Only)

```tsx
<AdaptiveCard variant="glass">
  <h3>Glassmorphic Card</h3>
  <p>Works best on Ocean theme</p>
</AdaptiveCard>
```

**Bold theme**: Falls back to solid (no glassmorphic effect)  
**Ocean theme**: Semi-transparent background, 20px backdrop blur, 16px radius

#### Outlined Card

```tsx
<AdaptiveCard variant="outlined">
  <h3>Outlined Card</h3>
  <p>Transparent background with border</p>
</AdaptiveCard>
```

**Bold theme**: 2px burgundy border, 6px radius  
**Ocean theme**: 1px turquoise border, 16px radius

### Full Example

```tsx
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';

function ProfileCard({ user }: { user: User }) {
  return (
    <AdaptiveCard variant="glass" className="max-w-md">
      <img 
        src={user.avatar} 
        alt={user.name}
        className="w-20 h-20 rounded-full mb-4"
      />
      
      <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-heading)] mb-2">
        {user.name}
      </h3>
      
      <p className="text-[var(--color-text-secondary)] mb-4">
        {user.bio}
      </p>
      
      <AdaptiveButton variant="primary" className="w-full">
        Follow
      </AdaptiveButton>
    </AdaptiveCard>
  );
}
```

---

## AdaptiveHeading

Typography components that adapt weight and size to theme.

### Import

```tsx
import { 
  AdaptiveH1, 
  AdaptiveH2, 
  AdaptiveH3, 
  AdaptiveBody 
} from '@/components/adaptive/AdaptiveHeading';
```

### Components

#### H1 - Hero Heading

```tsx
<AdaptiveH1>Main Page Title</AdaptiveH1>
```

**Bold theme**: 48px, 800 weight, 1.2 line height  
**Ocean theme**: 36px, 600 weight, 1.375 line height

#### H2 - Section Heading

```tsx
<AdaptiveH2>Section Title</AdaptiveH2>
```

**Bold theme**: 36px, 800 weight  
**Ocean theme**: 30px, 600 weight

#### H3 - Subsection Heading

```tsx
<AdaptiveH3>Subsection Title</AdaptiveH3>
```

**Bold theme**: 30px, 700 weight  
**Ocean theme**: 24px, 500 weight

#### Body Text

```tsx
<AdaptiveBody>
  This is body text that adapts to the theme
</AdaptiveBody>
```

**Bold theme**: 16px, 600 weight  
**Ocean theme**: 16px, 400 weight

### Full Example

```tsx
import { AdaptiveH1, AdaptiveH2, AdaptiveBody } from '@/components/adaptive/AdaptiveHeading';
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';

function ArticleCard({ article }: { article: Article }) {
  return (
    <AdaptiveCard variant="solid">
      <AdaptiveH2 className="mb-4">
        {article.title}
      </AdaptiveH2>
      
      <AdaptiveBody className="mb-6">
        {article.excerpt}
      </AdaptiveBody>
      
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-text-muted)] text-[var(--font-size-caption)]">
          By {article.author}
        </span>
      </div>
    </AdaptiveCard>
  );
}
```

---

## Composition Examples

### Marketing Hero Section

```tsx
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';

function MarketingHero() {
  return (
    <section className="relative h-screen flex items-center justify-center">
      {/* Gradient background (auto-switches) */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-[var(--font-size-hero)] font-[var(--font-weight-heading)] mb-6 leading-[var(--line-height-heading)]">
          Welcome to Mundo Tango
        </h1>
        
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join 10,000+ dancers worldwide
        </p>
        
        <AdaptiveButton variant="primary" size="lg">
          Get Started
        </AdaptiveButton>
      </div>
    </section>
  );
}
```

### Social Feed Post

```tsx
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

function FeedPost({ post }: { post: Post }) {
  return (
    <AdaptiveCard variant="glass">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={post.user.avatar} 
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h4 className="font-[var(--font-weight-heading)] text-[var(--font-size-body)]">
            {post.user.name}
          </h4>
          <span className="text-[var(--color-text-muted)] text-[var(--font-size-caption)]">
            {post.timestamp}
          </span>
        </div>
      </div>
      
      {/* Post Content */}
      <p className="mb-4 font-[var(--font-weight-body)]">
        {post.content}
      </p>
      
      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-[var(--border-color-light)]">
        <AdaptiveButton variant="ghost" size="sm">
          <Heart className="mr-1" size={18} />
          {post.likes}
        </AdaptiveButton>
        <AdaptiveButton variant="ghost" size="sm">
          <MessageCircle className="mr-1" size={18} />
          {post.comments}
        </AdaptiveButton>
        <AdaptiveButton variant="ghost" size="sm">
          <Share2 className="mr-1" size={18} />
          Share
        </AdaptiveButton>
      </div>
    </AdaptiveCard>
  );
}
```

### Event Card

```tsx
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { Calendar, MapPin, Users } from 'lucide-react';

function EventCard({ event }: { event: Event }) {
  return (
    <AdaptiveCard variant="solid" className="overflow-hidden">
      {/* Event Image */}
      <img 
        src={event.image} 
        className="w-full h-48 object-cover -m-[var(--spacing-card)] mb-4"
      />
      
      {/* Event Info */}
      <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-heading)] mb-3">
        {event.title}
      </h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Calendar size={18} className="text-[var(--color-primary)]" />
          <span className="text-[var(--font-size-body)]">{event.date}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <MapPin size={18} className="text-[var(--color-primary)]" />
          <span className="text-[var(--font-size-body)]">{event.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Users size={18} className="text-[var(--color-primary)]" />
          <span className="text-[var(--font-size-body)]">{event.attending} attending</span>
        </div>
      </div>
      
      {/* CTA */}
      <AdaptiveButton variant="primary" className="w-full">
        RSVP Now
      </AdaptiveButton>
    </AdaptiveCard>
  );
}
```

### Stats Dashboard

```tsx
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
import { TrendingUp, Users, Calendar, Heart } from 'lucide-react';

function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <AdaptiveCard variant="solid">
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 rounded-[var(--radius-button)] bg-[var(--color-primary)]/10">
          {icon}
        </div>
        <span className="text-[var(--color-accent)] text-sm font-[var(--font-weight-body)]">
          {trend}
        </span>
      </div>
      
      <div className="text-3xl font-[var(--font-weight-heading)] text-[var(--color-text-primary)] mb-1">
        {value}
      </div>
      
      <div className="text-[var(--color-text-muted)] text-[var(--font-size-caption)]">
        {label}
      </div>
    </AdaptiveCard>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={<Users className="text-[var(--color-primary)]" size={24} />}
        label="Total Users"
        value="10,284"
        trend="+12%"
      />
      <StatCard 
        icon={<Calendar className="text-[var(--color-primary)]" size={24} />}
        label="Events This Month"
        value="542"
        trend="+8%"
      />
      <StatCard 
        icon={<Heart className="text-[var(--color-primary)]" size={24} />}
        label="Engagement Rate"
        value="94%"
        trend="+3%"
      />
      <StatCard 
        icon={<TrendingUp className="text-[var(--color-primary)]" size={24} />}
        label="Growth"
        value="23%"
        trend="+15%"
      />
    </div>
  );
}
```

---

## Theme-Specific Components

### Dark Mode Toggle

```tsx
import { useTheme } from '@/contexts/theme-context';
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { Moon, Sun } from 'lucide-react';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <AdaptiveButton
      variant="ghost"
      size="sm"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
    >
      {darkMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </AdaptiveButton>
  );
}
```

### Theme Indicator (Debug)

```tsx
import { useTheme } from '@/contexts/theme-context';

function ThemeIndicator() {
  const { visualTheme } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] text-xs font-[var(--font-weight-body)]">
      {visualTheme === 'bold-minimaximalist' ? 'BOLD' : 'OCEAN'}
    </div>
  );
}
```

---

## Best Practices

### DO ✅

- **Use adaptive components** for all common UI elements
- **Combine with CSS variables** for custom styling
- **Test both themes** when building new features
- **Check dark mode** on both themes
- **Use proper semantic HTML** for accessibility

### DON'T ❌

- **Override theme styles** with hardcoded colors
- **Mix adaptive and non-adaptive** components inconsistently
- **Forget testid attributes** for testing
- **Assume glassmorphic** works on Bold theme (it doesn't)
- **Use fixed font weights** instead of CSS variables

---

## Testing Components

### Visual Snapshot Test

```typescript
// tests/visual/adaptive-button.spec.ts
import { test, expect } from '@playwright/test';

test('AdaptiveButton on Bold theme', async ({ page }) => {
  await page.goto('/marketing-prototype');
  
  const button = page.locator('[data-testid="button-join"]');
  await expect(button).toHaveScreenshot('button-bold-light.png');
  
  // Toggle dark mode
  await page.click('[aria-label="Toggle dark mode"]');
  await expect(button).toHaveScreenshot('button-bold-dark.png');
});

test('AdaptiveButton on Ocean theme', async ({ page }) => {
  await page.goto('/feed');
  
  const button = page.locator('[data-testid="button-post"]');
  await expect(button).toHaveScreenshot('button-ocean-light.png');
  
  // Toggle dark mode
  await page.click('[aria-label="Toggle dark mode"]');
  await expect(button).toHaveScreenshot('button-ocean-dark.png');
});
```

---

## Resources

- **Usage Guide**: `docs/THEME_USAGE_GUIDE.md`
- **Token System**: `docs/DESIGN_TOKEN_SYSTEM.md`
- **Migration Guide**: `docs/THEME_MIGRATION_GUIDE.md`

---

**Built with MB.MD Protocol** 🎨  
*Simultaneously • Recursively • Critically*
