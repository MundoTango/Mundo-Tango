export const marketplaceAgentsKnowledge = `
# MARKETPLACE AI AGENTS KNOWLEDGE BASE

## Overview
The Mundo Tango Creator Marketplace is powered by 8 specialized AI agents that provide intelligent fraud detection, dynamic pricing, product recommendations, review analysis, inventory management, seller support, transaction monitoring, and quality assurance.

## Agent #167: Fraud Detection Agent

### Capabilities
- Transaction pattern analysis (unusual purchase volumes, velocity)
- Suspicious seller behavior detection (fake reviews, price manipulation)
- Payment anomaly detection (chargebacks, refunds patterns)
- IP address verification (VPN/proxy detection)
- User behavior scoring (new accounts, rapid purchases)
- Automated flagging system (low/medium/high risk)
- Integration with Stripe Radar

### Common Queries
**Q: "Are there any fraudulent transactions?"**
A: I'll check recent transactions for fraud indicators. The Fraud Detection Agent analyzes:
- Transaction velocity (purchases per hour)
- User account age and verification status
- Payment anomalies and patterns
- IP address reputation
- Stripe Radar signals

You can get detailed fraud reports at: GET /api/marketplace/agents/fraud-check

**Q: "Is this transaction safe?"**
A: I can analyze a specific transaction for fraud risk. The agent provides:
- Risk score (0-100)
- Risk level (low/medium/high)
- Specific flags and issues detected
- Recommended actions

**Q: "Check seller behavior for fraud"**
A: I'll analyze seller activity patterns including:
- Review authenticity
- Price manipulation indicators
- Product listing consistency
- Historical transaction patterns

### API Endpoints
- POST /api/marketplace/agents/fraud-check
- GET /api/marketplace/agents/seller-behavior/:sellerId

## Agent #168: Dynamic Pricing Agent

### Capabilities
- Competitive pricing analysis (market rate comparison)
- Demand-based pricing (surge pricing for popular items)
- Inventory-based pricing (discount overstock, premium for scarcity)
- Seasonal pricing adjustments
- Profit margin optimization
- A/B testing price points

### Common Queries
**Q: "Recommend optimal price for my product"**
A: I'll analyze your product pricing using:
- Competitor price comparison
- Demand trends and sales velocity
- Inventory levels
- Seasonal factors
- Target profit margins

The agent provides:
- Current price vs. recommended price
- Expected impact on sales and revenue
- Detailed reasoning for recommendations
- Confidence score

**Q: "Should I adjust my prices?"**
A: I can analyze all your products and identify pricing opportunities:
- Overpriced products (losing sales)
- Underpriced products (leaving money on table)
- Optimal pricing windows
- Competitive positioning

**Q: "What's the market price for [category]?"**
A: I'll analyze market pricing for your category including:
- Average market price
- Price range (low to high)
- Your position relative to market
- Competitor count and distribution

### API Endpoints
- POST /api/marketplace/agents/optimize-price
- GET /api/marketplace/agents/bulk-pricing/:sellerId

## Agent #169: Product Recommendation Engine

### Capabilities
- Collaborative filtering (users who bought X also bought Y)
- Content-based filtering (similar products by category, tags)
- Trending products detection
- Personalized recommendations
- Bundle suggestions
- Cross-sell and upsell opportunities

### Common Queries
**Q: "What products should I recommend to [user]?"**
A: I'll generate personalized recommendations using:
- User purchase history
- Browsing behavior
- Similar user preferences
- Trending products
- Category preferences

**Q: "Show similar products to [product]"**
A: I'll find similar products based on:
- Category and subcategory
- Tags and attributes
- Price range
- User ratings
- Purchase patterns

**Q: "What products often sell together?"**
A: I'll identify bundle opportunities:
- Frequently bought together
- Complementary products
- Complete product sets
- Upsell opportunities

### API Endpoints
- GET /api/marketplace/agents/recommendations/:userId
- GET /api/marketplace/agents/recommendations/similar/:productId
- GET /api/marketplace/agents/bundle-suggestions/:productId

## Agent #170: Review Sentiment Analyzer

### Capabilities
- Natural Language Processing on review text
- Sentiment scoring (-1 negative to +1 positive)
- Fake review detection
- Review helpfulness ranking
- Key phrase extraction
- Product improvement suggestions

### Common Queries
**Q: "Analyze reviews for my product"**
A: I'll provide comprehensive review analysis:
- Average sentiment score
- Sentiment distribution (positive/neutral/negative)
- Top positive themes
- Top negative themes
- Improvement suggestions
- Trend direction (improving/stable/declining)

**Q: "Are there fake reviews on this product?"**
A: I'll detect suspicious reviews including:
- Template/generic language detection
- Review pattern analysis
- Unverified purchase reviews
- Suspicious timing patterns
- Overall risk assessment

**Q: "What are customers saying about quality/shipping/value?"**
A: I'll extract topic-specific sentiment:
- Quality mentions and sentiment
- Shipping/delivery feedback
- Value for money perception
- Customer service experiences

### API Endpoints
- POST /api/marketplace/agents/analyze-reviews/:productId
- POST /api/marketplace/agents/analyze-review-text

## Agent #171: Inventory Management Agent

### Capabilities
- Stock level monitoring and alerts
- Restock recommendations based on sales velocity
- Dead stock identification
- Seasonal inventory planning
- Inventory turnover optimization

### Common Queries
**Q: "What products should I restock?"**
A: I'll analyze inventory and provide restock recommendations:
- Products with low stock
- Estimated days until stockout
- Recommended restock quantity
- Priority level (urgent/high/medium/low)
- Cost estimates

**Q: "Show my inventory health"**
A: I'll provide complete inventory analysis:
- Total products and active count
- Low stock products
- Out of stock products
- Dead stock (slow-moving)
- Fast-moving products
- Overall health score (0-100)

**Q: "Which products aren't selling?"**
A: I'll identify dead stock:
- Products with no recent sales
- Days since last sale
- Total revenue to date
- Recommended actions (discount/bundle/discontinue)

### API Endpoints
- GET /api/marketplace/agents/inventory-alerts
- GET /api/marketplace/agents/inventory-health
- GET /api/marketplace/agents/restock-recommendations
- GET /api/marketplace/agents/dead-stock

## Agent #172: Seller Support Agent

### Capabilities
- Performance analytics (sales trends, top products)
- Optimization recommendations
- Marketing strategy suggestions
- Listing quality scoring
- Revenue forecasting

### Common Queries
**Q: "Show me my seller performance"**
A: I'll provide comprehensive performance metrics:
- Total revenue and sales
- Average order value
- Product count and ratings
- Conversion rate
- Top performing products
- Growth trends (revenue, sales, satisfaction)

**Q: "How can I improve my listings?"**
A: I'll score your product listings on:
- Title quality (keywords, length, appeal)
- Description quality (detail, formatting)
- Image quality (count, resolution)
- Pricing competitiveness
- Category accuracy
Plus specific improvement recommendations

**Q: "What will my revenue be next month?"**
A: I'll forecast your revenue using:
- Historical sales data
- Growth rate trends
- Seasonal patterns
- Market conditions
- Confidence level and assumptions

### API Endpoints
- GET /api/marketplace/agents/seller-insights/:sellerId
- GET /api/marketplace/agents/listing-quality/:productId

## Agent #173: Transaction Monitor

### Capabilities
- Order fulfillment tracking
- Delivery time predictions
- Late shipment alerts
- Automated refund processing
- Payment settlement tracking
- Dispute resolution assistance

### Common Queries
**Q: "Track my order status"**
A: I'll provide real-time order tracking:
- Current status (pending/processing/completed/refunded)
- Status timeline with timestamps
- Estimated delivery time
- Tracking information
- Refund eligibility

**Q: "When will I get paid?"**
A: I'll show your payment settlement status:
- Pending amount (not yet settled)
- Available amount (ready for payout)
- Next payout date
- Transaction details
- Settlement delay (typically 7 days)

**Q: "Process a refund for order [ID]"**
A: I can process refunds with:
- Automatic approval (within 30 days)
- Partial or full refund options
- Stripe integration
- Status confirmation

### API Endpoints
- GET /api/marketplace/agents/transaction-status/:orderId
- POST /api/marketplace/agents/process-refund
- GET /api/marketplace/agents/settlement-status

## Agent #174: Quality Assurance Agent

### Capabilities
- Product listing review
- Image quality assessment
- Description accuracy verification
- Category classification validation
- Duplicate listing detection
- Automated approval/rejection workflow

### Common Queries
**Q: "Review my product listing"**
A: I'll perform comprehensive QA review:
- Content policy compliance
- Image quality score
- Category accuracy
- Description completeness
- Duplicate detection
- Brand authenticity checks
- Overall score and approval status

**Q: "Why was my listing rejected?"**
A: I'll explain QA issues:
- Policy violations (if any)
- Quality issues (images, description)
- Required improvements
- Specific recommendations

**Q: "What's in the QA review queue?"**
A: Admin only - I'll show:
- Pending products awaiting review
- Seller information
- Submission dates
- Priority levels

### API Endpoints
- POST /api/marketplace/agents/qa-review/:productId
- GET /api/marketplace/agents/qa-queue (admin only)

## Integration Workflow

### On New Purchase
1. Fraud Detection Agent checks transaction
2. Transaction Monitor tracks order status
3. Recommendation Engine updates user preferences

### On New Review
1. Review Analyzer performs sentiment analysis
2. Review Analyzer detects fake reviews
3. Seller Support updates performance metrics

### On New Listing
1. Quality Assurance Agent reviews listing
2. Dynamic Pricing Agent analyzes market position
3. Auto-approval if QA score > 75

### Daily Maintenance (2:00 AM)
1. Inventory Manager generates alerts
2. Seller Support calculates performance metrics
3. Dynamic Pricing reviews market conditions
4. Quality Assurance processes review queue

## Query Examples for Mr. Blue

**General Health**
- "How is the marketplace doing?"
- "Are there any issues I should know about?"
- "Show marketplace metrics"

**For Sellers**
- "How are my products performing?"
- "Should I adjust my prices?"
- "What inventory needs attention?"
- "How can I improve my listings?"
- "When is my next payout?"

**For Buyers**
- "Recommend products for me"
- "Show similar products to [product name]"
- "Track my order"

**For Admins**
- "Show fraud alerts"
- "What's the transaction health?"
- "Review QA queue"
- "Show seller behavior issues"

## Technical Details

### Agent Priority Levels
- Critical: Fraud detection (real-time)
- High: Transaction monitoring, QA reviews
- Medium: Pricing optimization, review analysis
- Low: Inventory checks, seller support (batch processing)

### Response Times
- Fraud checks: < 2 seconds
- Price recommendations: < 5 seconds
- Product recommendations: < 3 seconds
- Review analysis: < 10 seconds
- Inventory analysis: < 7 seconds

### Data Sources
- marketplace_products: Product listings and inventory
- product_purchases: Transaction history
- product_reviews: Customer reviews and ratings
- marketplace_analytics: Performance metrics
- Stripe API: Payment and fraud data
`;

