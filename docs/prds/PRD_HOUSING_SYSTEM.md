# PRD: Housing System

> **Version:** 1.0  
> **Created:** 2025-11-30  
> **Status:** Active  
> **Routes:** `/housing`, `/housing/:id`, `/housing/create`, `/housing/favorites`, `/housing/my-listings`  
> **PRD Method:** Pattern 39 - 5-Source Reverse-Engineering Protocol  

---

## 1. Purpose

The Housing System is a comprehensive accommodation marketplace that enables tango dancers to find, book, and review housing options during their travels to tango festivals, milongas, and workshops. Similar to Airbnb but tailored for the tango community, it connects hosts who have spare rooms or apartments with traveling dancers seeking accommodation near tango venues.

---

## 2. Problem Solved

Before this system existed:
- Tango dancers traveling for festivals had no community-focused housing platform
- Finding accommodation near milongas and tango venues was difficult
- No integrated booking system with date conflict checking
- No trust-based review system specific to tango travelers
- Scattered Facebook group posts for housing requests
- No photo management system with Cloudinary integration
- No integrated payment processing for short-term rentals
- No favorites/wishlist functionality for trip planning

---

## 3. Data Sources (Pattern 39 Methodology)

### 3.1 Source 1: Database Schema

**Primary Tables:** 4 core tables + 1 payment table

```typescript
// Source: shared/schema.ts lines 3206-3296
```

### 3.2 Source 2: API Routes

**Route File:** `server/routes/housing-routes.ts` (937 lines)

### 3.3 Source 3: E2E Tests

**Test File:** `tests/e2e/critical/housing-complete.spec.ts` (200 lines)

### 3.4 Source 4: UI Components

**Component Files:**
- `client/src/components/housing/ListingCard.tsx` (115 lines)
- `client/src/components/housing/PhotoUpload.tsx` (350 lines)

### 3.5 Source 5: Page Components

**Page Files:**
- `client/src/pages/housing/CreateListingPage.tsx` (443 lines)
- `client/src/pages/housing/HostHomePage.tsx`

---

## 4. Database Schema

### 4.1 Housing Listings Table (`housing_listings`)

Primary table storing all property listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique listing identifier |
| `hostId` | integer | NOT NULL, FK → users.id, CASCADE | Property owner reference |
| `title` | varchar | NOT NULL | Listing title |
| `description` | text | NOT NULL | Full property description |
| `propertyType` | varchar | NOT NULL | apartment, house, room, shared, studio |
| `bedrooms` | integer | - | Number of bedrooms |
| `bathrooms` | integer | - | Number of bathrooms |
| `maxGuests` | integer | - | Maximum guest capacity |
| `pricePerNight` | integer | NOT NULL | Price in smallest currency unit (cents) |
| `currency` | varchar | DEFAULT 'USD' | Currency code (USD, EUR, GBP, ARS) |
| `address` | text | NOT NULL | Full street address |
| `city` | varchar | NOT NULL | City name |
| `country` | varchar | NOT NULL | Country name |
| `latitude` | text | - | Geographic latitude |
| `longitude` | text | - | Geographic longitude |
| `amenities` | text[] | - | Array of amenity strings |
| `houseRules` | text | - | Property rules and restrictions |
| `images` | text[] | - | Legacy image URLs array |
| `photos` | jsonb | DEFAULT '[]' | Structured photo objects with metadata |
| `coverPhotoUrl` | text | - | Primary display image URL |
| `status` | varchar | DEFAULT 'active', NOT NULL | active, inactive, pending |
| `verificationStatus` | varchar | DEFAULT 'pending', NOT NULL | pending, verified, rejected |
| `verifiedBy` | integer | FK → users.id | Admin who verified listing |
| `verifiedAt` | timestamp | - | Verification timestamp |
| `safetyNotes` | text | - | Admin safety review notes |
| `rejectionReason` | text | - | Reason if verification rejected |
| `encryptedData` | text | - | AES-256 encrypted sensitive data |
| `createdAt` | timestamp | DEFAULT now() | Creation timestamp |
| `updatedAt` | timestamp | DEFAULT now() | Last update timestamp |

**Photo Object Structure (JSONB):**
```typescript
interface Photo {
  id: string;           // UUID
  url: string;          // Cloudinary URL
  publicId: string;     // Cloudinary public ID
  caption?: string;     // Optional description
  order: number;        // Display order (0-indexed)
  isCover: boolean;     // Cover photo flag
}
```

