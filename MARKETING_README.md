# MUNDO TANGO MARKETING CONTENT SYSTEM

## 🎯 Overview

A comprehensive, automated marketing content generation system for Mundo Tango, built on mb.md's modular brain architecture.

**Status:** 🟢 OPERATIONAL - Ready for asset generation  
**Version:** 1.0.0  
**Created:** December 25, 2025

---

## 📚 Documentation

### Core Documents

1. **MARKETING_ASSET_MATRIX.md** (8.0K)
   - Complete feature-to-channel asset mapping
   - File naming conventions
   - 3-phase generation workflow
   - Technical specifications

2. **MARKETING_COPY_FRAMEWORK.md** (12K)
   - Brand messaging and taglines
   - Website, social media, email copy
   - App store listings
   - Press kit content

3. **MARKETING_STORY_FLOWS.md** (9.4K)
   - 7 narrative-based user journeys
   - Playwright test templates
   - Video production guidelines

4. **MARKETING_CONTENT_SYSTEM_COMPLETE.md** (12K)
   - Executive summary
   - Complete system overview
   - Integration guide
   - Next actions

### Supporting Files

- `MAIN_FOLDERS_AND_FILES.md` - Workflow file index
- `tests/marketing-screenshots.spec.ts` - Screenshot automation
- `tests/marketing-videos.spec.ts` - Video capture automation  
- `tests/marketing-content-complete.spec.ts` - Story flows (needs syntax fix)

---

## 🚀 Quick Start

### Prerequisites
```bash
npm install playwright
npx playwright install
```

### Generate Assets
```bash
# Generate screenshots
npx playwright test tests/marketing-screenshots.spec.ts

# Generate videos
npx playwright test tests/marketing-videos.spec.ts

# Generate story flows (after fixing syntax)
npx playwright test tests/marketing-content-complete.spec.ts
```

### Output Locations
- Screenshots: `marketing-assets/screenshots/`
- Videos: `marketing-assets/videos/`
- Backup: `~/Desktop/Mundo-Tango-Videos/`

---

## 📊 Content Inventory

### Features Covered (9 Total)
1. Memory Feed
2. Events Discovery
3. Housing Marketplace
4. Community Tribes
5. Professional Network
6. Mr. Blue AI Assistant
7. Friends & Connections
8. Messaging System
9. Mobile Experience

### Distribution Channels (10+ Total)
- Website (landing pages, features)
- Instagram (feed, stories, reels)
- Facebook (posts, groups, ads)
- LinkedIn (posts, articles)
- Twitter/X
- TikTok
- Email (beta, onboarding, announcements)
- iOS App Store
- Google Play Store
- Press Kit
- Paid Ads (Google, Facebook)

### Assets to Generate
- **90+ screenshots** (features + story flows)
- **14+ videos** (demos + story sequences)
- **100+ copy templates** (all channels)
- **200+ total assets** (including channel variants)

---

## 🧰 System Architecture

### Phase 1: Base Asset Generation
```
Playwright Tests → Screenshots/Videos → marketing-assets/
```

### Phase 2: Channel Processing
```
Base Assets → Resize/Crop/Compress → Channel-Specific Variants
```

### Phase 3: Distribution
```
Processed Assets + Copy Templates → Deploy to All Channels
```

---

## 📁 File Naming Conventions

### Screenshots
```
{feature}-{view}-{variant}.png

Examples:
events-discovery-map-view-desktop.png
housing-listing-detail-mobile.png
mrblue-chat-ui-desktop.png
```

### Videos
```
{feature}-{flow-type}-{duration}.mp4

Examples:
events-discovery-journey-60s.mp4
mrblue-assistant-demo-45s.mp4
mobile-experience-overview-90s.mp4
```

### Story Flows
```
story-{flow-name}-step-{number}-{description}.png

Examples:
story-new-dancer-step-01-home-screen.png
story-housing-step-04-listing-detail.png
```

---

## 🧠 MB.MD Integration

This system follows mb.md's modular brain pattern:

```
use mb.md: marketing:assets  → MARKETING_ASSET_MATRIX.md
use mb.md: marketing:copy    → MARKETING_COPY_FRAMEWORK.md
use mb.md: marketing:stories → MARKETING_STORY_FLOWS.md
```

**Principles:**
- ✅ Modular - Each document has a specific purpose
- ✅ Systematic - Clear workflows and conventions
- ✅ Repeatable - Easy to regenerate/update
- ✅ Scalable - Accommodates new features/channels

---

## ✅ Next Steps

### Immediate Actions
1. [ ] Fix syntax errors in `tests/marketing-content-complete.spec.ts`
2. [ ] Run Playwright tests to generate base assets
3. [ ] Review generated assets for quality
4. [ ] Create channel-specific variants
5. [ ] Customize copy templates
6. [ ] Deploy to staging environment
7. [ ] Schedule social media calendar
8. [ ] Configure email automation
9. [ ] Update app store listings
10. [ ] Launch paid ad campaigns

### Success Metrics
- Asset generation completion rate
- Channel deployment status
- Social media engagement rates
- Email open/click rates
- App store conversion rates
- Press coverage
- Paid ad performance (CTR, conversions)

---

## 🔧 Maintenance

### When to Update
1. **New Features** - Add to matrix, generate assets, write copy
2. **New Channels** - Add requirements, create copy templates
3. **Seasonal Campaigns** - Create story flow variants
4. **A/B Testing** - Generate asset/copy variants
5. **Brand Refresh** - Update copy framework

### Version Control
- Major (X.0.0): System overhaul
- Minor (1.X.0): New features/channels
- Patch (1.0.X): Copy refinements

---

## 📝 Technical Specifications

### Video Specs
**Formats:** MP4 (H.264), WebM  
**Resolutions:** 
- Desktop: 1920x1080 (16:9)
- Mobile: 1080x1920 (9:16)
- Square: 1080x1080 (1:1)

**Lengths by Channel:**
- Website Hero: 30-60s
- Social Feed: 30-60s  
- Stories: 15s
- Ads: 15-30s
- Tours: 60-120s
- App Store: 30s max

### Screenshot Specs
**Format:** PNG (lossless)  
**Viewports:**
- Desktop: 1920x1080
- Mobile: 375x812 (iPhone)
- Tablet: 768x1024 (iPad)

---

## 👥 Contributors

Built by Mr. Blue (AI) + Comet (AI) following mb.md brain architecture.

---

## 📞 Support

For questions about the marketing content system:
1. Review relevant documentation file
2. Check MARKETING_CONTENT_SYSTEM_COMPLETE.md for overview
3. Consult mb.md for brain architecture context

---

**Time to Market:** 1-2 weeks after base asset generation  
**System Status:** 🟢 OPERATIONAL
