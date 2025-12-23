import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Users, Eye, Calendar, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import liveStreamHeroImage from "@assets/stock_images/elegant_professional_9405e610.jpg";
import { SEO } from "@/components/SEO";

export default function LiveStreamPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { data: streams, isLoading } = useQuery({
    queryKey: ["/api/livestreams"],
  });

  return (
    <SelfHealingErrorBoundary pageName={t('pages:liveStream.pageName', 'Live Streams')} fallbackRoute="/feed">
      <PageLayout title={t('pages:liveStream.title', 'Live Streams')} showBreadcrumbs>
        
        {/* Editorial Hero Section - 16:9 */}
        <div className="relative aspect-video w-full overflow-hidden mb-16" data-testid="hero-livestream">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${liveStreamHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-livestream">
              <Radio className="w-3 h-3 mr-1" />
              {t('pages:liveStream.liveStreams', 'Live Streams')}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight max-w-4xl" data-testid="heading-hero">
              {t('pages:liveStream.heroTitle', 'Experience Tango Live')}
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mb-8">
              {t('pages:liveStream.heroSubtitle', 'Watch live performances, join interactive classes, and connect with tango artists from around the world')}
            </p>

            <Button className="bg-white text-black hover:bg-white/90" size="lg" data-testid="button-create-stream">
              <Radio className="h-4 w-4 mr-2" />
              {t('pages:liveStream.createStream', 'Create Stream')}
            </Button>
          </motion.div>
        </div>

<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">

        {isLoading ? (
          <div className="text-center py-12">{t('pages:liveStream.loadingStreams', 'Loading streams...')}</div>
        ) : streams && Array.isArray(streams) && streams.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold mb-8">{t('pages:liveStream.liveNow', 'Live Now')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {streams.filter((s: any) => s.isLive).map((stream: any, idx: number) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                <Card className="hover-elevate border-primary" data-testid={`stream-live-${stream.id}`}>
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img src={stream.thumbnail} alt={stream.title} className="object-cover w-full h-full" />
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        {t('pages:liveStream.live', 'LIVE')}
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
                    <CardTitle className="text-lg font-serif font-bold">{stream.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{stream.host}</p>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/live-stream/${stream.id}`}>
                      <Button className="w-full" data-testid={`button-watch-${stream.id}`}>
                        <Radio className="h-4 w-4 mr-2" />
                        {t('pages:liveStream.watchLive', 'Watch Live')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <h2 className="text-3xl font-serif font-bold mb-8 mt-16">{t('pages:liveStream.upcomingStreams', 'Upcoming Streams')}</h2>
              <div className="space-y-4">
                {streams.filter((s: any) => !s.isLive).map((stream: any, idx: number) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                  <Link href={`/live-stream/${stream.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`stream-upcoming-${stream.id}`}>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="aspect-video md:aspect-square bg-muted overflow-hidden">
                          <img src={stream.thumbnail} alt={stream.title} className="object-cover w-full h-full" />
                        </div>
                        <div className="md:col-span-3 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-serif font-bold text-lg">{stream.title}</h3>
                              <p className="text-sm text-muted-foreground">{stream.host}</p>
                            </div>
                            <Badge variant="outline">{t('pages:liveStream.scheduled', 'Scheduled')}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {stream.scheduledDate}
                            </div>
                            {stream.registrations && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {stream.registrations} {t('pages:liveStream.registered', 'registered')}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-remind-${stream.id}`} onClick={(e) => e.preventDefault()}>
                            {t('pages:liveStream.setReminder', 'Set Reminder')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Radio className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('pages:liveStream.noStreams', 'No live streams at the moment')}</p>
              <p className="text-sm mt-2">{t('pages:liveStream.checkBackLater', 'Check back later for upcoming events')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
