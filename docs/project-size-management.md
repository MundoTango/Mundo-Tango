# Project Size Management & Bloat Prevention

## 🚨 Replit Size Thresholds

| Size Range | Status | Impact |
|------------|--------|--------|
| **<5GB** | ✅ Safe | Normal Agent performance |
| **5-10GB** | ⚠️ Warning | Degraded Agent performance |
| **>10GB** | 🚨 Critical | Severe Agent crashes |

**Current Target:** <2GB (optimal performance with safety buffer)

---

## 📊 Current Project Breakdown

**Last Measured:** 2025-11-10  
**Total Size:** ~3.4GB

### Size by Category

| Directory | Size | Status | Action |
|-----------|------|--------|--------|
| `.cache/` | 1.9GB | ⚠️ Reducible | Clear regularly |
| `node_modules/` | 684MB | ✅ Normal | Audit quarterly |
| `.git/` | 354MB | ✅ Normal | GC monthly |
| `attached_assets/` | 255MB | ⚠️ Monitor | Compress images |
| `.local/` | 201MB | ⚠️ System | Don't delete |
| `test-videos/` | 30MB | ✅ OK | Keep <50MB |
| **Other** | ~50MB | ✅ OK | - |

---

## 🧹 Regular Cleanup Routine

### Monthly (Required)
```bash
# Run automated cleanup script
./scripts/cleanup-bloat.sh
```

**What it does:**
- Clears Playwright browser cache (~1.5GB)
- Removes Bun install cache (~358MB)
- Deletes TypeScript cache (~36MB)
- Removes test artifacts (traces, videos)
- Optimizes Git repository

**Expected Savings:** 1.5-2GB

---

### Quarterly (Recommended)

1. **Dependency Audit**
   ```bash
   # Find unused packages
   npx depcheck
   
   # Remove unused dependencies
   npm uninstall <package-name>
   
   # Deduplicate packages
   npm dedupe
   ```

2. **Media Asset Review**
   ```bash
   # Find large images
   find attached_assets/ -size +1M -type f
   
   # Compress PNGs (if needed)
   # Install imagemagick: nix-env -iA nixpkgs.imagemagick
   find attached_assets/ -name "*.png" -exec convert {} -quality 85 {} \;
   ```

3. **Git History Cleanup**
   ```bash
   # Find largest objects in history
   git rev-list --objects --all | \
     git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
     awk '/^blob/ {print substr($0,6)}' | sort -nr -k2 | head -20
   
   # If large files found, consider git-filter-repo
   ```

---

## 🛡️ Prevention Rules

### 1. Never Commit These

**Automatically blocked by .gitignore:**
- Browser binaries (`.cache/ms-playwright/`)
- Package caches (`.cache/.bun/`, `.cache/typescript/`)
- Test artifacts (`test-results/`, `trace.zip`)
- Large videos (`*.mp4`, `*.webm`, `*.mov`)
- Database dumps (`*.sql.gz`, `*.dump`)

### 2. File Size Limits

| File Type | Max Size | Reason |
|-----------|----------|--------|
| Images (PNG/JPG) | 500KB | Use compression |
| Videos | 10MB | Use external hosting |
| Test fixtures | 5MB | Keep minimal |
| Database dumps | Never commit | Use migrations |

### 3. Pre-Commit Checklist

Before committing large changes:
```bash
# Check your staged file sizes
git diff --cached --stat

# Check total project size
du -sh .

# Run cleanup if needed
./scripts/cleanup-bloat.sh
```

---

## 🔧 Troubleshooting

### Problem: Agent keeps crashing

**Solution:**
1. Run cleanup script immediately
2. Check current size: `du -sh .`
3. If still >5GB, investigate: `du -h --max-depth=2 . | sort -hr | head -30`
4. Contact Replit support if persistent

### Problem: Cleanup script not reducing size

**Possible causes:**
- Playwright browsers not installed (nothing to clean)
- Large files committed to Git history
- Multiple `node_modules/` directories

**Investigation:**
```bash
# Find all node_modules
find . -name "node_modules" -type d

# Find files >50MB
find . -type f -size +50M 2>/dev/null

# Check Git pack size
git count-objects -vH
```

### Problem: Size grew suddenly

**Check these:**
```bash
# Recent large files
find . -type f -mtime -7 -size +10M

# Git recent additions
git log --all --pretty=format: --name-only --diff-filter=A | \
  sort -u | xargs -I {} git ls-tree -r --long HEAD {} | \
  sort -k 4 -n -r | head -20
```

---

## 📋 Quick Reference Commands

```bash
# Current project size
du -sh .

# Top 20 largest directories
du -h --max-depth=2 . 2>/dev/null | sort -hr | head -20

# Files >10MB
find . -type f -size +10M -exec ls -lh {} \;

# Cache size breakdown
du -sh .cache/*

# Git repo statistics
git count-objects -vH

# Run cleanup
./scripts/cleanup-bloat.sh

# Reinstall Playwright (after cleanup)
npx playwright install
```

---

## 🎯 Size Optimization Targets

### Immediate (Current Session)
- [x] Document bloat sources
- [x] Create cleanup script
- [ ] Execute cleanup (reduce to <2GB)
- [ ] Update .gitignore
- [ ] Verify Agent stability

### Short-term (This Week)
- [ ] Audit dependencies
- [ ] Compress large images
- [ ] Run Git GC
- [ ] Set up monthly reminder

### Long-term (Ongoing)
- [ ] Monitor size in CI/CD
- [ ] Quarterly dependency reviews
- [ ] Media asset optimization workflow
- [ ] Git LFS for large files (if needed)

---

## 📈 Size Monitoring

**Add to monthly checklist:**
1. Run `du -sh .` → should be <2GB
2. Run cleanup script if >2GB
3. Check `.gitignore` compliance
4. Review new large files added
5. Update this document if patterns change

---

**Maintained by:** Development Team  
**Last Updated:** 2025-11-10  
**Next Review:** 2025-12-10
