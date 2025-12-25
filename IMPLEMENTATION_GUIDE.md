# MARKETING CONTENT IMPLEMENTATION GUIDE

**Purpose:** Step-by-step guide to implement and execute the marketing content generation system
**Target Audience:** Developers, marketing team members
**Prerequisites:** Playwright installed, Replit/local environment set up

---

## PHASE 1: ENVIRONMENT SETUP

### Step 1.1: Install Dependencies
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Verify installation
npx playwright --version
```

### Step 1.2: Create Output Directories
```bash
# Create marketing asset directories
mkdir -p marketing-assets/screenshots
mkdir -p marketing-assets/videos

# Create desktop backup (optional)
mkdir -p ~/Desktop/Mundo-Tango-Videos
```

### Step 1.3: Configure Environment Variables
```bash
# In .env file
BASE_URL=https://mundotango.replit.app  # or your deployment URL
SCREENSHOT_QUALITY=90
VIDEO_FPS=30
```

---

## PHASE 2: TEST FILE REVIEW & FIX

### Step 2.1: Review Existing Test Files

**Files to check:**
1. `tests/marketing-screenshots.spec.ts` ✅ (Working)
2. `tests/marketing-videos.spec.ts` ✅ (Working)
3. `tests/marketing-content-complete.spec.ts` ⚠️ (Needs review)

### Step 2.2: Common Issues to Fix

**Syntax Issues:**
- Missing semicolons
- Unclosed brackets/braces
- Incorrect function syntax
- Missing await keywords

**To check:**
```bash
# Run TypeScript compiler check
npx tsc --noEmit tests/marketing-content-complete.spec.ts

# Or use ESLint
npx eslint tests/marketing-content-complete.spec.ts
```

### Step 2.3: Test Structure Template

Each test should follow this pattern:
```typescript
test('Feature Name - Scenario', async ({ page }) => {
  // 1. Navigate to feature
  await page.goto(`${BASE_URL}/feature-route`);
  
  // 2. Wait for content
  await page.waitForLoadState('networkidle');
  
  // 3. Capture screenshot
  await captureScreenshot(page, 'feature-name-scenario');
  
  // 4. Optional: Interact and capture more
  await page.click('button');
  await page.waitForTimeout(1000);
  await captureScreenshot(page, 'feature-name-after-interaction');
});
```

---

## PHASE 3: GENERATE BASE ASSETS

### Step 3.1: Run Screenshot Tests

```bash
# Run all screenshot tests
npx playwright test tests/marketing-screenshots.spec.ts

# Run specific test
npx playwright test tests/marketing-screenshots.spec.ts -g "Events Discovery"

# Run in headed mode (see browser)
npx playwright test tests/marketing-screenshots.spec.ts --headed

# Run with debug
npx playwright test tests/marketing-screenshots.spec.ts --debug
```

**Expected Output:**
- 40+ PNG files in `marketing-assets/screenshots/`
- Files named according to convention: `{feature}-{view}-{variant}.png`

### Step 3.2: Run Video Tests

```bash
# Run all video tests
npx playwright test tests/marketing-videos.spec.ts

# With specific browser
npx playwright test tests/marketing-videos.spec.ts --project=chromium
```

**Expected Output:**
- 7+ video files in `marketing-assets/videos/`
- WebM format (default) or MP4

### Step 3.3: Run Story Flow Tests

```bash
# After fixing syntax errors
npx playwright test tests/marketing-content-complete.spec.ts

