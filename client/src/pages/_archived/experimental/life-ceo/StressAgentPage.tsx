import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Brain, Heart, Wind, Smile, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import stressHeroImg from "@assets/stock_images/elegant_professional_9405e610.jpg";
import stressImg1 from "@assets/stock_images/elegant_professional_e4da136e.jpg";

export default function StressAgentPage() {
  const { t } = useTranslation(["pages", "common"]);
  const techniques = [
    { name: t('pages:lifeceo.stress.techniques.478breathing', '4-7-8 Breathing'), duration: t('pages:lifeceo.stress.duration.5min', '5 min'), effectiveness: t('pages:lifeceo.stress.effectiveness.high', 'High'), practiced: true },
    { name: t('pages:lifeceo.stress.techniques.progressiveMuscle', 'Progressive Muscle Relaxation'), duration: t('pages:lifeceo.stress.duration.15min', '15 min'), effectiveness: t('pages:lifeceo.stress.effectiveness.high', 'High'), practiced: false },
    { name: t('pages:lifeceo.stress.techniques.mindfulWalking', 'Mindful Walking'), duration: t('pages:lifeceo.stress.duration.20min', '20 min'), effectiveness: t('pages:lifeceo.stress.effectiveness.medium', 'Medium'), practiced: true },
    { name: t('pages:lifeceo.stress.techniques.guidedMeditation', 'Guided Meditation'), duration: t('pages:lifeceo.stress.duration.10min', '10 min'), effectiveness: t('pages:lifeceo.stress.effectiveness.high', 'High'), practiced: false }
  ];

  const stressTriggers = [
    { trigger: t('pages:lifeceo.stress.triggers.workDeadlines', 'Work deadlines'), frequency: t('pages:lifeceo.stress.frequency.3xThisWeek', '3x this week'), intensity: t('pages:lifeceo.stress.intensity.medium', 'Medium') },
    { trigger: t('pages:lifeceo.stress.triggers.sleepDeprivation', 'Sleep deprivation'), frequency: t('pages:lifeceo.stress.frequency.2xThisWeek', '2x this week'), intensity: t('pages:lifeceo.stress.intensity.low', 'Low') },
    { trigger: t('pages:lifeceo.stress.triggers.socialEvents', 'Social events'), frequency: t('pages:lifeceo.stress.frequency.1xThisWeek', '1x this week'), intensity: t('pages:lifeceo.stress.intensity.low', 'Low') }
  ];

  const metrics = [
    { label: t('pages:lifeceo.stress.metrics.stressLevel', 'Stress Level'), value: t('pages:lifeceo.stress.metrics.low', 'Low'), icon: Brain, color: "text-green-500" },
    { label: t('pages:lifeceo.stress.metrics.heartRateVar', 'Heart Rate Var'), value: "68ms", icon: Heart, color: "text-pink-500" },
    { label: t('pages:lifeceo.stress.metrics.relaxationTime', 'Relaxation Time'), value: "45m", icon: Wind, color: "text-blue-500" },
    { label: t('pages:lifeceo.stress.metrics.moodScore', 'Mood Score'), value: "8.2/10", icon: Smile, color: "text-yellow-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Stress Management Agent" fallbackRoute="/life-ceo">
      <PageLayout title={t('pages:lifeceo.stress.title', 'Stress Management Agent')} showBreadcrumbs>
        <>
          <SEO
            title={t('pages:lifeceo.stress.seoTitle', 'Stress Management Agent - Life CEO')}
            description={t('pages:lifeceo.stress.seoDescription', 'Monitor stress levels, practice relaxation techniques, and maintain mental wellness with AI guidance.')}
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${stressHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  {t('pages:lifeceo.stress.badge', 'Mental Wellness')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  {t('pages:lifeceo.stress.heroTitle', 'Stress Agent')}
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  {t('pages:lifeceo.stress.heroSubtitle', 'Your AI wellness companion')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
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
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t('pages:lifeceo.stress.sectionTitle', 'Stress Management')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('pages:lifeceo.stress.sectionSubtitle', 'Monitor patterns and practice relaxation techniques')}
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Relaxation Techniques Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={stressImg1}
                      alt={t('pages:lifeceo.stress.relaxationAlt', 'Relaxation Techniques')}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">{t('pages:lifeceo.stress.relaxationTechniques', 'Relaxation Techniques')}</h3>
                      <p className="text-white/80 text-sm mt-1">{t('pages:lifeceo.stress.relaxationSubtitle', 'Evidence-based practices')}</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
                    {techniques.map((technique, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          technique.practiced 
                            ? "bg-green-500/5 border-green-500/20" 
                            : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{technique.name}</h3>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{technique.duration}</span>
                              <span>•</span>
                              <span>{t('pages:lifeceo.stress.impact', '{{effectiveness}} impact', { effectiveness: technique.effectiveness })}</span>
                            </div>
                          </div>
                          {technique.practiced && (
                            <Badge className="bg-green-500">{t('pages:lifeceo.stress.practiced', 'Practiced')}</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full mt-2" 
                          variant={technique.practiced ? "outline" : "default"}
                          data-testid={`button-practice-${idx}`}
                        >
                          {technique.practiced ? t('pages:lifeceo.stress.practiceAgain', 'Practice Again') : t('pages:lifeceo.stress.startSession', 'Start Session')}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stress Patterns */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Activity className="h-6 w-6 text-orange-500" />
                      {t('pages:lifeceo.stress.stressPatterns', 'Stress Patterns')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stressTriggers.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{item.trigger}</h3>
                          <Badge className={
                            item.intensity === t('pages:lifeceo.stress.intensity.high', 'High') ? "bg-red-500" :
                            item.intensity === t('pages:lifeceo.stress.intensity.medium', 'Medium') ? "bg-orange-500" : "bg-green-500"
                          }>
                            {item.intensity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.frequency}</p>
                      </div>
                    ))}
                    
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4">
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">{t('pages:lifeceo.stress.aiRecommendation', 'AI Recommendation')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('pages:lifeceo.stress.aiRecommendationMessage', 'Practice breathing exercises before work deadlines to reduce anticipatory stress.')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Wind className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">{t('pages:lifeceo.stress.progressUpdate', 'Progress Update')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('pages:lifeceo.stress.progressUpdateMessage', 'Your stress levels have decreased by 12% this month. Great work!')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-track-stress">
                      <Activity className="w-4 h-4" />
                      {t('pages:lifeceo.stress.trackStressEvent', 'Track Stress Event')}
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
