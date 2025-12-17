import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignCard } from "@/components/crowdfunding/CampaignCard";
import { Heart, PlusCircle, Search, TrendingUp, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = 'trending' | 'new' | 'ending' | 'funded';
type CategoryFilter = 'all' | 'event' | 'medical' | 'education' | 'community' | 'travel' | 'equipment';

export default function CrowdfundingDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery<any[]>({
    queryKey: ['/api/crowdfunding/campaigns', { category: category !== 'all' ? category : undefined, sort: sortBy, search: searchQuery }],
  });

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['/api/crowdfunding/stats'],
  });

  const displayCampaigns = campaigns || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div 
        className="relative py-16 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1828 0%, #1e3a5f 50%, #0047AB 100%)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(64, 224, 208, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(30, 144, 255, 0.3) 0%, transparent 50%)',
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Fund Your Dreams
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Support tango events, help dancers in need, and bring creative projects to life
            </p>
            <Link href="/crowdfunding/create">
              <Button 
                size="lg" 
                className="text-lg px-8"
                data-testid="button-create-campaign"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Start a Campaign
              </Button>
            </Link>
          </div>

          {/* Platform Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { label: "Total Raised", value: `$${stats.totalRaised?.toLocaleString() || '0'}`, icon: DollarSign },
                { label: "Campaigns Funded", value: stats.campaignsFunded || '0', icon: Heart },
                { label: "Community Backers", value: stats.totalBackers || '0', icon: Users },
              ].map((stat) => (
                <Card 
                  key={stat.label}
                  className="border-white/20 backdrop-blur-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <stat.icon className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm text-white/60">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filters & Search */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-md border-white/10"
            />
          </div>

          {/* Category Tabs & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
              <TabsList className="bg-card/50 backdrop-blur-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="event">Events</TabsTrigger>
                <TabsTrigger value="medical">Emergency</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="travel">Travel</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px] bg-card/50 backdrop-blur-md border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </div>
                </SelectItem>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="ending">Ending Soon</SelectItem>
                <SelectItem value="funded">Most Funded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-white/10">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : displayCampaigns.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Be the first to start a campaign!"}
            </p>
            <Link href="/crowdfunding/create">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCampaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                creator={{
                  name: campaign.creator?.name || 'Anonymous',
                  profileImage: campaign.creator?.profileImage,
                }}
                backerCount={campaign.backerCount || 0}
                daysRemaining={campaign.daysRemaining}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
