import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, ShoppingCart, Heart } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function MarketplaceItemPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:marketplaceItem.pageName', 'Marketplace Item')} fallbackRoute="/marketplace">
      <PageLayout title={t('pages:marketplaceItem.pageTitle', 'Professional Tango Shoes - Size 8')} showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-square bg-muted mb-4 overflow-hidden rounded-lg">
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                <p className="text-muted-foreground">{t('pages:marketplaceItem.productImage', 'Product Image')}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{t('pages:marketplaceItem.likeNew', 'Like New')}</Badge>
                <Badge variant="outline">{t('pages:marketplaceItem.shoes', 'Shoes')}</Badge>
              </div>
              
              <p className="text-4xl font-bold text-primary mb-4">$150</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pages:marketplaceItem.sellerInfo', 'Seller Information')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{t('pages:marketplaceItem.sellerName', 'Jane Doe')}</p>
                    <p className="text-sm text-muted-foreground">{t('pages:marketplaceItem.memberSince', 'Member since 2023')}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('pages:marketplaceItem.location', 'New York, NY')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('pages:marketplaceItem.posted2Days', 'Posted 2 days ago')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pages:marketplaceItem.description', 'Description')}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  {t('pages:marketplaceItem.descriptionText', 'Beautiful professional tango shoes in excellent condition. Barely worn, like new. Comfortable and elegant design perfect for social dancing or performances. Size 8 (US women\'s). Comes with original box.')}
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1" data-testid="button-buy">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('pages:marketplaceItem.buyNow', 'Buy Now')}
              </Button>
              <Button variant="outline" data-testid="button-message">{t('pages:marketplaceItem.messageSeller', 'Message Seller')}</Button>
              <Button variant="outline" size="icon" data-testid="button-favorite">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
