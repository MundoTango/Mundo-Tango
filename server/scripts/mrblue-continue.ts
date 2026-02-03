import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function continueMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  // Fix missing sql import in messageController
  console.log('\n🔵 [Mr Blue] Fixing missing sql import...\n');
  
  const importFix = await executor.executeTask({
    bugId: 'p101-fix-sql-import',
    description: 'Add missing sql import to messageController.ts',
    targetFiles: ['server/controllers/messageController.ts'],
    fixPlan: `Add the missing sql import:
1. At line 2, after "import { db } from '../db';"
2. Add: import { sql } from 'drizzle-orm';
3. This is needed for the sql template tag used in getUnreadCount`,
    context: ['The sql template tag is used but not imported']
  });
  
  console.log('Import fix result:', importFix.success ? '✅' : '❌');
  
  // FIX #2: PRO PAGE PUBLIC ROUTE
  console.log('\n🔵 [Mr Blue] FIX #2: PRO PAGE PUBLIC ROUTE\n');
  
  const proPageResult = await executor.executeTask({
    bugId: 'p101-fix-pro-page-route',
    description: 'Add public route for Pro Pages so /p/:slug works (e.g., /p/scott)',
    targetFiles: ['client/src/App.tsx'],
    fixPlan: `Add Pro Page route to App.tsx:
1. Import ProPage component: import ProPage from "@/pages/ProPage"
2. Add route before the NotFound catch-all: <Route path="/p/:slug" component={ProPage} />
3. The route should be public (no auth required)
4. Make sure to place it BEFORE the NotFound route so it matches first`,
    context: [
      'ProPage.tsx already exists at client/src/pages/ProPage.tsx',
      'Currently /p/scott returns 404',
      'This is a public page for pro user profiles',
      'Use wouter Route component'
    ]
  });
  
  console.log('\n🔵 [Mr Blue] FIX #2 Result:', proPageResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Files modified:', proPageResult.filesModified);
  
  // FIX #6: LOGIN SYSTEM
  console.log('\n🔵 [Mr Blue] FIX #6: LOGIN SYSTEM\n');
  
  const loginResult = await executor.executeTask({
    bugId: 'p101-fix-login',
    description: 'Debug and fix the login system if there are any issues',
    targetFiles: [
      'server/routes/auth-routes.ts',
      'client/src/pages/LoginPage.tsx'
    ],
    fixPlan: `Check and fix login system:
1. Read auth-routes.ts to verify login endpoint works
2. Check for proper error handling
3. Verify JWT token generation
4. Check password comparison with bcrypt
5. Ensure proper session handling
6. Report any issues found`,
    context: [
      'User reports login issues',
      'Check /api/auth/login endpoint',
      'JWT tokens are used for auth'
    ]
  });
  
  console.log('\n🔵 [Mr Blue] FIX #6 Result:', loginResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Files modified:', loginResult.filesModified);
  
  return { importFix, proPageResult, loginResult };
}

continueMrBlue().catch(console.error);
