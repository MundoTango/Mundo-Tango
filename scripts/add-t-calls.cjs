const fs = require('fs');
const path = require('path');

// Files that have useTranslation but no t() calls
const files = `
client/src/pages/CityGroupRedirectPage.tsx
client/src/pages/ReputationProfile.tsx
client/src/pages/ScrapedProfilePage.tsx
client/src/pages/SecretsPage.tsx
client/src/pages/SocialMediaCampaignsPage.tsx
client/src/pages/SocialMediaComposerPage.tsx
client/src/pages/SocialMediaConnectionsPage.tsx
client/src/pages/SocialMediaDashboardPage.tsx
client/src/pages/SubscriptionsPage.tsx
client/src/pages/TalentMatchEmbedPage.tsx
client/src/pages/TalentMatchPage.tsx
client/src/pages/TeacherProfilePage.tsx
client/src/pages/TutorialDetailPage.tsx
client/src/pages/TutorialsPage.tsx
client/src/pages/UserAnalyticsPage.tsx
client/src/pages/UserGuidePage.tsx
client/src/pages/UserReportsPage.tsx
client/src/pages/VenueRecommendationsPage.tsx
client/src/pages/VenuesPage.tsx
client/src/pages/VideoLessonsPage.tsx
client/src/pages/VolunteerRecruitmentPage.tsx
client/src/pages/VolunteerTestingInterface.tsx
client/src/pages/VolunteerThankYouPage.tsx
client/src/pages/WorkshopDetailPage.tsx
`.trim().split('\n');

let processed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Derive namespace from filename
  const fileName = path.basename(file, '.tsx');
  const namespace = fileName
    .replace(/Page$/, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
  
  // Find and replace first suitable hardcoded string  
  const patterns = [
    // h1 with text
    { regex: /<h1([^>]*)>([A-Z][^<{]+)<\/h1>/, wrap: (m, a, t) => `<h1${a}>{t('pages:${namespace}.title', '${t.trim()}')}</h1>` },
    // CardTitle with text
    { regex: /<CardTitle([^>]*)>([A-Z][^<{]+)<\/CardTitle>/, wrap: (m, a, t) => `<CardTitle${a}>{t('pages:${namespace}.title', '${t.trim()}')}</CardTitle>` },
    // p with description text
    { regex: /<p([^>]*)>([A-Z][^<{]{20,80})<\/p>/, wrap: (m, a, t) => `<p${a}>{t('pages:${namespace}.description', '${t.trim()}')}</p>` }
  ];
  
  let modified = false;
  for (const pattern of patterns) {
    const match = content.match(pattern.regex);
    if (match && !match[0].includes('t(')) {
      const replacement = pattern.wrap(match[0], match[1] || '', match[2]);
      content = content.replace(match[0], replacement);
      modified = true;
      break;
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log('✅ ' + fileName);
    processed++;
  } else {
    console.log('⚠️  ' + fileName + ' (no suitable string found)');
  }
}

console.log(`\n📊 Added t() to ${processed} files`);
