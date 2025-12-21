# Page Design Documents

**Invocation:** `use mb.md: pages`

---

## 📄 PAGE DESIGN DOCUMENTATION METHODOLOGY

Every visible UI page in Mundo Tango must have a comprehensive design document following the 17-section template.

---

## 🎯 17-SECTION TEMPLATE

| # | Section | Purpose |
|---|---------|---------|
| 1 | Overview | Page purpose, template reference |
| 2 | Data Architecture | Database tables, relationships |
| 3 | URL Routing | Routes, params, redirects |
| 4 | Page Structure | Header, tabs, layout |
| 5 | Tab Specifications | Each tab's detailed spec |
| 6 | Filters | All filter controls |
| 7 | Interactive Elements | Maps, modals, popovers |
| 8 | API Endpoints | All API calls |
| 9 | Data Sources | Where data comes from (scraping, API, etc.) |
| 10 | Permissions Matrix | Public/Member/Admin access |
| 11 | Mobile Responsiveness | Breakpoints, sizing |
| 12 | Internationalization | Languages, localization |
| 13 | Analytics Tracking | Events to track |
| 14 | Related Pages | Connected pages |
| 15 | Component Files | Source code locations |
| 16 | Test Scenarios | E2E test cases |
| 17 | Future Enhancements | Roadmap items |

---

## 📂 PAGE DOCUMENTS INDEX

### Core Platform Pages

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| City Page | [CITY_PAGE.md](CITY_PAGE.md) | ✅ Active | GroupsPageAgent |
| Events Page | [EVENT_PAGE.md](EVENT_PAGE.md) | ✅ Active | EventsPageAgent |
| Event Detail | [EVENT_DETAIL_PAGE.md](EVENT_DETAIL_PAGE.md) | ✅ Active | EventsPageAgent |
| Housing Page | [HOUSING_PAGE.md](HOUSING_PAGE.md) | ✅ Active | HousingPageAgent |
| Venue Page | [VENUE_PAGE.md](VENUE_PAGE.md) | ✅ Active | VenuePageAgent |
| Community Map | [COMMUNITY_MAP.md](COMMUNITY_MAP.md) | ✅ Active | MapPageAgent |
| Found People | [FOUND_PEOPLE.md](FOUND_PEOPLE.md) | ✅ Active | ProfileLinkingAgent |
| Landing Page | LANDING_PAGE.md | ⏳ Planned | LandingPageAgent |
| Feed Page | FEED_PAGE.md | ⏳ Planned | FeedPageAgent |
| Profile Page | PROFILE_PAGE.md | ⏳ Planned | ProfilePageAgent |
| Messages Page | MESSAGES_PAGE.md | ⏳ Planned | MessagesPageAgent |

### Scraping-Related Pages (Priority)

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| Scraping Control Center | [SCRAPING_CONTROL_CENTER.md](SCRAPING_CONTROL_CENTER.md) | ✅ Active | AdminPageAgent |
| Scraped Events Management | [SCRAPED_EVENTS_MANAGEMENT.md](SCRAPED_EVENTS_MANAGEMENT.md) | ✅ Active | AdminPageAgent |
| Scraper Source Registry | [SCRAPER_SOURCE_REGISTRY.md](SCRAPER_SOURCE_REGISTRY.md) | ✅ Active | AdminPageAgent |
| TangoMango Integration | [TANGOMANGO_SCRAPER.md](TANGOMANGO_SCRAPER.md) | ✅ Active | MasterOrchestrator |

### Admin Pages

| Page | Document | Status | Agent |
|------|----------|--------|-------|
| Admin Dashboard | ADMIN_DASHBOARD.md | ⏳ Planned | AdminPageAgent |
| User Management | USER_MANAGEMENT.md | ⏳ Planned | AdminPageAgent |
| Financial Dashboard | FINANCIAL_DASHBOARD.md | ⏳ Planned | FinancialPageAgent |

---

## 📊 COMPLETE PAGE INVENTORY (200+ Pages)

### Priority 1: Core User Experience (Create docs first)
| Category | Pages | Status |
|----------|-------|--------|
| City Pages | CityDetailsPage, CityGuidesPage, CityHubPage, CityGroupsPage | ✅ CITY_PAGE.md covers |
| Events | EventsPage, EventDetailPage, EventCalendarPage, CreateEventPage, MyEventsPage | ⏳ Planned |
| Housing | HousingMarketplacePage, HousingListingDetailPage, HostHomesPage, CreateListingPage | ⏳ Planned |
| Feed | FeedPage, DiscoverPage, SavedPostsPage | ⏳ Planned |
| Profile | ProfilePage, ProfileEditPage, UserProfilePublicPage | ⏳ Planned |
| Groups | GroupsPage, GroupDetailsPage, GroupCreatePage, ProfessionalGroupsPage | Covered by CITY_PAGE.md |
| Auth | LoginPage, RegisterPage, PasswordResetPage, TwoFactorAuthPage | ⏳ Planned |

