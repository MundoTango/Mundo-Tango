import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Users, DollarSign, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const plans = [
  {
    name: "Free Trial",
    slug: "free-trial",
    planId: "free",
    price: "$0",
    period: "7 days",
    icon: Users,
    description: "Try Pro features free",
    features: [
      "Full Pro features for 7 days",
      "No credit card required",
      "Browse events & community",
      "AI assistant access",
      "Partner matching preview"
    ],
    cta: "Start Free Trial",
    popular: false,
    isFree: true
  },
  {
    name: "Basic",
    slug: "basic",
    planId: "basic",
    price: "$4.99",
    period: "month",
    icon: Users,
    description: "Essential tango tools",
    features: [
      "Basic profile & messaging",
      "Browse events",
      "Join groups",
      "Community access",
      "Limited AI queries"
    ],
    cta: "Get Started",
    popular: false,
    isFree: false
  },
  {
    name: "Dancer Pro",
    slug: "dancer-pro",
    planId: "pro",
    price: "$9.99",
    period: "month",
    icon: Zap,
    description: "For dedicated dancers",
    features: [
      "Everything in Basic",
      "Unlimited AI assistant",
      "Advanced partner matching",
      "Housing marketplace",
      "Priority notifications",
      "Ad-free experience",
      "Travel planning tools"
    ],
    cta: "Start Free Trial",
    popular: true,
    isFree: false
  },
  {
    name: "Professional",
    slug: "professional",
    planId: "premium",
    price: "$29.99",
    period: "month",
    icon: Crown,
    description: "For teachers & organizers",
    features: [
      "Everything in Dancer Pro",
      "Event creation & management",
      "Analytics dashboard",
      "Student management",
      "Verified badge",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: false,
    isFree: false
  }
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const isAuthenticated = !!userData?.user;

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('POST', '/api/billing/create-subscription', { planId });
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
          description: "Your free plan has been activated.",
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

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to subscribe.",
      });
      setLocation('/auth?redirect=/pricing&plan=' + plan.planId);
      return;
    }

    if (plan.isFree) {
      setLocation('/signup?trial=true');
      return;
    }

    setLoadingPlan(plan.planId);
    checkoutMutation.mutate(plan.planId);
  };

  return (
    <SelfHealingErrorBoundary pageName="Pricing" fallbackRoute="/">
    <PageLayout title="Simple, Transparent Pricing" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Pricing - Mundo Tango"
        description="Choose the perfect plan for your tango journey. Free for casual dancers, Pro for dedicated enthusiasts, and Teacher plans for instructors."
      />
      
      {/* Hero Section */}
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
          {/* Plans Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16" data-testid="pricing-plans-grid">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative h-full ${plan.popular ? "border-primary shadow-2xl" : ""}`}
                    data-testid={`card-plan-${plan.slug}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="text-xs px-4 py-1.5" data-testid={`badge-popular-${plan.slug}`}>Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-2xl bg-primary/10">
                          <IconComponent className="h-10 w-10 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-serif font-bold mb-2" data-testid={`text-plan-name-${plan.slug}`}>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-6" data-testid={`text-plan-description-${plan.slug}`}>{plan.description}</p>
                      <div className="mb-4" data-testid={`text-price-${plan.slug}`}>
                        <span className="text-5xl font-serif font-bold" data-testid={`text-price-amount-${plan.slug}`}>{plan.price}</span>
                        <span className="text-muted-foreground text-lg" data-testid={`text-price-period-${plan.slug}`}>/{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-4" data-testid={`list-features-${plan.slug}`}>
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3" data-testid={`feature-${plan.slug}-${idx}`}>
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full gap-2"
                        variant={plan.popular ? "default" : "outline"}
                        data-testid={`button-cta-${plan.slug}`}
                        onClick={() => handlePlanSelect(plan)}
                        disabled={loadingPlan !== null}
                      >
                        {loadingPlan === plan.planId ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          plan.cta
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
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
                  a: "Yes! All plans start with a 7-day free trial with full Pro features. No credit card required."
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

          {/* Questions CTA */}
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
