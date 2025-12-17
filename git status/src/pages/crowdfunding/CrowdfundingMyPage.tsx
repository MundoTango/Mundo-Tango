import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FundingProgressBar } from "@/components/crowdfunding/FundingProgressBar";
import { CampaignStatsPanel } from "@/components/crowdfunding/CampaignStatsPanel";
import { WithdrawalModal } from "@/components/crowdfunding/WithdrawalModal";
import { Heart, Plus, Edit, Pause, Play, Trash2, TrendingUp, DollarSign } from "lucide-react";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CrowdfundingMyPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const { toast } = useToast();

  // Fetch user's campaigns
  const { data: myCampaigns } = useQuery({
    queryKey: ['/api/crowdfunding/campaigns/mine'],
  });

  // Fetch user's donations
  const { data: myDonations } = useQuery({
    queryKey: ['/api/crowdfunding/donations/user'],
  });

  // Fetch campaign analytics for selected campaign
  const { data: analytics } = useQuery({
    queryKey: ['/api/crowdfunding/campaigns', selectedCampaign?.id, 'analytics'],
    enabled: !!selectedCampaign,
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async ({ campaignId, amount }: { campaignId: number; amount: number }) => {
      return await apiRequest('/api/crowdfunding/withdrawals', 'POST', { campaignId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crowdfunding/campaigns/mine'] });
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal will be processed within 2-3 business days.",
      });
      setShowWithdrawal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = async (amount: number) => {
    if (selectedCampaign) {
      await withdrawMutation.mutateAsync({ campaignId: selectedCampaign.id, amount });
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    paused: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div 
        className="py-12 px-6"
        style={{
          background: 'linear-gradient(135deg, #0a1828 0%, #1e3a5f 50%, #0047AB 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">
            <span 
              style={{
                background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              My Crowdfunding
            </span>
          </h1>
          <p className="text-white/80 mt-2">Manage your campaigns and track your donations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-md">
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="backed">Backed Projects</TabsTrigger>
          </TabsList>

          {/* My Campaigns */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* Create Campaign Button */}
            <div className="flex justify-end">
              <Link href="/crowdfunding/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>

            {/* Campaigns List */}
            {myCampaigns && myCampaigns.length > 0 ? (
              <div className="space-y-6">
                {myCampaigns.map((campaign: any) => {
                  const goal = parseFloat(campaign.goalAmount);
                  const raised = parseFloat(campaign.currentAmount);
                  const percentage = goal > 0 ? (raised / goal) * 100 : 0;

                  return (
                    <Card 
                      key={campaign.id}
                      className="border-white/10"
                      style={{
                        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                            <Badge 
                              variant="outline"
                              className={statusColors[campaign.status] || ""}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/crowdfunding/campaign/${campaign.id}`}>
                            <Button variant="outline" size="icon">
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'active' && (
                            <Button variant="outline" size="icon">
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button variant="outline" size="icon">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <FundingProgressBar
                          raised={raised}
                          goal={goal}
                          percentage={percentage}
                        />

                        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                          <div>
                            <p className="text-sm text-muted-foreground">Backers</p>
                            <p className="text-xl font-bold text-foreground">{campaign.backerCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Days Left</p>
                            <p className="text-xl font-bold text-foreground">
                              {campaign.daysRemaining !== null && campaign.daysRemaining !== undefined
                                ? Math.round(campaign.daysRemaining)
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="text-xl font-bold text-foreground capitalize">{campaign.status}</p>
                          </div>
                          <div>
                            <Button 
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setShowWithdrawal(true);
                              }}
                              disabled={raised === 0}
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          </div>
                        </div>

                        {/* View Analytics */}
                        {analytics && selectedCampaign?.id === campaign.id && (
                          <div className="pt-4 border-t border-white/10">
                            <CampaignStatsPanel
                              campaignId={campaign.id}
                              analytics={analytics}
                              campaign={campaign}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-white/10 bg-card/50">
                <CardContent className="p-12 text-center space-y-4">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-2xl font-semibold">No campaigns yet</h3>
                  <p className="text-muted-foreground">Create your first campaign to start fundraising</p>
                  <Link href="/crowdfunding/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Backed Projects */}
          <TabsContent value="backed" className="space-y-6">
            {myDonations && myDonations.length > 0 ? (
              <div className="grid gap-4">
                {myDonations.map((donation: any) => (
                  <Card 
                    key={donation.id}
                    className="border-white/10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <Link href={`/crowdfunding/campaign/${donation.campaignId}`}>
                            <h4 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                              {donation.campaign?.title || 'Campaign'}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Donated {safeDateDistance(donation.createdAt, { addSuffix: true })}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground italic mt-2">
                              "{donation.message}"
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p 
                            className="text-2xl font-bold"
                            style={{
                              background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            ${parseFloat(donation.amount).toLocaleString()}
                          </p>
                          {donation.reward && (
                            <Badge variant="outline" className="mt-2">
                              {donation.reward.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-white/10 bg-card/50">
                <CardContent className="p-12 text-center space-y-4">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-2xl font-semibold">No backed projects yet</h3>
                  <p className="text-muted-foreground">Support a campaign to make a difference</p>
                  <Link href="/crowdfunding">
                    <Button>
                      <Heart className="w-4 h-4 mr-2" />
                      Browse Campaigns
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdrawal Modal */}
      {selectedCampaign && (
        <WithdrawalModal
          open={showWithdrawal}
          onClose={() => {
            setShowWithdrawal(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
}
