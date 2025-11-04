/**
 * Mr. Blue Whisper Chat - AUDIO CONVERSATION EDITION
 * Full audio conversation like ChatGPT voice using OpenAI Whisper
 */

import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { visualEditorTracker, type VisualEdit } from "@/lib/visualEditorTracker";
import { useWhisperVoice } from "@/hooks/useWhisperVoice";
import { MrBlueAvatar } from "./MrBlueAvatar";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SelectedElementInfo {
  tagName: string;
  testId: string | null;
  className: string;
  text: string;
}

interface ContextInfo {
  page: string;
  selectedElement: SelectedElementInfo | null;
  editsCount: number;
  recentEdits: VisualEdit[];
}

interface MrBlueWhisperChatProps {
  currentPage: string;
  selectedElement: string | null;
  onGenerateCode: (prompt: string) => Promise<any>;
  contextInfo: ContextInfo;
}

export function MrBlueWhisperChat({ 
  currentPage, 
  selectedElement,
  onGenerateCode,
  contextInfo 
}: MrBlueWhisperChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Whisper voice hook
  const { 
    isRecording, 
    isProcessing,
    isSpeaking, 
    transcript, 
    error,
    startRecording, 
    stopRecording,
    speak,
    stopSpeaking,
    resetTranscript 
  } = useWhisperVoice();

  // Initialize greeting
  useEffect(() => {
    const greetingContent = `Hi! I'm Mr. Blue with full audio conversation powered by Whisper. Click the microphone and speak naturally - I'll transcribe and respond with voice!

**Current Context:**
• Page: ${currentPage}
• Selected: ${contextInfo.selectedElement ? contextInfo.selectedElement.tagName : 'None'}
• Edits: ${contextInfo.editsCount}

Try: "Make that button bigger" or "Change this to blue"`;

    setMessages([{
      id: '1',
      role: 'assistant',
      content: greetingContent,
      timestamp: new Date()
    }]);
  }, [currentPage]);

  // Update input with Whisper transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      // Auto-send after transcription
      setTimeout(() => {
        if (transcript && !isLoading) {
          sendMessage(transcript);
        }
      }, 500);
    }
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    resetTranscript();
    setIsLoading(true);

    try {
      // Build full context for Mr. Blue
      const context = {
        currentPage: contextInfo.page,
        selectedElement: contextInfo.selectedElement ? {
          tagName: contextInfo.selectedElement.tagName,
          testId: contextInfo.selectedElement.testId,
          className: contextInfo.selectedElement.className,
          text: contextInfo.selectedElement.text
        } : null,
        editsCount: contextInfo.editsCount,
        recentEdits: contextInfo.recentEdits.map(edit => edit.description)
      };

      // Call REAL AI chat API endpoint
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: textToSend,
          context: JSON.stringify(context),
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response || data.message || "I'm here to help!";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if enabled
      if (autoSpeak) {
        speak(aiResponse);
      }
    } catch (error: any) {
      const errorResponse = `❌ I had trouble with that. ${error.message || 'Please try again.'}`;
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      if (autoSpeak) {
        speak("I had trouble with that request. Please try rephrasing it.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording and get transcription
      await stopRecording();
    } else {
      // Start recording
      resetTranscript();
      setInput("");
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-ocean-divider">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MrBlueAvatar isSpeaking={isSpeaking} isListening={isRecording} />
            <div>
              <h3 className="font-semibold">Mr. Blue - Whisper Voice</h3>
              <p className="text-xs text-muted-foreground">
                {isRecording ? '🎤 Listening...' : 
                 isProcessing ? '⏳ Transcribing...' :
                 isSpeaking ? '🔊 Speaking...' : 
                 'Audio conversation ready'}
              </p>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (isSpeaking) stopSpeaking();
            }}
            data-testid="button-toggle-auto-speak"
            title={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
          >
            {autoSpeak ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${message.role}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <MrBlueAvatar isSpeaking={false} isListening={false} />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {(isLoading || isProcessing) && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <MrBlueAvatar isSpeaking={false} isListening={false} />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive">⚠️ {error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-ocean-divider">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "🎤 Listening..." : isProcessing ? "⏳ Processing..." : "Type or speak your request..."}
            className="resize-none"
            rows={2}
            disabled={isRecording || isProcessing}
            data-testid="input-mr-blue-whisper-chat"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleVoiceToggle}
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              disabled={isProcessing}
              data-testid="button-whisper-voice"
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || isRecording}
              size="icon"
              data-testid="button-send-whisper-chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          💡 Click mic to speak naturally • Auto-transcribes and responds with voice
        </p>
      </div>
    </div>
  );
}
