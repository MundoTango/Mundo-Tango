import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Users } from "lucide-react";

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
                data-testid={`plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-xs px-3 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I switch plans?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and Apple Pay for your convenience.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! Pro and Teacher plans include a 14-day free trial. No credit card required to start.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Absolutely. Cancel anytime with one click. You'll retain access until the end of your billing period.
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Need a custom plan?</h3>
            <p className="text-muted-foreground mb-4">
              Contact us for enterprise pricing and custom solutions for large organizations.
            </p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
