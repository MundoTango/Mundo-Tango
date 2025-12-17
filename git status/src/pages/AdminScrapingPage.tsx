import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Facebook,
  Instagram, 
  Twitter, 
  Youtube,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Settings
} from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface ScrapingConfig {
  platform: string;
  enabled: boolean;
  lastRun?: string;
  status: 'active' | 'paused' | 'error' | 'idle';
  itemsScraped: number;
  errorCount: number;
}

interface ScrapingJob {
  id: number;
  platform: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  itemsProcessed: number;
}

export default function AdminScrapingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockConfigs: ScrapingConfig[] = [
    {
      platform: 'Facebook',
      enabled: true,
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      itemsScraped: 1247,
      errorCount: 3,
    },
    {
      platform: 'Instagram',
      enabled: true,
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
      itemsScraped: 892,
      errorCount: 1,
    },
    {
      platform: 'Twitter',
      enabled: false,
      status: 'paused',
      itemsScraped: 0,
      errorCount: 0,
    },
    {
      platform: 'TikTok',
      enabled: false,
      status: 'idle',
      itemsScraped: 0,
      errorCount: 0,
    },
  ];

  const mockJobs: ScrapingJob[] = [
    {
      id: 1,
      platform: 'Facebook',
      type: 'Events Scraper',
      status: 'running',
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      itemsProcessed: 234,
    },
    {
      id: 2,
      platform: 'Instagram',
      type: 'Posts Scraper',
      status: 'completed',
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      itemsProcessed: 892,
    },
  ];

  const { data: configs = mockConfigs } = useQuery<ScrapingConfig[]>({
    queryKey: ["/api/admin/scraping/configs"],
  });

  const { data: jobs = mockJobs } = useQuery<ScrapingJob[]>({
    queryKey: ["/api/admin/scraping/jobs"],
  });

  const stats = {
    totalEnabled: configs.filter(c => c.enabled).length,
    totalPlatforms: configs.length,
    activeJobs: jobs.filter(j => j.status === 'running').length,
    itemsToday: configs.reduce((sum, c) => sum + c.itemsScraped, 0),
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <SiFacebook className="h-5 w-5 text-blue-600" />;
      case 'instagram': return <SiInstagram className="h-5 w-5 text-pink-600" />;
      case 'twitter': return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'youtube': return <Youtube className="h-5 w-5 text-red-600" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'paused': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Paused</Badge>;
      case 'error': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default: return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Scraping Dashboard" fallbackRoute="/admin">
      <SEO 
        title="Multi-Platform Scraping Dashboard"
        description="Configure and monitor automated scraping from Facebook, Instagram, Twitter, and other social platforms"
        ogImage="/og-image.png"
      />
      <PageLayout title="Multi-Platform Scraping Setup" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-scraping">
          
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card data-testid="stat-enabled-platforms">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enabled Platforms</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.totalEnabled}</div>
                <p className="text-xs text-muted-foreground mt-1">of {stats.totalPlatforms} total</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-active-jobs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">Running now</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-items-scraped">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Scraped</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.itemsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Total collected</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-scraping-health">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Healthy</div>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card data-testid="card-scraping-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Automated Social Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Automated scraping system that collects tango events, community posts, and user 
                activity from Facebook, Instagram, and other social platforms. Enriches Mundo 
                Tango with real-world tango community data while respecting platform ToS and 
                rate limits.
              </p>
              <div className="flex gap-2">
                <Badge variant="default">Automated</Badge>
                <Badge variant="secondary">Rate-Limited</Badge>
                <Badge variant="outline">ToS Compliant</Badge>
                <Badge variant="outline">Privacy-First</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-scraping">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms" data-testid="tab-platforms">Platforms</TabsTrigger>
              <TabsTrigger value="jobs" data-testid="tab-jobs">Active Jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card data-testid="card-scraping-overview">
                <CardHeader>
                  <CardTitle>Scraping Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {configs.map((config, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`platform-overview-${idx}`}
                      >
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(config.platform)}
                          <div>
                            <h4 className="font-semibold">{config.platform}</h4>
                            <p className="text-xs text-muted-foreground">
                              {config.itemsScraped.toLocaleString()} items collected
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(config.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              <Card data-testid="card-platform-config">
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {configs.map((config, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`platform-config-${idx}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {getPlatformIcon(config.platform)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{config.platform} Scraper</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              {config.lastRun && (
                                <>
                                  <span>Last run: {safeDateDistance(config.lastRun)}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{config.itemsScraped.toLocaleString()} items</span>
                              {config.errorCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-500">{config.errorCount} errors</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(config.status)}
                            <Switch checked={config.enabled} data-testid={`switch-${idx}`} />
                            <Button size="sm" variant="outline" data-testid={`button-config-${idx}`}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-credentials">
                <CardHeader>
                  <CardTitle>API Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure API keys and authentication tokens for each platform
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Facebook Access Token</label>
                      <Input placeholder="Enter token..." className="mt-1" type="password" data-testid="input-facebook-token" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instagram API Key</label>
                      <Input placeholder="Enter API key..." className="mt-1" type="password" data-testid="input-instagram-key" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card data-testid="card-active-jobs">
                <CardHeader>
                  <CardTitle>Active Scraping Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No active jobs
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                          data-testid={`job-${job.id}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getPlatformIcon(job.platform)}
                            <div className="flex-1">
                              <h4 className="font-semibold">{job.type}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Started {safeDateDistance(job.startedAt)} • {job.itemsProcessed} items processed
                              </p>
                            </div>
                            <Badge variant={job.status === 'running' ? 'default' : job.status === 'completed' ? 'secondary' : 'destructive'}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
