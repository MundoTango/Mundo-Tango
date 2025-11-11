import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Heart, Share2, MapPin, Package, Shield, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  images: string[];
  sellerId: number;
  sellerName: string;
  sellerImage?: string;
  sellerRating: number;
  location: string;
  city: string;
  postedAt: string;
  isAvailable: boolean;
  isSaved: boolean;
}

export default function MarketplaceItemDetailPage() {
  const { itemId } = useParams();
  const { toast } = useToast();

  const { data: item, isLoading } = useQuery<MarketplaceItem>({
    queryKey: [`/api/marketplace/${itemId}`],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/marketplace/${itemId}/save`);
    },
    onSuccess: () => {
      toast({ title: "Item saved to favorites" });
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace/${itemId}`] });
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading item...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Item not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <Button variant="outline" asChild className="mb-6" data-testid="button-back">
            <Link href="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-item-title">
                          {item.title}
                        </h1>
                        <div className="flex gap-2">
                          <Badge>{item.category}</Badge>
                          <Badge variant="outline">{item.condition}</Badge>
                          {item.isAvailable && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-primary mb-6">
                      {item.currency}{item.price.toLocaleString()}
                    </div>

                    <div className="border-t border-border pt-6 mb-6">
                      <h3 className="font-semibold text-foreground mb-3">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold text-foreground mb-3">Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Condition:</span>
                          <span className="ml-2 font-semibold text-foreground">{item.condition}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <span className="ml-2 font-semibold text-foreground">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.city}, {item.location}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posted:</span>
                          <span className="ml-2 font-semibold text-foreground">
                            {format(new Date(item.postedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="mb-6 sticky top-4">
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={item.sellerImage} />
                      <AvatarFallback>{item.sellerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{item.sellerName}</div>
                      <div className="text-sm text-muted-foreground">
                        ⭐ {item.sellerRating.toFixed(1)} rating
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" data-testid="button-contact-seller">
                      Contact Seller
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      data-testid="button-save-item"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {item.isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" data-testid="button-share-item">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Buyer protection included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Meet in public places</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
