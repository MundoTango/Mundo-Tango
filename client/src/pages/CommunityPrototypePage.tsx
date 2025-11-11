import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { CommunityMapWithLayers } from "@/components/map/CommunityMapWithLayers";
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

// TOP CITIES BY EVENTS (sorted by event count)
const TOP_CITIES = [
  { id: 1, name: "Buenos Aires", country: "Argentina", people: 3542, events: 127, housing: 43, recommendations: 62, badge: "active" },
  { id: 2, name: "Paris", country: "France", people: 1842, events: 89, housing: 28, recommendations: 34, badge: "active" },
  { id: 3, name: "Madrid", country: "Spain", people: 1287, events: 76, housing: 21, recommendations: 29, badge: "active" },
  { id: 4, name: "New York", country: "USA", people: 2314, events: 73, housing: 31, recommendations: 41, badge: "active" },
  { id: 5, name: "Berlin", country: "Germany", people: 1687, events: 51, housing: 24, recommendations: 29, badge: null },
].sort((a, b) => b.events - a.events);

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
  const [selectedCity, setSelectedCity] = useState<typeof TOP_CITIES[0] | null>(null);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Convert to map locations format
  const mapLocations = useMemo(() => TOP_CITIES.map(city => ({
    id: city.id,
    city: city.name,
    country: city.country,
    coordinates: { 
      lat: city.id === 1 ? -34.6037 : city.id === 2 ? 48.8566 : city.id === 3 ? 40.4168 : city.id === 4 ? 40.7128 : 52.5200,
      lng: city.id === 1 ? -58.3816 : city.id === 2 ? 2.3522 : city.id === 3 ? -3.7038 : city.id === 4 ? -74.0060 : 13.4050
    },
    memberCount: city.people,
    activeEvents: city.events,
    venues: city.recommendations,
    housing: city.housing,
    recommendations: city.recommendations,
    isActive: city.badge === "active"
  })), []);

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

            {/* Top Cities by Events */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Cities by Events</h3>
              <div className="space-y-4">
                {TOP_CITIES.map((city, index) => (
                  <motion.div
                    key={city.id}
                    whileHover={{ x: 4 }}
                    className="rounded-lg hover-elevate cursor-pointer border p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{city.name}</p>
                          <p className="text-xs text-muted-foreground">{city.country}</p>
                        </div>
                      </div>
                      {city.badge === "active" && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    
                    {/* City Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-500" />
                        <span className="text-muted-foreground">{city.people} people</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-500" />
                        <span className="text-muted-foreground">{city.events} events</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="w-3 h-3 text-green-500" />
                        <span className="text-muted-foreground">{city.housing} housing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-amber-500" />
                        <span className="text-muted-foreground">{city.recommendations} recs</span>
                      </div>
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

          {/* Right: Interactive Map */}
          <div className="flex-1">
            <Card className="overflow-hidden h-[800px]">
              <CommunityMapWithLayers
                locations={mapLocations}
                layers={MAP_LAYERS.map(l => ({ ...l, enabled: activeLayers.includes(l.id) }))}
                center={[-34.6037, -58.3816]}
                zoom={2}
                onCityClick={(city) => setSelectedCity(TOP_CITIES.find(c => c.name === city.city) || null)}
              />
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
            <StatCard icon={Users} label="Members" value={stats.members} suffix="worldwide members" />
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
