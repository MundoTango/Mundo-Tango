import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementMetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function EngagementMetricsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  className,
}: EngagementMetricsCardProps) {
  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <Card
      className={cn("hover-elevate transition-all", className)}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon
              className={cn(
                "w-4 h-4",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-gray-500"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-gray-500"
              )}
            >
              {change > 0 && "+"}
              {change}% from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
