import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { 
  Globe, MapPin, Users, Calendar, Home, Building2, Search, 
  Sun, Moon, Filter, ChevronRight
} from "lucide-react";

// MOCK GLOBAL STATS
const GLOBAL_STATS = {
  cities: 10,
  countries: 4,
  members: 85,
  events: 10,
  venues: 0,
};

// MOCK COMMUNITIES
const COMMUNITIES = [
  { id: 1, name: "Buenos Aires", country: "Argentina", members: 3542, badge: "active" },
  { id: 2, name: "Madrid", country: "Spain", members: 1287, badge: "active" },
  { id: 3, name: "Milan", country: "Italy", members: 894, badge: null },
];

// MAP LAYERS
const MAP_LAYERS = [
  { id: "events", label: "Events", icon: Calendar, color: "bg-purple-500", enabled: true },
  { id: "housing", label: "Housing", icon: Home, color: "bg-green-500", enabled: true },
  { id: "venues", label: "Venues", icon: Building2, color: "bg-amber-500", enabled: true },
];

export default function CommunityPrototypePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayers, setActiveLayers] = useState(["events", "housing", "venues"]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

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
      <CommunityHero stats={GLOBAL_STATS} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Left: Map Controls */}
          <div className="w-96 space-y-6">
            {/* Search */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Search cities or countries...</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buenos Aires, Argentina..."
                  className="pl-10"
                />
              </div>
            </Card>

            {/* Map Layers */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Map Layers</h3>
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Toggle different data layers on the map
              </p>
              <div className="space-y-3">
                {MAP_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      activeLayers.includes(layer.id)
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                    <layer.icon className="w-5 h-5" />
                    <span className="font-medium">{layer.label}</span>
                    <div className="ml-auto">
                      {activeLayers.includes(layer.id) && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Communities List */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Communities ({COMMUNITIES.length} locations)</h3>
              <div className="space-y-3">
                {COMMUNITIES.map((community) => (
                  <motion.div
                    key={community.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-medium">{community.name}</p>
                        <p className="text-xs text-muted-foreground">{community.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {community.badge === "active" && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Globe className="w-4 h-4 mr-2" />
                Ask Mr. Blue
              </Button>
            </Card>
          </div>

          {/* Right: Interactive Map Placeholder */}
          <div className="flex-1">
            <Card className="overflow-hidden h-[800px]">
              <div className="relative w-full h-full bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
                {/* Map Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Globe className="w-24 h-24 mx-auto text-cyan-500 animate-pulse" />
                    <h3 className="text-2xl font-serif font-bold">Interactive Map</h3>
                    <p className="text-muted-foreground max-w-md">
                      Color-coded markers for Events ({activeLayers.includes('events') ? 'ON' : 'OFF'}), 
                      Housing ({activeLayers.includes('housing') ? 'ON' : 'OFF'}), 
                      and Venues ({activeLayers.includes('venues') ? 'ON' : 'OFF'})
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      {MAP_LAYERS.map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${layer.color}`} />
                          <span className="text-sm">{layer.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mock Markers */}
                <motion.div
                  className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-purple-500 border-4 border-white shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div
                  className="absolute top-1/2 right-1/3 w-8 h-8 rounded-full bg-green-500 border-4 border-white shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-1/3 left-1/2 w-8 h-8 rounded-full bg-amber-500 border-4 border-white shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityHero({ stats }: { stats: typeof GLOBAL_STATS }) {
  return (
    <div className="relative h-[40vh] w-full overflow-hidden">
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
            Global Tango Community
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Discover tango communities around the world
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <StatCard icon={Globe} label="Cities" value={stats.cities} suffix="cities 4 countries" />
            <StatCard icon={Users} label="Members" value={stats.members} suffix="worldwide dancers" />
            <StatCard icon={Calendar} label="Active Events" value={stats.events} suffix="this month" />
            <StatCard icon={Building2} label="Venues" value={stats.venues} suffix="milongas & studios" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix }: { 
  icon: any; 
  label: string; 
  value: number; 
  suffix: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
    >
      <Icon className="w-8 h-8 text-white mb-3 mx-auto" />
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/60">{suffix}</div>
    </motion.div>
  );
}
