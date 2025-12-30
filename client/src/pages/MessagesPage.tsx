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
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function MessagesPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <SelfHealingErrorBoundary pageName={t('pages:messages.errorBoundary', 'Messages')} fallbackRoute="/feed">
      <PageLayout title={t('pages:messages.title', 'Messages')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:messages.seoTitle', 'Messages')}
            description={t('pages:messages.seoDescription', 'Stay connected with your tango community through private messaging. Chat with dancers, organize events, and build lasting friendships.')}
          />
          <div className="max-w-7xl mx-auto px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-[calc(100vh-45rem)] md:h-[600px] flex rounded-2xl overflow-hidden border shadow-lg">
                <div className="flex-1 border-r flex flex-col max-w-[33.333%] bg-card">
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
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className={`w-full p-4 rounded-xl hover-elevate active-elevate-2 text-left transition-colors ${
                              selectedConversationId === conversation.id ? "bg-accent" : ""
                            }`}
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
                                  <p className="font-semibold truncate">
                                    {conversation.name || t('pages:messages.defaultConversationName', "Conversation")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="h-full flex flex-col items-center justify-center text-center space-y-4" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <MessageCircle className="w-16 h-16 text-muted-foreground opacity-30" />
                        <div>
                          <h3 className="text-xl font-serif font-bold text-muted-foreground">
                            {t('pages:messages.selectConversation', 'Select a conversation')}
                          </h3>
                        </div>
                      </motion.div>
                    )}
                  </ScrollArea>
                </div>
                <div className="flex-[2] bg-background">
                  {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                  ) : (
                    <motion.div 
                      className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <MessageCircle className="w-16 h-16 text-muted-foreground opacity-30" />
                      <div>
                        <h3 className="text-xl font-serif font-bold text-muted-foreground">
                          {t('pages:messages.selectConversation', 'Select a conversation')}
                        </h3>
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

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0" />
                  <div className={`flex flex-col gap-1 max-w-lg ${isOwn ? "items-end" : "items-start"}`}> 
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-2xl p-4 ${
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </motion.div>
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
            <MessageCircle className="w-16 h-16 text-muted-foreground opacity-30" />
            <div>
              <h3 className="text-lg font-serif font-bold text-muted-foreground">
                No messages yet
              </h3>
            </div>
          </motion.div>
        )}
      </ScrollArea>
      <form onSubmit={handleSend} className="p-6 border-t bg-card">
        <div className="flex gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="resize-none min-h-[52px] max-h-[120px] rounded-xl"
            rows={1}
            data-testid="input-message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            className="h-[52px] w-[52px]"
            data-testid="button-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}