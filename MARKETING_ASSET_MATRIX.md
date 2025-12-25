# MARKETING ASSET MATRIX
**Complete Asset Map: Features × Screenshots × Videos × Channels**

**Version:** 1.0.0  
**Created:** December 25, 2025  
**Purpose:** Master reference for all marketing content generation from Playwright tests

---

## 📊 ASSET MATRIX TABLE

| Feature | Screenshot Assets | Video Assets | Primary Channels | Secondary Channels |
|---------|------------------|--------------|-----------------|--------------------|
| **Memory Feed** | `memory-feed-home.png`<br>`memory-feed-detail.png`<br>`memory-feed-mobile.png` | `memory-feed-flow.mp4` | Website Hero<br>Social: IG/FB | Email Campaigns<br>App Store |
| **Events Discovery** | `events-map-view.png`<br>`events-list-view.png`<br>`events-filters.png`<br>`event-detail.png`<br>`events-mobile.png` | `events-discovery-journey.mp4`<br>`events-search-flow.mp4` | Website Features<br>Social: All Platforms<br>Paid Ads | Press Kit<br>Partner Outreach<br>Community Posts |
| **Housing Marketplace** | `housing-grid-view.png`<br>`housing-listing-detail.png`<br>`housing-search-filters.png`<br>`housing-mobile.png` | `housing-marketplace-flow.mp4` | Website Features<br>Social: FB Groups<br>Paid Ads | Email to Dancers<br>Tribe Announcements |
| **Community Tribes** | `tribes-directory.png`<br>`tribe-detail-page.png`<br>`tribe-members.png`<br>`tribes-mobile.png` | `tribes-tour.mp4` | Website Features<br>Social: Community Focus | Onboarding Emails<br>In-app Promotions |
| **Professional Network** | `network-profile.png`<br>`network-connections.png`<br>`network-recommendations.png`<br>`network-mobile.png` | `professional-network-flow.mp4` | Website Features<br>LinkedIn<br>Industry Outreach | Email to Pros<br>Conference Materials |
| **Mr. Blue AI Assistant** | `mrblue-chat-ui.png`<br>`mrblue-planning-task.png`<br>`mrblue-recommendations.png`<br>`mrblue-mobile.png` | `mrblue-assistant-demo.mp4`<br>`mrblue-interactions.mp4` | Website Hero<br>All Social Platforms<br>Tech Media | Product Hunt<br>AI Communities<br>Press Kit |
| **Friends & Connections** | `friends-list.png`<br>`friend-suggestions.png`<br>`mutual-connections.png`<br>`friends-mobile.png` | `connections-flow.mp4` | Website Features<br>Social: IG Stories | Onboarding<br>Email Campaigns |
| **Messaging System** | `messaging-threads.png`<br>`message-composer.png`<br>`message-notifications.png`<br>`messaging-mobile.png` | `messaging-demo.mp4` | Website Features<br>App Store Listing | Email Campaigns<br>In-app Promos |
| **Mobile Experience** | `mobile-overview.png`<br>`mobile-feed.png`<br>`mobile-events.png`<br>`mobile-chat.png` | `mobile-experience-demo.mp4` | App Store Listings<br>Mobile-First Ads<br>Social Stories | Email Campaigns<br>SMS Marketing |

---

## 🎯 CHANNEL-SPECIFIC ASSET REQUIREMENTS

### Website (Landing Page)
**Priority:** HIGH  
**Assets Needed:**
- Hero: `mrblue-assistant-demo.mp4` OR `mobile-experience-demo.mp4`
- Features Section: 1 screenshot + 1 video per feature
- Mobile Showcase: All mobile PNGs in carousel

### Social Media

#### Instagram
- **Feed Posts:** Square crops of all screenshots (1080x1080)
- **Stories:** Vertical videos (1080x1920) - 15s clips
- **Reels:** `events-discovery-journey.mp4`, `mrblue-interactions.mp4`

#### Facebook
- **Posts:** All screenshots with captions
- **Groups:** Housing-specific assets
- **Ads:** Events + Housing + Mr. Blue videos

#### LinkedIn
- **Posts:** Professional Network screenshots
- **Articles:** Embedded videos with product tours
- **Ads:** Professional-focused flows

#### Twitter/X
- **Posts:** Quick feature screenshots
- **Threads:** Multi-image feature breakdowns
- **Videos:** Short 30s clips

#### TikTok
- **Videos:** Vertical format, 15-60s demos
- **Priority:** Mr. Blue AI, Events Discovery, Mobile UX

### Email Campaigns

