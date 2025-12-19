# MT OCEAN EDITORIAL DESIGN PATTERNS
## Mundo Tango Platform - Complete Editorial Design System

**Created:** November 12, 2025  
**Version:** 1.0  
**Theme:** MT Ocean (Turquoise → Dodger Blue → Cobalt Blue)  
**Design Philosophy:** Modern glassmorphic editorial with magazine-style asymmetric layouts

---

## COLOR SYSTEM

### Primary Palette (MT Ocean Theme)
```css
--primary: 177 72% 56%;              /* Turquoise #0EA5E9 */
--secondary: 210 100% 56%;           /* Dodger Blue #1E90FF */
--accent: 218 100% 34%;              /* Cobalt Blue #0047AB */
```

### Gradient Definitions
```css
/* Ocean Gradient (Turquoise → Blue → Cobalt) */
.ocean-gradient {
  background: linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%);
}

/* Ocean Gradient Text */
.ocean-gradient-text {
  background: linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Subtle Memory Feed Gradient */
.gradient-memories {
  background: linear-gradient(135deg, 
    hsl(var(--gradient-memories-start)) 0%, 
    hsl(var(--gradient-memories-end)) 100%
  );
}

/* Hero Section Gradient */
.gradient-hero {
  background: linear-gradient(135deg, 
    hsl(var(--gradient-hero-start)) 0%, 
    hsl(var(--gradient-hero-end)) 100%
  );
}
```

### Dark Mode Overlays
```css
/* Light Mode Hero Overlay */
.hero-overlay-light {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    hsl(var(--background)) 100%
  );
}

/* Dark Mode Hero Overlay */
.dark .hero-overlay-dark {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    hsl(var(--background)) 100%
  );
}
```

---

## TYPOGRAPHY SYSTEM

### Font Families
```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-serif: "Playfair Display", Georgia, serif;
--font-mono: Menlo, Monaco, "Courier New", monospace;
```

### Editorial Typography Hierarchy
```tsx
// H1 - Hero Headlines
<h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight">
  Discover Tango Events
</h1>

// H2 - Section Headlines
<h2 className="text-3xl md:text-4xl font-serif font-bold">
  Our Values
</h2>

// H3 - Card Headlines
<h3 className="text-2xl font-serif font-bold">
  Community First
</h3>

// Lead Paragraph
<p className="text-xl text-white/80 max-w-2xl mx-auto">
  Find milongas, workshops, and performances near you
</p>

// Body Text
<p className="text-muted-foreground">
  Regular body text content
</p>

// Small Text
<span className="text-sm text-muted-foreground">
  Caption or helper text
</span>
```

---

## GLASSMORPHIC COMPONENTS

### Glass Card
```tsx
<Card className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-8">
  {/* Content */}
</Card>
```

### Glass Badge
```tsx
<Badge className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
  Category
</Badge>
```

### Glass Panel (CTA, Stats)
```tsx
<div className="backdrop-blur-lg bg-white/15 dark:bg-black/25 border border-white/30 rounded-xl p-6">
  {/* Panel content */}
</div>
```

---

## HERO SECTION PATTERNS

### Full-Height Hero with Image Background
```tsx
<div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
  {/* Background Image */}
  <div 
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url('https://images.unsplash.com/...')`
    }}
  >
    {/* MT Ocean Dark Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
  </div>
  
  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Glassmorphic Badge */}
      <Badge 
        variant="outline" 
        className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm"
      >
        Events & Milongas
      </Badge>
      
      {/* Hero Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
        Discover Tango Events
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
        Find milongas, workshops, and performances near you
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 justify-center">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Event
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline" className="backdrop-blur-sm bg-white/20 border-white/30">
          Explore
        </Button>
      </div>
    </motion.div>
  </div>
</div>
```

### Hero with Video Background
```tsx
<div className="relative h-screen w-full overflow-hidden">
  {/* Video Background */}
  <video 
    autoPlay 
    loop 
    muted 
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/videos/tango-hero.mp4" type="video/mp4" />
  </video>
  
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
  
  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
    {/* Same content structure as image hero */}
  </div>
