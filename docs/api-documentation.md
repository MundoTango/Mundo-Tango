# Mundo Tango: API Documentation
## New Endpoints (Post-Launch Improvements)

This document provides comprehensive API documentation for all new endpoints added during the post-launch improvement phase.

---

## Table of Contents
- [Album Management API](#album-management-api)
- [Stripe Integration API](#stripe-integration-api)
- [Live Stream Chat API](#live-stream-chat-api)
- [WebSocket Endpoints](#websocket-endpoints)
- [Common Error Responses](#common-error-responses)

---

## Album Management API

The Album Management API allows users to create, organize, and manage media albums with privacy controls.

### GET /api/media/albums

Get all albums for the authenticated user.

**Authentication:** Required (JWT)

**Request:**
```http
GET /api/media/albums HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 123,
    "name": "Milonga Memories 2024",
    "description": "My favorite moments from milongas this year",
    "coverImageId": 456,
    "mediaCount": 12,
    "privacy": "public",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "coverImage": {
      "id": 456,
      "url": "https://cloudinary.com/...",
      "type": "image",
      "caption": "Cover photo"
    }
  }
]
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/media/albums" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

---

### POST /api/media/albums

Create a new album.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "My Dance Journey",
  "description": "Photos and videos from my tango learning experience",
  "privacy": "public"
}
```

**Privacy Options:**
- `public` - Visible to everyone
- `friends` - Visible only to friends
- `private` - Visible only to the owner

**Response:**
```json
{
  "id": 2,
  "userId": 123,
  "name": "My Dance Journey",
  "description": "Photos and videos from my tango learning experience",
  "coverImageId": null,
  "mediaCount": 0,
  "privacy": "public",
  "createdAt": "2024-01-16T14:30:00Z",
  "updatedAt": "2024-01-16T14:30:00Z"
}
```

**Example cURL:**
```bash
curl -X POST "https://api.mundotango.com/api/media/albums" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Dance Journey",
    "description": "Photos and videos from my tango learning experience",
    "privacy": "public"
  }'
```

**Error Responses:**
- `400 Bad Request` - Validation error (missing required fields)
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Failed to create album

---

### GET /api/media/albums/:id

Get a specific album with privacy checks.

**Authentication:** Optional (JWT) - Required for private/friends-only albums

**Request:**
```http
GET /api/media/albums/123 HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 123,
  "userId": 456,
  "name": "Festival Photos",
  "description": "Buenos Aires Tango Festival 2024",
  "coverImageId": 789,
  "mediaCount": 45,
  "privacy": "public",
  "createdAt": "2024-03-01T08:00:00Z",
  "updatedAt": "2024-03-05T16:00:00Z",
  "coverImage": {
    "id": 789,
    "url": "https://cloudinary.com/...",
    "type": "image",
    "caption": "Festival entrance"
  }
}
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/media/albums/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID
- `403 Forbidden` - Access denied (privacy restrictions)
- `404 Not Found` - Album not found
- `500 Internal Server Error` - Failed to fetch album

---

### PUT /api/media/albums/:id

Update an existing album.

**Authentication:** Required (JWT) - Must be album owner

**Request Body:**
```json
{
  "name": "Updated Album Name",
  "description": "Updated description",
  "coverImageId": 999,
  "privacy": "friends"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "id": 123,
  "userId": 456,
  "name": "Updated Album Name",
  "description": "Updated description",
  "coverImageId": 999,
  "mediaCount": 45,
  "privacy": "friends",
  "createdAt": "2024-03-01T08:00:00Z",
  "updatedAt": "2024-03-10T12:00:00Z"
}
```

**Example cURL:**
```bash
curl -X PUT "https://api.mundotango.com/api/media/albums/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Album Name",
    "privacy": "friends"
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Not the album owner
- `404 Not Found` - Album not found
- `500 Internal Server Error` - Failed to update album

---

### DELETE /api/media/albums/:id

Delete an album (cascade deletes all album media associations).

**Authentication:** Required (JWT) - Must be album owner

**Request:**
```http
DELETE /api/media/albums/123 HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

**Example cURL:**
```bash
curl -X DELETE "https://api.mundotango.com/api/media/albums/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Not the album owner
- `500 Internal Server Error` - Failed to delete album

---

### GET /api/media/albums/:id/media

Get all media items in an album with pagination.

**Authentication:** Optional (JWT) - Required for private/friends-only albums

**Query Parameters:**
- `limit` (optional) - Number of items per page (default: 50)
- `offset` (optional) - Number of items to skip (default: 0)

**Request:**
```http
GET /api/media/albums/123/media?limit=20&offset=0 HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```json
{
  "media": [
    {
      "id": 1,
      "albumId": 123,
      "mediaId": 456,
      "order": 0,
      "addedAt": "2024-03-01T10:00:00Z",
      "url": "https://cloudinary.com/...",
      "type": "image",
      "caption": "First dance of the night",
      "userId": 789
    },
    {
      "id": 2,
      "albumId": 123,
      "mediaId": 457,
      "order": 1,
      "addedAt": "2024-03-01T10:05:00Z",
      "url": "https://cloudinary.com/...",
      "type": "video",
      "caption": "Performance tango",
      "userId": 789
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/media/albums/123/media?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID or query parameters
- `403 Forbidden` - Access denied (privacy restrictions)
- `404 Not Found` - Album not found
- `500 Internal Server Error` - Failed to fetch media

---

### POST /api/media/albums/:id/media

Add a media item to an album.

**Authentication:** Required (JWT) - Must be album owner

**Request Body:**
```json
{
  "mediaId": 789,
  "order": 5
}
```

**Fields:**
- `mediaId` (required) - ID of the media item to add
- `order` (optional) - Display order (default: 0)

**Response:**
```json
{
  "id": 10,
  "albumId": 123,
  "mediaId": 789,
  "order": 5,
  "addedAt": "2024-03-10T15:30:00Z"
}
```

**Example cURL:**
```bash
curl -X POST "https://api.mundotango.com/api/media/albums/123/media" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": 789,
    "order": 5
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID or missing mediaId
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Not the album owner or media doesn't belong to user
- `404 Not Found` - Album or media not found
- `409 Conflict` - Media already in album
- `500 Internal Server Error` - Failed to add media to album

---

### DELETE /api/media/albums/:albumId/media/:mediaId

Remove a media item from an album.

**Authentication:** Required (JWT) - Must be album owner

**Request:**
```http
DELETE /api/media/albums/123/media/789 HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

**Example cURL:**
```bash
curl -X DELETE "https://api.mundotango.com/api/media/albums/123/media/789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `400 Bad Request` - Invalid album ID or media ID
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Not the album owner
- `404 Not Found` - Album or media association not found
- `500 Internal Server Error` - Failed to remove media from album

---

## Stripe Integration API

Handles subscription payments, pricing tiers, and checkout sessions via Stripe.

### POST /api/pricing/checkout-session

Create a Stripe checkout session for tier upgrade.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "tierId": 2,
  "billingInterval": "monthly",
  "promoCode": "TANGO2024"
}
```

**Fields:**
- `tierId` (required) - ID of the pricing tier to purchase
- `billingInterval` (optional) - "monthly" or "annual" (default: "monthly")
- `promoCode` (optional) - Promotional code for discount

**Response:**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0",
  "checkoutSession": {
    "id": 1,
    "userId": 123,
    "stripeSessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "tierId": 2,
    "priceId": "price_1234567890",
    "billingInterval": "monthly",
    "amount": 1999,
    "promoCodeId": 5,
    "status": "pending",
    "expiresAt": "2024-03-11T15:30:00Z",
    "successUrl": "https://mundotango.com/upgrade/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "https://mundotango.com/upgrade/cancelled",
    "metadata": {
      "sessionUrl": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
    },
    "createdAt": "2024-03-10T15:30:00Z"
  }
}
```

**Example cURL:**
```bash
curl -X POST "https://api.mundotango.com/api/pricing/checkout-session" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tierId": 2,
    "billingInterval": "monthly",
    "promoCode": "TANGO2024"
  }'
```

**Error Responses:**
- `400 Bad Request` - Missing tierId or no price available for billing interval
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Tier not found
- `503 Service Unavailable` - Payment system unavailable (Stripe not configured)
- `500 Internal Server Error` - Failed to create checkout session

---

### GET /api/subscriptions/tiers

Get all active pricing tiers (public endpoint).

**Authentication:** Optional

**Request:**
```http
GET /api/subscriptions/tiers HTTP/1.1
Host: api.mundotango.com
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "free",
    "displayName": "Free",
    "description": "Basic features for casual dancers",
    "monthlyPrice": 0,
    "annualPrice": 0,
    "stripeMonthlyPriceId": null,
    "stripeAnnualPriceId": null,
    "stripeProductId": null,
    "displayOrder": 1,
    "isPopular": false,
    "isVisible": true,
    "features": [
      "Create profile",
      "Browse events",
      "Connect with 5 dancers",
      "Basic messaging"
    ],
    "roleLevel": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "pro",
    "displayName": "Pro",
    "description": "For serious tango enthusiasts",
    "monthlyPrice": 1999,
    "annualPrice": 19999,
    "stripeMonthlyPriceId": "price_1234567890",
    "stripeAnnualPriceId": "price_0987654321",
    "stripeProductId": "prod_ABCDEF123456",
    "displayOrder": 2,
    "isPopular": true,
    "isVisible": true,
    "features": [
      "All Free features",
      "Unlimited connections",
      "Advanced event search",
      "Private messaging",
      "Video uploads",
      "Create events"
    ],
    "roleLevel": 3,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/subscriptions/tiers"
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch pricing tiers

---

### GET /api/subscriptions/me

Get current user's active subscription.

**Authentication:** Required (JWT)

**Request:**
```http
GET /api/subscriptions/me HTTP/1.1
Host: api.mundotango.com
Authorization: Bearer <token>
```

**Response:**
```json
{
  "subscription": {
    "id": 42,
    "userId": 123,
    "planId": "pro",
    "status": "active",
    "currentPeriodStart": "2024-03-01T00:00:00Z",
    "currentPeriodEnd": "2024-04-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "paymentProvider": "stripe",
    "providerSubscriptionId": "sub_1234567890",
    "metadata": {
      "billingInterval": "monthly"
    },
    "createdAt": "2024-03-01T00:00:00Z",
    "updatedAt": "2024-03-01T00:00:00Z"
  },
  "tier": {
    "id": 2,
    "name": "pro",
    "displayName": "Pro",
    "description": "For serious tango enthusiasts",
    "monthlyPrice": 1999,
    "annualPrice": 19999,
    "features": [
      "All Free features",
      "Unlimited connections",
      "Advanced event search",
      "Private messaging",
      "Video uploads",
      "Create events"
    ]
  }
}
```

**Response (No Active Subscription):**
```json
null
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/subscriptions/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Failed to fetch subscription

---

## Live Stream Chat API

Real-time chat messaging for live streams with WebSocket integration.

### GET /api/livestreams/:id/messages

Get message history for a stream.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `limit` (optional) - Number of messages to return (default: 50)
- `offset` (optional) - Number of messages to skip (default: 0)

**Request:**
```http
GET /api/livestreams/123/messages?limit=50&offset=0 HTTP/1.1
Host: api.mundotango.com
```

**Response:**
```json
[
  {
    "id": 1,
    "streamId": 123,
    "userId": 456,
    "message": "Great performance!",
    "createdAt": "2024-03-10T20:15:00Z",
    "username": "maria_tango",
    "profileImage": "https://cloudinary.com/..."
  },
  {
    "id": 2,
    "streamId": 123,
    "userId": 789,
    "message": "Love this music!",
    "createdAt": "2024-03-10T20:16:00Z",
    "username": "carlos_dancer",
    "profileImage": "https://cloudinary.com/..."
  }
]
```

**Example cURL:**
```bash
curl -X GET "https://api.mundotango.com/api/livestreams/123/messages?limit=50&offset=0"
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch messages

---

### POST /api/livestreams/:id/messages

Send a chat message to a stream.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "message": "Amazing show! 💃"
}
```

**Response:**
```json
{
  "id": 3,
  "streamId": 123,
  "userId": 456,
  "message": "Amazing show! 💃",
  "createdAt": "2024-03-10T20:17:00Z",
  "username": "maria_tango",
  "profileImage": "https://cloudinary.com/..."
}
```

**Example cURL:**
```bash
curl -X POST "https://api.mundotango.com/api/livestreams/123/messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Amazing show! 💃"
  }'
```

**Error Responses:**
- `400 Bad Request` - Message is required or empty
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Failed to send message

---

## WebSocket Endpoints

Real-time bidirectional communication for notifications and live streaming.

### ws://host/ws/notifications

WebSocket connection for real-time user notifications.

**Authentication:** Query parameter `userId` required

**Connection URL:**
```
ws://api.mundotango.com/ws/notifications?userId=123
```

**Connection Example (JavaScript):**
```javascript
const ws = new WebSocket('ws://api.mundotango.com/ws/notifications?userId=123');

ws.onopen = () => {
  console.log('Connected to notifications');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from notifications');
};
```

**Message Types Received:**

**Friend Request:**
```json
{
  "type": "friend_request",
  "data": {
    "requestId": 123,
    "fromUserId": 456,
    "fromUsername": "carlos_tango",
    "fromProfileImage": "https://cloudinary.com/...",
    "createdAt": "2024-03-10T15:00:00Z"
  }
}
```

**New Message:**
```json
{
  "type": "new_message",
  "data": {
    "messageId": 789,
    "fromUserId": 456,
    "fromUsername": "maria_dancer",
    "content": "Hi! Want to practice this weekend?",
    "createdAt": "2024-03-10T15:05:00Z"
  }
}
```

**Event Invitation:**
```json
{
  "type": "event_invitation",
  "data": {
    "eventId": 101,
    "eventTitle": "Milonga del Corazón",
    "invitedBy": "carlos_organizer",
    "date": "2024-03-15T20:00:00Z"
  }
}
```

**Connection Responses:**
- `1008 Policy Violation` - Missing userId parameter
- `1011 Internal Error` - Server error

---

### ws://host/ws/stream/{streamId}

WebSocket connection for live stream chat and interactions.

**Authentication:** Not required for viewing, userId sent in join message

**Connection URL:**
```
ws://api.mundotango.com/ws/stream/123
```

**Connection Example (JavaScript):**
```javascript
const streamId = 123;
const ws = new WebSocket(`ws://api.mundotango.com/ws/stream/${streamId}`);

ws.onopen = () => {
  // Join the stream
  ws.send(JSON.stringify({
    type: 'join',
    userId: 456,
    username: 'maria_tango'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'connected':
      console.log('Connected to stream:', data.streamId);
      break;
    case 'chat':
      console.log('Chat message:', data);
      break;
    case 'typing':
      console.log('User typing:', data.username);
      break;
  }
};
```

**Message Types Sent:**

**Join Stream:**
```json
{
  "type": "join",
  "userId": 456,
  "username": "maria_tango"
}
```

**Send Chat Message:**
```json
{
  "type": "chat",
  "data": {
    "userId": 456,
    "username": "maria_tango",
    "message": "Great performance!",
    "profileImage": "https://cloudinary.com/..."
  }
}
```

**Typing Indicator:**
```json
{
  "type": "typing",
  "username": "maria_tango"
}
```

**Message Types Received:**

**Connected:**
```json
{
  "type": "connected",
  "streamId": "123"
}
```

**Chat Message:**
```json
{
  "type": "chat",
  "userId": 789,
  "username": "carlos_dancer",
  "message": "Amazing!",
  "profileImage": "https://cloudinary.com/...",
  "timestamp": "2024-03-10T20:30:00Z"
}
```

**User Typing:**
```json
{
  "type": "typing",
  "userId": 789,
  "username": "carlos_dancer"
}
```

**Connection Responses:**
- `1008 Policy Violation` - Missing streamId in URL
- `1011 Internal Error` - Server error

---

## Common Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request
Invalid request format or missing required fields.

```json
{
  "message": "Validation error",
  "errors": "name: Required; privacy: Invalid enum value. Expected 'public' | 'friends' | 'private'"
}
```

### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "message": "Unauthorized"
}
```

or

```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
User doesn't have permission to access the resource.

```json
{
  "message": "Access denied"
}
```

or

```json
{
  "message": "Not authorized"
}
```

### 404 Not Found
Requested resource doesn't exist.

```json
{
  "message": "Album not found"
}
```

### 409 Conflict
Resource conflict (e.g., duplicate entry).

```json
{
  "message": "Media already in album"
}
```

### 500 Internal Server Error
Server-side error occurred.

```json
{
  "message": "Failed to create album"
}
```

or (in development mode):

```json
{
  "message": "Internal server error",
  "error": "Detailed error message (dev only)"
}
```

### 503 Service Unavailable
Required service is not available.

```json
{
  "message": "Payment system unavailable"
}
```

---

## Authentication

Most endpoints require JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

To obtain a JWT token, authenticate via the login endpoint:

```bash
curl -X POST "https://api.mundotango.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "maria_tango",
    "email": "user@example.com"
  }
}
```

---

## Rate Limiting

All API endpoints are subject to rate limiting to ensure fair usage and platform stability. Current limits:

- **General endpoints:** 100 requests per minute per user
- **Chat/Messaging endpoints:** 30 requests per minute per user
- **WebSocket connections:** 5 connections per user

When rate limit is exceeded, the API returns:

```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Pagination

List endpoints support pagination via query parameters:

- `limit` - Number of items per page (max: 100)
- `offset` - Number of items to skip

Example:
```
GET /api/media/albums/123/media?limit=20&offset=40
```

Paginated responses include:
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 40
}
```

---

## API Versioning

Current API version: **v1** (default)

Future versions will be accessible via URL path:
- v1: `https://api.mundotango.com/api/...` (current)
- v2: `https://api.mundotango.com/api/v2/...` (future)

---

## Support

For API support, questions, or bug reports:

- **Email:** api-support@mundotango.com
- **Documentation:** https://docs.mundotango.com
- **Status Page:** https://status.mundotango.com

---

**Last Updated:** January 16, 2025  
**API Version:** 1.0.0
