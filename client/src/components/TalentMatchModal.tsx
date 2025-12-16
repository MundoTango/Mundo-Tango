import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain } from "lucide-react";
import { useTalentMatchSession } from "@/contexts/TalentMatchSessionContext";
import { TalentMatchExperience } from "@/components/TalentMatchExperience";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

export function TalentMatchModal({ open, onOpenChange, initialName, initialEmail }: TalentMatchModalProps) {
  const { session, createSession } = useTalentMatchSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (open && !session && initialName && initialEmail) {
      createSession(initialName, initialEmail);
    }
    if (open) {
      setIsReady(true);
    }
  }, [open, session, initialName, initialEmail, createSession]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" data-testid="modal-talent-match">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Talent Match - Volunteer Application
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          {isReady && (
            <TalentMatchExperience
              mode="guest"
              initialName={initialName}
              initialEmail={initialEmail}
              onClose={handleClose}
              showHero={false}
              showBackLink={false}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
