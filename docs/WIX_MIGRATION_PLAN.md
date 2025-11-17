# WIX MIGRATION PLAN - Mundo Tango

**Created:** November 17, 2025  
**Purpose:** Migrate mundotango.life from Wix to full Mundo Tango app  
**Data Target:** Extract waitlist users and site content  
**Timeline:** 2-3 hours total

---

## 🎯 MISSION OBJECTIVES

### **Primary Goals:**
1. ✅ **Extract Waitlist Data** - Get all waitlist signups from Wix
2. ✅ **Build New Landing Page** - Replace Wix site with React app
3. ✅ **Import Users to DB** - Add waitlist users to production database
4. ✅ **Point Domain** - Switch mundotango.life DNS to Replit
5. ✅ **Decommission Wix** - Cancel Wix subscription (save $20/month)

### **Success Criteria:**
- All waitlist users extracted (email, name, signup date)
- New landing page live at mundotango.life
- Wix site archived (no data loss)
- Domain pointing to Replit deployment

---

## 📊 CURRENT STATE ANALYSIS

### **What We Have:**
- ✅ Wix_username secret (in Replit)
- ✅ Wix_password secret (in Replit)
- ✅ Wix site live at mundotango.life
- ✅ Computer use feature available (Vy via Vercept)
- ✅ Full Mundo Tango app ready (95% production ready)

### **What We Need:**
- ❌ Waitlist user data (trapped in Wix)
- ❌ Site content (text, images, layout info)
- ❌ New landing page (React component)
- ❌ Domain DNS configuration

---

## 🔍 WIX DATA EXTRACTION METHODS

### **Method 1: Wix Dashboard Export (FASTEST)** ⭐⭐⭐
**Best for:** Getting contact/waitlist data

**Steps:**
1. **Access via Computer Use** (Vy/Vercept):
   - Navigate to Wix dashboard
   - Login with Wix_username + Wix_password
   - Go to Contacts section
   - Export contacts as CSV

2. **What We'll Get:**
   - Email addresses
   - Names (if collected)
   - Signup timestamps
   - Any custom fields (phone, location, etc.)

**Expected Output:** `wix_waitlist.csv`

**Time:** 15 minutes

---

### **Method 2: Wix API (If Dashboard Export Fails)**
**Best for:** Programmatic data access

**Steps:**
1. **Get API Key** (via Vy):
   - Login to Wix dashboard
   - Go to Settings → API Keys
   - Create new API key with "Read Contacts" permission
   - Copy API key to Replit secret: WIX_API_KEY

2. **Use Wix Contacts API:**
```typescript
// server/scripts/wix-extract-contacts.ts
import { fetch } from 'node-fetch';

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID; // Get from dashboard

async function extractWixContacts() {
  const response = await fetch(
    `https://www.wixapis.com/contacts/v4/contacts/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': WIX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          filter: {
            'info.labelKeys': { '$hasSome': ['waitlist'] }
          }
        }
      })
    }
  );
  
  const data = await response.json();
  return data.contacts;
}
```

**Expected Output:** JSON array of contacts

**Time:** 30 minutes

---

### **Method 3: Wix Code Export (For Site Content)**
**Best for:** Getting page layouts, text content

**Steps:**
1. **Access Wix Editor** (via Vy):
   - Login to Wix
   - Open site in Wix Editor
   - Go to Dev Mode (if using Wix Code)
   - Export code (if available)

2. **Manual Content Extraction:**
   - Take screenshots of all pages
   - Copy all text content
   - Download all images
   - Document layout structure

**Expected Output:**
- Screenshots: `wix_screenshots/`
- Text content: `wix_content.txt`
- Images: `wix_assets/`

**Time:** 45 minutes

---

## 🏗️ NEW LANDING PAGE BUILD

### **Design Approach:**
**Option 1: Replicate Wix Design** (Simple)
- Match existing Wix site visually
- Faster implementation
- Less design work

**Option 2: Full Mundo Tango Design** (Better) ⭐
- Use MT Ocean theme (turquoise, glassmorphic)
- Modern, professional look
- Aligns with full platform design
- Better user experience

**RECOMMENDATION:** Option 2 - Full MT Ocean design

---

### **Landing Page Components:**

#### **1. Hero Section**
```typescript
// client/src/pages/LandingPage.tsx
- Large hero image (tango dancers)
- Headline: "Connect with the Global Tango Community"
- Subheadline: "Mundo Tango brings dancers, teachers, and events together worldwide"
- CTA: "Join the Waitlist" button → /signup
- Background: Glassmorphic MT Ocean gradient
```

#### **2. Features Section**
```typescript
- 3-4 feature cards:
  - "Find Your Perfect Dance Partner" (AI matching)
  - "Discover Events Worldwide" (global calendar)
  - "Connect with Teachers" (marketplace)
  - "Share Your Journey" (social features)
