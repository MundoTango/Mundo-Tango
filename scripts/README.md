# Mundo Tango - Security & Performance Scripts

## RLS Validation Script

### Purpose
The `validate-rls.ts` script validates Row Level Security (RLS) policies on all main Supabase tables to ensure unauthenticated users cannot access protected data.

### Usage

**Direct execution:**
```bash
tsx scripts/validate-rls.ts
```

**With npm (if script added to package.json):**
```bash
npm run validate:rls
```

### What It Tests
- ✅ Profiles table: Unauthenticated access should be denied
- ✅ Posts table: Unauthenticated access should be denied
- ✅ Events table: Unauthenticated access should be denied
- ✅ Messages table: Unauthenticated access should be denied

### Expected Output
```
🔒 Starting RLS Policy Validation...

📊 RLS Validation Results:

✅ PASS - profiles: Unauthenticated access denied
✅ PASS - posts: Unauthenticated access denied
✅ PASS - events: Unauthenticated access denied
✅ PASS - messages: Unauthenticated access denied

✅ All RLS policies validated successfully!
```

### Exit Codes
- `0` - All tests passed
- `1` - One or more tests failed

## Performance Monitoring

### Performance Monitor (`client/src/lib/performance.ts`)

A singleton performance monitoring utility that tracks operation durations and warns about slow operations.

**Features:**
- Track operation start/end times
- Automatic warning for operations >300ms (MB.MD quality gate threshold)
- Calculate average times for repeated operations
- Generate performance reports

**Usage:**
```typescript
import { perfMonitor, measureAsync } from '@/lib/performance';

// Manual tracking
perfMonitor.start('data-fetch');
await fetchData();
perfMonitor.end('data-fetch');

// Async helper
const data = await measureAsync('api-call', () => fetch('/api/data'));

// Generate report
perfMonitor.report();
```

### Performance Hooks (`client/src/hooks/usePerformance.ts`)

React hooks for measuring component and query performance.

**Component Mount Performance:**
```typescript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
  usePerformance('MyComponent');
  // Tracks mount/unmount time
}
```

**Query Performance:**
```typescript
import { useQueryPerformance } from '@/hooks/usePerformance';

function MyComponent() {
  useQueryPerformance('posts-feed');
  // Tracks query lifecycle time
}
```

## Quality Gates

**Performance Thresholds:**
- ⚠️ Warning: Operations >300ms
- ✅ Acceptable: Operations ≤300ms

**Security:**
- All main tables must have RLS policies blocking unauthenticated access
- Validation script must pass before deployment
