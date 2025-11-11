import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Heart, MessageCircle, Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MediaGalleryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const queryType = activeTab === "all" ? "" : activeTab === "photos" ? "photo" : "video";
  const queryUrl = queryType ? `/api/media?type=${queryType}` : "/api/media";
  const { data: media, isLoading } = useQuery({
    queryKey: [queryUrl],
  });

  return (
    <AppLayout>
      {/* Hero Section - Editorial Style */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop&q=80')`
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
              <Camera className="w-3 h-3 mr-1.5" />
              Community Gallery
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              Media Gallery
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8" data-testid="text-page-description">
              Explore breathtaking moments from our global tango community
            </p>

            <Button 
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              variant="outline"
              data-testid="button-upload-media"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
              <TabsTrigger value="videos" data-testid="tab-videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Loading media...</p>
                </div>
              ) : media && Array.isArray(media) && media.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {media.map((item: any, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card
                        className="overflow-hidden hover-elevate cursor-pointer"
                        data-testid={`media-${item.id}`}
                        onClick={() => setLightboxIndex(media.indexOf(item))}
                      >
                        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                          <motion.img
                            src={item.thumbnail || item.url}
                            alt={item.caption}
                            className="object-cover w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          />
                          {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                                <Video className="h-8 w-8 text-primary" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
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
                        {item.caption && (
                          <CardContent className="p-4">
                            <p className="text-sm text-foreground line-clamp-2">{item.caption}</p>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Image className="mx-auto h-16 w-16 mb-6 opacity-30" />
                    <h3 className="text-xl font-serif font-bold mb-2">No Media Found</h3>
                    <p className="text-muted-foreground">Try selecting a different category</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && media && media[lightboxIndex] && (
        <Dialog open={true} onOpenChange={() => setLightboxIndex(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setLightboxIndex(null)}
                data-testid="button-close-lightbox"
              >
                <X className="h-4 w-4" />
              </Button>
              {media[lightboxIndex].type === "video" ? (
                <video 
                  src={media[lightboxIndex].url} 
                  controls 
                  className="w-full"
                  data-testid="lightbox-video"
                />
              ) : (
                <img 
                  src={media[lightboxIndex].url} 
                  alt={media[lightboxIndex].caption}
                  className="w-full"
                  data-testid="lightbox-image"
                />
              )}
              <div className="p-6 bg-card">
                {media[lightboxIndex].caption && (
                  <p className="text-base mb-4">{media[lightboxIndex].caption}</p>
                )}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <button className="flex items-center gap-2 hover:text-foreground">
                    <Heart className="h-5 w-5" />
                    <span>{media[lightboxIndex].likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{media[lightboxIndex].comments || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
