import { useRoute, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { Link } from "wouter";
import { fromCitySlug } from "@/lib/utils";

function titleCase(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

export default function CityDetailsPage() {
  const [, params] = useRoute("/cities/:cityName");
  const rawSlug = params?.cityName || "";
  const cityName = fromCitySlug(rawSlug);
  
  // Use API endpoint that searches by slug (handles diacritics)
  const { data: cityGroup, isLoading: groupsLoading } = useQuery<any>({
    queryKey: ["/api/cities/by-slug", rawSlug],
    queryFn: async () => {
      const res = await fetch(`/api/cities/by-slug/${encodeURIComponent(rawSlug)}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!rawSlug
  });
  
  const { data: locations } = useQuery<any[]>({
    queryKey: ["/api/community/locations"],
  });
  
  const cityData = locations?.find(loc => 
    loc.city?.toLowerCase().includes(cityName.toLowerCase().split(' ')[0])
  );
  
  if (groupsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finding {cityName} community...</p>
      </div>
    );
  }
  
  // Redirect to group page if found
  if (cityGroup?.groupId) {
    return <Redirect to={`/groups/${cityGroup.groupId}`} />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={getCityImageUrl(cityName)}
          alt={cityName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            {cityName}
          </h1>
          <p className="text-lg text-white/80">
            {cityData?.country || 'Tango Community'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {cityData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.activeEvents || 0}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Home className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.housing || 0}</div>
                <div className="text-sm text-muted-foreground">Housing</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.recommendations || 0}</div>
                <div className="text-sm text-muted-foreground">Recommendations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <MapPin className="w-8 h-8 mx-auto text-cyan-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.venues || 0}</div>
                <div className="text-sm text-muted-foreground">Venues</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Explore {cityName}</h2>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Link href={`/events?city=${encodeURIComponent(citySlug)}`} className="flex-1">
              <Button className="w-full gap-2" data-testid="button-view-events">
                <Calendar className="w-4 h-4" />
                View Events
              </Button>
            </Link>
            <Link href={`/housing?city=${encodeURIComponent(citySlug)}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-view-housing">
                <Home className="w-4 h-4" />
                Find Housing
              </Button>
            </Link>
            <Link href="/community-world-map" className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-view-map">
                <MapPin className="w-4 h-4" />
                World Map
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>This city doesn't have a dedicated community group yet.</p>
          <p className="text-sm mt-2">Interested in starting one? Contact us!</p>
        </div>
      </div>
    </div>
  );
}
