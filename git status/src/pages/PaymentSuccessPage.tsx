import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Receipt, Mail } from "lucide-react";
import { Link } from "wouter";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function PaymentSuccessPage() {
  return (
    <SelfHealingErrorBoundary pageName="Payment Success" fallbackRoute="/pricing">
      <>
        <SEO
          title="Payment Successful"
          description="Your payment has been processed successfully. Thank you for your purchase."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')`
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
                className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-6"
              >
                <CheckCircle className="h-14 w-14 text-white" />
              </motion.div>

              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Payment Confirmed
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Payment Successful!
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Thank you for your purchase. Your payment has been processed successfully.
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
              {/* Transaction Details Card */}
              <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Receipt className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-serif font-semibold">Transaction Details</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono font-semibold">TXN-2025-ABC123</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                        Completed
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        A confirmation email has been sent to your email address with your receipt and transaction details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/feed">
                  <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-home">
                    Go to Feed
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button variant="outline" size="lg" className="gap-2 min-w-[200px]" data-testid="button-billing">
                    View Billing
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