#### Beta Launch Email
- Hero image: Memory Feed screenshot
- Feature grid: 4 key screenshots (Events, Housing, Tribes, Mr. Blue)
- CTA video: Overview demo (embedded GIF or link)

#### Onboarding Sequence
- Email 1: Welcome + Memory Feed
- Email 2: Events Discovery flow
- Email 3: Mr. Blue introduction
- Email 4: Community features (Tribes, Network)
- Email 5: Mobile app showcase

#### Feature Announcements
- 1 hero screenshot + short video per announcement

### App Stores

#### iOS App Store
- **Screenshots:** 6.5" iPhone (minimum 3, maximum 10)
  1. Memory Feed Home
  2. Events Discovery
  3. Mr. Blue Chat
  4. Housing Marketplace
  5. Community Tribes
- **Preview Videos:** 30s max, show core flows

#### Google Play Store  
- **Screenshots:** Similar to iOS
- **Feature Graphic:** 1024x500 banner
- **Promo Video:** YouTube link (2 min max)

### Press Kit
- All high-res screenshots (PNG, 2x resolution)
- All videos in multiple formats (MP4, WebM)
- Logo assets
- Product description doc
- Founder photos
- Media contact info

---

## 📁 FILE NAMING CONVENTIONS

### Screenshots
```
{feature}-{view}-{variant}.png

Examples:
memory-feed-home-desktop.png
memory-feed-home-mobile.png
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

### Channel-Specific Exports
```
{feature}-{channel}-{size}.{format}

Examples:
events-instagram-story-1080x1920.mp4
housing-facebook-ad-1200x628.png
mrblue-linkedin-post-1200x627.png
```

---

## 🔄 ASSET GENERATION WORKFLOW

### Phase 1: Generate Base Assets
1. Run `tests/marketing-screenshots.spec.ts` → Generate all PNG screenshots
2. Run `tests/marketing-videos.spec.ts` → Generate all demo videos
3. Verify outputs in `marketing-assets/screenshots/` and `marketing-assets/videos/`

### Phase 2: Process for Channels
1. Create channel-specific crops/resizes using scripts
2. Generate social media variants (square, vertical, etc.)
3. Compress videos for web delivery
4. Create thumbnail images from videos

### Phase 3: Organize by Campaign
1. Beta Launch Campaign
2. Feature Launch Campaigns
3. Paid Ad Campaigns
4. Organic Social Content
5. Press/Media Outreach

---

## 🎬 VIDEO CONTENT SPECIFICATIONS

### Video Lengths by Channel
- **Website Hero:** 30-60s looping
- **Social Feed:** 30-60s
- **Social Stories:** 15s
- **Paid Ads:** 15-30s
- **Product Tours:** 60-120s
- **App Store Previews:** 30s max

### Video Formats
- **Primary:** MP4 (H.264)
- **Web Optimized:** WebM
- **Social Platforms:** Platform-specific exports

### Video Resolutions
- **Desktop/Web:** 1920x1080 (16:9)
- **Mobile/Vertical:** 1080x1920 (9:16)
- **Square (Social):** 1080x1080 (1:1)

---

## 🎨 MR. BLUE EXPRESSION STATES MAPPING

*Reference: `MR_BLUE_VIDEO_SYSTEM.md` for full expression specs*

| Video Scene | Expression State | Use Case |
|-------------|-----------------|----------|
| Welcome/Intro | `calm-neutral` | Homepage hero, first impressions |
| Feature Explanation | `friendly-engaged` | Tutorial videos, feature tours |
| Problem Solving | `thoughtful-processing` | AI capabilities showcase |
| Success/Completion | `satisfied-accomplished` | Onboarding completion, task done |
| Discovery/Suggestion | `excited-curious` | Event recommendations, new features |
| Help/Support | `reassuring-supportive` | Support content, FAQs |
| Error/Caution | `concerned-alert` | Error states (use sparingly) |

---

## 📊 ASSET TRACKING

### Current Status
- [ ] Screenshot test script complete
- [ ] Video test script complete
- [ ] Base assets generated
- [ ] Channel-specific variants created
- [ ] Copy templates written
- [ ] Website integration done
- [ ] Social media calendar populated
- [ ] Email campaigns deployed
- [ ] App store listings updated
- [ ] Press kit assembled

### Next Steps
1. Fix syntax errors in `marketing-content-complete.spec.ts`
2. Run all Playwright tests to generate assets
3. Create channel-specific processing scripts
4. Write copy for each asset using `MARKETING_COPY_FRAMEWORK.md`
5. Upload to respective platforms

---

*This matrix should be updated whenever new features are added or new channels are activated.*
