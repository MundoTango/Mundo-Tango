import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  Activity, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { SiStripe, SiFacebook, SiGoogle } from 'react-icons/si';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    latency: number;
    connections: number;
    maxConnections: number;
  };
  redis: {
    status: 'healthy' | 'warning' | 'error';
    latency: number;
    memoryUsage: number;
    hitRate: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usedSpace: number;
    totalSpace: number;
    availableSpace: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
    responseTime: number;
  };
  apis: {
    stripe: { status: 'healthy' | 'warning' | 'error'; latency: number };
    facebook: { status: 'healthy' | 'warning' | 'error'; latency: number };
    google: { status: 'healthy' | 'warning' | 'error'; latency: number };
  };
}

export default function SystemHealthPage() {
  const { data: health, isLoading, refetch } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/platform/health'],
    refetchInterval: 30000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" data-testid={`badge-${status}`}>Healthy</Badge>;
      case 'warning':
        return <Badge variant="default" data-testid={`badge-${status}`}>Warning</Badge>;
      case 'error':
        return <Badge variant="destructive" data-testid={`badge-${status}`}>Error</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-${status}`}>Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  if (isLoading || !health) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-system-health">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground mt-2">
            Monitor platform components and performance
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover-elevate"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-database-health">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Database (PostgreSQL)</CardTitle>
              </div>
              {getStatusIcon(health.database.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {getStatusBadge(health.database.status)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span>{health.database.latency}ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connections</span>
                <span>{health.database.connections} / {health.database.maxConnections}</span>
              </div>
              <Progress 
                value={(health.database.connections / health.database.maxConnections) * 100} 
                data-testid="progress-db-connections"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-redis-health">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                <CardTitle>Redis Cache</CardTitle>
              </div>
              {getStatusIcon(health.redis.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {getStatusBadge(health.redis.status)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span>{health.redis.latency}ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage</span>
                <span>{health.redis.memoryUsage}%</span>
              </div>
              <Progress value={health.redis.memoryUsage} data-testid="progress-redis-memory" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hit Rate</span>
                <span>{health.redis.hitRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-storage-health">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                <CardTitle>File Storage</CardTitle>
              </div>
              {getStatusIcon(health.storage.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {getStatusBadge(health.storage.status)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used Space</span>
                <span>{health.storage.usedSpace} GB / {health.storage.totalSpace} GB</span>
              </div>
              <Progress 
                value={(health.storage.usedSpace / health.storage.totalSpace) * 100} 
                data-testid="progress-storage"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span>{health.storage.availableSpace} GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-system-resources">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              <CardTitle>System Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CPU Usage</span>
                <span>{health.system.cpuUsage}%</span>
              </div>
              <Progress value={health.system.cpuUsage} data-testid="progress-cpu" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage</span>
                <span>{health.system.memoryUsage}%</span>
              </div>
              <Progress value={health.system.memoryUsage} data-testid="progress-memory" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span>{formatUptime(health.system.uptime)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Time</span>
              <span>{health.system.responseTime}ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-external-apis">
        <CardHeader>
          <CardTitle>External APIs</CardTitle>
          <CardDescription>Third-party service status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <SiStripe className="h-5 w-5" />
                <div>
                  <div className="font-medium">Stripe</div>
                  <div className="text-sm text-muted-foreground">
                    Latency: {health.apis.stripe.latency}ms
                  </div>
                </div>
              </div>
              {getStatusBadge(health.apis.stripe.status)}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <SiFacebook className="h-5 w-5" />
                <div>
                  <div className="font-medium">Facebook</div>
                  <div className="text-sm text-muted-foreground">
                    Latency: {health.apis.facebook.latency}ms
                  </div>
                </div>
              </div>
              {getStatusBadge(health.apis.facebook.status)}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <SiGoogle className="h-5 w-5" />
                <div>
                  <div className="font-medium">Google</div>
                  <div className="text-sm text-muted-foreground">
                    Latency: {health.apis.google.latency}ms
                  </div>
                </div>
              </div>
              {getStatusBadge(health.apis.google.status)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
