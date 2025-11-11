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
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import invitationsHeroImg from "@assets/stock_images/professional_office__6787b655.jpg";

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

  const { data: stats } = useQuery<{
    pending: number;
    accepted: number;
    declined: number;
    activeRoles: number;
  }>({
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
        <>
          <SEO
            title="Role Invitations - Mundo Tango"
            description="Manage your tango community role invitations - teacher, organizer, venue owner, and moderator invitations"
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${invitationsHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Community Roles
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Role Invitations
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Join the tango community as a teacher, organizer, venue owner, or moderator
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid gap-6 md:grid-cols-4 mb-16"
            >
              <Card className="hover-elevate">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold" data-testid="text-pending">
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
                  <div className="text-3xl font-serif font-bold text-green-600" data-testid="text-accepted">
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
                  <div className="text-3xl font-serif font-bold text-muted-foreground" data-testid="text-declined">
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
                  <div className="text-3xl font-serif font-bold" data-testid="text-active-roles">
                    {stats?.activeRoles || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Manage Invitations</h2>
              <p className="text-lg text-muted-foreground">
                Review and respond to role invitations from community members
              </p>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({pendingInvitations.length})
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
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
                    {pendingInvitations.map((invitation, idx) => {
                      const Icon = roleIcons[invitation.role];
                      return (
                        <motion.div
                          key={invitation.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                          <Card 
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
                                    <CardTitle className="text-xl mb-1 font-serif">
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
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Mail className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-serif font-semibold mb-2">No pending invitations</h3>
                      <p className="text-muted-foreground">
                        You'll see role invitations here when someone invites you
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {pastInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {pastInvitations.map((invitation, idx) => {
                      const Icon = roleIcons[invitation.role];
                      return (
                        <motion.div
                          key={invitation.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                          <Card 
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
                        </motion.div>
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
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
