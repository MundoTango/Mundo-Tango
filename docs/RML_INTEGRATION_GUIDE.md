# 🐛 RML Integration Guide - Mundo Tango

## ✅ RML Successfully Installed

**Version:** 0.1.13  
**Location:** `/home/runner/.rml/bin/rml`  
**Status:** ✅ Authenticated with GitHub

---

## 🎯 How RML Works

RML analyzes **GIT CHANGES** between two states:
- **Default:** Uncommitted changes vs HEAD
- **Custom:** Any two git references (branches, commits)

### ❌ What RML Does NOT Do:
- Audit entire committed codebases
- Static analysis of old code
- Find bugs in code that hasn't changed

### ✅ What RML DOES Do:
- Catch bugs in NEW code as you write it
- Find external library misuse (Stripe, Supabase, React)
- Detect breaking changes
- Understand codebase context
- Zero data retention (privacy-first)

---

## 🚀 MB.MD Protocol: Using RML

### **Simultaneously** - Run on Multiple Subsystems

```bash
# Backend changes
export PATH="/home/runner/.rml/bin:$PATH"
rml server/*.ts --markdown

# Frontend changes  
export PATH="/home/runner/.rml/bin:$PATH"
rml client/src/pages/*.tsx --markdown

# Specific feature
export PATH="/home/runner/.rml/bin:$PATH"
rml server/routes.ts client/src/App.tsx --markdown
```

### **Recursively** - Deep Analysis

```bash
# Compare branches (finds ALL differences)
rml --from main --to feature-branch --markdown

# Last 5 commits
rml --from HEAD~5 --to HEAD --markdown

# Entire directory tree
rml server/ --markdown
```

### **Critically** - Fix Issues

```bash
# 1. Make code changes
# 2. Run RML
rml --markdown

# 3. Fix issues RML found
# 4. Re-run RML
rml --markdown

# 5. Repeat until clean
```

---

## 📋 RML Workflow for Mundo Tango

### **Pre-Commit Hook** (Recommended)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
export PATH="/home/runner/.rml/bin:$PATH"
echo "🐛 Running RML bug detection..."
rml --markdown

if [ $? -ne 0 ]; then
  echo "❌ RML found bugs! Fix before committing."
  exit 1
fi

echo "✅ RML passed!"
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### **CI/CD Integration**

Add to `.github/workflows/rml-check.yml`:

```yaml
name: RML Bug Detection

on: [pull_request]

jobs:
  rml-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install RML
        run: curl -fsSL install.recurse.ml | sh
      - name: Run RML
        run: |
          export PATH="/home/runner/.rml/bin:$PATH"
          rml --from ${{ github.event.pull_request.base.sha }} --to HEAD --markdown
```

---

## 🎨 Example: Testing Vibrant Design Changes

```bash
# Make design changes
vim client/src/index.css
vim client/src/pages/MemoriesPage.tsx

# Check for bugs
export PATH="/home/runner/.rml/bin:$PATH"
rml client/src/index.css client/src/pages/MemoriesPage.tsx --markdown

# Expected output (if no bugs):
# ✨ No bugs found! ✨
```

---

## 🔧 Common RML Commands

### Check Uncommitted Changes
```bash
export PATH="/home/runner/.rml/bin:$PATH"
rml --markdown
```

### Check Specific Files
```bash
export PATH="/home/runner/.rml/bin:$PATH"
rml file1.ts file2.tsx --markdown
```

### Compare Branches
```bash
export PATH="/home/runner/.rml/bin:$PATH"
rml --from main --to feature-housing --markdown
```

### Check Last N Commits
```bash
export PATH="/home/runner/.rml/bin:$PATH"
rml --from HEAD~10 --to HEAD --markdown
```

---

## 🐛 What RML Catches

### External Library Misuse
- **Stripe API** - Incorrect charge creation, webhook handling
- **Supabase** - Auth flow errors, realtime subscription bugs
- **React** - Hook dependencies, state updates, lifecycle issues
- **OpenAI** - API misuse, token handling, stream errors

### Breaking Changes
- Function signature changes affecting callers
- Component prop changes breaking parents
- API route changes breaking frontend
- Database schema changes breaking queries

### Logic Bugs
- Null/undefined handling
- Type errors TypeScript might miss
- Race conditions
- Resource leaks

### Security Issues
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication bypasses
- Data exposure

---

## 📊 RML + TypeScript + LSP Strategy

**Three-Layer Quality Assurance:**

1. **TypeScript Compiler** - Type checking
   ```bash
   npx tsc --noEmit
   ```

2. **LSP Diagnostics** - Real-time errors
   ```bash
   # Built into editor
   ```

3. **RML** - Semantic bug detection
   ```bash
   export PATH="/home/runner/.rml/bin:$PATH"
   rml --markdown
   ```

**Use All Three Together:**
```bash
# Complete quality check
npx tsc --noEmit && \
export PATH="/home/runner/.rml/bin:$PATH" && \
rml --markdown && \
echo "✅ All checks passed!"
```

---

## 🎯 Next Steps for Mundo Tango

### Immediate Actions:
1. ✅ RML installed and authenticated
2. ⏳ Fix TypeScript error in `resourceAllocation.ts`
3. ⏳ Set up pre-commit hook
4. ⏳ Add RML to CI/CD pipeline

### Ongoing Usage:
- Run RML before every commit
- Run RML after implementing features
- Run RML before production deployments
- Review RML findings critically

---

## 💡 Pro Tips

1. **Always use `--markdown` flag** - LLM-friendly output
2. **Run early and often** - Catch bugs before they compound
3. **Trust RML's context** - It understands your entire codebase
4. **Zero retention** - Your code never leaves your machine
5. **Combine with TypeScript** - RML finds bugs TypeScript misses

---

## 📈 Expected Benefits

- **Fewer production bugs** - Catch issues before deployment
- **Faster debugging** - Find root causes quickly
- **Better AI collaboration** - AI agents get instant feedback
- **Safer refactoring** - Detect breaking changes automatically
- **Improved code quality** - Learn from RML suggestions

---

**RML is now ready to protect Mundo Tango! 🐛✨**

Run it on every change, trust its findings, and ship bug-free code.
