# Mundo Tango Landing Page Design Guidelines

## Design Approach

**Reference-Based:** Drawing inspiration from community platforms (Airbnb's warmth, Eventbrite's energy, Meetup's connection focus) while infusing tango's passion and elegance. Glassmorphic aesthetic with gradient overlays creates a modern, immersive experience that reflects the fluidity of tango movement.

## Typography

**Font Stack:**
- Headers: Playfair Display (elegant, dramatic serif) - weights 600, 700
- Body/UI: Inter (clean, readable sans-serif) - weights 400, 500, 600

**Hierarchy:**
- H1 (Hero): 4xl/5xl (mobile/desktop), font-bold, tracking-tight
- H2 (Sections): 3xl/4xl, font-semibold
- H3 (Cards/Features): xl/2xl, font-semibold
- Body Large: lg, font-medium (leads, CTAs)
- Body: base, font-normal
- Small: sm, font-normal

## Layout System

**Spacing Units:** Tailwind units 4, 6, 8, 12, 16, 20, 24 for consistent rhythm

**Container Strategy:**
- Full-width sections with inner max-w-7xl containers
- Content sections: py-20 (desktop), py-12 (mobile)
- Component spacing: space-y-12 to space-y-20

## Core Components

### Hero Section (100vh)
Full-viewport immersive experience with video background. Centered content overlay with glassmorphic panel (backdrop-blur-md, bg-white/10, border border-white/20, rounded-2xl, p-8 to p-12). Content: Large H1 headline, compelling 2-line subtitle, primary CTA button + secondary "Watch Demo" button (horizontal stack on desktop, vertical on mobile). Stats bar at bottom: 4 quick stats in grid-cols-2 lg:grid-cols-4 with glassmorphic treatment.

**CTA Buttons on Hero:** Glassmorphic background (backdrop-blur-sm, bg-white/20), no hover blur effects needed.

### Stats Counter Section (py-16)
4-column grid (grid-cols-2 lg:grid-cols-4) with animated counting numbers. Each stat: Large number (text-5xl, font-bold), descriptive label below (text-lg). Gradient text treatment on numbers using MT Ocean Theme. Centered alignment.

### How It Works Section (py-20)
3-step process using grid-cols-1 lg:grid-cols-3. Each step: Large numbered circle (w-16 h-16, glassmorphic style), icon, heading, descriptive text. Connecting lines between steps (desktop only, hidden mobile). Vertical spacing between steps on mobile.

### Features Showcase (py-24)
Asymmetric 2-column alternating layout. Feature 1: Image left, content right. Feature 2: Content left, image right. Continue alternating. Each feature block: Large image (rounded-2xl, aspect-video), heading, 2-3 paragraph description, list of 3-4 key benefits with checkmark icons. On mobile: stack vertically (image always above content).

### Testimonials Carousel (py-20, gradient background)
Glassmorphic cards in horizontal scroll/carousel. Each card (max-w-2xl): Quote text (text-lg, italic), dancer photo (rounded-full, w-16 h-16), name, location, star rating. Cards have backdrop-blur-lg, padding p-8, border border-white/30. Navigation arrows and dots below.

### FAQ Accordion (py-20)
Single column (max-w-4xl mx-auto). 8-10 questions in accordion format. Each item: Question header (text-lg, font-semibold, padding p-6, glassmorphic background), expandable answer (padding p-6, border-t). Smooth expand/collapse animations.

### Final CTA Section (py-24)
Centered content (max-w-3xl mx-auto). Strong headline, supporting paragraph, large primary CTA button, trust indicators below (logos or badges in grid-cols-3). Gradient background with glassmorphic overlay panel.

### Footer (py-16)
4-column grid (lg, stacks mobile): Company info, Quick Links, Community Resources, Newsletter signup. Social icons row. Copyright text. All on gradient background.

## Images

**Hero Background:** Full-viewport video of elegant tango dancers in embrace, preferably aerial/cinematic shot with warm lighting. Fallback: High-resolution hero image of dancing couple.

**Feature Showcase Images (6 total):**
1. Close-up of feet in tango position, polished dance floor
2. Group class scene, diverse dancers learning together
3. Event atmosphere, couples dancing in elegant venue
4. Mobile app mockup showing event listings
5. Community gathering, dancers socializing between sets
6. Intimate milonga scene, authentic Buenos Aires atmosphere

**Testimonial Photos:** 6 circular headshots of diverse tango dancers (varied ages, backgrounds) with authentic, joyful expressions.

**Footer/Trust Indicators:** Partner logos or community badges (if applicable).

## Animations

**Scroll Triggers (Subtle):**
- Fade-up on section entry (50px translate)
- Stats: Count-up animation on viewport entry
- Stagger animations for feature lists (100ms delay between items)

**Hover States:**
- Feature cards: Slight lift (translate-y -2px), shadow increase
- Testimonial cards: Scale 1.02, enhanced glow
- CTA buttons: Scale 1.05, shadow intensification

**Glassmorphic Treatment:**
All cards/panels use backdrop-blur (md to xl), semi-transparent backgrounds (bg-white/10 to bg-white/20), subtle borders (border-white/20 to border-white/40), rounded corners (rounded-xl to rounded-2xl).