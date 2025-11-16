/**
 * Script to train Scott Boddye's voice on ElevenLabs
 * Run with: tsx scripts/train-scott-voice.ts
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function trainScottVoice() {
  console.log('🎤 Starting Scott Boddye voice training...\n');
  
  // Check if API key is configured
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in environment');
    process.exit(1);
  }

  // Path to processed samples
  const samplesDir = path.join(process.cwd(), 'attached_assets', 'voice_samples', 'scott_boddye', 'processed');
  
  // Get all sample files
  const sampleFiles = fs.readdirSync(samplesDir)
    .filter(file => file.endsWith('.mp3'))
    .map(file => path.join(samplesDir, file));

  console.log(`📁 Found ${sampleFiles.length} voice samples:`);
  sampleFiles.forEach((file, i) => {
    const stats = fs.statSync(file);
    console.log(`   ${i + 1}. ${path.basename(file)} (${(stats.size / 1024).toFixed(0)}KB)`);
  });
  console.log('');

  try {
    // Create voice on ElevenLabs
    const formData = new FormData();
    formData.append('name', 'Scott Boddye - Mundo Tango');
    formData.append('description', 'Professional tango instructor, warm conversational tone from Mundo Tango');
    formData.append('labels', JSON.stringify({
      accent: 'american',
      age: 'middle_aged', 
      gender: 'male',
      use_case: 'conversational',
      created_by: 'mundo_tango',
      instructor: 'scott_boddye'
    }));

    // Add audio files
    for (const filePath of sampleFiles) {
      const fileStream = fs.createReadStream(filePath);
      const fileName = path.basename(filePath);
      formData.append('files', fileStream, fileName);
    }

    console.log('📤 Uploading samples to ElevenLabs...');
    console.log('⏳ This may take 30-60 seconds...\n');
    
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      formData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const data = response.data;
    console.log('✅ Voice successfully cloned!');
    console.log('📋 Voice ID:', data.voice_id);
    console.log('\n🎯 Next steps:');
    console.log('   1. Save this voice ID to your configuration');
    console.log('   2. Test the voice with sample text');
    console.log('   3. Update Mr Blue to use this voice by default\n');

    // Save voice ID to a file
    const voiceIdFile = path.join(process.cwd(), 'attached_assets', 'voice_samples', 'scott_boddye', 'voice_id.txt');
    fs.writeFileSync(voiceIdFile, data.voice_id);
    console.log(`💾 Voice ID saved to: ${voiceIdFile}\n`);

    return data.voice_id;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ ElevenLabs API error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Training failed:', error.message);
    }
    throw error;
  }
}

// Run the training
trainScottVoice()
  .then(voiceId => {
    console.log('🎉 Training complete! Voice ID:', voiceId);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Training failed:', error);
    process.exit(1);
  });
