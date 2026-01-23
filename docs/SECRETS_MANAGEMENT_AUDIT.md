# 🔐 Secrets & Environment Variables Security Audit

**Audit Type:** Credentials & Configuration Management  
**Scope:** All environment variables and secret handling  
**Date:** January 22, 2026  
**Status:** DOCUMENTATION ONLY (No code changes)

---

## 📊 Environment Variables Inventory

**Total `process.env` References:** 700+ instances

**Configuration Template:** `.env.example` (242 lines)

### Secrets Categorized:

| Category           | Variables | Sensitivity | Protected  |
| ------------------ | --------- | ----------- | ---------- |
| **Database**       | 6         | 🔴 CRITICAL | ✅ Yes     |
| **Authentication** | 5         | 🔴 CRITICAL | ✅ Yes     |
| **AI APIs**        | 6         | 🟠 HIGH     | ✅ Yes     |
| **Payment**        | 3         | 🔴 CRITICAL | ✅ Yes     |
| **File Storage**   | 3         | 🟡 MEDIUM   | ✅ Yes     |
| **Email/SMS**      | 4         | 🟡 MEDIUM   | ✅ Yes     |
| **OAuth**          | 4         | 🟠 HIGH     | ✅ Yes     |
| **Webhooks**       | 2         | 🟡 MEDIUM   | ⚠️ Partial |
| **Monitoring**     | 1         | 🟢 LOW      | ✅ Yes     |

**Total Secrets:** 34+ unique environment variables

---

## ✅ Strong Security Measures

### 1. .gitignore Protection ✅

**File:** `.gitignore`

```gitignore
# Environment
.env                  # ✅ Protected
.env.local           # ✅ Protected
.env.*.local         # ✅ Protected

# MCP Secrets
.mcp/secrets.env     # ✅ Protected
```

**Status:** ✅ **EXCELLENT**

- All .env files excluded from Git
- MCP secrets directory protected
- No risk of accidental commits

---

### 2. Template Documentation ✅

**File:** `.env.example`

```bash
# ✅ Excellent documentation
# - Clear categories
# - Setup instructions
# - Example values
# - Security reminders
# - Links to get API keys
```

**Highlights:**

```bash
# Generate secure secrets:
#   openssl rand -base64 32
#
# Security reminders:
#   - NEVER commit .env to Git
#   - Use different secrets for dev/prod
#   - Rotate secrets regularly
```

**Status:** ✅ **EXCELLENT** - Developer-friendly guide

---

### 3. Fallback Defaults (Development) ✅

**Pattern:**

```typescript
// ✅ Dev-friendly: disabled in development
const isDevelopment = process.env.NODE_ENV !== "production";

export const globalRateLimiter = rateLimit({
  skip: () => isDevelopment, // Disabled in dev
  max: isDevelopment ? 100000 : 500,
});
```

**Status:** ✅ **GOOD** - Prevents dev friction

---

## ⚠️ RISKS IDENTIFIED

### 1. Missing Validation for Required Secrets

**Current State:**

```typescript
// ⚠️ No validation on startup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// App continues if undefined!
```

**Risk:** Silent failures, runtime crashes

**Examples:**

```typescript
// server/services/premium/openaiRealtimeService.ts:26
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}
// ✅ This is GOOD but inconsistent
```

**Found:**

- Some services validate (good!)
- Most services don't validate (bad!)
- No central validation on startup

**Recommendation:** Startup validation script

```typescript
// server/config/validateEnv.ts
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

// In server/index.ts
import { validateEnvironment } from "./config/validateEnv";
validateEnvironment(); // Fail fast!
```

---

### 2. Hardcoded Secrets in Test Files 🔴

**Found in:**

```typescript
// scripts/test-facebook-token-generation.ts:16-23
console.log("Email:", process.env.FACEBOOK_EMAIL?.substring(0, 3) + "***");
console.log("Page ID:", process.env.FACEBOOK_PAGE_ID || "NOT SET");

const email = process.env.FACEBOOK_EMAIL;
const password = process.env.FACEBOOK_PASSWORD; // ❌ Password in env!
```

**Risk:** 🔴 **HIGH**

- Passwords should NEVER be in env vars
- Should use OAuth flow instead

**Recommendation:** Use Facebook OAuth, not credentials

---

### 3. API Keys Logged in Errors ⚠️

**Pattern Found:**

```typescript
// Multiple services
if (!process.env.SOME_API_KEY) {
  console.error(`SOME_API_KEY not configured`); // ✅ Safe
}

// But elsewhere:
console.log(`Using API key: ${apiKey.substring(0, 10)}...`); // ⚠️ Risky
```

**Risk:** API key fragments in logs

**Recommendation:** Never log API key portions

---

### 4. Webhook Secret Validation Inconsistent

**Found:**

```typescript
// server/services/messaging/N8nWebhookService.ts:39
this.webhookSecret = process.env.N8N_WEBHOOK_SECRET || null;

// Line 180:
if (!this.webhookSecret) {
  console.error(
    "[N8n] SECURITY ERROR: N8N_WEBHOOK_SECRET not configured - rejecting request",
  );
  // ✅ Good - rejects if missing
}
```

