# PRD: Marketplace System

**Version:** 1.0  
**Created:** November 30, 2025  
**Pattern Applied:** MB.MD v9.6 Pattern 28 - Hierarchical Execution  
**Priority:** P0 (Revenue-Critical)  
**Source:** Reverse-engineered from E2E tests, database schema, API routes, and frontend pages

---

## 1. Overview

### 1.1 Purpose
The Marketplace System enables users to buy and sell tango-related products within the Mundo Tango platform. It features a complete e-commerce experience with product browsing, shopping cart, Stripe checkout, seller dashboard, and AI-powered recommendations.

### 1.2 Business Value
- **Revenue Stream:** Platform commission on marketplace transactions
- **Community Value:** Connect dancers with tango shoes, clothing, accessories
- **Seller Enablement:** Let community members monetize their products
- **AI Integration:** Recommendations, fraud detection, seller analytics

### 1.3 Key Metrics
- Transaction volume (monthly sales)
- Average order value
- Seller conversion rate
- Product discovery to purchase ratio

---

## 2. Database Schema

### 2.1 Core Tables

#### `marketplace_items`
Primary table for product listings.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sellerId | integer | FK to users.id (cascade delete) |
| title | varchar | Product title |
| description | text | Product description |
| category | varchar | Product category (shoes, clothing, accessories) |
| condition | varchar | new, like-new, good, fair |
| price | integer | Price in cents |
| currency | varchar | Currency code (default: USD) |
| images | jsonb | Array of image URLs |
| location | varchar | General location |
| city | varchar | City |
| country | varchar | Country |
| status | varchar | available, sold, reserved, inactive |
| views | integer | View count |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

**Indexes:**
- `marketplace_seller_idx` on sellerId
- `marketplace_category_idx` on category
- `marketplace_status_idx` on status
- `marketplace_city_idx` on city

#### `marketplace_products`
Digital products created by sellers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| creatorUserId | integer | FK to users.id |
| title | varchar(255) | Product title |
| description | text | Full description |
| shortDescription | varchar(500) | Preview text |
| category | varchar | Category type |
| productType | varchar | video, document, template, course |
| price | numeric(10,2) | Price |
| currency | varchar | Currency code |
| fileUrls | jsonb | Downloadable files |
| previewUrls | jsonb | Preview images/videos |
| thumbnailUrl | varchar | Thumbnail image |
| downloadCount | integer | Total downloads |
| rating | real | Average rating |
| reviewCount | integer | Number of reviews |
| status | varchar | draft, published, archived |

**Indexes:**
- `marketplace_products_creator_idx` on creatorUserId
- `marketplace_products_category_idx` on category
- `marketplace_products_status_idx` on status
- `marketplace_products_rating_idx` on rating

#### `product_purchases`
Records of product purchases.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| productId | integer | FK to marketplace_products.id |
| buyerUserId | integer | FK to users.id |
| amount | numeric(10,2) | Purchase amount |
| status | varchar | pending, completed, refunded |
| downloadedAt | timestamp | First download time |
| createdAt | timestamp | Purchase time |

#### `product_reviews`
Reviews and ratings for products.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| productId | integer | FK to marketplace_products.id |
| reviewerUserId | integer | FK to users.id |
| rating | integer | 1-5 stars |
| title | varchar | Review title |
| content | text | Review content |
| isVerifiedPurchase | boolean | Verified buyer |
| helpfulVotes | integer | Helpful vote count |
| createdAt | timestamp | Review date |

#### `marketplace_analytics`
Seller analytics and performance metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sellerId | integer | FK to users.id |
| period | varchar | day, week, month |
| periodStart | date | Period start date |
| totalRevenue | numeric(10,2) | Total revenue |
| platformFees | numeric(10,2) | Platform commission |
| netRevenue | numeric(10,2) | Net to seller |
| totalSales | integer | Transaction count |
| productsSold | jsonb | Products breakdown |
| topProducts | jsonb | Top selling items |
| calculatedAt | timestamp | Calculation time |

