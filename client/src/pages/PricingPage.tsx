import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Users, DollarSign, Loader2, Star, Globe, Building2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface PricingTier {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  isVisible: boolean;
  roleLevel: number | null;
}

const getIconForTier = (name: string) => {
  const iconMap: Record<string, typeof Users> = {
    'free': Users,
    'explorer_plus': Zap,
    'pro': Star,
    'community_leader': Crown,
    'super_community_leader': Crown,
    'enterprise': Building2,
    'regional_organizer': Globe,
    'national_organizer': Globe,
    'international_organizer': Globe,
    'platform_partner': Building2,
  };
  return iconMap[name] || Users;
};

const formatPrice = (priceInCents: number): string => {
  if (priceInCents === 0) return "Free";
  const dollars = priceInCents / 100;
  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}`;
};

const getPopularTier = (tiers: PricingTier[]): string => {
  const proTier = tiers.find(t => t.name === 'pro');
  return proTier?.name || '';
};

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: tiersData, isLoading: tiersLoading } = useQuery<{ tiers: PricingTier[] }>({
    queryKey: ['/api/pricing/tiers'],
  });

  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const isAuthenticated = !!userData?.user;
  const tiers = tiersData?.tiers?.filter(t => t.isVisible) || [];
  const displayTiers = tiers.slice(0, 4);
  const popularTierName = getPopularTier(tiers);

  const checkoutMutation = useMutation({
    mutationFn: async (tierName: string) => {
      const response = await apiRequest('POST', '/api/billing/create-subscription', { planId: tierName });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        toast({
          title: "Redirecting to payment...",
          description: "Please complete your payment to activate your subscription.",
        });
        setLocation('/subscribe/payment?planId=' + loadingPlan);
      } else if (data.success) {
        toast({
          title: "Plan activated!",
          description: "Your plan has been activated.",
        });
        setLocation('/feed');
      }
      setLoadingPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to start subscription. Please try again.",
        variant: "destructive",
      });
      setLoadingPlan(null);
    },
  });

  const handlePlanSelect = async (tier: PricingTier) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to subscribe.",
      });
      setLocation('/auth?redirect=/pricing&plan=' + tier.name);
      return;
    }

    if (tier.monthlyPrice === 0) {
      setLocation('/signup?trial=true');
      return;
    }

    setLoadingPlan(tier.name);
    checkoutMutation.mutate(tier.name);
  };

  return (
    <SelfHealingErrorBoundary pageName="Pricing" fallbackRoute="/">
    <PageLayout title="Simple, Transparent Pricing" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Pricing - Mundo Tango"
        description="Choose the perfect plan for your tango journey. Free for casual dancers, Pro for dedicated enthusiasts, and organizer plans for event hosts."
      />
      
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
              <DollarSign className="w-3 h-3 mr-1.5" />
              Transparent Pricing
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Choose Your Plan
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Start for free, upgrade as you grow. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16" data-testid="pricing-plans-grid">
            {tiersLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx} className="h-full">
                  <CardHeader className="text-center pb-8">
                    <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-6" />
                    <Skeleton className="h-8 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-48 mx-auto mb-6" />
                    <Skeleton className="h-12 w-24 mx-auto" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : displayTiers.length > 0 ? (
              displayTiers.map((tier, index) => {
                const IconComponent = getIconForTier(tier.name);
                const isPopular = tier.name === popularTierName;
                const isFree = tier.monthlyPrice === 0;
                
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative h-full ${isPopular ? "border-primary shadow-2xl" : ""}`}
                      data-testid={`card-plan-${tier.name}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="text-xs px-4 py-1.5" data-testid={`badge-popular-${tier.name}`}>Most Popular</Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-8">
                        <div className="flex justify-center mb-6">
                          <div className="p-4 rounded-2xl bg-primary/10">
                            <IconComponent className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-3xl font-serif font-bold mb-2" data-testid={`text-plan-name-${tier.name}`}>
                          {tier.displayName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mb-6" data-testid={`text-plan-description-${tier.name}`}>
                          {tier.description || "Perfect for your tango journey"}
                        </p>
                        <div className="mb-4" data-testid={`text-price-${tier.name}`}>
                          <span className="text-5xl font-serif font-bold" data-testid={`text-price-amount-${tier.name}`}>
                            {formatPrice(tier.monthlyPrice)}
                          </span>
                          {!isFree && (
                            <span className="text-muted-foreground text-lg" data-testid={`text-price-period-${tier.name}`}>/month</span>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <ul className="space-y-4" data-testid={`list-features-${tier.name}`}>
                          {isFree ? (
                            <>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Browse events & community</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Basic profile</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Join public groups</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Everything in Free</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Advanced features</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Priority support</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm leading-relaxed">Ad-free experience</span>
                              </li>
                            </>
                          )}
                        </ul>

                        <Button
                          className="w-full gap-2"
                          variant={isPopular ? "default" : "outline"}
                          data-testid={`button-cta-${tier.name}`}
                          onClick={() => handlePlanSelect(tier)}
                          disabled={loadingPlan !== null}
                        >
                          {loadingPlan === tier.name ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isFree ? (
                            "Get Started Free"
                          ) : (
                            "Start Free Trial"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-muted-foreground">Loading pricing plans...</p>
              </div>
            )}
          </div>

          {tiers.length > 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-serif font-bold text-center mb-8">Enterprise & Organizer Plans</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tiers.slice(4).map((tier) => (
                  <Card key={tier.id} className="hover-elevate" data-testid={`card-enterprise-${tier.name}`}>
                    <CardHeader>
                      <CardTitle className="font-serif">{tier.displayName}</CardTitle>
                      <p className="text-muted-foreground text-sm">{tier.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">{formatPrice(tier.monthlyPrice)}<span className="text-lg text-muted-foreground">/mo</span></div>
                      <Button variant="outline" className="w-full" onClick={() => handlePlanSelect(tier)}>
                        Contact Sales
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {[
                {
                  q: "Can I switch plans?",
                  a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and Apple Pay for your convenience."
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! All paid plans start with a 7-day free trial with full features. No credit card required."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Absolutely. Cancel anytime with one click. You'll retain access until the end of your billing period."
                }
              ].map((faq, index) => (
                <Card key={index} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center">
                <h3 className="text-3xl font-serif font-bold mb-3">Questions?</h3>
                <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
                  Chat with Mr. Blue, our AI assistant, for instant answers about plans and features.
                </p>
                <a href="/mr-blue">
                  <Button variant="outline" size="lg">Chat with Mr. Blue</Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
