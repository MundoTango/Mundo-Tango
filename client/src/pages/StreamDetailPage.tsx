/**
 * STREAM DETAIL PAGE - EDITORIAL DESIGN
 * Individual live stream viewing page with 16:9 video player
 * Route: /live-stream/:id
 * 
 * EDITORIAL DESIGN STANDARDS APPLIED:
 * - 16:9 aspect ratio video player
 * - Serif fonts for headlines
 * - Framer Motion animations
 * - Editorial layout with generous whitespace
 * - Gradient overlays and glassmorphic effects
 * - Dark mode optimized
 */

import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { 
  Radio, Users, Eye, Heart, Share2, MessageCircle, Calendar,
  Clock, ArrowLeft, Sparkles, Play, Volume2, Maximize
} from "lucide-react";

export default function StreamDetailPage() {
  const { id } = useParams();
  
  const { data: stream, isLoading } = useQuery<any>({
    queryKey: ["/api/livestreams", id],
  });

  if (isLoading) {
    return (
      <PageLayout title="Live Stream" showBreadcrumbs>
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="text-center text-muted-foreground">Loading stream...</div>
        </div>
      </PageLayout>
    );
  }

  if (!stream) {
    return (
      <PageLayout title="Live Stream" showBreadcrumbs>
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <Radio className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Stream not found</p>
              <Link href="/live-streams">
                <Button className="mt-4" variant="outline" data-testid="button-back-to-streams">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Streams
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Stream Detail" fallbackRoute="/live-streams">
      <PageLayout title={stream.title || "Live Stream"} showBreadcrumbs>
        <div className="bg-background min-h-screen pb-16">
          <div className="container mx-auto max-w-7xl px-6 py-8">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Link href="/live-streams">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Live Streams
                </Button>
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Video Section - Left Column (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 16:9 Video Player - Editorial Standard */}
                <FadeInSection delay={0.1}>
                  <Card className="overflow-hidden border-2 border-border" data-testid="video-player">
                    <div className="relative aspect-video bg-black">
                      {stream.thumbnail && (
                        <img 
                          src={stream.thumbnail} 
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Video Player Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                        {stream.isLive && (
                          <div className="absolute top-4 left-4">
                            <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1" data-testid="badge-live">
                              <Radio className="h-3 w-3 animate-pulse" />
                              <span className="font-semibold">LIVE</span>
                            </Badge>
                          </div>
                        )}

                        {stream.viewers !== undefined && (
                          <div className="absolute top-4 right-4">
                            <Badge className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border-white/20 text-white" data-testid="badge-viewers">
                              <Eye className="h-3 w-3" />
                              <span>{stream.viewers.toLocaleString()} watching</span>
                            </Badge>
                          </div>
                        )}

                        {/* Play Button (for non-live streams) */}
                        {!stream.isLive && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button 
                              size="lg"
                              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/40"
                              data-testid="button-play"
                            >
                              <Play className="h-8 w-8 text-white fill-white ml-1" />
                            </Button>
                          </div>
                        )}

                        {/* Video Controls (bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-white hover:bg-white/20"
                              data-testid="button-volume"
                            >
                              <Volume2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                            data-testid="button-fullscreen"
                          >
                            <Maximize className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeInSection>

                {/* Stream Info */}
                <FadeInSection delay={0.2}>
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3" data-testid="stream-title">
                        {stream.title}
                      </h1>
                      {stream.category && (
                        <Badge variant="outline" className="mb-4">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {stream.category}
                        </Badge>
                      )}
                    </div>

                    {/* Host Info */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={stream.hostAvatar} alt={stream.host} />
                          <AvatarFallback>{stream.host?.[0] || 'H'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium" data-testid="host-name">{stream.host}</p>
                          {stream.hostFollowers && (
                            <p className="text-sm text-muted-foreground">
                              {stream.hostFollowers.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                      </div>

                      <Button variant="default" data-testid="button-follow">
                        Follow
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button variant="outline" className="flex-1 min-w-[120px]" data-testid="button-like">
                        <Heart className="mr-2 h-4 w-4" />
                        Like
                      </Button>
                      <Button variant="outline" className="flex-1 min-w-[120px]" data-testid="button-share">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Description */}
                    {stream.description && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-serif font-bold mb-2">About</h3>
                          <p className="text-muted-foreground leading-relaxed" data-testid="stream-description">
                            {stream.description}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </FadeInSection>
              </div>

              {/* Live Chat & Info Sidebar - Right Column (1/3) */}
              <div className="space-y-6">
                {/* Stream Stats */}
                <FadeInSection delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-serif font-bold">Stream Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stream.startedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Started {new Date(stream.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      
                      {stream.scheduledDate && !stream.isLive && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Scheduled: {new Date(stream.scheduledDate).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {stream.language && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Language</span>
                          <Badge variant="secondary">{stream.language}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeInSection>

                {/* Live Chat */}
                <FadeInSection delay={0.4}>
                  <Card className="h-[500px] flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Live Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {stream.isLive ? (
                          <div className="text-sm text-muted-foreground text-center py-8">
                            Chat messages will appear here
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-8">
                            Chat is disabled for non-live streams
                          </div>
                        )}
                      </div>
                      
                      {stream.isLive && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Send a message..."
                            className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                            data-testid="input-chat"
                          />
                          <Button size="sm" data-testid="button-send-chat">
                            Send
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeInSection>
              </div>
            </div>

            {/* Related Streams */}
            <FadeInSection delay={0.5}>
              <div className="mt-16">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">
                  More Live Streams
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Placeholder for related streams */}
                  <Card className="hover-elevate cursor-pointer">
                    <div className="aspect-video bg-muted" />
                    <CardContent className="pt-4">
                      <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                      <h3 className="font-serif font-bold">Related Stream</h3>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

// Fade In Section Component
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
