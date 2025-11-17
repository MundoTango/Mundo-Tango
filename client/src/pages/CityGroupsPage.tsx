import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, MapPin, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CityGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "city", search: searchQuery, country: selectedCountry }],
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/join`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Joined group successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to join group", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/leave`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Left group successfully" });
    },
    onError: () => {
      toast({ title: "Failed to leave group", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-city-groups">City Groups</h1>
            <p className="text-muted-foreground">Connect with tango dancers in your city</p>
          </div>
          
          <Button data-testid="button-create-group" asChild>
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              Create City Group
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search city groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-groups"
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
                  {group.coverImage && (
                    <div className="h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={group.coverImage}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.imageUrl} />
                        <AvatarFallback>{group.name?.charAt(0) || "G"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          <Link href={`/groups/${group.id}`} className="hover:underline">
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
                      {group.description || "No description available"}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {memberCount} members
                      </Badge>
                      {group.postCount > 0 && (
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {group.postCount} posts
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
                      Join Group
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
              <h3 className="text-lg font-semibold mb-2">No city groups found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Be the first to create a city group"}
              </p>
              <Button asChild>
                <Link href="/groups/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create City Group
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
