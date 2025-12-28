/**
 * GDPR Analytics Consent Component - MB.MD Pattern 67
 * 
 * Shows consent dialog on first visit after login.
 * Stores preference in database and localStorage.
 * Enables/disables session tracking based on consent.
 */

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Eye, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { sessionCapture } from '@/lib/session-capture';
import { useToast } from '@/hooks/use-toast';

interface ConsentData {
  id: number;
  userId: number;
  consentGiven: boolean;
  consentTimestamp: string | null;
}

interface AnalyticsConsentProps {
  userId?: number;
  onConsentChange?: (consented: boolean) => void;
}

export function AnalyticsConsent({ userId, onConsentChange }: AnalyticsConsentProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  const { data: existingConsent, isLoading } = useQuery<ConsentData>({
    queryKey: ['/api/qa-platform/consent'],
    enabled: !!userId,
  });

  const consentMutation = useMutation({
    mutationFn: async (consentGiven: boolean) => {
      return apiRequest('/api/qa-platform/consent', {
        method: 'POST',
        body: JSON.stringify({ consentGiven }),
      });
    },
    onSuccess: (_, consentGiven) => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa-platform/consent'] });
      
      if (consentGiven) {
        sessionCapture.enableTracking();
        localStorage.setItem('analytics_consent', 'true');
      } else {
        sessionCapture.disableTracking();
        localStorage.setItem('analytics_consent', 'false');
      }
      
      onConsentChange?.(consentGiven);
      setShowDialog(false);
      
      toast({
        title: consentGiven ? 'Analytics enabled' : 'Analytics disabled',
        description: consentGiven 
          ? 'Session data will help us improve your experience.'
          : 'No session data will be collected.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save your preference. Please try again.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (!userId || isLoading) return;

    if (existingConsent) {
      if (existingConsent.consentGiven) {
        sessionCapture.enableTracking();
        localStorage.setItem('analytics_consent', 'true');
      }
      return;
    }

    const localConsent = localStorage.getItem('analytics_consent');
    if (localConsent === null) {
      const timer = setTimeout(() => setShowDialog(true), 2000);
      return () => clearTimeout(timer);
    } else if (localConsent === 'true') {
      sessionCapture.enableTracking();
    }
  }, [userId, existingConsent, isLoading]);

  const handleAccept = () => {
    consentMutation.mutate(true);
  };

  const handleDecline = () => {
    consentMutation.mutate(false);
  };

  if (!userId) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-analytics-consent">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Help Us Improve Your Experience
          </DialogTitle>
          <DialogDescription className="text-left">
            We'd like to collect anonymous usage data to improve Mundo Tango.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">What we collect:</p>
              <ul className="mt-1 text-muted-foreground space-y-1">
                <li>Pages you visit</li>
                <li>Buttons you click (not form values)</li>
                <li>Errors you encounter</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">What we DON'T collect:</p>
              <ul className="mt-1 text-muted-foreground space-y-1">
                <li>Passwords or sensitive data</li>
                <li>Form input values</li>
                <li>Private messages</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="consent" 
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              data-testid="checkbox-analytics-consent"
            />
            <Label htmlFor="consent" className="text-sm cursor-pointer">
              I agree to anonymous usage tracking
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            disabled={consentMutation.isPending}
            data-testid="button-decline-analytics"
          >
            No thanks
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!checked || consentMutation.isPending}
            data-testid="button-accept-analytics"
          >
            {consentMutation.isPending ? 'Saving...' : 'Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useAnalyticsConsent() {
  const isEnabled = () => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('analytics_consent') === 'true';
  };

  const revokeConsent = async () => {
    sessionCapture.disableTracking();
    localStorage.setItem('analytics_consent', 'false');
    await apiRequest('/api/qa-platform/consent', {
      method: 'POST',
      body: JSON.stringify({ consentGiven: false }),
    });
  };

  return { isEnabled, revokeConsent };
}

export default AnalyticsConsent;
