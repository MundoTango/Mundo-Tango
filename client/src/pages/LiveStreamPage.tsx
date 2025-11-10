import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Users, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function LiveStreamPage() {
  const { data: streams, isLoading } = useQuery({
    queryKey: ["/api/livestreams"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Live Streams" fallbackRoute="/feed">
      <PageLayout title="Live Streams" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        {isLoading ? (
          <div className="text-center py-12">Loading streams...</div>
        ) : streams && Array.isArray(streams) && streams.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {streams.filter((s: any) => s.isLive).map((stream: any) => (
                <Card key={stream.id} className="hover-elevate border-primary" data-testid={`stream-live-${stream.id}`}>
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img src={stream.thumbnail} alt={stream.title} className="object-cover w-full h-full" />
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        LIVE
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {stream.viewers || 0}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{stream.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{stream.host}</p>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/live-stream/${stream.id}`}>
                      <Button className="w-full" data-testid={`button-watch-${stream.id}`}>
                        <Radio className="h-4 w-4 mr-2" />
                        Watch Live
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 mt-8">Upcoming Streams</h2>
              <div className="space-y-4">
                {streams.filter((s: any) => !s.isLive).map((stream: any) => (
                  <Link key={stream.id} href={`/live-stream/${stream.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`stream-upcoming-${stream.id}`}>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="aspect-video md:aspect-square bg-muted overflow-hidden">
                          <img src={stream.thumbnail} alt={stream.title} className="object-cover w-full h-full" />
                        </div>
                        <div className="md:col-span-3 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{stream.title}</h3>
                              <p className="text-sm text-muted-foreground">{stream.host}</p>
                            </div>
                            <Badge variant="outline">Scheduled</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {stream.scheduledDate}
                            </div>
                            {stream.registrations && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {stream.registrations} registered
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-remind-${stream.id}`} onClick={(e) => e.preventDefault()}>
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Radio className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No live streams at the moment</p>
              <p className="text-sm mt-2">Check back later for upcoming events</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
