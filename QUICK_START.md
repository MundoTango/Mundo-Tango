# Mundo Tango - Quick Start Guide

Welcome to Mundo Tango! This guide will get you up and running in **under 15 minutes**.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ installed ([download](https://nodejs.org/))
- **PostgreSQL** database (or a [Neon](https://neon.tech) account for serverless Postgres)
- **Git** installed
- A code editor (VS Code recommended)

---

## 🚀 Quick Setup (15 minutes)

### 1. Clone & Install

```bash
git clone <repository-url>
cd Mundo-Tango
npm install
```

**Expected time**: 2-3 minutes

---

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mundo_tango"

# Session Secret (generate a random string)
SESSION_SECRET="your-super-secret-session-key-here"

# Optional: Error Monitoring
# SENTRY_DSN="your-sentry-dsn-here"

# Optional: External Services
# OPENAI_API_KEY="sk-..."
# STRIPE_SECRET_KEY="sk_test_..."
# CLOUDINARY_URL="cloudinary://..."
```

💡 **Tip**: For DATABASE_URL, you can use:

- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/mundo_tango`
- [Neon](https://neon.tech) (free tier): Copy connection string from your Neon dashboard

**Expected time**: 2 minutes

---

### 3. Database Setup

```bash
# Push database schema (creates all tables)
npm run db:push

# (Optional) Open Drizzle Studio to view your database
npm run db:studio
```

**Expected time**: 1 minute

---

### 4. Start Development Server

```bash
npm run dev
```

✅ **Success!** Your app should now be running at **http://localhost:5000**

**Expected time**: 10 seconds

---

## 🛠️ Available Commands

### Development

```bash
npm run dev          # Start development server (loads .env automatically)
npm run build        # Build for production
npm start            # Start production server
```

### Code Quality

```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run typecheck    # TypeScript type checking
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
```

### Database

```bash
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

---

## 📚 Project Structure

```
Mundo-Tango/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── routes/     # Route definitions
│   │   └── lib/        # Frontend utilities
│   └── public/      # Static assets & i18n translations
├── server/          # Express backend
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database operations
│   ├── jobs/        # Background jobs
│   └── middleware/  # Express middleware
├── shared/          # Shared types & utilities
├── db/              # Database schema (Drizzle ORM)
└── scripts/         # Build & utility scripts
```

---

## 🔧 Common Operations

### Adding a New Database Table

1. Define schema in `db/schema.ts`
2. Run `npm run db:push` to update database
3. Use the new table in `server/storage.ts`

### Adding an API Endpoint

1. Add route handler in `server/routes.ts`
2. Follow existing patterns (e.g., `/api/users`)
3. Test with `curl` or Postman

### Adding a New Page

1. Create component in `client/src/pages/`
2. Add route in appropriate `client/src/routes/*Routes.tsx`
3. Page will be lazy-loaded automatically

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- UserProfile.test.tsx

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch
```

---

## 🐛 Troubleshooting

### Dev server won't start

- **Check DATABASE_URL**: Ensure your `.env` file exists and DATABASE_URL is correct
- **Check port 5000**: Make sure nothing else is using port 5000
- **Check Node version**: Run `node --version` (should be 20+)

### Database errors

- **Connection refused**: Make sure PostgreSQL is running
- **Schema mismatch**: Run `npm run db:push` to sync schema
- **Missing tables**: Run `npm run db:push` to create tables

### Build errors

- **TypeScript errors**: Run `npm run typecheck` to see details
- **Linting errors**: Run `npm run lint:fix` to auto-fix
- **Module not found**: Run `npm install` again

---

## 📖 Next Steps

Now that you're set up, check out:

- **Implementation Plan** - See `.gemini/antigravity/brain/[conversation-id]/implementation_plan.md`
- **Vibe Code Council Analysis** - Architecture recommendations
- **API Documentation** - `http://localhost:5000/api-docs` (when server is running)

---

## 🤝 Getting Help

- **Build issues?** Check the error message carefully - most issues are config-related
- **Database issues?** Use `npm run db:studio` to inspect your database
- **Still stuck?** Open an issue with:
  - Your Node version (`node --version`)
  - Error message (full stack trace)
  - Steps to reproduce

---

**Happy coding!** 🎉

_Estimated onboarding time: 15 minutes_  
_Previously: 2-3 days without this guide_
