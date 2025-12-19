# Authentication API Documentation

## Overview
Complete authentication and authorization system with JWT tokens, 2FA, email verification, and password management.

**Base URL:** `/api/auth`

**Authentication:** Most endpoints are public or use JWT Bearer token authentication

**Rate Limits:** 
- Login: 5 requests/minute
- Register: 3 requests/minute
- Password Reset: 3 requests/hour
- Other: 60 requests/minute

---

## Table of Contents
1. [Registration & Onboarding](#registration--onboarding)
2. [Login & Session Management](#login--session-management)
3. [Password Management](#password-management)
4. [Email Verification](#email-verification)
5. [Two-Factor Authentication](#two-factor-authentication)
6. [Token Management](#token-management)
7. [User Profile](#user-profile)

---

## Registration & Onboarding

### Register New User
```
POST /api/auth/register
```

Create a new user account with email and password.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "username": "johndoe",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "city": "Buenos Aires",
  "country": "Argentina"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "isVerified": false,
    "role": "user",
    "isOnboardingComplete": false,
    "formStatus": 0
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationToken": "a1b2c3d4e5f6..."
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Email/username already exists
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123",
    "username": "johndoe",
    "name": "John Doe"
  }'
```

**TypeScript Example:**
```typescript
import { apiRequest } from '@/lib/queryClient';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  name: string;
}

const register = async (data: RegisterData) => {
  const response = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Store access token
  localStorage.setItem('accessToken', response.accessToken);
  
  return response;
};
```

---

### Check Username Availability
```
GET /api/auth/check-username/:username
```

Check if a username is available for registration.

**Response (200 OK):**
```json
{
  "available": true
}
```

---

## Login & Session Management

### Login
```
POST /api/auth/login
```

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "twoFactorCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "user",
    "twoFactorEnabled": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials or 2FA code
- `403 Forbidden` - Account suspended/inactive or 2FA required
- `500 Internal Server Error`

**2FA Required Response (403):**
```json
{
  "message": "Two-factor authentication required",
  "requires2FA": true
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123"
  }'
```

---

### Get Current User
```
GET /api/auth/me
```

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "profileImage": "https://...",
    "bio": "Tango enthusiast",
    "city": "Buenos Aires",
    "country": "Argentina",
    "role": "user",
    "isVerified": true,
    "twoFactorEnabled": false,
    "subscriptionTier": "premium"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Token missing, invalid, or expired
- `500 Internal Server Error`

---

### Logout
```
POST /api/auth/logout
```

Invalidate refresh token and end session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Refresh Access Token
```
POST /api/auth/refresh
```

Get a new access token using refresh token from cookies.

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Refresh token missing/invalid/expired
- `500 Internal Server Error`

---

## Password Management

### Forgot Password
```
POST /api/auth/forgot-password
```

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

### Reset Password
```
POST /api/auth/reset-password
```

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecureP@ss456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or invalid token
- `500 Internal Server Error`

---

### Change Password
```
PUT /api/auth/change-password
```

Change password for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewSecureP@ss456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Current password incorrect
- `500 Internal Server Error`

---

## Email Verification

### Verify Email
```
POST /api/auth/verify-email
```

Verify email address using token from email.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": 123,
    "isVerified": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid/expired token
- `500 Internal Server Error`

---

### Resend Verification Email
```
POST /api/auth/resend-verification
```

Request new verification email.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Verification email sent"
}
```

---

## Two-Factor Authentication

### Enable 2FA - Setup
```
POST /api/auth/2fa/setup
```

Generate 2FA secret and QR code.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "backupCodes": [
    "ABC123DEF",
    "XYZ789GHI",
    "MNO456PQR"
  ]
}
```

---

### Enable 2FA - Verify
```
POST /api/auth/2fa/verify
```

Enable 2FA by verifying code from authenticator app.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Two-factor authentication enabled",
  "backupCodes": ["ABC123", "XYZ789"]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid code
- `500 Internal Server Error`

---

### Disable 2FA
```
POST /api/auth/2fa/disable
```

Disable two-factor authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "UserP@ss123"
}
```

**Response (200 OK):**
```json
{
  "message": "Two-factor authentication disabled"
}
```

---

## Token Management

### Revoke All Refresh Tokens
```
POST /api/auth/revoke-all-tokens
```

Invalidate all refresh tokens for the user (logout from all devices).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "All sessions revoked successfully"
}
```

---

## User Profile

### Update Profile
```
PUT /api/auth/profile
```

Update user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Passionate tango dancer from Buenos Aires",
  "city": "Buenos Aires",
  "country": "Argentina",
  "profileImage": "https://...",
  "tangoRoles": ["leader", "follower"],
  "yearsOfDancing": 5
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "name": "John Doe Updated",
    "bio": "Passionate tango dancer from Buenos Aires",
    ...
  }
}
```

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation error | Invalid request data |
| 401 | Invalid credentials | Wrong email/password |
| 401 | Token expired | Access token has expired |
| 401 | Invalid token | Token is malformed or invalid |
| 403 | Account suspended | User account is suspended |
| 403 | 2FA required | Two-factor code needed |
| 409 | Email already registered | Email already in use |
| 409 | Username already taken | Username unavailable |
| 500 | Internal server error | Server-side error occurred |

---

## Rate Limiting

Rate limits are applied per IP address:

| Endpoint | Limit |
|----------|-------|
| POST /register | 3 requests/minute |
| POST /login | 5 requests/minute |
| POST /forgot-password | 3 requests/hour |
| POST /resend-verification | 3 requests/hour |
| All other endpoints | 60 requests/minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640000000
```

---

## Authentication Flow

### Complete Registration Flow

```typescript
// 1. Register user
const { user, accessToken, verificationToken } = await register({
  email: 'user@example.com',
  password: 'SecureP@ss123',
  username: 'johndoe',
  name: 'John Doe'
});

// 2. Store token
localStorage.setItem('accessToken', accessToken);

// 3. User receives verification email
// 4. Verify email
await verifyEmail({ token: verificationToken });

// 5. Complete onboarding (separate API)
```

### Complete Login Flow

```typescript
// 1. Login
const response = await login({
  email: 'user@example.com',
  password: 'SecureP@ss123'
});

// 2. Check if 2FA required
if (response.requires2FA) {
  const code = await promptUser2FACode();
  const finalResponse = await login({
    email: 'user@example.com',
    password: 'SecureP@ss123',
    twoFactorCode: code
  });
  localStorage.setItem('accessToken', finalResponse.accessToken);
} else {
  localStorage.setItem('accessToken', response.accessToken);
}
```

---

## Security Best Practices

1. **Token Storage**: Store access tokens in memory or httpOnly cookies, never localStorage for production
2. **HTTPS Only**: All authentication endpoints must use HTTPS in production
3. **Password Requirements**: Minimum 8 characters, mix of uppercase, lowercase, numbers
4. **Rate Limiting**: Respect rate limits to avoid account lockout
5. **2FA**: Enable two-factor authentication for enhanced security
6. **Token Expiration**: Access tokens expire after 15 minutes, refresh tokens after 7 days
7. **Logout on Sensitive Actions**: Always logout from all devices after password change

---
