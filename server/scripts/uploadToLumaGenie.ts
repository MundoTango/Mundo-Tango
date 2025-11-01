#!/usr/bin/env tsx
/**
 * MB.MD Protocol: Helper script to prepare reference photos for Luma Genie
 * 
 * Since Luma Genie web interface requires manual upload, this script:
 * 1. Identifies the best reference photos
 * 2. Provides upload instructions
 * 3. Generates optimized prompt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🎨 MB.MD Protocol: Luma Genie Reference Photo Preparation');
  console.log('='.repeat(70));
  
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  
  // Find all Mr. Blue reference photos
  const allImages = fs.readdirSync(assetsDir)
    .filter(f => f.match(/\.(png|jpg|jpeg)$/i))
    .map(filename => {
      const filepath = path.join(assetsDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        filepath,
        size: stats.size,
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
      };
    })
    .sort((a, b) => b.size - a.size); // Sort by size (higher quality first)
  
  console.log(`\n📸 Found ${allImages.length} reference photos\n`);
  
  // Select best 5 photos (largest = highest quality)
  const bestPhotos = allImages.slice(0, 5);
  
  console.log('🏆 TOP 5 RECOMMENDED PHOTOS FOR LUMA GENIE:\n');
  bestPhotos.forEach((photo, i) => {
    console.log(`   ${i + 1}. ${photo.filename} (${photo.sizeMB} MB)`);
  });
  
  console.log('\n📋 UPLOAD INSTRUCTIONS:\n');
  console.log('   1. Go to: https://lumalabs.ai/genie');
  console.log('   2. Click "Upload Reference Images"');
  console.log('   3. Upload these files from attached_assets/:');
  bestPhotos.forEach((photo, i) => {
    console.log(`      ✓ ${photo.filename}`);
  });
  
  console.log('\n✨ OPTIMIZED PROMPT:\n');
  const prompt = `Professional AI companion character for tango community platform, bright turquoise cyan mohawk hairstyle with shaved sides, silver and turquoise jewelry (bracelets, rings, necklaces), teal floral patterned blazer, warm medium skin tone, friendly confident smile, Pixar Disney animation quality, smooth textures, vibrant colors, cinematic lighting, full body character, standing three-quarter view, optimized for 3D web avatar`;
  
  console.log(`   "${prompt}"`);
  
  console.log('\n⚙️ GENERATION SETTINGS:\n');
  console.log('   • Format: GLB (binary GLTF)');
  console.log('   • Quality: HD Upscale (if available)');
  console.log('   • Generation time: ~10-30 seconds');
  
  console.log('\n💾 AFTER GENERATION:\n');
  console.log('   1. Download the GLB file');
  console.log('   2. Rename to: mr-blue-avatar.glb');
  console.log('   3. Move to: client/public/models/mr-blue-avatar.glb');
  console.log('   4. Restart app - avatar will auto-load!\n');
  
  console.log('🎯 ALTERNATIVE: Text-Only Generation\n');
  console.log('   If you prefer not to upload photos, use this prompt:\n');
  const textOnlyPrompt = `Pixar-style 3D character avatar, professional male AI companion, bright turquoise cyan spiked mohawk hairstyle, silver turquoise jewelry, teal patterned blazer, medium skin tone, friendly smile, full body, standing confident, Disney animation quality`;
  console.log(`   "${textOnlyPrompt}"\n`);
  
  console.log('✅ Ready to generate at: https://lumalabs.ai/genie\n');
}

main().catch(console.error);
