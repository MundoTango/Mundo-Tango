import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Zap } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for social dancers",
    features: [
      { name: "Browse events and milongas", included: true },
      { name: "Basic profile", included: true },
      { name: "Connect with dancers", included: true },
      { name: "RSVP to events", included: true },
      { name: "Join groups", included: true },
      { name: "Priority event listings", included: false },
      { name: "Video lesson uploads", included: false },
      { name: "Advanced analytics", included: false },
      { name: "Custom branding", included: false }
    ]
  },
  {
    name: "Pro",
    price: "$12/mo",
    description: "For teachers and active dancers",
    featured: true,
    features: [
      { name: "All Free features", included: true },
      { name: "Priority event listings", included: true },
      { name: "Video lesson uploads", included: true },
      { name: "Advanced search filters", included: true },
      { name: "Booking calendar", included: true },
      { name: "Student management", included: true },
      { name: "Analytics dashboard", included: true },
      { name: "Custom branding", included: false },
      { name: "API access", included: false }
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizers and schools",
    features: [
      { name: "All Pro features", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "Dedicated support", included: true },
      { name: "White-label options", included: true },
      { name: "Multi-user accounts", included: true },
      { name: "Custom integrations", included: true },
      { name: "Priority feature requests", included: true },
      { name: "SLA guarantee", included: true }
    ]
  }
];

export default function FeaturesComparisonPage() {
  return (
    <SelfHealingErrorBoundary pageName="Features Comparison" fallbackRoute="/">
      <PageLayout title="Features Comparison" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Features Comparison - Choose Your Plan - Mundo Tango"
            description="Compare Mundo Tango plans and features. Find the perfect plan for dancers, teachers, and organizers. Free forever plan available with premium options."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop')`
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
                  <Zap className="w-3 h-3 mr-1.5" />
                  Plans & Features
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Choose Your Plan
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Free forever for dancers. Premium tools for professionals.
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-12">

              <div className="grid gap-8 lg:grid-cols-3">
                {plans.map((plan, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card 
                      className={`hover-elevate h-full ${plan.featured ? 'border-primary shadow-lg' : ''}`}
                      data-testid={`card-plan-${idx}`}
                    >
                      <CardHeader>
                        <div className="space-y-2">
                          {plan.featured && (
                            <Badge className="w-fit">Most Popular</Badge>
                          )}
                          <CardTitle className="text-3xl font-serif">{plan.name}</CardTitle>
                          <div>
                            <span className="text-4xl font-bold">{plan.price}</span>
                            {plan.price !== "Custom" && plan.price !== "$0" && (
                              <span className="text-muted-foreground text-sm">/month</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <ul className="space-y-3">
                          {plan.features.map((feature, featureIdx) => (
                            <li key={featureIdx} className="flex items-start gap-2 text-sm">
                              {feature.included ? (
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={plan.featured ? "default" : "outline"}
                          asChild
                          data-testid={`button-select-${idx}`}
                        >
                          <a href={plan.price === "Custom" ? "/contact" : "/register"}>
                            {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-note">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-2xl font-serif font-bold mb-3">Questions About Plans?</h3>
                    <p className="text-muted-foreground mb-6">
                      We're here to help you find the perfect plan for your needs
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <a 
                        href="/pricing"
                        className="text-primary hover:underline font-semibold"
                        data-testid="link-pricing"
                      >
                        View Full Pricing
                      </a>
                      <span className="text-muted-foreground">·</span>
                      <a 
                        href="/contact"
                        className="text-primary hover:underline font-semibold"
                        data-testid="link-contact"
                      >
                        Contact Sales
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
