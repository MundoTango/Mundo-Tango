# Mundo Tango - API Documentation

## 📡 API Overview

Complete API reference for the Mundo Tango platform with 80+ endpoints across 7 integrated systems.

**Base URL:** `https://mundotango.life/api`  
**Authentication:** JWT Bearer tokens  
**Format:** JSON

---

## 🔐 Authentication

### **POST /api/auth/register**
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "tango_dancer",
  "name": "Maria Rodriguez",
  "role": "dancer",
  "city": "Buenos Aires"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "tango_dancer",
    "role": "dancer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **POST /api/auth/login**
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": { ...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 💰 Financial Management System (33 AI Agents)

### **POST /api/financial/agents/start**
Start 33-agent financial management system with 30-second monitoring.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "33 agents started successfully",
  "monitoringInterval": "30 seconds",
  "agents": {
    "marketIntelligence": 5,
    "strategyEngines": 6,
    "executionRisk": 6,
    "machineLearning": 4,
    "monitoring": 3,
    "supporting": 8,
    "orchestrator": 1
  }
}
```

### **GET /api/financial/agents/status**
Get status of all 33 financial agents.

**Response:**
```json
{
  "systemActive": true,
  "agents": [
    {
      "id": 81,
      "name": "Market Data Aggregator",
      "tier": 1,
      "status": "active",
      "successRate": 0.87,
      "decisions": 142
    },
    ...
  ]
}
```

### **GET /api/financial/agents/decisions**
Get AI trading decisions with filtering.

**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `agentId` (optional)
- `action` (buy|sell|hold)

**Response:**
```json
{
  "decisions": [
    {
      "id": 1,
      "agentId": 86,
      "agentName": "Momentum Strategy",
      "symbol": "TSLA",
      "action": "buy",
      "confidence": 0.78,
      "reasoning": "MA crossover detected, strong uptrend",
      "positionSize": 50,
      "timestamp": "2025-11-13T10:30:00Z"
    }
  ],
  "total": 142
}
```

### **POST /api/financial/agents/:id/override**
Manually override specific agent decision.

**Request:**
```json
{
  "action": "hold",
  "reasoning": "Market conditions uncertain"
}
```

---

## 📱 Social Media Integration (5 AI Agents)

### **POST /api/social/agents/generate-content**
Generate AI-powered social media content from image or topic.

**Request:**
```json
{
  "imageUrl": "https://cloudinary.com/image.jpg",
  "platform": "instagram",
  "tone": "inspirational",
  "language": "en"
}
```

**Response:**
```json
{
  "caption": "Embrace the passion of tango! 💃🕺",
  "hashtags": ["#tango", "#dance", "#passion"],
  "platformVariants": {
    "instagram": "Full caption with hashtags...",
    "twitter": "Shortened version (280 chars)...",
    "facebook": "Extended version...",
    "linkedin": "Professional tone..."
  }
}
```

### **POST /api/social/agents/optimize-timing**
Get optimal posting time recommendations.

**Request:**
```json
{
  "platform": "instagram",
  "timezone": "America/Buenos_Aires"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "time": "2025-11-13T19:00:00-03:00",
      "confidence": 0.92,
      "reason": "Peak engagement time for your audience"
    },
    {
      "time": "2025-11-14T09:00:00-03:00",
      "confidence": 0.85,
      "reason": "Morning coffee scroll"
    }
  ]
}
```

### **POST /api/social/agents/schedule-campaign**
Schedule multi-platform campaign with AI optimization.

**Request:**
```json
{
  "campaignName": "Tango Workshop Promo",
  "platforms": ["instagram", "facebook", "twitter"],
  "content": "Join our workshop...",
  "scheduleType": "optimized"
}
```

---

## 🛒 Marketplace System (8 AI Agents)

### **POST /api/marketplace/agents/fraud-check**
Check transaction for fraud risk.

**Request:**
```json
{
  "orderId": 123,
  "userId": 456,
  "amount": 150.00,
  "paymentMethod": "credit_card"
}
```

**Response:**
```json
{
  "riskScore": 15,
  "riskLevel": "low",
  "flags": [],
  "recommendation": "approve",
  "details": {
    "accountAge": "2 years",
    "previousOrders": 12,
    "velocityCheck": "normal"
  }
}
```

### **POST /api/marketplace/agents/optimize-price**
Get AI pricing recommendations for product.

**Request:**
```json
{
  "productId": 789,
  "category": "dance_shoes",
  "currentPrice": 120.00
}
```

**Response:**
```json
{
  "recommendedPrice": 115.00,
  "priceRange": {
    "min": 110.00,
    "max": 130.00
  },
  "reasoning": "Competitive analysis suggests slight decrease",
  "demandElasticity": 0.75,
  "profitMargin": 45.2
}
```

### **GET /api/marketplace/agents/recommendations/:userId**
Get personalized product recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "productId": 101,
      "name": "Professional Tango Shoes",
      "score": 0.92,
      "reason": "Based on your browsing history"
    }
  ]
}
```

---

## ✈️ Travel Integration (6 AI Agents)

### **POST /api/travel/agents/optimize-itinerary**
Optimize trip itinerary with AI.

