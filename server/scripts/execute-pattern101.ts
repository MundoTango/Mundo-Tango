/**
 * Pattern 101 Executor: Website Scraper & Pro Pages
 * 
 * This script prompts Mr. Blue to execute the WEBSITE_SCRAPER_PRO_PAGES playbook
 * using VibeCoding patterns.
 * 
 * Usage: npx tsx server/scripts/execute-pattern101.ts
 */

import { MrBlueInternalExecutor } from '../services/mrBlue/MrBlueInternalExecutor';

interface PlaybookTask {
  id: string;
  phase: number;
  description: string;
  targetFiles: string[];
  fixPlan: string;
}

const PATTERN_101_TASKS: PlaybookTask[] = [
  // PHASE 1: Website Scraping Service
  {
    id: 'p101-task-1',
    phase: 1,
    description: 'Create WebsiteProfileScraper service for extracting profile data from external websites',
    targetFiles: ['server/services/mrBlue/WebsiteProfileScraper.ts'],
    fixPlan: `Create server/services/mrBlue/WebsiteProfileScraper.ts with:
- Use axios to fetch external website HTML
- Use cheerio for parsing
- Extract: name from title/h1, bio from meta description or about sections
- Extract social links: Instagram, Facebook, YouTube, Twitter, LinkedIn, TikTok
- Extract profile images from og:image or common selectors
- Parse Open Graph and meta tags
- Rate limit external requests (1 per second)
- Return structured ProfileScrapingResult with all extracted fields
- Add error handling for failed requests, timeouts
- Export webProfileScraper singleton`
  },
  {
    id: 'p101-task-2',
    phase: 1,
    description: 'Create API endpoint POST /api/mrblue/analyze-website',
    targetFiles: ['server/routes/mrblue.ts'],
    fixPlan: `Add to server/routes/mrblue.ts:
- POST /api/mrblue/analyze-website endpoint
- Requires authenticateToken middleware
- Takes { url: string } in request body
- Validates URL format
- Calls webProfileScraper.scrapeProfile(url)
- Returns scraped profile data
- Handles errors gracefully
- Add rate limiting per user (5 requests per hour)`
  },
  {
    id: 'p101-task-3',
    phase: 1,
    description: 'Update MessagesPage to detect mrblue=analyze-website query param',
    targetFiles: ['client/src/pages/MessagesPage.tsx'],
    fixPlan: `Update client/src/pages/MessagesPage.tsx:
- Import useSearch from wouter
- On mount, check for ?mrblue=analyze-website&url= params
- If present, auto-start conversation with Mr. Blue
- Send initial message: "Please analyze my website: {url}"
- Clear query params after starting conversation
- Show loading state while analysis runs`
  },
  
  // PHASE 2: Profile Enrichment Flow
  {
    id: 'p101-task-4',
    phase: 2,
    description: 'Create WebsiteDataApproval component for user to approve scraped data',
    targetFiles: ['client/src/components/chat/WebsiteDataApproval.tsx'],
    fixPlan: `Create client/src/components/chat/WebsiteDataApproval.tsx:
- Props: scrapedData, onApprove, onCancel
- Display each field with checkbox (name, bio, photo, social links, etc.)
- Show current value vs scraped value side by side
- "Import Selected" button calls onApprove with selected fields
- "Cancel" button dismisses
- Use Card, Checkbox, Button from shadcn/ui
- Add data-testid attributes for testing`
  },
  {
    id: 'p101-task-5',
    phase: 2,
    description: 'Create API endpoint POST /api/profile/enrich',
    targetFiles: ['server/routes/profileRoutes.ts'],
    fixPlan: `Add to server/routes/profileRoutes.ts:
- POST /api/profile/enrich endpoint
- Requires authenticateToken
- Takes { fields: Record<string, any> } in body
- Only allows specific profile fields to be updated
- Validates each field before saving
- Updates user profile in database
- Returns updated profile
- Logs enrichment action for audit`
  },
  
  // PHASE 3: Pro Page Schema & Backend
  {
    id: 'p101-task-6',
    phase: 3,
    description: 'Add pro page fields to users schema',
    targetFiles: ['shared/schema.ts'],
    fixPlan: `Add to users table in shared/schema.ts (DO NOT change ID types):
- proPageSlug: varchar (unique, nullable)
- proPageContactEmail: varchar (nullable)
- proPageEnabled: boolean default false
- proPageSections: jsonb (nullable) for visibility settings
- proPageTheme: varchar (nullable)
Create insert schema and types`
  },
  {
    id: 'p101-task-7',
    phase: 3,
    description: 'Create pro page API routes',
    targetFiles: ['server/routes/pro-page-routes.ts'],
    fixPlan: `Create server/routes/pro-page-routes.ts:
- GET /api/pro-page/:slug - public, fetch pro page by slug
- GET /api/pro-page/settings - authenticated, get own settings
- PUT /api/pro-page/settings - authenticated, update settings
- GET /api/pro-page/check-slug/:slug - check if slug is available
- POST /api/pro-page/contact - public, submit contact form
Register routes in server/index.ts`
  },
  {
    id: 'p101-task-8',
    phase: 3,
    description: 'Create ProPage.tsx public view component',
    targetFiles: ['client/src/pages/ProPage.tsx'],
    fixPlan: `Create client/src/pages/ProPage.tsx:
- Route: /:slug (must be registered last to avoid conflicts)
- Fetch pro page data by slug
- Profile section: photo, name, bio, social links
- Gallery section (if enabled): user's photos
- Events section: upcoming events by this user
- Testimonials section (if enabled)
- Contact form for non-members
- SEO meta tags for sharing
- Loading and error states
- Add data-testid attributes`
  },
  {
    id: 'p101-task-9',
    phase: 3,
    description: 'Create ProPageSettings.tsx for users to configure their pro page',
    targetFiles: ['client/src/pages/ProPageSettings.tsx'],
    fixPlan: `Create client/src/pages/ProPageSettings.tsx:
- Route: /settings/pro-page
- Slug input with availability checker
- Contact email input
- Section visibility toggles (gallery, events, testimonials)
- Theme selector (future)
- Preview link
- Save button
- Use react-hook-form with zodResolver
- Add data-testid attributes`
  },
  
  // PHASE 4: Contact Form & Email Reply Flow
  {
    id: 'p101-task-10',
    phase: 4,
    description: 'Create ContactForm component for pro pages',
    targetFiles: ['client/src/components/pro/ContactForm.tsx'],
    fixPlan: `Create client/src/components/pro/ContactForm.tsx:
- Props: proUserId, onSuccess
- Fields: name, email, message, optional phone
- Validates email format
- Submits to POST /api/pro-page/contact
- Shows success/error toast
- Clears form on success
- Uses react-hook-form
- Add data-testid attributes`
  },
  {
    id: 'p101-task-11',
    phase: 4,
    description: 'Create externalContacts table for storing contact form submissions',
    targetFiles: ['shared/schema.ts'],
    fixPlan: `Add externalContacts table to shared/schema.ts:
- id: serial primary key
- proUserId: integer references users
- name: varchar
- email: varchar
- phone: varchar (nullable)
- message: text
- createdAt: timestamp
- replied: boolean default false
- repliedAt: timestamp (nullable)
Create insert schema and types`
  },
  {
    id: 'p101-task-12',
    phase: 4,
    description: 'Create email reply service using Resend',
    targetFiles: ['server/services/emailReplyService.ts'],
    fixPlan: `Create server/services/emailReplyService.ts:
- Use Resend SDK with RESEND_API_KEY
- sendReply(fromEmail, toEmail, subject, body) function
- Validates from email is user's configured proPageContactEmail
- Sends email via Resend
- Returns success/failure
- Logs email for audit
- Error handling for failed sends`
  },
  {
    id: 'p101-task-13',
    phase: 4,
    description: 'Update MessagesPage to show external contacts and send email replies',
    targetFiles: ['client/src/pages/MessagesPage.tsx', 'server/routes/messages-routes.ts'],
    fixPlan: `Update messaging system:
1. server/routes/messages-routes.ts:
   - GET /api/messages/external-contacts - get contact form submissions
   - POST /api/messages/reply-external/:contactId - send email reply
   
2. client/src/pages/MessagesPage.tsx:
   - Show external contacts in conversation list with email badge
   - When replying to external contact, send via email
   - Show "Email Reply" button instead of regular send
   - Display sent status`
  }
];

