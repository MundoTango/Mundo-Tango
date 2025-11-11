# 🎨 **UI/UX PROTOTYPES - EDITORIAL/MAGAZINE DESIGN SYSTEM**

This document tracks all UI prototypes built for the Mundo Tango platform using the **editorial magazine design language**.

---

## **📍 ACTIVE PROTOTYPES**

### **1. Feed Prototype** ✅ APPROVED
**Path:** `/feed-prototype`
**Status:** Ready to apply site-wide  
**Components Used:**
- PostCreator (full-featured with AI, media, tags)
- SmartPostFeed (search + advanced filters)
- UpcomingEventsSidebar (live events with RSVP)
- RoleIconBadge (19 tango roles with hover tooltips)

**Features:**
- Daily Tango Inspiration Hero (rotating Borges/Discépolo quotes)
- Magazine layout with 60% more white space
- 16:9 featured images with hover zoom
- 20px body text (increased from 16px)
- 24-32px padding (increased from 8-12px)
- Role icon badges next to every user
- Theme toggle (light/dark modes)
- Clean post cards with minimal actions
- Community Pulse sidebar

---

### **2. Groups Prototype** ✅ UPDATED
**Path:** `/groups-prototype`  
**Status:** Final structure implemented

**Structure:**
- **My Groups Tab:** Automated by city/pro (e.g., "Buenos Aires", "Teachers Network")
- **Cities Tab:** City name + cityscape with stats (users, events, housing, recommendations)
- **Professional Tab:** Simplified names (e.g., "Teachers Network", "DJ Collective", "Event Organizers")

**Features:**
- 16:9 cityscape images
- Stats grid: Users, Events, Housing, Recommendations
- Follow vs. Member distinction (different rights)
- Tabbed navigation (My Groups, Cities, Professional)
- Theme toggle (light/dark modes)
- Trending topics sidebar

**Key Changes:**
- Removed redundant "Tango" and "Professional" from names
- City stats show ecosystem health (not just users/active)
- My Groups simplified to location names
- Users can follow groups (different rights than automated members)

---

### **3. Community Prototype** ✅ NEW
**Path:** `/community-prototype`
**Status:** Just created

**Features:**
- Global community overview hero
- Featured members with 16:9 cover images
- Member profiles with role icon badges
- Stats: followers, contributions
- Community highlights (4-stat grid)
- Top contributors leaderboard
- Global statistics sidebar
- Theme toggle (light/dark modes)

**Highlights Tracked:**
- Most Active City
- Events This Week
- New Members
- Total Contributions

---

## **🎨 DESIGN PRINCIPLES (APPLIED ACROSS ALL PROTOTYPES)**

### **Typography:**
- Body text: 20px (was 16px)
- Serif headlines for editorial feel
- Clear hierarchy with 3 text color levels

### **Spacing:**
- Padding: 24-32px (was 8-12px)
- 60% more white space overall
- Content breathes like Vogue/GQ

### **Photography:**
- 16:9 aspect ratio (editorial standard)
- Full-bleed hero images
- Gradient overlays for text legibility
- Hover zoom effect (1.05x)

### **Role Icon System:**
- 19 tango roles mapped to Lucide icons
- Hover tooltips explain each role
- Shows up to 3 icons + overflow indicator
- Displayed wherever user name + location appear

### **Color & Theme:**
- Light mode: White cards, dark text
- Dark mode: Deep backgrounds, light text, turquoise accents
- Hero images stay dark in both modes
- Theme toggle on all prototypes

---

## **🚀 NEXT STEPS**

1. **Apply Feed Design Site-wide:** Use FeedPrototypePage as template for main /feed page
2. **Apply Groups Design:** Replace current /groups with GroupsPrototypePage structure
3. **Apply Community Design:** Replace /community with CommunityPrototypePage
4. **Create More Prototypes:**
   - Events page
   - Teacher/Venue profiles
   - Workshops
   - User profiles
   - Community map

---

## **🔧 ADMIN FEATURE REQUEST (PENDING)**

**God-Level Admin Image Management:**
- Allow admin to update platform standard images (hero sections, backgrounds)
- Feature flag permission for photographers/videographers to upload content
- Needs integration with existing Cloudinary system
- Async content upload workflow

**Technical Notes:**
- Existing: `server/routes.ts` has image upload endpoints
- Existing: `server/services/FeatureFlagService.ts` for permissions
- Need: Admin UI to manage hero images per page/section
- Need: Feature flag `UPLOAD_HERO_IMAGES` for photographer role

---

## **📊 PROTOTYPE COMPARISON**

| Before (Old) | After (Editorial) |
|-------------|-------------------|
| 16px text | 20px text |
| 12px padding | 24-32px padding |
| Square images | 16:9 aspect ratio |
| Emojis for roles | Professional icon system |
| Flat cards | Layered depth + hover effects |
| Dense layout | 60% more white space |
| Generic style | Tango-inspired elegance |

---

**Last Updated:** November 11, 2025  
**Design System:** Editorial/Magazine ("Vogue meets Tango")  
**Approval Status:** Feed ✅ | Groups ✅ | Community ✅
