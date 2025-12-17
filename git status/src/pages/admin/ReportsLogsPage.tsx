import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, AlertTriangle, Info, AlertCircle, XCircle, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  userId?: number;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export default function ReportsLogsPage() {
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery<LogEntry[]>({
    queryKey: ['/api/admin/logs', { level: levelFilter, category: categoryFilter, search }],
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'default',
      info: 'outline',
    };
    return <Badge variant={variants[level as keyof typeof variants] as any} data-testid={`badge-${level}`}>{level.toUpperCase()}</Badge>;
  };

  const exportLogs = () => {
    if (!logs) return;
    
    const csv = [
      ['Timestamp', 'Level', 'Category', 'Message', 'User ID', 'IP Address'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        log.userId || '',
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" data-testid="page-reports-logs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Logs</h1>
          <p className="text-muted-foreground mt-2">
            System logs and activity reports
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline" data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger data-testid="select-level-filter">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="user">User Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-logs-table">
        <CardHeader>
          <CardTitle>
            <FileText className="h-5 w-5 inline mr-2" />
            System Logs ({logs?.length || 0})
          </CardTitle>
          <CardDescription>Real-time platform activity logs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id} data-testid={`log-${log.id}`}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-category-${log.id}`}>{log.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell className="text-sm">{log.userId || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-log-stats">
          <CardHeader>
            <CardTitle>Log Statistics (24h)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Critical</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Errors</span>
              <Badge variant="destructive">24</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Warnings</span>
              <Badge variant="default">156</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Info</span>
              <Badge variant="outline">2,847</Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-top-errors">
          <CardHeader>
            <CardTitle>Top Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Database connection timeout</div>
              <div className="text-xs text-muted-foreground">12 occurrences</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">API rate limit exceeded</div>
              <div className="text-xs text-muted-foreground">8 occurrences</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Invalid authentication token</div>
              <div className="text-xs text-muted-foreground">4 occurrences</div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-activity-by-category">
          <CardHeader>
            <CardTitle>Activity by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">System</span>
              <span className="text-sm font-medium">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Security</span>
              <span className="text-sm font-medium">456</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              <span className="text-sm font-medium">789</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Activity</span>
              <span className="text-sm font-medium">2,345</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
