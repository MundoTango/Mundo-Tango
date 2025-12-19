# PRD: Notifications Settings Tab

## Overview
Comprehensive notification preferences management, allowing users to control how and when they receive notifications across email, push, and in-app channels.

## Features

### 1. Global Notification Controls
- **Master Email Toggle**: Enable/disable all email notifications
- **Master Push Toggle**: Enable/disable all push notifications
- **Quiet Hours**: Set time range when notifications are muted (e.g., 10 PM - 8 AM)
- **Notification Sound**: Enable/disable notification sounds

### 2. Social Notifications
| Notification Type | Email | Push | In-App |
|------------------|-------|------|--------|
| New follower/friend request | ☐ | ☐ | ☐ |
| Friend request accepted | ☐ | ☐ | ☐ |
| New message | ☐ | ☐ | ☐ |
| Mention in post | ☐ | ☐ | ☐ |
| Comment on your post | ☐ | ☐ | ☐ |
| Like on your post | ☐ | ☐ | ☐ |
| Tagged in photo | ☐ | ☐ | ☐ |

### 3. Event Notifications
| Notification Type | Email | Push | In-App |
|------------------|-------|------|--------|
| Event invitation | ☐ | ☐ | ☐ |
| Event reminder (24h before) | ☐ | ☐ | ☐ |
| Event update/change | ☐ | ☐ | ☐ |
| Event cancelled | ☐ | ☐ | ☐ |
| New event in your city | ☐ | ☐ | ☐ |
| Event you're interested in | ☐ | ☐ | ☐ |

### 4. Group Notifications
| Notification Type | Email | Push | In-App |
|------------------|-------|------|--------|
| Group invitation | ☐ | ☐ | ☐ |
| New post in group | ☐ | ☐ | ☐ |
| Added as group admin | ☐ | ☐ | ☐ |
| Group announcement | ☐ | ☐ | ☐ |

### 5. Professional Notifications (PRO users)
| Notification Type | Email | Push | In-App |
|------------------|-------|------|--------|
| New booking request | ☐ | ☐ | ☐ |
| Booking confirmed | ☐ | ☐ | ☐ |
| New review received | ☐ | ☐ | ☐ |
| Talent match inquiry | ☐ | ☐ | ☐ |

### 6. System Notifications
| Notification Type | Email | Push | In-App |
|------------------|-------|------|--------|
| Security alerts | ☐ | ☐ | ☐ |
| Account updates | ☐ | ☐ | ☐ |
| New features | ☐ | ☐ | ☐ |
| Weekly digest | ☐ | ☐ | ☐ |

### 7. Email Frequency
- **Digest Mode**: Immediate / Daily Digest / Weekly Digest
- **Marketing Emails**: Opt-in/out for promotional content

## UI Components
- Expandable accordion sections for each notification category
- 3-column checkbox grid (Email/Push/In-App)
- Time picker for quiet hours
- Switch toggles for master controls

## API Endpoints
- `GET /api/users/:id/notification-preferences`
- `PATCH /api/users/:id/notification-preferences`

## Database Schema
Uses existing notification preference columns + new JSONB for granular control:
```typescript
interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHoursStart: string | null; // "22:00"
  quietHoursEnd: string | null; // "08:00"
  soundEnabled: boolean;
  digestMode: 'immediate' | 'daily' | 'weekly';
  marketingEmails: boolean;
  categories: {
    social: { email: boolean; push: boolean; inApp: boolean; };
    events: { email: boolean; push: boolean; inApp: boolean; };
    groups: { email: boolean; push: boolean; inApp: boolean; };
    professional: { email: boolean; push: boolean; inApp: boolean; };
    system: { email: boolean; push: boolean; inApp: boolean; };
  };
}
```
