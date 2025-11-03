import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  Check, 
  X, 
  Clock,
  GraduationCap,
  Calendar,
  Building2,
  Crown,
  Shield
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Invitation {
  id: number;
  role: 'teacher' | 'organizer' | 'venue_owner' | 'moderator';
  status: 'pending' | 'accepted' | 'declined';
  fromUser: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  message?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

const roleIcons = {
  teacher: GraduationCap,
  organizer: Calendar,
  venue_owner: Building2,
  moderator: Shield,
};

const roleColors = {
  teacher: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  organizer: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  venue_owner: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  moderator: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};

const roleLabels = {
  teacher: 'Tango Teacher',
  organizer: 'Event Organizer',
  venue_owner: 'Venue Owner',
  moderator: 'Community Moderator',
};

export default function InvitationsPage() {
  const { toast } = useToast();

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/invitations"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/invitations/stats"],
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: number) =>
      apiRequest("POST", `/api/invitations/${invitationId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/stats"] });
      toast({
        title: "Invitation accepted",
        description: "Your new role has been activated",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitationId: number) =>
      apiRequest("POST", `/api/invitations/${invitationId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/stats"] });
      toast({
        title: "Invitation declined",
        description: "The invitation has been removed",
      });
    },
  });

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const pastInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <SelfHealingErrorBoundary pageName="Invitations" fallbackRoute="/dashboard">
      <PageLayout title="Role Invitations" showBreadcrumbs>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="container mx-auto max-w-4xl space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold font-serif text-foreground flex items-center gap-3" data-testid="text-page-title">
                <Mail className="h-10 w-10 text-primary" />
                Role Invitations
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage invitations to become a teacher, organizer, or venue owner
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-pending">
                    {stats?.pending || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="text-accepted">
                    {stats?.accepted || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Declined</CardTitle>
                  <X className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground" data-testid="text-declined">
                    {stats?.declined || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-roles">
                    {stats?.activeRoles || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({pendingInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-8">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-4 w-1/3 mt-2" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : pendingInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => {
                      const Icon = roleIcons[invitation.role];
                      return (
                        <Card 
                          key={invitation.id} 
                          className="overflow-hidden hover-elevate border-primary/30" 
                          data-testid={`invitation-${invitation.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={invitation.fromUser.profileImage || undefined} />
                                  <AvatarFallback>
                                    {invitation.fromUser.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={roleColors[invitation.role]}>
                                      <Icon className="h-3 w-3 mr-1" />
                                      {roleLabels[invitation.role]}
                                    </Badge>
                                  </div>
                                  <CardTitle className="text-xl mb-1">
                                    Invitation from {invitation.fromUser.name}
                                  </CardTitle>
                                  <CardDescription>
                                    @{invitation.fromUser.username} • {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {invitation.message && (
                              <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-foreground italic">
                                  "{invitation.message}"
                                </p>
                              </div>
                            )}

                            {invitation.expiresAt && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                              </div>
                            )}

                            <div className="flex gap-3 pt-2">
                              <Button
                                className="flex-1 gap-2"
                                onClick={() => acceptMutation.mutate(invitation.id)}
                                disabled={acceptMutation.isPending}
                                data-testid={`button-accept-${invitation.id}`}
                              >
                                <Check className="h-4 w-4" />
                                Accept Invitation
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => declineMutation.mutate(invitation.id)}
                                disabled={declineMutation.isPending}
                                data-testid={`button-decline-${invitation.id}`}
                              >
                                <X className="h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Mail className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No pending invitations</h3>
                      <p className="text-muted-foreground">
                        You'll see role invitations here when someone invites you
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-8">
                {pastInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {pastInvitations.map((invitation) => {
                      const Icon = roleIcons[invitation.role];
                      return (
                        <Card 
                          key={invitation.id} 
                          className="opacity-75"
                          data-testid={`invitation-history-${invitation.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={invitation.fromUser.profileImage || undefined} />
                                <AvatarFallback>
                                  {invitation.fromUser.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={roleColors[invitation.role]}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {roleLabels[invitation.role]}
                                  </Badge>
                                  <Badge 
                                    variant={invitation.status === 'accepted' ? 'default' : 'secondary'}
                                  >
                                    {invitation.status}
                                  </Badge>
                                </div>
                                <p className="font-medium">
                                  {invitation.fromUser.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                      No invitation history
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
