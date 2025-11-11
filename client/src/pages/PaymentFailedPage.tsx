import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, ChevronRight, AlertTriangle, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function PaymentFailedPage() {
  return (
    <SelfHealingErrorBoundary pageName="Payment Failed" fallbackRoute="/pricing">
      <>
        <SEO
          title="Payment Failed"
          description="We couldn't process your payment. Please try again or use a different payment method."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&auto=format&fit=crop&q=80')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg mb-6"
              >
                <XCircle className="h-14 w-14 text-white" />
              </motion.div>

              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Payment Declined
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Payment Failed
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="bg-background py-16 px-6">
          <div className="max-w-2xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Common Reasons Card */}
              <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-serif font-semibold">Common Reasons</h2>
                  </div>
                  
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">Insufficient funds in your account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">Incorrect card details or security code</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">Card expired or has been blocked</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">Bank or card issuer declined the transaction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">Payment limit exceeded</span>
                    </li>
                  </ul>

                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        If the problem persists, please contact your bank or card issuer for more information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/checkout">
                  <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-retry">
                    Try Again
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button variant="outline" size="lg" className="gap-2 min-w-[200px]" data-testid="button-payment-methods">
                    Update Payment Method
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <Link href="/contact">
                  <Button variant="ghost" size="lg" className="gap-2" data-testid="button-support">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
