import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  contentType: 'post' | 'comment' | 'user';
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ open, onOpenChange, postId, contentType }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/reports', {
        contentType,
        contentId: postId,
        reason,
        details,
      });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });
      onOpenChange(false);
      setReason('');
      setDetails('');
    },
    onError: () => {
      toast({
        title: "Failed to submit report",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        variant: "destructive",
      });
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="modal-report">
        <DialogHeader>
          <DialogTitle>Report {contentType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Why are you reporting this?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-3 space-y-2">
              {REPORT_REASONS.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} data-testid={`radio-reason-${value}`} />
                  <Label htmlFor={value} className="font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about why you're reporting this..."
              className="mt-2"
              rows={4}
              data-testid="textarea-report-details"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-report"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reportMutation.isPending}
            data-testid="button-submit-report"
          >
            {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
