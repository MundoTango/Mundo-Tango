# Contributing to Mundo Tango

Thank you for your interest in contributing to Mundo Tango! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Internationalization](#internationalization)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors. We are building a platform for the global tango community, and we expect the same warmth and respect in our development community.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Local Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mundo-tango.git
   cd mundo-tango
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/mundo-tango.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration (DATABASE_URL is required)
   ```

6. **Database Setup**
   ```bash
   npm run db:push          # Sync local DB with schema
   ```

7. **Verify setup**
   ```bash
   npm run typecheck
   ```

## Development Workflow

### Admin Access
To test admin features (at `/admin`), you must set your user tier to `8` in the `users` table after registering.
```sql
UPDATE users SET tier = 8 WHERE email = 'your-email@example.com';
```

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features (e.g., `feat/user-notifications`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Test additions (e.g., `test/event-api`)

### Workflow Steps

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make your changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update translations if adding UI text

4. **Run checks locally**
   ```bash
   npm run typecheck        # TypeScript check
   npm run lint             # ESLint (if configured)
   npm run test:unit        # Unit tests (if configured)
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user notification system"
   ```

6. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types - avoid `any`
- Use interfaces for object shapes
- Export types from `shared/schema.ts` for shared data models

### React

- Use functional components with hooks
- Use `wouter` for routing
- Use `@tanstack/react-query` for data fetching
- Use `react-hook-form` with `zod` for forms
- Add `data-testid` attributes to interactive elements

### File Organization

```
client/src/
  components/     # Reusable UI components
  pages/          # Page components (one per route)
  hooks/          # Custom React hooks
  lib/            # Utility functions

server/
  routes/         # API route handlers
  services/       # Business logic
  storage.ts      # Database interface

shared/
  schema.ts       # Shared types and Drizzle schemas
```

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns in `client/src/components/ui/`
- Support dark mode with `dark:` variants
- Follow `design_guidelines.md` for design decisions

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system changes |
| `ci` | CI configuration changes |
| `chore` | Other changes |
| `revert` | Revert a previous commit |

### Examples

```bash
# Good commits
git commit -m "feat: Add event search by city"
git commit -m "fix: Resolve login redirect loop"
git commit -m "docs: Update API endpoint documentation"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
```

## Pull Request Process

1. **Fill out the PR template** completely
2. **Ensure CI passes** - All checks must be green
3. **Request review** from maintainers
4. **Address feedback** promptly
5. **Keep PR focused** - One feature/fix per PR

### PR Requirements

- [ ] TypeScript compiles without errors
- [ ] Follows coding standards
- [ ] Includes tests (when applicable)
- [ ] Updates translations (when adding UI text)
- [ ] Commit messages follow conventions

## Testing Requirements

### Unit Tests

- Write tests for utility functions
- Write tests for API route handlers
- Use Vitest for unit testing

```bash
npm run test:unit
```

### E2E Tests

- Critical user flows should have E2E coverage
- Use Playwright for E2E testing

```bash
npm run test:e2e
```

### Manual Testing

- Test your changes in multiple browsers
- Test responsive behavior
- Test dark mode

## Internationalization

Mundo Tango supports 68 languages. All user-facing text must be internationalized.

### Adding Translations

1. **Use the `t()` function** for all UI text:
   ```tsx
   import { useTranslation } from 'react-i18next';
   
   function MyComponent() {
     const { t } = useTranslation('pages');
     return <h1>{t('myPage.title', 'Default Title')}</h1>;
   }
   ```

2. **Add keys to English locale files** in `client/public/locales/en/`:
   - `common.json` - Shared UI elements
   - `navigation.json` - Navigation labels
   - `pages.json` - Page-specific content
   - `errors.json` - Error messages

3. **Follow existing patterns** - See `translation.md` for detailed guidelines

### Translation File Location

**IMPORTANT**: Edit files in `client/public/locales/` - this is where Vite serves translations from.

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open an Issue using the bug report template
- **Features**: Open an Issue using the feature request template
- **Live Q&A**: Join our weekly Thursday Zoom sessions

## Troubleshooting

### Common Issues

- **Translations not appearing**: Ensure you are editing files in `client/public/locales/`, not the root `public/locales/`.
- **Database Connection**: Ensure `DATABASE_URL` is correctly set in your `.env` file and your local/remote Postgres instance is accessible.
- **Type Errors**: If you've modified the schema, run `npm run db:push` to ensure your database matches your types.
- **Build Failures**: Check for hardcoded strings in the UI; everything must use the `t()` function.

## Recognition

Contributors are recognized in:
- Release notes
- Contributors page on the website
- Our eternal gratitude for helping build the global tango platform!

---

Thank you for contributing to Mundo Tango! Together, we're building something special for the global tango community.
