import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Play, Heart, Download, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function MusicLibraryPage() {
  const [activeTab, setActiveTab] = useState("tango");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["/api/music", activeTab, searchQuery],
  });

  return (
    <PageLayout title="Music Library" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by artist, song, or orchestra..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tango" data-testid="tab-tango">Tango</TabsTrigger>
            <TabsTrigger value="vals" data-testid="tab-vals">Vals</TabsTrigger>
            <TabsTrigger value="milonga" data-testid="tab-milonga">Milonga</TabsTrigger>
            <TabsTrigger value="playlists" data-testid="tab-playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Loading music...</div>
            ) : tracks && Array.isArray(tracks) && tracks.length > 0 ? (
              <div className="space-y-2">
                {tracks.map((track: any) => (
                  <Card key={track.id} className="hover-elevate" data-testid={`track-${track.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <Button size="icon" variant="ghost" data-testid={`button-play-${track.id}`}>
                          <Play className="h-5 w-5" />
                        </Button>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{track.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist} {track.orchestra && `• ${track.orchestra}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {track.year && (
                            <Badge variant="outline">{track.year}</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{track.duration || "3:24"}</span>
                          <Button size="icon" variant="ghost" data-testid={`button-like-${track.id}`}>
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" data-testid={`button-download-${track.id}`}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Music className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No music found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>);
}
