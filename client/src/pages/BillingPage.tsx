import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Download, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    currentPeriodStart: number;
    cancelAtPeriodEnd: boolean;
    tier: string;
  } | null;
  tier: string;
  status: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  pdfUrl: string | null;
  hostedUrl: string | null;
  number: string | null;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

const PLAN_DISPLAY_NAMES: Record<string, { name: string; price: string }> = {
  trial: { name: 'Free Trial', price: '$0/7 days' },
  basic: { name: 'Basic', price: '$4.99/month' },
  free: { name: 'Free', price: 'Free' },
};

export default function BillingPage() {
  const { data: subscriptionData, isLoading: subLoading, error: subError, isSuccess: subSuccess } = useQuery<SubscriptionData>({
    queryKey: ['/api/billing/subscription'],
  });

  const isAuthenticated = subSuccess && !subError;

  const { data: invoicesData, isLoading: invLoading } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ['/api/billing/invoices'],
    enabled: isAuthenticated,
  });

  const { data: paymentData, isLoading: payLoading } = useQuery<{ paymentMethods: PaymentMethod[] }>({
    queryKey: ['/api/billing/payment-methods'],
    enabled: isAuthenticated,
  });

  const defaultPaymentMethod = paymentData?.paymentMethods?.find(pm => pm.isDefault) || paymentData?.paymentMethods?.[0] || null;

  const tier = subscriptionData?.tier || 'free';
  const planInfo = PLAN_DISPLAY_NAMES[tier] || { name: 'Unknown', price: '' };
  const subscriptionStatus = subscriptionData?.subscription?.status || subscriptionData?.status || (tier === 'free' ? 'free' : 'active');
  const nextBillingDate = subscriptionData?.subscription?.currentPeriodEnd
    ? new Date(subscriptionData.subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge data-testid="badge-status">Active</Badge>;
      case 'trialing':
        return <Badge variant="secondary" data-testid="badge-status">Trial</Badge>;
      case 'canceled':
        return <Badge variant="destructive" data-testid="badge-status">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive" data-testid="badge-status">Past Due</Badge>;
      case 'free':
        return <Badge variant="outline" data-testid="badge-status">Free</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-status">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SelfHealingErrorBoundary pageName="Billing & Invoices" fallbackRoute="/settings">
      <SEO 
        title="Billing & Invoices"
        description="Manage your subscription, view payment history, and download invoices for your Mundo Tango account"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-background">
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
            {subError ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p>Please log in to view your billing information</p>
                  </div>
                  <Link href="/login">
                    <Button className="mt-4" data-testid="button-login">
                      Log In
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
            <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-serif">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold font-serif" data-testid="text-plan-name">
                          {planInfo.name}
                        </span>
                        {getStatusBadge(subscriptionStatus)}
                      </div>
                      <p className="text-muted-foreground" data-testid="text-plan-price">{planInfo.price}</p>
                      {nextBillingDate && (
                        <p className="text-sm text-muted-foreground" data-testid="text-next-billing">
                          Next billing date: {nextBillingDate}
                        </p>
                      )}
                      {subscriptionData?.subscription?.cancelAtPeriodEnd && (
                        <p className="text-sm text-destructive">
                          Subscription will cancel at period end
                        </p>
                      )}
                      <div className="pt-4 flex flex-wrap gap-2">
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" data-testid="button-change-plan">
                            Change Plan
                          </Button>
                        </Link>
                        {tier !== 'free' && tier !== 'trial' && (
                          <Button variant="outline" size="sm" data-testid="button-cancel">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {payLoading ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : defaultPaymentMethod ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium capitalize" data-testid="text-card-brand">
                            {defaultPaymentMethod.brand} •••• {defaultPaymentMethod.last4}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-card-expiry">
                            Expires {defaultPaymentMethod.expMonth}/{defaultPaymentMethod.expYear}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-update-payment">
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No payment method on file</p>
                      <Link href="/pricing">
                        <Button variant="outline" size="sm" data-testid="button-add-payment">
                          Add Payment Method
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                {invLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-5 w-5 rounded" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : invoicesData?.invoices?.length ? (
                  <div className="space-y-3">
                    {invoicesData.invoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between py-3 border-b last:border-0 hover-elevate rounded px-2 flex-wrap gap-2"
                        data-testid={`invoice-${invoice.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{invoice.number || invoice.id.slice(0, 12)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{formatAmount(invoice.amount, invoice.currency)}</span>
                          <Badge variant="secondary" className="capitalize">{invoice.status}</Badge>
                          {invoice.pdfUrl && (
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost" data-testid={`button-download-${invoice.id}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {invoice.hostedUrl && (
                            <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost" data-testid={`button-view-${invoice.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No invoices yet</p>
                    <p className="text-sm mt-1">Invoices will appear here after your first payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
