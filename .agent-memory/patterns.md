# Mundo Tango - Development Patterns & Known Issues

## Critical Patterns (Updated: 2025-11-10)

### Authentication Pattern
**CORRECT:** `req.userId!` (set by authenticateToken middleware)
**WRONG:** `req.user!.userId` (causes null constraint violations)

**Affected files requiring fix:**
- ✅ server/routes/housing-routes.ts (FIXED - 10 instances)
- ⚠️ server/routes/marketplace-routes.ts (NEEDS FIX - 5 instances)
- ⚠️ server/routes/subscription-routes.ts (NEEDS FIX - 8 instances)
- ⚠️ server/routes/livestream-routes.ts (NEEDS CHECK)

### Database Schema Facts
- Users table: `users.id` (NOT userId)
- Profile image: `users.profileImage` (NOT profilePictureUrl)
- Primary pattern: serial IDs (NOT UUIDs)

### Testing Pattern
```typescript
// Standard auth flow
const authResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@mundotango.life', password: 'admin123' })
});
const { accessToken } = await authResponse.json();

// Authenticated requests
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## API Endpoint Status

### Housing (20 planned, 13 implemented)
✅ Tested, all working
- Missing: my-listings, my-bookings, listing/:id/bookings, my-reviews

### Live Streaming (11 endpoints)
✅ Tested, 100% working

### Marketplace (8 endpoints)  
⚠️ Implementation complete, auth bug blocking tests
- Needs: Fix req.userId pattern (5 locations)

### Subscriptions (7 endpoints)
⚠️ Implementation complete, untested
- Needs: Fix req.userId pattern (8 locations), then test

## Next Actions (Priority Order)
1. Fix auth pattern in ALL remaining routes (batch operation)
2. Test marketplace + subscriptions APIs in parallel
3. Begin frontend implementation
