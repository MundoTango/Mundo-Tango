import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Heart, Users } from "lucide-react";
import { FundingProgressBar } from "./FundingProgressBar";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    category: string;
    goalAmount: string;
    currentAmount: string;
    status: string;
  };
  creator: {
    name: string;
    profileImage?: string;
  };
  backerCount: number;
  daysRemaining?: number;
}

const categoryColors: Record<string, string> = {
  event: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  medical: "bg-red-500/20 text-red-300 border-red-500/30",
  education: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  community: "bg-green-500/20 text-green-300 border-green-500/30",
  travel: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  equipment: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export function CampaignCard({ campaign, creator, backerCount, daysRemaining }: CampaignCardProps) {
  const goal = parseFloat(campaign.goalAmount);
  const raised = parseFloat(campaign.currentAmount);
  const percentage = goal > 0 ? (raised / goal) * 100 : 0;

  return (
    <Link href={`/crowdfunding/campaign/${campaign.id}`}>
      <Card 
        className="group overflow-hidden border-white/10 hover-elevate transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
          backdropFilter: 'blur(12px)',
        }}
        data-testid={`card-campaign-${campaign.id}`}
      >
        {/* Campaign Image */}
        <div className="relative aspect-video overflow-hidden">
          {campaign.imageUrl ? (
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
              }}
            >
              <Heart className="w-12 h-12 text-white/40" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline"
              className={cn(
                "border backdrop-blur-md capitalize",
                categoryColors[campaign.category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
              )}
            >
              {campaign.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {campaign.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={creator.profileImage} />
              <AvatarFallback className="text-xs">
                {creator.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by {creator.name}</span>
          </div>

          {/* Progress Bar */}
          <FundingProgressBar 
            raised={raised}
            goal={goal}
            percentage={percentage}
          />

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{backerCount} backers</span>
              </div>
              {daysRemaining !== null && daysRemaining !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{daysRemaining > 0 ? `${Math.round(daysRemaining)} days left` : 'Ended'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
