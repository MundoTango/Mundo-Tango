import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  useConversations, 
  useConversation, 
  useSendMessage,
  useMessagesRealtime,
  useMarkMessagesAsRead 
} from "@/hooks/useMessages";
import {
  useConnectedChannels,
  useUnreadCount,
  CHANNEL_CONFIG,
  type MessageChannel
} from "@/hooks/useMessageChannels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, MessageCircle, Users, Heart, Search, PenSquare, Settings, Mail, Inbox } from "lucide-react";
import { SiFacebook, SiWhatsapp, SiGmail, SiInstagram } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { ChannelSettingsPanel } from "@/components/messages/ChannelSettingsPanel";

export default function MessagesPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannel, setActiveChannel] = useState<'all' | MessageChannel>('all');
  const [showSettings, setShowSettings] = useState(false);
  const { data: conversations, isLoading } = useConversations();
  const { data: connectedChannels } = useConnectedChannels();
  const { data: unreadCounts } = useUnreadCount();
  
  const connectedChannelsList = connectedChannels?.filter(c => c.isActive) || [];
  const hasConnectedChannels = connectedChannelsList.length > 0;
  
  // Filter conversations by search query
  const filteredConversations = conversations?.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <SelfHealingErrorBoundary pageName={t('pages:messages.errorBoundary', 'Messages')} fallbackRoute="/feed">
      <PageLayout title={t('pages:messages.title', 'Messages')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:messages.seoTitle', 'Messages')}
            description={t('pages:messages.seoDescription', 'Stay connected with your tango community through private messaging. Chat with dancers, organize events, and build lasting friendships.')}
          />

          {/* Hero Section - 16:9 Editorial */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden mb-12">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&auto=format&fit=crop&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-6"
              >
                <Badge 
                  variant="outline" 
                  className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm"
                  data-testid="badge-hero-category"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {t('pages:messages.stayConnected', 'Stay Connected')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight">
                  {t('pages:messages.heroTitle', 'Your Conversations')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:messages.heroSubtitle', 'Build meaningful connections with dancers around the world')}
                </p>

                <div className="flex items-center justify-center gap-8 mt-8">
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-3xl font-serif font-bold text-white">
                      {conversations?.length || 0}
                    </div>
                    <div className="text-sm text-white/70">{t('pages:messages.activeChats', 'Active Chats')}</div>
                  </motion.div>

                  <div className="h-12 w-px bg-white/30" />

                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-3xl font-serif font-bold text-white">
                      <Users className="w-8 h-8 mx-auto" />
                    </div>
                    <div className="text-sm text-white/70">{t('common:community', 'Community')}</div>
                  </motion.div>

                  <div className="h-12 w-px bg-white/30" />

                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-3xl font-serif font-bold text-white">
                      <Heart className="w-8 h-8 mx-auto" />
                    </div>
                    <div className="text-sm text-white/70">{t('common:connections', 'Connections')}</div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-[calc(100vh-45rem)] md:h-[600px] flex rounded-2xl overflow-hidden border shadow-lg">
                {/* Left Panel - Conversation List (1/3 width) */}
                <div className="flex-1 border-r flex flex-col max-w-[33.333%] bg-card">
                  <div className="p-4 border-b space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-serif font-bold" data-testid="heading-messages">
                        {t('pages:messages.messagesTitle', 'Messages')}
                      </h2>
                      <div className="flex items-center gap-1">
                        <Dialog open={showSettings} onOpenChange={setShowSettings}>
                          <DialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              data-testid="button-channel-settings"
                              title={t('pages:messages.channelSettings', 'Channel settings')}
                            >
                              <Settings className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>{t('pages:messages.messageChannels', 'Message Channels')}</DialogTitle>
                            </DialogHeader>
                            <ChannelSettingsPanel />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          data-testid="button-new-message"
                          title={t('pages:messages.newConversation', 'New conversation')}
                        >
                          <PenSquare className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Channel Tabs */}
                    <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as typeof activeChannel)} className="w-full">
                      <TabsList className="w-full grid grid-cols-6 h-8">
                        <TabsTrigger value="all" className="text-xs px-2" data-testid="tab-channel-all">
                          <Inbox className="w-3 h-3 mr-1" />
                          {t('common:all', 'All')}
                        </TabsTrigger>
                        <TabsTrigger value="mt" className="text-xs px-2" data-testid="tab-channel-mt">
                          <MessageCircle className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="gmail" className="text-xs px-2" data-testid="tab-channel-gmail">
                          <SiGmail className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="text-xs px-2" data-testid="tab-channel-facebook">
                          <SiFacebook className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="instagram" className="text-xs px-2" data-testid="tab-channel-instagram">
                          <SiInstagram className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp" className="text-xs px-2" data-testid="tab-channel-whatsapp">
                          <SiWhatsapp className="w-3 h-3" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('pages:messages.searchPlaceholder', 'Search conversations...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        data-testid="input-search-messages"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {t('pages:messages.conversationCount', { 
                          current: filteredConversations.length, 
                          total: conversations?.length || 0,
                          defaultValue: `${filteredConversations.length} of ${conversations?.length || 0} conversation${conversations?.length !== 1 ? 's' : ''}`
                        })}
                      </span>
                      {hasConnectedChannels && (
                        <Badge variant="outline" className="text-[10px]">
                          {t('pages:messages.connectedChannelsCount', {
                            count: connectedChannelsList.length,
                            defaultValue: `${connectedChannelsList.length} channel${connectedChannelsList.length !== 1 ? 's' : ''} connected`
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {isLoading ? (
                      <div className="p-6 space-y-6">
                        {[1, 2, 3].map((i) => (
                          <motion.div 
                            key={i} 
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Skeleton className="h-14 w-14 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      <div className="p-4 space-y-2">
                        {filteredConversations.map((conversation, index) => (
                          <motion.button
                            key={conversation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className={`w-full p-4 rounded-xl hover-elevate active-elevate-2 text-left transition-colors ${
                              selectedConversationId === conversation.id ? "bg-accent" : ""
                            }`}
                            data-testid={`button-conversation-${conversation.id}`}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={conversation.avatar || undefined} />
                                <AvatarFallback className="text-lg font-semibold">
                                  {conversation.name?.charAt(0)?.toUpperCase() || "C"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="font-semibold truncate" data-testid={`text-conversation-name-${conversation.id}`}>
                                    {conversation.name || t('pages:messages.defaultConversationName', "Conversation")}
                                  </p>
                                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                                    <Badge 
                                      variant="default" 
                                      className="ml-auto flex-shrink-0"
                                      data-testid={`badge-unread-${conversation.id}`}
                                    >
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                {conversation.lastMessage && (
                                  <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${conversation.id}`}>
                                    {conversation.lastMessage}
                                  </p>
                                )}
                                {conversation.lastMessageAt && (
                                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-timestamp-${conversation.id}`}>
                                    {safeDateDistance(conversation.lastMessageAt, {
                                      addSuffix: true,
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="p-8 text-center space-y-4" 
                        data-testid="text-no-conversations"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                        <div>
                          <p className="font-medium text-muted-foreground">{t('pages:messages.noMessages', 'No messages yet')}</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">
                            {t('pages:messages.noMessagesDescription', 'Start connecting with dancers')}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </ScrollArea>
                </div>

                {/* Right Panel - Active Conversation (2/3 width) */}
                <div className="flex-[2] bg-background">
                  {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                  ) : (
                    <motion.div 
                      className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4" 
                      data-testid="text-select-conversation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <MessageCircle className="w-16 h-16 text-muted-foreground opacity-30" />
                      <div>
                        <h3 className="text-xl font-serif font-bold text-muted-foreground">
                          {t('pages:messages.selectConversation', 'Select a conversation')}
                        </h3>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          {t('pages:messages.selectConversationDescription', 'Choose a conversation from the list to start messaging')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

function ConversationView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { data: messages, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { typingUsers, broadcastTyping } = useMessagesRealtime(conversationId);
  const markAsRead = useMarkMessagesAsRead(conversationId);

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate();
    }
  }, [conversationId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    broadcastTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false);
    }, 500);
  }, [broadcastTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync(message.trim());
      setMessage("");
      broadcastTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const conversationName = t('pages:messages.defaultConversationName', "Conversation");

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */}
      <div className="p-6 border-b flex items-center gap-4 bg-card" data-testid="header-conversation">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg font-semibold">
            {conversationName.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-serif font-bold" data-testid="text-conversation-header-name">
            {conversationName}
          </h3>
          <p className="text-sm text-muted-foreground">{t('pages:messages.activeNow', 'Active now')}</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-8">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                className="flex gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-20 w-80 rounded-2xl" />
              </motion.div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isOwn = String(msg.sender_id) === String(user?.id);
              const senderName = (msg as any).profiles?.username || "User";
              const senderAvatar = (msg as any).profiles?.avatar_url;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 ${isOwn ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={senderAvatar || undefined} />
                    <AvatarFallback className="text-sm font-semibold">
                      {senderName.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-lg ${isOwn ? "items-end" : "items-start"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-2xl p-4 ${
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                      data-testid={`bubble-${msg.id}`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </motion.div>
                    <p 
                      className="text-xs text-muted-foreground px-2" 
                      data-testid={`timestamp-${msg.id}`}
                    >
                      {safeDateDistance(msg.created_at, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {typingUsers.length > 0 && (
              <motion.div 
                className="flex gap-4" 
                data-testid="typing-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="text-sm font-semibold">
                    {typingUsers[0].username.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="max-w-md rounded-2xl p-4 bg-muted">
                    <p className="text-sm text-muted-foreground italic">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <motion.div 
            className="h-full flex flex-col items-center justify-center text-center space-y-4" 
            data-testid="text-no-messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageCircle className="w-16 h-16 text-muted-foreground opacity-30" />
            <div>
              <h3 className="text-lg font-serif font-bold text-muted-foreground">
                No messages yet
              </h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start the conversation!
              </p>
            </div>
          </motion.div>
        )}
      </ScrollArea>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-6 border-t bg-card">
        <div className="flex gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            disabled={sendMessage.isPending}
            className="resize-none min-h-[52px] max-h-[120px] rounded-xl"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMessage.isPending}
            data-testid="button-send"
            className="h-[52px] w-[52px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </motion.div>
  );
}
