/**
 * User Context Capture - Captures user state for bug diagnosis
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import type { UserContext } from './componentRegistry';

export function captureUserContext(): UserContext {
  // Get user from localStorage (stored by AuthContext)
  let user: any = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      user = JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  
  // Determine tier based on user properties
  let tier: UserContext['tier'] = 'free';
  if (user) {
    if (user.role === 'god' || user.tier === 8) {
      tier = 'god';
    } else if (user.role === 'admin' || user.tier >= 6) {
      tier = 'admin';
    } else if (user.isPro || user.tier >= 3) {
      tier = 'pro';
    }
  }
  
  // Extract permissions
  const permissions: string[] = [];
  if (user?.isPro) permissions.push('pro');
  if (user?.isVerified) permissions.push('verified');
  if (user?.canCreateEvents) permissions.push('events.create');
  if (user?.canModerate) permissions.push('moderate');
  if (tier === 'admin' || tier === 'god') {
    permissions.push('admin.access');
  }
  
  // Check profile completion
  const profileComplete = !!(
    user?.firstName &&
    user?.cityId &&
    user?.bio
  );
  
  return {
    id: user?.id,
    tier,
    cityId: user?.cityId,
    cityName: user?.cityName || user?.city,
    isVerified: !!user?.isVerified,
    profileComplete,
    permissions,
  };
}

export function captureAppState(): Record<string, unknown> {
  const state: Record<string, unknown> = {};
  
  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  if (Object.keys(params).length > 0) {
    state.urlParams = params;
  }
  
  // Get path params from URL
  const pathMatch = window.location.pathname.match(/\/(\w+)\/(\d+)/);
  if (pathMatch) {
    state.pathEntity = {
      type: pathMatch[1],
      id: parseInt(pathMatch[2])
    };
  }
  
  // Check for React Query state (if available)
  try {
    // This is a best-effort capture - React Query internals may change
    const queryCache = (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryCache;
    if (queryCache) {
      const queries = queryCache.getAll?.() || [];
      state.activeQueries = queries.slice(0, 10).map((q: any) => ({
        key: q.queryKey,
        state: q.state?.status,
        dataUpdatedAt: q.state?.dataUpdatedAt
      }));
    }
  } catch {
    // Ignore errors
  }
  
  // Get active tab/section from DOM
  const activeTab = document.querySelector('[role="tab"][data-state="active"]');
  if (activeTab) {
    state.activeTab = activeTab.textContent?.trim();
    state.activeTabId = activeTab.getAttribute('data-testid');
  }
  
  // Get visible sections
  const sections = document.querySelectorAll('[data-testid^="section-"]');
  state.visibleSections = Array.from(sections).map(s => s.getAttribute('data-testid')).filter(Boolean);
  
  return state;
}

export function captureFullDiagnosticContext(
  journey: Array<{ element?: string; action?: string; path?: string }>,
  apiCalls: Array<{
    timestamp: number;
    url: string;
    method: string;
    status: number;
    requestBody?: unknown;
    responseBody?: unknown;
    duration: number;
    error?: string;
  }>,
  errors: Array<{
    timestamp: number;
    type: 'console' | 'network' | 'react' | 'unhandled';
    message: string;
    stack?: string;
    componentName?: string;
  }>
) {
  const userContext = captureUserContext();
  const appState = captureAppState();
  
  // Build breadcrumb from journey
  const breadcrumb: string[] = [];
  for (const step of journey) {
    if (!step.element) continue;
    if (step.element.startsWith('tab:')) {
      breadcrumb.push(step.element.replace('tab:', ''));
    } else if (step.element.startsWith('section:')) {
      breadcrumb.push(step.element.replace('section:', ''));
    } else if (step.action === 'tab_switch' || step.action === 'section_view') {
      breadcrumb.push(step.element);
    }
  }
  
  // Find the most relevant testId from journey
  const lastInteraction = [...journey].reverse().find(s => s.element && !s.element.startsWith('nav:'));
  const testId = lastInteraction?.element?.replace(/^(tab:|section:|button:)/, '') || undefined;
  
  return {
    testId,
    breadcrumb,
    apiCalls,
    userContext,
    errors: errors.map(e => ({
      ...e,
      type: e.type as 'console' | 'network' | 'react' | 'unhandled'
    })),
    appState
  };
}
