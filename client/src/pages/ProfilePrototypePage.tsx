import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Award, Users, Heart, MessageCircle, Share2, Edit, Settings, Music, GraduationCap, Mic2 } from "lucide-react";

const PROFILE_DATA = {
  name: "Sofia Rodriguez",
  username: "@sofia_tango",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1485872299829-c673f5194813?w=1500&auto=format&fit=crop&q=80",
  bio: "Professional tango instructor & performer from Buenos Aires. Teaching the world to dance, one embrace at a time.",
  location: "Buenos Aires, Argentina",
  joined: "March 2023",
  roles: ["teacher", "dj", "performer"],
  stats: {
    followers: 1243,
    following: 567,
    events: 89,
    posts: 234,
  },
  badges: ["Verified Teacher", "Festival Performer", "Community Leader"],
};

const ACTIVITY_FEED = [
  {
    id: 1,
    type: "post",
    content: "Amazing workshop today at Studio Pacifico! Thanks to everyone who joined 💃",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&auto=format&fit=crop&q=80",
    likes: 87,
    comments: 12,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "event",
    content: "Attended Buenos Aires Tango Festival 2025",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    timestamp: "1 day ago",
  },
  {
    id: 3,
    type: "post",
    content: "New choreography coming soon... 👀",
    likes: 156,
    comments: 23,
    timestamp: "3 days ago",
  },
];

export default function ProfilePrototypePage() {
  const [activeTab, setActiveTab] = useState("posts");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "teacher": return <GraduationCap className="w-4 h-4" />;
      case "dj": return <Music className="w-4 h-4" />;
      case "performer": return <Mic2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo - 16:9 aspect ratio hero */}
      <div className="relative w-full aspect-[16/6] overflow-hidden">
        <motion.img
          src={PROFILE_DATA.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-background" />
        
        <Button
          variant="outline"
          className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Cover
        </Button>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-6 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          {/* Avatar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Avatar className="w-40 h-40 border-8 border-background">
              <AvatarImage src={PROFILE_DATA.avatar} />
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-background" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.name}</h1>
                <p className="text-muted-foreground mb-4">{PROFILE_DATA.username}</p>

                {/* Role Badges - Prominent */}
                <div className="flex gap-2 mb-4">
                  {PROFILE_DATA.roles.map((role) => (
                    <Badge key={role} className="gap-1 capitalize">
                      {getRoleIcon(role)}
                      {role}
                    </Badge>
                  ))}
                </div>

                <p className="text-base mb-4 max-w-2xl">{PROFILE_DATA.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {PROFILE_DATA.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {PROFILE_DATA.joined}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{PROFILE_DATA.stats.followers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{PROFILE_DATA.stats.following.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{PROFILE_DATA.stats.events}</div>
                <div className="text-sm text-muted-foreground">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{PROFILE_DATA.stats.posts}</div>
                <div className="text-sm text-muted-foreground">Contributions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {ACTIVITY_FEED.map((item, index) => (
              <ActivityCard key={item.id} item={item} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="events">
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Events Timeline</h3>
              <p className="text-sm text-muted-foreground">
                {PROFILE_DATA.stats.events} events attended
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {PROFILE_DATA.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="gap-1">
                    <Award className="w-3 h-3" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ActivityCard({ item, index }: { item: typeof ACTIVITY_FEED[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        {item.image && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          <p className="mb-4">{item.content}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{item.timestamp}</span>
            {item.likes !== undefined && (
              <div className="flex gap-4">
                <button className="flex items-center gap-1 hover:text-foreground">
                  <Heart className="w-4 h-4" />
                  {item.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-foreground">
                  <MessageCircle className="w-4 h-4" />
                  {item.comments}
                </button>
                <button className="flex items-center gap-1 hover:text-foreground">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