- Icons: Lucide React
- Layout: Grid 2x2 or 1x4
```

#### **3. Waitlist Form**
```typescript
- Email input (required)
- Name input (optional)
- "Notify Me at Launch" button
- Success message: "Thanks! You're on the list!"
- Error handling
- Store in PostgreSQL (users table, waitlist: true)
```

#### **4. Footer**
```typescript
- Links: Privacy Policy, Terms, Contact
- Social media: Facebook, Instagram, YouTube
- Copyright: © 2025 Mundo Tango
- Email: admin@mundotango.life
```

---

## 💾 DATABASE SCHEMA FOR WAITLIST

### **Option 1: Use Existing Users Table** ⭐
```typescript
// shared/schema.ts - Already exists!
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique(),
  name: varchar("name"),
  waitlist: boolean("waitlist").default(false), // Add this field
  waitlistDate: timestamp("waitlist_date"), // Add this field
  // ... existing fields
});
```

**Advantages:**
- No new table needed
- Existing auth system works
- Easy to convert waitlist users to full users later

**Migration:**
```bash
# Add waitlist fields
npm run db:push --force
```

---

### **Option 2: Separate Waitlist Table**
```typescript
// shared/schema.ts
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  source: varchar("source").default("wix"), // "wix" or "new_site"
  signupDate: timestamp("signup_date").defaultNow(),
  converted: boolean("converted").default(false),
  userId: integer("user_id").references(() => users.id),
});
```

**Advantages:**
- Clean separation
- Track conversion rate
- Preserve source data

**RECOMMENDATION:** Option 1 (simpler, uses existing table)

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Data Extraction (45 min)**
**Using Vy (Vercept Computer Use):**

1. **Create Vy Prompt** (10 min):
```markdown
VY MISSION: Extract Wix Waitlist Data

1. Navigate to wix.com
2. Login with ${Wix_username} / ${Wix_password}
3. Go to Contacts → Contacts
4. Click Export → CSV
5. Download file
6. Upload CSV to Replit project: attached_assets/wix_waitlist.csv

ALSO:
7. Take screenshots of all pages (for design reference)
8. Copy all text content
9. Download all images from site
10. Document page structure

