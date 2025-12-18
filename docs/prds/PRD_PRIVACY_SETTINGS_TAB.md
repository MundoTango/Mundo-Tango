# PRD: Privacy Settings Tab

## Overview
Comprehensive privacy management interface within the unified About tab, giving users granular control over profile visibility and data sharing.

## Features

### 1. Profile Visibility
- **Global Profile Visibility**: Public / Friends Only / Private
- **Search Discoverability**: Allow profile to appear in search results (toggle)
- **Online Status**: Show when online (toggle)

### 2. Field-Level Privacy Controls
Display summary of current field privacy settings with links to edit:
- Bio visibility
- Occupation visibility  
- Location visibility
- Languages visibility
- Email visibility
- Phone visibility
- Social links visibility

### 3. Interaction Privacy
- **Who can message me**: Everyone / Friends Only / No One
- **Who can see my friends list**: Everyone / Friends Only / Only Me
- **Who can see my events**: Everyone / Friends Only / Only Me
- **Who can tag me in posts**: Everyone / Friends Only / No One

### 4. Location Privacy
- **Location Sharing**: Enable/disable location sharing
- **Precise Location**: Show exact city vs region only
- **Travel Plans Visibility**: Everyone / Friends Only / Only Me

### 5. Activity Privacy
- **Activity Status**: Show last active time
- **Typing Indicators**: Show when typing in messages
- **Read Receipts**: Show when messages are read

## UI Components
- Card sections for each privacy category
- Switch toggles for boolean settings
- Select dropdowns for multi-option settings
- Visual indicators showing current privacy level (icons: Globe, Users, Lock)

## API Endpoints
- `GET /api/users/:id/privacy-settings`
- `PATCH /api/users/:id/privacy-settings`

## Database Schema
Uses existing `privacySettings` JSONB column in users table:
```typescript
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  searchDiscoverable: boolean;
  showOnlineStatus: boolean;
  messagePermission: 'everyone' | 'friends' | 'none';
  friendsListVisibility: 'everyone' | 'friends' | 'me';
  eventsVisibility: 'everyone' | 'friends' | 'me';
  tagPermission: 'everyone' | 'friends' | 'none';
  locationSharing: boolean;
  preciseLocation: boolean;
  travelPlansVisibility: 'everyone' | 'friends' | 'me';
  showActivityStatus: boolean;
  showTypingIndicators: boolean;
  showReadReceipts: boolean;
  fieldVisibility: {
    bio: 'public' | 'friends' | 'private';
    occupation: 'public' | 'friends' | 'private';
    location: 'public' | 'friends' | 'private';
    languages: 'public' | 'friends' | 'private';
    email: 'public' | 'friends' | 'private';
    phone: 'public' | 'friends' | 'private';
    socialLinks: 'public' | 'friends' | 'private';
  };
}
```
