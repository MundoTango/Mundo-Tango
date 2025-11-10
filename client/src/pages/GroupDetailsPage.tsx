import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, Settings as SettingsIcon, Calendar, Home, Building2, Heart } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";
import { GroupMembersList } from "@/components/groups/GroupMembersList";
import { GroupInviteSystem } from "@/components/groups/GroupInviteSystem";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";

export default function GroupDetailsPage() {
  const [, params] = useRoute("/groups/:id");
  const groupIdOrSlug = params?.id || "";
  const { toast } = useToast();

  const { data: group, isLoading } = useQuery<SelectGroup>({
    queryKey: ["/api/groups", groupIdOrSlug],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupIdOrSlug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      return res.json();
    },
  });

  const { data: membershipData } = useQuery<{ isMember: boolean }>({
    queryKey: ["/api/groups", group?.id, "membership"],
    queryFn: async () => {
      if (!group?.id) return { isMember: false };
      const res = await fetch(`/api/groups/${group.id}/membership`, { credentials: "include" });
      if (!res.ok) return { isMember: false };
      return res.json();
    },
    enabled: !!group?.id,
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${group?.id || groupIdOrSlug}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Joined group!",
        description: "You are now a member of this group.",
      });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/groups/${group?.id || groupIdOrSlug}/leave`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id, "membership"] });
      toast({
        title: "Left group",
        description: "You are no longer a member of this group.",
      });
    },
  });

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <PageLayout title="GroupDetails" showBreadcrumbs>
<>
        <SEO 
          title="Group Details"
          description="Explore this tango group, join discussions, and connect with fellow members."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Skeleton className="h-48 w-full rounded-xl mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  if (!group) {
    return (
      <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
        <>
        <SEO 
          title="Group Details"
          description="Explore this tango group, join discussions, and connect with fellow members."
        />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Group not found</p>
            </CardContent>
          </Card>
        </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Group Details" fallbackRoute="/groups">
      <>
      <SEO 
        title="Group Details"
        description="Explore this tango group, join discussions, and connect with fellow members."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        {group.coverImage && (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={group.coverImage}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1">
              {group.imageUrl && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={group.imageUrl} />
                  <AvatarFallback>{group.name?.charAt(0) || 'G'}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2" data-testid="text-group-name">
                  {group.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount || 0} members
                  </span>
                  {(group.city || group.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[group.city, group.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            {membershipData?.isMember ? (
              <Button
                onClick={() => leaveGroup.mutate()}
                disabled={leaveGroup.isPending}
                variant="outline"
                data-testid="button-leave-group"
              >
                {leaveGroup.isPending ? "Leaving..." : "Leave Group"}
              </Button>
            ) : (
              <Button
                onClick={() => joinGroup.mutate()}
                disabled={joinGroup.isPending}
                data-testid="button-join-group"
              >
                {joinGroup.isPending ? "Joining..." : "Join Group"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{group.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="discussion">
        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="discussion">
            Discussion
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-1" />
            Events
          </TabsTrigger>
          <TabsTrigger value="housing">
            <Home className="h-4 w-4 mr-1" />
            Housing
          </TabsTrigger>
          <TabsTrigger value="hub">
            <Heart className="h-4 w-4 mr-1" />
            Hub
          </TabsTrigger>
          <TabsTrigger value="members">
            Members
          </TabsTrigger>
          <TabsTrigger value="invites">
            Invites
          </TabsTrigger>
          <TabsTrigger value="about">
            About
          </TabsTrigger>
          {membershipData?.isMember && (
            <TabsTrigger value="settings">
              <SettingsIcon className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="discussion" className="mt-6">
          <GroupPostFeed 
            groupId={group.id} 
            canPost={membershipData?.isMember || false}
            canModerate={membershipData?.isMember || false}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Group Events
              </CardTitle>
              <CardDescription>
                Upcoming events organized by this group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock event data */}
              {[
                { id: 1, title: "Weekly Milonga", date: "2024-11-15", attendees: 45, location: group.city || "Local venue" },
                { id: 2, title: "Tango Workshop", date: "2024-11-18", attendees: 28, location: group.city || "Dance studio" },
                { id: 3, title: "Group Practice", date: "2024-11-22", attendees: 32, location: group.city || "Community center" }
              ].map((event) => (
                <div key={event.id} className="p-4 border rounded-lg hover-elevate" data-testid={`event-${event.id}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.attendees} attending
                        </div>
                      </div>
                    </div>
                    <Button size="sm" data-testid={`button-rsvp-${event.id}`}>
                      RSVP
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Housing Options
              </CardTitle>
              <CardDescription>
                Available housing for group members in {group.city || "the area"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock housing data */}
              {[
                { id: 1, host: "Maria S.", type: "Private Room", price: "$45/night", availability: "Available" },
                { id: 2, host: "Carlos M.", type: "Shared Room", price: "$25/night", availability: "Available" },
                { id: 3, host: "Ana P.", type: "Entire Apartment", price: "$85/night", availability: "Booked" }
              ].map((housing) => (
                <div key={housing.id} className="p-4 border rounded-lg hover-elevate" data-testid={`housing-${housing.id}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{housing.type}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Hosted by {housing.host}</div>
                        <div className="font-medium text-foreground">{housing.price}</div>
                        <div className={housing.availability === "Available" ? "text-green-600" : "text-muted-foreground"}>
                          {housing.availability}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={housing.availability !== "Available"}
                      data-testid={`button-book-${housing.id}`}
                    >
                      {housing.availability === "Available" ? "View Details" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hub" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Community Hub
                </CardTitle>
                <CardDescription>
                  Local tango resources in {group.city || group.country || "your area"}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Milongas Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local Milongas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 1, name: "La Viruta", schedule: "Wed & Fri 11pm", rating: 4.8 },
                  { id: 2, name: "Club Gricel", schedule: "Sat 10pm", rating: 4.9 }
                ].map((milonga) => (
                  <div key={milonga.id} className="p-3 border rounded-lg hover-elevate">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{milonga.name}</h4>
                        <p className="text-sm text-muted-foreground">{milonga.schedule}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{milonga.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Venues Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dance Studios & Venues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 1, name: "Studio Tango Central", type: "Studio", address: "Downtown" },
                  { id: 2, name: "Centro Cultural", type: "Cultural Center", address: "San Telmo" }
                ].map((venue) => (
                  <div key={venue.id} className="p-3 border rounded-lg hover-elevate">
                    <h4 className="font-semibold">{venue.name}</h4>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{venue.type}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {venue.address}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resources Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 border rounded-lg hover-elevate">
                  <h4 className="font-semibold mb-1">Shoe Repair Services</h4>
                  <p className="text-sm text-muted-foreground">Recommended cobblers specializing in tango shoes</p>
                </div>
                <div className="p-3 border rounded-lg hover-elevate">
                  <h4 className="font-semibold mb-1">Music Collections</h4>
                  <p className="text-sm text-muted-foreground">Curated playlists and tanda recommendations</p>
                </div>
                <div className="p-3 border rounded-lg hover-elevate">
                  <h4 className="font-semibold mb-1">Travel Tips</h4>
                  <p className="text-sm text-muted-foreground">Transportation, safety, and local customs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <GroupMembersList 
            groupId={group.id}
            canModerate={membershipData?.isMember || false}
          />
        </TabsContent>

        <TabsContent value="invites" className="mt-6">
          <GroupInviteSystem 
            groupId={group.id}
            canInvite={membershipData?.isMember || false}
          />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About this group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Group Type</h3>
                <p className="text-muted-foreground">{group.type}</p>
              </div>
              {group.emoji && (
                <div>
                  <h3 className="font-medium mb-1">Emoji</h3>
                  <p className="text-2xl">{group.emoji}</p>
                </div>
              )}
              {group.description && (
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {group.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {membershipData?.isMember && (
          <TabsContent value="settings" className="mt-6">
            <GroupSettingsPanel 
              group={group}
              canManage={membershipData?.isMember || false}
            />
          </TabsContent>
        )}
      </Tabs>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