**Indexes:**
```sql
CREATE INDEX housing_host_idx ON housing_listings(host_id);
CREATE INDEX housing_city_idx ON housing_listings(city);
CREATE INDEX housing_status_idx ON housing_listings(status);
CREATE INDEX housing_created_at_idx ON housing_listings(created_at);
```

### 4.2 Housing Bookings Table (`housing_bookings`)

Booking requests and confirmed reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique booking identifier |
| `listingId` | integer | NOT NULL, FK → housing_listings.id, CASCADE | Property reference |
| `guestId` | integer | NOT NULL, FK → users.id, CASCADE | Booking requester |
| `checkInDate` | timestamp | NOT NULL | Arrival date |
| `checkOutDate` | timestamp | NOT NULL | Departure date |
| `guests` | integer | NOT NULL | Number of guests |
| `totalAmount` | integer | NOT NULL | Total price in cents |
| `status` | varchar | DEFAULT 'pending', NOT NULL | pending, confirmed, rejected, cancelled, completed |
| `createdAt` | timestamp | DEFAULT now() | Booking creation time |

**Indexes:**
```sql
CREATE INDEX housing_bookings_listing_idx ON housing_bookings(listing_id);
CREATE INDEX housing_bookings_guest_idx ON housing_bookings(guest_id);
CREATE INDEX housing_bookings_status_idx ON housing_bookings(status);
```

### 4.3 Housing Reviews Table (`housing_reviews`)

Guest reviews for completed stays.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique review identifier |
| `listingId` | integer | NOT NULL, FK → housing_listings.id, CASCADE | Property reviewed |
| `reviewerId` | integer | NOT NULL, FK → users.id, CASCADE | Guest who left review |
| `rating` | integer | NOT NULL | Star rating (1-5) |
| `review` | text | - | Written review content |
| `createdAt` | timestamp | DEFAULT now() | Review submission time |

**Indexes:**
```sql
CREATE INDEX housing_reviews_listing_idx ON housing_reviews(listing_id);
CREATE INDEX housing_reviews_reviewer_idx ON housing_reviews(reviewer_id);
```

### 4.4 Housing Favorites Table (`housing_favorites`)

User's saved/favorited listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique favorite identifier |
| `userId` | integer | NOT NULL, FK → users.id, CASCADE | User who favorited |
| `listingId` | integer | NOT NULL, FK → housing_listings.id, CASCADE | Favorited listing |
| `createdAt` | timestamp | DEFAULT now() | When favorited |

**Indexes:**
```sql
CREATE INDEX housing_favorites_user_idx ON housing_favorites(user_id);
CREATE INDEX housing_favorites_listing_idx ON housing_favorites(listing_id);
CREATE UNIQUE INDEX housing_favorites_unique_idx ON housing_favorites(user_id, listing_id);
```

### 4.5 Housing Booking Payments Table (`housing_booking_payments`)

Stripe payment tracking for bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Unique payment identifier |
| `bookingId` | integer | NOT NULL, FK → housing_bookings.id, CASCADE | Associated booking |
| `subtotal` | integer | NOT NULL | Listing price × nights (cents) |
| `cleaningFee` | integer | DEFAULT 0, NOT NULL | Cleaning fee (cents) |
| `guestServiceFee` | integer | NOT NULL | 5% platform fee from guest |
| `hostServiceFee` | integer | NOT NULL | 12% platform fee from host |
| `totalCharged` | integer | NOT NULL | Amount guest pays |
| `hostPayout` | integer | NOT NULL | Amount host receives |
| `platformRevenue` | integer | NOT NULL | Total platform earnings |
| `stripePaymentIntentId` | varchar(255) | - | Stripe payment intent ID |
| `stripeTransferId` | varchar(255) | - | Stripe transfer to host |
| `status` | varchar(50) | DEFAULT 'pending', NOT NULL | pending, paid, transferred, failed |
| `paidAt` | timestamp | - | Payment completion time |
| `transferredAt` | timestamp | - | Host payout time |
| `createdAt` | timestamp | DEFAULT now(), NOT NULL | Record creation |

**Indexes:**
```sql
CREATE INDEX housing_payments_booking_idx ON housing_booking_payments(booking_id);
CREATE INDEX housing_payments_status_idx ON housing_booking_payments(status);
CREATE INDEX housing_payments_stripe_idx ON housing_booking_payments(stripe_payment_intent_id);
```

---

## 5. API Documentation

### 5.1 Listings Endpoints

#### GET `/api/housing/listings`