DELIVERABLE:
- wix_waitlist.csv (contacts export)
- wix_screenshots/ (page screenshots)
- wix_content.txt (all text)
- wix_images/ (downloaded images)
```

2. **Run Vy Mission** (20 min)
3. **Verify Data Quality** (15 min):
   - Check CSV format
   - Validate email addresses
   - Count total waitlist users
   - Identify any duplicates

---

### **Phase 2: Build Landing Page (60 min)**

#### **Step 2.1: Create LandingPage Component** (30 min)
```typescript
// client/src/pages/LandingPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest('/api/waitlist/join', {
        method: 'POST',
        body: JSON.stringify({ email, name })
      });

      toast({
        title: "You're on the list!",
        description: "We'll notify you when Mundo Tango launches."
      });
      setEmail('');
      setName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Connect with the Global Tango Community
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Mundo Tango brings dancers, teachers, and events together worldwide. 
          Join the revolution against social media silos.
        </p>
        
        {/* Waitlist Form */}
        <form onSubmit={handleJoinWaitlist} className="max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-name"
            />
            <Button type="submit" size="lg" disabled={loading} data-testid="button-join-waitlist">
              {loading ? 'Joining...' : 'Join the Waitlist'}
            </Button>
          </div>
        </form>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature cards */}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2025 Mundo Tango. Reversing social media's negative impacts.</p>
      </footer>
    </div>
  );
}
```

#### **Step 2.2: Create Backend Endpoint** (15 min)
```typescript
// server/routes.ts
app.post('/api/waitlist/join', async (req, res) => {
  const { email, name } = req.body;
  
  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  // Add to users table with waitlist flag
  try {
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      // Update existing user to waitlist
      await storage.updateUser(existingUser.id, {
        waitlist: true,
        waitlistDate: new Date()
      });
    } else {
      // Create new waitlist user
      await storage.createUser({
        email,
        username: email.split('@')[0],
        name: name || null,
        waitlist: true,
        waitlistDate: new Date()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});
```

#### **Step 2.3: Register Route** (5 min)
```typescript
// client/src/App.tsx
<Route path="/" component={LandingPage} />
```

#### **Step 2.4: Test Locally** (10 min)
```bash
npm run dev
# Visit http://localhost:5000
# Test waitlist form
# Verify data saved to DB
```

---

### **Phase 3: Import Wix Data (30 min)**

#### **Step 3.1: Create Import Script** (15 min)
```typescript
// server/scripts/import-wix-waitlist.ts
import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../db';
import { users } from '../../shared/schema';

async function importWixWaitlist() {
  const results: any[] = [];

  fs.createReadStream('attached_assets/wix_waitlist.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Found ${results.length} waitlist users from Wix`);

      for (const row of results) {
        const email = row.email || row.Email || row['Email Address'];
        const name = row.name || row.Name || row['Full Name'];
        const signupDate = row.date || row.Date || row['Created Date'];

        if (!email) continue;

        try {
          // Check if user exists
          const existing = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email)
          });

          if (existing) {
            console.log(`Skipping existing user: ${email}`);
            continue;
          }

          // Create new waitlist user
          await db.insert(users).values({
            email,
            username: email.split('@')[0],
            name: name || null,
            waitlist: true,
            waitlistDate: signupDate ? new Date(signupDate) : new Date(),
            source: 'wix'
          });

          console.log(`✅ Imported: ${email}`);
        } catch (error) {
          console.error(`❌ Failed to import ${email}:`, error);
        }
      }

      console.log('Import complete!');
    });
}

