# MundoTango Customer Journey Map

Detailed documentation of all standard user journeys with routes and key interactions.

---

## Journey 1: Onboarding

**Goal:** New user registration through to first feed view

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/register` | `01-register-page.png` | Registration form with email/password |
| 2 | `/register` | `02-registration-form-filled.png` | Form with data entered |
| 3 | `/onboarding/welcome` | `03-onboarding-welcome.png` | Welcome screen with platform intro |
| 4 | `/onboarding/profile` | `04-onboarding-profile.png` | Profile setup (name, photo, bio) |
| 5 | `/onboarding/preferences` | `05-onboarding-preferences.png` | Dance style preferences |
| 6 | `/onboarding/location` | `06-onboarding-location.png` | City selection + auto-join group |
| 7 | `/feed` | `07-onboarding-complete-feed.png` | Main feed (journey complete) |

**Key Interactions:**
- Email verification
- Profile photo upload
- City group auto-join

---

## Journey 2: Feed & Social

**Goal:** Browse feed, create posts, interact with content

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/feed` | `01-main-feed.png` | Main social feed with posts |
| 2 | `/feed` | `02-create-post-modal.png` | New post creation modal |
| 3 | `/feed` | `03-post-detail.png` | Single post expanded view |
| 4 | `/feed` | `04-comments-section.png` | Comments on a post |
| 5 | `/feed` | `05-reactions.png` | Reaction options (like, love, etc.) |

**Key Interactions:**
- Create text/photo posts
- Comment on posts
- React to posts
- Share posts

---

## Journey 3: Events

**Goal:** Discover events, RSVP, check-in, create events

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/events` | `01-events-list.png` | Browse all events |
| 2 | `/events` | `02-events-filters.png` | Filter by date, city, type |
| 3 | `/events/:id` | `03-event-detail.png` | Event detail page |
| 4 | `/events/:id` | `04-rsvp-modal.png` | RSVP confirmation |
| 5 | `/events` | `05-check-in-ready.png` | Events ready for check-in |
| 6 | `/events/create` | `06-create-event-form.png` | Create new event |

**Key Interactions:**
- RSVP to events (Going/Maybe/Not Going)
- Check-in at events
- View attendee list
- Create milonga, practica, workshop events

---

## Journey 4: Cities & Groups

**Goal:** Explore city communities and join groups

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/city-groups` | `01-city-groups-overview.png` | World map of tango cities |
| 2 | `/city/:slug` | `02-city-page-buenos-aires.png` | City landing page |
| 3 | `/city/:slug` | `03-city-events.png` | Events in the city |
| 4 | `/city/:slug` | `04-city-members.png` | Members in the city |
| 5 | `/groups` | `05-groups-list.png` | All groups listing |
| 6 | `/groups/:id` | `06-join-group-button.png` | Group join flow |

**Key Interactions:**
- Browse cities by region
- View city-specific events
- Join city groups
- Connect with local dancers

---

## Journey 5: Profile

**Goal:** View and manage personal profile

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/profile` or `/:username` | `01-profile-main.png` | Profile header and overview |
| 2 | `/profile` | `02-profile-posts.png` | Posts tab |
| 3 | `/profile` | `03-profile-travel.png` | Travel history tab |
| 4 | `/profile` | `04-profile-events.png` | Attended events tab |
| 5 | `/profile` | `05-profile-photos.png` | Photo gallery tab |
| 6 | `/profile` | `06-profile-about.png` | Bio and details tab |
| 7 | `/profile/edit` | `07-profile-edit.png` | Edit profile form |

**Key Interactions:**
- Upload profile/cover photos
- Edit bio and dance preferences
- View activity history
- Manage privacy settings

---

## Journey 6: Friends

**Goal:** Build connections with other dancers

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/friend-requests` | `01-friend-requests.png` | Pending requests |
| 2 | `/friends` | `02-friends-list.png` | All friends |
| 3 | `/friendship` | `03-friendship-connections.png` | Mutual connections |
| 4 | `/:username` | `04-send-friend-request.png` | Add friend button |

**Key Interactions:**
- Send friend requests
- Accept/decline requests
- View mutual friends
- Unfriend users

---

## Journey 7: Messages

**Goal:** Private communication with other users

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/messages` | `01-messages-inbox.png` | Conversation list |
| 2 | `/messages/:id` | `02-conversation-view.png` | Active chat |
| 3 | `/messages` | `03-compose-message.png` | New message modal |
| 4 | `/messages/:id` | `04-message-input.png` | Message composer |

**Key Interactions:**
- Start new conversations
- Send text messages
- View read receipts
- Delete conversations

---

## Journey 8: Travel

**Goal:** Plan tango travel and connect with dancers abroad

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/travel` | `01-travel-overview.png` | Travel dashboard |
| 2 | `/travel/planner` | `02-travel-planner.png` | Trip planning tool |
| 3 | `/travel/planner` | `03-create-trip-form.png` | New trip creation |
| 4 | `/travel/trip/:id` | `04-trip-detail.png` | Trip details |
| 5 | `/travel` | `05-travel-connections.png` | Dancers at destination |

**Key Interactions:**
- Plan upcoming trips
- See who's traveling where
- Connect before arrival
- Share travel updates

---

## Journey 9: Housing

**Goal:** Find tango-friendly accommodation (browse-only for standard users)

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/housing/search` | `01-housing-search.png` | Search interface |
| 2 | `/housing/search` | `02-housing-filters.png` | Filter options |
| 3 | `/housing/search` | `03-housing-results.png` | Listing results |
| 4 | `/housing/listing/:id` | `04-housing-listing-detail.png` | Listing details |
| 5 | `/housing/listing/:id` | `05-housing-contact.png` | Contact host option |

**Key Interactions:**
- Search by city
- Filter by price, amenities
- View listing photos
- Contact hosts (limited for free tier)

---

## Journey 10: Mr. Blue (Basic Chat)

**Goal:** Get help and recommendations from AI assistant

| Step | Route | Screenshot | Description |
|------|-------|------------|-------------|
| 1 | `/mr-blue-chat` | `01-mr-blue-chat-interface.png` | Chat interface |
| 2 | `/mr-blue-chat` | `02-mr-blue-chat-input.png` | User typing message |
| 3 | `/mr-blue-chat` | `03-mr-blue-response.png` | AI response |
| 4 | `/mr-blue-chat` | `04-mr-blue-history.png` | Conversation history |

**Key Interactions:**
- Ask about events
- Get tango recommendations
- Platform help
- Limited to 10-50 msgs/hour (Tier 0-2)

---

## Excluded Journeys (Pro+ Only)

The following are NOT included in standard user documentation:

- ❌ VibeCoding / Autonomous Development (Tier 7+)
- ❌ Admin Dashboard
- ❌ Marketing Pages (/landing, /about, /features)
- ❌ Crowdfunding
- ❌ Marketplace
- ❌ Settings (separate documentation)
