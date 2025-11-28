# PRD: Travel Planning System

> **Version:** 1.0  
> **Created:** 2025-11-28  
> **Status:** Active  

---

## 1. Purpose

The **Travel Planning System** is a comprehensive trip planning feature that enables Mundo Tango users to plan, organize, and manage their tango-related travel experiences. It integrates seamlessly with the platform's event system, housing marketplace, and community features to provide a complete travel companion for tango dancers.

**Key Capabilities:**
- Multi-city trip planning with per-city date tracking
- Itinerary management for flights, hotels, activities, dining, transport, events, and milongas
- Integration with platform events to discover milongas and festivals at destinations
- MT Host housing integration for community-based accommodation
- URL scraping for accommodation and transport booking details
- Travel companion matching and group coordination
- Budget tracking with cost breakdown by category
- Trip status lifecycle management

---

## 2. Problem Solved

**Before the Travel Planning System existed:**
- Tango dancers had no centralized way to plan trips around milongas and festivals
- No integration between event discovery and travel planning
- Community housing (MT Host) was disconnected from trip organization
- No way to coordinate travel with other dancers going to the same destination
- Manual tracking of flights, hotels, and activities across multiple apps/services
- No budget visibility or cost tracking for tango travel

**After implementing the Travel Planning System:**
- Unified travel planning experience tailored for tango dancers
- Automatic discovery of milongas and events at destinations
- One-click addition of MT Host accommodations to itinerary
- Travel companion matching based on destination and dates
- Centralized itinerary with all travel components
- Real-time budget tracking with category breakdowns
- Trip lifecycle from planning to completion with notes

---

## 3. Technical Implementation

### 3.1 Core Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` (lines 4838-4884) | Database schema for `travelPlans` and `travelPlanItems` tables |
| `server/routes/travel-routes.ts` | REST API endpoints for travel plan CRUD and integrations |
| `client/src/components/profile/ProfileTabTravel.tsx` | Main travel planning UI component |
| `client/src/pages/travel/TravelTripPlannerPage.tsx` | Dedicated trip planner page |
| `client/src/pages/travel/TravelItineraryPage.tsx` | Itinerary view page |
| `client/src/pages/travel/TravelExpensesPage.tsx` | Expense tracking page |
| `client/src/pages/travel/TravelEventCoordinationPage.tsx` | Event coordination page |

### 3.2 Database Schema

#### travelPlans Table

```typescript
export const travelPlans = pgTable("travel_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cityId: integer("city_id"),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
  cities: jsonb("cities").default(sql`'[]'::jsonb`),  // Multi-city support
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  tripDuration: integer("trip_duration").notNull(),
  budget: varchar("budget", { length: 255 }),
  interests: text("interests").array().default(sql`'{}'::text[]`),
  travelStyle: varchar("travel_style", { length: 255 }),
  status: varchar("status", { length: 50 }).default('planning'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_travel_plans_user").on(table.userId),
  statusIdx: index("idx_travel_plans_status").on(table.status),
}));
```

#### travelPlanItems Table

```typescript
export const travelPlanItems = pgTable("travel_plan_items", {
  id: serial("id").primaryKey(),
  travelPlanId: integer("travel_plan_id").references(() => travelPlans.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),  // flight|hotel|activity|dining|transport|event|milonga
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date"),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  costPerNight: numeric("cost_per_night", { precision: 10, scale: 2 }),
  nights: integer("nights"),
  bookingUrl: varchar("booking_url", { length: 512 }),
  isBooked: boolean("is_booked").default(false),
  transportType: varchar("transport_type", { length: 50 }),  // flight|train|bus|car|boat
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  departureLocation: varchar("departure_location", { length: 255 }),
  arrivalLocation: varchar("arrival_location", { length: 255 }),
  linkedEventId: integer("linked_event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  planIdx: index("idx_travel_items_plan").on(table.travelPlanId),
  typeIdx: index("idx_travel_items_type").on(table.type),
}));
```

### 3.3 Key Interfaces/Types

