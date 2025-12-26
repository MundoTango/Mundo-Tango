import { useTranslation } from "react-i18next";
import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function CityGroupRedirectPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, params] = useRoute("/groups/city/:cityName");
  const cityName = decodeURIComponent(params?.cityName || "");
  
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", city: cityName }],
    enabled: !!cityName
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" aria-label={t('pages:cityGroupRedirect.loading', 'Loading city group...')}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const result = groups?.[0];
  if (result?.group) {
    // Redirect to /cities/ route for city groups (MB.MD v9.9.3 compliance)
    const citySlug = result.group.slug || result.group.city?.toLowerCase().replace(/\s+/g, '-') || result.group.id;
    return <Redirect to={`/cities/${citySlug}`} />;
  }
  
  // Fallback to city groups page
  return <Redirect to={`/cities/${cityName.toLowerCase().replace(/\s+/g, '-')}`} />;
}
