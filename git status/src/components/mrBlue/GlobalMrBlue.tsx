import { useEffect } from 'react';
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
 * - Fixed bottom-right positioning
 * - Opens ChatSidePanel on click
 * - Hidden on dedicated chat page
 */
export function GlobalMrBlue() {
  const [location] = useLocation();
  const { openChat } = useMrBlue();

  // Hide on pages where button isn't needed
  const shouldHide = HIDDEN_PAGES.some(page => location.startsWith(page));
  
  // Also hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  if (shouldHide || hideControls) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      data-testid="global-mr-blue"
    >
      <Button
        size="lg"
        onClick={openChat}
        className="shadow-lg hover:shadow-xl transition-all gap-2"
        data-testid="button-ask-mr-blue"
      >
        <MessageCircle className="h-5 w-5" />
        Ask Mr. Blue
      </Button>
    </div>
  );
}
