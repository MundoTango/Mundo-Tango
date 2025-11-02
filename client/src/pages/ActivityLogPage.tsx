import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, LogIn, Settings, Heart } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function ActivityLogPage() {
  const activities = [
    { id: 1, type: "login", text: "Logged in from New York, NY", time: "2 hours ago", icon: LogIn },
    { id: 2, type: "rsvp", text: "RSVP'd to Friday Night Milonga", time: "5 hours ago", icon: Calendar },
    { id: 3, type: "like", text: "Liked a post by Maria Santos", time: "1 day ago", icon: Heart },
    { id: 4, type: "settings", text: "Updated privacy settings", time: "2 days ago", icon: Settings },
    { id: 5, type: "location", text: "Changed location to Buenos Aires", time: "3 days ago", icon: MapPin }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Activity Log" fallbackRoute="/profile">
      <PageLayout title="Activity Log" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{activity.type}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
