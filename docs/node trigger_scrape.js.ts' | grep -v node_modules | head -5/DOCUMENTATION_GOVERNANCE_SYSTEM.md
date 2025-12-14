# Documentation Governance System

**Version:** 1.0  
**Last Updated:** January 12, 2025  
**Batch:** 29  
**Status:** ✅ Complete

## Overview

The Documentation Governance System implements **APPENDIX P** governance rules to prevent documentation drift, duplication, and maintain a Single Source of Truth across all project documentation.

## The 4 Core Rules

### 1. UPDATE IN PLACE
**Never duplicate sections. Always modify existing content.**

```markdown
✅ CORRECT: Update existing section
## Agent #5 Training
**Status:** ✅ CERTIFIED (Updated: Jan 12, 2025)
**New Achievement:** Implemented caching

❌ WRONG: Creating duplicate
## Agent #5 Training (Updated)
**Status:** ✅ CERTIFIED
```

### 2. VERSION CONTROL
**Track all changes with dates, versions, and descriptions.**

Every update must include:
- Date stamp: When was this updated?
- Version number: Increment on each change
- Change description: What changed?

```markdown
## Section Title

**Last Updated:** January 12, 2025  
**Version:** 2.1  
**Changes:** Added Redis caching example, updated performance metrics

[Content here...]
```

### 3. REFERENCE DON'T COPY
**Link to canonical locations instead of copying content.**

```markdown
✅ CORRECT: Reference canonical location
For complete ESA Framework documentation, see **APPENDIX I** (lines 8,139-13,130).

❌ WRONG: Copying entire content
## ESA Framework
The ESA Framework has 105 agents...
[5,000 lines of duplicated content]
```

### 4. CONSOLIDATE
**Check for existing content before adding new sections.**

Workflow:
```bash
# Step 1: Check if content exists
grep -i "caching strategy" docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md

# Step 2: If found, update existing section (don't create new)
# Step 3: Run validation
node scripts/validate-docs.cjs
```

## Architecture

### Components

1. **Governance Service** (`server/services/documentation/governanceService.ts`)
   - Core validation logic
   - Duplicate detection algorithms
   - Version control tracking
   - Dependency analysis

2. **Validation Script** (`scripts/validate-docs.cjs`)
   - Command-line validation tool
   - Pre-commit integration
   - Automated checking

3. **Pre-commit Hook** (`.husky/pre-commit`)
   - Automatic validation on commit
   - Prevents committing invalid documentation
   - Enforces quality gates

4. **API Endpoints** (`server/routes/documentation-governance-routes.ts`)
   - REST API for validation
   - Update approval workflow
   - Statistics and monitoring

## Single Source of Truth Map

| Concept | Canonical Location | Lines |
|---------|-------------------|-------|
| ESA Framework Overview | APPENDIX I | 8,139-13,130 |
| 927+ Agents Complete Spec | APPENDIX J | 13,131-21,771 |
| Agent Profiles | APPENDIX K | 21,772-23,050 |
| Expert Research | APPENDIX L | 23,051-23,530 |
| Agent Training (15 Agents) | APPENDIX M | 23,531-24,174 |
| ESA New Agent Guide | APPENDIX N | 24,175-26,159 |
| Complete Agent Training | APPENDIX O | 26,160-26,619 |
| Pattern Library | Lines 1,811-5,817 | 1,811-5,817 |
| Learning Accelerators | Lines 1,021-1,810 | 1,021-1,810 |
| Top 50 Patterns | Lines 1-1,020 | 1-1,020 |

## API Endpoints

### POST /api/documentation/validate
Validate documentation file against APPENDIX P rules.

```bash
curl -X POST http://localhost:5000/api/documentation/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filePath": "docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md",
    "strict": false
  }'
```

Response:
```json
{
  "passed": true,
  "errors": [],
  "warnings": [],
  "stats": {
    "exactDuplicates": 0,
    "nearDuplicates": 0,
    "versionConflicts": 0,
    "brokenReferences": 0,
    "totalSections": 450
  }
}
```

### POST /api/documentation/update
Update documentation with governance checks (admin only).

```bash
curl -X POST http://localhost:5000/api/documentation/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "filePath": "docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md",
    "sectionTitle": "Agent #5 Training",
    "content": "Updated content...",
    "version": "2.1",
    "changes": "Added caching example"
  }'
```

### GET /api/documentation/dependencies
Get documentation dependency graph.

```bash
curl http://localhost:5000/api/documentation/dependencies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/documentation/history
Get git commit history for documentation.

```bash
curl http://localhost:5000/api/documentation/history?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/documentation/check-duplicate
Check if content is duplicate before adding.

```bash
curl -X POST http://localhost:5000/api/documentation/check-duplicate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "filePath": "docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md",
    "content": "New section content...",
    "sectionTitle": "New Feature"
  }'
```

### GET /api/documentation/rules
Get the 4 core governance rules.

```bash
curl http://localhost:5000/api/documentation/rules
```

### GET /api/documentation/stats
Get current documentation statistics.

```bash
curl http://localhost:5000/api/documentation/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Command-Line Usage

### Basic Validation

```bash
# Validate default documentation file
node scripts/validate-docs.cjs

# Validate specific file
node scripts/validate-docs.cjs --file docs/backend/AGENT_LEARNING_INDEX_COMPLETE.md

# Strict mode (warnings count as failures)
node scripts/validate-docs.cjs --strict

# JSON output
node scripts/validate-docs.cjs --json
```

### Exit Codes
- `0` = Pass (no errors)
- `1` = Fail (errors found - must fix)

## Pre-commit Hook

The pre-commit hook automatically validates documentation before allowing commits.

### Setup

```bash
# Initialize husky (if not already done)
npm install husky --save-dev
npx husky install

