import { useTranslation } from "react-i18next";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Users, MapPin, Calendar, Settings, UserPlus, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { safeDateFormat } from "@/lib/safeDateFormat";

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
  const { t } = useTranslation(["pages", "common"]);
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
      toast({ title: t('pages:groupsDetail.joinedSuccess', 'Joined group successfully!') });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
    },
    onError: () => {
      toast({ title: t('pages:groupsDetail.joinFailed', 'Failed to join group'), variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      toast({ title: t('pages:groupsDetail.leftSuccess', 'Left group successfully') });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
    },
    onError: () => {
      toast({ title: t('pages:groupsDetail.leaveFailed', 'Failed to leave group'), variant: "destructive" });
    },
  });

  if (groupLoading || membersLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('pages:groupsDetail.loading', 'Loading group...')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">{t('pages:groupsDetail.notFound', 'Group not found')}</p>
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
      <SEO
        title={`${group?.name || 'Group'} | Mundo Tango`}
        description={group?.description || `Join the ${group?.name} community group on Mundo Tango. Connect with tango enthusiasts and participate in events.`}
      />
      <div className="min-h-screen bg-background">
        {/* Editorial Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: group.imageUrl 
                ? `url('${group.imageUrl}')`
                : `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=2000&auto=format&fit=crop&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <Badge 
                variant="outline" 
                className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm capitalize"
              >
                {group.type} {t('pages:groupsDetail.group', 'Group')}
              </Badge>

              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6"
                data-testid="text-group-name"
              >
                {group.name}
              </h1>

              {group.description && (
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                  {group.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                {group.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{group.city}, {group.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{group.memberCount} {t('pages:groupsDetail.members', 'members')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t('pages:groupsDetail.since', 'Since')} {safeDateFormat(group.createdAt, 'MMM yyyy')}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!group.isMember ? (
                  <Button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    size="lg"
                    data-testid="button-join-group"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('pages:groupsDetail.joinGroup', 'Join Group')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                    data-testid="button-leave-group"
                  >
                    {t('pages:groupsDetail.leaveGroup', 'Leave Group')}
                  </Button>
                )}
                
                {group.isAdmin && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild 
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                    data-testid="button-manage-group"
                  >
                    <Link href={`/groups/${groupId}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t('pages:groupsDetail.manage', 'Manage')}
                    </Link>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild 
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  data-testid="button-back"
                >
                  <Link href="/groups">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('common:back', 'Back')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl py-12 px-4">

          <Card>
            <CardHeader>
              <CardTitle>{t('pages:groupsDetail.membersCount', 'Members')} ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t('pages:groupsDetail.noMembersYet', 'No members yet')}</p>
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
                            {member.role === 'admin' && <Badge variant="outline" className="text-xs">{t('pages:groupsDetail.admin', 'Admin')}</Badge>}
                            {member.role === 'moderator' && <Badge variant="outline" className="text-xs">{t('pages:groupsDetail.moderator', 'Moderator')}</Badge>}
                            {member.role === 'member' && (
                              <span>{t('pages:groupsDetail.joined', 'Joined')} {safeDateFormat(member.joinedAt, 'MMM yyyy')}</span>
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
