# PRD: Security Settings Tab

## Overview
Comprehensive security management interface for account protection, authentication methods, and session management.

## Features

### 1. Password Management
- **Change Password**: Form with current password, new password, confirm password
- **Password Strength Indicator**: Visual meter showing password strength
- **Last Password Change**: Display when password was last changed
- **Password Requirements**: Min 8 chars, uppercase, lowercase, number, special char

### 2. Two-Factor Authentication (2FA)
- **2FA Status**: Enabled/Disabled with visual indicator
- **Setup 2FA**: 
  - QR code for authenticator app
  - Backup codes (10 codes, one-time use)
  - SMS verification option
- **Manage 2FA**:
  - Regenerate backup codes
  - Change 2FA method
  - Disable 2FA (requires current password)

### 3. Login Sessions
- **Active Sessions**: List of all logged-in devices
  - Device name/type (icon)
  - Browser
  - IP address (partially masked)
  - Location (city, country)
  - Last active timestamp
  - "This device" indicator
- **Session Actions**:
  - Log out individual session
  - Log out all other sessions
  - Log out everywhere (including current)

### 4. Login History
- **Recent Login Attempts**: Last 10 login attempts
  - Date/time
  - Device/browser
  - IP address
  - Location
  - Status (Success/Failed)
  - Suspicious activity flag

### 5. Security Alerts
- **Email on new login**: Toggle
- **Email on password change**: Toggle
- **Email on failed login attempts**: Toggle
- **Login from new device alert**: Toggle

### 6. Connected Apps
- **Third-party apps**: List of apps with access to account
  - App name and icon
  - Permissions granted
  - Date connected
  - Revoke access button

### 7. Account Recovery
- **Recovery Email**: Set/update recovery email
- **Recovery Phone**: Set/update recovery phone
- **Security Questions**: Set security questions (optional)

### 8. Account Actions
- **Download Account Data**: Export all personal data (GDPR)
- **Deactivate Account**: Temporary deactivation
- **Delete Account**: Permanent deletion with confirmation

## UI Components
- Card sections for each security category
- Password input with show/hide toggle
- Progress bar for password strength
- Device icons (laptop, phone, tablet)
- Status badges (Active, Suspicious, Blocked)
- Confirmation dialogs for destructive actions
- QR code component for 2FA setup

## API Endpoints
- `POST /api/auth/change-password`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`
- `DELETE /api/auth/2fa`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:id`
- `DELETE /api/auth/sessions/all`
- `GET /api/auth/login-history`
- `GET /api/auth/connected-apps`
- `DELETE /api/auth/connected-apps/:id`
- `POST /api/account/export`
- `POST /api/account/deactivate`
- `DELETE /api/account`

## Security Considerations
- Rate limit password change attempts
- Require current password for sensitive changes
- Send email notifications for security events
- Log all security-related actions
- Hash passwords with bcrypt (cost factor 12)