---

## 3. API Endpoints

### 3.1 Product Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/marketplace/items` | No | List items with filters |
| GET | `/api/marketplace/items/:id` | No | Get single item (increments views) |
| POST | `/api/marketplace/items` | Yes | Create new item |
| PATCH | `/api/marketplace/items/:id` | Yes | Update item (owner only) |
| DELETE | `/api/marketplace/items/:id` | Yes | Delete item (owner only) |
| PATCH | `/api/marketplace/items/:id/status` | Yes | Update status |
| GET | `/api/marketplace/my-items` | Yes | Get seller's items |
| GET | `/api/marketplace/categories` | No | List categories with counts |

### 3.2 Query Parameters for GET /items

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| condition | string | Filter by condition |
| status | string | Filter by status |
| city | string | Filter by city |
| country | string | Filter by country |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| limit | number | Results per page (default: 20) |
| offset | number | Pagination offset |

### 3.3 Request/Response Examples

**Create Item (POST /api/marketplace/items)**
```json
{
  "title": "Professional Tango Shoes",
  "description": "Genuine leather, size 42",
  "category": "shoes",
  "condition": "new",
  "price": 14999,
  "currency": "USD",
  "images": ["https://cdn.example.com/shoe1.jpg"],
  "city": "Buenos Aires",
  "country": "Argentina"
}
```

**Response**
```json
{
  "id": 123,
  "sellerId": 456,
  "title": "Professional Tango Shoes",
  "status": "available",
  "views": 0,
  "createdAt": "2025-11-30T..."
}
```

---

## 4. Frontend Pages

### 4.1 Page Inventory

| Page | Path | Purpose |
|------|------|---------|
| MarketplacePage | `/marketplace` | Product browsing & search |
| MarketplaceItemDetailPage | `/marketplace/item/:id` | Product details |
| MarketplaceProductDetailPage | `/marketplace/product/:id` | Digital product details |
| MarketplaceCartPage | `/marketplace/cart` | Shopping cart |
| MarketplaceCheckoutPage | `/marketplace/checkout` | Stripe payment |
| MarketplaceOrdersPage | `/marketplace/orders` | Order history |
| MarketplaceSellerDashboardPage | `/marketplace/seller` | Seller management |
| MarketplaceItemPage | `/marketplace/items` | Item listing page |

### 4.2 Key UI Components

#### Product Grid
```
data-testid="product-grid"
data-testid="card-product-{id}"
data-testid="item-card-{id}"
```

#### Filters & Search
```
data-testid="filter-category"
data-testid="filter-price-range"
data-testid="input-min-price"
data-testid="input-max-price"
data-testid="sort-products"
data-testid="input-search-marketplace"
```

#### Product Details
```
data-testid="text-product-title"
data-testid="text-product-description"
data-testid="text-product-price"
data-testid="button-add-to-cart"
data-testid="section-reviews"
```

#### Shopping Cart
```
data-testid="cart-item-{id}"
data-testid="input-quantity"
data-testid="button-remove-item"
data-testid="badge-cart-count"
data-testid="button-proceed-to-checkout"
```

#### Seller Dashboard
```
data-testid="button-add-product"
data-testid="input-product-title"
data-testid="input-product-description"
data-testid="input-product-price"
data-testid="select-category"
data-testid="input-product-images"
data-testid="button-submit-product"
data-testid="section-seller-analytics"
data-testid="section-fraud-monitoring"
data-testid="text-risk-score"
```

---

## 5. User Flows

### 5.1 Product Browsing Flow
```
1. User visits /marketplace
2. Browse product grid
3. Apply filters (category, price, location)
4. Sort results (price, date, popularity)
5. Search for specific products
6. View AI recommendations
7. Click product → detail page
```

### 5.2 Purchase Flow
```
1. View product details
2. Click "Add to Cart"
3. Navigate to cart (/marketplace/cart)
4. Update quantities
5. Proceed to checkout
6. Enter shipping address
7. Enter Stripe payment details
8. Submit payment
9. View order confirmation
10. Track order (/marketplace/orders)
```

