# GitHub Branch Protection Rules

This document outlines the recommended branch protection rules for the Mundo Tango repository.

## Setting Up Branch Protection

Go to: **Settings** → **Branches** → **Add branch protection rule**

### Rule: Protect `main` branch

**Branch name pattern**: `main`

### Recommended Settings

#### Protect matching branches

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (minimum)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (optional, for larger teams)
  - [x] Require approval of the most recent reviewable push

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - `Type Check & Lint`
    - `Build Verification`
    - `Security Audit`
    - `Commit Lint` (for PRs)

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (optional, for higher security)

- [ ] **Require linear history** (optional, prevents merge commits)

- [x] **Do not allow bypassing the above settings**

#### Rules applied to everyone including administrators

- [x] **Restrict who can push to matching branches**
  - Only allow specific people or teams to push directly (optional)

- [ ] **Allow force pushes** - **DISABLED** (never allow force push to main)

- [ ] **Allow deletions** - **DISABLED** (prevent main branch deletion)

## Quick Setup Commands

After setting up branch protection, you can verify it works:

```bash
# This should fail (direct push to main is blocked)
git push origin main

# This is the correct workflow
git checkout -b feat/my-feature
# ... make changes ...
git push origin feat/my-feature
# ... create PR on GitHub ...
```

## CI Status Checks

The following status checks are defined in `.github/workflows/ci.yml`:

| Check Name | Description | Required |
|------------|-------------|----------|
| Type Check & Lint | TypeScript and ESLint | Yes |
| Commit Lint | Conventional commit validation | Yes (PRs) |
| Unit Tests | Vitest unit tests | Recommended |
| Build Verification | Production build test | Yes |
| Security Audit | npm audit for vulnerabilities | Recommended |
| E2E Tests | Playwright tests | Optional |

## Enforcement Levels

### Strict (Recommended for Production)

- All checks must pass
- At least 1 approval required
- No force pushes
- No bypassing by admins

### Moderate (For Active Development)

- Type check and build must pass
- Approvals recommended but not required
- Admin bypass allowed for emergencies

### Minimal (For Initial Setup)

- Only type check required
- No approval required
- Use this temporarily while onboarding contributors

## Emergency Procedures

If you need to bypass protection in an emergency:

1. Go to **Settings** → **Branches** → Edit rule
2. Temporarily enable "Allow specified actors to bypass required pull requests"
3. Make the emergency fix
4. **Immediately** disable the bypass
5. Document the emergency in the PR/commit message

## Updating These Rules

When modifying branch protection:

1. Discuss changes with the team first
2. Update this document
3. Apply changes in GitHub settings
4. Notify all contributors of the change
