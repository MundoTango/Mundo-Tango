import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "wouter";
import { useConversations, useConversation, useSendMessage, useMessagesRealtime, useMarkMessagesAsRead, useCreateConversation } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Plus, CheckCircle, Loader2, Users, Search, X, Mail, Phone, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function RichTextMessage({ content, isOwn }: { content: string; isOwn: boolean }) {
  const parsed = useMemo(() => {
    const isPROContactForm = content.includes('**PRO Page Contact Form**');
    
    if (isPROContactForm) {
      const lines = content.split('\n');
      let fromName = '';
      let email = '';
      let phone = '';
      let messageBody = '';
      let inBody = false;
      
      for (const line of lines) {
        if (line.startsWith('**From:**')) {
          fromName = line.replace('**From:**', '').trim();
        } else if (line.startsWith('**Email:**')) {
          email = line.replace('**Email:**', '').trim();
        } else if (line.startsWith('**Phone:**')) {
          phone = line.replace('**Phone:**', '').trim();
        } else if (line === '---') {
          inBody = true;
        } else if (inBody && line.trim()) {
          messageBody += (messageBody ? '\n' : '') + line;
        }
      }
      
      return {
        type: 'pro-contact' as const,
        fromName: escapeHtml(fromName),
        email: escapeHtml(email),
        phone: escapeHtml(phone),
        messageBody
      };
    }
    
    const escaped = escapeHtml(content);
    const processed = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted/50 text-xs font-mono">$1</code>');
    
    return { type: 'text' as const, html: processed };
  }, [content]);
  
  if (parsed.type === 'pro-contact') {
    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-2 text-xs font-medium ${isOwn ? 'text-primary-foreground/80' : 'text-primary'}`}>
          <Mail className="w-3.5 h-3.5" />
          <span>PRO Page Contact</span>
        </div>
        
        <div className={`space-y-1.5 text-sm ${isOwn ? 'text-primary-foreground/90' : 'text-foreground/80'}`}>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 opacity-60" />
            <span className="font-medium">{parsed.fromName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 opacity-60" />
            <a href={`mailto:${parsed.email}`} className={`hover:underline ${isOwn ? 'text-primary-foreground' : 'text-primary'}`}>
              {parsed.email}
            </a>
          </div>
          {parsed.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 opacity-60" />
              <a href={`tel:${parsed.phone}`} className={`hover:underline ${isOwn ? 'text-primary-foreground' : 'text-primary'}`}>
                {parsed.phone}
              </a>
            </div>
          )}
        </div>
        
        <div className={`pt-2 border-t ${isOwn ? 'border-primary-foreground/20' : 'border-border'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{parsed.messageBody}</p>
        </div>
      </div>
    );
  }
  
  return (
    <p 
      className="text-sm leading-relaxed whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: parsed.html }}
    />
  );
}

