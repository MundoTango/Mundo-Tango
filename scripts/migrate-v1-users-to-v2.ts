#!/usr/bin/env npx ts-node
/**
 * Migration Script: Copy REMAINING users from V1 to V2 (with fixed JSON handling)
 */

import { Pool } from 'pg';

const v1Pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0hTdK7EDPXUf@ep-silent-poetry-ahtqg08z.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

const v2Pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_QOqLKFGd79BM@ep-round-sun-aexgbpo8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function migrateRemainingUsers(): Promise<void> {
  console.log('🚀 Starting V1 → V2 Remaining User Migration (Fixed JSON)...\n');
  
  try {
    // Get real users from V1 (not discovered ones)
    console.log('📥 Fetching real users from V1...');
    const v1Users = await v1Pool.query(`
      SELECT id, name, username, email, password, mobile_no, profile_image, background_image,
             bio, first_name, last_name, country, city, facebook_url, is_verified, is_active,
             suspended, device_type, device_token, api_token, replit_id, nickname, primary_language,
             languages, tango_roles, 
             tango_role_experience::text as tango_role_experience_text,
             leader_level, follower_level, years_of_dancing, tango_start_year, state, 
             country_code, state_code, form_status, is_onboarding_complete, code_of_conduct_accepted, 
             occupation, terms_accepted, stripe_customer_id, stripe_subscription_id, 
             subscription_status, subscription_tier, created_at, updated_at, two_factor_enabled, 
             last_login_at, last_login_ip, role, waitlist
      FROM users 
      WHERE email NOT LIKE '%discovered%'
      ORDER BY id
    `);
    
    console.log(`✅ Found ${v1Users.rows.length} real users\n`);
    
    // Check existing users in V2
    const v2Emails = await v2Pool.query(`SELECT email FROM users`);
    const existingEmails = new Set(v2Emails.rows.map(r => r.email.toLowerCase()));
    
    // Filter out duplicates
    const usersToMigrate = v1Users.rows.filter(u => !existingEmails.has(u.email.toLowerCase()));
    console.log(`📋 Remaining to migrate: ${usersToMigrate.length}\n`);
    
    let migrated = 0; let errors = 0;
    
    for (const user of usersToMigrate) {
      try {
        // Parse JSON safely
        let tangoRoleExp = null;
        if (user.tango_role_experience_text && user.tango_role_experience_text !== 'null') {
          try {
            tangoRoleExp = JSON.parse(user.tango_role_experience_text);
          } catch { tangoRoleExp = null; }
        }
        
        await v2Pool.query(`
          INSERT INTO users (
            name, username, email, password, mobile_no, profile_image, background_image,
            bio, first_name, last_name, country, city, facebook_url, is_verified, is_active,
            suspended, device_type, device_token, api_token, replit_id, nickname, primary_language,
            languages, tango_roles, tango_role_experience, leader_level, follower_level,
            years_of_dancing, tango_start_year, state, country_code, state_code, form_status,
            is_onboarding_complete, code_of_conduct_accepted, occupation, terms_accepted,
            stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier,
            created_at, updated_at, two_factor_enabled, last_login_at, last_login_ip, role, waitlist
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48)
        `, [
          user.name, user.username, user.email, user.password, user.mobile_no, user.profile_image,
          user.background_image, user.bio, user.first_name, user.last_name, user.country, user.city,
          user.facebook_url, user.is_verified ?? false, user.is_active ?? true, user.suspended ?? false,
          user.device_type, user.device_token, user.api_token, user.replit_id, user.nickname, 
          user.primary_language, user.languages, user.tango_roles, 
          tangoRoleExp ? JSON.stringify(tangoRoleExp) : null,
          user.leader_level ?? 0, user.follower_level ?? 0, user.years_of_dancing ?? 0,
          user.tango_start_year, user.state, user.country_code, user.state_code, user.form_status ?? 0,
          user.is_onboarding_complete ?? false, user.code_of_conduct_accepted ?? false, user.occupation,
          user.terms_accepted ?? false, user.stripe_customer_id, user.stripe_subscription_id,
          user.subscription_status, user.subscription_tier ?? 'free', user.created_at, user.updated_at,
          user.two_factor_enabled ?? false, user.last_login_at, user.last_login_ip, user.role ?? 'user',
          user.waitlist ?? false
        ]);
        
        migrated++;
        console.log(`   ✓ ${user.email} (${user.name}) - ${user.role}`);
      } catch (err: any) {
        errors++;
        console.error(`   ✗ ${user.email} - ${err.message}`);
      }
    }
    
    console.log(`\n🎉 Migration Complete: ✅ ${migrated} | ❌ ${errors}`);
    
  } finally {
    await v1Pool.end();
    await v2Pool.end();
  }
}

migrateRemainingUsers().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
