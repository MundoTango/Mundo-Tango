# Safe Merge Strategy for Mundo Tango Branches

## Current Situation
- **Current Branch**: `server/services/scrapers`
- **Problem**: Multiple branches with different work, risk of losing changes
- **Goal**: Safely merge all branch work back into `main` without losing anything

## Branch Analysis

### Active Development Branches
```
* server/services/scrapers (current - scraping infrastructure)
  feat/international-payments-phase1
  feat/mr-blue-beta-3d-avatar-enhancement
  feature/audio-conversation
  feature/friends-list
  feature/luma-dream-machine-integration
  feature/mr-blue-elevenlabs-integration
  qa-remediation/sprint1-critical-fixes
  server/agents
```

## ⚠️ CRITICAL: Safe Merge Process

### Option 1: Sequential Branch Merges (RECOMMENDED)
**Safest approach - merge one branch at a time into main**

```bash
# Step 1: First, commit current work on server/services/scrapers
git add docs/mb-md/
git commit -m "Add MB.MD session documentation for scraping infrastructure audit"
git push origin server/services/scrapers

# Step 2: Switch to main and update
git checkout main
git pull origin main

# Step 3: Merge each branch one by one (START WITH MOST IMPORTANT)
# For each branch, do:
git merge origin/server/services/scrapers --no-ff -m "Merge scraping infrastructure"
git push origin main

# Then repeat for other branches:
git merge origin/feat/mr-blue-beta-3d-avatar-enhancement --no-ff -m "Merge Mr Blue enhancements"
git push origin main

# Continue for each branch...
```

### Option 2: Create Integration Branch (SAFER FOR TESTING)
**Test merges in integration branch first**

```bash
# Step 1: Commit current work
git add docs/mb-md/
git commit -m "Add MB.MD documentation"
git push origin server/services/scrapers

# Step 2: Create integration branch from main
git checkout main
git pull origin main
git checkout -b integration/all-features-dec-2025

# Step 3: Merge all branches into integration branch
git merge origin/server/services/scrapers --no-ff
git merge origin/feat/mr-blue-beta-3d-avatar-enhancement --no-ff
git merge origin/feature/audio-conversation --no-ff
git merge origin/feat/international-payments-phase1 --no-ff
git merge origin/feature/friends-list --no-ff
git merge origin/feature/luma-dream-machine-integration --no-ff
git merge origin/feature/mr-blue-elevenlabs-integration --no-ff
git merge origin/qa-remediation/sprint1-critical-fixes --no-ff
git merge origin/server/agents --no-ff

# Step 4: Test integration branch thoroughly
# - Run all tests
# - Deploy to staging
# - Verify all features work

# Step 5: If tests pass, merge integration to main
git checkout main
git merge integration/all-features-dec-2025 --no-ff
git push origin main
```

### Option 3: GitHub Pull Requests (BEST FOR REVIEW)
**Most transparent, allows code review**

```bash
# Step 1: Commit current work
git add docs/mb-md/
git commit -m "Add MB.MD documentation"
git push origin server/services/scrapers

# Step 2: For each branch, create a PR to main:
# Go to GitHub and create PRs:
# - server/services/scrapers -> main
# - feat/mr-blue-beta-3d-avatar-enhancement -> main
# - feature/audio-conversation -> main
# etc.

# Step 3: Review each PR carefully
# - Check for conflicts
# - Review code changes
# - Get approvals if needed

# Step 4: Merge PRs one by one
# - Merge highest priority first
# - Test after each merge
# - Fix any conflicts as they arise
```

## 📊 Priority Order for Merging

### Priority 1: Core Infrastructure (MUST MERGE FIRST)
1. `server/services/scrapers` - Scraping infrastructure (30% complete)
2. `server/agents` - Agent orchestration
3. `qa-remediation/sprint1-critical-fixes` - Bug fixes

### Priority 2: Features (MERGE AFTER CORE)
4. `feat/mr-blue-beta-3d-avatar-enhancement` - Mr Blue improvements
5. `feature/mr-blue-elevenlabs-integration` - Voice integration
6. `feature/audio-conversation` - Audio features
7. `feature/luma-dream-machine-integration` - Video features

### Priority 3: New Features (MERGE LAST)
8. `feat/international-payments-phase1` - Payments
9. `feature/friends-list` - Social features

## 🛡️ Conflict Resolution Strategy

If merge conflicts occur:

```bash
# 1. See which files have conflicts
git status

# 2. For each conflicted file:
# - Open in editor
# - Look for <<<<<<< HEAD markers
# - Decide which code to keep (or keep both)
# - Remove conflict markers

# 3. After resolving all conflicts:
git add <resolved-files>
git commit -m "Resolve merge conflicts between X and Y"

# 4. Push the merge
git push origin main
```

## 📝 Recommended: Use Option 2 (Integration Branch)

This is the safest approach because:
1. ✅ Doesn't touch main until tested
2. ✅ All conflicts resolved in integration branch
3. ✅ Can test full integration before merging to main
4. ✅ Easy to abandon if something goes wrong
5. ✅ Single PR from integration to main at the end

## ⚠️ What NOT to Do

❌ **DON'T** pull main into feature branches (creates reverse merges)
❌ **DON'T** force push to main
❌ **DON'T** delete branches until confirmed merged
❌ **DON'T** merge without testing
❌ **DON'T** merge all at once without checking for conflicts

## 📊 Tracking Progress

Create a GitHub Project or Issue to track:
- [ ] server/services/scrapers merged
- [ ] server/agents merged
- [ ] qa-remediation/sprint1-critical-fixes merged
- [ ] feat/mr-blue-beta-3d-avatar-enhancement merged
- [ ] feature/mr-blue-elevenlabs-integration merged
- [ ] feature/audio-conversation merged
- [ ] feature/luma-dream-machine-integration merged
- [ ] feat/international-payments-phase1 merged
- [ ] feature/friends-list merged

## 🛠️ Replit-Specific Considerations

Since you're working in Replit:
1. Replit auto-commits and pushes - make sure it's pushing to the right branch
2. Check Replit's Git integration settings
3. Consider doing merges in GitHub directly to avoid Replit confusion
4. Keep Replit on one branch at a time

## 🚀 Next Steps

1. Review this strategy
2. Choose Option 2 (Integration Branch) or Option 3 (GitHub PRs)
3. Commit current MB.MD work
4. Follow the chosen strategy step-by-step
5. Test thoroughly after each merge
6. Document any issues in GitHub Issue #16