export default function MessagesPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const { data: conversations, isLoading } = useConversations();
  const filteredConversations = conversations?.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  useEffect(() => {
    if (!selectedConversationId && filteredConversations.length > 0 && !isLoading) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId, isLoading]);

  const handleNewConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowNewChatDialog(false);
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:messages.errorBoundary', 'Messages')} fallbackRoute="/feed">
      <PageLayout title={t('pages:messages.title', 'Messages')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:messages.seoTitle', 'Messages')}
            description={t('pages:messages.seoDescription', 'Stay connected with your tango community through private messaging. Chat with dancers, organize events, and build lasting friendships.')}
          />
          <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[calc(100vh-12rem)] md:h-[700px]"
            >
              <div className="h-full flex rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-3xl bg-card/30">
                {/* Sidebar */}
                <div className="flex-1 border-r border-white/5 flex flex-col max-w-[300px] md:max-w-[35%] bg-card/40">
                  {/* Header with New Chat button */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
                    <h2 className="font-serif text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {t('pages:messages.chats', 'Chats')}
                    </h2>
                    <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          data-testid="button-new-chat"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t('pages:messages.newConversation', 'Start New Conversation')}</DialogTitle>
                        </DialogHeader>
                        <NewChatSearch onSelect={handleNewConversation} onClose={() => setShowNewChatDialog(false)} />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Search Input */}
                  <div className="p-3 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder={t('pages:messages.searchChats', 'Search chats...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/30 border-none"
                        data-testid="input-search-chats"
                      />
                      {searchQuery && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery("")}
                          data-testid="button-clear-search"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Conversation List */}
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
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-2 w-16" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      <div className="p-3 space-y-1">
                        {filteredConversations.map((conversation, index) => (
                          <motion.button
                            key={conversation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedConversationId(conversation.id)}
                            data-testid={`button-conversation-${conversation.id}`}
                            className={`w-full p-3 rounded-2xl hover-elevate active-elevate-2 text-left transition-all duration-200 ${
                              selectedConversationId === conversation.id 
                                ? "bg-primary/10 ring-1 ring-primary/20 shadow-inner" 
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-background">
                                  <AvatarImage src={conversation.avatar || undefined} />
                                  <AvatarFallback className="text-lg font-semibold bg-primary/5">
                                    {conversation.name?.charAt(0)?.toUpperCase() || "C"}
                                  </AvatarFallback>
                                </Avatar>
                                {conversation.isRead === false && (
                                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-card flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <p className={`text-sm font-bold truncate ${selectedConversationId === conversation.id ? "text-primary" : "text-foreground"}`}>
                                    {conversation.name || t('pages:messages.defaultConversationName', "Conversation")}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                                    {(conversation.timestamp || conversation.lastMessageTime) ? new Date(conversation.timestamp || conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className={`text-[11px] truncate ${conversation.isRead === false ? "text-foreground font-semibold" : "text-muted-foreground/80"}`}>
                                  {conversation.lastMessage || t('pages:messages.noMessages', 'No messages yet')}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="p-4 rounded-full bg-muted/30">
                          <MessageCircle className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                        <h3 className="text-sm font-serif font-bold text-muted-foreground/40">
                          {searchQuery ? t('pages:messages.noResults', 'No matching chats') : t('pages:messages.noChats', 'No active chats')}
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowNewChatDialog(true)}
                          data-testid="button-start-first-chat"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t('pages:messages.startChat', 'Start a chat')}
                        </Button>
                      </motion.div>
                    )}
                  </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                  {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                  ) : (
                    <motion.div 
                      className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                        <MessageCircle className="w-24 h-24 text-primary/10 relative z-10" />
                      </div>
                      <div className="max-w-xs">
                        <h3 className="text-2xl font-serif font-bold text-muted-foreground/30 mb-2">
                          {t('pages:messages.selectTitle', 'Your Inbox')}
                        </h3>
                        <p className="text-sm text-muted-foreground/40 leading-relaxed">
                          {t('pages:messages.selectDesc', 'Select a conversation from the sidebar to start chatting with your tango community.')}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowNewChatDialog(true)}
                        data-testid="button-new-chat-main"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('pages:messages.newConversation', 'Start New Conversation')}
                      </Button>
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

function NewChatSearch({ onSelect, onClose }: { onSelect: (id: string) => void; onClose: () => void }) {
  const { t } = useTranslation(["pages", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const createConversation = useCreateConversation();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
        headers,
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSelectUser = async (userId: number) => {
    try {
      const result = await createConversation.mutateAsync({ 
        participantIds: [String(userId)], 
        isGroup: false 
      });
      onSelect(result.id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder={t('pages:messages.searchUsers', 'Search users by name...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          autoFocus
          data-testid="input-search-users"
        />
      </div>

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : searchQuery.length < 2 ? (
          <div className="text-center text-muted-foreground/60 py-8">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('pages:messages.typeToSearch', 'Type at least 2 characters to search')}</p>
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-1 p-2">
            {users.map((user: any) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                disabled={createConversation.isPending}
                data-testid={`button-select-user-${user.id}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover-elevate active-elevate-2 text-left transition-all"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground/60 truncate">@{user.username}</p>
                  )}
                </div>
                {createConversation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground/60 py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('pages:messages.noUsersFound', 'No users found')}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ConversationView({ conversationId }: { conversationId: string }) {
  const { t } = useTranslation(["pages", "common"]);
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

  return (
    <motion.div 
      className="h-full flex flex-col bg-background/50 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center justify-between gap-2 bg-card/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarFallback>
              <Users className="w-5 h-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm leading-none mb-1">
              {t('pages:messages.conversation', 'Conversation')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
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
              const isOwn = String(msg.senderId) === String(user?.id);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-border">
                    <AvatarFallback className="text-[10px]">
                      {isOwn ? user?.name?.charAt(0) : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1.5 max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}> 
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
                        isOwn 
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-none" 
                          : "bg-card border rounded-tl-none"
                      }`}
                    >
                      <RichTextMessage content={msg.content} isOwn={isOwn} />
                    </motion.div>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {isOwn && <CheckCircle className="w-3 h-3 text-primary/40" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <motion.div 
            className="h-full flex flex-col items-center justify-center text-center space-y-4" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 rounded-full bg-primary/5">
              <MessageCircle className="w-12 h-12 text-primary/20" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-muted-foreground/50">
                {t('pages:messages.noMessagesYet', 'No messages yet')}
              </h3>
              <p className="text-sm text-muted-foreground/40">{t('pages:messages.startConversation', 'Start a conversation to see messages here')}</p>
            </div>
          </motion.div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-card/50 backdrop-blur-xl">
        <form onSubmit={handleSend} className="relative flex gap-2 items-center max-w-4xl mx-auto">
          <div className="relative flex-1 group">
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder={t('pages:messages.typeMessage', 'Type a message...')}
              className="resize-none min-h-[44px] max-h-[120px] rounded-2xl py-3 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all duration-200"
              rows={1}
              data-testid="input-message"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
            className="rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
            data-testid="button-send-message"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-center"
            >
              <p className="text-[10px] text-primary font-medium animate-pulse">
                {t('pages:messages.someoneTyping', 'Someone is typing...')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