**Description:** Retrieve all active housing listings with optional filters.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | No | Filter by city name |
| `country` | string | No | Filter by country |
| `propertyType` | string | No | apartment, house, room, shared, studio |
| `minPrice` | integer | No | Minimum price per night |
| `maxPrice` | integer | No | Maximum price per night |
| `bedrooms` | integer | No | Exact bedroom count |
| `bathrooms` | integer | No | Exact bathroom count |
| `limit` | integer | No | Results per page (default: 20) |
| `offset` | integer | No | Pagination offset (default: 0) |

**Response:** `200 OK`
```typescript
[
  {
    listing: SelectHousingListing,
    host: {
      id: number,
      name: string,
      email: string
    }
  }
]
```

**Errors:**
- `500`: Failed to fetch listings

---

#### POST `/api/housing/search`

**Description:** Advanced search with date availability and amenity filtering.

**Authentication:** Not required

**Request Body:**
```typescript
{
  checkInDate?: string,      // ISO date
  checkOutDate?: string,     // ISO date
  city?: string,
  country?: string,
  propertyType?: string,
  minPrice?: number,
  maxPrice?: number,
  bedrooms?: number,         // Minimum bedrooms
  bathrooms?: number,        // Minimum bathrooms
  maxGuests?: number,        // Minimum guest capacity
  amenities?: string[],      // Required amenities
  limit?: number,            // Default: 20
  offset?: number            // Default: 0
}
```

**Response:** `200 OK`
```typescript
[
  {
    listing: SelectHousingListing,
    host: {
      id: number,
      name: string,
      email: string,
      profileImage?: string
    }
  }
]
```

**Errors:**
- `500`: Failed to search listings

---

#### GET `/api/housing/listings/:id`

**Description:** Get a specific listing with host information.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Listing ID |

**Response:** `200 OK`
```typescript
{
  listing: SelectHousingListing,
  host: {
    id: number,
    name: string,
    email: string
  }
}
```

**Errors:**
- `404`: Listing not found
- `500`: Failed to fetch listing

---

#### POST `/api/housing/listings`

**Description:** Create a new housing listing.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  title: string,              // Min 10 characters
  description: string,        // Min 50 characters
  propertyType: string,       // apartment, house, room, shared, studio
  bedrooms?: number,
  bathrooms?: number,
  maxGuests: number,          // Min 1
  pricePerNight: number,      // In cents
  currency?: string,          // Default: USD
  address: string,            // Min 5 characters
  city: string,               // Min 2 characters
  country: string,            // Min 2 characters
  latitude?: string,
  longitude?: string,
  amenities?: string[],
  houseRules?: string,
  images?: string[]
}
```

**Response:** `201 Created`
```typescript
SelectHousingListing
```

**Errors:**
- `401`: Unauthorized
- `500`: Failed to create listing

---

#### PATCH `/api/housing/listings/:id`

**Description:** Update an existing listing (owner only).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Listing ID |

**Request Body:** Partial listing fields to update

**Response:** `200 OK`
```typescript
SelectHousingListing
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized (not owner)
- `404`: Listing not found
- `500`: Failed to update listing

---

#### DELETE `/api/housing/listings/:id`

**Description:** Delete a listing (owner only).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Listing ID |

**Response:** `200 OK`
```typescript
{ message: "Listing deleted successfully" }
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized (not owner)
- `404`: Listing not found
- `500`: Failed to delete listing

---

### 5.2 Booking Endpoints

#### GET `/api/housing/bookings`

**Description:** Get current user's bookings.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status |

**Response:** `200 OK`
```typescript
[
  {
    booking: SelectHousingBooking,
    listing: SelectHousingListing,
    host: {
      id: number,
      name: string,
      email: string
    }
  }
]
```

**Errors:**
- `401`: Unauthorized
- `500`: Failed to fetch bookings

---

#### POST `/api/housing/bookings`

**Description:** Create a new booking request with conflict checking.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  listingId: number,
  checkInDate: string,      // ISO date
  checkOutDate: string,     // ISO date
  guests: number,
  totalAmount: number       // In cents
}
```

**Response:** `201 Created`
```typescript
SelectHousingBooking
```

**Errors:**
- `401`: Unauthorized
- `404`: Listing not available
- `409`: Dates not available (conflict with existing booking)
- `500`: Failed to create booking

