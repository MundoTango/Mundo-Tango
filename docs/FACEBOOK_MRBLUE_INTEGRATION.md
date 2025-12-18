# Facebook-Mr.Blue Integration

## Overview

This document describes the integration between Facebook Messenger and Mr. Blue (the AI assistant), enabling users to interact with Mr. Blue through Facebook Messenger while maintaining full conversation context and history.

## Architecture

```
Facebook Messenger
        |
        v
Webhook Endpoint (/webhooks/facebook)
        |
        v
FacebookWebhookService
        |
        v
FacebookMrBlueContextService
        |
        v
Mr. Blue API (/api/v1/mrblue/*)
        |
        v
Mr. Blue Agent (ChatComponent)
        |
        v
Response back to Facebook
```

## Core Services

### 1. FacebookWebhookService.ts
**Location**: `server/services/facebook/FacebookWebhookService.ts`
**Purpose**: Handles incoming webhook events from Facebook Messenger
**Key Methods**:
- `handleWebhook()` - Processes incoming Facebook webhook events
- `verifyWebhook()` - Verifies Facebook webhook signature
- Validates webhook security tokens

### 2. FacebookMrBlueContextService.ts
**Location**: `server/services/facebook/FacebookMrBlueContextService.ts`
**File Size**: 204 lines, 6.54 KB
**Purpose**: Core integration service that manages conversation context between Facebook and Mr. Blue
**Key Methods**:
- `getConversationContext(userId)` - Retrieves Facebook conversation history for a user
- `storeMessage()` - Stores incoming Facebook messages
- `formatContextForMrBlue()` - Formats Facebook context for Mr. Blue consumption
- `trackConversationState()` - Maintains conversation state across platforms

### 3. FacebookService.ts
**Location**: `server/services/facebook/FacebookService.ts`
**Purpose**: Core Facebook API interaction service
**Key Methods**:
- Send messages to Facebook users
- Manage Facebook page access tokens
- Handle Facebook API rate limiting

### 4. FacebookMessageQueueService.ts
**Location**: `server/services/facebook/FacebookMessageQueueService.ts`
**Purpose**: Manages message queuing and retry logic for Facebook API calls
**Features**:
- Message queuing for reliability
- Automatic retry on failures
- Rate limiting compliance

### 5. FacebookConversationService.ts
**Location**: `server/services/facebook/FacebookConversationService.ts`
**Purpose**: Manages conversation history and persistence
**Key Methods**:
- Store conversation messages
- Retrieve conversation history
- Track conversation metadata

### 6. FacebookUserService.ts
**Location**: `server/services/facebook/FacebookUserService.ts`
**Purpose**: Manages Facebook user data and profiles
**Key Methods**:
- Fetch Facebook user profiles
- Link Facebook users to MundoTango users
- Manage user preferences

### 7. FacebookPageService.ts
**Location**: `server/services/facebook/FacebookPageService.ts`
**Purpose**: Manages Facebook Page configuration and access
**Key Methods**:
- Manage page access tokens
- Configure page settings
- Handle page-level webhooks

### 8. FacebookAuthService.ts
**Location**: `server/services/facebook/FacebookAuthService.ts`
**Purpose**: Handles Facebook OAuth authentication flow
**Key Methods**:
- Authenticate users via Facebook
- Manage Facebook OAuth tokens
- Refresh access tokens

## API Endpoints

### GET /api/v1/mrblue/facebook-context/:userId
**Added**: Commit df18f71
**Purpose**: Retrieves Facebook Messenger conversation context for a user
**Parameters**:
- `userId` (path) - The MundoTango user ID
**Returns**:
```json
{
  "context": {
    "conversationHistory": [...],
    "userProfile": {...},
    "metadata": {...}
  }
}
```
**Error Responses**:
- `404` - User not found or no Facebook connection
- `500` - Server error

### POST /api/v1/mrblue/facebook-send
**Added**: Commit 43c866b
**Purpose**: Sends Mr. Blue AI responses back to Facebook Messenger
**Request Body**:
```json
{
  "facebookUserId": "string",
  "message": "string",
  "pageAccessToken": "string"
}
```
**Returns**:
```json
{
  "success": true,
  "messageId": "string"
}
```
**Error Responses**:
- `400` - Missing required fields
- `500` - Failed to send message

## Integration Flow

### Incoming Message Flow
1. User sends message via Facebook Messenger
2. Facebook calls webhook endpoint with message data
3. `FacebookWebhookService` validates and processes webhook
4. `FacebookMrBlueContextService` stores message and retrieves conversation context
5. Context is passed to Mr. Blue API endpoint
6. Mr. Blue processes message and generates response
7. Response is sent back to Facebook via `POST /facebook-send` endpoint
8. User receives response in Facebook Messenger

