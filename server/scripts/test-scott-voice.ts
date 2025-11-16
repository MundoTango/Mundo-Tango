/**
 * Test Script for Scott Boddye Voice Clone
 * 
 * This script tests the voice cloning integration by generating
 * sample audio using Scott's cloned voice.
 * 
 * Usage:
 *   1. Set SCOTT_VOICE_ID environment variable
 *   2. Run: tsx server/scripts/test-scott-voice.ts
 */

import { VoiceCloningService } from '../services/mrBlue/VoiceCloningService';
import { promises as fs } from 'fs';
import path from 'path';

const testTexts = [
  "Welcome to Mundo Tango! I'm Scott, and I'm excited to connect with the global tango community.",
  "Tango is more than just a dance – it's a way to connect with people, express yourself, and build meaningful relationships.",
  "Join me in creating the world's largest tango community, where dancers from every corner of the globe can share their passion.",
  "Let's make tango accessible to everyone, everywhere. Your journey starts here."
];

async function testScottVoice() {
  console.log('🎤 Scott Boddye Voice Clone Test\n');
  
  const service = new VoiceCloningService();
  
  // Check configuration
  const scottVoiceId = service.getScottVoiceId();
  const isConfigured = service.isScottVoiceConfigured();
  
  console.log('Configuration Status:');
  console.log(`- Scott Voice Configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);
  console.log(`- Voice ID: ${scottVoiceId || 'NOT SET'}\n`);
  
  if (!isConfigured) {
    console.error('❌ ERROR: SCOTT_VOICE_ID environment variable is not set');
    console.log('\nTo configure Scott\'s voice:');
    console.log('1. Create voice clone using the curl command in attached_assets/voice_training/SCOTT_VOICE_SETUP.md');
    console.log('2. Copy the voice_id from the response');
    console.log('3. Set environment variable: export SCOTT_VOICE_ID=<voice_id>');
    console.log('4. Restart the application');
    console.log('5. Run this test script again\n');
    process.exit(1);
  }
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'attached_assets', 'voice_training', 'test_outputs');
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('Generating test audio samples...\n');
  
  // Generate test samples
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    const filename = `scott_test_${i + 1}.mp3`;
    const outputPath = path.join(outputDir, filename);
    
    console.log(`[${i + 1}/${testTexts.length}] Generating: ${filename}`);
    console.log(`Text: "${text.substring(0, 50)}..."`);
    
    try {
      const result = await service.generateSpeechWithScott(text, {
        model_id: 'eleven_multilingual_v2',
        language: 'en',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true
        }
      });
      
      if (result.success && result.audio) {
        await fs.writeFile(outputPath, result.audio);
        console.log(`✅ Saved: ${filename} (${result.audio.length} bytes)`);
        console.log(`Using Scott's Voice: ${result.usingScottVoice ? '✅ Yes' : '❌ No (fallback)'}\n`);
      } else {
        console.error(`❌ Failed to generate ${filename}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error);
    }
  }
  
  console.log('\n✅ Test Complete!');
  console.log(`Output directory: ${outputDir}`);
  console.log('\nTo listen to the generated samples:');
  console.log(`ls -lh ${outputDir}/`);
}

// Run the test
testScottVoice().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
