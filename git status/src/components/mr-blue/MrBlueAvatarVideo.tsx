import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Video,
  Upload,
  Loader2,
  Play,
  Download,
  Sparkles,
  Mic,
  Image as ImageIcon,
  FileText,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Share2,
} from 'lucide-react';

interface DIDVideo {
  id: number;
  didVideoId: string;
  avatarUrl: string;
  avatarPreset?: string;
  script: string;
  voice: string;
  voiceProvider: string;
  videoUrl?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  status: string;
  duration?: number;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

interface VoicePreset {
  id: string;
  name: string;
  provider?: string;
}

interface AvatarPreset {
  id: string;
  name: string;
  url: string;
}

interface PresetsResponse {
  success: boolean;
  avatarPresets: AvatarPreset[];
  voicePresets: VoicePreset[];
}

interface VoicesResponse {
  success: boolean;
  voices: {
    did: VoicePreset[];
    elevenlabs: Array<{ id: string; name: string }>;
  };
}

export function MrBlueAvatarVideo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [avatarSource, setAvatarSource] = useState<'preset' | 'custom' | 'url'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voiceProvider, setVoiceProvider] = useState<'microsoft' | 'elevenlabs'>('microsoft');
  const [useSSML, setUseSSML] = useState(false);

  // Current video state
  const [currentVideo, setCurrentVideo] = useState<DIDVideo | null>(null);
  const [pollingVideoId, setPollingVideoId] = useState<string | null>(null);

  // Fetch presets
  const { data: presetsData } = useQuery<PresetsResponse>({
    queryKey: ['/api/mrblue/video/did/presets'],
  });

  // Fetch available voices
  const { data: voicesData } = useQuery<VoicesResponse>({
    queryKey: ['/api/mrblue/video/did/voices'],
  });

  // Fetch history
  const { data: historyData, refetch: refetchHistory } = useQuery<{
    success: boolean;
    videos: DIDVideo[];
    count: number;
  }>({
    queryKey: ['/api/mrblue/video/did/history'],
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/mrblue/video/did/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadedAvatarUrl(data.avatarUrl);
      setAvatarSource('custom');

      toast({
        title: 'Avatar Uploaded',
        description: 'Your custom avatar has been uploaded successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar image.',
        variant: 'destructive',
      });
    },
  });

  // Video generation mutation
  const generateVideoMutation = useMutation({
    mutationFn: async () => {
      // Determine avatar URL
      let avatarUrl = '';
      let avatarPreset = undefined;

      if (avatarSource === 'preset') {
        const preset = presetsData?.avatarPresets.find((p) => p.id === selectedPreset);
        if (!preset) throw new Error('Please select an avatar preset');
        avatarUrl = preset.url;
        avatarPreset = preset.id;
      } else if (avatarSource === 'custom') {
        avatarUrl = uploadedAvatarUrl;
        if (!avatarUrl) throw new Error('Please upload a custom avatar');
      } else if (avatarSource === 'url') {
        avatarUrl = customAvatarUrl;
        if (!avatarUrl) throw new Error('Please provide an avatar URL');
      }

      if (!script.trim()) {
        throw new Error('Please enter a script');
      }

      if (!selectedVoice) {
        throw new Error('Please select a voice');
      }

      const elevenLabsVoiceId =
        voiceProvider === 'elevenlabs' ? selectedVoice : undefined;

      const response = await apiRequest('POST', '/api/mrblue/video/did/generate', {
        avatarUrl,
        avatarPreset,
        script: script.trim(),
        voice: selectedVoice,
        voiceProvider,
        elevenLabsVoiceId,
        useSSML,
      });

      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Video Generation Started',
        description: 'Your talking avatar video is being created. This may take 1-2 minutes.',
      });

      // Start polling for status
      setPollingVideoId(data.videoId);
      pollVideoStatus(data.videoId);
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to start video generation.',
        variant: 'destructive',
      });
    },
  });

  // Poll video status
  const pollVideoStatus = async (videoId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mrblue/video/did/status/${videoId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          clearInterval(pollInterval);
          setPollingVideoId(null);
          return;
        }

        const data = await response.json();

        if (data.video.status === 'completed') {
          setCurrentVideo(data.video);
          setPollingVideoId(null);
          clearInterval(pollInterval);
          refetchHistory();

          toast({
            title: 'Video Ready! 🎬',
            description: 'Your talking avatar video is ready to view.',
          });
        } else if (data.video.status === 'failed') {
          setPollingVideoId(null);
          clearInterval(pollInterval);

          toast({
            title: 'Generation Failed',
            description: data.video.failureReason || 'Video generation failed.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[D-ID] Status check error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPollingVideoId(null);
    }, 300000);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Avatar image must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      uploadAvatarMutation.mutate(file);
    }
  };

  // Download video
  const handleDownload = async (videoId: string) => {
    try {
      const response = await fetch(`/api/mrblue/video/did/download/${videoId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      window.open(data.downloadUrl, '_blank');

      toast({
        title: 'Download Started',
        description: 'Your video download has started.',
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download video.',
        variant: 'destructive',
      });
    }
  };

  // Get final avatar URL for display
  const getFinalAvatarUrl = () => {
    if (avatarSource === 'preset') {
      return presetsData?.avatarPresets.find((p) => p.id === selectedPreset)?.url;
    } else if (avatarSource === 'custom') {
      return uploadedAvatarUrl;
    } else if (avatarSource === 'url') {
      return customAvatarUrl;
    }
    return undefined;
  };

  const isGenerating = generateVideoMutation.isPending || !!pollingVideoId;

  return (
    <div className="space-y-4" data-testid="container-mrblue-avatar-video">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mr. Blue Talking Avatar</CardTitle>
              <CardDescription>
                Create professional talking head videos with custom avatars and voices
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              D-ID Powered
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" data-testid="tab-create">
                <Video className="w-4 h-4 mr-2" />
                Create Video
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <History className="w-4 h-4 mr-2" />
                History ({historyData?.count || 0})
              </TabsTrigger>
            </TabsList>

            {/* CREATE TAB */}
            <TabsContent value="create" className="space-y-6 mt-4">
              {/* Avatar Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-base font-semibold">Avatar Selection</Label>
                </div>

                <Tabs
                  value={avatarSource}
                  onValueChange={(v) => setAvatarSource(v as any)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preset" data-testid="tab-avatar-preset">
                      Presets
                    </TabsTrigger>
                    <TabsTrigger value="custom" data-testid="tab-avatar-custom">
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" data-testid="tab-avatar-url">
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preset" className="space-y-3 mt-4">
                    <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                      <SelectTrigger data-testid="select-avatar-preset">
                        <SelectValue placeholder="Select an avatar preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetsData?.avatarPresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedPreset && (
                      <div className="border rounded-lg p-4">
                        <img
                          src={
                            presetsData?.avatarPresets.find(
                              (p) => p.id === selectedPreset
                            )?.url
                          }
                          alt="Avatar preview"
                          className="w-32 h-32 rounded-lg object-cover mx-auto"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-3 mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                      variant="outline"
                      className="w-full"
                      data-testid="button-upload-avatar"
                    >
                      {uploadAvatarMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Avatar Image
                    </Button>

                    {uploadedAvatarUrl && (
                      <div className="border rounded-lg p-4">
                        <img
                          src={uploadedAvatarUrl}
                          alt="Uploaded avatar"
                          className="w-32 h-32 rounded-lg object-cover mx-auto"
                        />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Upload a clear headshot image (max 5MB, JPG/PNG)
                    </p>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-3 mt-4">
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      data-testid="input-avatar-url"
                    />

                    {customAvatarUrl && (
                      <div className="border rounded-lg p-4">
                        <img
                          src={customAvatarUrl}
                          alt="Avatar from URL"
                          className="w-32 h-32 rounded-lg object-cover mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/128?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Script Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="script" className="text-base font-semibold">
                      Script
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ssml-mode"
                      checked={useSSML}
                      onCheckedChange={setUseSSML}
                      data-testid="switch-ssml"
                    />
                    <Label
                      htmlFor="ssml-mode"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      SSML Mode
                    </Label>
                  </div>
                </div>

                <Textarea
                  id="script"
                  placeholder={
                    useSSML
                      ? '<speak>Hello! <break time="500ms"/> I am Mr. Blue, <emphasis level="strong">your AI assistant</emphasis>.</speak>'
                      : 'Enter the text your avatar should speak...'
                  }
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  data-testid="textarea-script"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{script.length}/2000 characters</span>
                  {useSSML && (
                    <span className="text-primary">SSML tags enabled for advanced control</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Voice Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-base font-semibold">Voice Selection</Label>
                </div>

                <Tabs
                  value={voiceProvider}
                  onValueChange={(v) => {
                    setVoiceProvider(v as any);
                    setSelectedVoice('');
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="microsoft" data-testid="tab-voice-did">
                      D-ID Voices
                    </TabsTrigger>
                    <TabsTrigger
                      value="elevenlabs"
                      data-testid="tab-voice-elevenlabs"
                      disabled={!voicesData?.voices.elevenlabs.length}
                    >
                      ElevenLabs
                      {voicesData?.voices.elevenlabs.length ? (
                        <Badge variant="secondary" className="ml-2">
                          {voicesData.voices.elevenlabs.length}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="microsoft" className="mt-4">
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger data-testid="select-voice-did">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voicesData?.voices.did.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>

                  <TabsContent value="elevenlabs" className="mt-4">
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger data-testid="select-voice-elevenlabs">
                        <SelectValue placeholder="Select a custom voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voicesData?.voices.elevenlabs.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!voicesData?.voices.elevenlabs.length && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No custom voices available. Create voice clones in the Voice
                        Cloning section.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Generate Button */}
              <Button
                onClick={() => generateVideoMutation.mutate()}
                disabled={isGenerating || !getFinalAvatarUrl() || !script.trim() || !selectedVoice}
                className="w-full"
                size="lg"
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Talking Avatar Video
                  </>
                )}
              </Button>

              {/* Current Video Preview */}
              {currentVideo && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Video Ready
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <video
                      src={currentVideo.cloudinaryUrl || currentVideo.videoUrl}
                      controls
                      className="w-full rounded-lg"
                      data-testid="video-preview"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(currentVideo.didVideoId)}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-download"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            currentVideo.cloudinaryUrl || currentVideo.videoUrl || ''
                          );
                          toast({
                            title: 'Link Copied',
                            description: 'Video URL copied to clipboard.',
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-share"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Polling Progress */}
              {pollingVideoId && (
                <Card className="border-primary/20">
                  <CardContent className="py-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Generating your talking avatar video...
                        </span>
                        <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                      </div>
                      <Progress value={undefined} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        This typically takes 1-2 minutes. Please wait...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {historyData?.videos.map((video) => (
                    <Card key={video.id} data-testid={`card-video-${video.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {video.status === 'completed' ? (
                              <video
                                src={video.cloudinaryUrl || video.videoUrl}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium line-clamp-2">
                                  {video.script.substring(0, 100)}
                                  {video.script.length > 100 ? '...' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(video.createdAt).toLocaleDateString()} •{' '}
                                  {video.voice}
                                </p>
                              </div>

                              {/* Status Badge */}
                              {video.status === 'completed' && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Ready
                                </Badge>
                              )}
                              {video.status === 'failed' && (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                              {video.status !== 'completed' &&
                                video.status !== 'failed' && (
                                  <Badge variant="secondary">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Processing
                                  </Badge>
                                )}
                            </div>

                            {/* Actions */}
                            {video.status === 'completed' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCurrentVideo(video)}
                                  data-testid={`button-preview-${video.id}`}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(video.didVideoId)}
                                  data-testid={`button-download-${video.id}`}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            )}

                            {video.status === 'failed' && video.failureReason && (
                              <p className="text-xs text-destructive">
                                {video.failureReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!historyData?.videos || historyData.videos.length === 0) && (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No videos generated yet. Create your first talking avatar!
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
