import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Trash2, Star, Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

function AddPaymentMethodForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { t } = useTranslation(["pages", "common"]);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });

      if (error) {
        toast({
          title: t('pages:settings.paymentMethods.error', 'Error'),
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      await apiRequest('POST', '/api/billing/payment-methods', {
        paymentMethodId: paymentMethod.id,
      });

      toast({
        title: t('pages:settings.paymentMethods.paymentMethodAdded', 'Payment Method Added'),
        description: t('pages:settings.paymentMethods.paymentMethodAddedDesc', 'Your payment method has been successfully added.'),
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: t('pages:settings.paymentMethods.error', 'Error'),
        description: error.message || t('pages:settings.paymentMethods.failedToAdd', 'Failed to add payment method'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-1"
          data-testid="button-save-payment-method"
        >
          {isProcessing ? t('pages:settings.paymentMethods.processing', 'Processing...') : t('pages:settings.paymentMethods.addPaymentMethod', 'Add Payment Method')}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          data-testid="button-cancel-add"
        >
          {t('pages:settings.paymentMethods.cancel', 'Cancel')}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentMethods() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: paymentMethodsData, isLoading } = useQuery({
    queryKey: ['/api/billing/payment-methods'],
  });

  const paymentMethods: PaymentMethod[] = paymentMethodsData?.paymentMethods || [];

  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('POST', '/api/billing/set-default-payment', { paymentMethodId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/payment-methods'] });
      toast({
        title: t('pages:settings.paymentMethods.defaultUpdated', 'Default Payment Method Updated'),
        description: t('pages:settings.paymentMethods.defaultUpdatedDesc', 'Your default payment method has been updated.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.paymentMethods.updateFailed', 'Update Failed'),
        description: error.message || t('pages:settings.paymentMethods.failedToUpdateDefault', 'Failed to update default payment method'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await apiRequest('DELETE', `/api/billing/payment-methods/${paymentMethodId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/payment-methods'] });
      toast({
        title: t('pages:settings.paymentMethods.paymentMethodDeleted', 'Payment Method Deleted'),
        description: t('pages:settings.paymentMethods.paymentMethodDeletedDesc', 'The payment method has been removed.'),
      });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.paymentMethods.deleteFailed', 'Delete Failed'),
        description: error.message || t('pages:settings.paymentMethods.failedToDelete', 'Failed to delete payment method'),
        variant: "destructive",
      });
    },
  });

  const getCardBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      visa: 'text-blue-600',
      mastercard: 'text-orange-600',
      amex: 'text-blue-500',
      discover: 'text-orange-500',
    };
    return colors[brand.toLowerCase()] || 'text-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-payment-methods">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="payment-methods-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings/billing">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-payment-methods">
                {t('pages:settings.paymentMethods.title', 'Payment Methods')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('pages:settings.paymentMethods.subtitle', 'Manage your saved payment methods')}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            data-testid="button-add-payment-method"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('pages:settings.paymentMethods.addPaymentMethod', 'Add Payment Method')}
          </Button>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12" data-testid="empty-state">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('pages:settings.paymentMethods.noPaymentMethods', 'No Payment Methods')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('pages:settings.paymentMethods.noPaymentMethodsDesc', 'Add a payment method to subscribe to paid plans')}
                </p>
                <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('pages:settings.paymentMethods.addPaymentMethod', 'Add Payment Method')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className="hover-elevate" data-testid={`card-payment-method-${method.id}`}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-card rounded-lg border">
                      <CreditCard className={`w-6 h-6 ${getCardBrandColor(method.brand)}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize" data-testid={`text-card-${method.id}`}>
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <Badge variant="secondary" data-testid={`badge-default-${method.id}`}>
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {t('pages:settings.paymentMethods.default', 'Default')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('pages:settings.paymentMethods.expires', 'Expires')} {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        disabled={setDefaultMutation.isPending}
                        data-testid={`button-set-default-${method.id}`}
                      >
                        {t('pages:settings.paymentMethods.setAsDefault', 'Set as Default')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(method.id)}
                      disabled={method.isDefault}
                      data-testid={`button-delete-${method.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-add-payment-method">
          <DialogHeader>
            <DialogTitle>{t('pages:settings.paymentMethods.addPaymentMethod', 'Add Payment Method')}</DialogTitle>
            <DialogDescription>
              {t('pages:settings.paymentMethods.addNewCard', 'Add a new credit or debit card to your account')}
            </DialogDescription>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <AddPaymentMethodForm
              onSuccess={() => {
                setShowAddDialog(false);
                queryClient.invalidateQueries({ queryKey: ['/api/billing/payment-methods'] });
              }}
              onCancel={() => setShowAddDialog(false)}
            />
          </Elements>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages:settings.paymentMethods.deletePaymentMethod', 'Delete Payment Method')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages:settings.paymentMethods.deleteConfirmation', 'Are you sure you want to delete this payment method? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t('pages:settings.paymentMethods.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('pages:settings.paymentMethods.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
