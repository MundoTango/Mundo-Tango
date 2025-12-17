import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DollarSign, Zap, MessageSquare, TrendingUp, Cpu } from 'lucide-react';

interface AIUsageStats {
  totalTokens: number;
  totalCost: number;
  queriesCount: number;
  averageResponseTime: number;
  modelsBreakdown: Array<{ name: string; usage: number; cost: number }>;
  dailyUsage: Array<{ date: string; tokens: number; cost: number }>;
  queryTypes: Array<{ type: string; count: number }>;
  optimizationSuggestions: Array<{ title: string; description: string; savings: number }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery<AIUsageStats>({
    queryKey: ['/api/mrblue/analytics'],
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-ai-analytics">
      <div>
        <h1 className="text-3xl font-bold">AI Usage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track token usage, costs, and performance metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-tokens">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-queries-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queriesCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total conversations
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-response-time">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average latency
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage" data-testid="tab-usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="models" data-testid="tab-models">Model Breakdown</TabsTrigger>
          <TabsTrigger value="queries" data-testid="tab-queries">Query Types</TabsTrigger>
          <TabsTrigger value="optimization" data-testid="tab-optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card data-testid="card-daily-usage">
            <CardHeader>
              <CardTitle>Daily Usage & Cost</CardTitle>
              <CardDescription>Token consumption and associated costs over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" name="Tokens" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" name="Cost ($)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-model-usage-chart">
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
                <CardDescription>Token distribution across AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.modelsBreakdown}
                      dataKey="usage"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {stats.modelsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-model-breakdown-table">
              <CardHeader>
                <CardTitle>Model Breakdown</CardTitle>
                <CardDescription>Detailed usage and cost per model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.modelsBreakdown.map((model, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`model-${idx}`}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.usage.toLocaleString()} tokens
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${model.cost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {((model.usage / stats.totalTokens) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card data-testid="card-query-types">
            <CardHeader>
              <CardTitle>Query Types Distribution</CardTitle>
              <CardDescription>Breakdown of query categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.queryTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card data-testid="card-optimization-suggestions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimization Suggestions
              </CardTitle>
              <CardDescription>Ways to reduce costs and improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.optimizationSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 rounded-lg border space-y-2" data-testid={`suggestion-${idx}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                      </div>
                      <Badge variant="default" data-testid={`badge-savings-${idx}`}>
                        Save ${suggestion.savings.toFixed(2)}/mo
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
