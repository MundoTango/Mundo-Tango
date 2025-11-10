# MB.MD PROTOCOL: Project Size Investigation & Remediation Plan

## 🚨 CRITICAL ISSUE
**Problem:** Project size = 21GB (Replit threshold: 5GB, severe degradation >10GB)  
**Impact:** Agent crashes, performance degradation, development blocked  
**Priority:** CRITICAL - Immediate investigation required

---

## 📊 PHASE 1: INVESTIGATION (Simultaneously)

### Task 1.1: Complete Size Audit
**Goal:** Identify all directories >100MB

**Commands:**
```bash
# Total project size
du -sh . 

# Top 50 largest directories
du -h --max-depth=3 . 2>/dev/null | sort -hr | head -50

# Find files >50MB
find . -type f -size +50M -exec ls -lh {} \; 2>/dev/null

# Check all hidden directories
du -sh .[^.]* 2>/dev/null | sort -hr
```

**Expected Culprits:**
- ✅ `.cache/ms-playwright/` - Playwright browser binaries (~1.5GB confirmed)
- ✅ `.cache/.bun/` - Bun package cache
- ✅ `node_modules/` - NPM dependencies (1.1GB confirmed)
- ⚠️ `.git/` - Git history (354MB confirmed)
- ⚠️ `attached_assets/` - Media files (255MB confirmed)
- ⚠️ `test-videos/` - Test fixtures (30MB confirmed)
- ⚠️ `test-results/` - Playwright test artifacts (3.1MB confirmed)
- ❓ **UNKNOWN:** 21GB - 3.6GB visible = **~17.4GB MISSING**

---

### Task 1.2: Git History Analysis
**Goal:** Identify large files in Git history

**Commands:**
```bash
# Find largest objects in Git
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2 -r | head -20

# Check Git repo size
du -sh .git

# Check if Git LFS is being used improperly
git lfs ls-files -s 2>/dev/null
```

---

### Task 1.3: Hidden Build Artifacts
**Goal:** Find forgotten build outputs, logs, caches

**Commands:**
```bash
# Common bloat sources
find . -name "dist" -o -name "build" -o -name ".next" -o -name "*.log" | xargs du -sh 2>/dev/null

# Large log files
find . -name "*.log" -size +10M 2>/dev/null

# Vite/Webpack build artifacts
find . -name ".vite" -o -name ".webpack" 2>/dev/null | xargs du -sh 2>/dev/null

# TypeScript build info
find . -name "*.tsbuildinfo" 2>/dev/null
```

---

### Task 1.4: Database/Storage Files
**Goal:** Check for large SQLite files or data dumps

**Commands:**
```bash
# Find database files
find . -name "*.db" -o -name "*.sqlite" -o -name "*.sql" | xargs ls -lh 2>/dev/null

# Check for data dumps
find . -name "*.dump" -o -name "*.bak" -o -name "*.backup" 2>/dev/null
```

---

## 🔧 PHASE 2: REMEDIATION (Recursively)

### Task 2.1: Safe Deletions (Immediate)
**Goal:** Remove regenerable caches without breaking functionality

**Actions:**
```bash
# Clear Playwright cache (browsers will reinstall on demand)
rm -rf .cache/ms-playwright/

# Clear Bun install cache (safe to delete)
rm -rf .cache/.bun/install/

# Clear TypeScript cache (safe to delete)
rm -rf .cache/typescript/

# Clear test results (can be regenerated)
rm -rf test-results/

# Clear Playwright trace files
find . -name "trace.zip" -delete 2>/dev/null
```

**Expected Savings:** ~1.9GB from .cache alone

---

### Task 2.2: Git Optimization
**Goal:** Clean Git history bloat

**Actions:**
```bash
# Run Git garbage collection
git gc --aggressive --prune=now

# Remove reflog entries
git reflog expire --expire=now --all

# If large files found in history:
# git filter-repo --strip-blobs-bigger-than 10M
```

**Expected Savings:** 50-200MB

---

### Task 2.3: Media Asset Optimization
**Goal:** Reduce attached_assets and test-videos size