```typescript
// Travel Plan with items (API response)
interface TravelPlan {
  id: number;
  tripName?: string;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  tripDuration: number;
  status: string;  // 'planning' | 'confirmed' | 'in_progress' | 'completed'
  notes?: string;
  items?: TravelPlanItem[];
}

// Individual itinerary item
interface TravelPlanItem {
  id: number;
  type: string;  // 'flight' | 'hotel' | 'activity' | 'dining' | 'transport' | 'event' | 'milonga'
  title: string;
  description?: string;
  date?: string;
  endDate?: string;
  location?: string;
  cost?: number;
  costPerNight?: number;
  nights?: number;
  bookingUrl?: string;
  isBooked: boolean;
  transportType?: string;  // 'flight' | 'train' | 'bus' | 'car' | 'boat'
  departureTime?: string;
  arrivalTime?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  linkedEventId?: number;
}

// Multi-city date tracking
interface CityOption {
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  startDate?: Date;
  endDate?: Date;
}

// City events (for destination event discovery)
interface CityEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  category?: string;
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
  venueName?: string;
  city?: string;
  country?: string;
  isPaid?: boolean;
  isFree?: boolean;
  price?: string;
  currency?: string;
  imageUrl?: string;
  ticketUrl?: string;
  numericPrice: number;
}

// MT Host housing listing
interface MTHostListing {
  id: number;
  hostId: number;
  title: string;
  description: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  pricePerNight: number;
  currency?: string;
  address: string;
  city: string;
  country: string;
  amenities?: string[];
  images?: string[];
  coverPhotoUrl?: string;
  hostName?: string;
  hostProfileImage?: string;
  nights: number;
  totalCost: number;
  isMTHost: boolean;
}

// Scraped accommodation data
interface ScrapedAccommodation {
  title: string;
  price: string | null;
  pricePerNight: number | null;
  currency: string;
  address: string | null;
  city: string | null;
  country: string | null;
  images: string[];
  amenities: string[];
  description: string | null;
  rating: number | null;
  reviewCount: number | null;
  hostName: string | null;
  propertyType: string | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  url: string;
  scrapedAt: string;
}

// Scraped transport data
interface ScrapedTransport {
  type: 'flight' | 'train' | 'bus' | 'ferry' | 'unknown';
  provider: string | null;
  departure: {
    location: string | null;
    time: string | null;
    date: string | null;
  };
  arrival: {
    location: string | null;
    time: string | null;
    date: string | null;
  };
  duration: string | null;
  price: string | null;
  priceValue: number | null;
  currency: string;
  bookingUrl: string | null;
  stops: number | null;
  class: string | null;
  url: string;
  scrapedAt: string;
}
```

### 3.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRAVEL PLANNING SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   FRONTEND LAYER    │   │    BACKEND API      │   │    DATA LAYER       │
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
│ ProfileTabTravel    │   │ travel-routes.ts    │   │ travelPlans         │
│ TravelTripPlanner   │──▶│                     │──▶│ travelPlanItems     │
│ TravelItinerary     │   │ /api/travel/plans   │   │ events              │
│ TravelExpenses      │   │ /api/travel/items   │   │ housingListings     │
└─────────────────────┘   │ /api/travel/events  │   │ users               │
                          │ /api/travel/housing │   └─────────────────────┘
                          └─────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  EVENT INTEGRATION  │   │  HOUSING INTEGRATION│   │  SCRAPING SERVICE   │
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
│ Auto-fetch events   │   │ MT Host listings    │   │ Accommodation URLs  │
│ in destination city │   │ search by city      │   │ Transport URLs      │
│ Filter by dates     │   │ Calculate costs     │   │ Cheerio parsing     │
│ Add to itinerary    │   │ Host profiles       │   │ Multi-site support  │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### 3.5 Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        TRIP CREATION FLOW                                 │
└──────────────────────────────────────────────────────────────────────────┘

User selects destination(s)         User sets dates              Plan created
        │                                 │                           │
        ▼                                 ▼                           ▼
