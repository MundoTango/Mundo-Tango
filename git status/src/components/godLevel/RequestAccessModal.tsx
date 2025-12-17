import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface RequestAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestStatus?: {
    approved: boolean;
    pending: boolean;
    rejected: boolean;
    rejectionReason?: string;
  };
  onRequestSubmitted?: () => void;
}

export function RequestAccessModal({
  open,
  onOpenChange,
  requestStatus,
  onRequestSubmitted
}: RequestAccessModalProps) {
  const [reason, setReason] = useState('');
  const [commitment, setCommitment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (reason.length < 20) {
      toast({
        title: 'Error',
        description: 'Please provide a detailed reason (at least 20 characters)',
        variant: 'destructive'
      });
      return;
    }

    if (!commitment) {
      toast({
        title: 'Error',
        description: 'Please confirm your commitment to responsible usage',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/god-level/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      toast({
        title: 'Request Submitted',
        description: 'Your God Level access request has been submitted for review.'
      });

      onRequestSubmitted?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-request-god-level">
        <DialogHeader>
          <DialogTitle>Request God Level Access</DialogTitle>
          <DialogDescription>
            God Level provides access to premium AI features with a monthly quota
          </DialogDescription>
        </DialogHeader>

        {requestStatus?.approved && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Approved!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your God Level access has been approved and is now active.
              </p>
            </div>
          </div>
        )}

        {requestStatus?.pending && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Pending Approval
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your request is being reviewed by our team.
              </p>
            </div>
          </div>
        )}

        {requestStatus?.rejected && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">
                Request Not Approved
              </p>
              {requestStatus.rejectionReason && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {requestStatus.rejectionReason}
                </p>
              )}
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                You may submit a new request if circumstances have changed.
              </p>
            </div>
          </div>
        )}

        {!requestStatus?.approved && !requestStatus?.pending && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Request</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need God Level access and how you plan to use the premium features..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                className="resize-none"
                data-testid="input-request-reason"
              />
              <p className="text-sm text-muted-foreground">
                Minimum 20 characters ({reason.length}/20)
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Checkbox
                id="commitment"
                checked={commitment}
                onCheckedChange={(checked) => setCommitment(checked as boolean)}
                data-testid="checkbox-commitment"
              />
              <div className="flex-1">
                <Label
                  htmlFor="commitment"
                  className="font-normal cursor-pointer"
                >
                  I commit to using God Level features responsibly and understand
                  that my usage is subject to monthly quotas (5 videos and 5 voice
                  sessions per month).
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || reason.length < 20 || !commitment}
                data-testid="button-submit-request"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
