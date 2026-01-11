# Claude Code Slack Bot

Bidirectional communication with Claude Code via Slack.

## ⚠️ IMPORTANT: Regenerate Your Secrets!

Your Slack credentials were exposed. Go to https://api.slack.com/apps and regenerate:
- Client Secret
- Signing Secret

## Setup

### 1. Configure Slack App

Go to https://api.slack.com/apps → Your App:

**OAuth & Permissions → Bot Token Scopes:**
- `chat:write`
- `app_mentions:read`
- `channels:history`
- `groups:history`
- `im:history`
- `mpim:history`

**Event Subscriptions → Subscribe to bot events:**
- `app_mention`
- `message.channels`
- `message.groups`
- `message.im`
- `message.mpim`

**Slash Commands (optional):**
- Command: `/claude`
- Request URL: `https://your-server.com/slack/events`

### 2. Add Environment Variables

```bash
# Add to .env (never commit this!)
SLACK_BOT_TOKEN=xoxb-your-regenerated-token
SLACK_SIGNING_SECRET=your-regenerated-secret
ANTHROPIC_API_KEY=your-anthropic-key
```

### 3. Run the Bot

```bash
npx tsx server/integrations/slack-bot/claude-slack-bot.ts
```

### 4. Expose to Internet (for development)

```bash
# Using ngrok
ngrok http 3001

# Then update your Slack app's Request URL to:
# https://your-ngrok-url.ngrok.io/slack/events
```

## Usage

| Method | Example |
|--------|---------|
| DM the bot | Send any message directly to the bot |
| @mention | `@claude-bot read package.json` |
| Slash command | `/claude what files handle auth?` |

## Features

- ✅ Direct messages
- ✅ Channel mentions
- ✅ Slash commands
- ✅ Thread replies
- ✅ Long message truncation
- ✅ Error handling
