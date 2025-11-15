/**
 * Mr. Blue Visual Chat - ChatGPT-STYLE VOICE MODE EDITION
 * Features:
 * - Prominent, centered microphone button with pulsing animation
 * - Full transcript display panel
 * - Streaming AI responses (token-by-token)
 * - "Mr. Blue is thinking..." states
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, History, Lightbulb, Mic, MicOff, Volume2, VolumeX, Box, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { visualEditorTracker, type VisualEdit } from "@/lib/visualEditorTracker";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { MrBlueAvatar } from "./MrBlueAvatar";
import MrBlueAvatar3D from "@/components/mrblue/MrBlueAvatar3D";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSpokenGreeting = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Streaming hook
  const {
    isStreaming,
    currentStatus,
    messages: streamMessages,
    generatedCode,
    error: streamError,
    sendMessage: sendStreamingMessage,
    clear: clearStream
  } = useStreamingChat();

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

**Voice Mode:**
Click the microphone to speak naturally! I'll show you exactly what I heard.`;

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
    resetTranscript,
    enableContinuousMode,
    disableContinuousMode
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
      const greeting = "Hi! I'm Mr. Blue. Click the large microphone button to speak to me. I'll show you the full transcript and stream my response back in real-time.";
      speak(greeting);
      hasSpokenGreeting.current = true;
    }
  }, [ttsEnabled, ttsSupported, messages.length, speak]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStreamingMessage]);

  // Handle streaming messages
  useEffect(() => {
    if (streamMessages.length > 0) {
      const latestMessage = streamMessages[streamMessages.length - 1];
      
      if (latestMessage.type === 'completion' && latestMessage.message) {
        // Final message received
        setCurrentStreamingMessage("");
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: latestMessage.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (ttsEnabled && ttsSupported) {
          speak(latestMessage.message);
        }
      } else if (latestMessage.type === 'progress' && latestMessage.message) {
        // Stream progress
        setCurrentStreamingMessage(latestMessage.message);
      } else if (latestMessage.type === 'visual_change' && latestMessage.data) {
        // Apply visual change to iframe in real-time!
        console.log('[MrBlueVisualChat] Applying visual change:', latestMessage.data);
        
        // Get iframe from parent page
        const iframe = document.querySelector('iframe[data-visual-editor="true"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'APPLY_CHANGE',
            change: latestMessage.data.change
          }, '*');
          
          console.log('[MrBlueVisualChat] ✅ Visual change sent to iframe');
        } else {
          console.warn('[MrBlueVisualChat] Iframe not found for visual change');
        }
      }
    }
  }, [streamMessages, ttsEnabled, ttsSupported, speak]);

  // Auto-send on silence detection (2 seconds of no speech)
  useEffect(() => {
    if (isListening && transcript) {
      // Clear existing timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Set new timer - auto-send after 2 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        if (transcript.trim()) {
          console.log('[Voice] Silence detected, auto-submitting:', transcript);
          // DON'T stop listening - continuous mode!
          sendMessage();
        }
      }, 2000);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, isListening]);

  // Update input with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

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
    // DON'T stop listening if in continuous mode - let it keep listening!
    setIsLoading(true);
    setCurrentStreamingMessage("");

    try {
      // Simple routing heuristic: Check if this is a complex build request
      const isBuildRequest = /build|create|make|add feature/i.test(originalInput);

      if (isBuildRequest) {
        // AUTONOMOUS MODE: Complex build requests go to autonomous API
        let contextualPrompt = originalInput;
        
        if (contextInfo.selectedElement) {
          contextualPrompt = `USER REQUEST: ${originalInput}\n\nCONTEXT:\n- Page: ${contextInfo.page}\n- Selected element: ${contextInfo.selectedElement.tagName} (testId: ${contextInfo.selectedElement.testId || 'none'})\n- Element class: ${contextInfo.selectedElement.className}\n- Element text: ${contextInfo.selectedElement.text}\n- Total edits so far: ${contextInfo.editsCount}`;
        }

        // Call autonomous code generation
        const result = await onGenerateCode(contextualPrompt);

        const response = `✅ **Build request started!**\n\n${result.explanation || 'I\'ve started working on your build request...'}\n\nWatch the Autonomous Workflow panel for progress.`;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (ttsEnabled && ttsSupported) {
          speak("Build request started! Check the workflow panel.");
        }
        setIsLoading(false);
      } else {
        // SIMPLE CHAT MODE: Conversational messages go to chat endpoint
        const token = localStorage.getItem('accessToken');
        
        // Build conversation history from existing messages
        const conversationHistory = messages
          .filter(m => m.role !== 'assistant' || !m.content.includes('✅ **Build request'))
          .slice(-6)
          .map(m => ({
            role: m.role,
            content: m.content
          }));

        const response = await fetch('/api/mrblue/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            message: originalInput,
            context: {
              page: contextInfo.page,
              selectedElement: contextInfo.selectedElement,
              editsCount: contextInfo.editsCount,
              recentEdits: contextInfo.recentEdits.map(e => e.description)
            },
            conversationHistory
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Chat request failed');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (ttsEnabled && ttsSupported) {
          speak(data.response);
        }

        setIsLoading(false);
      }
    } catch (error: any) {
      const errorResponse = `❌ **I had trouble with that request.**\n\n${error.message || 'Could you try rephrasing?'}\n\n**Tips:**\n• For simple questions: Just ask naturally!\n• For building features: Use words like "build", "create", "make"`;
      
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
      // User manually stops - disable continuous mode and stop
      disableContinuousMode();
      stopListening();
      // Don't auto-send on manual stop
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      console.log('[Voice] Continuous listening stopped by user');
    } else {
      // User starts - enable continuous mode
      resetTranscript();
      setInput("");
      enableContinuousMode();
      startListening();
      console.log('[Voice] Continuous listening started');
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
                {isListening ? '🎤 Listening continuously...' : isSpeaking ? '🔊 Speaking...' : isStreaming ? '⚡ Streaming...' : 'Voice-powered editing'}
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

      {/* Voice Transcript Display - Prominent when listening */}
      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-ocean-divider bg-primary/5"
          >
            <div className="flex items-start gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Mic className="h-4 w-4 text-primary mt-1" />
              </motion.div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary mb-1">You said:</p>
                <Card className="bg-background/50">
                  <CardContent className="p-3">
                    <p className="text-sm">
                      {transcript || 'Listening...'}
                    </p>
                  </CardContent>
                </Card>
                {transcript && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 I'll send after 2 seconds of silence, then keep listening for your next command
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* Streaming AI Response */}
          {(isLoading || isStreaming || currentStreamingMessage) && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                {use3D ? (
                  <MrBlueAvatar3D size={56} expression="thinking" />
                ) : (
                  <MrBlueAvatar isSpeaking={false} isListening={false} />
                )}
              </div>
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                {currentStreamingMessage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{currentStreamingMessage}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Streaming...</span>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    <Badge variant="outline" className="mb-2">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Mr. Blue is thinking...
                    </Badge>
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                )}
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
      {contextInfo.selectedElement && !isListening && (
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

      {/* Input Area */}
      <div className="p-4 border-t border-ocean-divider">
        {/* Prominent Microphone Button - ChatGPT Style */}
        {voiceSupported && !input && messages.length <= 1 && (
          <div className="flex justify-center mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={toggleVoiceInput}
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={`h-16 w-16 rounded-full ${
                  isListening 
                    ? 'bg-primary shadow-lg' 
                    : 'bg-background hover:bg-primary/10'
                }`}
                data-testid="button-voice-input-large"
              >
                <motion.div
                  animate={isListening ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={isListening ? {
                    repeat: Infinity,
                    duration: 1.5
                  } : {}}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        )}

        {/* Text Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask me to make changes or click the mic..."}
            className="resize-none"
            rows={2}
            data-testid="input-mr-blue-visual-chat"
            disabled={isListening}
          />
          <div className="flex flex-col gap-2">
            {voiceSupported && (input || messages.length > 1) && (
              <Button
                onClick={toggleVoiceInput}
                variant={isListening ? "default" : "ghost"}
                size="icon"
                data-testid="button-voice-input"
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <MicOff className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isStreaming}
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

        {voiceSupported && !isListening && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Tip: Click the microphone for continuous listening. Speak multiple commands without clicking again!
          </p>
        )}
        
        {isListening && (
          <p className="text-xs text-primary mt-2 text-center font-medium">
            🎤 Continuous mode ON - Click mic to stop listening
          </p>
        )}
      </div>
    </div>
  );
}
