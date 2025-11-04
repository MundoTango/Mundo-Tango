/**
 * Iframe Script Injector
 * Injects component selection logic into iframe via postMessage
 * Solves cross-origin security issues
 */

export const IFRAME_SELECTION_SCRIPT = `
(function() {
  let hoveredElement = null;
  let selectedElement = null;

  // Hide floating Mr. Blue buttons inside iframe
  function hideMrBlueButtons() {
    const selectors = [
      '[data-testid="global-mr-blue"]',
      '[data-testid="button-ask-mr-blue"]',
      '[data-testid="button-mr-blue"]',
      '[data-testid="button-mr-blue-open"]'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el) {
          el.style.display = 'none';
        }
      });
    });
  }

  // Hide on load and periodically
  hideMrBlueButtons();
  setInterval(hideMrBlueButtons, 500);

  function handleMouseMove(e) {
    const target = e.target;
    
    // Remove previous hover
    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.style.outline = '';
    }

    // Add hover to new element
    if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
      target.style.outline = '2px dashed rgba(147, 51, 234, 0.5)';
      hoveredElement = target;
    }
  }

  function handleClick(e) {
    const target = e.target;
    
    // COMMAND+CLICK (or CTRL+CLICK) NAVIGATION - Like Replit
    if ((e.metaKey || e.ctrlKey) && target.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
      
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        // Send navigation request to parent
        window.parent.postMessage({
          type: 'IFRAME_NAVIGATE',
          url: href
        }, '*');
        return;
      }
    }

    // REGULAR CLICK - Element selection
    e.preventDefault();
    e.stopPropagation();
    
    // Remove previous selection
    if (selectedElement) {
      selectedElement.style.outline = '';
    }

    // Select new element
    if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
      target.style.outline = '3px solid rgb(147, 51, 234)';
      selectedElement = target;

      // Get element info
      const rect = target.getBoundingClientRect();
      const component = {
        id: target.id || 'element-' + Date.now(),
        tagName: target.tagName.toLowerCase(),
        className: target.className || '',
        text: (target.textContent || '').substring(0, 100),
        testId: target.getAttribute('data-testid') || null,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      };

      // Send to parent via postMessage
      window.parent.postMessage({
        type: 'IFRAME_ELEMENT_SELECTED',
        component
      }, '*');
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick, true);

  // Notify parent that script is ready
  window.parent.postMessage({
    type: 'IFRAME_SCRIPT_READY'
  }, '*');

  console.log('[VisualEditor] Selection script injected + Mr. Blue buttons hidden');
})();
`;

export function injectSelectionScript(iframe: HTMLIFrameElement): void {
  try {
    // Wait for iframe to be fully loaded
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      console.warn('[VisualEditor] Cannot access iframe document - may be cross-origin');
      return;
    }

    // Check if already injected
    if (iframeDoc.querySelector('[data-visual-editor-script="true"]')) {
      console.log('[VisualEditor] Script already injected');
      return;
    }

    // Wait for DOM to be ready
    const injectWhenReady = () => {
      const script = iframeDoc.createElement('script');
      script.textContent = IFRAME_SELECTION_SCRIPT;
      script.setAttribute('data-visual-editor-script', 'true');
      
      // Inject into iframe head or body
      const target = iframeDoc.head || iframeDoc.body || iframeDoc.documentElement;
      if (target) {
        target.appendChild(script);
        console.log('[VisualEditor] Script injected successfully');
      }
    };

    // Inject immediately if DOM is ready, otherwise wait
    if (iframeDoc.readyState === 'complete' || iframeDoc.readyState === 'interactive') {
      injectWhenReady();
    } else {
      iframeDoc.addEventListener('DOMContentLoaded', injectWhenReady);
    }
  } catch (error) {
    console.error('[VisualEditor] Failed to inject script:', error);
  }
}