**Conflict Detection Logic:**
```typescript
// Checks for overlapping bookings with status 'confirmed' or 'pending'
const conflicts = await db.select()
  .from(housingBookings)
  .where(and(
    eq(housingBookings.listingId, listingId),
    or(
      eq(housingBookings.status, "confirmed"),
      eq(housingBookings.status, "pending")
    ),
    or(
      and(
        gte(housingBookings.checkInDate, checkInDate),
        lte(housingBookings.checkInDate, checkOutDate)
      ),
      and(
        gte(housingBookings.checkOutDate, checkInDate),
        lte(housingBookings.checkOutDate, checkOutDate)
      )
    )
  ));
```

---

#### PATCH `/api/housing/bookings/:id/status`

**Description:** Update booking status (host can confirm/reject, guest can cancel).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Booking ID |

**Request Body:**
```typescript
{
  status: "confirmed" | "rejected" | "cancelled"
}
```

**Authorization Rules:**
- `confirmed`, `rejected`: Only listing host
- `cancelled`: Guest OR host

**Response:** `200 OK`
```typescript
SelectHousingBooking
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized
- `404`: Booking not found
- `500`: Failed to update booking status

---

### 5.3 Review Endpoints

#### GET `/api/housing/listings/:listingId/reviews`

**Description:** Get all reviews for a listing.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |

**Response:** `200 OK`
```typescript
[
  {
    review: SelectHousingReview,
    reviewer: {
      id: number,
      name: string
    }
  }
]
```

**Errors:**
- `500`: Failed to fetch reviews

---

#### POST `/api/housing/listings/:listingId/reviews`

**Description:** Create a review (requires completed booking).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |

**Request Body:**
```typescript
{
  rating: number,    // 1-5
  review?: string    // Written review
}
```

**Response:** `201 Created`
```typescript
SelectHousingReview
```

**Errors:**
- `401`: Unauthorized
- `403`: You must complete a booking to leave a review
- `409`: You have already reviewed this listing
- `500`: Failed to create review

---

### 5.4 Favorites Endpoints

#### GET `/api/housing/favorites`

**Description:** Get current user's favorite listings.

**Authentication:** Required (Bearer Token)

**Response:** `200 OK`
```typescript
[
  {
    favorite: SelectHousingFavorite,
    listing: SelectHousingListing,
    host: {
      id: number,
      name: string
    }
  }
]
```

**Errors:**
- `401`: Unauthorized
- `500`: Failed to fetch favorites

---

#### POST `/api/housing/favorites/:listingId`

**Description:** Add a listing to favorites.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |

**Response:** `201 Created`
```typescript
SelectHousingFavorite
```

**Errors:**
- `401`: Unauthorized
- `409`: Already in favorites
- `500`: Failed to add favorite

---

#### DELETE `/api/housing/favorites/:listingId`

**Description:** Remove a listing from favorites.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |

**Response:** `200 OK`
```typescript
{ message: "Removed from favorites" }
```

**Errors:**
- `401`: Unauthorized
- `500`: Failed to remove favorite

---

### 5.5 Photo Management Endpoints

#### POST `/api/housing/photos`

**Description:** Upload a photo to Cloudinary (max 20 per listing).

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Image file (max 10MB) |
| `listingId` | string | Target listing ID |

**Response:** `201 Created`
```typescript
{
  id: string,           // UUID
  url: string,          // Cloudinary URL
  publicId: string,     // Cloudinary public ID
  order: number,        // Display order
  isCover: boolean      // true if first photo
}
```

**Errors:**
- `400`: No file uploaded / Listing ID required / Maximum 20 photos
- `401`: Unauthorized
- `403`: Not authorized to upload photos for this listing
- `404`: Listing not found
- `500`: Cloudinary not configured / Failed to upload

---

#### DELETE `/api/housing/:listingId/photos/:photoId`

**Description:** Delete a photo from listing.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |
| `photoId` | string | Photo UUID |

**Response:** `200 OK`
```typescript
{ message: "Photo deleted successfully" }
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized
- `404`: Listing/Photo not found
- `500`: Failed to delete photo

---

#### PUT `/api/housing/:listingId/photos/reorder`

**Description:** Reorder photos by updating their order values.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |

**Request Body:**
```typescript
{
  photos: Photo[]  // Full array with updated order values
}
```

**Response:** `200 OK`
```typescript
{ 
  message: "Photos reordered successfully",
  photos: Photo[]
}
```

**Errors:**
- `400`: Photos array is required
- `401`: Unauthorized
- `403`: Not authorized
- `404`: Listing not found
- `500`: Failed to reorder photos

---

#### PUT `/api/housing/:listingId/photos/:photoId/cover`

**Description:** Set a photo as the cover image.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |
| `photoId` | string | Photo UUID |

