import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Sparkles, Users, Calendar, MapPin, Music2, Star, 
  GraduationCap, PartyPopper, Plane, TrendingUp, Zap
} from "lucide-react";

export default function FeedPrototypePage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Dancer';
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 18 ? 'Good afternoon' : 
    'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-3xl space-y-6">
          {/* Hero Welcome Section */}
          <HeroWelcome greeting={greeting} firstName={firstName} />

          {/* Create Post Card */}
          <CreatePostCard />

          {/* Trending Topics */}
          <TrendingTopics />

          {/* Post Feed */}
          <PostCard
            author={{
              name: "Sofia Martinez",
              username: "@sofia_tango",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
              verified: true
            }}
            content="Just experienced the most magical milonga at Salon Canning! The energy, the music, the embrace... this is why we dance. 💫"
            timestamp="2 hours ago"
            location="Buenos Aires, Argentina"
            category="Milonga"
            stats={{ likes: 142, comments: 28, shares: 12 }}
            image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop"
          />

          <PostCard
            author={{
              name: "Marco Rossi",
              username: "@marco_dj",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco",
              verified: false
            }}
            content="Teaching my first workshop this weekend! 🎓 Topic: The Art of Musicality in Tango. Limited spots available - who's joining?"
            timestamp="5 hours ago"
            location="Milan, Italy"
            category="Workshop"
            stats={{ likes: 89, comments: 15, shares: 8 }}
          />

          <PostCard
            author={{
              name: "Elena Volkov",
              username: "@elena_dance",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
              verified: true
            }}
            content="Festival season is here! Just booked tickets to three festivals across Europe. Who else is planning their tango travel? ✈️🌍"
            timestamp="8 hours ago"
            location="Barcelona, Spain"
            category="Travel"
            stats={{ likes: 234, comments: 47, shares: 31 }}
            image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop"
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          <CommunityStats />
          <SuggestedConnections />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}

function HeroWelcome({ greeting, firstName }: { greeting: string; firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      <Card 
        className="relative p-8 border-2"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(64, 224, 208, 0.12) 0%, 
              rgba(30, 144, 255, 0.08) 50%,
              rgba(100, 180, 255, 0.06) 100%
            )
          `,
          borderImage: 'linear-gradient(135deg, rgba(64, 224, 208, 0.4), rgba(30, 144, 255, 0.3)) 1',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 8px 32px rgba(64, 224, 208, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(64, 224, 208, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {greeting}, {firstName}!
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-6 text-lg">
            Welcome back to your tango community
          </p>

          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={<Heart className="w-5 h-5" />} value={24} label="Posts Today" delay={0.7} />
            <StatCard icon={<Users className="w-5 h-5" />} value={142} label="Active Now" delay={0.8} />
            <StatCard icon={<Calendar className="w-5 h-5" />} value={8} label="Events This Week" delay={0.9} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function StatCard({ icon, value, label, delay }: { icon: React.ReactNode; value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className="flex flex-col items-center p-4 rounded-lg cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(64, 224, 208, 0.2)',
      }}
    >
      <div className="text-primary mb-2">{icon}</div>
      <div className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-muted-foreground text-center mt-1">{label}</div>
    </motion.div>
  );
}

function CreatePostCard() {
  const { user } = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 hover-elevate" style={{ backdropFilter: 'blur(10px)' }}>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={user?.profileImage || undefined} />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Share your tango moment..."
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border-0 focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="ghost" className="gap-2">
                <Music2 className="w-4 h-4" />
                Music
              </Button>
              <Button size="sm" variant="ghost" className="gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Button>
              <Button size="sm" variant="ghost" className="gap-2">
                <Star className="w-4 h-4" />
                Feeling
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TrendingTopics() {
  const topics = [
    { name: "Milonga", icon: Music2, count: 45 },
    { name: "Workshop", icon: GraduationCap, count: 28 },
    { name: "Festival", icon: PartyPopper, count: 18 },
    { name: "Travel", icon: Plane, count: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Trending Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
            >
              <Badge 
                variant="secondary" 
                className="gap-2 px-3 py-2 hover-elevate cursor-pointer"
              >
                <topic.icon className="w-4 h-4" />
                {topic.name}
                <span className="text-xs opacity-60">• {topic.count}</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

interface PostCardProps {
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  location: string;
  category: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  image?: string;
}

function PostCard({ author, content, timestamp, location, category, stats, image }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const categoryConfig = {
    Milonga: { icon: Music2, color: "text-red-500" },
    Workshop: { icon: GraduationCap, color: "text-blue-500" },
    Travel: { icon: Plane, color: "text-cyan-500" },
  } as any;

  const config = categoryConfig[category] || { icon: Star, color: "text-yellow-500" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={author.avatar} />
                  <AvatarFallback>{author.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{author.name}</h4>
                  {author.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <Zap className="w-4 h-4 text-primary fill-primary" />
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{author.username}</span>
                  <span>•</span>
                  <span>{timestamp}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <config.icon className={`w-3 h-3 ${config.color}`} />
                {category}
              </Badge>
              <Button size="icon" variant="ghost">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-base leading-relaxed">{content}</p>
        </div>

        {/* Image */}
        {image && (
          <motion.div 
            className="relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={image} 
              alt="Post" 
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        )}

        {/* Stats Bar */}
        <div className="px-6 py-3 flex items-center justify-between text-sm text-muted-foreground border-t">
          <div className="flex gap-4">
            <span>{stats.likes} likes</span>
            <span>{stats.comments} comments</span>
          </div>
          <span>{stats.shares} shares</span>
        </div>

        <Separator />

        {/* Actions */}
        <div className="p-4 flex items-center justify-around">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className={liked ? 'text-red-500 font-semibold' : ''}>Like</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              Comment
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

function CommunityStats() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Community Pulse</h3>
      </div>
      <div className="space-y-4">
        <StatRow label="Active Dancers" value="2,847" trend="+12%" />
        <StatRow label="Events Today" value="34" trend="+8%" />
        <StatRow label="New Connections" value="156" trend="+24%" />
      </div>
    </Card>
  );
}

function StatRow({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        <Badge variant="secondary" className="text-xs text-green-600">
          {trend}
        </Badge>
      </div>
    </div>
  );
}

function SuggestedConnections() {
  const suggestions = [
    { name: "Carlos Silva", role: "Professional Dancer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos" },
    { name: "Ana Torres", role: "Dance Teacher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana" },
    { name: "Luis Garcia", role: "Event Organizer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luis" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Suggested Connections</h3>
      <div className="space-y-4">
        {suggestions.map((person, i) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={person.avatar} />
                <AvatarFallback>{person.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{person.name}</p>
                <p className="text-xs text-muted-foreground">{person.role}</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Follow</Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function UpcomingEvents() {
  const events = [
    { name: "Milonga La Estrella", date: "Tonight 8PM", location: "Buenos Aires" },
    { name: "Beginner Workshop", date: "Tomorrow 2PM", location: "Barcelona" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Upcoming Events</h3>
      </div>
      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
          >
            <p className="font-medium text-sm">{event.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{event.date}</span>
              <MapPin className="w-3 h-3 ml-1" />
              <span>{event.location}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
