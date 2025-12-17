import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Package, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface SellerProfileCardProps {
  sellerId: number;
  name: string;
  username?: string;
  avatar?: string | null;
  bio?: string;
  rating?: number;
  totalProducts?: number;
  totalSales?: number;
  joinedDate?: Date;
}

export function SellerProfileCard({
  sellerId,
  name,
  username,
  avatar,
  bio,
  rating = 0,
  totalProducts = 0,
  totalSales = 0,
  joinedDate,
}: SellerProfileCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card
      className="overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
        backdropFilter: "blur(16px)",
      }}
      data-testid="seller-profile-card"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-[#40E0D0]/30">
            <AvatarImage src={avatar || undefined} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-[#40E0D0]/20 to-[#1E90FF]/20">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <Link href={`/profile/${sellerId}`}>
              <h3 className="font-semibold text-lg hover:text-[#40E0D0] transition-colors">
                {name}
              </h3>
            </Link>
            {username && (
              <p className="text-sm text-muted-foreground">@{username}</p>
            )}
            <div className="flex items-center gap-1 mt-1">
              {renderStars(rating)}
              <span className="text-xs text-muted-foreground ml-1">
                ({rating.toFixed(1)})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{bio}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
              {totalProducts}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Package className="w-3 h-3" />
              Products
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
              {totalSales}
            </div>
            <div className="text-xs text-muted-foreground">Sales</div>
          </div>
        </div>

        {joinedDate && (
          <p className="text-xs text-muted-foreground text-center">
            Seller since {new Date(joinedDate).toLocaleDateString("en-US", { 
              month: "short", 
              year: "numeric" 
            })}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            View Shop
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
