import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export default function PaymentIntegration() {
  const { planId } = useParams<{ planId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: [`/api/subscription/plans/${planId}`],
    enabled: !!planId,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/subscription/subscribe", {
        method: "POST",
        body: JSON.stringify({
          planId: parseInt(planId),
          billingCycle,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: async (data: any) => {
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (error) {
          toast({
            title: "Payment Error",
            description: error.message,
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleCheckout = () => {
    setIsProcessing(true);
    checkoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Plan Not Found</h1>
        <Button onClick={() => setLocation("/subscription")}>
          View Available Plans
        </Button>
      </div>
    );
  }

  const price = plan.price / 100;

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/subscription")}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                <Badge variant="secondary" className="mt-2">
                  {billingCycle === "monthly" ? "Monthly" : "Annual"} Billing
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium mb-2">Features Included:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(plan.features || []).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span data-testid="text-total">${price.toFixed(2)}</span>
                </div>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your payment information is secure and encrypted
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Complete your subscription with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                    data-testid="button-monthly"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "annual" ? "default" : "outline"}
                    onClick={() => setBillingCycle("annual")}
                    data-testid="button-annual"
                  >
                    Annual (Save 20%)
                  </Button>
                </div>
              </div>

              <Separator />

              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to Stripe to securely complete your payment
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Secure payment processing by Stripe</p>
                <p>• Cancel anytime from your account settings</p>
                <p>• 30-day money-back guarantee</p>
                <p>• Access starts immediately after payment</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isProcessing}
                data-testid="button-checkout"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
