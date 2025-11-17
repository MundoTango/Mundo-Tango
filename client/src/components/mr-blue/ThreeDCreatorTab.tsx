import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Box, Image, Sparkles, Download, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ThreeDCreatorTab() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [style, setStyle] = useState('realistic');

  const { data: assets } = useQuery<any[]>({
    queryKey: ['/api/content-studio/assets'],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = mode === 'text' 
        ? '/api/content-studio/generate-3d'
        : '/api/content-studio/image-to-3d';
      return await apiRequest(endpoint, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "3D Generation Started!",
        description: "Your 3D model is being created. This may take 2-10 minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-studio/assets'] });
      setPrompt('');
      setImageUrl('');
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start 3D generation",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (mode === 'text' && !prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe what you want to create",
        variant: "destructive"
      });
      return;
    }
    
    if (mode === 'image' && !imageUrl.trim()) {
      toast({
        title: "Image Required",
        description: "Please provide an image URL",
        variant: "destructive"
      });
      return;
    }

    const data = mode === 'text'
      ? { prompt, quality, style }
      : { imageUrls: [imageUrl], multiViewMode: false };

    generateMutation.mutate(data);
  };

  const threeDAssets = assets?.filter(a => a.type === '3d_model') || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-500" />
            AI 3D Model Generator
          </CardTitle>
          <CardDescription>
            Create stunning 3D models from text descriptions or images using Meshy AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              onClick={() => setMode('text')}
              className="flex-1"
              data-testid="button-text-to-3d"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Text to 3D
            </Button>
            <Button
              variant={mode === 'image' ? 'default' : 'outline'}
              onClick={() => setMode('image')}
              className="flex-1"
              data-testid="button-image-to-3d"
            >
              <Image className="h-4 w-4 mr-2" />
              Image to 3D
            </Button>
          </div>

          {/* Text to 3D Mode */}
          {mode === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe Your 3D Model</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., A futuristic sports car with sleek curves and LED headlights"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  data-testid="input-3d-prompt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                    <SelectTrigger id="quality" data-testid="select-quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Fast)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style" data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="lowpoly">Low Poly</SelectItem>
                      <SelectItem value="sculpted">Sculpted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Image to 3D Mode */}
          {mode === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-image-url"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image to Cloudinary or provide a public URL
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
            data-testid="button-generate-3d"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate 3D Model'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Your 3D Models</CardTitle>
          <CardDescription>
            {threeDAssets.length} model{threeDAssets.length !== 1 ? 's' : ''} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threeDAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No 3D models yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {threeDAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <Box className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{asset.prompt || 'Untitled'}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={asset.status === 'completed' ? 'default' : 'secondary'}>
                          {asset.status}
                        </Badge>
                        {asset.status === 'processing' && (
                          <Progress value={asset.progress || 0} className="flex-1" />
                        )}
                      </div>
                    </div>
                    {asset.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
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
    </div>
  );
}