┌───────────────┐              ┌───────────────────┐        ┌──────────────┐
│ UnifiedLocation│              │ Calendar picker   │        │ POST /api/   │
│ Picker        │──────────────▶│ with per-city    │───────▶│ travel/plans │
│ (city mode)   │              │ date ranges       │        │              │
└───────────────┘              └───────────────────┘        └──────────────┘
                                                                    │
                                                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATIC EVENT DISCOVERY                             │
└──────────────────────────────────────────────────────────────────────────┘

GET /api/travel/events-by-city
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  Query events table for:                                                   │
│  - City matches (ilike)                                                   │
│  - Date range (startDate <= tripEndDate && startDate >= tripStartDate)   │
│  - Returns milongas, festivals, workshops, etc.                           │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
User can add events to itinerary ──▶ linkedEventId stores reference


┌──────────────────────────────────────────────────────────────────────────┐
│                       MT HOST HOUSING FLOW                                │
└──────────────────────────────────────────────────────────────────────────┘

GET /api/travel/housing-by-city?city=X&startDate=Y&endDate=Z
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  Query housingListings + users:                                            │
│  - City matches (ilike)                                                   │
│  - Status = 'active'                                                      │
│  - Calculate total cost: pricePerNight × nights                           │
│  - Include host profile info                                              │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
Display MT Host listings with "Add to Trip" ──▶ Creates hotel item


┌──────────────────────────────────────────────────────────────────────────┐
│                     ACCOMMODATION SCRAPING FLOW                           │
└──────────────────────────────────────────────────────────────────────────┘

User pastes booking URL ──▶ POST /api/travel/scrape-accommodation
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  Cheerio scraper extracts:                                                 │
│  - Title, price, address                                                  │
│  - Images, amenities, description                                         │
│  - Rating, host info                                                      │
│  - Property details (beds, baths, guests)                                 │
└───────────────────────────────────────────────────────────────────────────┘
        │
        ▼
Pre-fill item form ──▶ User confirms ──▶ Creates hotel/activity item
```

---

## 4. API Endpoints

### 4.1 Travel Plans CRUD

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/travel/plans` | GET | Optional | Get user's travel plans (supports `?userId=` query param) |
| `/api/travel/plans/:id` | GET | Required | Get single travel plan with items |
| `/api/travel/plans` | POST | Required | Create new travel plan |
| `/api/travel/plans/:id` | PATCH | Required | Update travel plan |
| `/api/travel/plans/:id` | DELETE | Required | Delete travel plan |

### 4.2 Travel Plan Items CRUD

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/travel/plans/:id/items` | POST | Required | Add item to travel plan |
| `/api/travel/plans/:planId/items/:itemId` | PATCH | Required | Update item |
| `/api/travel/plans/:planId/items/:itemId` | DELETE | Required | Delete item |
| `/api/travel/plans/:planId/destinations/:itemId` | DELETE | Required | Delete destination (legacy) |

### 4.3 Integration Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/travel/events-by-city` | GET | No | Get events in city within date range |
| `/api/travel/housing-by-city` | GET | No | Get MT Host listings in city |
| `/api/travel/mt-hosts` | GET | No | Get MT hosts with listings in city |
| `/api/travel/scrape-accommodation` | POST | No | Scrape accommodation from URL |
| `/api/travel/scrape-transport` | POST | No | Scrape transport from URL |

### 4.4 Request/Response Examples

**Create Travel Plan:**
```typescript
// POST /api/travel/plans
{
  city: "Buenos Aires",
  country: "Argentina",
  cities: [
    { city: "Buenos Aires", country: "Argentina", startDate: "2025-03-01", endDate: "2025-03-10" },
    { city: "Montevideo", country: "Uruguay", startDate: "2025-03-10", endDate: "2025-03-14" }
  ],
  startDate: "2025-03-01",
  endDate: "2025-03-14",
  tripDuration: 14,
  budget: "2000",
  interests: ["milongas", "workshops", "traditional"],
  travelStyle: "cultural",
  status: "planning"
}

// Response
{
  id: 1,
  userId: 123,
  city: "Buenos Aires",
  country: "Argentina",
  cities: [...],
  startDate: "2025-03-01T00:00:00.000Z",
  endDate: "2025-03-14T00:00:00.000Z",
  tripDuration: 14,
  budget: "2000",
  interests: ["milongas", "workshops", "traditional"],
  travelStyle: "cultural",
  status: "planning",
  createdAt: "2025-11-28T10:00:00.000Z",
  updatedAt: "2025-11-28T10:00:00.000Z"
}
```

