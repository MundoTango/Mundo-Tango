#!/usr/bin/env tsx
// ============================================================================
// SEO META TAGS GENERATOR - Mundo Tango
// ============================================================================
// Generates SEO meta tags, OpenGraph, Twitter Cards for all pages
// Run: tsx scripts/seo-generator.ts
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';

interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogType: 'website' | 'article' | 'profile';
  image?: string;
}

const SEO_CONFIG: PageSEO[] = [
  // Public Pages
  {
    path: '/',
    title: 'Mundo Tango - Global Tango Community Platform',
    description: 'Connect with tango dancers, find events, discover teachers, and join the global tango community. Your complete platform for Argentine tango culture.',
    keywords: ['tango', 'argentine tango', 'tango community', 'milonga', 'tango events', 'tango social network'],
    ogType: 'website',
    image: '/og-home.jpg',
  },
  {
    path: '/login',
    title: 'Login - Mundo Tango',
    description: 'Sign in to your Mundo Tango account to connect with the global tango community.',
    keywords: ['tango login', 'sign in', 'tango account'],
    ogType: 'website',
  },
  {
    path: '/register',
    title: 'Join Mundo Tango - Create Account',
    description: 'Join thousands of tango dancers worldwide. Create your free account and start connecting with the tango community today.',
    keywords: ['join tango', 'sign up', 'tango registration', 'new account'],
    ogType: 'website',
  },
  {
    path: '/events',
    title: 'Tango Events Worldwide - Mundo Tango',
    description: 'Discover tango events, milongas, festivals, and workshops happening around the world. Find your next tango experience.',
    keywords: ['tango events', 'milonga', 'tango festival', 'tango workshop', 'tango marathon'],
    ogType: 'website',
    image: '/og-events.jpg',
  },
  {
    path: '/teachers',
    title: 'Find Tango Teachers & Instructors - Mundo Tango',
    description: 'Connect with experienced tango teachers and instructors worldwide. Find the perfect teacher for your skill level and style.',
    keywords: ['tango teacher', 'tango instructor', 'tango lessons', 'learn tango'],
    ogType: 'website',
    image: '/og-teachers.jpg',
  },
  {
    path: '/housing',
    title: 'Tango Housing Marketplace - Mundo Tango',
    description: 'Find accommodation for tango events and festivals. Connect with hosts in the tango community worldwide.',
    keywords: ['tango housing', 'tango accommodation', 'festival housing', 'tango homestay'],
    ogType: 'website',
    image: '/og-housing.jpg',
  },
  {
    path: '/feed',
    title: 'Community Feed - Mundo Tango',
    description: 'Stay updated with the latest from your tango community. Share experiences, photos, and connect with dancers worldwide.',
    keywords: ['tango feed', 'tango community', 'tango social', 'tango updates'],
    ogType: 'website',
  },
  {
    path: '/partners',
    title: 'Find Dance Partners - Mundo Tango',
    description: 'Find compatible dance partners based on skill level, style, and location. Connect with dancers for practice and social dancing.',
    keywords: ['dance partner', 'tango partner', 'find partner', 'practice partner'],
    ogType: 'website',
  },
  {
    path: '/talent',
    title: 'Talent Match - Connect Skills with Opportunities',
    description: 'Showcase your tango skills and connect with opportunities. Get matched with gigs, teaching positions, and performances.',
    keywords: ['tango talent', 'tango gigs', 'tango opportunities', 'dance work'],
    ogType: 'website',
  },
  {
    path: '/life-ceo',
    title: 'Life CEO - AI-Powered Life Management',
    description: 'Manage your tango journey and life goals with AI-powered insights. Track progress, set goals, and achieve your dreams.',
    keywords: ['life management', 'goal tracking', 'AI assistant', 'personal development'],
    ogType: 'website',
  },
];

function generateMetaTags(seo: PageSEO): string {
  return `
<!-- Primary Meta Tags -->
<title>${seo.title}</title>
<meta name="title" content="${seo.title}" />
<meta name="description" content="${seo.description}" />
<meta name="keywords" content="${seo.keywords.join(', ')}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${seo.ogType}" />
<meta property="og:url" content="https://mundotango.com${seo.path}" />
<meta property="og:title" content="${seo.title}" />
<meta property="og:description" content="${seo.description}" />
${seo.image ? `<meta property="og:image" content="https://mundotango.com${seo.image}" />` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://mundotango.com${seo.path}" />
<meta property="twitter:title" content="${seo.title}" />
<meta property="twitter:description" content="${seo.description}" />
${seo.image ? `<meta property="twitter:image" content="https://mundotango.com${seo.image}" />` : ''}

<!-- Additional Meta Tags -->
<meta name="robots" content="index, follow" />
<meta name="language" content="English" />
<meta name="revisit-after" content="7 days" />
<meta name="author" content="Mundo Tango" />
<link rel="canonical" href="https://mundotango.com${seo.path}" />
`;
}

function generateSitemap(): string {
  const urls = SEO_CONFIG.map(page => `
  <url>
    <loc>https://mundotango.com${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRobotsTxt(): string {
  return `# robots.txt for Mundo Tango
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /profile/settings
Disallow: /profile/delete-account

# Sitemap
Sitemap: https://mundotango.com/sitemap.xml

# Crawl-delay
Crawl-delay: 10
`;
}

function generateStructuredData(): string {
  return `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Mundo Tango",
  "url": "https://mundotango.com",
  "description": "Global platform connecting the tango community through events, social networking, and cultural exchange",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mundotango.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://facebook.com/mundotango",
    "https://instagram.com/mundotango",
    "https://twitter.com/mundotango"
  ]
}`;
}

async function main(): Promise<void> {
  console.log('🔍 Generating SEO Assets for Mundo Tango...\n');
  
  // Create SEO directory
  const seoDir = path.join(process.cwd(), 'public', 'seo');
  if (!fs.existsSync(seoDir)) {
    fs.mkdirSync(seoDir, { recursive: true });
  }
  
  // Generate sitemap.xml
  const sitemap = generateSitemap();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
  console.log('✅ Generated sitemap.xml');
  
  // Generate robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'robots.txt'), robotsTxt);
  console.log('✅ Generated robots.txt');
  
  // Generate structured data
  const structuredData = generateStructuredData();
  fs.writeFileSync(path.join(seoDir, 'structured-data.json'), structuredData);
  console.log('✅ Generated structured-data.json');
  
  // Generate meta tags for each page
  const metaTagsDoc = SEO_CONFIG.map(page => {
    return `## ${page.path}\n${generateMetaTags(page)}`;
  }).join('\n\n');
  
  fs.writeFileSync(path.join(seoDir, 'meta-tags.md'), metaTagsDoc);
  console.log('✅ Generated meta-tags.md');
  
  console.log('\n📊 SEO Summary:');
  console.log(`   Pages optimized: ${SEO_CONFIG.length}`);
  console.log(`   Sitemap URLs: ${SEO_CONFIG.length}`);
  console.log(`   Total keywords: ${SEO_CONFIG.reduce((acc, page) => acc + page.keywords.length, 0)}`);
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Add meta tags to each page component');
  console.log('   2. Generate Open Graph images (1200x630px)');
  console.log('   3. Submit sitemap to Google Search Console');
  console.log('   4. Set up Google Analytics & Tag Manager');
  console.log('   5. Configure canonical URLs');
  console.log('   6. Test with rich results tool');
  
  console.log('\n✅ SEO generation complete!');
}

main();
