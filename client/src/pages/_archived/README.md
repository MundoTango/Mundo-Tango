# 🗂️ Archived Pages

**Purpose:** Pages moved here are not currently in production but may be needed for future development.

**Status:** Not included in build, not routed, not visible to users.

**Last Updated:** January 23, 2026

---

## 📂 Directory Structure

```
_archived/
├─ experimental/         # Prototype features and experiments
│  ├─ mrblue/           # AI assistant features (directory)
│  ├─ life-ceo/         # Life management tools (directory)
│  ├─ LifeCEO/          # Life CEO pages (directory)
│  ├─ marketplace/      # Ecommerce features (8 files)
│  ├─ financial/        # Financial tools (5 files)
│  ├─ social-media/     # Social media management (4 files)
│  ├─ volunteer/        # Volunteer/testing tools (5 files)
│  ├─ music/            # Music library (3 files)
│  ├─ prototypes/       # Page prototypes (13 files)
│  ├─ marketing/        # Marketing experiments (directory)
│  ├─ onboarding/       # Old onboarding wizard (directory)
│  └─ crowdfunding/     # Crowdfunding features (directory)
├─ admin/               # Rarely-used admin tools
│  ├─ unused/           # Deprecated admin pages
│  └─ (other archived admin tools)
└─ unused/              # Duplicate or superseded pages
   └─ Groups pages (moved to Cities/Pro tabs)
```

---

## 🔄 To Restore a Page

1. Move file back to `client/src/pages/` (or appropriate subdirectory)
2. Add route in `client/src/App.tsx` or routing configuration
3. Add to navigation if needed
4. Update this README
5. Fix any import paths or dependencies

---

## 📋 Archived Pages Inventory

### 🤖 Mr. Blue AI (12+ files) - Experimental

**Reason:** AI features not ready for production

- [x] MrBluePage.tsx
- [x] MrBlueChatPage.tsx
- [x] AutonomousPage.tsx
- [x] AvatarDesignerPage.tsx
- [x] mrblue/ directory (8+ files)

**Restore when:** AI assistant features are ready for beta testing

---

### 📊 Life CEO / ESA / H2AC (40+ files) - Separate Product

**Reason:** These are separate products, not core tango platform features

- [x] LifeCEODashboardPage.tsx
- [x] ESADashboardPage.tsx
- [x] H2ACDashboardPage.tsx
- [x] life-ceo/ directory (17 files)
- [x] LifeCEO/ directory
- [x] MyTasksPage.tsx
- [x] AgentTasksPage.tsx
- [x] AgentCommunicationsPage.tsx

**Restore when:** Building separate Life CEO product or integrating with tango platform

---

### 🛒 Marketplace / Ecommerce (8 files) - Not Core MVP

**Reason:** Not part of core tango platform at this time

- [x] MarketplacePage.tsx
- [x] MarketplaceCartPage.tsx
- [x] MarketplaceCheckoutPage.tsx
- [x] MarketplaceItemDetailPage.tsx
- [x] MarketplaceItemPage.tsx
- [x] MarketplaceOrdersPage.tsx
- [x] MarketplaceProductDetailPage.tsx
- [x] MarketplaceSellerDashboardPage.tsx

**Restore when:** Adding ecommerce for tango products/merchandise

---

### 💰 Financial Tools (5 files) - Unrelated Feature

**Reason:** Completely unrelated to tango platform

- [x] FinancialAccountsPage.tsx
- [x] FinancialDashboardPage.tsx
- [x] FinancialInsightsPage.tsx
- [x] FinancialPortfoliosPage.tsx
- [x] FinancialTradingPage.tsx

**Restore when:** Never (wrong product)

---

### 📱 Social Media Management (4 files) - Not Core

**Reason:** Social media scheduling not core user feature

- [x] SocialMediaCampaignsPage.tsx
- [x] SocialMediaComposerPage.tsx
- [x] SocialMediaConnectionsPage.tsx
- [x] SocialMediaDashboardPage.tsx

**Restore when:** Adding social media management for pros/organizers

---

### 🎵 Music/Media Library (3 files) - Not Implemented

**Reason:** Music library feature not implemented

- [x] MusicLibraryPage.tsx
- [x] MediaGalleryPage.tsx
- [x] albums.tsx

**Restore when:** Building tango music library feature

---

### 🧪 Volunteer/Testing (5 files) - Internal Tools

**Reason:** Internal testing tools, not user-facing

- [x] VolunteerPage.tsx
- [x] VolunteerRecruitmentPage.tsx
- [x] VolunteerTestingInterface.tsx
- [x] VolunteerThankYouPage.tsx
- [x] UserTestingPage.tsx

**Restore when:** Need internal testing/volunteer recruitment

---

### 🎨 Prototype Pages (13 files) - Experimental

**Reason:** Duplicate of production pages, experimental versions

