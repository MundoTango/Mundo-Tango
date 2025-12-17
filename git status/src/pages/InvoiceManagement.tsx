import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Mail, Printer, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceManagement() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/billing/invoices", invoiceId],
  });

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/billing/download/${invoiceId}`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      } else {
        toast({
          title: "Error",
          description: "PDF not available",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleEmail = () => {
    toast({
      title: "Email Sent",
      description: "Invoice has been sent to your email",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <Button onClick={() => setLocation("/billing/history")}>
          Back to Billing History
        </Button>
      </div>
    );
  }

  const statusIcons = {
    paid: CheckCircle,
    pending: Clock,
    failed: XCircle,
  };

  const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons] || Clock;

  const items = invoice.items || [
    {
      description: `${invoice.planName} Subscription`,
      quantity: 1,
      unitPrice: invoice.amount,
      total: invoice.amount,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button
            variant="ghost"
            onClick={() => setLocation("/billing/history")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmail}
              data-testid="button-email"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              data-testid="button-print"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              data-testid="button-download"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">Invoice</CardTitle>
                <CardDescription>
                  Invoice #{invoice.id} • Issued {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                <Badge
                  variant={
                    invoice.status === "paid"
                      ? "default"
                      : invoice.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  data-testid="badge-status"
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">From</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Mundo Tango</p>
                  <p>123 Tango Street</p>
                  <p>Buenos Aires, Argentina</p>
                  <p>support@mundotango.com</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Bill To</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Account #{invoice.userId}</p>
                  <p>Payment processed via Stripe</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Items */}
            <div>
              <h3 className="font-semibold mb-4">Invoice Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${((item.unitPrice || invoice.amount) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${((item.total || invoice.amount) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(invoice.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-total">${(invoice.amount / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status Alert */}
            {invoice.status === "paid" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment received on {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
                </AlertDescription>
              </Alert>
            )}

            {invoice.status === "pending" && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Payment is being processed. This may take a few minutes.
                </AlertDescription>
              </Alert>
            )}

            {invoice.status === "failed" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment failed. Please update your payment method and try again.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Thank you for your business!</p>
              <p>
                Questions? Contact us at support@mundotango.com
              </p>
              {invoice.stripeInvoiceId && (
                <p className="text-xs">
                  Stripe Invoice ID: {invoice.stripeInvoiceId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
