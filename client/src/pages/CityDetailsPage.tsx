import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";
import { fromCitySlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * CityDetailsPage - Redirects to GroupDetailsPage using legacyGroupId
 * Cities use the approved GroupDetailsPage template for consistent UX
 */
export default function CityDetailsPage() {
  const [, params] = useRoute("/cities/:citySlug");
  const rawSlug = params?.citySlug || "";
  const cityName = fromCitySlug(rawSlug);
  
  // Look up city by slug to get legacyGroupId
  const { data: city, isLoading, error } = useQuery<{
    id: number;
    slug: string;
    name: string;
    country: string;
    legacyGroupId?: number;
  }>({
    queryKey: ["/api/cities/by-slug", rawSlug],
    queryFn: async () => {
      const res = await fetch(`/api/cities/by-slug/${encodeURIComponent(rawSlug)}`);
      if (!res.ok) {
        throw new Error("City not found");
      }
      return res.json();
    },
    enabled: !!rawSlug,
    retry: false
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading {cityName} community...</p>
      </div>
    );
  }
  
  // City not found
  if (error || !city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <MapPin className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">City not found</h2>
        <p className="text-muted-foreground">The city "{cityName}" doesn't exist yet.</p>
        <Link href="/community-world-map">
          <Button>Explore World Map</Button>
        </Link>
      </div>
    );
  }
  
  // Redirect to GroupDetailsPage using legacyGroupId (approved design)
  if (city.legacyGroupId) {
    return <Redirect to={`/groups/${city.legacyGroupId}`} />;
  }
  
  // Fallback: redirect to world map if no legacyGroupId
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <MapPin className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{city.name}, {city.country}</h2>
      <p className="text-muted-foreground">This city community is being set up.</p>
      <Link href="/community-world-map">
        <Button>Explore World Map</Button>
      </Link>
    </div>
  );
}
