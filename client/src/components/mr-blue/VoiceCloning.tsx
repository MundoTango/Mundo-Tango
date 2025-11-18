import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  X, 
  Play, 
  Mic, 
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Volume2,
  Trash2,
  Star,
  AudioLines,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TrainingSession {
  id: string;
  status: 'pending' | 'downloading' | 'processing' | 'training' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  voiceId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface Language {
  code: string;
  name: string;
}

interface VoiceModel {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

interface VoiceClone {
  id: number;
  voiceId: string;
  name: string;
  description?: string;
  status: string;
  isDefault: boolean;
  audioSampleCount: number;
  language: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

export function VoiceCloning() {
  const { toast } = useToast();
  
  // State
  const [voiceName, setVoiceName] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrls, setAudioUrls] = useState<string[]>(["", "", "", ""]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [testText, setTestText] = useState("Hello! This is a test of my cloned voice.");
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // Fetch supported languages
  const { data: languagesData } = useQuery<{ success: boolean; languages: Language[] }>({
    queryKey: ['/api/mrblue/voice/languages'],
  });

  // Fetch voice samples
  const { data: voicesData, isLoading: voicesLoading } = useQuery<{
    success: boolean;
    userVoiceId: string | null;
    voices: {
      custom: VoiceModel[];
      premade: VoiceModel[];
    };
  }>({
    queryKey: ['/api/mrblue/voice/samples'],
  });

  // Fetch user's voice clones (new endpoint)
  const { data: clonesData, isLoading: clonesLoading } = useQuery<{
    success: boolean;
    clones: VoiceClone[];
    count: number;
  }>({
    queryKey: ['/api/mrblue/voice/clones'],
  });

  // Fetch training status if session is active
  const { data: statusData, refetch: refetchStatus } = useQuery<{
    success: boolean;
    session: TrainingSession;
    progressSummary: {
      status: string;
      progress: number;
      currentStep: string;
      estimatedTimeRemaining?: string;
    };
  }>({
    queryKey: ['/api/mrblue/voice/status', currentSessionId],
    enabled: !!currentSessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const status = data.session.status;
      // Poll every 2 seconds while training is in progress
      return (status !== 'completed' && status !== 'failed') ? 2000 : false;
    },
  });

  // Start training mutation
  const trainMutation = useMutation({
    mutationFn: async (data: { voiceName: string; audioUrls: string[]; description?: string }) => {
      return apiRequest('/api/mrblue/voice/train', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Training Started",
        description: "Your voice cloning has started. This may take several minutes.",
      });
      setCurrentSessionId(data.session.id);
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Failed to start voice training",
        variant: "destructive",
      });
    },
  });

  // Generate speech mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { 
      text: string; 
      voiceId?: string; 
      language?: string;
    }) => {
      return apiRequest('/api/mrblue/voice/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      // Play the generated audio
      const audio = new Audio(data.audio);
      audio.play();
      setIsPlayingTest(true);
      audio.onended = () => setIsPlayingTest(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate speech",
        variant: "destructive",
      });
    },
  });

  // Delete voice clone mutation
  const deleteCloneMutation = useMutation({
    mutationFn: async (cloneId: number) => {
      return apiRequest(`/api/mrblue/voice/clone/${cloneId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Voice Clone Deleted",
        description: "Your voice clone has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/voice/clones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/voice/samples'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete voice clone",
        variant: "destructive",
      });
    },
  });

  // Set default voice mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (cloneId: number) => {
      return apiRequest(`/api/mrblue/voice/set-default/${cloneId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Default Voice Set",
        description: "Your default voice has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/voice/clones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/voice/samples'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to set default voice",
        variant: "destructive",
      });
    },
  });

  // Preview voice mutation
  const previewMutation = useMutation({
    mutationFn: async (data: { voiceId: string; text: string; language?: string }) => {
      return apiRequest('/api/mrblue/voice/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      const audio = new Audio(data.audio);
      audio.play();
      toast({
        title: "Preview Generated",
        description: "Playing voice preview",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to generate preview",
        variant: "destructive",
      });
    },
  });

  // Handle URL input changes
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...audioUrls];
    newUrls[index] = value;
    setAudioUrls(newUrls);
  };

  // Add more URL inputs
  const addUrlInput = () => {
    if (audioUrls.length < 25) {
      setAudioUrls([...audioUrls, ""]);
    }
  };

  // Remove URL input
  const removeUrlInput = (index: number) => {
    if (audioUrls.length > 1) {
      const newUrls = audioUrls.filter((_, i) => i !== index);
      setAudioUrls(newUrls);
    }
  };

  // Submit training
  const handleStartTraining = () => {
    const validUrls = audioUrls.filter(url => url.trim().length > 0);
    
    if (!voiceName.trim()) {
      toast({
        title: "Voice Name Required",
        description: "Please enter a name for your voice",
        variant: "destructive",
      });
      return;
    }

    if (validUrls.length === 0) {
      toast({
        title: "Audio URLs Required",
        description: "Please provide at least one audio URL",
        variant: "destructive",
      });
      return;
    }

    trainMutation.mutate({
      voiceName,
      audioUrls: validUrls,
      description: description.trim() || undefined,
    });
  };

  // Test voice preview
  const handleTestVoice = () => {
    if (!testText.trim()) {
      toast({
        title: "Test Text Required",
        description: "Please enter some text to test",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      text: testText,
      language: selectedLanguage,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: any; icon: any; text: string }> = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      downloading: { variant: "secondary", icon: Upload, text: "Downloading" },
      processing: { variant: "secondary", icon: Loader2, text: "Processing" },
      training: { variant: "secondary", icon: Mic, text: "Training" },
      completed: { variant: "default", icon: CheckCircle2, text: "Completed" },
      failed: { variant: "destructive", icon: XCircle, text: "Failed" },
    };

    const config = badges[status] || badges.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Voice Cloning</h2>
        <p className="text-muted-foreground mt-2">
          Clone your voice for natural conversations with Mr Blue in 17 languages
        </p>
      </div>

      {/* Scott's Voice Status Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Scott Boddye's Voice - Mundo Tango Founder
          </CardTitle>
          <CardDescription>
            Official voice of Mr Blue, representing the warmth and passion of the tango community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Ready for Setup
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Training Data</p>
              <p className="font-semibold">2.5 minutes</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Audio Files</p>
              <p className="font-semibold">5 samples</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quality</p>
              <p className="font-semibold">128kbps MP3</p>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Training Audio Ready
            </p>
            <p className="text-sm text-muted-foreground">
              High-quality podcast excerpts from "Free Heeling with Scott Boddye" (Humans of Tango)
            </p>
            <p className="text-sm text-muted-foreground">
              Source files located in: <code className="text-xs bg-background px-2 py-1 rounded">attached_assets/voice_training/</code>
            </p>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <Clock className="h-4 w-4" />
              Setup Required
            </p>
            <p className="text-sm text-muted-foreground">
              To activate Scott's voice, upgrade your ElevenLabs plan to Creator ($22/mo) or higher, then run the training command.
            </p>
            <p className="text-sm">
              <a 
                href="/attached_assets/voice_training/SCOTT_VOICE_SETUP.md" 
                target="_blank"
                className="text-primary hover:underline font-medium"
              >
                View Setup Instructions →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Voice Status */}
      {voicesData?.userVoiceId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Your Custom Voice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Voice ID: {voicesData.userVoiceId}</p>
                <p className="text-sm text-muted-foreground">
                  Mr Blue will use your custom voice in conversations
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Status */}
      {currentSessionId && statusData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Training Progress</span>
              {getStatusBadge(statusData.session.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{statusData.progressSummary.currentStep}</span>
                <span>{statusData.session.progress}%</span>
              </div>
              <Progress value={statusData.session.progress} data-testid="progress-training" />
            </div>

            {statusData.progressSummary.estimatedTimeRemaining && (
              <p className="text-sm text-muted-foreground">
                Estimated time remaining: {statusData.progressSummary.estimatedTimeRemaining}
              </p>
            )}

            {statusData.session.error && (
              <div className="bg-destructive/10 border border-destructive rounded-md p-3">
                <p className="text-sm text-destructive">{statusData.session.error}</p>
              </div>
            )}

            {statusData.session.status === 'completed' && statusData.session.voiceId && (
              <div className="bg-green-500/10 border border-green-500 rounded-md p-3">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✅ Voice cloning completed! Voice ID: {statusData.session.voiceId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training Form */}
      <Card>
        <CardHeader>
          <CardTitle>Train Your Voice</CardTitle>
          <CardDescription>
            Provide 1-25 audio samples (YouTube videos, podcasts, interviews) for best results.
            Each sample should be 1-5 minutes long with clear speech.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Name */}
          <div className="space-y-2">
            <Label htmlFor="input-voicename">Voice Name</Label>
            <Input
              id="input-voicename"
              data-testid="input-voicename"
              placeholder="e.g., My Professional Voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="textarea-description">Description (Optional)</Label>
            <Textarea
              id="textarea-description"
              data-testid="textarea-description"
              placeholder="Describe your voice or intended use..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Audio URLs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Audio URLs</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrlInput}
                disabled={audioUrls.length >= 25}
                data-testid="button-add-url"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add URL
              </Button>
            </div>

            <div className="space-y-3">
              {audioUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Audio URL ${index + 1} (YouTube, podcast, etc.)`}
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    data-testid={`input-url-${index}`}
                  />
                  {audioUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUrlInput(index)}
                      data-testid={`button-remove-url-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Supported: YouTube, Podbean, direct MP3/WAV links. Best results with 2-4 high-quality samples.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleStartTraining}
            disabled={trainMutation.isPending}
            className="w-full"
            data-testid="button-start-training"
          >
            {trainMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Training...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Training
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Voice Preview & Testing */}
      {voicesData?.userVoiceId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Test Your Voice
            </CardTitle>
            <CardDescription>
              Generate speech in any of the 17 supported languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="select-language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger id="select-language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languagesData?.languages?.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Text */}
            <div className="space-y-2">
              <Label htmlFor="textarea-testtext">Test Text</Label>
              <Textarea
                id="textarea-testtext"
                data-testid="textarea-testtext"
                placeholder="Enter text to hear your cloned voice..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={3}
              />
            </div>

            {/* Test Button */}
            <Button
              onClick={handleTestVoice}
              disabled={generateMutation.isPending || isPlayingTest}
              className="w-full"
              data-testid="button-test-voice"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : isPlayingTest ? (
                <>
                  <Play className="mr-2 h-4 w-4 animate-pulse" />
                  Playing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test Voice
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voice Library Management */}
      {clonesData && clonesData.clones && clonesData.clones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AudioLines className="h-5 w-5" />
              Your Voice Library ({clonesData.count})
            </CardTitle>
            <CardDescription>
              Manage your voice clones, preview, set default, or delete them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clonesData.clones.map((clone) => (
                <div
                  key={clone.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`clone-item-${clone.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold" data-testid={`text-clone-name-${clone.id}`}>
                        {clone.name}
                      </h4>
                      {clone.isDefault && (
                        <Badge variant="default" className="gap-1" data-testid={`badge-default-${clone.id}`}>
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {clone.description && (
                      <p className="text-sm text-muted-foreground">{clone.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{clone.audioSampleCount} samples</span>
                      <span>{clone.language.toUpperCase()}</span>
                      <span>Used {clone.usageCount} times</span>
                      <span>Created {new Date(clone.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Preview Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewMutation.mutate({
                        voiceId: clone.voiceId,
                        text: "Hello! This is a preview of my cloned voice.",
                        language: clone.language,
                      })}
                      disabled={previewMutation.isPending}
                      data-testid={`button-preview-${clone.id}`}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>

                    {/* Set Default Button */}
                    {!clone.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(clone.id)}
                        disabled={setDefaultMutation.isPending}
                        data-testid={`button-set-default-${clone.id}`}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}

                    {/* Delete Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${clone.name}"? This action cannot be undone.`)) {
                          deleteCloneMutation.mutate(clone.id);
                        }
                      }}
                      disabled={deleteCloneMutation.isPending}
                      data-testid={`button-delete-${clone.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Languages Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>
            Your cloned voice works in all 17 languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {languagesData?.languages?.map((lang) => (
              <Badge key={lang.code} variant="secondary" className="justify-center">
                {lang.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