**Request:**
```json
{
  "tripId": 42,
  "activities": [
    {"name": "Workshop", "duration": 120, "location": "Studio A"},
    {"name": "Milonga", "duration": 180, "location": "Salon B"}
  ]
}
```

**Response:**
```json
{
  "optimizedSchedule": [
    {
      "day": 1,
      "activities": [...],
      "travelTime": 15,
      "energyLevel": "balanced"
    }
  ],
  "improvements": [
    "Reduced total travel time by 30 minutes",
    "Balanced high/low energy activities"
  ]
}
```

### **POST /api/travel/agents/find-accommodation**
Search for hotels/Airbnb using SerpApi.

**Request:**
```json
{
  "location": "Buenos Aires",
  "checkIn": "2025-12-01",
  "checkOut": "2025-12-07",
  "budget": 100,
  "amenities": ["wifi", "kitchen"]
}
```

**Response:**
```json
{
  "results": [
    {
      "name": "Tango Hotel",
      "price": 85,
      "rating": 4.5,
      "distance": "500m from event venue"
    }
  ]
}
```

---

## 💸 Crowdfunding/GoFundMe (4 AI Agents)

### **POST /api/crowdfunding/agents/predict-success**
Predict campaign success probability.

**Request:**
```json
{
  "campaignId": 15
}
```

**Response:**
```json
{
  "successProbability": 0.72,
  "fundingPrediction": {
    "expectedAmount": 3500,
    "expectedPercentage": 70,
    "timeline": {
      "daysToReach50": 15,
      "daysToReach100": 45
    }
  },
  "recommendations": {
    "optimalGoalAmount": 4000,
    "optimalDuration": 45,
    "improvements": ["Add video", "Improve story"]
  }
}
```

### **POST /api/crowdfunding/agents/optimize-campaign**
Get campaign optimization suggestions.

**Response:**
```json
{
  "overallScore": 68,
  "titleAnalysis": {
    "score": 72,
    "suggestions": ["Use action verbs", "Add emotion"]
  },
  "storyAnalysis": {
    "score": 65,
    "improvements": ["Add personal story", "Include impact section"]
  },
  "rewardTierOptimization": {
    "suggestedPricing": [25, 50, 100, 250]
  }
}
```

---

## 📄 Legal Document Management (2 AI Agents)

### **POST /api/legal/agents/review-document**
AI-powered legal document review.

**Request:**
```json
{
  "documentId": 88
}
```

**Response:**
```json
{
  "reviewId": 12,
  "clauseAnalysis": {
    "clausesFound": ["liability", "termination"],
    "missingClauses": ["dispute resolution", "governing law"],
    "completenessScore": 62
  },
  "riskAssessment": {
    "overallRiskScore": 45,
    "riskLevel": "moderate",
    "riskFactors": ["No limitation of liability"]
  },
  "complianceCheck": {
    "compliant": true,
    "standards": {
      "esignAct": true,
      "gdpr": false
    }
  },
  "recommendations": [
    "Add dispute resolution clause",
    "Include limitation of liability"
  ]
}
```

### **POST /api/legal/agents/suggest-clauses**
Get AI clause recommendations for document type.

**Request:**
```json
{
  "documentType": "event_waiver",
  "jurisdiction": "US"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "clauseType": "liability",
      "content": "Participant assumes all risks...",
      "priority": "critical"
    }
  ]
}
```

---

## 🧪 User Testing Platform (4 AI Agents)

### **POST /api/user-testing/agents/orchestrate-session**
Create and optimize testing session.

**Request:**
```json
{
  "feature": "checkout_flow",
  "participants": 5,
  "duration": 30
}
```

**Response:**
```json
{
  "sessionId": 99,
  "optimizedTasks": [
    "Navigate to product page",
    "Add item to cart",
    "Complete checkout"
  ],
  "estimatedDuration": 25,
  "recordingSetup": "ready"
}
```

### **POST /api/user-testing/agents/extract-insights**
Extract UX insights from session.

**Request:**
```json
{
  "sessionId": 99
}
```

**Response:**
```json
{
  "insights": [
    {
      "issue": "Confusing checkout button",
      "severity": "critical",
      "usersAffected": 4,
      "recommendation": "Make button more prominent"
    }
  ],
  "bugReports": [
    {
      "title": "Payment form validation error",
      "jiraTicket": "MT-123"
    }
  ]
}
```

---

## 🔔 Real-Time Features (WebSocket)

### **WebSocket Connection**
```javascript
const ws = new WebSocket('wss://mundotango.life/ws');

// Send authentication
ws.send(JSON.stringify({
  type: 'authenticate',
  token: 'your-jwt-token'
}));

// Receive notifications
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // { type: 'message', data: {...} }
};
```

### **Notification Types**
- `new_message` - Chat message received
- `friend_request` - New friend request
- `event_invite` - Event invitation
- `order_update` - Marketplace order status
- `campaign_milestone` - Crowdfunding goal reached
- `agent_alert` - AI agent decision notification

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## 🔒 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Financial AI | 10 req/min |
| Social Media AI | 20 req/min |
| General API | 100 req/15min |
| WebSocket | Unlimited |

---

**Full API Documentation:** [https://mundotango.life/api/docs](https://mundotango.life/api/docs)
