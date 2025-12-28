import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MrBlueChat } from "./MrBlueChat";
import { CTOWalkthroughPreview } from "./CTOWalkthroughPreview";
import { useAuth } from "@/contexts/AuthContext";
import { useMrBlue } from "@/contexts/MrBlueContext";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const HIDDEN_PAGES = [
  '/mr-blue-chat', 
  '/admin/visual-editor',
  // Onboarding pages - hide Mr Blue for focused onboarding experience
  '/onboarding',
  // Marketing pages - hide Mr Blue for clean marketing experience
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
];

export function MrBlueFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { isWalkthroughOpen, closeWalkthrough, isChatOpen } = useMrBlue();
  const [location] = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sync local state with context state (for auto-open on CTO login)
  useEffect(() => {
    if (isChatOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [isChatOpen]);

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
      {/* CTO Walkthrough Preview Modal */}
      <CTOWalkthroughPreview 
        isOpen={isWalkthroughOpen} 
        onClose={closeWalkthrough}
      />
      
      {/* Floating Button - Uses portal for z-index isolation */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999]" data-testid="global-mr-blue">
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all gap-2"
            onClick={() => setIsOpen(true)}
            data-testid="button-ask-mr-blue"
          >
            <MessageCircle className="h-5 w-5" />
            Ask Mr. Blue
          </Button>
        </div>
      )}

      {/* Chat Panel - Full-screen slide-in with all features */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[480px] lg:w-[560px] z-[9999] bg-background border-l shadow-2xl flex flex-col"
            data-testid="chat-side-panel"
          >
            {/* Chat Interface with integrated header */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <MrBlueChat onClose={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Render via portal at document.body level for z-index isolation
  return createPortal(content, document.body);
}