async function executePattern101() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  MR. BLUE PATTERN 101: Website Scraper & Pro Pages');
  console.log('  VibeCoding Execution Started');
  console.log('═══════════════════════════════════════════════════════════\n');

  const executor = new MrBlueInternalExecutor();
  const results: { task: string; success: boolean; error?: string }[] = [];

  for (const task of PATTERN_101_TASKS) {
    console.log(`\n┌─────────────────────────────────────────────────────────────┐`);
    console.log(`│ Phase ${task.phase}: ${task.id}`);
    console.log(`│ ${task.description.slice(0, 55)}...`);
    console.log(`└─────────────────────────────────────────────────────────────┘\n`);

    try {
      const result = await executor.executeTask({
        bugId: task.id,
        description: task.description,
        targetFiles: task.targetFiles,
        fixPlan: task.fixPlan,
        userId: 2, // Admin user
      });

      results.push({
        task: task.id,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        console.log(`✅ ${task.id} completed successfully`);
        console.log(`   Files modified: ${result.filesModified.join(', ')}`);
      } else {
        console.log(`❌ ${task.id} failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`❌ ${task.id} error: ${error.message}`);
      results.push({
        task: task.id,
        success: false,
        error: error.message,
      });
    }

    // Small delay between tasks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  EXECUTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\nFailed tasks:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.task}: ${r.error}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run if called directly
executePattern101().catch(console.error);
