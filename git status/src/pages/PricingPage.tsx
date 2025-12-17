import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Users, DollarSign } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Users,
    description: "Perfect for casual dancers",
    features: [
      "Basic profile",
      "Browse events",
      "Join up to 3 groups",
      "Message other users",
      "Access to public tutorials",
      "Community guidelines access"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    icon: Zap,
    description: "For dedicated dancers",
    features: [
      "Everything in Free",
      "Unlimited group memberships",
      "Advanced search filters",
      "Priority event notifications",
      "Access to premium tutorials",
      "Remove ads",
      "Custom profile themes",
      "Download music tracks"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Teacher",
    price: "$29.99",
    period: "month",
    icon: Crown,
    description: "For instructors and organizers",
    features: [
      "Everything in Pro",
      "Create unlimited events",
      "Promote classes & workshops",
      "Analytics dashboard",
      "Student management tools",
      "Custom booking page",
      "Revenue tracking",
      "Priority support",
      "Verified teacher badge"
    ],
    cta: "Start Teaching",
    popular: false
  }
];

export default function PricingPage() {
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
          <div className="grid gap-8 md:grid-cols-3 mb-16">
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
                    data-testid={`plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="text-xs px-4 py-1.5">Most Popular</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-2xl bg-primary/10">
                          <IconComponent className="h-10 w-10 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-serif font-bold mb-2">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-5xl font-serif font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-lg">/{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full gap-2"
                        variant={plan.popular ? "default" : "outline"}
                        data-testid={`button-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
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
                  a: "Yes! Pro and Teacher plans include a 14-day free trial. No credit card required to start."
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

          {/* Custom Plan CTA */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center">
                <h3 className="text-3xl font-serif font-bold mb-3">Need a custom plan?</h3>
                <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
                  Contact us for enterprise pricing and custom solutions for large organizations.
                </p>
                <Button variant="outline" size="lg">Contact Sales</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
