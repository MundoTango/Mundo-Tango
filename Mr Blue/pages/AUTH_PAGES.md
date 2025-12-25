# Authentication Pages Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** AuthPageAgent | **Invocation:** `use mb.md: pages:auth`

---

## 1. Overview

Authentication pages handle user registration, login, password recovery, and two-factor authentication. They provide secure access to the platform with multiple OAuth providers.

### MB.MD References
- **Agent:** `use mb.md: agents:page` → AuthPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #1 (Security)

---

## 2. Pages Covered

| Page | Component | Route |
|------|-----------|-------|
| Login | `LoginPage.tsx` | `/login` |
| Register | `RegisterPage.tsx` | `/register` |
| Password Reset | `PasswordResetPage.tsx` | `/forgot-password` |
| Reset Confirm | `ResetConfirmPage.tsx` | `/reset-password/:token` |
| Two-Factor Auth | `TwoFactorAuthPage.tsx` | `/2fa` |

---

## 3. Data Architecture

### 3.1 Users Table (Auth Fields)

```sql
users (
  id: serial PRIMARY KEY,
  email: varchar UNIQUE NOT NULL,
  password: text NOT NULL (bcrypt hashed),
  isVerified: boolean DEFAULT false,
  verificationToken: text,
  resetToken: text,
  resetTokenExpiry: timestamp,
  twoFactorEnabled: boolean DEFAULT false,
  twoFactorSecret: text,
  lastLogin: timestamp,
  loginAttempts: integer DEFAULT 0,
  lockedUntil: timestamp
)
```

### 3.2 Sessions Table

```sql
sessions (
  id: varchar PRIMARY KEY,
  userId: integer REFERENCES users(id),
  expiresAt: timestamp,
  userAgent: text,
  ipAddress: varchar,
  createdAt: timestamp
)
```

---

## 4. Login Page Structure

### 4.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  [PublicNavbar]                                            │
├────────────────────────────────────────────────────────────┤
│                    ┌──────────────────┐                    │
│                    │  🌹 Mundo Tango  │                    │
│                    │                  │                    │
│                    │  Welcome Back    │                    │
│                    │                  │                    │
│                    │  Email           │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  Password        │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  [  Sign In  ]   │                    │
│                    │                  │                    │
│                    │  ─── or ───      │                    │
│                    │                  │                    │
│                    │  [G] Google      │                    │
│                    │  [f] Facebook    │                    │
│                    │                  │                    │
│                    │  Forgot password?│                    │
│                    │  New? Register   │                    │
│                    └──────────────────┘                    │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Form Fields

| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid format |
| Password | password | Required, min 8 chars |
| Remember me | checkbox | Optional |

---

## 5. Register Page Structure

### 5.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│                    ┌──────────────────┐                    │
│                    │  Join Mundo Tango│                    │
│                    │                  │                    │
│                    │  Full Name       │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  Username        │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  Email           │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  Password        │                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  Confirm Password│                    │
│                    │  [____________]  │                    │
│                    │                  │                    │
│                    │  [ ] Terms       │                    │
│                    │                  │                    │
│                    │  [Create Account]│                    │
│                    │                  │                    │
│                    │  ─── or ───      │                    │
│                    │  [G] [f]         │                    │
│                    └──────────────────┘                    │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Form Fields

| Field | Type | Validation |
|-------|------|------------|
| Full Name | text | Required, 2-50 chars |
| Username | text | Required, unique, alphanumeric |
| Email | email | Required, unique, valid format |
| Password | password | Required, min 8, complexity rules |
| Confirm Password | password | Must match password |
| Terms Agreement | checkbox | Required |

---

## 6. OAuth Integration

### 6.1 Providers

| Provider | Endpoint | Scopes |
|----------|----------|--------|
| Google | `/api/auth/google` | profile, email |
| Facebook | `/api/auth/facebook` | public_profile, email |

### 6.2 OAuth Flow