export function getMarketplaceAgentHelp(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Fraud detection queries
  if (lowerQuery.includes('fraud') || lowerQuery.includes('suspicious')) {
    return `I can help with fraud detection:
- Check specific transactions: POST /api/marketplace/agents/fraud-check
- Analyze seller behavior: GET /api/marketplace/agents/seller-behavior/:sellerId
- View transaction health: GET /api/marketplace/agents/transaction-health (admin)

What would you like to check?`;
  }

  // Pricing queries
  if (lowerQuery.includes('price') || lowerQuery.includes('pricing')) {
    return `I can help optimize your pricing:
- Get price recommendations: POST /api/marketplace/agents/optimize-price
- Bulk pricing analysis: GET /api/marketplace/agents/bulk-pricing/:sellerId

Just provide your product ID and I'll analyze the market for you!`;
  }

  // Recommendation queries
  if (lowerQuery.includes('recommend') || lowerQuery.includes('similar')) {
    return `I can provide product recommendations:
- Personalized for users: GET /api/marketplace/agents/recommendations/:userId
- Similar products: GET /api/marketplace/agents/recommendations/similar/:productId
- Bundle suggestions: GET /api/marketplace/agents/bundle-suggestions/:productId

Which type of recommendation do you need?`;
  }

  // Review queries
  if (lowerQuery.includes('review') || lowerQuery.includes('sentiment')) {
    return `I can analyze product reviews:
- Full review analysis: POST /api/marketplace/agents/analyze-reviews/:productId
- Single review sentiment: POST /api/marketplace/agents/analyze-review-text
- Includes sentiment scores, fake detection, and key themes

Which product should I analyze?`;
  }

  // Inventory queries
  if (lowerQuery.includes('inventory') || lowerQuery.includes('stock') || lowerQuery.includes('restock')) {
    return `I can help manage your inventory:
- Get alerts: GET /api/marketplace/agents/inventory-alerts
- Check health: GET /api/marketplace/agents/inventory-health
- Restock recommendations: GET /api/marketplace/agents/restock-recommendations
- Identify dead stock: GET /api/marketplace/agents/dead-stock

What inventory information do you need?`;
  }

  // Seller performance queries
  if (lowerQuery.includes('performance') || lowerQuery.includes('seller') || lowerQuery.includes('insights')) {
    return `I can show seller performance metrics:
- Comprehensive insights: GET /api/marketplace/agents/seller-insights/:sellerId
- Listing quality scores: GET /api/marketplace/agents/listing-quality/:productId
- Revenue forecasting and trends included

Which seller's performance would you like to see?`;
  }

  // Transaction queries
  if (lowerQuery.includes('order') || lowerQuery.includes('transaction') || lowerQuery.includes('track')) {
    return `I can help with order tracking:
- Order status: GET /api/marketplace/agents/transaction-status/:orderId
- Process refunds: POST /api/marketplace/agents/process-refund
- Settlement status: GET /api/marketplace/agents/settlement-status

What order information do you need?`;
  }

  // QA queries
  if (lowerQuery.includes('qa') || lowerQuery.includes('quality') || lowerQuery.includes('approval')) {
    return `I can help with product quality assurance:
- Review listing: POST /api/marketplace/agents/qa-review/:productId
- View QA queue: GET /api/marketplace/agents/qa-queue (admin only)
- Get quality scores and approval status

Which product needs QA review?`;
  }

  return `I can help with marketplace operations powered by 8 AI agents:

1. **Fraud Detection** - Transaction security and risk analysis
2. **Dynamic Pricing** - Optimal pricing recommendations
3. **Recommendations** - Personalized product suggestions
4. **Review Analysis** - Sentiment and fake review detection
5. **Inventory Management** - Stock monitoring and alerts
6. **Seller Support** - Performance metrics and insights
7. **Transaction Monitor** - Order tracking and settlements
8. **Quality Assurance** - Listing review and approval

What specific marketplace task can I help you with?`;
}
