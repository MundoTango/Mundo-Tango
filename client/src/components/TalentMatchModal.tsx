import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Brain } from "lucide-react";

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

export function TalentMatchModal({ open, onOpenChange }: TalentMatchModalProps) {
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

        <div className="w-full h-[calc(95vh-60px)]">
          {open && (
            <iframe
              src="/talent-match-embed"
              className="w-full h-full border-0"
              title="Talent Match Application"
              data-testid="iframe-talent-match"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
