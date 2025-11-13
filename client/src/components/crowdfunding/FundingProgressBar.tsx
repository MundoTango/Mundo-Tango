import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FundingProgressBarProps {
  raised: number;
  goal: number;
  percentage: number;
  className?: string;
}

export function FundingProgressBar({ raised, goal, percentage, className }: FundingProgressBarProps) {
  const displayPercentage = Math.min(percentage, 100);
  
  return (
    <div className={cn("space-y-2", className)} data-testid="progress-funding">
      <div className="relative">
        <Progress 
          value={displayPercentage} 
          className="h-3 bg-white/10"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        />
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${displayPercentage}%`,
            background: 'linear-gradient(90deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
            boxShadow: '0 0 20px rgba(64, 224, 208, 0.3)',
          }}
        />
      </div>
      
      <div className="flex items-baseline justify-between">
        <div>
          <span 
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            data-testid="text-amount-raised"
          >
            ${raised.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            raised of{" "}
            <span className="font-semibold text-foreground" data-testid="text-goal-amount">
              ${goal.toLocaleString()}
            </span>
          </span>
        </div>
        <span className="text-lg font-semibold text-foreground">
          {displayPercentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
