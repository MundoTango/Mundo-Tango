import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingBag, Tag, Clock, Search, Star } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import marketplaceHeroImage from "@assets/stock_images/business_team_meetin_caa5de6b.jpg";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Build proper query URL with category filter
  const queryUrl = activeTab === "all" 
    ? "/api/marketplace/items" 
    : `/api/marketplace/items?category=${activeTab}`;

  const { data: items, isLoading } = useQuery({
    queryKey: [queryUrl],
  });

  // Filter items by search query
  const filteredItems = items && Array.isArray(items) 
    ? items.filter((item: any) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Determine status badge based on item data
  const getStatusBadge = (item: any) => {
    if (item.status === 'sold') {
      return <Badge variant="destructive">Sold</Badge>;
    }
    if (item.status === 'reserved') {
      return <Badge className="bg-yellow-600">Reserved</Badge>;
    }
    return <Badge className="bg-green-600">Available</Badge>;
  };

  return (
    <SelfHealingErrorBoundary pageName="Marketplace" fallbackRoute="/feed">
      <PageLayout title="Tango Marketplace" showBreadcrumbs>
        
        {/* Editorial Hero Section - 16:9 */}
        <div className="relative aspect-video w-full overflow-hidden mb-16" data-testid="hero-marketplace">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${marketplaceHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-marketplace">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Tango Marketplace
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight max-w-4xl" data-testid="heading-hero">
              Discover Authentic Tango Treasures
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mb-8">
              Buy and sell premium tango shoes, clothing, music, and accessories from passionate dancers worldwide
            </p>
          </motion.div>
        </div>

        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-6xl">

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-marketplace"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all" data-testid="tab-all">All Items</TabsTrigger>
                <TabsTrigger value="shoes" data-testid="tab-shoes">Shoes</TabsTrigger>
                <TabsTrigger value="clothing" data-testid="tab-clothing">Clothing</TabsTrigger>
                <TabsTrigger value="music" data-testid="tab-music">Music</TabsTrigger>
                <TabsTrigger value="accessories" data-testid="tab-accessories">Accessories</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="text-center py-12">Loading items...</div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item: any, idx: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                      >
                      <Card className="hover-elevate" data-testid={`item-card-${item.id}`}>
                        {/* 16:9 Editorial Image */}
                        {item.image && (
                          <div className="aspect-video bg-muted overflow-hidden relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="object-cover w-full h-full"
                            />
                            {/* Status Badge Overlay */}
                            <div className="absolute top-2 right-2">
                              {getStatusBadge(item)}
                            </div>
                          </div>
                        )}

                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg font-serif font-bold line-clamp-2">
                              {item.title}
                            </CardTitle>
                            {item.condition && (
                              <Badge variant="secondary">{item.condition}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              ${item.price}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Seller Info */}
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.seller?.profileImage} />
                              <AvatarFallback>{item.seller?.name?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.seller?.name || "Anonymous Seller"}
                              </p>
                              {item.seller?.rating && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{item.seller.rating.toFixed(1)}</span>
                                  {item.seller.reviewCount && (
                                    <span>({item.seller.reviewCount})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {item.postedDate || "Recently posted"}
                            </div>
                            {item.location && (
                              <span>{item.location}</span>
                            )}
                          </div>

                          <Link href={`/marketplace/${item.id}`}>
                            <Button 
                              className="w-full" 
                              data-testid={`button-view-${item.id}`}
                              disabled={item.status === 'sold'}
                            >
                              {item.status === 'sold' ? 'Sold Out' : 'View Details'}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>{searchQuery ? 'No items match your search' : 'No items available in this category'}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
