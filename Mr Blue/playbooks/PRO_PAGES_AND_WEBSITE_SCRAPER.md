# Pro Pages & Website Scraper Playbook

**Version:** 1.0.0  
**Created:** December 30, 2025  
**Author:** Mr. Blue AI (Pattern 100 Master Orchestration)  
**Priority:** HIGH  
**Status:** READY FOR EXECUTION

---

## EXECUTIVE SUMMARY

Two interconnected features to enhance professional user experience on Mundo Tango:

1. **Personal Website Scraping** - Users enter their website URL, Mr. Blue analyzes scrapable data, user approves, system enriches their profile
2. **Public Pro Pages** - Professional users get public promotional pages with custom slugs (e.g., mundotango.life/scott) including contact forms for non-members

---

## GOD COMMANDS APPLIED

- **#1 Test before complete** - E2E tests for both features
- **#2 Work Simultaneously** - Parallel schema + UI development
- **#3 Work Recursively** - Understand messaging system deeply for email routing
- **#5 Check Infrastructure First** - Use existing scraping infrastructure, Resend integration

---

## PHASE 1: FIX MESSAGES PAGE (Priority: CRITICAL)

**Why First:** Messages page must work for pro page contact flow.

### Tasks
- [ ] Investigate `/messages` page - identify what's broken
- [ ] Check WebSocket connections for real-time messages
- [ ] Verify message fetching API endpoints
- [ ] Test conversation selection and message display
- [ ] Fix any UI/routing issues

### Files to Check
```
client/src/pages/MessagesPage.tsx
server/routes/message-routes.ts
server/services/MessageService.ts
shared/schema.ts (messages, conversations tables)
```

---

## PHASE 2: SCHEMA UPDATES

### 2.1 Rename Community Website to Personal Website

**Location:** `shared/schema.ts`

```typescript
// In users table - rename field
communityWebsite: text("community_website"), // RENAME TO:
personalWebsite: text("personal_website"),
```

### 2.2 Pro Page Settings Schema

**Add to users table or create new table:**

