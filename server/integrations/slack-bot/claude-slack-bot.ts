/**
 * CLAUDE CODE SLACK BOT
 * Bidirectional communication with Claude Code via Slack
 * Uses Socket Mode - no public URL needed!
 *
 * Setup:
 * 1. Enable Socket Mode in Slack app settings
 * 2. Generate App-Level Token with connections:write scope
 * 3. Add SLACK_APP_TOKEN to .env
 * 4. Run: npx tsx server/integrations/slack-bot/claude-slack-bot.ts
 */

import 'dotenv/config';
import { App, LogLevel } from '@slack/bolt';
import { spawn } from 'child_process';

// Validate environment
const requiredEnvVars = ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'SLACK_APP_TOKEN'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('\nSetup steps:');
  console.error('1. Go to https://api.slack.com/apps → Your App');
  console.error('2. Enable Socket Mode (left sidebar)');
  console.error('3. Generate App-Level Token with "connections:write" scope');
  console.error('4. Add to .env:');
  console.error('   SLACK_APP_TOKEN=xapp-...');
  console.error('   SLACK_BOT_TOKEN=xoxb-...');
  console.error('   SLACK_SIGNING_SECRET=...');
  process.exit(1);
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
});

/**
 * Execute Claude Code CLI and get response
 */
async function askClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use full path to claude CLI
    const claudePath = process.env.CLAUDE_PATH || '/Users/scottboddye/.local/bin/claude';

    const claude = spawn(claudePath, ['--print', prompt, '--output-format', 'text'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}`,
      },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'], // Close stdin to prevent hanging
    });

    let output = '';
    let error = '';

    claude.stdout.on('data', (data) => { output += data.toString(); });
    claude.stderr.on('data', (data) => { error += data.toString(); });

    claude.on('close', (code) => {
      console.log(`[Claude] Exit code: ${code}, output: ${output.slice(0, 100)}, error: ${error.slice(0, 100)}`);
      if (code === 0 && output) {
        resolve(output.trim());
      } else if (output) {
        resolve(output.trim()); // Return output even on non-zero exit
      } else {
        reject(new Error(error || `Claude exited with code ${code}`));
      }
    });

    claude.on('error', (err) => {
      console.error('[Claude] Spawn error:', err);
      reject(err);
    });
  });
}

/**
 * Truncate long messages for Slack
 */
function truncate(text: string, max = 3000): string {
  return text.length <= max ? text : text.slice(0, max) + '\n\n_(truncated)_';
}

// Handle direct messages
app.message(async ({ message, say }) => {
  if ('bot_id' in message) return;
  const text = 'text' in message ? message.text : '';
  if (!text) return;

  console.log(`[Slack] Message: "${text.slice(0, 50)}..."`);

  try {
    await say('🤔 Thinking...');
    const response = await askClaude(text);
    await say(truncate(response));
  } catch (err: any) {
    console.error('[Slack] Error:', err);
    await say(`❌ ${err.message}`);
  }
});

// Handle @mentions
app.event('app_mention', async ({ event, say }) => {
  const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
  if (!text) {
    await say('Hi! Ask me anything about the codebase.');
    return;
  }

  console.log(`[Slack] Mention: "${text.slice(0, 50)}..."`);

  try {
    const response = await askClaude(text);
    await say({ text: truncate(response), thread_ts: event.ts });
  } catch (err: any) {
    await say({ text: `❌ ${err.message}`, thread_ts: event.ts });
  }
});

// Start
(async () => {
  await app.start();
  console.log('');
  console.log('🤖 Claude Code Slack Bot is running! (Socket Mode)');
  console.log('');
  console.log('You can now:');
  console.log('  • DM the bot directly');
  console.log('  • @mention the bot in any channel');
  console.log('');
})();
