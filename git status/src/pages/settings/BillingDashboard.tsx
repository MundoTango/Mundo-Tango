import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  Crown, 
  Sparkles, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  ExternalLink 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  currentPeriodStart: number;
  cancelAtPeriodEnd: boolean;
  tier: string;
}

export default function BillingDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/billing/plans'],
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/billing/subscription'],
  });

  const currentTier = subscriptionData?.tier || 'free';
  const currentSubscription: Subscription | null = subscriptionData?.subscription;

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('POST', '/api/billing/update-subscription', { planId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (immediate: boolean) => {
      const response = await apiRequest('POST', '/api/billing/cancel-subscription', { immediate });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const customerPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/billing/customer-portal');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    if (currentTier === 'free') {
      setLocation(`/checkout/${planId}`);
    } else {
      updateSubscriptionMutation.mutate(planId);
    }
  };

  const handleManageBilling = () => {
    customerPortalMutation.mutate();
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="w-5 h-5" />;
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <TrendingUp className="w-5 h-5" />;
      case 'premium':
        return <Crown className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPlanBadgeVariant = (planId: string) => {
    if (planId === currentTier) return 'default';
    return 'outline';
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-billing">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const plans: Plan[] = plansData?.plans || [];

  return (
    <div className="min-h-screen bg-background p-6" data-testid="billing-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-billing">
                Billing & Subscription
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your subscription and billing information
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/settings/billing/history">
                <Button variant="outline" data-testid="button-payment-history">
                  Payment History
                </Button>
              </Link>
              <Link href="/settings/billing/payment-methods">
                <Button variant="outline" data-testid="button-payment-methods">
                  Payment Methods
                </Button>
              </Link>
            </div>
          </div>

          {/* Current Subscription Status */}
          {currentSubscription && (
            <Card data-testid="card-current-subscription">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getPlanIcon(currentTier)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</CardTitle>
                      <CardDescription>
                        {currentSubscription.cancelAtPeriodEnd ? (
                          <span className="text-destructive flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Cancels on {new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Renews on {new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleManageBilling}
                      disabled={customerPortalMutation.isPending}
                      data-testid="button-manage-billing"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage Billing
                    </Button>
                    {!currentSubscription.cancelAtPeriodEnd && currentTier !== 'free' && (
                      <Button 
                        variant="destructive" 
                        onClick={() => cancelSubscriptionMutation.mutate(false)}
                        disabled={cancelSubscriptionMutation.isPending}
                        data-testid="button-cancel-subscription"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-card rounded-lg border">
          <Label htmlFor="billing-period" className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
            Monthly
          </Label>
          <Switch
            id="billing-period"
            checked={billingPeriod === 'yearly'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
            data-testid="switch-billing-period"
          />
          <Label htmlFor="billing-period" className={billingPeriod === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </Label>
        </div>

        {/* Plan Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan: Plan) => {
            const isCurrentPlan = plan.id === currentTier;
            const displayPrice = billingPeriod === 'yearly' && plan.price > 0 
              ? (plan.price * 12 * 0.8).toFixed(2) 
              : plan.price;

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''} hover-elevate`}
                data-testid={`card-plan-${plan.id}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground" data-testid={`badge-current-${plan.id}`}>
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-2">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {getPlanIcon(plan.id)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-primary">
                      ${displayPrice}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      per {billingPeriod === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator />
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || updateSubscriptionMutation.isPending}
                    onClick={() => handleUpgrade(plan.id)}
                    data-testid={`button-select-${plan.id}`}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                All payments are processed securely through Stripe with industry-standard encryption
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Flexible Plans</CardTitle>
              <CardDescription>
                Upgrade, downgrade, or cancel anytime. No long-term commitments required
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Crown className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Premium Support</CardTitle>
              <CardDescription>
                Get priority support and early access to new features with paid plans
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
