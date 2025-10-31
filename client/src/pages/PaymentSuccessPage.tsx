import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-mono font-semibold">TXN-2025-ABC123</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/feed">
              <Button className="w-full" data-testid="button-home">
                Go to Feed
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="w-full" data-testid="button-billing">
                View Billing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
