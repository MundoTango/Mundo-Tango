import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Settings, UserPlus, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Group {
  id: number;
  name: string;
  description?: string;
  type: string;
  city?: string;
  country?: string;
  memberCount: number;
  imageUrl?: string;
  createdAt: string;
  isAdmin: boolean;
  isMember: boolean;
}

interface GroupMember {
  id: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
  role: string;
  joinedAt: string;
}

export default function GroupsDetailPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: group, isLoading: groupLoading } = useQuery<Group>({
    queryKey: [`/api/groups/${groupId}`],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${groupId}/members`],
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      toast({ title: "Joined group successfully!" });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
    },
    onError: () => {
      toast({ title: "Failed to join group", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      toast({ title: "Left group successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
    },
    onError: () => {
      toast({ title: "Failed to leave group", variant: "destructive" });
    },
  });

  if (groupLoading || membersLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading group...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Group not found</p>
        </div>
      </AppLayout>
    );
  }

  const groupTypeColors = {
    city: "bg-blue-500",
    interest: "bg-green-500",
    professional: "bg-purple-500",
    skill: "bg-orange-500",
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <Button variant="outline" asChild className="mb-6" data-testid="button-back">
            <Link href="/groups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Link>
          </Button>

          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {group.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={group.imageUrl}
                      alt={group.name}
                      className="w-32 h-32 rounded-lg object-cover border border-border"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-group-name">
                        {group.name}
                      </h1>
                      <Badge className={groupTypeColors[group.type as keyof typeof groupTypeColors]}>
                        {group.type}
                      </Badge>
                    </div>

                    {group.isAdmin && (
                      <Button variant="outline" asChild data-testid="button-manage-group">
                        <Link href={`/groups/${groupId}/settings`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                    )}
                  </div>

                  {group.description && (
                    <p className="text-muted-foreground mb-4">{group.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {group.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {group.city}, {group.country}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {format(new Date(group.createdAt), 'MMM yyyy')}
                    </div>
                  </div>

                  {!group.isMember ? (
                    <Button
                      onClick={() => joinMutation.mutate()}
                      disabled={joinMutation.isPending}
                      data-testid="button-join-group"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      data-testid="button-leave-group"
                    >
                      Leave Group
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No members yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <Link key={member.id} href={`/users/${member.userId}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover-elevate cursor-pointer">
                        <Avatar>
                          <AvatarImage src={member.userProfileImage} />
                          <AvatarFallback>{member.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{member.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role === 'admin' && <Badge variant="outline" className="text-xs">Admin</Badge>}
                            {member.role === 'moderator' && <Badge variant="outline" className="text-xs">Moderator</Badge>}
                            {member.role === 'member' && (
                              <span>Joined {format(new Date(member.joinedAt), 'MMM yyyy')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
