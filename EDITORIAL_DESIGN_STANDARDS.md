# Editorial Design Standards - Mundo Tango Platform
## Apply to ALL User-Facing Pages (Not Admin Backend)

### Core Principles
- **Magazine Editorial Style**: Dramatic photography, generous white space, sophisticated typography
- **16:9 Aspect Ratio**: All hero images and feature images
- **Dark Mode Default**: Platform defaults to dark mode
- **MT Ocean Theme**: Turquoise gradients, glassmorphic effects, ocean-inspired palette

---

## 1. HERO SECTIONS (Where Applicable)

### Structure
```tsx
<div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
  <div className="absolute inset-0 bg-cover bg-center" style={{
    backgroundImage: `url('UNSPLASH_IMAGE_URL')`
  }}>
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
  </div>
  
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
        Category Label
      </Badge>
      
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
        Page Title
      </h1>
      
      <p className="text-xl text-white/80 max-w-2xl mx-auto">
        Subtitle or description
      </p>
    </motion.div>
  </div>
</div>
```

### Hero Requirements
- Height: `h-[50vh]` to `h-[70vh]`
- Gradient overlay: `from-black/70 via-black/50 to-background`
- Framer Motion animation on content
- Badge with backdrop-blur
- Serif font for headline (`font-serif`)
- Text sizes: `text-5xl md:text-6xl lg:text-7xl`

---

## 2. TYPOGRAPHY

### Headings
- **H1 (Page Titles)**: `text-4xl md:text-5xl lg:text-6xl font-serif font-bold`
- **H2 (Section Titles)**: `text-3xl md:text-4xl font-serif font-bold`
- **H3 (Subsections)**: `text-2xl md:text-3xl font-serif font-bold`
- **Body Text**: `text-base md:text-lg leading-relaxed`
- **Small Text**: `text-sm text-muted-foreground`

### Font Usage
- Headlines: Serif font (`font-serif`)
- Body: Sans-serif (default)
- Always use `font-bold` for serif headlines

---

## 3. IMAGES & MEDIA

### Aspect Ratios
- **Hero Images**: 16:9
- **Feature Cards**: 16:9
- **Thumbnails**: 4:3 or 1:1
- **Profile Covers**: 16:6 to 16:9

### Image Treatment
```tsx
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
  <motion.img
    src={imageUrl}
    alt={alt}
    className="w-full h-full object-cover"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.6 }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
</div>
```

### Image Requirements
- Gradient overlays on images with text
- Hover zoom effect: `whileHover={{ scale: 1.05 }}`
- Rounded corners: `rounded-2xl` or `rounded-xl`
- Object-cover for proper cropping

---

## 4. CARDS & CONTAINERS

### Editorial Card (16:9 Image + Content)
```tsx
<Card className="overflow-hidden hover-elevate">
  <div className="relative aspect-[16/9] overflow-hidden">
    <motion.img
      src={image}
      alt={title}
      className="w-full h-full object-cover"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.6 }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
    <div className="absolute bottom-4 left-4 right-4 text-white">
      <h3 className="text-2xl font-serif font-bold">{title}</h3>
    </div>
  </div>
  <CardContent className="p-6 space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Grid Layouts
- **2-column**: `grid md:grid-cols-2 gap-6`
- **3-column**: `grid md:grid-cols-3 gap-6`
- **4-column**: `grid md:grid-cols-4 gap-6`

### Spacing
- Card padding: `p-6` or `p-8`
- Section margins: `mb-8` to `mb-12`
- Container padding: `px-6 py-8` or `px-6 py-12`

---

## 5. ANIMATIONS

### Framer Motion Patterns
```tsx
// Fade in on scroll
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
>
  {content}
</motion.div>

// Hover zoom
<motion.img
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.6 }}
/>

// Page entrance
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: "easeOut" }}
>
  {content}
</motion.div>
```

### Animation Requirements
- Always use `viewport={{ once: true }}` for scroll animations
- Stagger animations with `delay: index * 0.1`
- Smooth transitions: `duration: 0.6` to `duration: 1`

---

## 6. BADGES & LABELS

### Badge Styling
```tsx
// Outline badge on hero
<Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
  Label
</Badge>

// Category badge
<Badge className="capitalize">{category}</Badge>

// Status badge
<Badge className="bg-green-500">Active</Badge>
```

### Badge Usage
- Hero sections: Outline with backdrop-blur
- Categories: Default or colored
- Status: Color-coded (green=active, orange=pending, red=alert)

---

## 7. BUTTONS & INTERACTIONS

### Button Patterns
```tsx
// Primary CTA
<Button className="gap-2" data-testid="button-action">
  <Icon className="w-4 h-4" />
  Action Text
  <ChevronRight className="w-4 h-4" />
