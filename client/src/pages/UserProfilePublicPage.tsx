import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  Award,
  Music
} from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  country?: string;
  role: string;
  danceLevel?: string;
  joinedAt: string;
  stats: {
    posts: number;
    friends: number;
    eventsAttended: number;
    points: number;
  };
}

export default function UserProfilePublicPage() {
  const { userId } = useParams();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const { data: recentPosts = [] } = useQuery<any[]>({
    queryKey: ['/api/users', userId, 'posts'],
  });

  const { data: recentEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/users', userId, 'events'],
  });

  if (isLoading || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2" data-testid="text-profile-name">
                      {profile.name}
                      {profile.role === 'premium' && (
                        <Badge variant="default" className="ml-2">Premium</Badge>
                      )}
                      {profile.role === 'teacher' && (
                        <Badge variant="outline" className="ml-2 border-primary text-primary">Teacher</Badge>
                      )}
                    </h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  {profile.bio && (
                    <p className="text-foreground">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.city && profile.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.city}, {profile.country}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(profile.joinedAt), 'MMMM yyyy')}
                    </div>
                    {profile.danceLevel && (
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {profile.danceLevel}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-card">
                      <div className="text-2xl font-bold text-foreground">{profile.stats.posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card">
                      <div className="text-2xl font-bold text-foreground">{profile.stats.friends}</div>
                      <div className="text-xs text-muted-foreground">Friends</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card">
                      <div className="text-2xl font-bold text-foreground">{profile.stats.eventsAttended}</div>
                      <div className="text-xs text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card">
                      <div className="text-2xl font-bold text-foreground">{profile.stats.points}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button data-testid="button-add-friend">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                    <Button variant="outline" data-testid="button-message">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {recentPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts yet</p>
                  </CardContent>
                </Card>
              ) : (
                recentPosts.map((post: any) => (
                  <Card key={post.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <p className="text-foreground mb-4">{post.content}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary">
                          <Heart className="h-4 w-4" />
                          {post.likesCount || 0}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentsCount || 0}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {recentEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                recentEvents.map((event: any) => (
                  <Card key={event.id} className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.startDate), 'PPP')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {profile.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Bio</h4>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}
                  {profile.danceLevel && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Dance Level</h4>
                      <Badge>{profile.danceLevel}</Badge>
                    </div>
                  )}
                  {profile.city && profile.country && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Location</h4>
                      <p className="text-muted-foreground">{profile.city}, {profile.country}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Member Since</h4>
                    <p className="text-muted-foreground">{format(new Date(profile.joinedAt), 'MMMM d, yyyy')}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
