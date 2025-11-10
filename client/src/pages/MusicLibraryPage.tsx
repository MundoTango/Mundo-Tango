import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Music, Play, Heart, Download, Search, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export default function MusicLibraryPage() {
  const [activeTab, setActiveTab] = useState("tango");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35); // Mock progress %

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["/api/music", activeTab, searchQuery],
  });

  const handlePlayTrack = (track: any) => {
    if (currentlyPlaying?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(track);
      setIsPlaying(true);
      setPlaybackProgress(0);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Music Library</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Explore our curated collection of tango music
          </p>
        </div>
        

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
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handlePlayTrack(track)}
                          data-testid={`button-play-${track.id}`}
                        >
                          {currentlyPlaying?.id === track.id && isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
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

        {/* Sticky Audio Player */}
        {currentlyPlaying && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center gap-4 p-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" data-testid="player-track-title">{currentlyPlaying.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {currentlyPlaying.artist}
                      {currentlyPlaying.orchestra && ` • ${currentlyPlaying.orchestra}`}
                    </p>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" data-testid="button-prev-track">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={() => setIsPlaying(!isPlaying)}
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button size="icon" variant="ghost" data-testid="button-next-track">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-xs text-muted-foreground">1:23</span>
                    <Progress value={playbackProgress} className="flex-1" />
                    <span className="text-xs text-muted-foreground">3:24</span>
                  </div>
                </div>

                {/* Volume & Actions */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Button size="icon" variant="ghost" data-testid="button-like-player">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Progress value={75} className="w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
