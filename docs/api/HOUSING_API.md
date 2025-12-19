# Housing API Documentation

## Overview
Peer-to-peer housing marketplace for tango dancers. Supports listing creation, search with filters, booking requests, and review system.

**Base URL:** `/api/housing`

**Authentication:** JWT Bearer token required for most endpoints

**Rate Limits:**
- Create Listing: 5 requests/hour
- Search Listings: 100 requests/minute
- Booking Request: 20 requests/hour
- Reviews: 10 requests/hour
- Other: 60 requests/minute

---

## Table of Contents
1. [Listing Management](#listing-management)
2. [Listing Discovery](#listing-discovery)
3. [Booking System](#booking-system)
4. [Review System](#review-system)
5. [Host Dashboard](#host-dashboard)

---

## Listing Management

### Create Listing
```
POST /api/housing/listings
```

Create a new housing listing.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Cozy Apartment in San Telmo",
  "description": "Beautiful 2-bedroom apartment in the heart of San Telmo, perfect for tango dancers. Walking distance to milongas and praticas.",
  "propertyType": "apartment",
  "roomType": "entire_place",
  "address": "Defensa 1250",
  "city": "Buenos Aires",
  "country": "Argentina",
  "neighborhood": "San Telmo",
  "latitude": "-34.6217",
  "longitude": "-58.3731",
  "price": 75,
  "currency": "USD",
  "priceUnit": "night",
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "amenities": [
    "wifi",
    "kitchen",
    "air_conditioning",
    "heating",
    "workspace",
    "washer"
  ],
  "houseRules": [
    "No smoking",
    "No parties",
    "Check-in after 3 PM",
    "Check-out before 11 AM"
  ],
  "images": [
    "https://example.com/listings/img1.jpg",
    "https://example.com/listings/img2.jpg",
    "https://example.com/listings/img3.jpg"
  ],
  "instantBook": false,
  "minimumNights": 3,
  "maximumNights": 30,
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "moderate"
}
```

**Field Descriptions:**
- `title` (required): Listing title (10-100 characters)
- `description` (required): Detailed description (50-5000 characters)
- `propertyType` (required): `house`, `apartment`, `studio`, `room`, `hostel`
- `roomType` (required): `entire_place`, `private_room`, `shared_room`
- `price` (required): Nightly rate
- `currency` (required): Currency code (USD, EUR, ARS, etc.)
- `bedrooms`, `beds`, `bathrooms`, `maxGuests`: Capacity details
- `amenities`: Array of available amenities
- `instantBook`: Auto-approve bookings without host confirmation

**Response (201 Created):**
```json
{
  "id": 789,
  "hostId": 123,
  "title": "Cozy Apartment in San Telmo",
  "description": "Beautiful 2-bedroom apartment...",
  "propertyType": "apartment",
  "roomType": "entire_place",
  "city": "Buenos Aires",
  "neighborhood": "San Telmo",
  "price": 75,
  "currency": "USD",
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "averageRating": null,
  "reviewCount": 0,
  "status": "active",
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/housing/listings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cozy Apartment in San Telmo",
    "description": "Beautiful 2-bedroom apartment...",
    "propertyType": "apartment",
    "roomType": "entire_place",
    "city": "Buenos Aires",
    "price": 75,
    "currency": "USD",
    "bedrooms": 2,
    "maxGuests": 4
  }'
```

---

### Update Listing
```
PUT /api/housing/listings/:id
```

Update listing details. Only the host can update.

**Request Body:** (Partial update supported)
```json
{
  "price": 80,
  "minimumNights": 2,
  "description": "Updated description..."
}
```

**Response (200 OK):**
```json
{
  "id": 789,
  "price": 80,
  "minimumNights": 2,
  "updatedAt": "2025-11-02T11:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Not the listing owner
- `404 Not Found` - Listing doesn't exist
- `500 Internal Server Error`

---

### Delete Listing
```
DELETE /api/housing/listings/:id
```

Delete a listing. Only the host can delete.

**Response (204 No Content)**

**Error Responses:**
- `401 Unauthorized`
- `403 Forbidden` - Not the listing owner
- `404 Not Found`
- `500 Internal Server Error`

---

## Listing Discovery

### Search Listings
```
GET /api/housing/listings
```

Search and filter housing listings.

**Query Parameters:**
- `city` (optional): Filter by city
- `country` (optional): Filter by country
- `propertyType` (optional): Filter by property type
- `roomType` (optional): Filter by room type
- `minPrice` (optional): Minimum price per night
- `maxPrice` (optional): Maximum price per night
- `bedrooms` (optional): Minimum number of bedrooms
- `maxGuests` (optional): Minimum guest capacity
- `amenities` (optional): Comma-separated amenity list
- `checkIn` (optional): Check-in date (ISO 8601)
- `checkOut` (optional): Check-out date (ISO 8601)
- `instantBook` (optional): Only instant bookable listings
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "listings": [
    {
      "id": 789,
      "hostId": 123,
      "host": {
        "id": 123,
        "name": "Maria Rodriguez",
        "profileImage": "https://...",
        "verifiedHost": true,
        "responseRate": 98,
        "responseTime": "within an hour"
      },
      "title": "Cozy Apartment in San Telmo",
      "propertyType": "apartment",
      "roomType": "entire_place",
      "city": "Buenos Aires",
      "neighborhood": "San Telmo",
      "price": 75,
      "currency": "USD",
      "bedrooms": 2,
      "beds": 2,
      "bathrooms": 1,
      "maxGuests": 4,
      "images": ["https://example.com/listings/img1.jpg"],
      "averageRating": 4.8,
      "reviewCount": 24,
      "instantBook": false,
      "available": true
    }
  ],
  "total": 156,
  "filters": {
    "city": "Buenos Aires",
    "maxPrice": 100
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://api.mundotango.com/api/housing/listings?city=Buenos%20Aires&maxPrice=100&bedrooms=2&limit=20"
```

**TypeScript Example:**
```typescript
import { useQuery } from '@tanstack/react-query';

interface SearchFilters {
  city?: string;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
}

const useListings = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
  if (filters.bedrooms) params.append('bedrooms', String(filters.bedrooms));
  if (filters.amenities) params.append('amenities', filters.amenities.join(','));
  
  return useQuery({
    queryKey: ['housing', filters],
    queryFn: () => 
      fetch(`/api/housing/listings?${params.toString()}`).then(r => r.json()),
  });
};
```

---

### Get Listing Details
```
GET /api/housing/listings/:id
```

Get detailed information about a specific listing.

**Response (200 OK):**
```json
{
  "id": 789,
  "hostId": 123,
  "host": {
    "id": 123,
    "name": "Maria Rodriguez",
    "username": "maria_tango",
    "profileImage": "https://...",
    "bio": "Tango dancer and host...",
    "verifiedHost": true,
    "memberSince": "2020-03-15",
    "responseRate": 98,
    "responseTime": "within an hour",
    "listingCount": 3
  },
  "title": "Cozy Apartment in San Telmo",
  "description": "Beautiful 2-bedroom apartment in the heart of San Telmo...",
  "propertyType": "apartment",
  "roomType": "entire_place",
  "address": "Defensa 1250",
  "city": "Buenos Aires",
  "country": "Argentina",
  "neighborhood": "San Telmo",
  "latitude": "-34.6217",
  "longitude": "-58.3731",
  "price": 75,
  "currency": "USD",
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "amenities": ["wifi", "kitchen", "air_conditioning"],
  "houseRules": ["No smoking", "No parties"],
  "images": [
    "https://example.com/listings/img1.jpg",
    "https://example.com/listings/img2.jpg"
  ],
  "instantBook": false,
  "minimumNights": 3,
  "maximumNights": 30,
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "moderate",
  "averageRating": 4.8,
  "reviewCount": 24,
  "status": "active",
  "createdAt": "2025-10-01T10:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Listing doesn't exist
- `500 Internal Server Error`

---

## Booking System

### Create Booking Request
```
POST /api/housing/bookings
```

Request to book a listing. If `instantBook` is true, booking is auto-confirmed.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "listingId": 789,
  "checkInDate": "2025-11-20",
  "checkOutDate": "2025-11-25",
  "guests": 2,
  "message": "Hi Maria! I'll be in Buenos Aires for a tango festival. Your place looks perfect! Looking forward to staying."
}
```

**Response (201 Created):**
```json
{
  "id": 234,
  "listingId": 789,
  "guestId": 456,
  "hostId": 123,
  "checkInDate": "2025-11-20",
  "checkOutDate": "2025-11-25",
  "guests": 2,
  "nights": 5,
  "pricePerNight": 75,
  "totalPrice": 375,
  "currency": "USD",
  "status": "pending",
  "message": "Hi Maria! I'll be in Buenos Aires...",
  "createdAt": "2025-11-02T14:00:00.000Z",
  "expiresAt": "2025-11-03T14:00:00.000Z"
}
```

**Booking Status:**
- `pending` - Awaiting host approval (24-hour expiration)
- `confirmed` - Host approved booking
- `declined` - Host declined booking
- `cancelled` - Guest or host cancelled
- `completed` - Stay completed

**Error Responses:**
- `400 Bad Request` - Invalid dates or listing unavailable
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Listing doesn't exist
- `409 Conflict` - Dates already booked
- `500 Internal Server Error`

---

### Get User Bookings
```
GET /api/housing/bookings
```

Get all bookings for the authenticated user (as guest or host).

**Query Parameters:**
- `role` (optional): Filter by role (`guest` or `host`)
- `status` (optional): Filter by status
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "bookings": [
    {
      "id": 234,
      "listing": {
        "id": 789,
        "title": "Cozy Apartment in San Telmo",
        "images": ["https://..."]
      },
      "host": {
        "id": 123,
        "name": "Maria Rodriguez",
        "profileImage": "https://..."
      },
      "checkInDate": "2025-11-20",
      "checkOutDate": "2025-11-25",
      "guests": 2,
      "totalPrice": 375,
      "currency": "USD",
      "status": "confirmed",
      "createdAt": "2025-11-02T14:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

### Update Booking Status
```
PUT /api/housing/bookings/:id/status
```

Update booking status (host approval, cancellation, etc.).

**Request Body:**
```json
{
  "status": "confirmed",
  "message": "Great! Looking forward to hosting you. I'll send check-in instructions closer to your arrival date."
}
```

**Response (200 OK):**
```json
{
  "id": 234,
  "status": "confirmed",
  "confirmedAt": "2025-11-02T15:00:00.000Z",
  "hostMessage": "Great! Looking forward to hosting you..."
}
```

---

## Review System

### Submit Review
```
POST /api/housing/reviews
```

Submit a review after a completed stay.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bookingId": 234,
  "listingId": 789,
  "rating": 5,
  "cleanliness": 5,
  "communication": 5,
  "checkIn": 5,
  "accuracy": 5,
  "location": 5,
  "value": 4,
  "comment": "Maria's apartment was perfect! Clean, comfortable, and exactly as described. The location in San Telmo is unbeatable - walked to 3 different milongas. Highly recommend!",
  "privateComment": "Everything was great! Would love to return."
}
```

**Rating Fields (1-5 scale):**
- `rating` (required): Overall rating
- `cleanliness`: How clean was the property
- `communication`: Host communication quality
- `checkIn`: Check-in process ease
- `accuracy`: How well listing matched description
- `location`: Location quality
- `value`: Value for money

**Response (201 Created):**
```json
{
  "id": 567,
  "bookingId": 234,
  "listingId": 789,
  "reviewerId": 456,
  "rating": 5,
  "cleanliness": 5,
  "communication": 5,
  "checkIn": 5,
  "accuracy": 5,
  "location": 5,
  "value": 4,
  "comment": "Maria's apartment was perfect!...",
  "createdAt": "2025-11-26T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Booking not completed or already reviewed
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Booking/listing doesn't exist
- `500 Internal Server Error`

---

### Get Listing Reviews
```
GET /api/housing/reviews/:listingId
```

Get all reviews for a listing.

**Query Parameters:**
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset
- `sortBy` (optional): Sort by `recent` or `rating` (default: recent)

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": 567,
      "reviewer": {
        "id": 456,
        "name": "John Doe",
        "profileImage": "https://...",
        "reviewCount": 12
      },
      "rating": 5,
      "cleanliness": 5,
      "communication": 5,
      "checkIn": 5,
      "accuracy": 5,
      "location": 5,
      "value": 4,
      "comment": "Maria's apartment was perfect!...",
      "createdAt": "2025-11-26T10:00:00.000Z"
    }
  ],
  "averageRating": 4.8,
  "total": 24,
  "ratingBreakdown": {
    "5": 20,
    "4": 3,
    "3": 1,
    "2": 0,
    "1": 0
  }
}
```

---

## Host Dashboard

### Get Host Listings
```
GET /api/housing/host/listings
```

Get all listings for the authenticated host.

**Response (200 OK):**
```json
{
  "listings": [
    {
      "id": 789,
      "title": "Cozy Apartment in San Telmo",
      "status": "active",
      "price": 75,
      "averageRating": 4.8,
      "reviewCount": 24,
      "bookingCount": 45,
      "occupancyRate": 0.78,
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "totalEarnings": 12540,
  "currency": "USD"
}
```

---

### Get Host Statistics
```
GET /api/housing/host/stats
```

Get host performance statistics.

**Response (200 OK):**
```json
{
  "totalEarnings": 12540,
  "currency": "USD",
  "averageRating": 4.8,
  "totalReviews": 24,
  "responseRate": 98,
  "responseTime": "within an hour",
  "acceptanceRate": 92,
  "cancellationRate": 0,
  "bookings": {
    "pending": 2,
    "confirmed": 5,
    "completed": 45
  },
  "occupancyRate": 0.78
}
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required
- **Image Storage**: Configure S3/Cloudinary for listing photos
- **Payment Processing**: Integrate Stripe for booking payments
- **Calendar Sync**: Optional iCal integration for availability
- **Email Notifications**: Set up booking confirmation emails
- **SMS Notifications**: Optional Twilio for booking updates

### ✅ Auto-Configured Features
- Listing creation and management
- Search with multiple filters
- Booking request workflow
- Review system with ratings
- Host dashboard and statistics

### 🧪 Testing Recommendations
1. Create listings with various property types
2. Test search filters (city, price, amenities)
3. Verify booking flow (request, approve, cancel)
4. Test review submission after completed stays
5. Verify availability calendar updates

### 📊 Key Metrics to Track
- Listings created per user
- Booking conversion rate
- Average booking value
- Review submission rate
- Host response time
- Occupancy rates by city

### 🔒 Security Notes
- Verify booking dates don't overlap
- Rate limit booking requests to prevent spam
- Validate user completed stay before allowing reviews
- Soft delete for historical booking data
