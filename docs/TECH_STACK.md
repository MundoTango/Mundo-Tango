# Mundo Tango Technology Stack

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Frontend Stack](#frontend-stack)
3. [Backend Stack](#backend-stack)
4. [Database & ORM](#database--orm)
5. [Authentication & Security](#authentication--security)
6. [AI & Machine Learning](#ai--machine-learning)
7. [Payment Processing](#payment-processing)
8. [Real-Time Features](#real-time-features)
9. [DevOps & CI/CD](#devops--cicd)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Development Tools](#development-tools)

---

## Overview

Mundo Tango is built on a modern, scalable technology stack optimized for:
- **Performance:** Sub-200ms API responses, <2s page loads
- **Scalability:** 100,000+ concurrent users
- **Developer Experience:** Type-safe, fast iteration cycles
- **Maintainability:** Clear separation of concerns

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.3.1 | UI framework with concurrent rendering |
| **Build Tool** | Vite | 6.0.1 | Lightning-fast HMR and builds |
| **Backend** | Express.js | 5.0.1 | RESTful API server |
| **Runtime** | Node.js | 20.x | JavaScript runtime |
| **Database** | PostgreSQL | 14+ | Relational database with JSONB |
| **ORM** | Drizzle | Latest | TypeScript-native ORM |
| **Language** | TypeScript | 5.6.3 | Type-safe development |
| **Deployment** | Vercel + Railway | Latest | Serverless + containers |

---

## Frontend Stack

### React 18.3.1

**Why React?**
- Industry standard with massive ecosystem
- Concurrent rendering for better UX
- Strong TypeScript integration
- Best-in-class developer tools

**Key Features Used:**
```typescript
// Concurrent rendering
import { useState, useTransition } from 'react';

// Suspense for code splitting
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>

// Error boundaries
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### Vite 6.0.1

**Why Vite?**
- 10x faster cold starts than Webpack
- Instant Hot Module Replacement (HMR)
- Smaller bundle sizes
- Native ES modules support

**Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    cartographer(),
    devBanner(),
    runtimeErrorModal(),
  ],
  resolve: {
    alias: {
      "@": "/client/src",
      "@assets": "/attached_assets",
      "@shared": "/shared",
    },
  },
  server: {
    port: 5000,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

### Routing: Wouter 3.3.5

**Why Wouter?**
- Lightweight (1.6KB vs React Router's 11KB)
- Simple API similar to React Router
- Perfect for SPAs
- Fast performance

**Usage:**
```typescript
import { Route, Switch, Link, useLocation } from "wouter";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/profile/:id" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

### State Management: TanStack Query v5

**Why TanStack Query?**
- Server state management built-in
- Automatic caching and invalidation
- Optimistic updates
- Background refetching

**Configuration:**
```typescript
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

// Usage
const { data, isLoading } = useQuery({
  queryKey: ['/api/posts'],
  queryFn: async () => {
    const res = await fetch('/api/posts');
    return res.json();
  },
});
```

### UI Components: shadcn/ui

**Why shadcn/ui?**
- Accessible components (Radix UI primitives)
- Fully customizable with Tailwind
- Copy-paste components (no npm package)
- TypeScript-native

**Components Used:**
- Accordion, AlertDialog, Avatar
- Button, Card, Checkbox, Dialog
- DropdownMenu, Form, Input
- Label, Popover, Select, Sheet
- Sidebar, Table, Tabs, Toast
- Tooltip, and 20+ more

**Example:**
```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Get Started</Button>
  </CardContent>
</Card>
```

### Styling: Tailwind CSS 3.4.15

**Why Tailwind?**
- Utility-first approach
- Design system built-in
- Dark mode support
- Tree-shaking for small bundles

**Custom Configuration:**
```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./client/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
```

### Form Handling: React Hook Form 7.54.0

**Why React Hook Form?**
- Performant with minimal re-renders
- Built-in validation
- TypeScript support
- Easy integration with Zod

**Usage:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: "", password: "" },
});
```

### Icons: Lucide React 0.468.0

**Why Lucide?**
- Beautiful, consistent icons
- Tree-shakeable (only import what you use)
- React components
- TypeScript support

**Usage:**
```typescript
import { Home, User, Settings, Bell } from "lucide-react";

<Button size="icon">
  <Home className="h-4 w-4" />
</Button>
```

---

## Backend Stack

### Express.js 5.0.1

**Why Express?**
- Minimal and unopinionated
- Massive middleware ecosystem
- Team familiarity
- Easy WebSocket integration

**Server Setup:**
```typescript
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
```

### Node.js 20.x

**Why Node.js 20?**
- LTS release with long-term support
- Built-in fetch API
- Native test runner
- Performance improvements

**Environment Variables:**
```bash
NODE_VERSION=20.x
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
```

### TypeScript 5.6.3

**Why TypeScript?**
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Refactoring confidence

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Middleware Stack

**1. Authentication: Passport.js**
```typescript
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user) return done(null, false);
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false);
    
    return done(null, user);
  }
));
```

**2. Rate Limiting: express-rate-limit**
```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);
```

**3. Session Management: express-session**
```typescript
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";

