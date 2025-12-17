import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Home, Wifi, Car, Coffee, Star, Heart, Share2, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  kitchen: Coffee,
};

export default function HousingListingDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: listingData, isLoading } = useQuery<any>({
    queryKey: ["/api/housing/listings", id],
  });

  const { data: reviews } = useQuery<any[]>({
    queryKey: ["/api/housing/listings", id, "reviews"],
    enabled: false, // Not implemented yet
  });

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/housing/favorites/${id}`, "POST"),
    onSuccess: () => {
      toast({ title: "Added to favorites!" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading listing...</p>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const listing = listingData.listing;
  const host = listingData.host;
  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl p-4 space-y-6">
        {images.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-96 overflow-hidden rounded-lg">
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {images.slice(1, 5).map((img: string, idx: number) => (
                  <div key={idx} className="h-44 overflow-hidden rounded-lg">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl" data-testid="text-listing-title">
                  {listing.title}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.city}, {listing.country}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge>{listing.propertyType}</Badge>
                  {listing.bedrooms && <Badge variant="outline">{listing.bedrooms} bedrooms</Badge>}
                  {listing.bathrooms && <Badge variant="outline">{listing.bathrooms} bathrooms</Badge>}
                  {listing.maxGuests && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Up to {listing.maxGuests} guests
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => favoriteMutation.mutate()}
                  data-testid="button-favorite"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied!" });
                  }}
                  data-testid="button-share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">About this place</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Amenities</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {listing.amenities?.map((amenity: string) => {
                  const Icon = amenityIcons[amenity.toLowerCase()] || Home;
                  return (
                    <div key={amenity} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {listing.houseRules && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">House Rules</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.houseRules}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Hosted by</h3>
              {host && (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={host.profileImage} />
                    <AvatarFallback>{host.name?.charAt(0) || "H"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{host.name}</p>
                    <p className="text-sm text-muted-foreground">{host.email}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/messages?to=${host.id}`}>Contact Host</Link>
                  </Button>
                </div>
              )}
            </div>

            {reviews && reviews.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>R</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Guest</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold">${listing.pricePerNight}</span>
                  <span className="text-muted-foreground">/night</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {listing.currency || "USD"}
                </p>
              </div>
              <Button size="lg" data-testid="button-book">
                Request to Book
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
