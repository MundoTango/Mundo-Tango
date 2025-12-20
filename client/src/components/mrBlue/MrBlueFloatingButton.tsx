import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bot, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MrBlueChat } from "./MrBlueChat";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const HIDDEN_PAGES = [
  '/mr-blue-chat', 
  '/admin/visual-editor',
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
  const [location] = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

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
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Mr. Blue</h2>
                  <p className="text-xs text-muted-foreground">AI Assistant with Voice & VibeCoding</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Full MrBlueChat Component with all features */}
            <div className="flex-1 overflow-hidden">
              <MrBlueChat enableVoice={true} enableVibecoding={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Render via portal at document.body level for z-index isolation
  return createPortal(content, document.body);
}
