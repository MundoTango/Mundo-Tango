import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/marketplace/CartItem";
import { OrderSummary } from "@/components/marketplace/OrderSummary";
import { ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MarketplaceCartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch cart items - using mock data for now
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["/api/marketplace/cart"],
  });

  // Mock cart items for demonstration
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Premium Tango Shoes - Leather",
      price: 129.99,
      currency: "USD",
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200",
      variant: "Size: 9, Color: Black",
    },
    {
      id: 2,
      title: "Tango Music Collection - Digital Download",
      price: 29.99,
      currency: "USD",
      quantity: 2,
      imageUrl: null,
      variant: undefined,
    },
  ]);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    navigate("/marketplace/checkout");
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = 0;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          <div
            className="p-12 rounded-lg border border-white/10 text-center space-y-4"
            style={{
              background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
              backdropFilter: "blur(16px)",
            }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Browse our marketplace to find amazing products from creators
            </p>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Link href="/marketplace">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="p-4 rounded-lg border border-white/10"
              style={{
                background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
                backdropFilter: "blur(16px)",
              }}
            >
              <h2 className="text-lg font-semibold mb-4">
                Items ({cartItems.length})
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              currency="USD"
              onCheckout={handleCheckout}
              checkoutLabel="Proceed to Checkout"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
