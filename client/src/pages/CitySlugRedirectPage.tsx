import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/**
 * Sanitize city slug to readable city name
 * Handles dashes, underscores, and URL-encoded characters
 */
function sanitizeCitySlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CitySlugRedirectPage() {
  const [, params] = useRoute("/city/:citySlug");
  const citySlug = sanitizeCitySlug(params?.citySlug || "");
  
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", city: citySlug }],
    enabled: !!citySlug
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finding {citySlug} community...</p>
      </div>
    );
  }
  
  // Check for group result - API returns array with { group: {...}, memberCount, eventCount }
  const result = groups?.[0];
  if (result?.group?.id) {
    return <Redirect to={`/groups/${result.group.id}`} />;
  }
  
  // Fallback: direct id on result
  if (result?.id) {
    return <Redirect to={`/groups/${result.id}`} />;
  }
  
  // No matching city group found - redirect to city groups search
  return <Redirect to={`/groups/cities?city=${encodeURIComponent(citySlug)}`} />;
}
