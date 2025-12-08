import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, Mic, Video, Calendar, BarChart3, 
  RefreshCw, Download, Share2, Clock, CheckCircle2,
  AlertCircle, Loader2, Upload, Settings, ExternalLink,
  Instagram, Youtube, Facebook, Music2, Play, Trash2,
  FileText, TrendingUp, Users, Eye
} from 'lucide-react';
import { format } from 'date-fns';

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
  createdAt?: string;
  completedAt?: string;
}

interface VoiceInfo {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

export default function AdminContentCenterPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scripts');
  const [topic, setTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [duration, setDuration] = useState('30s');
  const [platforms, setPlatforms] = useState<string[]>(['tiktok', 'instagram']);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  const { data: templates, isLoading: templatesLoading } = useQuery<ContentTemplate[]>({
    queryKey: ['/api/content/templates']
  });

  const { data: contentStatus, refetch: refetchStatus } = useQuery<ContentResult>({
    queryKey: ['/api/content/status', activeContentId],
    enabled: !!activeContentId,
    refetchInterval: activeContentId ? 3000 : false
  });

  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useQuery<ContentResult[]>({
    queryKey: ['/api/content/queue'],
    refetchInterval: 10000
  });

  const { data: voicesData, isLoading: voicesLoading } = useQuery<{ success: boolean; voices: VoiceInfo[] }>({
    queryKey: ['/api/voice-cloning/voices'],
    retry: false
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
      queryClient.invalidateQueries({ queryKey: ['/api/content/queue'] });
      toast({ title: 'Content generation started!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6 gap-4">
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
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={getStatusColor(contentStatus.status)}>
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
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Generate content to see progress</p>
                    <p className="text-sm mt-1">Enter a topic and click Generate</p>
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
              {templatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer hover-elevate ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedTemplate(template.id)}
                      data-testid={`card-template-${template.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No templates available</p>
                  <p className="text-sm mt-1">Templates will appear here once configured</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Available Voices
                </CardTitle>
                <CardDescription>ElevenLabs voices for content narration</CardDescription>
              </CardHeader>
              <CardContent>
                {voicesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : voicesData?.voices && voicesData.voices.length > 0 ? (
                  <div className="space-y-3">
                    {voicesData.voices.map((voice) => (
                      <div 
                        key={voice.voice_id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`voice-item-${voice.voice_id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mic className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {voice.category || 'Custom Voice'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {voice.preview_url && (
                            <Button size="sm" variant="outline" data-testid={`button-preview-${voice.voice_id}`}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" data-testid={`button-use-${voice.voice_id}`}>
                            Use Voice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mic className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="font-medium">No voices configured</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      Clone your voice or use ElevenLabs pre-made voices for content narration. 
                      Connect your ElevenLabs API key in settings to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Cloning</CardTitle>
                <CardDescription>Create a custom voice clone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload audio samples to create a voice clone
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Requirements:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      3-5 minutes of clear audio
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Minimal background noise
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Single speaker only
                    </li>
                  </ul>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure in Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="avatar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Avatar Video Generation
                </CardTitle>
                <CardDescription>Create talking avatar videos with D-ID or HeyGen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">Avatar video generation</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Convert your scripts into engaging talking avatar videos. 
                    Perfect for faceless content creation across social platforms.
                  </p>
                  <div className="flex justify-center gap-3 mt-6">
                    <Button variant="outline" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure D-ID
                    </Button>
                    <Button variant="outline" disabled>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure HeyGen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Avatar video creation process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">1</div>
                    <div>
                      <p className="font-medium">Generate Script</p>
                      <p className="text-sm text-muted-foreground">AI creates an engaging script from your topic</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">2</div>
                    <div>
                      <p className="font-medium">Synthesize Voice</p>
                      <p className="text-sm text-muted-foreground">Your cloned voice narrates the script</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">3</div>
                    <div>
                      <p className="font-medium">Create Avatar</p>
                      <p className="text-sm text-muted-foreground">D-ID or HeyGen generates a talking avatar video</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">4</div>
                    <div>
                      <p className="font-medium">Publish</p>
                      <p className="text-sm text-muted-foreground">Schedule or post directly to social platforms</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Processing Queue</CardTitle>
                <CardDescription>Content generation jobs</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchQueue()}
                data-testid="button-refresh-queue"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : queueData && queueData.length > 0 ? (
                <div className="space-y-3">
                  {queueData.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 border rounded-lg"
                      data-testid={`queue-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium">{item.script?.title || 'Generating...'}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy h:mm a') : 'Processing'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      {item.error && (
                        <p className="text-sm text-destructive mt-2">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="font-medium">No jobs in queue</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generated content jobs will appear here. Start by creating content in the Scripts tab.
                  </p>
                  <Button 
                    className="mt-4"
                    variant="outline"
                    onClick={() => setActiveTab('scripts')}
                    data-testid="button-go-to-scripts"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Content Calendar
                </CardTitle>
                <CardDescription>Scheduled posts across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="font-medium">No scheduled posts</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Schedule content for automatic posting. Generated content can be scheduled 
                    for optimal posting times across your connected platforms.
                  </p>
                  <Button 
                    className="mt-4"
                    variant="outline"
                    onClick={() => setActiveTab('scripts')}
                    data-testid="button-schedule-content"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Content to Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Connections</CardTitle>
                <CardDescription>Connected social accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map((platform) => (
                  <div 
                    key={platform}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform.toLowerCase())}
                      <span className="font-medium">{platform}</span>
                    </div>
                    <Badge variant="outline">
                      Not Connected
                    </Badge>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Accounts
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Content</p>
                    <p className="text-2xl font-bold">{queueData?.length || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {queueData?.filter(item => item.status === 'completed').length || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {queueData?.filter(item => !['completed', 'failed', 'pending'].includes(item.status)).length || 0}
                    </p>
                  </div>
                  <Loader2 className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold">
                      {queueData?.filter(item => item.status === 'failed').length || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>Track content performance across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="font-medium">Analytics available after publishing</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Once you publish content to connected platforms, you'll see engagement metrics, 
                  reach, and ROI data here. Connect your social accounts to enable analytics tracking.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
