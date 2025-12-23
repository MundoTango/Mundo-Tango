import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, TrendingUp, Users, MessageCircle, Star } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";

interface ClosenessMetric {
  friendId: number;
  friendName: string;
  friendImage?: string;
  closenessScore: number;
  connectionDegree: number;
  interactions: number;
  lastInteraction: string;
  trend: 'up' | 'down' | 'stable';
}

export default function ClosenessMetricsDashboardPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [timeframe, setTimeframe] = useState('30d');

  // Mock data
  const mockMetrics: ClosenessMetric[] = [
    {
      friendId: 1,
      friendName: 'Scott Boddye',
      friendImage: null,
      closenessScore: 95,
      connectionDegree: 1,
      interactions: 124,
      lastInteraction: new Date().toISOString(),
      trend: 'up'
    },
    {
      friendId: 2,
      friendName: 'Maria Rodriguez',
      friendImage: null,
      closenessScore: 87,
      connectionDegree: 1,
      interactions: 89,
      lastInteraction: new Date(Date.now() - 86400000).toISOString(),
      trend: 'stable'
    },
    {
      friendId: 3,
      friendName: 'John Smith',
      friendImage: null,
      closenessScore: 72,
      connectionDegree: 2,
      interactions: 45,
      lastInteraction: new Date(Date.now() - 172800000).toISOString(),
      trend: 'down'
    }
  ];

  const { data: metrics = mockMetrics } = useQuery<ClosenessMetric[]>({
    queryKey: ["/api/analytics/closeness", { timeframe }],
  });

  const stats = {
    avgCloseness: Math.round(metrics.reduce((sum, m) => sum + m.closenessScore, 0) / metrics.length),
    totalFriends: metrics.length,
    strongConnections: metrics.filter(m => m.closenessScore >= 80).length,
    totalInteractions: metrics.reduce((sum, m) => sum + m.interactions, 0),
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <div className="h-4 w-4" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:closenessMetrics.title', 'Closeness Metrics')} fallbackRoute="/analytics">
      <SEO 
        title={t('pages:closenessMetrics.seoTitle', 'Closeness Metrics Dashboard')}
        description={t('pages:closenessMetrics.seoDescription', 'Friendship closeness scores, connection degrees, interaction analysis, and relationship strength metrics')}
        ogImage="/og-image.png"
      />
      <PageLayout title={t('pages:closenessMetrics.title', 'Closeness Metrics Dashboard')} showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-closeness-metrics">
          
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card data-testid="stat-avg-closeness">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('pages:closenessMetrics.avgCloseness', 'Avg Closeness')}</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.avgCloseness}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('pages:closenessMetrics.outOf100', 'Out of 100')}</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-total-friends">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('pages:closenessMetrics.totalFriends', 'Total Friends')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFriends}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-strong-connections">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('pages:closenessMetrics.strongConnections', 'Strong Connections')}</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.strongConnections}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('pages:closenessMetrics.score80Plus', 'Score ≥ 80')}</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-total-interactions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('pages:closenessMetrics.totalInteractions', 'Total Interactions')}</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInteractions}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('pages:closenessMetrics.lastTimeframe', 'Last {{timeframe}}', { timeframe })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card data-testid="card-closeness-info">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  {t('pages:closenessMetrics.friendshipAlgorithm', 'Friendship Closeness Algorithm')}
                </CardTitle>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32" data-testid="select-timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">{t('pages:closenessMetrics.last7Days', 'Last 7 days')}</SelectItem>
                    <SelectItem value="30d">{t('pages:closenessMetrics.last30Days', 'Last 30 days')}</SelectItem>
                    <SelectItem value="90d">{t('pages:closenessMetrics.last90Days', 'Last 90 days')}</SelectItem>
                    <SelectItem value="1y">{t('pages:closenessMetrics.lastYear', 'Last year')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('pages:closenessMetrics.algorithmDescription', 'Closeness scores are calculated based on interaction frequency, shared events, message exchanges, post engagement, and connection duration. Scores range from 0-100, with higher scores indicating stronger friendships.')}
              </p>
              <div className="flex gap-2">
                <Badge variant="default">{t('pages:closenessMetrics.realTimeCalculation', 'Real-time Calculation')}</Badge>
                <Badge variant="secondary">{t('pages:closenessMetrics.mlPowered', 'ML-Powered')}</Badge>
                <Badge variant="outline">{t('pages:closenessMetrics.privacyFirst', 'Privacy-First')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Closeness Rankings */}
          <Card data-testid="card-closeness-rankings">
            <CardHeader>
              <CardTitle>{t('pages:closenessMetrics.friendshipRankings', 'Friendship Rankings')}</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t('pages:closenessMetrics.noFriendshipData', 'No friendship data available')}
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics
                    .sort((a, b) => b.closenessScore - a.closenessScore)
                    .map((metric, idx) => (
                      <div 
                        key={metric.friendId} 
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`friend-${metric.friendId}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                            #{idx + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold" data-testid={`name-${metric.friendId}`}>
                              {metric.friendName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{t('pages:closenessMetrics.interactions', '{{count}} interactions', { count: metric.interactions })}</span>
                              <span>•</span>
                              <span>{t('pages:closenessMetrics.degree', 'Degree {{degree}}', { degree: metric.connectionDegree })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(metric.closenessScore)}`}
                                   data-testid={`score-${metric.friendId}`}>
                                {metric.closenessScore}
                              </div>
                              <p className="text-xs text-muted-foreground">{t('pages:closenessMetrics.closeness', 'closeness')}</p>
                            </div>
                            {getTrendIcon(metric.trend)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card data-testid="card-score-distribution">
            <CardHeader>
              <CardTitle>{t('pages:closenessMetrics.scoreDistribution', 'Score Distribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-500">
                    {metrics.filter(m => m.closenessScore >= 80).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pages:closenessMetrics.strong', 'Strong (80-100)')}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-500">
                    {metrics.filter(m => m.closenessScore >= 60 && m.closenessScore < 80).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pages:closenessMetrics.good', 'Good (60-79)')}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-yellow-500">
                    {metrics.filter(m => m.closenessScore >= 40 && m.closenessScore < 60).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pages:closenessMetrics.moderate', 'Moderate (40-59)')}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-muted-foreground">
                    {metrics.filter(m => m.closenessScore < 40).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pages:closenessMetrics.weak', 'Weak (0-39)')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
