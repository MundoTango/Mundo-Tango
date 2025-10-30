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

export default function GroupDetailsPage() {
  const [, params] = useRoute("/groups/:id");
  const groupId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();

  const { data: group, isLoading } = useQuery<SelectGroup>({
    queryKey: ["/api/groups", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      return res.json();
    },
  });

  const joinGroup = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      toast({
        title: "Joined group!",
        description: "You are now a member of this group.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Group not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        {group.coverPhoto && (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={group.coverPhoto}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1">
              {group.avatar && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
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
                  {group.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {group.location}
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
                <p className="text-muted-foreground">{group.groupType}</p>
              </div>
              {group.category && (
                <div>
                  <h3 className="font-medium mb-1">Category</h3>
                  <p className="text-muted-foreground">{group.category}</p>
                </div>
              )}
              {group.rules && (
                <div>
                  <h3 className="font-medium mb-1">Group Rules</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {group.rules}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
