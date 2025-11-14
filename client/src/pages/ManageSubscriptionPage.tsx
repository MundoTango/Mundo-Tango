import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
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
import {
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { safeDateFormat } from "@/lib/safeDateFormat";

interface Subscription {
  id: number;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentProvider: string;
  metadata: any;
}

interface Tier {
  displayName: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
}

interface CurrentSubscription {
  subscription: Subscription;
  tier: Tier;
}

interface HistoryItem {
  subscription: Subscription;
  tier: Tier | null;
}

export default function ManageSubscriptionPage() {
  const { toast } = useToast();

  const { data: currentSubscription, isLoading: currentLoading } = useQuery<CurrentSubscription | null>({
    queryKey: ["/api/subscriptions/me"],
  });

  const { data: history, isLoading: historyLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/subscriptions/history"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return await apiRequest(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancelAtPeriodEnd: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/history"] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return await apiRequest(`/api/subscriptions/${subscriptionId}/reactivate`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/history"] });
      toast({
        title: "Subscription reactivated!",
        description: "Your subscription has been successfully reactivated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reactivation failed",
        description: error.message || "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" data-testid="badge-status-active">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" data-testid="badge-status-cancelled">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" data-testid="badge-status-past-due">
            <AlertCircle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        );
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const handleCancel = () => {
    if (currentSubscription?.subscription) {
      cancelMutation.mutate(currentSubscription.subscription.id);
    }
  };

  const handleReactivate = () => {
    if (currentSubscription?.subscription) {
      reactivateMutation.mutate(currentSubscription.subscription.id);
    }
  };

  const formatDate = (dateString: string) => {
    return safeDateFormat(dateString, "MMM dd, yyyy", dateString);
  };

  const getBillingInterval = (metadata: any) => {
    try {
      const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      return parsed?.billingInterval || 'monthly';
    } catch {
      return 'monthly';
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="ManageSubscription" fallbackRoute="/subscriptions">
      <PageLayout title="Manage Subscription" showBreadcrumbs>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <Link href="/subscriptions">
                <Button variant="ghost" className="mb-4" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Manage Your Subscription
              </h1>
              <p className="text-muted-foreground mt-2">
                View and manage your subscription details
              </p>
            </div>

            {currentLoading ? (
              <Card className="backdrop-blur-md bg-card/50 border-border mb-8">
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : currentSubscription ? (
              <>
                {/* Current Subscription Card */}
                <Card className="backdrop-blur-lg bg-gradient-to-br from-card/90 via-card to-primary/5 border-2 border-border shadow-lg mb-8">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Crown className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl" data-testid="text-current-plan">
                            {currentSubscription.tier.displayName} Plan
                          </CardTitle>
                          <CardDescription>Your active subscription</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(currentSubscription.subscription.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Subscription Details */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span>Billing Interval</span>
                        </div>
                        <p className="text-lg font-medium capitalize" data-testid="text-billing-interval">
                          {getBillingInterval(currentSubscription.subscription.metadata)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Next Payment Date</span>
                        </div>
                        <p className="text-lg font-medium" data-testid="text-next-payment">
                          {formatDate(currentSubscription.subscription.currentPeriodEnd)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Started On</span>
                        </div>
                        <p className="text-lg font-medium" data-testid="text-started-on">
                          {formatDate(currentSubscription.subscription.currentPeriodStart)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Method</span>
                        </div>
                        <p className="text-lg font-medium capitalize" data-testid="text-payment-provider">
                          {currentSubscription.subscription.paymentProvider}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div>
                      <h3 className="font-semibold mb-3">Plan Features</h3>
                      <div className="grid gap-2">
                        {currentSubscription.tier.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm" data-testid={`feature-${index}`}>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation Warning */}
                    {currentSubscription.subscription.cancelAtPeriodEnd && (
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4" data-testid="alert-cancellation-pending">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-900 dark:text-yellow-100">
                              Subscription Ending Soon
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                              Your subscription will end on {formatDate(currentSubscription.subscription.currentPeriodEnd)}.
                              You can reactivate it before then to continue your access.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-3 flex-wrap">
                    {currentSubscription.subscription.status === "cancelled" ? (
                      <Button
                        onClick={handleReactivate}
                        disabled={reactivateMutation.isPending}
                        className="bg-gradient-to-r from-primary to-secondary"
                        data-testid="button-reactivate"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {reactivateMutation.isPending ? "Reactivating..." : "Reactivate Subscription"}
                      </Button>
                    ) : (
                      <>
                        <Link href="/subscriptions">
                          <Button variant="outline" data-testid="button-change-plan">
                            Change Plan
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" data-testid="button-cancel">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-testid="dialog-cancel-confirm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your subscription will be cancelled at the end of the current billing period on{" "}
                                {formatDate(currentSubscription.subscription.currentPeriodEnd)}. You'll still have access until then.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-dialog-cancel">Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                                className="bg-destructive text-destructive-foreground"
                                data-testid="button-cancel-dialog-confirm"
                              >
                                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card className="backdrop-blur-md bg-card/50 border-border mb-8">
                <CardContent className="py-12 text-center space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <p className="text-lg font-medium">No Active Subscription</p>
                    <p className="text-muted-foreground mt-1">You don't have an active subscription yet.</p>
                  </div>
                  <Link href="/subscriptions">
                    <Button className="mt-4" data-testid="button-browse-plans">
                      Browse Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Subscription History */}
            <Card className="backdrop-blur-md bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Subscription History</CardTitle>
                <CardDescription>View your past and current subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : history && history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div
                        key={item.subscription.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover-elevate"
                        data-testid={`history-item-${index}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium" data-testid={`history-plan-${index}`}>
                              {item.tier?.displayName || item.subscription.planId}
                            </p>
                            {getStatusBadge(item.subscription.status)}
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`history-dates-${index}`}>
                            {formatDate(item.subscription.currentPeriodStart)} - {formatDate(item.subscription.currentPeriodEnd)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground capitalize">
                            {getBillingInterval(item.subscription.metadata)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No subscription history found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
