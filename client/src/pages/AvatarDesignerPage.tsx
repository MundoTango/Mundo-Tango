import { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from '@/components/SEO';
import { Upload, X, Sparkles, Download, User, Clock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

interface Generation {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  timestamp: number;
  imageUrl?: string;
  assets?: {
    image?: string;
  };
}

const STYLE_OPTIONS = ['Professional', 'Artistic', 'Casual', 'Formal'] as const;
const OUTFIT_OPTIONS = ['Business Casual', 'Artistic Flair', 'Formal Suit', 'Creative Casual'] as const;
const EXPRESSION_OPTIONS = ['Confident', 'Friendly', 'Serious', 'Playful'] as const;
const POSE_OPTIONS = ['Standing', 'Sitting', 'Action', 'Relaxed'] as const;

const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AvatarDesignerPage() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [characterName, setCharacterName] = useState('');
  const [style, setStyle] = useState<string>('Professional');
  const [outfit, setOutfit] = useState<string>('Business Casual');
  const [expression, setExpression] = useState<string>('Confident');
  const [pose, setPose] = useState<string>('Standing');
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Poll for generation status
  const { data: generationStatus } = useQuery({
    queryKey: ['/api/avatar/status', currentGeneration?.id],
    queryFn: async () => {
      if (!currentGeneration?.id) return null;
      const response = await fetch(`/api/avatar/status/${currentGeneration.id}`);
      if (!response.ok) throw new Error('Failed to check status');
      return response.json();
    },
    enabled: !!currentGeneration?.id && currentGeneration?.state !== 'completed' && currentGeneration?.state !== 'failed',
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Update generation status from polling
  useEffect(() => {
    if (generationStatus && currentGeneration) {
      const updatedGeneration: Generation = {
        ...currentGeneration,
        state: generationStatus.state,
        assets: generationStatus.assets,
      };
      setCurrentGeneration(updatedGeneration);

      if (generationStatus.state === 'completed') {
        setIsGenerating(false);
        toast({
          title: 'Avatar Generated! 🎉',
          description: 'Your 3D Pixar-style avatar is ready to download.',
        });
        
        // Add to history
        setGenerationHistory(prev => [updatedGeneration, ...prev].slice(0, 5));
      } else if (generationStatus.state === 'failed') {
        setIsGenerating(false);
        toast({
          title: 'Generation Failed',
          description: 'Avatar generation is temporarily unavailable. Please try again later.',
          variant: 'destructive',
        });
      }
    }
  }, [generationStatus, currentGeneration, toast]);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((files: FileList | null, index?: number) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      toast({
        title: 'Invalid File',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    if (photos.length >= MAX_PHOTOS && index === undefined) {
      toast({
        title: 'Maximum Photos Reached',
        description: `You can upload up to ${MAX_PHOTOS} photos`,
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const newPhoto: UploadedPhoto = {
        id: Math.random().toString(36).substring(7),
        file,
        preview,
      };

      if (index !== undefined) {
        setPhotos(prev => {
          const updated = [...prev];
          updated[index] = newPhoto;
          return updated;
        });
      } else {
        setPhotos(prev => [...prev, newPhoto]);
      }
    };
    reader.readAsDataURL(file);
  }, [photos.length, validateFile, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, index?: number) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files, index);
  }, [handleFileSelect]);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Generate avatar mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Upload photos to a temporary location or convert to base64
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(photo.file);
          });
        })
      );

      const response = await fetch('/api/avatar/generate-from-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrls,
          characterName,
          style,
          outfit,
          expression,
          pose,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start generation');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const generation: Generation = {
        id: data.generationId,
        state: data.state,
        timestamp: Date.now(),
      };
      setCurrentGeneration(generation);
      setIsGenerating(true);
      toast({
        title: 'Generation Started! 🎨',
        description: 'Your avatar is being created. This usually takes 2-5 minutes.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Avatar generation is temporarily unavailable. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (generationId: string) => {
      const response = await fetch(`/api/avatar/download/${generationId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download avatar');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Downloaded Successfully',
        description: 'Avatar image has been saved to your device.',
      });

      // Trigger browser download
      if (currentGeneration?.assets?.image) {
        const link = document.createElement('a');
        link.href = currentGeneration.assets.image;
        link.download = `avatar-${currentGeneration.id}.png`;
        link.click();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const canGenerate = photos.length >= 1 && !generateMutation.isPending;

  return (
    <SelfHealingErrorBoundary pageName="Avatar Designer" fallbackRoute="/profile">
      <SEO
        title="3D Avatar Designer - Create Your Pixar-Style Avatar"
        description="Generate custom 3D Pixar-style avatars using AI. Upload your photos and customize your avatar's style, outfit, expression, and pose."
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">3D Avatar Designer</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create your custom Pixar-style avatar using AI. Upload reference photos and customize every detail.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Upload & Customization */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Reference Photos
                  </CardTitle>
                  <CardDescription>
                    Upload 1-4 photos of yourself. Better photos = better results!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          'relative aspect-square rounded-lg border-2 border-dashed transition-all',
                          isDragging && !photos[index] ? 'border-primary bg-primary/5' : 'border-border',
                          photos[index] ? 'border-solid border-primary' : ''
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {photos[index] ? (
                          <>
                            <img
                              src={photos[index].preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => removePhoto(index)}
                              data-testid={`button-remove-photo-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <input
                              ref={(el) => (fileInputRefs.current[index] = el)}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files, index)}
                              data-testid={`input-avatar-photo-${index}`}
                            />
                            <Button
                              variant="ghost"
                              className="w-full h-full flex flex-col gap-2"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              data-testid={`button-upload-photo-${index}`}
                            >
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                              </span>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Tips:</strong> Use clear, well-lit photos. Front-facing works best.
                    Max 10MB per photo.
                  </p>
                </CardContent>
              </Card>

              {/* Customization Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Avatar</CardTitle>
                  <CardDescription>
                    Fine-tune the appearance and personality of your 3D avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="character-name">Character Name (Optional)</Label>
                    <Input
                      id="character-name"
                      placeholder="e.g., Mr. Blue"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      data-testid="input-character-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="style">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style" data-testid="select-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outfit">Outfit</Label>
                      <Select value={outfit} onValueChange={setOutfit}>
                        <SelectTrigger id="outfit" data-testid="select-outfit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OUTFIT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expression">Expression</Label>
                      <Select value={expression} onValueChange={setExpression}>
                        <SelectTrigger id="expression" data-testid="select-expression">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPRESSION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pose">Pose</Label>
                      <Select value={pose} onValueChange={setPose}>
                        <SelectTrigger id="pose" data-testid="select-pose">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POSE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!canGenerate}
                    onClick={() => generateMutation.mutate()}
                    data-testid="button-generate-avatar"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Generation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate 3D Avatar
                      </>
                    )}
                  </Button>

                  {photos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Upload at least 1 photo to generate your avatar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview & History */}
            <div className="space-y-6">
              {/* Current Generation Preview */}
              {currentGeneration && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Your Avatar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentGeneration.state === 'completed' && currentGeneration.assets?.image ? (
                      <>
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={currentGeneration.assets.image}
                            alt="Generated Avatar"
                            className="w-full h-full object-cover"
                            data-testid="img-generated-avatar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Button
                            className="w-full"
                            onClick={() => downloadMutation.mutate(currentGeneration.id)}
                            disabled={downloadMutation.isPending}
                            data-testid="button-download-avatar"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Image
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            data-testid="button-use-as-profile"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Use as Profile Picture
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="aspect-square rounded-lg border flex flex-col items-center justify-center p-6 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <Badge variant="secondary" className="mb-2" data-testid="badge-generation-status">
                          {currentGeneration.state === 'queued' && 'Queued'}
                          {currentGeneration.state === 'dreaming' && 'Dreaming'}
                          {currentGeneration.state === 'failed' && 'Failed'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mb-4">
                          {currentGeneration.state === 'queued' && 'Your generation is queued...'}
                          {currentGeneration.state === 'dreaming' && 'AI is creating your avatar...'}
                          {currentGeneration.state === 'failed' && 'Generation failed. Please try again.'}
                        </p>
                        <div className="w-full">
                          <Progress value={currentGeneration.state === 'dreaming' ? 50 : 10} className="mb-2" />
                          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            Estimated time: 2-5 minutes
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          Generation ID: {currentGeneration.id.substring(0, 8)}...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Generation History */}
              {generationHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Generations</CardTitle>
                    <CardDescription>Your last 5 avatar creations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generationHistory.map((gen, index) => (
                      <div
                        key={gen.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => setCurrentGeneration(gen)}
                        data-testid={`history-item-${index}`}
                      >
                        {gen.assets?.image ? (
                          <img
                            src={gen.assets.image}
                            alt={`Generation ${index + 1}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {new Date(gen.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(gen.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge
                          variant={gen.state === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {gen.state}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <p>Upload 1-4 clear photos of yourself</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <p>Customize style, outfit, expression, and pose</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <p>AI generates your Pixar-style 3D avatar (~2-5 min)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      4
                    </div>
                    <p>Download and use your custom avatar!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
        <DialogContent data-testid="dialog-generation-progress">
          <DialogHeader>
            <DialogTitle>Generating Your Avatar</DialogTitle>
            <DialogDescription>
              Please wait while AI creates your custom 3D Pixar-style avatar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="text-sm" data-testid="badge-modal-status">
                {currentGeneration?.state === 'queued' && 'Queued'}
                {currentGeneration?.state === 'dreaming' && 'Dreaming'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                This usually takes 2-5 minutes. You can close this dialog and check back later.
              </p>
            </div>
            <Progress
              value={currentGeneration?.state === 'dreaming' ? 50 : 10}
              className="w-full"
              data-testid="progress-generation"
            />
            {currentGeneration && (
              <p className="text-xs text-muted-foreground text-center">
                Generation ID: {currentGeneration.id}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SelfHealingErrorBoundary>
  );
}
