**Permission Requirement**  
- At the beginning of any session, Atlas must ask the user for any necessary permissions required to perform tasks, especially when tasks involve accessing user data, committing code, or performing any sensitive actions. Confirm these permissions before proceeding.
e# **AS.MD — Atlas System Master Memory Document**  
### **Universal Context for Mundo Tango + Life CEO**  
_Last updated: Dec 1, 2025_  

This document exists to provide ChatGPT Atlas with **full continuity** across sessions, tabs, and conversations.  
When starting a new chat, Atlas should load this file mentally and treat it as **persistent long-term memory** for the entire project.

It is the **single source of truth** for:  
- Mundo Tango  
- Life CEO  
- All QA Reports  
- All MB.MD & ESA methodology  
- All completed audits and tasks  
- All architectural decisions  
- All pending work  
- All agent orchestration  
- Full repository structure understanding  
- Replit + Supabase + GitHub + N8N integration plans  
- All cross-project strategic context

---

# ---------------------------------------------------------
# **1. PROJECTS OVERVIEW**
# ---------------------------------------------------------

## **1.1 Mundo Tango**
A global tango-centered social network supporting:  
- Memories feed (photos, videos, tagging, mutual visibility)  
- Organizers, DJs, teachers, travelers, volunteers  
- Real-time chat, events, recommendations  
- Region-based structure (USA/EU/Argentina)  
- Travel integrations (future)  
- Multi-hobby expansion later (scuba, sailing, etc.)

Tech stack:  
- **Supabase** (DB, Auth, Storage, Realtime, RLS)  
- **Replit** (development & agents)  
- **GitHub** (source control)  
- **N8N / Make.com** (automations)  
- **React + Vite** frontend  
- **Drizzle** migrations  
- **MB.MD** methodology  
- **ESA 61×21 Layers** (AI + infra architecture)

Current phase:  
**Phase 4 — Travel Integrations + Memory Reuse + Auth/RBAC Routing**

---

## **1.2 Life CEO**
A universal AI-powered personal operating system:  
- Central AI agent (“Mr. Blue / Life CEO”)  
- Multi-domain sub-agents (Finance, Travel, Health, Creative, CTO, PM, etc.)  
- GitHub + Supabase project independent from MT  
- Runs via Replit Agents + Notion AI + Atlas  
- Requires strong privacy, security, and consent architecture  
- Must orchestrate user's entire life (projects, health, travel, finance, creativity)

---

# ---------------------------------------------------------
# **2. REPOSITORY STRUCTURE (SUMMARY)**
# ---------------------------------------------------------

