import { MrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

async function fixLogin() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] CRITICAL FIX: LOGIN SYSTEM\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-login-critical',
    description: 'FIX CRITICAL: Login returning "Invalid credentials" for all users including admin@mundotango.life',
    targetFiles: [
      'server/routes/auth-routes.ts'
    ],
    fixPlan: `Debug and fix login authentication:
1. Read auth-routes.ts to find the login endpoint
2. Check password comparison - it should use bcrypt.compare()
3. Check if user lookup is working (finding user by email)
4. Log the actual error to console for debugging
5. Ensure the password is being properly hashed/compared
6. The test credentials are: admin@mundotango.life / admin123

Common login issues:
- bcrypt.compare needs await
- Password might be stored incorrectly
- Email lookup might be case-sensitive
- Session not being created properly`,
    context: [
      'Users get "Invalid credentials" when trying to login',
      'This affects ALL users including admin',
      'Test credentials: admin@mundotango.life / admin123',
      'Check bcrypt password comparison',
      'Login endpoint is POST /api/auth/login'
    ]
  });
  
  console.log('\n🔵 [Mr Blue] Login Fix Result:', result.success ? '✅' : '❌');
  console.log('Files:', result.filesModified);
  
  return result;
}

fixLogin().catch(console.error);