# Hook is already created at .husky/pre-commit
chmod +x .husky/pre-commit
```

### Bypass (NOT RECOMMENDED)

```bash
# Only use in emergencies
git commit --no-verify
```

## Quality Gates

Before committing any documentation change:

- [ ] ✅ Ran `node scripts/validate-docs.cjs` (passed)
- [ ] ✅ Updated version number in document header
- [ ] ✅ Added change log entry with date
- [ ] ✅ Checked Single Source of Truth map
- [ ] ✅ No new exact duplicates created
- [ ] ✅ Cross-references use links, not copies
- [ ] ✅ Removed any outdated content
- [ ] ✅ Tested all code examples (if added)

## Validation Checks

The governance system performs these automated checks:

### 1. Exact Duplicates (100% match)
Finds sections with identical content.

### 2. Near Duplicates (>85% similarity)
Uses Levenshtein distance algorithm to find similar content.

### 3. Version Conflicts
Detects multiple version numbers in document.

### 4. Broken References
Finds broken internal links and anchors.

### 5. Reference Violations
Detects copied content instead of references.

## Error Messages

### Exact Duplicate Found
```
❌ Errors:
  1. Found 2 exact duplicate sections

Exact Duplicates:
  1. "Agent Training Status" (lines 100-150)
     duplicates "Agent Training Status" (lines 500-550)
```

**Fix:** Remove duplicate, update original section.

### Near Duplicate Warning
```
⚠️  Warnings:
  1. Found 3 near-duplicate sections (>85% similar)

Near Duplicates:
  1. "ESA Overview" ↔️ "ESA Framework Intro" (92.5% similar)
```

**Fix:** Consolidate similar sections into one canonical location.

### Version Conflict
```
⚠️  Warnings:
  1. Version control: Found 3 different version numbers (expected: 1)
```

**Fix:** Use single version number in document header.

### Broken Reference
```
❌ Errors:
  1. Found 2 broken internal references
  2.   Broken link: "See Agent Details" → #agent-details
```

**Fix:** Update link or create missing anchor.

## Best Practices

### When Adding New Content

1. **Search first**
   ```bash
   grep -i "your topic" docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md
   ```

2. **If found: Update in place**
   ```bash
   # Edit existing section, don't create new one
   ```

3. **If not found: Check SSOT map**
   - Is this a new canonical location?
   - Should it reference an existing location?

4. **Always validate**
   ```bash
   node scripts/validate-docs.cjs
   ```

### When Updating Content

1. **Read existing section completely**
2. **Update in place** (same location)
3. **Add version info**:
   - Date stamp
   - Version increment
   - Change description
4. **Validate before commit**

### When Removing Content

1. **Check for references** to this section
2. **Update all cross-references**
3. **Validate** to ensure no broken links
4. **Document removal** in changelog

## Acceptable Duplicates

Some duplicates are acceptable:

### 1. Merged Appendices
Complete .md files included for self-containment.

### 2. Teaching Examples
Before/After code snippets for learning.

### 3. Brief Summaries
2-3 line summaries with links to full content.

```markdown
✅ OK: Brief summary + link
**Agent Training:** All 105 agents certified. See APPENDIX O for details.

❌ NOT OK: Full duplication
**Agent Training:**
[500 lines of duplicated content from APPENDIX O]
```

## Monitoring & Maintenance

### Daily Checks
```bash
# Run validation
node scripts/validate-docs.cjs

# Check stats
curl http://localhost:5000/api/documentation/stats
```

### Weekly Review
- Review near-duplicates list
- Consolidate similar sections
- Update version numbers
- Check dependency graph

### Monthly Audit
- Review entire SSOT map
- Update canonical locations if needed
- Merge similar sections
- Clean up outdated content

## Troubleshooting

### "Similar content found" error
**Problem:** Trying to add content that already exists.  
**Solution:** Update existing section instead.

### "Missing version number" warning
**Problem:** Section lacks version control metadata.  
**Solution:** Add version, date, and changes.

### "Validation script not found"
**Problem:** Script not in correct location.  
**Solution:** Ensure `scripts/validate-docs.cjs` exists.

### "Pre-commit hook not running"
**Problem:** Hook not executable or husky not installed.  
**Solution:** 
```bash
chmod +x .husky/pre-commit
npx husky install
```

## Future Enhancements

### Phase 1 (Next 30 Days)
- [ ] Automated daily validation runs
- [ ] Duplicate auto-fix for trivial cases
- [ ] Email notifications for violations

### Phase 2 (Next 90 Days)
- [ ] AI-powered semantic duplicate detection
- [ ] Auto-merge similar sections
- [ ] Visual diff tool for changes

### Phase 3 (Future)
- [ ] Real-time validation in editor
- [ ] Documentation linting rules
- [ ] Automated change log generation

## References

- **APPENDIX P:** Lines 26,620-27,039 in `docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md`
- **Source Code:** `server/services/documentation/governanceService.ts`
- **Validation Script:** `scripts/validate-docs.cjs`
- **API Routes:** `server/routes/documentation-governance-routes.ts`
- **Pre-commit Hook:** `.husky/pre-commit`

## Support

For questions or issues:
1. Read this documentation
2. Run validation script with `--json` flag for details
3. Check API endpoint `/api/documentation/rules`
4. Review APPENDIX P in AGENT_LEARNING_INDEX_COMPLETE.md

---

**Documentation Governance System - Preventing drift and duplication since 2025** ✨
