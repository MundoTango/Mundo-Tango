import { useEffect } from 'react';

/**
 * Click tracking hook for audio conversation context
 * Tracks user clicks during active audio session to enable
 * "this button", "that element" references in voice commands
 */
export function useClickTracking(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip if clicking on the audio button itself
      if (target.closest('[data-audio-conversation]')) return;

      // Extract element information
      const clickEvent = {
        elementType: target.tagName,
        elementText: target.innerText?.substring(0, 100) || target.textContent?.substring(0, 100) || '',
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        position: {
          x: event.clientX,
          y: event.clientY
        }
      };

      // Send to backend
      fetch('/api/mrblue/audio/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clickEvent
        })
      }).catch(error => {
        console.error('[ClickTracking] Error:', error);
      });

      console.log('[ClickTracking] Tracked click:', clickEvent);
    };

    // Add global click listener
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [sessionId]);
}
