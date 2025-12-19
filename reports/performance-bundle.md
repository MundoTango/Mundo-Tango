# Bundle Size Report

**Generated:** November 15, 2025
**Build:** Production

## Summary

Total Size: **79M**
Main JS: **3876KB**

**Status:** ⚠️ **CRITICAL - Main bundle exceeds 500KB target by 3376KB (775% over target)**

## Largest Chunks

| Size | File |
|------|------|
| 3.8M | index-7jp3FIsI.js |
| 632K | CodePreview-FKbHGZgK.js |
| 600K | ProfilePage-XFqt8yiT.js |
| 324K | generateCategoricalChart-sBz9K0PE.js |
| 292K | UserTestingPage-jLW8fUWh.js |
| 228K | EventsPage-XfjeUVWS.js |
| 204K | HostHomePage-D3CkgxUw.js |
| 184K | MessagesPage-DjTwQp-0.js |
| 128K | Platform-0rClMNlF.js |
| 92K | GroupDetailsPage-BMoe4kLn.js |

## Critical Issues

### 1. Main Bundle Size (3876 KB)
- **Target:** 500KB
- **Actual:** 3876KB
- **Overage:** 3376KB (775%)
- **Impact:** Slow initial page load, poor mobile performance

### 2. Large Individual Chunks
Several page-level chunks exceed reasonable sizes:
- CodePreview: 632KB (likely includes syntax highlighter + dependencies)
- ProfilePage: 600KB (possibly includes charts, maps, and UI components)
- Charts library: 324KB (Recharts is heavy)

### 3. Vendor Code Not Split
The main bundle likely contains:
- React + React DOM (~150KB)
- Three.js (~600KB for 3D avatar)
- Chart libraries (~300KB)
- UI component libraries (~200KB)
- Other dependencies

## Recommendations

### CRITICAL Priority (Implement Immediately)

#### 1. Vendor Code Splitting
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        'chart-vendor': ['recharts'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', /* other radix */]
      }
    }
  }
}
```

#### 2. Lazy Load Routes
```typescript
// App.tsx - Convert all routes to lazy loading
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const VisualEditor = lazy(() => import('./pages/VisualEditor'));
// ... etc
```

#### 3. Lazy Load Heavy Components
- Visual Editor: Only load when user clicks "Edit"
- Mr. Blue 3D Avatar: Load on demand
- Chart components: Load only on pages that need them
- Code preview: Load only in relevant sections

### HIGH Priority

#### 4. Remove Unused Dependencies
Audit and remove:
```bash
npx depcheck
```

#### 5. Tree Shaking Configuration
```javascript
// Ensure all imports are ES6
import { specificFunction } from 'library'; // ✅ Good
// NOT: const library = require('library'); // ❌ Bad
```

#### 6. Dynamic Imports for Features
```typescript
// Only import when needed
const openCodeEditor = async () => {
  const { CodeEditor } = await import('./components/CodeEditor');
  // Use CodeEditor
};
```

### MEDIUM Priority

#### 7. Enable Compression
```typescript
// server/index.ts
import compression from 'compression';
app.use(compression());
```

#### 8. Pre-compression During Build
```bash
# Add to build script
vite build && gzip -k dist/assets/*.js
```

#### 9. Consider Lighter Alternatives
- **Recharts → Victory/Nivo** (smaller chart library)
- **Three.js → Babylon.js Lite** (if possible)
- **Moment.js → date-fns** (tree-shakeable)

### LOW Priority

#### 10. Asset Optimization
- Implement CDN for static assets
- Use WebP/AVIF for images
- Optimize video files
- Implement service worker caching

## Expected Impact

If all recommendations are implemented:

| Metric | Current | Target | Expected |
|--------|---------|--------|----------|
| Main Bundle | 3876KB | 500KB | ~400KB |
| Vendor Chunks | 0 | N/A | ~800KB total |
| Page Chunks | Varies | <200KB | ~150KB avg |
| Initial Load | ~4s (3G) | <1s | ~0.8s |

## Action Plan

1. **Week 1:** Implement vendor code splitting + lazy route loading
2. **Week 2:** Lazy load heavy components (Visual Editor, 3D Avatar)
3. **Week 3:** Remove unused dependencies, enable compression
4. **Week 4:** Optimize assets, implement CDN

## Monitoring

Run bundle analysis after each optimization:
```bash
./scripts/bundle-analysis.sh
npm run build && npx vite-bundle-visualizer
```

## Notes

- Current build includes development tools (cartographer plugin)
- Production build should exclude dev plugins
- Consider implementing progressive enhancement
- Monitor Core Web Vitals after changes
