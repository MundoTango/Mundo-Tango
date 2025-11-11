import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/theme-context";
import { PostCreator } from "@/components/universal/PostCreator";
import { SmartPostFeed } from "@/components/feed/SmartPostFeed";
import { UpcomingEventsSidebar } from "@/components/feed/UpcomingEventsSidebar";
import { RoleIconBadge } from "@/components/feed/RoleIconBadge";
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  MapPin, Star, TrendingUp, Sun, Moon
} from "lucide-react";

const TANGO_QUOTES = [
  { text: "The tango is a direct expression of something that poets have often tried to state in words: the belief that a struggle may be a celebration.", author: "Jorge Luis Borges" },
  { text: "Tango is a sad thought that is danced.", author: "Enrique Santos Discépolo" },
  { text: "The tango can be debated, and we all do, but it still encloses, as does all that is truthful, a secret.", author: "Jorge Luis Borges" },
];

export default function FeedPrototypePage() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const currentQuote = TANGO_QUOTES[quoteIndex];

  // Mock posts for demonstration
  const mockPosts = [
    {
      id: 1,
      userId: 1,
      content: "Last night at Salon Canning was pure magic. The energy, the music, the embrace... moments like these remind me why we dance. 💫",
      imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
      visibility: "public",
      likes: 142,
      comments: 28,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ["milonga", "buenos-aires"],
      location: "Buenos Aires, Argentina",
      user: {
        id: 1,
        name: "Sofia Martinez",
        username: "sofia_tango",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
        tangoRoles: ["dancer-leader", "teacher", "organizer"],
        verified: true
      }
    },
    {
      id: 2,
      userId: 2,
      content: "Teaching my first workshop this weekend! 🎓 Topic: The Art of Musicality in Tango. Limited spots available - who's joining?",
      visibility: "public",
      likes: 89,
      comments: 15,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      location: "Milan, Italy",
      user: {
        id: 2,
        name: "Marco Rossi",
        username: "marco_dj",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco",
        tangoRoles: ["teacher", "dj"],
        verified: false
      }
    },
    {
      id: 3,
      userId: 3,
      content: "Festival season is here! Just booked tickets to three festivals across Europe. Who else is planning their tango travel? ✈️🌍",
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
      visibility: "public",
      likes: 234,
      comments: 47,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      location: "Barcelona, Spain",
      user: {
        id: 3,
        name: "Elena Volkov",
        username: "elena_dance",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
        tangoRoles: ["organizer", "dancer-follower", "photographer"],
        verified: true
      }
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={toggleDarkMode}
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:scale-110 transition-transform"
          data-testid="button-theme-toggle"
        >
          {darkMode === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600" />
          )}
        </Button>
      </div>

      {/* Daily Tango Inspiration Hero - Full Width */}
      <DailyInspirationHero quote={currentQuote} />

      {/* Main Content - Magazine Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Main Feed Column - Editorial Style */}
          <div className="flex-1 max-w-4xl space-y-12">
            {/* Post Creator - Integrated */}
            <PostCreator 
              onPostCreated={() => {}}
              className="border-0 shadow-sm"
            />

            {/* Smart Feed Search & Filters */}
            <SmartPostFeed posts={mockPosts as any}>
              {/* Post Feed - Magazine Style */}
              <div className="space-y-16 mt-8">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </SmartPostFeed>
          </div>

          {/* Sidebar - Elevated Design */}
          <div className="w-96 space-y-8 sticky top-8 self-start">
            <UpcomingEventsSidebar />
            <CommunityPulse />
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
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-8"
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

interface PostCardProps {
  post: {
    id: number;
    content: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    createdAt: string;
    location?: string;
    user: {
      name: string;
      username: string;
      profileImage?: string;
      tangoRoles?: string[];
      verified?: boolean;
    };
  };
}

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group"
      data-testid={`post-card-${post.id}`}
    >
      {/* Featured Image - Magazine Style */}
      {post.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
          <motion.img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Post Content */}
      <div className="space-y-6">
        {/* Author Info - Editorial Style with Role Icons */}
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 ring-2 ring-offset-2 ring-primary/20">
            <AvatarImage src={post.user.profileImage} />
            <AvatarFallback className="text-lg">{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-lg">{post.user.name}</h3>
              {post.user.verified && <Star className="w-4 h-4 text-primary fill-primary shrink-0" />}
              {/* Role Icons with Hover Tooltips */}
              {post.user.tangoRoles && post.user.tangoRoles.length > 0 && (
                <RoleIconBadge roles={post.user.tangoRoles} size="md" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              <span>@{post.user.username}</span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Post Text - Better Typography */}
        <p className="text-xl leading-relaxed text-foreground/90">
          {post.content}
        </p>

        {/* Stats Bar - Minimal */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground py-4">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
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
