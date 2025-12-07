/**
 * MB.MD v9.9.3 - Stripe Product Seeding Script
 * Creates subscription tiers and add-ons in Stripe
 * 
 * Usage: npx tsx scripts/seed-stripe-products.ts
 * 
 * Products will sync to database via stripe-replit-sync webhooks
 */

import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return new Stripe(connectionSettings.settings.secret, {
    apiVersion: '2024-11-20.acacia',
  });
}

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: {
    nickname: string;
    unit_amount: number;
    currency: string;
    recurring?: { interval: 'month' | 'year' };
  }[];
}

const SUBSCRIPTION_TIERS: ProductConfig[] = [
  {
    name: 'Mundo Tango Free',
    description: 'Get started with the tango community - basic features included',
    metadata: {
      tier: 'free',
      order: '0',
      features: JSON.stringify([
        'Community features',
        'Basic event browsing',
        'Profile creation',
        'Up to 5 event RSVPs per month',
      ]),
    },
    prices: [
      {
        nickname: 'Free Monthly',
        unit_amount: 0,
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
  {
    name: 'Mundo Tango Pro',
    description: 'For active dancers - unlimited access and enhanced features',
    metadata: {
      tier: 'pro',
      order: '1',
      features: JSON.stringify([
        'Unlimited event RSVPs',
        'Advanced matching algorithm',
        'Unlimited event creation',
        'Group participation',
        'Direct messaging',
        'Analytics dashboard',
        'Priority support',
      ]),
    },
    prices: [
      {
        nickname: 'Pro Monthly',
        unit_amount: 2900, // $29.00
        currency: 'usd',
        recurring: { interval: 'month' },
      },
      {
        nickname: 'Pro Yearly',
        unit_amount: 29000, // $290.00 (save 2 months)
        currency: 'usd',
        recurring: { interval: 'year' },
      },
    ],
  },
  {
    name: 'Mundo Tango Business',
    description: 'For organizers and venues - professional tools for your tango business',
    metadata: {
      tier: 'business',
      order: '2',
      features: JSON.stringify([
        'Everything in Pro',
        'Mr. Blue AI Assistant',
        'Custom profile badges',
        'Early access to features',
        'Advanced analytics',
        'Promotional tools',
        'Featured listings',
        'Priority event placement',
      ]),
    },
    prices: [
      {
        nickname: 'Business Monthly',
        unit_amount: 7900, // $79.00
        currency: 'usd',
        recurring: { interval: 'month' },
      },
      {
        nickname: 'Business Yearly',
        unit_amount: 79000, // $790.00 (save 2 months)
        currency: 'usd',
        recurring: { interval: 'year' },
      },
    ],
  },
  {
    name: 'Mundo Tango Enterprise',
    description: 'Custom solutions for large organizations and festival organizers',
    metadata: {
      tier: 'enterprise',
      order: '3',
      features: JSON.stringify([
        'Everything in Business',
        'Dedicated account manager',
        'Custom branding options',
        'API access',
        'White-label options',
        'Custom integrations',
        'SLA guarantee',
        'Unlimited everything',
      ]),
    },
    prices: [
      {
        nickname: 'Enterprise Monthly',
        unit_amount: 29900, // $299.00 - contact for custom
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
];

const ADDONS: ProductConfig[] = [
  {
    name: 'Featured Event Listing',
    description: 'Get your event featured at the top of search results for 7 days',
    metadata: {
      type: 'addon',
      category: 'promotion',
      duration: '7_days',
    },
    prices: [
      {
        nickname: 'Featured Listing - 7 Days',
        unit_amount: 1499, // $14.99
        currency: 'usd',
      },
      {
        nickname: 'Featured Listing - 30 Days',
        unit_amount: 4999, // $49.99
        currency: 'usd',
      },
    ],
  },
  {
    name: 'Profile Boost',
    description: 'Increase your profile visibility to potential dance partners',
    metadata: {
      type: 'addon',
      category: 'promotion',
    },
    prices: [
      {
        nickname: 'Profile Boost - Weekly',
        unit_amount: 999, // $9.99
        currency: 'usd',
      },
      {
        nickname: 'Profile Boost - Monthly',
        unit_amount: 2999, // $29.99
        currency: 'usd',
      },
    ],
  },
  {
    name: 'Additional Storage',
    description: 'Extra storage for photos and videos - 50GB',
    metadata: {
      type: 'addon',
      category: 'storage',
      amount: '50gb',
    },
    prices: [
      {
        nickname: 'Storage 50GB Monthly',
        unit_amount: 499, // $4.99
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
  {
    name: 'Priority Matching',
    description: 'Get matched first with compatible dance partners',
    metadata: {
      type: 'addon',
      category: 'matching',
    },
    prices: [
      {
        nickname: 'Priority Matching Monthly',
        unit_amount: 999, // $9.99
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
  {
    name: 'Event Analytics Pack',
    description: 'Detailed analytics and insights for your events',
    metadata: {
      type: 'addon',
      category: 'analytics',
    },
    prices: [
      {
        nickname: 'Event Analytics Monthly',
        unit_amount: 1999, // $19.99
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
];

async function seedProducts() {
  console.log('🚀 MB.MD v9.9.3 - Seeding Stripe Products...\n');
  
  const stripe = await getStripeClient();
  
  const createdProducts: { name: string; productId: string; priceIds: string[] }[] = [];
  
  // Create subscription tiers
  console.log('📦 Creating Subscription Tiers...');
  for (const tier of SUBSCRIPTION_TIERS) {
    // Check if product already exists
    const existing = await stripe.products.search({ 
      query: `name:'${tier.name}'` 
    });
    
    if (existing.data.length > 0) {
      console.log(`  ⏭️  ${tier.name} already exists (${existing.data[0].id})`);
      
      // Get existing prices
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
      createdProducts.push({
        name: tier.name,
        productId: existing.data[0].id,
        priceIds: prices.data.map(p => p.id),
      });
      continue;
    }
    
    // Create product
    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: tier.metadata,
    });
    console.log(`  ✅ Created ${tier.name} (${product.id})`);
    
    // Create prices for the product
    const priceIds: string[] = [];
    for (const priceConfig of tier.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        nickname: priceConfig.nickname,
        unit_amount: priceConfig.unit_amount,
        currency: priceConfig.currency,
        ...(priceConfig.recurring && { recurring: priceConfig.recurring }),
      });
      priceIds.push(price.id);
      console.log(`     💰 Price: ${priceConfig.nickname} - $${priceConfig.unit_amount / 100} (${price.id})`);
    }
    
    createdProducts.push({ name: tier.name, productId: product.id, priceIds });
  }
  
  // Create add-ons
  console.log('\n🎁 Creating Add-ons...');
  for (const addon of ADDONS) {
    // Check if product already exists
    const existing = await stripe.products.search({ 
      query: `name:'${addon.name}'` 
    });
    
    if (existing.data.length > 0) {
      console.log(`  ⏭️  ${addon.name} already exists (${existing.data[0].id})`);
      
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
      createdProducts.push({
        name: addon.name,
        productId: existing.data[0].id,
        priceIds: prices.data.map(p => p.id),
      });
      continue;
    }
    
    // Create product
    const product = await stripe.products.create({
      name: addon.name,
      description: addon.description,
      metadata: addon.metadata,
    });
    console.log(`  ✅ Created ${addon.name} (${product.id})`);
    
    // Create prices
    const priceIds: string[] = [];
    for (const priceConfig of addon.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        nickname: priceConfig.nickname,
        unit_amount: priceConfig.unit_amount,
        currency: priceConfig.currency,
        ...(priceConfig.recurring && { recurring: priceConfig.recurring }),
      });
      priceIds.push(price.id);
      console.log(`     💰 Price: ${priceConfig.nickname} - $${priceConfig.unit_amount / 100} (${price.id})`);
    }
    
    createdProducts.push({ name: addon.name, productId: product.id, priceIds });
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY - Copy these Price IDs to environment variables:\n');
  
  const proProduct = createdProducts.find(p => p.name === 'Mundo Tango Pro');
  const businessProduct = createdProducts.find(p => p.name === 'Mundo Tango Business');
  const freeProduct = createdProducts.find(p => p.name === 'Mundo Tango Free');
  
  console.log('Subscription Price IDs:');
  if (freeProduct) console.log(`  STRIPE_PRICE_FREE_MONTHLY=${freeProduct.priceIds[0]}`);
  if (proProduct) console.log(`  STRIPE_PRICE_PRO_MONTHLY=${proProduct.priceIds[0]}`);
  if (businessProduct) console.log(`  STRIPE_PRICE_BUSINESS_MONTHLY=${businessProduct.priceIds[0]}`);
  
  console.log('\nAll Products Created:');
  for (const product of createdProducts) {
    console.log(`  ${product.name}: ${product.productId}`);
    for (const priceId of product.priceIds) {
      console.log(`    - ${priceId}`);
    }
  }
  
  console.log('\n✅ Done! Stripe webhooks will sync these to the database.');
}

seedProducts().catch(console.error);
