# MB.MD Session Documentation

This directory contains session-based documentation following the MB.MD (Make, Build, Maintain, Document) methodology.

## Directory Structure

```
docs/mb-md/
├── README.md (this file)
└── sessions/
    └── YYYY-MM-DD-session-name.md
```

## Session Documents

### Latest Sessions
- **2025-12-10**: [Scraping Infrastructure Audit & Roadmap](./sessions/2025-12-10-scraping-infra-audit.md)
  - Complete audit of HoyMilongaScraper implementation
  - 3-phase production deployment roadmap
  - Critical blocker identification
  - Progress: 30% → Ready for Phase 1 validation

## MB.MD Methodology

Each session document follows this structure:

1. **Session Objective** - Clear goal statement
2. **Current State** - What's been completed
3. **Critical Blockers** - Issues preventing progress
4. **Execution Roadmap** - Phased approach to completion
5. **Technical Decisions** - Why choices were made
6. **Documentation Created** - What was produced
7. **Lessons Learned** - What worked and what didn't
8. **Next Session Prep** - Handoff for next developer
9. **Metrics & Progress** - Quantifiable progress tracking

## Best Practices

- **Document Before Acting**: Plan the work before coding
- **Track Progress**: Use checklists and metrics
- **Clear Handoffs**: Enable seamless collaboration
- **Incremental Validation**: Test each phase before proceeding
- **Production-First**: Skip unreliable local tests

## Quick Links

- [GitHub Issue #16 - Scraping Infrastructure Gaps](https://github.com/MundoTango/Mundo-Tango/issues/16)
- [Pull Request #15 - Scraping Infrastructure & City Groups](https://github.com/MundoTango/Mundo-Tango/pull/15)
- Branch: `server/services/scrapers`

