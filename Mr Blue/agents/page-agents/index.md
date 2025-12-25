# Page Agents

**Invocation:** `use mb.md: agents:page`

---

## 🎯 10 PAGE AGENTS

Each page agent owns a specific section of the UI.

---

### 1. LandingPageAgent

**Page:** `/` (Homepage)
**Capabilities:** Marketing, SEO, Conversion
**Features:**
- Hero section optimization
- Call-to-action placement
- Social proof display
- Coming soon features
- Performance metrics

```typescript
interface LandingPageAgent {
  analyzeConversion(): Promise<ConversionReport>;
  optimizeCTA(): Promise<void>;
  updateHero(content: HeroContent): Promise<void>;
}
```

---

### 2. FeedPageAgent

**Page:** `/feed`
**Capabilities:** Posts, Stories, Engagement
**Features:**
- Story carousel
- Post creation
- Reactions system
- Infinite scroll
- Content ranking

**Nested Feature Agents:**
- StoriesCarouselFeatureAgent
- PostCreatorFeatureAgent
- PostReactionsFeatureAgent
- InfiniteScrollFeatureAgent

---

### 3. EventsPageAgent

**Page:** `/events`
**Capabilities:** Calendar, Filtering, Maps
**Features:**
- Event listing
- Date filtering
- Location search
- Map integration
- Type categorization

---

### 4. HousingPageAgent

**Page:** `/housing`
**Capabilities:** Listings, Booking, Maps
**Features:**
- Property cards
- Split-view map
- Filter system
- Price display
- Availability calendar

---

### 5. GroupsPageAgent

**Page:** `/groups`
**Capabilities:** Communities, Membership
**Features:**
- Group discovery
- City groups
- Membership management
- Event integration
- Admin tools

---

### 6. ProfilePageAgent

**Page:** `/profile`
**Capabilities:** User Data, Settings
**Features:**
- Profile editing
- Tango roles display
- Portfolio/photos
- Activity history
- Privacy settings

---

### 7. MessagesPageAgent

**Page:** `/messages`
**Capabilities:** Chat, Notifications
**Features:**
- Unified inbox
- Real-time messaging
- Read receipts
- Group chats
- Media sharing

---

### 8. AdminPageAgent

**Page:** `/admin`
**Capabilities:** Dashboard, Management
**Features:**
- User management
- Event moderation
- Analytics dashboard
- System health
- Agent monitoring

---

### 9. FinancialPageAgent

**Page:** `/finance`
**Capabilities:** Payments, Subscriptions
**Features:**
- Payment history
- Subscription management
- Invoice generation
- Revenue analytics
- Payout tracking

---

### 10. MrBluePageAgent

**Page:** `/mr-blue`
**Capabilities:** AI Interface
**Features:**
- Chat interface
- Voice input
- Visual editor
- Agent status
- Command history

---

## 🔧 PAGE AGENT INTERFACE

```typescript
interface PageAgent {
  pageId: string;
  path: string;
  featureAgents: FeatureAgent[];
  
  // Analysis
  analyze(): Promise<PageAuditResult>;
  getHealth(): Promise<HealthScore>;
  
  // Actions
  optimize(): Promise<OptimizationResult>;
  fix(issues: Issue[]): Promise<FixResult>;
  
  // Context
  getContext(): Promise<PageContext>;
  updateContext(context: Partial<PageContext>): Promise<void>;
}
```

---

## 📊 HEALTH METRICS

Each page agent tracks:

| Metric | Target | Weight |
|--------|--------|--------|
| Load Time | < 2s | 25% |
| Error Rate | < 1% | 25% |
| Accessibility | > 90 | 20% |
| Mobile Score | > 85 | 15% |
| SEO Score | > 80 | 15% |

---

*10 pages. 10 agents. Complete coverage.*
