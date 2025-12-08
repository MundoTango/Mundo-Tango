import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Play, Square, RefreshCw, Video, Eye, Grid, List, Film, Route, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PageInventoryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  priority: string;
  auditStatus: string;
  perspectives: string[];
  issueCount: number;
}

interface Stats {
  total: number;
  pending: number;
  auditing: number;
  completed: number;
  failed: number;
  issuesFound: number;
  issuesResolved: number;
}

export default function ThePlanAdminPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: pagesData, isLoading: pagesLoading, refetch: refetchPages } = useQuery<PageInventoryItem[]>({
    queryKey: ['/api/admin/the-plan/pages']
  });

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<Stats>({
    queryKey: ['/api/admin/the-plan/stats']
  });

  const { data: videosData, isLoading: videosLoading } = useQuery<{ videos: any[]; message?: string }>({
    queryKey: ['/api/admin/the-plan/videos']
  });

  const { data: toursData, isLoading: toursLoading } = useQuery<{ tours: any[]; message?: string }>({
    queryKey: ['/api/admin/the-plan/tours']
  });

  const startAuditMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/the-plan/audit/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/the-plan/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/the-plan/pages'] });
      toast({ title: 'Audit Started', description: 'Multi-perspective audit is now running' });
    }
  });

  const stopAuditMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/the-plan/audit/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/the-plan/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/the-plan/pages'] });
      toast({ title: 'Audit Stopped', description: 'Audit has been paused' });
    }
  });

  const captureVideoMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest(`/api/admin/the-plan/capture-video/${pageId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/the-plan/videos'] });
      toast({ title: 'Video Queued', description: 'Video capture has been queued' });
    }
  });

  const handleRefresh = () => {
    refetchPages();
    refetchStats();
  };

  const filteredPages = pagesData?.filter(page => {
    if (categoryFilter !== 'all' && page.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && page.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && page.auditStatus !== statusFilter) return false;
    return true;
  }) || [];

  const categories = [...new Set(pagesData?.map(p => p.category) || [])];
  const isAuditing = statsData && statsData.auditing > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'auditing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-the-plan-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">The Plan Admin</h1>
          <p className="text-muted-foreground">Multi-perspective page audits with 6 viewpoints</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isAuditing ? (
            <Button 
              variant="destructive" 
              onClick={() => stopAuditMutation.mutate()}
              disabled={stopAuditMutation.isPending}
              data-testid="button-stop-audit"
            >
              {stopAuditMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Stop Audit
            </Button>
          ) : (
            <Button 
              onClick={() => startAuditMutation.mutate()}
              disabled={startAuditMutation.isPending}
              data-testid="button-start-audit"
            >
              {startAuditMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Audit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statsLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : statsData && (
          <>
            <Card data-testid="stat-total">
              <CardHeader className="pb-2">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">{statsData.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-pending">
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl text-muted-foreground">{statsData.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-auditing">
              <CardHeader className="pb-2">
                <CardDescription>Auditing</CardDescription>
                <CardTitle className="text-2xl text-blue-500">{statsData.auditing}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-completed">
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl text-green-500">{statsData.completed}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-failed">
              <CardHeader className="pb-2">
                <CardDescription>Failed</CardDescription>
                <CardTitle className="text-2xl text-red-500">{statsData.failed}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-issues-found">
              <CardHeader className="pb-2">
                <CardDescription>Issues Found</CardDescription>
                <CardTitle className="text-2xl text-orange-500">{statsData.issuesFound}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-issues-resolved">
              <CardHeader className="pb-2">
                <CardDescription>Issues Resolved</CardDescription>
                <CardTitle className="text-2xl text-emerald-500">{statsData.issuesResolved}</CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit</TabsTrigger>
          <TabsTrigger value="videos" data-testid="tab-videos">Videos</TabsTrigger>
          <TabsTrigger value="tours" data-testid="tab-tours">Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4" data-testid="tab-content-audit">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="auditing">Auditing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex gap-2">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setViewMode('table')}
                data-testid="button-view-table"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setViewMode('grid')}
                data-testid="button-view-grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {pagesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map(page => (
                  <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                    <TableCell>{getStatusIcon(page.auditStatus)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">{page.url}</div>
                      </div>
                    </TableCell>
                    <TableCell>{page.category}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(page.priority) as any}>
                        {page.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{page.issueCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(page.url, '_blank')}
                          data-testid={`button-view-${page.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => captureVideoMutation.mutate(page.id)}
                          disabled={captureVideoMutation.isPending}
                          data-testid={`button-capture-${page.id}`}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map(page => (
                <Card key={page.id} data-testid={`card-page-${page.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {getStatusIcon(page.auditStatus)}
                      <Badge variant={getPriorityVariant(page.priority) as any}>
                        {page.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription>{page.url}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{page.category}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(page.url, '_blank')}
                          data-testid={`button-grid-view-${page.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => captureVideoMutation.mutate(page.id)}
                          disabled={captureVideoMutation.isPending}
                          data-testid={`button-grid-capture-${page.id}`}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" data-testid="tab-content-videos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Demo Videos
              </CardTitle>
              <CardDescription>Captured demo videos for marketing and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              {videosLoading ? (
                <div className="flex justify-center py-8" data-testid="videos-loading">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : videosData?.videos && videosData.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videosData.videos.map((video: any, index: number) => (
                    <Card key={index} data-testid={`video-card-${index}`}>
                      <CardContent className="p-4">
                        <p>{video.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="videos-empty-state">
                  <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  {videosData?.message && <p className="text-muted-foreground">{videosData.message}</p>}
                  <Button className="mt-4" data-testid="button-capture-all-videos">
                    <Video className="h-4 w-4 mr-2" />
                    Capture All Demo Videos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tours" data-testid="tab-content-tours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Mr Blue Tours
              </CardTitle>
              <CardDescription>AI-guided user tours generated from audit data</CardDescription>
            </CardHeader>
            <CardContent>
              {toursLoading ? (
                <div className="flex justify-center py-8" data-testid="tours-loading">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : toursData?.tours && toursData.tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toursData.tours.map((tour: any, index: number) => (
                    <Card key={index} data-testid={`tour-card-${index}`}>
                      <CardContent className="p-4">
                        <p>{tour.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="tours-empty-state">
                  <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  {toursData?.message && <p className="text-muted-foreground">{toursData.message}</p>}
                  <Button className="mt-4" data-testid="button-create-tour">
                    <Route className="h-4 w-4 mr-2" />
                    Create First Tour
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
