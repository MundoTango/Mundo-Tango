import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, MapPin, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { toCitySlug } from "@/lib/utils";

export default function CityGroupsPage() {
  const { t } = useTranslation(["pages", "common"]);
  // Read city from URL query parameter
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const cityFromUrl = urlParams.get("city") || "";
  
  const [searchQuery, setSearchQuery] = useState(cityFromUrl);
  
  // Update search when URL changes
  useEffect(() => {
    if (cityFromUrl) {
      setSearchQuery(cityFromUrl);
    }
  }, [cityFromUrl]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", search: searchQuery, country: selectedCountry }],
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/join`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: t('pages:cityGroups.joinedSuccess', 'Joined group successfully!') });
    },
    onError: () => {
      toast({ title: t('pages:cityGroups.joinedError', 'Failed to join group'), variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/leave`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: t('pages:cityGroups.leftSuccess', 'Left group successfully') });
    },
    onError: () => {
      toast({ title: t('pages:cityGroups.leftError', 'Failed to leave group'), variant: "destructive" });
    },
  });

  return (
    <main className="min-h-screen bg-background" data-testid="city-groups-page">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-city-groups">{t('pages:cityGroups.title', 'City Groups')}</h1>
            <p className="text-muted-foreground">{t('pages:cityGroups.subtitle', 'Connect with tango dancers in your city')}</p>
          </div>
          
          <Button data-testid="button-create-group" asChild>
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              {t('pages:cityGroups.createCityGroup', 'Create City Group')}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <UnifiedLocationPicker
              mode="city"
              value={searchQuery}
              placeholder={t('pages:cityGroups.searchPlaceholder', 'Search city groups...')}
              onChange={(location, coords, parsed) => {
                const { city } = extractCityCountry(location);
                setSearchQuery(city || location);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((item: any) => {
              const group = item.group;
              const memberCount = item.memberCount || group.memberCount || 0;
              
              return (
                <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                  <div className="h-32 overflow-hidden rounded-t-lg">
                    <img
                      src={group.coverImage || getCityImageUrl(group.city)}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.imageUrl} />
                        <AvatarFallback>{group.name?.charAt(0) || "G"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          <Link href={group.city ? `/cities/${toCitySlug(group.city)}` : `/groups/${group.id}`} className="hover:underline">
                            {group.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.city}, {group.country}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description || t('pages:cityGroups.noDescription', 'No description available')}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {t('pages:cityGroups.members', '{{count}} members', { count: memberCount })}
                      </Badge>
                      {group.postCount > 0 && (
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {t('pages:cityGroups.posts', '{{count}} posts', { count: group.postCount })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => joinMutation.mutate(group.id)}
                      disabled={joinMutation.isPending}
                      data-testid={`button-join-${group.id}`}
                    >
                      {t('pages:cityGroups.joinGroup', 'Join Group')}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('pages:cityGroups.noGroupsFound', 'No city groups found')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('pages:cityGroups.tryAdjustingSearch', 'Try adjusting your search') : t('pages:cityGroups.beFirstToCreate', 'Be the first to create a city group')}
              </p>
              <Button asChild>
                <Link href="/groups/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pages:cityGroups.createCityGroup', 'Create City Group')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
