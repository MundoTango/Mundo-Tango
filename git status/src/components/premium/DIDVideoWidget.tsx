import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Video, Upload, Loader2, Play, Download, Sparkles } from 'lucide-react';

interface VideoResult {
  videoId: string;
  videoUrl: string;
  status: 'created' | 'processing' | 'done' | 'error';
}

export function DIDVideoWidget() {
  const { toast } = useToast();
  const [scriptText, setScriptText] = useState('');
  const [avatarImageUrl, setAvatarImageUrl] = useState('');
  const [currentVideo, setCurrentVideo] = useState<VideoResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const createVideoMutation = useMutation({
    mutationFn: async () => {
      if (!scriptText) {
        throw new Error('Script text is required');
      }

      const response = await apiRequest('POST', '/api/premium/video/create', {
        scriptText,
        avatarImageUrl: avatarImageUrl || undefined
      });

      return response;
    },
    onSuccess: (data) => {
      setCurrentVideo({
        videoId: data.videoId,
        videoUrl: data.videoUrl || '',
        status: 'processing'
      });

      toast({
        title: 'Video Generation Started',
        description: 'Your talking avatar video is being created. This may take 1-2 minutes.',
      });

      // Start polling status
      checkVideoStatus(data.videoId);
    },
    onError: (error: any) => {
      toast({
        title: 'Video Generation Failed',
        description: error.message || 'Failed to create video. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const checkVideoStatus = async (videoId: string) => {
    setCheckingStatus(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/premium/video/${videoId}/status`, {
          credentials: 'include'
        });

        if (!response.ok) {
          clearInterval(pollInterval);
          setCheckingStatus(false);
          return;
        }

        const data = await response.json();

        if (data.status === 'done') {
          setCurrentVideo(prev => prev ? {
            ...prev,
            videoUrl: data.videoUrl,
            status: 'done'
          } : null);
          
          clearInterval(pollInterval);
          setCheckingStatus(false);

          toast({
            title: 'Video Ready! 🎬',
            description: 'Your talking avatar video is ready to view.',
          });
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          setCheckingStatus(false);
          
          toast({
            title: 'Video Generation Failed',
            description: 'An error occurred during video processing.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('[D-ID] Status check error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setCheckingStatus(false);
    }, 300000);
  };

  return (
    <Card className="w-full" data-testid="card-did-video-widget">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">D-ID Talking Avatar</CardTitle>
            <CardDescription>Generate AI-powered talking avatar videos</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">
            God Level
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input Section */}
        {!currentVideo && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="script-text">Script Text*</Label>
              <Textarea
                id="script-text"
                data-testid="textarea-script-text"
                placeholder="Enter the text your avatar should speak..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {scriptText.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-image">Avatar Image URL (Optional)</Label>
              <Input
                id="avatar-image"
                data-testid="input-avatar-image"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarImageUrl}
                onChange={(e) => setAvatarImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use default presenter
              </p>
            </div>

            <Button
              onClick={() => createVideoMutation.mutate()}
              disabled={!scriptText || createVideoMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-generate-video"
            >
              {createVideoMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Video...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Talking Avatar
                </>
              )}
            </Button>
          </div>
        )}

        {/* Video Processing Section */}
        {currentVideo && currentVideo.status === 'processing' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <h3 className="font-semibold">Generating Video...</h3>
              <p className="text-sm text-muted-foreground">
                This usually takes 1-2 minutes
              </p>
            </div>
            <Progress value={checkingStatus ? 50 : 30} className="w-full" />
          </div>
        )}

        {/* Video Ready Section */}
        {currentVideo && currentVideo.status === 'done' && currentVideo.videoUrl && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={currentVideo.videoUrl}
                controls
                className="w-full h-full"
                data-testid="video-player-did"
              >
                Your browser does not support video playback.
              </video>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = currentVideo.videoUrl;
                  link.download = 'talking-avatar.mp4';
                  link.click();
                }}
                data-testid="button-download-video"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCurrentVideo(null);
                  setScriptText('');
                  setAvatarImageUrl('');
                }}
                data-testid="button-create-new"
              >
                Create New
              </Button>
            </div>
          </div>
        )}

        {/* Cost Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Cost: $0.10 per video • Requires God Level subscription
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
