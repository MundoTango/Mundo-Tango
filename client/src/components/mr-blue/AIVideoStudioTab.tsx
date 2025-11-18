import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Video, Download, Loader2, Sparkles, Clock, Film } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LumaVideo {
  id: number;
  generationId: string;
  prompt: string;
  status: string;
  videoUrl?: string;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

const EXAMPLE_PROMPTS = [
  "A blue robot dancing tango in neon-lit Buenos Aires streets",
  "A futuristic AI companion with turquoise mohawk waving hello",
  "Elegant tango dancers in slow motion under purple lighting",
  "Abstract data visualization particles flowing in 3D space",
  "A serene sunset over mountains with birds flying",
];

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Queuing your video...",
  queued: "In queue, waiting to start...",
  dreaming: "AI is creating your video...",
  completed: "Video ready!",
  failed: "Generation failed",
};

const STATUS_PROGRESS: Record<string, number> = {
  pending: 10,
  queued: 25,
  dreaming: 60,
  completed: 100,
  failed: 0,
};

export function AIVideoStudioTab() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch video history
  const { data: historyData, isLoading: historyLoading } = useQuery<{ videos: LumaVideo[] }>({
    queryKey: ['/api/mrblue/video/history'],
  });

  const videos = historyData?.videos || [];

  // Poll active generation status
  const { data: statusData, refetch: refetchStatus } = useQuery<{ video: LumaVideo }>({
    queryKey: ['/api/mrblue/video/status', activeGenerationId],
    enabled: !!activeGenerationId,
    refetchInterval: false, // Manual polling
  });

  const activeVideo = statusData?.video;

  // Start polling when we have an active generation
  useEffect(() => {
    if (activeGenerationId && activeVideo?.status !== 'completed' && activeVideo?.status !== 'failed') {
      // Poll every 5 seconds
      const interval = setInterval(() => {
        console.log('Polling status for:', activeGenerationId);
        refetchStatus();
      }, 5000);

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [activeGenerationId, activeVideo?.status]);

  // Stop polling when complete
  useEffect(() => {
    if (activeVideo?.status === 'completed' || activeVideo?.status === 'failed') {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // Refresh history
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/video/history'] });

      if (activeVideo.status === 'completed') {
        toast({
          title: "Video Ready! 🎉",
          description: "Your AI video has been generated and saved.",
        });
        setActiveGenerationId(null);
      } else {
        toast({
          title: "Generation Failed",
          description: activeVideo.failureReason || "Please try again",
          variant: "destructive",
        });
        setActiveGenerationId(null);
      }
    }
  }, [activeVideo?.status]);

  // Generate video mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; aspectRatio: string; duration: number }) => {
      return await apiRequest('/api/mrblue/video/generate', 'POST', data);
    },
    onSuccess: (data: any) => {
      setActiveGenerationId(data.generationId);
      toast({
        title: "Video Generation Started!",
        description: "Your AI video is being created. This takes ~60-90 seconds.",
      });
      setPrompt('');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe the video you want to create",
        variant: "destructive",
      });
      return;
    }

    if (prompt.length > 500) {
      toast({
        title: "Prompt Too Long",
        description: "Please keep your prompt under 500 characters",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({ prompt: prompt.trim(), aspectRatio, duration });
  };

  const handleDownload = async (video: LumaVideo) => {
    if (!video.cloudinaryUrl) return;
    
    // Open in new tab for download
    window.open(video.cloudinaryUrl, '_blank');
  };

  const isGenerating = !!activeGenerationId;
  const currentProgress = activeVideo ? STATUS_PROGRESS[activeVideo.status] || 50 : 0;
  const currentMessage = activeVideo ? STATUS_MESSAGES[activeVideo.status] || "Processing..." : "";

  return (
    <div className="space-y-6">
      {/* Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Luma AI Video Generation
          </CardTitle>
          <CardDescription>
            Create cinematic AI videos from text with Luma Dream Machine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="luma-prompt">Video Description</Label>
            <Textarea
              id="luma-prompt"
              placeholder="e.g., A blue robot dancing tango in neon-lit Buenos Aires streets"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
              data-testid="input-luma-prompt"
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {prompt.length}/500 characters
            </p>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Example Prompts:</Label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  disabled={isGenerating}
                  data-testid={`button-example-${idx}`}
                  className="text-xs"
                >
                  {example.slice(0, 40)}...
                </Button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))} disabled={isGenerating}>
                <SelectTrigger id="duration" data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">~5 seconds</SelectItem>
                  <SelectItem value="10">~10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || generateMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-generate-luma-video"
          >
            {isGenerating || generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Film className="h-4 w-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && activeVideo && (
            <div className="space-y-3 p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <span className="text-sm font-medium">{currentMessage}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentProgress}%
                </Badge>
              </div>
              <Progress value={currentProgress} className="h-2" data-testid="progress-generation" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated time: 60-90 seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            Generated Videos
          </CardTitle>
          <CardDescription>
            Your AI video generation history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>Loading your videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No videos yet</p>
              <p className="text-sm">Generate your first AI video above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Video Preview */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                      {video.status === 'completed' && video.cloudinaryUrl ? (
                        <video
                          src={video.cloudinaryUrl}
                          controls
                          className="w-full h-full object-cover"
                          poster={video.thumbnailUrl}
                          data-testid={`video-player-${video.id}`}
                        />
                      ) : (
                        <div className="text-center">
                          {video.status === 'failed' ? (
                            <div className="text-red-500">
                              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Failed</p>
                            </div>
                          ) : (
                            <div>
                              <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin text-purple-500" />
                              <p className="text-sm text-muted-foreground">{STATUS_MESSAGES[video.status]}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium line-clamp-2" title={video.prompt}>
                        {video.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={video.status === 'completed' ? 'default' : video.status === 'failed' ? 'destructive' : 'secondary'}
                          data-testid={`status-${video.id}`}
                        >
                          {video.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {video.status === 'completed' && video.cloudinaryUrl && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownload(video)}
                          data-testid={`button-download-${video.id}`}
                        >
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
    </div>
  );
}
