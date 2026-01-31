import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Music, Users, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/stock_images/argentine_tango_danc_8469eff3.jpg";

export default function TangoCulturePage() {
  const { t } = useTranslation(["pages", "common"]);

  const aspects = [
    {
      icon: Heart,
      title: t('pages:tangoCulture.aspect1Title', 'The Embrace'),
      description: t('pages:tangoCulture.aspect1Desc', 'At the heart of tango is the abrazo—the close embrace that creates intimate connection between partners. This physical closeness requires trust, sensitivity, and communication beyond words.')
    },
    {
      icon: Music,
      title: t('pages:tangoCulture.aspect2Title', 'Musical Expression'),
      description: t('pages:tangoCulture.aspect2Desc', "Tango dancers don't just move to the music—they interpret it. Every pause, acceleration, and melodic line becomes a conversation between the couple and the orchestra.")
    },
    {
      icon: Users,
      title: t('pages:tangoCulture.aspect3Title', 'Codes and Customs'),
      description: t('pages:tangoCulture.aspect3Desc', 'From the cabeceo (eye contact invitation) to ronda (line of dance), tango has evolved sophisticated social codes that create respectful, harmonious milonga experiences.')
    },
    {
      icon: Sparkles,
      title: t('pages:tangoCulture.aspect4Title', 'Improvisation'),
      description: t('pages:tangoCulture.aspect4Desc', 'Unlike choreographed dances, social tango is pure improvisation. Leaders propose, followers interpret, and together they create unique moments that will never be repeated.')
    }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Tango Culture" fallbackRoute="/">
      <PageLayout title={t('pages:tangoCulture.pageTitle', 'Tango Culture')} showBreadcrumbs>
        <PublicLayout>
          <SEO
            title={t('pages:tangoCulture.seoTitle', 'Tango Culture - Mundo Tango')}
            description={t('pages:tangoCulture.seoDescription', 'Discover the rich culture of Argentine tango—the embrace, musical connection, social codes, and traditions that make tango a unique art form and community experience.')}
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url(${tangoHeroImage})`
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
                  {t('pages:tangoCulture.badge', 'Culture')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:tangoCulture.heroTitle', 'The Culture of Tango')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  {t('pages:tangoCulture.heroSubtitle', 'More than a dance—a way of life, a philosophy, a community')}
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  {t('pages:tangoCulture.understandingTitle', 'Understanding Tango Culture')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('pages:tangoCulture.understandingDesc', 'Tango is a complete cultural experience—a unique blend of music, dance, poetry, and social ritual that has evolved over more than a century.')}
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {aspects.map((aspect, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate h-full" data-testid={`card-aspect-${idx}`}>
                      <CardContent className="p-8 space-y-3">
                        <div className="p-3 rounded-lg bg-primary/10 w-fit">
                          <aspect.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">{aspect.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {aspect.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="hover-elevate" data-testid="card-community">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">{t('pages:tangoCulture.communityTitle', 'The Tango Community')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      {t('pages:tangoCulture.communityP1', "Perhaps tango's most remarkable quality is the global community it creates. Tango dancers share a universal language—step onto any milonga floor in the world, and you're immediately part of the family.")}
                    </p>
                    <p>
                      {t('pages:tangoCulture.communityP2', "This community values respect, connection, and inclusivity. Age, background, profession—none of it matters on the dance floor. What matters is the embrace, the music, and the shared passion for the dance.")}
                    </p>
                    <p>
                      {t('pages:tangoCulture.communityP3', "From weekly milongas to international festivals, from practice sessions to late-night after-parties, tango creates spaces where authentic human connection flourishes. It's a culture of generosity, where experienced dancers welcome beginners, and every dance is a gift exchanged between partners.")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-philosophy">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">{t('pages:tangoCulture.philosophyTitle', 'The Philosophy of Tango')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p className="text-lg italic">
                      {t('pages:tangoCulture.quote', '"Tango is a sad thought that is danced."')}
                    </p>
                    <p className="text-sm">{t('pages:tangoCulture.quoteAuthor', '— Enrique Santos Discépolo')}</p>
                    <p>
                      {t('pages:tangoCulture.philosophyDesc', "This famous quote captures tango's emotional depth. Born from longing and nostalgia, tango channels life's full emotional spectrum—joy and sorrow, passion and restraint, connection and solitude—into three minutes of profound human connection.")}
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
