import { useRoute, Redirect } from "wouter";

function toCitySlug(cityName: string): string {
  return cityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function CityGroupRedirectPage() {
  const [, params] = useRoute("/groups/city/:cityName");
  const cityName = decodeURIComponent(params?.cityName || "");
  
  if (!cityName) {
    return <Redirect to="/community-world-map" />;
  }
  
  return <Redirect to={`/cities/${toCitySlug(cityName)}`} />;
}
