import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Globe, Users, Heart, Sparkles, Zap } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function MissionPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:mission.pageName', 'Mission')} fallbackRoute="/">
      <PageLayout title={t('pages:mission.pageTitle', 'Our Mission')} showBreadcrumbs>
        <PublicLayout>
          <SEO
            title={t('pages:mission.seoTitle', 'Our Mission - Mundo Tango')}
            description={t('pages:mission.seoDescription', "Discover Mundo Tango's mission to unite the global tango community through authentic connections, cultural preservation, and innovative technology that brings dancers together worldwide.")}
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop')`
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
                  <Target className="w-3 h-3 mr-1.5" />
                  {t('pages:mission.badge', 'Our Mission')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:mission.heroTitle', 'Uniting the Global Tango Community')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  {t('pages:mission.heroSubtitle', 'Connecting dancers, preserving culture, celebrating passion')}
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="hover-elevate" data-testid="card-core-mission">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif flex items-center gap-2">
                      <Target className="h-8 w-8 text-primary" />
                      {t('pages:mission.coreMissionTitle', 'Our Core Mission')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('pages:mission.coreMissionP1', 'At Mundo Tango, our mission is to create the world\'s most vibrant and connected tango community. We believe that tango transcends borders, languages, and cultures—it\'s a universal language of connection, passion, and human expression.')}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('pages:mission.coreMissionP2', 'We\'re dedicated to making tango accessible to everyone, from complete beginners taking their first steps to professional dancers and teachers sharing their expertise with the world.')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif font-bold" data-testid="text-pillars-heading">{t('pages:mission.pillarsHeading', 'Our Mission Pillars')}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-connect">
                      <CardContent className="p-8 space-y-3">
                        <Users className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.connectTitle', 'Connect Dancers Worldwide')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.connectDescription', 'Break down geographical barriers and create meaningful connections between dancers across the globe. From Buenos Aires to Tokyo, Moscow to Melbourne—we bring the tango community together.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-preserve">
                      <CardContent className="p-8 space-y-3">
                        <Globe className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.preserveTitle', 'Preserve Tango Culture')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.preserveDescription', 'Honor and celebrate the rich traditions of Argentine tango while supporting its evolution. We document history, share knowledge, and ensure future generations can experience tango\'s authentic essence.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-empower">
                      <CardContent className="p-8 space-y-3">
                        <Zap className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.empowerTitle', 'Empower Every Dancer')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.empowerDescription', 'Provide tools and resources that support dancers at every level. Whether you\'re looking for your first class or organizing international festivals, we\'re here to help you grow and thrive.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-innovate">
                      <CardContent className="p-8 space-y-3">
                        <Sparkles className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.innovateTitle', 'Innovate with Technology')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.innovateDescription', 'Leverage cutting-edge technology to enhance the tango experience. From AI-powered recommendations to virtual events, we\'re building the future of dance communities.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-inclusive">
                      <CardContent className="p-8 space-y-3">
                        <Heart className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.inclusiveTitle', 'Foster Inclusive Communities')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.inclusiveDescription', 'Create welcoming spaces where all dancers feel valued and respected. We celebrate diversity in age, background, dance style, and ability level—everyone has a place on the dance floor.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Card className="hover-elevate" data-testid="card-pillar-support">
                      <CardContent className="p-8 space-y-3">
                        <Target className="h-10 w-10 text-primary" />
                        <h3 className="text-2xl font-serif font-bold">{t('pages:mission.supportTitle', 'Support Dance Professionals')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:mission.supportDescription', 'Provide teachers, DJs, organizers, and performers with the tools they need to succeed. From event management to student engagement, we support those who keep the tango community thriving.')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Card className="hover-elevate bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-commitment">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">{t('pages:mission.commitmentTitle', 'Our Commitment to You')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      {t('pages:mission.commitmentP1', 'Every feature we build, every decision we make, is guided by our mission to serve the global tango community. We\'re not just building software—we\'re building bridges between dancers, cultures, and generations.')}
                    </p>
                    <p>
                      {t('pages:mission.commitmentP2', 'We promise to remain dancer-owned and operated, to listen to your feedback, and to always prioritize authentic human connection over profit. Because at the end of the day, tango is about people—and so are we.')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
