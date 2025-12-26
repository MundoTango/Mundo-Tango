import { useTranslation } from "react-i18next";
import { useRoute, Redirect, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { Link } from "wouter";

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

/**
 * Title case a city name properly
 */
function titleCase(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

export default function CitySlugRedirectPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, params] = useRoute("/city/:citySlug");
  const [, setLocation] = useLocation();
  const citySlug = sanitizeCitySlug(params?.citySlug || "");
  const cityName = titleCase(citySlug);
  
  // First, try to find existing city group
  const { data: groups, isLoading: groupsLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", city: citySlug }],
    enabled: !!citySlug
  });
  
  // Also fetch community location data for this city
  const { data: locations } = useQuery<any[]>({
    queryKey: ["/api/community/locations"],
  });
  
  // Find city in community locations
  const cityData = locations?.find(loc => 
    loc.city?.toLowerCase() === citySlug.toLowerCase()
  );
  
  if (groupsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('pages:citySlugRedirect.finding', 'Finding {{city}} community...', { city: cityName })}</p>
      </div>
    );
  }
  
  // Check for group result - API returns array with { group: {...}, memberCount, eventCount }
  // Redirect to /cities/ route for city groups (MB.MD v9.9.3 compliance)
  const result = groups?.[0];
  if (result?.group?.id) {
    const slug = result.group.slug || citySlug.toLowerCase().replace(/\s+/g, '-') + '-tango';
    return <Redirect to={`/cities/${slug}`} />;
  }
  
  // Fallback: direct id on result - still redirect to cities
  if (result?.id) {
    const slug = result.slug || citySlug.toLowerCase().replace(/\s+/g, '-') + '-tango';
    return <Redirect to={`/cities/${slug}`} />;
  }
  
  // No city group exists - show city info page for this scraped city
  // This handles cities from scraped events that don't have groups yet
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
            {cityData?.country || t('pages:citySlugRedirect.tangoCommunity', 'Tango Community')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* City Stats */}
        {cityData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.activeEvents || 0}</div>
                <div className="text-sm text-muted-foreground">{t('pages:citySlugRedirect.events', 'Events')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Home className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.housing || 0}</div>
                <div className="text-sm text-muted-foreground">{t('pages:citySlugRedirect.housing', 'Housing')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.recommendations || 0}</div>
                <div className="text-sm text-muted-foreground">{t('pages:citySlugRedirect.recommendations', 'Recommendations')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <MapPin className="w-8 h-8 mx-auto text-cyan-500 mb-2" />
                <div className="text-2xl font-bold">{cityData.venues || 0}</div>
                <div className="text-sm text-muted-foreground">{t('pages:citySlugRedirect.venues', 'Venues')}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">{t('pages:citySlugRedirect.explore', 'Explore {{city}}', { city: cityName })}</h2>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Link href={`/events?city=${encodeURIComponent(citySlug)}`} className="flex-1">
              <Button className="w-full gap-2" data-testid="button-view-events">
                <Calendar className="w-4 h-4" />
                {t('pages:citySlugRedirect.viewEvents', 'View Events')}
              </Button>
            </Link>
            <Link href={`/housing?city=${encodeURIComponent(citySlug)}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-view-housing">
                <Home className="w-4 h-4" />
                {t('pages:citySlugRedirect.findHousing', 'Find Housing')}
              </Button>
            </Link>
            <Link href="/community-world-map" className="flex-1">
              <Button variant="outline" className="w-full gap-2" data-testid="button-view-map">
                <MapPin className="w-4 h-4" />
                {t('pages:citySlugRedirect.worldMap', 'World Map')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>{t('pages:citySlugRedirect.noGroupYet', "This city doesn't have a dedicated community group yet.")}</p>
          <p className="text-sm mt-2">{t('pages:citySlugRedirect.contactUs', 'Interested in starting one? Contact us!')}</p>
        </div>
      </div>
    </div>
  );
}
