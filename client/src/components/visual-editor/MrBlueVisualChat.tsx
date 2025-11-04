/**
 * Mr. Blue Visual Chat
 * Right-side chat panel for conversational editing (40% width)
 * WITH VOICE INPUT + TTS OUTPUT
 */

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, History, Lightbulb, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { visualEditorTracker, type VisualEdit } from "@/lib/visualEditorTracker";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MrBlueAvatar } from "./MrBlueAvatar";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MrBlueVisualChatProps {
  currentPage: string;
  selectedElement: string | null;
  onGenerateCode: (prompt: string) => Promise<void>;
}

export function MrBlueVisualChat({ 
  currentPage, 
  selectedElement,
  onGenerateCode 
}: MrBlueVisualChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm Mr. Blue, your visual editing assistant. I can see you're working on **${currentPage}**. I can help you make changes by:\n\n• Clicking elements and adjusting properties\n• Or just tell me what you want to change!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentEdits, setRecentEdits] = useState<VisualEdit[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice hooks
  const { 
    isListening, 
    isSupported: voiceSupported, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useVoiceInput();

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported
  } = useTextToSpeech();

  // Update input with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    const updateEdits = () => {
      setRecentEdits(visualEditorTracker.getRecentEdits(5));
    };
    
    visualEditorTracker.addListener(updateEdits);
    updateEdits();

    return () => visualEditorTracker.removeListener(updateEdits);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    resetTranscript();
    stopListening();
    setIsLoading(true);

    try {
      // Call code generation with user's prompt
      await onGenerateCode(input);

      const response = "I've generated the code for your changes. Check the preview panel to see the updates!";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if TTS is enabled
      if (ttsEnabled && ttsSupported) {
        speak(response);
      }
    } catch (error) {
      const errorResponse = "I had trouble generating that code. Could you try rephrasing your request?";
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      if (ttsEnabled && ttsSupported) {
        speak(errorResponse);
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

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled(!ttsEnabled);
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-ocean-divider">
      {/* Header */}
      <div className="p-4 border-b border-ocean-divider">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MrBlueAvatar isSpeaking={isSpeaking} isListening={isListening} />
            <div>
              <h3 className="font-semibold">Mr. Blue - Visual Editor</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Talk naturally to edit'}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {ttsSupported && (
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTTS}
                data-testid="button-toggle-tts"
                title={ttsEnabled ? "Disable voice output" : "Enable voice output"}
              >
                {ttsEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
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

          {isLoading && (
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

      {/* Recent Edits */}
      {recentEdits.length > 0 && (
        <div className="p-3 border-t border-ocean-divider bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Recent Edits</span>
          </div>
          <div className="space-y-1">
            {recentEdits.map(edit => (
              <div key={edit.id} className="text-xs text-muted-foreground truncate">
                • {edit.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {selectedElement && (
        <div className="p-3 border-t border-ocean-divider bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Suggestions</span>
          </div>
          <div className="space-y-1">
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Make this element larger")}
            >
              • Make this larger
            </button>
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Change the color to turquoise")}
            >
              • Change color to turquoise
            </button>
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Center this element")}
            >
              • Center this element
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-ocean-divider">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask me to make changes..."}
            className="resize-none"
            rows={2}
            data-testid="input-mr-blue-visual-chat"
          />
          <div className="flex flex-col gap-2">
            {voiceSupported && (
              <Button
                onClick={toggleVoiceInput}
                variant={isListening ? "default" : "ghost"}
                size="icon"
                data-testid="button-voice-input"
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              data-testid="button-send-visual-chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!voiceSupported && !ttsSupported && (
          <p className="text-xs text-muted-foreground mt-2">
            Voice features not supported in this browser
          </p>
        )}
      </div>
    </div>
  );
}
