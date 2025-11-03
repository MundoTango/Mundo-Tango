import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

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

  const joinGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${group?.id || groupIdOrSlug}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupIdOrSlug] });
      toast({
        title: "Joined group!",
        description: "You are now a member of this group.",
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
            <Button
              onClick={() => joinGroup.mutate()}
              disabled={joinGroup.isPending}
              data-testid="button-join-group"
            >
              {joinGroup.isPending ? "Joining..." : "Join Group"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{group.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="discussion">
        <TabsList className="w-full">
          <TabsTrigger value="discussion" className="flex-1">
            Discussion
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1">
            Members
          </TabsTrigger>
          <TabsTrigger value="about" className="flex-1">
            About
          </TabsTrigger>
        </TabsList>
        <TabsContent value="discussion" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No discussions yet. Start the conversation!
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {group.memberCount || 0} members
            </CardContent>
          </Card>
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
      </Tabs>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
