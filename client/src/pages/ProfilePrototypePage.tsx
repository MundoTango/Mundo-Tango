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
      {/* Cover Photo - 16:9 aspect ratio hero with editorial treatment */}
      <div className="relative w-full aspect-[16/6] overflow-hidden">
        <motion.img
          src={PROFILE_DATA.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-background" />
        
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
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-12">
          {/* Avatar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Avatar className="w-48 h-48 border-8 border-background shadow-2xl">
              <AvatarImage src={PROFILE_DATA.avatar} />
              <AvatarFallback className="text-3xl">SR</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-background" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start justify-between gap-6 flex-wrap"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">{PROFILE_DATA.name}</h1>
                <p className="text-lg text-muted-foreground mb-6">{PROFILE_DATA.username}</p>

                {/* Role Badges - Prominent editorial treatment */}
                <div className="flex gap-2 mb-6">
                  {PROFILE_DATA.roles.map((role) => (
                    <Badge key={role} className="gap-1.5 capitalize px-4 py-1.5 text-sm">
                      {getRoleIcon(role)}
                      {role}
                    </Badge>
                  ))}
                </div>

                <p className="text-base md:text-lg leading-relaxed mb-6 max-w-2xl">{PROFILE_DATA.bio}</p>

                <div className="flex flex-wrap gap-6 text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {PROFILE_DATA.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Joined {PROFILE_DATA.joined}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
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
            </motion.div>
          </div>
        </div>

        {/* Stats Grid - Editorial card treatment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.following.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.events}</div>
                  <div className="text-sm text-muted-foreground">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
          <TabsList className="mb-8">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            {ACTIVITY_FEED.map((item, index) => (
              <ActivityCard key={item.id} item={item} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="events">
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-serif font-bold mb-3">Events Timeline</h3>
              <p className="text-base text-muted-foreground">
                {PROFILE_DATA.stats.events} events attended
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square bg-muted rounded-xl hover-elevate" 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-8">
              <h3 className="text-2xl font-serif font-bold mb-6">Achievements</h3>
              <div className="flex flex-wrap gap-3">
                {PROFILE_DATA.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="gap-1.5 px-4 py-2 text-sm">
                    <Award className="w-4 h-4" />
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        {item.image && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <motion.img 
              src={item.image} 
              alt="" 
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
        <CardContent className="p-8">
          <p className="text-lg leading-relaxed mb-6">{item.content}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{item.timestamp}</span>
            {item.likes !== undefined && (
              <div className="flex gap-6">
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <Heart className="w-5 h-5" />
                  {item.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <MessageCircle className="w-5 h-5" />
                  {item.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