### Priority 2: Social Features
| Category | Pages | Count |
|----------|-------|-------|
| Friends | FriendsPage, FriendDetailPage, FriendRequestsPage, FollowersPage, FollowingPage | 5 |
| Messages | MessagesPage, MessagesDetailPage, UnifiedInbox, DirectMessages, GroupChat | 8 |
| Notifications | NotificationsPage, NotificationPreferencesPage | 2 |

### Priority 3: Marketing/Public
| Category | Pages | Count |
|----------|-------|-------|
| Marketing | LandingPage, AboutPage, MissionPage, VisionPage, TeamPage, FeaturesPage | 12 |
| Tango Education | TangoHistoryPage, TangoEtiquettePage, TangoCulturePage, DanceStylesPage | 8 |
| Support | HelpPage, FAQPage, ContactPage, PrivacyPolicyPage, TermsPage | 5 |

### Priority 4: Admin/Platform (28 admin pages)
| Category | Pages | Count |
|----------|-------|-------|
| Admin Dashboard | AdminDashboard, AnalyticsDashboard, SystemHealthPage | 4 |
| Moderation | ContentModerationPage, SafetyReviewPage, UserReportsPage | 6 |
| Scraping | AdminScrapingPage (maps to SCRAPING_*.md specs) | 4 |
| User Management | UserManagementPage, RolesPermissionsPage | 4 |
| AI/Agents | AgentHealthDashboard, AISupportPage, SelfHealingPage | 4 |
| Platform Settings | PlatformSettingsPage, FeatureFlagsPage, IntegrationsPage | 4 |

### Priority 5: Specialized Features
| Category | Pages | Count |
|----------|-------|-------|
| Life CEO | LifeCeoDashboard + 17 agent pages (Career, Finance, Fitness, etc.) | 18 |
| HR Agents | RecruiterAgentPage, OnboardingAgentPage, PerformanceAgentPage | 5 |
| Mr. Blue AI | MrBlueChatPage, VibecodingPage, VisualEditorPage, VoicePage | 8 |
| Financial | FinancialDashboardPage, FinancialPortfoliosPage, BillingPage | 6 |
| Crowdfunding | CrowdfundingDashboardPage, CrowdfundingCreatePage | 4 |
| Legal | LegalDashboardPage, LegalDocumentsPage, LegalSignaturePage | 5 |
| Travel | TravelPlannerPage, TravelItineraryPage, TravelExpensesPage | 4 |
| Settings | SettingsPage, SecuritySettingsPage, PrivacySettings, DataExport | 10 |
| Onboarding | WelcomePage, CitySelectionPage, TangoRolesPage, PhotoUploadPage | 10 |

### Priority 6: Marketplace/Commerce
| Category | Pages | Count |
|----------|-------|-------|
| Marketplace | MarketplacePage, MarketplaceItemDetailPage, MarketplaceCartPage | 6 |
| Subscriptions | SubscriptionsPage, ManageSubscriptionPage, PremiumFeaturesPage | 4 |
| Checkout | CheckoutPage, PaymentSuccessPage, PaymentFailedPage | 4 |

### TOTAL: 200+ Pages organized into 6 priority tiers

---

## 🔀 INVOCATION SYNTAX

```markdown
use mb.md: pages                    → This index
use mb.md: pages:city               → City page spec
use mb.md: pages:events             → Events page spec
use mb.md: pages:housing            → Housing page spec
use mb.md: pages:scraping           → Scraping control center
use mb.md: pages:scraped-events     → Scraped events management
use mb.md: pages:sources            → Scraper source registry
use mb.md: pages:tangomango         → TangoMango scraper spec
```

---

## 🔧 DOCUMENT LIFECYCLE

```
1. CREATE   → New page added → Create design doc using template
2. UPDATE   → Page changed → Update doc with changes
3. REVIEW   → Monthly → Audit doc against live page
4. ARCHIVE  → Page removed → Move doc to /archived/
```

---

## 👥 AGENT RESPONSIBILITIES

| Agent | Documents Owned |
|-------|-----------------|
| GroupsPageAgent | CITY_PAGE.md |
| EventsPageAgent | EVENTS_PAGE.md |
| HousingPageAgent | HOUSING_PAGE.md |
| AdminPageAgent | SCRAPING_*.md, ADMIN_*.md |
| LandingPageAgent | LANDING_PAGE.md |
| FeedPageAgent | FEED_PAGE.md |
| ProfilePageAgent | PROFILE_PAGE.md |
| MessagesPageAgent | MESSAGES_PAGE.md |
| FinancialPageAgent | FINANCIAL_DASHBOARD.md |

---

## 🔗 CROSS-REFERENCES

| Reference | Path |
|-----------|------|
| Page Agents | `mr-blue-brain/agents/page-agents/` |
| Scraping Agents | `mr-blue-brain/agents/scraping/` |
| Operations Workflow | `mr-blue-brain/operations/` |
| Patterns | `mr-blue-brain/patterns/` |

---

*Every page. Every spec. Complete documentation.*
