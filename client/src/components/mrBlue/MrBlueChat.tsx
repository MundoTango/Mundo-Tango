import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, X, Check, Mic, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import { breadcrumbTracker } from "@/lib/mrBlue/breadcrumbTracker";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { MessageActions } from "./MessageActions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { VibecodingRouter } from "@/lib/vibecodingRouter";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  readAt?: Date | null;
  isEdited?: boolean;
  editedAt?: Date | null;
  deletedAt?: Date | null;
  reactions?: Array<{ emoji: string; count: number; users: number[] }>;
}

export function MrBlueChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const messageCountRef = useRef(0);
  const vibeRouterRef = useRef<VibecodingRouter | null>(null);
  const { toast } = useToast();

  // Handle voice input result
  const handleVoiceResult = (text: string) => {
    console.log('[Voice] Received transcript:', text);
    setInput(text);
    // Auto-send after voice input
    setTimeout(() => {
      if (text.trim()) {
        sendMessage();
      }
    }, 100);
  };

  // Initialize voice input with continuous mode support and audio quality monitoring
  const { 
    continuousMode, 
    isListening,
    audioMetrics,
    noiseThreshold,
    enableContinuousMode, 
    disableContinuousMode,
    setNoiseThreshold 
  } = useVoiceInput({
    onResult: handleVoiceResult,
  });

  // Initialize vibecoding router
  useEffect(() => {
    vibeRouterRef.current = new VibecodingRouter({
      navigate: (path: string) => {
        navigate(path);
      },
      setViewMode: (mode: 'preview' | 'code' | 'history') => {
        console.log('[MrBlue] View mode changed:', mode);
      },
      handleUndo: () => {
        console.log('[MrBlue] Undo action');
      },
      handleRedo: () => {
        console.log('[MrBlue] Redo action');
      },
    });
    
    console.log('[MrBlue] Vibecoding router initialized');
  }, [navigate]);

  // Track page context
  useEffect(() => {
    breadcrumbTracker.track({
      userId: 0, // Will be set from auth context
      action: 'view',
      page: location,
      pageTitle: document.title,
      success: true
    });
  }, [location]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save conversation every 10 messages
  useEffect(() => {
    const saveConversation = async () => {
      if (messages.length > 1 && messages.length % 10 === 0 && messages.length !== messageCountRef.current) {
        messageCountRef.current = messages.length;
        
        try {
          const title = messages[1]?.content.slice(0, 50) + (messages[1]?.content.length > 50 ? '...' : '');
          
          if (currentConversationId) {
            // Update existing conversation
            await apiRequest(`/api/mrblue/conversations/${currentConversationId}`, {
              method: 'PUT',
              body: JSON.stringify({ title, lastMessageAt: new Date() }),
            });
          } else {
            // Create new conversation
            const response = await apiRequest('/api/mrblue/conversations', {
              method: 'POST',
              body: JSON.stringify({ title }),
            });
            
            if (response && typeof response === 'object' && 'id' in response) {
              setCurrentConversationId(response.id as number);
            }
          }

          // Save messages
          for (const msg of messages.slice(-10)) {
            if (msg.id !== '1') { // Skip welcome message
              await apiRequest('/api/mrblue/messages', {
                method: 'POST',
                body: JSON.stringify({
                  conversationId: currentConversationId,
                  role: msg.role,
                  content: msg.content,
                }),
              });
            }
          }
        } catch (error) {
          console.error('[MrBlueChat] Failed to save conversation:', error);
        }
      }
    };

    saveConversation();
  }, [messages.length, currentConversationId]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Track interaction
    breadcrumbTracker.track({
      userId: 0,
      action: 'input',
      page: location,
      target: 'mr-blue-chat',
      value: { messageLength: messageText.length },
      success: true
    });

    // First, route the message through vibecoding router
    if (vibeRouterRef.current) {
      try {
        const routeResult = await vibeRouterRef.current.route(messageText);
        console.log('[MrBlue] Route result:', routeResult);
        
        // If routing was successful and doesn't require AI
        if (routeResult.success && !routeResult.requiresAI) {
          // Show success toast
          toast({
            title: 'Success',
            description: routeResult.message,
          });
          
          // Add assistant confirmation message
          const confirmMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: routeResult.message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
          
          return; // Don't send to AI
        }
        
        // If routing failed or requires AI, continue to AI processing
        if (!routeResult.success && !routeResult.requiresAI) {
          // Show info that we're sending to AI
          console.log('[MrBlue] Routing failed, sending to AI:', routeResult.message);
        }
      } catch (error) {
        console.error('[MrBlue] Routing error:', error);
        // Continue to AI if routing fails
      }
    }

    // Send to AI for processing
    setIsLoading(true);

    try {
      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          pageContext: {
            page: location,
            breadcrumbs: breadcrumbTracker.getRecentActions(5)
          }
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[MrBlueChat] Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
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

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      await apiRequest(`/api/mrblue/messages/${editingMessageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editContent }),
      });

      setMessages(prev => prev.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content: editContent, isEdited: true, editedAt: new Date() }
          : msg
      ));

      setEditingMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error('[MrBlueChat] Edit error:', error);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const refreshReactions = async (messageId: string) => {
    try {
      const reactions = await apiRequest(`/api/mrblue/messages/${messageId}/reactions`);
      
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: reactions as any }
          : msg
      ));
    } catch (error) {
      console.error('[MrBlueChat] Refresh reactions error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => {
            if (message.deletedAt) {
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-deleted-${message.id}`}
                >
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted/50 opacity-50">
                    <p className="text-sm italic text-muted-foreground">Message deleted</p>
                  </div>
                </div>
              );
            }

            const isEditing = editingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.role}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="flex items-start gap-2">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="resize-none min-w-[300px]"
                            rows={3}
                            data-testid="input-edit-message"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={saveEdit}
                              data-testid="button-save-edit"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelEdit}
                              data-testid="button-cancel-edit"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.isEdited && (
                              <Badge variant="secondary" className="text-xs py-0 h-4">
                                edited
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && message.id !== '1' && (
                      <MessageActions
                        messageId={message.id}
                        isOwnMessage={message.role === 'user'}
                        onEdit={() => handleEditMessage(message.id, message.content)}
                        onDelete={() => handleDeleteMessage(message.id)}
                        onReactionAdded={() => refreshReactions(message.id)}
                      />
                    )}
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {message.reactions.map((reaction) => (
                        <Badge
                          key={reaction.emoji}
                          variant="secondary"
                          className="text-sm cursor-pointer hover-elevate"
                          data-testid={`reaction-${reaction.emoji}`}
                        >
                          {reaction.emoji} {reaction.count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start" data-testid="typing-indicator">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                  </div>
                  <span className="text-sm text-muted-foreground">Mr. Blue is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={continuousMode ? "default" : "outline"}
            onClick={continuousMode ? disableContinuousMode : enableContinuousMode}
            data-testid="button-toggle-continuous-voice"
          >
            {continuousMode ? (
              <>
                <ToggleRight className="w-4 h-4 mr-2" />
                Continuous Voice
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Continuous Voice
              </>
            )}
          </Button>
          {isListening && (
            <Badge variant="secondary" className="animate-pulse" data-testid="badge-listening">
              <Mic className="w-3 h-3 mr-1" />
              Listening...
            </Badge>
          )}
        </div>

        {/* Audio Quality Metrics */}
        {continuousMode && (
          <div className="flex flex-col gap-2 p-3 bg-muted rounded-md" data-testid="audio-quality-panel">
            <Label className="text-xs font-semibold">Audio Quality</Label>
            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" data-testid="metric-snr">
                SNR: {audioMetrics.snr.toFixed(1)} dB
              </Badge>
              <Badge variant="outline" data-testid="metric-thd">
                THD: {audioMetrics.thd.toFixed(2)}%
              </Badge>
              <Badge variant="outline" data-testid="metric-level">
                Level: {audioMetrics.level.toFixed(1)} dB
              </Badge>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="noise-threshold" className="text-xs">
                Noise Threshold: {noiseThreshold} dB
              </Label>
              <Slider
                id="noise-threshold"
                value={[noiseThreshold]}
                onValueChange={([value]) => setNoiseThreshold(value)}
                min={-60}
                max={-20}
                step={1}
                className="w-full"
                data-testid="slider-noise-threshold"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="resize-none"
            rows={2}
            data-testid="input-mr-blue-message"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
