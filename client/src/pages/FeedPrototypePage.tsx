import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  MapPin, Music2, Star, GraduationCap, PartyPopper, Plane,
  TrendingUp, Users, Calendar, Music, Sparkles, Home,
  Camera, Palette, Briefcase, Mic, Pen, BookOpen,
  Target, Shirt, Globe, Radio, Eye, Trophy, Filter
} from "lucide-react";

// Tango Role Icon Mapping
const ROLE_ICONS = {
  "dancer-leader": Users,
  "dancer-follower": Music,
  "teacher": GraduationCap,
  "dj": Radio,
  "performer": Star,
  "organizer": Calendar,
  "venue-owner": Home,
  "photographer": Camera,
  "artist": Palette,
  "business": Briefcase,
  "mc": Mic,
  "journalist": Pen,
  "historian": BookOpen,
  "coach": Target,
  "clothing-designer": Shirt,
  "community-builder": Globe,
  "musician": Music2,
  "fan": Eye,
  "other": Heart,
} as const;

const TANGO_QUOTES = [
  { text: "The tango is a direct expression of something that poets have often tried to state in words: the belief that a struggle may be a celebration.", author: "Jorge Luis Borges" },
  { text: "Tango is a sad thought that is danced.", author: "Enrique Santos Discépolo" },
  { text: "The tango can be debated, and we all do, but it still encloses, as does all that is truthful, a secret.", author: "Jorge Luis Borges" },
];

export default function FeedPrototypePage() {
  const { user } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const currentQuote = TANGO_QUOTES[quoteIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Daily Tango Inspiration Hero - Full Width */}
      <DailyInspirationHero quote={currentQuote} />

      {/* Main Content - Magazine Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Main Feed Column - Editorial Style */}
          <div className="flex-1 max-w-4xl space-y-12">
            {/* Create Post - Clean & Spacious */}
            <CreatePostCard />

            {/* Feed Filters + Trending */}
            <div className="flex items-center justify-between">
              <FeedFilters />
              <TrendingBadge />
            </div>

            <Separator className="my-8" />

            {/* Post Feed - Magazine Style */}
            <div className="space-y-16">
              <PostCard
                author={{
                  name: "Sofia Martinez",
                  username: "@sofia_tango",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
                  verified: true,
                  role: "dancer-leader"
                }}
                content="Last night at Salon Canning was pure magic. The energy, the music, the embrace... moments like these remind me why we dance. 💫"
                timestamp="2h ago"
                location="Buenos Aires, Argentina"
                category="Milonga"
                stats={{ likes: 142, comments: 28, shares: 12 }}
                image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80"
              />

              <PostCard
                author={{
                  name: "Marco Rossi",
                  username: "@marco_dj",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco",
                  verified: false,
                  role: "teacher"
                }}
                content="Teaching my first workshop this weekend! 🎓 Topic: The Art of Musicality in Tango. Limited spots available - who's joining?"
                timestamp="5h ago"
                location="Milan, Italy"
                category="Workshop"
                stats={{ likes: 89, comments: 15, shares: 8 }}
              />

              <PostCard
                author={{
                  name: "Elena Volkov",
                  username: "@elena_dance",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
                  verified: true,
                  role: "organizer"
                }}
                content="Festival season is here! Just booked tickets to three festivals across Europe. Who else is planning their tango travel? ✈️🌍"
                timestamp="8h ago"
                location="Barcelona, Spain"
                category="Travel"
                stats={{ likes: 234, comments: 47, shares: 31 }}
                image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80"
              />
            </div>
          </div>

          {/* Sidebar - Elevated Design */}
          <div className="w-96 space-y-8 sticky top-8 self-start">
            <CommunityPulse />
            <UpcomingHighlights />
            <SuggestedConnections />
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyInspirationHero({ quote }: { quote: { text: string; author: string } }) {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=2000&auto=format&fit=crop&q=80')`,
        }}
      >
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
            Daily Tango Inspiration
          </Badge>
          
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quote.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8"
            >
              "{quote.text}"
            </motion.blockquote>
          </AnimatePresence>

          <motion.cite
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl text-white/80 font-light not-italic"
          >
            — {quote.author}
          </motion.cite>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1 h-3 bg-white/60 rounded-full mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}

