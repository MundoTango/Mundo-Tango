import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, ShoppingCart } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";

interface BillingAddress {
  fullAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: { lat: number; lng: number };
}

export default function CheckoutPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:checkout.title', 'Checkout')} fallbackRoute="/pricing">
      <SEO 
        title={t('pages:checkout.seoTitle', 'Checkout')}
        description={t('pages:checkout.seoDescription', 'Complete your purchase securely with encrypted payment processing for Mundo Tango premium subscription')}
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1565020118464-6734977cf647?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <ShoppingCart className="w-3 h-3 mr-1.5" />
                {t('pages:checkout.securePayment', 'Secure Payment')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                {t('pages:checkout.title', 'Checkout')}
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                {t('pages:checkout.subtitle', 'Complete your purchase securely')}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">{t('pages:checkout.paymentInformation', 'Payment Information')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="card-number">{t('pages:checkout.cardNumber', 'Card Number')}</Label>
                      <div className="relative">
                        <Input id="card-number" placeholder="1234 5678 9012 3456" data-testid="input-card" />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">{t('pages:checkout.expiryDate', 'Expiry Date')}</Label>
                        <Input id="expiry" placeholder="MM/YY" data-testid="input-expiry" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">{t('pages:checkout.cvc', 'CVC')}</Label>
                        <Input id="cvc" placeholder="123" data-testid="input-cvc" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">{t('pages:checkout.billingAddress', 'Billing Address')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('pages:checkout.fullName', 'Full Name')}</Label>
                      <Input id="name" data-testid="input-name" />
                    </div>
                    <div>
                      <UnifiedLocationPicker
                        mode="address"
                        label={t('pages:checkout.billingAddressLabel', 'Billing Address')}
                        placeholder={t('pages:checkout.billingAddressPlaceholder', 'Start typing your address...')}
                        value={billingAddress?.fullAddress || ""}
                        onChange={(location, coordinates, parsed) => {
                          if (parsed) {
                            setBillingAddress({
                              fullAddress: parsed.fullAddress,
                              street: parsed.street,
                              city: parsed.city,
                              state: parsed.state,
                              country: parsed.country,
                              postalCode: parsed.postalCode,
                              coordinates: parsed.coordinates,
                            });
                          } else {
                            setBillingAddress(null);
                          }
                        }}
                      />
                    </div>
                    {billingAddress && (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg space-y-1">
                        {billingAddress.street && <p>{billingAddress.street}</p>}
                        <p>
                          {billingAddress.city && `${billingAddress.city}, `}
                          {billingAddress.state && `${billingAddress.state} `}
                          {billingAddress.postalCode && billingAddress.postalCode}
                        </p>
                        {billingAddress.country && <p>{billingAddress.country}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-4 hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">{t('pages:checkout.orderSummary', 'Order Summary')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('pages:checkout.proPlanMonthly', 'Pro Plan (Monthly)')}</span>
                        <span>$9.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('pages:checkout.tax', 'Tax')}</span>
                        <span>$1.00</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>{t('pages:checkout.total', 'Total')}</span>
                        <span className="text-primary">$10.99</span>
                      </div>
                    </div>
                    <Button className="w-full" data-testid="button-pay">
                      <Lock className="h-4 w-4 mr-2" />
                      {t('pages:checkout.pay', 'Pay $10.99')}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t('pages:checkout.secureEncrypted', 'Your payment is secure and encrypted')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
