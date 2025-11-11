import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RoleIconBadge } from "@/components/feed/RoleIconBadge";
import { 
  Users, MapPin, Star, TrendingUp, Search, Plus, Globe,
  Lock, Calendar, MessageCircle, UserPlus, Settings, Filter
} from "lucide-react";

const FEATURED_GROUPS = [
  {
    id: 1,
    name: "Buenos Aires Tango Community",
    description: "The largest tango community in the birthplace of tango. Join us for daily milongas, workshops, and cultural events.",
    coverImage: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200&auto=format&fit=crop&q=80",
    memberCount: 12847,
    activeToday: 2341,
    location: "Buenos Aires, Argentina",
    category: "Local Community",
    verified: true,
    privacy: "public" as const
  },
  {
    id: 2,
    name: "European Tango Festival Circuit",
    description: "Connect with festival-goers across Europe. Share experiences, plan trips, and discover the best tango events.",
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
    memberCount: 8234,
    activeToday: 1456,
    location: "Europe",
    category: "Travel & Festivals",
    verified: true,
    privacy: "public" as const
  },
  {
    id: 3,
    name: "Beginner Tango Journey",
    description: "A supportive space for tango beginners. Ask questions, share progress, find practice partners, and grow together.",
    coverImage: "https://images.unsplash.com/photo-1545224144-b38cd309ef69?w=1200&auto=format&fit=crop&q=80",
    memberCount: 5621,
    activeToday: 892,
    location: "Worldwide",
    category: "Learning",
    verified: false,
    privacy: "public" as const
  },
];

const RECOMMENDED_GROUPS = [
  { id: 4, name: "NYC Tango Nights", members: 3421, category: "Local Community", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=nyc" },
  { id: 5, name: "Tango DJ Network", members: 1876, category: "Professional", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=dj" },
  { id: 6, name: "Vintage Tango Music", members: 2134, category: "Music", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=music" },
  { id: 7, name: "Tango Fashion & Style", members: 4231, category: "Lifestyle", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=fashion" },
];

const ACTIVE_MEMBERS = [
  { id: 1, name: "Sofia Martinez", roles: ["dancer-leader", "teacher"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia" },
  { id: 2, name: "Marco Rossi", roles: ["teacher", "dj"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco" },
  { id: 3, name: "Elena Volkov", roles: ["organizer", "photographer"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena" },
  { id: 4, name: "Carlos Silva", roles: ["dancer-follower", "musician"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos" },
];

export default function GroupsPrototypePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Groups Discovery */}
      <GroupsHero />

      {/* Main Content - Magazine Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Main Column */}
          <div className="flex-1 max-w-4xl space-y-12">
            {/* Search & Filters */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups, interests, locations..."
                    className="pl-12 h-12 text-base"
                  />
                </div>
                <Button size="lg" className="gap-2 shrink-0">
                  <Plus className="w-5 h-5" />
                  Create Group
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "local", "travel", "learning", "professional", "music", "lifestyle"].map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="capitalize rounded-full whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Featured Groups - Hero Cards */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold">Featured Communities</h2>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>

              <div className="space-y-12">
                {FEATURED_GROUPS.map((group, index) => (
                  <FeaturedGroupCard key={group.id} group={group} index={index} />
                ))}
              </div>
            </div>

            {/* Recommended Groups - Compact Grid */}
            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold">Recommended for You</h3>
              <div className="grid grid-cols-2 gap-6">
                {RECOMMENDED_GROUPS.map((group) => (
                  <CompactGroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 space-y-8 sticky top-8 self-start">
            <ActiveMembersCard />
            <TrendingTopics />
            <GroupStats />
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsHero() {
  return (
    <div className="relative h-[50vh] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=2000&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
            Global Tango Communities
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
            Find Your Tribe
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Connect with passionate tango communities worldwide. Share experiences, 
            organize events, and build lasting friendships.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface FeaturedGroupCardProps {
  group: typeof FEATURED_GROUPS[0];
  index: number;
}

function FeaturedGroupCard({ group, index }: FeaturedGroupCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      {/* Cover Image - 16:9 Editorial */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
        <motion.img
          src={group.coverImage}
          alt={group.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {group.category}
            </Badge>
            {group.verified && (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3 h-3 fill-white" />
                <span>Verified</span>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-serif font-bold mb-2">{group.name}</h2>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {group.memberCount.toLocaleString()} members
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {group.activeToday.toLocaleString()} active today
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {group.location}
            </span>
          </div>
        </div>
      </div>

      {/* Group Content */}
      <div className="space-y-6 px-2">
        <p className="text-lg leading-relaxed text-foreground/90">
          {group.description}
        </p>

        <div className="flex items-center gap-4">
          <Button size="lg" className="gap-2">
            <UserPlus className="w-5 h-5" />
            Join Community
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <MessageCircle className="w-5 h-5" />
            View Posts
          </Button>
          <Button size="icon" variant="ghost" className="ml-auto">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Separator className="mt-12" />
    </motion.article>
  );
}

function CompactGroupCard({ group }: { group: typeof RECOMMENDED_GROUPS[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="p-6 hover-elevate cursor-pointer h-full">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-14 h-14 rounded-lg">
            <AvatarImage src={group.avatar} />
            <AvatarFallback>{group.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2">{group.name}</h3>
            <Badge variant="secondary" className="text-xs">{group.category}</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {group.members.toLocaleString()}
          </span>
          <Button size="sm" variant="outline">Join</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ActiveMembersCard() {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Active Members
      </h3>
      <div className="space-y-4">
        {ACTIVE_MEMBERS.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {member.name}
              </p>
              {/* Role Icons */}
              <RoleIconBadge roles={member.roles} size="sm" className="mt-1" />
            </div>
            <Button size="sm" variant="ghost" className="shrink-0">
              <UserPlus className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function TrendingTopics() {
  const topics = [
    { name: "#TangoFestival2024", posts: 1847 },
    { name: "#BeginnerTips", posts: 923 },
    { name: "#MilongaNight", posts: 2156 },
  ];

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Trending Topics
      </h3>
      <div className="space-y-4">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div>
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {topic.name}
              </p>
              <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function GroupStats() {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6">Community Stats</h3>
      <div className="space-y-4">
        <StatRow label="Total Groups" value="1,247" />
        <StatRow label="Active Today" value="8,934" />
        <StatRow label="New This Week" value="67" />
      </div>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}
