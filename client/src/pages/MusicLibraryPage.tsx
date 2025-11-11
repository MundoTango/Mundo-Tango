import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Music, Play, Heart, Download, Search, Pause, SkipBack, SkipForward, Volume2, Music2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";

export default function MusicLibraryPage() {
  const [activeTab, setActiveTab] = useState("tango");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35);

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
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
              <Music2 className="w-3 h-3 mr-1.5" />
              Curated Collection
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              Music Library
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
              Explore the finest collection of tango classics and contemporary compositions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Search */}
          <motion.div 
            className="mb-12 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by artist, song, or orchestra..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="tango" data-testid="tab-tango">Tango</TabsTrigger>
              <TabsTrigger value="vals" data-testid="tab-vals">Vals</TabsTrigger>
              <TabsTrigger value="milonga" data-testid="tab-milonga">Milonga</TabsTrigger>
              <TabsTrigger value="playlists" data-testid="tab-playlists">Playlists</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Loading music...</p>
                </div>
              ) : tracks && Array.isArray(tracks) && tracks.length > 0 ? (
                <div className="space-y-3">
                  {tracks.map((track: any, index: number) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="hover-elevate" data-testid={`track-${track.id}`}>
                        <CardContent className="py-5">
                          <div className="flex items-center gap-4">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handlePlayTrack(track)}
                              data-testid={`button-play-${track.id}`}
                              className="shrink-0"
                            >
                              {currentlyPlaying?.id === track.id && isPlaying ? (
                                <Pause className="h-5 w-5" />
                              ) : (
                                <Play className="h-5 w-5" />
                              )}
                            </Button>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {track.artist} {track.orchestra && `• ${track.orchestra}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {track.year && (
                                <Badge variant="outline">{track.year}</Badge>
                              )}
                              <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                                {track.duration || "3:24"}
                              </span>
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
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Music className="mx-auto h-16 w-16 mb-6 opacity-30" />
                    <h3 className="text-xl font-serif font-bold mb-2">No Music Found</h3>
                    <p className="text-muted-foreground">Try a different search or category</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Sticky Audio Player */}
          {currentlyPlaying && (
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl z-50 backdrop-blur-sm">
              <div className="container mx-auto max-w-7xl">
                <div className="flex items-center gap-6 p-5">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-14 w-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-base truncate" data-testid="player-track-title">
                        {currentlyPlaying.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {currentlyPlaying.artist}
                        {currentlyPlaying.orchestra && ` • ${currentlyPlaying.orchestra}`}
                      </p>
                    </div>
                  </div>

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
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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

                  <div className="flex items-center gap-3 flex-1 justify-end">
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
