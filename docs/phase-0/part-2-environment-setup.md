# PART 2: Environment Setup Complete

**Mundo Tango Platform - Complete Implementation Handoff**  
**Version:** 1.0  
**Generated:** October 30, 2025  
**Purpose:** Complete environment configuration and project initialization

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Software Installation](#software-installation)
3. [Project Dependencies](#project-dependencies)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Project Structure](#project-structure)
7. [Development Tools](#development-tools)
8. [Verification Checklist](#verification-checklist)

---

## System Requirements

### Minimum Requirements

**Hardware:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB free space
- Network: Stable internet connection

**Operating System:**
- macOS 10.15+
- Windows 10/11 with WSL2
- Linux (Ubuntu 20.04+, Debian 11+)

### Recommended Development Environment

**Hardware:**
- CPU: 4+ cores (Apple Silicon or Intel/AMD)
- RAM: 16GB
- Storage: SSD with 10GB+ free space
- Network: High-speed internet

**OS:**
- macOS 12+ (Monterey or newer)
- Windows 11 with WSL2 (Ubuntu 22.04)
- Linux (Ubuntu 22.04 LTS)

---

## Software Installation

### 1. Node.js 20.x (Required)

**Current Status:** ✅ Already installed (nodejs-20)

**Verify Installation:**
```bash
node --version  # Should output v20.x.x
npm --version   # Should output v10.x.x
```

**If Not Installed:**

**macOS (Homebrew):**
```bash
brew install node@20
```

**Windows (Using nvm-windows):**
```bash
nvm install 20
nvm use 20
```

**Linux (Using nvm):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

---

### 2. PostgreSQL 15.x (Required)

**Option A: Local Installation**

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows (WSL2):**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo service postgresql start
```

**Linux:**
```bash
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Option B: Neon Serverless (Recommended for Replit)**

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. Use in `.env` file as `DATABASE_URL`

**Benefits of Neon:**
- ✅ Serverless (auto-scaling)
- ✅ Free tier (generous limits)
- ✅ Automatic backups
- ✅ Branch database for testing
- ✅ No local installation needed

---

### 3. Git (Required)

**Verify Installation:**
```bash
git --version  # Should output v2.x.x
```

**Install if Needed:**

**macOS:**
```bash
brew install git
```

**Windows:**
Download from https://git-scm.com/download/win

**Linux:**
```bash
sudo apt install git
```

---

### 4. VS Code (Recommended)

**Download:** https://code.visualstudio.com/

**Required Extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript + JavaScript (`ms-vscode.vscode-typescript-next`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

**Optional Extensions:**
- GitLens (`eamodio.gitlens`)
- Error Lens (`usernamehw.errorlens`)
- Auto Rename Tag (`formulahendry.auto-rename-tag`)
- Path Intellisense (`christian-kohler.path-intellisense`)
- Markdown All in One (`yzhang.markdown-all-in-one`)

**Install Extensions via CLI:**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension eamodio.gitlens
```

---

## Project Dependencies

### Current Installed Packages

The project already has these packages installed:

**Frontend Core:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - Vite React plugin
- `typescript` - Type safety

**Frontend Routing & State:**
- `wouter` - Lightweight routing
- `@tanstack/react-query` - Server state management

**Frontend UI Components:**
- `@radix-ui/*` - Accessible component primitives (30+ packages)
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS
- `tailwindcss-animate` - Animation utilities
- `class-variance-authority` - Component variants
- `clsx` & `tailwind-merge` - Class name utilities

**Frontend Forms:**
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation
- `zod-validation-error` - Better error messages

**Frontend Themes:**
- `next-themes` - Dark mode support

**Backend Core:**
- `express` - Web framework
- `express-session` - Session management
- `tsx` - TypeScript execution

**Database:**
- `@neondatabase/serverless` - Neon PostgreSQL client
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Drizzle migration tools
- `drizzle-zod` - Drizzle + Zod integration

**Authentication:**
- `passport` - Auth middleware
- `passport-local` - Local strategy
- `connect-pg-simple` - PostgreSQL session store

**Real-time:**
- `ws` - WebSocket library

**Type Definitions:**
- `@types/node` - Node.js types
- `@types/express` - Express types
- `@types/react` - React types
- `@types/react-dom` - React DOM types
- `@types/passport` - Passport types
- `@types/express-session` - Session types

**Development:**
- `@replit/*` - Replit-specific plugins
- `esbuild` - JavaScript bundler
- `autoprefixer` - CSS post-processor
- `postcss` - CSS transformer

### Package Versions

Run this command to see all installed versions:
```bash
npm list --depth=0
```

---

## Environment Variables

### Create .env File

Create `.env` file in the project root:

```bash
touch .env
```

### Required Environment Variables

```env
# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

# PostgreSQL Connection String (Neon or local)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Individual PostgreSQL credentials (auto-provided by Replit)
PGHOST="your-host.neon.tech"
PGPORT="5432"
PGUSER="your-username"
PGPASSWORD="your-password"
PGDATABASE="your-database"

# ============================================================================
# AUTHENTICATION & SECURITY
# ============================================================================

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET="your-super-secret-session-key-min-32-chars"

# JWT secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

# JWT expiration times
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Password hashing rounds (10-12 recommended)
BCRYPT_ROUNDS="10"

# ============================================================================
# APPLICATION CONFIGURATION
# ============================================================================

# Node environment (development, production, test)
NODE_ENV="development"

# Application URLs
FRONTEND_URL="http://localhost:5000"
BACKEND_URL="http://localhost:5000"

# Port (Replit uses 5000 by default)
PORT="5000"

# ============================================================================
# AI INTEGRATION (Required for Mr Blue)
# ============================================================================

# OpenAI (Required - Primary AI provider)
OPENAI_API_KEY="sk-..."

# Anthropic (Optional - Claude models)
ANTHROPIC_API_KEY="sk-ant-..."

# Google AI (Optional - Gemini models)
GOOGLE_AI_API_KEY="..."

# Groq (Optional - Fast inference)
GROQ_API_KEY="gsk_..."

# Perplexity (Optional - Web-connected AI)
PERPLEXITY_API_KEY="pplx-..."

# ============================================================================
# PAYMENT PROCESSING (Required for monetization)
# ============================================================================

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================================================
# FILE STORAGE (Optional - for media uploads)
# ============================================================================

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Or use Replit Object Storage (built-in)
# No configuration needed on Replit

# ============================================================================
# EMAIL SERVICE (Optional - for notifications)
# ============================================================================

# Resend
RESEND_API_KEY="re_..."

# ============================================================================
# SMS SERVICE (Optional - for notifications)
# ============================================================================

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# ============================================================================
# MONITORING & LOGGING (Optional - for production)
# ============================================================================

# Sentry (Error tracking)
SENTRY_DSN="https://...@sentry.io/..."

# ============================================================================
# SOCIAL AUTHENTICATION (Optional - OAuth)
# ============================================================================

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Facebook OAuth
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"

# ============================================================================
# FEATURE FLAGS (Optional - for gradual rollouts)
# ============================================================================

# Enable/disable features
ENABLE_AI_FEATURES="true"
ENABLE_PAYMENTS="true"
ENABLE_REAL_TIME="true"
ENABLE_FILE_UPLOADS="true"

# ============================================================================
# RATE LIMITING (Optional - for API protection)
# ============================================================================

# Requests per window
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"

# Auth rate limiting (stricter)
AUTH_RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
AUTH_RATE_LIMIT_MAX_REQUESTS="5"

# ============================================================================
# CORS CONFIGURATION (Optional - for cross-origin)
# ============================================================================

# Allowed origins (comma-separated)
CORS_ORIGIN="http://localhost:5000,https://your-domain.com"

# ============================================================================
# REPLIT SPECIFIC (Auto-provided on Replit)
# ============================================================================

# Replit domain (auto-set)
REPL_SLUG="your-repl-name"
REPL_OWNER="your-username"
REPLIT_DB_URL="..."  # Auto-provided

# ============================================================================
# DEVELOPMENT TOOLS (Optional)
# ============================================================================

# Drizzle Studio (database GUI)
DRIZZLE_STUDIO_PORT="4983"

# Debug mode
DEBUG="express:*"
```

### Generate Secure Secrets

**Session Secret:**
```bash
openssl rand -base64 32
```

**JWT Secrets:**
```bash
# Access token secret
openssl rand -base64 32

# Refresh token secret
openssl rand -base64 32
```

### Environment Variable Security

**✅ DO:**
- Use `.env` file for local development
- Add `.env` to `.gitignore`
- Use Replit Secrets UI for production
- Rotate secrets regularly
- Use different secrets for dev/prod

**❌ DON'T:**
- Commit `.env` to Git
- Share secrets in Slack/Discord
- Use weak or default secrets
- Reuse secrets across projects
- Hardcode secrets in code

---

## Database Setup

### Option 1: Neon Serverless (Recommended)

**1. Create Neon Account:**
- Go to https://neon.tech
- Sign up (free tier available)

**2. Create Project:**
- Click "New Project"
- Name: "mundo-tango"
- Region: Choose closest to users

**3. Get Connection String:**
- Click "Connection Details"
- Copy "Connection string"
- Format: `postgresql://user:pass@host:5432/db?sslmode=require`

**4. Add to .env:**
```env
DATABASE_URL="your-connection-string-here"
```

**5. Push Schema:**
```bash
npm run db:push
```

---

### Option 2: Local PostgreSQL

**1. Create Database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE mundo_tango;

# Create user
CREATE USER mundo_user WITH ENCRYPTED PASSWORD 'secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mundo_tango TO mundo_user;

# Exit
\q
```

**2. Configure .env:**
```env
DATABASE_URL="postgresql://mundo_user:secure-password@localhost:5432/mundo_tango"
```

**3. Push Schema:**
```bash
npm run db:push
```

---

### Database Verification

**Open Drizzle Studio:**
```bash
npm run db:studio
```

This opens a GUI at http://localhost:4983 to explore your database.

**Check Tables:**
You should see these core tables:
- `users`
- `sessions`
- `posts`
- `events`
- `communities`
- `messages`
- And 35+ more...

---

## Project Structure

### Current Folder Organization

```
mundo-tango/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── ...           # Feature components
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Events.tsx
│   │   │   └── ...
│   │   ├── lib/              # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── hooks/            # Custom hooks
│   │   ├── contexts/         # React contexts
│   │   ├── styles/           # Global styles
│   │   │   └── index.css
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── public/               # Static assets
│
├── server/                    # Backend application
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Storage interface
│   ├── index.ts              # Express server
│   └── vite.ts               # Vite integration
│
├── shared/                    # Shared code
│   └── schema.ts             # Database schema + Zod
│
├── db/                        # Database files
│   └── migrations/           # SQL migrations
│
├── docs/                      # Documentation
│   ├── phase-0/              # Prerequisites
│   │   ├── part-0-mbmd-methodology.md
│   │   ├── part-1-quick-start.md
│   │   └── part-2-environment-setup.md
│   ├── phase-1/              # Agent training
│   ├── phase-2/              # Core setup
│   ├── phase-3/              # Features
│   ├── phase-4/              # Polish
│   └── phase-5/              # Operations
│
├── attached_assets/           # User-provided files
│   └── Pasted---1761851513123_1761851513126.txt
│
├── .env.example              # Environment template
├── .env                      # Environment variables (DO NOT COMMIT)
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── tailwind.config.ts        # Tailwind config
├── drizzle.config.ts         # Drizzle config
├── design_guidelines.md      # Design system
└── README.md                 # Project readme
```

### Key Files Explained

**`client/src/App.tsx`**
- Root React component
- Sets up providers (Query, Theme, Socket)
- Defines routing structure

**`client/src/index.css`**
- Global styles
- Tailwind base imports
- CSS custom properties
- Design tokens (colors, spacing)

**`server/routes.ts`**
- All API endpoints
- Express route handlers
- Middleware integration

**`shared/schema.ts`**
- Database schema (Drizzle)
- Zod validation schemas
- TypeScript types
- Single source of truth

**`vite.config.ts`**
- Vite build configuration
- Plugins (React, Replit tools)
- Path aliases (@, @shared)

**`tailwind.config.ts`**
- Tailwind customization
- Color palette
- Font families
- Custom utilities

**`package.json`**
- Dependencies and versions
- NPM scripts
- Project metadata

---

## Development Tools

### NPM Scripts

**Start Development Server:**
```bash
npm run dev
```
Starts both frontend (Vite) and backend (Express) on port 5000.

**Build for Production:**
```bash
npm run build
```
Creates optimized production bundle in `dist/`.

**Database Tools:**
```bash
# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

**Type Checking:**
```bash
# Check TypeScript errors
npx tsc --noEmit
```

**Linting:**
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

---

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

---

## Verification Checklist

### ✅ Pre-Development Checklist

Before starting development, verify:

**Software Installation:**
- [ ] Node.js 20.x installed and verified
- [ ] PostgreSQL 15.x installed OR Neon account created
- [ ] Git installed and configured
- [ ] VS Code installed with required extensions

**Project Setup:**
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created with all required variables
- [ ] Database connection successful
- [ ] Database schema pushed (`npm run db:push`)

**Development Environment:**
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Frontend accessible at http://localhost:5000
- [ ] Backend API responding at http://localhost:5000/api
- [ ] Drizzle Studio opens (`npm run db:studio`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)

**Documentation:**
- [ ] Read Part 0: MB.MD Methodology
- [ ] Read Part 1: Quick Start Guide
- [ ] Read Part 2: Environment Setup (this document)
- [ ] Understand project structure
- [ ] Familiar with NPM scripts

**Optional (Production):**
- [ ] Stripe account created (for payments)
- [ ] OpenAI API key obtained (for AI features)
- [ ] Cloudinary account created (for file uploads)
- [ ] Sentry account created (for error tracking)

---

### Run Verification Script

Create `scripts/verify-setup.sh`:

```bash
#!/bin/bash

echo "🔍 Mundo Tango - Environment Verification"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js: $NODE_VERSION"
else
    echo "  ❌ Node.js not found"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check Git
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "  $GIT_VERSION"
else
    echo "  ❌ Git not found"
    exit 1
fi

# Check .env file
echo "✓ Checking .env file..."
if [ -f ".env" ]; then
    echo "  .env file exists"
else
    echo "  ⚠️  .env file not found"
fi

# Check node_modules
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  node_modules exists"
else
    echo "  ⚠️  node_modules not found - run 'npm install'"
fi

echo ""
echo "=========================================="
echo "✅ Verification complete!"
```

Make it executable and run:
```bash
chmod +x scripts/verify-setup.sh
./scripts/verify-setup.sh
```

---

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue: Database connection fails**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**Issue: Port 5000 already in use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (replace PID)
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

**Issue: TypeScript errors**
```bash
# Check for LSP errors
npx tsc --noEmit

# Clear TypeScript cache
rm -rf node_modules/.cache
```

---

## Next Steps

✅ **You've completed Part 2: Environment Setup**

**Your environment is now ready for development!**

**Continue to Phase 1 or Phase 2:**

**Agent-First Approach:**
→ [Phase 1: Agent Training](../phase-1/)

**MVP Fast Approach:**
→ [Phase 2: Core Setup](../phase-2/)

**Remember:** Follow the MB.MD methodology - work simultaneously, recursively, and critically!

---

**Generated:** October 30, 2025  
**Version:** 1.0  
**Part of:** Mundo Tango Complete Implementation Handoff  
**Previous:** [Part 1: Quick Start Guide](./part-1-quick-start.md)  
**Next:** Phase 1 or Phase 2 (your choice)
