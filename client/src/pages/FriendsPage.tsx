import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { MutualFriends } from "@/components/MutualFriends";
import { UserIdentityHeader } from "@/components/UserIdentityHeader";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/optimized/IMG_9144-optimized.jpg";
import { useTranslation } from "react-i18next";

export default function FriendsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/friends/suggestions"],
  });

  const acceptRequest = useMutation({
    mutationFn: async (requestId: number) =>
      apiRequest("POST", `/api/friends/accept/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({ title: "Friend request accepted!" });
    },
  });

  const declineRequest = useMutation({
    mutationFn: async (requestId: number) =>
      apiRequest("POST", `/api/friends/decline/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({ title: "Friend request declined" });
    },
  });

  const sendRequest = useMutation({
    mutationFn: async (userId: number) =>
      apiRequest("POST", `/api/friends/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/suggestions"] });
      toast({ title: "Friend request sent!" });
    },
  });

  return (
    <SelfHealingErrorBoundary pageName="Friends" fallbackRoute="/feed">
    <PageLayout title={t('pages:friends.title', 'Friends')} showBreadcrumbs>
      <SEO
        title={t('pages:friends.seoTitle', 'Friends | Mundo Tango')}
        description={t('pages:friends.seoDescription', 'Manage your tango network. View friends, accept requests, discover suggestions, and connect with dancers worldwide. Build your tango community.')}
      />
<div className="min-h-screen bg-background">
      {/* Editorial Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 aspect-video">
          <img
            src={tangoHeroImage}
            alt="Friends"
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Users className="w-3 h-3 mr-1.5" />
              {t('pages:friends.yourNetwork', 'Your Network')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6" data-testid="heading-page-title">
              {t('pages:friends.heroTitle', 'Friends')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              {t('pages:friends.heroSubtitle', 'Connect with dancers from around the world')}
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all-friends">
              <Users className="h-4 w-4 mr-2" />
              {t('pages:friends.allFriends', 'All Friends')}
              {friends && Array.isArray(friends) && (
                <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <UserPlus className="h-4 w-4 mr-2" />
              {t('pages:friends.requests', 'Requests')}
              {requests && Array.isArray(requests) && requests.length > 0 && (
                <Badge variant="destructive" className="ml-2">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              <UserCheck className="h-4 w-4 mr-2" />
              {t('pages:friends.suggestions', 'Suggestions')}
            </TabsTrigger>
          </TabsList>

          {/* All Friends Tab */}
          <TabsContent value="all">
            {friendsLoading ? (
              <div className="text-center py-12">{t('pages:friends.loadingFriends', 'Loading friends...')}</div>
            ) : friends && Array.isArray(friends) && friends.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {friends.map((friend: any) => (
                  <Card key={friend.id} className="hover-elevate" data-testid={`friend-card-${friend.id}`}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <UserIdentityHeader
                        user={{
                          id: friend.id,
                          name: friend.name,
                          username: friend.username,
                          profileImage: friend.profileImage,
                          tangoRoles: friend.tangoRoles,
                        }}
                        connectionDegree={friend.connectionDegree}
                        closenessScore={friend.closenessScore}
                        showSeeFriendship={true}
                        isFriend={true}
                        currentUserId={user?.id}
                        showTimestamp={false}
                        size="lg"
                        testIdPrefix={`friend-${friend.id}`}
                      />
                      <div className="flex flex-col gap-2 items-end">
                        {user && <MutualFriends userId={friend.id} currentUserId={user.id} />}
                        <Button variant="outline" size="sm" asChild data-testid={`button-message-${friend.id}`}>
                          <Link href={`/messages?userId=${friend.id}`}>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {t('common:message', 'Message')}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>{t('pages:friends.noFriendsYet', 'No friends yet. Start connecting!')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Friend Requests Tab */}
          <TabsContent value="requests">
            {requestsLoading ? (
              <div className="text-center py-12">{t('pages:friends.loadingRequests', 'Loading requests...')}</div>
            ) : requests && Array.isArray(requests) && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request: any) => (
                  <Card key={request.id} data-testid={`request-card-${request.id}`}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <UserIdentityHeader
                        user={{
                          id: request.senderId || request.id,
                          name: request.name,
                          username: request.username,
                          profileImage: request.profileImage,
                          tangoRoles: request.tangoRoles,
                        }}
                        timestamp={request.createdAt}
                        showTimestamp={true}
                        size="lg"
                        testIdPrefix={`request-${request.id}`}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          data-testid={`button-accept-${request.id}`}
                          onClick={() => acceptRequest.mutate(request.id)}
                          disabled={acceptRequest.isPending}
                        >
                          {t('common:accept', 'Accept')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-decline-${request.id}`}
                          onClick={() => declineRequest.mutate(request.id)}
                          disabled={declineRequest.isPending}
                        >
                          {t('common:decline', 'Decline')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserPlus className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>{t('pages:friends.noPendingRequests', 'No pending friend requests')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            {suggestionsLoading ? (
              <div className="text-center py-12">{t('pages:friends.loadingSuggestions', 'Loading suggestions...')}</div>
            ) : suggestions && Array.isArray(suggestions) && suggestions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((suggestion: any) => (
                  <Card key={suggestion.id} className="hover-elevate" data-testid={`suggestion-card-${suggestion.id}`}>
                    <CardContent className="flex flex-col gap-4 pt-6">
                      <UserIdentityHeader
                        user={{
                          id: suggestion.id,
                          name: suggestion.name,
                          username: suggestion.username,
                          profileImage: suggestion.profileImage,
                          tangoRoles: suggestion.tangoRoles,
                        }}
                        showTimestamp={false}
                        size="lg"
                        testIdPrefix={`suggestion-${suggestion.id}`}
                      />
                      {suggestion.reason && (
                        <p className="text-xs text-muted-foreground pl-14">
                          {suggestion.reason}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          data-testid={`button-add-${suggestion.id}`}
                          onClick={() => sendRequest.mutate(suggestion.id)}
                          disabled={sendRequest.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {t('pages:friends.addFriend', 'Add Friend')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>{t('pages:friends.noSuggestions', 'No suggestions at the moment')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
