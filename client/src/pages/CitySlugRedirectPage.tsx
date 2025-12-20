import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function CitySlugRedirectPage() {
  const [, params] = useRoute("/city/:citySlug");
  const citySlug = decodeURIComponent(params?.citySlug || "").replace(/-/g, " ");
  
  const { data: groups, isLoading, error } = useQuery<any[]>({
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
  
  const result = groups?.[0];
  if (result?.group?.id) {
    return <Redirect to={`/groups/${result.group.id}`} />;
  }
  
  if (result?.id) {
    return <Redirect to={`/groups/${result.id}`} />;
  }
  
  return <Redirect to={`/groups/cities?city=${encodeURIComponent(citySlug)}`} />;
}