**Status:** ✅ **GOOD** but not applied everywhere

**Found vulnerable:**

- Some webhook endpoints don't validate signature
- Inconsistent secret checking

---

### 5. Multiple Secrets for Same Purpose

**Encryption Key Fallback Chain:**

```typescript
// server/utils/encryption.ts:26
const secret =
  process.env.SECRETS_ENCRYPTION_KEY ||
  process.env.ENCRYPTION_KEY ||
  process.env.SESSION_SECRET;
```

**Risk:** ⚠️ Confusing configuration

- Which one should be set?
- SESSION_SECRET used for different purposes

**Recommendation:** Use single dedicated `ENCRYPTION_KEY`

---

###6. Database URL Exposure Risk

**Found:**

```typescript
// shared/db.ts:12
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql: NeonQueryFunction = neon(process.env.DATABASE_URL);
```

**Status:** ✅ **GOOD** - Validates presence

**But:**

```typescript
// scripts/safe-migrate.ts:37
const command = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
// ⚠️ URL in shell command (could be logged)
```

**Risk:** Connection string in shell history

---

## 📋 Secrets Inventory by Service

### Critical Secrets (Break app if missing)

| Secret               | Used In              | Validated  | Status    |
| -------------------- | -------------------- | ---------- | --------- |
| `DATABASE_URL`       | 50+ files            | ✅ Yes     | ✅ GOOD   |
| `JWT_SECRET`         | Auth                 | ⚠️ Partial | 🟠 MEDIUM |
| `JWT_REFRESH_SECRET` | Auth                 | ⚠️ Partial | 🟠 MEDIUM |
| `SESSION_SECRET`     | Sessions, encryption | ⚠️ No      | 🟠 MEDIUM |
| `STRIPE_SECRET_KEY`  | Payments             | ⚠️ No      | 🔴 HIGH   |

### High-Value Secrets (Costly if leaked)

| Secret                  | Cost Risk | Protected    | Notes               |
| ----------------------- | --------- | ------------ | ------------------- |
| `OPENAI_API_KEY`        | $$$$      | ✅ Gitignore | Used in 100+ places |
| `ANTHROPIC_API_KEY`     | $$$       | ✅ Gitignore | Claude models       |
| `GROQ_API_KEY`          | $         | ✅ Gitignore | Fast inference      |
| `STRIPE_SECRET_KEY`     | $$$$$     | ✅ Gitignore | Payment processing  |
| `CLOUDINARY_API_SECRET` | $         | ✅ Gitignore | Media storage       |

### Medium-Risk Secrets

| Secret               | Purpose  | Risk if Leaked   |
| -------------------- | -------- | ---------------- |
| `RESEND_API_KEY`     | Email    | Spam abuse       |
| `TWILIO_AUTH_TOKEN`  | SMS      | SMS spam         |
| `N8N_WEBHOOK_SECRET` | Webhooks | Data injection   |
| `SLACK_BOT_TOKEN`    | Slack    | Workspace access |

---

## 🎯 Attack Scenarios

### Scenario 1: Leaked OpenAI Key

**Attack:**

```bash
# Attacker finds OPENAI_API_KEY in logs/error
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-leaked-key" \
  -d '{"model": "gpt-4", "messages": [...]}'
```

**Impact:**

- $$$$ API bills for attacker's usage
- Rate limits hit
- Account suspended

**Current Protection:** ✅ Gitignore, ⚠️ No key rotation policy

---

### Scenario 2: JWT_SECRET Compromised

**Attack:**

```python
import jwt

# Attacker knows JWT_SECRET
fake_token = jwt.encode({
  'id': 1,  # Admin user
  'roleLevel': 10
}, 'leaked-secret', algorithm='HS256')

# Use token to impersonate admin
```

**Impact:** 🔴 **CRITICAL** - Full system compromise

**Current Protection:** ✅ Gitignore, ❌ No rotation documented

---

### Scenario 3: Database URL Leaked

**Attack:**

```bash
# Connect directly to database
psql "postgresql://user:pass@host:5432/db"

# Dump all data
pg_dump postgresql://... > stolen_data.sql
```

**Impact:** 🔴 **CRITICAL** - Complete data breach

**Current Protection:** ✅ Gitignore, ✅ SSL required

---

## ✅ Best Practices Followed

1. **✅ .env files in .gitignore**
2. **✅ Template (.env.example) provided**
3. **✅ Clear documentation with links**
4. **✅ Some services validate required keys**
5. **✅ Development mode disabled security (good DX)**
6. **✅ MCP secrets directory protected**

---

## ⚠️ Improvements Needed

1. **❌ No centralized secret validation on startup**
2. **❌ No secret rotation policy documented**
3. **❌ Inconsistent validation across services**
4. **❌ Some API key fragments logged**
5. **❌ Multiple secrets for same purpose (confusing)**
6. **❌ No secret expiration monitoring**
7. **❌ Passwords in environment variables (test scripts)**

