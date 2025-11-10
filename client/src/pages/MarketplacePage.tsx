import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Tag, Clock } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/marketplace/items", activeTab],
  });

  return (
    <SelfHealingErrorBoundary pageName="Marketplace" fallbackRoute="/feed">
      <PageLayout title="Tango Marketplace" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

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
            ) : items && Array.isArray(items) && items.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item: any) => (
                  <Card key={item.id} className="hover-elevate" data-testid={`item-card-${item.id}`}>
                    {/* Image */}
                    {item.image && (
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
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
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.postedDate}
                        </div>
                        {item.location && (
                          <span>{item.location}</span>
                        )}
                      </div>

                      <Link href={`/marketplace/${item.id}`}>
                        <Button className="w-full" data-testid={`button-view-${item.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No items available in this category</p>
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
