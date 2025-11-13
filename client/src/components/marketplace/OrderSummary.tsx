import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Tag } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  onCheckout?: () => void;
  checkoutLabel?: string;
  isLoading?: boolean;
}

export function OrderSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  currency = "USD",
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
  isLoading = false,
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const total = subtotal + shipping + tax - discount;

  const handleApplyPromo = () => {
    // Placeholder for promo code logic
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  return (
    <Card
      className="sticky top-4"
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
        backdropFilter: "blur(16px)",
      }}
      data-testid="order-summary"
    >
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Promo Code */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={promoApplied}
              data-testid="input-promo-code"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyPromo}
              disabled={promoApplied || !promoCode.trim()}
              data-testid="button-apply-promo"
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          {promoApplied && (
            <p className="text-xs text-[#40E0D0]">Promo code applied!</p>
          )}
        </div>

        <Separator className="bg-white/10" />

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
          </div>

          {shipping > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span data-testid="text-shipping">${shipping.toFixed(2)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span data-testid="text-tax">${tax.toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-[#40E0D0]">
              <span>Discount</span>
              <span data-testid="text-discount">-${discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-white/10" />

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span
            className="bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent"
            data-testid="text-cart-total"
          >
            ${total.toFixed(2)} {currency}
          </span>
        </div>
      </CardContent>

      {onCheckout && (
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
            onClick={onCheckout}
            disabled={isLoading}
            data-testid="button-checkout"
          >
            {isLoading ? "Processing..." : checkoutLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
