#!/usr/bin/env tsx
/**
 * MB.MD Protocol v8.1 - Facebook Messenger Invitation Script
 * 
 * Purpose: Send Facebook Messenger invitation to Scott Boddye (sboddye)
 * Method: Uses production FacebookMessengerService with Playwright automation
 * Quality Standard: 95-99/100 (MB.MD Protocol v8.1)
 * 
 * Usage: tsx scripts/send-fb-invite.ts
 */

import { facebookMessengerService } from '../server/services/mrBlue/FacebookMessengerService';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

interface ExecutionResult {
  success: boolean;
  recipientName: string;
  messagesSent: number;
  error?: string;
  screenshotsPath?: string;
  timestamp: string;
}

async function sendFacebookInvite(): Promise<ExecutionResult> {
  const taskId = `fb-invite-${nanoid(8)}`;
  const recipientName = 'Scott Boddye';
  const recipientEmail = 'sboddye@gmail.com'; // Scott's email for messenger
  const userId = 15; // Super Admin (Level 3) - has god-level access
  const timestamp = new Date().toISOString();

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   MB.MD Protocol v8.1 - Facebook Messenger Automation        ║');
  console.log('║            ITERATION 5: Search-Based Approach                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Task ID:       ${taskId}`);
  console.log(`Recipient:     ${recipientName}`);
  console.log(`Email:         ${recipientEmail}`);
  console.log(`User ID:       ${userId}`);
  console.log(`Timestamp:     ${timestamp}`);
  console.log('');
  console.log('📚 LEARNING FROM FAILURES:');
  console.log('  Attempt 1-3: Search selectors failed');
  console.log('  Attempt 4-5: Direct URL navigation → session loss');
  console.log('  Attempt 6: Using SEARCH instead of direct URL');
  console.log('');

  try {
    // Execute the invitation using SEARCH approach (no direct URL)
    const result = await facebookMessengerService.sendInvitation(
      taskId,
      userId,
      recipientName,
      'mundo_tango_invite' // Use the Mundo Tango invitation template
      // NO username - will use search instead
    );

    // Save screenshots to file
    let screenshotsPath: string | undefined;
    if (result.screenshots && result.screenshots.length > 0) {
      const screenshotsDir = path.join(process.cwd(), 'logs', 'fb-automation');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const screenshotsFile = path.join(screenshotsDir, `${taskId}-screenshots.json`);
      fs.writeFileSync(screenshotsFile, JSON.stringify({
        taskId,
        recipientName,
        timestamp,
        screenshots: result.screenshots.map((s, idx) => ({
          step: s.step,
          action: s.action,
          imageFile: `${taskId}-step-${s.step}.png`
        }))
      }, null, 2));

      // Save individual screenshot images
      result.screenshots.forEach((screenshot) => {
        const imageFile = path.join(screenshotsDir, `${taskId}-step-${screenshot.step}.png`);
        const buffer = Buffer.from(screenshot.base64, 'base64');
        fs.writeFileSync(imageFile, buffer);
      });

      screenshotsPath = screenshotsFile;
      console.log(`📸 Screenshots saved: ${screenshotsPath}`);
      console.log(`📁 Image files: ${screenshotsDir}/`);
    }

    // Display results
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    EXECUTION RESULTS                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    if (result.success) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log(`Messages Sent:     ${result.messagesSent}`);
      console.log(`Recipients:        ${result.recipientNames.join(', ')}`);
      console.log(`Total Steps:       ${result.screenshots.length}`);
      console.log('');
      console.log('Message Template: Mundo Tango Invitation');
      console.log('Message Preview:');
      console.log('┌────────────────────────────────────────────────────────────┐');
      console.log('│ Hey Scott! 👋                                              │');
      console.log('│                                                            │');
      console.log('│ I\'d love to invite you to Mundo Tango, the global tango   │');
      console.log('│ community platform. We\'re connecting dancers worldwide,    │');
      console.log('│ sharing events, and celebrating our passion for tango.    │');
      console.log('│                                                            │');
      console.log('│ Join us at mundotango.life 💃🕺                            │');
      console.log('│                                                            │');
      console.log('│ Hope to see you there!                                    │');
      console.log('└────────────────────────────────────────────────────────────┘');
      console.log('');
    } else {
      console.log('❌ FAILED');
      console.log('');
      console.log(`Error: ${result.error}`);
      console.log('');
    }

    console.log('Automation Steps Executed:');
    result.screenshots.forEach((screenshot) => {
      const status = screenshot.action.toLowerCase().includes('error') ? '❌' : '✅';
      console.log(`  ${status} Step ${screenshot.step}: ${screenshot.action}`);
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    return {
      success: result.success,
      recipientName,
      messagesSent: result.messagesSent,
      error: result.error,
      screenshotsPath,
      timestamp
    };

  } catch (error: any) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║                    EXECUTION FAILED                          ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error(`❌ Error: ${error.message}`);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');

    return {
      success: false,
      recipientName,
      messagesSent: 0,
      error: error.message,
      timestamp
    };
  }
}

// Execute
sendFacebookInvite()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