**Response:** `200 OK`
```typescript
{ message: "Cover photo updated successfully" }
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized
- `404`: Listing/Photo not found
- `500`: Failed to set cover photo

---

#### PUT `/api/housing/:listingId/photos/:photoId/caption`

**Description:** Update a photo's caption.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `listingId` | integer | Listing ID |
| `photoId` | string | Photo UUID |

**Request Body:**
```typescript
{
  caption: string
}
```

**Response:** `200 OK`
```typescript
{ message: "Caption updated successfully" }
```

**Errors:**
- `401`: Unauthorized
- `403`: Not authorized
- `404`: Listing/Photo not found
- `500`: Failed to update caption

---

## 6. UI Components

### 6.1 ListingCard Component

**Location:** `client/src/components/housing/ListingCard.tsx`

**Purpose:** Displays a housing listing in a card format with photo, price, location, and amenities.

**Props:**
```typescript
interface ListingCardProps {
  listing: SelectHousingListing & {
    host?: {
      id: number;
      name: string;
      email: string;
    };
  };
  onClick?: () => void;
}
```

**Features:**
- Cover photo with aspect-4/3 ratio
- Verified badge for verified listings
- Location display with MapPin icon
- Bedroom/bathroom/guest capacity icons
- Amenity badges (first 3 + overflow count)
- Price per night with currency
- Property type badge
- Hover elevation animation

**Test IDs:**
| Test ID | Element | Description |
|---------|---------|-------------|
| `card-listing-${id}` | Card container | Clickable card wrapper |
| `img-listing-cover-${id}` | Cover image | Main listing photo |
| `badge-verified` | Badge | Verification status |
| `text-listing-title` | h3 | Listing title |
| `text-listing-location` | span | City, Country |
| `text-listing-description` | p | Description excerpt |
| `info-bedrooms` | div | Bedroom count |
| `info-bathrooms` | div | Bathroom count |
| `info-guests` | div | Max guests |
| `text-listing-price` | span | Price per night |
| `badge-property-type` | Badge | Property type |

---

### 6.2 PhotoUpload Component

**Location:** `client/src/components/housing/PhotoUpload.tsx`

**Purpose:** Drag-and-drop photo upload with reordering, cover selection, and caption editing.

**Props:**
```typescript
interface PhotoUploadProps {
  listingId: number;
  initialPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}
```

**Features:**
- Dropzone for drag-and-drop upload
- Progress indicator during upload
- Maximum 20 photos per listing
- Drag-to-reorder with react-beautiful-dnd
- Set cover photo button
- Delete photo with Cloudinary cleanup
- Caption editing per photo
- Responsive grid layout (2/3/4 columns)

**Test IDs:**
| Test ID | Element | Description |
|---------|---------|-------------|
| `dropzone-photo-upload` | div | Drag-drop zone |
| `input-photo-upload` | input | File input |
| `photo-item-${index}` | Card | Individual photo card |
| `button-delete-photo-${index}` | Button | Delete photo |
| `input-caption-${index}` | Input | Caption text field |
| `button-set-cover-${index}` | Button | Set as cover |

---

### 6.3 CreateListingPage

**Location:** `client/src/pages/housing/CreateListingPage.tsx`

**Purpose:** Two-step wizard for creating new listings (details → photos).

**Features:**
- Form validation with Zod schema
- Property type selection
- Location picker with auto-fill
- Amenity input (comma-separated)
- House rules textarea
- Photo upload after listing creation
- Success toast notifications

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| `title` | Input | Min 10 characters |
| `description` | Textarea | Min 50 characters |
| `propertyType` | Select | Required |
| `maxGuests` | Number | Min 1 |
| `bedrooms` | Number | Min 0 |
| `bathrooms` | Number | Min 0 |
| `pricePerNight` | Number | Min 1 |
| `currency` | Select | USD, EUR, GBP, ARS |
| `address` | LocationPicker | Min 5 characters |
| `city` | Input (readonly) | Min 2 characters |
| `country` | Input (readonly) | Min 2 characters |
| `amenities` | Input | Comma-separated |
| `houseRules` | Textarea | Optional |

**Test IDs:**
| Test ID | Element | Description |
|---------|---------|-------------|
| `input-title` | Input | Title field |
| `input-description` | Textarea | Description field |
| `select-property-type` | Select | Property type dropdown |
| `input-max-guests` | Input | Guest capacity |
| `input-bedrooms` | Input | Bedroom count |
| `input-bathrooms` | Input | Bathroom count |
| `input-price` | Input | Price per night |
| `select-currency` | Select | Currency dropdown |
| `input-city` | Input | City (auto-filled) |
| `input-country` | Input | Country (auto-filled) |
| `input-amenities` | Input | Amenities list |
| `input-house-rules` | Textarea | House rules |
| `button-create-listing` | Button | Submit form |
| `button-complete-listing` | Button | Complete with photos |

---

## 7. User Flows

### 7.1 Browse Listings Flow

```
User visits /housing
    ↓
