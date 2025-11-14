import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/housing/PhotoUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Home, MapPin, DollarSign, Users, Bed, Bath } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HousingListing {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  address: string;
  city: string;
  country: string;
  photos: Array<{
    id: string;
    url: string;
    publicId: string;
    caption?: string;
    order: number;
    isCover: boolean;
  }>;
}

export default function HostHomePage() {
  const [, params] = useRoute("/housing/host/:id");
  const listingId = params?.id ? parseInt(params.id) : null;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: listing, isLoading } = useQuery<HousingListing>({
    queryKey: ["/api/housing/listings", listingId],
    enabled: !!listingId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HousingListing>) => {
      return apiRequest(`/api/housing/listings/${listingId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/housing/listings", listingId] });
      toast({
        title: "Listing updated",
        description: "Your changes have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Home className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
        <p className="text-muted-foreground">
          The listing you're looking for doesn't exist
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-listing-title">
          {listing.title}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span data-testid="text-listing-location">
            {listing.city}, {listing.country}
          </span>
        </div>
      </div>

      {/* Photo Gallery */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Photos</h2>
        
        {/* Photo Grid */}
        {listing.photos && listing.photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {listing.photos
              .sort((a, b) => a.order - b.order)
              .map((photo, index) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <Card
                      className="overflow-hidden cursor-pointer hover-elevate"
                      onClick={() => setSelectedPhotoIndex(index)}
                      data-testid={`photo-preview-${index}`}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {photo.isCover && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                            Cover
                          </div>
                        )}
                      </div>
                      {photo.caption && (
                        <div className="p-3">
                          <p className="text-sm text-muted-foreground">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                    </Card>
                  </DialogTrigger>
                  
                  {/* Lightbox */}
                  <DialogContent className="max-w-4xl">
                    <div className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-auto rounded-lg"
                        data-testid={`lightbox-photo-${index}`}
                      />
                      {photo.caption && (
                        <p className="mt-4 text-center text-lg">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
          </div>
        )}

        {/* Photo Upload Component */}
        <PhotoUpload
          listingId={listing.id}
          initialPhotos={listing.photos || []}
          onPhotosChange={(photos) => {
            updateMutation.mutate({ photos } as any);
          }}
        />
      </Card>

      {/* Listing Details */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Listing Details</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-semibold" data-testid="text-bedrooms">
                {listing.bedrooms}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bath className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-semibold" data-testid="text-bathrooms">
                {listing.bathrooms}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Guests</p>
              <p className="font-semibold" data-testid="text-max-guests">
                {listing.maxGuests}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Per Night</p>
              <p className="font-semibold" data-testid="text-price">
                ${listing.pricePerNight}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={listing.description}
              readOnly
              className="min-h-32"
              data-testid="textarea-description"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={listing.address}
              readOnly
              data-testid="input-address"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
