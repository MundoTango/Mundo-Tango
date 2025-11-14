import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { PlatformAd } from "@shared/adSchemas";

interface BannerAdProps {
  placement: "events" | "housing" | "map";
}

export function BannerAd({ placement }: BannerAdProps) {
  const { user } = useAuth();
  const [ad, setAd] = useState<PlatformAd | null>(null);
  const [impressionId, setImpressionId] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!user || isDismissed) return;

    const fetchAd = async () => {
      try {
        const response = await fetch(`/api/ads/display?placement=${placement}`, {
          credentials: "include",
        });
        const data = await response.json();
        
        if (data.ad) {
          setAd(data.ad);
          
          // Track impression
          const impressionResponse = await apiRequest("POST", "/api/ads/impression", {
            adId: data.ad.id,
            placement,
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
  }, [user, placement, isDismissed]);

  const handleClick = async () => {
    if (!ad) return;

    try {
      await apiRequest("POST", "/api/ads/click", {
        adId: ad.id,
        impressionId,
      });

      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!ad || isDismissed) return null;

  return (
    <div 
      className="relative bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border rounded-lg overflow-hidden mb-6"
      data-testid="banner-ad"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0">
          <Badge variant="outline" className="text-xs" data-testid="badge-advertisement">
            Advertisement
          </Badge>
        </div>

        {ad.imageUrl && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
            <img
              src={ad.imageUrl}
              alt={ad.title || "Ad"}
              className="w-full h-full object-cover"
              data-testid="img-banner-ad"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {ad.title && (
            <h4 className="font-semibold mb-1 line-clamp-1" data-testid="text-banner-title">
              {ad.title}
            </h4>
          )}
          {ad.description && (
            <p className="text-sm text-muted-foreground line-clamp-2" data-testid="text-banner-description">
              {ad.description}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          <Button
            onClick={handleClick}
            size="sm"
            data-testid="button-banner-cta"
          >
            {ad.ctaText || "Learn More"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8"
            data-testid="button-dismiss-ad"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
