import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Bath, DollarSign } from "lucide-react";
import type { SelectHousingListing } from "@shared/schema";

interface ListingCardProps {
  listing: SelectHousingListing & {
    host?: {
      id: number;
      name: string;
      email: string;
    };
  };
  onClick?: () => void;
}

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const coverPhoto = listing.coverPhotoUrl || listing.images?.[0] || "/placeholder-house.jpg";

  return (
    <Card
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid={`card-listing-${listing.id}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={coverPhoto}
          alt={listing.title}
          className="w-full h-full object-cover"
          data-testid={`img-listing-cover-${listing.id}`}
        />
        {listing.verificationStatus === "verified" && (
          <Badge
            className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm"
            data-testid="badge-verified"
          >
            Verified
          </Badge>
        )}
      </div>

      <CardHeader className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1" data-testid="text-listing-title">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1" data-testid="text-listing-location">
            {listing.city}, {listing.country}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid="text-listing-description">
          {listing.description}
        </p>

        <div className="flex items-center gap-4 text-sm">
          {listing.bedrooms && (
            <div className="flex items-center gap-1" data-testid="info-bedrooms">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1" data-testid="info-bathrooms">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}</span>
            </div>
          )}
          {listing.maxGuests && (
            <div className="flex items-center gap-1" data-testid="info-guests">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{listing.maxGuests} guest{listing.maxGuests > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {listing.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{listing.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex items-baseline gap-1 w-full justify-between">
          <div className="flex items-baseline gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold" data-testid="text-listing-price">
              {listing.pricePerNight}
            </span>
            <span className="text-sm text-muted-foreground">
              {listing.currency || "USD"} / night
            </span>
          </div>
          <Badge variant="outline" data-testid="badge-property-type">
            {listing.propertyType}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