### 5.3 Seller Flow
```
1. Access seller dashboard (/marketplace/seller)
2. Click "Add New Product"
3. Fill product form (title, description, price)
4. Select category
5. Upload product images
6. Submit for AI QA review
7. View product listing
8. Monitor analytics (sales, revenue, forecasts)
9. View fraud detection alerts
```

---

## 6. AI Features

### 6.1 Product Recommendations
- "Recommended for You" section based on user behavior
- "Similar Products" on product detail pages
- "Frequently Bought Together" bundles

### 6.2 Seller Analytics
- Top-selling products identification
- Revenue forecasting
- Listing quality scores
- Price optimization suggestions
- Inventory alerts (low stock)
- Customer satisfaction metrics

### 6.3 Quality & Security
- AI QA review for new listings
- Fake review detection with warnings
- Fraud detection and risk scoring
- AI-powered delivery time predictions
- Review sentiment analysis
- Helpfulness ranking for reviews

---

## 7. Payment Integration

### 7.1 Stripe Integration
- Full Stripe checkout integration
- Test card support in development
- Payment intent creation
- Webhook handling for payment confirmation
- Refund processing

### 7.2 Revenue Sharing
Integration with `revenue_shares` table:
- Transaction type: "marketplace"
- Platform fee calculation
- Creator payout tracking
- Revenue share distribution

---

## 8. E2E Test Coverage

### 8.1 Test File
`tests/e2e/04-marketplace.spec.ts` (625 lines)

### 8.2 Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Product Browsing & Recommendations | 3 | Browse, filter, recommendations |
| Shopping Cart & Checkout | 3 | Add to cart, checkout, order tracking |
| Seller Dashboard & AI Tools | 4 | Product management, analytics, fraud |
| E-commerce Quality Checks | 4 | SEO, empty cart, Stripe security |

### 8.3 Test IDs Required
All interactive elements must have `data-testid` attributes for E2E testing.

---

## 9. Performance Requirements

### 9.1 Page Load Times
- All marketplace pages: < 3 seconds
- Cart updates: < 500ms
- Search results: < 1 second

### 9.2 SEO Requirements
- Product pages must have:
  - Unique title tags
  - Meta descriptions
  - Open Graph tags (og:title, og:image)

---

## 10. Cross-System Wirings

### 10.1 Integrations

| System | Integration Point |
|--------|-------------------|
| Users | sellerId, buyerUserId references |
| Payments (Stripe) | Checkout and payment processing |
| Revenue Sharing | Platform commission tracking |
| Notifications | Order status updates |
| Reviews | Product ratings and reviews |

### 10.2 Shared Components
- MT Ocean Theme (color scheme validation)
- User authentication middleware
- Image upload (Cloudinary integration)

---

## 11. Status Definitions

### 11.1 Item Statuses
| Status | Description |
|--------|-------------|
| available | Listed and purchasable |
| sold | Transaction completed |
| reserved | Held for buyer |
| inactive | Temporarily unlisted |

### 11.2 Order Statuses
| Status | Description |
|--------|-------------|
| pending | Awaiting payment |
| processing | Payment received, preparing |
| shipped | In transit |
| delivered | Received by buyer |

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation (reverse-engineered from E2E tests + implementation) |

---

## 13. PRD Validation Checklist

- [x] Database schema documented with all columns and indexes
- [x] API endpoints documented with methods and parameters
- [x] Frontend pages listed with paths
- [x] UI test IDs documented for E2E testing
- [x] User flows defined step-by-step
- [x] AI features specified
- [x] Payment integration documented
- [x] Performance requirements stated
- [x] Cross-system wirings mapped
- [x] E2E test coverage verified

---

*Generated by Mr. Blue Agent Squad 1 (PRD Writers)*
*Pattern Applied: MB.MD v9.6 - Hierarchical Execution*
*Validation: 12-Category Audit Passed*
