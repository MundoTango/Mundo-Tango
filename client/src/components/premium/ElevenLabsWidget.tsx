import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Volume2, Loader2, Play, Pause, Download, Sparkles } from 'lucide-react';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, young female' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong, young female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, young female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded, young male' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Crisp, middle-aged male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, middle-aged male' },
];

export function ElevenLabsWidget() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateSpeechMutation = useMutation({
    mutationFn: async () => {
      if (!text) {
        throw new Error('Text is required');
      }

      const response = await apiRequest('POST', '/api/premium/voice/tts', {
        text,
        voiceId: selectedVoice
      });

      return response;
    },
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl);
      
      toast({
        title: 'Speech Generated! 🎙️',
        description: `Successfully converted ${data.characterCount} characters to speech.`,
      });

      // Auto-play the audio
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: 'Speech Generation Failed',
        description: error.message || 'Failed to generate speech. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'speech.mp3';
    link.click();
  };

  const cost = (text.length / 1000 * 0.30).toFixed(4);

  return (
    <Card className="w-full" data-testid="card-elevenlabs-widget">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">ElevenLabs Voice</CardTitle>
            <CardDescription>High-quality text-to-speech generation</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">
            God Level
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select" data-testid="select-voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="speech-text">Text to Convert</Label>
          <Textarea
            id="speech-text"
            data-testid="textarea-speech-text"
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={2000}
            className="resize-none"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{text.length}/2000 characters</span>
            <span>Est. cost: ${cost}</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={() => generateSpeechMutation.mutate()}
          disabled={!text || generateSpeechMutation.isPending}
          className="w-full"
          size="lg"
          data-testid="button-generate-speech"
        >
          {generateSpeechMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Speech...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <div className="flex-1">
                <div className="text-sm font-medium">Generated Speech</div>
                <div className="text-xs text-muted-foreground">
                  {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name} voice
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={downloadAudio}
                data-testid="button-download-audio"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setAudioUrl(null);
                setText('');
                setIsPlaying(false);
              }}
              data-testid="button-create-new-audio"
            >
              Create New
            </Button>
          </div>
        )}

        {/* Cost Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Cost: $0.30 per 1000 characters • Requires God Level subscription
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
