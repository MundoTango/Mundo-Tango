import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Wifi, Coffee, Utensils, Check, X } from "lucide-react";

interface AccommodationCardProps {
  accommodation: {
    id?: number;
    name: string;
    address?: string;
    rating?: number;
    price?: number;
    currency?: string;
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    imageUrl?: string;
    bookingUrl?: string;
    isBooked?: boolean;
  };
}

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  breakfast: Coffee,
  restaurant: Utensils,
};

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-accommodation-${accommodation.id}`}>
      <div className="relative h-48">
        <img
          src={accommodation.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"}
          alt={accommodation.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {accommodation.isBooked && (
          <Badge className="absolute top-4 right-4 bg-green-500 text-white">
            <Check className="h-3 w-3 mr-1" />
            Booked
          </Badge>
        )}
        {accommodation.rating && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-medium">{accommodation.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{accommodation.name}</CardTitle>
        {accommodation.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{accommodation.address}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {(accommodation.checkIn || accommodation.checkOut) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {accommodation.checkIn && (
              <div>
                <p className="text-muted-foreground mb-1">Check-in</p>
                <p className="font-medium">{accommodation.checkIn}</p>
              </div>
            )}
            {accommodation.checkOut && (
              <div>
                <p className="text-muted-foreground mb-1">Check-out</p>
                <p className="font-medium">{accommodation.checkOut}</p>
              </div>
            )}
          </div>
        )}

        {accommodation.amenities && accommodation.amenities.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Check;
                return (
                  <Badge key={amenity} variant="outline" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {amenity}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {accommodation.price && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Price per night</p>
              <p className="text-2xl font-bold text-primary">
                {accommodation.currency || "$"}{accommodation.price}
              </p>
            </div>
            {accommodation.bookingUrl && (
              <Button asChild data-testid={`button-book-accommodation-${accommodation.id}`}>
                <a href={accommodation.bookingUrl} target="_blank" rel="noopener noreferrer">
                  {accommodation.isBooked ? "View Booking" : "Book Now"}
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
