import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Radio, Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VoicePage() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'push-to-talk' | 'hands-free'>('push-to-talk');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = mode === 'hands-free';
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleVoiceInput(transcriptText);
        }
      };

      recognitionRef.current.onend = () => {
        if (mode === 'hands-free' && isListening) {
          recognitionRef.current?.start();
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [mode, isListening]);

  const handleVoiceInput = async (text: string) => {
    setConversation(prev => [...prev, { role: 'user', text }]);
    setTranscript('');

    try {
      const response = await fetch('/api/mrblue/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setConversation(prev => [...prev, { role: 'assistant', text: data.response }]);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process voice input.',
        variant: 'destructive',
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Voice recognition not supported or permission denied.',
          variant: 'destructive',
        });
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-mr-blue-voice">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mr Blue Voice</h1>
          <p className="text-muted-foreground mt-2">
            Voice conversation with AI assistant
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'push-to-talk' ? 'default' : 'outline'}
            onClick={() => setMode('push-to-talk')}
            data-testid="button-push-to-talk"
          >
            <Hand className="h-4 w-4 mr-2" />
            Push to Talk
          </Button>
          <Button
            variant={mode === 'hands-free' ? 'default' : 'outline'}
            onClick={() => setMode('hands-free')}
            data-testid="button-hands-free"
          >
            <Radio className="h-4 w-4 mr-2" />
            Hands-Free
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-conversation">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversation</CardTitle>
              <div className="flex gap-2">
                {isListening && (
                  <Badge variant="default" className="animate-pulse" data-testid="badge-listening">
                    <Mic className="h-3 w-3 mr-1" />
                    Listening...
                  </Badge>
                )}
                {isSpeaking && (
                  <Badge variant="default" data-testid="badge-speaking">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Speaking...
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${idx}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {transcript && (
                <div className="flex justify-end" data-testid="interim-transcript">
                  <div className="max-w-[80%] rounded-lg p-4 bg-primary/50 text-primary-foreground">
                    <p className="text-sm italic">{transcript}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-voice-controls">
          <CardHeader>
            <CardTitle>Voice Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                data-testid="button-voice-toggle"
              >
                {isListening ? (
                  <MicOff className="h-12 w-12 text-white" />
                ) : (
                  <Mic className="h-12 w-12 text-white" />
                )}
              </button>

              <p className="text-sm text-muted-foreground text-center">
                {isListening 
                  ? mode === 'push-to-talk' 
                    ? 'Release to stop' 
                    : 'Click to stop listening'
                  : 'Click to start speaking'
                }
              </p>

              {isSpeaking && (
                <Button
                  variant="outline"
                  onClick={stopSpeaking}
                  className="w-full"
                  data-testid="button-stop-speaking"
                >
                  <VolumeX className="h-4 w-4 mr-2" />
                  Stop Speaking
                </Button>
              )}
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Mode:</span>
                <span className="ml-2 font-medium">
                  {mode === 'push-to-talk' ? 'Push to Talk' : 'Hands-Free'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium">
                  {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Idle'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <span className="ml-2 font-medium">{conversation.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
