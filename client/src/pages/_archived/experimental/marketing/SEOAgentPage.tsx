import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Search, TrendingUp, Link as LinkIcon, FileText, BarChart3, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Link } from "wouter";
import seoHeroImg from "@assets/stock_images/tango_dancers_in_ele_003ee0cf.jpg";
import seoImg1 from "@assets/stock_images/buenos_aires_argenti_9805cd85.jpg";
import seoImg2 from "@assets/stock_images/buenos_aires_argenti_4131c695.jpg";

export default function SEOAgentPage() {
  const { t } = useTranslation(['pages', 'common']);

  const metrics = [
    { label: t('pages:seoAgent.metrics.organicTraffic', 'Organic Traffic'), value: "12,450", change: "+15.3%", icon: TrendingUp, color: "text-green-500" },
    { label: t('pages:seoAgent.metrics.keywordRankings', 'Keyword Rankings'), value: "284", change: "+12", icon: Search, color: "text-blue-500" },
    { label: t('pages:seoAgent.metrics.backlinks', 'Backlinks'), value: "1,847", change: "+23", icon: LinkIcon, color: "text-purple-500" },
    { label: t('pages:seoAgent.metrics.pageAuthority', 'Page Authority'), value: "68/100", change: "+4", icon: Target, color: "text-orange-500" }
  ];

  const topKeywords = [
    { keyword: t('pages:seoAgent.keywords.lessonsOnline', 'tango lessons online'), position: 3, volume: 8100, difficulty: t('pages:seoAgent.difficulty.medium', 'Medium') },
    { keyword: t('pages:seoAgent.keywords.community', 'tango community'), position: 5, volume: 5400, difficulty: t('pages:seoAgent.difficulty.low', 'Low') },
    { keyword: t('pages:seoAgent.keywords.findTeacher', 'find tango teacher'), position: 8, volume: 3200, difficulty: t('pages:seoAgent.difficulty.high', 'High') },
    { keyword: t('pages:seoAgent.keywords.eventsNearMe', 'tango events near me'), position: 12, volume: 2900, difficulty: t('pages:seoAgent.difficulty.medium', 'Medium') }
  ];

  const recommendations = [
    { title: t('pages:seoAgent.recommendations.optimizeLessons', "Optimize 'Tango Lessons' Page"), impact: t('pages:seoAgent.impact.high', 'High'), effort: t('pages:seoAgent.effort.low', 'Low'), priority: "critical" },
    { title: t('pages:seoAgent.recommendations.internalLinks', 'Build More Internal Links'), impact: t('pages:seoAgent.impact.medium', 'Medium'), effort: t('pages:seoAgent.effort.low', 'Low'), priority: "high" },
    { title: t('pages:seoAgent.recommendations.mobileSpeed', 'Improve Mobile Page Speed'), impact: t('pages:seoAgent.impact.high', 'High'), effort: t('pages:seoAgent.effort.medium', 'Medium'), priority: "high" },
    { title: t('pages:seoAgent.recommendations.blogContent', 'Create Tango Blog Content'), impact: t('pages:seoAgent.impact.medium', 'Medium'), effort: t('pages:seoAgent.effort.high', 'High'), priority: "medium" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="SEO Agent" fallbackRoute="/platform">
    <PageLayout title={t('pages:seoAgent.title', 'SEO Agent')} showBreadcrumbs>
<>
      <SEO
        title={t('pages:seoAgent.seo.title', 'SEO Agent - Marketing Dashboard')}
        description={t('pages:seoAgent.seo.description', 'Track SEO performance, keyword rankings, and organic growth with AI-powered insights.')}
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${seoHeroImg}')`
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
              {t('pages:seoAgent.badge', 'Marketing AI')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              {t('pages:seoAgent.hero.title', 'SEO Agent')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:seoAgent.hero.subtitle', 'Intelligent SEO optimization - track rankings, analyze keywords, and dominate search results')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Preview Notice */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
            {t('pages:seoAgent.previewNotice', 'Preview Data - Connect your search console to see real metrics')}
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

        {/* Featured SEO Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">{t('pages:seoAgent.sections.insights', 'SEO Insights')}</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Keywords Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={seoImg1}
                  alt={t('pages:seoAgent.topKeywords.title', 'Keyword Performance')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:seoAgent.topKeywords.title', 'Top Keywords')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:seoAgent.topKeywords.subtitle', 'Ranking positions and search volume')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topKeywords.map((kw, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`keyword-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{kw.keyword}</h4>
                      <Badge className={
                        kw.difficulty === t('pages:seoAgent.difficulty.high', 'High') ? "bg-red-500"
                        : kw.difficulty === t('pages:seoAgent.difficulty.medium', 'Medium') ? "bg-orange-500"
                        : "bg-green-500"
                      }>
                        {kw.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{t('pages:seoAgent.labels.position', 'Position')}: #{kw.position}</span>
                      <span>•</span>
                      <span>{kw.volume.toLocaleString()} {t('pages:seoAgent.labels.searchesMonth', 'searches/mo')}</span>
                    </div>
                  </div>
                ))}
                <Link href="/admin/seo/keywords">
                  <Button className="w-full gap-2" variant="outline" data-testid="button-view-all-keywords">
                    <Search className="w-4 h-4" />
                    {t('pages:seoAgent.cta.viewAllKeywords', 'View All Keywords')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recommendations Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={seoImg2}
                  alt={t('pages:seoAgent.aiRecommendations.title', 'AI Recommendations')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:seoAgent.aiRecommendations.title', 'AI Recommendations')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:seoAgent.aiRecommendations.subtitle', 'Prioritized optimization opportunities')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border hover-elevate"
                    data-testid={`recommendation-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <Badge className={
                        rec.priority === "critical" ? "bg-red-500"
                        : rec.priority === "high" ? "bg-orange-500"
                        : "bg-blue-500"
                      }>
                        {t(`pages:seoAgent.priority.${rec.priority}`, rec.priority)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{t('pages:seoAgent.labels.impact', 'Impact')}: {rec.impact}</span>
                      <span>•</span>
                      <span>{t('pages:seoAgent.labels.effort', 'Effort')}: {rec.effort}</span>
                    </div>
                  </div>
                ))}
                <Link href="/admin/seo/report">
                  <Button className="w-full gap-2" data-testid="button-generate-seo-report">
                    <Sparkles className="w-4 h-4" />
                    {t('pages:seoAgent.cta.generateReport', 'Generate Full SEO Report')}
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
