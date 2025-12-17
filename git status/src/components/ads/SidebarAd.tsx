import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { PlatformAd } from "@shared/adSchemas";

interface SidebarAdProps {
  placement?: "feed" | "events" | "profile";
}

export function SidebarAd({ placement = "feed" }: SidebarAdProps) {
  const { user } = useAuth();
  const [ad, setAd] = useState<PlatformAd | null>(null);
  const [impressionId, setImpressionId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

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
  }, [user, placement]);

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
    <Card className="overflow-hidden" data-testid="card-sidebar-ad">
      <div className="px-4 pt-3 pb-2">
        <Badge variant="outline" className="text-xs" data-testid="badge-sponsored">
          Sponsored
        </Badge>
      </div>

      {ad.imageUrl && (
        <div className="relative aspect-square overflow-hidden">
          <img
            src={ad.imageUrl}
            alt={ad.title || "Advertisement"}
            className="w-full h-full object-cover"
            data-testid="img-sidebar-ad"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {ad.title && (
          <h4 className="font-semibold line-clamp-2" data-testid="text-sidebar-title">
            {ad.title}
          </h4>
        )}
        
        {ad.description && (
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-sidebar-description">
            {ad.description}
          </p>
        )}

        <Button
          onClick={handleClick}
          size="sm"
          className="w-full gap-2"
          data-testid="button-sidebar-cta"
        >
          {ad.ctaText || "Learn More"}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
