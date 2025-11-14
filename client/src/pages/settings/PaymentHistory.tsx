import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ExternalLink, FileText, ArrowLeft } from "lucide-react";
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

export default function PaymentHistory() {
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['/api/billing/invoices'],
  });

  const { data: paymentMethodsData } = useQuery({
    queryKey: ['/api/billing/payment-methods'],
  });

  const invoices: Invoice[] = invoicesData?.invoices || [];
  const paymentMethods = paymentMethodsData?.paymentMethods || [];
  const defaultPaymentMethod = paymentMethods.find((pm: any) => pm.isDefault);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      paid: { variant: 'default', label: 'Paid' },
      open: { variant: 'secondary', label: 'Pending' },
      void: { variant: 'outline', label: 'Void' },
      uncollectible: { variant: 'destructive', label: 'Failed' },
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-payment-history">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="payment-history-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings/billing">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="heading-payment-history">
                Payment History
              </h1>
              <p className="text-muted-foreground mt-1">
                View and download your invoices
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method on File */}
        {defaultPaymentMethod && (
          <Card data-testid="card-default-payment-method">
            <CardHeader>
              <CardTitle className="text-lg">Payment Method on File</CardTitle>
              <CardDescription>
                This is the default payment method used for subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-card rounded-lg border">
                    <FileText className="w-5 h-5 text-muted-foreground" />
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
                <Link href="/settings/billing/payment-methods">
                  <Button variant="outline" data-testid="button-manage-methods">
                    Manage Payment Methods
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {invoices.length === 0 
                ? "No invoices yet" 
                : `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} found`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your payment history will appear here once you subscribe to a paid plan
                </p>
                <Link href="/settings/billing">
                  <Button data-testid="button-view-plans">
                    View Plans
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                        <TableCell className="font-medium">
                          {invoice.number || invoice.id}
                        </TableCell>
                        <TableCell data-testid={`text-date-${invoice.id}`}>
                          {formatDate(invoice.date)}
                        </TableCell>
                        <TableCell data-testid={`text-amount-${invoice.id}`}>
                          {formatAmount(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invoice.pdfUrl && (
                              <a 
                                href={invoice.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-download-${invoice.id}`}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  PDF
                                </Button>
                              </a>
                            )}
                            {invoice.hostedUrl && (
                              <a 
                                href={invoice.hostedUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-view-${invoice.id}`}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
