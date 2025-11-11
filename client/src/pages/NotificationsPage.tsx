import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, Heart, MessageCircle, UserPlus, Calendar, CheckCheck, Trash2, Filter, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { useState } from "react";

const notificationIcons: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  friend_request: UserPlus,
  event_rsvp: Calendar,
  default: Bell,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notifications/${id}/read`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("/api/notifications/read-all", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notifications/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getIcon = (type: string) => {
    const IconComponent = notificationIcons[type] || notificationIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications && Array.isArray(notifications) 
    ? notifications.filter((notification: any) => {
        if (filterType === "unread") return !notification.read;
        if (filterType === "read") return notification.read;
        return true;
      })
    : [];

  const unreadCount = notifications && Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.read).length
    : 0;

  return (
    <PageLayout title="Notifications" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Notifications" fallbackRoute="/feed">
        <>
          <SEO
            title="Notifications"
            description="Stay updated with your tango community. View notifications about likes, comments, event updates, and friend requests."
          />

          {/* Hero Section */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&auto=format&fit=crop')`
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
                  Stay Connected
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  Your Notifications
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Keep track of your community interactions, event updates, and friend requests
                </p>

                {unreadCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8"
                  >
                    <Badge className="text-lg px-6 py-2 bg-primary text-primary-foreground">
                      {unreadCount} new {unreadCount === 1 ? 'notification' : 'notifications'}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
            {/* Filter and Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                    Activity Feed
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredNotifications.length > 0 
                      ? `${filteredNotifications.length} ${filteredNotifications.length === 1 ? 'notification' : 'notifications'}`
                      : 'No notifications to display'
                    }
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={unreadCount === 0 || markAllReadMutation.isPending}
                  className="gap-2"
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              </div>

              {/* Filter Tabs */}
              <Tabs value={filterType} onValueChange={(val) => setFilterType(val as any)}>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all" data-testid="tab-filter-all">
                    <Filter className="h-4 w-4 mr-2" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" data-testid="tab-filter-unread">
                    <Bell className="h-4 w-4 mr-2" />
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="read" data-testid="tab-filter-read">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Read
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Notifications List */}
            {isLoading ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="mx-auto h-12 w-12 mb-4 opacity-50 animate-pulse" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </motion.div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification: any, index: number) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card
                      className={`overflow-hidden hover-elevate ${
                        !notification.read ? "bg-primary/5 border-primary/20" : ""
                      }`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <motion.div
                            className={`shrink-0 rounded-full p-3 ${
                              notification.type === "like" ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" :
                              notification.type === "comment" ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" :
                              notification.type === "follow" ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" :
                              notification.type === "friend_request" ? "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400" :
                              notification.type === "event_rsvp" ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400" :
                              "bg-primary/10 text-primary"
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {getIcon(notification.type)}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-lg font-serif font-bold" data-testid={`text-notification-title-${notification.id}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="default" className="shrink-0" data-testid={`badge-new-${notification.id}`}>
                                  New
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-notification-message-${notification.id}`}>
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground" data-testid={`text-notification-time-${notification.id}`}>
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>

                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markReadMutation.mutate(notification.id)}
                                    disabled={markReadMutation.isPending}
                                    className="gap-2"
                                    data-testid={`button-mark-read-${notification.id}`}
                                  >
                                    <CheckCheck className="h-4 w-4" />
                                    Mark read
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  disabled={deleteNotificationMutation.isPending}
                                  className="gap-2 text-destructive hover:text-destructive"
                                  data-testid={`button-delete-${notification.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="py-16 text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Bell className="mx-auto h-16 w-16 mb-6 opacity-30" />
                    </motion.div>
                    <h3 className="text-2xl font-serif font-bold mb-3">
                      {filterType === "unread" ? "All caught up!" : 
                       filterType === "read" ? "No read notifications" :
                       "No notifications yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {filterType === "unread" ? "You've read all your notifications. Great job staying connected!" :
                       filterType === "read" ? "You haven't read any notifications yet." :
                       "We'll notify you when there's activity on your account. Start engaging with the community!"}
                    </p>
                    <Button className="gap-2" data-testid="button-explore-community">
                      Explore Community
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