const PgSession = ConnectPgSimple(session);

app.use(session({
  store: new PgSession({ pool: db }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));
```

**4. Compression: compression**
```typescript
import compression from "compression";

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress > 1KB
}));
```

---

## Database & ORM

### PostgreSQL 14+

**Why PostgreSQL?**
- ACID compliance for data integrity
- Complex queries and joins
- Row-level security (RLS)
- JSON/JSONB support
- Full-text search
- Mature ecosystem

**Key Features Used:**
- **JSONB Columns:** Flexible metadata storage
- **Array Columns:** Tags, hashtags, lists
- **Full-Text Search:** Content search
- **Triggers:** Automatic timestamp updates
- **Indexes:** B-tree, GIN, compound indexes

### Drizzle ORM

**Why Drizzle?**
- TypeScript-native with zero runtime overhead
- SQL-like syntax (familiar to developers)
- Better performance than Prisma
- Type inference from schema
- Excellent DX with Drizzle Studio

**Schema Example:**
```typescript
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Query Example:**
```typescript
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Select
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 1))
  .limit(1);

// Insert
const newUser = await db
  .insert(users)
  .values({ email: "test@example.com", password: "hashed" })
  .returning();

// Update
await db
  .update(users)
  .set({ email: "new@example.com" })
  .where(eq(users.id, 1));

// Delete
await db
  .delete(users)
  .where(eq(users.id, 1));
```

### Neon Serverless

**Why Neon?**
- Serverless PostgreSQL
- Automatic scaling
- Branching for development
- Pay-per-use pricing
- Built-in connection pooling

**Connection:**
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

---

## Authentication & Security

### JWT Authentication

**Why JWT?**
- Stateless authentication
- Scalable across servers
- Mobile-friendly
- Industry standard

**Implementation:**
```typescript
import jwt from "jsonwebtoken";

// Generate access token (15 min)
const accessToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

// Generate refresh token (7 days)
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: "7d" }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

### Password Hashing: bcrypt

**Why bcrypt?**
- Industry-standard hashing
- Built-in salt generation
- Configurable work factor
- Slow by design (prevents brute force)

**Usage:**
```typescript
import bcrypt from "bcrypt";

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Two-Factor Authentication: speakeasy

**Why speakeasy?**
- TOTP (Time-based OTP) support
- QR code generation
- Backup codes
- RFC 6238 compliant

**Implementation:**
```typescript
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Generate secret
const secret = speakeasy.generateSecret({
  name: "Mundo Tango",
  issuer: "Mundo Tango",
});

// Generate QR code
const qrCode = await QRCode.toDataURL(secret.otpauth_url);

// Verify token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: "base32",
  token: userToken,
});
```

### RBAC (Role-Based Access Control)

