import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/theme-context";
import { 
  Users, MapPin, Star, Building2, Search, Plus, Globe,
  TrendingUp, MessageCircle, UserPlus, ChevronRight, Sun, Moon,
  Calendar, Home, Briefcase
} from "lucide-react";

// MY GROUPS - Example structure (real data loaded from API)
const MY_GROUPS = [
  {
    id: 1,
    name: "Buenos Aires",
    type: "city",
    unreadPosts: 0,
    coverImage: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Teachers Network",
    type: "professional",
    unreadPosts: 0,
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
  },
];

// CITIES - City name + cityscape (stats loaded from API)
const CITY_GROUPS = [
  {
    id: 1,
    name: "Buenos Aires",
    country: "Argentina",
    cityscape: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&auto=format&fit=crop&q=80",
    description: "The birthplace of tango",
  },
  {
    id: 2,
    name: "Paris",
    country: "France",
    cityscape: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80",
    description: "Europe's tango capital",
  },
  {
    id: 3,
    name: "New York",
    country: "USA",
    cityscape: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80",
    description: "Vibrant North American scene",
  },
  {
    id: 4,
    name: "Berlin",
    country: "Germany",
    cityscape: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&auto=format&fit=crop&q=80",
    description: "Alternative tango culture",
  },
  {
    id: 5,
    name: "Istanbul",
    country: "Turkey",
    cityscape: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&auto=format&fit=crop&q=80",
    description: "Bridge between cultures",
  },
  {
    id: 6,
    name: "Tokyo",
    country: "Japan",
    cityscape: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80",
    description: "Asian tango excellence",
  },
];

// PRO GROUPS - Professional communities (member counts loaded from API)
const PRO_GROUPS = [
  {
    id: 1,
    name: "Teachers Network",
    description: "A global network of certified instructors sharing methodology, pedagogy, and business insights.",
    coverImage: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200&auto=format&fit=crop&q=80",
    verified: true,
  },
  {
    id: 2,
    name: "DJ Collective",
    description: "Master the art of musicality. Share playlists, discover rare recordings, and elevate your DJ craft.",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
    verified: true,
  },
  {
    id: 3,
    name: "Event Organizers",
    description: "Connect with milonga and festival organizers worldwide. Best practices, sponsorships, and collaboration.",
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
    verified: true,
  },
  {
    id: 4,
    name: "Performers Union",
    description: "Stage performers sharing opportunities, choreography, and performance techniques.",
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
    verified: true,
  },
];

