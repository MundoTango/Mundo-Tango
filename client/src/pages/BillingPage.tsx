import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar } from "lucide-react";

export default function BillingPage() {
  const invoices = [
    { id: "INV-001", date: "2025-10-01", amount: "$9.99", status: "Paid" },
    { id: "INV-002", date: "2025-09-01", amount: "$9.99", status: "Paid" },
    { id: "INV-003", date: "2025-08-01", amount: "$9.99", status: "Paid" }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Billing & Invoices</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">Pro Plan</span>
                  <Badge>Active</Badge>
                </div>
                <p className="text-muted-foreground">$9.99/month</p>
                <p className="text-sm text-muted-foreground">
                  Next billing date: November 1, 2025
                </p>
                <div className="pt-4 space-x-2">
                  <Button variant="outline" size="sm">Change Plan</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
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
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