</Button>

// Icon button
<Button variant="outline" size="icon">
  <Icon className="w-4 h-4" />
</Button>
```

### Interaction States
- Use built-in `hover-elevate` utility class
- Never manually implement hover states on Buttons
- Add icons before and/or after text
- Always include `data-testid` attributes

---

## 8. WHITESPACE & LAYOUT

### Generous Spacing
- Section spacing: `py-12` to `py-16`
- Container max-width: `max-w-5xl` to `max-w-7xl`
- Grid gaps: `gap-6` to `gap-12`
- 60% more whitespace than typical layouts

### Three-Column Layouts
```tsx
<div className="flex gap-12">
  {/* Main Column */}
  <div className="flex-1 max-w-5xl">
    {mainContent}
  </div>
  
  {/* Sidebar */}
  <div className="w-96 space-y-6 sticky top-8 self-start hidden lg:block">
    {sidebarContent}
  </div>
</div>
```

---

## 9. COLORS & GRADIENTS

### MT Ocean Palette
- Primary: Turquoise/Cyan tones
- Gradients: `bg-gradient-to-br from-primary/10 to-secondary/10`
- Overlays: `bg-black/80`, `bg-black/60`, `bg-white/10`
- Glassmorphic: `backdrop-blur-sm` or `backdrop-blur-md`

### Color Usage
- Hero overlays: Black gradients
- Cards: Subtle background elevations
- Borders: `border-primary/20` for accents
- Text on images: Always white with dark overlay

---

## 10. RESPONSIVE DESIGN

### Breakpoints
- Mobile first: Base styles for mobile
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Large screens: `xl:` prefix (1280px+)

### Responsive Patterns
```tsx
// Hide on mobile
<div className="hidden lg:block">Desktop only</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-4xl md:text-5xl lg:text-6xl">
```

---

## 11. ICONS

### Icon Library
- Use `lucide-react` for all icons
- Icon sizes: `w-4 h-4` (buttons), `w-5 h-5` (cards), `w-6 h-6` to `w-8 h-8` (features)
- Icon colors: Match text color or use theme colors

### Icon Patterns
```tsx
import { Calendar, MapPin, Users, Heart } from "lucide-react";

<div className="flex items-center gap-2">
  <Calendar className="w-4 h-4 text-primary" />
  <span>{date}</span>
</div>
```

---

## 12. DARK MODE SPECIFICS

### Dark Mode Defaults
- Platform defaults to dark mode
- Always test in dark mode first
- Use semantic color tokens (foreground, background, muted, etc.)
- Avoid hard-coded colors

### Dark Mode Colors
- Background: `bg-background`
- Surface: `bg-card`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border`

---

## 13. EXCLUSIONS (Don't Apply Editorial Design)

**Skip these page types:**
- Admin backend pages (`admin/*`)
- Platform internal tools (`platform/*`)
- Prototype pages (`*Prototype*.tsx`)
- Login/Register pages (keep minimal)
- Error pages (404, etc.)
- Settings forms (functional focus)

---

## 14. TESTING CHECKLIST

After applying editorial design:
- [ ] 16:9 images used for heroes and features
- [ ] Serif fonts on all headlines
- [ ] Framer Motion animations on scroll
- [ ] Hover zoom on images (1.05x scale)
- [ ] Gradient overlays on images with text
- [ ] Dark mode looks correct
- [ ] Responsive on mobile/tablet/desktop
- [ ] data-testid attributes on interactive elements
- [ ] Generous whitespace (60% more than default)
- [ ] Page loads without errors

---

## PRIORITY PAGES (Apply First)

**Tier 1 - Core User Flow:**
1. FeedPage.tsx
2. ProfilePage.tsx
3. EventsPage.tsx
4. EventDetailsPage.tsx
5. GroupsPage.tsx (already done)
6. CommunityWorldMapPage.tsx

**Tier 2 - High Traffic:**
7. DiscoverPage.tsx
8. MessagesPage.tsx
9. NotificationsPage.tsx
10. FriendsListPage.tsx
11. CalendarPage.tsx
12. TeachersPage.tsx
13. VenuesPage.tsx

**Tier 3 - Content Pages:**
14. BlogPage.tsx
15. MusicLibraryPage.tsx
16. WorkshopsPage.tsx
17. VideoLessonsPage.tsx
18. TutorialsPage.tsx
19. MediaGalleryPage.tsx
20. MemoriesPage.tsx