export default function GroupsPrototypePage() {
  const { t } = useTranslation(["pages", "common"]);
  const { darkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-groups");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tango Groups & Communities | Mundo Tango"
        description="Join tango communities worldwide. Connect with city groups, professional networks, and interest-based communities. Find your tango family."
      />
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

      {/* Hero Section */}
      <GroupsHero />

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
                placeholder={t('pages:groupsPrototype.searchPlaceholder', 'Search groups, cities, interests...')}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="my-groups" className="text-base">
                  <Star className="w-4 h-4 mr-2" />
                  {t('pages:groupsPrototype.myGroups', 'My Groups')}
                </TabsTrigger>
                <TabsTrigger value="cities" className="text-base">
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('pages:groupsPrototype.cities', 'Cities')}
                </TabsTrigger>
                <TabsTrigger value="professional" className="text-base">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('pages:groupsPrototype.professional', 'Professional')}
                </TabsTrigger>
              </TabsList>

              {/* MY GROUPS - Automated */}
              <TabsContent value="my-groups" className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-serif font-bold">{t('pages:groupsPrototype.myGroupsTitle', 'My Groups')}</h2>
                    <p className="text-muted-foreground mt-2">
                      {t('pages:groupsPrototype.myGroupsDescription', 'Automatically added based on your city and professional roles')}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {MY_GROUPS.map((group, index) => (
                    <MyGroupCard key={group.id} group={group} index={index} />
                  ))}
                </div>

                <Card className="p-8 text-center border-dashed">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('pages:groupsPrototype.joinMoreCommunities', 'Join More Communities')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('pages:groupsPrototype.exploreGroupsDescription', 'Explore Cities and Professional groups to expand your network')}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setActiveTab("cities")}>
                      {t('pages:groupsPrototype.browseCities', 'Browse Cities')}
                    </Button>
                    <Button onClick={() => setActiveTab("professional")}>
                      {t('pages:groupsPrototype.professionalGroups', 'Professional Groups')}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* CITIES - City name + cityscape */}
              <TabsContent value="cities" className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-serif font-bold">{t('pages:groupsPrototype.tangoCitiesTitle', 'Tango Cities Worldwide')}</h2>
                  <p className="text-muted-foreground mt-2">
                    {t('pages:groupsPrototype.tangoCitiesDescription', 'Connect with dancers in cities around the globe')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {CITY_GROUPS.map((city, index) => (
                    <CityGroupCard key={city.id} city={city} index={index} />
                  ))}
                </div>
              </TabsContent>

              {/* PRO GROUPS */}
              <TabsContent value="professional" className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-serif font-bold">{t('pages:groupsPrototype.professionalCommunitiesTitle', 'Professional Communities')}</h2>
                    <p className="text-muted-foreground mt-2">
                      {t('pages:groupsPrototype.professionalCommunitiesDescription', 'Networks for teachers, DJs, organizers, and performers')}
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('pages:groupsPrototype.requestNewGroup', 'Request New Group')}
                  </Button>
                </div>

                <div className="space-y-12">
                  {PRO_GROUPS.map((group, index) => (
                    <ProGroupCard key={group.id} group={group} index={index} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-96 space-y-8 sticky top-8 self-start">
            <GroupStats />
            <TrendingTopics />
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsHero() {
  const { t } = useTranslation(["pages", "common"]);
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
            {t('pages:groupsPrototype.globalCommunities', 'Global Tango Communities')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
            {t('pages:groupsPrototype.heroTitle', 'Find Your Community')}
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {t('pages:groupsPrototype.heroSubtitle', 'Connect with local dancers, join professional networks, and build lasting friendships worldwide')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function MyGroupCard({ group, index }: { group: typeof MY_GROUPS[0]; index: number }) {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden hover-elevate h-full">
        {/* Cover Image - 16:9 */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Group Name Overlay + New Badge */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold mb-1">{group.name}</h3>
                {group.type === "city" ? (
                  <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 gap-1">
                    <MapPin className="w-3 h-3" />
                    {t('pages:groupsPrototype.city', 'City')}
                  </Badge>
                ) : group.type === "professional" ? (
                  <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 gap-1">
                    <Briefcase className="w-3 h-3" />
                    {t('pages:groupsPrototype.pro', 'PRO')}
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 gap-1">
                    <Users className="w-3 h-3" />
                    {t('pages:groupsPrototype.group', 'Group')}
                  </Badge>
                )}
              </div>
              {group.unreadPosts > 0 && (
                <Badge className="bg-red-500 text-white">{t('pages:groupsPrototype.newPosts', '{{count}} new', { count: group.unreadPosts })}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{t('pages:groupsPrototype.activeCommunity', 'Active community')}</span>
          </div>

          <Button className="w-full gap-2">
            <MessageCircle className="w-4 h-4" />
            {t('pages:groupsPrototype.viewPosts', 'View Posts')}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function CityGroupCard({ city, index }: { city: typeof CITY_GROUPS[0]; index: number }) {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden hover-elevate h-full">
        {/* Cityscape Image - 16:9 */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={city.cityscape}
            alt={city.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* City Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-serif font-bold mb-1">{city.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-white/80">{city.country}</p>
              <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 gap-1">
                <MapPin className="w-3 h-3" />
                {t('pages:groupsPrototype.city', 'City')}
              </Badge>
            </div>
          </div>
        </div>

        {/* City Info */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">{city.description}</p>
          
          {/* Features */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {t('pages:groupsPrototype.events', 'Events')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Home className="w-3 h-3" />
              {t('pages:groupsPrototype.housing', 'Housing')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" />
              {t('pages:groupsPrototype.recommendations', 'Recommendations')}
            </Badge>
          </div>

          <Button className="w-full gap-2">
            <UserPlus className="w-4 h-4" />
            {t('pages:groupsPrototype.joinCity', 'Join {{city}}', { city: city.name })}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ProGroupCard({ group, index }: { group: typeof PRO_GROUPS[0]; index: number }) {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
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
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 gap-1">
              <Briefcase className="w-3 h-3" />
              {t('pages:groupsPrototype.pro', 'PRO')}
            </Badge>
            {group.verified && (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3 h-3 fill-white" />
                <span>{t('pages:groupsPrototype.verified', 'Verified')}</span>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-serif font-bold">{group.name}</h2>
        </div>
      </div>

      {/* Group Content */}
      <div className="space-y-6 px-2">
        <p className="text-lg leading-relaxed text-foreground/90">
          {group.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span className="text-foreground">{t('pages:groupsPrototype.professionalNetwork', 'Professional network')}</span>
          </span>

          <Button size="lg" className="gap-2">
            <UserPlus className="w-5 h-5" />
            {t('pages:groupsPrototype.joinCommunity', 'Join Community')}
          </Button>
        </div>
      </div>

      <Separator className="mt-12" />
    </motion.article>
  );
}

function GroupStats() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6">{t('pages:groupsPrototype.communityOverview', 'Community Overview')}</h3>
      <div className="space-y-4">
        <StatRow label={t('pages:groupsPrototype.totalGroups', 'Total Groups')} value={t('pages:groupsPrototype.growing', 'Growing')} />
        <StatRow label={t('pages:groupsPrototype.activeCities', 'Active Cities')} value={t('pages:groupsPrototype.worldwide', 'Worldwide')} />
        <StatRow label={t('pages:groupsPrototype.proNetworks', 'Pro Networks')} value={t('pages:groupsPrototype.active', 'Active')} />
        <StatRow label={t('pages:groupsPrototype.community', 'Community')} value={t('pages:groupsPrototype.thriving', 'Thriving')} />
      </div>
    </Card>
  );
}

function TrendingTopics() {
  const { t } = useTranslation(["pages", "common"]);
  const topics = [
    { name: "#TangoFestival", posts: t('pages:groupsPrototype.trending', 'Trending') },
    { name: "#BeginnerTips", posts: t('pages:groupsPrototype.popular', 'Popular') },
    { name: "#MilongaNight", posts: t('pages:groupsPrototype.active', 'Active') },
  ];

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        {t('pages:groupsPrototype.trendingTopics', 'Trending Topics')}
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
              <p className="text-xs text-muted-foreground">{topic.posts} {t('pages:groupsPrototype.posts', 'posts')}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        ))}
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
