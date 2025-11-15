/**
 * Mr. Blue Visual Chat - CONTEXT-AWARE EDITION
 * Right-side chat panel for conversational editing with full app context
 * WITH VOICE INPUT + TTS OUTPUT
 */

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, History, Lightbulb, Mic, MicOff, Volume2, VolumeX, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { visualEditorTracker, type VisualEdit } from "@/lib/visualEditorTracker";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { MrBlueAvatar } from "./MrBlueAvatar";
import MrBlueAvatar3D from "@/components/mrblue/MrBlueAvatar3D";

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

interface MrBlueVisualChatProps {
  currentPage: string;
  selectedElement: string | null;
  onGenerateCode: (prompt: string) => Promise<any>;
  contextInfo: ContextInfo;
}

export function MrBlueVisualChat({ 
  currentPage, 
  selectedElement,
  onGenerateCode,
  contextInfo 
}: MrBlueVisualChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSpokenGreeting = useRef(false);

  // Initialize greeting with context
  useEffect(() => {
    const greetingContent = `Hi! I'm Mr. Blue, your visual editing assistant. I can see you're working on **${currentPage}**.

**I have full context awareness:**
• Current page: ${currentPage}
• Selected element: ${contextInfo.selectedElement ? `${contextInfo.selectedElement.tagName} (${contextInfo.selectedElement.testId || 'no ID'})` : 'None'}
• Total edits: ${contextInfo.editsCount}

**What I can help with:**
• Move, edit, resize, delete elements
• Change colors, fonts, spacing
• Add/modify content and styling
• Generate production-ready code

Just tell me what you want to change!`;

    setMessages([{
      id: '1',
      role: 'assistant',
      content: greetingContent,
      timestamp: new Date()
    }]);
  }, [currentPage]);

  // Update context message when selection changes
  useEffect(() => {
    if (contextInfo.selectedElement) {
      const contextUpdate: Message = {
        id: `context-${Date.now()}`,
        role: 'assistant',
        content: `✨ **Element selected!**\n\n**${contextInfo.selectedElement.tagName}** ${contextInfo.selectedElement.testId ? `(${contextInfo.selectedElement.testId})` : ''}\n\nWhat would you like to do with this element?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, contextUpdate]);
    }
  }, [contextInfo.selectedElement?.testId]);

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

  // Speak greeting when TTS first enabled
  useEffect(() => {
    if (ttsEnabled && ttsSupported && !hasSpokenGreeting.current && messages.length > 0) {
      const greeting = "Hi! I'm Mr. Blue. I have full context of your page and can help you make changes. Click the microphone to use voice commands, or type your request below.";
      speak(greeting);
      hasSpokenGreeting.current = true;
    }
  }, [ttsEnabled, ttsSupported, messages.length, speak]);

  // Update input with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

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
    const originalInput = input;
    setInput("");
    resetTranscript();
    stopListening();
    setIsLoading(true);

    try {
      // Build context-aware prompt with MB.MD methodology auto-appended
      let contextualPrompt = originalInput;
      
      if (contextInfo.selectedElement) {
        contextualPrompt = `USER REQUEST: ${originalInput}\n\nCONTEXT:\n- Page: ${contextInfo.page}\n- Selected element: ${contextInfo.selectedElement.tagName} (testId: ${contextInfo.selectedElement.testId || 'none'})\n- Element class: ${contextInfo.selectedElement.className}\n- Element text: ${contextInfo.selectedElement.text}\n- Total edits so far: ${contextInfo.editsCount}`;
      }

      // CRITICAL: Auto-append "use mb.md" to enable MB.MD methodology
      // All Mr. Blue prompts use simultaneously/recursively/critically approach
      const mbmdPrompt = `use mb.md: ${contextualPrompt}`;

      // Call code generation with MB.MD methodology enabled
      const result = await onGenerateCode(mbmdPrompt);

      const response = `✅ **Code generated successfully!**\n\n${result.explanation || 'I\'ve analyzed your request and generated the necessary code changes.'}\n\nYou can preview the changes in the live preview panel.`;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (ttsEnabled && ttsSupported) {
        speak("Code generated successfully! Check the preview panel to see your changes.");
      }
    } catch (error: any) {
      const errorResponse = `❌ **I had trouble with that request.**\n\n${error.message || 'Could you try rephrasing? Make sure to describe what you want to change clearly.'}\n\n**Tips:**\n• Be specific (e.g., "Make the title larger" instead of "Change it")\n• Select an element first for better context\n• Try simpler requests if it's complex`;
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      if (ttsEnabled && ttsSupported) {
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
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-ocean-divider">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {use3D ? (
              <MrBlueAvatar3D 
                size={56}
                expression={isSpeaking ? 'excited' : isListening ? 'curious' : 'friendly'}
              />
            ) : (
              <MrBlueAvatar isSpeaking={isSpeaking} isListening={isListening} />
            )}
            <div>
              <h3 className="font-semibold">Mr. Blue - Visual Editor</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Context-aware editing assistant'}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setUse3D(!use3D)}
              data-testid="button-toggle-3d-avatar"
              title={use3D ? "Switch to 2D avatar" : "Switch to 3D avatar"}
              className={use3D ? 'bg-primary/10' : ''}
            >
              <Box className="h-4 w-4" />
            </Button>
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

      {/* Context Display */}
      <div className="p-3 bg-muted/30 border-b border-ocean-divider">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="font-medium">Context:</span>
          <span className="text-muted-foreground">
            {currentPage} • {contextInfo.editsCount} edits
            {contextInfo.selectedElement && ` • Selected: ${contextInfo.selectedElement.tagName}`}
          </span>
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
                  {use3D ? (
                    <MrBlueAvatar3D size={56} expression="friendly" />
                  ) : (
                    <MrBlueAvatar isSpeaking={false} isListening={false} />
                  )}
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
                {use3D ? (
                  <MrBlueAvatar3D size={56} expression="thinking" />
                ) : (
                  <MrBlueAvatar isSpeaking={false} isListening={false} />
                )}
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
      {contextInfo.recentEdits.length > 0 && (
        <div className="p-3 border-t border-ocean-divider bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Recent Edits</span>
          </div>
          <div className="space-y-1">
            {contextInfo.recentEdits.map(edit => (
              <div key={edit.id} className="text-xs text-muted-foreground truncate">
                • {edit.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {contextInfo.selectedElement && (
        <div className="p-3 border-t border-ocean-divider bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Quick Actions</span>
          </div>
          <div className="space-y-1">
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Make this element larger and more prominent")}
              data-testid="suggestion-make-larger"
            >
              • Make this larger
            </button>
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Change the color to ocean blue")}
              data-testid="suggestion-change-color"
            >
              • Change color to ocean blue
            </button>
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Center this element horizontally")}
              data-testid="suggestion-center"
            >
              • Center this element
            </button>
            <button 
              className="text-xs text-primary hover:underline block"
              onClick={() => setInput("Delete this element")}
              data-testid="suggestion-delete"
            >
              • Delete this element
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
