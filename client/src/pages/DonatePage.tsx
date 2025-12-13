import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Heart, Sparkles, ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { motion } from "framer-motion";

const DONATION_TIERS = [
  { id: "gardel", name: "Carlos Gardel", amount: 10, description: "Support our mission with a small contribution" },
  { id: "pugliese", name: "Osvaldo Pugliese", amount: 25, description: "Help us grow the community" },
  { id: "piazzolla", name: "Astor Piazzolla", amount: 50, description: "Make a significant impact" },
  { id: "cachafaz", name: "El Cachafaz", amount: 100, description: "Champion our cause" },
  { id: "custom", name: "Custom Amount", amount: 0, description: "Choose your own contribution" },
];

export default function DonatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tier = params.get("tier");
    if (tier) {
      const foundTier = DONATION_TIERS.find(t => t.id === tier);
      if (foundTier) {
        setSelectedTier(foundTier.id);
      }
    }
  }, []);

  const getAmount = () => {
    if (selectedTier === "custom") {
      return parseFloat(customAmount) || 0;
    }
    const tier = DONATION_TIERS.find(t => t.id === selectedTier);
    return tier?.amount || 0;
  };

  const handleDonate = async () => {
    const amount = getAmount();
    if (amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/payments/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "usd",
          tier: selectedTier,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create donation session");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Thank you!",
          description: "Your donation has been recorded. We appreciate your support!",
        });
        setLocation("/support");
      }
    } catch (error: any) {
      toast({
        title: "Donation not available",
        description: "Donations are being set up. Please check back soon or visit our crowdfunding page.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Donate to Mundo Tango"
        description="Support the global tango community. Your donation helps us connect dancers worldwide and preserve the art of Argentine tango."
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link href="/support">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Heart className="w-3 h-3 mr-1" />
                Support Mundo Tango
              </Badge>
              <h1 className="text-4xl font-serif font-bold mb-4" data-testid="heading-donate">
                Make a Donation
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your support helps us connect dancers worldwide and preserve the beautiful art of Argentine tango.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Choose Your Support Level
                </CardTitle>
                <CardDescription>
                  Select a tier or enter a custom amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {DONATION_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                        selectedTier === tier.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`tier-${tier.id}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{tier.name}</p>
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {tier.amount > 0 && (
                            <span className="text-xl font-bold">${tier.amount}</span>
                          )}
                          {selectedTier === tier.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedTier === "custom" && (
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="customAmount">Custom Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                      <Input
                        id="customAmount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-8"
                        data-testid="input-custom-amount"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleDonate}
              disabled={!selectedTier || isProcessing || (selectedTier === "custom" && !customAmount)}
              size="lg"
              className="w-full"
              data-testid="button-complete-donation"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Donate {getAmount() > 0 ? `$${getAmount()}` : ""}
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Secure payment powered by Stripe. You can also support us through our{" "}
              <Link href="/crowdfunding" className="text-primary hover:underline">
                crowdfunding campaigns
              </Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