importWixWaitlist();
```

#### **Step 3.2: Run Import** (5 min)
```bash
npx tsx server/scripts/import-wix-waitlist.ts
```

#### **Step 3.3: Verify Import** (10 min)
```sql
-- Check imported users
SELECT COUNT(*) FROM users WHERE waitlist = true AND source = 'wix';
SELECT email, name, waitlist_date FROM users WHERE source = 'wix' LIMIT 10;
```

---

### **Phase 4: Domain Migration (30 min)**

#### **Step 4.1: Get Replit Deployment URL** (5 min)
```bash
# After deploying to Replit
# Get deployment URL from Replit dashboard
# Example: mundotango.life.replit.app
```

#### **Step 4.2: Configure DNS at Domain Registrar** (15 min)
**If mundotango.life is at Wix:**
1. Login to Wix dashboard
2. Go to Settings → Domains
3. Find mundotango.life
4. Disconnect domain from Wix site
5. Get domain registrar info (where you bought it)

**Update DNS Records:**
1. Login to domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS management for mundotango.life
3. Update A record:
   - Type: A
   - Name: @
   - Value: [Replit IP - get from Replit docs]
   - TTL: 600
4. Update CNAME record (www):
   - Type: CNAME
   - Name: www
   - Value: mundotango.life.replit.app
   - TTL: 600

**Note:** DNS propagation takes 1-48 hours (usually 1-6 hours)

#### **Step 4.3: Configure Custom Domain in Replit** (10 min)
1. Go to Replit project settings
2. Click "Deployments" → "Custom Domain"
3. Enter: mundotango.life
4. Follow Replit instructions
5. Verify domain ownership

---

### **Phase 5: Testing & Verification (30 min)**

#### **Test 5.1: Landing Page** (10 min)
- ✅ Page loads at mundotango.life
- ✅ Hero section displays correctly
- ✅ MT Ocean theme applied
- ✅ Waitlist form works
- ✅ Email validation works
- ✅ Success message appears
- ✅ Data saved to database

#### **Test 5.2: Imported Data** (10 min)
- ✅ All Wix waitlist users imported
- ✅ No duplicate emails
- ✅ Signup dates preserved
- ✅ Names imported correctly
- ✅ waitlist flag set to true

#### **Test 5.3: Domain** (10 min)
- ✅ mundotango.life resolves to Replit
- ✅ www.mundotango.life redirects correctly
- ✅ HTTPS certificate valid
- ✅ No mixed content warnings

---

## 📋 COMPLETE CHECKLIST

### **Pre-Migration:**
- [ ] Wix_username secret exists in Replit
- [ ] Wix_password secret exists in Replit
- [ ] Backup Wix site (screenshots, content export)
- [ ] Identify domain registrar

### **Data Extraction:**
- [ ] Vy prompt created for Wix extraction
- [ ] Wix contacts exported (CSV)
- [ ] Site content documented (text, images)
- [ ] Screenshots taken of all pages
- [ ] Data quality verified

### **Landing Page:**
- [ ] LandingPage.tsx component created
- [ ] Hero section implemented
- [ ] Features section added
- [ ] Waitlist form working
- [ ] Backend endpoint created
- [ ] Route registered in App.tsx
- [ ] Local testing passed

### **Data Import:**
- [ ] Import script created
- [ ] CSV parsing works
- [ ] Users imported to database
- [ ] No duplicates created
- [ ] Import verified via SQL

### **Domain Migration:**
- [ ] Replit deployment URL obtained
- [ ] DNS records updated at registrar
- [ ] Custom domain configured in Replit
- [ ] SSL certificate issued
- [ ] Domain resolves correctly

### **Testing:**
- [ ] Landing page loads correctly
- [ ] Waitlist form submits successfully
- [ ] Data saves to database
- [ ] Email validation works
- [ ] Mobile responsive
- [ ] All links work
- [ ] Footer displays correctly

### **Decommission Wix:**
- [ ] All data exported from Wix
- [ ] Domain disconnected from Wix
- [ ] Wix subscription cancelled (save $20/month)
- [ ] Final backup archived

---

## 🎯 SUCCESS METRICS

**Technical:**
- ✅ 100% waitlist users migrated
- ✅ 0 duplicate emails
- ✅ <2 second page load time
- ✅ 100% mobile responsive
- ✅ Domain resolves in <6 hours

**Business:**
- ✅ $20/month saved (Wix subscription cancelled)
- ✅ Full control over site and data
- ✅ Integrated with Mundo Tango platform
- ✅ Consistent MT Ocean branding

**User Experience:**
- ✅ Cleaner, faster, more professional site
- ✅ Seamless transition (users don't notice)
- ✅ Waitlist users can access full platform later
- ✅ Better SEO and performance

---

## 🚨 ROLLBACK PLAN

**If migration fails:**

1. **DNS Rollback:**
   - Revert DNS records to Wix
   - Wait 1-6 hours for propagation
   - Old Wix site becomes live again

2. **Data Safety:**
   - All Wix data backed up before migration
   - Can re-import if needed
   - No data loss risk

3. **User Impact:**
   - DNS propagation means smooth transition
   - Users see either old or new site (both work)
   - No downtime or broken links

---

## 📞 SUPPORT

**Wix Support:**
- Help Center: support.wix.com
- Phone: 1-800-600-0950
- Live Chat: Available in dashboard

**Domain Registrar:**
- Varies by registrar (GoDaddy, Namecheap, etc.)
- Have account credentials ready

**Replit Deployment:**
- Docs: docs.replit.com/hosting/deployments
- Support: support@replit.com
- Community: replit.com/community

---

**Timeline:** 2-3 hours total
**Cost Savings:** $20/month (Wix subscription cancelled)
**Risk Level:** Low (reversible, data backed up)
**Priority:** High (domain consolidation, data ownership)

**Ready to execute! 🚀**
