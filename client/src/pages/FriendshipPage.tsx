import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, MessageCircle, Heart, MapPin, UserCheck, ChevronRight, ThumbsUp, MessageSquare, Plane, Building2, Loader2, AlertCircle } from "lucide-react";
import { safeDateDistance, safeFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/IMG_9144-Mejorado-NR_1762013255726.jpg";

interface SharedData {
  sharedPosts: Array<{ id: number; content: string; createdAt: string; authorName: string }>;
  sharedLikes: Array<{ postId: number; postTitle: string; likedAt: string }>;
  sharedTravel: Array<{ city: string; country: string; startDate: string; endDate: string | null }>;
  sharedComments: Array<{ id: number; postId: number; content: string; createdAt: string }>;
  commonCities: Array<{ city: string; country: string; userStartDate: string; friendStartDate: string }>;
  sharedEventsDetails: Array<{ id: number; title: string; date: string; location: string }>;
}

function formatEventDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'Date TBD';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date TBD';
    return safeFormat(date, 'MMM d, yyyy');
  } catch {
    return 'Date TBD';
  }
}

export default function FriendshipPage() {
  const { userId } = useParams<{ userId: string }>();
  const friendId = parseInt(userId || "0");

  const { data: friendData, isLoading: isLoadingFriend } = useQuery({
    queryKey: ["/api/users", friendId],
    enabled: !!friendId,
  });

  const { data: mutualFriends, isLoading: isLoadingMutual } = useQuery({
    queryKey: ["/api/friends/mutual", friendId],
    enabled: !!friendId,
  });

  const { data: friendshipStats } = useQuery<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string;
  }>({
    queryKey: ["/api/friends/friendship", friendId, "stats"],
    enabled: !!friendId,
  });

  const { data: sharedData, isLoading: isLoadingSharedData, isError: isSharedDataError } = useQuery<SharedData>({
    queryKey: ["/api/friends/friendship", friendId, "shared-data"],
    enabled: !!friendId,
  });

  if (isLoadingFriend || isLoadingMutual) {
    return (
      <AppLayout>
        <LoadingFallback />
      </AppLayout>
    );
  }

  const friend = friendData?.user;

  return (
    <AppLayout>
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${tangoHeroImage}')` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              Friendship
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="heading-page-title">
              {friend?.name || 'Friend'}
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Your connection in the tango community
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="overflow-hidden hover-elevate" data-testid="card-closeness-score">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-bold">Closeness Score</h3>
                  </div>
                  <Badge className="text-lg px-4 py-1">
                    {friendshipStats?.closenessScore || 0}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on shared events, mutual friends, and interactions
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate" data-testid="card-friendship-duration">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Friends Since</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {friendshipStats?.daysSinceFriendship || 0} days
                </p>
                {friendshipStats?.lastInteraction && (
                  <p className="text-xs text-muted-foreground">
                    Last interaction {safeDateDistance(friendshipStats.lastInteraction, { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate" data-testid="card-shared-events">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Shared Events</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {friendshipStats?.sharedEvents || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Milongas and workshops attended together
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate" data-testid="card-mutual-friends">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Mutual Friends</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {mutualFriends?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Friends you both know
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Shared Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSharedData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading shared data...</span>
                </div>
              ) : isSharedDataError ? (
                <div className="flex items-center justify-center py-12 text-destructive">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  <span>Failed to load shared data</span>
                </div>
              ) : (
                <Tabs defaultValue="events" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="events" data-testid="tab-events">
                      <MapPin className="w-4 h-4 mr-2" />
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="posts" data-testid="tab-posts">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger value="likes" data-testid="tab-likes">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Likes
                    </TabsTrigger>
                    <TabsTrigger value="travel" data-testid="tab-travel">
                      <Plane className="w-4 h-4 mr-2" />
                      Travel
                    </TabsTrigger>
                    <TabsTrigger value="cities" data-testid="tab-cities">
                      <Building2 className="w-4 h-4 mr-2" />
                      Cities
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="events" className="mt-6">
                    {sharedData?.sharedEventsDetails && sharedData.sharedEventsDetails.length > 0 ? (
                      <div className="space-y-4">
                        {sharedData.sharedEventsDetails.map((event) => (
                          <Link key={event.id} href={`/events/${event.id}`}>
                            <div className="flex items-center gap-4 p-4 border rounded-xl hover-elevate cursor-pointer" data-testid={`shared-event-${event.id}`}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatEventDate(event.date)} - {event.location || 'Location TBD'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No shared events yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="posts" className="mt-6">
                    {sharedData?.sharedPosts && sharedData.sharedPosts.length > 0 ? (
                      <div className="space-y-4">
                        {sharedData.sharedPosts.map((post) => (
                          <Link key={post.id} href={`/feed?post=${post.id}`}>
                            <div className="flex items-start gap-4 p-4 border rounded-xl hover-elevate cursor-pointer" data-testid={`shared-post-${post.id}`}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold">{post.authorName}</p>
                                <p className="text-sm text-muted-foreground mt-1">{post.content || 'No content'}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {post.createdAt ? safeDateDistance(post.createdAt, { addSuffix: true }) : 'Recently'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No shared posts yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="likes" className="mt-6">
                    {sharedData?.sharedLikes && sharedData.sharedLikes.length > 0 ? (
                      <div className="space-y-4">
                        {sharedData.sharedLikes.map((like, index) => (
                          <Link key={index} href={`/feed?post=${like.postId}`}>
                            <div className="flex items-center gap-4 p-4 border rounded-xl hover-elevate cursor-pointer" data-testid={`shared-like-${like.postId}`}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <ThumbsUp className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{like.postTitle || 'Untitled post'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Both liked this post
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No shared likes yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="travel" className="mt-6">
                    {sharedData?.sharedTravel && sharedData.sharedTravel.length > 0 ? (
                      <div className="space-y-4">
                        {sharedData.sharedTravel.map((trip, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-xl hover-elevate" data-testid={`shared-travel-${index}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Plane className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{trip.city || 'Unknown city'}{trip.country ? `, ${trip.country}` : ''}</p>
                              <p className="text-sm text-muted-foreground">
                                Overlapping travel dates
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No shared travel yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="cities" className="mt-6">
                    {sharedData?.commonCities && sharedData.commonCities.length > 0 ? (
                      <div className="space-y-4">
                        {sharedData.commonCities.map((city, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-xl hover-elevate" data-testid={`common-city-${index}`}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{city.city || 'Unknown city'}{city.country ? `, ${city.country}` : ''}</p>
                              <p className="text-sm text-muted-foreground">
                                Both danced tango in this city
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No common cities yet</p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {mutualFriends && mutualFriends.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  Mutual Friends
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mutualFriends.map((mutualFriend: any) => (
                    <Link key={mutualFriend.id} href={`/profile/${mutualFriend.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4 border rounded-xl hover-elevate cursor-pointer"
                        data-testid={`mutual-friend-${mutualFriend.id}`}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mutualFriend.profileImage || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {mutualFriend.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{mutualFriend.name}</p>
                          <p className="text-sm text-muted-foreground truncate">@{mutualFriend.username}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center pt-8">
            <Link href={`/messages/${friendId}`}>
              <Button
                size="lg"
                className="gap-2"
                data-testid="button-send-message"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/profile/${friendId}`}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                data-testid="button-view-profile"
              >
                <Users className="w-5 h-5" />
                View Profile
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
