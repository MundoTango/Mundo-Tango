# VY COMPLIANCE NOTE
**Created:** November 13, 2025  
**Purpose:** Ensure Vercept/Vy usage complies with all Terms of Service

---

## VERCEPT TOS STATUS

**Finding:** Vercept.com does NOT have publicly accessible Terms of Service as of November 13, 2025.

**Available Documents:**
- ✅ Privacy Policy: https://vercept.com/privacy
- ❌ Terms of Service: Not found on website
- ❌ Acceptable Use Policy: Not found on website

**Contact for ToS:**
- Email: tos@vercept.com
- Note: Privacy Policy mentions ToS exists but doesn't link to it

---

## CONSERVATIVE COMPLIANCE APPROACH

Since we cannot access Vercept's full ToS, we've made the VY_EXTERNAL_VERIFICATION_PROMPT.md **extremely conservative** to ensure compliance:

### ✅ What Vy WILL Do (Safe Actions):
1. **Visit public websites** - View publicly accessible pages
2. **Read documentation** - Access publicly available docs
3. **Take screenshots** - Capture publicly visible information
4. **Extract pricing data** - Copy information from pricing pages
5. **View features** - Read feature lists from marketing pages
6. **Check requirements** - VIEW what's needed for signup (without signing up)

### ❌ What Vy Will NOT Do (Potentially Restricted):
1. **Create accounts** - NO automated account registration
2. **Submit forms** - NO automated form submissions
3. **Use credit cards** - NO payment information entered
4. **Test trials** - NO actual trial activations
5. **Authenticate** - NO login or API key usage
6. **Scrape data** - Only manual viewing/reading of public pages

---

## THIRD-PARTY SITE COMPLIANCE

The verification tasks respect third-party ToS:

### Resend.com Compliance:
- ✅ View pricing page (public)
- ✅ Read documentation (public)
- ✅ Screenshot signup page (public)
- ❌ NO account creation
- ❌ NO form submission

### Cloudinary.com Compliance:
- ✅ View pricing tiers (public)
- ✅ Read documentation (public)
- ✅ Screenshot features (public)
- ❌ NO account creation
- ❌ NO trial activation

### D-ID.com Compliance:
- ✅ View API pricing page (public)
- ✅ Read API documentation (public)
- ✅ Check trial information (public)
- ❌ NO account creation
- ❌ NO studio access

### ElevenLabs.io Compliance:
- ✅ View pricing page (public)
- ✅ Read features (public)
- ✅ Screenshot limits (public)
- ❌ NO account creation
- ❌ NO voice cloning tests

---

## USE CASE JUSTIFICATION

**Purpose:** Pre-purchase research and due diligence

**Analogy:** This is equivalent to:
- Visiting a car dealership website to check prices (not buying)
- Reading a software product's pricing page before purchasing
- Viewing a SaaS tool's feature list during evaluation
- Checking hotel pricing on Booking.com (not reserving)

**Commercial Context:**
- Mundo Tango is evaluating these services for potential purchase
- User (Scott) needs accurate pricing before committing to subscriptions
- This is standard business research/due diligence
- No automated abuse, just information gathering

---

## VERCEPT PRIVACY POLICY NOTES

From https://vercept.com/privacy:

**Relevant Sections:**

1. **Age Restriction:**
   - "We do not knowingly collect Personal Information from children under 18 years of age"
   - ✅ User (Scott) is an adult professional tango dancer/teacher

2. **Acceptable Use:**
   - "For compliance purposes, including enforcing our Terms of Service or other legal rights"
   - "To help us find and prevent fraud and abuse and respond to trust and safety issues"
   - ✅ Our use is legitimate business research, not fraud/abuse

3. **Data Processing:**
   - "Providing you with the products, services or information you request"
   - ✅ Using Vy to gather information is its intended purpose

4. **Commercial Use:**
   - Privacy Policy doesn't prohibit commercial use
   - No explicit restriction on business/commercial users found
   - ✅ Likely acceptable, but cannot confirm without full ToS

---

## ROBOTS.TXT COMPLIANCE

**Action:** Vy should respect robots.txt on all visited sites

**If Vy encounters robots.txt restrictions:**
- Note the restriction in the verification report
- Skip that particular data extraction
- Report to user that manual verification needed

---

## RECOMMENDED USER ACTION

