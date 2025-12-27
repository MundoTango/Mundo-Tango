import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

export function TalentMatchModal({ open, onOpenChange }: TalentMatchModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Construct embed URL with user info if authenticated
  const embedUrl = new URL("/talent-match-embed", window.location.origin);
  if (user) {
    embedUrl.searchParams.set("name", user.name || "");
    embedUrl.searchParams.set("email", user.email || "");
    embedUrl.searchParams.set("mode", "authenticated");
  }

  // Preload the embed page for faster modal opening
  useEffect(() => {
    if (isPreloaded) return;
    
    // Preload after a short delay to not block initial page render
    preloadTimeoutRef.current = setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/talent-match-embed';
      link.as = 'document';
      document.head.appendChild(link);
      setIsPreloaded(true);
    }, 2000);
    
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [isPreloaded]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden" data-testid="modal-talent-match">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Talent Match - Volunteer Application
          </DialogTitle>
          <DialogDescription className="sr-only">
            Complete the talent match process to apply as a volunteer
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-[calc(95vh-60px)] relative">
          {open && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading Talent Match...</p>
                </div>
              )}
              <iframe
                src={embedUrl.toString()}
                className="w-full h-full border-0"
                title="Talent Match Application"
                data-testid="iframe-talent-match"
                onLoad={() => setIsLoading(false)}
                loading="eager"
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