System loads active listings (GET /api/housing/listings)
    ↓
User applies filters (city, type, price range)
    ↓
System re-fetches with filter params
    ↓
User clicks listing card
    ↓
Navigation to /housing/:id
    ↓
System loads listing details (GET /api/housing/listings/:id)
    ↓
System loads reviews (GET /api/housing/listings/:id/reviews)
```

### 7.2 Create Listing Flow

```
Host clicks "Create Listing" button
    ↓
Navigation to /housing/create
    ↓
Host fills listing form (title, description, type, etc.)
    ↓
Host clicks "Create Listing"
    ↓
System creates listing (POST /api/housing/listings)
    ↓
Form switches to photo upload mode
    ↓
Host uploads photos (drag-and-drop or click)
    ↓
System uploads to Cloudinary (POST /api/housing/photos)
    ↓
Host sets cover photo, adds captions
    ↓
Host clicks "Complete Listing"
    ↓
Navigation to /housing/my-listings
```

### 7.3 Booking Flow

```
Guest views listing details
    ↓
Guest clicks "Book Now"
    ↓
Booking form appears (check-in, check-out, guests)
    ↓
Guest fills dates and guest count
    ↓
System validates dates
    ↓
Guest clicks "Submit Booking"
    ↓
System checks for conflicts (POST /api/housing/bookings)
    ↓
If available: Booking created with "pending" status
    ↓
Host receives notification
    ↓
Host reviews booking in dashboard
    ↓
Host confirms/rejects (PATCH /api/housing/bookings/:id/status)
    ↓
Guest receives notification of decision
```

### 7.4 Review Flow

```
Guest completes stay
    ↓
Booking status changes to "completed"
    ↓
Guest visits listing page
    ↓
"Write Review" button appears
    ↓
Guest selects rating (1-5 stars)
    ↓
Guest writes review text
    ↓
Guest submits (POST /api/housing/listings/:id/reviews)
    ↓
Review appears on listing page
```

### 7.5 Favorites Flow

```
User views listing
    ↓
User clicks heart/favorite button
    ↓
System adds to favorites (POST /api/housing/favorites/:listingId)
    ↓
Button shows "favorited" state (aria-pressed="true")
    ↓
User visits /housing/favorites
    ↓
System loads favorites (GET /api/housing/favorites)
    ↓
User can remove favorites (DELETE /api/housing/favorites/:listingId)
```

---

## 8. E2E Test Coverage

### 8.1 Test File

**Location:** `tests/e2e/critical/housing-complete.spec.ts`

### 8.2 Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Housing Listings Discovery | 4 | Display, filter, search, price range |
| Listing Details | 3 | View, photos, amenities |
| Booking Flow | 2 | Initiate, validate dates |
| Reviews | 1 | View reviews |
| Favorites | 2 | Add favorite, view list |
| Create Listing | 1 | Full creation flow |

### 8.3 Complete Test ID Reference

**Discovery Page:**
| Test ID | Purpose |
|---------|---------|
| `card-listing-*` | Listing cards (pattern match) |
| `filter-apartment` | Property type filter |
| `input-location` | Location search input |
| `button-search` | Search submit button |
| `input-min-price` | Minimum price filter |
| `input-max-price` | Maximum price filter |
| `button-apply-filters` | Apply filters button |

**Listing Details:**
| Test ID | Purpose |
|---------|---------|
| `text-listing-title` | Listing title text |
| `text-listing-price` | Price display |
| `text-listing-description` | Description text |
| `img-listing-photo` | Photo gallery image |

**Booking Form:**
| Test ID | Purpose |
|---------|---------|
| `button-book-now` | Initiate booking |
| `input-check-in` | Check-in date picker |
| `input-check-out` | Check-out date picker |
| `button-submit-booking` | Submit booking request |

**Favorites:**
| Test ID | Purpose |
|---------|---------|
| `button-favorite` | Toggle favorite |

**Create Listing:**
| Test ID | Purpose |
|---------|---------|
| `button-create-listing` | Open create form |
| `input-listing-title` | Title input |
| `input-listing-description` | Description input |
| `input-listing-price` | Price input |
| `input-listing-location` | Location input |
| `button-submit-listing` | Submit new listing |

---

## 9. Cross-System Wirings

### 9.1 Housing → Users

**Connection Type:** Foreign Key Reference

```typescript
// housing_listings.hostId → users.id
hostId: integer("host_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" })

