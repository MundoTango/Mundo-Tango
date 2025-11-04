import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, PhoneOff, Send, Sparkles } from 'lucide-react';
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Props {
  currentPage?: string;
  selectedElement?: any;
}

export function MrBlueRealtimeChat({ currentPage, selectedElement }: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<'idle' | 'voice'>('idle');
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const instructions = `You are Mr. Blue, an AI assistant in the Mundo Tango Visual Editor.

Current Context:
- Page: ${currentPage || '/'}
- Selected Element: ${selectedElement?.tagName || 'None'}
- Methodology: MB.MD (Simultaneously, Recursively, Critically)

Help the user edit their page using natural conversation. Be concise and helpful.`;
  
  const {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  } = useOpenAIRealtime({
    instructions,
    voice: 'alloy',
    turnDetection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
    },
  });
  
  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  const handleStartVoiceChat = async () => {
    try {
      await connect();
      setMode('voice');
      toast({
        title: '🎤 Voice Chat Started',
        description: 'Speak naturally - Mr. Blue is listening!',
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleStopVoiceChat = () => {
    disconnect();
    setMode('idle');
    toast({
      title: 'Voice Chat Ended',
      description: 'Conversation saved.',
    });
  };
  
  const handleSendText = () => {
    if (!textInput.trim()) return;
    sendMessage(textInput);
    setTextInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Mr. Blue AI</h3>
            <p className="text-xs text-muted-foreground">
              {isConnected ? (
                <Badge variant="default" className="text-xs py-0 px-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5" />
                  Live Voice Chat
                </Badge>
              ) : (
                'ChatGPT-style voice mode'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {mode === 'idle' && (
            <Button
              onClick={handleStartVoiceChat}
              variant="default"
              size="sm"
              data-testid="button-start-voice-chat"
            >
              <Phone className="w-4 h-4 mr-2" />
              Start Voice Chat
            </Button>
          )}
          
          {mode === 'voice' && (
            <Button
              onClick={handleStopVoiceChat}
              variant="destructive"
              size="sm"
              data-testid="button-stop-voice-chat"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
            <p className="font-medium mb-2">Start a voice conversation!</p>
            <p className="text-sm">Mr. Blue understands MB.MD methodology</p>
            <p className="text-xs mt-1 opacity-70">
              Or type a message below for text chat
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted border'
              }`}
            >
              <div className="text-xs opacity-70 mb-1 font-medium">
                {msg.role === 'user' ? 'You' : 'Mr. Blue'}
              </div>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Voice Indicator */}
      {isRecording && (
        <div className="px-4 py-3 border-t bg-gradient-to-r from-blue-500/10 to-purple-600/10">
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"
                  style={{ 
                    height: `${Math.random() * 20 + 10}px`,
                    animation: `pulse ${Math.random() * 0.5 + 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s` 
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        </div>
      )}
      
      {/* Text Input */}
      {isConnected && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or speak naturally..."
              className="flex-1"
              data-testid="input-realtime-text"
            />
            <Button
              onClick={handleSendText}
              size="icon"
              disabled={!textInput.trim()}
              data-testid="button-send-text"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
