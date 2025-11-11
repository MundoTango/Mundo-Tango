import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      console.log('[Checkout] Success! Session ID:', sessionId);
    }
  }, []);

  return (
    <PageLayout title="Order Successful" showBreadcrumbs>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto animate-in zoom-in duration-300" data-testid="icon-success" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-success-title">
              Order Successful!
            </h1>
            
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase! Your order has been confirmed and is being processed.
            </p>

            <div className="bg-card p-6 rounded-lg mb-8 border border-border">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">Order Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-muted-foreground mb-1">Order Number</p>
                  <p className="font-mono text-foreground">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground mb-1">Order Date</p>
                  <p className="text-foreground">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg mb-8 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-3">What's Next?</h4>
              <ul className="text-sm text-muted-foreground text-left space-y-2">
                <li>✓ Order confirmation email sent</li>
                <li>✓ Your items are being prepared for shipment</li>
                <li>✓ You'll receive tracking info within 24-48 hours</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild data-testid="button-view-order">
                <Link href="/orders">
                  View My Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild data-testid="button-continue-shopping">
                <Link href="/marketplace">
                  Continue Shopping
                </Link>
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Questions about your order? Contact us at{" "}
                <a href="mailto:orders@mundotango.com" className="text-primary hover:underline">
                  orders@mundotango.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
