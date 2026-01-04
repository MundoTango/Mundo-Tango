import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MrBlueChat } from "./MrBlueChat";
import { CTOWalkthroughPreview } from "./CTOWalkthroughPreview";
import { useAuth } from "@/contexts/AuthContext";
import { useMrBlue } from "@/contexts/MrBlueContext";
import { useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";

const HIDDEN_PAGES = [
  '/mr-blue-chat', 
  '/admin/visual-editor',
  '/onboarding',
  '/landing',
  '/lander',
  '/about',
  '/pricing',
  '/features',
  '/careers',
  '/contact',
  '/press',
  '/blog',
  '/help',
  '/terms',
  '/privacy',
  '/ambassador',
  '/volunteer',
  '/donate',
  '/partners',
  '/tango-roles',
  '/p/',
  '/scott',
];

// MB.MD Pattern 63: Singleton instance ID to prevent duplicates
let globalMrBlueInstance: string | null = null;

export function MrBlueFloatingButton() {
  const [mounted, setMounted] = useState(false);
  const instanceId = useRef<string>(crypto.randomUUID());
  const { user } = useAuth();
  const { isWalkthroughOpen, closeWalkthrough, isChatOpen, openChat, closeChat } = useMrBlue();
  const [location] = useLocation();
  const lastToggleTime = useRef<number>(0);

  // MB.MD Pattern 63: Singleton enforcement - prevent duplicate FABs
  useEffect(() => {
    if (globalMrBlueInstance && globalMrBlueInstance !== instanceId.current) {
      console.warn('[MrBlue] Duplicate FAB instance blocked:', instanceId.current);
      return;
    }
    globalMrBlueInstance = instanceId.current;
    setMounted(true);
    
    return () => {
      if (globalMrBlueInstance === instanceId.current) {
        globalMrBlueInstance = null;
      }
    };
  }, []);
  
  // Debounced toggle to prevent rapid clicks causing issues
  const handleToggle = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTime.current < 200) return; // Debounce 200ms
    lastToggleTime.current = now;
    
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isChatOpen, openChat, closeChat]);

  // Hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  // Hide on dedicated chat pages
  const shouldHide = HIDDEN_PAGES.some(page => location.startsWith(page));
  
  if (hideControls || shouldHide || !mounted) {
    return null;
  }
  
  // RBAC: Only show Mr Blue to authenticated users
  if (!user) {
    return null;
  }

  const content = (
    <>
      {/* CTO Walkthrough disabled - Pattern 99 Multi-Agent Audit is active */}
      {/* <CTOWalkthroughPreview 
        isOpen={isWalkthroughOpen} 
        onClose={closeWalkthrough}
      /> */}
      
      {/* Floating Button - Uses portal for z-index isolation */}
      {/* MB.MD Pattern 63: Only render FAB when chat is closed */}
      {!isChatOpen && (
        <div 
          className="fixed bottom-6 right-6 z-[9999]" 
          data-testid="global-mr-blue"
          data-mr-blue-fab="true"
          data-instance={instanceId.current}
        >
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all gap-2"
            onClick={handleToggle}
            data-testid="button-ask-mr-blue"
          >
            <MessageCircle className="h-5 w-5" />
            Ask Mr. Blue
          </Button>
        </div>
      )}

      {/* Chat Panel - MB.MD Pattern 66: Full-screen on mobile, side panel on desktop */}
      <AnimatePresence mode="wait">
        {isChatOpen && (
          <div 
            key="mr-blue-chat-panel"
            className="fixed right-0 top-0 h-screen w-full sm:w-[420px] md:w-[480px] lg:w-[560px] z-[9999] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            data-testid="chat-side-panel"
            data-mr-blue-chat="true"
          >
            {/* Chat Interface with integrated header */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <MrBlueChat onClose={closeChat} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // MB.MD Pattern 63: Render via portal at document.body level for z-index isolation
  return createPortal(content, document.body);
}
