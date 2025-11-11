import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function BillingPage() {
  const invoices = [
    { id: "INV-001", date: "2025-10-01", amount: "$9.99", status: "Paid" },
    { id: "INV-002", date: "2025-09-01", amount: "$9.99", status: "Paid" },
    { id: "INV-003", date: "2025-08-01", amount: "$9.99", status: "Paid" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Billing & Invoices" fallbackRoute="/settings">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554224311-beee415c201f?w=1600&h=900&fit=crop&q=80')`
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
                <CreditCard className="w-3 h-3 mr-1.5" />
                Account Management
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Billing & Invoices
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Manage your subscription and payment history
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold font-serif">Pro Plan</span>
                      <Badge data-testid="badge-status">Active</Badge>
                    </div>
                    <p className="text-muted-foreground">$9.99/month</p>
                    <p className="text-sm text-muted-foreground">
                      Next billing date: November 1, 2025
                    </p>
                    <div className="pt-4 space-x-2">
                      <Button variant="outline" size="sm" data-testid="button-change-plan">Change Plan</Button>
                      <Button variant="outline" size="sm" data-testid="button-cancel">Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">•••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-update-payment">Update</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <motion.div
                      key={invoice.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between py-3 border-b last:border-0 hover-elevate rounded px-2"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{invoice.amount}</span>
                        <Badge variant="secondary">{invoice.status}</Badge>
                        <Button size="icon" variant="ghost" data-testid={`button-download-${invoice.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
