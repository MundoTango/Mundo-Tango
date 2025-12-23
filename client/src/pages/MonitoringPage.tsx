import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface MonitoringData {
  vercel: {
    status: "operational" | "degraded" | "down";
    uptime: number;
    avgResponseTime: number;
    requests24h: number;
  };
  railway: {
    status: "operational" | "degraded" | "down";
    uptime: number;
    avgResponseTime: number;
    requests24h: number;
  };
  responseTimeHistory: Array<{
    timestamp: string;
    vercel: number;
    railway: number;
  }>;
  recentIncidents: Array<{
    platform: string;
    severity: "info" | "warning" | "critical";
    message: string;
    timestamp: string;
  }>;
}

export default function MonitoringPage() {
  const { t } = useTranslation(["pages", "common"]);
  // Mock data - in real app, this would fetch from monitoring service
  const { data: monitoring, isLoading } = useQuery<MonitoringData>({
    queryKey: ["/api/platform/monitoring"],
    queryFn: async () => ({
      vercel: {
        status: "operational",
        uptime: 99.98,
        avgResponseTime: 142,
        requests24h: 12847,
      },
      railway: {
        status: "operational",
        uptime: 99.95,
        avgResponseTime: 218,
        requests24h: 8932,
      },
      responseTimeHistory: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        vercel: Math.floor(120 + Math.random() * 80),
        railway: Math.floor(180 + Math.random() * 100),
      })),
      recentIncidents: [
        {
          platform: "Vercel",
          severity: "info",
          message: "Deployment completed successfully",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          platform: "Railway",
          severity: "warning",
          message: "Increased response time detected",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !monitoring) {
    return (
      <SelfHealingErrorBoundary pageName={t('pages:monitoring.pageName', 'Monitoring')} fallbackRoute="/platform">
        <PageLayout title={t('pages:monitoring.pageTitle', 'Monitoring Dashboard')} showBreadcrumbs>
<div className="container mx-auto p-6">
        <div className="text-center py-8" data-testid="loading-monitoring">
          {t('pages:monitoring.loading', 'Loading monitoring data...')}
        </div>
      </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('pages:monitoring.operational', 'Operational')}</Badge>;
      case "degraded":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />{t('pages:monitoring.degraded', 'Degraded')}</Badge>;
      case "down":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />{t('pages:monitoring.down', 'Down')}</Badge>;
      default:
        return <Badge variant="outline">{t('pages:monitoring.unknown', 'Unknown')}</Badge>;
    }
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:monitoring.pageName', 'Monitoring')} fallbackRoute="/platform">
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">{t('pages:monitoring.title', 'Monitoring Dashboard')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('pages:monitoring.subtitle', 'Real-time platform health and performance metrics')}
        </p>
      </div>

      {/* Platform Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t('pages:monitoring.vercelFrontend', 'Vercel (Frontend)')}</CardTitle>
            {getStatusBadge(monitoring.vercel.status)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.uptime', 'Uptime')}</div>
                <div className="text-2xl font-bold" data-testid="text-vercel-uptime">
                  {monitoring.vercel.uptime}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.avgResponse', 'Avg Response')}</div>
                <div className="text-2xl font-bold" data-testid="text-vercel-response">
                  {monitoring.vercel.avgResponseTime}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.requests24h', 'Requests (24h)')}</div>
                <div className="text-2xl font-bold" data-testid="text-vercel-requests">
                  {monitoring.vercel.requests24h.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{t('pages:monitoring.railwayBackend', 'Railway (Backend)')}</CardTitle>
            {getStatusBadge(monitoring.railway.status)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.uptime', 'Uptime')}</div>
                <div className="text-2xl font-bold" data-testid="text-railway-uptime">
                  {monitoring.railway.uptime}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.avgResponse', 'Avg Response')}</div>
                <div className="text-2xl font-bold" data-testid="text-railway-response">
                  {monitoring.railway.avgResponseTime}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('pages:monitoring.requests24h', 'Requests (24h)')}</div>
                <div className="text-2xl font-bold" data-testid="text-railway-requests">
                  {monitoring.railway.requests24h.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages:monitoring.responseTimeTitle', 'Response Time (Last 24 Hours)')}</CardTitle>
          <CardDescription>{t('pages:monitoring.responseTimeDesc', 'Average response times for frontend and backend')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monitoring.responseTimeHistory}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).getHours() + ":00"}
                stroke="#888888"
              />
              <YAxis stroke="#888888" />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value}ms`, ""]}
              />
              <Line
                type="monotone"
                dataKey="vercel"
                stroke="#0070f3"
                strokeWidth={2}
                name="Vercel"
              />
              <Line
                type="monotone"
                dataKey="railway"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Railway"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages:monitoring.recentEvents', 'Recent Events')}</CardTitle>
          <CardDescription>{t('pages:monitoring.recentEventsDesc', 'Latest platform events and incidents')}</CardDescription>
        </CardHeader>
        <CardContent>
          {monitoring.recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('pages:monitoring.noIncidents', 'No recent incidents')}
            </div>
          ) : (
            <div className="space-y-3">
              {monitoring.recentIncidents.map((incident, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-3 border rounded-lg"
                  data-testid={`incident-${i}`}
                >
                  {incident.severity === "critical" && <AlertCircle className="w-5 h-5 text-destructive mt-1" />}
                  {incident.severity === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />}
                  {incident.severity === "info" && <Activity className="w-5 h-5 text-blue-500 mt-1" />}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{incident.platform}</Badge>
                      <Badge
                        variant={
                          incident.severity === "critical"
                            ? "destructive"
                            : incident.severity === "warning"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="font-medium">{incident.message}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(incident.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </SelfHealingErrorBoundary>
  );
}
