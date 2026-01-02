import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heart, CreditCard, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FundraisingProgress } from "./FundraisingProgress";

interface StripeDonationProps {
  showCard?: boolean;
  showProgress?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

const DONATION_TIERS = [
  { amount: 10, label: "Friend" },
  { amount: 25, label: "Supporter" },
  { amount: 50, label: "Champion" },
  { amount: 100, label: "Hero" },
];

export function StripeDonation({ 
  showCard = true, 
  showProgress = true,
  title,
  description,
  className = ""
}: StripeDonationProps) {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();

  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async (data: { 
      amount: number; 
      donorName: string; 
      donorEmail: string;
      isAnonymous: boolean; 
      message: string 
    }) => {
      const response = await apiRequest('POST', '/api/donations/checkout', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: t('pages:donate.error.title', 'Error'),
          description: t('pages:donate.error.noUrl', 'Could not create checkout session'),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('pages:donate.error.title', 'Error'),
        description: error.message || t('pages:donate.error.generic', 'Something went wrong. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const getAmount = (): number => {
    if (selectedTier !== null) {
      return DONATION_TIERS[selectedTier].amount;
    }
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleDonate = () => {
    const amount = getAmount();
    if (amount < 1) {
      toast({
        title: t('pages:donate.error.title', 'Error'),
        description: t('pages:donate.error.minAmount', 'Please enter a donation amount of at least $1'),
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({
      amount,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      isAnonymous,
      message: message.trim(),
    });
  };

  const content = (
    <div className="space-y-6" data-testid="stripe-donation">
      {showProgress && (
        <FundraisingProgress showCard={false} compact />
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t('pages:donate.tiers.label', 'Select an amount')}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {DONATION_TIERS.map((tier, index) => (
            <Button
              key={tier.amount}
              variant={selectedTier === index ? "default" : "outline"}
              className={`h-auto py-3 flex flex-col ${selectedTier === index ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setSelectedTier(index);
                setCustomAmount("");
              }}
              data-testid={`button-tier-${tier.amount}`}
            >
              <span className="text-lg font-bold">${tier.amount}</span>
              <span className="text-xs opacity-80">{tier.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAmount" className="text-sm">
          {t('pages:donate.custom.label', 'Or enter a custom amount')}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="customAmount"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedTier(null);
            }}
            className="pl-7"
            data-testid="input-custom-amount"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="donorName">{t('pages:donate.form.name', 'Your name (optional)')}</Label>
          <Input
            id="donorName"
            placeholder={t('pages:donate.form.namePlaceholder', 'John Doe')}
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            disabled={isAnonymous}
            data-testid="input-donor-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="donorEmail">{t('pages:donate.form.email', 'Email (for receipt)')}</Label>
          <Input
            id="donorEmail"
            type="email"
            placeholder={t('pages:donate.form.emailPlaceholder', 'you@example.com')}
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            data-testid="input-donor-email"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            data-testid="checkbox-anonymous"
          />
          <Label htmlFor="anonymous" className="text-sm cursor-pointer">
            {t('pages:donate.form.anonymous', 'Donate anonymously')}
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">{t('pages:donate.form.message', 'Leave a message (optional)')}</Label>
          <Textarea
            id="message"
            placeholder={t('pages:donate.form.messagePlaceholder', 'Share why you support Mundo Tango...')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            data-testid="input-message"
          />
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full ocean-gradient text-white"
        onClick={handleDonate}
        disabled={getAmount() < 1 || checkoutMutation.isPending}
        data-testid="button-donate"
      >
        {checkoutMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('pages:donate.button.processing', 'Processing...')}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {getAmount() > 0 
              ? t('pages:donate.button.amount', 'Donate ${{amount}}', { amount: getAmount() })
              : t('pages:donate.button.default', 'Donate')}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t('pages:donate.security', 'Secure payment powered by Stripe. Your payment info is never stored on our servers.')}
      </p>
    </div>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`overflow-hidden ${className}`} data-testid="donation-card">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-full ocean-gradient mx-auto flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">
          {title || t('pages:donate.card.title', 'Support Mundo Tango')}
        </CardTitle>
        <CardDescription className="text-base">
          {description || t('pages:donate.card.description', 'Help us build the platform the tango community deserves')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {content}
      </CardContent>
    </Card>
  );
}
