import { useRoute, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fromCitySlug } from "@/lib/utils";
import { useEffect } from "react";

/**
 * CityDetailsPage - Simple redirect to GroupDetailPage
 * All cities should use the same GroupDetailPage template
 * If no group exists, auto-create one then redirect
 */
export default function CityDetailsPage() {
  const [, params] = useRoute("/cities/:cityName");
  const rawSlug = params?.cityName || "";
  const cityName = fromCitySlug(rawSlug);
  
  // Look up city group by slug
  const { data: cityGroup, isLoading, error, refetch } = useQuery<any>({
    queryKey: ["/api/cities/by-slug", rawSlug],
    queryFn: async () => {
      const res = await fetch(`/api/cities/by-slug/${encodeURIComponent(rawSlug)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "City not found");
      }
      return res.json();
    },
    enabled: !!rawSlug,
    retry: false
  });
  
  // Auto-create city group if not found
  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cities/auto-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName, slug: rawSlug })
      });
      if (!res.ok) throw new Error("Failed to create city group");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    }
  });
  
  // Auto-create group if city not found and not already creating
  useEffect(() => {
    if (error && !createGroupMutation.isPending && !createGroupMutation.isSuccess) {
      createGroupMutation.mutate();
    }
  }, [error, createGroupMutation.isPending, createGroupMutation.isSuccess]);
  
  // Show loading state
  if (isLoading || createGroupMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {createGroupMutation.isPending ? `Creating ${cityName} community...` : `Finding ${cityName} community...`}
        </p>
      </div>
    );
  }
  
  // Redirect to group page
  if (cityGroup?.groupId) {
    return <Redirect to={`/groups/${cityGroup.groupId}`} />;
  }
  
  // Fallback: redirect to world map if something went wrong
  return <Redirect to="/community-world-map" />;
}
