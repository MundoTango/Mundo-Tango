import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Check, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function PricingPage() {
  useEffect(() => {
    document.title = "Pricing - Mundo Tango";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose your Mundo Tango plan. Start with a free trial or upgrade to Basic for essential tango tools.');
    }
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pricingTiers = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Try all features free",
      features: [
        "Full access for 7 days",
        "No credit card required",
        "Event discovery",
        "Community access",
        "AI assistant access",
        "Messaging"
      ],
      cta: "Start Free Trial",
      popular: true,
      planId: "free"
    },
    {
      name: "Basic",
      price: "$4.99",
      period: "per month",
      description: "Essential tango tools",
      features: [
        "Profile & messaging",
        "Browse & RSVP to events",
        "Join groups",
        "Community access",
        "Basic AI queries",
        "Partner matching"
      ],
      cta: "Get Started",
      popular: false,
      planId: "basic"
    }
  ];

  const comingSoonFeatures = [
    "Unlimited AI assistant",
    "Advanced partner matching", 
    "Housing marketplace access",
    "Travel planning tools",
    "Event creation & management",
    "Analytics dashboard",
    "Teacher & organizer tools",
    "Verified badges"
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" data-testid="section-pricing-hero">
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              data-testid="heading-pricing"
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/90"
            >
              Start free and upgrade as your tango journey grows. No hidden fees.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24" data-testid="section-pricing-cards">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Pricing Cards - 2 column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card 
                    className={`h-full relative ${tier.popular ? 'border-primary border-2' : ''}`}
                    data-testid={`pricing-card-${tier.planId}`}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                        Recommended
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold" data-testid={`price-${tier.planId}`}>{tier.price}</span>
                        <span className="text-muted-foreground ml-2">/ {tier.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {tier.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={tier.planId === "free" ? "/register" : `/checkout/${tier.planId}`} className="w-full">
                        <Button 
                          className={`w-full ${tier.popular ? 'ocean-gradient text-white' : ''}`}
                          variant={tier.popular ? "default" : "outline"}
                          data-testid={`button-select-${tier.planId}`}
                        >
                          {tier.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Coming Soon Features */}
            <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
              <Card className="border-dashed border-2 bg-muted/30">
                <CardHeader className="text-center pb-2">
                  <Badge variant="outline" className="w-fit mx-auto mb-2">Coming Soon</Badge>
                  <CardTitle className="text-xl">More Features on the Way</CardTitle>
                  <CardDescription>Premium features we're building for the tango community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {comingSoonFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ CTA */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Have questions about our plans?</p>
              <Link href="/faq">
                <Button variant="outline" data-testid="button-view-faq">
                  View FAQ
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