```
1. User clicks OAuth button
2. Redirect to provider
3. User authorizes
4. Callback to /api/auth/{provider}/callback
5. Create/link user account
6. Generate JWT tokens
7. Redirect to /home
```

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/register` | POST | Create account |
| `/api/auth/logout` | POST | End session |
| `/api/auth/refresh` | POST | Refresh tokens |
| `/api/auth/forgot-password` | POST | Request reset |
| `/api/auth/reset-password` | POST | Complete reset |
| `/api/auth/verify-email` | GET | Email verification |
| `/api/auth/google` | GET | Google OAuth start |
| `/api/auth/facebook` | GET | Facebook OAuth start |
| `/api/auth/2fa/setup` | POST | Enable 2FA |
| `/api/auth/2fa/verify` | POST | Verify 2FA code |

---

## 8. Security Features

### 8.1 Password Requirements

| Rule | Requirement |
|------|-------------|
| Length | Minimum 8 characters |
| Uppercase | At least 1 uppercase letter |
| Lowercase | At least 1 lowercase letter |
| Number | At least 1 digit |
| Special | At least 1 special character |

### 8.2 Rate Limiting

| Action | Limit | Lockout |
|--------|-------|---------|
| Login attempts | 5 per 15 min | 30 min lockout |
| Password reset | 3 per hour | 1 hour wait |
| Registration | 5 per hour per IP | 1 hour wait |

### 8.3 Token Management

| Token | Type | Expiry |
|-------|------|--------|
| Access Token | JWT | 15 minutes |
| Refresh Token | JWT | 7 days |
| Reset Token | UUID | 1 hour |
| Verification Token | UUID | 24 hours |

---

## 9. Two-Factor Authentication

### 9.1 Setup Flow

```
1. User enables 2FA in settings
2. Generate TOTP secret
3. Display QR code
4. User scans with authenticator app
5. User enters verification code
6. 2FA enabled
```

### 9.2 Login with 2FA

```
1. User enters email/password
2. If 2FA enabled, redirect to /2fa
3. User enters 6-digit code
4. Verify against TOTP secret
5. Issue tokens on success
```

---

## 10. Permissions Matrix

| Action | Visitor | Member |
|--------|---------|--------|
| View login page | Yes | Redirect to home |
| View register page | Yes | Redirect to home |
| Reset password | Yes | Yes |
| Enable 2FA | No | Yes |
| View 2FA page | If in flow | If in flow |

---

## 11. Mobile Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Full-width form, stacked buttons |
| > 640px | Centered card layout |

---

## 12. Internationalization

- Form labels translated
- Error messages localized
- OAuth button text translated
- 68 languages supported

---

## 13. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `login_attempt` | Submit login | method (email/oauth) |
| `login_success` | Login complete | method, 2fa_used |
| `login_failure` | Login failed | reason |
| `register_start` | Page view | referrer |
| `register_complete` | Account created | method |
| `password_reset_request` | Request sent | - |

---

## 14. Related Pages

| Page | Relationship |
|------|--------------|
| `/home` | Post-login redirect |
| `/onboarding` | Post-register redirect |
| `/settings/security` | 2FA management |

---

## 15. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/LoginPage.tsx` | Login form |
| `client/src/pages/RegisterPage.tsx` | Registration form |
| `client/src/contexts/AuthContext.tsx` | Auth state management |
| `server/routes/auth.ts` | Auth API routes |
| `server/middleware/auth.ts` | JWT middleware |

---

## 16. Test Scenarios

### 16.1 Login E2E

```
1. [New Context] Create browser context
2. [Browser] Navigate to /login
3. [Verify] Assert login form visible
4. [Browser] Enter valid email and password
5. [Browser] Click "Sign In"
6. [Verify] Assert redirect to /home
```

### 16.2 Registration E2E

```
1. [New Context] Create browser context
2. [Browser] Navigate to /register
3. [Browser] Fill all required fields
4. [Browser] Check terms agreement
5. [Browser] Click "Create Account"
6. [Verify] Assert redirect to onboarding
```

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | Magic link login | Planned |
| P2 | Passkey support | Planned |
| P2 | Apple OAuth | Planned |
| P3 | SSO for organizations | Backlog |

---

*Secure access. Trusted platform. Protected dancers.*
