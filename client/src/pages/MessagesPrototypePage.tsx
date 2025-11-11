import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Phone, Video, Star, Archive } from "lucide-react";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Marco DJ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    lastMessage: "See you at the milonga tonight!",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Isabella Dance",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
    lastMessage: "Thanks for the workshop recommendation",
    timestamp: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Carlos Teacher",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    lastMessage: "Can you send me the music playlist?",
    timestamp: "3h ago",
    unread: 0,
    online: false,
  },
];

const MESSAGES = [
  {
    id: 1,
    sender: "other",
    content: "Hey! Are you coming to La Ideal tonight?",
    timestamp: "8:30 PM",
  },
  {
    id: 2,
    sender: "me",
    content: "Yes! Looking forward to it. What time does it start?",
    timestamp: "8:32 PM",
  },
  {
    id: 3,
    sender: "other",
    content: "It starts at 9 PM. I'll be playing some classic Di Sarli 🎵",
    timestamp: "8:35 PM",
  },
  {
    id: 4,
    sender: "me",
    content: "Perfect! See you there 💃",
    timestamp: "8:36 PM",
  },
];

export default function MessagesPrototypePage() {
  const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-serif font-bold">Messages</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid md:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="p-4 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {CONVERSATIONS.map((conv) => (
                <motion.button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-3 rounded-lg text-left hover-elevate ${
                    selectedChat.id === conv.id ? 'bg-accent' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>{conv.name[0]}</AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate">{conv.name}</span>
                        {conv.unread > 0 && (
                          <Badge className="ml-2 shrink-0">{conv.unread}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {MESSAGES.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-4">
                      {message.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setMessageInput('');
                    }
                  }}
                />
                <Button>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