// Host info returned with listings
{
  host: {
    id: users.id,
    name: users.name,
    email: users.email,
    profileImage: users.profileImage
  }
}
```

**Usage:**
- Display host profile on listing details
- Link to host's public profile
- Contact host for inquiries

---

### 9.2 Housing → Admin/Moderation

**Connection Type:** Content Type Integration

```typescript
// shared/schema.ts - moderation_queue table
contentType: varchar("content_type", { length: 50 }).notNull()
// Supports: 'post' | 'comment' | 'message' | 'user' | 'event' | 'housing'
```

**Integration Points:**
- `verificationStatus` field for admin review
- `verifiedBy` tracks which admin verified
- `safetyNotes` for admin documentation
- `rejectionReason` for declined listings
- Listings can be reported and moderated

---

### 9.3 Housing → Payments (Stripe)

**Connection Type:** Payment Processing Table

```typescript
// housing_booking_payments table
export const housingBookingPayments = pgTable("housing_booking_payments", {
  bookingId: integer("booking_id").references(() => housingBookings.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeTransferId: varchar("stripe_transfer_id"),
  // ... pricing breakdown
});
```

**Fee Structure:**
- Guest Service Fee: 5% of subtotal
- Host Service Fee: 12% of subtotal
- Platform Revenue: guest_fee + host_fee
- Host Payout: subtotal + cleaning - host_fee

---

### 9.4 Housing → Notifications

**Connection Type:** Notification Preferences

```typescript
// notification_preferences table
housingBookings: boolean("housing_bookings").default(true)
```

**Notification Events:**
- New booking request (to host)
- Booking confirmed/rejected (to guest)
- Booking cancelled (to both)
- New review received (to host)

---

### 9.5 Housing → Platform Revenue

**Connection Type:** Revenue Tracking

```typescript
// platform_revenue table
transactionType: varchar("transaction_type", { length: 50 }).notNull()
// Supports: 'housing', 'event_ticket', 'subscription', 'ad'

// revenue_shares table  
transactionType: varchar("transaction_type", { length: 50 }).notNull()
// Supports: 'housing', 'event_ticket', 'workshop', 'marketplace'
```

---

### 9.6 Housing → Cloudinary

**Connection Type:** External Service Integration

**Utils:** `server/utils/cloudinary.ts`

**Functions:**
- `uploadImage(buffer, folder, publicId)` - Upload photo
- `deleteImage(publicId)` - Remove photo
- `validateCloudinaryConfig()` - Check configuration

**Photo Storage Path:** `housing/${listingId}/*`

---

## 10. Zod Schemas & TypeScript Types

### 10.1 Insert Schemas

```typescript
// Housing Listings
export const insertHousingListingSchema = createInsertSchema(housingListings)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHousingListing = z.infer<typeof insertHousingListingSchema>;

// Housing Bookings
export const insertHousingBookingSchema = createInsertSchema(housingBookings)
  .omit({ id: true, createdAt: true });
export type InsertHousingBooking = z.infer<typeof insertHousingBookingSchema>;

// Housing Booking Payments
export const insertHousingBookingPaymentSchema = createInsertSchema(housingBookingPayments)
  .omit({ id: true, createdAt: true });
export type InsertHousingBookingPayment = z.infer<typeof insertHousingBookingPaymentSchema>;
```

### 10.2 Select Types

```typescript
export type SelectHousingListing = typeof housingListings.$inferSelect;
export type SelectHousingBooking = typeof housingBookings.$inferSelect;
export type SelectHousingReview = typeof housingReviews.$inferSelect;
export type SelectHousingFavorite = typeof housingFavorites.$inferSelect;
export type SelectHousingBookingPayment = typeof housingBookingPayments.$inferSelect;
```

### 10.3 Create Listing Form Schema

```typescript
// client/src/pages/housing/CreateListingPage.tsx
const createListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().min(1, "Must accommodate at least 1 guest"),
  pricePerNight: z.coerce.number().min(1, "Price must be greater than 0"),
  currency: z.string().default("USD"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  amenities: z.string().optional(),
  houseRules: z.string().optional(),
});
```

---

## 11. Property Types & Status Values

### 11.1 Property Types

| Value | Display | Description |
|-------|---------|-------------|
| `apartment` | Apartment | Full apartment rental |
| `house` | House | Entire house rental |
| `room` | Private Room | Private room in shared space |
| `shared` | Shared Room | Shared room with others |
| `studio` | Studio | Studio apartment |

### 11.2 Listing Status

| Value | Description |
|-------|-------------|
| `active` | Available for booking |
| `inactive` | Temporarily unavailable |
| `pending` | Awaiting admin approval |

### 11.3 Verification Status

| Value | Description |
|-------|-------------|
| `pending` | Not yet reviewed |
| `verified` | Admin approved |
| `rejected` | Admin declined |

### 11.4 Booking Status

| Value | Description |
|-------|-------------|
| `pending` | Awaiting host response |
| `confirmed` | Host approved |
| `rejected` | Host declined |
| `cancelled` | Cancelled by guest/host |
| `completed` | Stay completed |

### 11.5 Payment Status

| Value | Description |
|-------|-------------|
| `pending` | Payment initiated |
| `paid` | Payment successful |
| `transferred` | Host payout complete |
| `failed` | Payment failed |

---

## 12. Security Considerations

### 12.1 Authorization

- Listing CRUD: Only owner can update/delete
- Booking creation: Any authenticated user
- Booking status: Host confirms/rejects, guest/host cancels
- Reviews: Only guests with completed bookings
- Photos: Only listing owner can manage

### 12.2 Data Protection

- `encryptedData` field for sensitive financial info (AES-256-GCM)
- Cloudinary for secure image hosting
- Stripe for payment processing (PCI compliant)

### 12.3 Input Validation

- Zod schemas for all form inputs
- Server-side validation on all endpoints
- Image file type validation (images only)
- File size limit (10MB max)

---

## 13. Performance Optimizations

### 13.1 Database Indexes

All tables have strategic indexes for:
- Foreign key lookups (hostId, listingId, userId)
- Status filtering
- City/country search
- Creation date ordering

### 13.2 Pagination

Default pagination on listing endpoints:
- `limit`: 20 per page
- `offset`: Starting position

### 13.3 Image Optimization

- Cloudinary handles image transformations
- Cover photo pre-selected for fast loading
- Lazy loading for photo galleries

---

## 14. Future Considerations

### 14.1 Planned Enhancements

- [ ] Map view with Leaflet integration
- [ ] Instant booking option
- [ ] Host calendar/availability management
- [ ] Price variations (weekend, seasonal)
- [ ] Discount codes and promotions
- [ ] Host verification badges
- [ ] Automated review reminders
- [ ] Guest messaging system
- [ ] Deposit handling

### 14.2 Known Limitations

- No real-time availability calendar yet
- No multi-language listing support
- No integrated cancellation policies
- No damage deposit flow

---

## 15. Related PRDs

| PRD | Relationship |
|-----|-------------|
| [PRD_USER_PROFILE_SYSTEM.md](./PRD_USER_PROFILE_SYSTEM.md) | Host profile display |
| [PRD_MARKETPLACE_SYSTEM.md](./PRD_MARKETPLACE_SYSTEM.md) | Similar listing patterns |
| [PRD_EVENTS_SYSTEM.md](./PRD_EVENTS_SYSTEM.md) | Event + housing bundles |
| [PRD_TRAVEL_PLANNING_SYSTEM.md](./PRD_TRAVEL_PLANNING_SYSTEM.md) | Trip accommodation integration |

---

## 16. File Reference Summary

### Backend Files

| File | Lines | Purpose |
|------|-------|---------|
| `server/routes/housing-routes.ts` | 937 | All housing API endpoints |
| `server/routes/housing-photos-routes.ts` | ~100 | Additional photo routes |
| `shared/schema.ts` (housing section) | ~150 | Database schema definitions |
| `server/utils/cloudinary.ts` | ~100 | Image upload utilities |

### Frontend Files

| File | Lines | Purpose |
|------|-------|---------|
| `client/src/components/housing/ListingCard.tsx` | 115 | Listing card component |
| `client/src/components/housing/PhotoUpload.tsx` | 350 | Photo upload component |
| `client/src/pages/housing/CreateListingPage.tsx` | 443 | Create listing wizard |
| `client/src/pages/housing/HostHomePage.tsx` | ~200 | Host dashboard |

### Test Files

| File | Lines | Purpose |
|------|-------|---------|
| `tests/e2e/critical/housing-complete.spec.ts` | 200 | Complete E2E test suite |

---

**Document End**

*Last Updated: 2025-11-30*
*PRD Method: Pattern 39 - 5-Source Reverse-Engineering Protocol*
