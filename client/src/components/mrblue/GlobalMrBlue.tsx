import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMrBlue } from '@/contexts/MrBlueContext';

/**
 * Pages where Mr. Blue button should be hidden
 */
const HIDDEN_PAGES = ['/mr-blue-chat', '/admin/visual-editor'];

/**
 * GlobalMrBlue - Simple button to open AI chat
 * 
 * Features:
 * - Fixed bottom-right positioning with z-[9999] (above all overlays)
 * - Uses React Portal to render at document.body level
 * - Opens ChatSidePanel on click
 * - Hidden on dedicated chat page
 */
export function GlobalMrBlue() {
  const [location] = useLocation();
  const { openChat, isChatOpen } = useMrBlue();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on pages where button isn't needed
  const shouldHide = HIDDEN_PAGES.some(page => location.startsWith(page));
  
  // Also hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  // Hide button when chat is open
  if (shouldHide || hideControls || isChatOpen || !mounted) {
    return null;
  }

  const buttonContent = (
    <div 
      className="fixed bottom-6 right-6 z-[9999]"
      data-testid="global-mr-blue"
    >
      <Button
        size="lg"
        onClick={() => {
          console.log('[GlobalMrBlue] Button clicked, opening chat...');
          openChat();
        }}
        className="shadow-lg hover:shadow-xl transition-all gap-2"
        data-testid="button-ask-mr-blue"
      >
        <MessageCircle className="h-5 w-5" />
        Ask Mr. Blue
      </Button>
    </div>
  );

  return createPortal(buttonContent, document.body);
}
