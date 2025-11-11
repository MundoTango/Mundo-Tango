import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RoleIconBadge } from "@/components/feed/RoleIconBadge";
import { useTheme } from "@/contexts/theme-context";
import { 
  Users, MapPin, Star, Search, TrendingUp, Calendar,
  MessageCircle, UserPlus, Sun, Moon, Globe, Award,
  Zap, Heart
} from "lucide-react";

// FEATURED COMMUNITY MEMBERS
const FEATURED_MEMBERS = [
  {
    id: 1,
    name: "Sofia Martinez",
    username: "sofia_tango",
    location: "Buenos Aires, Argentina",
    roles: ["dancer-leader", "teacher", "organizer"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
    followers: 4521,
    contributions: 234,
    verified: true,
  },
  {
    id: 2,
    name: "Marco Rossi",
    username: "marco_dj",
    location: "Milan, Italy",
    roles: ["teacher", "dj"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco",
    coverImage: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200&auto=format&fit=crop&q=80",
    followers: 3421,
    contributions: 189,
    verified: true,
  },
  {
    id: 3,
    name: "Elena Volkov",
    username: "elena_dance",
    location: "Barcelona, Spain",
    roles: ["organizer", "dancer-follower", "photographer"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    coverImage: "https://images.unsplash.com/photo-1545224144-b38cd309ef69?w=1200&auto=format&fit=crop&q=80",
    followers: 5234,
    contributions: 312,
    verified: true,
  },
];

// COMMUNITY HIGHLIGHTS
const HIGHLIGHTS = [
  {
    id: 1,
    title: "Most Active City",
    value: "Buenos Aires",
    change: "+12%",
    icon: MapPin,
    color: "text-cyan-500",
  },
  {
    id: 2,
    title: "Events This Week",
    value: "234",
    change: "+8%",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    id: 3,
    title: "New Members",
    value: "156",
    change: "+24%",
    icon: Users,
    color: "text-green-500",
  },
  {
    id: 4,
    title: "Total Contributions",
    value: "12.8K",
    change: "+15%",
    icon: Heart,
    color: "text-pink-500",
  },
];

// TOP CONTRIBUTORS
const TOP_CONTRIBUTORS = [
  { id: 1, name: "Sofia Martinez", points: 2847, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia", badge: "🥇" },
  { id: 2, name: "Marco Rossi", points: 2341, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco", badge: "🥈" },
  { id: 3, name: "Elena Volkov", points: 2156, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena", badge: "🥉" },
  { id: 4, name: "Carlos Silva", points: 1987, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos", badge: "" },
  { id: 5, name: "Anna Schmidt", points: 1823, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna", badge: "" },
];

export default function CommunityPrototypePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={toggleDarkMode}
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:scale-110 transition-transform"
        >
          {darkMode === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600" />
          )}
        </Button>
      </div>

      {/* Hero Section */}
      <CommunityHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Main Column */}
          <div className="flex-1 max-w-4xl space-y-12">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community members, cities, roles..."
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Community Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {HIGHLIGHTS.map((highlight) => (
                <Card key={highlight.id} className="p-6 hover-elevate">
                  <highlight.icon className={`w-8 h-8 mb-4 ${highlight.color}`} />
                  <div className="text-3xl font-bold mb-1">{highlight.value}</div>
                  <div className="text-sm text-muted-foreground mb-2">{highlight.title}</div>
                  <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 dark:bg-green-950">
                    {highlight.change}
                  </Badge>
                </Card>
              ))}
            </div>

            {/* Featured Members */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold">Featured Members</h2>
                <Button variant="outline">View All</Button>
              </div>

              <div className="space-y-8">
                {FEATURED_MEMBERS.map((member, index) => (
                  <FeaturedMemberCard key={member.id} member={member} index={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96 space-y-8 sticky top-8 self-start">
            <TopContributorsCard />
            <GlobalStatsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityHero() {
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
            <Globe className="w-4 h-4 mr-2" />
            Global Tango Community
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
            Meet Our Community
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            12,847 passionate dancers, teachers, and artists across 89 cities worldwide
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface FeaturedMemberCardProps {
  member: typeof FEATURED_MEMBERS[0];
  index: number;
}

function FeaturedMemberCard({ member, index }: FeaturedMemberCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      {/* Cover Image - 16:9 */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-6">
        <motion.img
          src={member.coverImage}
          alt={member.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-white/20">
              <AvatarImage src={member.profileImage} />
              <AvatarFallback className="text-2xl">{member.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-serif font-bold">{member.name}</h3>
                {member.verified && <Star className="w-6 h-6 fill-white" />}
              </div>
              <p className="text-white/80 mb-2">@{member.username}</p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{member.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="space-y-4 px-2">
        {/* Role Icons */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Roles:</span>
          <RoleIconBadge roles={member.roles} size="md" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold">{member.followers.toLocaleString()}</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{member.contributions}</span>
            <span className="text-muted-foreground">contributions</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button className="gap-2 flex-1">
            <UserPlus className="w-4 h-4" />
            Follow
          </Button>
          <Button variant="outline" className="gap-2 flex-1">
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function TopContributorsCard() {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Top Contributors</h3>
      </div>
      <div className="space-y-4">
        {TOP_CONTRIBUTORS.map((contributor, i) => (
          <motion.div
            key={contributor.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="text-2xl w-8">{contributor.badge || `${i + 1}.`}</div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={contributor.avatar} />
              <AvatarFallback>{contributor.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {contributor.name}
              </p>
              <p className="text-xs text-muted-foreground">{contributor.points.toLocaleString()} points</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function GlobalStatsCard() {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6">Global Statistics</h3>
      <div className="space-y-4">
        <StatRow label="Total Members" value="12,847" />
        <StatRow label="Active Cities" value="89" />
        <StatRow label="Events This Month" value="2,341" />
        <StatRow label="Contributions" value="45.2K" />
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
