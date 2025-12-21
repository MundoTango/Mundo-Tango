import { useRoute, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

function sanitizeCitySlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function CitySlugRedirectPage() {
  const [, params] = useRoute("/city/:citySlug");
  const citySlug = sanitizeCitySlug(params?.citySlug || "");
  
  if (!citySlug) {
    return <Redirect to="/community-world-map" />;
  }
  
  return <Redirect to={`/cities/${citySlug}`} />;
}
