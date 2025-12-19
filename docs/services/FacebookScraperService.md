# Facebook Scraper Service Documentation

## Overview

The Facebook Scraper Service is a Playwright-based automation tool designed for System 0 Data Pipeline. It extracts comprehensive data from Facebook accounts including profile information, posts, friends, events, and groups.

## Features

✅ **Multi-Account Support**: Scrapes data from multiple Facebook accounts  
✅ **Rate Limiting**: Respects 100 requests/hour limit to avoid account bans  
✅ **Cookie Persistence**: Saves sessions for faster subsequent logins  
✅ **2FA Support**: Pauses for manual 2FA code entry when prompted  
✅ **Media Downloads**: Downloads profile pictures and post images  
✅ **Error Handling**: Gracefully handles login failures, CAPTCHA, and network issues  
✅ **Human-like Behavior**: Random delays and non-headless mode to avoid bot detection  

## Data Extracted

### 1. Profile Data
- Name
- Bio/Introduction
- Location
- Profile Picture URL
- Cover Photo URL
- Photos

### 2. Posts
- Post text content
- Media URLs (images/videos)
- Engagement metrics (likes, comments, shares)
- Timestamps
- Post URLs

### 3. Friends
- Friend names
- Profile URLs
- Mutual friend counts
- Relationship types

### 4. Events
- Event titles
- Dates and times
- Locations
- Event URLs
- Attendance status (attending/interested)

### 5. Groups
- Group names
- Group URLs
- Member counts
- User's role in group

## File Structure

All scraped data is saved to:
```
attached_assets/facebook_import/
├── sboddye/
│   ├── profile.json
│   ├── posts.json
│   ├── friends.json
│   ├── events.json
│   ├── groups.json
│   └── media/
│       ├── profile_picture.jpg
│       └── [other media files]
└── mundotango/
    ├── profile.json
    ├── posts.json
    ├── friends.json
    ├── events.json
    ├── groups.json
    └── media/
        └── profile_picture.jpg
```

Session cookies are stored in:
```
attached_assets/facebook_cookies/
├── sboddye_cookies.json
└── mundotango_cookies.json
```

## Usage

### Programmatic Usage

```typescript
import { facebookScraper } from './server/services/FacebookScraperService';

// Scrape a single account
const result = await facebookScraper.scrapeAccount({
  username: process.env.facebook_sboddye_username!,
  password: process.env.facebook_sboddye_password!,
  accountName: 'sboddye',
  headless: false // Set to false for 2FA support
});

console.log('Scraping result:', result);

// Scrape all configured accounts
await facebookScraper.scrapeAllAccounts();
```

### API Endpoint Usage

```bash
# Trigger scraping for all accounts
curl -X POST http://localhost:5000/api/scraper/facebook/start

# Check scraping status
curl http://localhost:5000/api/scraper/facebook/status

# Get scraped data for specific account
curl http://localhost:5000/api/scraper/facebook/data/sboddye
```

## Environment Variables

Required Replit Secrets:

```bash
facebook_sboddye_username=your_email@example.com
facebook_sboddye_password=your_password
facebook_mundotango_username=your_email@example.com
facebook_mundotango_password=your_password
```

## Rate Limiting

The service implements intelligent rate limiting:

- **Max Requests**: 100 requests per hour
- **Request Tracking**: Automatically tracks all requests
- **Auto-throttling**: Pauses when limit is reached
- **Random Delays**: 1-3 seconds between actions to appear human

## 2FA & CAPTCHA Handling

### Two-Factor Authentication (2FA)

When 2FA is detected:
1. The browser window remains open (non-headless)
2. Service logs: `⚠️ 2FA REQUIRED - Please enter code manually in browser`
3. You have 60 seconds to enter the code
4. Service automatically continues after successful 2FA

### CAPTCHA Detection

When CAPTCHA is detected:
1. Service logs: `🚨 CAPTCHA detected - manual intervention required`
2. Browser window stays open for manual solving
3. 60-second timeout for completion
4. Service continues automatically

## Error Handling

The service handles various error scenarios:

| Error Type | Behavior |
|------------|----------|
| Invalid credentials | Throws error, logs detailed message |
| Account locked | Throws error, saves last successful state |
| Network timeout | Retries with exponential backoff |
| CAPTCHA challenge | Pauses for manual intervention |
| Rate limit exceeded | Waits until limit resets |
| Element not found | Logs warning, continues scraping |

## Best Practices

1. **Use Non-Headless Mode**: Set `headless: false` to avoid bot detection
2. **Don't Over-Scrape**: Respect rate limits to avoid account bans
3. **Save Cookies**: Cookie persistence speeds up subsequent runs
4. **Monitor Logs**: Watch for 2FA/CAPTCHA prompts
5. **Run Off-Peak**: Schedule scraping during low-traffic hours
6. **Test Incrementally**: Start with small data sets before full scraping

## Security Considerations

⚠️ **Important Security Notes**:

- Facebook credentials are stored in Replit Secrets (encrypted)
- Never commit credentials to version control
- Cookies contain session tokens - protect them like passwords
- Use dedicated Facebook accounts for scraping, not personal accounts
- Be aware of Facebook's Terms of Service regarding automated access

## Troubleshooting

### Login Fails
```
Check credentials in Replit Secrets
Verify account isn't locked
Ensure 2FA codes are entered promptly
```

### No Data Scraped
```
Check Facebook's page structure hasn't changed
Verify element selectors are still valid
Ensure sufficient scroll time for lazy-loaded content
```

### Rate Limit Errors
```
Wait for rate limit window to reset (1 hour)
Reduce scraping frequency
Implement longer delays between actions
```

### Browser Crashes
```
Increase available memory
Reduce concurrent operations
Close browser between account scrapes
```

## Maintenance

### Updating Selectors

Facebook frequently updates their HTML structure. If scraping fails:

1. Open browser in non-headless mode
2. Inspect the target elements
3. Update selectors in the service methods
4. Test thoroughly before deploying

### Common Selectors to Update

```typescript
// Profile name
'h1'

// Posts
'[data-pagelet*="FeedUnit"], [role="article"]'

// Friends
'[data-pagelet*="ProfileAppSection"] a[href*="/profile/"]'

// Events
'[role="article"], [data-pagelet*="Event"]'

// Groups
'a[href*="/groups/"]'
```

## Performance

Typical scraping times:

| Data Type | Avg. Time | Items |
|-----------|-----------|-------|
| Profile | 5-10s | 1 profile |
| Posts | 30-60s | 20 posts |
| Friends | 45-90s | 50 friends |
| Events | 20-40s | 10-20 events |
| Groups | 15-30s | 5-15 groups |
| **Total** | **~3-5 min** | Per account |

## Future Enhancements

Planned features:

- [ ] Parallel scraping with multiple browser contexts
- [ ] Instagram and LinkedIn integration
- [ ] Advanced post filtering (date ranges, keywords)
- [ ] Real-time progress updates via WebSocket
- [ ] Scheduled automatic scraping (cron jobs)
- [ ] Export to CSV/Excel formats
- [ ] Duplicate detection and deduplication
- [ ] Machine learning for content classification

## Support

For issues or questions:

1. Check logs in console for detailed error messages
2. Review Facebook's current page structure
3. Verify environment variables are set correctly
4. Ensure Playwright dependencies are installed

## License

Internal use only - Mundo Tango Platform - System 0 Data Pipeline
