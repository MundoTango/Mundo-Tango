import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, Mic, Video, Calendar, BarChart3, 
  Play, Pause, RefreshCw, Download, Share2,
  Instagram, Youtube, Facebook, Music2
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  duration: string;
  platforms: string[];
}

interface ContentResult {
  id: string;
  status: string;
  progress: number;
  script?: { title: string; script: string; hashtags: string[] };
  voiceUrl?: string;
  videoUrl?: string;
  error?: string;
}

export default function AdminContentCenterPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scripts');
  const [topic, setTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [duration, setDuration] = useState('30s');
  const [platforms, setPlatforms] = useState<string[]>(['tiktok', 'instagram']);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  const { data: templates } = useQuery<ContentTemplate[]>({
    queryKey: ['/api/content/templates']
  });

  const { data: contentStatus, refetch: refetchStatus } = useQuery<ContentResult>({
    queryKey: ['/api/content/status', activeContentId],
    enabled: !!activeContentId,
    refetchInterval: activeContentId ? 3000 : false
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/content/generate', {
        templateId: selectedTemplate || undefined,
        topic,
        duration,
        platforms,
        userId: 1
      });
      return response.json();
    },
    onSuccess: (data) => {
      setActiveContentId(data.id);
      toast({ title: 'Content generation started!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    }
  });

  const batchMutation = useMutation({
    mutationFn: async (topics: string[]) => {
      const response = await apiRequest('POST', '/api/content/batch', {
        templates: [selectedTemplate || 'tango_tip_beginner'],
        topics,
        count: topics.length,
        platforms,
        scheduleDays: 7,
        userId: 1
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Batch generation started!' });
    }
  });

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return <Music2 className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Content Center</h1>
          <p className="text-muted-foreground">Faceless content marketing automation</p>
        </div>
        <Badge variant="outline" className="text-sm">
          MB.MD v9.9.3
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="scripts" data-testid="tab-scripts">
            <Wand2 className="h-4 w-4 mr-2" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="voice" data-testid="tab-voice">
            <Mic className="h-4 w-4 mr-2" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="avatar" data-testid="tab-avatar">
            <Video className="h-4 w-4 mr-2" />
            Avatar
          </TabsTrigger>
          <TabsTrigger value="queue" data-testid="tab-queue">
            <RefreshCw className="h-4 w-4 mr-2" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Script</CardTitle>
                <CardDescription>AI-powered script generation for faceless content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The importance of posture in tango"
                    data-testid="input-topic"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15s">15 seconds</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="60s">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['tiktok', 'instagram', 'youtube', 'facebook'].map(p => (
                      <Button
                        key={p}
                        variant={platforms.includes(p) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePlatform(p)}
                        data-testid={`button-platform-${p}`}
                      >
                        {getPlatformIcon(p)}
                        <span className="ml-1 capitalize">{p}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => generateMutation.mutate()}
                  disabled={!topic || generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Content
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Status</CardTitle>
                <CardDescription>Real-time progress of content generation</CardDescription>
              </CardHeader>
              <CardContent>
                {contentStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={contentStatus.status === 'completed' ? 'default' : 'secondary'}>
                        {contentStatus.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {contentStatus.progress}%
                      </span>
                    </div>
                    <Progress value={contentStatus.progress} />

                    {contentStatus.script && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold">{contentStatus.script.title}</h4>
                        <p className="text-sm mt-2">{contentStatus.script.script}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {contentStatus.script.hashtags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {contentStatus.videoUrl && (
                      <div className="mt-4">
                        <video 
                          src={contentStatus.videoUrl} 
                          controls 
                          className="w-full rounded-lg"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Post Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {contentStatus.error && (
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                        {contentStatus.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Generate content to see progress
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>Pre-built templates for quick content creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates?.map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer hover-elevate ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{template.category.replace('_', ' ')}</p>
                        </div>
                        <Badge variant="outline">{template.duration}</Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {template.platforms.map(p => (
                          <span key={p} className="text-muted-foreground">
                            {getPlatformIcon(p)}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Studio</CardTitle>
              <CardDescription>ElevenLabs voice cloning and synthesis</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Mic className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Voice cloning interface coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Configure your ElevenLabs voice clones for automated content
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Video</CardTitle>
              <CardDescription>D-ID and HeyGen talking avatar generation</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Avatar video interface coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create talking avatar videos from your scripts
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Processing Queue</CardTitle>
              <CardDescription>Batch content generation status</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Queue management interface coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Monitor and manage batch content generation jobs
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Schedule posts across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Content calendar interface coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                View and manage scheduled posts
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track content performance across platforms</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                Monitor engagement, reach, and ROI
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
