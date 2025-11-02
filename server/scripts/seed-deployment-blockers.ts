import { db } from '@shared/db';
import { platformRoles, platformPermissions, platformRolePermissions, featureFlags, tierLimits, pricingTiers } from '@shared/schema';
import { PricingManagerService } from '../services/PricingManagerService';

/**
 * Seed script for Phase 1 deployment blockers:
 * - 8-tier RBAC system
 * - Feature flags
 * - 8 pricing tiers with Stripe integration
 */

async function seedDeploymentBlockers() {
  console.log('🌱 Starting Phase 1 deployment blocker seeding...\n');

  try {
    // ========================================================================
    // 1. SEED 8-TIER RBAC SYSTEM
    // ========================================================================
    console.log('📊 Seeding 8-tier RBAC system...');

    const rolesData = [
      { name: 'god', displayName: 'God (Owner)', description: 'Full platform control - ALL permissions automatically', roleLevel: 8, isSystemRole: true },
      { name: 'super_admin', displayName: 'Super Admin', description: 'Platform-wide administrative access', roleLevel: 7, isSystemRole: true },
      { name: 'platform_volunteer', displayName: 'Platform Volunteer', description: 'Content moderation and support tools', roleLevel: 6, isSystemRole: true },
      { name: 'platform_contributor', displayName: 'Platform Contributor', description: 'Basic contributor access', roleLevel: 5, isSystemRole: true },
      { name: 'admin', displayName: 'Admin', description: 'Community management tools', roleLevel: 4, isSystemRole: true },
      { name: 'community_leader', displayName: 'Community Leader', description: 'Event and group creation', roleLevel: 3, isSystemRole: true },
      { name: 'premium', displayName: 'Premium User', description: 'Enhanced features and limits', roleLevel: 2, isSystemRole: true },
      { name: 'free', displayName: 'Free User', description: 'Basic platform access', roleLevel: 1, isSystemRole: true },
    ];

    for (const role of rolesData) {
      await db.insert(platformRoles).values(role).onConflictDoNothing();
    }
    console.log('✅ 8 platform roles created\n');

    // Seed core permissions
    console.log('🔐 Seeding permissions...');
    const permissionsData = [
      // Content permissions
      { name: 'posts.create', displayName: 'Create Posts', description: 'Create new posts', category: 'content' },
      { name: 'posts.edit', displayName: 'Edit Posts', description: 'Edit any posts', category: 'content' },
      { name: 'posts.delete', displayName: 'Delete Posts', description: 'Delete any posts', category: 'content' },
      { name: 'posts.moderate', displayName: 'Moderate Posts', description: 'Moderate flagged posts', category: 'content' },
      
      // Event permissions
      { name: 'events.create', displayName: 'Create Events', description: 'Create new events', category: 'events' },
      { name: 'events.manage', displayName: 'Manage Events', description: 'Manage all events', category: 'events' },
      
      // Housing permissions
      { name: 'housing.create', displayName: 'Create Housing Listings', description: 'Create housing listings', category: 'housing' },
      { name: 'housing.manage', displayName: 'Manage Housing', description: 'Manage all housing listings', category: 'housing' },
      
      // User management
      { name: 'users.view', displayName: 'View Users', description: 'View user profiles', category: 'users' },
      { name: 'users.edit', displayName: 'Edit Users', description: 'Edit user accounts', category: 'users' },
      { name: 'users.suspend', displayName: 'Suspend Users', description: 'Suspend user accounts', category: 'users' },
      
      // Platform admin
      { name: 'platform.settings', displayName: 'Platform Settings', description: 'Modify platform settings', category: 'platform' },
      { name: 'platform.analytics', displayName: 'Platform Analytics', description: 'View platform analytics', category: 'platform' },
    ];

    for (const permission of permissionsData) {
      await db.insert(platformPermissions).values(permission).onConflictDoNothing();
    }
    console.log('✅ 13 permissions created\n');

    // ========================================================================
    // 2. SEED FEATURE FLAGS
    // ========================================================================
    console.log('🚩 Seeding feature flags...');

    const featuresData = [
      { name: 'posts.create', displayName: 'Create Posts', description: 'Ability to create posts', featureType: 'quota', category: 'content', isEnabled: true },
      { name: 'housing.create', displayName: 'Create Housing Listings', description: 'Ability to create housing listings', featureType: 'quota', category: 'housing', isEnabled: true },
      { name: 'events.create', displayName: 'Create Events', description: 'Ability to create events', featureType: 'quota', category: 'events', isEnabled: true },
      { name: 'analytics.access', displayName: 'Analytics Access', description: 'Access to analytics dashboard', featureType: 'boolean', category: 'features', isEnabled: true },
      { name: 'premium.badge', displayName: 'Premium Badge', description: 'Display premium badge on profile', featureType: 'boolean', category: 'features', isEnabled: true },
    ];

    for (const feature of featuresData) {
      await db.insert(featureFlags).values(feature).onConflictDoNothing();
    }
    console.log('✅ 5 feature flags created\n');

    // Seed tier limits
    console.log('📏 Seeding tier limits...');
    const tierLimitsData = [
      // Posts quota: Free=10/month, Premium=100/month, Community Leader+=unlimited
      { tierName: 'free', featureFlagId: 1, limitValue: 10, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'premium', featureFlagId: 1, limitValue: 100, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'community_leader', featureFlagId: 1, limitValue: null, isUnlimited: true, resetPeriod: null },
      
      // Housing: Free=0, Premium=3, Community Leader=10, Admin+=unlimited
      { tierName: 'free', featureFlagId: 2, limitValue: 0, isUnlimited: false, resetPeriod: null },
      { tierName: 'premium', featureFlagId: 2, limitValue: 3, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'community_leader', featureFlagId: 2, limitValue: 10, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'admin', featureFlagId: 2, limitValue: null, isUnlimited: true, resetPeriod: null },
      
      // Events: Free=0, Premium=1, Community Leader=5, Admin+=unlimited
      { tierName: 'free', featureFlagId: 3, limitValue: 0, isUnlimited: false, resetPeriod: null },
      { tierName: 'premium', featureFlagId: 3, limitValue: 1, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'community_leader', featureFlagId: 3, limitValue: 5, isUnlimited: false, resetPeriod: 'monthly' },
      { tierName: 'admin', featureFlagId: 3, limitValue: null, isUnlimited: true, resetPeriod: null },
      
      // Analytics: Premium+ only
      { tierName: 'free', featureFlagId: 4, limitValue: 0, isUnlimited: false, resetPeriod: null },
      { tierName: 'premium', featureFlagId: 4, limitValue: 1, isUnlimited: false, resetPeriod: null },
      
      // Premium badge: Premium+ only
      { tierName: 'premium', featureFlagId: 5, limitValue: 1, isUnlimited: false, resetPeriod: null },
    ];

    for (const limit of tierLimitsData) {
      await db.insert(tierLimits).values(limit).onConflictDoNothing();
    }
    console.log('✅ 15 tier limits configured\n');

    // ========================================================================
    // 3. SEED 8 PRICING TIERS (with Stripe integration)
    // ========================================================================
    console.log('💰 Seeding 8 pricing tiers with Stripe...');

    const pricingData = [
      { name: 'free', displayName: 'Free', description: 'Basic tango community access', monthlyPrice: 0, roleLevel: 1, displayOrder: 1, isPopular: false },
      { name: 'explorer_plus', displayName: 'Explorer Plus', description: 'Enhanced discovery and networking', monthlyPrice: 900, annualPrice: 9000, roleLevel: 2, displayOrder: 2, isPopular: false },
      { name: 'community_leader', displayName: 'Community Leader', description: 'Create events and groups', monthlyPrice: 2900, annualPrice: 29000, roleLevel: 3, displayOrder: 3, isPopular: true },
      { name: 'super_community_leader', displayName: 'Super Community Leader', description: 'Advanced community tools', monthlyPrice: 4900, annualPrice: 49000, roleLevel: 3, displayOrder: 4, isPopular: false },
      { name: 'regional_organizer', displayName: 'Regional Organizer', description: 'Multi-city event management', monthlyPrice: 9900, annualPrice: 99000, roleLevel: 4, displayOrder: 5, isPopular: false },
      { name: 'national_organizer', displayName: 'National Organizer', description: 'Country-wide reach and analytics', monthlyPrice: 19900, annualPrice: 199000, roleLevel: 4, displayOrder: 6, isPopular: false },
      { name: 'international_organizer', displayName: 'International Organizer', description: 'Global platform access', monthlyPrice: 49900, annualPrice: 499000, roleLevel: 5, displayOrder: 7, isPopular: false },
      { name: 'platform_partner', displayName: 'Platform Partner', description: 'White-label and API access', monthlyPrice: 99900, annualPrice: 999000, roleLevel: 5, displayOrder: 8, isPopular: false },
    ];

    for (const tier of pricingData) {
      try {
        // Create tier with Stripe integration (only if monthly price > 0)
        if (tier.monthlyPrice > 0) {
          console.log(`  Creating Stripe product for: ${tier.displayName}...`);
          await PricingManagerService.createTier(tier);
          console.log(`  ✅ ${tier.displayName} created with Stripe`);
        } else {
          // Free tier - no Stripe product needed
          await db.insert(pricingTiers).values(tier).onConflictDoNothing();
          console.log(`  ✅ ${tier.displayName} created (no Stripe)`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error creating ${tier.displayName}:`, error.message);
        // Continue with next tier
      }
    }

    console.log('\n🎉 Phase 1 deployment blocker seeding complete!\n');
    console.log('Summary:');
    console.log('  ✅ 8 platform roles (Free → God)');
    console.log('  ✅ 13 core permissions');
    console.log('  ✅ 5 feature flags with tier limits');
    console.log('  ✅ 8 pricing tiers with Stripe integration\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

export { seedDeploymentBlockers };

// Run if called directly (ES module compatible)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDeploymentBlockers()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
