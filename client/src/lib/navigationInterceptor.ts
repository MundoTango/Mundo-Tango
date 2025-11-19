export function setupNavigationInterceptor() {
  // Already intercepted? Don't duplicate
  if ((window as any).__navigationIntercepted) return;
  (window as any).__navigationIntercepted = true;
  
  // Intercept history.pushState
  const originalPushState = history.pushState;
  
  history.pushState = function(...args) {
    const [state, title, url] = args;
    
    // Trigger agent activation BEFORE navigation
    const pageId = typeof url === 'string' ? url : '/';
    fetch('/api/self-healing/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId })
    }).catch(err => {
      console.warn('Failed to activate agents:', err);
    });
    
    return originalPushState.apply(this, args);
  };
  
  // Intercept popstate (back/forward)
  window.addEventListener('popstate', () => {
    const pageId = window.location.pathname;
    
    fetch('/api/self-healing/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId })
    }).catch(err => {
      console.warn('Failed to activate agents:', err);
    });
  });
  
  console.log('✅ Navigation interceptor enabled - agents will activate on page changes');
}
