import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Check } from "lucide-react";
import { useState } from "react";

export default function NewsletterPage() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Stay Connected with Tango</h1>
          <p className="text-lg text-muted-foreground">
            Get the latest tango news, events, and exclusive content delivered to your inbox
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">
                {subscribed ? "You're Subscribed!" : "Subscribe to Our Newsletter"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscribed ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-muted-foreground">
                    Thank you for subscribing! Check your email to confirm your subscription.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" required data-testid="input-name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required data-testid="input-email" />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-subscribe">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What You'll Receive</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>✓ Weekly event roundups in your city</p>
                <p>✓ Exclusive interviews with tango maestros</p>
                <p>✓ Tips and techniques to improve your dance</p>
                <p>✓ Early access to workshop registrations</p>
                <p>✓ Special discounts and offers</p>
                <p>✓ Community highlights and success stories</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Privacy Promise</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>We respect your privacy. Your email will never be shared with third parties, and you can unsubscribe at any time with one click.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frequency</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>We send newsletters every Tuesday and Friday. You can adjust your preferences or unsubscribe at any time from your account settings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