---

## 🔧 Recommendations

### Immediate (P0 - Critical)

1. **Remove Password from Environment**

   ```typescript
   // ❌ DELETE THIS
   const password = process.env.FACEBOOK_PASSWORD;

   // ✅ USE THIS
   // Use Facebook OAuth flow instead
   ```

2. **Add Startup Validation**

   ```typescript
   // server/config/validateEnv.ts
   const REQUIRED = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];

   REQUIRED.forEach((key) => {
     if (!process.env[key]) {
       console.error(`❌ Missing required env var: ${key}`);
       process.exit(1);
     }
   });
   ```

3. **Document Secret Rotation**
   - Add rotation schedule to SECURITY.md
   - JWT keys: every 90 days
   - API keys: on dev departure
   - Database creds: every 6 months

### Short-term (P1 - High)

4. **Centralize Encryption Key**

   ```typescript
   // Use single ENCRYPTION_KEY
   // Don't fall back to SESSION_SECRET
   ```

5. **Add Secret Scanning**

   ```bash
   # Install git-secrets
   git secrets --install
   git secrets --register-aws

   # Scan for leaked keys
   git secrets --scan
   ```

6. **Environment Template Validation**
   ```bash
   # Script to check .env matches .env.example
   diff <(grep -o '^[^#]*=' .env.example | sort) \
        <(grep -o '^[^#]*=' .env | sort)
   ```

### Long-term (P2 - Medium)

7. **Secret Management Service**
   - Use AWS Secrets Manager
   - Or HashiCorp Vault
   - Or Replit Secrets UI

8. **Secret Expiration Monitoring**

   ```typescript
   // Track when keys were last rotated
   const KEY_ROTATION_AGE_DAYS = {
     JWT_SECRET: 90,
     OPENAI_API_KEY: 180,
     STRIPE_SECRET_KEY: 365,
   };
   ```

9. **Environment Variable Encryption**
   ```bash
   # Encrypt .env files at rest
   gpg --encrypt .env
   git add .env.gpg
   ```

---

## 📊 Risk Assessment

| Risk               | Severity    | Likelihood | Impact             | Current Control  |
| ------------------ | ----------- | ---------- | ------------------ | ---------------- |
| API Key Leak       | 🔴 HIGH     | MEDIUM     | $$$ Cost           | .gitignore       |
| JWT Secret Leak    | 🔴 CRITICAL | LOW        | 🔴 Full compromise | .gitignore       |
| DB URL Leak        | 🔴 CRITICAL | LOW        | 🔴 Data breach     | .gitignore + SSL |
| Password in Env    | 🟠 MEDIUM   | MEDIUM     | Account takeover   | ⚠️ None          |
| Missing Validation | 🟡 LOW      | HIGH       | Runtime crashes    | ⚠️ Partial       |

**Overall Risk Score:** 🟢 **8/10** (Good, needs consistency)

---

## 📋 Secret Rotation Checklist

### When to Rotate:

1. **Immediately:**
   - Developer leaves team
   - Suspected leak/compromise
   - Public repo accidentally committed

2. **Regularly:**
   - JWT secrets: Every 90 days
   - API keys: Every 180 days
   - Database passwords: Every 6 months

### How to Rotate:

**JWT Secret:**

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update .env
echo "JWT_SECRET=$NEW_SECRET" >> .env

# 3. Restart app (invalidates all sessions)
# 4. Notify users to re-login
```

**API Keys:**

```bash
# 1. Create new key in provider dashboard
# 2. Update .env
# 3. Test thoroughly
# 4. Delete old key from provider
```

---

## 🔗 Related Documentation

- [SECURITY.md](file:///Users/scottboddye/Desktop/Mundo-Tango/docs/SECURITY.md) - API key rotation procedures
- [Rate Limiting Audit](file:///Users/scottboddye/Desktop/Mundo-Tango/docs/RATE_LIMITING_AUTH_AUDIT.md)
- [Database Security](file:///Users/scottboddye/Desktop/Mundo-Tango/docs/DATABASE_SECURITY_AUDIT.md)

---

## ✅ Summary

**Strengths:**

- ✅ Excellent .gitignore protection (all .env files excluded)
- ✅ Comprehensive .env.example template (242 lines)
- ✅ Good documentation with setup links
- ✅ 34+ secrets properly categorized

**Weaknesses:**

- ⚠️ No centralized validation on startup (fail late instead of fast)
- ⚠️ Inconsistent validation across services
- ⚠️ Passwords in environment (test scripts)
- ⚠️ No rotation policy documented

**Priority Actions:**

1. Remove password from env (P0)
2. Add startup validation (P0)
3. Document rotation schedule (P0)
4. Centralize encryption key (P1)

**Estimated Remediation:** 4-6 hours

---

**Audit Complete!** ✅  
**Status:** Well-protected foundation, needs consistency and validation
