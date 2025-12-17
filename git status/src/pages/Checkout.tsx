import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle2, ArrowLeft, Lock, Shield, CreditCard } from "lucide-react";
import { Link } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

function CheckoutForm({ plan, onSuccess }: { plan: Plan; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing?success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated!",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? 'Processing...' : `Subscribe to ${plan.name} - $${plan.price}/${plan.interval}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By confirming your subscription, you allow Mundo Tango to charge your card for this payment 
        and future payments in accordance with their terms.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:planId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const planId = params?.planId || '';
  const [clientSecret, setClientSecret] = useState<string>('');

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/billing/plans'],
  });

  const plans: Plan[] = plansData?.plans || [];
  const selectedPlan = plans.find((p: Plan) => p.id === planId);

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/billing/create-subscription', { 
        planId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data.tier === 'free') {
        toast({
          title: "Plan Updated",
          description: "You've been switched to the Free plan.",
        });
        setLocation('/settings/billing');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedPlan && selectedPlan.price > 0) {
      createSubscriptionMutation.mutate();
    } else if (selectedPlan && selectedPlan.price === 0) {
      createSubscriptionMutation.mutate();
    }
  }, [selectedPlan]);

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-checkout">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="plan-not-found">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The plan you're looking for doesn't exist
            </p>
            <Link href="/settings/billing">
              <Button>View All Plans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedPlan.price === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="free-plan-redirect">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Switched to Free Plan</h2>
            <p className="text-muted-foreground mb-4">
              You're now on the Free plan
            </p>
            <Link href="/settings/billing">
              <Button>Go to Billing Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-payment">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Preparing your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings/billing">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-checkout">
                Complete Your Subscription
              </h1>
              <p className="text-muted-foreground">
                Subscribe to {selectedPlan.name} to unlock premium features
              </p>
            </div>

            <Card data-testid="card-plan-summary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPlan.name} Plan</span>
                  <Badge variant="secondary" className="text-lg">
                    ${selectedPlan.price}/{selectedPlan.interval}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Billed {selectedPlan.interval}ly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">What's included:</h3>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${selectedPlan.price}/{selectedPlan.interval}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="hover-elevate">
                <CardContent className="flex items-center gap-3 p-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="flex items-center gap-3 p-4">
                  <CreditCard className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Cancel Anytime</p>
                    <p className="text-xs text-muted-foreground">No long-term commitment</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details to complete your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <CheckoutForm 
                    plan={selectedPlan} 
                    onSuccess={() => {
                      setLocation('/settings/billing?success=true');
                    }}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
