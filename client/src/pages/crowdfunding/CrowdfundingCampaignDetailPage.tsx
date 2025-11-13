import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FundingProgressBar } from "@/components/crowdfunding/FundingProgressBar";
import { DonationTierCard } from "@/components/crowdfunding/DonationTierCard";
import { CampaignUpdateCard } from "@/components/crowdfunding/CampaignUpdateCard";
import { DonationForm } from "@/components/crowdfunding/DonationForm";
import { BackerAvatar } from "@/components/crowdfunding/BackerAvatar";
import { Heart, Calendar, Users, Share2, Facebook, Twitter, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const categoryColors: Record<string, string> = {
  event: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  medical: "bg-red-500/20 text-red-300 border-red-500/30",
  education: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  community: "bg-green-500/20 text-green-300 border-green-500/30",
  travel: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  equipment: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export default function CrowdfundingCampaignDetailPage() {
  const [, params] = useRoute("/crowdfunding/campaign/:id");
  const campaignId = parseInt(params?.id || "0");
  
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch campaign details
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['/api/crowdfunding/campaigns', campaignId],
    enabled: campaignId > 0,
  });

  // Fetch campaign updates
  const { data: updates } = useQuery({
    queryKey: ['/api/crowdfunding/updates', campaignId],
    enabled: campaignId > 0,
  });

  // Fetch backers
  const { data: backers } = useQuery({
    queryKey: ['/api/crowdfunding/campaigns', campaignId, 'backers'],
    enabled: campaignId > 0,
  });

  // Donate mutation
  const donateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/crowdfunding/donations', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crowdfunding/campaigns'] });
      toast({
        title: "Thank you!",
        description: "Your donation has been processed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDonate = async (data: any) => {
    await donateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Skeleton className="h-96 w-full" />
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">Campaign not found</h2>
          <Link href="/crowdfunding">
            <Button variant="outline">Browse Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const goal = parseFloat(campaign.goalAmount);
  const raised = parseFloat(campaign.currentAmount);
  const percentage = goal > 0 ? (raised / goal) * 100 : 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Image/Video */}
      <div className="relative h-96 overflow-hidden">
        {campaign.imageUrl ? (
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{
              background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
            }}
          />
        )}
        
        {/* Dark overlay gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)',
          }}
        />

        {/* Campaign Badge */}
        <div className="absolute top-6 right-6">
          <Badge 
            variant="outline"
            className={`border backdrop-blur-md capitalize text-base px-4 py-2 ${categoryColors[campaign.category] || ""}`}
          >
            {campaign.category}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Creator */}
            <Card 
              className="border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(30, 144, 255, 0.2) 100%)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent className="p-8 space-y-4">
                <h1 className="text-4xl font-bold text-foreground">{campaign.title}</h1>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={campaign.creator?.profileImage} />
                    <AvatarFallback>{campaign.creator?.name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <p className="font-medium text-foreground">{campaign.creator?.name || 'Anonymous'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Story & Updates */}
            <Tabs defaultValue="story" className="space-y-6">
              <TabsList className="bg-card/50 backdrop-blur-md">
                <TabsTrigger value="story">Campaign Story</TabsTrigger>
                <TabsTrigger value="updates">Updates ({updates?.length || 0})</TabsTrigger>
                <TabsTrigger value="backers">Backers ({backers?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="story">
                <Card 
                  className="border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                        {campaign.description}
                      </p>
                      {campaign.story && (
                        <div className="mt-6 space-y-4">
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {campaign.story}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="space-y-4">
                {updates && updates.length > 0 ? (
                  updates.map((update: any) => (
                    <CampaignUpdateCard
                      key={update.id}
                      update={update}
                      creator={{
                        name: campaign.creator?.name || 'Anonymous',
                        profileImage: campaign.creator?.profileImage,
                      }}
                    />
                  ))
                ) : (
                  <Card className="border-white/10 bg-card/50">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No updates yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="backers">
                <Card 
                  className="border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <CardContent className="p-8">
                    {backers && backers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {backers.map((backer: any, index: number) => (
                          <BackerAvatar
                            key={index}
                            backer={backer}
                            amount={backer.amount}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No backers yet. Be the first!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Donation Panel */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Funding Progress */}
            <Card 
              className="border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(30, 144, 255, 0.2) 100%)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent className="p-6 space-y-6">
                <FundingProgressBar
                  raised={raised}
                  goal={goal}
                  percentage={percentage}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Backers</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{campaign.backerCount || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Days Left</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {campaign.daysRemaining !== null && campaign.daysRemaining !== undefined
                        ? Math.round(campaign.daysRemaining)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Back Button */}
                <Button 
                  className="w-full text-lg py-6"
                  onClick={() => setShowDonationForm(true)}
                  data-testid="button-back-project"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Back This Campaign
                </Button>

                {/* Share Buttons */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Share this campaign</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Tiers */}
            {campaign.rewards && campaign.rewards.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Reward Tiers</h3>
                {campaign.rewards.map((tier: any) => (
                  <DonationTierCard
                    key={tier.id}
                    tier={tier}
                    onSelect={(tierId) => {
                      setSelectedTierId(tierId);
                      setShowDonationForm(true);
                    }}
                    isSelected={selectedTierId === tier.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      <DonationForm
        open={showDonationForm}
        onClose={() => {
          setShowDonationForm(false);
          setSelectedTierId(null);
        }}
        campaignId={campaignId}
        campaignTitle={campaign.title}
        onSubmit={handleDonate}
      />
    </div>
  );
}