**Add Item to Plan:**
```typescript
// POST /api/travel/plans/1/items
{
  type: "hotel",
  title: "Hotel Boutique San Telmo",
  description: "Walking distance to milongas",
  date: "2025-03-01",
  endDate: "2025-03-10",
  location: "San Telmo, Buenos Aires",
  cost: 900,
  costPerNight: 100,
  nights: 9,
  bookingUrl: "https://...",
  isBooked: true
}

// For transport items:
{
  type: "transport",
  title: "Flight NYC to Buenos Aires",
  transportType: "flight",
  departureTime: "2025-03-01T10:00:00.000Z",
  arrivalTime: "2025-03-01T22:00:00.000Z",
  departureLocation: "JFK, New York",
  arrivalLocation: "EZE, Buenos Aires",
  cost: 850,
  bookingUrl: "https://...",
  isBooked: true
}

// For event/milonga items:
{
  type: "milonga",
  title: "La Viruta - Tuesday Milonga",
  description: "Famous milonga in Palermo",
  date: "2025-03-04",
  location: "Armenia 1366, Palermo",
  cost: 15,
  linkedEventId: 456  // Links to events table
}
```

**Get Events by City:**
```typescript
// GET /api/travel/events-by-city?city=Buenos%20Aires&startDate=2025-03-01&endDate=2025-03-14

// Response
[
  {
    id: 456,
    title: "La Viruta Milonga",
    description: "Traditional milonga every Tuesday",
    eventType: "milonga",
    category: "social_dance",
    startDate: "2025-03-04T21:00:00.000Z",
    endDate: "2025-03-05T03:00:00.000Z",
    location: "Armenia 1366, Palermo",
    venue: "La Viruta",
    venueName: "La Viruta Tango Club",
    city: "Buenos Aires",
    country: "Argentina",
    isPaid: true,
    price: "$15",
    currency: "USD",
    imageUrl: "https://...",
    ticketUrl: "https://...",
    numericPrice: 15
  },
  // ... more events
]
```

---

## 5. Item Types & Transport Types

### 5.1 Itinerary Item Types

| Type | Icon | Color | Specific Fields |
|------|------|-------|-----------------|
| `flight` | Plane | Blue | `transportType`, `departureTime`, `arrivalTime`, `departureLocation`, `arrivalLocation` |
| `hotel` | Building | Purple | `costPerNight`, `nights`, `endDate` |
| `activity` | Target | Green | Standard fields |
| `dining` | Utensils | Orange | Standard fields |
| `transport` | Various | Yellow | `transportType`, `departureTime`, `arrivalTime`, `departureLocation`, `arrivalLocation` |
| `event` | Party | Pink | `linkedEventId` |
| `milonga` | Dancer | Red | `linkedEventId` |

### 5.2 Transport Types

| Type | Icon | Description |
|------|------|-------------|
| `flight` | Plane | Air travel |
| `train` | Train | Rail travel |
| `bus` | Bus | Bus/coach |
| `car` | Car | Car rental or ride |
| `boat` | Anchor | Ferry or cruise |

### 5.3 Trip Status Lifecycle

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   planning   │ ───▶ │  confirmed   │ ───▶ │ in_progress  │ ───▶ │  completed   │
│              │      │              │      │              │      │              │
│ Initial state│      │ Bookings made│      │ During trip  │      │ Trip finished│
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
       │                                                                  │
       │                     User can add notes                           │
       │                     during/after trip                            │
       └──────────────────────────────────────────────────────────────────┘
