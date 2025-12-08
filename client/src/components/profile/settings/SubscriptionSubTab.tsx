import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Crown, 
  ExternalLink, 
  Calendar, 
  CreditCard, 
  Download, 
  FileText,
  XCircle,
  CheckCircle2,
  Loader2,
  Receipt,
  Settings2
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: number;
  pdfUrl: string;
  hostedUrl: string;
  number: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function SubscriptionSubTab() {
  const { useSubscription } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/billing/invoices'],
  });

  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/billing/payment-methods'],
  });

  const { data: billingSubscription } = useQuery({
    queryKey: ['/api/billing/subscription'],
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (immediate: boolean) => {
      const response = await apiRequest('POST', '/api/billing/cancel-subscription', { immediate });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll retain access until the end of your billing period.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleManageSubscription = async () => {
    setIsRedirecting(true);
    try {
      const response = await apiRequest('GET', '/api/billing/customer-portal');
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Unable to create billing portal session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || "";
      toast({
        title: "Error",
        description: errorMessage.includes("No Stripe customer") 
          ? "No billing information found. Subscribe to a paid plan first." 
          : "Unable to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedirecting(false);
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      paid: { variant: 'default', label: 'Paid' },
      open: { variant: 'secondary', label: 'Pending' },
      void: { variant: 'outline', label: 'Void' },
      uncollectible: { variant: 'destructive', label: 'Failed' },
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isLoading = subscriptionLoading;
  const invoices: Invoice[] = invoicesData?.invoices || [];
  const paymentMethods: PaymentMethod[] = paymentMethodsData?.paymentMethods || [];
  const defaultPaymentMethod = paymentMethods.find((pm) => pm.isDefault);
  
  const currentSubscription = billingSubscription?.subscription;
  const currentTier = billingSubscription?.tier || subscription?.plan || 'free';
  const isPaidPlan = currentTier !== 'free';
  const canCancel = isPaidPlan && currentSubscription && !currentSubscription.cancelAtPeriodEnd;

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="subscription-subtab">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading subscription...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = subscription?.plan || 'free';
  const status = subscription?.status || 'active';
  const currentPeriodEnd = currentSubscription?.currentPeriodEnd || (subscription as any)?.current_period_end;

  return (
    <div className="space-y-6" data-testid="subscription-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Current Plan
              </Label>
              <p className="text-sm text-muted-foreground">
                {currentTier === 'free' && 'You are on the free plan'}
                {currentTier === 'basic' && 'You are subscribed to Basic'}
                {currentTier === 'pro' && 'You are subscribed to Pro'}
                {currentTier === 'premium' && 'You are on the Premium plan'}
                {currentTier === 'enterprise' && 'You are on the Enterprise plan'}
              </p>
            </div>
            <Badge 
              variant={currentTier === 'free' ? 'secondary' : 'default'} 
              data-testid="badge-subscription-plan"
            >
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </Badge>
          </div>

          {currentSubscription && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Your subscription status
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentSubscription.cancelAtPeriodEnd ? (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <Badge variant="destructive" data-testid="badge-subscription-status">
                        Cancels {formatDate(currentSubscription.currentPeriodEnd)}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <Badge variant="default" data-testid="badge-subscription-status">
                        Active
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {currentPeriodEnd && !currentSubscription?.cancelAtPeriodEnd && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Billing Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your subscription renews automatically
                  </p>
                </div>
                <span className="text-sm font-medium" data-testid="text-next-billing">
                  {formatDate(currentPeriodEnd)}
                </span>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={handleManageSubscription}
            disabled={isRedirecting}
            data-testid="button-manage-subscription"
          >
            {isRedirecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            {isRedirecting ? 'Opening Portal...' : 'Manage Subscription'}
          </Button>
          
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                  data-testid="button-cancel-subscription"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You'll retain access to premium features until the end of your current billing period on {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'the end of your billing period'}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-dialog-cancel">
                    Keep Subscription
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => cancelSubscriptionMutation.mutate(false)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-cancel"
                  >
                    {cancelSubscriptionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Your saved payment methods for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethodsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : defaultPaymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium capitalize" data-testid="text-card-brand">
                    {defaultPaymentMethod.brand} •••• {defaultPaymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {defaultPaymentMethod.expMonth}/{defaultPaymentMethod.expYear}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManageSubscription}
                disabled={isRedirecting}
                data-testid="button-update-payment"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No payment method on file
              </p>
              {isPaidPlan && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                  data-testid="button-add-payment"
                >
                  Add Payment Method
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
            <CardDescription>
              View and download your invoices
            </CardDescription>
          </div>
          {invoices.length > 3 && (
            <Link href="/settings/billing/history">
              <Button variant="ghost" size="sm" data-testid="button-view-all-invoices">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-invoices">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium mb-1">No Invoices Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your payment history will appear here once you subscribe to a paid plan
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="text-sm" data-testid={`text-date-${invoice.id}`}>
                        {formatDate(invoice.date)}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-amount-${invoice.id}`}>
                        {formatAmount(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.pdfUrl && (
                          <a 
                            href={invoice.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="ghost" 
                              size="icon"
                              data-testid={`button-download-${invoice.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPaidPlan && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription>
              Unlock premium features and get the most out of Mundo Tango
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/billing">
              <Button className="w-full" data-testid="button-view-plans">
                <Crown className="h-4 w-4 mr-2" />
                View Plans & Pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
