# Email Deliverability Setup Guide

## Current Status: Email Verification Issues Reported

Users are reporting they aren't receiving verification emails during registration. This document explains the issue and required fixes.

## Root Cause: Missing DNS Authentication Records

For emails from `mundotango.life` to be delivered reliably, the following DNS records must be properly configured:

### Required DNS Records

#### 1. SPF Record (Sender Policy Framework)
Authorizes Resend's servers to send emails on behalf of your domain.

| Type | Host | Value |
|------|------|-------|
| TXT | `@` or `mundotango.life` | `v=spf1 include:_spf.resend.com ~all` |

#### 2. DKIM Record (DomainKeys Identified Mail)
Adds cryptographic signature to verify emails haven't been tampered with.

| Type | Host | Value |
|------|------|-------|
| CNAME | `resend._domainkey` | `[Get from Resend Dashboard]` |

#### 3. DMARC Record (Domain-based Message Authentication)
**Required by Gmail/Yahoo since February 2024.**

| Type | Host | Value |
|------|------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@mundotango.life` |

**DMARC Policy Options:**
- `p=none` - Monitor only (start with this)
- `p=quarantine` - Suspicious emails go to spam
- `p=reject` - Block emails that fail authentication

#### 4. MX Record for Bounce Handling (Optional but recommended)
| Type | Host | Value | Priority |
|------|------|-------|----------|
| MX | `send` or `mail` | `feedback-smtp.resend.com` | 10 |

## How to Configure

### Step 1: Access Resend Dashboard
1. Go to https://resend.com/domains
2. Find `mundotango.life` domain
3. Click to view required DNS records

### Step 2: Add Records in DNS Provider
Add the records shown in Resend Dashboard to your DNS provider (Cloudflare, GoDaddy, etc.)

### Step 3: Verify in Resend
1. Return to Resend Dashboard
2. Click "Verify DNS Records"
3. Wait for all records to show as verified (may take up to 48 hours)

## Verification Commands

Check current DNS configuration:
```bash
# Check SPF
dig +short TXT mundotango.life

# Check DKIM  
dig +short TXT resend._domainkey.mundotango.life

# Check DMARC
dig +short TXT _dmarc.mundotango.life
```

## Current Email Configuration

- **From Address:** `admin@mundotango.life`
- **Email Provider:** Resend (via Replit Connector)
- **Domain Verified in Resend:** Yes (RESEND_DOMAIN_VERIFIED=true)

## Troubleshooting

### Emails Not Received
1. Check spam/junk folder
2. Verify DNS records are properly configured
3. Check Resend Dashboard for delivery status
4. Review server logs for email errors

### Common Email Providers with Strict Filters
- Yahoo, AOL, Hotmail, Outlook may have stricter spam filters
- Gmail requires DMARC compliance since Feb 2024
- Some corporate domains may block external emails

## Immediate Workaround

While DNS is being configured, users can:
1. Request a new verification code via "Resend Code" button
2. Check spam folder
3. Use an alternative email address

## Related Files
- `server/services/EmailService.ts` - Email sending logic
- `server/routes/auth.ts` - Registration and verification endpoints

## Last Updated
January 6, 2026 - Added after users reported email delivery issues