</div>
```

---

## EDITORIAL CARD PATTERNS

### Feature Card (16:9 Image)
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  <Card className="overflow-hidden hover-elevate">
    {/* 16:9 Image with Gradient Overlay */}
    <div className="relative aspect-[16/9] overflow-hidden">
      <motion.img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-serif font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>
    </div>

    {/* Card Content */}
    <CardContent className="p-6 space-y-3">
      <p className="text-muted-foreground">{description}</p>
      
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-primary" />
        <span>{metadata}</span>
      </div>
    </CardContent>

    {/* Card Footer */}
    <CardFooter className="flex gap-2 pt-0 px-6 pb-6">
      <Button className="flex-1">
        Primary Action
      </Button>
      <Button variant="outline">
        Secondary
      </Button>
    </CardFooter>
  </Card>
</motion.div>
```

### Editorial Article Card (Magazine Style)
```tsx
<motion.article
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
  className="mb-12"
>
  {/* Large Feature Image */}
  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
    <motion.img
      src={imageUrl}
      alt={title}
      className="w-full h-full object-cover"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.6 }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    
    {/* Overlay Content */}
    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
          Category
        </Badge>
        {isFeatured && (
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
            <Star className="w-3 h-3 fill-white" />
            <span>Featured</span>
          </div>
        )}
      </div>
      <h2 className="text-3xl font-serif font-bold">{title}</h2>
    </div>
  </div>

  {/* Article Content */}
  <div className="space-y-6 px-2">
    <p className="text-lg leading-relaxed text-foreground/90">
      {excerpt}
    </p>

    <div className="flex flex-wrap items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-semibold">{stat}</span>
        <span className="text-muted-foreground">{label}</span>
      </div>
    </div>

    <Button size="lg" className="gap-2">
      Read More
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>

  <Separator className="mt-12" />
</motion.article>
```

### Value/Benefit Card
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, delay: 0.1 }}
>
  <Card className="hover-elevate">
    <CardContent className="p-8 space-y-3">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      
      {/* Headline */}
      <h3 className="text-2xl font-serif font-bold">Community First</h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground">
        We prioritize authentic connections and meaningful interactions
      </p>
    </CardContent>
  </Card>
</motion.div>
```

---

## LAYOUT PATTERNS

### Two-Column Asymmetric Grid
```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  {/* Image Column */}
  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
    <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
  </div>
  
  {/* Content Column */}
  <div className="space-y-6">
    <h2 className="text-4xl font-serif font-bold">Feature Headline</h2>
    <p className="text-lg text-muted-foreground">
      Feature description with benefits
    </p>
    <ul className="space-y-3">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-3">
          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
    <Button size="lg">Learn More</Button>
  </div>
</div>
```

### Three-Column Feature Grid
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature, index) => (
    <motion.div
      key={feature.id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="h-full hover-elevate">
        {/* Feature content */}
      </Card>
    </motion.div>
  ))}
</div>
```

### Magazine-Style Content + Sidebar
```tsx
<div className="container mx-auto px-6 py-12">
  <div className="flex gap-12">
    {/* Main Content Column (max-w-5xl) */}
    <div className="flex-1 max-w-5xl">
      <article className="space-y-8">
        {/* Editorial content */}
      </article>
    </div>

    {/* Sticky Sidebar (w-96) */}
    <aside className="w-96 space-y-6 sticky top-8 self-start hidden lg:block">
      <Card className="p-6">
        {/* Sidebar widgets */}
      </Card>
    </aside>
  </div>
</div>
```

---

## ANIMATION PATTERNS

### Scroll-Triggered Fade-Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

### Staggered List Animation
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
  >
    {/* Item content */}
  </motion.div>
))}
```

### Image Hover Zoom
```tsx
<div className="overflow-hidden rounded-2xl">
  <motion.img
    src={imageUrl}
    alt={alt}
    className="w-full h-full object-cover"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.6 }}
  />
</div>
```

### Card Hover Lift
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
>
  <Card className="hover-elevate">
    {/* Card content */}
  </Card>
</motion.div>
```

---

## SPACING SYSTEM