**Actions:**
```bash
# Find images >1MB
find attached_assets/ -name "*.png" -o -name "*.jpg" -size +1M 2>/dev/null

# Compress large images (if found)
# Use imagemagick or similar: convert input.jpg -quality 85 output.jpg

# Remove unused test videos
rm -rf test-videos/ # If not actively used
```

**Expected Savings:** 50-100MB

---

### Task 2.4: Dependency Audit
**Goal:** Remove unused npm packages

**Actions:**
```bash
# Find unused dependencies
npx depcheck

# Check for duplicate packages
npm dedupe

# Prune dev dependencies in production
# (N/A for Replit dev environment)
```

**Expected Savings:** 100-300MB

---

## 🛡️ PHASE 3: PREVENTION (Critically)

### Task 3.1: Add .gitignore Rules
**Goal:** Prevent future bloat from being committed

**File: `.gitignore`**
```gitignore
# Caches
.cache/
*.cache
.vite/
.webpack/

# Test artifacts
test-results/
playwright-report/
trace.zip

# Build outputs
dist/
build/
.next/

# Logs
*.log
npm-debug.log*

# Database dumps
*.dump
*.sql.gz
*.bak

# Large media (use Git LFS if needed)
*.mp4
*.mov
*.avi
```

---

### Task 3.2: Create Cleanup Script
**Goal:** Automate regular cleanup

**File: `scripts/cleanup-bloat.sh`**
```bash
#!/bin/bash
echo "🧹 Cleaning project bloat..."

# Clear caches
rm -rf .cache/ms-playwright/
rm -rf .cache/.bun/install/
rm -rf .cache/typescript/

# Clear test artifacts
rm -rf test-results/
rm -rf playwright-report/
find . -name "trace.zip" -delete 2>/dev/null

# Git cleanup
git gc --aggressive --prune=now
git reflog expire --expire=now --all

echo "✅ Cleanup complete!"
du -sh .
```

---

### Task 3.3: Add Pre-commit Hook
**Goal:** Block large file commits

**File: `.husky/pre-commit`** (if using Husky)
```bash
#!/bin/bash
# Block files >5MB
find . -type f -size +5M | grep -v node_modules | grep -v .git | while read file; do
  echo "❌ ERROR: Large file detected: $file"
  exit 1
done
```

---

### Task 3.4: Documentation Update
**Goal:** Document size limits for team

**File: `docs/development-guidelines.md`**
```markdown
## Project Size Limits

**Replit Thresholds:**
- ✅ Safe: <5GB
- ⚠️ Warning: 5-10GB  
- 🚨 Critical: >10GB (Agent degradation)

**Rules:**
1. Never commit large media files (use Git LFS)
2. Run `npm run cleanup` monthly
3. Clear `.cache/` before major commits
4. Keep test-videos/ under 50MB
5. Compress images before adding
```

---

## 📋 EXECUTION CHECKLIST

### Immediate Actions (Today)
- [ ] Run Phase 1 investigation (all 4 tasks simultaneously)
- [ ] Identify the 17.4GB mystery bloat
- [ ] Execute Phase 2 safe deletions
- [ ] Verify project size <5GB
- [ ] Test Agent stability

### Short-term (This Week)
- [ ] Create cleanup script
- [ ] Add .gitignore rules
- [ ] Update documentation
- [ ] Run dependency audit

### Long-term (Ongoing)
- [ ] Monthly cleanup routine
- [ ] Monitor project size in CI/CD
- [ ] Regular Git garbage collection
- [ ] Media asset optimization

---

## 🎯 SUCCESS CRITERIA

1. **Target Size:** <3GB (safety buffer below 5GB threshold)
2. **Agent Stability:** No crashes for 24+ hours
3. **Performance:** Normal response times (<2s)
4. **Prevention:** Automated safeguards in place

---

## 🔍 NEXT STEPS

**Run This Command First:**
```bash
# Complete size breakdown
du -h --max-depth=2 . 2>/dev/null | sort -hr | head -50 > size-report.txt
cat size-report.txt
```

**Then investigate the mystery 17.4GB:**
- Check for multiple node_modules copies
- Look for Replit-specific caches (`.cache/replit/`)
- Inspect database files or backups
- Search for large binary files

---

**Investigation Lead:** MB.MD Protocol Agent  
**Status:** CRITICAL - Investigation in progress  
**Updated:** 2025-11-10 22:00 UTC
