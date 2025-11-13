import { useState } from "react";
import { CheckoutWizard, CheckoutData } from "@/components/marketplace/CheckoutWizard";
import { OrderSummary } from "@/components/marketplace/OrderSummary";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function MarketplaceCheckoutPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Mock cart summary
  const orderSummary = {
    subtotal: 159.97,
    shipping: 9.99,
    tax: 12.80,
    discount: 0,
    currency: "USD",
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutData) => {
      // In production, this would create a Stripe checkout session
      return apiRequest("/api/marketplace/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: data.shipping,
          paymentMethod: data.payment.method,
          items: [], // Would come from cart
        }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.orderId || '12345'} has been confirmed`,
      });
      // In production, redirect to Stripe checkout or order confirmation
      setTimeout(() => {
        navigate("/marketplace/orders");
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckoutComplete = (data: CheckoutData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Wizard */}
          <div className="lg:col-span-2">
            <CheckoutWizard
              onComplete={handleCheckoutComplete}
              isProcessing={createOrderMutation.isPending}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              {...orderSummary}
              checkoutLabel="Complete Purchase"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