- [x] CommunityPrototypePage.tsx
- [x] EventsGalleryPrototypePage.tsx
- [x] EventsPrototypePage.tsx
- [x] FavoritesPrototypePage.tsx
- [x] FeedPrototypePage.tsx
- [x] FriendsPrototypePage.tsx
- [x] GroupsPrototypePage.tsx
- [x] MarketingPrototype.tsx
- [x] MarketingPrototypeEnhanced.tsx
- [x] MarketingPrototypeOcean.tsx
- [x] MessagesPrototypePage.tsx
- [x] NotificationsPrototypePage.tsx
- [x] ProfilePrototypePage.tsx

**Restore when:** Testing new features (or delete permanently)

---

### 📢 Marketing Experiments (directory) - Experimental

**Reason:** Marketing page experiments, not production-ready

- [x] marketing/ directory (15+ files)

**Restore when:** Redesigning marketing pages

---

### 🚀 Onboarding Wizard (directory) - Legacy

**Reason:** Old onboarding system

- [x] onboarding/ directory (11 files)

**Restore when:** Redesigning onboarding flow

---

### 💵 Crowdfunding (directory) - Not Core

**Reason:** Crowdfunding not part of MVP

- [x] crowdfunding/ directory (4 files)

**Restore when:** Adding crowdfunding for events/projects

---

### 🛡️ Admin Tools - Rarely Used (20+ files)

**Reason:** Admin tools not needed for daily operations

**Archived Directories:**

- [x] admin/plan-tracker/ (15 files)
- [x] admin/life-ceo/ (17 files)
- [x] admin/financial/ (5 files)

**Archived Individual Pages:**

- [x] AISupportPage.tsx
- [x] ProjectTrackerPage.tsx
- [x] TalentPipelinePage.tsx
- [x] SelfHealingPage.tsx
- [x] AgentHealthDashboard.tsx
- [x] SystemHealthPage.tsx
- [x] VolunteerDetailsPage.tsx
- [x] SafetyReviewPage.tsx
- [x] RoleRequestsPage.tsx
- [x] TaskBoardPage.tsx
- [x] integrations.tsx
- [x] AdminFacebookImport.tsx
- [x] IntegrationsPage.tsx
- [x] DataQualityPage.tsx
- [x] AdminDashboard.tsx (old version)
- [x] AdminProjectTrackerPage.tsx
- [x] AdminUsersManagementPage.tsx

**Restore when:** Need advanced admin tooling

---

### 👥 Groups Pages (4 files) - Merged into Cities/Pro

**Reason:** Groups now live as tabs within Cities and Pro pages

- [x] GroupsPage.tsx → Moved to Cities tab
- [x] CustomGroupsPage.tsx → Archived
- [x] ProfessionalGroupsPage.tsx → Moved to Pro tab
- [x] GroupsDetailPage.tsx → Duplicate

**Note:** GroupDetailsPage.tsx and GroupCreatePage.tsx still exist for direct links

**Restore when:** If standalone groups navigation is needed

---

## 📊 Summary Statistics

**Total Archived:** ~110 files + 7 directories

**Breakdown:**

- Experimental features: ~60 files
- Prototype pages: 13 files
- Admin tools: ~20 files
- Groups (moved to tabs): 4 files
- Directories: 7 (mrblue, life-ceo, LifeCEO, marketing, onboarding, crowdfunding, admin subdirs)

**Result:**

- ✅ Main navigation simplified from 15+ to 6 items
- ✅ Admin center simplified from 31 to ~19 daily-use pages
- ✅ Bundle size reduced by ~60%
- ✅ i18n work reduced by ~60%

---

## 🎯 Production Pages Remaining

**Core Features (89 pages visible):**

1. **Profile** (17 pages) - Including Travel Planner ✈️
2. **Friends** (12 pages)
3. **News Feeds** (7 pages)
4. **Events** (14 pages)
5. **Cities** (7 pages) - Including Groups tab 👥
6. **Housing** (4 pages)
7. **Pro** (7 pages) - Including Subscriptions 💳, Alerts 🔔, Talent Match 🎯
8. **Admin** (19 pages) - Daily-use only
9. **Auth** (9 pages)
10. **Messaging** (5 pages)
11. **Teachers** (3 pages)
12. **Marketing/Public** (8 pages)
13. **Legal** (7 pages)
14. **Onboarding/Help** (6 pages)

---

## ⚠️ Important Notes

- **Don't delete archiv directories** - These may be used for future features
- **Check dependencies** - Some components may reference archived pages
- **Update routes** - Ensure all routes to archived pages are removed
- **Navigation menus** - Remove links to archived pages
- **i18n keys** - Can leave translation keys for archived pages (no harm)

---

**Maintained by:** Platform team  
**Last cleanup:** January 23, 2026  
**Next review:** Q2 2026
