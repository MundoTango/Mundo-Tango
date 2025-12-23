import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/marketplace/ProductGallery";
import { SellerProfileCard } from "@/components/marketplace/SellerProfileCard";
import { ProductReviewCard } from "@/components/marketplace/ProductReviewCard";
import { VariantSelector, ProductVariant } from "@/components/marketplace/VariantSelector";
import { ShoppingCart, Heart, Share2, ChevronLeft, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function MarketplaceProductDetailPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ["/api/marketplace/items", id],
  });

  const product = productData?.item || {};
  const seller = productData?.seller || {};

  // Mock variants - in real app these would come from API
  const variants: ProductVariant[] = product.hasVariants ? [
    { name: "Size", options: ["S", "M", "L", "XL"] },
    { name: "Color", options: ["Black", "Brown", "Tan"] },
  ] : [];

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/marketplace/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          quantity,
          variants: selectedVariants,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('pages:marketplaceProductDetail.addedToCart', 'Added to cart'),
        description: t('pages:marketplaceProductDetail.itemAddedDesc', '{{title}} has been added to your cart', { title: product.title }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/cart"] });
    },
    onError: () => {
      toast({
        title: t('common:error', 'Error'),
        description: t('pages:marketplaceProductDetail.failedToAdd', 'Failed to add item to cart'),
        variant: "destructive",
      });
    },
  });

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: value }));
  };

  const handleAddToCart = () => {
    if (variants.length > 0 && Object.keys(selectedVariants).length !== variants.length) {
      toast({
        title: t('pages:marketplaceProductDetail.selectAllOptions', 'Please select all options'),
        description: t('pages:marketplaceProductDetail.selectVariants', 'Select size, color, and other variants before adding to cart'),
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-muted-foreground">{t('pages:marketplaceProductDetail.loading', 'Loading product...')}</div>
      </div>
    );
  }

  if (!product.id) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/marketplace">
            <Button variant="ghost" className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('pages:marketplaceProductDetail.backToMarketplace', 'Back to Marketplace')}
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('pages:marketplaceProductDetail.productNotFound', 'Product not found')}</p>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800"];

  // Mock reviews - in real app these would come from API
  const reviews = [
    {
      id: 1,
      rating: 5,
      comment: "Excellent quality! Exactly as described.",
      reviewerName: "Maria Rodriguez",
      reviewerAvatar: null,
      createdAt: new Date(Date.now() - 86400000 * 7),
      verifiedPurchase: true,
    },
    {
      id: 2,
      rating: 4,
      comment: "Great product, fast shipping.",
      reviewerName: "John Smith",
      reviewerAvatar: null,
      createdAt: new Date(Date.now() - 86400000 * 14),
      verifiedPurchase: true,
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/marketplace">
          <Button variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('pages:marketplaceProductDetail.backToMarketplace', 'Back to Marketplace')}
          </Button>
        </Link>

        {/* Product Details Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Product Gallery */}
          <div>
            <ProductGallery images={images} productTitle={product.title || "Product"} />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
                  ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                </span>
                <span className="text-muted-foreground">{product.currency || "USD"}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">{product.description}</p>
            </div>

            <Separator className="bg-white/10" />

            {/* Variant Selector */}
            {variants.length > 0 && (
              <>
                <VariantSelector
                  variants={variants}
                  selectedVariants={selectedVariants}
                  onChange={handleVariantChange}
                />
                <Separator className="bg-white/10" />
              </>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('pages:marketplaceProductDetail.quantity', 'Quantity')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addToCartMutation.isPending ? t('pages:marketplaceProductDetail.adding', 'Adding...') : t('pages:marketplaceProductDetail.addToCart', 'Add to Cart')}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" data-testid="button-wishlist">
                  <Heart className="w-4 h-4 mr-2" />
                  {t('pages:marketplaceProductDetail.wishlist', 'Wishlist')}
                </Button>
                <Button variant="outline" size="lg" data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('pages:marketplaceProductDetail.share', 'Share')}
                </Button>
              </div>
            </div>

            {/* Seller Info Card */}
            <SellerProfileCard
              sellerId={seller.id || 0}
              name={seller.name || "Anonymous Seller"}
              username={seller.username}
              avatar={seller.profileImage}
              bio={seller.bio}
              rating={4.8}
              totalProducts={12}
              totalSales={156}
              joinedDate={new Date("2023-01-15")}
            />
          </div>
        </div>

        {/* Reviews and Related Products */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">{t('pages:marketplaceProductDetail.reviews', 'Reviews')} ({reviews.length})</TabsTrigger>
            <TabsTrigger value="description">{t('pages:marketplaceProductDetail.fullDescription', 'Full Description')}</TabsTrigger>
            <TabsTrigger value="shipping">{t('pages:marketplaceProductDetail.shippingInfo', 'Shipping Info')}</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {reviews.map((review) => (
              <ProductReviewCard key={review.id} {...review} />
            ))}
          </TabsContent>

          <TabsContent value="description" className="mt-6">
            <Card
              style={{
                background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
                backdropFilter: "blur(16px)",
              }}
            >
              <CardContent className="p-6">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {product.description || t('pages:marketplaceProductDetail.noDescription', 'No detailed description available.')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card
              style={{
                background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
                backdropFilter: "blur(16px)",
              }}
            >
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages:marketplaceProductDetail.standardShipping', 'Standard Shipping')}</span>
                  <span className="font-medium">{t('pages:marketplaceProductDetail.standardDays', '5-7 business days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages:marketplaceProductDetail.expressShipping', 'Express Shipping')}</span>
                  <span className="font-medium">{t('pages:marketplaceProductDetail.expressDays', '2-3 business days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages:marketplaceProductDetail.international', 'International')}</span>
                  <span className="font-medium">{t('pages:marketplaceProductDetail.internationalDays', '10-14 business days')}</span>
                </div>
                <Separator className="bg-white/10 my-3" />
                <p className="text-muted-foreground">
                  {t('pages:marketplaceProductDetail.freeShippingNote', 'Free shipping on orders over $50. International shipping available to most countries.')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
