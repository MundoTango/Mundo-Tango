import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Video, Image, UserCircle, Download, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AIVideoStudioTab() {
  const { toast } = useToast();
  const [videoMode, setVideoMode] = useState<'text' | 'image'>('text');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoImageUrl, setVideoImageUrl] = useState('');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState('');
  const [avatarScript, setAvatarScript] = useState('');
  const [voiceId, setVoiceId] = useState('');

  const { data: assets } = useQuery<any[]>({
    queryKey: ['/api/content-studio/assets'],
  });

  const generateVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = videoMode === 'text'
        ? '/api/content-studio/generate-video'
        : '/api/content-studio/image-to-video';
      return await apiRequest(endpoint, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Video Generation Started!",
        description: "Your AI video is being created. This may take 5-15 minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-studio/assets'] });
      setVideoPrompt('');
      setVideoImageUrl('');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const generateAvatarMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/content-studio/photo-avatar', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Avatar Video Started!",
        description: "Your photo avatar video is being created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-studio/assets'] });
      setAvatarPhotoUrl('');
      setAvatarScript('');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerateVideo = () => {
    if (videoMode === 'text' && !videoPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe the video you want to create",
        variant: "destructive"
      });
      return;
    }

    if (videoMode === 'image' && !videoImageUrl.trim()) {
      toast({
        title: "Image Required",
        description: "Please provide an image URL",
        variant: "destructive"
      });
      return;
    }

    const data = videoMode === 'text'
      ? { prompt: videoPrompt, duration, aspectRatio }
      : { imageUrl: videoImageUrl, duration, animationIntensity: 'medium' };

    generateVideoMutation.mutate(data);
  };

  const handleGenerateAvatar = () => {
    if (!avatarPhotoUrl.trim() || !avatarScript.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a photo URL and script",
        variant: "destructive"
      });
      return;
    }

    generateAvatarMutation.mutate({
      photoUrl: avatarPhotoUrl,
      script: avatarScript,
      voiceId: voiceId || undefined
    });
  };

  const videoAssets = assets?.filter(a => a.type === 'video') || [];
  const avatarAssets = assets?.filter(a => a.type === 'avatar_video') || [];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="video-gen">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video-gen" data-testid="tab-video-generation">
            <Video className="h-4 w-4 mr-2" />
            AI Video Generator
          </TabsTrigger>
          <TabsTrigger value="photo-avatar" data-testid="tab-photo-avatar">
            <UserCircle className="h-4 w-4 mr-2" />
            Photo Avatar
          </TabsTrigger>
        </TabsList>

        {/* AI Video Generation Tab */}
        <TabsContent value="video-gen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                AI Video Generation
              </CardTitle>
              <CardDescription>
                Create cinematic AI videos from text or animate images with Luma AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2">
                <Button
                  variant={videoMode === 'text' ? 'default' : 'outline'}
                  onClick={() => setVideoMode('text')}
                  className="flex-1"
                  data-testid="button-text-to-video"
                >
                  Text to Video
                </Button>
                <Button
                  variant={videoMode === 'image' ? 'default' : 'outline'}
                  onClick={() => setVideoMode('image')}
                  className="flex-1"
                  data-testid="button-image-to-video"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Animate Image
                </Button>
              </div>

              {videoMode === 'text' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-prompt">Video Description</Label>
                    <Textarea
                      id="video-prompt"
                      placeholder="e.g., A serene sunset over a mountain lake with birds flying"
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      rows={4}
                      data-testid="input-video-prompt"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                        <SelectTrigger id="duration" data-testid="select-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger id="aspect-ratio" data-testid="select-aspect-ratio">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                          <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                          <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="video-image-url">Image URL to Animate</Label>
                  <Input
                    id="video-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={videoImageUrl}
                    onChange={(e) => setVideoImageUrl(e.target.value)}
                    data-testid="input-video-image-url"
                  />
                </div>
              )}

              <Button
                onClick={handleGenerateVideo}
                disabled={generateVideoMutation.isPending}
                className="w-full"
                data-testid="button-generate-video"
              >
                {generateVideoMutation.isPending ? 'Generating...' : 'Generate Video'}
              </Button>
            </CardContent>
          </Card>

          {/* Video Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {videoAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No videos yet. Generate your first one above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {videoAssets.map((asset) => (
                    <Card key={asset.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">{asset.prompt || 'Untitled'}</p>
                          <Badge variant={asset.status === 'completed' ? 'default' : 'secondary'}>
                            {asset.status}
                          </Badge>
                        </div>
                        {asset.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Avatar Tab */}
        <TabsContent value="photo-avatar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-green-500" />
                Photo Avatar Video
              </CardTitle>
              <CardDescription>
                Turn any photo into a talking avatar video with HeyGen AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar-photo">Photo URL</Label>
                <Input
                  id="avatar-photo"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={avatarPhotoUrl}
                  onChange={(e) => setAvatarPhotoUrl(e.target.value)}
                  data-testid="input-avatar-photo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-script">Script (What to Say)</Label>
                <Textarea
                  id="avatar-script"
                  placeholder="e.g., Welcome to Mundo Tango! I'm excited to help you learn and connect with the tango community."
                  value={avatarScript}
                  onChange={(e) => setAvatarScript(e.target.value)}
                  rows={4}
                  data-testid="input-avatar-script"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-id">Voice (Optional)</Label>
                <Input
                  id="voice-id"
                  placeholder="Leave blank for default voice"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  data-testid="input-voice-id"
                />
              </div>

              <Button
                onClick={handleGenerateAvatar}
                disabled={generateAvatarMutation.isPending}
                className="w-full"
                data-testid="button-generate-avatar"
              >
                {generateAvatarMutation.isPending ? 'Creating Avatar...' : 'Generate Avatar Video'}
              </Button>
            </CardContent>
          </Card>

          {/* Avatar Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {avatarAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No avatar videos yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {avatarAssets.map((asset) => (
                    <Card key={asset.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">Avatar Video</p>
                          <Badge variant={asset.status === 'completed' ? 'default' : 'secondary'}>
                            {asset.status}
                          </Badge>
                        </div>
                        {asset.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Play className="h-3 w-3 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
