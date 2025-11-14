import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface ProductReviewCardProps {
  id: number;
  rating: number;
  comment?: string;
  reviewerName: string;
  reviewerAvatar?: string | null;
  createdAt: Date;
  verifiedPurchase?: boolean;
}

export function ProductReviewCard({
  rating,
  comment,
  reviewerName,
  reviewerAvatar,
  createdAt,
  verifiedPurchase = false,
}: ProductReviewCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div
      className="p-4 rounded-lg border border-white/10 space-y-3"
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.70) 0%, rgba(30, 144, 255, 0.08) 100%)",
        backdropFilter: "blur(8px)",
      }}
      data-testid="product-review-card"
    >
      {/* Reviewer Info */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={reviewerAvatar || undefined} alt={reviewerName} />
          <AvatarFallback className="bg-gradient-to-br from-[#40E0D0]/20 to-[#1E90FF]/20">
            {reviewerName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm">{reviewerName}</p>
            <p className="text-xs text-muted-foreground">
              {safeDateDistance(createdAt, { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">{renderStars(rating)}</div>
            {verifiedPurchase && (
              <span className="text-xs text-[#40E0D0]">✓ Verified Purchase</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Content */}
      {comment && (
        <p className="text-sm text-foreground/90 leading-relaxed">{comment}</p>
      )}
    </div>
  );
}
