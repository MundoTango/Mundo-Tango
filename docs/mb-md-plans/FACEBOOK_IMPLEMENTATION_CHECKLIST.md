# Facebook Messenger Implementation Checklist

**Extracted from:** mb.md (Pattern 32: Facebook Messenger Expert Agent)
**Created:** December 2, 2025
**Status:** Reference (implementation planning document)
**Related:** docs/FACEBOOK_MESSENGER_KNOWLEDGE_BASE.md, docs/FACEBOOK_GRAPH_API_SETUP.md

---

## Phase 1: Token Setup

- [ ] Get short-lived token from Graph API Explorer
- [ ] Exchange for long-lived user token (60 days)
- [ ] Get never-expiring page token
- [ ] Validate token with debug_token endpoint
- [ ] Store in FACEBOOK_PAGE_ACCESS_TOKEN secret
- [ ] Set up auto-refresh 7 days before expiration

## Phase 2: Webhook Setup

- [ ] Create HTTPS endpoint (0.0.0.0:5000/webhooks/facebook)
- [ ] Implement GET verification handler
- [ ] Implement POST event handler
- [ ] Add SHA256 signature validation
- [ ] Subscribe to 'messages' and 'messaging_postbacks'
- [ ] Test with Graph API Explorer webhook tool

## Phase 3: PSID Management

- [ ] Add facebookPSID column to users table
- [ ] Capture PSID from webhook events
- [ ] Link PSID to user email/account
- [ ] Create PSID lookup function
- [ ] Handle PSID not found gracefully

## Phase 4: Message Sending

- [ ] Implement sendMessage(psid, text)
- [ ] Add retry logic for failures
- [ ] Implement rate limiting
- [ ] Add invitation tracking
- [ ] Log all sent messages for debugging

## Phase 5: Testing

- [ ] Send test message to self
- [ ] Verify webhook receives events
- [ ] Confirm PSID captured correctly
- [ ] Test sending within 24hr window
- [ ] Test message tag for event updates

---

## Rate Limits Reference

- **Messenger Profile API**: 10 calls / 10 minutes per page
- **Send API**: 200 x (Number of Engaged Users) per 24 hours
- **Message Length**: 640 characters max (longer gets truncated)

---

**Note:** This checklist was extracted from mb.md as part of governance cleanup. Implementation checklists belong in separate documents per mb.md governance header.