### MT Ocean Standard Spacing
```tsx
// Section Padding
className="py-12 md:py-20"          // Vertical section spacing
className="px-6 md:px-8"            // Horizontal container padding

// Component Spacing
className="space-y-6"               // Small vertical spacing
className="space-y-8"               // Medium vertical spacing
className="space-y-12"              // Large vertical spacing
className="gap-6"                   // Grid/flex gap (medium)
className="gap-8"                   // Grid/flex gap (large)

// Card Padding
className="p-6"                     // Standard card padding
className="p-8"                     // Large card padding
className="px-6 py-4"               // Compact card padding
```

---

## RESPONSIVE PATTERNS

### Mobile-First Typography
```tsx
// Responsive Headline
className="text-3xl md:text-4xl lg:text-5xl"

// Responsive Body
className="text-base md:text-lg"

// Responsive Spacing
className="py-12 md:py-20"
className="px-4 md:px-6 lg:px-8"
```

### Responsive Grids
```tsx
// Two Column → Three Column
className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"

// Stack → Side-by-Side
className="grid lg:grid-cols-2 gap-12"

// Hide on Mobile, Show on Desktop
className="hidden lg:block"

// Show on Mobile, Hide on Desktop
className="lg:hidden"
```

---

## COMPONENT REQUIREMENTS

### Required Components for ALL Pages
```tsx
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function MyPage() {
  return (
    <SelfHealingErrorBoundary pageName="PageName" fallbackRoute="/feed">
      <PageLayout title="Page Title" showBreadcrumbs>
        <PublicLayout> {/* or omit for authenticated pages */}
          <SEO
            title="Page Title - Mundo Tango"
            description="Concise description 150-160 chars"
          />
          
          {/* Page content */}
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
```

---

## SEO REQUIREMENTS

### Required Meta Tags
```tsx
<SEO
  title="Unique Page Title - Mundo Tango"
  description="Concise, descriptive meta description between 150-160 characters that accurately summarizes the page content and includes key terms."
/>
```

### SEO Best Practices
1. **Title**: 50-60 characters, includes "- Mundo Tango"
2. **Description**: 150-160 characters, action-oriented
3. **Keywords**: Naturally integrated into content
4. **Headings**: Proper H1 → H6 hierarchy
5. **Alt Text**: All images have descriptive alt attributes
6. **Semantic HTML**: Use `<article>`, `<section>`, `<nav>` appropriately

---

## ACCESSIBILITY REQUIREMENTS

### Data Test IDs
```tsx
// Interactive Elements
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<Link data-testid="link-profile">Profile</Link>

// Display Elements
<h1 data-testid="text-page-title">Title</h1>
<img data-testid="img-hero" alt="Description" />
<Badge data-testid="badge-category">Category</Badge>

// Dynamic Lists
{events.map((event) => (
  <Card key={event.id} data-testid={`card-event-${event.id}`}>
    {/* Content */}
  </Card>
))}
```

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text)
- White text on dark gradients: verified contrast
- Primary color on white background: verified contrast
- Muted text: minimum 3:1 contrast

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators
- Logical tab order

---

## DARK MODE SUPPORT

### Required Dark Mode Classes
```tsx
// Background
className="bg-background dark:bg-background"

// Text
className="text-foreground dark:text-foreground"
className="text-muted-foreground dark:text-muted-foreground"

// Borders
className="border border-border dark:border-border"

// Cards (automatic via theme)
<Card> {/* Automatically adapts to dark mode */}

// Custom Elements
className="bg-white dark:bg-black"
className="text-black dark:text-white"
```

---

## QUICK REFERENCE CHECKLIST

### For Every New Editorial Page
- [ ] Uses `<SEO>` component with unique title/description
- [ ] Wrapped in `<SelfHealingErrorBoundary>`
- [ ] Uses `<PageLayout>` or appropriate layout
- [ ] Hero section with MT Ocean gradient overlay
- [ ] Glassmorphic badges/panels where appropriate
- [ ] Framer Motion scroll animations
- [ ] Responsive typography (mobile-first)
- [ ] Proper spacing (MT Ocean system)
- [ ] Data test IDs on all interactive elements
- [ ] Dark mode support
- [ ] Alt text on all images
- [ ] Semantic HTML structure
- [ ] WCAG AA color contrast
- [ ] Mobile responsive (tested)

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** November 12, 2025  
**Maintained By:** Mundo Tango Design Team
