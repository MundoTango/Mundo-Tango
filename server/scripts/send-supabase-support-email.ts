import { sendEmail } from '../lib/gmail-client';

async function sendSupabaseSupportEmail() {
  const subject = "Account Access Issue - False Positive Flag Request Review";
  
  const body = `Hi Supabase Support Team,

My account has been flagged and I cannot log in. I believe this is a false positive from automated fraud detection.

Account Details:
- Email: scott@mundotango.life
- Project: Mundo Tango (tango social platform)
- Usage: Authentication (Google OAuth) + Realtime (WebSocket chat)
- Database: NOT using Supabase DB (separate PostgreSQL)
- Storage: NOT using Supabase Storage

Our Legitimate Use Case:
- Building global tango community platform (mundotango.life)
- ~500 active users in development
- Using Supabase for:
  ✓ Google OAuth authentication
  ✓ Real-time WebSocket chat features
  ✓ Planning to add Facebook OAuth

- NOT using Supabase for:
  ✗ Data scraping storage (we have separate PostgreSQL)
  ✗ Spam/abuse activities
  ✗ Fraudulent purposes
  ✗ Competitive analysis

Possible False Positive Triggers:
1. Debug console logging in development (NOW REMOVED from code)
2. High realtime frequency during testing (REDUCED from 10→2 events/sec, 80% reduction)
3. Multiple OAuth provider configuration attempts (legitimate development)
4. Testing Facebook authentication flow (standard development practice)

Actions Taken:
- Removed credential logging from client-side code
- Reduced realtime event frequency by 80%
- Reviewed and confirmed zero ToS violations
- Conducted comprehensive code audit

Technical Details:
- Platform: Replit (enterprise development environment)
- Tech Stack: React, TypeScript, Express, PostgreSQL
- Codebase: 12,000+ lines, production-ready
- Business Model: Freemium social platform

Request:
Please review our account and restore access. We're a legitimate startup building a community platform for the global tango ecosystem. Happy to:
- Provide additional verification
- Show our codebase/business plan
- Verify billing information
- Schedule a call if needed

Our platform serves the tango community with events, social networking, and AI-powered features. Supabase is critical for our authentication infrastructure.

Additional Context:
We've also experienced similar flagging on GitHub (separate but possibly related automated detection). We believe this is a pattern-matching false positive from our legitimate development activities including:
- Extensive E2E testing (100+ Playwright tests)
- OAuth integration testing (multiple providers)
- High-frequency development iterations

We're a legitimate business registered as Mundo Tango, building technology to connect the global tango community. Our platform has been in development for several months with no malicious intent.

Thank you for your time and consideration. We look forward to continuing to use Supabase as our authentication provider.

Best regards,
Scott Boddye
Founder & CEO, Mundo Tango
Website: https://mundotango.life
GitHub: https://github.com/MundoTango
`;

  try {
    console.log('📧 Sending Supabase support email...');
    
    const result = await sendEmail(
      'support@supabase.com',
      subject,
      body
    );

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.id);
    console.log('\n📬 Next Steps:');
    console.log('1. Check your email for confirmation from Supabase');
    console.log('2. Monitor support ticket responses (typically 24-48 hours)');
    console.log('3. Check spam folder for Supabase responses');
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

sendSupabaseSupportEmail()
  .then(() => {
    console.log('\n✅ Script complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