**8-Tier System:**
1. **Level 1: Free** - Basic features
2. **Level 2: Basic** - Standard features
3. **Level 3: Premium** - Advanced features
4. **Level 4: Community** - Community management
5. **Level 5: Admin** - Content moderation
6. **Level 6: Platform Vol** - Development team
7. **Level 7: Super Admin** - Platform administration
8. **Level 8: God** - Full platform control

**Middleware:**
```typescript
export function requireRoleLevel(minLevel: number) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userLevel = getRoleLevel(req.user.role);
    if (userLevel < minLevel) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
```

---

## AI & Machine Learning

### Multi-Provider AI Integration

**Providers:**
1. **Groq** - Primary (llama-3.1-70b-versatile)
2. **OpenAI** - Fallback (gpt-4-turbo-preview)
3. **Anthropic** - Fallback (claude-3-sonnet)
4. **Google Gemini** - Fallback (gemini-pro)
5. **Perplexity** - Fallback (llama-3.1-sonar-large-128k-online)

**SDKs Used:**
```bash
npm install @anthropic-ai/sdk groq-sdk openai
```

**Implementation:**
```typescript
import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fallback chain
async function chat(messages: Message[]) {
  try {
    return await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages,
    });
  } catch {
    return await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
    });
  }
}
```

### Luma AI (Avatar Generation)

**Why Luma AI?**
- High-quality 3D avatar generation
- Realistic animations
- Fast processing
- Video output

**Usage:**
```typescript
// Generate avatar video
const response = await fetch("https://api.lumalabs.ai/v1/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.LUMA_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Professional headshot...",
    duration: 5,
  }),
});
```

---

## Payment Processing

### Stripe Integration

**Why Stripe?**
- Industry leader
- Comprehensive API
- Built-in fraud protection
- PCI compliance handled

**Features Used:**
- Payment Intents
- Subscriptions
- Customer Portal
- Webhooks
- Checkout Sessions

**Implementation:**
```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  payment_behavior: "default_incomplete",
  payment_settings: { save_default_payment_method: "on_subscription" },
  expand: ["latest_invoice.payment_intent"],
});
```

---

## Real-Time Features

### WebSocket (ws)

**Why ws?**
- Low-level WebSocket library
- High performance
- Easy integration with Express

**Implementation:**
```typescript
import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  const userId = getUserIdFromReq(req);
  
  ws.on("message", (data) => {
    // Handle incoming messages
  });
  
  ws.on("close", () => {
    // Cleanup on disconnect
  });
});
```

### Supabase Realtime

**Why Supabase Realtime?**
- Real-time database subscriptions
- Presence tracking
- Broadcast channels
- Simple API

**Usage:**
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Subscribe to changes
supabase
  .channel("posts")
  .on("postgres_changes", 
    { event: "INSERT", schema: "public", table: "posts" },
    (payload) => console.log("New post:", payload)
  )
  .subscribe();
```

---

## DevOps & CI/CD

### GitHub Actions

**Why GitHub Actions?**
- Native GitHub integration
- Free for public repos
- Easy YAML configuration
- Powerful marketplace

**Pipeline:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      - run: npm ci
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

### Vercel (Frontend Deployment)

**Why Vercel?**
- Zero-config deployments
- Global CDN
- Automatic HTTPS
- Preview deployments
- Edge functions

**Features:**
- Automatic Git integration
- Environment variables
- Custom domains
- Analytics
- Web Vitals monitoring

### Railway (Backend Deployment)

**Why Railway?**
- Simple container deployments
- PostgreSQL included
- Automatic scaling
- Built-in monitoring
- Affordable pricing

**Features:**
- Dockerfile support
- Environment variables
- Metrics and logs
- Custom domains
- Cron jobs

---

## Testing & Quality Assurance

### Playwright (E2E Testing)

**Why Playwright?**
- Cross-browser testing
- Auto-wait for elements
- Powerful selectors
- Video/screenshot capture

**Configuration:**
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
```

**Test Example:**
```typescript
test("user can create post", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("button-create-post").click();
  await page.getByTestId("input-post-content").fill("Hello World!");
  await page.getByTestId("button-submit-post").click();
  await expect(page.getByText("Hello World!")).toBeVisible();
});
```

