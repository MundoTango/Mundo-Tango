import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function PaymentFailedPage() {
  return (
    <PageLayout title="Payment Failed" showBreadcrumbs>
<div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <div>
            
            <p className="text-muted-foreground">
              We couldn't process your payment. Please try again or use a different payment method.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Common Reasons:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Insufficient funds</li>
              <li>• Incorrect card details</li>
              <li>• Card expired or blocked</li>
              <li>• Bank declined the transaction</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/checkout">
              <Button className="w-full" data-testid="button-retry">
                Try Again
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="w-full" data-testid="button-payment-methods">
                Update Payment Method
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full" data-testid="button-support">
                Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageLayout>);
}
