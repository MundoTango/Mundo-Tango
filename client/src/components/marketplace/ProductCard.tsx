import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Link } from "wouter";

interface ProductCardProps {
  id: number;
  title: string;
  description?: string;
  price: string | number;
  currency?: string;
  category?: string;
  imageUrl?: string | null;
  rating?: number;
  totalSales?: number;
  sellerName?: string;
  sellerAvatar?: string | null;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  title,
  price,
  currency = "USD",
  category,
  imageUrl,
  rating = 0,
  totalSales = 0,
  sellerName,
  isFeatured,
}: ProductCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < fullStars
              ? "fill-yellow-400 text-yellow-400"
              : i === fullStars && hasHalfStar
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card
      className="group relative hover-elevate active-elevate-2 overflow-hidden rounded-lg border border-white/10"
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
        backdropFilter: "blur(12px)",
      }}
      data-testid={`card-product-${id}`}
    >
      <Link href={`/marketplace/product/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#40E0D0]/20 to-[#1E90FF]/20">
              <ShoppingCart className="w-16 h-16 text-white/20" />
            </div>
          )}

          {isFeatured && (
            <Badge
              className="absolute top-2 left-2 bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] border-0"
              data-testid="badge-featured"
            >
              Featured
            </Badge>
          )}

          {category && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2"
              data-testid="badge-category"
            >
              {category}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link href={`/marketplace/product/${id}`}>
          <h3 className="font-semibold text-base line-clamp-2 hover:text-[#40E0D0] transition-colors">
            {title}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">{renderStars(rating)}</div>
            <span className="text-xs text-muted-foreground">
              ({totalSales} sales)
            </span>
          </div>
        )}

        {sellerName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            by <span className="text-foreground/80">{sellerName}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
            ${typeof price === 'number' ? price.toFixed(2) : price}
          </span>
          <span className="text-xs text-muted-foreground">{currency}</span>
        </div>

        <Button
          size="sm"
          className="bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
          data-testid="button-quick-add"
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
