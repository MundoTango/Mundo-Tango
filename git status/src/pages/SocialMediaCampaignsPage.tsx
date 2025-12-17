import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlatformCheckbox } from "@/components/social/PlatformCheckbox";
import { ArrowLeft, Plus, Target, TrendingUp, Users, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import type { SelectSocialCampaign, InsertSocialCampaign } from "@shared/schema";

export default function SocialMediaCampaignsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    objective: "awareness",
    platforms: new Set<string>(),
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery<SelectSocialCampaign[]>({
    queryKey: ["/api/social/campaigns"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: Omit<InsertSocialCampaign, "userId">) => {
      return apiRequest({
        url: "/api/social/campaigns",
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Your campaign has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social/campaigns"] });
      setIsCreateOpen(false);
      setNewCampaign({
        name: "",
        objective: "awareness",
        platforms: new Set<string>(),
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Campaign",
        description: "There was an error creating your campaign",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || newCampaign.platforms.size === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: newCampaign.name,
      objective: newCampaign.objective,
      platforms: Array.from(newCampaign.platforms),
      startDate: new Date(newCampaign.startDate),
      endDate: newCampaign.endDate ? new Date(newCampaign.endDate) : null,
      status: "draft",
    });
  };

  const platformIcons = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    linkedin: SiLinkedin,
    twitter: SiX,
  };

  const statusColors = {
    draft: "bg-gray-500/20 text-gray-500",
    active: "bg-green-500/20 text-green-500",
    paused: "bg-yellow-500/20 text-yellow-500",
    completed: "bg-blue-500/20 text-blue-500",
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/social")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className="text-4xl font-serif font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Social Media Campaigns
              </h1>
              <p className="text-muted-foreground">
                Create and manage your marketing campaigns
              </p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Summer Tango Festival 2025"
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="campaign-objective">Objective</Label>
                  <select
                    id="campaign-objective"
                    className="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5"
                    value={newCampaign.objective}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, objective: e.target.value })
                    }
                  >
                    <option value="awareness">Brand Awareness</option>
                    <option value="engagement">Engagement</option>
                    <option value="traffic">Website Traffic</option>
                    <option value="conversions">Conversions</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">Platforms *</Label>
                  <div className="space-y-2">
                    {(["facebook", "instagram", "linkedin", "twitter"] as const).map(
                      (platform) => (
                        <PlatformCheckbox
                          key={platform}
                          platform={platform}
                          checked={newCampaign.platforms.has(platform)}
                          onCheckedChange={(checked) => {
                            const newPlatforms = new Set(newCampaign.platforms);
                            if (checked) {
                              newPlatforms.add(platform);
                            } else {
                              newPlatforms.delete(platform);
                            }
                            setNewCampaign({ ...newCampaign, platforms: newPlatforms });
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="hover-elevate transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                data-testid={`card-campaign-${campaign.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={statusColors[campaign.status as keyof typeof statusColors]}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{campaign.objective}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {campaign.platforms?.map((platform) => {
                      const Icon = platformIcons[platform as keyof typeof platformIcons];
                      return Icon ? (
                        <div
                          key={platform}
                          className="w-8 h-8 rounded-md flex items-center justify-center bg-white/10"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reach</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {Math.floor(Math.random() * 10000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "Ongoing"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="mb-4">Create your first marketing campaign</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