# Run specific story flow
npx playwright test tests/marketing-content-complete.spec.ts -g "New Dancer"
```

**Expected Output:**
- 50+ story flow screenshots
- Named as: `story-{flow}-step-{#}-{description}.png`

---

## PHASE 4: QUALITY REVIEW

### Step 4.1: Screenshot Quality Checklist

For each screenshot, verify:
- [ ] Full page content visible
- [ ] No loading spinners or placeholders
- [ ] Proper resolution (1920x1080 desktop, 375x812 mobile)
- [ ] No cut-off text or elements
- [ ] Realistic demo data visible
- [ ] UI elements properly rendered

### Step 4.2: Video Quality Checklist

For each video, verify:
- [ ] Smooth playback (no stuttering)
- [ ] Audio if applicable
- [ ] Proper duration (matches spec in MARKETING_STORY_FLOWS.md)
- [ ] Clear demonstration of feature
- [ ] No console errors visible
- [ ] Proper file size (not too large)

### Step 4.3: Review Script

```bash
# Create review script
cat > review-assets.sh << 'REVIEW'
#!/bin/bash

echo "📊 ASSET REVIEW REPORT"
echo "====================="
echo ""

echo "Screenshots:"
find marketing-assets/screenshots -name "*.png" | wc -l
echo ""

echo "Videos:"
find marketing-assets/videos -name "*.mp4" -o -name "*.webm" | wc -l
echo ""

echo "Total asset size:"
du -sh marketing-assets/
echo ""

echo "Largest files:"
find marketing-assets -type f -exec du -h {} + | sort -rh | head -10
REVIEW

chmod +x review-assets.sh
./review-assets.sh
```

---

## PHASE 5: PROCESS FOR CHANNELS

### Step 5.1: Create Channel Variants

```bash
# Install image processing tool
npm install sharp

# Create processing script
node scripts/process-for-channels.js
```

**Processing script template:**
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Instagram square crop (1080x1080)
async function createInstagramVariant(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .toFile(outputPath);
}

// Instagram story (1080x1920)
async function createStoryVariant(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1080, 1920, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .toFile(outputPath);
}

// Process all screenshots
const screenshotsDir = 'marketing-assets/screenshots';
const files = fs.readdirSync(screenshotsDir);

for (const file of files) {
  if (file.endsWith('.png')) {
    const inputPath = path.join(screenshotsDir, file);
    const baseName = file.replace('.png', '');
    
    // Create variants
    await createInstagramVariant(
      inputPath,
      `marketing-assets/instagram/${baseName}-square.png`
    );
    await createStoryVariant(
      inputPath,
      `marketing-assets/instagram/${baseName}-story.png`
    );
  }
}
```

### Step 5.2: Video Processing

```bash
# Install ffmpeg (if not already installed)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg

# Convert WebM to MP4
for file in marketing-assets/videos/*.webm; do
  ffmpeg -i "$file" -c:v libx264 -c:a aac "${file%.webm}.mp4"
done

# Create shorter clips for ads (15s)
for file in marketing-assets/videos/*.mp4; do
  ffmpeg -i "$file" -t 15 -c copy "${file%.mp4}-15s.mp4"
done

# Create GIFs for email
for file in marketing-assets/videos/*.mp4; do
  ffmpeg -i "$file" -vf "fps=10,scale=640:-1:flags=lanczos" "${file%.mp4}.gif"
done
```

---

## PHASE 6: DEPLOY CONTENT

### Step 6.1: Website Deployment

```bash
# Copy assets to public directory
cp marketing-assets/screenshots/* public/images/marketing/
cp marketing-assets/videos/* public/videos/marketing/

# Update website code with asset references
# Use filenames from MARKETING_ASSET_MATRIX.md
```

### Step 6.2: Social Media Scheduling

**Tools:**
- Buffer / Hootsuite for scheduling
- Canva for additional design (if needed)

**Process:**
1. Open MARKETING_COPY_FRAMEWORK.md
2. For each social post template:
   - Upload corresponding screenshot/video
   - Copy caption text
   - Add hashtags
   - Schedule post

### Step 6.3: Email Campaign Setup

**Steps:**
1. Import assets to email platform (Mailchimp, SendGrid, etc.)
2. Use email templates from MARKETING_COPY_FRAMEWORK.md
3. Insert screenshots where indicated
4. Set up automation triggers
5. Test emails before sending

### Step 6.4: App Store Updates

**iOS App Store:**
1. Log in to App Store Connect
2. Navigate to app page
3. Upload screenshots (5 required, following order in MARKETING_COPY_FRAMEWORK.md)
4. Upload preview video (30s max)
5. Update description with new copy
6. Submit for review

**Google Play Store:**
1. Log in to Google Play Console
2. Upload screenshots
3. Upload promo video to YouTube, link in listing
4. Update description
5. Publish changes

---

## PHASE 7: MONITORING & ITERATION

### Step 7.1: Track Metrics

**Metrics to monitor:**
- Social media engagement (likes, shares, comments)
- Email open rates and click-through rates
- App store conversion rates
- Website traffic from campaigns
- Paid ad performance (CTR, CPC, conversions)

### Step 7.2: A/B Testing

**Test variants:**
1. Different screenshots for same feature
2. Video vs static image
3. Different copy headlines
4. Different CTAs

### Step 7.3: Update Cycle

```bash
# When making updates:
1. Update documentation (MARKETING_COPY_FRAMEWORK.md or MARKETING_STORY_FLOWS.md)
2. Regenerate affected assets
3. Process for channels
4. Deploy updates
5. Update version number
```

---

## TROUBLESHOOTING

### Common Issues

**Issue: Tests timing out**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds
```

**Issue: Screenshots are blank**
```typescript
// Add longer wait
await page.waitForTimeout(3000);
await page.waitForLoadState('networkidle');
```

**Issue: Videos are too large**
```bash
# Compress videos
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
```

**Issue: Mobile screenshots incorrect size**
```typescript
// Set viewport explicitly
await page.setViewportSize({ width: 375, height: 812 });
```

---

## QUICK REFERENCE COMMANDS

```bash
# Generate all assets
npx playwright test tests/marketing-screenshots.spec.ts
npx playwright test tests/marketing-videos.spec.ts
npx playwright test tests/marketing-content-complete.spec.ts

# Review generated assets
ls -lh marketing-assets/screenshots/ | wc -l
ls -lh marketing-assets/videos/ | wc -l

# Process for channels
node scripts/process-for-channels.js

# Deploy to website
cp -r marketing-assets/* public/marketing/

# Create Git commit
git add marketing-assets/ MARKETING_*.md
git commit -m "Add marketing content generation system and assets"
git push origin main
```

---

## NEXT STEPS AFTER IMPLEMENTATION

1. [ ] Schedule content calendar (30-60 days)
2. [ ] Set up analytics tracking
3. [ ] Create asset library in design tool
4. [ ] Train team on regeneration process
5. [ ] Document brand guidelines
6. [ ] Plan seasonal campaign variants
7. [ ] Set up automated reporting

---

**For questions:** Refer to MARKETING_CONTENT_SYSTEM_COMPLETE.md or MARKETING_README.md
**For updates:** Version control all changes in Git, update version numbers
