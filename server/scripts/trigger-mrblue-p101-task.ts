import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  // Task 1: Fix ProPageSettings API paths
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Fix ProPageSettings API paths\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-api-paths',
    description: 'Fix ProPageSettings.tsx to use correct API paths after routes were prefixed with /api/pro',
    targetFiles: ['client/src/pages/ProPageSettings.tsx'],
    fixPlan: `Update all API endpoints in ProPageSettings.tsx:
      1. Change '/api/pro-page/settings' to '/api/pro/settings' in queryKey and apiRequest calls
      2. Change '/api/pro-page/check-slug/' to '/api/pro/check-slug/' in the slug availability check
      3. Ensure the queryFn properly fetches from /api/pro/settings`,
    context: [
      'The pro-page-routes.ts was registered with app.use("/api/pro", proPageRoutes)',
      'Routes in pro-page-routes.ts use relative paths: /settings, /check-slug/:slug, /page/:slug',
      'Full API paths are now: /api/pro/settings, /api/pro/check-slug/:slug, /api/pro/page/:slug'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  
  return result;
}

triggerMrBlue().catch(console.error);