```

---

## 6. Files Using This System

### 6.1 Frontend Pages

| File | Route | Purpose |
|------|-------|---------|
| `client/src/pages/travel/TravelTripPlannerPage.tsx` | `/travel/planner` | Main trip planning interface |
| `client/src/pages/travel/TravelItineraryPage.tsx` | `/travel/itinerary` | View/manage itinerary |
| `client/src/pages/travel/TravelExpensesPage.tsx` | `/travel/expenses` | Budget and expense tracking |
| `client/src/pages/travel/TravelEventCoordinationPage.tsx` | `/travel/events` | Event coordination |

### 6.2 Frontend Components

| File | Purpose |
|------|---------|
| `client/src/components/profile/ProfileTabTravel.tsx` | Profile travel tab (main UI) |
| `client/src/components/input/UnifiedLocationPicker.tsx` | City/location selection |

### 6.3 Backend Files

| File | Purpose |
|------|---------|
| `server/routes/travel-routes.ts` | All travel API endpoints |
| `server/routes/travelAgentsRoutes.ts` | Travel agent worker routes |
| `server/workers/travelAgentWorker.ts` | Background travel tasks |

---

## 7. Integration Points

### 7.1 Event System Integration

- **Events Table**: `linkedEventId` in travel items references `events.id`
- **Auto-Discovery**: `/api/travel/events-by-city` queries events by city and date range
- **Event Types Supported**: milonga, festival, workshop, practica, class
- **Price Parsing**: Extracts numeric price from various formats ($20, 20 USD, etc.)

### 7.2 Housing System Integration

- **Housing Listings Table**: Queried via `/api/travel/housing-by-city`
- **MT Host Profiles**: User info joined for host details
- **Cost Calculation**: `pricePerNight × nights` for total trip cost
- **Filters**: City, max guests, active status

### 7.3 Location Picker Integration

- **UnifiedLocationPicker**: Used for city selection in trip creation
- **Mode**: `city` mode for destination selection
- **Coordinates**: Stored in `cities` JSONB for multi-city trips

---

## 8. UI Components & Features

### 8.1 Trip Card Display

```
┌────────────────────────────────────────────────────────────────┐
│  [City Image]                                                   │
│                                                                 │
│  Buenos Aires, Argentina              [Status Badge: Planning] │
│  Mar 1 - Mar 14, 2025 (14 days)                                │
│                                                                 │
│  Budget: $2,000    Spent: $1,765                               │
│  [Progress Bar: 88%]                                           │
│                                                                 │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐           │
│  │ Hotels  │Transport│ Dining  │Activities│ Events  │           │
│  │ $900    │ $850    │ $150    │ $200    │ $165    │           │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘           │
│                                                                 │
│  [Expand] [Edit] [Delete]                                      │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Itinerary Item Card

```
┌────────────────────────────────────────────────────────────────┐
│ [Type Icon] Hotel                           [Booked ✓]         │
│                                                                 │
│ Hotel Boutique San Telmo                                       │
│ San Telmo, Buenos Aires                                        │
│ Mar 1 - Mar 10 (9 nights)                                      │
│                                                                 │
│ $100/night × 9 nights = $900                                   │
│                                                                 │
│ [View Booking] [Edit] [Remove]                                 │
└────────────────────────────────────────────────────────────────┘
```

### 8.3 Transport Type Selector

```
┌────────────────────────────────────────────────────────────────┐
│ Select Transport Type:                                          │
│                                                                 │
│  ✈️ Flight   🚂 Train   🚌 Bus   🚗 Car   ⚓ Boat              │
│  [Active]   [ ]        [ ]      [ ]      [ ]                   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 8.4 Add Accommodation Dialog

```
┌────────────────────────────────────────────────────────────────┐
│ Add Accommodation                                     [×]      │
│ ─────────────────────────────────────────────────────────────  │
│ [MT Host] [Manual Entry]                                       │
│                                                                 │
│ ──── MT Host Listings ────────────────────────────────────────│
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Sofia's Cozy Apartment - San Telmo                        │  │
│ │ ⭐ 4.8 • 2 bed • Sleeps 4                                 │  │
│ │ $45/night × 9 nights = $405                               │  │
│ │ [Host Avatar] Sofia Chen • Leader/Follower               │  │
│ │                                        [Add to Trip]      │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ──── Or paste booking URL ─────────────────────────────────── │
│ [                                              ] [Scrape]      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Cross-References

