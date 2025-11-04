/**
 * Mr. Blue Voice Interface
 * Unified component for voice + text chat with streaming work progress
 * Used in: Visual Editor, Global floating button, Sidebar
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { cn } from '@/lib/utils';

interface MrBlueVoiceInterfaceProps {
  userId: number;
  role: string;
  mode?: 'visual_editor' | 'chat' | 'global';
  page?: string;
  context?: any;
  className?: string;
  onApplyChange?: (change: any) => void;
  onCodeGenerated?: (code: string) => void;
}

export function MrBlueVoiceInterface({
  userId,
  role,
  mode = 'chat',
  page = '/',
  context,
  className,
  onApplyChange,
  onCodeGenerated
}: MrBlueVoiceInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice features
  const voice = useRealtimeVoice({
    userId,
    role,
    mode,
    page,
    autoConnect: false
  });

  // Streaming features
  const streaming = useStreamingChat();

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, streaming.messages]);

  // Update context when it changes
  useEffect(() => {
    if (voice.isConnected && context) {
      voice.updateContext(context);
    }
  }, [context, voice.isConnected]);

  // Handle voice mode toggle
  const toggleVoiceMode = async () => {
    if (!isVoiceMode) {
      // Enable voice
      await voice.connect();
      setIsVoiceMode(true);
    } else {
      // Disable voice
      voice.disconnect();
      setIsVoiceMode(false);
    }
  };

  // Handle recording toggle
  const toggleRecording = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add to history
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    if (isVoiceMode && voice.isConnected) {
      // Send via voice (will get audio response)
      voice.sendText(userMessage);
    } else {
      // Send via streaming (will get text response with work progress)
      await streaming.sendMessage(userMessage, context, mode);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Add streaming messages to chat
  useEffect(() => {
    if (streaming.messages.length > 0) {
      const lastMsg = streaming.messages[streaming.messages.length - 1];
      if (lastMsg.type === 'completion' && lastMsg.message) {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: lastMsg.message!,
          timestamp: new Date()
        }]);
      }
    }
  }, [streaming.messages]);

  // Add voice transcript to chat
  useEffect(() => {
    if (voice.transcript) {
      setChatHistory(prev => {
        // Check if last message is from user with same content
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'user' && lastMsg.content === voice.transcript) {
          return prev;
        }
        
        return [...prev, {
          role: 'user',
          content: voice.transcript,
          timestamp: new Date()
        }];
      });
    }
  }, [voice.transcript]);

  // Determine if Mr. Blue can edit (god/super_admin only)
  const canEdit = role === 'god' || role === 'super_admin';

  return (
    <Card className={cn("flex flex-col h-full", className)} data-testid="mr-blue-voice-interface">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            Mr. Blue
            {mode === 'visual_editor' && <Badge variant="outline">Visual Editor</Badge>}
          </CardTitle>

          {/* Voice Toggle */}
          {canEdit && (
            <Button
              size="sm"
              variant={isVoiceMode ? "default" : "outline"}
              onClick={toggleVoiceMode}
              disabled={voice.isConnected && !isVoiceMode}
              data-testid="button-toggle-voice"
            >
              {isVoiceMode ? (
                <>
                  <Volume2 className="w-4 h-4 mr-1" />
                  Voice On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-1" />
                  Voice Off
                </>
              )}
            </Button>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {voice.isConnected && (
            <Badge variant="default" className="text-xs">
              🎙️ Voice Connected
            </Badge>
          )}
          {voice.isRecording && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              ⚫ Recording
            </Badge>
          )}
          {voice.isSpeaking && (
            <Badge variant="default" className="text-xs">
              🔊 Speaking
            </Badge>
          )}
          {streaming.isStreaming && (
            <Badge variant="default" className="text-xs">
              {streaming.currentStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 gap-4">
        {/* Chat History */}
        <ScrollArea 
          className="flex-1 pr-4" 
          ref={scrollRef}
          data-testid="mr-blue-chat-history"
        >
          <div className="space-y-3">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg",
                  msg.role === 'user' 
                    ? "bg-primary/10 ml-8" 
                    : "bg-muted mr-8"
                )}
                data-testid={`chat-message-${idx}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium">
                    {msg.role === 'user' ? 'You' : 'Mr. Blue'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}

            {/* Streaming status */}
            {streaming.isStreaming && (
              <div className="bg-muted mr-8 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{streaming.currentStatus}</span>
                </div>
              </div>
            )}

            {/* Generated code preview */}
            {streaming.generatedCode && (
              <div className="bg-muted mr-8 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Generated Code:</p>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                  <code>{streaming.generatedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error display */}
        {(voice.error || streaming.error) && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
            {voice.error || streaming.error}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0">
          {isVoiceMode && voice.isConnected ? (
            /* Voice Input Mode */
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                variant={voice.isRecording ? "destructive" : "default"}
                className="flex-1"
                onClick={toggleRecording}
                data-testid="button-toggle-recording"
              >
                {voice.isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Text Input Mode */
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  canEdit 
                    ? "Ask a question or request a change..." 
                    : "Ask Mr. Blue a question..."
                }
                className="min-h-[60px] resize-none"
                data-testid="input-mr-blue-message"
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!inputText.trim() || streaming.isStreaming}
                data-testid="button-send-message"
              >
                {streaming.isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Voice transcript preview */}
          {voice.transcript && (
            <div className="mt-2 text-xs text-muted-foreground">
              Heard: "{voice.transcript}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
