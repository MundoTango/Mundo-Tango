const fs = require('fs');
const path = require('path');

const files = `
client/src/pages/events/EventSearchPage.tsx
client/src/pages/housing/CreateListingPage.tsx
client/src/pages/housing/HostHomePage.tsx
client/src/pages/hr/CultureAgentPage.tsx
client/src/pages/hr/OnboardingAgentPage.tsx
client/src/pages/hr/PerformanceAgentPage.tsx
client/src/pages/hr/RecruiterAgentPage.tsx
client/src/pages/hr/RetentionAgentPage.tsx
client/src/pages/legal/LegalDashboardPage.tsx
client/src/pages/legal/LegalDocumentDetailPage.tsx
client/src/pages/legal/LegalDocumentsPage.tsx
client/src/pages/legal/LegalSignaturePage.tsx
client/src/pages/legal/LegalTemplatesPage.tsx
client/src/pages/LifeCEO/LifeCEODashboard.tsx
client/src/pages/platform/ESACommunicationsPage.tsx
client/src/pages/platform/ESADashboardPage.tsx
client/src/pages/platform/ESATasksPage.tsx
client/src/pages/pro/PROGroupPublicPage.tsx
client/src/pages/travel/TravelEventCoordinationPage.tsx
client/src/pages/travel/TravelItineraryPage.tsx
client/src/pages/travel/TravelTripPlannerPage.tsx
`.trim().split('\n');

let processed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) { console.log('⚠️ Not found:', file); continue; }
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import if missing
  if (!content.includes('useTranslation')) {
    const importLine = "import { useTranslation } from 'react-i18next';";
    const importMatch = content.match(/^import .+from .+['"];?$/gm);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      const idx = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, idx) + '\n' + importLine + content.slice(idx);
    }
  }
  
  // Add hook if missing (after function declaration)
  if (!content.includes("const { t }") && !content.includes("const {t}")) {
    const fnMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/);
    if (fnMatch) {
      const pos = content.indexOf(fnMatch[0]) + fnMatch[0].length;
      content = content.slice(0, pos) + "\n  const { t } = useTranslation(['pages', 'common']);" + content.slice(pos);
    }
  }
  
  // Derive namespace
  const dir = path.dirname(file).split('/').pop();
  const fileName = path.basename(file, '.tsx').replace(/Page$/, '').toLowerCase();
  const namespace = dir + '.' + fileName;
  
  // Add a simple t() call - find first title/heading
  if (!content.includes("t('")) {
    const match = content.match(/<CardTitle([^>]*)>([A-Z][^<{]+)<\/CardTitle>/);
    if (match) {
      const replacement = `<CardTitle${match[1]}>{t('pages:${namespace}.title', '${match[2].trim()}')}</CardTitle>`;
      content = content.replace(match[0], replacement);
    } else {
      // Try h1
      const h1 = content.match(/<h1([^>]*)>([A-Z][^<{]+)<\/h1>/);
      if (h1) {
        content = content.replace(h1[0], `<h1${h1[1]}>{t('pages:${namespace}.title', '${h1[2].trim()}')}</h1>`);
      } else {
        // Try PageLayout title
        const pl = content.match(/<PageLayout\s+title="([^"]+)"/);
        if (pl) {
          content = content.replace(pl[0], `<PageLayout title={t('pages:${namespace}.title', '${pl[1]}')}`);
        }
      }
    }
  }
  
  if (content.includes("t('")) {
    fs.writeFileSync(file, content);
    console.log('✅', path.basename(file));
    processed++;
  } else {
    console.log('⚠️  No t() added:', path.basename(file));
  }
}

console.log(`\n📊 Processed: ${processed}/21`);
