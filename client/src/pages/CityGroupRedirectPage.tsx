import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function CityGroupRedirectPage() {
  const [, params] = useRoute("/groups/city/:cityName");
  const cityName = decodeURIComponent(params?.cityName || "");
  
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", city: cityName }],
    enabled: !!cityName
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const group = groups?.[0];
  if (group) {
    return <Redirect to={`/groups/${group.id}`} />;
  }
  
  return <Redirect to={`/city-groups?city=${encodeURIComponent(cityName)}`} />;
}
