import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Zap, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  currentTier: string;
  currentQuota?: number;
  quotaLimit?: number;
  recommendedTier?: {
    id: number;
    name: string;
    displayName: string;
    monthlyPrice: number;
    annualPrice?: number | null;
    features: string[];
  };
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureName,
  currentTier,
  currentQuota,
  quotaLimit,
  recommendedTier,
}: UpgradeModalProps) {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [promoCode, setPromoCode] = useState('');

  const trackEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/pricing/track-upgrade-event', data);
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: { tierId: number; billingInterval: string; promoCode?: string }) => {
      const res = await apiRequest('POST', '/api/pricing/checkout-session', data);
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    },
  });

  const handleUpgrade = () => {
    if (!recommendedTier) return;

    trackEventMutation.mutate({
      eventType: 'upgrade_clicked',
      featureName,
      currentTier,
      targetTier: recommendedTier.name,
      currentQuota,
      quotaLimit,
      metadata: { billingInterval, promoCode },
    });

    checkoutMutation.mutate({
      tierId: recommendedTier.id,
      billingInterval,
      promoCode: promoCode || undefined,
    });
  };

  const handleClose = () => {
    trackEventMutation.mutate({
      eventType: 'upgrade_dismissed',
      featureName,
      currentTier,
      targetTier: recommendedTier?.name,
      currentQuota,
      quotaLimit,
    });
    onOpenChange(false);
  };

  if (!recommendedTier) return null;

  const price = billingInterval === 'annual' && recommendedTier.annualPrice
    ? recommendedTier.annualPrice
    : recommendedTier.monthlyPrice;

  const monthlyEquivalent = billingInterval === 'annual' && recommendedTier.annualPrice
    ? (recommendedTier.annualPrice / 12).toFixed(2)
    : price.toFixed(2);

  const savings = billingInterval === 'annual' && recommendedTier.annualPrice
    ? parseInt(((recommendedTier.monthlyPrice * 12 - recommendedTier.annualPrice) / (recommendedTier.monthlyPrice * 12) * 100).toFixed(0))
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl" data-testid="dialog-upgrade-modal">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" data-testid="icon-upgrade" />
            </div>
            <Badge variant="outline" data-testid="badge-limit-reached">
              {featureName ? 'Feature Limit Reached' : 'Upgrade Available'}
            </Badge>
          </div>
          <DialogTitle className="text-2xl" data-testid="text-upgrade-title">
            Unlock More with {recommendedTier.displayName}
          </DialogTitle>
          <DialogDescription data-testid="text-upgrade-description">
            {featureName
              ? `You've reached your ${currentTier} tier limit for ${featureName}${quotaLimit ? ` (${currentQuota}/${quotaLimit})` : ''}. Upgrade to continue.`
              : `Upgrade to ${recommendedTier.displayName} for unlimited access and premium features.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold" data-testid="text-billing-label">Billing Interval</h4>
              {billingInterval === 'annual' && savings > 0 && (
                <Badge variant="default" className="bg-primary" data-testid="badge-savings">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Save {savings}%
                </Badge>
              )}
            </div>
            <RadioGroup value={billingInterval} onValueChange={(v) => setBillingInterval(v as any)} data-testid="input-billing-interval">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover-elevate" data-testid="option-monthly">
                <RadioGroupItem value="monthly" id="monthly" data-testid="radio-monthly" />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <div className="font-medium">Monthly</div>
                  <div className="text-sm text-muted-foreground">${recommendedTier.monthlyPrice}/month</div>
                </Label>
              </div>
              {recommendedTier.annualPrice && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover-elevate" data-testid="option-annual">
                  <RadioGroupItem value="annual" id="annual" data-testid="radio-annual" />
                  <Label htmlFor="annual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Annual</div>
                    <div className="text-sm text-muted-foreground">
                      ${monthlyEquivalent}/month (billed ${recommendedTier.annualPrice}/year)
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold" data-testid="text-features-label">What you'll get:</h4>
            <ul className="space-y-2">
              {recommendedTier.features.slice(0, 5).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" data-testid={`feature-item-${i}`}>
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo" className="text-sm" data-testid="label-promo-code">
              Promo Code (Optional)
            </Label>
            <Input
              id="promo"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              data-testid="input-promo-code"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={checkoutMutation.isPending}
            className="gap-2"
            data-testid="button-upgrade"
          >
            {checkoutMutation.isPending ? (
              'Creating checkout...'
            ) : (
              <>
                Upgrade to {recommendedTier.displayName}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
