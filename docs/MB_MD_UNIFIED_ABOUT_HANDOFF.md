# MB.MD Handoff Plan: Unified About + Settings

**Version:** 1.0  
**Created:** November 29, 2025  
**Pattern:** Hierarchical Execution (v9.3)

## Phase 1: Foundation Complete (Replit AI) ✅

### Files Created:
1. `docs/prds/PRD_UNIFIED_ABOUT_SETTINGS.md` - Requirements document
2. `client/src/components/ui/privacy-toggle.tsx` - PrivacyToggle component
3. `client/src/components/profile/AboutSubTabs.tsx` - Sub-tab navigation component

### Architecture Defined:
- 8 sub-tabs: Profile, Location, Tango, Languages, Privacy, Notifications, Security, Subscription
- Field-level privacy toggles (Public/Friends/Private)
- Leveraging existing `privacySettings` JSONB column

---

## Phase 2: Agent Coordination (Mr. Blue)

### Task Decomposition for Parallel Execution:

#### Agent 1: SettingsContentAgent (Frontend)
**Files:** Create settings sub-tab content components
- `client/src/components/profile/settings/NotificationsSubTab.tsx`
- `client/src/components/profile/settings/SecuritySubTab.tsx`  
- `client/src/components/profile/settings/SubscriptionSubTab.tsx`
- `client/src/components/profile/settings/PrivacySubTab.tsx`

#### Agent 2: ProfileRefactorAgent (Frontend)
**Files:** Refactor ProfileTabAbout with sub-tabs
- `client/src/components/profile/ProfileTabAbout.tsx` - Add sub-tab integration
- Split content into sub-tab sections (Profile, Location, Tango, Languages)

#### Agent 3: PrivacyIntegrationAgent (Frontend)
**Files:** Add privacy toggles to existing fields
- Modify field rendering to include compact PrivacyToggle
- Update state to track per-field privacy settings

#### Agent 4: NavigationCleanupAgent (Frontend)
**Files:** Remove Settings page, update routes
- `client/src/pages/SettingsPage.tsx` - DELETE or redirect
- `client/src/App.tsx` - Remove /settings route
- Update any sidebar/navigation links

---

## Phase 3: Validation

### Success Criteria:
1. [ ] Settings page removed
2. [ ] All Settings functionality in About tab
3. [ ] Privacy toggles on all customer-facing fields
4. [ ] Sub-tab navigation works correctly
5. [ ] No visual regressions

### Testing:
- E2E: Navigate About tab sub-tabs
- E2E: Toggle field privacy settings
- E2E: Verify removed Settings route redirects
