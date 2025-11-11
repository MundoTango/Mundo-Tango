import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Heart, MessageCircle, UserPlus, Calendar, Users, CheckCheck, Trash2 } from "lucide-react";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "like",
    actor: {
      name: "Marco DJ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    content: "liked your post",
    timestamp: "5m ago",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    actor: {
      name: "Isabella Dance",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
    },
    content: "commented on your post: \"Amazing performance!\"",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: 3,
    type: "friend",
    actor: {
      name: "Carlos Teacher",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    content: "sent you a friend request",
    timestamp: "2h ago",
    read: false,
  },
  {
    id: 4,
    type: "event",
    actor: {
      name: "Sofia Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    },
    content: "invited you to Buenos Aires Tango Festival 2025",
    timestamp: "3h ago",
    read: true,
  },
  {
    id: 5,
    type: "group",
    actor: {
      name: "Diego Organizer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    },
    content: "added you to Professional Tango Teachers group",
    timestamp: "1d ago",
    read: true,
  },
];

export default function NotificationsPrototypePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header - Editorial Style */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Bell className="w-3 h-3 mr-1.5" />
              Stay Updated
            </Badge>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-5xl md:text-6xl font-serif text-white font-bold leading-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge className="text-lg px-3 py-1">{unreadCount}</Badge>
              )}
            </div>
            
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Stay connected with your community updates
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Action Bar */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex justify-end"
            >
              <Button onClick={markAllRead} variant="outline">
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification, index) => (
                <NotificationCard key={notification.id} notification={notification} index={index} />
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {notifications.filter(n => !n.read).length > 0 ? (
                notifications.filter(n => !n.read).map((notification, index) => (
                  <NotificationCard key={notification.id} notification={notification} index={index} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <CheckCheck className="mx-auto h-16 w-16 mb-6 opacity-30" />
                    <h3 className="text-xl font-serif font-bold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">You have no unread notifications</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="likes" className="space-y-4">
              {notifications.filter(n => n.type === "like").map((notification, index) => (
                <NotificationCard key={notification.id} notification={notification} index={index} />
              ))}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {notifications.filter(n => n.type === "comment").map((notification, index) => (
                <NotificationCard key={notification.id} notification={notification} index={index} />
              ))}
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              {notifications.filter(n => ["friend", "event", "group"].includes(n.type)).map((notification, index) => (
                <NotificationCard key={notification.id} notification={notification} index={index} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notification, index }: { notification: typeof NOTIFICATIONS[0]; index: number }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-red-500" />;
      case "comment": return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "friend": return <UserPlus className="w-5 h-5 text-green-500" />;
      case "event": return <Calendar className="w-5 h-5 text-purple-500" />;
      case "group": return <Users className="w-5 h-5 text-cyan-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`hover-elevate ${!notification.read ? 'bg-accent/30 border-primary/20' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>

            {/* Avatar */}
            <Avatar className="shrink-0 h-12 w-12">
              <AvatarImage src={notification.actor.avatar} />
              <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-base mb-1">
                <span className="font-semibold">{notification.actor.name}</span>{" "}
                <span className="text-muted-foreground">{notification.content}</span>
              </p>
              <p className="text-sm text-muted-foreground">{notification.timestamp}</p>

              {/* Action Buttons for certain types */}
              {notification.type === "friend" && !notification.read && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm">Accept</Button>
                  <Button size="sm" variant="outline">Decline</Button>
                </div>
              )}
              {notification.type === "event" && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm">View Event</Button>
                </div>
              )}
            </div>

            {/* Unread indicator & actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!notification.read && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
              )}
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