## **2.1 Key directories in Mundo-Tango repo**
- **client/** — frontend  
- **server/** — backend services  
- **db/** + **drizzle/** — schema + migrations  
- **qa_reports/** — *hundreds* of AI-generated audits, summaries, testing reports, MB.MD docs  
- **MundoTangoAppemergent/** — architecture diagrams/early versions  
- **e2e/tests/** — Playwright test suite  
- **public/** — assets, images  
- **migrations/** — DB evolution

qa_reports contains:  
- Full UI/UX audits (AGENT_35+, AGENT_70+)  
- Theme audits (AGENT_60–71)  
- Social features audits (AGENT_79)  
- Realtime, Stripe, I18N, Housing Marketplace, Admin Dashboard, etc.  
- MB.MD orchestration waves  
- ESA 61×21 implementation  
- API route verification  
- Security, RBAC, RLS verification  
- Feature-specific plans (events, groups, recommendations, profile, etc.)  
- Full memory + feed orchestration plans  
- All Mr. Blue agent training + intelligence verification

---

# ---------------------------------------------------------
# **3. CORE METHODOLOGIES**
# ---------------------------------------------------------

## **3.1 MB.MD (Mundo Blue Methodology Directive)**
Used throughout:  
- Research → Planning → Building → Testing → Fixing → Orchestration → Documentation  
- Emphasis on positive UX, resilience, error-proofing  
- State patterns (loading, empty-state, error, success)  
- Always include accessibility + responsiveness checks

---

## **3.2 ESA LIFE CEO 61×21 AGENTS Framework**
Applies to both MT + Life CEO:  
- 61 technical layers (from expertise → observability)  
- 21 production phases  
- Multi-agent orchestration  
- Each subsystem (auth, storage, feed, maps, chat, payments) has its own agents  
- Includes rollups, audits, stress tests, RLS security compliance, API verification, LSP checks

This repo has already completed most 61×21 layers for:  
- Social feed  
- Media system  
- Events  
- Housing marketplace  
- Admin dashboard  
- Realtime  
- RLS  
- Payments  
- Intelligence layer  
- UI theme + i18n layer  
- Agent training + verification

---

# ---------------------------------------------------------
# **4. COMPLETED WORK SUMMARY (HIGH LEVEL)**
# ---------------------------------------------------------

### ✔ Full UI/UX audits for every page  
(Feed, Memories, Events, Groups, Profile, Recommendations, Settings, Admin workflows)

### ✔ Navigation + Topbar + Sidebar verified

### ✔ RLS implemented for all media + mutual visibility logic

### ✔ Chat using Supabase Realtime

### ✔ Email notifications via Resend

### ✔ Supabase Storage + metadata tracking

### ✔ Stripe payment integration (base layer)

### ✔ Housing marketplace implementation & audit

### ✔ All theme layers, I18N layers, locale packs, and consistency checks

### ✔ Comprehensive Playwright test suite built

### ✔ MB.MD orchestration waves 1–11 completed

### ✔ Full security audits:  
- CSP  
- security headers  
- infra verification  
- secrets baseline  
- role-based systems

### ✔ API route verification test suite complete

### ✔ Admin dashboard theme + modularization complete

---

# ---------------------------------------------------------
# **5. RECENT WORK (LATE NOV–DEC 2025)**
# ---------------------------------------------------------

### **5.1 Friends List Feature**
Based on:  
- friends_list_mb_plan.md  
- friends_list_code.md  
- friends_list.md  

Frontend tasks completed:  
- Page component  
- Sidebar link  
- Route  
- API helper module  
- QA report for implementation  

Backend endpoints still needed:  
- `GET /api/friends`  
- `GET /api/friends/requests`

---

### **5.2 Recent QA Audits**
Numerous finalization reports:  
- AGENT_78 Media Content Systems  
- AGENT_79 Social Features  
- AGENT_80 Admin Moderation  
- AGENT_81 Housing Marketplace  
- AGENT_82 Feed I18N  
- AGENT_83 Events I18N  
- AGENT_88 Other European Translation  
- TOTAL ROLLUP (AGENT_68 summary + AGENT_ROLLUP_SYSTEM)

---

# ---------------------------------------------------------
# **6. PENDING + NEXT STEPS**
# ---------------------------------------------------------

## **6.1 Mundo Tango**
- Backend endpoints for Friends List  
- Expand Friends interactions (accept/deny, search, invite)  
- Travel integrations (Skyscanner/Airbnb/etc.)  
- Memory reuse across events/moments  
- Video processing pipeline (thumbnails)  
- AI tagging + captioning  
- Payment completion  
- N8N full automation sync (Productboard ↔ Airtable ↔ Supabase ↔ GitHub)  
- Auth routing guards + RBAC middleware

---

## **6.2 Life CEO (New Project Layer)**
- Create parent GitHub repo + Supabase project  
- Define agent hierarchy based on ESA 61×21  
- Core interface screen (voice + text)  
- Project/task dashboard (MT-style)  
- Notion + Replit sync automation  
- Voice pipeline (cleaning + diarization)  
- Privacy + security model  
- Daily 10am review system  
- Multi-domain agents (Finance CEO, Travel CEO, Health CEO, etc.)

---

# ---------------------------------------------------------
# **7. GUIDELINES FOR ATLAS (HOW TO USE THIS MEMORY)**
# ---------------------------------------------------------

When Atlas loads a new chat:

### **ALWAYS assume:**
- This file (AS.MD) is your persistent memory  
- The Mundo Tango repo exists exactly as described  
- All QA reports in `qa_reports/` are authoritative  
- All earlier MB.MD + ESA systems are active and correct  
- Replit + Supabase + GitHub + N8N stack is the center of current development

### **WHENEVER the user opens a new tab and asks a repo-related question:**
1. Load AS.MD context  
2. Load MB.MD execution patterns  
3. Load ESA 61×21 architecture  
4. Understand all completed audit work  
5. Understand next steps list  
6. Proceed as CTO + PM + QA + UX lead simultaneously  

### **ATLAS SHOULD:**
- Provide code aligned to repo structure  
- Provide QA reports matching prior formats  
- Understand all terminology: MB.MD, ESA, Wave, Agent 72, etc.  
- Avoid repeating prior misinformation  
- Build on past decisions  
- Never “reset” unless instructed  

---

# ---------------------------------------------------------
# **8. UNIVERSAL RULES FOR FUTURE CHATS**
# ---------------------------------------------------------

1. Assume **Mundo Tango** + **Life CEO** are long-term projects.  
2. Use this document as the **project brain**.  
3. Maintain architectural consistency.  
4. Suggest next steps only based on this file.  
5. For any feature request, apply:  
   - MB.MD  
   - ESA 61×21  
   - Repo structure knowledge  
   - Past audit insights  
6. All future QA reports must go to `qa_reports/`.  
7. Always identify what is done, what is missing, and what is blocked.  

---

# ---------------------------------------------------------
# **9. END OF MEMORY**
# ---------------------------------------------------------

This file is intended to be kept evergreen.  
Update this file whenever major features or audits are completed.

**This is the master memory for the entire project.**
