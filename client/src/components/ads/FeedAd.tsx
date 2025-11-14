import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { PlatformAd } from "@shared/adSchemas";

export function FeedAd() {
  const { user } = useAuth();
  const [ad, setAd] = useState<PlatformAd | null>(null);
  const [impressionId, setImpressionId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch ad for feed placement
    const fetchAd = async () => {
      try {
        const response = await fetch("/api/ads/display?placement=feed", {
          credentials: "include",
        });
        const data = await response.json();
        
        if (data.ad) {
          setAd(data.ad);
          
          // Track impression
          const impressionResponse = await apiRequest("POST", "/api/ads/impression", {
            adId: data.ad.id,
            placement: "feed",
          });
          
          if (impressionResponse.ok) {
            const impressionData = await impressionResponse.json();
            setImpressionId(impressionData.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ad:", error);
      }
    };

    fetchAd();
  }, [user]);

  const handleClick = async () => {
    if (!ad) return;

    try {
      // Track click
      await apiRequest("POST", "/api/ads/click", {
        adId: ad.id,
        impressionId,
      });

      // Open target URL
      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  if (!ad) return null;

  return (
    <Card className="overflow-hidden" data-testid="card-feed-ad">
      <div className="px-4 pt-3 pb-2">
        <Badge variant="outline" className="text-xs" data-testid="badge-sponsored">
          Sponsored
        </Badge>
      </div>
      
      {ad.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={ad.imageUrl}
            alt={ad.title || "Advertisement"}
            className="w-full h-full object-cover"
            data-testid="img-ad-image"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {ad.title && (
          <h3 className="font-semibold text-lg line-clamp-2" data-testid="text-ad-title">
            {ad.title}
          </h3>
        )}
        
        {ad.description && (
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-ad-description">
            {ad.description}
          </p>
        )}

        <Button
          onClick={handleClick}
          className="w-full gap-2"
          data-testid="button-ad-cta"
        >
          {ad.ctaText || "Learn More"}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
