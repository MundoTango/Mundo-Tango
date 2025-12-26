import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HousingListingData {
  id: number;
  hostId: number;
  title: string;
  description?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  pricePerNight?: number | null;
  price?: string | null;
  currency?: string;
  minStay?: number | null;
  minNights?: number | null;
  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  beds?: number | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  images?: string[] | null;
  coverPhotoUrl?: string | null;
  weeklyDiscount?: number | null;
  isActive?: boolean;
  verificationStatus?: string | null;
  host?: {
    id: number;
    name: string;
    email: string;
    isSuperhost?: boolean;
  };
  reviewCount?: number;
  averageRating?: number;
  isGuestFavorite?: boolean;
  availableDates?: string;
}

interface AirbnbListingCardProps {
  listing: HousingListingData;
  onClick?: () => void;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
  showPricePin?: boolean;
}

export function AirbnbListingCard({ 
  listing, 
  onClick, 
  onFavorite,
  isFavorited = false
}: AirbnbListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const images = useMemo(() => {
    const rawPhotos = listing.photos || [];
    const photoUrls = rawPhotos.map((p: any) => {
      let url = typeof p === 'string' ? p : p.url;
      if (!url) return null;
      // Handle Replit attached_assets path correctly
      if (url.startsWith('attached_assets/')) {
        url = '/' + url;
      }
      return url.startsWith('http') || url.startsWith('/') ? url : `/${url}`;
    }).filter(Boolean);
    
    const imageUrls = (listing.images || []).map((url: string) => {
      let u = url;
      if (u.startsWith('attached_assets/')) {
        u = '/' + u;
      }
      return u.startsWith('http') || u.startsWith('/') ? u : `/${u}`;
    });
    
    const coverUrl = listing.coverPhotoUrl;
    let formattedCover = null;
    if (coverUrl) {
      let u = coverUrl;
      if (u.startsWith('attached_assets/')) {
        u = '/' + u;
      }
      formattedCover = u.startsWith('http') || u.startsWith('/') ? u : `/${u}`;
    }
    
    const all = [
      ...(formattedCover ? [formattedCover] : []),
      ...imageUrls,
      ...photoUrls
    ];
    
    // De-duplicate URLs
    const unique = Array.from(new Set(all));
    
    return unique.length > 0 ? unique : ["/placeholder-house.jpg"];
  }, [listing.photos, listing.images, listing.coverPhotoUrl]);
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(listing.id);
  };

  const priceValue = listing.pricePerNight || (listing.price ? parseInt(listing.price) : 0);
  const hasDiscount = listing.weeklyDiscount && listing.weeklyDiscount > 0;
  const discountedPrice = hasDiscount 
    ? Math.round(priceValue * (1 - (listing.weeklyDiscount || 0) / 100))
    : priceValue;
  const bedroomCount = listing.bedrooms || 1;
  const bedCount = listing.beds || bedroomCount;

  return (
    <Card
      className="overflow-hidden cursor-pointer border-0 shadow-none bg-transparent group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-airbnb-listing-${listing.id}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={images[currentImageIndex]}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300"
          data-testid={`img-listing-${listing.id}`}
        />
        
        {/* Badges - Guest Favorite / Superhost */}
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.isGuestFavorite && (
            <Badge 
              className="bg-white text-black font-medium px-2 py-1 rounded-full shadow-md"
              data-testid="badge-guest-favorite"
            >
              Guest favorite
            </Badge>
          )}
          {listing.host?.isSuperhost && (
            <Badge 
              className="bg-white text-black font-medium px-2 py-1 rounded-full shadow-md"
              data-testid="badge-superhost"
            >
              Superhost
            </Badge>
          )}
        </div>
        
        {/* Favorite Heart Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-transparent hover:bg-transparent"
          onClick={handleFavorite}
          data-testid="button-favorite"
        >
          <Heart 
            className={cn(
              "h-6 w-6 transition-colors",
              isFavorited 
                ? "fill-red-500 text-red-500" 
                : "fill-black/30 text-white stroke-[2]"
            )}
          />
        </Button>
        
        {/* Image Navigation - Only show on hover and if multiple images */}
        {images.length > 1 && isHovered && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
              onClick={handlePrevImage}
              data-testid="button-prev-image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
              onClick={handleNextImage}
              data-testid="button-next-image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 5).map((_, idx: number) => (
              <div
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  idx === currentImageIndex ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Listing Details */}
      <div className="pt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[15px] line-clamp-1" data-testid="text-listing-title">
            {listing.listingType === "private_room" ? "Room in " : ""}{listing.city || "Location"}
          </h3>
          {listing.averageRating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-medium" data-testid="text-rating">
                {listing.averageRating.toFixed(2)}
              </span>
              {listing.reviewCount && (
                <span className="text-sm text-muted-foreground">
                  ({listing.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-1" data-testid="text-subtitle">
          {listing.title}
        </p>
        
        <p className="text-sm text-muted-foreground" data-testid="text-property-details">
          {bedroomCount} bedroom{bedroomCount !== 1 ? "s" : ""} · {bedCount} bed{bedCount !== 1 ? "s" : ""}
        </p>
        
        {listing.availableDates && (
          <p className="text-sm text-muted-foreground" data-testid="text-dates">
            {listing.availableDates}
          </p>
        )}
        
        {/* Pricing */}
        <div className="flex items-baseline gap-1 pt-1">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through" data-testid="text-original-price">
              ${priceValue}
            </span>
          )}
          <span className="font-semibold" data-testid="text-price">
            ${discountedPrice}
          </span>
          <span className="text-sm">
            {hasDiscount ? `for ${listing.minNights || listing.minStay || 5} nights` : "night"}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function AirbnbPricePin({ 
  price, 
  isSelected = false,
  onClick 
}: { 
  price: number; 
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full font-semibold text-sm transition-all shadow-md",
        isSelected 
          ? "bg-black text-white scale-110" 
          : "bg-white text-black hover:scale-105 hover:bg-black hover:text-white"
      )}
      data-testid={`pin-price-${price}`}
    >
      ${price}
    </button>
  );
}
