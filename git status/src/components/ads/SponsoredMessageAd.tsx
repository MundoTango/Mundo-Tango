import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { PlatformAd } from "@shared/adSchemas";

export function SponsoredMessageAd() {
  const { user } = useAuth();
  const [ad, setAd] = useState<PlatformAd | null>(null);
  const [impressionId, setImpressionId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAd = async () => {
      try {
        const response = await fetch("/api/ads/display?placement=messages", {
          credentials: "include",
        });
        const data = await response.json();
        
        if (data.ad) {
          setAd(data.ad);
          
          // Track impression
          const impressionResponse = await apiRequest("POST", "/api/ads/impression", {
            adId: data.ad.id,
            placement: "messages",
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
      await apiRequest("POST", "/api/ads/click", {
        adId: ad.id,
        impressionId,
      });

      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  if (!ad) return null;

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer" 
      onClick={handleClick}
      data-testid="card-sponsored-message"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={ad.imageUrl || undefined} alt={ad.advertiser} />
          <AvatarFallback>{ad.advertiser.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold" data-testid="text-advertiser-name">
              {ad.advertiser}
            </span>
            <Badge variant="outline" className="text-xs gap-1" data-testid="badge-sponsored-message">
              <Star className="h-3 w-3 fill-current" />
              Sponsored
            </Badge>
          </div>

          {ad.title && (
            <p className="font-medium mb-1" data-testid="text-sponsored-title">
              {ad.title}
            </p>
          )}

          {ad.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid="text-sponsored-description">
              {ad.description}
            </p>
          )}

          <Button size="sm" data-testid="button-sponsored-cta">
            {ad.ctaText || "Learn More"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
