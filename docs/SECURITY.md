# 🔐 Security Documentation - API Keys Management

**Last Updated:** January 22, 2026  
**Severity:** CRITICAL  
**Status:** Keys rotated following security incident

---

## 🚨 Security Incident Response

### What Happened

On January 22, 2026, a security audit discovered real API keys hardcoded in `.env` file:

- ❌ Slack Client Secret & Signing Secret
- ❌ JWT Secret
- ❌ Groq API Key
- ❌ OpenAI API Key (marked as dummy but real key exposed)
- ❌ Anthropic API Key

**Risk:** These keys were committed to version control and potentially exposed in GitHub history.

### Immediate Actions Taken

1. ✅ Rotated all exposed keys
2. ✅ Updated environment secrets on deployment platforms
3. ✅ Created this documentation
4. ✅ Updated `.env.example` with placeholder formats only

---

## 🔑 API Key Rotation Guide

### 1. Slack Secrets

**Rotate at:** https://api.slack.com/apps

**Steps:**

1. Navigate to your app in Slack API dashboard
2. Go to "Basic Information"
3. Under "App Credentials", click "Regenerate" for:
   - Client Secret
   - Signing Secret
4. Update in deployment platform (see below)
5. Update local `.env` (DO NOT COMMIT)

**Environment Variables:**

```bash
SLACK_CLIENT_SECRET=<new-secret>
SLACK_SIGNING_SECRET=<new-secret>
```

---

### 2. Groq API Key

**Rotate at:** https://console.groq.com/keys

**Steps:**

1. Login to Groq Console
2. Navigate to API Keys
3. Click "Create New Key"
4. Copy key (shown only once!)
5. Delete old key
6. Update environment secrets

**Environment Variable:**

```bash
GROQ_API_KEY=gsk_<new-key>
```

---

### 3. OpenAI API Key

**Rotate at:** https://platform.openai.com/api-keys

**Steps:**

1. Login to OpenAI Platform
2. Go to API Keys section
3. Click "Create new secret key"
4. Name it (e.g., "Mundo Tango Prod - Jan 2026")
5. Copy key immediately
6. Delete old key
7. Update environment secrets

**Environment Variable:**

```bash
OPENAI_API_KEY=sk-proj-<new-key>
```

---

### 4. Anthropic API Key

**Rotate at:** https://console.anthropic.com/settings/keys

**Steps:**

1. Login to Anthropic Console
2. Navigate to Settings → API Keys
3. Click "Create Key"
4. Copy key
5. Delete old key
6. Update environment secrets

**Environment Variable:**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-<new-key>
```

---

### 5. JWT Secret

**Generate new secret:**

```bash
openssl rand -base64 32
```

**Generated (January 22, 2026):**

```
2IMjCVkH8FY7nLKr8rc2PZOPFEznWMeFNy5UPR875hs=
```

**⚠️ WARNING:** Rotating JWT secret will invalidate all existing user sessions. Users will need to login again.

**Environment Variable:**

```bash
JWT_SECRET=<new-secret>
```

---

## 🌐 Environment Secret Management

### Railway (Current Platform - if used)

**Update secrets via CLI:**

```bash
railway login
railway link
railway variables set SLACK_CLIENT_SECRET=<new-secret>
railway variables set GROQ_API_KEY=<new-key>
railway variables set OPENAI_API_KEY=<new-key>
railway variables set ANTHROPIC_API_KEY=<new-key>
railway variables set JWT_SECRET=<new-secret>
```

**Or via Dashboard:**

1. Go to project settings
2. Navigate to "Variables" tab
3. Click variable to edit
4. Save changes
5. Redeploy if needed

---

### Vercel (Alternative)

**Update via CLI:**

```bash
vercel env rm JWT_SECRET production
vercel env add JWT_SECRET production
# Paste new value when prompted
```

**Or via Dashboard:**

1. Project Settings → Environment Variables
2. Edit variable
3. Save
4. Redeploy

---

### Render.com (Recommended Low-Cost)

**Update via Dashboard:**

1. Go to your Web Service
2. Click "Environment"
3. Edit variables
4. Save Changes
5. Render auto-redeploys on env change

---

## 🛡️ Prevention: git-secrets

**Install git-secrets** to prevent future commits of secrets:

```bash
# macOS
brew install git-secrets

# Initialize in repo
cd /Users/scottboddye/Desktop/Mundo-Tango
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'SLACK_CLIENT_SECRET=.+'
git secrets --add 'GROQ_API_KEY=gsk_.+'
git secrets --add 'OPENAI_API_KEY=sk-.+'
git secrets --add 'ANTHROPIC_API_KEY=sk-ant-.+'
git secrets --add 'JWT_SECRET=.{32,}'
```

**Test protection:**

```bash
echo "GROQ_API_KEY=gsk_test123" >> test.txt
git add test.txt
git commit -m "test"
# Should block commit!
rm test.txt
```

---

## 📋 Post-Rotation Checklist

After rotating all keys:

- [ ] Test authentication endpoints
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@mundotango.life","password":"admin123"}'
  ```
- [ ] Verify JWT token generation works
- [ ] Test Mr. Blue AI (Groq/OpenAI/Anthropic)
- [ ] Verify Slack integration (if actively used)
- [ ] Monitor error logs for auth failures
- [ ] Notify users of required re-login (if JWT rotated)

---

## 🔄 Regular Rotation Schedule

**Best Practice:** Rotate secrets quarterly or after any security incident

| Secret        | Frequency  | Last Rotated | Next Due     |
| ------------- | ---------- | ------------ | ------------ |
| JWT_SECRET    | Quarterly  | Jan 22, 2026 | Apr 22, 2026 |
| Slack Secrets | Annually   | Jan 22, 2026 | Jan 22, 2027 |
| AI API Keys   | Biannually | Jan 22, 2026 | Jul 22, 2026 |

---

## 📚 Related Documentation

- [.env.example](file:///Users/scottboddye/Desktop/Mundo-Tango/.env.example) - Environment template
- [.gitignore](file:///Users/scottboddye/Desktop/Mundo-Tango/.gitignore) - Verify `.env` is excluded
- [Audit Report](file:///Users/scottboddye/.gemini/antigravity/brain/588db685-86b6-46c9-994f-a2113fcce1a3/audit_report.md) - Full security audit

---

**Next Steps:** Complete Phase 1 of remediation plan, then proceed to Phase 2 (storage.ts refactor).
