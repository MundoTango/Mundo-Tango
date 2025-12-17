/**
 * Navigation Interceptor
 * MB.MD v9.2 - Contextual Agent Activation
 * 
 * Triggers agent activation BEFORE navigation completes
 * Agents wake up, run health checks, and enter listening state
 */
export function setupNavigationInterceptor() {
  // Already intercepted? Don't duplicate
  if ((window as any).__navigationIntercepted) return;
  (window as any).__navigationIntercepted = true;
  
  // Intercept history.pushState
  const originalPushState = history.pushState;
  
  history.pushState = function(...args) {
    const [state, title, url] = args;
    
    // MB.MD v9.2: Trigger contextual agent activation
    const route = typeof url === 'string' ? url : '/';
    fetch('/api/mrblue/activate-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route })
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log(`[Navigation] ✅ Activated ${data.result?.activatedAgents?.length || 0} agents for ${route}`);
      }
    }).catch(err => {
      console.warn('[Navigation] Failed to activate agents:', err);
    });
    
    return originalPushState.apply(this, args);
  };
  
  // Intercept popstate (back/forward)
  window.addEventListener('popstate', () => {
    const route = window.location.pathname;
    
    fetch('/api/mrblue/activate-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route })
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log(`[Navigation] ✅ Activated ${data.result?.activatedAgents?.length || 0} agents for ${route}`);
      }
    }).catch(err => {
      console.warn('[Navigation] Failed to activate agents:', err);
    });
  });
  
  console.log('✅ MB.MD v9.2: Navigation interceptor enabled - contextual agents will activate on page changes');
}
