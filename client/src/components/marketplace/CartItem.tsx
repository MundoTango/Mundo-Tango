import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface CartItemProps {
  id: number;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string | null;
  variant?: string;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export function CartItem({
  id,
  title,
  price,
  currency,
  quantity,
  imageUrl,
  variant,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;

  return (
    <div
      className="flex gap-4 p-4 rounded-lg border border-white/10"
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.80) 0%, rgba(30, 144, 255, 0.08) 100%)",
        backdropFilter: "blur(8px)",
      }}
      data-testid={`cart-item-${id}`}
    >
      {/* Product Image */}
      <Link href={`/marketplace/product/${id}`}>
        <div className="w-20 h-20 rounded overflow-hidden bg-black/20 flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#40E0D0]/20 to-[#1E90FF]/20" />
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/marketplace/product/${id}`}>
          <h4 className="font-semibold text-sm line-clamp-1 hover:text-[#40E0D0] transition-colors">
            {title}
          </h4>
        </Link>
        {variant && (
          <p className="text-xs text-muted-foreground mt-1">{variant}</p>
        )}
        <p className="text-sm font-medium mt-1">
          ${price.toFixed(2)} {currency}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onRemove(id)}
          data-testid={`button-remove-${id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded"
            onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            data-testid={`button-decrease-${id}`}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center" data-testid={`quantity-${id}`}>
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded"
            onClick={() => onQuantityChange(id, quantity + 1)}
            data-testid={`button-increase-${id}`}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <p className="text-sm font-bold" data-testid={`subtotal-${id}`}>
          ${subtotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
