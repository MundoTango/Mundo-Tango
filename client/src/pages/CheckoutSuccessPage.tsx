import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      console.log('[Checkout] Success! Session ID:', sessionId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <CheckCircle2 className="h-20 w-20 text-white mx-auto mb-6" data-testid="icon-success" />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-success-title">
              Order Successful!
            </h1>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
              Thank you for your purchase
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="bg-card p-6 rounded-lg mb-8 border border-border">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Package className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold font-serif text-lg">Order Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-muted-foreground mb-1">Order Number</p>
                    <p className="font-mono">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-muted-foreground mb-1">Order Date</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg mb-8 border border-primary/20">
                <h4 className="font-semibold font-serif mb-3">What's Next?</h4>
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

              <div className="mt-8 pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Questions about your order? Contact us at{" "}
                  <a href="mailto:orders@mundotango.com" className="text-primary hover:underline">
                    orders@mundotango.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
