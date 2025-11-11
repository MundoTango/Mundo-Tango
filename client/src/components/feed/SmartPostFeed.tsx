import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Calendar, MapPin, Image as ImageIcon, Video, TrendingUp, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags?: string[];
  location?: string | null;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
}

interface SmartPostFeedProps {
  posts: Post[];
  onFilterChange?: (filteredPosts: Post[]) => void;
  children?: React.ReactNode;
}

const FILTER_CATEGORIES = [
  { id: "all", label: "All Posts", icon: TrendingUp, color: "text-cyan-500" },
  { id: "recent", label: "Recent", icon: Clock, color: "text-blue-500" },
  { id: "popular", label: "Popular", icon: TrendingUp, color: "text-orange-500" },
  { id: "photos", label: "Photos", icon: ImageIcon, color: "text-purple-500" },
  { id: "videos", label: "Videos", icon: Video, color: "text-pink-500" },
  { id: "tagged", label: "Tagged", icon: MapPin, color: "text-green-500" },
  { id: "nearby", label: "Nearby", icon: MapPin, color: "text-teal-500" },
];

const ENGAGEMENT_FILTERS = [
  { value: "all", label: "All Engagement" },
  { value: "high", label: "High Engagement (20+)" },
  { value: "medium", label: "Medium (10-20)" },
  { value: "low", label: "Low (<10)" },
];

const TIME_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

export function SmartPostFeed({ posts, onFilterChange, children }: SmartPostFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filters
  const [timeFilter, setTimeFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  // Filter logic
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(query) ||
        post.user?.name.toLowerCase().includes(query) ||
        post.user?.username.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        post.location?.toLowerCase().includes(query)
      );
    }

    // Category filter
    switch (activeCategory) {
      case "recent":
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        filtered = filtered.sort((a, b) => 
          (b.likes + b.comments * 2) - (a.likes + a.comments * 2)
        );
        break;
      case "photos":
        filtered = filtered.filter(post => post.imageUrl && !post.imageUrl.includes('.mp4'));
        break;
      case "videos":
        filtered = filtered.filter(post => post.imageUrl?.includes('.mp4'));
        break;
      case "tagged":
        filtered = filtered.filter(post => post.tags && post.tags.length > 0);
        break;
      case "nearby":
        filtered = filtered.filter(post => post.location);
        break;
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(post => {
        const postDate = new Date(post.createdAt);
        const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (timeFilter) {
          case "today":
            return diffDays < 1;
          case "week":
            return diffDays < 7;
          case "month":
            return diffDays < 30;
          case "year":
            return diffDays < 365;
          default:
            return true;
        }
      });
    }

    // Engagement filter
    if (engagementFilter !== "all") {
      filtered = filtered.filter(post => {
        const totalEngagement = post.likes + post.comments;
        switch (engagementFilter) {
          case "high":
            return totalEngagement >= 20;
          case "medium":
            return totalEngagement >= 10 && totalEngagement < 20;
          case "low":
            return totalEngagement < 10;
          default:
            return true;
        }
      });
    }

    // Location filter
    if (locationFilter.trim()) {
      filtered = filtered.filter(post => 
        post.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return filtered;
  }, [posts, searchQuery, activeCategory, timeFilter, engagementFilter, mediaTypeFilter, locationFilter]);

  // Notify parent of filter changes
  useState(() => {
    if (onFilterChange) {
      onFilterChange(filteredPosts);
    }
  });

  const activeFiltersCount = [
    timeFilter !== "all",
    engagementFilter !== "all",
    locationFilter.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4" data-testid="smart-post-feed">
      {/* Search Bar */}
      <Card 
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
              style={{ color: '#40E0D0' }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, people, tags, locations..."
              className="pl-10 bg-white/50 dark:bg-black/20 border-0 focus-visible:ring-1"
              style={{ 
                '--tw-ring-color': 'rgba(64, 224, 208, 0.5)',
              } as React.CSSProperties}
              data-testid="input-search-posts"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`relative ${showAdvancedFilters ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0' : ''}`}
            data-testid="button-toggle-advanced-filters"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {FILTER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`gap-2 ${isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0' : ''}`}
                data-testid={`button-filter-${category.id}`}
              >
                <Icon className={`w-4 h-4 ${!isActive ? category.color : ''}`} />
                {category.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card 
              className="p-4 space-y-4"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.08))',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(64, 224, 208, 0.3)',
              }}
              data-testid="advanced-filters-panel"
            >
              <div className="text-xl font-serif font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" style={{ color: '#40E0D0' }} />
                Advanced Filters
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Time Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#40E0D0' }} />
                    Time Range
                  </label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger data-testid="select-time-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_FILTERS.map(filter => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Engagement Level */}
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: '#40E0D0' }} />
                    Engagement Level
                  </label>
                  <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                    <SelectTrigger data-testid="select-engagement-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_FILTERS.map(filter => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#40E0D0' }} />
                    Location
                  </label>
                  <Input
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Filter by location..."
                    className="bg-white/50 dark:bg-black/20"
                    data-testid="input-location-filter"
                  />
                </div>
              </div>

              {/* Clear All Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTimeFilter("all");
                    setEngagementFilter("all");
                    setLocationFilter("");
                  }}
                  className="w-full"
                  data-testid="button-clear-all-filters"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
        <div>
          Showing <span className="font-semibold text-foreground">{filteredPosts.length}</span> of {posts.length} posts
        </div>
        {searchQuery && (
          <div className="flex items-center gap-2">
            <span>Search: "{searchQuery}"</span>
            <button onClick={() => setSearchQuery("")} className="text-cyan-500 hover:underline">
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Post Feed */}
      {children}
    </div>
  );
}
