import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Film, Music, Gamepad2, Popcorn, Star, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import entertainmentHeroImg from "@assets/stock_images/elegant_professional_0956f754.jpg";
import entertainmentImg1 from "@assets/stock_images/elegant_professional_e4da136e.jpg";

export default function EntertainmentAgentPage() {
  const { t } = useTranslation(["pages", "common"]);
  const stats = [
    { label: t('pages:lifeceo.entertainment.stats.moviesWatched', 'Movies Watched'), value: "24", icon: Film, color: "text-purple-500" },
    { label: t('pages:lifeceo.entertainment.stats.musicHours', 'Music Hours'), value: "47h", icon: Music, color: "text-pink-500" },
    { label: t('pages:lifeceo.entertainment.stats.gamesPlayed', 'Games Played'), value: "8", icon: Gamepad2, color: "text-blue-500" },
    { label: t('pages:lifeceo.entertainment.stats.eventsAttended', 'Events Attended'), value: "12", icon: Calendar, color: "text-orange-500" }
  ];

  const recommendations = [
    { title: t('pages:lifeceo.entertainment.recommendations.tangoDocumentary', "Tango Documentary: 'The Last Dance'"), type: t('pages:lifeceo.entertainment.type.movie', 'Movie'), rating: 4.8, duration: "1h 45m" },
    { title: t('pages:lifeceo.entertainment.recommendations.piazzolla', 'Astor Piazzolla: Greatest Hits'), type: t('pages:lifeceo.entertainment.type.music', 'Music'), rating: 5.0, duration: "2h 15m" },
    { title: t('pages:lifeceo.entertainment.recommendations.buenosAiresFestival', 'Buenos Aires Tango Festival'), type: t('pages:lifeceo.entertainment.type.event', 'Event'), rating: 4.9, duration: t('pages:lifeceo.entertainment.duration.3days', '3 days') }
  ];

  const watchlist = [
    { title: t('pages:lifeceo.entertainment.watchlist.tangoArgentino', 'Tango Argentino (1985)'), genre: t('pages:lifeceo.entertainment.genre.documentary', 'Documentary'), added: t('pages:lifeceo.entertainment.date.2daysAgo', '2 days ago') },
    { title: t('pages:lifeceo.entertainment.watchlist.tangoLesson', 'The Tango Lesson'), genre: t('pages:lifeceo.entertainment.genre.drama', 'Drama'), added: t('pages:lifeceo.entertainment.date.1weekAgo', '1 week ago') },
    { title: t('pages:lifeceo.entertainment.watchlist.assassinationTango', 'Assassination Tango'), genre: t('pages:lifeceo.entertainment.genre.thriller', 'Thriller'), added: t('pages:lifeceo.entertainment.date.2weeksAgo', '2 weeks ago') }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Entertainment Agent" fallbackRoute="/life-ceo">
      <PageLayout title={t('pages:lifeceo.entertainment.title', 'Entertainment Agent')} showBreadcrumbs>
        <>
          <SEO
            title={t('pages:lifeceo.entertainment.seoTitle', 'Entertainment Agent - Life CEO')}
            description={t('pages:lifeceo.entertainment.seoDescription', 'Discover movies, music, games, and tango events with personalized AI recommendations.')}
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${entertainmentHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  {t('pages:lifeceo.entertainment.badge', 'Leisure & Culture')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  {t('pages:lifeceo.entertainment.heroTitle', 'Entertainment Agent')}
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  {t('pages:lifeceo.entertainment.heroSubtitle', 'Your personal entertainment curator for music, movies, and tango events')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t('pages:lifeceo.entertainment.sectionTitle', 'Entertainment Picks')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('pages:lifeceo.entertainment.sectionSubtitle', 'Personalized recommendations for your leisure time')}
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* AI Recommendations Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={entertainmentImg1}
                      alt={t('pages:lifeceo.entertainment.aiRecommendationsAlt', 'AI Recommendations')}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">{t('pages:lifeceo.entertainment.aiRecommendations', 'AI Recommendations')}</h3>
                      <p className="text-white/80 text-sm mt-1">{t('pages:lifeceo.entertainment.aiRecommendationsSubtitle', 'Curated just for you')}</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border hover-elevate cursor-pointer"
                        data-testid={`recommendation-${idx}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{rec.title}</h3>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline">{rec.type}</Badge>
                              <span>•</span>
                              <span>{rec.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{rec.rating}</span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-2" data-testid={`button-play-${idx}`}>
                          {t('pages:lifeceo.entertainment.viewDetails', 'View Details')}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* My Watchlist */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Film className="h-6 w-6 text-primary" />
                      {t('pages:lifeceo.entertainment.myWatchlist', 'My Watchlist')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {watchlist.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border hover-elevate"
                        data-testid={`watchlist-${idx}`}
                      >
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{item.genre}</Badge>
                          <span>•</span>
                          <span>{t('pages:lifeceo.entertainment.added', 'Added {{date}}', { date: item.added })}</span>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full gap-2" variant="outline" data-testid="button-add-to-watchlist">
                      <Popcorn className="w-4 h-4" />
                      {t('pages:lifeceo.entertainment.addToWatchlist', 'Add to Watchlist')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
