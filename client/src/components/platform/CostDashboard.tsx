import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, TrendingUp, CreditCard } from "lucide-react";

interface CostRecord {
  id: number;
  amount: number;
  currency: string;
  platform: string;
  resourceType: string;
  description: string;
  recordedAt: string;
}

interface CostSummary {
  totalCost: number;
  platformBreakdown: Array<{ platform: string; total: number }>;
  trend: string;
}

export function CostDashboard() {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const { data: summaryResponse } = useQuery<{summary: CostSummary}>({
    queryKey: [`/api/platform/costs/summary?days=${daysFilter}`],
  });
  const summary = summaryResponse?.summary;

  const { data: costsResponse, isLoading } = useQuery<{costs: CostRecord[]}>({
    queryKey: platformFilter === "all"
      ? ["/api/platform/costs"]
      : [`/api/platform/costs?platform=${platformFilter}`],
  });
  const costs = costsResponse?.costs || [];

  const platforms = ["all", "vercel", "railway", "supabase", "github", "other"];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Cost Tracking</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor infrastructure costs across platforms
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={String(daysFilter)} onValueChange={(v) => setDaysFilter(Number(v))}>
          <SelectTrigger className="w-[180px]" data-testid="select-days-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              {formatCurrency(summary?.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {daysFilter} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-top-platform">
              {summary?.platformBreakdown[0]?.platform || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(summary?.platformBreakdown[0]?.total || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {summary?.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-destructive" />
            ) : (
              <TrendingDown className="w-4 h-4 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-trend">
              {summary?.trend === "up" ? "Increasing" : "Decreasing"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compared to previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost Records</CardTitle>
              <CardDescription>Detailed breakdown of infrastructure costs</CardDescription>
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-platform-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cost records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {costs.slice(0, 20).map((cost) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`card-cost-${cost.id}`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-cost-description-${cost.id}`}>
                        {cost.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cost.platform} • {cost.resourceType} • {new Date(cost.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(cost.amount, cost.currency)}</p>
                    <Badge variant="secondary" className="mt-1">{cost.platform}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
