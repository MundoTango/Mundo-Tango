import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { FileText, Calendar, TrendingUp, Eye, Heart, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Link } from "wouter";
import contentHeroImg from "@assets/stock_images/tango_dancers_in_ele_8c2ddd84.jpg";
import contentImg1 from "@assets/stock_images/milonga_dance_hall,__36c486f2.jpg";
import contentImg2 from "@assets/stock_images/milonga_dance_hall,__46cae5f7.jpg";

export default function ContentAgentPage() {
  const { t } = useTranslation(['pages', 'common']);

  const metrics = [
    { label: t('pages:contentAgent.metrics.published', 'Published Posts'), value: "127", change: "+8", icon: FileText, color: "text-blue-500" },
    { label: t('pages:contentAgent.metrics.views', 'Total Views'), value: "45.2K", change: "+12.4%", icon: Eye, color: "text-green-500" },
    { label: t('pages:contentAgent.metrics.engagement', 'Engagement Rate'), value: "6.8%", change: "+0.9%", icon: Heart, color: "text-pink-500" },
    { label: t('pages:contentAgent.metrics.shares', 'Shares'), value: "2,134", change: "+18%", icon: Share2, color: "text-purple-500" }
  ];

  const contentCalendar = [
    { title: t('pages:contentAgent.calendar.item1.title', 'Top 10 Tango Tips for Beginners'), status: "scheduled", date: "Nov 3, 2025", type: t('pages:contentAgent.types.blog', 'Blog') },
    { title: t('pages:contentAgent.calendar.item2.title', 'Interview with Carlos Rodriguez'), status: "draft", date: "Nov 5, 2025", type: t('pages:contentAgent.types.video', 'Video') },
    { title: t('pages:contentAgent.calendar.item3.title', 'Buenos Aires Tango Festival Recap'), status: "review", date: "Nov 7, 2025", type: t('pages:contentAgent.types.article', 'Article') },
    { title: t('pages:contentAgent.calendar.item4.title', 'Tango Shoes: Buying Guide'), status: "published", date: "Oct 30, 2025", type: t('pages:contentAgent.types.guide', 'Guide') }
  ];

  const topContent = [
    { title: t('pages:contentAgent.topContent.item1', 'How to Master the Ocho'), views: 8450, engagement: "8.2%", shares: 234 },
    { title: t('pages:contentAgent.topContent.item2', '5 Common Tango Mistakes'), views: 6920, engagement: "7.5%", shares: 189 },
    { title: t('pages:contentAgent.topContent.item3', 'Tango Music History'), views: 5230, engagement: "6.1%", shares: 142 }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Content Agent" fallbackRoute="/platform">
    <PageLayout title={t('pages:contentAgent.title', 'Content Agent')} showBreadcrumbs>
<>
      <SEO
        title={t('pages:contentAgent.seo.title', 'Content Agent - Marketing Dashboard')}
        description={t('pages:contentAgent.seo.description', 'Manage content strategy, editorial calendar, and performance analytics with AI-powered insights.')}
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${contentHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-marketing">
              {t('pages:contentAgent.badge', 'Marketing AI')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              {t('pages:contentAgent.hero.title', 'Content Agent')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:contentAgent.hero.subtitle', 'Your AI-powered content strategy assistant - plan, create, and optimize content that resonates')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Preview Notice */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
            {t('pages:contentAgent.previewNotice', 'Preview Data - Connect your analytics to see real metrics')}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {metrics.map((metric, idx) => (
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
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Content Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">{t('pages:contentAgent.sections.calendar', 'Editorial Calendar')}</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Editorial Calendar Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={contentImg1}
                  alt={t('pages:contentAgent.upcoming.title', 'Content Planning')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:contentAgent.upcoming.title', 'Upcoming Content')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:contentAgent.upcoming.subtitle', 'Scheduled across all channels')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {contentCalendar.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`content-item-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <Badge className={
                        item.status === "published" ? "bg-green-500"
                        : item.status === "scheduled" ? "bg-blue-500"
                        : item.status === "review" ? "bg-orange-500"
                        : ""
                      }>
                        {t(`pages:contentAgent.status.${item.status}`, item.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
                <Link href="/admin/content/create">
                  <Button className="w-full gap-2" variant="outline" data-testid="button-add-content">
                    <Sparkles className="w-4 h-4" />
                    {t('pages:contentAgent.cta.scheduleNew', 'Schedule New Content')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Top Performing Content Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={contentImg2}
                  alt={t('pages:contentAgent.topPerformers.title', 'Top Performance')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:contentAgent.topPerformers.title', 'Top Performers')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:contentAgent.topPerformers.subtitle', 'Highest engagement this month')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topContent.map((content, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50" data-testid={`top-content-${idx}`}>
                    <h4 className="font-semibold mb-3">{content.title}</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">{t('pages:contentAgent.labels.views', 'Views')}</p>
                        <p className="font-medium">{content.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('pages:contentAgent.labels.engagement', 'Engagement')}</p>
                        <p className="font-medium">{content.engagement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('pages:contentAgent.labels.shares', 'Shares')}</p>
                        <p className="font-medium">{content.shares}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/admin/content/analytics">
                  <Button className="w-full gap-2" data-testid="button-content-analytics">
                    <TrendingUp className="w-4 h-4" />
                    {t('pages:contentAgent.cta.viewAnalytics', 'View Full Analytics')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
