import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target } from "lucide-react";

interface FundraisingData {
  totalRaised: number;
  goal: number;
  percentage: number;
  donorCount: number;
  totalDonations: number;
}

interface FundraisingProgressProps {
  showCard?: boolean;
  compact?: boolean;
  className?: string;
}

export function FundraisingProgress({ 
  showCard = true, 
  compact = false,
  className = "" 
}: FundraisingProgressProps) {
  const { t } = useTranslation(['pages', 'common']);

  const { data, isLoading } = useQuery<FundraisingData>({
    queryKey: ['/api/donations/progress'],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const totalRaised = data?.totalRaised || 0;
  const goal = data?.goal || 30000;
  const percentage = data?.percentage || 0;
  const donorCount = data?.donorCount || 0;

  const content = (
    <div className={`space-y-4 ${compact ? 'space-y-2' : ''}`} data-testid="fundraising-progress">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className={`text-primary ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <span className={`font-semibold ${compact ? 'text-sm' : 'text-lg'}`} data-testid="text-raised-amount">
            ${totalRaised.toLocaleString()}
          </span>
          <span className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            {t('pages:donate.progress.of', 'of')} ${goal.toLocaleString()}
          </span>
        </div>
        <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-lg'}`} data-testid="text-percentage">
          {percentage}%
        </span>
      </div>

      <Progress 
        value={percentage} 
        className={compact ? 'h-2' : 'h-3'} 
        data-testid="progress-bar"
      />

      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          <span className={compact ? 'text-xs' : 'text-sm'} data-testid="text-donor-count">
            {donorCount} {t('pages:donate.progress.supporters', 'supporters')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className={`text-rose-500 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span className={compact ? 'text-xs' : 'text-sm'}>
            {t('pages:donate.progress.thankYou', 'Thank you!')}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-full mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className} data-testid="fundraising-card">
      <CardContent className={compact ? 'p-3' : 'p-6'}>
        {content}
      </CardContent>
    </Card>
  );
}