### Context Retrieval Flow
1. Mr. Blue needs Facebook conversation context
2. Calls `GET /facebook-context/:userId` endpoint
3. `MrblueController.getFacebookContext()` handles request
4. `FacebookMrBlueContextService.getConversationContext()` fetches data
5. Formatted context returned to Mr. Blue
6. Mr. Blue uses context to generate contextually aware responses

## Configuration

### Environment Variables Required
```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token
```

### Facebook App Setup
1. Create Facebook App in Meta Developers Console
2. Add Messenger product to app
3. Configure webhook endpoint: `https://yourdomain.com/webhooks/facebook`
4. Subscribe to messaging events:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
5. Generate and configure Page Access Token
6. Add webhook verify token to environment variables

## Controller Methods

### MrblueController.getFacebookContext()
**Added**: Commit df18f71
**Location**: `server/controllers/mrblueController.ts`
**Implementation**:
```typescript
export const getFacebookContext = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const context = await facebookMrBlueContextService.getConversationContext(userId);
    
    if (!context) {
      return res.status(404).json({ error: 'User not found or no Facebook connection' });
    }
    
    res.json({ context });
  } catch (error) {
    console.error('Error fetching Facebook context:', error);
    res.status(500).json({ error: 'Failed to fetch Facebook context' });
  }
};
```

### MrblueController.sendToFacebook()
**Added**: Commit df18f71
**Location**: `server/controllers/mrblueController.ts`
**Implementation**:
```typescript
export const sendToFacebook = async (req: Request, res: Response) => {
  try {
    const { facebookUserId, message, pageAccessToken } = req.body;
    
    if (!facebookUserId || !message || !pageAccessToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await facebookMrBlueContextService.sendMessageToFacebook(
      facebookUserId,
      message,
      pageAccessToken
    );
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error sending to Facebook:', error);
    res.status(500).json({ error: 'Failed to send message to Facebook' });
  }
};
```

## Integration with Pattern 32

This integration implements **Pattern 32: Facebook Messenger Expert Agent** from mb.md.

**Pattern 32 Requirements**:
- ✅ Bidirectional message flow between Facebook and Mr. Blue
- ✅ Conversation context preservation
- ✅ User identity linking
- ✅ Message queuing and retry logic
- ✅ Error handling and logging

## Testing

### Manual Testing Steps
1. Configure Facebook webhook in Meta Developers Console
2. Send test message to Facebook Page
3. Verify webhook receives message
4. Check conversation context storage
5. Verify Mr. Blue receives context via API
6. Test response sending back to Facebook
7. Confirm user receives response in Messenger

### API Testing with curl
```bash
# Test context retrieval
curl -X GET http://localhost:3000/api/v1/mrblue/facebook-context/USER_ID

# Test sending to Facebook
curl -X POST http://localhost:3000/api/v1/mrblue/facebook-send \
  -H "Content-Type: application/json" \
  -d '{
    "facebookUserId": "FACEBOOK_USER_ID",
    "message": "Hello from Mr. Blue!",
    "pageAccessToken": "YOUR_PAGE_TOKEN"
  }'
```

## Deployment Checklist

- [ ] Configure all environment variables in production
- [ ] Set up Facebook App and Page in Meta Developers Console
- [ ] Configure webhook URL with SSL certificate
- [ ] Subscribe to required webhook events
- [ ] Test webhook verification
- [ ] Verify Page Access Token has required permissions
- [ ] Test end-to-end message flow
- [ ] Monitor webhook logs for errors
- [ ] Set up error alerting
- [ ] Document Facebook App credentials securely

## Next Steps

1. **End-to-End Testing**: Complete E2E testing with real Facebook Page
2. **Replit Deployment**: Deploy to Replit and test with live webhook
3. **Error Handling**: Enhance error handling and retry logic
4. **Rate Limiting**: Implement sophisticated rate limiting
5. **Analytics**: Add conversation analytics and metrics
6. **User Preferences**: Implement user preference storage
7. **Rich Messages**: Support Facebook Messenger quick replies and templates
8. **Attachment Support**: Handle images, files, and other media types

## Commits

- `21072bc` - feat: Add Pattern 49-50 (Agent Memory Infrastructure & Discovery)
- `df18f71` - feat: Add Facebook context integration to Mr. Blue controller
- `43c866b` - feat: Add Facebook Messenger routes to Mr. Blue API

## Related Documentation

- `mb.md` - Pattern 32: Facebook Messenger Expert Agent
- `mb.md` - Pattern 47-50: Multi-Agent Infrastructure
- `AGENT_MEMORY.md` - Session history and learnings
- `ACTIVE_SESSIONS.json` - Current active agent sessions

---

**Last Updated**: 2025
**Status**: Implementation Complete - Ready for E2E Testing
