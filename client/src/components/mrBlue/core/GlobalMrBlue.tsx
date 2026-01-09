import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMrBlue } from '@/contexts/MrBlueContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Pages where Mr. Blue button should be hidden
 */
const HIDDEN_PAGES = ['/mr-blue-chat', '/admin/visual-editor'];

/**
 * Marketing site pages where simple FAQ bot should appear
 */
const MARKETING_PAGES = ['/', '/landing', '/about', '/pricing', '/features', '/contact', '/login', '/register', '/forgot-password'];

/**
 * GlobalMrBlue - Simple FAQ button for marketing site guests
 * 
 * RBAC Strategy:
 * - Guest (non-authenticated): Shows simple FAQ bot for marketing questions only
 * - Authenticated: Hidden (MrBlueFloatingButton takes over with full features)
 * 
 * Features:
 * - Fixed bottom-right positioning with z-[10001] (above all overlays including modals)
 * - Uses React Portal to render at document.body level
 * - Opens ChatSidePanel on click (marketing FAQ mode)
 * - Hidden on dedicated chat page and for authenticated users
 */
export function GlobalMrBlue() {
  const [location] = useLocation();
  const { openChat, isChatOpen } = useMrBlue();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on pages where button isn't needed
  const shouldHide = HIDDEN_PAGES.some(page => location.startsWith(page));
  
  // Also hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  // Check if on a marketing page
  const isMarketingPage = MARKETING_PAGES.some(page => 
    location === page || location.startsWith(page + '/')
  );
  
  // RBAC: Hide for authenticated users (MrBlueFloatingButton handles them)
  // Only show on marketing pages for guests
  if (user || shouldHide || hideControls || isChatOpen || !mounted) {
    return null;
  }
  
  // For non-marketing pages without auth, also hide
  if (!isMarketingPage) {
    return null;
  }

  const buttonContent = (
    <div 
      className="fixed bottom-6 right-6 z-[10001]"
      data-testid="global-mr-blue"
    >
      <Button
        size="lg"
        variant="secondary"
        onClick={() => {
          console.log('[GlobalMrBlue] Marketing FAQ button clicked, opening chat...');
          openChat();
        }}
        className="shadow-lg hover:shadow-xl transition-all gap-2"
        data-testid="button-ask-mr-blue"
      >
        <HelpCircle className="h-5 w-5" />
        Questions?
      </Button>
    </div>
  );

  return createPortal(buttonContent, document.body);
}
