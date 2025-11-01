import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, MessageCircle, UserPlus, Calendar, CheckCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";

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

  const getIcon = (type: string) => {
    const IconComponent = notificationIcons[type] || notificationIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <PageLayout title="Notifications" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center py-12">Loading notifications...</div>
        ) : notifications && Array.isArray(notifications) && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`hover-elevate cursor-pointer ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => !notification.read && markReadMutation.mutate(notification.id)}
                data-testid={`notification-${notification.id}`}
              >
                <CardContent className="flex items-start gap-4 pt-6">
                  {/* Icon */}
                  <div className={`shrink-0 rounded-full p-2 ${
                    notification.type === "like" ? "bg-red-100 text-red-600" :
                    notification.type === "comment" ? "bg-blue-100 text-blue-600" :
                    notification.type === "follow" ? "bg-green-100 text-green-600" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium mb-1">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="default" className="shrink-0">New</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm mt-2">
                We'll notify you when there's activity on your account
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