### Zod (Runtime Validation)

**Why Zod?**
- TypeScript-first schema validation
- Type inference
- Composable schemas
- Great error messages

**Usage:**
```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(13).optional(),
});

type User = z.infer<typeof userSchema>;

// Validate
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

---

## Monitoring & Analytics

### Error Tracking

**Sentry Integration (Planned)**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Performance Monitoring

**Custom Metrics:**
```typescript
// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## Development Tools

### Package Manager: npm

**Why npm?**
- Standard Node.js package manager
- Mature ecosystem
- Workspaces support
- Built into Node.js

### Code Formatting: Prettier (via Replit)

**Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Linting: ESLint

**Configuration:**
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Database Studio: Drizzle Studio

```bash
npm run db:studio
```

**Features:**
- Visual schema explorer
- Data browser and editor
- Query builder
- Migration viewer

---

## Package.json Dependencies

### Frontend Dependencies (38 packages)

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "wouter": "^3.3.5",
  "@tanstack/react-query": "^5.x",
  "lucide-react": "^0.468.0",
  "react-hook-form": "^7.54.0",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "tailwindcss": "^3.4.15",
  "next-themes": "^0.x",
  "framer-motion": "^11.x",
  "@radix-ui/*": "^1.x"
}
```

### Backend Dependencies (40 packages)

```json
{
  "express": "^5.0.1",
  "drizzle-orm": "latest",
  "@neondatabase/serverless": "^0.x",
  "passport": "^0.x",
  "bcrypt": "^5.x",
  "jsonwebtoken": "^9.x",
  "zod": "^3.x",
  "groq-sdk": "^0.x",
  "stripe": "^17.x",
  "ws": "^8.x"
}
```

### Dev Dependencies (15 packages)

```json
{
  "@vitejs/plugin-react": "^4.x",
  "vite": "^6.0.1",
  "typescript": "^5.6.3",
  "@types/node": "^20.x",
  "@types/express": "^5.x",
  "@playwright/test": "^1.x",
  "drizzle-kit": "latest",
  "tsx": "^4.x"
}
```

---

## Technology Decisions Rationale

### Why React over Vue/Angular?
✅ **Larger ecosystem**  
✅ **Better job market**  
✅ **Concurrent rendering**  
✅ **Meta backing**

### Why Express over NestJS/Fastify?
✅ **Simplicity**  
✅ **Flexibility**  
✅ **Community size**  
✅ **Team familiarity**

### Why PostgreSQL over MongoDB?
✅ **ACID compliance**  
✅ **Complex queries**  
✅ **Data integrity**  
✅ **JSONB for flexibility**

### Why Drizzle over Prisma?
✅ **Better performance**  
✅ **SQL-like syntax**  
✅ **Zero runtime overhead**  
✅ **Superior TypeScript DX**

### Why Vite over Webpack?
✅ **10x faster dev server**  
✅ **Instant HMR**  
✅ **Simpler configuration**  
✅ **Better DX**

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_SECRET=your-session-secret

# AI Providers
GROQ_API_KEY=your-groq-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
LUMA_API_KEY=your-luma-key

# Payment
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Deployment
VERCEL_API_TOKEN=your-vercel-token
RAILWAY_API_TOKEN=your-railway-token
GITHUB_TOKEN=your-github-token

# Real-time
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

---

## Future Technology Additions

### Planned
- **GraphQL:** Apollo Server for flexible queries
- **Redis:** Caching layer for performance
- **Elasticsearch:** Full-text search
- **Docker:** Containerization for consistency
- **Kubernetes:** Container orchestration (at scale)

### Under Consideration
- **React Native:** Mobile apps
- **tRPC:** Type-safe API alternative
- **Turborepo:** Monorepo management
- **Prisma Accelerate:** Database edge caching

---

**Last Updated:** November 2, 2025  
**Maintained By:** ESA Platform Division  
**Status:** Production-Ready with 127 Pages
