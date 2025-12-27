import { lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const TalentMatchExperience = lazy(() => 
  import("@/components/TalentMatchExperience").then(m => ({ default: m.TalentMatchExperience }))
);

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading Talent Match...</p>
    </div>
  );
}

export function TalentMatchModal({ open, onOpenChange }: TalentMatchModalProps) {
  const { user } = useAuth();

  const handleClose = () => {
    onOpenChange(false);
  };

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

        <ScrollArea className="h-[calc(95vh-60px)]">
          <div className="p-4" data-testid="container-talent-match-content">
            {open && (
              <Suspense fallback={<LoadingFallback />}>
                <TalentMatchExperience
                  mode={user ? "authenticated" : "guest"}
                  initialName={user?.name || undefined}
                  initialEmail={user?.email || undefined}
                  onClose={handleClose}
                  showHero={false}
                  showBackLink={false}
                  embedMode={true}
                />
              </Suspense>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
