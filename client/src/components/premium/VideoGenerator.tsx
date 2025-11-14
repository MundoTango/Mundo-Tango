import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Loader2, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoGeneratorProps {
  className?: string;
}

export function VideoGenerator({ className }: VideoGeneratorProps) {
  const [scriptText, setScriptText] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/premium/video/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: text,
          avatarImageUrl: null // Uses default
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create video');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setVideoId(data.videoId);
      setVideoUrl(null);
      toast({
        title: 'Video Creation Started',
        description: 'Your video is being generated. This may take a few minutes.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Poll video status
  const { data: statusData } = useQuery({
    queryKey: ['/api/premium/video/status', videoId],
    queryFn: async () => {
      if (!videoId) return null;

      const response = await fetch(`/api/premium/video/${videoId}/status`);
      const data = await response.json();
      return data;
    },
    enabled: !!videoId && !videoUrl,
    refetchInterval: (query) => {
      // Stop polling if we have the video URL or if there's an error
      const status = query.state.data?.status;
      return status === 'done' || status === 'error' ? false : 3000;
    },
  });

  // Update video URL when done
  if (statusData?.status === 'done' && statusData.videoUrl && !videoUrl) {
    setVideoUrl(statusData.videoUrl);
    toast({
      title: 'Video Ready!',
      description: 'Your talking avatar video has been generated.',
    });
  }

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/premium/video/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      return response.json();
    },
    onSuccess: () => {
      setVideoId(null);
      setVideoUrl(null);
      setScriptText('');
      toast({
        title: 'Video Deleted',
        description: 'The video has been removed.',
      });
    }
  });

  const handleGenerate = () => {
    if (!scriptText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a script',
        variant: 'destructive',
      });
      return;
    }

    createVideoMutation.mutate(scriptText);
  };

  const isProcessing = statusData?.status === 'processing';
  const hasError = statusData?.status === 'error';

  return (
    <Card className={className} data-testid="card-video-generator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          D-ID Video Avatar Generator
        </CardTitle>
        <CardDescription>
          Create a talking avatar video from your script (God Level)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Video Script</label>
          <Textarea
            data-testid="textarea-script"
            placeholder="Enter the text you want the avatar to speak..."
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={5}
            disabled={isProcessing || !!videoUrl}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {scriptText.length} characters
          </p>
        </div>

        {/* Generate Button */}
        {!videoId && (
          <Button
            data-testid="button-generate-video"
            onClick={handleGenerate}
            disabled={createVideoMutation.isPending || !scriptText.trim()}
            className="w-full"
          >
            {createVideoMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Video...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Alert data-testid="alert-processing">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Generating your video...</p>
                <Progress value={33} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  This typically takes 1-3 minutes
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Status */}
        {hasError && (
          <Alert variant="destructive" data-testid="alert-error">
            <AlertDescription>
              Video generation failed: {statusData.error || 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {/* Video Player */}
        {videoUrl && (
          <div className="space-y-4" data-testid="div-video-result">
            <video
              data-testid="video-player"
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            <div className="flex gap-2">
              <Button
                data-testid="button-download-video"
                variant="outline"
                onClick={() => window.open(videoUrl, '_blank')}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                data-testid="button-delete-video"
                variant="destructive"
                onClick={() => videoId && deleteVideoMutation.mutate(videoId)}
                disabled={deleteVideoMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Cost Info */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-medium mb-1">Cost: ~$0.10 per video</p>
          <p>God Level quota: 5 videos/month</p>
        </div>
      </CardContent>
    </Card>
  );
}
