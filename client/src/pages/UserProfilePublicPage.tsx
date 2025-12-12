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
  Music,
  Globe
} from "lucide-react";
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX, SiLinkedin } from "react-icons/si";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  role: string;
  danceLevel?: string;
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  socialLinks?: SocialLinks | null;
  tangoRoles?: string[] | null;
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
      <>
        <SEO
          title={`${profile.name} (@${profile.username}) - Tango Profile`}
          description={profile.bio || `View ${profile.name}'s tango profile, posts, and events.`}
        />

        {/* Hero Cover Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1485872299829-c673f5194813?w=1600&h=900&fit=crop&q=80')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </motion.div>
        </div>

        <div className="bg-background">
          <div className="container mx-auto max-w-6xl px-6 -mt-24">
            {/* Profile Card with Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                      <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h1 className="text-4xl font-serif font-bold text-foreground flex flex-wrap items-center gap-2" data-testid="text-profile-name">
                          {profile.name}
                          {profile.role === 'premium' && (
                            <Badge variant="default" className="ml-2">Premium</Badge>
                          )}
                          {profile.role === 'teacher' && (
                            <Badge variant="outline" className="ml-2 border-primary text-primary">
                              <Award className="h-3 w-3 mr-1" />
                              Teacher
                            </Badge>
                          )}
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">@{profile.username}</p>
                      </div>

                      {profile.bio && (
                        <p className="text-foreground leading-relaxed text-lg">{profile.bio}</p>
                      )}

                      {profile.yearsOfDancing && (
                        <p className="text-primary font-semibold text-lg">{profile.yearsOfDancing} years of tango experience</p>
                      )}

                      {(profile.leaderLevel || profile.followerLevel) && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                          {profile.leaderLevel && (
                            <div className="text-center p-3 rounded-lg bg-muted">
                              <div className="text-lg font-semibold text-foreground">Leader</div>
                              <div className="text-sm text-muted-foreground">Level {profile.leaderLevel}</div>
                            </div>
                          )}
                          {profile.followerLevel && (
                            <div className="text-center p-3 rounded-lg bg-muted">
                              <div className="text-lg font-semibold text-foreground">Follower</div>
                              <div className="text-sm text-muted-foreground">Level {profile.followerLevel}</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {profile.city && profile.country && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {profile.city}, {profile.country}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          Joined {safeDateFormat(profile.joinedAt, 'MMMM yyyy', 'recently')}
                        </div>
                        {profile.danceLevel && (
                          <div className="flex items-center gap-1.5">
                            <Music className="h-4 w-4 text-primary" />
                            {profile.danceLevel}
                          </div>
                        )}
                      </div>

                      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                        <div className="flex gap-4 pt-2">
                          {profile.socialLinks.instagram && (
                            <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiInstagram className="h-5 w-5" data-testid="icon-instagram" />
                            </a>
                          )}
                          {profile.socialLinks.facebook && (
                            <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiFacebook className="h-5 w-5" data-testid="icon-facebook" />
                            </a>
                          )}
                          {profile.socialLinks.youtube && (
                            <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiYoutube className="h-5 w-5" data-testid="icon-youtube" />
                            </a>
                          )}
                          {profile.socialLinks.tiktok && (
                            <a href={profile.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiTiktok className="h-5 w-5" data-testid="icon-tiktok" />
                            </a>
                          )}
                          {profile.socialLinks.twitter && (
                            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiX className="h-5 w-5" data-testid="icon-twitter" />
                            </a>
                          )}
                          {profile.socialLinks.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <SiLinkedin className="h-5 w-5" data-testid="icon-linkedin" />
                            </a>
                          )}
                          {profile.socialLinks.website && (
                            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              <Globe className="h-5 w-5" data-testid="icon-website" />
                            </a>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{profile.stats.posts}</div>
                          <div className="text-sm text-muted-foreground mt-1">Posts</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{profile.stats.friends}</div>
                          <div className="text-sm text-muted-foreground mt-1">Friends</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{profile.stats.eventsAttended}</div>
                          <div className="text-sm text-muted-foreground mt-1">Events</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-primary">{profile.stats.points}</div>
                          <div className="text-sm text-muted-foreground mt-1">Points</div>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
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
            </motion.div>

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
                        {safeDateFormat(event.startDate, 'PPP', 'TBD')}
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
                <CardContent className="space-y-6">
                  {profile.bio && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Bio</h4>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}
                  {profile.yearsOfDancing && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Experience</h4>
                      <p className="text-muted-foreground">{profile.yearsOfDancing} years of tango</p>
                    </div>
                  )}
                  {(profile.leaderLevel || profile.followerLevel) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Dance Levels</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {profile.leaderLevel && (
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm font-semibold text-foreground">Leader</div>
                            <div className="text-sm text-muted-foreground">Level {profile.leaderLevel}</div>
                          </div>
                        )}
                        {profile.followerLevel && (
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm font-semibold text-foreground">Follower</div>
                            <div className="text-sm text-muted-foreground">Level {profile.followerLevel}</div>
                          </div>
                        )}
                      </div>
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
                  {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Social Media</h4>
                      <div className="flex gap-4">
                        {profile.socialLinks.instagram && (
                          <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiInstagram className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.facebook && (
                          <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiFacebook className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.youtube && (
                          <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiYoutube className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.tiktok && (
                          <a href={profile.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiTiktok className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.twitter && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiX className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.linkedin && (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <SiLinkedin className="h-5 w-5" />
                          </a>
                        )}
                        {profile.socialLinks.website && (
                          <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Member Since</h4>
                    <p className="text-muted-foreground">{safeDateFormat(profile.joinedAt, 'MMMM d, yyyy', 'recently')}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </>
    </AppLayout>
  );
}
