import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Briefcase, Music, User, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const professionalCategories = [
  { value: "all", label: "All Professionals", icon: Users },
  { value: "teacher", label: "Teachers", icon: User },
  { value: "dj", label: "DJs", icon: Music },
  { value: "organizer", label: "Organizers", icon: Briefcase },
  { value: "performer", label: "Performers", icon: Users },
];

export default function ProfessionalGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { 
      type: "professional", 
      search: searchQuery,
      roleType: roleFilter !== "all" ? roleFilter : undefined
    }],
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/join`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Join request sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send join request", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-professional-groups">Professional Groups</h1>
            <p className="text-muted-foreground">Connect with tango professionals worldwide</p>
          </div>
        </div>

        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList className="grid w-full grid-cols-5">
            {professionalCategories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                data-testid={`tab-${category.value}`}
              >
                <category.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search professional groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-groups"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
                        <AvatarFallback>{group.name?.charAt(0) || "P"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate flex items-center gap-2">
                          <Link href={`/groups/${group.id}`} className="hover:underline">
                            {group.name}
                          </Link>
                          {group.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {group.roleType && (
                            <Badge variant="secondary" className="mt-1">
                              {group.roleType}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {group.description || "Professional tango community"}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {memberCount} members
                      </Badge>
                      {group.isPrivate && (
                        <Badge variant="outline">Private</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => joinMutation.mutate(group.id)}
                      disabled={joinMutation.isPending}
                      data-testid={`button-request-join-${group.id}`}
                    >
                      {group.joinApproval === "approval" ? "Request to Join" : "Join Group"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No professional groups found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search filters" : "Check back later for new professional groups"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