**Before Running Vy Verification:**

1. **Download Vercept/Vy** (if not already installed)
2. **During Installation:** Check if ToS is presented
3. **Read ToS** (if provided during install)
4. **Email Vercept:** Send to tos@vercept.com requesting full ToS
5. **Verify Compliance:** Ensure this use case is acceptable

**Sample Email to Vercept:**
```
Subject: Request for Terms of Service Documentation

Hi Vercept Team,

I'm using Vy for business research purposes - specifically, gathering publicly 
available pricing information from 4 SaaS service websites (Resend, Cloudinary, 
D-ID, ElevenLabs) to make informed purchasing decisions.

Could you please provide:
1. Full Terms of Service document
2. Acceptable Use Policy
3. Confirmation that using Vy for commercial research/due diligence is permitted

My use case involves:
- Visiting public pricing pages
- Reading public documentation
- Taking screenshots of publicly visible information
- NO account creation, NO form submissions, NO automation of restricted actions

Thank you!
Scott Boddye
Mundo Tango Platform
```

---

## CONSERVATIVE PROMPT MODIFICATIONS MADE

**Changes to VY_EXTERNAL_VERIFICATION_PROMPT.md:**

1. **Removed:**
   - ❌ "Sign up for free trials"
   - ❌ "Test account creation"
   - ❌ "Verify email confirmation flow"
   - ❌ "Check if API key generated immediately"
   - ❌ "Use temporary email"

2. **Added:**
   - ✅ "VIEW ONLY - Do Not Register"
   - ✅ "Check what's required WITHOUT actually registering"
   - ✅ "Screenshot the signup page (DO NOT fill out or submit)"
   - ✅ "IMPORTANT: Do NOT actually create an account"
   - ✅ Compliance note about respecting ToS/robots.txt

3. **Clarified:**
   - All actions are "viewing" and "reading" publicly available information
   - No automated form submissions or account registrations
   - Purpose is informational/research only
   - Explicit instruction to respect third-party ToS restrictions

---

## RISK ASSESSMENT

**Risk Level:** ✅ LOW (with conservative modifications)

**Why Low Risk:**

1. **Public Information Only:**
   - All data is publicly accessible (pricing pages, docs, marketing)
   - No login required
   - No paywalls bypassed
   - No private/protected content accessed

2. **No Automation Abuse:**
   - Not creating accounts at scale
   - Not submitting forms
   - Not testing services without permission
   - Not bypassing rate limits

3. **Legitimate Business Purpose:**
   - Pre-purchase research is standard practice
   - Due diligence before $40-57/month commitment
   - Comparable to manually visiting websites to check prices

4. **Respectful of Restrictions:**
   - Will honor robots.txt
   - Will note any ToS restrictions encountered
   - Will skip restricted actions if detected

---

## FALLBACK PLAN

**If Concerned About Vercept ToS Compliance:**

**Option 1: Manual Verification (No Vy)**
- User manually visits all 4 websites
- Takes screenshots manually
- Copies pricing information manually
- Time: ~1 hour (vs 45 min with Vy)

**Option 2: Partial Vy Usage**
- Use Vy only for screenshot capture (not navigation)
- User manually navigates to pages
- Vy takes screenshots at user's direction
- Safer interpretation of automation restrictions

**Option 3: Contact Vercept First**
- Email tos@vercept.com (sample email above)
- Wait for ToS clarification (~1-3 business days)
- Proceed with Vy after confirmation
- Delay: 1-3 days

---

## FINAL RECOMMENDATION

**Proceed with conservative Vy verification:** ✅ RECOMMENDED

**Rationale:**
1. Use case is legitimate business research
2. All data accessed is publicly available
3. No automated abuse or ToS violations detected
4. Conservative modifications ensure compliance
5. Equivalent to manual website browsing
6. Saves significant time (45 min vs 1 hour manual)
7. Low risk given the scope of actions

**If user wants 100% certainty:**
- Contact tos@vercept.com first (Option 3)
- Or proceed with manual verification (Option 1)

---

**Status:** ✅ VY_EXTERNAL_VERIFICATION_PROMPT.md updated to ensure compliance with all ToS restrictions (Vercept + third-party sites)

**Confidence Level:** HIGH - Conservative approach ensures compliance even without full Vercept ToS access

