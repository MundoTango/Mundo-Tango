import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, CreditCard, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function BillingHistory() {
  const { t } = useTranslation(["pages", "common"]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/billing/history"],
  });

  const { data: paymentMethod } = useQuery({
    queryKey: ["/api/billing/payment-method"],
  });

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesSearch = searchQuery === "" ||
      invoice.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default" as const,
      pending: "secondary" as const,
      failed: "destructive" as const,
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"} data-testid={`badge-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('pages:billingHistory.loading', 'Loading billing history...')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pages:billingHistory.title', 'Billing History')}</h1>
          <p className="text-muted-foreground">
            {t('pages:billingHistory.subtitle', 'View and manage your invoices and payment history')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('pages:billingHistory.paymentMethod', 'Payment Method')}</CardTitle>
              <CardDescription>{t('pages:billingHistory.defaultPaymentMethod', 'Your default payment method')}</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethod ? (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      •••• •••• •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:billingHistory.expires', 'Expires {{month}}/{{year}}', { month: paymentMethod.expMonth, year: paymentMethod.expYear })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('pages:billingHistory.noPaymentMethod', 'No payment method on file')}</p>
              )}
              <Button variant="outline" className="w-full mt-4" data-testid="button-update-payment">
                {t('pages:billingHistory.updatePaymentMethod', 'Update Payment Method')}
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('pages:billingHistory.totalPaid', 'Total Paid')}</CardTitle>
              <CardDescription>{t('pages:billingHistory.allTime', 'All time')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-total-paid">
                ${invoices
                  ?.filter((i: any) => i.status === "paid")
                  .reduce((sum: number, i: any) => sum + (i.amount / 100), 0)
                  .toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('pages:billingHistory.invoices', 'Invoices')}</CardTitle>
              <CardDescription>{t('pages:billingHistory.totalCount', 'Total count')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-invoice-count">
                {invoices?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('pages:billingHistory.searchPlaceholder', 'Search by invoice ID or plan...')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('pages:billingHistory.filterByStatus', 'Filter by status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages:billingHistory.allStatus', 'All Status')}</SelectItem>
                  <SelectItem value="paid">{t('pages:billingHistory.paid', 'Paid')}</SelectItem>
                  <SelectItem value="pending">{t('pages:billingHistory.pending', 'Pending')}</SelectItem>
                  <SelectItem value="failed">{t('pages:billingHistory.failed', 'Failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pages:billingHistory.invoiceHistory', 'Invoice History')}</CardTitle>
            <CardDescription>
              {t('pages:billingHistory.invoicesFound', '{{count}} invoices found', { count: filteredInvoices.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('pages:billingHistory.noInvoices', 'No invoices found')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pages:billingHistory.invoiceId', 'Invoice ID')}</TableHead>
                      <TableHead>{t('pages:billingHistory.date', 'Date')}</TableHead>
                      <TableHead>{t('pages:billingHistory.plan', 'Plan')}</TableHead>
                      <TableHead>{t('pages:billingHistory.amount', 'Amount')}</TableHead>
                      <TableHead>{t('pages:billingHistory.status', 'Status')}</TableHead>
                      <TableHead className="text-right">{t('pages:billingHistory.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice: any) => (
                      <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                        <TableCell className="font-medium">
                          #{invoice.id}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{invoice.planName || "N/A"}</TableCell>
                        <TableCell className="font-medium">
                          ${(invoice.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/billing/invoice/${invoice.id}`}>
                              <Button variant="outline" size="sm" data-testid={`button-view-${invoice.id}`}>
                                {t('common:view', 'View')}
                              </Button>
                            </Link>
                            {invoice.pdfUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-download-${invoice.id}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
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
