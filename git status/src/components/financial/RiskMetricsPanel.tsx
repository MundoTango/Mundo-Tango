import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Activity, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectFinancialRiskMetrics } from "@shared/schema";

interface RiskMetricsPanelProps {
  metrics: SelectFinancialRiskMetrics | null;
  isLoading?: boolean;
}

interface MetricItemProps {
  label: string;
  value: string | number;
  description: string;
  icon: any;
  status?: 'good' | 'warning' | 'danger';
}

function MetricItem({ label, value, description, icon: Icon, status = 'good' }: MetricItemProps) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <div 
      className="p-4 rounded-lg"
      style={{
        background: 'rgba(64, 224, 208, 0.05)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: '#40E0D0' }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      <p className={`text-2xl font-bold ${statusColors[status]}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export function RiskMetricsPanel({ metrics, isLoading }: RiskMetricsPanelProps) {
  if (isLoading) {
    return (
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
        data-testid="panel-risk-metrics"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
        data-testid="panel-risk-metrics"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No risk metrics available</p>
        </CardContent>
      </Card>
    );
  }

  const sharpeRatio = parseFloat(metrics.sharpeRatio || "0");
  const maxDrawdown = parseFloat(metrics.maxDrawdown || "0");
  const volatility = parseFloat(metrics.volatility || "0");
  const beta = parseFloat(metrics.beta || "0");
  const var95 = parseFloat(metrics.var95 || "0");

  const getSharpeStatus = (ratio: number): 'good' | 'warning' | 'danger' => {
    if (ratio >= 1.5) return 'good';
    if (ratio >= 0.5) return 'warning';
    return 'danger';
  };

  const getDrawdownStatus = (drawdown: number): 'good' | 'warning' | 'danger' => {
    const absDrawdown = Math.abs(drawdown);
    if (absDrawdown <= 0.1) return 'good';
    if (absDrawdown <= 0.25) return 'warning';
    return 'danger';
  };

  const getVolatilityStatus = (vol: number): 'good' | 'warning' | 'danger' => {
    if (vol <= 0.15) return 'good';
    if (vol <= 0.30) return 'warning';
    return 'danger';
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid="panel-risk-metrics"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Metrics
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Updated {new Date(metrics.calculatedAt).toLocaleTimeString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <MetricItem
          label="Sharpe Ratio"
          value={sharpeRatio.toFixed(4)}
          description="Risk-adjusted return metric"
          icon={TrendingUp}
          status={getSharpeStatus(sharpeRatio)}
        />

        <MetricItem
          label="Max Drawdown"
          value={`${(maxDrawdown * 100).toFixed(2)}%`}
          description="Largest peak-to-trough decline"
          icon={AlertTriangle}
          status={getDrawdownStatus(maxDrawdown)}
        />

        <MetricItem
          label="Volatility"
          value={`${(volatility * 100).toFixed(2)}%`}
          description="Standard deviation of returns"
          icon={Activity}
          status={getVolatilityStatus(volatility)}
        />

        <MetricItem
          label="Beta"
          value={beta.toFixed(4)}
          description="Market correlation coefficient"
          icon={TrendingUp}
          status={Math.abs(beta) <= 1.2 ? 'good' : 'warning'}
        />

        <MetricItem
          label="Value at Risk (95%)"
          value={`$${var95.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          description="Maximum expected 1-day loss"
          icon={AlertTriangle}
          status="warning"
        />

        {metrics.exposureByAsset && typeof metrics.exposureByAsset === 'object' && (
          <div 
            className="p-4 rounded-lg md:col-span-2"
            style={{
              background: 'rgba(64, 224, 208, 0.05)',
              border: '1px solid rgba(64, 224, 208, 0.1)',
            }}
          >
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: '#40E0D0' }} />
              Exposure by Asset Type
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(metrics.exposureByAsset).map(([type, exposure]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{type}</span>
                  <span className="font-medium">
                    {typeof exposure === 'number' ? `${(exposure * 100).toFixed(1)}%` : String(exposure)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
