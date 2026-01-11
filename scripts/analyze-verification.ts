import { db } from '../server/db';
import { users, emailVerificationTokens, emailQueue, emailLogs } from '../shared/schema';
import { sql, eq, gt, count, and } from 'drizzle-orm';

async function analyzeVerification() {
  console.log('\n=== EMAIL VERIFICATION ANALYSIS ===\n');

  // 1. Verified vs Unverified users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userStats = await db.select({
    isVerified: users.isVerified,
    count: count()
  })
  .from(users)
  .where(gt(users.createdAt, thirtyDaysAgo))
  .groupBy(users.isVerified);

  console.log('1. USER VERIFICATION STATUS (Last 30 days):');
  userStats.forEach(s => console.log(`   isVerified=${s.isVerified}: ${s.count} users`));

  // 2. Pending verification tokens
  const pendingTokens = await db.select({
    total: count(),
  }).from(emailVerificationTokens);

  const expiredTokens = await db.select({
    expired: count()
  })
  .from(emailVerificationTokens)
  .where(sql`${emailVerificationTokens.expiresAt} < NOW()`);

  console.log('\n2. PENDING VERIFICATION TOKENS:');
  console.log(`   Total pending: ${pendingTokens[0]?.total || 0}`);
  console.log(`   Expired: ${expiredTokens[0]?.expired || 0}`);

  // 3. Email queue status
  const queueStats = await db.select({
    status: emailQueue.status,
    count: count()
  })
  .from(emailQueue)
  .groupBy(emailQueue.status);

  console.log('\n3. EMAIL QUEUE STATUS:');
  if (queueStats.length === 0) {
    console.log('   No emails in queue');
  } else {
    queueStats.forEach(s => console.log(`   ${s.status}: ${s.count}`));
  }

  // 4. Failed emails with errors
  const failedEmails = await db.select({
    templateName: emailQueue.templateName,
    errorMessage: emailQueue.errorMessage,
    count: count()
  })
  .from(emailQueue)
  .where(eq(emailQueue.status, 'failed'))
  .groupBy(emailQueue.templateName, emailQueue.errorMessage)
  .limit(10);

  console.log('\n4. FAILED EMAILS (sample):');
  if (failedEmails.length === 0) {
    console.log('   No failed emails in queue');
  } else {
    failedEmails.forEach(e => console.log(`   ${e.templateName}: ${e.errorMessage} (${e.count}x)`));
  }

  // 5. Recent unverified users with email domains
  const unverifiedUsers = await db.select({
    id: users.id,
    email: users.email,
    createdAt: users.createdAt
  })
  .from(users)
  .where(and(
    eq(users.isVerified, false),
    gt(users.createdAt, thirtyDaysAgo)
  ))
  .orderBy(sql`${users.createdAt} DESC`)
  .limit(20);

  console.log('\n5. RECENT UNVERIFIED USERS (last 20):');
  if (unverifiedUsers.length === 0) {
    console.log('   No unverified users in last 30 days');
  } else {
    // Group by domain
    const domainCounts: Record<string, number> = {};
    unverifiedUsers.forEach(u => {
      const domain = u.email.split('@')[1];
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      console.log(`   ID:${u.id} | ${domain} | ${u.createdAt?.toISOString().split('T')[0]}`);
    });
    console.log('\n   Domains breakdown:');
    Object.entries(domainCounts).sort((a,b) => b[1] - a[1]).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count}`);
    });
  }

  // 6. Email logs for verification
  const verificationLogs = await db.select({
    emailType: emailLogs.emailType,
    count: count()
  })
  .from(emailLogs)
  .groupBy(emailLogs.emailType)
  .limit(10);

  console.log('\n6. EMAIL LOGS BY TYPE:');
  if (verificationLogs.length === 0) {
    console.log('   No email logs found');
  } else {
    verificationLogs.forEach(l => console.log(`   ${l.emailType}: ${l.count}`));
  }

  // 7. Total user counts
  const totalUsers = await db.select({ count: count() }).from(users);
  const verifiedTotal = await db.select({ count: count() }).from(users).where(eq(users.isVerified, true));

  console.log('\n7. OVERALL STATS:');
  console.log(`   Total users: ${totalUsers[0]?.count || 0}`);
  console.log(`   Verified: ${verifiedTotal[0]?.count || 0}`);
  console.log(`   Verification rate: ${((verifiedTotal[0]?.count || 0) / (totalUsers[0]?.count || 1) * 100).toFixed(1)}%`);

  process.exit(0);
}

analyzeVerification().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
