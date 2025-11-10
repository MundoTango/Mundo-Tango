import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface PricingTier {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  isPopular: boolean;
  stripeMonthlyPriceId: string;
  stripeAnnualPriceId: string;
}

interface CurrentSubscription {
  subscription: {
    id: number;
    planId: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  tier: {
    displayName: string;
    name: string;
  };
}

export default function SubscriptionsPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const { toast } = useToast();

  const { data: tiers, isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/subscriptions/tiers"],
  });

  const { data: currentSubscription } = useQuery<CurrentSubscription | null>({
    queryKey: ["/api/subscriptions/me"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const now = new Date();
      const periodEnd = new Date(
        billingInterval === "monthly"
          ? now.setMonth(now.getMonth() + 1)
          : now.setFullYear(now.getFullYear() + 1)
      );

      return await apiRequest("POST", "/api/subscriptions", {
        body: JSON.stringify({
          planId,
          billingInterval,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
      toast({
        title: "Subscription activated!",
        description: "Your subscription has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "free":
        return <Sparkles className="h-6 w-6" />;
      case "premium":
        return <Zap className="h-6 w-6" />;
      case "professional":
        return <Crown className="h-6 w-6" />;
      default:
        return <Sparkles className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (tierName: string) => {
    return currentSubscription?.tier?.name === tierName;
  };

  const handleSubscribe = (planId: string) => {
    subscribeMutation.mutate({ planId });
  };

  return (
    <SelfHealingErrorBoundary pageName="Subscriptions" fallbackRoute="/feed">
      <PageLayout title="Choose Your Plan" showBreadcrumbs>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Hero Section */}
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Unlock Your Tango Journey
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan to connect with dancers, discover events, and grow your tango community
              </p>

              {/* Current Subscription Badge */}
              {currentSubscription && (
                <div className="flex justify-center mt-6">
                  <Badge variant="secondary" className="text-sm px-4 py-2" data-testid="badge-current-plan">
                    Current Plan: {currentSubscription.tier.displayName}
                  </Badge>
                </div>
              )}
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as "monthly" | "annual")} className="w-auto">
                <TabsList className="backdrop-blur-sm bg-card/50 border border-border" data-testid="tabs-billing">
                  <TabsTrigger value="monthly" data-testid="tab-monthly">
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="annual" data-testid="tab-annual">
                    Annual
                    <Badge variant="default" className="ml-2 text-xs">
                      Save 20%
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Pricing Cards */}
            {tiersLoading ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="backdrop-blur-md bg-card/50 border-border">
                    <CardHeader>
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-24 mb-6" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-6 w-full" />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : tiers && tiers.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tiers.map((tier) => {
                  const price = billingInterval === "monthly" ? tier.monthlyPrice : tier.annualPrice;
                  const isCurrent = isCurrentPlan(tier.name);

                  return (
                    <Card
                      key={tier.id}
                      className={`relative backdrop-blur-lg border-2 transition-all duration-300 hover-elevate ${
                        tier.isPopular
                          ? "border-primary bg-gradient-to-br from-primary/5 via-card/90 to-secondary/5 shadow-lg"
                          : "border-border bg-card/80"
                      } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      data-testid={`card-tier-${tier.name}`}
                    >
                      {tier.isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1" data-testid={`badge-popular-${tier.name}`}>
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                            {getTierIcon(tier.name)}
                          </div>
                          {isCurrent && (
                            <Badge variant="outline" className="border-primary text-primary" data-testid={`badge-active-${tier.name}`}>
                              Active
                            </Badge>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-2" data-testid={`text-tier-name-${tier.name}`}>
                            {tier.displayName}
                          </CardTitle>
                          <CardDescription className="text-sm" data-testid={`text-tier-description-${tier.name}`}>
                            {tier.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid={`text-price-${tier.name}`}>
                            ${price}
                          </span>
                          <span className="text-muted-foreground">
                            /{billingInterval === "monthly" ? "month" : "year"}
                          </span>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                          {tier.features && tier.features.length > 0 ? (
                            tier.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-3" data-testid={`feature-${tier.name}-${index}`}>
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No features listed</p>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="flex flex-col gap-3">
                        {isCurrent ? (
                          <>
                            <Button
                              variant="outline"
                              className="w-full border-primary text-primary"
                              disabled
                              data-testid={`button-current-${tier.name}`}
                            >
                              Current Plan
                            </Button>
                            <Link href="/subscriptions/manage" className="w-full">
                              <Button variant="ghost" className="w-full" size="sm" data-testid={`button-manage-${tier.name}`}>
                                Manage Subscription
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <Button
                            className={`w-full ${
                              tier.isPopular
                                ? "bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                                : ""
                            }`}
                            variant={tier.isPopular ? "default" : "outline"}
                            onClick={() => handleSubscribe(tier.name)}
                            disabled={subscribeMutation.isPending}
                            data-testid={`button-subscribe-${tier.name}`}
                          >
                            {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="backdrop-blur-md bg-card/50 border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pricing tiers available at the moment.</p>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            <div className="mt-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <Card className="backdrop-blur-md bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Can I change plans later?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Absolutely! You can cancel your subscription at any time from the Manage Subscription page. Your access will continue until the end of your current billing period.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
