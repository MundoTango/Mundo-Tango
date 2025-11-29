import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Crown, ExternalLink, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function SubscriptionSubTab() {
  const { useSubscription } = useAuth();
  const { data: subscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleManageSubscription = async () => {
    setIsRedirecting(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/create-portal-session');
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Subscription Management",
          description: "Billing portal coming soon. Contact support for billing changes.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="subscription-subtab">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading subscription...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = subscription?.plan || 'free';
  const status = subscription?.status || 'active';
  const currentPeriodEnd = (subscription as any)?.current_period_end;

  return (
    <div className="space-y-6" data-testid="subscription-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Current Plan
              </Label>
              <p className="text-sm text-muted-foreground">
                {plan === 'free' && 'You are on the free plan'}
                {plan === 'pro' && 'You are subscribed to Pro'}
                {plan === 'enterprise' && 'You are on the Enterprise plan'}
              </p>
            </div>
            <Badge 
              variant={plan === 'free' ? 'secondary' : 'default'} 
              data-testid="badge-subscription-plan"
            >
              {plan}
            </Badge>
          </div>
          {status && status !== 'active' && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Your subscription status
                  </p>
                </div>
                <Badge variant="outline" data-testid="badge-subscription-status">
                  {status}
                </Badge>
              </div>
            </>
          )}
          {currentPeriodEnd && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Billing Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          )}
          <Separator />
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleManageSubscription}
            disabled={isRedirecting}
            data-testid="button-manage-subscription"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isRedirecting ? 'Opening...' : 'Manage Subscription'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
