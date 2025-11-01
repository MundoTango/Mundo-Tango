import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";

export default function MediaGalleryPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: media, isLoading } = useQuery({
    queryKey: ["/api/media", activeTab],
  });

  return (
    <PageLayout title="Media Gallery" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
            <TabsTrigger value="videos" data-testid="tab-videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Loading media...</div>
            ) : media && Array.isArray(media) && media.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {media.map((item: any) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover-elevate cursor-pointer"
                    data-testid={`media-${item.id}`}
                  >
                    <div className="relative aspect-square bg-muted">
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.caption}
                        className="object-cover w-full h-full"
                      />
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Video className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center gap-3 text-white text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {item.likes || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {item.comments || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Image className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No media found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>);
}
