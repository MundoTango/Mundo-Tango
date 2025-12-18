import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const planId = searchParams.get('plan');

  useEffect(() => {
    if (planId) {
      setLocation(`/checkout/${planId}`);
    }
  }, [planId, setLocation]);

  if (planId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background" data-testid="checkout-redirect">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Redirecting to checkout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background" data-testid="checkout-no-plan">
      <Card className="max-w-md">
        <CardContent className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No Plan Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a plan from our pricing page
          </p>
          <Link href="/pricing">
            <Button data-testid="button-view-plans">View Plans</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
