import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  ArrowLeft, 
  Phone, 
  Video, 
  Image as ImageIcon,
  Smile,
  X,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const REACTION_EMOJIS = [
  { emoji: "❤️", name: "love", icon: Heart },
  { emoji: "👍", name: "like", icon: ThumbsUp },
  { emoji: "😂", name: "laugh", icon: Laugh },
  { emoji: "😢", name: "sad", icon: Frown },
  { emoji: "😮", name: "wow", icon: AlertCircle },
];

interface MessageReaction {
  userId: number;
  userName: string;
  reaction: string;
}

interface MediaAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderImage?: string;
  content: string;
  createdAt: string;
  reactions?: MessageReaction[];
  media?: MediaAttachment[];
}

export default function DirectMessages() {
  const { t } = useTranslation(["pages", "common"]);
  const { userId } = useParams<{ userId: string }>();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/direct", userId],
    refetchInterval: 3000,
  });

  const { data: user } = useQuery<{ id: number; name: string; profileImage?: string }>({
    queryKey: [`/api/users/${userId}`],
  });

  const sendMutation = useMutation({
    mutationFn: async ({ content, media }: { content: string; media?: File[] }) => {
      // For now, use JSON endpoint - media upload can be added later
      const response = await apiRequest('POST', '/api/messages/send-direct', {
        recipientId: parseInt(userId),
        content,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      setSelectedMedia([]);
      setMediaPreview([]);
      queryClient.invalidateQueries({ queryKey: ["/api/messages/direct", userId] });
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: number; reaction: string }) => {
      const response = await apiRequest('POST', '/api/messages/react', {
        messageId,
        reaction,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/direct", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() && selectedMedia.length === 0) return;
    sendMutation.mutate({ content: message, media: selectedMedia });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedMedia(prev => [...prev, ...files]);
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setMediaPreview(prev => [...prev, ev.target?.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          setMediaPreview(prev => [...prev, '']);
        }
      });
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleReaction = (messageId: number, reaction: string) => {
    reactionMutation.mutate({ messageId, reaction });
    setHoveredMessageId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{t('pages:messages.direct.loadingConversation', 'Loading conversation...')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Link href="/messages">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href={`/profile/${userId}`}>
            <div className="flex items-center gap-3 hover-elevate rounded-lg p-1 -m-1 cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold" data-testid="text-recipient-name">{user?.name || "User"}</h2>
                {isTyping && (
                  <p className="text-xs text-muted-foreground">{t('pages:messages.direct.typing', 'typing...')}</p>
                )}
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-call">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-video">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-more">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {(!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="text-2xl">{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold mb-1">{user?.name}</h3>
              <p className="text-muted-foreground text-sm">
                {t('pages:messages.direct.startConversation', 'Start a conversation with {{name}}', { name: user?.name })}
              </p>
            </div>
          )}
          
          {messages?.map((msg: Message, index: number) => {
            const isOwn = msg.senderId !== parseInt(userId);
            const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
            const isHovered = hoveredMessageId === msg.id;
            
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 group relative",
                  isOwn ? "justify-end" : "justify-start"
                )}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                data-testid={`message-bubble-${msg.id}`}
              >
                {!isOwn && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderImage} />
                    <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && !showAvatar && <div className="w-8" />}
                
                <div className="relative max-w-[70%]">
                  {/* Reaction Picker */}
                  <div 
                    className={cn(
                      "absolute -top-8 flex items-center gap-1 bg-card border rounded-full px-2 py-1 shadow-lg transition-opacity z-10",
                      isOwn ? "right-0" : "left-0",
                      isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    {REACTION_EMOJIS.map((r) => (
                      <Tooltip key={r.name}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleReaction(msg.id, r.emoji)}
                            className="text-lg hover:scale-125 transition-transform p-1"
                            data-testid={`button-react-${r.name}-${msg.id}`}
                          >
                            {r.emoji}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">{r.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {/* Media Attachments */}
                    {msg.media && msg.media.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {msg.media.map((attachment) => (
                          <div key={attachment.id}>
                            {attachment.type === "image" ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="rounded-lg max-w-full max-h-64 object-cover"
                                data-testid={`message-image-${attachment.id}`}
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-background/10 rounded-lg">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm truncate">{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.content && <p className="text-sm">{msg.content}</p>}
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </p>
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div 
                      className={cn(
                        "absolute -bottom-3 flex items-center gap-0.5 bg-card border rounded-full px-1.5 py-0.5 shadow-sm",
                        isOwn ? "right-2" : "left-2"
                      )}
                    >
                      {Array.from(new Set(msg.reactions.map(r => r.reaction))).slice(0, 3).map((reaction, i) => (
                        <span key={i} className="text-sm">{reaction}</span>
                      ))}
                      {msg.reactions.length > 1 && (
                        <span className="text-xs text-muted-foreground ml-0.5">
                          {msg.reactions.length}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Media Preview */}
      {selectedMedia.length > 0 && (
        <div className="border-t bg-muted/50 p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {selectedMedia.map((file, index) => (
              <div key={index} className="relative group flex-shrink-0">
                {file.type.startsWith('image/') && mediaPreview[index] ? (
                  <img
                    src={mediaPreview[index]}
                    alt={file.name}
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-lg border">
                    <Paperclip className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  data-testid={`button-remove-media-${index}`}
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-xs text-muted-foreground truncate max-w-20 mt-1">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            multiple
            className="hidden"
            data-testid="input-file"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-attach-menu">
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-attach-image"
              >
                <ImageIcon className="h-4 w-4" />
                {t('pages:messages.direct.photoOrVideo', 'Photo or Video')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
                    fileInputRef.current.click();
                    fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx';
                  }
                }}
                data-testid="button-attach-file"
              >
                <Paperclip className="h-4 w-4" />
                {t('pages:messages.direct.document', 'Document')}
              </Button>
            </PopoverContent>
          </Popover>
          
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('pages:messages.direct.typePlaceholder', 'Type a message...')}
              className="min-h-[2.5rem]"
              data-testid="input-message"
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && selectedMedia.length === 0) || sendMutation.isPending}
            size="icon"
            data-testid="button-send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
