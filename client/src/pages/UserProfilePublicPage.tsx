import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { useTranslation } from "react-i18next";

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

const socialPlatforms: { key: keyof SocialLinks; icon: typeof SiInstagram }[] = [
  { key: 'instagram', icon: SiInstagram },
  { key: 'facebook', icon: SiFacebook },
  { key: 'youtube', icon: SiYoutube },
  { key: 'tiktok', icon: SiTiktok },
  { key: 'twitter', icon: SiX },
  { key: 'linkedin', icon: SiLinkedin },
  { key: 'website', icon: Globe },
];

export default function UserProfilePublicPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { userId } = useParams();

  const { data: profile, isLoading, refetch } = useQuery<UserProfile>({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const { data: recentPosts = [] } = useQuery<any[]>({
    queryKey: ['/api/users', userId, 'posts'],
  });

  const { data: recentEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/users', userId, 'events'],
  });

  // Normalize socialLinks - parse if it's a string
  const normalizedProfile = profile ? {
    ...profile,
    socialLinks: typeof profile.socialLinks === 'string' 
      ? JSON.parse(profile.socialLinks) 
      : profile.socialLinks
  } : null;

  if (isLoading || !normalizedProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('pages:userProfile.loadingProfile', 'Loading profile...')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <>
        <SEO
          title={`${normalizedProfile.name} (@${normalizedProfile.username}) - Tango Profile`}
          description={normalizedProfile.bio || `View ${normalizedProfile.name}'s tango profile, posts, and events.`}
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
                      <AvatarImage src={normalizedProfile.avatarUrl} alt={normalizedProfile.name} />
                      <AvatarFallback className="text-3xl">{normalizedProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h1 className="text-4xl font-serif font-bold text-foreground flex flex-wrap items-center gap-2" data-testid="text-profile-name">
                          {normalizedProfile.name}
                          {normalizedProfile.role === 'premium' && (
                            <Badge variant="default" className="ml-2">Premium</Badge>
                          )}
                          {normalizedProfile.role === 'teacher' && (
                            <Badge variant="outline" className="ml-2 border-primary text-primary">
                              <Award className="h-3 w-3 mr-1" />
                              Teacher
                            </Badge>
                          )}
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">@{normalizedProfile.username}</p>
                      </div>

                      {normalizedProfile.bio && (
                        <p className="text-foreground leading-relaxed text-lg">{normalizedProfile.bio}</p>
                      )}

                      {normalizedProfile.yearsOfDancing && (
                        <p className="text-primary font-semibold text-lg">{normalizedProfile.yearsOfDancing} years of tango experience</p>
                      )}

                      {(normalizedProfile.leaderLevel || normalizedProfile.followerLevel) && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                          {normalizedProfile.leaderLevel && (
                            <div className="text-center p-3 rounded-lg bg-muted">
                              <div className="text-lg font-semibold text-foreground">Leader</div>
                              <div className="text-sm text-muted-foreground">Level {normalizedProfile.leaderLevel}</div>
                            </div>
                          )}
                          {normalizedProfile.followerLevel && (
                            <div className="text-center p-3 rounded-lg bg-muted">
                              <div className="text-lg font-semibold text-foreground">Follower</div>
                              <div className="text-sm text-muted-foreground">Level {normalizedProfile.followerLevel}</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {normalizedProfile.city && normalizedProfile.country && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {normalizedProfile.city}, {normalizedProfile.country}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          Joined {safeDateFormat(normalizedProfile.joinedAt, 'MMMM yyyy', 'recently')}
                        </div>
                        {normalizedProfile.danceLevel && (
                          <div className="flex items-center gap-1.5">
                            <Music className="h-4 w-4 text-primary" />
                            {normalizedProfile.danceLevel}
                          </div>
                        )}
                      </div>

                      {normalizedProfile.socialLinks && Object.keys(normalizedProfile.socialLinks).length > 0 && (
                        <div className="flex gap-4 pt-2">
                          {socialPlatforms.map((platform) => {
                            const url = normalizedProfile.socialLinks?.[platform.key];
                            if (!url) return null;
                            const IconComponent = platform.icon;
                            return (
                              <a key={platform.key} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" data-testid={`icon-${platform.key}`}>
                                <IconComponent className="h-5 w-5" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{normalizedProfile.stats.posts}</div>
                          <div className="text-sm text-muted-foreground mt-1">Posts</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{normalizedProfile.stats.friends}</div>
                          <div className="text-sm text-muted-foreground mt-1">Friends</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-foreground">{normalizedProfile.stats.eventsAttended}</div>
                          <div className="text-sm text-muted-foreground mt-1">Events</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border">
                          <div className="text-3xl font-serif font-bold text-primary">{normalizedProfile.stats.points}</div>
                          <div className="text-sm text-muted-foreground mt-1">Points</div>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Button data-testid="button-add-friend">
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t('pages:userProfile.addFriend', 'Add Friend')}
                        </Button>
                        <Button variant="outline" data-testid="button-message">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {t('common:message', 'Message')}
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
              <TabsTrigger value="posts" data-testid="tab-posts">{t('pages:userProfile.posts', 'Posts')}</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">{t('pages:userProfile.events', 'Events')}</TabsTrigger>
              <TabsTrigger value="about" data-testid="tab-about">{t('pages:userProfile.about', 'About')}</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {recentPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('pages:userProfile.noPostsYet', 'No posts yet')}</p>
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
                    <p className="text-muted-foreground">{t('pages:userProfile.noUpcomingEvents', 'No upcoming events')}</p>
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
                  <CardTitle>{t('pages:userProfile.aboutUser', { name: normalizedProfile.name, defaultValue: `About ${normalizedProfile.name}` })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {normalizedProfile.bio && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('pages:userProfile.bio', 'Bio')}</h4>
                      <p className="text-muted-foreground">{normalizedProfile.bio}</p>
                    </div>
                  )}
                  {normalizedProfile.yearsOfDancing && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('pages:userProfile.experience', 'Experience')}</h4>
                      <p className="text-muted-foreground">{t('pages:userProfile.yearsOfTango', { years: normalizedProfile.yearsOfDancing, defaultValue: `${normalizedProfile.yearsOfDancing} years of tango` })}</p>
                    </div>
                  )}
                  {(normalizedProfile.leaderLevel || normalizedProfile.followerLevel) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">{t('pages:userProfile.danceLevels', 'Dance Levels')}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {normalizedProfile.leaderLevel && (
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm font-semibold text-foreground">Leader</div>
                            <div className="text-sm text-muted-foreground">Level {normalizedProfile.leaderLevel}</div>
                          </div>
                        )}
                        {normalizedProfile.followerLevel && (
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="text-sm font-semibold text-foreground">Follower</div>
                            <div className="text-sm text-muted-foreground">Level {normalizedProfile.followerLevel}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {normalizedProfile.danceLevel && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('pages:userProfile.danceLevel', 'Dance Level')}</h4>
                      <Badge>{normalizedProfile.danceLevel}</Badge>
                    </div>
                  )}
                  {normalizedProfile.city && normalizedProfile.country && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('pages:userProfile.location', 'Location')}</h4>
                      <p className="text-muted-foreground">{normalizedProfile.city}, {normalizedProfile.country}</p>
                    </div>
                  )}
                  {normalizedProfile.socialLinks && Object.keys(normalizedProfile.socialLinks).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">{t('pages:userProfile.socialMedia', 'Social Media')}</h4>
                      <div className="flex gap-4">
                        {socialPlatforms.map((platform) => {
                          const url = normalizedProfile.socialLinks?.[platform.key];
                          if (!url) return null;
                          const IconComponent = platform.icon;
                          return (
                            <a key={platform.key} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" data-testid={`icon-${platform.key}-about`}>
                              <IconComponent className="h-5 w-5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('pages:userProfile.memberSince', 'Member Since')}</h4>
                    <p className="text-muted-foreground">{safeDateFormat(normalizedProfile.joinedAt, 'MMMM d, yyyy', 'recently')}</p>
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
