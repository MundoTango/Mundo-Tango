import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Video, Wand2, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

type AspectRatio = '16:9' | '9:16' | '1:1';

interface VideoGeneration {
  id: string;
  state: 'pending' | 'queued' | 'dreaming' | 'completed' | 'failed';
  video?: {
    url: string;
    width: number;
    height: number;
    thumbnail?: string;
  };
  failure_reason?: string;
}

export default function VideoStudio() {
  const { toast } = useToast();
  
  // Text-to-video form
  const [textPrompt, setTextPrompt] = useState('');
  const [textAspectRatio, setTextAspectRatio] = useState<AspectRatio>('16:9');
  
  // Image-to-video form
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>('16:9');
  
  // Active generation tracking
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

  // Poll for generation status
  const { data: generationStatus, isLoading: isPolling } = useQuery<VideoGeneration>({
    queryKey: ['/api/videos/status', activeGenerationId],
    enabled: !!activeGenerationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      if (data.state === 'completed' || data.state === 'failed') {
        return false; // Stop polling
      }
      return 5000; // Poll every 5 seconds
    },
  });

  // Text-to-video mutation
  const generateFromText = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/videos/generate/text', {
        prompt: textPrompt,
        aspectRatio: textAspectRatio,
        loop: false
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setActiveGenerationId(data.generationId);
      toast({
        title: 'Video Generation Started!',
        description: 'Your Mr. Blue video is being created. This takes ~2 minutes.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Image-to-video mutation
  const generateFromImage = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/videos/generate/image', {
        imageUrl,
        prompt: imagePrompt,
        aspectRatio: imageAspectRatio,
        loop: false
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setActiveGenerationId(data.generationId);
      toast({
        title: 'Video Generation Started!',
        description: 'Animating your Mr. Blue photo. This takes ~2 minutes.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mr. Blue intro quick action
  const generateIntro = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/videos/mr-blue/intro');
      return response.json();
    },
    onSuccess: (data: any) => {
      setActiveGenerationId(data.generationId);
      toast({
        title: 'Generating Mr. Blue Intro!',
        description: 'Creating professional introduction video...',
      });
    }
  });

  const handleDownload = async () => {
    if (!activeGenerationId) return;
    
    try {
      const response = await apiRequest('POST', `/api/videos/download/${activeGenerationId}`);
      const data = await response.json();
      
      toast({
        title: 'Video Downloaded!',
        description: `Saved to: ${data.videoPath}`,
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const renderGenerationStatus = () => {
    if (!activeGenerationId) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPolling && <Loader2 className="h-4 w-4 animate-spin" />}
            Generation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generationStatus && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">State:</span>
                <span className={`capitalize ${
                  generationStatus.state === 'completed' ? 'text-green-600' :
                  generationStatus.state === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {generationStatus.state}
                </span>
              </div>

              {generationStatus.state === 'completed' && generationStatus.video && (
                <div className="space-y-4">
                  <video
                    src={generationStatus.video.url}
                    controls
                    className="w-full rounded-lg"
                    data-testid="video-player"
                  />
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    data-testid="button-download-video"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </Button>
                </div>
              )}

              {generationStatus.state === 'failed' && (
                <div className="text-red-600">
                  Error: {generationStatus.failure_reason || 'Unknown error'}
                </div>
              )}

              {(generationStatus.state === 'pending' || generationStatus.state === 'queued' || generationStatus.state === 'dreaming') && (
                <div className="text-muted-foreground">
                  Generating video... This typically takes 2-3 minutes.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Video Studio" fallbackRoute="/feed">
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mr. Blue Video Studio</h1>
        <p className="text-muted-foreground">
          Generate AI videos of Mr. Blue using Luma Dream Machine
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Pre-configured Mr. Blue videos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => generateIntro.mutate()}
            disabled={generateIntro.isPending}
            className="w-full"
            data-testid="button-generate-intro"
          >
            {generateIntro.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Mr. Blue Introduction
          </Button>
        </CardContent>
      </Card>

      {/* Generation Tabs */}
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" data-testid="tab-text-to-video">
            <Video className="mr-2 h-4 w-4" />
            Text to Video
          </TabsTrigger>
          <TabsTrigger value="image" data-testid="tab-image-to-video">
            <ImageIcon className="mr-2 h-4 w-4" />
            Image to Video
          </TabsTrigger>
        </TabsList>

        {/* Text-to-Video Tab */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Text</CardTitle>
              <CardDescription>
                Describe the Mr. Blue video you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-prompt">Prompt</Label>
                <Textarea
                  id="text-prompt"
                  placeholder="Mr. Blue AI companion waving hello to users, professional office background, friendly smile..."
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  rows={4}
                  data-testid="input-text-prompt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-aspect-ratio">Aspect Ratio</Label>
                <Select value={textAspectRatio} onValueChange={(v) => setTextAspectRatio(v as AspectRatio)}>
                  <SelectTrigger id="text-aspect-ratio" data-testid="select-text-aspect-ratio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => generateFromText.mutate()}
                disabled={!textPrompt || generateFromText.isPending}
                className="w-full"
                data-testid="button-generate-text-video"
              >
                {generateFromText.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image-to-Video Tab */}
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Animate from Photo</CardTitle>
              <CardDescription>
                Add motion to an existing Mr. Blue photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/mr-blue-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  data-testid="input-image-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-prompt">Motion Description</Label>
                <Textarea
                  id="image-prompt"
                  placeholder="Gentle nod and smile, looking at camera..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  data-testid="input-image-prompt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-aspect-ratio">Aspect Ratio</Label>
                <Select value={imageAspectRatio} onValueChange={(v) => setImageAspectRatio(v as AspectRatio)}>
                  <SelectTrigger id="image-aspect-ratio" data-testid="select-image-aspect-ratio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => generateFromImage.mutate()}
                disabled={!imageUrl || !imagePrompt || generateFromImage.isPending}
                className="w-full"
                data-testid="button-generate-image-video"
              >
                {generateFromImage.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Animate Photo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generation Status Display */}
      {renderGenerationStatus()}
    </div>
    </SelfHealingErrorBoundary>
  );
}
