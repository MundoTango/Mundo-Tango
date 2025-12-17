import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const planIcons = {
  free: Star,
  pro: Zap,
  premium: Crown,
};

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.",
  },
  {
    question: "Is there a free trial?",
    answer: "The Free plan is always available. Pro and Premium plans can be tested for 14 days risk-free.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime. You'll retain access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for annual subscriptions.",
  },
  {
    question: "What happens when I reach my usage limits?",
    answer: "You'll receive notifications as you approach limits. You can upgrade anytime to increase limits.",
  },
];

export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscription/current"],
  });

  const monthlyPlans = plans?.filter((p: any) => p.billingCycle === "monthly") || [];
  const annualPlans = plans?.filter((p: any) => p.billingCycle === "annual") || [];
  const displayPlans = billingCycle === "monthly" ? monthlyPlans : annualPlans;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock premium features and take your tango journey to the next level
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <span className={cn(
              "px-4 py-2 font-medium transition-colors",
              billingCycle === "monthly" && "text-foreground"
            )}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === "annual"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
              data-testid="toggle-billing"
            />
            <span className={cn(
              "px-4 py-2 font-medium transition-colors",
              billingCycle === "annual" && "text-foreground"
            )}>
              Annual
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {displayPlans.map((plan: any) => {
            const Icon = planIcons[plan.name.toLowerCase() as keyof typeof planIcons] || Star;
            const isCurrentPlan = currentSubscription?.subscriptionTier === plan.name.toLowerCase();
            const features = plan.features || [];

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative",
                  plan.name.toLowerCase() === "pro" && "border-primary shadow-lg scale-105"
                )}
                data-testid={`plan-card-${plan.name.toLowerCase()}`}
              >
                {plan.name.toLowerCase() === "pro" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    {isCurrentPlan && (
                      <Badge variant="secondary">Current Plan</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="text-3xl font-bold text-foreground">
                      ${(plan.price / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Link href={`/payment/${plan.id}`} className="w-full">
                      <Button className="w-full" data-testid={`button-select-${plan.name.toLowerCase()}`}>
                        {plan.name === "Free" ? "Get Started" : "Upgrade Now"}
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4">Feature</th>
                      <th className="text-center py-4 px-4">Free</th>
                      <th className="text-center py-4 px-4">Pro</th>
                      <th className="text-center py-4 px-4">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-4 px-4">Event Access</td>
                      <td className="text-center py-4 px-4">Basic</td>
                      <td className="text-center py-4 px-4">Priority</td>
                      <td className="text-center py-4 px-4">VIP</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Messages per month</td>
                      <td className="text-center py-4 px-4">100</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Video calls</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-primary" /></td>
                      <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-primary" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">AI Partner Matching</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4">-</td>
                      <td className="text-center py-4 px-4"><Check className="h-5 w-5 mx-auto text-primary" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger data-testid={`faq-${index}`}>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