### 9.1 Related PRDs

- [PRD_UNIFIED_LOCATION_PICKER.md](./PRD_UNIFIED_LOCATION_PICKER.md) - Location selection component
- [PRD_UNIFIED_FEEDS_SYSTEM.md](./PRD_UNIFIED_FEEDS_SYSTEM.md) - Event feed integration

### 9.2 Related Database Tables

- **events** - Milongas, festivals, workshops to add to itinerary
- **housingListings** - MT Host accommodations
- **users** - Host profiles for MT Host integration
- **groups** - City groups for community connections

### 9.3 Related Features

- **Housing Marketplace** (`/housing`) - Browse and book MT Host listings
- **Events Page** (`/events`) - Discover events at destinations
- **City Groups** (`/groups`) - Connect with local community
- **Profile Travel Tab** (`/profile/[id]?tab=travel`) - View user's travel plans

---

## 10. Usage Examples

### 10.1 Creating a Multi-City Trip

```typescript
// Frontend: ProfileTabTravel.tsx
const [selectedCities, setSelectedCities] = useState<CityOption[]>([]);

// Add city with dates
setSelectedCities([
  ...selectedCities,
  {
    city: "Buenos Aires",
    country: "Argentina",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-03-10")
  }
]);

// Submit creates travel plan with cities JSONB
const response = await apiRequest("POST", "/api/travel/plans", {
  city: selectedCities[0].city,  // Primary city
  country: selectedCities[0].country,
  cities: selectedCities,  // All cities with dates
  startDate: selectedCities[0].startDate,
  endDate: selectedCities[selectedCities.length - 1].endDate,
  tripDuration: calculateDuration(selectedCities),
});
```

### 10.2 Adding Event to Itinerary

```typescript
// Fetch events for destination
const { data: events } = useQuery({
  queryKey: ['/api/travel/events-by-city', city, startDate, endDate],
  queryFn: () => fetch(`/api/travel/events-by-city?city=${city}&startDate=${startDate}&endDate=${endDate}`)
});

// Add event to itinerary
const addEventMutation = useMutation({
  mutationFn: (event: CityEvent) => apiRequest("POST", `/api/travel/plans/${tripId}/items`, {
    type: event.eventType === 'milonga' ? 'milonga' : 'event',
    title: event.title,
    description: event.description,
    date: event.startDate,
    location: event.location,
    cost: event.numericPrice,
    linkedEventId: event.id,
    isBooked: false
  }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/travel/plans'] })
});
```

### 10.3 Using URL Scraping

```typescript
// Scrape accommodation details
const scrapeAccommodation = async (url: string) => {
  const response = await apiRequest("POST", "/api/travel/scrape-accommodation", { url });
  
  if (response.success) {
    const data = response.data as ScrapedAccommodation;
    // Pre-fill form with scraped data
    form.setValue("title", data.title || "");
    form.setValue("cost", data.pricePerNight || 0);
    form.setValue("location", data.address || "");
    form.setValue("description", data.description || "");
    form.setValue("bookingUrl", data.url);
  }
};
```

---

## 11. Future Considerations

### 11.1 Planned Enhancements

- **AI Trip Recommendations**: Use platform data to suggest optimal milonga schedules
- **Weather Integration**: Show weather forecast for destination dates
- **Currency Conversion**: Real-time currency conversion for international trips
- **Collaborative Planning**: Share trips with travel companions for group planning
- **Export/Share**: Generate PDF itinerary or shareable link
- **Calendar Sync**: Export itinerary to Google Calendar, iCal

### 11.2 Known Limitations

- **Scraping Reliability**: External booking sites may block or change structure
- **Event Coverage**: Event data depends on platform event listings
- **Offline Access**: No offline mode for travel data
- **Multi-Currency**: Budget tracking in single currency only

### 11.3 Performance Considerations

- **Cities JSONB**: Multi-city trips stored as JSONB for flexibility
- **Event Queries**: Limited to 50 events per destination to prevent overload
- **Housing Queries**: Limited to 20 listings per city
- **Scraping Timeout**: 15-second timeout for external URL scraping
