# SERVER INITIALIZATION FLOW DIAGRAM

**Investigation:** MB.MD SA-ζ-1  
**Date:** November 15, 2025

---

## ASCII FLOW DIAGRAM

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    MUNDO TANGO SERVER BOOT SEQUENCE                   ║
╚═══════════════════════════════════════════════════════════════════════╝

START: Node.js executes server/index.ts
  │
  ├─▶ [PHASE 1: Module Imports & App Creation]
  │   ├── Import express, routes, middleware
  │   ├── Import security modules
  │   ├── Import logging utilities
  │   ├── Import health check handlers
  │   └── Create Express app instance
  │
  ├─▶ [PHASE 2: Trust Proxy Configuration]
  │   └── app.set('trust proxy', 1)
  │
  ├─▶ [PHASE 3: Security & Performance Middleware Stack] ⚠️ ORDER CRITICAL
  │   ├── 1. Morgan HTTP request logging
  │   ├── 2. CSP nonce generation (res.locals.cspNonce)
  │   ├── 3. Helmet security headers (uses nonces)
  │   ├── 4. Additional security headers
  │   ├── 5. CORS & sanitization
  │   ├── 6. Global rate limiting (100 req/15min)
  │   ├── 7. Compression (gzip/brotli)
  │   ├── 8. Performance monitoring
  │   ├── 9. JSON body parser (preserves rawBody)
  │   ├── 10. URL-encoded parser
  │   ├── 11. Cookie parser
  │   └── 12. CSRF token setter (GET requests)
  │
  ├─▶ [PHASE 4: Health Check Endpoints]
  │   ├── GET /health (legacy)
  │   ├── GET /ready (legacy)
  │   └── GET /live (legacy)
  │
  ├─▶ [PHASE 5: API Request Tracking Middleware]
  │   └── Logs duration & response for all /api/* routes
  │
  ├─▶ [PHASE 6: Async IIFE - Route Registration Block]
  │   │
  │   ├── [6a: Route-Specific Rate Limiters]
  │   │   ├── /api/auth rate limiter (10 req/15min)
  │   │   ├── /api/admin rate limiter (20 req/15min)
  │   │   ├── /api/upload rate limiter (5 req/15min)
  │   │   ├── /api/search rate limiter (30 req/15min)
  │   │   └── /api general rate limiter (100 req/15min)
  │   │
  │   ├── [6b: CSRF Protection]
  │   │   ├── Set CSRF token cookie (GET requests)
  │   │   └── Verify CSRF token (POST/PUT/DELETE/PATCH)
  │   │
  │   ├─▶ [6c: CRITICAL - registerRoutes(app) Call]
  │   │   │
  │   │   ├── Enter server/routes.ts
  │   │   │
  │   │   ├── [Sub-Phase 1: Security Middleware]
  │   │   │   ├── setCsrfToken (redundant but safe)
  │   │   │   ├── GET /api/csrf-token endpoint
  │   │   │   └── verifyCsrfToken verification
  │   │   │
  │   │   ├── [Sub-Phase 2: Route Module Registration]
  │   │   │   ├── 100+ route modules via app.use()
  │   │   │   ├── /api/auth → authRoutes
  │   │   │   ├── /api/mrblue → mrBlueRoutes
  │   │   │   ├── /api/events → eventRoutes
  │   │   │   ├── /api/groups → groupRoutes
  │   │   │   ├── /api/marketplace → marketplaceRoutes
  │   │   │   ├── /api/crowdfunding → crowdfundingRoutes
  │   │   │   ├── ... (90+ more routes)
  │   │   │   └── Error handler registration
  │   │   │
  │   │   ├── [Sub-Phase 3: HTTP Server Creation] ⭐ CRITICAL
  │   │   │   └── const httpServer = createServer(app)
  │   │   │
  │   │   ├── [Sub-Phase 4: WebSocket Initialization] ⭐⭐⭐
  │   │   │   │
  │   │   │   ├── [WS 1: Notification Service]
  │   │   │   │   ├── wsNotificationService.initialize(httpServer)
  │   │   │   │   ├── Path: /ws/notifications
  │   │   │   │   ├── Purpose: Real-time notifications
  │   │   │   │   └── Features: Multi-device, auth required
  │   │   │   │
  │   │   │   ├── [WS 2: Realtime Voice]
  │   │   │   │   ├── initRealtimeVoiceWebSocket(httpServer)
  │   │   │   │   ├── Path: /ws/realtime
  │   │   │   │   ├── Purpose: OpenAI voice chat
  │   │   │   │   └── Features: Bidirectional audio streaming
  │   │   │   │
  │   │   │   ├── [WS 3: Livestream Chat]
  │   │   │   │   ├── initLivestreamWebSocket(httpServer)
  │   │   │   │   ├── Path: /ws/stream/:streamId
  │   │   │   │   ├── Purpose: Live event chat
  │   │   │   │   └── Features: Room isolation, broadcasting
  │   │   │   │
  │   │   │   └── [WS 4: Autonomous Workflow]
  │   │   │       ├── autonomousWsService.initialize(httpServer)
  │   │   │       ├── Path: /ws/autonomous
  │   │   │       ├── Purpose: AI agent communication
  │   │   │       └── Features: Status updates, approvals
  │   │   │
  │   │   └── [Sub-Phase 5: Return HTTP Server]
  │   │       └── return httpServer
  │   │
  │   ├── [6d: Error Handler Setup]
  │   │   └── Global error handler with Winston logging
  │   │
  │   ├── [6e: Frontend Serving Setup]
  │   │   ├── IF development:
  │   │   │   └── setupVite(app, server)
  │   │   └── ELSE production:
  │   │       └── serveStatic(app)
  │   │
  │   └── [6f: Server Listen & Background Jobs]
  │       ├── server.listen(port 5000, host 0.0.0.0)
  │       └── On listening callback:
  │           ├── startPreviewExpirationChecker()
  │           └── initStoryExpirationJob()
  │
  └─▶ [COMPLETE: Server Fully Operational]
      ├── HTTP endpoints accepting requests
      ├── WebSocket connections accepting clients
      ├── Background jobs running
      └── ✅ SYSTEM READY

END: Server listening on 0.0.0.0:5000
```

---

## WEBSOCKET INITIALIZATION DETAIL

```
╔═════════════════════════════════════════════════════════════════╗
║              WEBSOCKET INITIALIZATION ARCHITECTURE              ║
╚═════════════════════════════════════════════════════════════════╝

HTTP Server (created in server/routes.ts Line 4065)
  │
  │  const httpServer = createServer(app);
  │
  ├─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  ▼                                                                 ▼
[WebSocket Service 1]                              [WebSocket Service 2]
wsNotificationService                              initRealtimeVoiceWebSocket
  │                                                   │
  ├─ Path: /ws/notifications                         ├─ Path: /ws/realtime
  ├─ File: websocket-notification-service.ts         ├─ File: realtimeVoice.ts
  ├─ Purpose: User notifications                     ├─ Purpose: OpenAI voice chat
  └─ Dependencies:                                   └─ Dependencies:
     ├─ ws (WebSocket library)                          ├─ OpenAI Realtime SDK
     ├─ HTTP server instance                            ├─ HTTP server instance
     └─ User authentication                             └─ JWT authentication

  ▼                                                 ▼
[WebSocket Service 3]                              [WebSocket Service 4]
initLivestreamWebSocket                            autonomousWsService
  │                                                   │
  ├─ Path: /ws/stream/:streamId                      ├─ Path: /ws/autonomous
  ├─ File: livestream-websocket.ts                   ├─ File: websocket.ts
  ├─ Purpose: Live event chat                        ├─ Purpose: AI agent updates
  └─ Dependencies:                                   └─ Dependencies:
     ├─ Room management service                        ├─ Autonomous orchestrator
     ├─ HTTP server instance                            ├─ HTTP server instance
     └─ Stream permissions                              └─ God-level permissions

All initialize AFTER HTTP server creation
All initialize BEFORE server.listen()
```

---

## MIDDLEWARE EXECUTION FLOW

```
╔═══════════════════════════════════════════════════════════════════╗
║                 REQUEST PROCESSING PIPELINE                       ║
╚═══════════════════════════════════════════════════════════════════╝

Incoming HTTP Request
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. TRUST PROXY                                                  │
│    ├─ Reads X-Forwarded-For header                             │
│    └─ Sets req.ip to actual client IP                          │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. MORGAN HTTP LOGGER                                           │
│    └─ Logs: IP, method, path, status, duration                 │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CSP NONCE GENERATOR                                          │
│    └─ Sets res.locals.cspNonce = randomUUID()                  │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. HELMET SECURITY HEADERS                                      │
│    ├─ Content-Security-Policy (uses nonce)                      │
│    ├─ X-Frame-Options: DENY                                     │
│    ├─ X-Content-Type-Options: nosniff                           │
│    └─ Strict-Transport-Security                                 │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. ADDITIONAL SECURITY HEADERS                                  │
│    ├─ X-XSS-Protection: 1; mode=block                           │
│    └─ Permissions-Policy                                        │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. CORS & SANITIZATION                                          │
│    ├─ Validates request origin                                  │
│    └─ Sanitizes dangerous input patterns                        │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. GLOBAL RATE LIMITER                                          │
│    ├─ Check: 100 requests per 15 minutes per IP                │
│    └─ If exceeded: Return 429 Too Many Requests                │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. COMPRESSION                                                   │
│    └─ Compress response with gzip or brotli                     │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. PERFORMANCE MONITORING                                       │
│    └─ Track request metrics for analytics                       │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. BODY PARSERS                                                 │
│     ├─ Parse JSON body (preserves req.rawBody)                  │
│     ├─ Parse URL-encoded form data                              │
│     └─ Parse cookies into req.cookies                           │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. CSRF TOKEN SETTER (GET requests)                            │
│     └─ Set XSRF-TOKEN cookie for frontend                       │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. REQUEST DURATION TRACKER                                     │
│     └─ Start timer for API response time logging                │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 13. ROUTE-SPECIFIC RATE LIMITERS                                │
│     ├─ /api/auth:   10 requests per 15 min (strict)            │
│     ├─ /api/admin:  20 requests per 15 min (strict)            │
│     ├─ /api/upload:  5 requests per 15 min (very strict)       │
│     ├─ /api/search: 30 requests per 15 min (moderate)          │
│     └─ /api:       100 requests per 15 min (general)           │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 14. CSRF TOKEN VERIFIER (mutations only)                        │
│     ├─ POST/PUT/DELETE/PATCH: Require valid CSRF token         │
│     ├─ GET/HEAD/OPTIONS: Skip verification                      │
│     └─ JWT Bearer auth: Skip verification                       │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 15. ROUTE HANDLERS (100+ modules)                               │
│     ├─ Match route path                                         │
│     ├─ Execute route-specific middleware (auth, validation)     │
│     ├─ Execute business logic                                   │
│     └─ Return response                                          │
└─────────────────────────────────────────────────────────────────┘
  │
  ▼
Response Sent to Client
```

---

## CRITICAL DEPENDENCIES GRAPH

```
╔═══════════════════════════════════════════════════════════════════╗
║                    SERVICE DEPENDENCY TREE                        ║
╚═══════════════════════════════════════════════════════════════════╝

Express App
  │
  ├─ Middleware Stack (order-dependent)
  │   ├─ CSP Nonce Generator
  │   │   └─ Required by: Helmet Security Headers
  │   │
  │   ├─ Cookie Parser
  │   │   └─ Required by: CSRF Middleware
  │   │
  │   └─ Trust Proxy
  │       └─ Required by: Rate Limiters
  │
  ├─ Route Modules (100+)
  │   ├─ Authentication Middleware
  │   │   └─ Required by: Protected routes
  │   │
  │   └─ Database Connection
  │       └─ Required by: All data operations
  │
  └─ HTTP Server (created in routes.ts)
      │
      ├─ WebSocket Services (4 total)
      │   ├─ wsNotificationService
      │   │   └─ Requires: HTTP server instance
      │   │
      │   ├─ Realtime Voice WS
      │   │   └─ Requires: HTTP server instance, OpenAI SDK
      │   │
      │   ├─ Livestream WS
      │   │   └─ Requires: HTTP server instance
      │   │
      │   └─ Autonomous WS
      │       └─ Requires: HTTP server instance
      │
      └─ Server.listen()
          └─ Background Jobs
              ├─ Preview Expiration Checker
              └─ Story Expiration Job
```

---

## WEBSOCKET AUTHENTICATION FLOW

```
╔═══════════════════════════════════════════════════════════════════╗
║          WEBSOCKET CLIENT CONNECTION & AUTHENTICATION             ║
╚═══════════════════════════════════════════════════════════════════╝

Client Browser
  │
  ├─ 1. Establish WebSocket Connection
  │    └─ new WebSocket('ws://domain/ws/notifications')
  │
  ▼
WebSocket Server
  │
  ├─ 2. Connection Established
  │    ├─ Log: "✅ NEW CONNECTION ESTABLISHED"
  │    ├─ Set 10-second auth timeout
  │    └─ Add to pending clients map
  │
  ▼
  │
  ◄─ 3. Wait for Authentication Message
  │
  ▼
Client Sends Auth
  │
  ├─ { type: "auth", userId: 123 }
  │
  ▼
WebSocket Server
  │
  ├─ 4. Validate Auth Message
  │    ├─ Check: userId exists and is valid number
  │    ├─ Clear auth timeout
  │    └─ Remove from pending clients
  │
  ├─ 5. Add to Authenticated Clients
  │    ├─ Map: userId → [{ ws, lastPing: Date.now() }]
  │    └─ Support multiple connections per user
  │
  ├─ 6. Send Confirmation
  │    └─ { type: "connected", userId: 123 }
  │
  ▼
AUTHENTICATED - Ready to receive notifications
  │
  ├─ Keepalive Loop (every 30 seconds)
  │    ├─ Client sends: { type: "ping" }
  │    ├─ Server responds: { type: "pong" }
  │    └─ Server updates: client.lastPing = Date.now()
  │
  └─ Cleanup Job (every 60 seconds)
       ├─ Check: Date.now() - lastPing > 5 minutes
       ├─ If stale: Close connection
       └─ Remove from authenticated clients
```

---

## ERROR SCENARIOS & RECOVERY

```
╔═══════════════════════════════════════════════════════════════════╗
║                   COMMON FAILURE SCENARIOS                        ║
╚═══════════════════════════════════════════════════════════════════╝

[SCENARIO 1: Route Module Import Failure]
  │
  ├─ Symptom: Server crashes during startup
  ├─ Location: server/routes.ts Lines 1-115 (imports)
  ├─ Cause: Syntax error, circular dependency, missing module
  └─ Impact: Server never starts, WebSockets never initialize
  │
  └─ Recovery:
      ├─ Check console for import error stack trace
      ├─ Fix the problematic module
      └─ Restart server

[SCENARIO 2: Database Connection Failure]
  │
  ├─ Symptom: Server starts, first DB query fails
  ├─ Location: Various route handlers
  ├─ Cause: Wrong credentials, network issue, DB down
  └─ Impact: Server running but can't serve data
  │
  └─ Recovery:
      ├─ Add DB health check during startup
      ├─ Fail fast if DB unreachable
      └─ Implement connection retry logic

[SCENARIO 3: Port Already in Use]
  │
  ├─ Symptom: "Error: listen EADDRINUSE"
  ├─ Location: server.listen() in server/index.ts
  ├─ Cause: Another process using port 5000
  └─ Impact: Server can't start, no services available
  │
  └─ Recovery:
      ├─ Kill process using port 5000
      ├─ Or change PORT environment variable
      └─ Restart server

[SCENARIO 4: WebSocket Init Failure]
  │
  ├─ Symptom: HTTP works, WebSocket connections fail
  ├─ Location: server/routes.ts Lines 4067-4080
  ├─ Cause: HTTP server not created, WS library missing
  └─ Impact: No real-time features, notifications don't work
  │
  └─ Recovery:
      ├─ Check logs for WS initialization messages
      ├─ Verify HTTP server created at Line 4065
      ├─ Check WebSocket library installed
      └─ Add error handling around WS init

[SCENARIO 5: Middleware Order Issue]
  │
  ├─ Symptom: CSRF errors, auth failures, CSP violations
  ├─ Location: server/index.ts Lines 54-101
  ├─ Cause: Middleware applied in wrong order
  └─ Impact: Security features broken, requests rejected
  │
  └─ Recovery:
      ├─ Review middleware order in documentation
      ├─ Ensure CSP nonce before Helmet
      ├─ Ensure cookie parser before CSRF
      └─ Add middleware order tests
```

---

## PERFORMANCE TIMELINE

```
╔═══════════════════════════════════════════════════════════════════╗
║             SERVER STARTUP PERFORMANCE METRICS                    ║
╚═══════════════════════════════════════════════════════════════════╝

Estimated Startup Timeline (development mode):

T+0ms    ┃ Node.js starts executing server/index.ts
T+5ms    ┃ All imports loaded (100+ modules)
T+10ms   ┃ Express app created
T+15ms   ┃ Middleware stack applied (12 middleware)
T+20ms   ┃ Health check endpoints registered (3 endpoints)
T+25ms   ┃ Async IIFE begins execution
T+30ms   ┃ Route-specific rate limiters applied (5 limiters)
T+35ms   ┃ registerRoutes(app) called
         ┃
         ┃ [Inside registerRoutes()]
T+40ms   ┃ ├─ 100+ route modules registered
T+45ms   ┃ ├─ HTTP server created
T+50ms   ┃ ├─ WebSocket #1: Notifications initialized
T+52ms   ┃ ├─ WebSocket #2: Realtime Voice initialized
T+54ms   ┃ ├─ WebSocket #3: Livestream initialized
T+56ms   ┃ └─ WebSocket #4: Autonomous initialized
         ┃
T+60ms   ┃ registerRoutes() returns HTTP server
T+62ms   ┃ Error handlers applied
T+65ms   ┃ Vite setup begins (dev mode only)
T+200ms  ┃ Vite ready (includes esbuild, dependency scanning)
T+210ms  ┃ Server.listen() called
T+215ms  ┃ Server bound to 0.0.0.0:5000
T+220ms  ┃ Background jobs initialized
         ┃
T+225ms  ┃ ✅ SERVER FULLY OPERATIONAL
         ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Startup Time (dev):   ~225ms
Total Startup Time (prod):  ~70ms (no Vite)

Performance Bottlenecks:
  1. Vite setup (150ms in dev, 0ms in prod)
  2. Route module imports (35ms with 100+ modules)
  3. WebSocket initialization (6ms total for 4 services)
```

---

*End of Flow Diagram Document*
