import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignWizard } from "@/components/crowdfunding/CampaignWizard";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle } from "lucide-react";

export default function CrowdfundingCreatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/crowdfunding/campaigns', 'POST', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crowdfunding/campaigns'] });
      toast({
        title: "Success!",
        description: "Your campaign has been created successfully.",
      });
      setLocation(`/crowdfunding/campaign/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync({
      ...data,
      status: 'draft',
    });
  };

  const handleSaveDraft = (data: any) => {
    localStorage.setItem('campaignDraft', JSON.stringify(data));
    toast({
      title: "Draft saved",
      description: "Your progress has been saved locally.",
    });
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
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <PlusCircle className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Create Your Campaign
              </span>
            </h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Start fundraising for your tango event, emergency need, or creative project
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card 
          className="border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignWizard
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
