# Facebook Graph API Setup for Mundo Tango Scraping

## 📋 VY Prompt: Facebook Graph API Token Configuration

**Use this prompt with Claude or your AI assistant to set up Facebook Graph API access:**

---

### PROMPT START

I need to set up Facebook Graph API access to scrape public event data from 68 tango community Facebook pages for my Mundo Tango platform. Please guide me through:

**Requirements:**
- Access to public Facebook page events
- Long-lived access token (60+ days)
- Permissions: `pages_read_engagement`, `pages_read_user_content`
- Rate limit awareness and handling

**Step-by-step guide needed:**

1. **Create Facebook App**
   - Navigate to [Meta for Developers](https://developers.facebook.com)
   - Create new app with type: "Business"
   - Note: App ID and App Secret

2. **Configure Permissions**
   - Request permissions: `pages_read_engagement`, `pages_read_user_content`
   - Submit for App Review if needed
   - Get approval for event scraping use case

3. **Generate Access Token**
   - Use Graph API Explorer
   - Select your app
   - Get User Access Token with required permissions
   - Exchange for long-lived token (60 days)

4. **Test Token**
   ```bash
   curl "https://graph.facebook.com/v18.0/{page-id}/events?access_token=YOUR_TOKEN"
   ```

5. **Add to Replit Secrets**
   ```bash
   FACEBOOK_ACCESS_TOKEN=your_long_lived_token_here
   ```

6. **Handle Rate Limits**
   - Facebook allows ~200 requests/hour per token
   - Our system handles 68 Facebook pages
   - Expected: 3-4 API calls per page = ~200-270 calls
   - Strategy: Implement exponential backoff

**Compliance Requirements:**
- ✅ Only scrape PUBLIC events
- ✅ Respect robots.txt and terms of service
- ✅ Attribute data source: "Found on Facebook"
- ✅ Cache results for 24 hours minimum
- ✅ Handle deprecation notices from Meta

**Expected Outcome:**
After setup, the scraping system will:
- Fetch public events from 68 tango Facebook pages
- Extract: title, description, date, location, image
- Import 300-500 Facebook events per run
- Update every 24 hours automatically

**Questions to address:**
1. How to exchange short-lived token for long-lived (60-day) token?
2. What's the token refresh strategy before expiration?
3. How to handle permission changes or app review delays?
4. Best practices for rate limit compliance?

Please provide:
- Exact API endpoints to use
- Example curl commands for token exchange
- Error handling recommendations
- Production deployment checklist

### PROMPT END

---

## 🔑 Quick Setup (For Experienced Developers)

### 1. Get Facebook App Credentials
```bash
# Go to: https://developers.facebook.com/apps
# Create Business App → Get App ID & Secret
```

### 2. Generate Long-Lived Token
```bash
# Exchange short-lived for long-lived token
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN"
```

### 3. Test Token
```bash
# Verify token works with a tango page
curl "https://graph.facebook.com/v18.0/BuenosAiresTango/events?\
access_token=YOUR_TOKEN&\
fields=name,description,start_time,place"
```

### 4. Add to Replit
```bash
# In Replit Secrets tab:
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Trigger Scraping
```bash
# Button in /events page OR:
curl -X POST https://mundotango.life/api/admin/trigger-scraping \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📊 Expected Results

**Without Facebook Token (Current):**
- ✅ 124 website sources active
- ❌ 68 Facebook sources skipped
- Expected: 0-100 events (websites need custom selectors)

**With Facebook Token:**
- ✅ 200 total sources active
- ✅ 68 Facebook pages scraped
- Expected: 300-500 events per run
- Duration: 2-4 hours

---

## 🚨 Important Notes

1. **Token Expiration:** Long-lived tokens expire after 60 days - set calendar reminder
2. **Rate Limits:** Facebook allows ~200 calls/hour - our system respects this
3. **Public Data Only:** Only public events are scraped (no authentication required for those)
4. **Attribution:** All Facebook events show "Source: Facebook" in UI
5. **Caching:** Events cached for 24 hours to minimize API calls

---

## 🔧 Troubleshooting

**"Invalid OAuth access token"**
→ Token expired or revoked. Generate new long-lived token

**"Rate limit exceeded"**
→ System auto-retries with exponential backoff (max 3 attempts)

**"Permission denied"**
→ App needs `pages_read_engagement` permission approved

**"No events found"**
→ Page might not have public events or wrong page ID

---

## 📚 Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [App Dashboard](https://developers.facebook.com/apps)
- [Rate Limits Guide](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)

