import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Shield, Ban, CheckCircle, Mail, Calendar, MapPin, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserDetail {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  role: string;
  city?: string;
  country?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  isBanned: boolean;
  totalPosts: number;
  totalEvents: number;
  friendCount: number;
}

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: [`/api/admin/users/${userId}`],
  });

  const banMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast({ title: "User banned successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
    },
    onError: () => {
      toast({ title: "Failed to ban user", variant: "destructive" });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/users/${userId}/unban`);
    },
    onSuccess: () => {
      toast({ title: "User unbanned successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
    },
    onError: () => {
      toast({ title: "Failed to unban user", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <p className="text-center text-muted-foreground">User not found</p>
      </div>
    );
  }

  const roleColors = {
    god: "bg-purple-500",
    super_admin: "bg-red-500",
    admin: "bg-orange-500",
    moderator: "bg-blue-500",
    teacher: "bg-green-500",
    premium: "bg-yellow-500",
    user: "bg-gray-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Button variant="outline" asChild className="mb-6" data-testid="button-back">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-user-name">
                      {user.name}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1" />
                        Banned
                      </Badge>
                    )}
                    {user.isActive && !user.isBanned && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {user.city}, {user.country}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Last login {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {user.isBanned ? (
                    <Button
                      onClick={() => unbanMutation.mutate()}
                      disabled={unbanMutation.isPending}
                      data-testid="button-unban"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => banMutation.mutate()}
                      disabled={banMutation.isPending}
                      data-testid="button-ban"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  )}
                  <Button variant="outline" asChild data-testid="button-view-profile">
                    <Link href={`/users/${userId}`}>
                      View Public Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-foreground">{user.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{user.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Events Attended</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{user.friendCount}</div>
                <div className="text-sm text-muted-foreground">Friends</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type:</span>
                <span className="font-semibold text-foreground">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-foreground">
                  {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since:</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(user.createdAt), 'MMM yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/admin/users/${userId}/posts`}>
                  View All Posts
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/admin/users/${userId}/activity`}>
                  Activity Log
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/admin/users/${userId}/reports`}>
                  Reports & Flags
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
