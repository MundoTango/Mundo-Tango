# Local Development Setup Guide

Welcome to Mundo Tango! This guide helps volunteers get started contributing quickly.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+** (comes with Node.js)
- **Git**

No Python, C++, or native compilation toolchain required!

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mundotango/mundo-tango.git
cd mundo-tango

# Install dependencies (should complete without native compilation)
npm install

# Start the development server
npm run dev
```

The app should now be running at `http://localhost:5000`

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Required variables for basic local development:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Any random string for session encryption

Optional for enhanced features:
- `OPENAI_API_KEY` - For AI chat features
- `STRIPE_SECRET_KEY` - For payment testing
- `CLOUDINARY_*` - For image uploads

## Development Architecture

### Frontend (React + Vite)
- Located in `client/src/`
- Uses shadcn/ui components
- TanStack Query for data fetching
- Wouter for routing

### Backend (Express + TypeScript)
- Located in `server/`
- Drizzle ORM with PostgreSQL
- JWT authentication

### Shared Types
- Located in `shared/schema.ts`
- Drizzle models with Zod validation

## Common Tasks

### Add a new page
1. Create component in `client/src/pages/`
2. Register route in `client/src/App.tsx`

### Add API endpoint
1. Add route in `server/routes.ts`
2. Use storage interface for database operations

### Run tests
```bash
npm test
```

## Troubleshooting

### macOS/Windows: Case-Sensitive File Collisions

If you encounter errors about duplicate files during checkout (e.g., `mrBlue/` vs `MrBlue/` conflicts), your filesystem is case-insensitive. This is common on macOS and Windows.

**Quick Fix:**

After cloning, if you see errors related to `mrBlue` folder variants:
```bash
# The canonical folder is mrBlue (camelCase)
# Remove any cached collision variants from git:
git rm --cached -r client/src/components/MrBlue 2>/dev/null || true
git rm --cached -r client/src/components/mrblue 2>/dev/null || true
git rm --cached server/services/mrBlue/WorkflowPatternTracker.ts 2>/dev/null || true
git rm --cached MB.MD 2>/dev/null || true
```

**Naming Conventions:**
- `client/src/components/mrBlue/` - AI Assistant components (camelCase)
- `client/src/components/mr-blue/` - Separate utility components (kebab-case, intentionally different)
- `server/services/mrBlue/` - Backend services (camelCase)

### "npm install fails with node-gyp errors"
This should not happen anymore! We removed native dependencies that required compilation.

If you still see this, please open an issue with:
- Your Node.js version (`node -v`)
- Your npm version (`npm -v`)
- Full error output

### "Cannot connect to database"
Ensure PostgreSQL is running and `DATABASE_URL` is set correctly.

### "Port 5000 already in use"
Stop other services using port 5000, or set a different port:
```bash
PORT=3000 npm run dev
```

## Getting Help

- Check existing issues on GitHub
- Ask in the contributor Discord channel
- Email: contributors@mundotango.life

## Contributing Guidelines

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test locally before submitting PR
4. Include screenshots for UI changes

Thank you for contributing to Mundo Tango!