function CreatePostCard() {
  const { user } = useAuth();
  return (
    <Card className="p-8 border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <div className="flex gap-6">
        <Avatar className="w-14 h-14">
          <AvatarImage src={user?.profileImage || undefined} />
          <AvatarFallback className="text-lg">{user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <input
            type="text"
            placeholder="Share your tango moment..."
            className="w-full px-0 py-2 text-lg bg-transparent border-0 border-b-2 border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <Camera className="w-4 h-4" />
              Photo
            </Button>
            <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <MapPin className="w-4 h-4" />
              Location
            </Button>
            <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <Music2 className="w-4 h-4" />
              Music
            </Button>
            <Button size="sm" className="ml-auto">
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FeedFilters() {
  const [active, setActive] = useState("all");
  const filters = [
    { id: "all", label: "All Posts" },
    { id: "following", label: "Following" },
    { id: "popular", label: "Popular" },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={active === filter.id ? "default" : "ghost"}
          size="sm"
          onClick={() => setActive(filter.id)}
          className="rounded-full"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

function TrendingBadge() {
  return (
    <Button variant="outline" size="sm" className="gap-2">
      <TrendingUp className="w-4 h-4 text-primary" />
      Trending
      <Badge variant="secondary" className="ml-1">24</Badge>
    </Button>
  );
}

interface PostCardProps {
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    role?: keyof typeof ROLE_ICONS;
  };
  content: string;
  timestamp: string;
  location: string;
  category: string;
  stats: { likes: number; comments: number; shares: number };
  image?: string;
}

function PostCard({ author, content, timestamp, location, category, stats, image }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const RoleIcon = author.role ? ROLE_ICONS[author.role] : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group"
    >
      {/* Featured Image - Magazine Style */}
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
          <motion.img
            src={image}
            alt="Post"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge 
            className="absolute top-6 left-6 bg-white/90 text-foreground border-0"
          >
            {category}
          </Badge>
        </div>
      )}

      {/* Post Content */}
      <div className="space-y-6">
        {/* Author Info - Editorial Style */}
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-primary/20">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{author.name}</h3>
              {author.verified && <Star className="w-4 h-4 text-primary fill-primary" />}
              {RoleIcon && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                  <RoleIcon className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {author.role?.split('-').join(' ')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{author.username}</span>
              <span>·</span>
              <span>{timestamp}</span>
              {location && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Post Text - Better Typography */}
        <p className="text-xl leading-relaxed text-foreground/90">
          {content}
        </p>

        {/* Stats Bar - Minimal */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground py-4">
          <span>{stats.likes} likes</span>
          <span>{stats.comments} comments</span>
          <span>{stats.shares} shares</span>
        </div>

        <Separator />

        {/* Actions - Spacious */}
        <div className="flex items-center gap-8 py-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">Comment</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors ml-auto"
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-primary text-primary' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function CommunityPulse() {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h3 className="font-semibold">Community Pulse</h3>
      </div>
      <div className="space-y-4">
        <PulseStat label="Active Now" value="2,847" trend="+12%" />
        <PulseStat label="Events Today" value="34" trend="+8%" />
        <PulseStat label="New Members" value="156" trend="+24%" />
      </div>
    </Card>
  );
}

function PulseStat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold">{value}</span>
        <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 dark:bg-green-950">
          {trend}
        </Badge>
      </div>
    </div>
  );
}

function UpcomingHighlights() {
  const events = [
    { name: "Milonga La Estrella", time: "Tonight 8PM", location: "Buenos Aires" },
    { name: "Beginner Workshop", time: "Tomorrow 2PM", location: "Barcelona" },
  ];

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Upcoming</h3>
      </div>
      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <p className="font-medium mb-1">{event.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function SuggestedConnections() {
  const suggestions = [
    { name: "Carlos Silva", role: "dancer-leader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos" },
    { name: "Ana Torres", role: "teacher", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana" },
  ];

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6">Suggested Connections</h3>
      <div className="space-y-4">
        {suggestions.map((person, i) => {
          const RoleIcon = ROLE_ICONS[person.role as keyof typeof ROLE_ICONS];
          return (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={person.avatar} />
                <AvatarFallback>{person.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{person.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {RoleIcon && <RoleIcon className="w-3 h-3" />}
                  <span className="capitalize">{person.role.replace('-', ' ')}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                Follow
              </Button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