```typescript
export const proPageSettings = pgTable("pro_page_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").unique(), // e.g., "scott" for mundotango.life/scott
  isEnabled: boolean("is_enabled").default(false),
  contactEmail: text("contact_email"), // For Resend "from" address
  useEmailRouting: boolean("use_email_routing").default(true), // Send replies via email
  
  // Section visibility
  showBio: boolean("show_bio").default(true),
  showGallery: boolean("show_gallery").default(true),
  showEvents: boolean("show_events").default(true),
  showTestimonials: boolean("show_testimonials").default(true),
  showPricing: boolean("show_pricing").default(false),
  showSocialLinks: boolean("show_social_links").default(true),
  showLocation: boolean("show_location").default(true),
  
  // Customization
  tagline: text("tagline"),
  accentColor: text("accent_color").default("#0ea5e9"), // Theme color
  metaDescription: text("meta_description"), // SEO
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

### 2.3 External Contacts Table (for non-member messages)

```typescript
export const externalContacts = pgTable("external_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
```

### 2.4 Update Messages Table

```typescript
// Add to messages table
externalContactId: integer("external_contact_id").references(() => externalContacts.id),
isExternalThread: boolean("is_external_thread").default(false),
```

---

## PHASE 3: PERSONAL WEBSITE SCRAPING

### 3.1 Flow
```
1. User enters website URL in profile settings
2. User clicks "Analyze with Mr. Blue" button
3. Opens Mr. Blue chat with context: "Analyzing boddye.com for profile enrichment"
4. Mr. Blue scrapes and shows scrapable data:
   - Name, bio, headline
   - Profile photo
   - Skills/specialties
   - Social links
   - Contact info
   - Portfolio/gallery images
5. User approves specific items to import
6. System enriches profile with approved data
```

### 3.2 API Endpoints

```typescript
// POST /api/profile/website/analyze
// Body: { url: string }
// Response: { scrapableData: ScrapableData }

// POST /api/profile/website/import
// Body: { url: string, approvedFields: string[] }
// Response: { imported: string[], updated: UserProfile }
```

### 3.3 WebsiteScraperService

**Location:** `server/services/WebsiteScraperService.ts`

```typescript
export class WebsiteScraperService {
  async analyzeWebsite(url: string): Promise<ScrapableData> {
    // 1. Fetch page content
    // 2. Extract structured data (name, bio, images, links)
    // 3. Use AI to summarize/categorize
    // 4. Return formatted scrapable data
  }

  async importToProfile(userId: number, url: string, fields: string[]): Promise<void> {
    // 1. Re-scrape approved fields
    // 2. Update user profile
    // 3. Download and store images if approved
  }
}
```

### 3.4 Mr. Blue Integration

**Trigger phrase detection in ConversationOrchestrator:**
```typescript
// New intent: website_analysis
if (message.includes('analyze my website') || 
    context.websiteAnalysisRequested) {
  return handleWebsiteAnalysis(url);
}
```

---

## PHASE 4: PUBLIC PRO PAGES

### 4.1 Route Structure

```typescript
// Public route (no auth required)
GET /:slug -> PublicProPage

// API endpoints
GET /api/pro-page/:slug -> Get pro page data
POST /api/pro-page/contact -> Submit contact form (creates message)
POST /api/pro-page/setup -> Configure pro page settings
```

### 4.2 Public Pro Page Component

**Location:** `client/src/pages/PublicProPage.tsx`

```tsx
export default function PublicProPage() {
  const { slug } = useParams();
  
  return (
    <div className="pro-page">
      {/* Hero with profile photo and tagline */}
      <ProPageHero user={data.user} settings={data.settings} />
      
      {/* Bio section */}
      {settings.showBio && <ProPageBio bio={user.bio} />}
      
      {/* Photo/Video gallery */}
      {settings.showGallery && <ProPageGallery media={data.media} />}
      
      {/* Upcoming events */}
      {settings.showEvents && <ProPageEvents events={data.events} />}
      
      {/* Testimonials */}
      {settings.showTestimonials && <ProPageTestimonials reviews={data.reviews} />}
      
      {/* Pricing (if enabled) */}
      {settings.showPricing && <ProPagePricing pricing={data.pricing} />}
      
      {/* Social links */}
      {settings.showSocialLinks && <ProPageSocials links={user.socialLinks} />}
      
      {/* Contact form */}
      <ProPageContactForm proUserId={data.user.id} slug={slug} />
    </div>
  );
}
```

### 4.3 Contact Form Flow

```
1. Non-member fills form with:
   - Name
   - Email
   - Message

2. System creates/finds externalContact record

3. System creates message:
   - receiverId = pro user
   - externalContactId = external contact
   - isExternalThread = true

4. Pro user sees message in /messages with badge "External"

5. Pro user replies in /messages

6. System detects isExternalThread = true
   - Sends email via Resend
   - FROM: pro user's contactEmail (e.g., scott@boddye.com)
   - TO: external contact's email
   - CC/BCC: none (keeps it personal)
   - Reply-To: configured to route back to platform

7. When external user replies to email:
   - Resend webhook receives email
   - Creates new message in thread
   - Pro user sees it in /messages
```

### 4.4 Email Reply Routing (Resend Inbound)

**Setup:**
1. Configure Resend inbound email (e.g., reply-{threadId}@mundotango.app)
2. Webhook endpoint: `POST /api/email/inbound`
3. Parse thread ID from address
4. Create message in existing conversation

---

## PHASE 5: PRO PAGE SETTINGS UI

### 5.1 Location in Profile

**Add tab to profile settings:** "Pro Page"

```tsx
// client/src/components/profile/ProPageSettings.tsx

export function ProPageSettings() {
  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <Switch label="Enable Pro Page" checked={settings.isEnabled} />
      
      {/* Custom Slug */}
      <div>
        <Label>Your Pro Page URL</Label>
        <div className="flex items-center gap-2">
          <span>mundotango.life/</span>
          <Input value={settings.slug} placeholder="your-name" />
        </div>
      </div>
      
      {/* Contact Email */}
      <div>
        <Label>Contact Email (for external replies)</Label>
        <Input value={settings.contactEmail} placeholder="you@email.com" />
        <p className="text-sm text-muted-foreground">
          When you reply to external contacts, emails will appear from this address
        </p>
      </div>
      
      {/* Section Toggles */}
      <Card>
        <CardHeader>Visible Sections</CardHeader>
        <CardContent className="space-y-4">
          <Switch label="Bio" checked={settings.showBio} />
          <Switch label="Photo Gallery" checked={settings.showGallery} />
          <Switch label="Upcoming Events" checked={settings.showEvents} />
          <Switch label="Testimonials" checked={settings.showTestimonials} />
          <Switch label="Pricing" checked={settings.showPricing} />
          <Switch label="Social Links" checked={settings.showSocialLinks} />
          <Switch label="Location" checked={settings.showLocation} />
        </CardContent>
      </Card>
      
      {/* Customization */}
      <Card>
        <CardHeader>Customization</CardHeader>
        <CardContent className="space-y-4">
          <Input label="Tagline" value={settings.tagline} placeholder="Professional tango instructor" />
          <Input label="Accent Color" type="color" value={settings.accentColor} />
          <Textarea label="SEO Description" value={settings.metaDescription} />
        </CardContent>
      </Card>
      
      {/* Preview Button */}
      <Button variant="outline" asChild>
        <Link to={`/${settings.slug}`} target="_blank">Preview Pro Page</Link>
      </Button>
    </div>
  );
}
```

---

## PHASE 6: IMPLEMENTATION ORDER

Execute phases in this order, with parallel work where possible:

### Wave 1: Foundation (Parallel)
- [ ] **Task 1.1:** Fix /messages page (CRITICAL)
- [ ] **Task 1.2:** Schema updates (proPageSettings, externalContacts)
- [ ] **Task 1.3:** Rename communityWebsite → personalWebsite

### Wave 2: Website Scraping
- [ ] **Task 2.1:** Create WebsiteScraperService
- [ ] **Task 2.2:** Add analyze/import API endpoints
- [ ] **Task 2.3:** Create profile website input with Mr. Blue button
- [ ] **Task 2.4:** Mr. Blue chat integration for website analysis

### Wave 3: Pro Pages (Parallel)
- [ ] **Task 3.1:** Create PublicProPage component and route
- [ ] **Task 3.2:** Build contact form for non-members
- [ ] **Task 3.3:** Create external contact message threading
- [ ] **Task 3.4:** Implement email reply via Resend

### Wave 4: Pro Page Settings
- [ ] **Task 4.1:** Create ProPageSettings UI component
- [ ] **Task 4.2:** Add to profile page as new tab
- [ ] **Task 4.3:** Slug validation (unique, URL-safe)

### Wave 5: Testing & Polish
- [ ] **Task 5.1:** E2E test website scraping flow
- [ ] **Task 5.2:** E2E test pro page contact form
- [ ] **Task 5.3:** E2E test email reply routing
- [ ] **Task 5.4:** Mobile responsiveness for pro pages

---

## EXECUTION CHECKLIST

### Pre-Execution
- [ ] Read existing message-routes.ts
- [ ] Read existing MessagesPage.tsx
- [ ] Check current schema for users table structure
- [ ] Verify Resend integration is working

### Post-Execution
- [ ] All tests pass
- [ ] /messages page fully functional
- [ ] Website scraping works end-to-end
- [ ] Pro pages render correctly
- [ ] Contact form creates messages
- [ ] Email replies route correctly
- [ ] Update mb.md with new patterns

---

## SUCCESS CRITERIA

1. **Messages Fixed:** /messages loads and displays conversations correctly
2. **Website Scraping:** User can enter URL, see scrapable data, approve, and import to profile
3. **Pro Pages:** Custom slug routes work (mundotango.life/scott)
4. **Contact Form:** Non-members can submit messages without account
5. **Email Routing:** Pro user replies appear from their configured email
6. **Settings UI:** All pro page options configurable from profile

---

## DEPENDENCIES

### Existing Services to Leverage
- `ScrapedEventIngestionService` - Scraping patterns
- `MrBlueDataService` - Chat integration
- `Resend Integration` - Email sending
- `MessageService` - Platform messaging

### New Services to Create
- `WebsiteScraperService` - Personal website scraping
- `ProPageService` - Pro page data and settings
- `ExternalContactService` - Non-member contact management

---

## NOTES

- **Email Domain:** Consider using reply+{id}@mundotango.life for inbound parsing
- **Rate Limiting:** Add scraping rate limits to prevent abuse
- **Image Handling:** Store scraped images in object storage with user consent
- **GDPR:** Website scraping should only import data user explicitly approves

---

**END OF PLAYBOOK**
